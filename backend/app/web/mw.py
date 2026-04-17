import jwt
from aiohttp import web
from aiohttp.web_middlewares import middleware
from aiohttp_apispec.middlewares import validation_middleware

# Тот же самый ключ, который мы используем в AdminAccessor
SECRET_KEY = "12345678" 

# Список маршрутов, куда можно заходить БЕЗ токена
PUBLIC_PATHS =[
    "/user/register", 
    "/admin/login", 
    "/docs",            # Страница Swagger
    "/swagger_static",
    "/api/docs/swagger.json", # Технический файл Swagger'а
    "/api/upload" ,
    "/api/fishes",
    "/api/fish_category",
    "/api/waterbody",
    r"/api/waterbody/{id:\d+}",
    "/api/seasons",
    "/api/weather",
    "/api/fishing_times",
    "/api/inventory",
    "/api/lures",
    "/api/groundbaits",
    "/api/catch_posts",
    "/api/forum_topics",
    "/api/forum_messages",
    "/api/waterbody_reviews",
    "/api/recommendation",
    "/api/forecast"
]
@middleware
async def auth_middleware(request: web.Request, handler):
    # 0. Пропускаем OPTIONS запросы (нужно для CORS)
    if request.method == "OPTIONS":
        return await handler(request)

    # 1. Всегда пытаемся прочитать токен, если он есть
    token = None
    
    # Сначала проверяем заголовок Authorization
    auth_header = request.headers.get("Authorization")
    if auth_header:
        try:
            scheme, val = auth_header.strip().split(" ")
            if scheme == "Bearer":
                token = val
        except Exception:
            pass
            
    # Если в заголовке нет, проверяем куки
    if not token:
        token = request.cookies.get("token")

    if token:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            request.role = payload.get("role")
            request.user_id = payload.get("user_id")
            # print(f"DEBUG AUTH: User {request.user_id} authenticated via {'header' if auth_header else 'cookie'}")
        except Exception as e:
            print(f"DEBUG AUTH ERROR: {str(e)}")
            pass 

    # 2. Проверяем, публичный ли это путь
    is_public = False
    for path in PUBLIC_PATHS:
        # Проверка через regex или обычное вхождение
        if isinstance(path, str):
            if request.path.startswith(path):
                is_public = True
                break
        else: # regex
            if path.match(request.path):
                is_public = True
                break

    # 3. Если путь закрытый, а токена/user_id нет - блокируем
    if not is_public and not hasattr(request, "user_id"):
        raise web.HTTPUnauthorized(reason="Требуется авторизация (отсутствует или неверный токен)")

    # 4. Передаем запрос дальше
    return await handler(request)

def setup_middlewares(app: web.Application):
    # Порядок важен! Сначала проверяем токен, потом валидируем JSON схемы
    app.middlewares.append(auth_middleware)
    app.middlewares.append(validation_middleware) # Это починит KeyError: 'data'
