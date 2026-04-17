import json
import random

with open('seed.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 1. Привязываем инвентарь к локальным файлам фронтенда
inventory_mapping = {
    1: "/src/assets/images/spin_noo.png",         # Спиннинг Shimano
    2: "/src/assets/images/red_spin.png",         # Фидер
    3: "/src/assets/images/spin_noo.png",         # Маховая
    4: "/src/assets/images/red_spin.png",         # Зимняя
    5: "/src/assets/images/tulup1.png",           # Куртка Norfin
    6: "/src/assets/images/result_green_jacket.png", # Ветровка
    7: "",                                        # Кепка (нет макета)
    8: "",                                        # Шапка (нет макета)
    9: "/src/assets/images/green_pants1.png",     # Вейдерсы
    10: "/src/assets/images/brown_boots1.png"     # Сапоги
}

for item in data['inventory']:
    if item['id'] in inventory_mapping and inventory_mapping[item['id']]:
        item['preview_url'] = inventory_mapping[item['id']]
        item['image_url'] = inventory_mapping[item['id']]

# 2. Прямые ссылки на фото водоемов (Wikipedia Commons)
waterbody_urls = [
    "https://upload.wikimedia.org/wikipedia/commons/2/23/Oka_River_near_Ryazan.jpg", # Ока
    "https://upload.wikimedia.org/wikipedia/commons/c/cd/Moscow_River_near_Strogino.jpg", # Москва
    "https://upload.wikimedia.org/wikipedia/commons/0/07/Pakhra_River.jpg", # Пахра
    "https://upload.wikimedia.org/wikipedia/commons/b/b3/Istra_Reservoir.jpg", # Истринское
    "https://upload.wikimedia.org/wikipedia/commons/1/15/Mozhaysk_reservoir.jpg", # Можайское
    "https://upload.wikimedia.org/wikipedia/commons/a/a2/Senezh_Lake.jpg" # Сенеж
]

for i, wb in enumerate(data['waterbodies']):
    # Берем циклом ссылки на реки и озера
    wb['source_image_url'] = waterbody_urls[i % len(waterbody_urls)]

# Добавляем прямые ссылки для существующих наживок и прикормок
fallback_lure_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Fishing_lure_1.jpg/800px-Fishing_lure_1.jpg"
fallback_bait_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Groundbait.jpg/800px-Groundbait.jpg"

for item in data['lures']:
    item['source_image_url'] = fallback_lure_url
for item in data['groundbaits']:
    item['source_image_url'] = fallback_bait_url

# 3. Добавляем 15 новых наживок
lure_brands = ["Rapala X-Rap", "Mepps Aglia", "Blue Fox Vibrax", "Keitech Easy Shiner", "Jackall Magallon", "Megabass Vision", "Kuusamo Professor", "Lucky John Tioga", "Daiwa Steez", "Shimano Exsence"]
lure_types = ["воблер", "блесна", "джиг", "поппер"]
start_lure_id = max(l['id'] for l in data['lures']) + 1

for i in range(15):
    data['lures'].append({
        "id": start_lure_id + i,
        "name": f"{random.choice(lure_brands)} {random.randint(5, 15)}g",
        "type": random.choice(lure_types),
        "season_use": random.choice(["Весна, Лето", "Лето, Осень", "Все сезоны"]),
        "description": "Отличная реалистичная приманка для активного хищника.",
        "price": float(random.randint(400, 2500)),
        "source_image_url": fallback_lure_url,
        "image_url": ""
    })

# 4. Добавляем 15 новых прикормок
bait_brands = ["Sensas 3000", "Dunaev Premium", "Traper Secret", "Minenko Pro Sport", "VDE Turbo", "Greenfishing Salapin"]
fishes_for_bait = [6, 7, 8, 9] # Лещ, Плотва, Карась, Карп
start_bait_id = max(b['id'] for b in data['groundbaits']) + 1

for i in range(15):
    data['groundbaits'].append({
        "id": start_bait_id + i,
        "fish_id": random.choice(fishes_for_bait),
        "name": f"{random.choice(bait_brands)} {random.choice(['Фидер', 'Лещ', 'Плотва', 'Карп'])}",
        "composition": "Секретный микс злаков, бисквита и ароматизаторов",
        "season_use": random.choice(["Весна, Лето", "Лето", "Все сезоны"]),
        "description": "Эффективная прикормка с мощным ароматом для привлечения рыбы с дальних дистанций.",
        "price": float(random.randint(150, 600)),
        "source_image_url": fallback_bait_url,
        "image_url": ""
    })

with open('seed.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Seed data successfully updated with new items and image source URLs.")
