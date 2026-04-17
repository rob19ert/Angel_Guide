import os
import re

# 1. SCHEMES
schemes_add = """
class CatchPostSchema(Schema):
    id = fields.Int(dump_only=True)
    author_id = fields.Int(required=True)
    fish_id = fields.Int(allow_none=True)
    waterbody_id = fields.Int(allow_none=True)
    image_url = fields.Str(required=True)
    description = fields.Str(allow_none=True)
    weight = fields.Float(allow_none=True)
    created_at = fields.DateTime(dump_only=True)

class CatchPostListResponseSchema(Schema):
    catch_posts = fields.Nested(CatchPostSchema, many=True)

class ForumTopicSchema(Schema):
    id = fields.Int(dump_only=True)
    author_id = fields.Int(required=True)
    title = fields.Str(required=True)
    created_at = fields.DateTime(dump_only=True)

class ForumTopicListResponseSchema(Schema):
    forum_topics = fields.Nested(ForumTopicSchema, many=True)

class ForumMessageSchema(Schema):
    id = fields.Int(dump_only=True)
    topic_id = fields.Int(required=True)
    author_id = fields.Int(required=True)
    content = fields.Str(required=True)
    created_at = fields.DateTime(dump_only=True)

class ForumMessageListResponseSchema(Schema):
    forum_messages = fields.Nested(ForumMessageSchema, many=True)

class WaterbodyReviewSchema(Schema):
    id = fields.Int(dump_only=True)
    user_id = fields.Int(required=True)
    waterbody_id = fields.Int(required=True)
    rating = fields.Int(required=True)
    content = fields.Str(required=True)
    created_at = fields.DateTime(dump_only=True)

class WaterbodyReviewListResponseSchema(Schema):
    waterbody_reviews = fields.Nested(WaterbodyReviewSchema, many=True)

class FavoriteWaterbodySchema(Schema):
    user_id = fields.Int(required=True)
    waterbody_id = fields.Int(required=True)
    saved_at = fields.DateTime(dump_only=True)

class UserInventorySchema(Schema):
    user_id = fields.Int(required=True)
    inventory_id = fields.Int(required=True)
    acquired_at = fields.DateTime(dump_only=True)
"""
with open("app/admin/schemes.py", "a", encoding="utf-8") as f:
    f.write("\n" + schemes_add)

# 2. ACCESSOR
with open("app/admin/accessor.py", "r", encoding="utf-8") as f:
    a_code = f.read()

a_code = a_code.replace(
    "from app.store.models import Fish, FishCategory, User, UserRole, Waterbody, Season, WeatherCondition, FishingTime, Inventory, Lure, Groundbait, FishWaterbodyLink, FishSeasonLink, FishWeatherLink, FishLureLink, FishInventoryLink",
    "from app.store.models import Fish, FishCategory, User, UserRole, Waterbody, Season, WeatherCondition, FishingTime, Inventory, Lure, Groundbait, FishWaterbodyLink, FishSeasonLink, FishWeatherLink, FishLureLink, FishInventoryLink, CatchPost, ForumTopic, ForumMessage, WaterbodyReview, FavoriteWaterbody, UserInventory"
)
with open("app/admin/accessor.py", "w", encoding="utf-8") as f:
    f.write(a_code)
    
