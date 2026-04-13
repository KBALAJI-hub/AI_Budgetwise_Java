import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            const res = await api.get('/auth/me');
            setUser(res.data);
        } catch (err) {
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/login';
    };

    const updateProfile = async (userData) => {
        const res = await api.put('/auth/profile', userData);
        setUser(res.data);
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout, fetchUser, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
