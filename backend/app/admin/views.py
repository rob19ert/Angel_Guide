from aiohttp import web
from aiohttp_apispec import docs, request_schema, response_schema
from app.web.app import View
from app.web.utils import admin_required, json_response, login_required
from app.store.models import UserRole, Waterbody
from sqlalchemy import select

from app.admin.schemes import (
    AdminLoginRequestSchema, AdminLoginResponseSchema, 
    AdminRegisterRequestSchema, AdminRegisterResponseSchema, 
    BanUserRequestSchema, ForumTopicCreateRequestSchema, UpdateUserRequestSchema, UserSchema, FishCategorySchema, 
    FishSchema, FishListResponseSchema, WaterbodySchema, 
    SeasonSchema, SeasonListResponseSchema, WeatherConditionSchema, 
    WeatherConditionListResponseSchema, FishingTimeSchema, 
    FishingTimeListResponseSchema, InventorySchema, 
    InventoryListResponseSchema, LureSchema, LureListResponseSchema, 
    GroundbaitSchema, GroundbaitListResponseSchema, CatchPostSchema, 
    CatchPostListResponseSchema, ForumTopicSchema, 
    ForumTopicListResponseSchema, ForumMessageSchema, 
    ForumMessageListResponseSchema, WaterbodyReviewSchema, 
    WaterbodyReviewListResponseSchema, FavoriteWaterbodySchema, 
    UserInventorySchema, FishWaterbodyLinkSchema, FishSeasonLinkSchema,
    FishWeatherLinkSchema, FishLureLinkSchema, FishInventoryLinkSchema,
    RecommendationRequestSchema, RecommendationResponseSchema,
    SavedRecommendationSchema, SavedRecommendationListResponseSchema
)

ADMIN_CREATION_SECRET = "my_super_secret_key_for_diploma_2026"

# --- AUTH & USERS ---
class AdminRegister(View):
    @docs(tags=["admin"], summary="Add admin", description="Добавление админа в БД")
    @request_schema(AdminRegisterRequestSchema)
    @response_schema(AdminRegisterResponseSchema, 200)
    async def post(self):
        data = self.request["data"]
        role = UserRole.USER
        if data.get("secret_key") == ADMIN_CREATION_SECRET:
            role = UserRole.ADMIN
        try:
            admin_data = await self.request.app.store.admin.register_user(
                username=data["username"], password=data["password"], 
                email=data["email"], role=role
            )
            return json_response(status="Ok", data=admin_data)
        except ValueError as e:
            raise web.HTTPConflict(reason=str(e))

class AdminLogin(View):
    @docs(tags=["admin"], summary="Войти пользователю", description="Вход в систему админом")
    @request_schema(AdminLoginRequestSchema)
    @response_schema(AdminLoginResponseSchema)
    async def post(self):
        data = self.request["data"]
        try:
            login_data = await self.request.app.store.admin.login_user(
                email=data["email"], password=data["password"]
            )
            token = login_data["token"]
            role = login_data["role"]
            response = json_response(data={
                "token": token,
                "role": role,
                "message": "Logged in successfully"
            })
            response.set_cookie(
                "token", 
                token, 
                httponly=True, 
                samesite="Lax", 
                domain="localhost", # Явно указываем домен
                max_age=7 * 24 * 60 * 60 
            )
            return response
        except ValueError as e:
            raise web.HTTPUnauthorized(reason=str(e))

