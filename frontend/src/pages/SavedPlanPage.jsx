import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/api';
import bgImg from '/src/assets/images/background/lake_bg.jpg';
import { Fish, MapPin, Package, AlertCircle, ArrowLeft, Trash2 } from 'lucide-react';

const SavedPlanPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const canvasRef = useRef(null);
    
    // Пытаемся получить данные из state (передано из ProfilePage), если нет - загружаем с бэкенда
    const [plan, setPlan] = useState(location.state?.plan || null);
    const [loading, setLoading] = useState(!plan);

    useEffect(() => {
        // Если план не передан через state, мы могли бы сделать запрос (например, обновить страницу). 
        // Но пока что у нас /api/saved_recommendations возвращает весь список.
        // Сделаем fallback-запрос
        if (!plan) {
            const fetchPlan = async () => {
                try {
                    setLoading(true);
                    const res = await api.get('/api/saved_recommendations');
                    const plans = res.data.data.saved_recommendations;
                    const foundPlan = plans.find(p => p.id === parseInt(id));
                    if (foundPlan) {
                        setPlan(foundPlan);
                    }
                } catch (e) {
                    console.error("Ошибка загрузки плана", e);
                } finally {
                    setLoading(false);
                }
            };
            fetchPlan();
        }
    }, [id, plan]);

    const handleDelete = async () => {
        if (!window.confirm("Удалить эту сохраненную сборку?")) return;
        try {
            await api.delete(`/api/saved_recommendations/${id}`);
            alert("Сборка удалена!");
            navigate('/profile');
        } catch(e) {
            console.error("Ошибка удаления", e);
            alert("Не удалось удалить сборку.");
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

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-black font-pixel text-white flex justify-center items-center">
                Загрузка сборки...
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="min-h-screen w-full bg-black font-pixel text-white flex flex-col justify-center items-center">
                <div className="text-2xl mb-4">Сборка не найдена.</div>
                <button onClick={() => navigate('/profile')} className="bg-yellow-500 text-black px-6 py-2">
                    Вернуться в профиль
                </button>
            </div>
        );
    }

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
                <div className="flex w-full justify-between items-end mb-8">
                    <button onClick={() => navigate('/profile')} className="text-yellow-400 flex items-center gap-2 hover:text-white transition-colors bg-black/50 px-4 py-2 border-2 border-yellow-400">
                        <ArrowLeft /> В профиль
                    </button>
                    <h1 className="text-4xl text-yellow-400 drop-shadow-[4px_4px_0_black] uppercase text-center flex-1">
                        Сохраненная Сборка
                    </h1>
                    <button onClick={handleDelete} className="text-red-500 hover:text-red-400 flex items-center gap-2 bg-black/50 px-4 py-2 border-2 border-red-500 transition-colors">
                        <Trash2 /> Удалить
                    </button>
                </div>

                <div className="w-full flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
                    {/* ЛЕВАЯ КОЛОНКА - Совет */}
                    <div className="flex-1 bg-black/70 backdrop-blur-md border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,1)] p-8 flex flex-col overflow-y-auto custom-scrollbar">
                        <h2 className="text-2xl text-yellow-400 mb-6 border-b-2 border-yellow-400/50 pb-2 flex gap-2 items-center">
                            Вердикт Деда
                        </h2>
                        <div className="text-white text-lg leading-relaxed whitespace-pre-line">
                            {plan.advice || "Совет не был сохранен."}
                        </div>
                        <p className="mt-8 text-gray-500 text-sm">
                            Сохранено: {new Date(plan.created_at).toLocaleString()}
                        </p>
                    </div>

                    {/* ПРАВАЯ КОЛОНКА - Выбранный инвентарь */}
                    <div className="flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
                        {/* Водоем и Рыба */}
                        <div className="bg-[#EAD4AA] border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,1)] p-6">
                            <h3 className="text-xl mb-4 border-b-2 border-black pb-2 flex gap-2 items-center"><MapPin/> Ваша Цель</h3>
                            <div className="text-lg">
                                <p><b>Водоем:</b> {plan.waterbody?.name || "Не выбран"}</p>
                                <p><b>Ожидаемая рыба:</b> {plan.fish?.name || "Любая"}</p>
                            </div>
                        </div>

                        {/* Ваш Инвентарь */}
                        <div className="bg-black/60 border-4 border-blue-500 shadow-[8px_8px_0_rgba(0,0,0,1)] p-6">
                            <h3 className="text-xl text-blue-400 mb-4 border-b-2 border-blue-500 pb-2 flex gap-2 items-center"><Package/> Экипировка</h3>
                            <div className="grid grid-cols-1 gap-2 text-white">
                                {plan.rod && <p><b>Удочка:</b> {plan.rod.name}</p>}
                                {plan.jacket && <p><b>Куртка:</b> {plan.jacket.name}</p>}
                                {plan.pants && <p><b>Штаны:</b> {plan.pants.name}</p>}
                                {plan.shoes && <p><b>Обувь:</b> {plan.shoes.name}</p>}
                                {plan.head && <p><b>Головной убор:</b> {plan.head.name}</p>}
                                {!plan.rod && !plan.jacket && !plan.pants && !plan.shoes && !plan.head && (
                                    <span className="text-gray-400 italic">Экипировка не была выбрана</span>
                                )}
                            </div>
                        </div>

                        {/* Наживка и прикормка */}
                        <div className="bg-black/60 border-4 border-yellow-500 shadow-[8px_8px_0_rgba(0,0,0,1)] p-6">
                            <h3 className="text-xl text-yellow-400 mb-4 border-b-2 border-yellow-500 pb-2 flex gap-2 items-center"><Fish/> Приманка и Прикормка</h3>
                            <div className="grid grid-cols-1 gap-2 text-white">
                                {plan.lure ? <p><b>Наживка:</b> {plan.lure.name}</p> : <p className="text-gray-400 italic">Наживка не выбрана</p>}
                                {plan.groundbait ? <p><b>Прикормка:</b> {plan.groundbait.name}</p> : <p className="text-gray-400 italic">Прикормка не выбрана</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SavedPlanPage;
