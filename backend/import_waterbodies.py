import json
import asyncio
import yaml
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.store.models import Waterbody

async def main():
    # Load config
    with open("config.yaml", "r") as f:
        config = yaml.safe_load(f)
    db_url = config["database"]["url"]

    # Load data
    with open('TEST.md', encoding='utf-8') as f:
        data = f.read()
    if not data.strip().startswith('['):
        data = '[' + data
    waterbodies_data = json.loads(data)
    
    engine = create_async_engine(db_url)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        for item in waterbodies_data:
            # Use merge to insert or update based on primary key
            wb = Waterbody(**item)
            await session.merge(wb)
        await session.commit()
    print("Successfully inserted waterbodies.")

if __name__ == '__main__':
    asyncio.run(main())