import typing


from app.store.database.database import Database

if typing.TYPE_CHECKING:
    from app.web.app import Application
    
class Store:
    def __init__(self, app: "Application"):
        self.app = app
        from app.admin.accessor import AdminAccessor
        from app.store.s3_accessor import S3Accessor
        from app.store.weather_accessor import WeatherAccessor
        from app.store.forum.accessor import ForumAccessor
        
        self.admin = AdminAccessor(app)
        self.s3 = S3Accessor(app)
        self.weather = WeatherAccessor(app)
        self.forum = ForumAccessor(app)

def setup_store(app: "Application"):
    app.database = Database(app)
    app.on_startup.append(app.database.connect)
    app.on_cleanup.append(app.database.disconnect)
    app.store = Store(app)