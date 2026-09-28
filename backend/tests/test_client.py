import httpx
import pytest
import respx

from app.core.client import AudDError, identify_song, _AUDD_ERROR_MAP
from app.core.config import get_settings

AUDD_URL = get_settings().AUDD_API_URL

SUCCESS_PAYLOAD = {
    "status": "success",
    "result": {
        "title": "As",
        "artist": "Stevie Wonder",
        "album": "Songs in the Key of Life",
        "release_date": "1976-09-28",
    },
}


@respx.mock
async def test_returns_result_dict_on_success():
    respx.post(AUDD_URL).mock(return_value=httpx.Response(200, json=SUCCESS_PAYLOAD))

    result = await identify_song(b"audio-bytes")

    # identify_song returns the inner `result`, not the whole payload.
    assert result == SUCCESS_PAYLOAD["result"]
    assert result["title"] == "As"


@respx.mock
async def test_no_match_raises_400():
    # AudD signals "no song found" with a 200 body whose result is null.
    respx.post(AUDD_URL).mock(
        return_value=httpx.Response(200, json={"status": "success", "result": None})
    )

    with pytest.raises(AudDError) as exc_info:
        await identify_song(b"audio-bytes")

    assert exc_info.value.status_code == 400
    assert exc_info.value.audd_code is None


@pytest.mark.parametrize(
    "code, expected_status",
    [
        (300, 422),
        (400, 413),
        (500, 422),
        (600, 502),
        (700, 502),
        (900, 502),
        (901, 502),
    ],
)
@respx.mock
async def test_documented_error_codes_map_to_status(code, expected_status):
    # AudD reports its own error codes inside a 200 body, not via HTTP status.
    respx.post(AUDD_URL).mock(
        return_value=httpx.Response(
            200,
            json={"status": "error", "error": {"error_code": code, "error_message": "x"}},
        )
    )

    with pytest.raises(AudDError) as exc_info:
        await identify_song(b"audio-bytes")

    assert exc_info.value.status_code == expected_status
    assert exc_info.value.audd_code == code
    assert exc_info.value.detail == _AUDD_ERROR_MAP[code][1]


@respx.mock
async def test_unknown_error_code_falls_back_to_502():
    respx.post(AUDD_URL).mock(
        return_value=httpx.Response(
            200, json={"status": "error", "error": {"error_code": 99999}}
        )
    )

    with pytest.raises(AudDError) as exc_info:
        await identify_song(b"audio-bytes")

    assert exc_info.value.status_code == 502
    assert exc_info.value.audd_code == 99999


@respx.mock
async def test_http_error_status_raises_503():
    # A genuine 5xx from AudD is caught by raise_for_status().
    respx.post(AUDD_URL).mock(return_value=httpx.Response(500))

    with pytest.raises(AudDError) as exc_info:
        await identify_song(b"audio-bytes")

    assert exc_info.value.status_code == 503


@respx.mock
async def test_network_error_raises_503():
    respx.post(AUDD_URL).mock(side_effect=httpx.ConnectError("connection refused"))

    with pytest.raises(AudDError) as exc_info:
        await identify_song(b"audio-bytes")

    assert exc_info.value.status_code == 503
