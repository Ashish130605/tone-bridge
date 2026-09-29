import numpy as np
import pytest

from app.core.db import get_embedding
from tests.integration.seed_data import SEED_SONGS

pytestmark = [pytest.mark.integration, pytest.mark.asyncio(loop_scope="session")]


def _rows_for_artist(artist, year=None, era=None):
    rows = [s for s in SEED_SONGS if artist.lower() in s["artists"].lower()]
    if era is not None:
        rows = [s for s in rows if year - era <= s["song_year"] <= year + era]
    return rows


async def test_exact_song_in_db_returns_its_embedding(session, seed_songs):
    # Case 1: the identified song exists -> exact-match branch returns its vector.
    result = await get_embedding("Be By Your Side", "Pillow Queens", 2022, session)

    expected = next(s["embedding"] for s in SEED_SONGS if s["song_title"] == "Be By Your Side")
    assert result == pytest.approx(expected, abs=1e-4)


async def test_not_in_db_falls_back_to_artist_and_era(session, seed_songs):
    # Case 2: no title match -> average same-artist songs within +/- 3 years.
    result = await get_embedding("Unknown Ballad", "Bryan Adams", 1992, session)

    era_rows = _rows_for_artist("Bryan Adams", year=1992, era=3)
    assert len(era_rows) == 2  # only the two 1991 recordings fall in 1989-1995
    expected = np.mean([s["embedding"] for s in era_rows], axis=0)
    assert result == pytest.approx(expected, abs=1e-4)


async def test_no_song_in_era_falls_back_to_artist_any_year(session, seed_songs):
    # Case 3: no era match -> average all songs by that artist, any year.
    result = await get_embedding("Unknown Ballad", "Bryan Adams", 1800, session)

    all_rows = _rows_for_artist("Bryan Adams")
    assert len(all_rows) == 4
    expected = np.mean([s["embedding"] for s in all_rows], axis=0)
    assert result == pytest.approx(expected, abs=1e-4)


async def test_unknown_artist_returns_none(session, seed_songs):
    # Case 4: nothing matches -> None (caller then returns no suggestions).
    result = await get_embedding("Ghost Track", "Nonexistent Artist", 2000, session)
    assert result is None


# ---------------------------- edge cases ----------------------------

async def test_duplicate_exact_title_returns_earliest_year(session, seed_songs):
    result = await get_embedding("Another One Bites The Dust", "Queen", 2018, session)

    earliest = min(
        (s for s in SEED_SONGS if s["song_title"] == "Another One Bites The Dust"),
        key=lambda s: s["song_year"],
    )
    assert earliest["song_year"] == 1980
    assert result == pytest.approx(earliest["embedding"], abs=1e-4)


async def test_title_match_is_case_sensitive(session, seed_songs):
    result = await get_embedding(
        "(everything i do) i do it for you", "Bryan Adams", 1991, session
    )

    era_rows = _rows_for_artist("Bryan Adams", year=1991, era=3)
    expected = np.mean([s["embedding"] for s in era_rows], axis=0)
    assert result == pytest.approx(expected, abs=1e-4)

    exact = next(
        s["embedding"] for s in SEED_SONGS if s["spotify_id"] == "6eBK3edMW7bEzecF1eCezc"
    )
    assert result != pytest.approx(exact, abs=1e-4)


async def test_artist_ilike_overmatches_substring(session, seed_songs):
    result = await get_embedding("Ghost Track", "Queen", 1800, session)

    matched = _rows_for_artist("Queen")
    assert len(matched) == 6
    expected = np.mean([s["embedding"] for s in matched], axis=0)
    assert result == pytest.approx(expected, abs=1e-4)
