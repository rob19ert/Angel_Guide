from marshmallow import Schema, fields

from app.store.models import InventoryCategory

class AdminRegisterRequestSchema(Schema):
    username = fields.Str(required=True, description="Логин пользователя")
    email = fields.Email(required=True, description="Почта")
    password = fields.Str(required=True, description="Пароль")
    secret_key = fields.Str(required=False, description="Секретный ключ")

class AdminRegisterResponseSchema(Schema):
    id = fields.Int()
    username = fields.Str()
    email = fields.Str()
    role = fields.Str()

class AdminLoginRequestSchema(Schema):
    email = fields.Str(required=True)
    password = fields.Str(required=True)

class AdminLoginResponseSchema(Schema):
    token = fields.Str()
    role = fields.Str()

class UserSchema(Schema):
    id = fields.Int()
    username = fields.Str()
    email = fields.Str()
    role = fields.Method("get_role", dump_only=True)
    is_banned = fields.Bool()

    def get_role(self, obj):
        if hasattr(obj, 'role'):
            # Если это Enum, берем value, если строка - возвращаем как есть
            val = getattr(obj.role, 'value', str(obj.role))
            if "UserRole." in val:
                return val.replace("UserRole.", "").lower()
            return val.lower()
        return "user"

class UserResponseSchema(Schema):
    users = fields.Nested(UserSchema, many = True)

class BanUserRequestSchema(Schema):
    is_banned = fields.Bool(required = True, description = "True - забанить, False - разбан")

class FishCategorySchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    description = fields.Str(allow_none=True)

class FishSchema(Schema):
    id = fields.Int(dump_only=True)
    category_id = fields.Int(required=True)
    category = fields.Nested(FishCategorySchema, dump_only=True, allow_none=True)
    name = fields.Str(required=True)
    description = fields.Str(allow_none=True)
    avg_size = fields.Float(allow_none=True)
    max_weight = fields.Float(allow_none=True)
    icon_url = fields.Str(allow_none=True)
    is_rare = fields.Bool(load_default = False)

class FishListResponseSchema(Schema):
    fishes = fields.Nested(FishSchema, many=True)

class WaterbodySpotSchema(Schema):
    id = fields.Int(dump_only=True)
    coordinates = fields.Str(allow_none=True)
    features = fields.Str(allow_none=True)
    bottom_type = fields.Str(allow_none=True)

class FishWaterbodyLinkSchema(Schema):
    fish_id = fields.Int(required=True, load_only=True)
    waterbody_id = fields.Int(required=True, load_only=True)
    population = fields.Str(allow_none=True)
    fish = fields.Nested("FishSchema", dump_only=True)

class WaterbodySchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    description = fields.Str(allow_none=True)
    type = fields.Str(required=True)
    avg_depth = fields.Float(allow_none=True)
    latitude = fields.Float(allow_none=True)
    longitude = fields.Float(allow_none=True)
    image_url = fields.Str(allow_none=True)
    region = fields.Str(allow_none=True)
    rating = fields.Float(dump_only=True)
    is_paid = fields.Bool(load_default = False)
    price = fields.Str(allow_none=True)
    accessibility = fields.Str(required=False)
    boats_allowed = fields.Bool(load_default = False)
    clarity = fields.Str(required=False)
    vegetation = fields.Str(required=False)

    spots = fields.Nested(WaterbodySpotSchema, many=True, dump_only=True)
    fish_links = fields.Nested(FishWaterbodyLinkSchema, many=True, dump_only=True)

class WaterbodyUpdateSchema(WaterbodySchema):
    name = fields.Str(required=False)
    type = fields.Str(required=False)


class SeasonSchema(Schema):
    id = fields.Int(dump_only=True)
    time_of_year = fields.Str(required=True)
    avg_temperature = fields.Float(allow_none=True)
    features = fields.Str(allow_none=True)

class FishSeasonLinkSchema(Schema):
    fish_id = fields.Int(required=True)
    season_id = fields.Int(required=True)
    activity_level = fields.Str(allow_none=True, description="Активность: высокая, низкая")
    habitat_depth = fields.Float(allow_none=True, description="Глубина обитания в этот сезон")

class WeatherConditionSchema(Schema):
    id = fields.Int(dump_only=True)
    weather_type = fields.Str(required=True)
    pressure = fields.Float(allow_none=True)
    recommendations = fields.Str(allow_none=True)

class FishingTimeSchema(Schema):
    id = fields.Int(dump_only=True)
    time_of_day = fields.Str(required=True, description="Утро, День, Вечер, Ночь")
    start_time = fields.Time(allow_none=True) # Marshmallow умеет работать с datetime.time
    end_time = fields.Time(allow_none=True)

class InventorySchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    # Для Enum в Marshmallow используем fields.Enum
    category = fields.Enum(InventoryCategory, by_value=True, required=True) 
    price = fields.Float(allow_none=True)
    description = fields.Str(allow_none=True)
    image_url = fields.Str(allow_none=True)
    preview_image_url = fields.Str(allow_none=True)
    # Specs - это JSON в базе. В Marshmallow это Dict
    specs = fields.Dict(keys=fields.Str(), allow_none=True, description="Гибкие характеристики, например {'length': '2.1m'}")


class LureSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    type = fields.Str(allow_none=True, description="Воблер, блесна и т.д.")
    season_use = fields.Str(allow_none=True)
    description = fields.Str(allow_none=True)
    price = fields.Float(allow_none=True)
    image_url = fields.Str(allow_none=True)

