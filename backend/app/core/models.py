import os
import uuid

from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, String, DateTime, Integer, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from fastapi_users.db import SQLAlchemyBaseUserTableUUID
from sqlalchemy.orm import DeclarativeBase, relationship
from datetime import datetime, UTC


class Base(DeclarativeBase):
    pass

class User(SQLAlchemyBaseUserTableUUID, Base):
    listening_events = relationship("ListeningEvents", back_populates="user")

class ListeningEvents(Base):
    __tablename__ = "listening_events"
    id =  Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=False)
    title = Column(String, nullable=False)
    artist = Column(String, nullable=False)
    album = Column(String,nullable=False)
    release_year = Column(Integer, nullable=False)
    apple_link = Column(String)
    spotify_link = Column(String)
    identified_at = Column(DateTime(timezone = True), nullable=False, default=lambda: datetime.now(UTC))

    user = relationship("User", back_populates="listening_events")
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
    embedding =  Column(Vector(10), nullable=False)



