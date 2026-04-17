import re
import os

with open("app/admin/views.py", "r", encoding="utf-8") as f:
    views_code = f.read()

# 1. Добавляем недостающие импорты схем для сериализации
missing_imports = """
from app.admin.schemes import (
    FishCategorySchema, FishSchema, WaterbodySchema, SeasonSchema, 
    WeatherConditionSchema, FishingTimeSchema, InventorySchema, 
    LureSchema, GroundbaitSchema, CatchPostSchema, ForumTopicSchema, 
    ForumMessageSchema, WaterbodyReviewSchema, FavoriteWaterbodySchema, 
    UserInventorySchema, FishWaterbodyLinkSchema, FishSeasonLinkSchema,
    FishWeatherLinkSchema, FishLureLinkSchema, FishInventoryLinkSchema
)
"""
views_code = missing_imports + "\n" + views_code

# Список кортежей: (Имя класса View, Ключ в JSON ответе GET, Схема для сериализации)
view_mappings = [
    ("AdminSeasonView", "seasons", "SeasonSchema"),
    ("AdminSeasonItemView", None, "SeasonSchema"),
    
    ("AdminWeatherView", "weather_conditions", "WeatherConditionSchema"),
    ("AdminWeatherItemView", None, "WeatherConditionSchema"),
    
    ("AdminFishingTimeView", "fishing_times", "FishingTimeSchema"),
    ("AdminFishingTimeItemView", None, "FishingTimeSchema"),
    
    ("AdminInventoryView", "items", "InventorySchema"),
    ("AdminInventoryItemView", None, "InventorySchema"),
    
    ("AdminLureView", "lures", "LureSchema"),
    ("AdminLureItemView", None, "LureSchema"),
    
    ("AdminGroundbaitView", "groundbaits", "GroundbaitSchema"),
    ("AdminGroundbaitItemView", None, "GroundbaitSchema"),
    
    ("CatchPostView", "catch_posts", "CatchPostSchema"),
    ("CatchPostItemView", None, "CatchPostSchema"),
    
    ("ForumTopicView", "forum_topics", "ForumTopicSchema"),
    ("ForumTopicItemView", None, "ForumTopicSchema"),
    
    ("ForumMessageView", "forum_messages", "ForumMessageSchema"),
    ("ForumMessageItemView", None, "ForumMessageSchema"),
    
    ("WaterbodyReviewView", "waterbody_reviews", "WaterbodyReviewSchema"),
    ("WaterbodyReviewItemView", None, "WaterbodyReviewSchema"),
    
    ("FavoriteWaterbodyView", None, "FavoriteWaterbodySchema"),
    ("UserInventoryView", None, "UserInventorySchema"),
    
    ("AdminFishWaterbodyLinkView", None, "FishWaterbodyLinkSchema"),
    ("AdminFishSeasonLinkView", None, "FishSeasonLinkSchema"),
    ("AdminFishWeatherLinkView", None, "FishWeatherLinkSchema"),
    ("AdminFishLureLinkView", None, "FishLureLinkSchema"),
    ("AdminFishInventoryLinkView", None, "FishInventoryLinkSchema"),
]

def patch_get_method(match, json_key, schema_name):
    # match.group(0) содержит весь метод get
    old_code = match.group(0)
    # Находим строку с return
    return_pattern = r'return json_response\(data=\{"' + json_key + r'": (.*?)\}\)'
    return_match = re.search(return_pattern, old_code)
    
    if return_match:
        items_var = return_match.group(1)
        new_return = f'return json_response(data={{ "{json_key}": {schema_name}(many=True).dump({items_var}) }})'
        return old_code.replace(return_match.group(0), new_return)
    return old_code

def patch_post_patch_method(match, schema_name):
    old_code = match.group(0)
    # Находим строку с return (ожидаем return json_response(data=item) или data=res)
    return_pattern = r'return json_response\(data=(.*?)\)'
    return_match = re.search(return_pattern, old_code)
    
    if return_match:
        item_var = return_match.group(1)
        new_return = f'return json_response(data={schema_name}().dump({item_var}))'
        return old_code.replace(return_match.group(0), new_return)
    return old_code

