import React, { useEffect, useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import bgImgSrc from '../assets/images/background/winter.jpg';
import Stepper from '../components/Stepper';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useRecommendation } from '../context/RecommendationContext';
import { Search, ArrowRight, ShoppingBasket } from 'lucide-react';

// Картинки
import bgImg from '../assets/images/background/winter.jpg';

const GroundbaitPage = () => {
    const canvasRef = useRef(null);
    const navigate = useNavigate();
    const { selections, updateSelection } = useRecommendation();
    
    const[groundbaits, setGroundbaits] = useState([]);
    const [loading, setLoading] = useState(true);
    const[searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchGroundbaits = async () => {
            try {
                setLoading(true);
                const response = await api.get('/api/groundbaits');
                setGroundbaits(response.data.data.groundbaits ||[]);
            } catch (error) {
                console.error("Ошибка загрузки прикормок:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchGroundbaits();
    },[]);

    const filteredGroundbaits = groundbaits.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const bg = new Image();
            bg.src = bgImgSrc;
            let snowflakes = [];
            let animationId;
    
            const handleResize = () => {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                initSnow();
            };
    
            function createSnowflake() {
                return {
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                    size: Math.random() * 4 + 2,
                    speed: Math.random() * 1 + 0.5,
                    drift: Math.random() * 1 - 0.5
                };
            }
    
            function initSnow() {
                snowflakes = [];
                for (let i = 0; i < 150; i++) {
                    snowflakes.push(createSnowflake());
                }
            }
    
            const animate = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.imageSmoothingEnabled = false;
                if (bg.complete) {
                    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
                }
                ctx.fillStyle = "white";
                snowflakes.forEach(s => {
                    s.y += s.speed;
                    s.x += s.drift;
                    if (s.y > canvas.height) {
                        s.y = -10;
                        s.x = Math.random() * canvas.width;
                    }
                    ctx.fillRect(Math.floor(s.x), Math.floor(s.y), s.size, s.size);
                });
                animationId = requestAnimationFrame(animate);
            };
    
            window.addEventListener('resize', handleResize);
            handleResize();
            bg.onload = animate;
            return () => {
                window.removeEventListener('resize', handleResize);
                cancelAnimationFrame(animationId);
            };
        }, []);

    return (
        // Используем жесткий h-screen для фиксации страницы
        <div className="relative h-screen w-full flex flex-col font-pixel overflow-hidden">
            <canvas ref={canvasRef} className="absolute inset-0 -z-10 object-cover w-full h-full" />
            
            <style>{`
                .pixelated { image-rendering: pixelated; }
                
                /* Кастомный скроллбар из вашей системы */
                .custom-scrollbar::-webkit-scrollbar {
                    width: 16px; 
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.4); 
                    border-left: 2px solid #000;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #eab308;
                    border: 2px solid #000;
                    box-shadow: inset -2px -2px 0px rgba(0,0,0,0.3);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: #facc15;
                }
            `}</style>

            <div className="container mx-auto px-[5.5rem] pt-[1.125rem] flex-shrink-0 relative z-20">
                <Navbar />
                <div className="mt-4">
                    <Stepper />
                </div>
            </div>

            <div className="flex-1 flex flex-col px-[5.5rem] mt-4 pb-8 min-h-0">
                
                {/* ПЛАШКА ЗАГОЛОВКА И ПОИСКА */}
                <div className="flex justify-between items-center mb-6 bg-[#9D7F50]/90 p-4 border-2 border-black shadow-[inset_-4px_-4px_0_rgba(0,0,0,0.3)]">
                    <h1 className="text-[#FFBF00] text-3xl drop-shadow-[2px_2px_0_rgba(0,0,0,1)] uppercase flex items-center gap-3">
                        <ShoppingBasket size={32} /> Прилавок прикормок
                    </h1>
                    <div className="relative w-72">
                        <input 
                            type="text" 
                            placeholder="Поиск..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[rgba(217,217,217,0.8)] text-black placeholder-gray-600 border-2 border-black p-2 shadow-[inset_-2px_-2px_0_rgba(0,0,0,0.3)] focus:outline-none focus:border-[#FFBF00]"
                        />
                        <Search className="absolute right-2 top-2.5 text-black" size={20} />
                    </div>
                </div>

                <div className="flex gap-8 flex-1 min-h-0">
                    
                    {/* ЛЕВАЯ ПАНЕЛЬ: СЕТКА МЕШКОВ (скроллится только она) */}
                    <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                        {loading ? (
                            <div className="text-white text-2xl text-center mt-20 drop-shadow-md">Раскладываем мешки...</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-4">
                                {filteredGroundbaits.map((item) => {
                                    const isSelected = selections.groundbait?.id === item.id;
                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => updateSelection('groundbait', item)}
                                            className={`group relative bg-black/50 backdrop-blur-sm border-2 p-4 transition-all cursor-pointer flex flex-col items-center
                                                ${isSelected ? 'border-[#FFBF00] shadow-[0_0_15px_rgba(254,191,0,0.4)] scale-[1.02] bg-black/70' : 'border-black hover:border-[#FFBF00]'}
                                            `}
                                        >
                                            <div className="w-32 h-32 mb-4 relative flex items-center justify-center">
                                                {/* Стилизация под мешок */}
                                                
                                                <img 
                                                    src={item.image_url || 'https://via.placeholder.com/100x120?text=Bag'} 
                                                    alt={item.name}
                                                    className="absolute inset-0 w-full h-full object-contain p-4 pixelated z-10 group-hover:scale-105 transition-transform"
                                                    onError={(e) => {e.target.src = 'https://via.placeholder.com/100x120?text=Groundbait'}}
                                                />
                                            </div>
                                            
                                            <h3 className={`text-lg text-center uppercase mb-2 drop-shadow-md ${isSelected ? 'text-[#FFBF00]' : 'text-white'}`}>
                                                {item.name}
                                            </h3>
                                            
                                            <div className={`mt-auto px-4 py-2 border-2 text-sm font-bold ${isSelected ? 'bg-[#FFBF00] text-black border-black shadow-[2px_2px_0_black]' : 'bg-transparent text-white border-white/20 group-hover:border-[#FFBF00] group-hover:text-[#FFBF00]'}`}>
                                                {isSelected ? 'ВЫБРАНО' : 'ВЗЯТЬ МЕШОК'}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* ПРАВАЯ ПАНЕЛЬ: ИНФО И КНОПКА (фиксированная) */}
                    <div className="w-80 flex-shrink-0 flex flex-col gap-4">
                        
                        {/* Карточка описания */}
                        <div className="flex-1 bg-black/50 border-2 border-black p-6 backdrop-blur-md flex flex-col shadow-[8px_8px_0_rgba(0,0,0,0.6)]">
                            {selections.groundbait ? (
                                <>
                                    <div className="border-b-2 border-white/20 pb-4 mb-4 text-center">
                                        <h2 className="text-[#FFBF00] text-xl uppercase mb-1 drop-shadow-[2px_2px_0_rgba(0,0,0,1)] leading-tight">
                                            {selections.groundbait.name}
                                        </h2>
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                                        <p className="text-white text-sm leading-relaxed drop-shadow-md text-center">
                                            {selections.groundbait.description || 'Классическая прикормка, отлично собирает рыбу на точке и удерживает её долгое время.'}
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                                    <ShoppingBasket size={64} className="mb-4 text-white opacity-50" />
                                    <p className="text-white text-lg drop-shadow-md">Выберите мешок на прилавке</p>
                                </div>
                            )}
                        </div>

                        {/* Блок перехода дальше */}
                        <div className="bg-black/60 backdrop-blur-md border-2 border-black shadow-[8px_8px_0_rgba(0,0,0,0.6)] p-4 flex flex-col gap-3">
                            <div className="flex justify-between items-end border-b-2 border-white/20 pb-2 px-1">
                                <span className="text-gray-300 text-xs uppercase">В корзине:</span>
                                <span className="text-[#FFBF00] text-sm font-bold drop-shadow-[1px_1px_0_rgba(0,0,0,1)] truncate max-w-[150px] text-right">
                                    {selections.groundbait ? selections.groundbait.name : 'Пусто'}
                                </span>
                            </div>
                            <button 
                                onClick={() => navigate('/inventory')}
                                disabled={!selections.groundbait}
                                className={`w-full h-14 font-pixel uppercase text-lg transition-all flex items-center justify-center gap-2 border-2 border-black
                                    ${selections.groundbait 
                                        ? 'bg-[#FFBF00] text-black shadow-[4px_4px_0_rgba(0,0,0,1)] hover:bg-[#FFD700] active:translate-y-1 active:shadow-none cursor-pointer' 
                                        : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-80'}
                                `}
                            >
                                К итогам <ArrowRight size={22} />
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroundbaitPage;