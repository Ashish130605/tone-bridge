import httpx

from app.core.config import get_settings


class AudDError(Exception):
    def __init__(self, status_code: int, detail: str, audd_code: int | None = None):
        self.status_code = status_code
        self.detail = detail
        self.audd_code = audd_code
        super().__init__(detail)


# AudD error_code.
# Docs: https://docs.audd.io/  (see the error codes list)
_AUDD_ERROR_MAP: dict[int, tuple[int, str]] = {
    300: (422, "The recording is too short to identify. Try a longer clip."),
    400: (413, "The audio file is too large (10 MB maximum)."),
    500: (422, "The audio file is invalid or could not be read."),
    600: (502, "Recognition service reported an incorrect audio URL."),
    700: (502, "Recognition service did not receive the audio file."),
    900: (502, "Recognition service is misconfigured (invalid API token)."),
    901: (502, "Recognition service is unavailable (token missing or quota reached)."),
}


async def identify_song(read_bytes: bytes) -> dict:
    files = {"file": read_bytes}
    data = {
        "api_token": get_settings().AUDD_API_TOKEN,
        "return": "apple_music,spotify",
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(get_settings().AUDD_API_URL, data=data, files=files)
            response.raise_for_status()
            payload = response.json()
    except httpx.HTTPError:
        raise AudDError(503, "Recognition service is unavailable.")

    if payload.get("status") == "error":
        error = payload.get("error") or {}
        code = error.get("error_code")
        status_code, detail = _AUDD_ERROR_MAP.get(
            code, (502, "Recognition service returned an unexpected error.")
        )
        raise AudDError(status_code, detail, audd_code=code)

    result = payload.get("result")
    if result is None:
        raise AudDError(400, "Could not recognise the audio.")

    return result
