const fs = require('fs');
let content = fs.readFileSync('backend/app/admin/accessor.py', 'utf8');

// Find the start of the valid code
let startIdx = content.indexOf('import datetime');
if (startIdx === -1) startIdx = content.indexOf('import typing');
if (startIdx === -1) startIdx = content.indexOf('import hashlib');

let validCode = content.slice(startIdx);

// At the end of validCode, there might be the old get_recommendations
let oldFuncStart = validCode.indexOf('    async def get_recommendations(');
if (oldFuncStart !== -1) {
    validCode = validCode.slice(0, oldFuncStart);
}

const newFunc = `    async def get_recommendations(self, waterbody_id: int, season_id: int, weather_id: int, fish_id: int = None, user_rod: str = None, user_lure: str = None, user_groundbait: str = None, user_clothes: str = None):
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

            fs_query = select(FishSeasonLink.fish_id).where(FishSeasonLink.fish_id.in_(fish_ids_in_waterbody), FishSeasonLink.season_id == season_id)
            fs_result = await session.execute(fs_query)
            active_fish_ids = [row[0] for row in fs_result.fetchall()]

            if fish_id and fish_id not in active_fish_ids:
                return {"advice_text": f"По нашей информации, {fish_name} сейчас не клюет в этом водоеме."}

            fishes_query = select(Fish).where(Fish.id.in_(active_fish_ids if not fish_id else [fish_id]))
            fishes_result = await session.execute(fishes_query)
            recommended_fishes = fishes_result.scalars().all()

            # 3. Генерация совета (Ollama)
            import aiohttp
            
            prompt = f"Ты - опытный рыболов-эксперт.\\nПользователь собирается на рыбалку.\\nВодоем: {waterbody_name}.\\nЦелевая рыба: {fish_name}.\\nСнаряжение пользователя:\\nУдочка: {user_rod or 'Не выбрано'}\\nНаживка: {user_lure or 'Не выбрано'}\\nПрикормка: {user_groundbait or 'Не выбрано'}\\nОдежда: {user_clothes or 'Не выбрано'}\\nОцени этот инвентарь (подходит ли для водоема и рыбы) и дай краткий, полезный совет на 2-3 абзаца. Отвечай как профи, без лишних предисловий."
            
            advice_text = "Не удалось получить совет."
            try:
                async with aiohttp.ClientSession() as http_session:
                    async with http_session.post('http://127.0.0.1:11434/api/generate', json={
                        "model": "llama3",
                        "prompt": prompt,
                        "stream": False
                    }, timeout=15) as resp:
                        if resp.status == 200:
                            data = await resp.json()
                            advice_text = data.get("response", "")
                        else:
                            advice_text = f"Анализ снаряжения: {user_rod} / {user_lure}. Желаем удачи на водоеме '{waterbody_name}'! (Ollama недоступна: {resp.status})"
            except Exception as e:
                advice_text = f"Анализ сборки:\\nВы планируете ловить {fish_name} на водоеме '{waterbody_name}'.\\nУдочка: {user_rod or 'Обычная'}\\nНаживка: {user_lure or 'Без наживки'}\\nПрикормка: {user_groundbait or 'Нет'}\\n\\nОтличный выбор! Желаем удачного клева!\\n(Совет: запустите Ollama (модель llama3) локально для интеллектуального анализа вашей сборки)."

            return {
                "advice_text": advice_text,
                "recommended_fishes": recommended_fishes,
                "recommended_inventory": [],
                "recommended_lures": [],
                "recommended_groundbaits": []
            }\n`;

fs.writeFileSync('backend/app/admin/accessor.py', validCode + newFunc);
