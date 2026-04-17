import React from 'react'

const PixelButton = ({
                         children,
                         onClick,
                         variant = 'orange',
                         className = '',
                         fullWidth = false,
                     }) => {
    // 1. Добавили flex-col для правильного переноса строк
    // 2. leading-[1.2] вместо none, чтобы буквы не слипались
    // 3. antialiased-none (в обычном CSS это -webkit-font-smoothing: none)
    const baseStyle = "flex flex-col items-center justify-center text-center font-pixel border-2 border-black transition-all active:translate-y-1 active:shadow-none leading-[1.2] antialiased-none select-none";

    const variants = {
        orange: "bg-[#FFBF00] text-black shadow-[inset_-4px_-4px_0_0_#B28601] hover:bg-[#FFD700]",
        green: "bg-[rgba(196,242,13,1)] text-black shadow-[inset_-4px_-4px_0_0_rgba(151,188,8,0.65)] hover:brightness-110",
        brown: "bg-[#5c4a33] text-white shadow-[inset_-4px_-4px_0_0_rgba(0,0,0,0.3)] hover:brightness-110",
        gray: "bg-[rgba(157,127,80,0.71)] text-white shadow-[inset_-4px_-4px_0_0_rgba(0,0,0,0.3)] hover:bg-[rgba(180,140,90,1)]",
    };

    return (
        <button
            onClick={onClick}
            // УБРАЛИ лишние py, так как justify-center сам центрирует внутри h-[4rem]
            className={`${baseStyle} ${variants[variant]} ${fullWidth ? 'w-full': ''} text-lg ${className}`}
        >
            {/* Оборачиваем children, чтобы контролировать отступ, если шрифт "кривой" */}
            <span className="block pt-1">
                {children}
            </span>
        </button>
    );
};
export default PixelButton;