class GroundbaitSchema(Schema):
    id = fields.Int(dump_only=True)
    fish_id = fields.Int(allow_none=True, description="ID рыбы, для которой это сделано")
    name = fields.Str(required=True)
    composition = fields.Str(allow_none=True)
    season_use = fields.Str(allow_none=True)
    description = fields.Str(allow_none=True)
    price = fields.Float(allow_none=True)
    image_url = fields.Str(allow_none=True)

class SeasonListResponseSchema(Schema):
    seasons = fields.Nested(SeasonSchema, many=True)

class LureListResponseSchema(Schema):
    lures = fields.Nested(LureSchema, many=True)

class InventoryListResponseSchema(Schema):
    items = fields.Nested(InventorySchema, many=True)
class WeatherConditionListResponseSchema(Schema):
    weather_conditions = fields.Nested(WeatherConditionSchema, many=True)

class FishingTimeListResponseSchema(Schema):
    fishing_times = fields.Nested(FishingTimeSchema, many=True)

class GroundbaitListResponseSchema(Schema):
    groundbaits = fields.Nested(GroundbaitSchema, many=True)


class FishWeatherLinkSchema(Schema):
    fish_id = fields.Int(required=True)
    weather_id = fields.Int(required=True)
    influence_type = fields.Str(allow_none=True)

class FishLureLinkSchema(Schema):
    fish_id = fields.Int(required=True)
    lure_id = fields.Int(required=True)
    efficiency = fields.Str(allow_none=True)
    used_color = fields.Str(allow_none=True)

class FishInventoryLinkSchema(Schema):
    fish_id = fields.Int(required=True)
    inventory_id = fields.Int(required=True)
    is_mandatory = fields.Bool(load_default=False)
    rigging_advice = fields.Str(allow_none=True)


class CatchPostSchema(Schema):
    id = fields.Int(dump_only=True)
    author_id = fields.Int(dump_only=True)
    fish_id = fields.Int(allow_none=True)
    waterbody_id = fields.Int(allow_none=True)
    image_url = fields.Str(required=True)
    description = fields.Str(allow_none=True)
    weight = fields.Float(allow_none=True)
    created_at = fields.DateTime(dump_only=True)

class CatchPostListResponseSchema(Schema):
    catch_posts = fields.Nested(CatchPostSchema, many=True)

class ForumTopicSchema(Schema):
    id = fields.Int(dump_only=True)
    author_id = fields.Int(dump_only=True)
    author_username = fields.Str(attribute="author.username", dump_only=True)
    waterbody_id = fields.Int(allow_none=True)
    title = fields.Str(required=True)
    created_at = fields.DateTime(dump_only=True)

class ForumTopicCreateRequestSchema(Schema):
    title = fields.Str(required=True)
    waterbody_id = fields.Int(required=False, allow_none=True)
    content = fields.Str(required=True, description="Текст первого сообщения")

class ForumTopicListResponseSchema(Schema):
    forum_topics = fields.Nested(ForumTopicSchema, many=True)

class ForumMessageSchema(Schema):
    id = fields.Int(dump_only=True)
    topic_id = fields.Int(required=True)
    author_id = fields.Int(dump_only=True)
    author_username = fields.Str(attribute="author.username", dump_only=True)
    content = fields.Str(required=True)
    created_at = fields.DateTime(dump_only=True)

class ForumMessageListResponseSchema(Schema):
    forum_messages = fields.Nested(ForumMessageSchema, many=True)

class WaterbodyReviewSchema(Schema):
    id = fields.Int(dump_only=True)
    user_id = fields.Int(dump_only=True)
    waterbody_id = fields.Int(required=True)
    rating = fields.Int(required=True)
    content = fields.Str(required=True)
    created_at = fields.DateTime(dump_only=True)

class WaterbodyReviewListResponseSchema(Schema):
    waterbody_reviews = fields.Nested(WaterbodyReviewSchema, many=True)

class FavoriteWaterbodySchema(Schema):
    user_id = fields.Int(dump_only=True)
    waterbody_id = fields.Int(required=True)
    saved_at = fields.DateTime(dump_only=True)

class UserInventorySchema(Schema):
    user_id = fields.Int(required=True)
    inventory_id = fields.Int(required=True)
    acquired_at = fields.DateTime(dump_only=True)


class RecommendationRequestSchema(Schema):
    waterbody_id = fields.Int(required=True, description="ID водоема")
    season_id = fields.Int(required=True, description="ID текущего сезона")
    weather_id = fields.Int(required=True, description="ID текущей погоды")
    fish_id = fields.Int(allow_none=True, description="ID целевой рыбы (опционально)")
    user_rod = fields.Str(allow_none=True, description="Выбранная удочка")
    user_lure = fields.Str(allow_none=True, description="Выбранная наживка")
    user_groundbait = fields.Str(allow_none=True, description="Выбранная прикормка")
    user_clothes = fields.Str(allow_none=True, description="Выбранная одежда")

class RecommendationResponseSchema(Schema):
    recommended_fishes = fields.Nested(FishSchema, many=True, description="Рыбы, которые сейчас клюют")
    recommended_inventory = fields.Nested(InventorySchema, many=True, description="Рекомендуемые снасти")
    recommended_lures = fields.Nested(LureSchema, many=True, description="Рекомендуемые приманки")
    recommended_groundbaits = fields.Nested(GroundbaitSchema, many=True, description="Рекомендуемая прикормка")
    advice_text = fields.Str(description="Текстовый совет")
