import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <div className="relative min-h-screen w-full flex flex-col overflow-x-hidden">
            {/* Navbar теперь фиксирован и всегда сверху */}
            <div className="fixed top-0 left-0 w-full z-50 px-4 md:px-8 py-2 bg-gradient-to-b from-black/80 to-transparent">
                <Navbar />
            </div>

            {/* Контент с отступом сверху, чтобы не наезжал на навбар */}
            <main className="relative z-10 flex-grow pt-24 px-4 md:px-8 lg:px-16 container mx-auto">
                {children}
            </main>
        </div>
    );
};

export default Layout;