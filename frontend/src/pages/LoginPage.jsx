import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import PixelButton from '../components/ui/PixelButton';

// Используем фон с озером (так же как на главной)
import bgImgSrc from '../assets/images/background/lake_bg.jpg';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const canvasRef = useRef(null);

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
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/profile'); // После успешного входа идем в профиль
        } catch (err) {
            setError('Ошибка: ' + (err.response?.data?.message || 'Неверный логин или пароль'));
        }
    };

    return (
        <div className="relative h-screen w-full flex flex-col font-pixel overflow-hidden">
            <canvas ref={canvasRef} className="absolute inset-0 -z-10"></canvas>
            
            <div className="container mx-auto px-[5.5rem] pt-[1.125rem] flex-shrink-0 relative z-20">
                <Navbar />
            </div>

            <div className="flex-1 flex items-center justify-center relative z-10">
                <div className="bg-[#EAD4AA]/90 border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,0.8)] p-8 w-[400px]">
                    <h2 className="text-3xl text-center mb-6 text-black drop-shadow-[2px_2px_0_rgba(255,255,255,0.8)]">Вход</h2>
                    
                    {error && <div className="bg-red-400 border-2 border-red-900 text-white p-2 mb-4 text-center">{error}</div>}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-black mb-1">Email</label>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[rgba(255,255,255,0.9)] text-lg px-4 py-2 border-2 border-black shadow-[inset_2px_2px_0_rgba(0,0,0,0.2)] focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-black mb-1">Пароль</label>
                            <input 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[rgba(255,255,255,0.9)] text-lg px-4 py-2 border-2 border-black shadow-[inset_2px_2px_0_rgba(0,0,0,0.2)] focus:outline-none"
                                required
                            />
                        </div>

                        <PixelButton variant="orange" className="h-[3.5rem] mt-4" fullWidth>
                            Войти
                        </PixelButton>
                    </form>

                    <div className="text-center mt-6 text-sm text-gray-800">
                        Нет аккаунта? <Link to="/register" className="text-blue-800 hover:text-blue-600 underline">Зарегистрироваться</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
