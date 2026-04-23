import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search, ChevronDown, ArrowRight, ArrowLeft, Filter, X, ShoppingBag } from 'lucide-react';
import Navbar from "../components/Navbar.jsx";
import Stepper from "../components/Stepper.jsx";
import api from '../api/api';
import { useRecommendation } from '../context/RecommendationContext';
import { useNavigate } from 'react-router-dom';

import bgImageSrc from '../assets/images/background/blue_bg.jpg';
import grandpaBase from '../assets/images/dedus.png';

const CATEGORIES = [
    { value: 'удочка', label: 'Удочка', mandatory: true },
    { value: 'куртка', label: 'Куртка', mandatory: false },
    { value: 'штаны', label: 'Штаны', mandatory: false },
    { value: 'обувь', label: 'Обувь', mandatory: false },
    { value: 'головной убор', label: 'Шапка', mandatory: false }
];

const FILTER_OPTIONS = {
    'удочка': ['Спиннинг', 'Фидер', 'Мах', 'Зимняя'],
    'куртка': ['Зимняя', 'Летняя', 'Демисезонная'],
    'штаны': ['Зимняя', 'Летняя', 'Демисезонная'],
    'обувь': ['Зимняя', 'Летняя', 'Демисезонная'],
    'головной убор': ['Зимняя', 'Летняя', 'Демисезонная']
};

