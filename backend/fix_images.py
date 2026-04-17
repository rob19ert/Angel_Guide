import asyncio
import io
import os
import aiohttp
from PIL import Image, ImageOps

from app.web.app import app
from app.store.store import setup_store
from app.store.config import setup_config
from app.store.models import Waterbody, Lure, Groundbait, Fish
from sqlalchemy import select

async def download_and_upload(session, s3_accessor, seed_id, width, height, keyword="nature"):
    url = f"https://picsum.photos/seed/{keyword}_{seed_id}/{width}/{height}"
    try:
        async with session.get(url, timeout=15) as resp:
            if resp.status == 200:
                image_bytes = await resp.read()
                filename = f"img_{keyword}_{seed_id}.jpg"
                s3_url = await s3_accessor.upload_image(image_bytes, filename)
                return s3_url
    except Exception as e:
        print(f"Error for {url}: {e}")
    return None

async def run_fix():
    config_path = os.path.join(os.getcwd(), "config.yaml")
    setup_config(app, config_path)
    setup_store(app)
    
    for startup_handler in app.on_startup:
        await startup_handler(app)
        
    store = app.store
    
    # 1. Restore Waterbodies from seed.json to ensure data is correct
    import json
    with open('seed.json', 'r', encoding='utf-8') as f:
        seed_data = json.load(f)

    async with store.app.database.get_session() as db_session:
        for wb_data in seed_data.get("waterbodies", []):
            if "source_image_url" in wb_data: del wb_data["source_image_url"]
            # Restore descriptions and coordinates
            stmt = select(Waterbody).where(Waterbody.id == wb_data["id"])
            existing = (await db_session.execute(stmt)).scalar_one_or_none()
            if existing:
                for k, v in wb_data.items():
                    if k != "image_url": # keep image_url intact for now
                        setattr(existing, k, v)
            else:
                db_session.add(Waterbody(**wb_data))
        await db_session.commit()

    print("Waterbodies data restored. Now generating solid images...")

    async with aiohttp.ClientSession() as http_session:
        async with store.app.database.get_session() as db_session:
            # Waterbodies
            waterbodies = (await db_session.execute(select(Waterbody))).scalars().all()
            for wb in waterbodies:
                if not wb.image_url or "picsum" not in wb.image_url:
                    s3_url = await download_and_upload(http_session, store.s3, wb.id, 800, 450, "lake")
                    if s3_url:
                        wb.image_url = s3_url
                        print(f"Uploaded for {wb.name}")
            
            # Lures
            lures = (await db_session.execute(select(Lure))).scalars().all()
            for lure in lures:
                if not lure.image_url or "picsum" not in lure.image_url:
                    s3_url = await download_and_upload(http_session, store.s3, lure.id, 400, 400, "lure")
                    if s3_url:
                        lure.image_url = s3_url
                        print(f"Uploaded for {lure.name}")

            # Groundbaits
            baits = (await db_session.execute(select(Groundbait))).scalars().all()
            for bait in baits:
                if not bait.image_url or "picsum" not in bait.image_url:
                    s3_url = await download_and_upload(http_session, store.s3, bait.id, 400, 400, "bait")
                    if s3_url:
                        bait.image_url = s3_url
                        print(f"Uploaded for {bait.name}")

            await db_session.commit()
            
    print("Images uploaded to Minio successfully!")

    for cleanup_handler in app.on_cleanup:
        await cleanup_handler(app)

if __name__ == "__main__":
    asyncio.run(run_fix())