acc_add = """
    # --- CATCH POST ---
    async def get_catch_post_list(self) -> list:
        async with self.app.database.get_session() as session:
            res = await session.execute(select(CatchPost))
            return res.scalars().all()

    async def create_catch_post(self, data: dict):
        async with self.app.database.get_session() as session:
            item = CatchPost(**data)
            session.add(item)
            await session.commit()
            await session.refresh(item)
            return item

    async def update_catch_post(self, item_id: int, data: dict):
        async with self.app.database.get_session() as session:
            await session.execute(update(CatchPost).where(CatchPost.id == item_id).values(**data))
            await session.commit()
            res = await session.execute(select(CatchPost).where(CatchPost.id == item_id))
            return res.scalar_one_or_none()

    async def delete_catch_post(self, item_id: int):
        async with self.app.database.get_session() as session:
            await session.execute(delete(CatchPost).where(CatchPost.id == item_id))
            await session.commit()

    # --- FORUM TOPIC ---
    async def get_forum_topic_list(self) -> list:
        async with self.app.database.get_session() as session:
            res = await session.execute(select(ForumTopic))
            return res.scalars().all()

    async def create_forum_topic(self, data: dict):
        async with self.app.database.get_session() as session:
            item = ForumTopic(**data)
            session.add(item)
            await session.commit()
            await session.refresh(item)
            return item

    async def update_forum_topic(self, item_id: int, data: dict):
        async with self.app.database.get_session() as session:
            await session.execute(update(ForumTopic).where(ForumTopic.id == item_id).values(**data))
            await session.commit()
            res = await session.execute(select(ForumTopic).where(ForumTopic.id == item_id))
            return res.scalar_one_or_none()

    async def delete_forum_topic(self, item_id: int):
        async with self.app.database.get_session() as session:
            await session.execute(delete(ForumTopic).where(ForumTopic.id == item_id))
            await session.commit()

    # --- FORUM MESSAGE ---
    async def get_forum_message_list(self) -> list:
        async with self.app.database.get_session() as session:
            res = await session.execute(select(ForumMessage))
            return res.scalars().all()

    async def create_forum_message(self, data: dict):
        async with self.app.database.get_session() as session:
            item = ForumMessage(**data)
            session.add(item)
            await session.commit()
            await session.refresh(item)
            return item

    async def update_forum_message(self, item_id: int, data: dict):
        async with self.app.database.get_session() as session:
            await session.execute(update(ForumMessage).where(ForumMessage.id == item_id).values(**data))
            await session.commit()
            res = await session.execute(select(ForumMessage).where(ForumMessage.id == item_id))
            return res.scalar_one_or_none()

    async def delete_forum_message(self, item_id: int):
        async with self.app.database.get_session() as session:
            await session.execute(delete(ForumMessage).where(ForumMessage.id == item_id))
            await session.commit()

    # --- WATERBODY REVIEW ---
    async def get_waterbody_review_list(self) -> list:
        async with self.app.database.get_session() as session:
            res = await session.execute(select(WaterbodyReview))
            return res.scalars().all()

    async def create_waterbody_review(self, data: dict):
        async with self.app.database.get_session() as session:
            item = WaterbodyReview(**data)
            session.add(item)
            await session.commit()
            await session.refresh(item)
            return item

    async def update_waterbody_review(self, item_id: int, data: dict):
        async with self.app.database.get_session() as session:
            await session.execute(update(WaterbodyReview).where(WaterbodyReview.id == item_id).values(**data))
            await session.commit()
            res = await session.execute(select(WaterbodyReview).where(WaterbodyReview.id == item_id))
            return res.scalar_one_or_none()

    async def delete_waterbody_review(self, item_id: int):
        async with self.app.database.get_session() as session:
            await session.execute(delete(WaterbodyReview).where(WaterbodyReview.id == item_id))
            await session.commit()

    # --- FAVORITE WATERBODY ---
    async def add_favorite_waterbody(self, data: dict):
        async with self.app.database.get_session() as session:
            item = FavoriteWaterbody(**data)
            session.add(item)
            await session.commit()
            await session.refresh(item)
            return item

    async def delete_favorite_waterbody(self, user_id: int, waterbody_id: int):
        async with self.app.database.get_session() as session:
            await session.execute(delete(FavoriteWaterbody).where(FavoriteWaterbody.user_id == user_id, FavoriteWaterbody.waterbody_id == waterbody_id))
            await session.commit()

    # --- USER INVENTORY ---
    async def add_user_inventory(self, data: dict):
        async with self.app.database.get_session() as session:
            item = UserInventory(**data)
            session.add(item)
            await session.commit()
            await session.refresh(item)
            return item

    async def delete_user_inventory(self, user_id: int, inventory_id: int):
        async with self.app.database.get_session() as session:
            await session.execute(delete(UserInventory).where(UserInventory.user_id == user_id, UserInventory.inventory_id == inventory_id))
            await session.commit()
"""
with open("app/admin/accessor.py", "a", encoding="utf-8") as f:
    f.write(acc_add)

# 3. VIEWS
with open("app/admin/views.py", "r", encoding="utf-8") as f:
    v_code = f.read()

v_code = v_code.replace(
    "from app.admin.schemes import FishWaterbodyLinkSchema",
    "from app.admin.schemes import CatchPostSchema, CatchPostListResponseSchema, ForumTopicSchema, ForumTopicListResponseSchema, ForumMessageSchema, ForumMessageListResponseSchema, WaterbodyReviewSchema, WaterbodyReviewListResponseSchema, FavoriteWaterbodySchema, UserInventorySchema, FishWaterbodyLinkSchema"
)
with open("app/admin/views.py", "w", encoding="utf-8") as f:
    f.write(v_code)

