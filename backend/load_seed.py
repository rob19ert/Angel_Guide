import asyncio
import json
import os
from aiohttp import web
from app.web.app import app
from app.store.store import setup_store
from app.store.config import setup_config

async def load_seed():
    # Инициализируем компоненты приложения вручную
    config_path = os.path.join(os.getcwd(), "config.yaml")
    setup_config(app, config_path)
    setup_store(app)
    
    # Вызываем стартап для подключения к БД
    for startup_handler in app.on_startup:
        await startup_handler(app)
    
    store = app.store
    
    with open('seed.json', 'r', encoding='utf-8') as f:
        seed_data = json.load(f)
    
    print("Starting database seeding...")

    try:
        # Категории рыб
        for cat in seed_data["fish_categories"]:
            try:
                await store.admin.add_fish_categories(name=cat["name"], description=cat["description"])
            except Exception: pass
        print("Categories seeded.")

        # Рыбы
        for fish in seed_data["fishes"]:
            try:
                await store.admin.create_fish(fish)
            except Exception: pass
        print("Fishes seeded.")

        # Водоемы
        for wb in seed_data["waterbodies"]:
            try:
                await store.admin.create_waterbody(wb)
            except Exception: pass
        print("Waterbodies seeded.")

        # Сезоны
        for s in seed_data["seasons"]:
            try:
                await store.admin.create_season(s)
            except Exception: pass
        print("Seasons seeded.")

        # Погода
        for w in seed_data["weather_conditions"]:
            try:
                await store.admin.create_weather(w)
            except Exception: pass
        print("Weather seeded.")

        # Время
        from datetime import time
        for t in seed_data["fishing_times"]:
            try:
                # Конвертируем строку времени в объект time
                t_copy = t.copy()
                t_copy["start_time"] = time.fromisoformat(t["start_time"])
                t_copy["end_time"] = time.fromisoformat(t["end_time"])
                await store.admin.create_fishing_time(t_copy)
            except Exception as e: print(f"Time error: {e}")
        print("Fishing times seeded.")

        # Инвентарь
        for inv in seed_data["inventory"]:
            try:
                await store.admin.create_inventory(inv)
            except Exception: pass
        print("Inventory seeded.")

        # Приманки
        for lure in seed_data["lures"]:
            try:
                await store.admin.create_lure(lure)
            except Exception: pass
        print("Lures seeded.")

        # Прикормки
        for gb in seed_data["groundbaits"]:
            try:
                await store.admin.create_groundbait(gb)
            except Exception: pass
        print("Groundbaits seeded.")

        # СВЯЗИ
        print("Seeding links...")
        for link in seed_data["fish_waterbody_links"]:
            try: await store.admin.add_fish_waterbody_link(link)
            except Exception: pass
        for link in seed_data["fish_season_links"]:
            try: await store.admin.add_fish_season_link(link)
            except Exception: pass
        for link in seed_data["fish_time_links"]:
            try: await store.admin.add_fish_time_link(link)
            except Exception: pass
        for link in seed_data["fish_weather_links"]:
            try: await store.admin.add_fish_weather_link(link)
            except Exception: pass
        for link in seed_data["fish_lure_links"]:
            try: await store.admin.add_fish_lure_link(link)
            except Exception: pass
        for link in seed_data["fish_inventory_links"]:
            try: await store.admin.add_fish_inventory_link(link)
            except Exception: pass
        print("All links seeded successfully.")

    finally:
        for cleanup_handler in app.on_cleanup:
            await cleanup_handler(app)

if __name__ == "__main__":
    asyncio.run(load_seed())
