import React, { useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';

const HomePage = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Загрузка ресурсов
        const bg = new Image();
        bg.src = '/src/assets/images/background/background.jpeg';
        const fisherman = new Image();
        fisherman.src = '/src/assets/images/spinning/fishman.png';
        const bird = new Image();
        bird.src = '/src/assets/images/bird.png';

        let ripples = [];
        let frame = 0;
        let birdX = -100;
        let birdY = 50;
        let animationId;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resize);
        resize();

        function createRipple(x,y) {
            ripples.push({ x: x, y: y, r: 1, alpha: 0.8 });
        }

        function drawRipples() {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
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

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.imageSmoothingEnabled = false;

            // 1. Рисуем фон на ВЕСЬ экран
            ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

            // 2. Логика птицы
            birdX += 1.5;
            const birdPlanning = Math.sin(frame * 0.1) * 5;
            ctx.drawImage(bird, birdX, birdY + birdPlanning);
            if (birdX > canvas.width) {
                birdX = -250;
                birdY = Math.random() * 200 + 50;
            }

            // 3. Рисуем рыбака (Синхронное растяжение)
            // Вычисляем масштаб для покачивания, чтобы оно не было слишком резким на больших экранах
            const scaleY = canvas.height / bg.naturalHeight;
            const bobbing = Math.sin(frame * 0.08) * (4 * scaleY);


            ctx.save();
            // Рисуем рыбака точно так же, как фон - на ВЕСЬ экран
            // Координата Y смещается только на значение покачивания
            ctx.drawImage(fisherman, 0, bobbing, canvas.width, canvas.height);

            const rodX = 0.335;
            const rodY = 0.68;
            const lineX = canvas.width * rodX;
            const lineY = canvas.height * rodY;

            ctx.restore();

            if (frame % 60 === 0) {
                createRipple(lineX, lineY);
            }
            drawRipples();
            frame++;
            animationId = requestAnimationFrame(animate);
        };

        // Запуск после загрузки основной картинки
        bg.onload = () => animate();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <div className="main-frame hero-section min-h-screen w-full relative overflow-hidden">

            <canvas ref={canvasRef} className="absolute inset-0 -z-10" />


            <div className="container mx-auto px-[5.5rem] pt-[1.125rem]">
                <Navbar />
            </div>

            {/* Контент страницы */}
            <div className="container mx-auto flex justify-between items-start pt-[3.5rem] px-[5.5rem]">
                {/* Левая часть: Заголовки и кнопка */}
                <div className="flex flex-col">
                    <div className="text-white text-4xl font-pixel pb-[2.5rem] drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)]">
                        Лови больше
                    </div>
                    <div className="text-white text-4xl font-pixel drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
                        Думай меньше
                    </div>
                    <a href="guide">
                        <button className="bg-[#FFBF00] mt-[5.2rem] w-[14rem] font-pixel text-black text-base px-[1.1875rem] py-[1.5625rem] shadow-[inset_-7px_-7px_0_0_#B28601] border-black border-2 hover:bg-[#FFD700] hover:-translate-y-0.5 transition-all active:translate-y-1 active:shadow-none">
                            Получить план
                        </button>
                    </a>
                </div>

                {/* Правая часть: Стеклянные карточки */}
                <div className="flex flex-col gap-6 w-[25rem]">
                    {/* Карточка 1 */}
                    <div className="bg-[rgba(171, 221, 194, 0.25)] h-[9.5rem] font-pixel border-black border-2 backdrop-blur-md shadow-[inset_-13px_-13px_0_0_rgba(0,0,0,0.15)] hover:scale-105 transition-transform duration-300 group overflow-hidden p-6">
                        <p className="text-white text-xl mb-3 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">Озеро Светлое</p>
                        <p className="text-white text-base opacity-90">Юго-восток Москвы</p>
                        <p className="text-white text-base opacity-90">45.4215 N, 75.6229 W</p>
                    </div>

                    {/* Карточка 2: График */}
                    <div className="bg-[rgba(171, 221, 194, 0.25)] h-[19.25rem] font-pixel border-black border-2 backdrop-blur-md shadow-[inset_-13px_-13px_0_0_rgba(0,0,0,0.15)] hover:scale-105 transition-transform duration-300 group overflow-hidden p-6 flex flex-col">
                        <p className="text-white text-xl drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">Прогноз клёва</p>
                        <p className="text-white text-base mt-2 opacity-80">На ближайшие 6 часов:</p>

                        <div className="relative flex-1 w-full mt-4 min-h-0">
                            <svg className="w-full h-full" viewBox="0 0 445 169" fill="none" preserveAspectRatio="none">
                                <line x1="0" y1="84.5" x2="445" y2="84.5" stroke="white" strokeOpacity="0.2" strokeWidth="2" strokeDasharray="8 6" />
                                <line x1="111" y1="0" x2="111" y2="169" stroke="white" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="4 4" />
                                <line x1="222" y1="0" x2="222" y2="169" stroke="white" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="4 4" />
                                <line x1="333" y1="0" x2="333" y2="169" stroke="white" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="4 4" />
                                <text x="5" y="80" fill="white" fillOpacity="0.5" fontSize="12">50%</text>
                                <path d="M2.5 166.132C2.5 166.356 2.5 166.58 2.78644 166.472C5.16084 165.572 8.55307 161.571 11.9948 161.571C16.3251 161.571 17.8894 157.619 20.0368 155.525C22.8731 152.759 23.6723 148.838 25.4083 145.782C27.1465 142.722 27.8259 140.82 28.6974 137.989C29.752 134.564 31.6423 128.8 33.0276 125.291C34.387 121.848 35.1231 118.211 36.7393 113.803C37.832 110.822 43.6384 107.299 44.1626 104.128C44.7023 100.863 45.2668 100.062 46.0185 96.2673C46.6151 93.2559 46.8292 91.125 47.8743 88.4066C48.9568 85.591 49.9831 82.6795 50.9674 79.3366C51.9825 75.8893 52.0768 74.4166 54.679 71.476C57.3897 68.4127 59.6703 70.8135 62.1024 69.0573C64.8368 67.0828 66.0085 60.7569 68.8048 60.7569C72.0002 60.7569 72.4215 66.848 75.0932 69.0573C77.4392 70.9972 82.8893 69.0443 85.6096 71.476C88.3567 73.9315 92.8144 125.291 97.3633 125.291C105 125.291 105.486 77.2233 115.302 77.1571C119.866 77.1263 119.746 94.4533 123.345 94.4533C125.819 94.4533 131.781 94.4533 135.717 94.4533C139.429 94.4533 141.741 100.523 142.522 103.523C143.151 105.942 143.719 108.666 144.996 111.384C146.274 114.102 147.917 120.877 151.182 120.877C153.657 120.877 154.791 111.384 157.987 111.384C161.5 111.384 161.757 123.935 165.149 123.935C170 123.935 173.708 147.059 177.164 147.059C180.257 147.059 187.629 120.482 191.392 117.431C194.393 114.998 200.097 106.357 202.527 103.523C204.718 100.97 204.146 92.3773 206 90C208.49 86.8069 211.188 87.1973 212.425 84.174C213.803 80.8055 213.646 79.8637 214.924 76.918C216.784 72.6289 218.158 69.8383 219.609 66.034C220.991 62.4118 221.75 59.4566 223.373 55.1499C225.301 50.0338 225.787 48.7983 226.653 46.0799C227.663 42.9101 232.857 37.985 234.134 34.5913C235.53 30.8834 238.407 27.0619 240.327 23.7072C242.291 20.2752 243.084 17.8449 244.593 15.2419C246.102 12.6378 245.505 8.59054 250.16 8.59055C254 8.59057 252.958 2.49998 256.234 2.5C259.439 2.50002 259.824 8.59055 261.5 8.59055C266 8.59055 264.738 13.2447 269.5 15.2419C272.5 16.5 273.703 22.2816 275.5 25C277.174 27.5327 278.46 31.8729 279.5 34.5913C280.495 37.1925 281.568 37.3533 283.5 39.8824C285.5 42.5 286.754 45.779 287 46.5147C288 49.5 290.301 71.2353 293.5 71.2353C297 71.2353 300.954 47.1701 305.363 47.1701C310 47.1701 310.645 52.285 311.5 55.1499C312.5 58.5 313.372 63.236 316.074 63.236C319.5 63.236 325.776 26.0147 329 26.0147C332 26.0147 340.5 59.5007 341.5 63.236C342.492 66.9412 345.261 80.345 347 83.2941C348.484 85.8099 350.264 90.992 352 93.5441C353.824 96.2249 353.622 98.5486 356 101.382C358.081 103.862 361.1 111.249 362.5 114.647C364.5 119.5 372.5 141.176 374.5 141.176C376.5 141.176 382.27 117.213 384 114.647C391.5 103.523 398.023 106.019 400 102.5C402.097 98.7681 403.243 89.7274 404 86.5C404.925 82.5549 406.068 72.2557 407 68C407.657 65.0019 408.455 61.3451 409.5 57.5C410.331 54.4435 411.837 51.0736 413 47.5C414.194 43.8326 415.692 39.2317 418.5 36.8676C422.5 33.5 422.752 33.5506 425.999 32.6471C432.5 30.8382 439.5 30.8382 442.5 30.8382"
                                      stroke="#FFBF00" strokeWidth="5" strokeLinecap="round" />
                            </svg>
                            {/* Сканирующая полоска */}
                            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-white/5 to-transparent h-4 w-full animate-scan"></div>
                        </div>

                        <div className="flex justify-between items-center mt-2 flex-none opacity-90">
                            <span className="text-white text-xs">12:00</span>
                            <span className="text-white text-xs">13:00</span>
                            <span className="text-white text-xs">14:00</span>
                            <span className="text-white text-xs">15:00</span>
                            <span className="text-white text-xs">16:00</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;