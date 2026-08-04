import os
import uuid


from sqlalchemy import Column, String, DateTime, ForeignKey
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
    identified_at = Column(DateTime, nullable=False, default=datetime.now(UTC))




