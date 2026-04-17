import json
import random

random.seed(42)

data = {
    "fish_categories": [
        {"id": 1, "name": "Хищная", "description": "Рыбы, питающиеся преимущественно другими рыбами и животными."},
        {"id": 2, "name": "Мирная", "description": "Растительноядные и бентосоядные рыбы, не проявляющие хищнических наклонностей."},
        {"id": 3, "name": "Всеядная", "description": "Рыбы со смешанным типом питания, в зависимости от сезона."}
    ],
    "fishes": [
        {"id": 1, "category_id": 1, "name": "Щука", "description": "Зубастый хищник, предпочитает засады в зарослях.", "avg_size": 50.0, "max_weight": 15.0, "is_rare": False, "icon_url": ""},
        {"id": 2, "category_id": 1, "name": "Судак", "description": "Клыкастый хищник, стайная рыба, обитает на глубине и течении.", "avg_size": 40.0, "max_weight": 10.0, "is_rare": False, "icon_url": ""},
        {"id": 3, "category_id": 1, "name": "Окунь", "description": "Полосатый разбойник, самый распространенный хищник.", "avg_size": 20.0, "max_weight": 2.5, "is_rare": False, "icon_url": ""},
        {"id": 4, "category_id": 1, "name": "Жерех", "description": "Беззубый хищник карповых пород, охотится на поверхности.", "avg_size": 45.0, "max_weight": 8.0, "is_rare": True, "icon_url": ""},
        {"id": 5, "category_id": 1, "name": "Форель", "description": "Красная рыба, активно заселяется на платниках.", "avg_size": 35.0, "max_weight": 5.0, "is_rare": False, "icon_url": ""},
        {"id": 6, "category_id": 2, "name": "Лещ", "description": "Донная рыба с высоким телом, любит глубокие ямы.", "avg_size": 35.0, "max_weight": 5.0, "is_rare": False, "icon_url": ""},
        {"id": 7, "category_id": 2, "name": "Плотва", "description": "Шустрая серебристая рыбка с красными плавниками.", "avg_size": 15.0, "max_weight": 1.2, "is_rare": False, "icon_url": ""},
        {"id": 8, "category_id": 2, "name": "Карась", "description": "Неприхотливая рыба, выживает даже в болотах.", "avg_size": 20.0, "max_weight": 3.0, "is_rare": False, "icon_url": ""},
        {"id": 9, "category_id": 2, "name": "Карп", "description": "Сильная и умная рыба, достигает огромных размеров.", "avg_size": 45.0, "max_weight": 30.0, "is_rare": False, "icon_url": ""},
        {"id": 10, "category_id": 2, "name": "Линь", "description": "Осторожная рыба, покрытая густой слизью.", "avg_size": 25.0, "max_weight": 4.0, "is_rare": True, "icon_url": ""},
        {"id": 11, "category_id": 2, "name": "Уклейка", "description": "Мелкая рыбка, держится у самой поверхности.", "avg_size": 12.0, "max_weight": 0.1, "is_rare": False, "icon_url": ""},
        {"id": 12, "category_id": 1, "name": "Сом", "description": "Гигантский усатый хищник, царь речных омутов.", "avg_size": 100.0, "max_weight": 90.0, "is_rare": True, "icon_url": ""},
        {"id": 13, "category_id": 3, "name": "Голавль", "description": "Сильная речная рыба, любит быстрое течение.", "avg_size": 30.0, "max_weight": 5.0, "is_rare": False, "icon_url": ""},
        {"id": 14, "category_id": 3, "name": "Язь", "description": "Красивая рыба с золотистым отливом, всеядна.", "avg_size": 35.0, "max_weight": 4.0, "is_rare": False, "icon_url": ""},
        {"id": 15, "category_id": 3, "name": "Ротан", "description": "Агрессивная сорная рыба, поедающая икру.", "avg_size": 10.0, "max_weight": 0.5, "is_rare": False, "icon_url": ""}
    ],
    "waterbodies": [
        {"id": 1, "name": "Река Ока", "description": "Крупная река с сильным течением и перепадами глубин.", "type": "река", "avg_depth": 4.5, "latitude": 54.833, "longitude": 37.950, "is_paid": False, "price": None, "accessibility": "Грунтовые дороги, в дождь нужен полный привод.", "boats_allowed": True, "clarity": "Средняя", "vegetation": "Тростник, водоросли на мелководье", "image_url": ""},
        {"id": 2, "name": "Река Москва", "description": "Главная водная артерия региона.", "type": "река", "avg_depth": 3.0, "latitude": 55.751, "longitude": 37.618, "is_paid": False, "price": None, "accessibility": "Асфальт почти везде.", "boats_allowed": True, "clarity": "Низкая", "vegetation": "Редкая", "image_url": ""},
        {"id": 3, "name": "Река Пахра", "description": "Живописная река на юге Подмосковья.", "type": "река", "avg_depth": 2.5, "latitude": 55.433, "longitude": 37.550, "is_paid": False, "price": None, "accessibility": "Хороший подъезд к большинству мест.", "boats_allowed": False, "clarity": "Средняя", "vegetation": "Густая", "image_url": ""},
        {"id": 4, "name": "Истринское водохранилище", "description": "Популярное место для зимней и летней рыбалки.", "type": "озеро", "avg_depth": 5.5, "latitude": 56.050, "longitude": 36.816, "is_paid": False, "price": None, "accessibility": "Асфальт до баз отдыха.", "boats_allowed": True, "clarity": "Высокая", "vegetation": "Умеренная", "image_url": ""},
        {"id": 5, "name": "Можайское водохранилище", "description": "Глубоководный водоем с трофейным судаком.", "type": "озеро", "avg_depth": 7.0, "latitude": 55.583, "longitude": 35.850, "is_paid": False, "price": None, "accessibility": "Доступно круглогодично.", "boats_allowed": True, "clarity": "Высокая", "vegetation": "Слабая", "image_url": ""},
        {"id": 6, "name": "Озеро Сенеж", "description": "Крупнейшее озеро Подмосковья.", "type": "озеро", "avg_depth": 3.5, "latitude": 56.200, "longitude": 36.983, "is_paid": False, "price": None, "accessibility": "Отличный подъезд, есть парковки.", "boats_allowed": True, "clarity": "Средняя", "vegetation": "Сильная", "image_url": ""},
        {"id": 7, "name": "Бисерово озеро", "description": "Реликтовое озеро на востоке области.", "type": "озеро", "avg_depth": 2.5, "latitude": 55.766, "longitude": 38.116, "is_paid": False, "price": None, "accessibility": "Асфальт.", "boats_allowed": False, "clarity": "Средняя", "vegetation": "Густая", "image_url": ""},
        {"id": 8, "name": "Борисовские пруды", "description": "Крупнейший пруд внутри МКАД.", "type": "пруд", "avg_depth": 2.0, "latitude": 55.633, "longitude": 37.716, "is_paid": False, "price": None, "accessibility": "В черте города, метро.", "boats_allowed": False, "clarity": "Низкая", "vegetation": "Средняя", "image_url": ""},
        {"id": 9, "name": "Пруд Серебряно-Виноградный", "description": "Исторический пруд в Измайлово.", "type": "пруд", "avg_depth": 2.5, "latitude": 55.791, "longitude": 37.766, "is_paid": False, "price": None, "accessibility": "Парковая зона.", "boats_allowed": False, "clarity": "Средняя", "vegetation": "Средняя", "image_url": ""},
        {"id": 10, "name": "Шатурские болота", "description": "Сложный рельеф, торфяники, много карася и ротана.", "type": "болото", "avg_depth": 1.5, "latitude": 55.583, "longitude": 39.550, "is_paid": False, "price": None, "accessibility": "Только пешком или на спецтехнике.", "boats_allowed": True, "clarity": "Темная вода", "vegetation": "Очень густая", "image_url": ""},
        {"id": 11, "name": "Строгинский карьер", "description": "Глубокий песчаный карьер с прозрачной водой.", "type": "карьер", "avg_depth": 10.0, "latitude": 55.800, "longitude": 37.416, "is_paid": False, "price": None, "accessibility": "Метро Строгино.", "boats_allowed": False, "clarity": "Очень высокая", "vegetation": "Слабая", "image_url": ""},
        {"id": 12, "name": "Люберецкий карьер", "description": "Популярное место отдыха и рыбалки.", "type": "карьер", "avg_depth": 8.0, "latitude": 55.633, "longitude": 37.866, "is_paid": False, "price": None, "accessibility": "Грунтовые дороги от шоссе.", "boats_allowed": True, "clarity": "Высокая", "vegetation": "Слабая", "image_url": ""},
        {"id": 13, "name": "КРХ 'Белая Дача'", "description": "Элитный платник с постоянным зарыблением.", "type": "платник", "avg_depth": 3.0, "latitude": 55.650, "longitude": 37.850, "is_paid": True, "price": 3000.0, "accessibility": "Асфальт, парковка, мостки.", "boats_allowed": False, "clarity": "Средняя", "vegetation": "Очищено", "image_url": ""},
        {"id": 14, "name": "РК 'Савельево'", "description": "Известный рыболовный клуб, много форели.", "type": "платник", "avg_depth": 4.0, "latitude": 56.116, "longitude": 37.150, "is_paid": True, "price": 2500.0, "accessibility": "Асфальт, парковка.", "boats_allowed": False, "clarity": "Высокая", "vegetation": "Слабая", "image_url": ""},
        {"id": 15, "name": "Рыбхоз 'Осенка'", "description": "Огромные нагульные пруды с трофейным карпом.", "type": "платник", "avg_depth": 2.5, "latitude": 55.133, "longitude": 38.566, "is_paid": True, "price": 2000.0, "accessibility": "Хорошая грунтовка.", "boats_allowed": False, "clarity": "Средняя", "vegetation": "Средняя", "image_url": ""}
    ],
    "seasons": [
        {"id": 1, "time_of_year": "Весна", "avg_temperature": 10.0, "features": "Нерестовый запрет, активный клев белой рыбы перед нерестом."},
        {"id": 2, "time_of_year": "Лето", "avg_temperature": 22.0, "features": "Цветение воды, смещение клева на утренние и ночные часы."},
        {"id": 3, "time_of_year": "Осень", "avg_temperature": 8.0, "features": "Осенний жор хищника, прозрачная вода."},
        {"id": 4, "time_of_year": "Зима", "avg_temperature": -10.0, "features": "Ледостав, ловля на мормышку и жерлицы."}
    ],
    "fishing_times": [
        {"id": 1, "time_of_day": "Утро", "start_time": "04:00:00", "end_time": "10:00:00"},
        {"id": 2, "time_of_day": "День", "start_time": "10:00:00", "end_time": "17:00:00"},
        {"id": 3, "time_of_day": "Вечер", "start_time": "17:00:00", "end_time": "23:00:00"},
        {"id": 4, "time_of_day": "Ночь", "start_time": "23:00:00", "end_time": "04:00:00"}
    ],
    "weather_conditions": [
        {"id": 1, "weather_type": "Ясно", "pressure": 760.0, "recommendations": "Хорошо для теплолюбивых рыб (карп, карась). Хищник может уйти на глубину."},
        {"id": 2, "weather_type": "Пасмурно", "pressure": 745.0, "recommendations": "Отличная погода для ловли щуки и окуня в течение всего дня."},
        {"id": 3, "weather_type": "Переменная облачность", "pressure": 750.0, "recommendations": "Универсальная погода, стабильный клев."},
        {"id": 4, "weather_type": "Мелкий дождь", "pressure": 740.0, "recommendations": "Вода обогащается кислородом, активизируется лещ и плотва."},
        {"id": 5, "weather_type": "Ливень и гроза", "pressure": 735.0, "recommendations": "Рыбалка опасна. Клев прекращается, но перед грозой возможен жор."},
        {"id": 6, "weather_type": "Снег", "pressure": 755.0, "recommendations": "Снижение активности, лучше работают яркие мормышки."},
        {"id": 7, "weather_type": "Шквалистый ветер", "pressure": 730.0, "recommendations": "Тяжело забросить снасть. Ищите подветренные берега."},
        {"id": 8, "weather_type": "Штиль", "pressure": 765.0, "recommendations": "Рыба пуглива. Нужна тонкая снасть и дальний заброс."}
    ],
    "inventory": [
        {"id": 1, "name": "Спиннинг Shimano Catana 240M", "category": "удочка", "price": 5500.0, "description": "Классический надежный спиннинг.", "specs": {"length": "2.4m", "test": "10-30g", "action": "fast"}, "image_url": "", "preview_image_url": ""},
        {"id": 2, "name": "Фидер Волжанка Оптима", "category": "удочка", "price": 4800.0, "description": "Популярный фидер для рек и озер.", "specs": {"length": "3.6m", "test": "up to 90g"}, "image_url": "", "preview_image_url": ""},
        {"id": 3, "name": "Маховое удилище Kaida 6м", "category": "удочка", "price": 2500.0, "description": "Легкая поплавочная удочка.", "specs": {"length": "6.0m", "weight": "250g"}, "image_url": "", "preview_image_url": ""},
        {"id": 4, "name": "Зимняя удочка Salmo", "category": "удочка", "price": 800.0, "description": "Удочка с кивком для мормышки.", "specs": {"length": "0.3m"}, "image_url": "", "preview_image_url": ""},
        {"id": 5, "name": "Куртка Norfin Discovery", "category": "куртка", "price": 18000.0, "description": "Теплая зимняя куртка (до -35).", "specs": {"size": "XL", "temp": "-35C"}, "image_url": "", "preview_image_url": ""},
        {"id": 6, "name": "Ветровка Remington", "category": "куртка", "price": 6000.0, "description": "Непромокаемая летняя штормовка.", "specs": {"size": "L", "waterproof": "10000mm"}, "image_url": "", "preview_image_url": ""},
        {"id": 7, "name": "Кепка Shimano", "category": "головной убор", "price": 1500.0, "description": "Дышащая кепка от солнца.", "specs": {"color": "black"}, "image_url": "", "preview_image_url": ""},
        {"id": 8, "name": "Шапка-ушанка Norfin", "category": "головной убор", "price": 2200.0, "description": "Теплая шапка с мехом.", "specs": {"color": "grey"}, "image_url": "", "preview_image_url": ""},
        {"id": 9, "name": "Вейдерсы Finntrail", "category": "штаны", "price": 22000.0, "description": "Мембранные забродники.", "specs": {"layers": 4}, "image_url": "", "preview_image_url": ""},
        {"id": 10, "name": "Сапоги ЭВА Torvi", "category": "обувь", "price": 3000.0, "description": "Легкие теплые сапоги для зимы.", "specs": {"temp": "-45C"}, "image_url": "", "preview_image_url": ""}
    ],
    "lures": [
        {"id": 1, "name": "ZipBaits Orbit 110 SP", "type": "воблер", "season_use": "Лето, Осень", "description": "Легендарный воблер для твичинга щуки.", "price": 2200.0, "image_url": ""},
        {"id": 2, "name": "Jackall Chubby 38", "type": "воблер", "season_use": "Весна, Лето", "description": "Лучший кренк на голавля и язя.", "price": 1300.0, "image_url": ""},
        {"id": 3, "name": "Mepps Aglia Long #3", "type": "блесна", "season_use": "Весна, Лето", "description": "Классическая вертушка.", "price": 450.0, "image_url": ""},
        {"id": 4, "name": "Kuusamo Rasanen", "type": "блесна", "season_use": "Осень", "description": "Уловистая финская колебалка.", "price": 750.0, "image_url": ""},
        {"id": 5, "name": "Keitech Swing Impact 3", "type": "джиг", "season_use": "Все сезоны", "description": "Съедобный силикон на судака и окуня.", "price": 600.0, "image_url": ""},
        {"id": 6, "name": "Твистер Relax 2", "type": "джиг", "season_use": "Все сезоны", "description": "Дешевая и рабочая приманка.", "price": 250.0, "image_url": ""},
        {"id": 7, "name": "Мандула 3 секции", "type": "джиг", "season_use": "Осень, Зима (открытая вода)", "description": "Пенополиуретановая приманка для судака.", "price": 200.0, "image_url": ""},
        {"id": 8, "name": "Yo-Zuri 3D Popper", "type": "воблер", "season_use": "Лето", "description": "Поверхностная приманка для заросших жабовников.", "price": 1100.0, "image_url": ""},
        {"id": 9, "name": "Балансир Rapala Jigging Rap", "type": "зимняя", "season_use": "Зима", "description": "Для подледного лова окуня и щуки.", "price": 800.0, "image_url": ""},
        {"id": 10, "name": "Мормышка Уралка Вольфрам", "type": "зимняя", "season_use": "Зима", "description": "Тяжелая мормышка для глухозимья.", "price": 150.0, "image_url": ""}
    ],
    "groundbaits": [
        {"id": 1, "fish_id": 6, "name": "Dunaev Premium Лещ", "composition": "Сухарь, бисквит, кориандр", "season_use": "Весна, Лето", "description": "Тяжелая крупнофракционная прикормка.", "price": 200.0, "image_url": ""},
        {"id": 2, "fish_id": 7, "name": "Sensas 3000 Плотва", "composition": "Мелкий помол, конопля, шоколад", "season_use": "Лето", "description": "Создает активный столб мути.", "price": 450.0, "image_url": ""},
        {"id": 3, "fish_id": 9, "name": "Traper Карп-Карась Чеснок", "composition": "Кукуруза, пеллетс, ароматика", "season_use": "Лето", "description": "Резкий запах, отлично работает в жару.", "price": 300.0, "image_url": ""},
        {"id": 4, "fish_id": 8, "name": "Minenko Универсальная", "composition": "Злаки, жмых", "season_use": "Весна, Лето, Осень", "description": "Отличная база для любых условий.", "price": 180.0, "image_url": ""},
        {"id": 5, "fish_id": 7, "name": "Dunaev Ready Зима Анис", "composition": "Увлажненная смесь, мотыль", "season_use": "Зима", "description": "Не замерзает на морозе.", "price": 220.0, "image_url": ""}
    ]
}

