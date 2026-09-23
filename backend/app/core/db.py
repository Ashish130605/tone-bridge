from uuid import UUID

import numpy as np
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.models import Songs, ListeningEvents


async def get_embedding(title: str, artist: str, year: int, session: AsyncSession) -> list[float] | None:

    #Select embedding of the song if already exist in the database
    stmt_1 =   (select(Songs.embedding)
        .where(Songs.song_title == title, Songs.artists.ilike(f"%{artist}%"))
        .order_by(Songs.song_year.asc())
        .limit(1))

    #Select embedding from the existing artist with +-3 years of the identified song.
    #if not select embedding of any song from the same artist
    stmts = (
        select(Songs.embedding).where(
            Songs.artists.ilike(f"%{artist}%"),
            Songs.song_year.between(year - 3, year + 3),
        ),
        select(Songs.embedding).where(Songs.artists.ilike(f"%{artist}%")),
    )

    exact = (await session.execute(stmt_1)).scalars().one_or_none()
    if exact is not None:
        return list(exact)

    for stmt in stmts:
        rows = (await session.execute(stmt)).scalars().all()
        if rows:
            return np.mean([list(r) for r in rows], axis=0).tolist()

    return None


async def get_suggestions(embedding : list[float], title: str, session: AsyncSession) -> list[Songs]:
    stmt = select(Songs).order_by(Songs.embedding.cosine_distance(embedding)).limit(15)
    result = (await session.scalars(stmt)).all()
    seen = set()
    suggestions = []
    for s in result:
        if s.song_title.lower() == title.lower():
            continue
        key = (s.song_title.lower(), s.artists.lower())
        if key in seen:
            continue
        seen.add(key)
        suggestions.append(s)
        if len(suggestions) == 3:
            break
    return suggestions

async def get_user_history(user_id : UUID, session: AsyncSession) -> list[ListeningEvents] | None:
    stmt = select(ListeningEvents).where(ListeningEvents.user_id == user_id)
    result = (await session.execute(stmt)).scalars().all()
    return list(result)