from audd import AudD
from fastapi import UploadFile, HTTPException, APIRouter, Depends
import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import ListeningEvents
from app.api.deps import  get_async_session
from app.models import Song

load_dotenv()

router = APIRouter(prefix="/api", tags=["api"])
audd = AudD(os.getenv("AUDD_API_TOKEN"))

@router.post("/recognise", response_model = Song)
async def recognise(file: UploadFile, session: AsyncSession = Depends(get_async_session) ):

    read_bytes = await file.read()

    if not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="File type not supported")

    result = audd.recognize(read_bytes, return_metadata=["apple_music", "spotify"])
    event = ListeningEvents(
        title = result.title,
        artist = result.artist,
        album = result.album,
        apple_link = getattr(result.apple_music, "url", None),
        spotify_link = f"https://open.spotify.com/track/{result.spotify.id}" if result.spotify else None
    )
    session.add(event)
    await session.commit()
    await session.refresh(event)

    await file.close()

    if result is None:
        raise HTTPException(status_code=400, detail="Could not recognise audio")

    return event
