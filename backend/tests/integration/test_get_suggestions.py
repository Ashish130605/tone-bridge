import pytest

from app.core.db import get_suggestions
from tests.integration.seed_data import SEED_SONGS

pytestmark = [pytest.mark.integration, pytest.mark.asyncio(loop_scope="session")]

EMBEDDING = {s["spotify_id"]: s["embedding"] for s in SEED_SONGS}
embd_id_1 = "291RmMazWAmDitFuD6NJCv"
embd_id_2 = "6eBK3edMW7bEzecF1eCezc"


async def test_nearest_first_and_capped_at_three(session, seed_songs):
    result = await get_suggestions(EMBEDDING[embd_id_1], "Some Unrelated Title", session)

    assert 1 <= len(result) <= 3
    assert result[0].song_title == "Another One Bites The Dust"
    assert result[0].song_year == 1980


async def test_returns_exactly_three_when_enough_distinct(session, seed_songs):
    result = await get_suggestions(EMBEDDING[embd_id_1], "Some Unrelated Title", session)
    assert len(result) == 3


async def test_skips_identified_title_case_insensitive(session, seed_songs):
    result = await get_suggestions(EMBEDDING[embd_id_1], "another one bites the dust", session)

    titles = {s.song_title.lower() for s in result}
    assert "another one bites the dust" not in titles


async def test_dedupes_same_title_and_artist(session, seed_songs):
    result = await get_suggestions(EMBEDDING[embd_id_2], "Some Unrelated Title", session)

    keys = [(s.song_title.lower(), s.artists.lower()) for s in result]
    assert len(keys) == len(set(keys))

    exact_title = [s for s in result if s.song_title == "(Everything I Do) I Do It For You"]
    assert len(exact_title) <= 1


async def test_results_exclude_the_query_title(session, seed_songs):
    result = await get_suggestions(
        EMBEDDING[embd_id_2], "(Everything I Do) I Do It For You", session
    )
    assert all(
        s.song_title.lower() != "(everything i do) i do it for you" for s in result
    )
