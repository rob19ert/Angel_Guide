import os
import re

# 1. SCHEMES
schemes_add = """
class FishWeatherLinkSchema(Schema):
    fish_id = fields.Int(required=True)
    weather_id = fields.Int(required=True)
    influence_type = fields.Str(allow_none=True)

class FishLureLinkSchema(Schema):
    fish_id = fields.Int(required=True)
    lure_id = fields.Int(required=True)
    efficiency = fields.Str(allow_none=True)
    used_color = fields.Str(allow_none=True)

class FishInventoryLinkSchema(Schema):
    fish_id = fields.Int(required=True)
    inventory_id = fields.Int(required=True)
    is_mandatory = fields.Bool(load_default=False)
    rigging_advice = fields.Str(allow_none=True)
"""
with open("app/admin/schemes.py", "r", encoding="utf-8") as f:
    s_code = f.read()

# Fix FishWaterbodyLinkSchema to include waterbody_id
s_code = re.sub(
    r"class FishWaterbodyLinkSchema\(Schema\):\s+fish_id = fields\.Int\(required=True\)\s+population = fields\.Str\(allow_none=True\)",
    "class FishWaterbodyLinkSchema(Schema):\n    fish_id = fields.Int(required=True)\n    waterbody_id = fields.Int(required=True)\n    population = fields.Str(allow_none=True)",
    s_code
)
# Fix FishSeasonLinkSchema typo
s_code = re.sub(
    r"ish_id = fields\.Int\(required=True\)",
    "fish_id = fields.Int(required=True)",
    s_code
)

with open("app/admin/schemes.py", "w", encoding="utf-8") as f:
    f.write(s_code + "\n" + schemes_add)

# 2. ACCESSOR
with open("app/admin/accessor.py", "r", encoding="utf-8") as f:
    a_code = f.read()

a_code = a_code.replace(
    "from app.store.models import Fish, FishCategory, User, UserRole, Waterbody, Season, WeatherCondition, FishingTime, Inventory, Lure, Groundbait",
    "from app.store.models import Fish, FishCategory, User, UserRole, Waterbody, Season, WeatherCondition, FishingTime, Inventory, Lure, Groundbait, FishWaterbodyLink, FishSeasonLink, FishWeatherLink, FishLureLink, FishInventoryLink"
)
with open("app/admin/accessor.py", "w", encoding="utf-8") as f:
    f.write(a_code)
    
acc_add = """
    # --- СВЯЗИ: FISH <-> WATERBODY ---
    async def add_fish_waterbody_link(self, data: dict):
        async with self.app.database.get_session() as session:
            link = FishWaterbodyLink(**data)
            session.add(link)
            await session.commit()
            return data

    async def delete_fish_waterbody_link(self, fish_id: int, waterbody_id: int):
        async with self.app.database.get_session() as session:
            await session.execute(delete(FishWaterbodyLink).where(FishWaterbodyLink.fish_id == fish_id, FishWaterbodyLink.waterbody_id == waterbody_id))
            await session.commit()

    # --- СВЯЗИ: FISH <-> SEASON ---
    async def add_fish_season_link(self, data: dict):
        async with self.app.database.get_session() as session:
            link = FishSeasonLink(**data)
            session.add(link)
            await session.commit()
            return data

    async def delete_fish_season_link(self, fish_id: int, season_id: int):
        async with self.app.database.get_session() as session:
            await session.execute(delete(FishSeasonLink).where(FishSeasonLink.fish_id == fish_id, FishSeasonLink.season_id == season_id))
            await session.commit()

    # --- СВЯЗИ: FISH <-> WEATHER ---
    async def add_fish_weather_link(self, data: dict):
        async with self.app.database.get_session() as session:
            link = FishWeatherLink(**data)
            session.add(link)
            await session.commit()
            return data

    async def delete_fish_weather_link(self, fish_id: int, weather_id: int):
        async with self.app.database.get_session() as session:
            await session.execute(delete(FishWeatherLink).where(FishWeatherLink.fish_id == fish_id, FishWeatherLink.weather_id == weather_id))
            await session.commit()

    # --- СВЯЗИ: FISH <-> LURE ---
    async def add_fish_lure_link(self, data: dict):
        async with self.app.database.get_session() as session:
            link = FishLureLink(**data)
            session.add(link)
            await session.commit()
            return data

    async def delete_fish_lure_link(self, fish_id: int, lure_id: int):
        async with self.app.database.get_session() as session:
            await session.execute(delete(FishLureLink).where(FishLureLink.fish_id == fish_id, FishLureLink.lure_id == lure_id))
            await session.commit()

    # --- СВЯЗИ: FISH <-> INVENTORY ---
    async def add_fish_inventory_link(self, data: dict):
        async with self.app.database.get_session() as session:
            link = FishInventoryLink(**data)
            session.add(link)
            await session.commit()
            return data

    async def delete_fish_inventory_link(self, fish_id: int, inventory_id: int):
        async with self.app.database.get_session() as session:
            await session.execute(delete(FishInventoryLink).where(FishInventoryLink.fish_id == fish_id, FishInventoryLink.inventory_id == inventory_id))
            await session.commit()
"""
with open("app/admin/accessor.py", "a", encoding="utf-8") as f:
    f.write(acc_add)

