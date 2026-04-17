import React, { useState, useMemo, useRef, useEffect } from 'react';
import {Search, ChevronDown, MapPin, Map as MapIcon, List as ListIcon, Info} from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Stepper from "../components/Stepper.jsx";
import { useLocation, useNavigate, Link } from 'react-router-dom';
import bgImgSrc from "../assets/images/background/lake_bg.jpg";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import api from '../api/api';
import { useRecommendation } from '../context/RecommendationContext';

const pixelIcon = new L.divIcon({
    className: 'custom-div-icon',
    html: `<div class="w-10 h-10 bg-yellow-400 border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] flex items-center justify-center pixelated overflow-hidden"><img src="/src/assets/images/mini_lake.jpg" class="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" /></div>`,
    iconSize:[40, 40],
    iconAnchor:[20, 40],
    popupAnchor:[0, -40]
});

// Сократили дефолтные названия
const CATEGORIES =[
    { value: 'all', label: 'Виды'},
    { value: 'Озеро', label: 'Озера'},
    { value: 'Река', label: 'Реки'},
    { value: 'Водохранилище', label: 'Водохранилище'},
    { value: 'Пруд', label: 'Пруд'},
    { value: 'Карьер', label: 'Карьер'},
    { value: 'Плат', label: 'Платные пруды'},
];

const REGIONS =[
    { value: 'all', label: 'Регионы'},
    { value: 'Подмосковье', label: 'Подмосковье'},
    { value: 'Тверская область', label: 'Тверская обл.'},
    { value: 'Калужская область', label: 'Калужская обл.'},
];