# 10. fish_waterbody_links (30 items)
fw_links = []
populations = ["Высокая", "Средняя", "Низкая"]
for f_id in range(1, 16):
    w_ids = random.sample(range(1, 16), random.randint(2, 4))
    # Special: Форель (5) mostly in platniks (13, 14, 15)
    if f_id == 5:
        w_ids = [13, 14, 15]
    for w in w_ids:
        fw_links.append({"fish_id": f_id, "waterbody_id": w, "population": random.choice(populations)})

data["fish_waterbody_links"] = fw_links

# 11. fish_season_links (20+ items)
fs_links = []
act = ["Жор", "Средняя", "Вялая"]
for f_id in range(1, 16):
    s_ids = random.sample(range(1, 5), random.randint(2, 4))
    for s in s_ids:
        fs_links.append({"fish_id": f_id, "season_id": s, "activity_level": random.choice(act), "habitat_depth": round(random.uniform(1.0, 10.0), 1)})
data["fish_season_links"] = fs_links

# 12. fish_time_links (20+ items)
ft_links = []
for f_id in range(1, 16):
    t_ids = random.sample(range(1, 5), random.randint(1, 3))
    for t in t_ids:
        ft_links.append({"fish_id": f_id, "time_id": t, "priority": random.randint(1, 10)})
