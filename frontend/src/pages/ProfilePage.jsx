import React, { useEffect, useRef, useState } from 'react';
import Navbar from "../components/Navbar.jsx";
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

// ИМПОРТЫ КАРТИНОК
import bgImageSrc from '/src/assets/images/background/prof_bg.jpg';
import avatarSrc from '../assets/images/ded-Photoroom.png';
import fishIconDefault from '../assets/images/fish.jpg';

const ProfilePage = () => {
    const canvasRef = useRef(null);
    const { logout } = useAuth();
    
    const [user, setUser] = useState({
        name: "Загрузка...",
        email: "...",
        registered_at: "..."
    });
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                // 1. В идеале тут должен быть эндпоинт /api/me, но пока возьмем список юзеров и найдем себя (упрощенно)
                // Или если бэкенд возвращает инфо о текущем юзере при логине - мы могли бы хранить это в контексте.
                // Сейчас просто сделаем запрос к уловам
                const catchRes = await api.get('/api/catch_posts');
                setHistory(catchRes.data.data.catch_posts || []);
                
                // Т.к. эндпоинта /api/me нет, пока оставим заглушку для профиля или возьмем данные из токена если расшифруем его
                setUser({
                    name: "Удачливый Рыбак",
                    email: "fisher@example.com",
                    registered_at: "10.04.2026"
                });

            } catch (error) {
                console.error("Ошибка загрузки профиля:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfileData();
    }, []);


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
                ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
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
        <div className="relative h-screen w-full flex flex-col font-pixel text-black overflow-hidden">
            <canvas ref={canvasRef} className="absolute inset-0 -z-10" />

            <style>{`
                .pixelated { image-rendering: pixelated; }
                .custom-scroll::-webkit-scrollbar { width: 20px; }
                .custom-scroll::-webkit-scrollbar-track { background: #374151; border-left: 2px solid black; }
                .custom-scroll::-webkit-scrollbar-thumb { background-color: #facc15; border: 2px solid black; }
            `}</style>


            <div className="container mx-auto px-4 md:px-[5.5rem] pt-[1.125rem] flex-shrink-0 z-10">
                <Navbar />
            </div>


            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scroll w-full mt-4">
                <div className="container mx-auto px-4 md:px-[5.5rem] pb-10 pt-4">

                    <div className="text-center mb-8">
                        <h1 className="text-4xl text-yellow-400 drop-shadow-[2px_2px_0_rgba(0,0,0,1)] tracking-wider uppercase">
                            Личный кабинет
                        </h1>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 max-w-7xl mx-auto">

                        {/* БЛОК ПРОФИЛЯ */}
                        <div className="lg:col-span-3 bg-[#EAD4AA] border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,0.5)] p-6 flex flex-col relative">
                            <h2 className="text-2xl text-center mb-6 border-b-2 border-black/20 pb-2 uppercase font-bold">Профиль</h2>

                            <div className="w-48 h-48 mx-auto bg-[#D4C095] border-4 border-black mb-6 relative overflow-hidden flex-shrink-0 shadow-lg">
                                <img
                                    src={avatarSrc}
                                    alt="Avatar"
                                    className="w-full h-full object-cover pixelated"
                                    onError={(e) => {e.target.src = 'https://via.placeholder.com/150'}}
                                />
                            </div>

                            <div className="space-y-4 text-lg flex-grow">
                                <div><span className="block font-bold text-sm text-gray-600 uppercase">Имя:</span> <span className="text-black">{user.name}</span></div>
                                <div><span className="block font-bold text-sm text-gray-600 uppercase">Email:</span> <span className="text-black break-words">{user.email}</span></div>
                                <div><span className="block font-bold text-sm text-gray-600 uppercase">Дата рег.:</span> <span className="text-black">{user.registered_at}</span></div>
                            </div>

                            <button onClick={logout} className="w-full mt-6 bg-red-500 hover:bg-red-400 border-4 border-black py-3 text-lg shadow-[4px_4px_0_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all uppercase font-bold">
                                Выйти
                            </button>
                        </div>

                        {/* НАСТРОЙКИ */}
                        <div className="lg:col-span-3 flex flex-col gap-6">
                            <div className="bg-[#EAD4AA] border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,0.5)] p-6 flex flex-col gap-4">
                                <h2 className="text-xl text-center mb-2 uppercase font-bold">Действия</h2>
                                <button className="bg-yellow-500 hover:bg-yellow-400 border-4 border-black py-3 text-lg shadow-[4px_4px_0_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all">
                                    ИЗБРАННОЕ
                                </button>
                                <button className="bg-yellow-500 hover:bg-yellow-400 border-4 border-black py-3 text-lg shadow-[4px_4px_0_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all">
                                    РЕДАКТИРОВАТЬ
                                </button>
                            </div>

                            <div className="bg-[#EAD4AA] border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,0.5)] p-4">
                                <h2 className="text-xl text-center mb-4 uppercase font-bold">Статистика</h2>
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between border-b border-black/10">
                                        <span>Всего уловов:</span>
                                        <span className="font-bold">{history.length}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-black/10">
                                        <span>Трофеев:</span>
                                        <span className="font-bold text-purple-700">0</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* УЛОВЫ */}
                        <div className="lg:col-span-4 flex flex-col gap-6">
                            <div className="bg-[#EAD4AA] border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,0.5)] p-0 flex flex-col h-[500px] overflow-hidden relative">
                                <h2 className="text-2xl text-center py-4 border-b-4 border-black bg-[#D4C095] uppercase font-bold">
                                    Журнал уловов
                                </h2>
                                <div className="flex-1 overflow-y-auto custom-scroll p-4 bg-white/30">
                                    {loading ? (
                                        <p className="text-center mt-10">Загрузка истории...</p>
                                    ) : history.length > 0 ? (
                                        <ul className="space-y-4">
                                            {history.map((item, idx) => (
                                                <li key={idx} className="bg-white/50 border-2 border-black p-3 shadow-[4px_4px_0_rgba(0,0,0,0.1)] flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-black/10 border border-black p-1 flex-shrink-0">
                                                        <img src={item.image_url || fishIconDefault} className="w-full h-full object-cover pixelated" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-bold text-lg">{item.fish?.name || "Неизвестная рыба"}</p>
                                                        <p className="text-sm opacity-70">{item.waterbody?.name || "Водоем не указан"}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-yellow-700 font-bold">{item.weight} кг</p>
                                                        <p className="text-[10px]">{new Date(item.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="text-center py-20 opacity-50 italic">
                                            У вас пока нет записей об улове.<br/>Время забросить удочку!
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