views_add = """
# --- CATCH POST ---
class CatchPostView(View):
    @docs(tags=["Social"], summary="Список уловов")
    @response_schema(CatchPostListResponseSchema)
    async def get(self):
        items = await self.request.app.store.admin.get_catch_post_list()
        return json_response(data={"catch_posts": items})

    @docs(tags=["Social"], summary="Добавить улов")
    @admin_required
    @request_schema(CatchPostSchema)
    @response_schema(CatchPostSchema)
    async def post(self):
        data = self.request["data"]
        item = await self.request.app.store.admin.create_catch_post(data)
        return json_response(data=item)

class CatchPostItemView(View):
    @docs(tags=["Social"], summary="Обновить улов")
    @admin_required
    @request_schema(CatchPostSchema(partial=True))
    @response_schema(CatchPostSchema)
    async def patch(self):
        item_id = int(self.request.match_info["id"])
        data = self.request["data"]
        item = await self.request.app.store.admin.update_catch_post(item_id, data)
        return json_response(data=item)

    @docs(tags=["Social"], summary="Удалить улов")
    @admin_required
    async def delete(self):
        item_id = int(self.request.match_info["id"])
        await self.request.app.store.admin.delete_catch_post(item_id)
        return json_response(status="Успешно удалено")

# --- FORUM TOPIC ---
class ForumTopicView(View):
    @docs(tags=["Social"], summary="Список тем форума")
    @response_schema(ForumTopicListResponseSchema)
    async def get(self):
        items = await self.request.app.store.admin.get_forum_topic_list()
        return json_response(data={"forum_topics": items})

    @docs(tags=["Social"], summary="Создать тему форума")
    @admin_required
    @request_schema(ForumTopicSchema)
    @response_schema(ForumTopicSchema)
    async def post(self):
        data = self.request["data"]
        item = await self.request.app.store.admin.create_forum_topic(data)
        return json_response(data=item)

class ForumTopicItemView(View):
    @docs(tags=["Social"], summary="Обновить тему форума")
    @admin_required
    @request_schema(ForumTopicSchema(partial=True))
    @response_schema(ForumTopicSchema)
    async def patch(self):
        item_id = int(self.request.match_info["id"])
        data = self.request["data"]
        item = await self.request.app.store.admin.update_forum_topic(item_id, data)
        return json_response(data=item)

    @docs(tags=["Social"], summary="Удалить тему форума")
    @admin_required
    async def delete(self):
        item_id = int(self.request.match_info["id"])
        await self.request.app.store.admin.delete_forum_topic(item_id)
        return json_response(status="Успешно удалено")

# --- FORUM MESSAGE ---
class ForumMessageView(View):
    @docs(tags=["Social"], summary="Список сообщений форума")
    @response_schema(ForumMessageListResponseSchema)
    async def get(self):
        items = await self.request.app.store.admin.get_forum_message_list()
        return json_response(data={"forum_messages": items})

    @docs(tags=["Social"], summary="Добавить сообщение на форум")
    @admin_required
    @request_schema(ForumMessageSchema)
    @response_schema(ForumMessageSchema)
    async def post(self):
        data = self.request["data"]
        item = await self.request.app.store.admin.create_forum_message(data)
        return json_response(data=item)

class ForumMessageItemView(View):
    @docs(tags=["Social"], summary="Обновить сообщение форума")
    @admin_required
    @request_schema(ForumMessageSchema(partial=True))
    @response_schema(ForumMessageSchema)
    async def patch(self):
        item_id = int(self.request.match_info["id"])
        data = self.request["data"]
        item = await self.request.app.store.admin.update_forum_message(item_id, data)
        return json_response(data=item)

    @docs(tags=["Social"], summary="Удалить сообщение форума")
    @admin_required
    async def delete(self):
        item_id = int(self.request.match_info["id"])
        await self.request.app.store.admin.delete_forum_message(item_id)
        return json_response(status="Успешно удалено")

# --- WATERBODY REVIEW ---
class WaterbodyReviewView(View):
    @docs(tags=["Social"], summary="Список отзывов на водоемы")
    @response_schema(WaterbodyReviewListResponseSchema)
    async def get(self):
        items = await self.request.app.store.admin.get_waterbody_review_list()
        return json_response(data={"waterbody_reviews": items})

    @docs(tags=["Social"], summary="Добавить отзыв на водоем")
    @admin_required
    @request_schema(WaterbodyReviewSchema)
    @response_schema(WaterbodyReviewSchema)
    async def post(self):
        data = self.request["data"]
        item = await self.request.app.store.admin.create_waterbody_review(data)
        return json_response(data=item)

class WaterbodyReviewItemView(View):
    @docs(tags=["Social"], summary="Обновить отзыв на водоем")
    @admin_required
    @request_schema(WaterbodyReviewSchema(partial=True))
    @response_schema(WaterbodyReviewSchema)
    async def patch(self):
        item_id = int(self.request.match_info["id"])
        data = self.request["data"]
        item = await self.request.app.store.admin.update_waterbody_review(item_id, data)
        return json_response(data=item)

    @docs(tags=["Social"], summary="Удалить отзыв на водоем")
    @admin_required
    async def delete(self):
        item_id = int(self.request.match_info["id"])
        await self.request.app.store.admin.delete_waterbody_review(item_id)
        return json_response(status="Успешно удалено")

# --- FAVORITE WATERBODY ---
class FavoriteWaterbodyView(View):
    @docs(tags=["Social"], summary="Добавить водоем в избранное")
    @admin_required
    @request_schema(FavoriteWaterbodySchema)
    @response_schema(FavoriteWaterbodySchema)
    async def post(self):
        data = self.request["data"]
        item = await self.request.app.store.admin.add_favorite_waterbody(data)
        return json_response(data=item)

class FavoriteWaterbodyDeleteView(View):
    @docs(tags=["Social"], summary="Удалить водоем из избранного")
    @admin_required
    async def delete(self):
        user_id = int(self.request.match_info["user_id"])
        waterbody_id = int(self.request.match_info["waterbody_id"])
        await self.request.app.store.admin.delete_favorite_waterbody(user_id, waterbody_id)
        return json_response(status="Успешно удалено")

# --- USER INVENTORY ---
class UserInventoryView(View):
    @docs(tags=["Social"], summary="Добавить вещь в инвентарь пользователя")
    @admin_required
    @request_schema(UserInventorySchema)
    @response_schema(UserInventorySchema)
    async def post(self):
        data = self.request["data"]
        item = await self.request.app.store.admin.add_user_inventory(data)
        return json_response(data=item)

class UserInventoryDeleteView(View):
    @docs(tags=["Social"], summary="Удалить вещь из инвентаря пользователя")
    @admin_required
    async def delete(self):
        user_id = int(self.request.match_info["user_id"])
        inventory_id = int(self.request.match_info["inventory_id"])
        await self.request.app.store.admin.delete_user_inventory(user_id, inventory_id)
        return json_response(status="Успешно удалено")
"""
with open("app/admin/views.py", "a", encoding="utf-8") as f:
    f.write(views_add)

