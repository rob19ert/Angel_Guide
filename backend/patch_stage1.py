import os
import re

# 1. ОБНОВЛЕНИЕ SCHEMES (Схемы списков)
with open("app/admin/schemes.py", "a", encoding="utf-8") as f:
    f.write("\nclass WeatherConditionListResponseSchema(Schema):\n    weather_conditions = fields.Nested(WeatherConditionSchema, many=True)\n")
    f.write("\nclass FishingTimeListResponseSchema(Schema):\n    fishing_times = fields.Nested(FishingTimeSchema, many=True)\n")
    f.write("\nclass GroundbaitListResponseSchema(Schema):\n    groundbaits = fields.Nested(GroundbaitSchema, many=True)\n")

# 2. ОБНОВЛЕНИЕ ACCESSOR (CRUD для 6 моделей)
with open("app/admin/accessor.py", "r", encoding="utf-8") as f:
    acc_code = f.read()
acc_code = acc_code.replace(
    "from app.store.models import Fish, FishCategory, User, UserRole, Waterbody",
    "from app.store.models import Fish, FishCategory, User, UserRole, Waterbody, Season, WeatherCondition, FishingTime, Inventory, Lure, Groundbait"
)
with open("app/admin/accessor.py", "w", encoding="utf-8") as f:
    f.write(acc_code)

with open("app/admin/accessor.py", "a", encoding="utf-8") as f:
    f.write("""
    # --- СЕЗОНЫ ---
    async def get_seasons_list(self) -> list:
        async with self.app.database.get_session() as session:
            res = await session.execute(select(Season))
            return res.scalars().all()

    async def create_season(self, data: dict):
        async with self.app.database.get_session() as session:
            item = Season(**data)
            session.add(item)
            await session.commit()
            await session.refresh(item)
            return item

    async def update_season(self, item_id: int, data: dict):
        async with self.app.database.get_session() as session:
            await session.execute(update(Season).where(Season.id == item_id).values(**data))
            await session.commit()
            res = await session.execute(select(Season).where(Season.id == item_id))
            return res.scalar_one_or_none()

    async def delete_season(self, item_id: int):
        async with self.app.database.get_session() as session:
            await session.execute(delete(Season).where(Season.id == item_id))
            await session.commit()

    # --- ПОГОДА ---
    async def get_weather_list(self) -> list:
        async with self.app.database.get_session() as session:
            res = await session.execute(select(WeatherCondition))
            return res.scalars().all()

    async def create_weather(self, data: dict):
        async with self.app.database.get_session() as session:
            item = WeatherCondition(**data)
            session.add(item)
            await session.commit()
            await session.refresh(item)
            return item

    async def update_weather(self, item_id: int, data: dict):
        async with self.app.database.get_session() as session:
            await session.execute(update(WeatherCondition).where(WeatherCondition.id == item_id).values(**data))
            await session.commit()
            res = await session.execute(select(WeatherCondition).where(WeatherCondition.id == item_id))
            return res.scalar_one_or_none()

    async def delete_weather(self, item_id: int):
        async with self.app.database.get_session() as session:
            await session.execute(delete(WeatherCondition).where(WeatherCondition.id == item_id))
            await session.commit()

    # --- ВРЕМЯ ЛОВА ---
    async def get_fishing_time_list(self) -> list:
        async with self.app.database.get_session() as session:
            res = await session.execute(select(FishingTime))
            return res.scalars().all()

    async def create_fishing_time(self, data: dict):
        async with self.app.database.get_session() as session:
            item = FishingTime(**data)
            session.add(item)
            await session.commit()
            await session.refresh(item)
            return item

    async def update_fishing_time(self, item_id: int, data: dict):
        async with self.app.database.get_session() as session:
            await session.execute(update(FishingTime).where(FishingTime.id == item_id).values(**data))
            await session.commit()
            res = await session.execute(select(FishingTime).where(FishingTime.id == item_id))
            return res.scalar_one_or_none()

    async def delete_fishing_time(self, item_id: int):
        async with self.app.database.get_session() as session:
            await session.execute(delete(FishingTime).where(FishingTime.id == item_id))
            await session.commit()

    # --- ИНВЕНТАРЬ ---
    async def get_inventory_list(self) -> list:
        async with self.app.database.get_session() as session:
            res = await session.execute(select(Inventory))
            return res.scalars().all()

    async def create_inventory(self, data: dict):
        async with self.app.database.get_session() as session:
            item = Inventory(**data)
            session.add(item)
            await session.commit()
            await session.refresh(item)
            return item

    async def update_inventory(self, item_id: int, data: dict):
        async with self.app.database.get_session() as session:
            await session.execute(update(Inventory).where(Inventory.id == item_id).values(**data))
            await session.commit()
            res = await session.execute(select(Inventory).where(Inventory.id == item_id))
            return res.scalar_one_or_none()

    async def delete_inventory(self, item_id: int):
        async with self.app.database.get_session() as session:
            await session.execute(delete(Inventory).where(Inventory.id == item_id))
            await session.commit()

    # --- ПРИМАНКИ ---
    async def get_lure_list(self) -> list:
        async with self.app.database.get_session() as session:
            res = await session.execute(select(Lure))
            return res.scalars().all()

    async def create_lure(self, data: dict):
        async with self.app.database.get_session() as session:
            item = Lure(**data)
            session.add(item)
            await session.commit()
            await session.refresh(item)
            return item

    async def update_lure(self, item_id: int, data: dict):
        async with self.app.database.get_session() as session:
            await session.execute(update(Lure).where(Lure.id == item_id).values(**data))
            await session.commit()
            res = await session.execute(select(Lure).where(Lure.id == item_id))
            return res.scalar_one_or_none()

    async def delete_lure(self, item_id: int):
        async with self.app.database.get_session() as session:
            await session.execute(delete(Lure).where(Lure.id == item_id))
            await session.commit()

    # --- ПРИКОРМКА ---
    async def get_groundbait_list(self) -> list:
        async with self.app.database.get_session() as session:
            res = await session.execute(select(Groundbait))
            return res.scalars().all()

    async def create_groundbait(self, data: dict):
        async with self.app.database.get_session() as session:
            item = Groundbait(**data)
            session.add(item)
            await session.commit()
            await session.refresh(item)
            return item

    async def update_groundbait(self, item_id: int, data: dict):
        async with self.app.database.get_session() as session:
            await session.execute(update(Groundbait).where(Groundbait.id == item_id).values(**data))
            await session.commit()
            res = await session.execute(select(Groundbait).where(Groundbait.id == item_id))
            return res.scalar_one_or_none()

    async def delete_groundbait(self, item_id: int):
        async with self.app.database.get_session() as session:
            await session.execute(delete(Groundbait).where(Groundbait.id == item_id))
            await session.commit()
""")

