from audd import AudD
from fastapi import UploadFile, HTTPException, APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.models import ListeningEvents
from app.api.deps import  get_async_session
from app.schemas import Song, SongsSuggestion
from app.core import db


router = APIRouter(prefix="/api", tags=["api"])
audd = AudD(settings.AUDD_API_TOKEN)

@router.post("/recognise", response_model = Song)
async def recognise(file: UploadFile, session: AsyncSession = Depends(get_async_session) ) -> Song:

    if not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="File type not supported")

    read_bytes = await file.read()

    result = audd.recognize(read_bytes, return_metadata=["apple_music", "spotify"])

    if result is None:
        raise HTTPException(status_code=400, detail="Could not recognise audio")

    event = ListeningEvents(
        title = result.title,
        artist = result.artist,
        album = result.album,
        apple_link = getattr(result.apple_music, "url", None) if result.apple_music else None,
        spotify_link = f"https://open.spotify.com/track/{result.spotify.id}" if result.spotify else None
    )
    session.add(event)
    await session.commit()
    await session.refresh(event)
    embedding =  await db.get_embedding(str(result.title), str(result.artist), session)
    if embedding is not None:
        suguestions = await db.get_suggestions(embedding, session)
    else:
        suguestions = []

    suggest_models = [SongsSuggestion.model_validate(s) for s in suguestions]
    response = Song.model_validate(event)
    response.suggestions = suggest_models
    return response