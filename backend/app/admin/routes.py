import typing

if typing.TYPE_CHECKING:
    from app.web.app import Application


def admin_setyp_routes(app: "Application"):
    from app.admin.views import (
        AdminRegister, 
        AdminLogin, 
        AdminMeView,
        AdminUserBanView, 
        AdminUsersListView,
        CreateFishCategoryView,
        CreateFishView,
        PublishFishListView,
        UploadImageView,
        DeleteFishView,
        FishCatListView,
        GetWaterbodyListView,
        GetWaterbodyView,
        CreateWaterbodyView,
        DeleteWaterbodyView,
        UpdateWaterbodyView, AdminSeasonView, AdminSeasonItemView, AdminWeatherView, AdminWeatherItemView, AdminFishingTimeView, AdminFishingTimeItemView, AdminInventoryView, AdminInventoryItemView, AdminLureView, AdminLureItemView, AdminGroundbaitView, AdminGroundbaitItemView, AdminFishWaterbodyLinkView, AdminFishWaterbodyLinkDeleteView, AdminFishSeasonLinkView, AdminFishSeasonLinkDeleteView, AdminFishWeatherLinkView, AdminFishWeatherLinkDeleteView, AdminFishLureLinkView, AdminFishLureLinkDeleteView, AdminFishInventoryLinkView, AdminFishInventoryLinkDeleteView, CatchPostView, CatchPostItemView, ForumTopicView, ForumTopicItemView, ForumMessageView, ForumMessageItemView, WaterbodyReviewView, WaterbodyReviewItemView, FavoriteWaterbodyView, FavoriteWaterbodyDeleteView, UserInventoryView, UserInventoryDeleteView, RecommendationView
    )

    app.router.add_view("/user/register", AdminRegister)
    app.router.add_view("/admin/login", AdminLogin)
    app.router.add_view("/api/me", AdminMeView) # Добавляем проверку себя

    app.router.add_view("/admin/users", AdminUsersListView)
    app.router.add_view(r"/admin/users/{id:\d+}/ban", AdminUserBanView)
    app.router.add_view("/admin/fish_categories", CreateFishCategoryView)
    app.router.add_view("/admin/fishes", CreateFishView)
    app.router.add_view("/api/fishes", PublishFishListView)
    app.router.add_view("/api/upload", UploadImageView)
    app.router.add_view(r"/admin/fishes/{id:\d+}", DeleteFishView)
    app.router.add_view("/api/fish_category", FishCatListView)
    app.router.add_view("/api/waterbody", GetWaterbodyListView)
    app.router.add_view(r"/api/waterbody/{id:\d+}", GetWaterbodyView)
    app.router.add_view("/api/waterbody/add", CreateWaterbodyView)
    app.router.add_view(r"/admin/waterbody/delete/{id:\d+}", DeleteWaterbodyView)
    app.router.add_view(r"/admin/waterbody/update/{id:\d+}", UpdateWaterbodyView)
    app.router.add_view("/api/seasons", AdminSeasonView)
    app.router.add_view(r"/admin/seasons/{id:\d+}", AdminSeasonItemView)
    
    app.router.add_view("/api/weather", AdminWeatherView)
    app.router.add_view(r"/admin/weather/{id:\d+}", AdminWeatherItemView)
    
    app.router.add_view("/api/fishing_times", AdminFishingTimeView)
    app.router.add_view(r"/admin/fishing_times/{id:\d+}", AdminFishingTimeItemView)
    
    app.router.add_view("/api/inventory", AdminInventoryView)
    app.router.add_view(r"/admin/inventory/{id:\d+}", AdminInventoryItemView)
    
    app.router.add_view("/api/lures", AdminLureView)
    app.router.add_view(r"/admin/lures/{id:\d+}", AdminLureItemView)
    
    app.router.add_view("/api/groundbaits", AdminGroundbaitView)
    app.router.add_view(r"/admin/groundbaits/{id:\d+}", AdminGroundbaitItemView)

    app.router.add_view("/admin/links/fish_waterbody", AdminFishWaterbodyLinkView)
    app.router.add_view(r"/admin/links/fish_waterbody/{fish_id:\d+}/{waterbody_id:\d+}", AdminFishWaterbodyLinkDeleteView)
    
    app.router.add_view("/admin/links/fish_season", AdminFishSeasonLinkView)
    app.router.add_view(r"/admin/links/fish_season/{fish_id:\d+}/{season_id:\d+}", AdminFishSeasonLinkDeleteView)
    
    app.router.add_view("/admin/links/fish_weather", AdminFishWeatherLinkView)
    app.router.add_view(r"/admin/links/fish_weather/{fish_id:\d+}/{weather_id:\d+}", AdminFishWeatherLinkDeleteView)
    
    app.router.add_view("/admin/links/fish_lure", AdminFishLureLinkView)
    app.router.add_view(r"/admin/links/fish_lure/{fish_id:\d+}/{lure_id:\d+}", AdminFishLureLinkDeleteView)
    
    app.router.add_view("/admin/links/fish_inventory", AdminFishInventoryLinkView)
    app.router.add_view(r"/admin/links/fish_inventory/{fish_id:\d+}/{inventory_id:\d+}", AdminFishInventoryLinkDeleteView)

    app.router.add_view("/api/catch_posts", CatchPostView)
    app.router.add_view(r"/admin/catch_posts/{id:\d+}", CatchPostItemView)
    
    app.router.add_view("/api/forum_topics", ForumTopicView)
    app.router.add_view(r"/admin/forum_topics/{id:\d+}", ForumTopicItemView)
    
    app.router.add_view("/api/forum_messages", ForumMessageView)
    app.router.add_view(r"/admin/forum_messages/{id:\d+}", ForumMessageItemView)
    
    app.router.add_view("/api/waterbody_reviews", WaterbodyReviewView)
    app.router.add_view(r"/admin/waterbody_reviews/{id:\d+}", WaterbodyReviewItemView)
    
    app.router.add_view("/admin/favorite_waterbodies", FavoriteWaterbodyView)
    app.router.add_view(r"/admin/favorite_waterbodies/{user_id:\d+}/{waterbody_id:\d+}", FavoriteWaterbodyDeleteView)
    
    app.router.add_view("/admin/user_inventory", UserInventoryView)
    app.router.add_view(r"/admin/user_inventory/{user_id:\d+}/{inventory_id:\d+}", UserInventoryDeleteView)

    app.router.add_view("/api/recommendation", RecommendationView)

    from app.admin.views import ForecastMoscowView, ForecastWaterbodyView
    app.router.add_view("/api/forecast/moscow", ForecastMoscowView)
    app.router.add_view(r"/api/forecast/waterbody/{id:\d+}", ForecastWaterbodyView)
