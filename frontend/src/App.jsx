import React, { useMemo, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import { getTheme } from './theme';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budget from './pages/Budget';
import Savings from './pages/Savings';
import Analytics from './pages/Analytics';
import ForumPage from './pages/Forum';
import ProfileModal from './components/ProfileModal';


const ProtectedRoute = ({ children }) => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (!isLoggedIn) {
        return <Navigate to="/login" />;
    }

    return children;
};

const AppContent = () => {
    const [mode, setMode] = useState('dark');
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const theme = useMemo(() => getTheme(mode), [mode]);

    const toggleColorMode = () => {
        setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Layout
                                mode={mode}
                                toggleColorMode={toggleColorMode}
                                onProfileClick={() => setIsProfileOpen(true)}
                            />
                            <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Dashboard />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="transactions" element={<Transactions />} />
                        <Route path="budget" element={<Budget />} />
                        <Route path="savings" element={<Savings />} />
                        <Route path="analytics" element={<Analytics />} />
                        <Route path="forum" element={<ForumPage />} />
                    </Route>

                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
};

const App = () => (
    <AuthProvider>
        <AppContent />
    </AuthProvider>
);

export default App;
