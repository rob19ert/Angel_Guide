import React, { useEffect, useRef, useState } from 'react';
import Navbar from '../components/Navbar';

const WinterPage = () => {
    const canvasRef = useRef(null);

    // 1. СОСТОЯНИЕ: Храним ID выбранного озера (по умолчанию 3 - Круглое)
    const [selectedLakeId, setSelectedLakeId] = useState(3);

    // 2. ДАННЫЕ: Массив всех озер, чтобы не дублировать верстку
    const lakesData = [
        { id: 1, name: 'Озеро Светлое', rod: 'Hermit', feed: 'Червь', bait: 'Эдакая', fish: 'Судак', line: 'Тонкая' },
        { id: 2, name: 'Озеро Бисерово', rod: 'Hermit', feed: 'Нет', bait: 'Эдакая', fish: 'Щука', line: 'Тонкая' },
        { id: 3, name: 'Озеро Круглое', rod: 'Hermit', feed: 'Червь', bait: 'Эдакая', fish: 'Карась', line: 'Тонкая' },
        { id: 4, name: 'Озеро Прямое', rod: 'Hermit', feed: 'нет', bait: 'Эдакая', fish: 'Щука', line: 'Тонкая' },
        { id: 5, name: 'Озеро Щедрое', rod: 'Hermit', feed: 'нет', bait: 'Эдакая', fish: 'Щука', line: 'Тонкая' },
        { id: 6, name: 'Озеро Святое', rod: 'Hermit', feed: 'нет', bait: 'Эдакая', fish: 'Щука', line: 'Тонкая' },
    ];

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const bg = new Image();
        bg.src = '/src/assets/images/winter.jpg';
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
        <div className="relative main-frame hero-section min-h-screen w-full flex flex-col items-center overflow-hidden">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full -z-10 object-cover"></canvas>

            <div className="container mx-auto px-[5.5rem] pt-[1.125rem]">
                <Navbar />
            </div>

            <h1 className="text-[#FFBF00] text-4xl font-pixel text-center mt-10 mb-12 drop-shadow-[3px_3px_0_rgba(0,0,0,1)]">
                Ловите комфортно в любое время года
            </h1>

            {/* СЕТКА КАРТОЧЕК */}
            <div className="container mx-auto px-20 grid grid-cols-3 gap-20 pb-5">
                {lakesData.map((lake) => {
                    // Проверяем, активна ли текущая карточка
                    const isActive = selectedLakeId === lake.id;

                    return (
                        <div
                            key={lake.id}
                            className={`
                                font-pixel transition-all duration-300 p-6 backdrop-blur-md
                                ${isActive
                                ? "bg-[#93ab4f]/60 border-4 border-[#d4ff00] shadow-[0_0_20px_rgba(212,255,0,0.4)] scale-105 z-10 text-white"
                                : "bg-[rgba(171,221,194,0.25)] border-2 border-black shadow-[inset_-13px_-13px_0_0_rgba(0,0,0,0.15)] text-white hover:scale-105"
                            }
                            `}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h3 className={`text-xl drop-shadow-[2px_2px_0_rgba(0,0,0,1)] ${isActive ? 'text-[#d4ff00]' : ''}`}>
                                    {lake.name}
                                </h3>
                                {/* Чекбокс */}
                                <div className={`w-5 h-5 border-2 ${isActive ? 'border-[#d4ff00] bg-[#d4ff00] flex items-center justify-center' : 'border-white bg-white/20'}`}>
                                    {isActive && <div className="w-2 h-2 bg-black"></div>}
                                </div>
                            </div>

                            <div className="space-y-2 drop-shadow-[2px_2px_0_rgba(0,0,0,1)] text-xs">
                                <div className="flex justify-between"><span>Удочка:</span><span>{lake.rod}</span></div>
                                <div className="flex justify-between">
                                    <span>Прикормка:</span>
                                    <span className={lake.feed.toLowerCase() === 'нет' ? 'text-red-500' : ''}>{lake.feed}</span>
                                </div>
                                <div className="flex justify-between"><span>Наживка:</span><span>{lake.bait}</span></div>
                                <div className="flex justify-between"><span>Желаемая рыба:</span><span>{lake.fish}</span></div>
                                <div className="flex justify-between border-b border-white/20 pb-2"><span>Леска:</span><span>{lake.line}</span></div>
                            </div>

                            {/* Кнопка смены состояния */}
                            <button
                                onClick={() => setSelectedLakeId(lake.id)}
                                className={`
                                    w-full mt-6 py-2 font-pixel active:translate-y-1 transition-all
                                    ${isActive
                                    ? "bg-[#d4ff00] text-black border-b-4 border-r-4 border-[#a2c200]"
                                    : "bg-[#c0c0c0] text-black border-b-4 border-r-4 border-gray-600 shadow-inner"
                                }
                                `}
                            >
                                {isActive ? 'Выбрано' : 'Выбрать'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default WinterPage;