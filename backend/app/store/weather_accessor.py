import aiohttp
import datetime
from app.store.base_accessor import BaseAccessor

class WeatherAccessor(BaseAccessor):
    async def get_forecast(self, lat: float, lon: float) -> dict:
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": lat,
            "longitude": lon,
            "current": "temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,precipitation",
            "daily": "temperature_2m_max,temperature_2m_min,precipitation_probability_max",
            "timezone": "Europe/Moscow",
            "forecast_days": 1
        }
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params) as resp:
                if resp.status != 200:
                    return {"error": "Не удалось получить данные о погоде"}
                data = await resp.json()

        current = data.get("current", {})
        daily = data.get("daily", {})

        pressure_hpa = current.get("surface_pressure", 0)
        pressure_mmhg = round(pressure_hpa * 0.750062) if pressure_hpa else None

        return {
            "current": {
                "temperature_c": current.get("temperature_2m"),
                "humidity_percent": current.get("relative_humidity_2m"),
                "pressure_mmhg": pressure_mmhg,
                "wind_speed_kmh": current.get("wind_speed_10m"),
                "precipitation_mm": current.get("precipitation")
            },
            "daily": {
                "temp_max_c": daily.get("temperature_2m_max", [None])[0] if daily.get("temperature_2m_max") else None,
                "temp_min_c": daily.get("temperature_2m_min", [None])[0] if daily.get("temperature_2m_min") else None,
                "precipitation_probability_max_percent": daily.get("precipitation_probability_max", [None])[0] if daily.get("precipitation_probability_max") else None
            }
        }

    def _get_moon_phase(self, date_obj: datetime.date) -> tuple[str, float]:
        known_new_moon = datetime.date(2024, 1, 11)
        days_since = (date_obj - known_new_moon).days
        cycle_length = 29.53058868
        phase = days_since % cycle_length
        
        if phase < 1 or phase > 28.5:
            return "Новолуние", -20
        elif 1 <= phase < 14:
            return "Растущая", 0
        elif 14 <= phase < 16:
            return "Полнолуние", -20
        else:
            return "Убывающая", 0

    def _get_wind_direction_str(self, degrees: float) -> str:
        if degrees is None:
            return ""
        if degrees > 315 or degrees <= 45:
            return "С"
        elif degrees > 45 and degrees <= 135:
            return "В"
        elif degrees > 135 and degrees <= 225:
            return "Ю"
        else:
            return "З"

    async def get_fishing_forecast(self, lat: float, lon: float, date_str: str) -> dict:
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": lat,
            "longitude": lon,
            "hourly": "temperature_2m,wind_speed_10m,wind_direction_10m,surface_pressure,cloud_cover",
            "timezone": "Europe/Moscow",
            "start_date": date_str,
            "end_date": date_str
        }
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params) as resp:
                if resp.status != 200:
                    return {"error": "Не удалось получить данные о погоде"}
                data = await resp.json()

        hourly = data.get("hourly", {})
        times = hourly.get("time", [])
        temps = hourly.get("temperature_2m",[])
        winds = hourly.get("wind_speed_10m",[])
        wind_dirs = hourly.get("wind_direction_10m", [])
        pressures = hourly.get("surface_pressure",[])
        clouds = hourly.get("cloud_cover",[])
        
        if not times:
            return {"error": "Нет данных"}
            
        date_obj = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
        moon_phase_str, moon_modifier = self._get_moon_phase(date_obj)
        # Смягчаем штраф за луну (вместо -20 делаем -10 в функции _get_moon_phase, или делим тут на 2)
        moon_modifier = moon_modifier / 2 

        valid_pressures =[p for p in pressures if p is not None]
        pressure_drop = False
        if valid_pressures:
            max_p = max(valid_pressures)
            min_p = min(valid_pressures)
            if (max_p - min_p) > 5: # Увеличили порог до 5 гПа
                pressure_drop = True

        target_hours =[0, 4, 8, 12, 16, 20, 23]
        chart_data =[]
        summary_wind = ""
        summary_temp = ""

        for idx, t in enumerate(times):
            dt = datetime.datetime.fromisoformat(t)
            h = dt.hour
            
            if h not in target_hours:
                if h == 23 and 23 in target_hours:
                    pass
                else:
                    continue

            # БАЗОВЫЙ ШАНС (Повысили с 50 до 55)
            score = 55 
            
            if pressure_drop:
                score -= 15 # Штраф 15%, а не обнуление!
                
            # Время суток
            if h in (4, 5, 6, 7, 8):
                score += 25
            elif h in (18, 19, 20, 21):
                score += 25
            elif h in (0, 23):
                score -= 10
            elif h == 12:
                c = clouds[idx] if clouds[idx] is not None else 0
                if c < 30:
                    score -= 10 # Жарко и солнечно днем - небольшой минус

            # Ветер
            wind_speed_kmh = winds[idx] if winds[idx] is not None else 0
            wind_speed_ms = wind_speed_kmh / 3.6
            wind_dir = wind_dirs[idx] if wind_dirs[idx] is not None else 0
            
            if wind_speed_ms > 7:
                score -= 15 # Сильный ветер - штраф 15% (было 30)
                
            dir_str = self._get_wind_direction_str(wind_dir)
            if dir_str in ("С", "В", "С-В", "С-З"):
                score -= 10
            elif dir_str in ("Ю", "З", "Ю-В", "Ю-З"):
                score += 10
                
            # Добавляем влияние луны
            score += moon_modifier
            
            # Ограничиваем от 10% до 100% (график никогда не будет на абсолютном нуле)
            score = max(10, min(100, int(score))) 
            
            time_str = dt.strftime("%H:%M")
            if h == 23:
                time_str = "23:59"
                
            chart_data.append({"time": time_str, "score": score})
            
            if h == 12:
                summary_wind = f"{dir_str}, {round(wind_speed_ms)} м/с"
                temp = temps[idx] if temps[idx] is not None else 0
                summary_temp = f"+{round(temp)}°C" if temp > 0 else f"{round(temp)}°C"

        advice = "Хороший день для рыбалки!"
        if pressure_drop:
            advice = "Давление скачет, рыба может быть капризной."
        elif max([d["score"] for d in chart_data]) > 80:
            advice = "Отличный клёв сегодня, готовьте снасти!"
        elif moon_modifier < 0:
            advice = f"Из-за фазы луны ({moon_phase_str}) активность рыбы слегка снижена."
            
        return {
            "chartData": chart_data,
            "weatherSummary": {
                "wind": summary_wind or "Н/Д",
                "temperature": summary_temp or "Н/Д",
                "moonPhase": moon_phase_str
            },
            "advice": advice
        }
