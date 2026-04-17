import React from 'react';
import Navbar from '../components/Navbar';

const TitlePage = () => {
    return (
        <div className="min-h-screen bg-[rgba(127,127,127)] text-gray-100 font-sans flex flex-col">
            <div className="container mx-auto px-4 pt-6 md:px-[5.5rem] relative z-20">
                <Navbar />
            </div>

            <div className="flex-grow flex items-center justify-center p-4 py-12">
                <div className="max-w-4xl w-full bg-gray-500 border border-gray-800 rounded-2xl shadow-2xl p-8 md:p-16">
                    
                    {/* Шапка про министерство */}
                    <div className="text-center mb-12 text-sm md:text-base text-white space-y-1">
                        <p>Министерство науки и высшего образования Российской Федерации</p>
                        <p>Федеральное государственное автономное образовательное учреждение</p>
                        <p>высшего образования</p>
                        <p className="text-white font-medium pt-2">
                            «Московский государственный технический университет имени Н.Э. Баумана»
                        </p>
                        <p className="text-gray-500">Кафедра «Системы обработки информации и управления»</p>
                    </div>

                    {/* Тема диплома и Цель */}
                    <div className="text-center mb-16">
                        <h1 className="text-2xl md:text-4xl font-bold text-white mb-4 uppercase tracking-wider">
                            Выпускная квалификационная работа
                        </h1>
                        <p className="text-lg md:text-2xl text-yellow-500 font-medium">
                            Тема: Информационная рекомендательная система -
                        </p>
                        <p className="text-lg md:text-2xl text-yellow-500 font-medium mb-10">
                            справочник рыболова
                        </p>
                        
                        <div className="bg-gray-800/50 rounded-xl p-6 md:p-8 text-left border-l-4 border-yellow-500">
                            <p className="text-lg md:text-xl leading-relaxed text-gray-200">
                                <span className="font-bold text-white uppercase tracking-wide text-sm block mb-2 opacity-70">Цель работы</span> 
                                Автоматизизация качества подбора, планирования и организации досуга для рыболовов-любителей.
                            </p>
                        </div>
                    </div>

                    {/* ФИО и Научный руководитель */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 pt-12 border-t border-gray-800">
                        <div>
                            <p className="text-sm text-white uppercase tracking-widest mb-2">Научный руководитель</p>
                            <p className="text-xl font-medium text-white">В. М. Постников</p>
                        </div>
                        <div className="md:text-right">
                            <p className="text-sm text-white uppercase tracking-widest mb-2">Студент</p>
                            <p className="text-xl font-medium text-white">Р. И. Сайфутдинов</p>
                        </div>
                    </div>

                    {/* Год */}
                    <div className="text-center mt-16 text-gray-600">
                        <p>Москва, 2026 г.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TitlePage;
