import asyncio
import yaml
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import update
import sys
import os

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.store.models import Waterbody

async def fill_regions():
    with open("config.yaml", "r") as f:
        config = yaml.safe_load(f)
    engine = create_async_engine(config['database']['url'])
    Session = async_sessionmaker(engine)
    async with Session() as session:
        await session.execute(update(Waterbody).where(Waterbody.region == None).values(region="Подмосковье"))
        await session.commit()
    print("Regions updated!")

if __name__ == "__main__":
    asyncio.run(fill_regions())
