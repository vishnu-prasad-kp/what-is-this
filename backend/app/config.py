import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "qwen/qwen3.8-27b"
    APP_ENV: str = "development"
    PORT: int = 8000
    UPLOAD_DIR: str = str(BASE_DIR / "uploads")
    DATABASE_URL: str = f"sqlite+aiosqlite:///{BASE_DIR}/scans.db"
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def has_valid_groq_key(self) -> bool:
        key = self.GROQ_API_KEY.strip()
        return bool(key and not key.startswith("your_") and len(key) > 10)

settings = Settings()

# Ensure uploads directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