class AdminMeView(View):
    @docs(tags=["admin"], summary="Текущий пользователь", description="Получить инфо о себе по токену в куках")
    @response_schema(UserSchema)
    @login_required
    async def get(self):
        user_id = self.request.user_id
        # ЛОГ ДЛЯ ОТЛАДКИ ПРАВ
        print(f"DEBUG: Request from User ID {user_id}, Role {getattr(self.request, 'role', 'None')}")

        async with self.request.app.database.get_session() as session:
            from app.store.models import User
            res = await session.execute(select(User).where(User.id == user_id))
            user = res.scalar_one_or_none()
            if not user:
                raise web.HTTPUnauthorized(reason="User not found")

            dumped = UserSchema().dump(user)
            print(f"DEBUG: Response data: {dumped}")
            return json_response(data=dumped)

    @docs(tags=["user"], summary="Обновить профиль", description="Обновление данных профиля пользователя")
    @request_schema(UpdateUserRequestSchema)
    @response_schema(UserSchema)
    @login_required
    async def patch(self):
        user_id = self.request.user_id
        data = self.request["data"]

        async with self.request.app.database.get_session() as session:
            from app.store.models import User
            res = await session.execute(select(User).where(User.id == user_id))
            user = res.scalar_one_or_none()
            if not user:
                raise web.HTTPUnauthorized(reason="User not found")

            if "username" in data:
                user.username = data["username"]
            if "email" in data:
                user.email = data["email"]
            if "avatar_url" in data:
                user.avatar_url = data["avatar_url"]
            if "password" in data:
                import bcrypt
                user.password_hash = bcrypt.hashpw(data["password"].encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

            await session.commit()

            dumped = UserSchema().dump(user)
            return json_response(data=dumped)
class AdminUsersListView(View):
    @docs(tags=["admin"], summary="Список пользователей")
    @response_schema(UserSchema(many=True))
    @admin_required
    async def get(self):
        users_data = await self.request.app.store.admin.list_user()
        return json_response(data={"users": users_data})

class AdminUserBanView(View):
    @docs(tags=["admin"], summary="Бан/Разбан")
    @request_schema(BanUserRequestSchema)
    @response_schema(UserSchema)
    @admin_required
    async def patch(self):
        user_id = int(self.request.match_info["id"])
        is_banned = self.request["data"]["is_banned"]
        try:
            updated_user = await self.request.app.store.admin.update_ban_status(user_id, is_banned)
            return json_response(data=UserSchema().dump(updated_user))
        except ValueError as e:
            raise web.HTTPNotFound(reason=str(e))

# --- ENCYCLOPEDIA (FISH & CATS) ---
class CreateFishCategoryView(View):
    @docs(tags=["admin_encyclopedia"], summary="Добавление категории рыб")
    @request_schema(FishCategorySchema)
    @response_schema(FishCategorySchema, 200)
    @admin_required
    async def post(self):
        data = self.request["data"]
        try:
            fish_category = await self.request.app.store.admin.add_fish_categories(
                name=data["name"], description=data["description"]
            )
            return json_response(data=FishCategorySchema().dump(fish_category))
        except ValueError as e:
            raise web.HTTPConflict(reason=str(e))

class FishCatListView(View):
    @docs(tags=["admin_encyclopedia"], summary="Список категорий рыбы")
    @response_schema(FishCategorySchema(many=True), 200)
    async def get(self):
        fishes_category = await self.request.app.store.admin.get_fish_category_list()
        return json_response(data={"fish_categories": FishCategorySchema(many=True).dump(fishes_category)})

class CreateFishView(View):
    @docs(tags=["admin_encyclopedia"], summary="Добавление рыбы")
    @request_schema(FishSchema)
    @response_schema(FishSchema, 200)
    @admin_required
    async def post(self):
        data = self.request["data"]
        try:
            fish = await self.request.app.store.admin.create_fish(data)
            return json_response(data=FishSchema().dump(fish))
        except ValueError as e:
            raise web.HTTPConflict(reason=str(e))

class PublishFishListView(View):
    @docs(tags=["admin_encyclopedia"], summary="Список рыбы")
    @response_schema(FishListResponseSchema, 200)
    async def get(self):
        fishes = await self.request.app.store.admin.get_fishes_list()
        return json_response(data={"fishes": FishSchema(many=True).dump(fishes)})

class DeleteFishView(View):
    @docs(tags=["admin_encyclopedia"], summary="Удалить рыбу")
    @admin_required
    async def delete(self):
        fish_id = int(self.request.match_info["id"])
        try:
            await self.request.app.store.admin.delete_fish(fish_id)
            return json_response(data={}, status="Успешно удалено")
        except ValueError as e:
            raise web.HTTPNotFound(reason=str(e))

class UploadImageView(View):
    async def post(self):
        reader = await self.request.multipart()
        field = await reader.next()
        if not field or field.name != "image":
            raise web.HTTPBadRequest(reason="Нужно отправить файл в поле 'image'")
        filename = field.filename
        file_bytes = await field.read()
        url = await self.request.app.store.s3.upload_image(file_bytes, filename)
        return json_response(data={"url": url})

# --- WATERBODIES ---
class GetWaterbodyListView(View):
    @docs(tags=["waterbody"], summary="Список водоемов")
    @response_schema(WaterbodySchema(many=True), 200)
    async def get(self):
        region = self.request.query.get("region")
        fish_id = self.request.query.get("fish_id")
        if fish_id:
            fish_id = int(fish_id)
            
        waterbodies = await self.request.app.store.admin.get_waterbody_list(region=region, fish_id=fish_id)
        return json_response(data={"waterbodies": WaterbodySchema(many=True).dump(waterbodies)})

class GetWaterbodyView(View):
    @docs(tags=["waterbody"], summary="Получить конкретный водоем")
    @response_schema(WaterbodySchema, 200)
    async def get(self):
        try:
            waterbody_id = int(self.request.match_info["id"])
            waterbody = await self.request.app.store.admin.get_waterbody(waterbody_id)
            if not waterbody: raise ValueError("Not found")
            return json_response(data=WaterbodySchema().dump(waterbody))
        except ValueError as e:
            raise web.HTTPNotFound(reason=str(e))

class CreateWaterbodyView(View):
    @docs(tags=["waterbody"], summary="Добавление водоема")
    @request_schema(WaterbodySchema)
    @response_schema(WaterbodySchema, 201)
    @admin_required
    async def post(self):
        data = self.request["data"]
        try:
            waterbody = await self.request.app.store.admin.create_waterbody(data)
            return json_response(data=WaterbodySchema().dump(waterbody))
        except ValueError as e:
            raise web.HTTPConflict(reason=str(e))

class DeleteWaterbodyView(View):
    @docs(tags=["waterbody"], summary="Удалить водоем")
    @admin_required
    async def delete(self):
        waterbody_id = int(self.request.match_info["id"])
        try:
            await self.request.app.store.admin.delete_waterbody(waterbody_id)
            return json_response(data={}, status="Успешно удалено")
        except ValueError as e:
            raise web.HTTPNotFound(reason=str(e))

class UpdateWaterbodyView(View):
    @docs(tags=["waterbody"], summary="Обновление водоема")
    @request_schema(WaterbodySchema(partial=True))
    @response_schema(WaterbodySchema, 200)
    @admin_required
    async def patch(self):
        waterbody_id = int(self.request.match_info["id"])
        data = self.request["data"]
        try:
            waterbody = await self.request.app.store.admin.update_waterbody(waterbody_id, data)
            return json_response(data=WaterbodySchema().dump(waterbody))
        except ValueError as e:
            raise web.HTTPNotFound(reason=str(e))

# --- ENVIRONMENT (SEASONS, WEATHER, TIME) ---
class AdminSeasonView(View):
    @docs(tags=["Environment"], summary="Список сезонов")
    @response_schema(SeasonListResponseSchema)
    async def get(self):
        items = await self.request.app.store.admin.get_seasons_list()
        return json_response(data={"seasons": SeasonSchema(many=True).dump(items)})

    @docs(tags=["Environment"], summary="Добавить сезон")
    @admin_required
    @request_schema(SeasonSchema)
    @response_schema(SeasonSchema)
    async def post(self):
        data = self.request["data"]
        item = await self.request.app.store.admin.create_season(data)
        return json_response(data=SeasonSchema().dump(item))

class AdminSeasonItemView(View):
    @docs(tags=["Environment"], summary="Обновить сезон")
    @admin_required
    @request_schema(SeasonSchema(partial=True))
    @response_schema(SeasonSchema)
    async def patch(self):
        item_id = int(self.request.match_info["id"])
        data = self.request["data"]
        item = await self.request.app.store.admin.update_season(item_id, data)
        return json_response(data=SeasonSchema().dump(item))

    @docs(tags=["Environment"], summary="Удалить сезон")
    @admin_required
    async def delete(self):
        item_id = int(self.request.match_info["id"])
        await self.request.app.store.admin.delete_season(item_id)
        return json_response(status="Успешно удалено")

class AdminWeatherView(View):
    @docs(tags=["Environment"], summary="Список погоды")
    @response_schema(WeatherConditionListResponseSchema)
    async def get(self):
        items = await self.request.app.store.admin.get_weather_list()
        return json_response(data={"weather_conditions": WeatherConditionSchema(many=True).dump(items)})

    @docs(tags=["Environment"], summary="Добавить погоду")
    @admin_required
    @request_schema(WeatherConditionSchema)
    @response_schema(WeatherConditionSchema)
    async def post(self):
        data = self.request["data"]
        item = await self.request.app.store.admin.create_weather(data)
        return json_response(data=WeatherConditionSchema().dump(item))

class AdminWeatherItemView(View):
    @docs(tags=["Environment"], summary="Обновить погоду")
    @admin_required
    @request_schema(WeatherConditionSchema(partial=True))
    @response_schema(WeatherConditionSchema)
    async def patch(self):
        item_id = int(self.request.match_info["id"])
        data = self.request["data"]
        item = await self.request.app.store.admin.update_weather(item_id, data)
        return json_response(data=WeatherConditionSchema().dump(item))

    @docs(tags=["Environment"], summary="Удалить погоду")
    @admin_required
    async def delete(self):
        item_id = int(self.request.match_info["id"])
        await self.request.app.store.admin.delete_weather(item_id)
        return json_response(status="Успешно удалено")

class AdminFishingTimeView(View):
    @docs(tags=["Environment"], summary="Список времени суток")
    @response_schema(FishingTimeListResponseSchema)
    async def get(self):
        items = await self.request.app.store.admin.get_fishing_time_list()
        return json_response(data={"fishing_times": FishingTimeSchema(many=True).dump(items)})

    @docs(tags=["Environment"], summary="Добавить время суток")
    @admin_required
    @request_schema(FishingTimeSchema)
    @response_schema(FishingTimeSchema)
    async def post(self):
        data = self.request["data"]
        item = await self.request.app.store.admin.create_fishing_time(data)
        return json_response(data=FishingTimeSchema().dump(item))

class AdminFishingTimeItemView(View):
    @docs(tags=["Environment"], summary="Обновить время суток")
    @admin_required
    @request_schema(FishingTimeSchema(partial=True))
    @response_schema(FishingTimeSchema)
    async def patch(self):
        item_id = int(self.request.match_info["id"])
        data = self.request["data"]
        item = await self.request.app.store.admin.update_fishing_time(item_id, data)
        return json_response(data=FishingTimeSchema().dump(item))

    @docs(tags=["Environment"], summary="Удалить время суток")
    @admin_required
    async def delete(self):
        item_id = int(self.request.match_info["id"])
        await self.request.app.store.admin.delete_fishing_time(item_id)
        return json_response(status="Успешно удалено")

# --- INVENTORY & LURES ---
class AdminInventoryView(View):
    @docs(tags=["Inventory"], summary="Список инвентаря")
    @response_schema(InventoryListResponseSchema)
    async def get(self):
        items = await self.request.app.store.admin.get_inventory_list()
        return json_response(data={"items": InventorySchema(many=True).dump(items)})

    @docs(tags=["Inventory"], summary="Добавить инвентарь")
    @admin_required
    @request_schema(InventorySchema)
    @response_schema(InventorySchema)
    async def post(self):
        data = self.request["data"]
        item = await self.request.app.store.admin.create_inventory(data)
        return json_response(data=InventorySchema().dump(item))

class AdminInventoryItemView(View):
    @docs(tags=["Inventory"], summary="Обновить инвентарь")
    @admin_required
    @request_schema(InventorySchema(partial=True))
    @response_schema(InventorySchema)
    async def patch(self):
        item_id = int(self.request.match_info["id"])
        data = self.request["data"]
        item = await self.request.app.store.admin.update_inventory(item_id, data)
        return json_response(data=InventorySchema().dump(item))

    @docs(tags=["Inventory"], summary="Удалить инвентарь")
    @admin_required
    async def delete(self):
        item_id = int(self.request.match_info["id"])
        await self.request.app.store.admin.delete_inventory(item_id)
        return json_response(status="Успешно удалено")

class AdminLureView(View):
    @docs(tags=["Inventory"], summary="Список приманок")
    @response_schema(LureListResponseSchema)
    async def get(self):
        items = await self.request.app.store.admin.get_lure_list()
        return json_response(data={"lures": LureSchema(many=True).dump(items)})

    @docs(tags=["Inventory"], summary="Добавить приманку")
    @admin_required
    @request_schema(LureSchema)
    @response_schema(LureSchema)
    async def post(self):
        data = self.request["data"]
        item = await self.request.app.store.admin.create_lure(data)
        return json_response(data=LureSchema().dump(item))

class AdminLureItemView(View):
    @docs(tags=["Inventory"], summary="Обновить приманку")
    @admin_required
    @request_schema(LureSchema(partial=True))
    @response_schema(LureSchema)
    async def patch(self):
        item_id = int(self.request.match_info["id"])
        data = self.request["data"]
        item = await self.request.app.store.admin.update_lure(item_id, data)
        return json_response(data=LureSchema().dump(item))

    @docs(tags=["Inventory"], summary="Удалить приманку")
    @admin_required
    async def delete(self):
        item_id = int(self.request.match_info["id"])
        await self.request.app.store.admin.delete_lure(item_id)
        return json_response(status="Успешно удалено")

class AdminGroundbaitView(View):
    @docs(tags=["Inventory"], summary="Список прикормок")
    @response_schema(GroundbaitListResponseSchema)
    async def get(self):
        items = await self.request.app.store.admin.get_groundbait_list()
        return json_response(data={"groundbaits": GroundbaitSchema(many=True).dump(items)})

    @docs(tags=["Inventory"], summary="Добавить прикормку")
    @admin_required
    @request_schema(GroundbaitSchema)
    @response_schema(GroundbaitSchema)
    async def post(self):
        data = self.request["data"]
        item = await self.request.app.store.admin.create_groundbait(data)
        return json_response(data=GroundbaitSchema().dump(item))

class AdminGroundbaitItemView(View):
    @docs(tags=["Inventory"], summary="Обновить прикормку")
    @admin_required
    @request_schema(GroundbaitSchema(partial=True))
    @response_schema(GroundbaitSchema)
    async def patch(self):
        item_id = int(self.request.match_info["id"])
        data = self.request["data"]
        item = await self.request.app.store.admin.update_groundbait(item_id, data)
        return json_response(data=GroundbaitSchema().dump(item))

    @docs(tags=["Inventory"], summary="Удалить прикормку")
    @admin_required
    async def delete(self):
        item_id = int(self.request.match_info["id"])
        await self.request.app.store.admin.delete_groundbait(item_id)
        return json_response(status="Успешно удалено")

# --- LINKS ---
class AdminFishWaterbodyLinkView(View):
    @docs(tags=["Links"], summary="Добавить связь Рыба-Водоем")
    @admin_required
    @request_schema(FishWaterbodyLinkSchema)
    @response_schema(FishWaterbodyLinkSchema)
    async def post(self):
        data = self.request["data"]
        res = await self.request.app.store.admin.add_fish_waterbody_link(data)
        return json_response(data=FishWaterbodyLinkSchema().dump(res))

class AdminFishWaterbodyLinkDeleteView(View):
    @docs(tags=["Links"], summary="Удалить связь Рыба-Водоем")
    @admin_required
    async def delete(self):
        fish_id = int(self.request.match_info["fish_id"])
        waterbody_id = int(self.request.match_info["waterbody_id"])
        await self.request.app.store.admin.delete_fish_waterbody_link(fish_id, waterbody_id)
        return json_response(status="Успешно удалено")

class AdminFishSeasonLinkView(View):
    @docs(tags=["Links"], summary="Добавить связь Рыба-Сезон")
    @admin_required
    @request_schema(FishSeasonLinkSchema)
    @response_schema(FishSeasonLinkSchema)
    async def post(self):
        data = self.request["data"]
        res = await self.request.app.store.admin.add_fish_season_link(data)
        return json_response(data=FishSeasonLinkSchema().dump(res))

class AdminFishSeasonLinkDeleteView(View):
    @docs(tags=["Links"], summary="Удалить связь Рыба-Сезон")
    @admin_required
    async def delete(self):
        fish_id = int(self.request.match_info["fish_id"])
        season_id = int(self.request.match_info["season_id"])
        await self.request.app.store.admin.delete_fish_season_link(fish_id, season_id)
        return json_response(status="Успешно удалено")

class AdminFishWeatherLinkView(View):
    @docs(tags=["Links"], summary="Добавить связь Рыба-Погода")
    @admin_required
    @request_schema(FishWeatherLinkSchema)
    @response_schema(FishWeatherLinkSchema)
    async def post(self):
        data = self.request["data"]
        res = await self.request.app.store.admin.add_fish_weather_link(data)
        return json_response(data=FishWeatherLinkSchema().dump(res))

class AdminFishWeatherLinkDeleteView(View):
    @docs(tags=["Links"], summary="Удалить связь Рыба-Погода")
    @admin_required
    async def delete(self):
        fish_id = int(self.request.match_info["fish_id"])
        weather_id = int(self.request.match_info["weather_id"])
        await self.request.app.store.admin.delete_fish_weather_link(fish_id, weather_id)
        return json_response(status="Успешно удалено")

class AdminFishLureLinkView(View):
    @docs(tags=["Links"], summary="Добавить связь Рыба-Приманка")
    @admin_required
    @request_schema(FishLureLinkSchema)
    @response_schema(FishLureLinkSchema)
    async def post(self):
        data = self.request["data"]
        res = await self.request.app.store.admin.add_fish_lure_link(data)
        return json_response(data=FishLureLinkSchema().dump(res))

class AdminFishLureLinkDeleteView(View):
    @docs(tags=["Links"], summary="Удалить связь Рыба-Приманка")
    @admin_required
    async def delete(self):
        fish_id = int(self.request.match_info["fish_id"])
        lure_id = int(self.request.match_info["lure_id"])
        await self.request.app.store.admin.delete_fish_lure_link(fish_id, lure_id)
        return json_response(status="Успешно удалено")

class AdminFishInventoryLinkView(View):
    @docs(tags=["Links"], summary="Добавить связь Рыба-Инвентарь")
    @admin_required
    @request_schema(FishInventoryLinkSchema)
    @response_schema(FishInventoryLinkSchema)
    async def post(self):
        data = self.request["data"]
        res = await self.request.app.store.admin.add_fish_inventory_link(data)
        return json_response(data=FishInventoryLinkSchema().dump(res))

class AdminFishInventoryLinkDeleteView(View):
    @docs(tags=["Links"], summary="Удалить связь Рыба-Инвентарь")
    @admin_required
    async def delete(self):
        fish_id = int(self.request.match_info["fish_id"])
        inventory_id = int(self.request.match_info["inventory_id"])
        await self.request.app.store.admin.delete_fish_inventory_link(fish_id, inventory_id)
        return json_response(status="Успешно удалено")

# --- SOCIAL ---
class CatchPostView(View):
    @docs(tags=["Social"], summary="Список уловов")
    @response_schema(CatchPostListResponseSchema)
    async def get(self):
        items = await self.request.app.store.admin.get_catch_post_list()
        return json_response(data={"catch_posts": CatchPostSchema(many=True).dump(items)})

    @docs(tags=["Social"], summary="Добавить улов")
    @login_required
    @request_schema(CatchPostSchema)
    @response_schema(CatchPostSchema)
    async def post(self):
        data = self.request["data"]
        data["author_id"] = self.request.user_id
        item = await self.request.app.store.admin.create_catch_post(data)
        return json_response(data=CatchPostSchema().dump(item))

class CatchPostItemView(View):
    @docs(tags=["Social"], summary="Обновить улов")
    @login_required
    @request_schema(CatchPostSchema(partial=True))
    @response_schema(CatchPostSchema)
    async def patch(self):
        item_id = int(self.request.match_info["id"])
        data = self.request["data"]
        item = await self.request.app.store.admin.update_catch_post(item_id, data)
        return json_response(data=CatchPostSchema().dump(item))

    @docs(tags=["Social"], summary="Удалить улов")
    @login_required
    async def delete(self):
        item_id = int(self.request.match_info["id"])
        await self.request.app.store.admin.delete_catch_post(item_id)
        return json_response(status="Успешно удалено")

class ForumTopicView(View):
    @docs(tags=["Social"], summary="Список тем форума")
    @response_schema(ForumTopicListResponseSchema)
    async def get(self):
        items = await self.request.app.store.forum.get_forum_topic_list()
        return json_response(data={"forum_topics": ForumTopicSchema(many=True).dump(items)})

    @docs(tags=["Social"], summary="Создать тему форума")
    @login_required
    @request_schema(ForumTopicCreateRequestSchema)
    @response_schema(ForumTopicSchema)
    async def post(self):
        data = self.request["data"]
        data["author_id"] = self.request.user_id
            
        item = await self.request.app.store.forum.create_forum_topic(data)
        return json_response(data=ForumTopicSchema().dump(item))

class ForumTopicItemView(View):
    @docs(tags=["Social"], summary="Обновить тему форума")
    @login_required
    @request_schema(ForumTopicSchema(partial=True))
    @response_schema(ForumTopicSchema)
    async def patch(self):
        item_id = int(self.request.match_info["id"])
        
        topic = await self.request.app.store.forum.get_forum_topic(item_id)
        if not topic:
            raise web.HTTPNotFound(reason="Тема не найдена")
        if topic.author_id != self.request.user_id and getattr(self.request, "role", None) != UserRole.ADMIN.value:
            raise web.HTTPForbidden(reason="Вы не можете редактировать чужую тему")

        data = self.request["data"]
        item = await self.request.app.store.forum.update_forum_topic(item_id, data)
        return json_response(data=ForumTopicSchema().dump(item))

    @docs(tags=["Social"], summary="Удалить тему форума")
    @login_required
    async def delete(self):
        item_id = int(self.request.match_info["id"])
        
        topic = await self.request.app.store.forum.get_forum_topic(item_id)
        if not topic:
            raise web.HTTPNotFound(reason="Тема не найдена")
            
        # Проверяем роль: приводим всё к нижнему регистру и строке для надежности
        current_role = str(getattr(self.request, "role", "")).lower()
        is_admin = current_role == "admin"
        
        if topic.author_id != self.request.user_id and not is_admin:
            raise web.HTTPForbidden(reason=f"Вы не администратор и не автор этой темы.")

        await self.request.app.store.forum.delete_forum_topic(item_id)
        return json_response(status="Успешно удалено")

class ForumMessageView(View):
    @docs(tags=["Social"], summary="Список сообщений форума")
    @response_schema(ForumMessageListResponseSchema)
    async def get(self):
        items = await self.request.app.store.forum.get_forum_message_list()
        return json_response(data={"forum_messages": ForumMessageSchema(many=True).dump(items)})

    @docs(tags=["Social"], summary="Добавить сообщение на форум")
    @login_required
    @request_schema(ForumMessageSchema)
    @response_schema(ForumMessageSchema)
    async def post(self):
        data = self.request["data"]
        data["author_id"] = self.request.user_id
            
        item = await self.request.app.store.forum.create_forum_message(data)
        return json_response(data=ForumMessageSchema().dump(item))

class ForumMessageItemView(View):
    @docs(tags=["Social"], summary="Обновить сообщение форума")
    @login_required
    @request_schema(ForumMessageSchema(partial=True))
    @response_schema(ForumMessageSchema)
    async def patch(self):
        item_id = int(self.request.match_info["id"])
        
        msg = await self.request.app.store.forum.get_forum_message(item_id)
        if not msg:
            raise web.HTTPNotFound(reason="Сообщение не найдено")
        if msg.author_id != self.request.user_id and getattr(self.request, "role", None) != UserRole.ADMIN.value:
            raise web.HTTPForbidden(reason="Вы не можете редактировать чужое сообщение")

        data = self.request["data"]
        item = await self.request.app.store.forum.update_forum_message(item_id, data)
        return json_response(data=ForumMessageSchema().dump(item))

    @docs(tags=["Social"], summary="Удалить сообщение форума")
    @login_required
    async def delete(self):
        item_id = int(self.request.match_info["id"])
        
        msg = await self.request.app.store.forum.get_forum_message(item_id)
        if not msg:
            raise web.HTTPNotFound(reason="Сообщение не найдено")
            
        current_role = str(getattr(self.request, "role", "")).lower()
        is_admin = current_role == "admin"
        
        if msg.author_id != self.request.user_id and not is_admin:
            raise web.HTTPForbidden(reason=f"Вы не можете удалить чужое сообщение.")

        await self.request.app.store.forum.delete_forum_message(item_id)
        return json_response(status="Успешно удалено")

class WaterbodyReviewView(View):
    @docs(tags=["Social"], summary="Список отзывов на водоемы")
    @response_schema(WaterbodyReviewListResponseSchema)
    async def get(self):
        items = await self.request.app.store.admin.get_waterbody_review_list()
        return json_response(data={"waterbody_reviews": WaterbodyReviewSchema(many=True).dump(items)})

    @docs(tags=["Social"], summary="Добавить отзыв на водоем")
    @login_required
    @request_schema(WaterbodyReviewSchema)
    @response_schema(WaterbodyReviewSchema)
    async def post(self):
        data = self.request["data"]
        data["user_id"] = self.request.user_id
        item = await self.request.app.store.admin.create_waterbody_review(data)
        return json_response(data=WaterbodyReviewSchema().dump(item))

class WaterbodyReviewItemView(View):
    @docs(tags=["Social"], summary="Обновить отзыв на водоем")
    @login_required
    @request_schema(WaterbodyReviewSchema(partial=True))
    @response_schema(WaterbodyReviewSchema)
    async def patch(self):
        item_id = int(self.request.match_info["id"])
        data = self.request["data"]
        item = await self.request.app.store.admin.update_waterbody_review(item_id, data)
        return json_response(data=WaterbodyReviewSchema().dump(item))

    @docs(tags=["Social"], summary="Удалить отзыв на водоем")
    @login_required
    async def delete(self):
        item_id = int(self.request.match_info["id"])
        await self.request.app.store.admin.delete_waterbody_review(item_id)
        return json_response(status="Успешно удалено")

class FavoriteWaterbodyView(View):
    @docs(tags=["Social"], summary="Добавить водоем в избранное")
    @login_required
    @request_schema(FavoriteWaterbodySchema)
    @response_schema(FavoriteWaterbodySchema)
    async def post(self):
        data = self.request["data"]
        data["user_id"] = self.request.user_id
        item = await self.request.app.store.admin.add_favorite_waterbody(data)
        return json_response(data=FavoriteWaterbodySchema().dump(item))

class FavoriteWaterbodyDeleteView(View):
    @docs(tags=["Social"], summary="Удалить водоем из избранного")
    @login_required
    async def delete(self):
        user_id = int(self.request.match_info["user_id"])
        waterbody_id = int(self.request.match_info["waterbody_id"])
        await self.request.app.store.admin.delete_favorite_waterbody(user_id, waterbody_id)
        return json_response(status="Успешно удалено")

class UserInventoryView(View):
    @docs(tags=["Social"], summary="Добавить вещь в инвентарь пользователя")
    @login_required
    @request_schema(UserInventorySchema)
    @response_schema(UserInventorySchema)
    async def post(self):
        data = self.request["data"]
        data["user_id"] = self.request.user_id
        item = await self.request.app.store.admin.add_user_inventory(data)
        return json_response(data=UserInventorySchema().dump(item))

class UserInventoryDeleteView(View):
    @docs(tags=["Social"], summary="Удалить вещь из инвентаря пользователя")
    @login_required
    async def delete(self):
        user_id = int(self.request.match_info["user_id"])
        inventory_id = int(self.request.match_info["inventory_id"])
        await self.request.app.store.admin.delete_user_inventory(user_id, inventory_id)
        return json_response(status="Успешно удалено")

# --- CORE ---
class RecommendationView(View):
    @docs(tags=["Core"], summary="Получить рекомендации по снастям и рыбалке")
    @request_schema(RecommendationRequestSchema)
    @response_schema(RecommendationResponseSchema)
    async def post(self):
        data = self.request["data"]
        waterbody_id = data.get("waterbody_id")
        season_id = data.get("season_id")
        weather_id = data.get("weather_id")
        fish_id = data.get("fish_id")
        user_rod = data.get("user_rod")
        user_lure = data.get("user_lure")
        user_groundbait = data.get("user_groundbait")
        user_clothes = data.get("user_clothes")

        # Вызываем метод строго по аргументам
        result = await self.request.app.store.admin.get_recommendations(
            waterbody_id=waterbody_id,
            season_id=season_id,
            weather_id=weather_id,
            fish_id=fish_id,
            user_rod=user_rod,
            user_lure=user_lure,
            user_groundbait=user_groundbait,
            user_clothes=user_clothes
        )
        serialized_result = {
            "advice_text": result.get("advice_text", ""),
            "recommended_fishes": FishSchema(many=True).dump(result.get("recommended_fishes", [])),
            "recommended_inventory": InventorySchema(many=True).dump(result.get("recommended_inventory", [])),
            "recommended_lures": LureSchema(many=True).dump(result.get("recommended_lures", [])),
            "recommended_groundbaits": GroundbaitSchema(many=True).dump(result.get("recommended_groundbaits", []))
        }
        return json_response(data=serialized_result)

class SavedRecommendationView(View):
    @docs(tags=["Core"], summary="Список сохраненных сборок")
    @response_schema(SavedRecommendationListResponseSchema)
    @login_required
    async def get(self):
        items = await self.request.app.store.admin.get_saved_recommendations(self.request.user_id)
        return json_response(data={"saved_recommendations": SavedRecommendationSchema(many=True).dump(items)})

    @docs(tags=["Core"], summary="Сохранить сборку")
    @request_schema(SavedRecommendationSchema)
    @response_schema(SavedRecommendationSchema)
    @login_required
    async def post(self):
        data = self.request["data"]
        data["user_id"] = self.request.user_id
        item = await self.request.app.store.admin.save_recommendation(data)
        return json_response(data=SavedRecommendationSchema().dump(item))

class SavedRecommendationDeleteView(View):
    @docs(tags=["Core"], summary="Удалить сохраненную сборку")
    @login_required
    async def delete(self):
        item_id = int(self.request.match_info["id"])
        try:
            await self.request.app.store.admin.delete_saved_recommendation(item_id, self.request.user_id)
            return json_response(status="Успешно удалено")
        except ValueError as e:
            raise web.HTTPNotFound(reason=str(e))

# --- WEATHER ---
class ForecastMoscowView(View):
    @docs(
        tags=["Weather"],
        summary="Прогноз погоды в Москве",
        description="Возвращает текущую погоду и прогноз по Москве"
    )
    async def get(self):
        lat, lon = 55.7522, 37.6156
        weather = await self.request.app.store.weather.get_forecast(lat, lon)
        return json_response(data=weather)

class ForecastWaterbodyView(View):
    @docs(
        tags=["Weather"],
        summary="Прогноз погоды для водоема",
        description="Возвращает текущую погоду и прогноз по координатам водоема"
    )
    async def get(self):
        waterbody_id = int(self.request.match_info["id"])
        async with self.request.app.database.get_session() as session:
            stmt = select(Waterbody).where(Waterbody.id == waterbody_id)
            result = await session.execute(stmt)
            waterbody = result.scalar_one_or_none()
        
        if not waterbody:
            raise web.HTTPNotFound(reason="Водоем не найден")
        
        if not waterbody.latitude or not waterbody.longitude:
            return json_response(data={"error": "Координаты водоема не указаны"}, status="error")

        weather = await self.request.app.store.weather.get_forecast(
            waterbody.latitude, waterbody.longitude
        )
        return json_response(data=weather)


class ForecastCalculateView(View):
    @docs(
        tags=["Weather"],
        summary="Расчет прогноза клева",
        description="Рассчитывает график клева по дате, водоему и рыбе"
    )
    async def get(self):
        waterbody_id = self.request.query.get("waterbody_id")
        fish_id = self.request.query.get("fish_id")
        date_str = self.request.query.get("date")

        if not waterbody_id or not date_str:
            return json_response(data={"error": "Необходимы параметры waterbody_id и date"}, status="error")

        try:
            waterbody_id = int(waterbody_id)
        except ValueError:
            return json_response(data={"error": "Неверный формат waterbody_id"}, status="error")

        fish_not_in_waterbody = False
        async with self.request.app.database.get_session() as session:
            stmt = select(Waterbody).where(Waterbody.id == waterbody_id)
            result = await session.execute(stmt)
            waterbody = result.scalar_one_or_none()

            fish_name = "Любая рыба"
            if fish_id and fish_id != "all":
                try:
                    fish_id_int = int(fish_id)
                    from app.store.models import Fish, FishWaterbodyLink
                    stmt_fish = select(Fish).where(Fish.id == fish_id_int)
                    result_fish = await session.execute(stmt_fish)
                    fish = result_fish.scalar_one_or_none()
                    if fish:
                        fish_name = fish.name
                        stmt_link = select(FishWaterbodyLink).where(
                            FishWaterbodyLink.fish_id == fish_id_int,
                            FishWaterbodyLink.waterbody_id == waterbody_id
                        )
                        result_link = await session.execute(stmt_link)
                        link = result_link.scalar_one_or_none()
                        if not link:
                            fish_not_in_waterbody = True
                except ValueError:
                    pass
        
        if not waterbody:
            raise web.HTTPNotFound(reason="Водоем не найден")
        
        if not waterbody.latitude or not waterbody.longitude:
            return json_response(data={"error": "Координаты водоема не указаны"}, status="error")

        weather_forecast = await self.request.app.store.weather.get_fishing_forecast(
            waterbody.latitude, waterbody.longitude, date_str
        )

        if "error" in weather_forecast:
            return json_response(data={"error": weather_forecast["error"]}, status="error")

        if fish_not_in_waterbody:
            response_data = {
                "state": {
                    "waterbody": waterbody.name,
                    "fish": fish_name,
                    "date": date_str
                },
                "chartData": [],
                "weatherSummary": weather_forecast["weatherSummary"],
                "advice": f"Внимание: {fish_name} не водится в водоеме {waterbody.name}."
            }
        else:
            response_data = {
                "state": {
                    "waterbody": waterbody.name,
                    "fish": fish_name,
                    "date": date_str
                },
                "chartData": weather_forecast["chartData"],
                "weatherSummary": weather_forecast["weatherSummary"],
                "advice": weather_forecast["advice"]
            }

        return json_response(data=response_data)

