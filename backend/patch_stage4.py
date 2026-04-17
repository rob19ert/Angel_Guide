import os

# 1. SCHEMES
schemes_add = """
class RecommendationRequestSchema(Schema):
    waterbody_id = fields.Int(required=True, description="ID водоема")
    season_id = fields.Int(required=True, description="ID текущего сезона")
    weather_id = fields.Int(required=True, description="ID текущей погоды")
    fish_id = fields.Int(allow_none=True, description="ID целевой рыбы (опционально)")

class RecommendationResponseSchema(Schema):
    recommended_fishes = fields.Nested(FishSchema, many=True, description="Рыбы, которые сейчас клюют")
    recommended_inventory = fields.Nested(InventorySchema, many=True, description="Рекомендуемые снасти")
    recommended_lures = fields.Nested(LureSchema, many=True, description="Рекомендуемые приманки")
    recommended_groundbaits = fields.Nested(GroundbaitSchema, many=True, description="Рекомендуемая прикормка")
    advice_text = fields.Str(description="Текстовый совет")
"""
with open("app/admin/schemes.py", "a", encoding="utf-8") as f:
    f.write("\n" + schemes_add)

# 2. ACCESSOR
acc_add = """
    # --- RECOMMENDATIONS (CORE) ---
    async def get_recommendations(self, waterbody_id: int, season_id: int, weather_id: int, fish_id: int = None):
        async with self.app.database.get_session() as session:
            # 1. Находим рыб в этом водоеме
            fw_query = select(FishWaterbodyLink.fish_id).where(FishWaterbodyLink.waterbody_id == waterbody_id)
            fw_result = await session.execute(fw_query)
            fish_ids_in_waterbody = [row[0] for row in fw_result.fetchall()]
            
            if not fish_ids_in_waterbody:
                return {"advice_text": "В этом водоеме пока нет информации о рыбе."}

            # 2. Фильтруем по сезону и погоде
            fs_query = select(FishSeasonLink.fish_id).where(FishSeasonLink.fish_id.in_(fish_ids_in_waterbody), FishSeasonLink.season_id == season_id)
            fs_result = await session.execute(fs_query)
            active_fish_ids = [row[0] for row in fs_result.fetchall()]

            if not active_fish_ids:
                return {"advice_text": "В этот сезон в этом водоеме рыба не активна."}

            # Если пользователь указал конкретную рыбу, оставляем только её (если она есть в водоеме и активна)
            if fish_id:
                if fish_id in active_fish_ids:
                    active_fish_ids = [fish_id]
                else:
                    return {"advice_text": "Выбранная рыба сейчас не клюет в этом водоеме."}

            # 3. Достаем полные объекты активных рыб
            fishes_query = select(Fish).where(Fish.id.in_(active_fish_ids))
            fishes_result = await session.execute(fishes_query)
            recommended_fishes = fishes_result.scalars().all()

            # 4. Собираем инвентарь для этих рыб
            fi_query = select(FishInventoryLink.inventory_id).where(FishInventoryLink.fish_id.in_(active_fish_ids))
            fi_result = await session.execute(fi_query)
            inventory_ids = [row[0] for row in fi_result.fetchall()]
            
            recommended_inventory = []
            if inventory_ids:
                inv_query = select(Inventory).where(Inventory.id.in_(inventory_ids))
                inv_result = await session.execute(inv_query)
                recommended_inventory = inv_result.scalars().all()

            # 5. Собираем приманки
            fl_query = select(FishLureLink.lure_id).where(FishLureLink.fish_id.in_(active_fish_ids))
            fl_result = await session.execute(fl_query)
            lure_ids = [row[0] for row in fl_result.fetchall()]
            
            recommended_lures = []
            if lure_ids:
                lure_query = select(Lure).where(Lure.id.in_(lure_ids))
                lure_result = await session.execute(lure_query)
                recommended_lures = lure_result.scalars().all()

            # 6. Собираем прикормки
            gb_query = select(Groundbait).where(Groundbait.fish_id.in_(active_fish_ids))
            gb_result = await session.execute(gb_query)
            recommended_groundbaits = gb_result.scalars().all()

            # Формируем ответ
            advice = f"Рекомендуется ловить {len(recommended_fishes)} видов рыб. Используйте подобранные снасти для максимального улова."
            
            return {
                "recommended_fishes": recommended_fishes,
                "recommended_inventory": recommended_inventory,
                "recommended_lures": recommended_lures,
                "recommended_groundbaits": recommended_groundbaits,
                "advice_text": advice
            }
"""
with open("app/admin/accessor.py", "a", encoding="utf-8") as f:
    f.write(acc_add)

# 3. VIEWS
with open("app/admin/views.py", "r", encoding="utf-8") as f:
    v_code = f.read()

v_code = v_code.replace(
    "from app.admin.schemes import CatchPostSchema",
    "from app.admin.schemes import RecommendationRequestSchema, RecommendationResponseSchema, CatchPostSchema"
)
with open("app/admin/views.py", "w", encoding="utf-8") as f:
    f.write(v_code)

views_add = """
# --- RECOMMENDATION CORE ---
class RecommendationView(View):
    @docs(tags=["Core"], summary="Получить рекомендации по снастям и рыбалке")
    @request_schema(RecommendationRequestSchema)
    @response_schema(RecommendationResponseSchema)
    async def post(self):
        # Поскольку это сложный GET по смыслу, но передает много параметров,
        # логичнее использовать POST или передавать через query_string. 
        # Согласно ТЗ, данные берем из self.request["data"] -> это POST.
        data = self.request["data"]
        
        waterbody_id = data.get("waterbody_id")
        season_id = data.get("season_id")
        weather_id = data.get("weather_id")
        fish_id = data.get("fish_id")

        result = await self.request.app.store.admin.get_recommendations(
            waterbody_id=waterbody_id,
            season_id=season_id,
            weather_id=weather_id,
            fish_id=fish_id
        )
        return json_response(data=result)
"""
with open("app/admin/views.py", "a", encoding="utf-8") as f:
    f.write(views_add)

# 4. ROUTES
with open("app/admin/routes.py", "r", encoding="utf-8") as f:
    r_code = f.read()

import_inj = ", RecommendationView"
r_code = r_code.replace("UserInventoryDeleteView\n    )", "UserInventoryDeleteView" + import_inj + "\n    )")

routes_add = """
    app.router.add_view("/api/recommendation", RecommendationView)
"""
r_code += routes_add

with open("app/admin/routes.py", "w", encoding="utf-8") as f:
    f.write(r_code)

# 5. PUBLIC PATHS in mw.py
with open("app/web/mw.py", "r", encoding="utf-8") as f:
    mw_code = f.read()

public_paths_addition = '    "/api/recommendation"\n'
mw_code = mw_code.replace(r'"/api/waterbody_reviews"' + '\n]', r'"/api/waterbody_reviews",' + '\n' + public_paths_addition + ']')

with open("app/web/mw.py", "w", encoding="utf-8") as f:
    f.write(mw_code)

print("Patch applied successfully.")
