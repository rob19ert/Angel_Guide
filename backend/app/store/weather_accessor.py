import aiohttp
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
        
        # Перевод давления из hPa (гектопаскали) в привычные мм рт. ст. (1 hPa ≈ 0.750062 mmHg)
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
