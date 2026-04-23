import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Wind, Thermometer, Moon, Calendar, ArrowLeft } from 'lucide-react';
import api from '../api/api';
import { useRecommendation } from '../context/RecommendationContext';

const RainCanvas = () => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();
        const drops =[];
        for(let i = 0; i < 150; i++) {
            drops.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                speed: 10 + Math.random() * 10,
                length: 15 + Math.random() * 15
            });
        }
        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(150, 180, 220, 1)'; 
            
            for(let i = 0; i < drops.length; i++) {
                const drop = drops[i];
                ctx.fillRect(Math.floor(drop.x), Math.floor(drop.y), 4, Math.floor(drop.length));
                
                drop.y += drop.speed;
                if (drop.y > canvas.height) {
                    drop.y = -drop.length;
                    drop.x = Math.random() * canvas.width;
                }
            }
            animationFrameId = requestAnimationFrame(render);
        };
        render();
        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    },[]);
    return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-60 z-0" />;
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#EAD4AA] border-2 border-black p-3 font-pixel text-base shadow-[4px_4px_0_0_black]">
                <p className="mb-1 text-black font-bold">{`Время: ${label}`}</p>
                <p className="text-[#3b82f6] font-bold text-lg">{`Клёв: ${payload[0].value}%`}</p>
            </div>
        );
    }
    return null;
};

const ForecastCard = ({ title, data, weather, selectedDate, onDateChange }) => (
    <div className="bg-[rgba(217,217,217,0.7)] backdrop-blur-sm border-[3px] border-black shadow-[6px_6px_0_rgba(0,0,0,0.9)] p-4 md:p-6 flex flex-col gap-6 font-pixel relative z-10 w-full transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0_rgba(0,0,0,0.9)]">
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
            <h2 className="text-2xl font-bold text-white drop-shadow-[3px_3px_0_rgba(0,0,0,1)] tracking-widest uppercase">
                {title}
            </h2>
            <div className="relative group cursor-pointer">
                <div className="bg-yellow-400 text-black border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] px-4 py-2 font-bold hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 active:translate-x-1 flex items-center gap-2">
                    <Calendar size={18} strokeWidth={2.5}/>
                    <span className="text-sm">{selectedDate}</span>
                </div>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={onDateChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />
            </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 w-full">
            <div className="flex-1 min-w-0">
                <div className="h-56 md:h-64 w-full border-[3px] border-black bg-[#e5d9c5] p-3 md:p-4 relative overflow-hidden shadow-[inset_4px_4px_0_rgba(0,0,0,0.2)]">
                    {data && data.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorBite" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#5b8c85" stopOpacity={0.9}/>
                                        <stop offset="95%" stopColor="#5b8c85" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={true} horizontal={false} stroke="#b0a896" strokeDasharray="4 4" />
                                <XAxis dataKey="time" stroke="#000" tick={{fontFamily: 'inherit', fontSize: 14, fontWeight: 'bold'}} tickLine={false} axisLine={{strokeWidth: 3}}/>
                                <YAxis stroke="#000" hide domain={[0, 100]} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area 
                                    type="monotone" 
                                    dataKey="score" 
                                    stroke="#000" 
                                    strokeWidth={2} 
                                    strokeDasharray="2 1"
                                    style={{ shapeRendering: 'crispEdges' }}
                                    fillOpacity={1} 
                                    fill="url(#colorBite)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-black/50 italic">Нет данных</div>
                    )}
                </div>
            </div>
            <div className="flex flex-col justify-center items-center w-full md:w-56 gap-6">
                <div className="flex flex-col items-center gap-1">
                    <Wind size={32} className="text-black drop-shadow-[2px_2px_0_rgba(255,255,255,0.5)]" strokeWidth={2.5} />
                    <span className="text-white font-bold drop-shadow-[2px_2px_0_rgba(0,0,0,1)] text-xl tracking-wide">{weather?.wind || "—"}</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <Thermometer size={32} className="text-black drop-shadow-[2px_2px_0_rgba(255,255,255,0.5)]" strokeWidth={2.5} />
                    <span className="text-white font-bold drop-shadow-[2px_2px_0_rgba(0,0,0,1)] text-xl tracking-wide">{weather?.temperature || "—"}</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <Moon size={32} className="text-black drop-shadow-[2px_2px_0_rgba(255,255,255,0.5)]" strokeWidth={2.5} />
                    <span className="text-white font-bold drop-shadow-[2px_2px_0_rgba(0,0,0,1)] text-xl tracking-wide text-center">{weather?.moonPhase || "—"}</span>
                </div>
            </div>
        </div>
    </div>
);

