import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { MessageSquare, PlusCircle } from 'lucide-react';
import bgImageSrc from '/src/assets/images/background/prof_bg.jpg';

const ForumPage = () => {
    const canvasRef = useRef(null);
    const { isAuthenticated, user } = useAuth();
    
    const [topics, setTopics] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [messages, setMessages] = useState([]);
    const [activeTopic, setActiveTopic] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [newTopicTitle, setNewTopicTitle] = useState('');
    const [isCreatingTopic, setIsCreatingTopic] = useState(false);

    useEffect(() => {
        fetchTopics();
    }, []);

    // Отладка роли для понимания почему не видно кнопки удаления
    useEffect(() => {
        if (user) {
            console.log("DEBUG: Current User:", user);
            console.log("DEBUG: Role:", user.role);
        }
    }, [user]);

    const fetchTopics = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/forum_topics');
            let fetchedTopics = response.data.data.forum_topics || [];
            
            // Сортировка: новые сверху
            fetchedTopics.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            
            setTopics(fetchedTopics);
        } catch (error) {
            console.error("Ошибка загрузки тем форума:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectTopic = async (topic) => {
        setActiveTopic(topic);
        try {
            const response = await api.get('/api/forum_messages');
            const topicMessages = (response.data.data.forum_messages || []).filter(
                msg => msg.topic_id === topic.id
            );
            topicMessages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            setMessages(topicMessages);
        } catch (error) {
            console.error("Ошибка загрузки сообщений:", error);
        }
    };

    const handleDeleteTopic = async (topicId) => {
        if (!window.confirm("Вы уверены, что хотите удалить эту тему?")) return;
        try {
            await api.delete(`/admin/forum_topics/${topicId}`);
            if (activeTopic?.id === topicId) setActiveTopic(null);
            fetchTopics();
        } catch (error) {
            console.error("Ошибка удаления темы:", error);
            alert("Не удалось удалить тему. Убедитесь, что у вас есть права администратора.");
        }
    };

    const handleDeleteMessage = async (msgId) => {
        if (!window.confirm("Удалить сообщение?")) return;
        try {
            await api.delete(`/admin/forum_messages/${msgId}`);
            if (activeTopic) handleSelectTopic(activeTopic);
        } catch (error) {
            console.error("Ошибка удаления сообщения:", error);
            alert("Не удалось удалить сообщение.");
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeTopic) return;

        try {
            await api.post('/api/forum_messages', {
                topic_id: activeTopic.id,
                content: newMessage
            });
            setNewMessage('');
            handleSelectTopic(activeTopic); 
        } catch (error) {
            console.error("Ошибка отправки сообщения:", error);
            if (error.response && error.response.status === 500) {
                handleSelectTopic(activeTopic);
                setNewMessage('');
            } else {
                alert("Ошибка при отправке. Убедитесь, что вы авторизованы.");
            }
        }
    };

    const filteredTopics = topics.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreateTopic = async (e) => {
        e.preventDefault();
        if (!newTopicTitle.trim() || !newMessage.trim()) {
            alert("Заголовок и текст первого сообщения не могут быть пустыми.");
            return;
        }

        try {
            const response = await api.post('/api/forum_topics', {
                title: newTopicTitle,
                content: newMessage 
            });
            
            setNewTopicTitle('');
            setNewMessage('');
            setIsCreatingTopic(false);
            await fetchTopics();
            
            if (response.data && response.data.data) {
                handleSelectTopic(response.data.data); 
            }
        } catch (error) {
            console.error("Ошибка создания темы:", error);
            if (error.response && error.response.status === 500) {
                await fetchTopics();
                setIsCreatingTopic(false);
                setNewTopicTitle('');
                setNewMessage('');
            } else {
                alert("Не удалось создать тему. Проверьте заполнение полей.");
            }
        }
    };

    // Canvas animation background
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationId;
        const bg = new Image();
        bg.src = bgImageSrc;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.imageSmoothingEnabled = false;
            if (bg.complete) {
                ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
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

    // Helper to check admin status safely
    const isAdmin = user?.role?.toLowerCase() === 'admin';

    return (
        <div className="relative h-screen w-full flex flex-col font-pixel text-black overflow-hidden">
            <canvas ref={canvasRef} className="absolute inset-0 -z-10" />

            <style>{`
                .pixelated { image-rendering: pixelated; }
                .custom-scroll::-webkit-scrollbar { width: 16px; }
                .custom-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.4); border-left: 2px solid black; }
                .custom-scroll::-webkit-scrollbar-thumb { background-color: #eab308; border: 2px solid black; box-shadow: inset -2px -2px 0px rgba(0,0,0,0.3); }
                .custom-scroll::-webkit-scrollbar-thumb:hover { background-color: #facc15; }
            `}</style>

            <div className="container mx-auto px-4 md:px-[5.5rem] pt-[1.125rem] flex-shrink-0 z-10">
                <Navbar />
            </div>

            <div className="flex-1 overflow-hidden w-full mt-4 flex justify-center pb-10">
                <div className="container px-4 md:px-[5.5rem] h-full flex flex-col max-w-7xl">
                    
                    <div className="text-center mb-6">
                        <h1 className="text-4xl text-[#FFFFB7] drop-shadow-[2px_2px_0_rgba(0,0,0,1)] tracking-wider uppercase">
                            Форум Рыболовов
                        </h1>
                    </div>

                    <div className="flex flex-1 gap-8 min-h-0">
                        {/* ЛЕВАЯ КОЛОНКА: ТЕМЫ */}
                        <div className="w-1/3 bg-[#EAD4AA]/90 border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,0.5)] flex flex-col min-h-0">
                            <h2 className="text-2xl text-center py-4 border-b-4 border-black bg-[#D4C095] uppercase font-bold flex items-center justify-center gap-2">
                                <MessageSquare size={24} /> Темы
                            </h2>
                            
                            {isCreatingTopic ? (
                                <form onSubmit={handleCreateTopic} className="p-4 border-b-4 border-black bg-[#D4C095] flex flex-col gap-2">
                                    <input 
                                        type="text"
                                        placeholder="Название темы..."
                                        value={newTopicTitle}
                                        onChange={(e) => setNewTopicTitle(e.target.value)}
                                        className="w-full bg-white border-2 border-black p-2 focus:outline-none font-bold shadow-[inset_2px_2px_0_rgba(0,0,0,0.1)]"
                                        autoFocus
                                    />
                                    <textarea 
                                        placeholder="Текст сообщения..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        className="w-full bg-white border-2 border-black p-2 focus:outline-none resize-none h-20 shadow-[inset_2px_2px_0_rgba(0,0,0,0.1)]"
                                    />
                                    <div className="flex gap-2 mt-2">
                                        <button type="submit" className="flex-1 bg-green-500 hover:bg-green-400 border-2 border-black py-1 font-bold shadow-[2px_2px_0_black] active:translate-y-0.5">Создать</button>
                                        <button type="button" onClick={() => setIsCreatingTopic(false)} className="bg-red-400 hover:bg-red-300 border-2 border-black px-3 font-bold shadow-[2px_2px_0_black] active:translate-y-0.5">X</button>
                                    </div>
                                </form>
                            ) : (
                                isAuthenticated && (
                                    <div className="p-3 border-b-4 border-black bg-[#D4C095]">
                                        <button 
                                            onClick={() => setIsCreatingTopic(true)}
                                            className="w-full bg-yellow-400 hover:bg-yellow-300 border-2 border-black py-2 font-bold shadow-[4px_4px_0_black] active:translate-y-1 transition-all flex items-center justify-center gap-2"
                                        >
                                            <PlusCircle size={18} /> Новая тема
                                        </button>
                                    </div>
                                )
                            )}

                            <div className="p-3 border-b-2 border-black bg-[#D4C095]/50">
                                <input 
                                    type="text"
                                    placeholder="Поиск тем..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white border-2 border-black p-2 text-sm focus:outline-none"
                                />
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-3 bg-white/30">
                                {loading ? (
                                    <p className="text-center mt-10">Загрузка...</p>
                                ) : filteredTopics.length > 0 ? (
                                    filteredTopics.map(topic => (
                                        <div 
                                            key={topic.id}
                                            onClick={() => handleSelectTopic(topic)}
                                            className={`p-3 border-2 border-black cursor-pointer group relative ${activeTopic?.id === topic.id ? 'bg-yellow-400 shadow-[inset_2px_2px_0_rgba(0,0,0,0.2)]' : 'bg-white shadow-[4px_4px_0_rgba(0,0,0,0.8)]'}`}
                                        >
                                            <h3 className="font-bold text-lg line-clamp-2 pr-6">{topic.title}</h3>
                                            <div className="flex justify-between items-center mt-2">
                                                <p className="text-[10px] text-gray-600 italic">#{topic.id}</p>
                                                <p className="text-[10px] text-gray-600">
                                                    {new Date(topic.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            
                                            {(isAdmin || user?.id === topic.author_id) && (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteTopic(topic.id); }}
                                                    className="absolute top-1 right-1 text-red-600 opacity-0 group-hover:opacity-100 hover:scale-125 transition-all font-bold bg-white/90 px-1 border border-black text-[10px] z-20"
                                                >
                                                    удалить
                                                </button>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center mt-10 opacity-50 italic">Темы не найдены</p>
                                )}
                            </div>
                        </div>

                        {/* ПРАВАЯ КОЛОНКА: СООБЩЕНИЯ */}
                        <div className="w-2/3 bg-[#EAD4AA]/90 border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,0.5)] flex flex-col min-h-0">
                            {activeTopic ? (
                                <>
                                    <div className="p-4 border-b-4 border-black bg-[#D4C095] flex justify-between items-center">
                                        <h2 className="text-2xl font-bold uppercase truncate pr-4">{activeTopic.title}</h2>
                                        {(isAdmin || user?.id === activeTopic.author_id) && (
                                            <button 
                                                onClick={() => handleDeleteTopic(activeTopic.id)}
                                                className="bg-red-500 hover:bg-red-400 border-2 border-black px-2 py-1 text-xs text-white shadow-[2px_2px_0_black] active:translate-y-0.5"
                                            >
                                                Удалить тему
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scroll p-6 space-y-6 bg-white/30 relative">
                                        {messages.length > 0 ? (
                                            messages.map(msg => (
                                                <div key={msg.id} className="bg-white border-2 border-black shadow-[4px_4px_0_rgba(0,0,0,0.2)] p-4 flex gap-4 relative group">
                                                    <div className="w-16 h-16 bg-blue-200 border-2 border-black flex-shrink-0">
                                                        <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${msg.author_id}`} alt="avatar" className="w-full h-full pixelated" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-baseline mb-2 border-b-2 border-black/10 pb-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-blue-800 text-lg">{msg.author_username || `Пользователь #${msg.author_id}`}</span>
                                                                {msg.author_id === activeTopic.author_id && <span className="bg-yellow-200 text-[10px] px-1 border border-yellow-600 rounded">Автор</span>}
                                                            </div>
                                                            <span className="text-xs text-gray-500">{new Date(msg.created_at).toLocaleString()}</span>
                                                        </div>
                                                        <p className="text-xl whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                                    </div>
                                                    {(isAdmin || user?.id === msg.author_id) && (
                                                        <button 
                                                            onClick={() => handleDeleteMessage(msg.id)}
                                                            className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 hover:scale-110 transition-all font-bold bg-white/80 px-1 border border-black text-[10px]"
                                                        >
                                                            удалить
                                                        </button>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-center mt-20 opacity-50 italic text-xl">Сообщений нет</p>
                                        )}
                                    </div>
                                    {isAuthenticated ? (
                                        <form onSubmit={handleSendMessage} className="p-4 border-t-4 border-black bg-[#D4C095] flex gap-4">
                                            <textarea 
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder="Написать сообщение..."
                                                className="flex-1 bg-white border-2 border-black p-3 focus:outline-none resize-none h-20 text-lg"
                                            />
                                            <button 
                                                type="submit" 
                                                className="w-40 bg-yellow-500 hover:bg-yellow-400 border-4 border-black font-bold uppercase shadow-[4px_4px_0_black] active:translate-y-1 transition-all text-lg"
                                            >
                                                Отправить
                                            </button>
                                        </form>
                                    ) : (
                                        <div className="p-4 border-t-4 border-black bg-red-200 text-center text-red-900 font-bold">
                                            Войдите, чтобы писать сообщения.
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center opacity-50 italic">
                                    <MessageSquare size={64} className="mb-4" />
                                    <span className="text-2xl">Выберите тему</span>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForumPage;
