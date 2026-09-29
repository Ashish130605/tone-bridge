import httpx
import pytest_asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import async_sessionmaker

from app.api.deps import get_async_session
from app.core.models import Songs
from app.main import app
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


@pytest_asyncio.fixture
async def client(engine):
    sessionmaker = async_sessionmaker(engine, expire_on_commit=False)

    async def _override_get_async_session():
        async with sessionmaker() as db_session:
            yield db_session

    app.dependency_overrides[get_async_session] = _override_get_async_session
    transport = httpx.ASGITransport(app=app)
    try:
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
            yield c
    finally:
        app.dependency_overrides.clear()
        async with engine.begin() as conn:
            await conn.execute(text('TRUNCATE TABLE "user", listening_events CASCADE'))
