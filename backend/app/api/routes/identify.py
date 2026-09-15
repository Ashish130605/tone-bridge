import httpx
from fastapi import UploadFile, HTTPException, APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.models import ListeningEvents, User
from app.api.deps import  get_async_session
from app.core.security import current_active_user
from app.schemas import Song, SongsSuggestion
from app.core import db


router = APIRouter(prefix="/api", tags=["api"])

@router.post("/recognise", response_model = Song)
async def recognise(file: UploadFile,
                    user: User = Depends(current_active_user),
                    session: AsyncSession = Depends(get_async_session) ) -> Song:

    if not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="File type not supported")

    try:
        read_bytes = await file.read()
        async with httpx.AsyncClient() as client:
            files = {"file": read_bytes}
            data={
                'api_token': settings.AUDD_API_TOKEN,
                'return': 'apple_music,spotify',
            }
            response = await client.post(settings.AUDD_API_URL, data=data, files=files)
            response.raise_for_status()
            response_data = response.json()

    except Exception:
        raise HTTPException(status_code=503, detail="Service unavailable")

    if response_data is None:
        raise HTTPException(status_code=400, detail="Could not recognise audio")
    event = ListeningEvents(
        user_id= user.id,
        title =  response_data["result"]["title"],
        artist = response_data["result"]["artist"],
        album = response_data["result"]["album"],
        apple_link = response_data["result"]["apple_music"]["url"] if "apple_music" in response_data["result"] else None,
        spotify_link = response_data["result"]["external_urls"]["spotify"] if "spotify" in response_data["result"] else None,
    )
    session.add(event)
    await session.commit()
    await session.refresh(event)
    embedding =  await db.get_embedding(response_data["result"]["title"], response_data["result"]["artist"], session)
    if embedding is not None:
        suguestions = await db.get_suggestions(embedding, session)
    else:
        suguestions = []

    suggest_models = [SongsSuggestion.model_validate(s) for s in suguestions]
    response = Song.model_validate(event)
    response.suggestions = suggest_models
    return response