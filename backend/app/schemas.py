import uuid
from pydantic import BaseModel, ConfigDict, Field
from fastapi_users import schemas

class UserRead(schemas.BaseUser[uuid.UUID]):
    pass

class UserCreate(schemas.BaseUserCreate):
    pass

class UserUpdate(schemas.BaseUserUpdate):
    pass

class SongsSuggestion(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    song_title: str
    artists: str
    album_name: str
    spotify_url: str


class Song(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    title: str
    artist: str
    album: str
    release_year: int
    apple_link: str | None
    spotify_link: str | None
    album_cover_url: str | None = None
    suggestions: list[SongsSuggestion] = []