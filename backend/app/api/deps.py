from fastapi import Depends
from fastapi_users.db import SQLAlchemyUserDatabase
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from collections.abc import AsyncGenerator
from app.core.models import Base, User
from app.core.config import get_settings

engine = create_async_engine(str(get_settings().SQLALCHEMY_DATABASE_URI),
                             future=True ,
                             connect_args={"host":get_settings().POSTGREST_IPV4_HOST,
                                           "ssl":"require",
                                           "server_settings" : {
    "options": f"endpoint={get_settings().POSTGRES_ENDPOINT}"}
}
                            )
async_session = async_sessionmaker(engine, expire_on_commit=False)

async def create_db_and_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session

async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(session, User)


