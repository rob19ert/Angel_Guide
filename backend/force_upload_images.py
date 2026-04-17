import asyncio
import io
import os
import random
from PIL import Image, ImageDraw, ImageFont
from sqlalchemy import select
from app.web.app import app
from app.store.store import setup_store
from app.store.config import setup_config
from app.store.models import Waterbody, Lure, Groundbait

def generate_image(text, width, height, color):
    img = Image.new('RGB', (width, height), color=color)
    d = ImageDraw.Draw(img)
    
    # Try to load a font, otherwise use default
    try:
        font = ImageFont.truetype("arial.ttf", 36)
    except:
        font = ImageFont.load_default()
        
    text_bbox = d.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    
    d.text(((width - text_width) / 2, (height - text_height) / 2), text, fill=(255, 255, 255), font=font)
    output = io.BytesIO()
    img.save(output, format='JPEG', quality=90)
    return output.getvalue()

async def run_fix():
    setup_config(app, os.path.join(os.getcwd(), 'config.yaml'))
    setup_store(app)
    for h in app.on_startup: await h(app)
    
    print('Generating and uploading local images to Minio...')
    async with app.store.app.database.get_session() as db_session:
        wbs = (await db_session.execute(select(Waterbody))).scalars().all()
        for i, wb in enumerate(wbs):
            color = (random.randint(0, 100), random.randint(50, 150), random.randint(100, 255))
            img_bytes = generate_image(f"Lake: {wb.name}", 800, 450, color)
            filename = f"generated_lake_{wb.id or i}.jpg"
            s3_url = await app.store.s3.upload_image(img_bytes, filename)
            wb.image_url = s3_url
            print(f'Uploaded {filename}')
                
        lures = (await db_session.execute(select(Lure))).scalars().all()
        for i, lure in enumerate(lures):
            color = (random.randint(150, 255), random.randint(50, 100), random.randint(50, 100))
            img_bytes = generate_image(f"Lure: {lure.name}", 400, 400, color)
            filename = f"generated_lure_{lure.id or i}.jpg"
            s3_url = await app.store.s3.upload_image(img_bytes, filename)
            lure.image_url = s3_url
            print(f'Uploaded {filename}')
                
        baits = (await db_session.execute(select(Groundbait))).scalars().all()
        for i, bait in enumerate(baits):
            color = (random.randint(100, 200), random.randint(100, 200), random.randint(0, 100))
            img_bytes = generate_image(f"Bait: {bait.name}", 400, 400, color)
            filename = f"generated_bait_{bait.id or i}.jpg"
            s3_url = await app.store.s3.upload_image(img_bytes, filename)
            bait.image_url = s3_url
            print(f'Uploaded {filename}')
                
        await db_session.commit()
        print("DB committed.")
            
    print('Done!')
    for h in app.on_cleanup: await h(app)

if __name__ == "__main__":
    asyncio.run(run_fix())
