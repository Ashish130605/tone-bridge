from anyio.functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import PostgresDsn,computed_field
import socket

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file="../.env",
        env_file_encoding="utf-8",
        extra='ignore'
    )
    JWT_SECRET : str
    AUDD_API_TOKEN : str
    AUDD_API_URL: str
    FRONTEND_URL : str

    POSTGRES_SERVER : str
    POSTGRES_PORT : int = 5432
    POSTGRES_USER : str
    POSTGRES_PASSWORD : str
    POSTGRES_DB : str
    POSTGRES_ENDPOINT : str

    @computed_field
    @property
    def POSTGREST_IPV4_HOST(self) -> str | int:
        return socket.getaddrinfo(self.POSTGRES_SERVER, self.POSTGRES_PORT, socket.AF_INET, socket.SOCK_STREAM)[0][4][0]

    @computed_field
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> PostgresDsn:
        return PostgresDsn.build(
            scheme="postgresql+asyncpg",
            username=self.POSTGRES_USER,
            password=self.POSTGRES_PASSWORD,
            host=self.POSTGRES_SERVER,
            port=self.POSTGRES_PORT,
            path=self.POSTGRES_DB
        )

@lru_cache
def get_settings() -> Settings:
    return Settings()