# 3. VIEWS
with open("app/admin/views.py", "r", encoding="utf-8") as f:
    v_code = f.read()

v_code = v_code.replace(
    "from app.admin.schemes import SeasonListResponseSchema,",
    "from app.admin.schemes import FishWaterbodyLinkSchema, FishSeasonLinkSchema, FishWeatherLinkSchema, FishLureLinkSchema, FishInventoryLinkSchema, SeasonListResponseSchema,"
)
with open("app/admin/views.py", "w", encoding="utf-8") as f:
    f.write(v_code)

views_add = """
# --- LINKS ---
class AdminFishWaterbodyLinkView(View):
    @docs(tags=["Links"], summary="Добавить связь Рыба-Водоем")
    @admin_required
    @request_schema(FishWaterbodyLinkSchema)
    @response_schema(FishWaterbodyLinkSchema)
    async def post(self):
        data = self.request["data"]
        res = await self.request.app.store.admin.add_fish_waterbody_link(data)
        return json_response(data=res)

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
        return json_response(data=res)

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
        return json_response(data=res)

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
        return json_response(data=res)

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
        return json_response(data=res)

class AdminFishInventoryLinkDeleteView(View):
    @docs(tags=["Links"], summary="Удалить связь Рыба-Инвентарь")
    @admin_required
    async def delete(self):
        fish_id = int(self.request.match_info["fish_id"])
        inventory_id = int(self.request.match_info["inventory_id"])
        await self.request.app.store.admin.delete_fish_inventory_link(fish_id, inventory_id)
        return json_response(status="Успешно удалено")
"""
with open("app/admin/views.py", "a", encoding="utf-8") as f:
    f.write(views_add)

# 4. ROUTES
with open("app/admin/routes.py", "r", encoding="utf-8") as f:
    r_code = f.read()

import_inj = ", AdminFishWaterbodyLinkView, AdminFishWaterbodyLinkDeleteView, AdminFishSeasonLinkView, AdminFishSeasonLinkDeleteView, AdminFishWeatherLinkView, AdminFishWeatherLinkDeleteView, AdminFishLureLinkView, AdminFishLureLinkDeleteView, AdminFishInventoryLinkView, AdminFishInventoryLinkDeleteView"
r_code = r_code.replace("AdminGroundbaitItemView\n    )", "AdminGroundbaitItemView" + import_inj + "\n    )")

routes_add = """
    app.router.add_view("/admin/links/fish_waterbody", AdminFishWaterbodyLinkView)
    app.router.add_view(r"/admin/links/fish_waterbody/{fish_id:\\d+}/{waterbody_id:\\d+}", AdminFishWaterbodyLinkDeleteView)
    
    app.router.add_view("/admin/links/fish_season", AdminFishSeasonLinkView)
    app.router.add_view(r"/admin/links/fish_season/{fish_id:\\d+}/{season_id:\\d+}", AdminFishSeasonLinkDeleteView)
    
    app.router.add_view("/admin/links/fish_weather", AdminFishWeatherLinkView)
    app.router.add_view(r"/admin/links/fish_weather/{fish_id:\\d+}/{weather_id:\\d+}", AdminFishWeatherLinkDeleteView)
    
    app.router.add_view("/admin/links/fish_lure", AdminFishLureLinkView)
    app.router.add_view(r"/admin/links/fish_lure/{fish_id:\\d+}/{lure_id:\\d+}", AdminFishLureLinkDeleteView)
    
    app.router.add_view("/admin/links/fish_inventory", AdminFishInventoryLinkView)
    app.router.add_view(r"/admin/links/fish_inventory/{fish_id:\\d+}/{inventory_id:\\d+}", AdminFishInventoryLinkDeleteView)
"""
r_code += routes_add

with open("app/admin/routes.py", "w", encoding="utf-8") as f:
    f.write(r_code)

print("Patch applied successfully.")
