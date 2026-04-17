import React from 'react';
import Navbar from '../components/Navbar';
import Stepper from '../components/Stepper';
import { useNavigate } from 'react-router-dom';
import bgImg from '../assets/images/background/bg_plan.jpg';
import fishermanImg from '../assets/images/purple_fisherman.png';

const GuideMapPage = () => {
    const navigate = useNavigate();
    return (
        <>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 16px; 
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.4); 
                    border-left: 2px solid #000;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #eab308;
                    border: 2px solid #000;
                    box-shadow: inset -2px -2px 0px rgba(0,0,0,0.3);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: #facc15;
                }
            `}</style>

            <div id="plan" className="relative h-screen w-full font-pixel text-white overflow-y-auto overflow-x-hidden custom-scrollbar">
                
                <div 
                    className="fixed inset-0 -z-20 bg-cover bg-center" 
                    style={{ backgroundImage: `url(${bgImg})` }}
                ></div>
                
                <img 
                    src={fishermanImg} 
                    alt="Fisherman" 
                    className="fixed inset-0 w-full h-full object-cover -z-10"
                />
                
                {/* Уменьшили боковые отступы для стандартных экранов: px-4 md:px-12 lg:px-[5.5rem] */}
                <div className="container mx-auto px-4 md:px-12 lg:px-[5.5rem] pt-[1.125rem] pb-16 relative z-10">
                    <Navbar />
                    
                    {/* Уменьшили отступы блока с заголовком */}
                    <div className="mt-8 md:mt-12 mb-6 md:mb-8">
                        {/* Заголовок теперь 4xl, а на огромных экранах 5xl */}
                        <h1 className="text-3xl md:text-4xl lg:text-5xl text-center drop-shadow-[4px_4px_0_rgba(0,0,0,1)] mb-3 lg:mb-4">
                            Путеводитель рыболова
                        </h1>
                        <p className="text-base md:text-lg lg:text-xl text-center drop-shadow-[2px_2px_0_rgba(0,0,0,1)] text-yellow-400">
                            Ваш пошаговый маршрут к идеальному улову
                        </p>
                    </div>
                    
                    <Stepper />
                    
                    {/* Карточки: 1 колонка на смартфонах, 3 колонки на экранах от md и больше */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-8 mt-10 lg:mt-16 max-w-5xl mx-auto">
                        {[
                            { title: 'Выбор цели', desc: 'Определитесь, какую рыбу вы хотите поймать сегодня.' },
                            { title: 'Локация', desc: 'Выберите подходящий водоем, где обитает ваша цель.' },
                            { title: 'Подготовка', desc: 'Соберите лучшие снасти и прикормку для успеха.' }
                        ].map((item, i) => (
                            <div key={i} className="bg-black/60 p-4 lg:p-6 border-2 border-yellow-400/50 backdrop-blur-sm">
                                <h3 className="text-yellow-400 text-lg lg:text-xl text-center mb-2">{item.title}</h3>
                                <p className="text-xs lg:text-sm text-gray-200 text-center">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-center mt-8 lg:mt-12">
                        {/* Кнопка: сделали чуть изящнее шрифты и паддинги, на больших экранах вернется ваш размер */}
                        <button 
                            onClick={() => navigate('/fish')}
                            className="bg-yellow-400 text-black text-xl lg:text-2xl px-8 py-4 lg:px-12 lg:py-6 border-4 border-black shadow-[6px_6px_0_rgba(0,0,0,1)] lg:shadow-[8px_8px_0_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-[3px_3px_0_rgba(0,0,0,1)] transition-all"
                        >
                            Начать планирование →
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default GuideMapPage;