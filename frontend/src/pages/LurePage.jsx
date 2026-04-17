import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Stepper from '../components/Stepper';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useRecommendation } from '../context/RecommendationContext';
import { Search, ArrowRight } from 'lucide-react';

// Картинки
import bgImg from '../assets/images/background/img.png';

const LurePage = () => {
    const navigate = useNavigate();
    const { selections, updateSelection } = useRecommendation();
    
    const [lures, setLures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchLures = async () => {
            try {
                setLoading(true);
                const response = await api.get('/api/lures');
                setLures(response.data.data.lures ||[]);
            } catch (error) {
                console.error("Ошибка загрузки наживок:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLures();
    },[]);

    const filteredLures = lures.filter(lure => 
        lure.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        // Убрали overflow-hidden, теперь скроллится вся страница
        <div className="relative min-h-screen w-full flex flex-col font-pixel">
            
            {/* ФОН: fixed вместо absolute. Он всегда размером с экран и не растягивается */}
            <div 
                className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${bgImg})` }}
            >
                <div className="absolute inset-0 bg-black/60"></div>
            </div>

            <style>{`
                .pixelated { image-rendering: pixelated; }
                /* Исправленный line-clamp с запасом высоты строки */
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    word-break: break-word;
                }
            `}</style>

            {/* Шапка */}
            <div className="container mx-auto px-4 lg:px-[5.5rem] pt-[1.125rem] flex-shrink-0 relative z-20">
                <Navbar />
                <div className="mt-4">
                    <Stepper />
                </div>
            </div>

            {/* Основной контент */}
            <div className="flex-1 flex flex-col px-4 lg:px-[5.5rem] mt-4 pb-12">
                
                {/* ПЛАШКА ЗАГОЛОВКА И ПОИСКА */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-[#9D7F50]/90 p-4 border-2 border-black shadow-[inset_-4px_-4px_0_rgba(0,0,0,0.3)] gap-4">
                    <h1 className="text-[#FFBF00] text-xl sm:text-2xl md:text-3xl drop-shadow-[2px_2px_0_rgba(0,0,0,1)] uppercase text-center sm:text-left">
                        Коробка для наживок
                    </h1>
                    <div className="relative w-full sm:w-72">
                        <input 
                            type="text" 
                            placeholder="Поиск..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[rgba(217,217,217,0.8)] text-black placeholder-gray-600 border-2 border-black p-2 shadow-[inset_-2px_-2px_0_rgba(0,0,0,0.3)] focus:outline-none focus:border-[#FFBF00] font-sans"
                        />
                        <Search className="absolute right-2 top-2.5 text-black" size={20} />
                    </div>
                </div>

                {/* ЛЕВАЯ И ПРАВАЯ ПАНЕЛИ */}
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 relative">
                    
                    {/* ЛЕВАЯ ПАНЕЛЬ: СЕТКА НАЖИВОК (Без внутреннего скролла) */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="text-white text-xl text-center mt-20 drop-shadow-md">Загрузка снастей...</div>
                        ) : filteredLures.length === 0 ? (
                            <div className="text-gray-400 text-lg text-center mt-20">Ничего не найдено</div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                                {filteredLures.map((lure) => {
                                    const isSelected = selections.lure?.id === lure.id;
                                    return (
                                        <div
                                            key={lure.id}
                                            onClick={() => updateSelection('lure', lure)}
                                            className={`bg-black/50 backdrop-blur-sm border-2 transition-all cursor-pointer flex flex-col p-2 relative group
                                                ${isSelected ? 'border-[#FFBF00] shadow-[0_0_15px_rgba(254,191,0,0.4)] -translate-y-1 z-10' : 'border-black hover:border-[#FFBF00]'}
                                            `}
                                        >
                                            {/* Блок картинки (Строго фиксированная высота) */}
                                            <div className="w-full h-24 sm:h-28 flex items-center justify-center mb-2 bg-black/30 border border-transparent group-hover:border-white/10 relative overflow-hidden">
                                                <img 
                                                    src={lure.image_url || '/src/assets/images/spinning/lure_placeholder.png'} 
                                                    alt=""
                                                    // Изменили классы здесь:
                                                    className="w-full h-full p-2 object-contain pixelated group-hover:scale-110 transition-transform relative z-10"
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                            </div>

                                            {/* Блок текста. h-10 = 40px, этого точно хватит на 2 строки + хвостики букв */}
                                            {/* items-start выравнивает текст по верхнему краю, чтобы он не уезжал вниз */}
                                            <div className="h-10 w-full flex items-start justify-center pt-1" title={lure.name}>
                                                <span className="text-[10px] sm:text-[11px] text-white text-center uppercase leading-[1.3] line-clamp-2 w-full px-1 drop-shadow-md">
                                                    {lure.name}
                                                </span>
                                            </div>

                                            {/* Маркер редкости */}
                                            {lure.is_rare && (
                                                <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-purple-500 shadow-[0_0_5px_purple] border border-black rounded-full" title="Редкая снасть"></div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* ПРАВАЯ ПАНЕЛЬ: ОПИСАНИЕ И КНОПКА */}
                    {/* lg:sticky lg:top-4 позволяет панели плавать рядом, пока ты скроллишь список вниз */}
                    <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4 lg:sticky lg:top-4 h-fit">
                        
                        {/* Карточка описания */}
                        <div className="bg-black/60 border-2 border-black p-4 sm:p-6 backdrop-blur-md flex flex-col shadow-[8px_8px_0_rgba(0,0,0,0.6)] min-h-[200px]">
                            {selections.lure ? (
                                <>
                                    <div className="border-b-2 border-white/20 pb-3 mb-3">
                                        <h2 className="text-[#FFBF00] text-lg sm:text-xl uppercase mb-1 drop-shadow-[2px_2px_0_rgba(0,0,0,1)] leading-tight">
                                            {selections.lure.name}
                                        </h2>
                                        <p className="text-gray-400 text-[10px] uppercase">
                                            {selections.lure.category?.name || 'Общая категория'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-200 text-xs sm:text-sm leading-relaxed drop-shadow-md">
                                            {selections.lure.description || 'Описание этой наживки пока не добавлено в энциклопедию.'}
                                        </p>
                                    </div>
                                    {selections.lure.is_rare && (
                                        <div className="mt-4 p-2 bg-purple-900/60 border-2 border-purple-500 text-purple-200 text-center text-[10px] sm:text-xs font-bold uppercase shadow-[inset_0_0_10px_purple]">
                                            Редкая снасть
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 py-8">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-dashed border-white mb-4 flex items-center justify-center">
                                        <span className="text-2xl">?</span>
                                    </div>
                                    <p className="text-white text-xs sm:text-sm">Выберите наживку из коробки</p>
                                </div>
                            )}
                        </div>

                        {/* Блок перехода дальше */}
                        <div className="bg-black/70 backdrop-blur-md border-2 border-black shadow-[8px_8px_0_rgba(0,0,0,0.6)] p-4 flex flex-col gap-3">
                            <div className="flex justify-between items-end border-b-2 border-white/20 pb-2 px-1">
                                <span className="text-gray-400 text-[10px] uppercase">Выбрано:</span>
                                <span className="text-[#FFBF00] text-xs sm:text-sm font-bold drop-shadow-[1px_1px_0_rgba(0,0,0,1)] line-clamp-1 max-w-[150px] text-right" title={selections.lure?.name}>
                                    {selections.lure ? selections.lure.name : 'Ничего'}
                                </span>
                            </div>
                            <button 
                                onClick={() => navigate('/groundbaits')}
                                disabled={!selections.lure}
                                className={`w-full h-12 sm:h-14 font-pixel uppercase text-sm sm:text-base transition-all flex items-center justify-center gap-2 border-2 border-black
                                    ${selections.lure 
                                        ? 'bg-[#FFBF00] text-black shadow-[4px_4px_0_rgba(0,0,0,1)] hover:bg-[#FFD700] hover:-translate-y-1 hover:shadow-[6px_6px_0_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none cursor-pointer' 
                                        : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-80'}
                                `}
                            >
                                К прикормке <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LurePage;