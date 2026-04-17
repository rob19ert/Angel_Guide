from sqlalchemy import select, update, delete
from sqlalchemy.orm import joinedload
from app.store.base_accessor import BaseAccessor
from app.store.models import ForumTopic, ForumMessage

class ForumAccessor(BaseAccessor):
    async def get_forum_topic(self, topic_id: int) -> ForumTopic | None:
        async with self.app.database.get_session() as session:
            res = await session.execute(
                select(ForumTopic)
                .options(joinedload(ForumTopic.author))
                .where(ForumTopic.id == topic_id)
            )
            return res.scalar_one_or_none()

    async def get_forum_topic_list(self) -> list:
        async with self.app.database.get_session() as session:
            res = await session.execute(
                select(ForumTopic).options(joinedload(ForumTopic.author))
            )
            return res.scalars().all()

    async def create_forum_topic(self, data: dict) -> ForumTopic:
        async with self.app.database.get_session() as session:
            content = data.pop("content", "Тема создана")
            item = ForumTopic(**data)
            session.add(item)
            await session.flush() 
            
            first_msg = ForumMessage(
                topic_id=item.id,
                author_id=item.author_id,
                content=content
            )
            session.add(first_msg)
            await session.flush()
            
            # Предзагружаем автора для сериализации
            stmt = select(ForumTopic).options(joinedload(ForumTopic.author)).where(ForumTopic.id == item.id)
            res = await session.execute(stmt)
            return res.scalar_one()

    async def update_forum_topic(self, item_id: int, data: dict):
        async with self.app.database.get_session() as session:
            await session.execute(update(ForumTopic).where(ForumTopic.id == item_id).values(**data))
            res = await session.execute(
                select(ForumTopic)
                .options(joinedload(ForumTopic.author))
                .where(ForumTopic.id == item_id)
            )
            return res.scalar_one_or_none()

    async def delete_forum_topic(self, item_id: int):
        async with self.app.database.get_session() as session:
            await session.execute(delete(ForumMessage).where(ForumMessage.topic_id == item_id))
            await session.execute(delete(ForumTopic).where(ForumTopic.id == item_id))

    # --- FORUM MESSAGE ---
    async def get_forum_message(self, message_id: int) -> ForumMessage | None:
        async with self.app.database.get_session() as session:
            res = await session.execute(
                select(ForumMessage)
                .options(joinedload(ForumMessage.author))
                .where(ForumMessage.id == message_id)
            )
            return res.scalar_one_or_none()

    async def get_forum_message_list(self) -> list:
        async with self.app.database.get_session() as session:
            res = await session.execute(
                select(ForumMessage).options(joinedload(ForumMessage.author))
            )
            return res.scalars().all()

    async def create_forum_message(self, data: dict):
        async with self.app.database.get_session() as session:
            item = ForumMessage(**data)
            session.add(item)
            await session.flush()
            
            # Предзагружаем автора
            stmt = select(ForumMessage).options(joinedload(ForumMessage.author)).where(ForumMessage.id == item.id)
            res = await session.execute(stmt)
            return res.scalar_one()

    async def update_forum_message(self, item_id: int, data: dict):
        async with self.app.database.get_session() as session:
            await session.execute(update(ForumMessage).where(ForumMessage.id == item_id).values(**data))
            res = await session.execute(
                select(ForumMessage)
                .options(joinedload(ForumMessage.author))
                .where(ForumMessage.id == item_id)
            )
            return res.scalar_one_or_none()

    async def delete_forum_message(self, item_id: int):
        async with self.app.database.get_session() as session:
            await session.execute(delete(ForumMessage).where(ForumMessage.id == item_id))
