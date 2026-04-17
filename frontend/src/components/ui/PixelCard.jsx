import React from 'react';

const PixelCard = ({ children, className = '', noPadding = false }) => {
    return (
        <div className={`bg-[rgba(20,20,30,0.6)] backdrop-blur-md border-2 border-white/20 shadow-pixel text-white ${noPadding ? '' : 'p-6'} ${className}`}>
            {children}
        </div>
    );
};

export default PixelCard;