const ForecastPage = () => {
    const { selections } = useRecommendation();
    const navigate = useNavigate();
    const[selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
    const[forecastData, setForecastData] = useState(null);
    const [loading, setLoading] = useState(false);
    const[error, setError] = useState(null);
    
    // Локальные стейты для селекторов
    const[waterbodies, setWaterbodies] = useState([]);
    const [fishes, setFishes] = useState([]);
    
    // По умолчанию берем из контекста, если есть
    const[localWaterbodyId, setLocalWaterbodyId] = useState(selections.waterbody?.id || "");
    const[localFishId, setLocalFishId] = useState(selections.fish?.id || "all");

    // === ИСПРАВЛЕНИЕ 1: Добавлена функция смены даты ===
    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    // Загрузка списков для дропдаунов
    useEffect(() => {
        const fetchLists = async () => {
            try {
                const[wbRes, fishRes] = await Promise.all([
                    api.get('/api/waterbody'),
                    api.get('/api/fishes')
                ]);
                
                const waterbodiesList = wbRes.data.data?.waterbodies || [];
                const fishesList = fishRes.data.data?.fishes || [];
                
                setWaterbodies(waterbodiesList);
                setFishes(fishesList);
                
                // Если водоем в контексте не был выбран, но список загрузился, ставим первый
                if (!selections.waterbody?.id && waterbodiesList.length > 0) {
                    setLocalWaterbodyId(waterbodiesList[0].id);
                }
            } catch (err) {
                console.error("Ошибка загрузки списков:", err);
            }
        };
        fetchLists();
    },[selections.waterbody]);

    // Загрузка самого прогноза
    useEffect(() => {
        if (!localWaterbodyId) return; // Ждем пока выберут водоем
        const fetchForecast = async () => {
            setLoading(true);
            setError(null);
            try {
                const params = {
                    waterbody_id: localWaterbodyId,
                    date: selectedDate
                };
                if (localFishId && localFishId !== 'all') {
                    params.fish_id = localFishId;
                }
                
                const response = await api.get('/api/forecast/calculate', { params });
                
                if (response.data.status === "error" || response.data.data?.error) {
                    setError(response.data.data?.error || "Ошибка загрузки прогноза");
                    setForecastData(null);
                } else {
                    setForecastData(response.data.data);
                }
            } catch (err) {
                console.error(err);
                setError("Не удалось связаться с сервером.");
            } finally {
                setLoading(false);
            }
        };
        fetchForecast();
    },[localWaterbodyId, localFishId, selectedDate]);

    // Получаем названия выбранных элементов для заголовка
    const selectedWaterbodyName = waterbodies.find(w => w.id == localWaterbodyId)?.name || 'Загрузка...';
    const selectedFishName = fishes.find(f => f.id == localFishId)?.name || 'Любая рыба';

    return (
        <div className="relative h-screen w-full flex flex-col font-pixel overflow-hidden bg-cover bg-center" style={{ backgroundImage: "url('/src/assets/images/background/vibe.jpg')" }}>
            <RainCanvas />
            
            <style>{`
                input[type="date"]::-webkit-calendar-picker-indicator { cursor: pointer; opacity: 0.6; filter: invert(1); }
                .custom-scroll::-webkit-scrollbar { width: 20px; }
                .custom-scroll::-webkit-scrollbar-track { background: #374151; border-left: 2px solid black; }
                .custom-scroll::-webkit-scrollbar-thumb { background-color: #facc15; border: 2px solid black; }
                select { appearance: none; outline: none; } /* Убираем дефолтные стили селектов */
            `}</style>
            
            <div className="container mx-auto px-4 md:px-[5.5rem] pt-[1.125rem] flex-shrink-0 z-10">
                <Navbar />
            </div>
            
            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scroll w-full mt-4 z-10">
                <div className="container mx-auto px-4 md:px-[5.5rem] pb-10 pt-4 flex flex-col h-full">
                    <div className="w-full flex-grow flex flex-col">
                        
                        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
                            
                            {/* Кнопка Назад (Слева) */}
                            <button
                                onClick={() => navigate(localWaterbodyId ? `/lakes/${localWaterbodyId}` : '/water')}
                                className="flex items-center justify-center gap-2 text-black bg-[#EAD4AA] border-[3px] border-black px-5 py-2.5 shadow-[4px_4px_0_#000] hover:bg-yellow-400 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#000] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all text-sm md:text-base font-bold capitalize w-full"
                            >
                                <ArrowLeft size={20} /> Назад
                            </button>
                            
                            {/* Водоем (По центру) */}
                            <select 
                                value={localWaterbodyId}
                                onChange={(e) => setLocalWaterbodyId(e.target.value)}
                                className="bg-[#EAD4AA] border-[3px] border-black p-2.5 font-pixel text-base md:text-lg shadow-[4px_4px_0_0_black] cursor-pointer hover:bg-yellow-400 transition-colors w-full text-center truncate"
                            >
                                <option value="" disabled>Выберите водоем</option>
                                {waterbodies.map(wb => (
                                    <option key={wb.id} value={wb.id}>{wb.name}</option>
                                ))}
                            </select>

                            {/* Рыба (Справа) */}
                            <select 
                                value={localFishId}
                                onChange={(e) => setLocalFishId(e.target.value)}
                                className="bg-[#EAD4AA] border-[3px] border-black p-2.5 font-pixel text-base md:text-lg shadow-[4px_4px_0_0_black] cursor-pointer hover:bg-yellow-400 transition-colors w-full text-center truncate capitalize"
                            >
                                <option value="all">Любая рыба</option>
                                {fishes.map(fish => (
                                    <option key={fish.id} value={fish.id}>{fish.name}</option>
                                ))}
                            </select>
                            
                        </div>
                        {/* ================================== */}
                        <h1 className="text-3xl md:text-4xl text-white mb-2 drop-shadow-[4px_4px_0_rgba(0,0,0,1)] text-center tracking-widest font-bold uppercase break-words">
                            Прогноз: {forecastData?.state?.waterbody || selectedWaterbodyName}
                        </h1>
                        <p className="text-xl md:text-2xl text-yellow-400 drop-shadow-[2px_2px_0_rgba(0,0,0,1)] text-center mb-8 font-bold uppercase">
                            Цель: {forecastData?.state?.fish || selectedFishName}
                        </p>
                        
                        {/* ... (Остальной код рендера графиков остается таким же) ... */}
                        
                        {error ? (
                            <div className="flex-1 flex flex-col items-center justify-center">
                                <div className="bg-red-500/80 border-[3px] border-black p-6 text-white text-xl shadow-[4px_4px_0_rgba(0,0,0,1)] text-center max-w-2xl">
                                    {error}
                                </div>
                            </div>
                        ) : loading ? (
                            <div className="flex-1 flex items-center justify-center text-white text-2xl font-bold drop-shadow-md">
                                Загрузка прогноза...
                            </div>
                        ) : forecastData ? (
                            <div className="flex flex-col gap-6">
                                <ForecastCard 
                                    title="Клёв" 
                                    data={forecastData.chartData} 
                                    weather={forecastData.weatherSummary}
                                    selectedDate={selectedDate}
                                    onDateChange={handleDateChange}
                                />
                                {forecastData.advice && (
                                    <div className="bg-yellow-400 border-[3px] border-black p-4 shadow-[4px_4px_0_rgba(0,0,0,1)] text-black text-xl font-bold text-center">
                                        Совет: {forecastData.advice}
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ForecastPage;