# Применяем изменения ко всем Views в цикле
for view_name, json_key, schema_name in view_mappings:
    # Находим блок класса
    class_pattern = r'class ' + view_name + r'\(View\):[\s\S]*?(?=class |\Z)'
    class_match = re.search(class_pattern, views_code)
    
    if class_match:
        class_code = class_match.group(0)
        new_class_code = class_code
        
        # Патчим GET (если есть json_key, значит это списковый View)
        if json_key:
            get_pattern = r'    async def get\(self\):[\s\S]*?return json_response[\s\S]*?\)'
            new_class_code = re.sub(get_pattern, lambda m: patch_get_method(m, json_key, schema_name), new_class_code)
            
        # Патчим POST
        post_pattern = r'    async def post\(self\):[\s\S]*?return json_response[\s\S]*?\)'
        new_class_code = re.sub(post_pattern, lambda m: patch_post_patch_method(m, schema_name), new_class_code)
        
        # Патчим PATCH
        patch_pattern = r'    async def patch\(self\):[\s\S]*?return json_response[\s\S]*?\)'
        new_class_code = re.sub(patch_pattern, lambda m: patch_post_patch_method(m, schema_name), new_class_code)

        views_code = views_code.replace(class_code, new_class_code)

# Дополнительно чиним старые ручки (Waterbody, FishCategory, Fish)
# Waterbody Get List
wb_list_pattern = r'    async def get\(self\):[\s\S]*?waterbodies = await self.request.app.store.admin.get_waterbody_list\(\)\s*return json_response\(data = waterbodies\)'
wb_list_replacement = r'''    async def get(self):
        waterbodies = await self.request.app.store.admin.get_waterbody_list()
        return json_response(data={"waterbodies": WaterbodySchema(many=True).dump(waterbodies)})'''
views_code = re.sub(wb_list_pattern, wb_list_replacement, views_code)

# Waterbody Get One
wb_get_pattern = r'waterbody = await self.request.app.store.admin.get_waterbody\(waterbody_id\)\s*return json_response\(data=waterbody\)'
wb_get_replacement = r'''waterbody = await self.request.app.store.admin.get_waterbody(waterbody_id)
            return json_response(data=WaterbodySchema().dump(waterbody))'''
views_code = re.sub(wb_get_pattern, wb_get_replacement, views_code)

# Waterbody Create
wb_post_pattern = r'waterbody = await self.request.app.store.admin.create_waterbody\(data\)\s*return json_response\(data=waterbody\)'
wb_post_replacement = r'''waterbody = await self.request.app.store.admin.create_waterbody(data)
            return json_response(data=WaterbodySchema().dump(waterbody))'''
views_code = re.sub(wb_post_pattern, wb_post_replacement, views_code)

# Waterbody Update
wb_patch_pattern = r'waterbody = await self.request.app.store.admin.update_waterbody\(waterbody_id, data\)\s*return json_response\(data=waterbody\)'
wb_patch_replacement = r'''waterbody = await self.request.app.store.admin.update_waterbody(waterbody_id, data)
            return json_response(data=WaterbodySchema().dump(waterbody))'''
views_code = re.sub(wb_patch_pattern, wb_patch_replacement, views_code)

# FishCatList
fish_cat_pattern = r'fishes_category = await self.request.app.store.admin.get_fish_category_list\(\)\s*return json_response\(data=\{"fish": fishes_category\}\)'
fish_cat_replacement = r'''fishes_category = await self.request.app.store.admin.get_fish_category_list()
        return json_response(data={"fish_categories": FishCategorySchema(many=True).dump(fishes_category)})'''
views_code = re.sub(fish_cat_pattern, fish_cat_replacement, views_code)

# Recommend Core
rec_pattern = r'result = await self.request.app.store.admin.get_recommendations\([\s\S]*?\)\s*return json_response\(data=result\)'
rec_replacement = r'''result = await self.request.app.store.admin.get_recommendations(
            waterbody_id=waterbody_id,
            season_id=season_id,
            weather_id=weather_id,
            fish_id=fish_id
        )
        
        # Сериализуем списки объектов внутри словаря result
        from app.admin.schemes import FishSchema, InventorySchema, LureSchema, GroundbaitSchema
        
        serialized_result = {
            "advice_text": result.get("advice_text", ""),
            "recommended_fishes": FishSchema(many=True).dump(result.get("recommended_fishes", [])),
            "recommended_inventory": InventorySchema(many=True).dump(result.get("recommended_inventory", [])),
            "recommended_lures": LureSchema(many=True).dump(result.get("recommended_lures", [])),
            "recommended_groundbaits": GroundbaitSchema(many=True).dump(result.get("recommended_groundbaits", []))
        }
        
        return json_response(data=serialized_result)'''
views_code = re.sub(rec_pattern, rec_replacement, views_code)


with open("app/admin/views.py", "w", encoding="utf-8") as f:
    f.write(views_code)

print("Serialization fix applied.")
