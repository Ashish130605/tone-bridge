from pydantic import BaseModel
from sqlalchemy.orm import DeclarativeBase



class Song(BaseModel):
    title: str
    artist: str
    album: str
    #genre: str
    apple_link: str
    spotify_link: str