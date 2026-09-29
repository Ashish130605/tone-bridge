import pytest_asyncio

from app.core.models import Songs
from tests.integration.dbtest import (  # noqa: F401  (re-exported as fixtures)
    pg_container,
    engine,
    session,
)
from tests.integration.seed_data import SEED_SONGS


@pytest_asyncio.fixture(scope="session")
async def seed_songs(session):
    songs = [Songs(**row) for row in SEED_SONGS]
    session.add_all(songs)
    await session.flush()
    return songs
