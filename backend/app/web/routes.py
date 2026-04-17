from aiohttp.web_app import Application


from app.admin.routes import admin_setyp_routes

def setup_routes(app: Application):
    admin_setyp_routes(app)