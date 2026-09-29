import pytest
import pytest_asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import async_sessionmaker
from sqlalchemy.ext.asyncio.engine import create_async_engine
from testcontainers.community.postgres import PostgresContainer

from app.core.models import Base


@pytest.fixture(scope="session")
def pg_container():
    with PostgresContainer("pgvector/pgvector:pg16", driver="asyncpg") as postgres:
        yield postgres

@pytest_asyncio.fixture(scope="session")
async def engine(pg_container):
    engine = create_async_engine(pg_container.get_connection_url(), future=True)
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    await engine.dispose()

@pytest_asyncio.fixture(scope="session")
async def session(engine):
    async with engine.begin() as conn:
        conn = await engine.connect()
        txn = await conn.begin()
        maker = async_sessionmaker(bind=conn, expire_on_commit=False)
        sess = maker()
        try:
            yield sess
        finally:
            await sess.close()
            await txn.rollback()
            await conn.close()