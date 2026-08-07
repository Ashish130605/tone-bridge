from pydantic import BaseModel, ConfigDict


class SongsSuggestion(BaseModel):
    title: str
    artist: str
    album: str
    spotify_link: str


class Song(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    title: str
    artist: str
    album: str
    #genre: str
    apple_link: str | None
    spotify_link: str | None
    #suggestions: list[SongsSuggestion]