import React, { useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import PixelButton from '../components/ui/PixelButton';
import { useNavigate } from 'react-router-dom';
import lakeImgSrc from '../assets/images/background/lake.jpg';
import birdImgSrc from '../assets/images/bird.png';

const WaterBodyPage = () => {
    const canvasRef = useRef(null);

    const navigate = useNavigate();
    const handleSelectWaterBody = (categoryStr) => {
        navigate('/water', { state: { category: categoryStr } });
    };

    // Данные стрелок из твоего кода
    const arrowData = [
        { start: { x: 400, y: 480 }, end: { x: 350, y: 530 }, cp: { x: 360, y: 480 } }, // Река
        { start: { x: 625, y: 270 }, end: { x: 530, y: 320 }, cp: { x: 530, y: 260 } }, // Карьер
        { start: { x: 1080, y: 290 }, end: { x: 980, y: 350 }, cp: { x: 980, y: 280 } }, // Платник
        { start: { x: 1080, y: 670 }, end: { x: 980, y: 730 }, cp: { x: 980, y: 660 } }, // Болото
        { start: { x: 250, y: 730 }, end: { x: 150, y: 830 }, cp: { x: 180, y: 730 } }, // Пруд
        { start: { x: 850, y: 470 }, end: { x: 800, y: 520 }, cp: { x: 800, y: 470 } }  // Озеро
    ];

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Загрузка ресурсов
        const lakeImg = new Image();
        lakeImg.src = lakeImgSrc;
        const birdImg = new Image();
        birdImg.src = birdImgSrc;

        let sparkles = [];
        let frame = 0;
        let birdX = -50;
        let birdY = 100;
        let birdSpeed = 1.5;
        let animationId;

        // ФУНКЦИЯ RESIZE: растягиваем холст на всё окно
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Установить размер сразу

        const drawArrow = (start, end, cp) => {
            // Вычисляем коэффициенты растяжения относительно оригинала (1280x929)
            const ratioX = canvas.width / 1280;
            const ratioY = canvas.height / 929;

            ctx.save();
            ctx.strokeStyle = "rgba(255, 255, 255, 1)";
            ctx.lineWidth = 4;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(start.x * ratioX, start.y * ratioY);
            ctx.quadraticCurveTo(cp.x * ratioX, cp.y * ratioY, end.x * ratioX, end.y * ratioY);
            ctx.stroke();

            const angle = Math.atan2((end.y - cp.y) * ratioY, (end.x - cp.x) * ratioX);
            ctx.translate(end.x * ratioX, end.y * ratioY);
            ctx.rotate(angle);
            ctx.fillStyle = "rgba(255, 255, 255, 1)";
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-12, -6);
            ctx.lineTo(-12, 6);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        };

        const createSparkles = () => {
            const zones = [
                { x: 950, y: 750, width: 150, height: 150 },
                { x: 480, y: 340, width: 60, height: 60 },
                { x: 650, y: 600, width: 200, height: 100 },
                { x: 970, y: 350, width: 150, height: 100 },
            ];
            const zone = zones[Math.floor(Math.random() * zones.length)];
            const ratioX = canvas.width / 1280;
            const ratioY = canvas.height / 929;

            sparkles.push({
                x: (zone.x + Math.random() * zone.width) * ratioX,
                y: (zone.y + Math.random() * zone.height) * ratioY,
                size: Math.random() * 10 + 1,
                alpha: 0,
                maxAlpha: 0.8,
                speed: 0.05
            });
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.imageSmoothingEnabled = false;

            // Рисуем фон (растянутый)
            if (lakeImg.complete) {
                ctx.drawImage(lakeImg, 0, 0, canvas.width, canvas.height);
            }

            // Птица
            birdX += birdSpeed;
            const birdPlanning = Math.sin(frame * 0.08) * 5;
            if (birdImg.complete) {
                ctx.drawImage(birdImg, birdX, birdY + birdPlanning);
            }
            if (birdX > canvas.width) {
                birdX = -250;
                birdY = 100;
            }

            // Стрелки
            arrowData.forEach(arrow => drawArrow(arrow.start, arrow.end, arrow.cp));

            // Блики
            if (frame % 4 === 0) createSparkles();
            ctx.fillStyle = 'white';
            for (let i = sparkles.length - 1; i >= 0; i--) {
                let s = sparkles[i];
                s.alpha += s.speed;
                if (s.alpha > s.maxAlpha) s.speed = -0.01;
                ctx.globalAlpha = s.alpha;
                ctx.fillRect(s.x, s.y, s.size, s.size);
                if (s.alpha <= 0) sparkles.splice(i, 1);
            }
            ctx.globalAlpha = 1;

            frame++;
            animationId = requestAnimationFrame(animate);
        };

        lakeImg.onload = animate;

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <div id="map" className="relative main-frame hero-section min-h-screen w-full bg-center overflow-hidden">
            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full -z-10 block" />

            <div className="container mx-auto px-[5.5rem] pt-[1.125rem]">
                <Navbar />
            </div>

            <div className="font-pixel text-4xl text-center pt-[2rem] text-white drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)]">
                Выберите водоем для души
            </div>

            <div className="absolute top-[26%] left-[50%] flex flex-col items-center">
                <PixelButton
                    variant="brown"
                    className="w-[10rem] h-[4rem] text-base text-white"
                    onClick={() => handleSelectWaterBody('Карьер')}
                >
                    Выбрать Карьер
                </PixelButton>
            </div>
            <div className="absolute top-[26%] left-[86%] flex flex-col items-center">
                <PixelButton
                    variant="brown"
                    className="w-[10rem] h-[4rem] text-base text-white"
                    onClick={() => handleSelectWaterBody('Плат')}
                >
                    Платный пруд
                </PixelButton>
            </div>
            <div className="absolute top-[48%] left-[32%] flex flex-col items-center">
                <PixelButton
                    variant="brown"
                    className="w-[10rem] h-[4rem] text-base text-white"
                    onClick={() => handleSelectWaterBody('Река')}
                >
                    Выбрать Реку
                </PixelButton>
            </div>
            <div className="absolute top-[48%] left-[68%] flex flex-col items-center">
                <PixelButton
                    variant="brown"
                    className="w-[10rem] h-[4rem] text-base text-white"
                    onClick={() => handleSelectWaterBody('Озеро')}
                >
                    Выбрать Озеро
                </PixelButton>
            </div>
            <div className="absolute top-[68%] left-[86%] flex flex-col items-center">
                <PixelButton
                    variant="brown"
                    className="w-[10rem] h-[4rem] text-base text-white"
                    onClick={() => handleSelectWaterBody('Водохранилище')}
                >
                    Выбрать Водохр.
                </PixelButton>
            </div>
            <div className="absolute top-[74%] left-[20%] flex flex-col items-center">
                <PixelButton
                    variant="brown"
                    className="w-[10rem] h-[4rem] text-base text-white"
                    onClick={() => handleSelectWaterBody('Пруд')}
                >
                    Выбрать Пруд
                </PixelButton>
            </div>

        </div>
    );
};

export default WaterBodyPage;