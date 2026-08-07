from pydantic import BaseModel

class SongsSuggestion(BaseModel):
    title: str
    artist: str
    album: str
    spotify_link: str


class Song(BaseModel):
    title: str
    artist: str
    album: str
    #genre: str
    apple_link: str
    spotify_link: str
    suggestions: list[SongsSuggestion]