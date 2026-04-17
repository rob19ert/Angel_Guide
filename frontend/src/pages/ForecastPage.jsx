import React, { useEffect, useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Wind, Thermometer, Moon, Search, Calendar } from 'lucide-react';

const todayData = [
  { time: '00:00', bite: 20 }, { time: '04:00', bite: 80 }, { time: '08:00', bite: 90 },
  { time: '12:00', bite: 40 }, { time: '16:00', bite: 30 }, { time: '20:00', bite: 85 }, { time: '23:59', bite: 50 }
];

const tomorrowData = [
  { time: '00:00', bite: 30 }, { time: '04:00', bite: 60 }, { time: '08:00', bite: 85 },
  { time: '12:00', bite: 50 }, { time: '16:00', bite: 45 }, { time: '20:00', bite: 95 }, { time: '23:59', bite: 60 }
];

const weekData = [
  { time: 'Пн', bite: 60 }, { time: 'Вт', bite: 80 }, { time: 'Ср', bite: 40 },
  { time: 'Чт', bite: 90 }, { time: 'Пт', bite: 85 }, { time: 'Сб', bite: 70 }, { time: 'Вс', bite: 50 }
];

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

        const drops = [];
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
    }, []);

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

const ForecastCard = ({ title, data }) => (
    <div className="bg-[rgba(217,217,217,0.7)] backdrop-blur-sm border-[3px] border-black shadow-[6px_6px_0_rgba(0,0,0,0.9)] p-4 md:p-6 flex flex-col gap-6 font-pixel relative z-10 w-full transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0_rgba(0,0,0,0.9)]">
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
            <h2 className="text-2xl font-bold text-white drop-shadow-[3px_3px_0_rgba(0,0,0,1)] tracking-widest uppercase">
                {title}
            </h2>
            <div className="relative group cursor-pointer">
                <div className="bg-yellow-400 text-black border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] px-4 py-2 font-bold hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 active:translate-x-1 flex items-center gap-2">
                    <Calendar size={18} strokeWidth={2.5}/>
                    <span className="text-sm">Выбрать день</span>
                </div>
                <input
                    type="date"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />
            </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 w-full">
            <div className="flex-1 min-w-0">
                <div className="h-56 md:h-64 w-full border-[3px] border-black bg-[#e5d9c5] p-3 md:p-4 relative overflow-hidden shadow-[inset_4px_4px_0_rgba(0,0,0,0.2)]">
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
                            <YAxis stroke="#000" hide />
                            <Tooltip content={<CustomTooltip />} />
                            <Area 
                                type="monotone" 
                                dataKey="bite" 
                                stroke="#000" 
                                strokeWidth={2} 
                                strokeDasharray="2 1"
                                style={{ shapeRendering: 'crispEdges' }}
                                fillOpacity={1} 
                                fill="url(#colorBite)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="flex flex-col justify-center items-center w-full md:w-56 gap-6">
                <div className="flex flex-col items-center gap-1">
                    <Wind size={32} className="text-black drop-shadow-[2px_2px_0_rgba(255,255,255,0.5)]" strokeWidth={2.5} />
                    <span className="text-white font-bold drop-shadow-[2px_2px_0_rgba(0,0,0,1)] text-xl tracking-wide">С-З, 4 м/с</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <Thermometer size={32} className="text-black drop-shadow-[2px_2px_0_rgba(255,255,255,0.5)]" strokeWidth={2.5} />
                    <span className="text-white font-bold drop-shadow-[2px_2px_0_rgba(0,0,0,1)] text-xl tracking-wide">+12°C</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <Moon size={32} className="text-black drop-shadow-[2px_2px_0_rgba(255,255,255,0.5)]" strokeWidth={2.5} />
                    <span className="text-white font-bold drop-shadow-[2px_2px_0_rgba(0,0,0,1)] text-xl tracking-wide">Убывающая</span>
                </div>
            </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full mt-2">
            <button className="flex-1 bg-yellow-400 text-black border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] py-3 text-lg font-bold uppercase tracking-widest hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] transition-all active:bg-yellow-500 active:shadow-none active:translate-y-2 active:translate-x-2">
                На карте
            </button>
            <button className="flex-1 bg-yellow-400 text-black border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] py-3 text-lg font-bold uppercase tracking-widest hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] transition-all active:bg-yellow-500 active:shadow-none active:translate-y-2 active:translate-x-2">
                Подробнее
            </button>
        </div>
    </div>
);

const ForecastPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    return (
        <div className="relative h-screen w-full flex flex-col font-pixel overflow-hidden bg-cover bg-center" style={{ backgroundImage: "url('/src/assets/images/background/rain.jpg')" }}>
            <RainCanvas />
            
            <style>{`
                /* Стилизация инпута даты */
                input[type="date"]::-webkit-calendar-picker-indicator {
                    cursor: pointer;
                    opacity: 0.6;
                    filter: invert(1);
                }
                
                /* --- КАСТОМНЫЙ СКРОЛЛБАР --- */
                .custom-scroll::-webkit-scrollbar {
                    width: 20px;
                }
                .custom-scroll::-webkit-scrollbar-track {
                    background: #374151;
                    border-left: 2px solid black;
                }
                .custom-scroll::-webkit-scrollbar-thumb {
                    background-color: #facc15;
                    border: 2px solid black;
                }
            `}</style>
            
            <div className="container mx-auto px-4 md:px-[5.5rem] pt-[1.125rem] flex-shrink-0 z-10">
                <Navbar />
            </div>
            
            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scroll w-full mt-4 z-10">
                <div className="container mx-auto px-4 md:px-[5.5rem] pb-10 pt-4">
                    
                    {/* Блок поиска и даты как в LakeDetailPage */}
                    <div className="flex flex-col md:flex-row gap-6 items-center w-full max-w-6xl mx-auto mb-8">
                        {/* Поиск */}
                        <div className="relative flex-grow w-full">
                            <input
                                type="text"
                                placeholder="Водоем (например: Озеро Светлое)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-14 bg-[rgba(217,217,217,0.7)] text-xl px-4 border-[3px] border-black shadow-[4px_4px_0_rgba(0,0,0,0.9)] focus:outline-none placeholder-gray-700 text-black font-bold"
                            />
                            <Search className="absolute right-4 top-3.5 text-black w-7 h-7"/>
                        </div>

                        {/* Дата */}
                        <div className="relative w-full md:w-auto">
                            <div className="h-14 bg-[rgba(217,217,217,0.7)] border-[3px] border-black shadow-[4px_4px_0_rgba(0,0,0,0.9)] flex items-center px-4 gap-4 cursor-pointer group hover:bg-white/90 transition-colors">
                                <span className="text-xl whitespace-nowrap min-w-[150px] text-black font-bold">
                                    {selectedDate ? selectedDate : "Выбрать День"}
                                </span>
                                <Calendar className="w-7 h-7 text-black" />
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="w-full max-w-6xl mx-auto">
                        <h1 className="text-3xl md:text-4xl text-white mb-8 drop-shadow-[4px_4px_0_rgba(0,0,0,1)] text-center tracking-widest font-bold uppercase">
                            Прогноз клёва: {searchQuery || 'Все водоемы'}
                        </h1>
                        
                        <div className="flex flex-col gap-8">
                            <ForecastCard title="Прогноз на сегодня" data={todayData} />
                            <ForecastCard title="Прогноз на завтра" data={tomorrowData} />
                            <ForecastCard title="Прогноз на неделю" data={weekData} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForecastPage;