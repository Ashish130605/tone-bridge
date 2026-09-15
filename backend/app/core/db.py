import numpy as np
from fastapi import Depends
from sqlalchemy import select, literal_column, Table, Column, String, MetaData

from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_async_session
from app.core.models import Songs
from app.schemas import  Song, SongsSuggestion

async def get_embedding(title: str, artist: str, session: AsyncSession) -> list[float] | None:

    stmt = select(Songs.embedding).filter(
        Songs.song_title == title,
                Songs.artists.ilike(f"%{artist}%")).order_by(Songs.song_year.asc()).limit(1)

    result = await session.execute(stmt)
    embbedings = result.scalars().one_or_none()
    return  list(embbedings) if embbedings is not None else None

async def get_suggestions(embedding : list[float], session: AsyncSession) -> list[Songs]:
    stmt = select(Songs).order_by(Songs.embedding.cosine_distance(embedding)).limit(3)
    result = await session.scalars(stmt)
    return list(result.all())
