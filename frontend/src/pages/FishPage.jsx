import React, { useEffect, useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import Stepper from '../components/Stepper';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useRecommendation } from '../context/RecommendationContext';
// Картинки
import bgImg from '../assets/images/purple.jpg';
import fishermanImg from '../assets/images/spinning/fishman.png';
import birdImg from '../assets/images/bird.png';

const FishPage = () => {
    const canvasRef = useRef(null);
    const[fishes, setFishes] = useState([]);
    const [selectedFish, setSelectedFish] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { selections, updateSelection } = useRecommendation();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFishes = async () => {
            try {
                const response = await api.get('/api/fishes');
                const loadedFishes = response.data.data.fishes ||[];
                setFishes(loadedFishes);
                if (selections.fish) {
                    const found = loadedFishes.find(f => f.id === selections.fish.id);
                    setSelectedFish(found || loadedFishes[0]);
                } else if (loadedFishes.length > 0) {
                    setSelectedFish(loadedFishes[0]);
                }
            } catch (error) {
                console.error("Ошибка загрузки рыб:", error);
            }
        };
        fetchFishes();
    }, [selections.fish]);

    const filteredFishes = fishes.filter(fish => 
        fish.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        let animationId;
        let isCancelled = false; 
        let frame = 0;
        let ripples =[];
        let birdX = -100;
        let birdY = 50;
        let birdSpeed = 1.5;
        const fisherman = new Image(); 
        const bird = new Image(); 
        
        fisherman.src = fishermanImg;
        bird.src = birdImg;

        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = window.innerWidth + 'px';
            canvas.style.height = window.innerHeight + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        window.addEventListener('resize', resize);
        resize();

        function createRipple(x, y) { ripples.push({ x: x, y: y, r: 1, alpha: 0.8 }); }
        
        function drawRipples() {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
            ctx.lineWidth = 2;
            for (let i = ripples.length - 1; i >= 0; i--) {
                let r = ripples[i];
                ctx.globalAlpha = r.alpha;
                ctx.beginPath();
                ctx.ellipse(r.x, r.y, r.r, r.r * 0.4, 0, 0, Math.PI * 2);
                ctx.stroke();
                r.r += 0.3;
                r.alpha -= 0.01;
                if (r.alpha <= 0) ripples.splice(i, 1);
            }
            ctx.globalAlpha = 1;
        }

        function animate() {
            if (isCancelled) return; 
            const w = window.innerWidth;
            const h = window.innerHeight;
            
            ctx.imageSmoothingEnabled = false; 
            ctx.clearRect(0, 0, w, h);
            
            const imgW = 1920; 
            const imgH = 1080;
            const imgRatio = imgW / imgH;
            const canvasRatio = w / h;
            
            let renderWidth, renderHeight, x, y;
            if (canvasRatio > imgRatio) {
                renderWidth = w;
                renderHeight = w / imgRatio;
                x = 0;
                y = (h - renderHeight) / 2;
            } else {
                renderWidth = h * imgRatio;
                renderHeight = h;
                x = (w - renderWidth) / 2;
                y = 0;
            }

            // Птица
            birdX += birdSpeed;
            const birdPlanning = Math.sin(frame * 0.1) * 5;
            if(bird.complete) {
                ctx.drawImage(bird, birdX, birdY + birdPlanning);
            }
            if (birdX > w) { birdX = -250; birdY = Math.random() * 200 + 50; }

            // Рыбак
            if (fisherman.complete) {
                const fishYScale = renderHeight / imgH; 
                const bobbing = Math.sin(frame * 0.08) * (4 * fishYScale);
                ctx.drawImage(fisherman, x, y + bobbing, renderWidth, renderHeight);
                
                const rodX = 0.335;
                const rodY = 0.68;
                const lineX = x + renderWidth * rodX;
                const lineY = y + renderHeight * rodY;
                
                if (frame % 60 === 0) createRipple(lineX, lineY);
                drawRipples();
            }
            
            frame++;
            animationId = requestAnimationFrame(animate);
        }

        animate();

        return () => {
            isCancelled = true; 
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize); 
        };
    },[]);

    const FishIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 lg:h-8 lg:w-8 hover:fill-[#FFBF00]" viewBox="0 0 1120 944">
            <path fill="currentColor" fillRule="evenodd" d="M690.2 89.2c5.5 1.6 12.6 8.3 15.4 14.3 3.1 6.5 3.2 16.1.3 22.5-1.5 3.4-17.2 19.7-66.9 69.5l-65 65 97 97 97 97 25.2-25.2c97-96.5 117.5-116.5 121.8-118.6 6.1-3 15.7-3 22.3.1 3.9 1.7 13.3 10.6 45 42.7 44.1 44.5 44.6 45.2 44.7 56.6 0 10.6-2.6 14-34.5 45.9L964 484.5l28.9 29c19 19 29.6 30.5 31.1 33.4 3.3 6.7 3.7 14.3 1 21.6-2.1 5.7-4.5 8.2-42.4 46.2-26.8 26.8-41.6 40.9-44.6 42.4-3.5 1.9-6.1 2.4-12 2.4-6.5 0-8.3-.5-12.8-3-3.7-2.1-23.8-21.5-68-65.5-34.5-34.4-66-65.6-70-69.5l-7.3-6.9-96.9 96.9-97 97 64.3 64.2c48 48 64.9 65.5 67 69.4 2.2 4.2 2.7 6.4 2.7 12 0 11-4.8 18.8-15 24.1l-4.5 2.3H517.4l-5.7-3c-4.5-2.4-40.8-38.1-192.7-189.4-156.1-155.6-187.4-187.3-189.6-191.7-2.3-4.7-2.6-6.3-2.2-13.1.2-4.8 1.1-9.2 2.2-11.5 1.9-4 373.9-375.3 380.3-379.6 2-1.4 4.7-2.8 6.2-3.2 4.4-1.4 169.7-1.2 174.3.2M440.3 234.9c-51.9 51.6-94.3 94.2-94.3 94.7s9.3 10.2 20.8 21.7l20.7 20.7L503 256.5 618.5 141h-42l-42 .1zM518.1 315.7c-10 9.9-18.1 18.4-18.1 18.9s8.2 9.1 18.3 19.2l18.2 18.2 18.5-18.5 18.5-18.5-18.7-18.6-18.6-18.7zM289.1 385.4l-18.4 18.4 2.7 3.4c3 4.1 38.4 38.8 39.4 38.8.4 0 8.9-8.2 19-18.3l18.2-18.2-21.3-21.3-21.2-21.2zM907.2 390.7l-18.4 18.6 18.4 18.4c10 10 18.8 18.3 19.3 18.3.6 0 9.1-8.1 18.9-18.1l17.9-18-15.5-15.7c-8.6-8.6-16.9-17.2-18.6-19-1.6-1.7-3.2-3.2-3.4-3.1-.1 0-8.6 8.4-18.6 18.6M443.7 390.8C434 400.5 426 409 426 409.5c0 .6 8.1 9.1 17.9 18.9l18 17.9 3.3-2.9c1.8-1.7 10.1-10 18.5-18.5l15.2-15.5-18.2-18.2c-10-10-18.4-18.2-18.7-18.2s-8.5 8-18.3 17.8M592.7 390.8C583 400.5 575 409 575 409.5c0 .6 8.1 9.1 18 19l18 18 18.5-18.5 18.5-18.5-18-18c-9.9-9.9-18.4-18.1-18.8-18.3-.4-.1-8.7 7.8-18.5 17.6M211.4 463.3l-21.1 21.2 21.1 21.2 21.2 21.3 21.2-21.3 21.3-21.3-21.1-21c-11.6-11.5-21.2-21-21.4-21.1-.1-.1-9.7 9.3-21.2 21M369.2 465.3c-10 10-18.2 18.7-18.2 19.2.1.6 8.2 9.1 18 19l17.9 18 18.8-18.8 18.8-18.7-18.5-18.5-18.5-18.5 18.7-18.6 18.7-18.6-18.8 18.7zM735.1 532.7l-18.6 18.6 18.6 18.7 18.7 18.7 18.5-18.5 18.5-18.5-18.5-18.7-18.5-18.7-18.7 18.4zM435.5 596.1l-18.6 18.6 15.6 15.5 15.5 15.6 18.2-18.2 18.2-18.2-15.5-15.5c-8.5-8.5-15.7-15.5-15.9-15.5s-10 7.9-22.5 20.3M585.5 596.1l-18.6 18.6 15.5 15.5 15.5 15.5 18.5-18.2 18.5-18.2-15.7-15.8-15.8-15.7-17.9 18.3zM286.3 664.7l-18.5 18.5 18.2 18.2 18.2 18.2 21.3-21.3 21.2-21.2-19-18.9-19-19-21.4 25.5zM431 813.1c-52 51.6-94.6 94.1-94.6 94.3 0 .3 18.9 19.3 42 42.2h41.4l107.2-106.7 107.1-106.7-20.7-20.7-20.8-20.8L431 813.1z"/></svg>
    );

    return (
        <div id="fish" className="relative min-h-screen w-full flex flex-col font-pixel custom-scrollbar bg-black" style={{ backgroundImage: `url(${bgImg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed', imageRendering: 'pixelated' }}>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #FFBF00; border: 1px solid black; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #facc15; }
                body { overflow-x: hidden; margin: 0; padding: 0; }
            `}</style>
            
            <canvas ref={canvasRef} id="gameCanvas" className="fixed inset-0 w-full h-full z-0 pointer-events-none"></canvas>
            
            <div className="container mx-auto px-4 lg:px-[5.5rem] pt-[1.125rem] shrink-0 relative z-10">
                <Navbar />
                <div className="mt-4 lg:mt-6">
                    <Stepper />
                </div>
                <div className="text-center mb-4 mt-2">
                    <h1 className="text-[#FFBF00] text-3xl md:text-4xl drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)]">
                        Энциклопедия рыб
                    </h1>
                </div>
            </div>

            <div className="container mx-auto px-4 lg:px-[5.5rem] pb-8 flex-1 flex flex-col lg:flex-row gap-6 relative z-10">
                
                {/* ЛЕВЫЙ БЛОК: Список. Ширину увеличили, чтобы уравновесить дизайн */}
                <div className="w-full lg:w-7/12 xl:w-2/3 flex flex-col gap-3 min-h-[450px]">
                    <input 
                        type="text" 
                        placeholder="Поиск рыбы..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="shrink-0 bg-[rgba(157,127,80,0.75)] text-white placeholder-gray-300 border-2 border-black p-3 shadow-[inset_-4px_-4px_0_0_rgba(0,0,0,0.3)] focus:outline-none focus:border-[#FFBF00]"
                    />
                    
                    <div className="flex-1 bg-[rgba(157,127,80,0.75)] border-2 border-black p-4 lg:p-6 shadow-[inset_-10px_-10px_0_0_rgba(0,0,0,0.3)] flex flex-col overflow-hidden">
                        <p className="shrink-0 text-white text-xl lg:text-2xl text-center drop-shadow-[2px_2px_0_rgba(0,0,0,1)] mb-4 uppercase">
                            Доступные виды
                        </p>
                        
                        {filteredFishes.length === 0 ? (
                            <p className="text-white text-center mt-6 flex-1">{fishes.length === 0 ? "Загрузка данных..." : "Рыба не найдена"}</p>
                        ) : (
                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-0">
                                <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4 w-full pb-2">
                                    {filteredFishes.map((fish) => (
                                        <div
                                            key={fish.id}
                                            onClick={() => setSelectedFish(fish)}
                                            className={`flex items-center gap-3 cursor-pointer transition-transform hover:scale-105 ${selectedFish?.id === fish.id ? 'text-[#FFBF00]' : 'text-white hover:text-gray-200'}`}
                                        >
                                            {fish.icon_url ? (
                                                <div className="w-10 h-10 border border-black bg-white/20 p-1 shrink-0">
                                                    <img src={fish.icon_url} alt={fish.name} className="w-full h-full object-cover pixelated" />
                                                </div>
                                            ) : (
                                                <div className="w-8 h-8 shrink-0 flex items-center justify-center"><FishIcon /></div>
                                            )}
                                            <span className="text-base lg:text-lg drop-shadow-[2px_2px_0_rgba(0,0,0,1)] truncate capitalize">{fish.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ПРАВЫЙ БЛОК: Описание. Сделан компактнее: `self-start` не дает ему растягиваться по вертикали */}
                <div className="w-full lg:w-5/12 xl:w-1/3 flex flex-col self-start">
                    <div className="w-full bg-[rgba(157,127,80,0.75)] border-2 border-black p-4 lg:p-6 shadow-[inset_-10px_-10px_0_0_rgba(0,0,0,0.3)] flex flex-col">
                        
                        <div className="shrink-0 flex justify-between items-start border-b-2 border-black/20 pb-3">
                            <div className="min-w-0 pr-2">
                                <p className="text-white text-2xl lg:text-3xl drop-shadow-[2px_2px_0_rgba(0,0,0,1)] capitalize truncate">
                                    {selectedFish ? selectedFish.name : "..."}
                                </p>
                                <p className="text-[#FFBF00] text-sm lg:text-base drop-shadow-[2px_2px_0_rgba(0,0,0,1)] mt-1 capitalize truncate">
                                    {selectedFish?.category?.name || "Категория неизвестна"}
                                </p>
                            </div>
                            {selectedFish?.is_rare && (
                                <span className="shrink-0 bg-purple-600 text-white font-bold text-xs lg:text-sm px-3 py-2 border-2 border-black shadow-[2px_2px_0_black]">РЕДКАЯ</span>
                            )}
                        </div>
                        
                        {/* Ограничиваем высоту описания, добавляем возможность скроллинга, если текст слишком большой */}
                        <div className="mt-4 overflow-y-auto custom-scrollbar pr-3 max-h-[350px]">
                            {selectedFish?.description ? (
                                <p className="text-white text-sm lg:text-base leading-relaxed drop-shadow-[1px_1px_0_rgba(0,0,0,0.8)] whitespace-pre-wrap">
                                    {selectedFish.description}
                                </p>
                            ) : (
                                <p className="text-white/50 text-center mt-6 mb-6">Описание отсутствует...</p>
                            )}
                        </div>
                        
                        <div className="shrink-0 flex flex-col gap-4 mt-4 border-t-2 border-black/20 pt-4">
                            <div className="flex gap-2 lg:gap-4">
                                <div className="text-center bg-black/30 border border-black/50 p-2 flex-1">
                                    <span className="block text-gray-400 text-xs lg:text-sm">Ср. вес</span>
                                    <span className="text-white font-bold text-sm lg:text-base">{selectedFish?.avg_size ? selectedFish.avg_size + ' кг' : '?'}</span>
                                </div>
                                <div className="text-center bg-black/30 border border-black/50 p-2 flex-1">
                                    <span className="block text-gray-400 text-xs lg:text-sm">Макс. вес</span>
                                    <span className="text-[#FFBF00] font-bold text-sm lg:text-base">{selectedFish?.max_weight ? selectedFish.max_weight + ' кг' : '?'}</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => {
                                    if(selectedFish) {
                                        updateSelection('fish', selectedFish);
                                        navigate('/water', { state: { category: 'all' } });
                                    }
                                }}
                                disabled={!selectedFish}
                                className="bg-[#FFBF00] disabled:bg-gray-500 disabled:text-gray-300 border-2 border-black p-3 lg:p-4 text-black text-sm lg:text-base uppercase hover:bg-[#FFD700] active:translate-y-1 transition-all shadow-[inset_-4px_-4px_0_0_rgba(0,0,0,0.2)] w-full"
                            >
                                Выбрать и перейти к водоемам
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default FishPage;