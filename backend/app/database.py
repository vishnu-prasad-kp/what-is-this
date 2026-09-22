import json
from datetime import datetime, timezone
from typing import AsyncGenerator
from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

from app.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

Base = declarative_base()

class ScanRecord(Base):
    __tablename__ = "scans"

    id = Column(String(36), primary_key=True, index=True)
    image_filename = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    confidence = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    uses_json = Column(Text, nullable=False, default="[]")
    important_info = Column(Text, nullable=False)
    safety_note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    @property
    def uses(self) -> list[str]:
        try:
            return json.loads(self.uses_json)
        except Exception:
            return []

    @uses.setter
    def uses(self, value: list[str]):
        self.uses_json = json.dumps(value)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
