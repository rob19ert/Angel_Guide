import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/'); // на главную после выхода
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <nav className="flex justify-between items-center mx-auto h-16 w-full px-4 md:px-0">
            <Link to="/" className="font-pixel flex flex-col text-right cursor-pointer transition-transform active:scale-95 z-50">
                <div className="text-main-color drop-shadow-[2px_2px_0_rgba(0,0,0,0.65)] text-sm md:text-base">Справочник</div>
                <div className="text-main-color drop-shadow-[2px_2px_0_rgba(0,0,0,0.65)] text-sm md:text-base">Рыболова</div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex gap-6 lg:gap-12 drop-shadow-[4 4px 4px ]">
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

            <div className="flex gap-4 items-center">
                <div className="hidden sm:flex gap-4">
                    {!isAuthenticated ? (
                        <Link to="/login">
                            <button className="bg-[#FFBF00] font-pixel text-black text-xs md:text-base px-4 border-2 border-black shadow-[inset_-4px_-4px_0_0_#B28601] h-10 md:h-[3.125rem] hover:bg-[#FFD700] hover:-translate-y-0.5 transition-all active:translate-y-1 active:shadow-none">
                                Войти
                            </button>
                        </Link>
                    ) : (
                        <Link to="/profile">
                            <button className="bg-[#FFBF00] font-pixel text-black text-xs md:text-base px-4 border-2 border-black shadow-[inset_-4px_-4px_0_0_#B28601] h-10 md:h-[3.125rem] hover:bg-[#FFD700] hover:-translate-y-0.5 transition-all active:translate-y-1 active:shadow-none">
                                Профиль
                            </button>
                        </Link>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button 
                    onClick={toggleMenu}
                    className="md:hidden text-[#FFBF00] p-2 z-50 focus:outline-none"
                >
                    {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 bg-black/95 z-40 flex flex-col items-center justify-center gap-8 md:hidden font-pixel">
                    <Link to="/equipment" onClick={toggleMenu} className="text-white text-2xl hover:text-main-color transition-colors">
                        Инвентарь
                    </Link>
                    <Link to="/map" onClick={toggleMenu} className="text-white text-2xl hover:text-main-color transition-colors">
                        Водоемы
                    </Link>
                    <Link to="/fish" onClick={toggleMenu} className="text-white text-2xl hover:text-main-color transition-colors">
                        Рыбы
                    </Link>
                    <Link to="/forum" onClick={toggleMenu} className="text-white text-2xl hover:text-main-color transition-colors">
                        Форум
                    </Link>
                    
                    <div className="mt-4 flex flex-col gap-4 w-full px-12">
                        {!isAuthenticated ? (
                            <Link to="/login" onClick={toggleMenu} className="w-full">
                                <button className="w-full bg-[#FFBF00] text-black py-4 border-2 border-black shadow-[inset_-4px_-4px_0_0_#B28601]">
                                    Войти
                                </button>
                            </Link>
                        ) : (
                            <Link to="/profile" onClick={toggleMenu} className="w-full">
                                <button className="w-full bg-[#FFBF00] text-black py-4 border-2 border-black shadow-[inset_-4px_-4px_0_0_#B28601]">
                                    Профиль
                                </button>
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;