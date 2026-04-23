import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Info, ShieldCheck, Fish } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import api from '../api/api';
import bgImageSrc from '../assets/images/background/blue_bg.jpg';

const EquipmentDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const canvasRef = useRef(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                // В реальном API должен быть эндпоинт /api/inventory/:id
                // Но так как у нас список уже загружен в стейт выше, 
                // мы либо запрашиваем список и фильтруем, либо запрашиваем один товар.
                // Для простоты сейчас загрузим весь список (временно).
                const response = await api.get('/api/inventory');
                const found = response.data.data.items.find(item => item.id === parseInt(id));
                setProduct(found);
            } catch (error) {
                console.error("Error fetching product details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    // Анимация фона (такая же как на основной странице для стиля)
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
    }, []);

    const getMarketplaceUrl = (platform, name) => {
        const query = encodeURIComponent(name);
        switch (platform) {
            case 'ozon': return `https://www.ozon.ru/search/?text=${query}`;
            case 'wb': return `https://www.wildberries.ru/catalog/0/search.aspx?search=${query}`;
            case 'yandex': return `https://market.yandex.ru/search?text=${query}`;
            default: return '#';
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center text-white font-pixel text-2xl">Загрузка данных...</div>;
    if (!product) return <div className="h-screen flex items-center justify-center text-white font-pixel text-2xl">Товар не найден</div>;

    return (
        <div className="relative h-screen w-full overflow-hidden flex flex-col font-pixel">
            <canvas ref={canvasRef} className="absolute inset-0 -z-10" />
            <style>{`
                .pixelated { image-rendering: pixelated; }
                .glass-card { background: rgba(0, 0, 0, 0.6); backdrop-blur-md; border: 4px solid black; }
                .pixel-shadow { box-shadow: 8px 8px 0 rgba(0,0,0,0.5); }
            `}</style>

            <div className="container mx-auto px-[5.5rem] pt-[1.125rem] flex-shrink-0 relative z-20">
                <Navbar />
                
                <button 
                    onClick={() => navigate(-1)}
                    className="mt-6 flex items-center gap-2 text-[#FFBF00] uppercase hover:translate-x-[-4px] transition-transform"
                >
                    <ArrowLeft size={20} /> Назад к выбору
                </button>
            </div>

            <div className="flex-1 container mx-auto px-[5.5rem] py-8 flex gap-8 items-start overflow-y-auto custom-scrollbar mt-4">
                
                {/* ИЗОБРАЖЕНИЕ ТОВАРА */}
                <div className="w-1/2 glass-card p-8 flex items-center justify-center pixel-shadow bg-white/5 min-h-[500px]">
                    <img 
                        src={product.image_url || 'https://via.placeholder.com/400?text=No+Image'} 
                        alt={product.name} 
                        className="max-w-full max-h-[450px] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] pixelated"
                    />
                </div>

                {/* ОПИСАНИЕ И ХАРАКТЕРИСТИКИ */}
                <div className="flex-1 flex flex-col gap-6">
                    <div className="glass-card p-6 pixel-shadow">
                        <h1 className="text-3xl text-[#FFBF00] uppercase mb-2 drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
                            {product.name}
                        </h1>
                        <p className="text-white/80 text-lg leading-relaxed mb-6 border-l-4 border-[#FFBF00] pl-4">
                            {product.description || "Описание временно отсутствует, но эта снасть отлично зарекомендовала себя среди профессиональных рыболовов."}
                        </p>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="bg-black/40 p-3 border border-white/10">
                                <span className="text-[#FFBF00] text-xs uppercase block mb-1">Категория</span>
                                <span className="text-white uppercase">{product.category}</span>
                            </div>
                            {product.specs && Object.entries(product.specs).map(([key, value]) => (
                                <div key={key} className="bg-black/40 p-3 border border-white/10">
                                    <span className="text-[#FFBF00] text-xs uppercase block mb-1">{key}</span>
                                    <span className="text-white uppercase">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* СОВЕТЫ ПО РЫБЕ */}
                    <div className="glass-card p-6 pixel-shadow bg-blue-900/20">
                        <div className="flex items-center gap-3 mb-4">
                            <Fish className="text-[#FFBF00]" />
                            <h2 className="text-[#FFBF00] text-xl uppercase">Советы эксперта</h2>
                        </div>
                        <p className="text-white/80 text-sm italic">
                            Эта модель особенно эффективна при ловле хищника в весенний период. Рекомендуем использовать плавную проводку и следить за натяжением лески. 
                            Хорошо сочетается с легкими приманками весом до 10 грамм.
                        </p>
                    </div>

                    {/* КНОПКИ МАРКЕТПЛЕЙСОВ */}
                    <div className="glass-card p-6 pixel-shadow bg-white/5">
                        <h2 className="text-white text-lg uppercase mb-4 flex items-center gap-2">
                            <ShoppingBag size={20} /> Купить на маркетплейсах
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <a 
                                href={getMarketplaceUrl('ozon', product.name)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="h-12 bg-[#005bff] text-white flex items-center justify-center gap-2 border-2 border-black hover:scale-105 transition-transform font-bold"
                            >
                                OZON
                            </a>
                            <a 
                                href={getMarketplaceUrl('wb', product.name)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="h-12 bg-[#cb11ab] text-white flex items-center justify-center gap-2 border-2 border-black hover:scale-105 transition-transform font-bold"
                            >
                                WB
                            </a>
                            <a 
                                href={getMarketplaceUrl('yandex', product.name)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="h-12 bg-[#ffcc00] text-black flex items-center justify-center gap-2 border-2 border-black hover:scale-105 transition-transform font-bold"
                            >
                                Я.МАРКЕТ
                            </a>
                        </div>
                        <p className="text-white/40 text-[10px] uppercase mt-4 text-center">
                            * Нажатие откроет страницу поиска с названием товара
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EquipmentDetailPage;