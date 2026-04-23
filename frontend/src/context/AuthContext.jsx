import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await api.get('/api/me');
                if (response.data && response.data.status === "ok") {
                    setUser(response.data.data);
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                    setUser(null);
                }
            } catch (error) {
                setIsAuthenticated(false);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/admin/login', { email, password });
            if (response.data && response.data.status === "ok") {
                const meRes = await api.get('/api/me');
                if (meRes.data && meRes.data.status === "ok") {
                    setUser(meRes.data.data);
                    setIsAuthenticated(true);
                    return true;
                }
            }
        } catch (error) {
            console.error("Login error:", error);
        }
        return false;
    };

    const register = async (username, email, password, secret_key) => {
        const payload = { username, email, password };
        if (secret_key) {
            payload.secret_key = secret_key;
        }
        try {
            const response = await api.post('/user/register', payload);
            return response.data;
        } catch (error) {
            console.error("Registration error:", error);
            throw error;
        }
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
    };

    const updateUser = async (updateData) => {
        try {
            const response = await api.patch('/api/me', updateData);
            if (response.data && response.data.status === "ok") {
                setUser(response.data.data); // Обновляем данные юзера в контексте
                return response.data.data;
            }
        } catch (error) {
            console.error("Update user error:", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ login, register, logout, updateUser, isAuthenticated, isLoading, user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};
