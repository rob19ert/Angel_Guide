import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from "../components/Navbar.jsx";
import api from '../api/api';
import {
    ArrowLeft, Droplets, Wind, Thermometer,
    Activity, Fish, Anchor, Navigation, Calendar
} from 'lucide-react';

import bgImageSrc from '../assets/images/background/gray.jpg';

const LakeInfoPage = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const [lake, setLake] = useState(null);
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

    useEffect(() => {
        const fetchLakeData = async () => {
            try {
                setLoading(true);
                const lakeRes = await api.get(`/api/waterbody/${id}`);
                setLake(lakeRes.data.data);
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

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationId;

        const img = new Image();
        img.src = bgImageSrc;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            draw();
        };

        const draw = () => {
            if (!img.complete || img.naturalWidth === 0) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            ctx.imageSmoothingEnabled = false;
            ctx.mozImageSmoothingEnabled = false;
            ctx.webkitImageSmoothingEnabled = false;
            ctx.msImageSmoothingEnabled = false;

            const canvasAspect = canvas.width / canvas.height;
            const imgAspect = img.naturalWidth / img.naturalHeight;
            let drawW, drawH, drawX, drawY;

            if (canvasAspect > imgAspect) {
                drawW = canvas.width;
                drawH = canvas.width / imgAspect;
                drawX = 0;
                drawY = (canvas.height - drawH) / 2;
            } else {
                drawH = canvas.height;
                drawW = canvas.height * imgAspect;
                drawX = (canvas.width - drawW) / 2;
                drawY = 0;
            }

            ctx.drawImage(img, drawX, drawY, drawW, drawH);
        };

        const animate = () => {
            draw();
            animationId = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resize);
        
        img.onload = () => {
            resize();
            animate();
        };

        if (img.complete) {
            resize();
            animate();
        }

        return () => {
            if (animationId) cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
        };
    }, [loading]);

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-zinc-900 text-white font-pixel text-xl md:text-2xl">
                Загрузка данных...
            </div>
        );
    }

    if (!lake) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-zinc-900 text-white font-pixel">
                <p className="text-xl md:text-2xl mb-6">Водоем не найден</p>
                <button 
                    onClick={() => navigate('/water')} 
                    className="bg-white text-black border-4 border-black px-6 py-3 font-bold hover:bg-slate-200 transition-colors shadow-[4px_4px_0_#000]"
                >
                    Вернуться к списку
                </button>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen w-full flex flex-col font-pixel text-black overflow-hidden">
            
            {/* ФОНОВЫЙ КАНВАС */}
            <canvas 
                ref={canvasRef} 
                className="fixed inset-0 -z-10 w-full h-full"
                style={{ imageRendering: 'pixelated' }}
            />

            
            <div className="w-full flex-shrink-0 z-20 relative bg-zinc-900/40 backdrop-blur-sm border-b-[3px] border-black pb-2 md:pb-0 md:bg-transparent md:backdrop-blur-none md:border-none">
                <div className="container mx-auto px-4 md:px-8 lg:px-[5.5rem] pt-[1.125rem]">
                    <Navbar />
                </div>
            </div>

            
            <div className="w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-[5.5rem] py-4 md:py-6 flex flex-col sm:flex-row justify-between items-center gap-4 z-10 relative flex-shrink-0">
                <button
                    onClick={() => navigate('/water')}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 text-zinc-900 bg-slate-50/70 border-[3px] border-black px-5 py-2.5 shadow-[4px_4px_0_#000] hover:bg-white hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#000] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all text-sm md:text-base font-bold uppercase"
                >
                    <ArrowLeft size={20} /> Назад
                </button>
                <div className="w-full sm:w-auto flex items-center justify-center gap-3 bg-slate-50/70 border-[3px] border-black px-5 py-2.5 shadow-[4px_4px_0_#000] text-zinc-900 font-bold text-sm md:text-base">
                    <span>{selectedDate}</span>
                </div>
            </div>

            
            <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-[5.5rem] pb-12 z-10 relative flex flex-col gap-6 md:gap-8 overflow-y-auto custom-scrollbar">
                
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                    <div className="lg:col-span-2 bg-slate-50/70 border-[3px] md:border-4 border-black shadow-[4px_4px_0_#000] md:shadow-[6px_6px_0_#000] p-6 md:p-8 flex flex-col justify-center">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold uppercase text-black mb-4 break-words">
                            {lake.name}
                        </h1>
                        <p className="text-zinc-700 text-sm md:text-base leading-relaxed whitespace-pre-line max-w-3xl">
                            {lake.description || "Описание этого прекрасного места скоро появится..."}
                        </p>
                    </div>
                    
                    {/* Прогноз погоды */}
                    <div className="bg-slate-50/70 border-[3px] md:border-4 border-black shadow-[4px_4px_0_#000] md:shadow-[6px_6px_0_#000] p-6 md:p-8 flex flex-col">
                        <h3 className="text-xl md:text-2xl font-bold uppercase border-b-[3px] border-black pb-3 mb-5 text-center flex justify-center items-center gap-2">
                            Прогноз
                        </h3>
                        {weather ? (
                            <div className="flex flex-col gap-1">
                                <div className="flex justify-between items-center py-2 border-b-2 border-zinc-200 gap-2">
                                    <span className="flex items-center gap-2 text-zinc-600 text-sm md:text-base"><Thermometer size={18}/> Температура:</span>
                                    <span className="font-bold text-black text-sm md:text-base">{weather.current?.temperature_c > 0 ? '+' : ''}{Math.round(weather.current?.temperature_c)}°C</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b-2 border-zinc-200 gap-2">
                                    <span className="flex items-center gap-2 text-zinc-600 text-sm md:text-base"><Wind size={18}/> Ветер:</span>
                                    <span className="font-bold text-black text-sm md:text-base">{weather.current?.wind_speed_kmh} км/ч</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b-2 border-zinc-200 gap-2">
                                    <span className="flex items-center gap-2 text-zinc-600 text-sm md:text-base"><Droplets size={18}/> Давление:</span>
                                    <span className="font-bold text-black text-sm md:text-base">{weather.current?.pressure_mmhg} мм</span>
                                </div>
                                <div className="mt-4 pt-4 border-t-[3px] border-black flex flex-col items-center justify-center">
                                    <span className="text-xs md:text-sm uppercase text-zinc-600 mb-1">Осадки max:</span>
                                    <span className="text-3xl md:text-4xl text-blue-600 font-bold">{weather.daily?.precipitation_probability_max_percent || 0}%</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center italic text-zinc-500 text-sm text-center py-6">
                                Данные недоступны
                            </div>
                        )}
                    </div>
                </div>

                {/* СЕКЦИЯ 2: ПАСПОРТ, ЛОГИСТИКА, ОБИТАТЕЛИ */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                    
                    {/* ЛЕВАЯ КОЛОНКА */}
                    <div className="flex flex-col gap-6 md:gap-8">
                        {/* Паспорт водоема */}
                        <div className="bg-slate-50/70 border-[3px] md:border-4 border-black shadow-[4px_4px_0_#000] md:shadow-[6px_6px_0_#000] p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold uppercase flex items-center gap-3 border-b-[3px] border-black pb-3 mb-5 text-black">
                                <Anchor size={24} className="text-zinc-800" /> Паспорт
                            </h2>
                            <ul className="flex flex-col">
                                <li className="flex justify-between items-center py-2 md:py-3 border-b-2 border-zinc-200 gap-4">
                                    <span className="text-zinc-600 text-sm md:text-base">Тип:</span>
                                    <span className="text-black font-bold text-sm md:text-base text-right uppercase break-words">{lake.type}</span>
                                </li>
                                <li className="flex justify-between items-center py-2 md:py-3 border-b-2 border-zinc-200 gap-4">
                                    <span className="text-zinc-600 text-sm md:text-base">Регион:</span>
                                    <span className="text-black font-bold text-sm md:text-base text-right uppercase break-words">{lake.region || "Не указан"}</span>
                                </li>
                                <li className="flex justify-between items-center py-2 md:py-3 border-b-2 border-zinc-200 gap-4">
                                    <span className="text-zinc-600 text-sm md:text-base">Средняя глубина:</span>
                                    <span className="text-black font-bold text-sm md:text-base text-right">{lake.avg_depth} м.</span>
                                </li>
                                <li className="flex justify-between items-center py-2 md:py-3 border-b-2 border-zinc-200 gap-4">
                                    <span className="text-zinc-600 text-sm md:text-base">Координаты:</span>
                                    <span className="text-black font-bold text-sm md:text-base text-right tabular-nums">{lake.latitude?.toFixed(4)}, {lake.longitude?.toFixed(4)}</span>
                                </li>
                                <li className="flex justify-between items-center py-2 md:py-3 border-b-2 border-zinc-200 gap-4">
                                    <span className="text-zinc-600 text-sm md:text-base">Рейтинг:</span>
                                    <span className="text-amber-500 font-bold text-base md:text-lg text-right drop-shadow-[1px_1px_0_rgba(0,0,0,0.8)]">★ {lake.rating?.toFixed(1) || '0.0'}</span>
                                </li>
                                <li className="flex justify-between items-center py-2 md:py-3 border-b-2 border-zinc-200 gap-4">
                                    <span className="text-zinc-600 text-sm md:text-base">Прозрачность:</span>
                                    <span className="text-black font-bold text-sm md:text-base text-right break-words">{lake.clarity || "Неизвестно"}</span>
                                </li>
                                <li className="flex justify-between items-center py-2 md:py-3 gap-4">
                                    <span className="text-zinc-600 text-sm md:text-base">Растительность:</span>
                                    <span className="text-black font-bold text-sm md:text-base text-right break-words">{lake.vegetation || "Средняя"}</span>
                                </li>
                            </ul>
                        </div>

                        {/* Логистика */}
                        <div className="bg-slate-50/70 border-[3px] md:border-4 border-black shadow-[4px_4px_0_#000] md:shadow-[6px_6px_0_#000] p-6 md:p-8">
                            <h2 className="text-xl md:text-2xl font-bold uppercase flex items-center gap-3 border-b-[3px] border-black pb-3 mb-5 text-black">
                                <Navigation size={24} className="text-zinc-800" /> Логистика
                            </h2>
                            <div className="flex flex-col gap-4 md:gap-6">
                                <div>
                                    <span className="block text-zinc-600 text-sm md:text-base mb-2 font-bold">Доступность / Подъезд:</span>
                                    <p className="bg-white border-2 border-black p-3 md:p-4 text-sm md:text-base text-zinc-800 leading-relaxed shadow-inner">
                                        {lake.accessibility || "Доступно на любом транспорте"}
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-white border-2 border-black p-3 md:p-4 flex flex-col justify-center items-center text-center shadow-[2px_2px_0_#000]">
                                        <span className="block text-zinc-500 text-xs md:text-sm mb-1 uppercase font-bold">Лодка</span>
                                        <span className={`font-bold text-sm md:text-base uppercase ${lake.boats_allowed ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {lake.boats_allowed ? "Разрешено" : "Запрещено"}
                                        </span>
                                    </div>
                                    <div className="bg-white border-2 border-black p-3 md:p-4 flex flex-col justify-center items-center text-center shadow-[2px_2px_0_#000]">
                                        <span className="block text-zinc-500 text-xs md:text-sm mb-1 uppercase font-bold">Стоимость</span>
                                        <span className={`font-bold text-sm md:text-base uppercase ${lake.is_paid ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            {lake.is_paid ? `${lake.price} ₽` : "Бесплатно"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ПРАВАЯ КОЛОНКА */}
                    <div className="flex flex-col gap-6 md:gap-8">
                        {/* Обитатели */}
                        <div className="bg-slate-50/70 border-[3px] md:border-4 border-black shadow-[4px_4px_0_#000] md:shadow-[6px_6px_0_#000] p-6 md:p-8 flex flex-col flex-1">
                            <h2 className="text-xl md:text-2xl font-bold uppercase flex items-center gap-3 border-b-[3px] border-black pb-3 mb-5 text-black">
                                <Fish size={24} className="text-zinc-800" /> Обитатели
                            </h2>
                            <div className="flex-1">
                                {lake.fish_links && lake.fish_links.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 mt-2">
                                        {lake.fish_links.map(link => (
                                            <div key={link.fish.id} className="bg-white border-2 border-black p-2 md:p-3 flex items-center gap-2 md:gap-3 shadow-[2px_2px_0_#000] hover:-translate-y-1 hover:shadow-[4px_4px_0_#000] transition-all group">
                                                {link.fish.icon_url ? (
                                                    <img src={link.fish.icon_url} className="w-8 h-8 md:w-10 md:h-10 pixelated object-contain flex-shrink-0 group-hover:scale-110 transition-transform" alt={link.fish.name} />
                                                ) : (
                                                    <Fish size={24} className="text-zinc-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                                                )}
                                                <span className="text-xs md:text-sm truncate font-bold text-black uppercase" title={link.fish.name}>
                                                    {link.fish.name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-full flex items-center justify-center italic text-zinc-500 text-sm text-center py-10">
                                        Информация о видовом составе обновляется...
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Кнопка "График клева" */}
                        <button 
                            onClick={() => navigate('/forecast')}
                            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white border-[3px] md:border-4 border-black py-5 md:py-6 text-lg md:text-2xl shadow-[4px_4px_0_#000] md:shadow-[6px_6px_0_#000] active:translate-y-2 active:translate-x-2 active:shadow-none transition-all uppercase font-bold tracking-wider flex items-center justify-center gap-3"
                        >
                            <Activity size={28} className="animate-pulse" /> График клёва
                        </button>
                    </div>
                </div>
            </div>

            {/* СТИЛИ СКРОЛЛБАРА И CANVAS */}
            <style>{`
                .pixelated { image-rendering: pixelated; }
                .custom-scrollbar::-webkit-scrollbar { width: 12px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-left: 2px solid #000; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border: 2px solid #000; box-shadow: inset -2px -2px 0 rgba(0,0,0,0.2); }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>
        </div>
    );
};

export default LakeInfoPage;