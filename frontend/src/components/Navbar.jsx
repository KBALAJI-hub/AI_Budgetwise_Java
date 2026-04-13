import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { IconButton } from '@mui/material';
import { Brightness4, Brightness7, Menu } from '@mui/icons-material';
import './Navbar.css';

const Navbar = ({ onProfileClick, toggleColorMode, mode, onMenuClick }) => {
    const { user, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <IconButton
                    color="inherit"
                    onClick={onMenuClick}
                    className="menu-button"
                    sx={{ display: { sm: 'none' }, mr: 2 }}
                >
                    <Menu />
                </IconButton>
                <div className="navbar-brand-mobile">FinanceTracker</div>
            </div>

            <div className="navbar-right" ref={dropdownRef}>
                <IconButton onClick={toggleColorMode} sx={{ mr: 1 }}>
                    {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                </IconButton>

                <div
                    className="avatar-circle"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                    {user.fullName?.charAt(0).toUpperCase()}
                </div>

                <div className={`dropdown-menu ${dropdownOpen ? 'show' : ''}`}>
                    <div className="user-info-header">
                        <span className="user-name">{user.fullName}</span>
                        <span className="user-email">{user.email}</span>
                    </div>
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-item" onClick={() => {
                        setDropdownOpen(false);
                        onProfileClick();
                    }}>
                        Profile
                    </div>
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-item logout" onClick={logout}>
                        Logout
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
