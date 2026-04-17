import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from "../components/Navbar.jsx";
import api from '../api/api';
import {
    ArrowLeft, MapPin, Droplets, Wind, Thermometer,
    Activity, Fish, Anchor, Navigation, ShieldCheck,
    Sword, Leaf, Crown, Calendar
} from 'lucide-react';


import bgImageSrc from '/src/assets/images/background/lake_bg.jpg';
import fishIconDefault from '../assets/images/fish.jpg'; 

const LakeInfoPage = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const canvasRef = useRef(null);

    const [lake, setLake] = useState(null);
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

    useEffect(() => {
        const fetchLakeData = async () => {
            try {
                setLoading(true);
                // 1. Загружаем данные о водоеме
                const lakeRes = await api.get(`/api/waterbody/${id}`);
                setLake(lakeRes.data.data);

                // 2. Загружаем прогноз погоды
                try {
                    const weatherRes = await api.get(`/api/forecast/waterbody/${id}`);
                    if (weatherRes.data.status === "ok") {
                        setWeather(weatherRes.data.data);
                    }
                } catch (wErr) {
                    console.warn("Прогноз погоды недоступен:", wErr);
                }

            } catch (err) {
                console.error("Ошибка загрузки данных водоема:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLakeData();
    }, [id]);

    // --- АНИМАЦИЯ ФОНА (ПИКСЕЛЬНЫЙ ПАТТЕРН) ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationId;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const drawPixelGrid = () => {
            ctx.fillStyle = '#0f172a'; // Темно-синий фон
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
            const pSize = 4; // Размер "пикселя" сетки
            for (let x = 0; x < canvas.width; x += pSize * 2) {
                for (let y = 0; y < canvas.height; y += pSize * 2) {
                    ctx.fillRect(x, y, pSize, pSize);
                }
            }
        };

        const animate = () => {
            drawPixelGrid();
            // Можно добавить легкое мерцание или просто оставить статику
            animationId = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resize);
        resize();
        animate();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-black text-white font-pixel text-2xl">
                Загрузка данных водоема...
            </div>
        );
    }

    if (!lake) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-black text-white font-pixel">
                <p className="text-2xl mb-4">Водоем не найден</p>
                <button onClick={() => navigate('/water')} className="text-yellow-400 underline">Вернуться к списку</button>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen w-full flex flex-col font-pixel text-black bg-[#FFBB00]/50" style={{
            backgroundImage: `linear-gradient(rgba(181, 199, 124, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(54, 255, 151, 0.02) 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
        }}>
            {/* ШАПКА */}
            <div className="container mx-auto px-[5.5rem] pt-[1.125rem] flex-shrink-0">
                <Navbar />
            </div>

            {/* КНОПКА НАЗАД */}
            <div className="relative flex py-4 items-center justify-center w-full ">
                <button
                    onClick={() => navigate('/water')}
                    className="absolute left-[5.5rem] flex items-center gap-2 text-white hover:text-yellow-400 transition-colors drop-shadow-md text-lg"
                >
                    <ArrowLeft size={24} /> Назад к списку
                </button>
                <div className="relative flex justify-center">
                    <div className="h-12 bg-[rgba(217,217,217,0.7)] border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,0.9)] flex items-center px-4 gap-2 cursor-pointer group hover:bg-white/80 transition-colors">
                            <span className="relative pr-8 text-lg whitespace-nowrap min-w-[140px]">
                                {selectedDate}
                            </span>
                        <Calendar className="absolute right-3 top-2 w-6 h-6 text-black" />
                    </div>
                </div>
            </div>


            {/* ГЛАВНЫЙ КОНТЕНТ */}
            <div className="flex-1 px-[5.5rem] pb-10 w-full max-w-7xl mx-auto overflow-y-auto overflow-x-hidden custom-scrollbar">

                {/* 1. ЗАГОЛОВОК И ПОГОДА */}
                <div className="bg-[#EAD4AA]/80 border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,0.5)] px-4 mb-8 flex flex-col md:flex-row justify-between items-start">
                    <div className="p-6">
                        <h1 className="text-4xl text-[#FFFFB7] drop-shadow-[3px_3px_0_rgba(0,0,0,0.8)] pb-2 tracking-wide uppercase">{lake.name}</h1>
                        <p className="mt-4 text-lg text-white drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)] pb-6 max-w-2xl whitespace-pre-line">
                            {lake.description || "Описание этого прекрасного места скоро появится..."}
                        </p>
                    </div>

                    {/* Блок Погоды */}
                    <div className="bg-[#EAD4AA] px-10 border-4 py-6 md:my-4 border-black min-w-[280px] self-center md:self-start md:mr-4">
                        <h3 className="text-2xl text-black border-b-2 border-black/20 pb-2 mb-4 text-center font-bold">
                            Прогноз погоды
                        </h3>
                        {weather ? (
                            <div className="space-y-4 text-lg">
                                <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-2"><Thermometer size={18}/> Температура:</span>
                                    <span className="font-bold">{weather.current?.temperature_c > 0 ? '+' : ''}{Math.round(weather.current?.temperature_c)}°C</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-2"><Wind size={18}/> Ветер:</span>
                                    <span className="font-bold">{weather.current?.wind_speed_kmh} км/ч</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-2"><Droplets size={18}/> Давление:</span>
                                    <span className="font-bold">{weather.current?.pressure_mmhg} мм</span>
                                </div>
                                <div className="mt-4 border-t-2 border-black/10 text-center pt-4">
                                    <span className="block text-sm uppercase opacity-70">Вероятность осадков:</span>
                                    <span className="text-3xl text-blue-800 font-bold">{weather.daily?.precipitation_probability_max_percent || 0}%</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-10 opacity-50 italic text-sm">Данные о погоде временно недоступны</div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* 2. ЛЕВАЯ КОЛОНКА: ПАСПОРТ И ЛОГИСТИКА */}
                    <div className="space-y-8">
                        {/* ПАСПОРТ ВОДОЕМА */}
                        <div className="bg-[#EAD4AA]/80 border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,1)] p-6">
                            <h2 className="relative mb-4 text-2xl text-center items-center text-[#FFFFB7] drop-shadow-[2px_2px_0_rgba(0,0,0,1)] border-b-4 border-black pb-2  -mx-6 px-6 -mt-6 pt-4 uppercase">
                                <Anchor className="absolute" size={24} /> Паспорт водоема
                            </h2>
                            <ul className="space-y-3 text-lg">
                                <li className="flex justify-between border-b-2 border-[#FFFFB7] pb-1 drop-shadow-[1px_1px_0_rgba(0,0,0,0.8)]">
                                    <span className="text-white">Тип:</span>
                                    <span className="text-base text-white text-right uppercase">{lake.type}</span>
                                </li>
                                <li className="flex justify-between border-b-2 border-[#FFFFB7] pb-1 drop-shadow-[1px_1px_0_rgba(0,0,0,0.8)]">
                                    <span className="text-white">Регион:</span>
                                    <span className="text-base text-white text-right uppercase">{lake.region || "Не указан"}</span>
                                </li>
                                <li className="flex justify-between border-b-2 text-white border-[#FFFFB7] pb-1 drop-shadow-[1px_1px_0_rgba(0,0,0,0.8)]">
                                    <span>Средняя глубина:</span>
                                    <span className="text-base text-right">{lake.avg_depth} м.</span>
                                </li>
                                <li className="flex justify-between border-b-2 border-[#FFFFB7] pb-1 text-white drop-shadow-[1px_1px_0_rgba(0,0,0,0.8)]">
                                    <span>Координаты:</span>
                                    <span className="text-base text-right">{lake.latitude?.toFixed(4)}, {lake.longitude?.toFixed(4)}</span>
                                </li>
                                <li className="flex justify-between border-b-2 border-[#FFFFB7] pb-1 text-white drop-shadow-[1px_1px_0_rgba(0,0,0,0.8)]">
                                    <span>Рейтинг:</span>
                                    <span className="text-base text-right text-yellow-400 font-bold">★ {lake.rating?.toFixed(1) || '0.0'}</span>
                                </li>
                                <li className="flex justify-between border-b-2 border-[#FFFFB7] pb-1 text-white drop-shadow-[1px_1px_0_rgba(0,0,0,0.8)]">
                                    <span>Прозрачность:</span>
                                    <span className="text-base text-right">{lake.clarity || "Неизвестно"}</span>
                                </li>
                                <li className="flex justify-between border-b-2 border-[#FFFFB7] pb-1 text-white drop-shadow-[1px_1px_0_rgba(0,0,0,0.8)]">
                                    <span>Растительность:</span>
                                    <span className="text-base text-right max-w-[50%]">{lake.vegetation || "Средняя"}</span>
                                </li>
                            </ul>
                        </div>

                        {/* ИНФРАСТРУКТУРА */}
                        <div className="bg-[#EAD4AA]/80 border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,1)] p-6">
                            <h2 className="relative mb-4 text-2xl text-center items-center text-[#FFFFB7] drop-shadow-[2px_2px_0_rgba(0,0,0,1)] border-b-4 border-black pb-2 -mx-6 px-6 -mt-6 pt-4 uppercase">
                                <Navigation className="absolute" size={24} /> Логистика
                            </h2>
                            <div className="space-y-4 text-lg">
                                <div>
                                    <span className=" block mb-1">Доступность / Подъезд:</span>
                                    <p className="bg-white/50 p-2 border border-black/20 text-sm">
                                        {lake.accessibility || "Доступно на любом транспорте"}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className=" block mb-1">Лодка:</span>
                                        <p className="font-bold">{lake.boats_allowed ? "Разрешено" : "Запрещено"}</p>
                                    </div>
                                    <div>
                                        <span className=" block mb-1">Стоимость:</span>
                                        <p className={`font-bold ${lake.is_paid ? 'text-red-700' : 'text-green-800'}`}>
                                            {lake.is_paid ? `${lake.price} ₽` : "Бесплатно"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. ПРАВАЯ КОЛОНКА: ВИДЫ РЫБ */}
                    <div className="space-y-8">
                        <div className="bg-[#EAD4AA]/80 border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,1)] p-6 min-h-[300px] flex flex-col">
                            <h2 className="relative mb-4 text-2xl text-center items-center text-[#FFFFB7] drop-shadow-[2px_2px_0_rgba(0,0,0,1)] border-b-4 border-black pb-2 -mx-6 px-6 -mt-6 pt-4 uppercase">
                                <Fish className="absolute" size={24} /> Обитатели
                            </h2>
                            <div className="flex-1 mt-2">
                                {lake.fish_links && lake.fish_links.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        {lake.fish_links.map(link => (
                                            <div key={link.fish.id} className="flex items-center gap-2 bg-black/10 p-2 border border-black/20">
                                                {link.fish.icon_url ? (
                                                    <img src={link.fish.icon_url} className="w-8 h-8 pixelated" alt={link.fish.name} />
                                                ) : (
                                                    <Fish size={20} className="text-blue-900" />
                                                )}
                                                <span className="text-sm truncate">{link.fish.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center italic opacity-60 text-center">
                                        Информация о видовом составе в данном водоеме обновляется...
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* КНОПКА ПОДРОБНОГО ПРОГНОЗА */}
                        <button 
                            onClick={() => navigate('/forecast')}
                            className="w-full bg-yellow-500 hover:bg-yellow-400 border-4 border-black py-6 text-2xl shadow-[8px_8px_0_rgba(0,0,0,1)] active:translate-y-2 active:shadow-none transition-all uppercase"
                        >
                            Открыть график клёва
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LakeInfoPage;
