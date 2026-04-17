import datetime

from aiohttp import payload
import bcrypt
import jwt
from sqlalchemy import delete, select, update, func
from sqlalchemy.orm import selectinload

from app.store.base_accessor import BaseAccessor
from app.store.models import Fish, FishCategory, User, UserRole, Waterbody, Season, WeatherCondition, FishingTime, Inventory, Lure, Groundbait, FishWaterbodyLink, FishSeasonLink, FishWeatherLink, FishLureLink, FishInventoryLink, CatchPost, ForumTopic, ForumMessage, WaterbodyReview, FavoriteWaterbody, UserInventory
SECRET_KEY = "12345678"

class AdminAccessor(BaseAccessor):
    async def register_user(self, username: str, password: str, email: str, role: UserRole) -> dict:
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
        async with self.app.database.get_session() as session:
            result = await session.execute(select(User).where(User.username == username))
            if result.scalar_one_or_none():
                raise ValueError("Пользователь с таким логином уже существует")
            
            result_email = await session.execute(select(User).where(User.email == email))
            if result_email.scalar_one_or_none():
                raise ValueError("Пользователь с такой почтой уже существует")
            
            new_user = User(
                username = username,
                email = email,
                password_hash = hashed_password,
                role = role
            )
            session.add(new_user)
            await session.commit()

            return {
                "id": new_user.id,
                "username": new_user.username,
                "email": new_user.email,
                "role": new_user.role.value
            }

    async def login_user(self, email: str, password: str) -> dict:
        async with self.app.database.get_session() as session:
            result = await session.execute(select(User).where(User.email == email))
            user = result.scalar_one_or_none()

            if not user:
                raise ValueError("User are not")
            
            if not bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8')):
                return None
            
            if user.is_banned:
                raise ValueError("Yoy are banned")
            
            payload = {
                "user_id": user.id,
                "role": user.role.value if hasattr(user.role, 'value') else str(user.role),
                "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)
            }
            token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
            return {"token": token}

    async def list_user(self) -> list:
        async with self.app.database.get_session() as session:
            result = await session.execute(select(User))
            users = result.scalars().all()

            return[{
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "role": u.role.value,
                "is_banned": u.is_banned
            } for u in users]
        
    async def update_ban_status(self, user_id: int, is_banned: bool) -> dict:
        async with self.app.database.get_session() as session:
            result = await session.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()

            if not user:
                raise ValueError("Пользователь не найден")
            
            user.is_banned = is_banned
            await session.commit()
            return {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role.value,
                "is_banned": user.is_banned
            }
    async def add_fish_categories(self, name: str, description: str) -> dict:
        async with self.app.database.get_session() as session:
            result = await session.execute(select(FishCategory).where(FishCategory.name == name))
            fish_cat = result.scalars().all()

            if fish_cat:
                raise ValueError("Категория уже существует")
            
            new_categories = FishCategory(
                name = name,
                description = description
            )
            session.add(new_categories)
            await session.commit()

            return {"id": new_categories.id, "name": new_categories.name, "description": new_categories.description}
        
    async def create_fish(self, data: dict) -> dict:
        async with self.app.database.get_session() as session:
            result = await session.execute(select(Fish).where(Fish.name == data["name"]))
            fish_res = result.scalar_one_or_none()

            if fish_res:
                raise ValueError("Рыба уже существует")
            
            fish = Fish(**data)
            session.add(fish)
            await session.commit()
            return {
                "id": fish.id,
                "category_id": fish.category_id,
                "name": fish.name,
                "description": fish.description,
                "avg_size": fish.avg_size,
                "max_weight": fish.max_weight,
                "is_rare": fish.is_rare
            }
    async def get_fish_category_list(self) -> list:
        async with self.app.database.get_session() as session:
            query = select(FishCategory)
            result = await session.execute(query)
            fish_cat = result.scalars().all()
            return[{
                "id": f.id,
                "name": f.name,
                "description": f.description
            } for f in fish_cat]
        
    async def get_fishes_list(self) -> list:
        async with self.app.database.get_session() as session:
            query = select(Fish).options(selectinload(Fish.category))
            result = await session.execute(query)
            fishes = result.scalars().all()
            return fishes
        
    async def delete_fish(self, fish_id: int) -> None:
        async with self.app.database.get_session() as session:
            query = await session.execute(select(Fish).where(Fish.id == fish_id))
            fish = query.scalar_one_or_none()
            
            if not fish:
                raise ValueError("Не найдена рыба с таким id")
            
            await session.execute(delete(Fish).where(Fish.id == fish_id))
            
            await session.commit()
            
    async def get_waterbody_list(self, region: str = None, fish_id: int = None) -> list:
        async with self.app.database.get_session() as session:
            query = select(Waterbody).options(
                selectinload(Waterbody.spots),
                selectinload(Waterbody.fish_links).selectinload(FishWaterbodyLink.fish).selectinload(Fish.category)
            )
            
            if region:
                query = query.where(Waterbody.region == region)
            
            if fish_id:
                query = query.join(FishWaterbodyLink).where(FishWaterbodyLink.fish_id == fish_id)

            result = await session.execute(query)
            waterbodies = result.scalars().all()
            
            # Calculate ratings
            for wb in waterbodies:
                rating_query = select(func.avg(WaterbodyReview.rating)).where(WaterbodyReview.waterbody_id == wb.id)
                rating_res = await session.execute(rating_query)
                wb.rating = rating_res.scalar() or 0.0

            return waterbodies

    async def get_waterbody(self, waterbody_id: int):
        async with self.app.database.get_session() as session:
            query = select(Waterbody).where(Waterbody.id == waterbody_id).options(
                selectinload(Waterbody.spots),
                selectinload(Waterbody.fish_links).selectinload(FishWaterbodyLink.fish).selectinload(Fish.category)
            )
            result = await session.execute(query)
            wb = result.scalar_one_or_none()
            if wb:
                rating_query = select(func.avg(WaterbodyReview.rating)).where(WaterbodyReview.waterbody_id == wb.id)
                rating_res = await session.execute(rating_query)
                wb.rating = rating_res.scalar() or 0.0
            return wb        
    async def create_waterbody(self, data: dict):
        async with self.app.database.get_session() as session:
            new_waterbody = Waterbody(**data)
            session.add(new_waterbody)
            await session.commit()
            await session.refresh(new_waterbody)
            return await self.get_waterbody(new_waterbody.id)
        
    async def delete_waterbody(self, waterbody_id: int) -> None:
        async with self.app.database.get_session() as session:
            query = await session.execute(select(Waterbody).where(Waterbody.id == waterbody_id))
            waterbody = query.scalar_one_or_none()
            
            if not waterbody:
                raise ValueError("Не найден водоем с таким id")
            
            await session.execute(delete(Waterbody).where(Waterbody.id == waterbody_id))
            
            await session.commit()

    async def update_waterbody(self, waterbody_id: int, data: dict):
        if not data:
            return await self.get_waterbody(waterbody_id)
            
        async with self.app.database.get_session() as session:
            stmt = update(Waterbody).where(Waterbody.id == waterbody_id).values(**data)
            await session.execute(stmt)
            await session.commit()
            
            return await self.get_waterbody(waterbody_id)
    
    
    # --- СЕЗОНЫ ---
    async def get_seasons_list(self) -> list:
        async with self.app.database.get_session() as session:
            res = await session.execute(select(Season))
            return res.scalars().all()

    async def create_season(self, data: dict):
        async with self.app.database.get_session() as session:
            item = Season(**data)
            session.add(item)
            await session.commit()
            await session.refresh(item)
            return item

    async def update_season(self, item_id: int, data: dict):
        async with self.app.database.get_session() as session:
            await session.execute(update(Season).where(Season.id == item_id).values(**data))
            await session.commit()
            res = await session.execute(select(Season).where(Season.id == item_id))
            return res.scalar_one_or_none()

    async def delete_season(self, item_id: int):
        async with self.app.database.get_session() as session:
            await session.execute(delete(Season).where(Season.id == item_id))
            await session.commit()

    # --- ПОГОДА ---
    async def get_weather_list(self) -> list:
        async with self.app.database.get_session() as session:
            res = await session.execute(select(WeatherCondition))
            return res.scalars().all()

    async def create_weather(self, data: dict):
        async with self.app.database.get_session() as session:
            item = WeatherCondition(**data)
            session.add(item)
            await session.commit()
            await session.refresh(item)
            return item

    async def update_weather(self, item_id: int, data: dict):
        async with self.app.database.get_session() as session:
            await session.execute(update(WeatherCondition).where(WeatherCondition.id == item_id).values(**data))
            await session.commit()
            res = await session.execute(select(WeatherCondition).where(WeatherCondition.id == item_id))
            return res.scalar_one_or_none()

    async def delete_weather(self, item_id: int):
        async with self.app.database.get_session() as session:
            await session.execute(delete(WeatherCondition).where(WeatherCondition.id == item_id))
            await session.commit()

    # --- ВРЕМЯ ЛОВА ---
    async def get_fishing_time_list(self) -> list:
        async with self.app.database.get_session() as session:
            res = await session.execute(select(FishingTime))
            return res.scalars().all()

    async def create_fishing_time(self, data: dict):
        async with self.app.database.get_session() as session:
            item = FishingTime(**data)
            session.add(item)
            await session.commit()
            await session.refresh(item)
            return item

    async def update_fishing_time(self, item_id: int, data: dict):
        async with self.app.database.get_session() as session:
            await session.execute(update(FishingTime).where(FishingTime.id == item_id).values(**data))
            await session.commit()
            res = await session.execute(select(FishingTime).where(FishingTime.id == item_id))
            return res.scalar_one_or_none()

    async def delete_fishing_time(self, item_id: int):
        async with self.app.database.get_session() as session:
            await session.execute(delete(FishingTime).where(FishingTime.id == item_id))
            await session.commit()

    # --- ИНВЕНТАРЬ ---
    async def get_inventory_list(self) -> list:
        async with self.app.database.get_session() as session:
            res = await session.execute(select(Inventory))
            return res.scalars().all()

    async def create_inventory(self, data: dict):
        async with self.app.database.get_session() as session:
            item = Inventory(**data)
            session.add(item)
            await session.commit()
            await session.refresh(item)
            return item

    async def update_inventory(self, item_id: int, data: dict):
        async with self.app.database.get_session() as session:
            await session.execute(update(Inventory).where(Inventory.id == item_id).values(**data))
            await session.commit()
            res = await session.execute(select(Inventory).where(Inventory.id == item_id))
            return res.scalar_one_or_none()

    async def delete_inventory(self, item_id: int):
        async with self.app.database.get_session() as session:
            await session.execute(delete(Inventory).where(Inventory.id == item_id))
            await session.commit()

    # --- ПРИМАНКИ ---
    async def get_lure_list(self) -> list:
        async with self.app.database.get_session() as session:
            res = await session.execute(select(Lure))
            return res.scalars().all()

    async def create_lure(self, data: dict):
        async with self.app.database.get_session() as session:
            item = Lure(**data)
            session.add(item)
            await session.commit()
            await session.refresh(item)
            return item

    async def update_lure(self, item_id: int, data: dict):
        async with self.app.database.get_session() as session:
            await session.execute(update(Lure).where(Lure.id == item_id).values(**data))
            await session.commit()
            res = await session.execute(select(Lure).where(Lure.id == item_id))
            return res.scalar_one_or_none()

    async def delete_lure(self, item_id: int):
        async with self.app.database.get_session() as session:
            await session.execute(delete(Lure).where(Lure.id == item_id))
            await session.commit()

    # --- ПРИКОРМКА ---
    async def get_groundbait_list(self) -> list:
        async with self.app.database.get_session() as session:
            res = await session.execute(select(Groundbait))
            return res.scalars().all()

    async def create_groundbait(self, data: dict):
        async with self.app.database.get_session() as session:
            item = Groundbait(**data)
            session.add(item)
            await session.commit()
            await session.refresh(item)
            return item

    async def update_groundbait(self, item_id: int, data: dict):
        async with self.app.database.get_session() as session:
            await session.execute(update(Groundbait).where(Groundbait.id == item_id).values(**data))
            await session.commit()
            res = await session.execute(select(Groundbait).where(Groundbait.id == item_id))
            return res.scalar_one_or_none()

    async def delete_groundbait(self, item_id: int):
        async with self.app.database.get_session() as session:
            await session.execute(delete(Groundbait).where(Groundbait.id == item_id))
            await session.commit()

    # --- СВЯЗИ: FISH <-> WATERBODY ---
    async def add_fish_waterbody_link(self, data: dict):
        async with self.app.database.get_session() as session:
            link = FishWaterbodyLink(**data)
            session.add(link)
            await session.commit()
            return data

    async def delete_fish_waterbody_link(self, fish_id: int, waterbody_id: int):
        async with self.app.database.get_session() as session:
            await session.execute(delete(FishWaterbodyLink).where(FishWaterbodyLink.fish_id == fish_id, FishWaterbodyLink.waterbody_id == waterbody_id))
            await session.commit()

    # --- СВЯЗИ: FISH <-> SEASON ---
    async def add_fish_season_link(self, data: dict):
        async with self.app.database.get_session() as session:
            link = FishSeasonLink(**data)
            session.add(link)
            await session.commit()
            return data

    async def delete_fish_season_link(self, fish_id: int, season_id: int):
        async with self.app.database.get_session() as session:
            await session.execute(delete(FishSeasonLink).where(FishSeasonLink.fish_id == fish_id, FishSeasonLink.season_id == season_id))
            await session.commit()

    # --- СВЯЗИ: FISH <-> WEATHER ---
    async def add_fish_weather_link(self, data: dict):
        async with self.app.database.get_session() as session:
            link = FishWeatherLink(**data)
            session.add(link)
            await session.commit()
            return data

    async def delete_fish_weather_link(self, fish_id: int, weather_id: int):
        async with self.app.database.get_session() as session:
            await session.execute(delete(FishWeatherLink).where(FishWeatherLink.fish_id == fish_id, FishWeatherLink.weather_id == weather_id))
            await session.commit()

    # --- СВЯЗИ: FISH <-> LURE ---
    async def add_fish_lure_link(self, data: dict):
        async with self.app.database.get_session() as session:
            link = FishLureLink(**data)
            session.add(link)
            await session.commit()
            return data

    async def delete_fish_lure_link(self, fish_id: int, lure_id: int):
        async with self.app.database.get_session() as session:
            await session.execute(delete(FishLureLink).where(FishLureLink.fish_id == fish_id, FishLureLink.lure_id == lure_id))
            await session.commit()

    # --- СВЯЗИ: FISH <-> INVENTORY ---
    async def add_fish_inventory_link(self, data: dict):
        async with self.app.database.get_session() as session:
            link = FishInventoryLink(**data)
            session.add(link)
            await session.commit()
            return data

    async def delete_fish_inventory_link(self, fish_id: int, inventory_id: int):
        async with self.app.database.get_session() as session:
            await session.execute(delete(FishInventoryLink).where(FishInventoryLink.fish_id == fish_id, FishInventoryLink.inventory_id == inventory_id))
            await session.commit()

    # --- CATCH POST ---
    async def get_catch_post_list(self) -> list:
        async with self.app.database.get_session() as session:
            res = await session.execute(select(CatchPost))
            return res.scalars().all()

    async def create_catch_post(self, data: dict):
        async with self.app.database.get_session() as session:
            item = CatchPost(**data)
            session.add(item)
            await session.commit()
            await session.refresh(item)
            return item

    async def update_catch_post(self, item_id: int, data: dict):
        async with self.app.database.get_session() as session:
            await session.execute(update(CatchPost).where(CatchPost.id == item_id).values(**data))
            await session.commit()
            res = await session.execute(select(CatchPost).where(CatchPost.id == item_id))
            return res.scalar_one_or_none()

    async def delete_catch_post(self, item_id: int):
        async with self.app.database.get_session() as session:
            await session.execute(delete(CatchPost).where(CatchPost.id == item_id))
            await session.commit()

    # --- FORUM TOPIC ---
    async def get_forum_topic_list(self) -> list:
        async with self.app.database.get_session() as session:
            res = await session.execute(select(ForumTopic))
            return res.scalars().all()

    async def create_forum_topic(self, data: dict):
        async with self.app.database.get_session() as session:
            item = ForumTopic(**data)
            session.add(item)
            await session.commit()
            await session.refresh(item)
            return item

    async def update_forum_topic(self, item_id: int, data: dict):
        async with self.app.database.get_session() as session:
            await session.execute(update(ForumTopic).where(ForumTopic.id == item_id).values(**data))
            await session.commit()
            res = await session.execute(select(ForumTopic).where(ForumTopic.id == item_id))
            return res.scalar_one_or_none()

    async def delete_forum_topic(self, item_id: int):
        async with self.app.database.get_session() as session:
            await session.execute(delete(ForumTopic).where(ForumTopic.id == item_id))
            await session.commit()

    # --- FORUM MESSAGE ---
    async def get_forum_message_list(self) -> list:
        async with self.app.database.get_session() as session:
            res = await session.execute(select(ForumMessage))
            return res.scalars().all()

    async def create_forum_message(self, data: dict):
        async with self.app.database.get_session() as session:
            item = ForumMessage(**data)
            session.add(item)
            await session.commit()
            await session.refresh(item)
            return item

    async def update_forum_message(self, item_id: int, data: dict):
        async with self.app.database.get_session() as session:
            await session.execute(update(ForumMessage).where(ForumMessage.id == item_id).values(**data))
            await session.commit()
            res = await session.execute(select(ForumMessage).where(ForumMessage.id == item_id))
            return res.scalar_one_or_none()

    async def delete_forum_message(self, item_id: int):
        async with self.app.database.get_session() as session:
            await session.execute(delete(ForumMessage).where(ForumMessage.id == item_id))
            await session.commit()

    # --- WATERBODY REVIEW ---
    async def get_waterbody_review_list(self) -> list:
        async with self.app.database.get_session() as session:
            res = await session.execute(select(WaterbodyReview))
            return res.scalars().all()

    async def create_waterbody_review(self, data: dict):
        async with self.app.database.get_session() as session:
            item = WaterbodyReview(**data)
            session.add(item)
            await session.commit()
            await session.refresh(item)
            return item

    async def update_waterbody_review(self, item_id: int, data: dict):
        async with self.app.database.get_session() as session:
            await session.execute(update(WaterbodyReview).where(WaterbodyReview.id == item_id).values(**data))
            await session.commit()
            res = await session.execute(select(WaterbodyReview).where(WaterbodyReview.id == item_id))
            return res.scalar_one_or_none()

    async def delete_waterbody_review(self, item_id: int):
        async with self.app.database.get_session() as session:
            await session.execute(delete(WaterbodyReview).where(WaterbodyReview.id == item_id))
            await session.commit()

    # --- FAVORITE WATERBODY ---
    async def add_favorite_waterbody(self, data: dict):
        async with self.app.database.get_session() as session:
            item = FavoriteWaterbody(**data)
            session.add(item)
            await session.commit()
            await session.refresh(item)
            return item

    async def delete_favorite_waterbody(self, user_id: int, waterbody_id: int):
        async with self.app.database.get_session() as session:
            await session.execute(delete(FavoriteWaterbody).where(FavoriteWaterbody.user_id == user_id, FavoriteWaterbody.waterbody_id == waterbody_id))
            await session.commit()

    # --- USER INVENTORY ---
    async def add_user_inventory(self, data: dict):
        async with self.app.database.get_session() as session:
            item = UserInventory(**data)
            session.add(item)
            await session.commit()
            await session.refresh(item)
            return item

    async def delete_user_inventory(self, user_id: int, inventory_id: int):
        async with self.app.database.get_session() as session:
            await session.execute(delete(UserInventory).where(UserInventory.user_id == user_id, UserInventory.inventory_id == inventory_id))
            await session.commit()

    # --- RECOMMENDATIONS (CORE) ---
    async def get_recommendations(self, waterbody_id: int, season_id: int, weather_id: int, fish_id: int = None, user_rod: str = None, user_lure: str = None, user_groundbait: str = None, user_clothes: str = None):
        async with self.app.database.get_session() as session:
            # 1. Получение информации
            waterbody = await session.get(Waterbody, waterbody_id)
            waterbody_name = waterbody.name if waterbody else "Неизвестный водоем"
            
            fish_name = "любую рыбу"
            if fish_id:
                fish = await session.get(Fish, fish_id)
                if fish:
                    fish_name = fish.name

            # 2. Проверки наличия рыбы
            fw_query = select(FishWaterbodyLink.fish_id).where(FishWaterbodyLink.waterbody_id == waterbody_id)
            fw_result = await session.execute(fw_query)
            fish_ids_in_waterbody = [row[0] for row in fw_result.fetchall()]

            if not fish_ids_in_waterbody:
                return {"advice_text": "В этом водоеме пока нет информации о рыбе."}

            # Фильтр по сезону делаем мягким
            fs_query = select(FishSeasonLink.fish_id).where(
                FishSeasonLink.fish_id.in_(fish_ids_in_waterbody), 
                FishSeasonLink.season_id == season_id
            )
            fs_result = await session.execute(fs_query)
            active_fish_ids = [row[0] for row in fs_result.fetchall()]

            # Если конкретная рыба выбрана, но её нет в сезоне - просто предупреждаем в тексте, но не блокируем
            target_fish_ids = active_fish_ids if not fish_id else [fish_id]
            
            fishes_query = select(Fish).where(Fish.id.in_(target_fish_ids)).options(
                selectinload(Fish.category),
                selectinload(Fish.inventory_links).selectinload(FishInventoryLink.inventory),
                selectinload(Fish.lure_links).selectinload(FishLureLink.lure),
                selectinload(Fish.groundbaits)
            )
            fishes_result = await session.execute(fishes_query)
            recommended_fishes = fishes_result.scalars().all()

            recommended_inventory = []
            recommended_lures = []
            recommended_groundbaits = []

            for f in recommended_fishes:
                recommended_inventory.extend([link.inventory for link in f.inventory_links])
                recommended_lures.extend([link.lure for link in f.lure_links])
                recommended_groundbaits.extend(f.groundbaits)

            # Deduplicate
            recommended_inventory = list({item.id: item for item in recommended_inventory}.values())
            recommended_lures = list({item.id: item for item in recommended_lures}.values())
            recommended_groundbaits = list({item.id: item for item in recommended_groundbaits}.values())

            # 3. Генерация совета (Gemini Custom Gateway)
            import aiohttp
            
            api_key = "jameshypebitch"
            advice_text = "Не удалось получить совет."
            
            prompt = f"Ты - опытный рыболов-эксперт. Общайся на скуфском рыболовском сленге как будто с дедом. Используй двусвязные неуместные несуществующие составные слова (например аналогичнодерябаю, консенсуснопримечающееся). Пользователь собирается на рыбалку. Водоем: {waterbody_name}. Целевая рыба: {fish_name}. Снаряжение пользователя: Удочка: {user_rod or 'Не выбрано'}, Наживка: {user_lure or 'Не выбрано'}, Прикормка: {user_groundbait or 'Не выбрано'}, Одежда: {user_clothes or 'Не выбрано'}. Оцени этот инвентарь и дай краткий, полезный совет на 2-3 абзаца. Отвечай на русском языке, как профи, без лишних предисловий."
            
            url = f"https://gateway.ai.home.vadimrm.com/gemini/v1beta/models/gemini-3-flash-preview:generateContent?key={api_key}"
            payload = {
                "contents": [{
                    "parts": [{"text": prompt}]
                }]
            }
            try:
                headers = {
                    "Content-Type": "application/json",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                }
                async with aiohttp.ClientSession() as http_session:
                    async with http_session.post(url, json=payload, headers=headers, timeout=30, allow_redirects=False) as resp:
                        if resp.status == 200:
                            res_data = await resp.json()
                            advice_text = res_data['candidates'][0]['content']['parts'][0]['text']
                        else:
                            advice_text = f"Анализ снаряжения временно недоступен (API Error {resp.status})."
            except Exception as e:
                advice_text = f"Произошла ошибка при обращении к эксперту: {str(e)}"

            return {
                "advice_text": advice_text,
                "recommended_fishes": recommended_fishes,
                "recommended_inventory": recommended_inventory,
                "recommended_lures": recommended_lures,
                "recommended_groundbaits": recommended_groundbaits
            }
