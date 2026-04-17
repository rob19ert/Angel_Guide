import asyncio
import io
import json
import os
import aiohttp
from PIL import Image, ImageOps

from app.web.app import app
from app.store.store import setup_store
from app.store.config import setup_config

from app.store.models import Waterbody, Lure, Groundbait, Inventory

async def process_and_upload_image(session: aiohttp.ClientSession, s3_accessor, url: str, target_size: tuple[int, int]) -> str:
    if not url or url.startswith("/src/"): 
        return url
        
    try:
        async with session.get(url, timeout=15) as resp:
            if resp.status != 200:
                print(f"Failed to download {url}: {resp.status}")
                return ""
            image_bytes = await resp.read()
            
        img = Image.open(io.BytesIO(image_bytes))
        if img.mode != "RGB":
            img = img.convert("RGB")
            
        img = ImageOps.fit(img, target_size, method=Image.Resampling.LANCZOS)
        
        output = io.BytesIO()
        img.save(output, format="JPEG", quality=85)
        processed_bytes = output.getvalue()
        
        filename = url.split("/")[-1].split("?")[0]
        if not filename.endswith(".jpg"):
            filename += ".jpg"
            
        s3_url = await s3_accessor.upload_image(processed_bytes, filename)
        return s3_url
    except Exception as e:
        print(f"Error processing image {url}: {e}")
        return ""

async def run_seed():
    config_path = os.path.join(os.getcwd(), "config.yaml")
    setup_config(app, config_path)
    setup_store(app)
    
    for startup_handler in app.on_startup:
        await startup_handler(app)
        
    store = app.store
    
    # Чтобы восстановить ID, заново читаем из исходного файла
    with open('seed.json', 'r', encoding='utf-8') as f:
        seed_data = json.load(f)

    print("Starting image processing and database population...")
    
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    async with aiohttp.ClientSession(headers=headers) as http_session:
        # --- ВОДОЕМЫ ---
        print("Processing Waterbodies...")
        for wb_data in seed_data.get("waterbodies", []):
            src_url = wb_data.pop("source_image_url", None)
            if src_url:
                s3_url = await process_and_upload_image(http_session, store.s3, src_url, target_size=(800, 450))
                if s3_url: wb_data["image_url"] = s3_url
            
            
            try:
                async with store.app.database.get_session() as db_session:
                    await db_session.merge(Waterbody(**wb_data))
                    await db_session.commit()
            except Exception as e:
                pass


        # --- НАЖИВКИ (LURES) ---
        print("Processing Lures...")
        for lure_data in seed_data.get("lures", []):
            src_url = lure_data.pop("source_image_url", None)
            if src_url:
                s3_url = await process_and_upload_image(http_session, store.s3, src_url, target_size=(400, 400))
                if s3_url: lure_data["image_url"] = s3_url
            
            
            try:
                async with store.app.database.get_session() as db_session:
                    await db_session.merge(Lure(**lure_data))
                    await db_session.commit()
            except Exception as e:
                pass


        # --- ПРИКОРМКИ (GROUNDBAITS) ---
        print("Processing Groundbaits...")
        for bait_data in seed_data.get("groundbaits", []):
            src_url = bait_data.pop("source_image_url", None)
            if src_url:
                s3_url = await process_and_upload_image(http_session, store.s3, src_url, target_size=(400, 400))
                if s3_url: bait_data["image_url"] = s3_url
            
            
            try:
                async with store.app.database.get_session() as db_session:
                    await db_session.merge(Groundbait(**bait_data))
                    await db_session.commit()
            except Exception as e:
                pass


        # --- ИНВЕНТАРЬ ---
        print("Processing Inventory...")
        for inv_data in seed_data.get("inventory", []):
            
            try:
                async with store.app.database.get_session() as db_session:
                    await db_session.merge(Inventory(**inv_data))
                    await db_session.commit()
            except Exception as e:
                pass


    print("Seeding finished successfully.")

    for cleanup_handler in app.on_cleanup:
        await cleanup_handler(app)

if __name__ == "__main__":
    asyncio.run(run_seed())