# 3. ОБНОВЛЕНИЕ VIEWS (Явные классы для CRUD)
with open("app/admin/views.py", "r", encoding="utf-8") as f:
    views_code = f.read()

# Удаляем пустой GetSeasonView, если он есть
views_code = re.sub(r'class GetSeasonView\(View\):[\s\S]*', '', views_code)

new_imports = "from app.admin.schemes import SeasonListResponseSchema, WeatherConditionSchema, WeatherConditionListResponseSchema, FishingTimeSchema, FishingTimeListResponseSchema, InventorySchema, InventoryListResponseSchema, LureSchema, LureListResponseSchema, GroundbaitSchema, GroundbaitListResponseSchema\n"
views_code = new_imports + views_code

with open("app/admin/views.py", "w", encoding="utf-8") as f:
    f.write(views_code)
    
with open("app/admin/views.py", "a", encoding="utf-8") as f:
    f.write("""
# --- SEASONS ---
class AdminSeasonView(View):
    @docs(tags=["Environment"], summary="Список сезонов")
    @response_schema(SeasonListResponseSchema)
    async def get(self):
        items = await self.request.app.store.admin.get_seasons_list()
        return json_response(data={"seasons": items})

    @docs(tags=["Environment"], summary="Добавить сезон")
    @admin_required
    @request_schema(SeasonSchema)
    @response_schema(SeasonSchema)
    async def post(self):
        data = self.request["data"]
        item = await self.request.app.store.admin.create_season(data)
        return json_response(data=item)

class AdminSeasonItemView(View):
    @docs(tags=["Environment"], summary="Обновить сезон")
    @admin_required
    @request_schema(SeasonSchema(partial=True))
    @response_schema(SeasonSchema)
    async def patch(self):
        item_id = int(self.request.match_info["id"])
        data = self.request["data"]
        item = await self.request.app.store.admin.update_season(item_id, data)
        return json_response(data=item)

    @docs(tags=["Environment"], summary="Удалить сезон")
    @admin_required
    async def delete(self):
        item_id = int(self.request.match_info["id"])
        await self.request.app.store.admin.delete_season(item_id)
        return json_response(status="Успешно удалено")

# --- WEATHER ---
class AdminWeatherView(View):
    @docs(tags=["Environment"], summary="Список погоды")
    @response_schema(WeatherConditionListResponseSchema)
    async def get(self):
        items = await self.request.app.store.admin.get_weather_list()
        return json_response(data={"weather_conditions": items})

    @docs(tags=["Environment"], summary="Добавить погоду")
    @admin_required
    @request_schema(WeatherConditionSchema)
    @response_schema(WeatherConditionSchema)
    async def post(self):
        data = self.request["data"]
        item = await self.request.app.store.admin.create_weather(data)
        return json_response(data=item)

class AdminWeatherItemView(View):
    @docs(tags=["Environment"], summary="Обновить погоду")
    @admin_required
    @request_schema(WeatherConditionSchema(partial=True))
    @response_schema(WeatherConditionSchema)
    async def patch(self):
        item_id = int(self.request.match_info["id"])
        data = self.request["data"]
        item = await self.request.app.store.admin.update_weather(item_id, data)
        return json_response(data=item)

    @docs(tags=["Environment"], summary="Удалить погоду")
    @admin_required
    async def delete(self):
        item_id = int(self.request.match_info["id"])
        await self.request.app.store.admin.delete_weather(item_id)
        return json_response(status="Успешно удалено")

# --- FISHING TIME ---
class AdminFishingTimeView(View):
    @docs(tags=["Environment"], summary="Список времени суток")
    @response_schema(FishingTimeListResponseSchema)
    async def get(self):
        items = await self.request.app.store.admin.get_fishing_time_list()
        return json_response(data={"fishing_times": items})

    @docs(tags=["Environment"], summary="Добавить время суток")
    @admin_required
    @request_schema(FishingTimeSchema)
    @response_schema(FishingTimeSchema)
    async def post(self):
        data = self.request["data"]
        item = await self.request.app.store.admin.create_fishing_time(data)
        return json_response(data=item)

class AdminFishingTimeItemView(View):
    @docs(tags=["Environment"], summary="Обновить время суток")
    @admin_required
    @request_schema(FishingTimeSchema(partial=True))
    @response_schema(FishingTimeSchema)
    async def patch(self):
        item_id = int(self.request.match_info["id"])
        data = self.request["data"]
        item = await self.request.app.store.admin.update_fishing_time(item_id, data)
        return json_response(data=item)

    @docs(tags=["Environment"], summary="Удалить время суток")
    @admin_required
    async def delete(self):
        item_id = int(self.request.match_info["id"])
        await self.request.app.store.admin.delete_fishing_time(item_id)
        return json_response(status="Успешно удалено")

# --- INVENTORY ---
class AdminInventoryView(View):
    @docs(tags=["Inventory"], summary="Список инвентаря")
    @response_schema(InventoryListResponseSchema)
    async def get(self):
        items = await self.request.app.store.admin.get_inventory_list()
        return json_response(data={"items": items})

    @docs(tags=["Inventory"], summary="Добавить инвентарь")
    @admin_required
    @request_schema(InventorySchema)
    @response_schema(InventorySchema)
    async def post(self):
        data = self.request["data"]
        item = await self.request.app.store.admin.create_inventory(data)
        return json_response(data=item)

class AdminInventoryItemView(View):
    @docs(tags=["Inventory"], summary="Обновить инвентарь")
    @admin_required
    @request_schema(InventorySchema(partial=True))
    @response_schema(InventorySchema)
    async def patch(self):
        item_id = int(self.request.match_info["id"])
        data = self.request["data"]
        item = await self.request.app.store.admin.update_inventory(item_id, data)
        return json_response(data=item)

    @docs(tags=["Inventory"], summary="Удалить инвентарь")
    @admin_required
    async def delete(self):
        item_id = int(self.request.match_info["id"])
        await self.request.app.store.admin.delete_inventory(item_id)
        return json_response(status="Успешно удалено")

# --- LURES ---
class AdminLureView(View):
    @docs(tags=["Inventory"], summary="Список приманок")
    @response_schema(LureListResponseSchema)
    async def get(self):
        items = await self.request.app.store.admin.get_lure_list()
        return json_response(data={"lures": items})

    @docs(tags=["Inventory"], summary="Добавить приманку")
    @admin_required
    @request_schema(LureSchema)
    @response_schema(LureSchema)
    async def post(self):
        data = self.request["data"]
        item = await self.request.app.store.admin.create_lure(data)
        return json_response(data=item)

class AdminLureItemView(View):
    @docs(tags=["Inventory"], summary="Обновить приманку")
    @admin_required
    @request_schema(LureSchema(partial=True))
    @response_schema(LureSchema)
    async def patch(self):
        item_id = int(self.request.match_info["id"])
        data = self.request["data"]
        item = await self.request.app.store.admin.update_lure(item_id, data)
        return json_response(data=item)

    @docs(tags=["Inventory"], summary="Удалить приманку")
    @admin_required
    async def delete(self):
        item_id = int(self.request.match_info["id"])
        await self.request.app.store.admin.delete_lure(item_id)
        return json_response(status="Успешно удалено")

# --- GROUNDBAITS ---
class AdminGroundbaitView(View):
    @docs(tags=["Inventory"], summary="Список прикормок")
    @response_schema(GroundbaitListResponseSchema)
    async def get(self):
        items = await self.request.app.store.admin.get_groundbait_list()
        return json_response(data={"groundbaits": items})

    @docs(tags=["Inventory"], summary="Добавить прикормку")
    @admin_required
    @request_schema(GroundbaitSchema)
    @response_schema(GroundbaitSchema)
    async def post(self):
        data = self.request["data"]
        item = await self.request.app.store.admin.create_groundbait(data)
        return json_response(data=item)

class AdminGroundbaitItemView(View):
    @docs(tags=["Inventory"], summary="Обновить прикормку")
    @admin_required
    @request_schema(GroundbaitSchema(partial=True))
    @response_schema(GroundbaitSchema)
    async def patch(self):
        item_id = int(self.request.match_info["id"])
        data = self.request["data"]
        item = await self.request.app.store.admin.update_groundbait(item_id, data)
        return json_response(data=item)

    @docs(tags=["Inventory"], summary="Удалить прикормку")
    @admin_required
    async def delete(self):
        item_id = int(self.request.match_info["id"])
        await self.request.app.store.admin.delete_groundbait(item_id)
        return json_response(status="Успешно удалено")
""")

