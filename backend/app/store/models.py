import datetime
import enum
from typing import List, Optional
from sqlalchemy import Integer, String, Text, ForeignKey, Float, Boolean, DateTime, Time, JSON
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.sql import func

class Base(DeclarativeBase):
    pass

class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"

class InventoryCategory(str, enum.Enum):
    ROD = "удочка"
    JACKET = "куртка"
    HEAD = "головной убор"
    PANTS = "штаны"
    SHOES = "обувь"


class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(default=UserRole.USER, nullable=False)
    is_banned: Mapped[bool] = mapped_column(Boolean, default=False)
    registered_at: Mapped[datetime.datetime] = mapped_column(server_default=func.now())
    
    # ФРОНТЕНД: Аватарка
    avatar_url: Mapped[Optional[str]] = mapped_column(String(255))
    
    # ФРОНТЕНД: Экипировка (Loadout) - во что одет дед
    equipped_rod_id: Mapped[Optional[int]] = mapped_column(ForeignKey("inventory.id"))
    equipped_jacket_id: Mapped[Optional[int]] = mapped_column(ForeignKey("inventory.id"))
    equipped_head_id: Mapped[Optional[int]] = mapped_column(ForeignKey("inventory.id"))
    equipped_pants_id: Mapped[Optional[int]] = mapped_column(ForeignKey("inventory.id"))
    equipped_shoes_id: Mapped[Optional[int]] = mapped_column(ForeignKey("inventory.id"))

    # Связи
    catch_posts: Mapped[List["CatchPost"]] = relationship(back_populates="author", cascade="all, delete-orphan")
    forum_topics: Mapped[List["ForumTopic"]] = relationship(back_populates="author")
    forum_messages: Mapped[List["ForumMessage"]] = relationship(back_populates="author")
    inventory_items: Mapped[List["UserInventory"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    saved_recommendations: Mapped[List["SavedRecommendation"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    post_reactions: Mapped[List["PostReaction"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    post_comments: Mapped[List["PostComment"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class UserInventory(Base):
    """Связь: Какие вещи купил/получил пользователь"""
    __tablename__ = "user_inventory"
    
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    inventory_id: Mapped[int] = mapped_column(ForeignKey("inventory.id"), primary_key=True)
    acquired_at: Mapped[datetime.datetime] = mapped_column(server_default=func.now())
    
    user: Mapped["User"] = relationship(back_populates="inventory_items")
    inventory: Mapped["Inventory"] = relationship()



class FishCategory(Base):
    __tablename__ = "fish_categories"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    fishes: Mapped[List["Fish"]] = relationship(back_populates="category")


class Fish(Base):
    __tablename__ = "fishes"
    id: Mapped[int] = mapped_column(primary_key=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("fish_categories.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    avg_size: Mapped[Optional[float]] = mapped_column(Float)
    max_weight: Mapped[Optional[float]] = mapped_column(Float)
    
    # ФРОНТЕНД: Иконка и редкость
    icon_url: Mapped[Optional[str]] = mapped_column(String(255))
    is_rare: Mapped[bool] = mapped_column(Boolean, default=False)
    
    category: Mapped["FishCategory"] = relationship(back_populates="fishes")
    groundbaits: Mapped[List["Groundbait"]] = relationship(back_populates="fish") 
    waterbody_links: Mapped[List["FishWaterbodyLink"]] = relationship(back_populates="fish")
    season_links: Mapped[List["FishSeasonLink"]] = relationship(back_populates="fish")
    time_links: Mapped[List["FishTimeLink"]] = relationship(back_populates="fish")
    weather_links: Mapped[List["FishWeatherLink"]] = relationship(back_populates="fish")
    lure_links: Mapped[List["FishLureLink"]] = relationship(back_populates="fish")
    inventory_links: Mapped[List["FishInventoryLink"]] = relationship(back_populates="fish")


class Waterbody(Base):
    __tablename__ = "waterbodies"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    type: Mapped[str] = mapped_column(String(50)) 
    avg_depth: Mapped[float] = mapped_column(Float)
    latitude: Mapped[Optional[float]] = mapped_column(Float)
    longitude: Mapped[Optional[float]] = mapped_column(Float)
    
    # ФРОНТЕНД: Картинка и Паспорт водоема
    image_url: Mapped[Optional[str]] = mapped_column(String(255))
    region: Mapped[Optional[str]] = mapped_column(String(100))
    is_paid: Mapped[bool] = mapped_column(Boolean, default=False)
    price: Mapped[Optional[str]] = mapped_column(String(100))
    accessibility: Mapped[Optional[str]] = mapped_column(Text)     # Подъезд
    boats_allowed: Mapped[bool] = mapped_column(Boolean, default=False)
    clarity: Mapped[Optional[str]] = mapped_column(String(50))      # Прозрачность
    vegetation: Mapped[Optional[str]] = mapped_column(String(100))  # Растительность

    spots: Mapped[List["WaterbodySpot"]] = relationship(back_populates="waterbody", cascade="all, delete-orphan")
    fish_links: Mapped[List["FishWaterbodyLink"]] = relationship(back_populates="waterbody")
    forum_topics: Mapped[List["ForumTopic"]] = relationship(back_populates="waterbody", cascade="all, delete-orphan")


class WaterbodySpot(Base):
    __tablename__ = "waterbody_spots"
    id: Mapped[int] = mapped_column(primary_key=True)
    waterbody_id: Mapped[int] = mapped_column(ForeignKey("waterbodies.id"), nullable=False)
    coordinates: Mapped[Optional[str]] = mapped_column(String(100))
    features: Mapped[Optional[str]] = mapped_column(Text) 
    bottom_type: Mapped[Optional[str]] = mapped_column(String(50)) 
    waterbody: Mapped["Waterbody"] = relationship(back_populates="spots")
    

class FishWaterbodyLink(Base):
    __tablename__ = "fish_waterbody_link"
    fish_id: Mapped[int] = mapped_column(ForeignKey("fishes.id"), primary_key=True)
    waterbody_id: Mapped[int] = mapped_column(ForeignKey("waterbodies.id"), primary_key=True)
    population: Mapped[Optional[str]] = mapped_column(String(50)) 
    fish: Mapped["Fish"] = relationship(back_populates="waterbody_links")
    waterbody: Mapped["Waterbody"] = relationship(back_populates="fish_links")


class Season(Base):
    """Сама таблица Сезонов (Зима, Весна и т.д.)"""
    __tablename__ = "seasons"
    id: Mapped[int] = mapped_column(primary_key=True)
    time_of_year: Mapped[str] = mapped_column(String(50)) 
    avg_temperature: Mapped[Optional[float]] = mapped_column(Float) 
    features: Mapped[Optional[str]] = mapped_column(Text) 

    fish_links: Mapped[List["FishSeasonLink"]] = relationship(back_populates="season")

class FishSeasonLink(Base):
    """Связь: Рыба <-> Сезон"""
    __tablename__ = "fish_season_link"
    fish_id: Mapped[int] = mapped_column(ForeignKey("fishes.id"), primary_key=True)
    season_id: Mapped[int] = mapped_column(ForeignKey("seasons.id"), primary_key=True)
    
    activity_level: Mapped[Optional[str]] = mapped_column(String(50))
    habitat_depth: Mapped[Optional[float]] = mapped_column(Float)
    fish: Mapped["Fish"] = relationship(back_populates="season_links")
    season: Mapped["Season"] = relationship(back_populates="fish_links")



class FishingTime(Base):
    __tablename__ = "fishing_times"
    id: Mapped[int] = mapped_column(primary_key=True)
    time_of_day: Mapped[str] = mapped_column(String(50)) 
    start_time: Mapped[Optional[datetime.time]] = mapped_column(Time) 
    end_time: Mapped[Optional[datetime.time]] = mapped_column(Time) 
    fish_links: Mapped[List["FishTimeLink"]] = relationship(back_populates="time")

class FishTimeLink(Base):
    __tablename__ = "fish_time_link"
    fish_id: Mapped[int] = mapped_column(ForeignKey("fishes.id"), primary_key=True)
    time_id: Mapped[int] = mapped_column(ForeignKey("fishing_times.id"), primary_key=True)
    priority: Mapped[Optional[int]] = mapped_column(Integer) 
    fish: Mapped["Fish"] = relationship(back_populates="time_links")
    time: Mapped["FishingTime"] = relationship(back_populates="fish_links")

class WeatherCondition(Base):
    __tablename__ = "weather_conditions"
    id: Mapped[int] = mapped_column(primary_key=True)
    weather_type: Mapped[str] = mapped_column(String(50)) 
    pressure: Mapped[Optional[float]] = mapped_column(Float) 
    recommendations: Mapped[Optional[str]] = mapped_column(Text) 
    fish_links: Mapped[List["FishWeatherLink"]] = relationship(back_populates="weather")

class FishWeatherLink(Base):
    __tablename__ = "fish_weather_link"
    fish_id: Mapped[int] = mapped_column(ForeignKey("fishes.id"), primary_key=True)
    weather_id: Mapped[int] = mapped_column(ForeignKey("weather_conditions.id"), primary_key=True)
    influence_type: Mapped[Optional[str]] = mapped_column(String(100)) 
    fish: Mapped["Fish"] = relationship(back_populates="weather_links")
    weather: Mapped["WeatherCondition"] = relationship(back_populates="fish_links")


class Inventory(Base):
    __tablename__ = "inventory"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    category: Mapped[InventoryCategory] = mapped_column(nullable=False)
    filter_type: Mapped[Optional[str]] = mapped_column(String(50)) # Для фильтров на фронтенде (Спиннинг, Зима и тд)
    price: Mapped[Optional[float]] = mapped_column(Float)
    description: Mapped[Optional[str]] = mapped_column(Text)
    
    image_url: Mapped[Optional[str]] = mapped_column(String(255))
    preview_image_url: Mapped[Optional[str]] = mapped_column(String(255)) # Для наложения на Деда
    specs: Mapped[Optional[dict]] = mapped_column(JSON) # Гибкий JSON: {"length": "2.1m", "test": "10g"}
    
    fish_links: Mapped[List["FishInventoryLink"]] = relationship(back_populates="inventory")

class FishInventoryLink(Base):
    __tablename__ = "fish_inventory_link"
    fish_id: Mapped[int] = mapped_column(ForeignKey("fishes.id"), primary_key=True)
    inventory_id: Mapped[int] = mapped_column(ForeignKey("inventory.id"), primary_key=True)
    is_mandatory: Mapped[bool] = mapped_column(Boolean, default=False) 
    rigging_advice: Mapped[Optional[str]] = mapped_column(Text) 
    fish: Mapped["Fish"] = relationship(back_populates="inventory_links")
    inventory: Mapped["Inventory"] = relationship(back_populates="fish_links")

class Lure(Base):
    __tablename__ = "lures"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    type: Mapped[str] = mapped_column(String(50)) 
    season_use: Mapped[Optional[str]] = mapped_column(String(50)) 
    description: Mapped[Optional[str]] = mapped_column(Text)
    price: Mapped[Optional[float]] = mapped_column(Float) 
    image_url: Mapped[Optional[str]] = mapped_column(String(255)) # ФРОНТЕНД
    fish_links: Mapped[List["FishLureLink"]] = relationship(back_populates="lure")

class FishLureLink(Base):
    __tablename__ = "fish_lure_link"
    fish_id: Mapped[int] = mapped_column(ForeignKey("fishes.id"), primary_key=True)
    lure_id: Mapped[int] = mapped_column(ForeignKey("lures.id"), primary_key=True)
    efficiency: Mapped[Optional[str]] = mapped_column(String(50)) 
    used_color: Mapped[Optional[str]] = mapped_column(String(50)) 
    fish: Mapped["Fish"] = relationship(back_populates="lure_links")
    lure: Mapped["Lure"] = relationship(back_populates="fish_links")

class Groundbait(Base):
    __tablename__ = "groundbaits"
    id: Mapped[int] = mapped_column(primary_key=True)
    fish_id: Mapped[Optional[int]] = mapped_column(ForeignKey("fishes.id")) 
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    composition: Mapped[Optional[str]] = mapped_column(Text) 
    season_use: Mapped[Optional[str]] = mapped_column(String(50)) 
    description: Mapped[Optional[str]] = mapped_column(Text)
    price: Mapped[Optional[float]] = mapped_column(Float) 
    image_url: Mapped[Optional[str]] = mapped_column(String(255)) # ФРОНТЕНД
    fish: Mapped["Fish"] = relationship(back_populates="groundbaits")


class CatchPost(Base):
    __tablename__ = "catch_posts"
    id: Mapped[int] = mapped_column(primary_key=True)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    fish_id: Mapped[Optional[int]] = mapped_column(ForeignKey("fishes.id"))
    waterbody_id: Mapped[Optional[int]] = mapped_column(ForeignKey("waterbodies.id"))
    image_url: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    weight: Mapped[Optional[float]] = mapped_column(Float)
    created_at: Mapped[datetime.datetime] = mapped_column(server_default=func.now())
    
    author: Mapped["User"] = relationship(back_populates="catch_posts")
    reactions: Mapped[List["PostReaction"]] = relationship(back_populates="post", cascade="all, delete-orphan")
    comments: Mapped[List["PostComment"]] = relationship(back_populates="post", cascade="all, delete-orphan")
    fish: Mapped[Optional["Fish"]] = relationship()
    waterbody: Mapped[Optional["Waterbody"]] = relationship()

class ForumTopic(Base):
    __tablename__ = "forum_topics"
    id: Mapped[int] = mapped_column(primary_key=True)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    waterbody_id: Mapped[Optional[int]] = mapped_column(ForeignKey("waterbodies.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(server_default=func.now())
    author: Mapped["User"] = relationship(back_populates="forum_topics")
    messages: Mapped[List["ForumMessage"]] = relationship(back_populates="topic", cascade="all, delete-orphan")
    waterbody: Mapped[Optional["Waterbody"]] = relationship(back_populates="forum_topics")

class ForumMessage(Base):
    __tablename__ = "forum_messages"
    id: Mapped[int] = mapped_column(primary_key=True)
    topic_id: Mapped[int] = mapped_column(ForeignKey("forum_topics.id"), nullable=False)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(server_default=func.now())
    topic: Mapped["ForumTopic"] = relationship(back_populates="messages")
    author: Mapped["User"] = relationship(back_populates="forum_messages")

class FavoriteWaterbody(Base):
    __tablename__ = "favorite_waterbodies"
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    waterbody_id: Mapped[int] = mapped_column(ForeignKey("waterbodies.id"), primary_key=True)
    saved_at: Mapped[datetime.datetime] = mapped_column(server_default=func.now())

class WaterbodyReview(Base):
    __tablename__ = "waterbody_reviews"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    waterbody_id: Mapped[int] = mapped_column(ForeignKey("waterbodies.id"))
    rating: Mapped[int] = mapped_column(Integer) 
    content: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime.datetime] = mapped_column(server_default=func.now())

class PostReaction(Base):
    __tablename__ = "post_reactions"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    post_id: Mapped[int] = mapped_column(ForeignKey("catch_posts.id"), nullable=False)
    reaction_type: Mapped[str] = mapped_column(String(50), default="like")
    user: Mapped["User"] = relationship(back_populates="post_reactions")
    post: Mapped["CatchPost"] = relationship(back_populates="reactions")

class PostComment(Base):
    __tablename__ = "post_comments"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    post_id: Mapped[int] = mapped_column(ForeignKey("catch_posts.id"), nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(server_default=func.now())
    user: Mapped["User"] = relationship(back_populates="post_comments")
    post: Mapped["CatchPost"] = relationship(back_populates="comments")

class SavedRecommendation(Base):
    __tablename__ = "saved_recommendations"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    fish_id: Mapped[Optional[int]] = mapped_column(ForeignKey("fishes.id"))
    waterbody_id: Mapped[Optional[int]] = mapped_column(ForeignKey("waterbodies.id"))
    rod_id: Mapped[Optional[int]] = mapped_column(ForeignKey("inventory.id"))
    jacket_id: Mapped[Optional[int]] = mapped_column(ForeignKey("inventory.id"))
    pants_id: Mapped[Optional[int]] = mapped_column(ForeignKey("inventory.id"))
    shoes_id: Mapped[Optional[int]] = mapped_column(ForeignKey("inventory.id"))
    head_id: Mapped[Optional[int]] = mapped_column(ForeignKey("inventory.id"))
    lure_id: Mapped[Optional[int]] = mapped_column(ForeignKey("lures.id"))
    groundbait_id: Mapped[Optional[int]] = mapped_column(ForeignKey("groundbaits.id"))
    advice: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime.datetime] = mapped_column(server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="saved_recommendations")
    fish: Mapped[Optional["Fish"]] = relationship()
    waterbody: Mapped[Optional["Waterbody"]] = relationship()
    rod: Mapped[Optional["Inventory"]] = relationship(foreign_keys=[rod_id])
    jacket: Mapped[Optional["Inventory"]] = relationship(foreign_keys=[jacket_id])
    pants: Mapped[Optional["Inventory"]] = relationship(foreign_keys=[pants_id])
    shoes: Mapped[Optional["Inventory"]] = relationship(foreign_keys=[shoes_id])
    head: Mapped[Optional["Inventory"]] = relationship(foreign_keys=[head_id])
    lure: Mapped[Optional["Lure"]] = relationship()
    groundbait: Mapped[Optional["Groundbait"]] = relationship()