data["fish_time_links"] = ft_links

# 13. fish_weather_links (20+ items)
fw_weather = []
inf = ["Позитивное", "Негативное", "Нейтральное"]
for f_id in range(1, 16):
    w_ids = random.sample(range(1, 9), random.randint(2, 4))
    for w in w_ids:
        fw_weather.append({"fish_id": f_id, "weather_id": w, "influence_type": random.choice(inf)})
data["fish_weather_links"] = fw_weather

# 14. fish_lure_links (20+ items, only predators 1, 2, 3, 4, 5, 12)
fl_links = []
eff = ["Отличная", "Хорошая"]
colors = ["Кислотный", "Натуральный", "Машинное масло", "Серебро", "Золото"]
predators = [1, 2, 3, 4, 5, 12]
for p in predators:
    lures = random.sample(range(1, 11), random.randint(3, 5))
    for l in lures:
        fl_links.append({"fish_id": p, "lure_id": l, "efficiency": random.choice(eff), "used_color": random.choice(colors)})
data["fish_lure_links"] = fl_links

# 15. fish_inventory_links (15+ items)
fi_links = []
rods = [1, 2, 3, 4] # inventory IDs of rods
advices = ["Использовать поводок", "Тонкая леска 0.1mm", "Крепкий флюорокарбон", "Шоклидер обязателен"]
for f_id in range(1, 16):
    r_id = random.choice(rods)
    if f_id in predators:
        r_id = 1 # Spinning
    elif f_id in [6, 8, 9]:
        r_id = 2 # Feeder
    fi_links.append({"fish_id": f_id, "inventory_id": r_id, "is_mandatory": True, "rigging_advice": random.choice(advices)})
    
data["fish_inventory_links"] = fi_links

with open('seed.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print("File seed.json generated.")
