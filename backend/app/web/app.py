import os
import typing

from aiohttp.web import Application as AiohttpApplication, run_app as aiohttp_run_app, Request as AiohttpRequest, View as AiohttpView
from aiohttp_apispec import setup_aiohttp_apispec
import aiohttp_cors

from app.store.database.database import Database
from app.store.config import setup_config
from app.web.mw import setup_middlewares
from app.web.routes import setup_routes

if typing.TYPE_CHECKING:
    from app.store.store import Store
    
class Application(AiohttpApplication):
    database: Database | None = None
    store : typing.Optional["Store"] = None

class Request(AiohttpRequest):
    @property
    def app(self) -> Application:
        return super().app

class View(aiohttp_cors.CorsViewMixin, AiohttpView):
    @property
    def request(self) -> Request:
        return super().request

app = Application()

def run_app():
    from app.store.store import setup_store

    config_path = os.path.join(os.getcwd(), "config.yaml")
    
    # 1. Загружаем конфиг
    setup_config(app, config_path)
    
    # 2. Инициализируем хранилище
    setup_store(app)
    
    # 3. Регистрируем все роуты
    setup_routes(app)
    
    # 4. Настраиваем мидлвари
    setup_middlewares(app)
    
    # 5. Настраиваем API документацию (ВОЗВРАЩАЕМ ПОЛНУЮ КОНФИГУРАЦИЮ)
    setup_aiohttp_apispec(
        app, 
        title="Fish Guide API", 
        url="/docs/json", 
        swagger_path="/docs",
        static_path="/swagger_static"
    )

    # 6. ИНИЦИАЛИЗИРУЕМ CORS В САМОМ КОНЦЕ
    cors = aiohttp_cors.setup(app, defaults={
        "http://localhost:5173": aiohttp_cors.ResourceOptions(
            allow_credentials=True,
            expose_headers="*",
            allow_headers="*",
            allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
        ),
        "http://127.0.0.1:5173": aiohttp_cors.ResourceOptions(
            allow_credentials=True,
            expose_headers="*",
            allow_headers="*",
            allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
        )
    })
    
    for route in list(app.router.routes()):
        cors.add(route)

    aiohttp_run_app(app, host="127.0.0.1", port=8082)
