import os
import uuid

from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, String, DateTime, Integer, Text
from sqlalchemy.dialects.postgresql import UUID

from sqlalchemy.orm import DeclarativeBase, relationship
from datetime import datetime, UTC


class Base(DeclarativeBase):
    pass

class ListeningEvents(Base):
    __tablename__ = "listening_events"
    id =  Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    artist = Column(String, nullable=False)
    album = Column(String,nullable=False)
    apple_link = Column(String)
    spotify_link = Column(String)
    identified_at = Column(DateTime(timezone = True), nullable=False, default=lambda: datetime.now(UTC))

class Songs(Base):
    __tablename__ = "songs"
    song_id = Column(Integer, primary_key=True, autoincrement=True)
    spotify_id = Column(Text, nullable=False)
    song_title = Column(Text, nullable=False)
    album_name = Column(Text, nullable=False)
    artists = Column(Text, nullable=False)
    song_year = Column(Integer, nullable=False)
    genre = Column(Text, nullable=False)
    spotify_url = Column(Text, nullable=False)
    embedding = Column(Vector(10), nullable=False)