const EquipmentPage = () => {
    const canvasRef = useRef(null);
    const navigate = useNavigate();
    const { selections, updateEquipment } = useRecommendation();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(() => {
        const saved = localStorage.getItem('equipment_step');
        return saved !== null ? parseInt(saved, 10) : 0;
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState([]);
    const [customRodName, setCustomRodName] = useState('');
    const [showCustomRodModal, setShowCustomRodModal] = useState(false);
    
    const selectedCategory = CATEGORIES[currentStep].value;
    const equipment = selections.equipment || {};

    useEffect(() => {
        localStorage.setItem('equipment_step', currentStep.toString());
    }, [currentStep]);

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                setLoading(true);
                const response = await api.get('/api/inventory');
                setProducts(response.data.data.items || []);
            } catch (error) {
                console.error("Ошибка загрузки инвентаря:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInventory();
    }, []);

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesCategory = product.category === selectedCategory;
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilters = activeFilters.length === 0 || 
                activeFilters.some(f => 
                    product.name.toLowerCase().includes(f.toLowerCase()) || 
                    (product.description && product.description.toLowerCase().includes(f.toLowerCase())) ||
                    (product.specs && JSON.stringify(product.specs).toLowerCase().includes(f.toLowerCase()))
                );
            return matchesCategory && matchesSearch && matchesFilters;
        });
    }, [products, selectedCategory, searchQuery, activeFilters]);

    const getCharacterSprite = (product) => {
        const name = product.name.toLowerCase();
        const desc = product.description ? product.description.toLowerCase() : '';
        switch (product.category) {
            case 'удочка': 
            if (name.includes('спиннинг') || desc.includes('спиннинг')) {
                return '/src/assets/images/spinning/green-spin.png';
            }
            if (name.includes('фидер') || desc.includes('фидер')) {
                return '/src/assets/images/spinning/spin_noo.png';
            }
            if (name.includes('зимняя') || desc.includes('зимняя')) {
                return '/src/assets/images/spinning/blue.png';
            }
            if (name.includes('мах') || desc.includes('мах')) {
                return '/src/assets/images/spinning/red_spin.png';
            }
            return '/src/assets/images/spinning/green-spin.png';

            case 'куртка': 
             if (name.includes('зимняя') || desc.includes('зимняя')) {
                return '/src/assets/images/clothe_of_fisherman/tulup1.png';
            }
            if (name.includes('летняя') || desc.includes('летняя')) {
                return '/src/assets/images/clothe_of_fisherman/brown_jacket1.png';
            }
            if (name.includes('демисезонная') || desc.includes('демисезонная')) {
                return '/src/assets/images/clothe_of_fisherman/green_jacket.png';
            }
            return '/src/assets/images/clothe_of_fisherman/green_jacket.png';
            case 'штаны': return '/src/assets/images/clothe_of_fisherman/green_pants1.png';
            case 'обувь': return '/src/assets/images/clothe_of_fisherman/green_boots.png';
            
            default: return null;
        }
    };

    const handleEquip = (product) => {
        const isCurrentlyEquipped = equipment[product.category]?.id === product.id;
        
        if (isCurrentlyEquipped) {
            // Если товар уже выбран, повторное нажатие отменяет выбор
            updateEquipment(product.category, null);
        } else {
            // Если не выбран, выбираем его и подгружаем превью
            const spriteUrl =  getCharacterSprite(product);
            updateEquipment(product.category, { ...product, preview_url: spriteUrl });
        }
    };

    const handleNextStep = () => {
        if (currentStep < CATEGORIES.length - 1) {
            setCurrentStep(currentStep + 1);
            setActiveFilters([]);
            setSearchQuery('');
        } else {
            navigate('/lures');
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
            setActiveFilters([]);
            setSearchQuery('');
        }
    };

    const handleSkip = () => {
        updateEquipment(selectedCategory, null);
        handleNextStep();
    };

    const toggleFilter = (filter) => {
        setActiveFilters(prev => 
            prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
        );
    };

    const handleCustomRodSubmit = async () => {
        if (!customRodName.trim()) return;
        // Здесь можно отправить запрос на бэк для уведомления админа
        console.log("Custom rod suggested:", customRodName);
        updateEquipment('удочка', { name: customRodName, category: 'удочка', isCustom: true });
        setShowCustomRodModal(false);
        setCustomRodName('');
        handleNextStep();
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
    }, []);

    return (
        <div className="relative min-h-screen lg:h-screen w-full overflow-y-auto lg:overflow-hidden flex flex-col font-pixel">
            <canvas ref={canvasRef} className="absolute inset-0 -z-10" />
            <style>{`
                .pixelated { image-rendering: pixelated; }
                .custom-scrollbar::-webkit-scrollbar { width: 12px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.4); border-left: 2px solid #000; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #FFBF00; border: 2px solid #000; }
                .pixel-border { border: 2px solid black; box-shadow: 4px 4px 0 rgba(0,0,0,0.3); }
            `}</style>

            {/* ШАПКА */}
            <div className="container mx-auto px-4 md:px-8 lg:px-[5.5rem] pt-[1.125rem] flex-shrink-0 relative z-20">
                <Navbar />
                <div className="mt-4">
                    <Stepper />
                </div>
            </div>

            {/* ОСНОВНОЙ КОНТЕНТ */}
            <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-8 px-4 md:px-8 lg:px-[5.5rem] pb-8 mt-4">
                
                {/* ЛЕВАЯ КОЛОНКА: СПИСОК ТОВАРОВ */}
                <div className="flex-1 flex flex-col min-h-0 order-2 lg:order-1">
                    {/* Заголовок этапа */}
                    <div className="flex items-center justify-between mb-4 bg-black/40 backdrop-blur-sm p-3 border-2 border-black">
                        <div className="flex items-center gap-4">
                            <span className="text-[#FFBF00] text-lg md:text-xl uppercase tracking-widest">Шаг {currentStep + 1}: {CATEGORIES[currentStep].label}</span>
                        </div>
                        {!CATEGORIES[currentStep].mandatory && (
                            <button 
                                onClick={handleSkip}
                                className="text-white/60 hover:text-[#FFBF00] uppercase text-xs md:text-sm flex items-center gap-2 transition-colors"
                            >
                                Пропустить <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* Поиск и Фильтр */}
                    <div className="flex gap-4 mb-6 flex-shrink-0 relative">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder={`Поиск ${CATEGORIES[currentStep].label.toLowerCase()}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-12 bg-[rgba(217,217,217,0.8)] text-black px-4 border-2 border-black shadow-[inset_-4px_-4px_0_rgba(0,0,0,0.3)] focus:outline-none placeholder-gray-600"
                            />
                            <Search className="absolute right-3 top-2.5 text-black w-6 h-6" />
                        </div>
                        
                        <button 
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`w-12 h-12 flex items-center justify-center border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,0.3)] transition-all
                                ${isFilterOpen ? 'bg-[#FFBF00] scale-95 shadow-none' : 'bg-[rgba(217,217,217,0.8)] hover:bg-[#FFBF00]'}`}
                        >
                            <Filter size={24} className="text-black" />
                        </button>

                        {/* ВЫПАДАЮЩЕЕ ОКНО ФИЛЬТРОВ */}
                        {isFilterOpen && (
                            <div className="absolute top-14 right-0 w-64 bg-[#2a2a2a] border-2 border-black shadow-[8px_8px_0_rgba(0,0,0,0.5)] z-[100] p-4 font-pixel">
                                <div className="flex justify-between items-center mb-3 border-b border-white/20 pb-2">
                                    <span className="text-[#FFBF00] uppercase text-sm">Фильтры</span>
                                    <X size={16} className="text-white cursor-pointer" onClick={() => setIsFilterOpen(false)} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    {FILTER_OPTIONS[selectedCategory]?.map(option => (
                                        <label key={option} className="flex items-center gap-3 cursor-pointer group">
                                            <div 
                                                onClick={() => toggleFilter(option)}
                                                className={`w-5 h-5 border-2 border-black flex items-center justify-center transition-colors
                                                    ${activeFilters.includes(option) ? 'bg-[#FFBF00]' : 'bg-gray-400 group-hover:bg-gray-300'}`}
                                            >
                                                {activeFilters.includes(option) && <div className="w-2 h-2 bg-black" />}
                                            </div>
                                            <span className="text-white text-sm uppercase">{option}</span>
                                        </label>
                                    ))}
                                </div>
                                {activeFilters.length > 0 && (
                                    <button 
                                        onClick={() => setActiveFilters([])}
                                        className="mt-4 w-full py-1 text-xs text-[#FFBF00] uppercase border border-[#FFBF00]/30 hover:bg-[#FFBF00] hover:text-black transition-all"
                                    >
                                        Сбросить
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Сетка товаров */}
                    <div className="flex-1 overflow-y-auto pr-2 md:pr-4 custom-scrollbar min-h-[300px]">
                        {loading ? (
                            <div className="text-white text-2xl text-center mt-20 drop-shadow-md">Загрузка товаров...</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pb-4">
                                {filteredProducts.map((product) => {
                                    const isEquipped = equipment[product.category]?.id === product.id;
                                    return (
                                        <div
                                            key={product.id}
                                            className={`group relative bg-black/50 backdrop-blur-sm border-2 p-4 transition-all flex flex-col
                                                ${isEquipped ? 'border-[#FFBF00] shadow-[0_0_15px_rgba(255,191,0,0.4)]' : 'border-black hover:border-[#FFBF00]'}`}
                                        >
                                            <div className="h-40 bg-white/5 mb-4 flex items-center justify-center p-2 border border-black overflow-hidden relative">
                                                <img
                                                    src={product.image_url || 'https://via.placeholder.com/150?text=No+Image'}
                                                    alt={product.name}
                                                    className="w-full h-full object-contain drop-shadow-lg pixelated group-hover:scale-110 transition-transform"
                                                />
                                                {isEquipped && (
                                                    <div className="absolute top-2 right-2 bg-[#FFBF00] text-black text-[10px] px-2 py-0.5 font-bold border border-black uppercase">
                                                        Надето
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className="text-lg mb-4 text-white uppercase truncate drop-shadow-md">{product.name}</h3>
                                            
                                            <div className="grid grid-cols-2 gap-3 mt-auto">
                                                <button 
                                                    onClick={() => navigate(`/equipment/${product.id}`)}
                                                    className="py-2 bg-white/10 hover:bg-white/20 text-white border-2 border-black uppercase text-xs transition-all shadow-[2px_2px_0_rgba(0,0,0,0.3)]"
                                                >
                                                    Инфо
                                                </button>
                                                <button 
                                                    onClick={() => handleEquip(product)}
                                                    className={`py-2 uppercase text-xs font-bold border-2 border-black transition-all shadow-[2px_2px_0_rgba(0,0,0,0.3)]
                                                        ${isEquipped ? 'bg-[#FFBF00] text-black shadow-none translate-x-0.5 translate-y-0.5' 
                                                                     : 'bg-[#FFBF00] text-black hover:bg-[#FFD700]'}`}
                                                >
                                                    {isEquipped ? 'Выбрано' : 'Выбрать'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Карточка "Своя удочка" */}
                                {selectedCategory === 'удочка' && !loading && (
                                    <div 
                                        onClick={() => setShowCustomRodModal(true)}
                                        className="group relative bg-[#1a1a1a]/80 backdrop-blur-sm border-2 border-dashed border-gray-500 p-4 transition-all cursor-pointer flex flex-col items-center justify-center hover:border-[#FFBF00] hover:bg-black/60 min-h-[200px]"
                                    >
                                        <div className="w-16 h-16 border-2 border-dashed border-gray-500 rounded-full flex items-center justify-center mb-4 group-hover:border-[#FFBF00]">
                                            <span className="text-3xl text-gray-500 group-hover:text-[#FFBF00]">+</span>
                                        </div>
                                        <span className="text-gray-400 group-hover:text-[#FFBF00] uppercase text-sm text-center">Не нашли свою удочку?</span>
                                    </div>
                                )}

                                {!loading && filteredProducts.length === 0 && selectedCategory !== 'удочка' && (
                                    <div className="col-span-full text-center text-white py-10 text-xl bg-black/50 border-2 border-black">
                                        В этой категории пока нет товаров...
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* ПРАВАЯ КОЛОНКА: ДЕДУШКА И КНОПКА "ДАЛЕЕ" */}
                <div className="w-full lg:w-[400px] flex-shrink-0 flex flex-col gap-4 order-1 lg:order-2">
                    
                    {/* Карточка персонажа */}
                    <div className="h-[400px] lg:flex-1 bg-black/40 backdrop-blur-md border-2 border-black shadow-[8px_8px_0_rgba(0,0,0,0.6)] flex flex-col relative overflow-hidden">
                        {/* Добавили p-4 для отступов со всех сторон, чтобы дед не прилипал к рамке */}
                        <div className="relative flex-1 w-full h-full flex items-center justify-center p-4">
                            
                            {/* Убрали scale-[1.3], origin-bottom и translate-y-6 */}
                            <div className="relative w-full h-full">
                                <img src={grandpaBase} alt="Base" className="absolute inset-0 w-full h-full object-contain z-10 pixelated" />
                                
                                {equipment['обувь']?.preview_url && (
                                    <img src={equipment['обувь'].preview_url} className="absolute inset-0 w-full h-full object-contain z-20 pixelated" />
                                )}
                                {equipment['штаны']?.preview_url && (
                                    <img src={equipment['штаны'].preview_url} className="absolute inset-0 w-full h-full object-contain z-30 pixelated" />
                                )}
                                {equipment['куртка']?.preview_url && (
                                    <img src={equipment['куртка'].preview_url} className="absolute inset-0 w-full h-full object-contain z-40 pixelated" />
                                )}
                                {equipment['головной убор']?.preview_url && (
                                    <img src={equipment['головной убор'].preview_url} className="absolute inset-0 w-full h-full object-contain z-[45] pixelated" />
                                )}
                                {equipment['удочка']?.preview_url && (
                                    <img src={equipment['удочка'].preview_url} className="absolute inset-0 w-full h-full object-contain z-50 pixelated" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Блок перехода дальше */}
                    <div className="bg-black/60 backdrop-blur-md border-2 border-black shadow-[8px_8px_0_rgba(0,0,0,0.6)] p-4 flex flex-col gap-3">
                        <div className="flex justify-between items-end border-b-2 border-white/20 pb-2 px-1">
                            <span className="text-gray-300 text-sm uppercase">Прогресс сбора:</span>
                            <span className="text-[#FFBF00] text-xl font-bold drop-shadow-[1px_1px_0_rgba(0,0,0,1)]">
                                {Object.values(equipment).filter(Boolean).length} / 5
                            </span>
                        </div>
                        <div className="flex gap-3">
                            {currentStep > 0 && (
                                <button 
                                    onClick={handlePrevStep}
                                    className="w-14 h-14 flex-shrink-0 flex items-center justify-center border-2 border-black bg-white/20 text-white shadow-[4px_4px_0_rgba(0,0,0,1)] hover:bg-white/30 active:translate-y-1 active:shadow-none cursor-pointer transition-all"
                                >
                                    <ArrowLeft size={22} />
                                </button>
                            )}
                            <button 
                                onClick={handleNextStep}
                                disabled={CATEGORIES[currentStep].mandatory && !equipment[selectedCategory]}
                                className={`flex-1 h-14 font-pixel uppercase text-lg transition-all flex items-center justify-center gap-3 border-2 border-black
                                    ${(CATEGORIES[currentStep].mandatory && !equipment[selectedCategory])
                                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-80'
                                        : 'bg-[#FFBF00] text-black shadow-[4px_4px_0_rgba(0,0,0,1)] hover:bg-[#FFD700] active:translate-y-1 active:shadow-none cursor-pointer'}
                                `}
                            >
                                {currentStep < CATEGORIES.length - 1 ? 'Далее' : 'К наживкам'} <ArrowRight size={22} />
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* МОДАЛКА ДЛЯ СВОЕЙ УДОЧКИ */}
            {showCustomRodModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
                    <div className="bg-[#2a2a2a] border-4 border-black p-6 w-full max-w-md shadow-[10px_10px_0_rgba(0,0,0,0.5)]">
                        <h2 className="text-[#FFBF00] text-xl mb-4 uppercase">Добавить свою удочку</h2>
                        <p className="text-white/60 text-sm mb-4 uppercase">Введите название вашей удочки. Администратор добавит её в базу позже.</p>
                        <input 
                            type="text"
                            value={customRodName}
                            onChange={(e) => setCustomRodName(e.target.value)}
                            placeholder="Название модели..."
                            className="w-full h-12 bg-gray-200 text-black px-4 border-2 border-black focus:outline-none mb-6"
                            autoFocus
                        />
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setShowCustomRodModal(false)}
                                className="flex-1 py-3 bg-gray-600 text-white border-2 border-black uppercase text-sm hover:bg-gray-500 transition-all shadow-[4px_4px_0_rgba(0,0,0,0.3)]"
                            >
                                Отмена
                            </button>
                            <button 
                                onClick={handleCustomRodSubmit}
                                className="flex-1 py-3 bg-[#FFBF00] text-black border-2 border-black uppercase text-sm font-bold hover:bg-[#FFD700] transition-all shadow-[4px_4px_0_rgba(0,0,0,0.3)]"
                            >
                                Сохранить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EquipmentPage;