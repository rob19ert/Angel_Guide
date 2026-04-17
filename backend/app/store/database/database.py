from contextlib import asynccontextmanager
import typing
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
if typing.TYPE_CHECKING:
    from app.web.app import Application


class Database:
    def __init__(self, app: "Application"):
        self.app = app
        self.engine = AsyncEngine | None
        self.session = AsyncSession | None
        self.session_factory: async_sessionmaker[AsyncSession] | None

    async def connect(self, *args, **kwargs) -> None:
        db_url = self.app.config["database"]["url"]
        self.engine = create_async_engine(db_url, echo=True)
        self.session_factory = async_sessionmaker(
            self.engine,
            expire_on_commit=False,
            class_=AsyncSession
        )
        print('Connecting to database... OK')

    @asynccontextmanager
    async def get_session(self):
        session = self.session_factory()
        try:
            async with session.begin():
                yield session
        except Exception:
            raise
        finally:
            await session.close()
    async def disconnect(self, *args, **kwargs) -> None:
        if self.engine:
            await self.engine.dispose()
