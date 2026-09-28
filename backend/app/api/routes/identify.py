from fastapi import UploadFile, HTTPException, APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.models import ListeningEvents, User
from app.api.deps import get_async_session
from app.core.security import current_active_user
from app.schemas import Song, SongsSuggestion, UserHistory
from app.core import db
from app.core.client import identify_song, AudDError


router = APIRouter(prefix="/api", tags=["api"])


@router.post("/recognise", response_model=Song)
async def recognise(file: UploadFile,
                    user: User = Depends(current_active_user),
                    session: AsyncSession = Depends(get_async_session)) -> Song:

    if not file.content_type or not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="File type not supported")

    read_bytes = await file.read()

    try:
        result = await identify_song(read_bytes)
    except AudDError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail)

    release_prefix = (result.get("release_date") or "")[0:4]
    release_year = int(release_prefix) if release_prefix.isdigit() else 0

    event = ListeningEvents(
        user_id=user.id,
        title=result["title"],
        artist=result["artist"],
        album=result["album"],
        release_year=release_year,
        other_links=result.get("song_link"),
        apple_link=result["apple_music"]["url"] if "apple_music" in result else None,
        spotify_link=result["spotify"]["external_urls"]["spotify"] if "spotify" in result else None,
    )
    session.add(event)
    await session.commit()
    await session.refresh(event)

    embedding = await db.get_embedding(result["title"], result["artist"], release_year, session)
    if embedding is not None:
        suguestions = await db.get_suggestions(embedding, result["title"], session)
    else:
        suguestions = []

    response = Song.model_validate(event)
    response.suggestions = [SongsSuggestion.model_validate(s) for s in suguestions]

    spotify = result.get("spotify")
    images = (spotify or {}).get("album", {}).get("images", [])
    if images:
        response.album_cover_url = images[1]["url"] if len(images) > 1 else images[0]["url"]
    return response


@router.get("/history", response_model=list[UserHistory])
async def history(user: User = Depends(current_active_user),
                  session: AsyncSession = Depends(get_async_session)) -> list[UserHistory]:
    user_history = await db.get_user_history(user.id, session)
    return [UserHistory.model_validate(u) for u in user_history]