# 4. ROUTES
with open("app/admin/routes.py", "r", encoding="utf-8") as f:
    r_code = f.read()

import_inj = ", CatchPostView, CatchPostItemView, ForumTopicView, ForumTopicItemView, ForumMessageView, ForumMessageItemView, WaterbodyReviewView, WaterbodyReviewItemView, FavoriteWaterbodyView, FavoriteWaterbodyDeleteView, UserInventoryView, UserInventoryDeleteView"
r_code = r_code.replace("AdminFishInventoryLinkDeleteView\n    )", "AdminFishInventoryLinkDeleteView" + import_inj + "\n    )")

routes_add = """
    app.router.add_view("/api/catch_posts", CatchPostView)
    app.router.add_view(r"/admin/catch_posts/{id:\\d+}", CatchPostItemView)
    
    app.router.add_view("/api/forum_topics", ForumTopicView)
    app.router.add_view(r"/admin/forum_topics/{id:\\d+}", ForumTopicItemView)
    
    app.router.add_view("/api/forum_messages", ForumMessageView)
    app.router.add_view(r"/admin/forum_messages/{id:\\d+}", ForumMessageItemView)
    
    app.router.add_view("/api/waterbody_reviews", WaterbodyReviewView)
    app.router.add_view(r"/admin/waterbody_reviews/{id:\\d+}", WaterbodyReviewItemView)
    
    app.router.add_view("/admin/favorite_waterbodies", FavoriteWaterbodyView)
    app.router.add_view(r"/admin/favorite_waterbodies/{user_id:\\d+}/{waterbody_id:\\d+}", FavoriteWaterbodyDeleteView)
    
    app.router.add_view("/admin/user_inventory", UserInventoryView)
    app.router.add_view(r"/admin/user_inventory/{user_id:\\d+}/{inventory_id:\\d+}", UserInventoryDeleteView)
"""
r_code += routes_add

with open("app/admin/routes.py", "w", encoding="utf-8") as f:
    f.write(r_code)

# 5. PUBLIC PATHS in mw.py
with open("app/web/mw.py", "r", encoding="utf-8") as f:
    mw_code = f.read()

public_paths_addition = '    "/api/catch_posts",\n    "/api/forum_topics",\n    "/api/forum_messages",\n    "/api/waterbody_reviews"\n'
mw_code = mw_code.replace(r'"/api/groundbaits"' + '\n]', r'"/api/groundbaits",' + '\n' + public_paths_addition + ']')

with open("app/web/mw.py", "w", encoding="utf-8") as f:
    f.write(mw_code)

print("Patch applied successfully.")
