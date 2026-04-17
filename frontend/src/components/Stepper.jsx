import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const STEPS =[
    { id: 'fish', label: 'Рыба', path: '/fish' },
    { id: 'water', label: 'Водоем', path: '/water' },
    { id: 'equipment', label: 'Экипировка', path: '/equipment' },
    { id: 'lure', label: 'Наживка', path: '/lures' },
    { id: 'groundbait', label: 'Прикормка', path: '/groundbaits' },
    { id: 'result', label: 'Итоги', path: '/inventory' }
];

const Stepper = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentStepIndex = STEPS.findIndex(step => location.pathname === step.path);

    return (
        // Уменьшили базовые отступы, большие оставили для lg:
        <div className="w-full py-3 lg:py-4 px-4 lg:px-8 bg-black/40 backdrop-blur-sm border-2 border-black mb-8">
            <div className="relative flex justify-between items-center max-w-4xl mx-auto">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-black/50 -translate-y-1/2 -z-10"></div>
                
                <div 
                    className="absolute top-1/2 left-0 h-1 bg-yellow-400 -translate-y-1/2 -z-10 transition-all duration-500"
                    style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
                ></div>

                {STEPS.map((step, index) => {
                    const isActive = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    return (
                        <div 
                            key={step.id} 
                            className="flex flex-col items-center gap-1.5 lg:gap-2 cursor-pointer group"
                            onClick={() => navigate(step.path)}
                        >
                            <div 
                                // Уменьшили квадратики на малых экранах (w-8 h-8), вернули w-10 на больших (lg:w-10)
                                className={`w-8 h-8 lg:w-10 lg:h-10 border-2 border-black flex items-center justify-center transition-all duration-300 font-pixel text-sm lg:text-base
                                    ${isActive ? 'bg-yellow-400 text-black shadow-[4px_4px_0_rgba(0,0,0,1)]' : 'bg-gray-600 text-gray-400'}
                                    ${isCurrent ? 'scale-125 -translate-y-1 ring-4 ring-yellow-400/30' : 'hover:scale-110'}
                                `}
                            >
                                {index + 1}
                            </div>
                            <span 
                                // Текст ярлыков тоже чуть компактнее
                                className={`font-pixel text-[10px] lg:text-xs uppercase tracking-wider transition-colors
                                    ${isActive ? 'text-yellow-400 drop-shadow-[1px_1px_0_rgba(0,0,0,1)]' : 'text-gray-200'}
                                `}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Stepper;