const LakeDetailPage = () => {
    const canvasRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { selections, updateSelection } = useRecommendation();
    
    const [waterbodies, setWaterbodies] = useState([]);
    const [loading, setLoading] = useState(true);
    const[selectedCategory, setSelectedCategory] = useState(() => {
        return location.state?.category || 'all';
    });
    const [selectedRegion, setSelectedRegion] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFishId, setSelectedFishId] = useState(() => {
        return selections.fish ? selections.fish.id.toString() : 'all';
    });
    const [viewMode, setViewMode] = useState('list');
    const [fishes, setFishes] = useState([]);
    const [sortBy, setSortBy] = useState('name');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const params = {};
                if (selectedRegion !== 'all') params.region = selectedRegion;
                if (selectedFishId !== 'all') params.fish_id = selectedFishId;
                const[waterRes, fishRes] = await Promise.all([
                    api.get('/api/waterbody', { params }),
                    api.get('/api/fishes')
                ]);
                setWaterbodies(waterRes.data.data.waterbodies || []);
                setFishes(fishRes.data.data.fishes ||[]);
            } catch (error) {
                console.error("Ошибка загрузки данных:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    },[selectedRegion, selectedFishId]);

    const filteredWater = useMemo(() => {
        let result = waterbodies.filter((water) => {
            let matchesCategory = true;
            if (selectedCategory !== 'all' && water.type) {
                matchesCategory = water.type.toLowerCase().includes(selectedCategory.toLowerCase());
            }
            const matchesSearch = water.name.toLowerCase().includes(searchQuery.toLowerCase());
            
            return matchesCategory && matchesSearch;
        });
        if (sortBy === 'rating') {
            result = [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        } else {
            result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        }
        return result;
    },[waterbodies, selectedCategory, searchQuery, sortBy]);

    const handleSelectWaterbody = (water) => {
        updateSelection('waterbody', water);
        navigate('/equipment');
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationId;
        const bg = new Image();
        bg.src = bgImgSrc;
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.imageSmoothingEnabled = false;
            if (bg.complete) {
                ctx.drawImage(bg, 0, 0, canvas.width, canvas.height) ;
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

    // Главный контейнер теперь имеет общий скролл страницы
    return (
        <div className="relative w-full h-screen overflow-y-auto overflow-x-hidden flex flex-col font-pixel custom-scrollbar">
            {/* Canvas зафиксирован (fixed) чтобы не уезжал при скролле */}
            <canvas ref={canvasRef} className="fixed inset-0 w-full h-full -z-10"></canvas>
            <style>{`
            .pixelated { image-rendering: pixelated; }
            input[type="date"]::-webkit-calendar-picker-indicator { cursor: pointer; opacity: 0.6; filter: invert(1); }
            .custom-scrollbar::-webkit-scrollbar { width: 16px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.4); border-left: 2px solid #000; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #eab308; border: 2px solid #000; box-shadow: inset -2px -2px 0px rgba(0,0,0,0.3); }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #facc15; }
            .leaflet-tile { filter: sepia(30%) contrast(120%) grayscale(40%) hue-rotate(15deg); }
            .pixel-popup .leaflet-popup-content-wrapper { background: #EAD4AA; border: 3px solid black; border-radius: 0; box-shadow: 6px 6px 0 rgba(0,0,0,0.9); padding: 0; }
            .pixel-popup .leaflet-popup-content { margin: 10px; }
            .pixel-popup .leaflet-popup-tip-container { display: none; }
            .leaflet-container { background: #e5d9c5; }
            `}</style>
            
            <div className="container mx-auto px-4 md:px-8 lg:px-[5.5rem] pt-[1.125rem] flex-shrink-0 relative z-20">
                <Navbar />
                <div className="mt-4">
                    <Stepper />
                </div>
            </div>

            {/* БЛОК ПОИСКА И ФИЛЬТРОВ */}
            <div className="flex-shrink-0 px-4 md:px-8 lg:px-[5.5rem] mt-4 mb-4 relative z-10 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 w-full max-w-6xl mx-auto">
                    <div className="relative col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-1">
                        <input
                            type="text"
                            placeholder="Поиск..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-12 bg-[rgba(217,217,217,0.7)] text-lg pl-4 pr-10 border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,0.9)] focus:outline-none placeholder-gray-600 truncate"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-black w-6 h-6 pointer-events-none"/>
                    </div>
                    
                    <div className="relative w-full">
                        <select
                            value={selectedFishId}
                            onChange={(e) => setSelectedFishId(e.target.value)}
                            className="w-full h-12 appearance-none bg-[rgba(217,217,217,0.7)] text-lg pl-4 pr-10 border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,0.9)] focus:outline-none cursor-pointer hover:bg-white/80 transition-colors truncate"
                        >
                            <option value="all">Рыбы</option>
                            {fishes.map(fish => (
                                <option key={fish.id} value={fish.id.toString()}>{fish.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-black w-5 h-5 pointer-events-none" />
                    </div>
                    
                    <div className="relative w-full">
                        <select
                            value={selectedRegion}
                            onChange={(e) => setSelectedRegion(e.target.value)}
                            className="w-full h-12 appearance-none bg-[rgba(217,217,217,0.7)] text-lg pl-4 pr-10 border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,0.9)] focus:outline-none cursor-pointer hover:bg-white/80 transition-colors truncate"
                        >
                            {REGIONS.map(reg => (
                                <option key={reg.value} value={reg.value}>{reg.label}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-black w-5 h-5 pointer-events-none" />
                    </div>
                    
                    <div className="relative w-full">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full h-12 appearance-none bg-[rgba(217,217,217,0.7)] text-lg pl-4 pr-10 border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,0.9)] focus:outline-none cursor-pointer hover:bg-white/80 transition-colors truncate"
                        >
                            {CATEGORIES.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-black w-5 h-5 pointer-events-none" />
                    </div>
                    
                    <div className="relative w-full">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full h-12 appearance-none bg-[rgba(217,217,217,0.7)] text-lg pl-4 pr-10 border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,0.9)] focus:outline-none cursor-pointer hover:bg-white/80 transition-colors truncate"
                        >
                            <option value="name">Имя</option>
                            <option value="rating">Рейтинг</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-black w-5 h-5 pointer-events-none" />
                    </div>
                    
                    <button 
                        onClick={() => setViewMode(v => v === 'list' ? 'map' : 'list')}
                        className="w-full h-12 bg-yellow-400 text-black px-4 border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,0.9)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_rgba(0,0,0,0.9)] transition-all flex items-center gap-2 font-bold justify-center"
                    >
                        {viewMode === 'list' ? <MapIcon size={20} /> : <ListIcon size={20} />}
                        <span className="truncate">{viewMode === 'list' ? 'Карта' : 'Список'}</span>
                    </button>
                </div>
            </div>

            {/* КОНТЕНТ (СПИСОК ИЛИ КАРТА) */}
            {viewMode === 'list' ? (
                // Убрали overflow-y-auto, список растягивается естественным образом, скроллит вся страница
                <div className="w-full px-4 md:px-8 lg:px-[5.5rem] pb-8 relative z-10">
                    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
                        {loading ? (
                             <div className="text-center text-white text-2xl mt-10 drop-shadow-md">Загрузка водоемов...</div>
                        ) : filteredWater.map((water) => (
                            <div
                                key={water.id}
                                onClick={() => handleSelectWaterbody(water)}
                                className="relative bg-[rgba(217,217,217,0.7)] backdrop-blur-sm border-2 border-black p-4 shadow-[6px_6px_0_rgba(0,0,0,0.7)] flex flex-col md:flex-row gap-6 hover:border-yellow-400 hover:shadow-[6px_6px_0_rgba(234,179,8,0.4)] transition-all cursor-pointer group"
                            >
                                <div className="w-full md:w-64 h-48 md:h-40 flex-shrink-0 border-2 border-black/50 overflow-hidden bg-gray-300">
                                    <img
                                        src={water.image_url || '/src/assets/images/mini_lake.jpg'}
                                        alt={water.name}
                                        className="w-full h-full object-cover pixelated group-hover:scale-110 transition-transform duration-500"
                                        onError={(e) => {e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'}}
                                    />
                                </div>
                                <div className="flex-1 flex flex-col justify-center">
                                    <div className="flex flex-wrap gap-2 justify-between items-start mb-2">
                                        <h3 className="text-3xl group-hover:text-yellow-600 transition-colors break-words">{water.name}</h3>
                                        <div className="flex items-center gap-1 bg-black/20 px-2 py-1 border border-black/30 flex-shrink-0">
                                            <span className="text-yellow-400 text-xl">★</span>
                                            <span className="text-white text-lg">{water.rating?.toFixed(1) || '0.0'}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-lg text-gray-800">
                                        <p><span className="text-gray-900 font-bold">Тип:</span> {water.type} {water.region ? `| ${water.region}` : ''}</p>
                                        <p><span className="text-gray-900 font-bold">Средняя глубина:</span> {water.avg_depth} м.</p>
                                        <p className="line-clamp-2"><span className="text-gray-900 font-bold">Описание:</span> {water.description || "Нет описания"}</p>
                                    </div>
                                </div>
                                <div className="flex flex-row md:flex-col gap-4 justify-center w-full md:w-48 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                    <button 
                                        onClick={() => setViewMode('map')}
                                        className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black text-lg py-3 border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] active:shadow-[0_0_0_0] active:translate-x-1 active:translate-y-1 transition-all flex items-center justify-center gap-2"
                                    >
                                        <MapPin size={18} />
                                        <span className="hidden sm:inline">На карте</span>
                                    </button>
                                    <Link
                                        to={`/lakes/${water.id}`}
                                        className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black text-lg py-3 border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] active:shadow-[0_0_0_0] active:translate-x-1 active:translate-y-1 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Info size={18} />
                                        <span className="hidden sm:inline">Подробнее</span>
                                    </Link>
                                </div>
                            </div>
                        ))}
                        {!loading && filteredWater.length === 0 && (
                            <div className="text-center text-white text-2xl mt-10 drop-shadow-md">
                                Водоемы по вашему запросу не найдены...
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="w-full px-4 md:px-8 lg:px-[5.5rem] pb-8 relative z-10 flex flex-col">
                    {/* Карта теперь имеет фиксированную высоту 600px */}
                    <div className="w-full max-w-6xl mx-auto h-[600px] border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,0.9)] bg-[#EAD4AA] p-2">
                        <MapContainer center={[55.75, 37.57]} zoom={8} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                            />
                            {filteredWater.map((water) => (
                                <Marker key={water.id} position={[water.latitude || 55.75, water.longitude || 37.57]} icon={pixelIcon}>
                                    <Popup className="pixel-popup" closeButton={false}>
                                        <div className="font-pixel flex flex-col items-center gap-2 w-48">
                                            <h3 className="text-lg font-bold text-center border-b-2 border-black/50 w-full pb-1">{water.name}</h3>
                                            <img src={water.image_url || '/src/assets/images/mini_lake.jpg'} alt={water.name} className="w-full h-24 object-cover border-2 border-black pixelated" />
                                            <p className="text-sm">Тип: {water.type}</p>
                                            <button 
                                                onClick={() => handleSelectWaterbody(water)}
                                                className="w-full bg-yellow-400 text-black border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] py-1.5 font-bold hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 active:translate-x-1 mt-1"
                                            >
                                                Выбрать водоем
                                            </button>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LakeDetailPage;