# 4. ОБНОВЛЕНИЕ ROUTES
with open("app/admin/routes.py", "r", encoding="utf-8") as f:
    routes_code = f.read()

import_injection = ", AdminSeasonView, AdminSeasonItemView, AdminWeatherView, AdminWeatherItemView, AdminFishingTimeView, AdminFishingTimeItemView, AdminInventoryView, AdminInventoryItemView, AdminLureView, AdminLureItemView, AdminGroundbaitView, AdminGroundbaitItemView"
routes_code = routes_code.replace("UpdateWaterbodyView\n    )", "UpdateWaterbodyView" + import_injection + "\n    )")

new_routes = """
    app.router.add_view("/api/seasons", AdminSeasonView)
    app.router.add_view(r"/admin/seasons/{id:\d+}", AdminSeasonItemView)
    
    app.router.add_view("/api/weather", AdminWeatherView)
    app.router.add_view(r"/admin/weather/{id:\d+}", AdminWeatherItemView)
    
    app.router.add_view("/api/fishing_times", AdminFishingTimeView)
    app.router.add_view(r"/admin/fishing_times/{id:\d+}", AdminFishingTimeItemView)
    
    app.router.add_view("/api/inventory", AdminInventoryView)
    app.router.add_view(r"/admin/inventory/{id:\d+}", AdminInventoryItemView)
    
    app.router.add_view("/api/lures", AdminLureView)
    app.router.add_view(r"/admin/lures/{id:\d+}", AdminLureItemView)
    
    app.router.add_view("/api/groundbaits", AdminGroundbaitView)
    app.router.add_view(r"/admin/groundbaits/{id:\d+}", AdminGroundbaitItemView)
"""
routes_code += new_routes

with open("app/admin/routes.py", "w", encoding="utf-8") as f:
    f.write(routes_code)

# 5. ОБНОВЛЕНИЕ MW (Добавление в PUBLIC_PATHS)
with open("app/web/mw.py", "r", encoding="utf-8") as f:
    mw_code = f.read()

public_paths_addition = '    "/api/seasons",\n    "/api/weather",\n    "/api/fishing_times",\n    "/api/inventory",\n    "/api/lures",\n    "/api/groundbaits"\n'
mw_code = mw_code.replace(r'"/api/waterbody/{id:\d+}"' + '\n]', r'"/api/waterbody/{id:\d+}",' + '\n' + public_paths_addition + ']')

with open("app/web/mw.py", "w", encoding="utf-8") as f:
    f.write(mw_code)

print("Patch applied successfully.")
