import asyncio
import sys
import os

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.store.config import setup_config
from sqlalchemy.ext.asyncio import create_async_engine

async def test_waterbodies():
    class MockApp:
        def __init__(self):
            self.config = {}
            self.on_startup = []
            self.on_cleanup = []
    
    app = MockApp()
    setup_config(app, "config.yaml")
    
    from app.store.database.database import Database
    db = Database(app)
    await db.connect()
    app.database = db
    
    from app.admin.accessor import AdminAccessor
    admin = AdminAccessor(app)
    app.store = type("MockStore", (), {"admin": admin})()
    admin.app = app
    
    try:
        wbs = await admin.get_waterbody_list()
        print(f"Success! Found {len(wbs)} waterbodies.")
        for w in wbs:
            print(f"WB: {w.name}, Region: {w.region}, Rating: {w.rating}")
            # test category loading
            for link in w.fish_links:
                print(f"  Fish: {link.fish.name}, Category: {link.fish.category.name if link.fish.category else 'None'}")
    except Exception as e:
        import traceback
        traceback.print_exc()
    finally:
        await db.disconnect()

if __name__ == "__main__":
    asyncio.run(test_waterbodies())