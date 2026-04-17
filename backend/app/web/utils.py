from functools import wraps
from typing import Any, Optional

from aiohttp import web
from app.store.models import UserRole
from aiohttp.web import json_response as aiohttp_json_response

def json_response(data: Any = None, status: str = "ok"):
    if data is None:
        data = {}
    return aiohttp_json_response(
        data = {
            "status": status,
            "data": data
        }
    )

def error_json_response(
    http_status: int,
    status: str = "error",
    message: Optional[str] = None,
    data: Optional[dict] = None,
):
    if data is None:
        data = {}
    return aiohttp_json_response(
        status=http_status,
        data={
            "status": status,
            "message": str(message),
            "data": data,
        },
    )

def admin_required(func):
    @wraps(func)
    async def wrapper(self, *args, **kwargs):
        if getattr(self.request, "role", None) != UserRole.ADMIN.value:
            raise web.HTTPForbidden(reason="Доступно только администраторам")
        return await func(self, *args, **kwargs)
    return wrapper

def login_required(func):
    @wraps(func)
    async def wrapper(self, *args, **kwargs):
        if not hasattr(self.request, "user_id"):
            raise web.HTTPUnauthorized(reason="Доступно только авторизованным пользователям")
        return await func(self, *args, **kwargs)
    return wrapper