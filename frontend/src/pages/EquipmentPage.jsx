import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search, ChevronDown, ArrowRight } from 'lucide-react';
import Navbar from "../components/Navbar.jsx";
import Stepper from "../components/Stepper.jsx";
import api from '../api/api';
import { useRecommendation } from '../context/RecommendationContext';
import { useNavigate } from 'react-router-dom';

import bgImageSrc from '../assets/images/background/blue_bg.jpg';
import grandpaBase from '../assets/images/dedus.png';

const CATEGORIES =[
    { value: 'удочка', label: 'Удочка' },
    { value: 'куртка', label: 'Куртка' },
    { value: 'штаны', label: 'Штаны' },
    { value: 'обувь', label: 'Обувь' },
    { value: 'головной убор', label: 'Шапка'}
];

const EquipmentPage = () => {
    const canvasRef = useRef(null);
    const navigate = useNavigate();
    const { selections, updateEquipment } = useRecommendation();
    const[products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const[selectedCategory, setSelectedCategory] = useState('удочка');
    const [searchQuery, setSearchQuery] = useState('');
    
    const equipment = selections.equipment || {};

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                setLoading(true);
                const response = await api.get('/api/inventory');
                setProducts(response.data.data.items ||[]);
            } catch (error) {
                console.error("Ошибка загрузки инвентаря:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInventory();
    },[]);

    const filteredProducts = useMemo(() => {
        return products.filter(product =>
            product.category === selectedCategory &&
            product.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    },[products, selectedCategory, searchQuery]);

    // ВРЕМЕННАЯ ЗАТУЧКА: Если с бэка не пришла картинка для деда
    const getFallbackPreview = (category) => {
        switch (category) {
            case 'удочка': return '/src/assets/images/spinning/green-spin.png';
            case 'куртка': return '/src/assets/images/clothe_of_fisherman/green_jacket.png';
            case 'штаны': return '/src/assets/images/clothe_of_fisherman/green_pants1.png';
            case 'обувь': return '/src/assets/images/clothe_of_fisherman/green_boots.png';
            case 'головной убор': return '/src/assets/images/head_1.png';
            default: return null;
        }
    };

    const handleEquip = (product) => {
        const previewUrl = product.preview_image_url || getFallbackPreview(product.category);
        updateEquipment(product.category, { ...product, preview_url: previewUrl });
    };

    // Анимация фона
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationId;
        const bg = new Image();
        bg.src = bgImageSrc;
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.imageSmoothingEnabled = false;
            if (bg.complete) {
                const scale = Math.max(canvas.width / bg.width, canvas.height / bg.height);
                const x = (canvas.width / 2) - (bg.width / 2) * scale;
                const y = (canvas.height / 2) - (bg.height / 2) * scale;
                ctx.drawImage(bg, x, y, bg.width * scale, bg.height * scale);
            }
            animationId = requestAnimationFrame(animate);
        };
        window.addEventListener('resize', resize);
        resize();
        bg.onload = () => animate();
        if (bg.complete) animate();
        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
        };
    },[]);

    return (
        <div className="relative h-screen w-full overflow-hidden flex flex-col font-pixel">
            <canvas ref={canvasRef} className="absolute inset-0 -z-10" />
            <style>{`
                .pixelated { image-rendering: pixelated; }
                .custom-scrollbar::-webkit-scrollbar { width: 12px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.4); border-left: 2px solid #000; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #FFBF00; border: 2px solid #000; }
            `}</style>

            {/* ШАПКА */}
            <div className="container mx-auto px-[5.5rem] pt-[1.125rem] flex-shrink-0 relative z-20">
                <Navbar />
                <div className="mt-4">
                    <Stepper />
                </div>
            </div>

            {/* ОСНОВНОЙ КОНТЕНТ */}
            <div className="flex-1 min-h-0 flex gap-8 px-[5.5rem] pb-8 mt-4">
                
                {/* ЛЕВАЯ КОЛОНКА: СПИСОК ТОВАРОВ */}
                <div className="flex-1 flex flex-col min-h-0">
                    {/* Поиск и Фильтр */}
                    <div className="flex gap-4 mb-6 flex-shrink-0">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Поиск снаряжения..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-12 bg-[rgba(217,217,217,0.8)] text-black px-4 border-2 border-black shadow-[inset_-4px_-4px_0_rgba(0,0,0,0.3)] focus:outline-none placeholder-gray-600"
                            />
                            <Search className="absolute right-3 top-2.5 text-black w-6 h-6" />
                        </div>
                        <div className="relative w-56">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full h-12 appearance-none bg-[rgba(217,217,217,0.8)] text-black px-4 border-2 border-black shadow-[inset_-4px_-4px_0_rgba(0,0,0,0.3)] focus:outline-none cursor-pointer uppercase"
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat.value} value={cat.value} className="bg-gray-200 text-black">{cat.label}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-3 text-black w-5 h-5 pointer-events-none" />
                        </div>
                    </div>

                    {/* Сетка товаров */}
                    <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                        {loading ? (
                            <div className="text-white text-2xl text-center mt-20 drop-shadow-md">Загрузка товаров...</div>
                        ) : (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-4">
                                {filteredProducts.map((product) => {
                                    const isEquipped = equipment[product.category]?.id === product.id;
                                    return (
                                        <div
                                            key={product.id}
                                            onClick={() => handleEquip(product)}
                                            className={`group relative bg-black/50 backdrop-blur-sm border-2 p-4 transition-all cursor-pointer flex flex-col
                                                ${isEquipped ? 'border-[#FFBF00] shadow-[0_0_15px_rgba(255,191,0,0.4)] scale-[1.02]' : 'border-black hover:border-[#FFBF00]'}`}
                                        >
                                            <div className="h-40 bg-white/5 mb-4 flex items-center justify-center p-2 border border-black overflow-hidden">
                                                <img
                                                    src={product.image_url || 'https://via.placeholder.com/150?text=No+Image'}
                                                    alt={product.name}
                                                    className="w-full h-full object-contain drop-shadow-lg pixelated group-hover:scale-110 transition-transform"
                                                />
                                            </div>
                                            <h3 className="text-xl mb-2 text-white uppercase truncate drop-shadow-md">{product.name}</h3>
                                            <div className="mt-auto flex justify-between items-center pt-2">
                                                <span className="text-xl text-[#FFBF00] font-bold drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">{product.price || 0} ₽</span>
                                                <div className={`text-sm px-4 py-2 border-2 uppercase font-bold
                                                    ${isEquipped ? 'bg-[#FFBF00] text-black border-black shadow-[2px_2px_0_rgba(0,0,0,1)]' 
                                                                 : 'bg-transparent text-white border-white/40 group-hover:border-[#FFBF00] group-hover:text-[#FFBF00]'}`}>
                                                    {isEquipped ? 'Надето' : 'Выбрать'}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {!loading && filteredProducts.length === 0 && (
                                    <div className="col-span-2 text-center text-white py-10 text-xl bg-black/50 border-2 border-black">
                                        В этой категории пока нет товаров...
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ПРАВАЯ КОЛОНКА: ДЕДУШКА И КНОПКА "ДАЛЕЕ" */}
                <div className="w-[400px] flex-shrink-0 flex flex-col h-full gap-4">
                    
                    {/* Карточка персонажа */}
                    <div className="flex-1 bg-black/40 backdrop-blur-md border-2 border-black shadow-[8px_8px_0_rgba(0,0,0,0.6)] flex flex-col relative overflow-hidden">
                        {/* Плашка заголовка (жестко фиксирует высоту) */}
                        <div className="h-14 flex items-center justify-center z-50">
                            <h2 className="text-2xl text-white uppercase drop-shadow-[2px_2px_0_rgba(0,0,0,1)] m-0">
                                
                            </h2>
                        </div>
                        
                        {/* Контейнер со слоями картинок */}
                        <div className="relative flex-1 w-full flex items-end justify-center pb-4">
                            {/* origin-bottom заставляет деда расти от ног вверх, а не во все стороны */}
                            <div className="relative w-full h-full transform scale-[1.3] origin-bottom translate-y-6">
                                <img src={grandpaBase} alt="Base" className="absolute inset-0 w-full h-full object-contain z-10 pixelated" />
                                {equipment['обувь']?.preview_url && <img src={equipment['обувь'].preview_url} className="absolute inset-0 w-full h-full object-contain z-20 pixelated" />}
                                {equipment['штаны']?.preview_url && <img src={equipment['штаны'].preview_url} className="absolute inset-0 w-full h-full object-contain z-30 pixelated" />}
                                {equipment['куртка']?.preview_url && <img src={equipment['куртка'].preview_url} className="absolute inset-0 w-full h-full object-contain z-40 pixelated" />}
                                {equipment['головной убор']?.preview_url && <img src={equipment['головной убор'].preview_url} className="absolute inset-0 w-full h-full object-contain z-[45] pixelated" />}
                                {equipment['удочка']?.preview_url && <img src={equipment['удочка'].preview_url} className="absolute inset-0 w-full h-full object-contain z-50 pixelated" />}
                            </div>
                        </div>
                    </div>

                    {/* Блок перехода дальше (вместо fixed футера) */}
                    <div className="bg-black/60 backdrop-blur-md border-2 border-black shadow-[8px_8px_0_rgba(0,0,0,0.6)] p-4 flex flex-col gap-3">
                        <div className="flex justify-between items-end border-b-2 border-white/20 pb-2 px-1">
                            <span className="text-gray-300 text-sm uppercase">Снаряжение собрано:</span>
                            <span className="text-[#FFBF00] text-xl font-bold drop-shadow-[1px_1px_0_rgba(0,0,0,1)]">
                                {Object.values(equipment).filter(Boolean).length} / 5
                            </span>
                        </div>
                        <button 
                            onClick={() => navigate('/lures')}
                            disabled={!equipment['удочка']}
                            className={`w-full h-14 font-pixel uppercase text-lg transition-all flex items-center justify-center gap-3 border-2 border-black
                                ${equipment['удочка'] 
                                    ? 'bg-[#FFBF00] text-black shadow-[4px_4px_0_rgba(0,0,0,1)] hover:bg-[#FFD700] active:translate-y-1 active:shadow-none cursor-pointer' 
                                    : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-80'}
                            `}
                        >
                            К наживкам <ArrowRight size={22} />
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default EquipmentPage;