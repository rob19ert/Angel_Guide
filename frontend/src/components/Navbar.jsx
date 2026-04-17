import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/'); // на главную после выхода
    };

    return (
        <nav className="flex justify-between items-center mx-auto h-16 w-full">
            <Link to="/" className="font-pixel flex flex-col text-right cursor-pointer transition-transform active:scale-95">
                <div className="text-main-color drop-shadow-[2px_2px_0_rgba(0,0,0,0.65)]">Справочник</div>
                <div className="text-main-color drop-shadow-[2px_2px_0_rgba(0,0,0,0.65)]">Рыболова</div>
            </Link>

            <div className="hidden md:flex gap-12 drop-shadow-[4 4px 4px ]">
                <Link to="/equipment" className="text-white font-pixel drop-shadow-[2px_2px_0_rgba(0,0,0,0.65)] hover:text-main-color hover:-translate-y-1 transition-all duration-200">
                    Инвентарь
                </Link>

                <Link to="/map" className="text-white font-pixel drop-shadow-[2px_2px_0_rgba(0,0,0,0.65)] hover:text-main-color hover:-translate-y-1 transition-all duration-200">
                    Водоемы
                </Link>

                <Link to="/fish" className="text-white font-pixel drop-shadow-[2px_2px_0_rgba(0,0,0,0.65)] hover:text-main-color hover:-translate-y-1 transition-all duration-200">
                    Рыбы
                </Link>

                <Link to="/forum" className="text-white font-pixel drop-shadow-[2px_2px_0_rgba(0,0,0,0.65)] hover:text-main-color hover:-translate-y-1 transition-all duration-200">
                    Форум
                </Link>
            </div>

            <div className="flex gap-4">
                {!isAuthenticated ? (
                    <Link to="/login">
                        <button className="bg-[#FFBF00] font-pixel text-black text-base pl-[1.125rem] pr-[1rem] border-2 border-black shadow-[inset_-5px_-5px_0_0_#B28601] h-[3.125rem] hover:bg-[#FFD700] hover:-translate-y-0.5 transition-all active:translate-y-1 active:shadow-none">
                            Войти
                        </button>
                    </Link>
                ) : (
                    <>
                        <Link to="/profile">
                            <button className="bg-[#FFBF00] font-pixel text-black text-base pl-[1.125rem] pr-[1rem] border-2 border-black shadow-[inset_-5px_-5px_0_0_#B28601] h-[3.125rem] hover:bg-[#FFD700] hover:-translate-y-0.5 transition-all active:translate-y-1 active:shadow-none">
                                Профиль
                            </button>
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;