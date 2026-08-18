from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import PostgresDsn,computed_field

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file="../.env",
        env_file_encoding="utf-8"
    )
    JWT_SECRET : str
    AUDD_API_TOKEN : str
    FRONTEND_URL : str

    POSTGRES_SERVER : str
    POSTGRES_PORT : int = 5432
    POSTGRES_USER : str
    POSTGRES_PASSWORD : str
    POSTGRES_DB : str

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

settings = Settings()