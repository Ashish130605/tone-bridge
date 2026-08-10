from pydantic import BaseModel, ConfigDict


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
    #genre: str
    apple_link: str | None
    spotify_link: str | None
    suggestions: list[SongsSuggestion] = []