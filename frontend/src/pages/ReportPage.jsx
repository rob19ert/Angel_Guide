import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useRecommendation } from '../context/RecommendationContext';
import api from '../api/api';
import bgImg from '../assets/images/background/lake_bg.jpg';
import { Fish, MapPin, Package, AlertCircle, Bookmark } from 'lucide-react';

const ReportPage = () => {
    const canvasRef = useRef(null);
    const { selections, resetSelections } = useRecommendation();
    const navigate = useNavigate();
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // Сохраняем исходные выборы, чтобы не потерять их при сбросе
    const [savedSelections, setSavedSelections] = useState(null);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const body = {
                    waterbody_id: selections.waterbody?.id || 1,
                    season_id: 1, // заглушка сезона
                    weather_id: 1, // заглушка погоды
                    fish_id: selections.fish?.id,
                    user_rod: selections.equipment?.['удочка']?.name,
                    user_lure: selections.lure?.name,
                    user_groundbait: selections.groundbait?.name,
                    user_clothes: selections.equipment?.['куртка']?.name
                };
                const res = await api.post('/api/recommendation', body);
                setReportData(res.data.data);
                setSavedSelections(selections);
            } catch(e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
        
        // Очищаем черновик при выходе со страницы
        return () => {
            resetSelections();
        };
    }, []); // Убираем selections из зависимостей

    const handleSavePlan = async () => {
        if (!reportData || !savedSelections) return;
        
        setIsSaving(true);
        try {
            const body = {
                fish_id: savedSelections.fish?.id,
                waterbody_id: savedSelections.waterbody?.id,
                rod_id: savedSelections.equipment?.['удочка']?.id,
                jacket_id: savedSelections.equipment?.['куртка']?.id,
                pants_id: savedSelections.equipment?.['штаны']?.id,
                shoes_id: savedSelections.equipment?.['обувь']?.id,
                head_id: savedSelections.equipment?.['головной убор']?.id,
                lure_id: savedSelections.lure?.id,
                groundbait_id: savedSelections.groundbait?.id,
                advice: reportData.advice_text
            };
            
            await api.post('/api/saved_recommendations', body);
            setIsSaved(true);
            alert("Сборка успешно сохранена в профиль!");
        } catch (e) {
            console.error(e);
            alert("Ошибка при сохранении сборки. Вы авторизованы?");
        } finally {
            setIsSaving(false);
        }
    };

    // Анимация фона
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const bg = new Image(); bg.src = bgImg;
        let animId;

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.imageSmoothingEnabled = false;
            if (bg.complete) {
                ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
            }
            animId = requestAnimationFrame(animate);
        };

        bg.onload = animate;
        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className="min-h-screen w-full relative overflow-hidden font-pixel">
            <canvas ref={canvasRef} className="absolute inset-0 -z-10" />
            <style>{`
                .pixelated { image-rendering: pixelated; }
                .custom-scrollbar::-webkit-scrollbar { width: 12px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.4); border-left: 2px solid #000; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #FFBF00; border: 2px solid #000; }
            `}</style>

            <div className="container mx-auto px-4 md:px-[5.5rem] pt-[1.125rem] z-20 relative">
                <Navbar />
            </div>

            <div className="relative z-10 flex flex-col items-center mt-10 px-4 pb-12 w-full max-w-6xl mx-auto h-[calc(100vh-140px)]">
                <h1 className="text-5xl text-yellow-400 drop-shadow-[4px_4px_0_black] mb-8 uppercase text-center">
                    Отчет от Деда
                </h1>

                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="text-white text-3xl animate-pulse drop-shadow-[4px_4px_0_black]">Дед анализирует вашу сборку...</div>
                    </div>
                ) : !reportData ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-black/80 border-4 border-red-500 shadow-[8px_8px_0_rgba(0,0,0,1)]">
                        <AlertCircle className="text-red-500 w-20 h-20 mb-4" />
                        <div className="text-white text-2xl">Связь с Дедом потеряна... Попробуйте еще раз.</div>
                        <button onClick={() => navigate('/inventory')} className="mt-6 bg-yellow-500 text-black px-6 py-2 text-xl border-2 border-black hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0_black] transition-all">
                            Вернуться назад
                        </button>
                    </div>
                ) : (
                    <div className="w-full flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
                        {/* ЛЕВАЯ КОЛОНКА - Совет */}
                        <div className="flex-1 bg-black/70 backdrop-blur-md border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,1)] p-8 flex flex-col overflow-y-auto custom-scrollbar">
                            <h2 className="text-2xl text-yellow-400 mb-6 border-b-2 border-yellow-400/50 pb-2 flex gap-2 items-center">
                                Вердикт Деда
                            </h2>
                            <div className="text-white text-lg leading-relaxed whitespace-pre-line">
                                {reportData.advice_text}
                            </div>
                            <div className="mt-auto pt-8 flex flex-col gap-4">
                                <button 
                                    onClick={handleSavePlan}
                                    disabled={isSaving || isSaved}
                                    className={`w-full flex items-center justify-center gap-2 py-4 text-xl border-2 border-black shadow-[4px_4px_0_black] active:translate-y-1 active:shadow-none transition-all uppercase text-black ${isSaved ? 'bg-green-500' : 'bg-blue-400 hover:bg-blue-300'}`}
                                >
                                    <Bookmark />
                                    {isSaved ? "Сохранено!" : (isSaving ? "Сохранение..." : "Сохранить сборку")}
                                </button>
                                <button 
                                    onClick={() => navigate('/inventory')}
                                    className="w-full bg-yellow-500 hover:bg-yellow-400 border-2 border-black py-4 text-xl shadow-[4px_4px_0_black] active:translate-y-1 active:shadow-none transition-all uppercase text-black"
                                >
                                    Вернуться к сборке
                                </button>
                            </div>
                        </div>

                        {/* ПРАВАЯ КОЛОНКА - Рекомендации БД */}
                        <div className="flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
                            {/* Водоем и Рыба */}
                            <div className="bg-[#EAD4AA] border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,1)] p-6">
                                <h3 className="text-xl mb-4 border-b-2 border-black pb-2 flex gap-2 items-center"><MapPin/> Цель</h3>
                                <div className="text-lg">
                                    <p><b>Водоем:</b> {savedSelections?.waterbody?.name || "Не выбран"}</p>
                                    <p><b>Ожидаемая рыба:</b> {savedSelections?.fish?.name || "Любая"}</p>
                                </div>
                            </div>

                            {/* Рекомендуемые приманки */}
                            {reportData.recommended_lures?.length > 0 && (
                                <div className="bg-black/60 border-4 border-yellow-500 shadow-[8px_8px_0_rgba(0,0,0,1)] p-6">
                                    <h3 className="text-xl text-yellow-400 mb-4 border-b-2 border-yellow-500 pb-2 flex gap-2 items-center"><Fish/> Дед советует наживки:</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {reportData.recommended_lures.map(lure => (
                                            <div key={lure.id} className="bg-white/10 p-2 border border-white/20 text-white flex items-center gap-3">
                                                {lure.image_url ? <img src={lure.image_url} alt={lure.name} className="w-10 h-10 object-cover pixelated border border-black"/> : <div className="w-10 h-10 bg-black/50 border border-black flex items-center justify-center">🪱</div>}
                                                <span className="text-sm">{lure.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Рекомендуемый Инвентарь */}
                            {reportData.recommended_inventory?.length > 0 && (
                                <div className="bg-black/60 border-4 border-green-500 shadow-[8px_8px_0_rgba(0,0,0,1)] p-6">
                                    <h3 className="text-xl text-green-400 mb-4 border-b-2 border-green-500 pb-2 flex gap-2 items-center"><Package/> Лучшее снаряжение:</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {reportData.recommended_inventory.map(inv => (
                                            <div key={inv.id} className="bg-white/10 p-2 border border-white/20 text-white flex flex-col">
                                                <div className="flex items-center gap-3 mb-1">
                                                    {inv.image_url ? <img src={inv.image_url} alt={inv.name} className="w-10 h-10 object-cover pixelated border border-black"/> : <div className="w-10 h-10 bg-black/50 border border-black flex items-center justify-center">🎣</div>}
                                                    <span className="text-sm font-bold">{inv.name}</span>
                                                </div>
                                                <span className="text-xs text-green-300">[{inv.category}]</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportPage;