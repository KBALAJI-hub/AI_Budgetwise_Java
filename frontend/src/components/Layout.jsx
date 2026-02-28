import React, { useState } from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, IconButton, AppBar, Toolbar, Avatar, Divider, useTheme } from '@mui/material';
import { Dashboard, SyncAlt, PieChart, Savings, Settings, AccountBalanceWallet, Logout, Menu, Brightness4, Brightness7 } from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 280;

const Layout = ({ toggleColorMode, mode }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const menuItems = [
        { text: 'Dashboard', icon: <Dashboard />, path: '/' },
        { text: 'Transactions', icon: <SyncAlt />, path: '/transactions' },
        { text: 'Budgets', icon: <AccountBalanceWallet />, path: '/budgets' },
        { text: 'Savings Goals', icon: <Savings />, path: '/savings' },
        { text: 'Analytics', icon: <PieChart />, path: '/analytics' },
    ];

    const drawer = (
        <Box sx={{ height: '100%', background: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', borderRight: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <AccountBalanceWallet sx={{ fontSize: 32, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: -0.5 }}>
                    FinanceTracker
                </Typography>
            </Box>
            <Divider sx={{ mx: 2, opacity: 0.1 }} />
            <List sx={{ px: 2, py: 3 }}>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                        <ListItemButton
                            onClick={() => navigate(item.path)}
                            selected={location.pathname === item.path}
                            sx={{
                                borderRadius: 3,
                                '&.Mui-selected': {
                                    background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
                                    color: '#fff',
                                    '& .MuiListItemIcon-root': { color: '#fff' },
                                    '&:hover': { opacity: 0.9 },
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 45, color: location.pathname === item.path ? '#fff' : 'text.secondary' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 600 }} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 2 }}>
                <Divider sx={{ mb: 2, opacity: 0.1 }} />
                <ListItemButton onClick={logout} sx={{ borderRadius: 3, color: 'error.main' }}>
                    <ListItemIcon sx={{ minWidth: 45, color: 'inherit' }}><Logout /></ListItemIcon>
                    <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 600 }} />
                </ListItemButton>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <AppBar position="fixed" sx={{ width: { sm: `calc(100% - ${drawerWidth}px)` }, ml: { sm: `${drawerWidth}px` }, background: 'transparent', boxShadow: 'none', backdropFilter: 'blur(5px)' }}>
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2, display: { sm: 'none' } }}>
                        <Menu />
                    </IconButton>
                    <Box sx={{ flexGrow: 1 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton onClick={toggleColorMode}>
                            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                        </IconButton>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>{user?.fullName?.charAt(0)}</Avatar>
                        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{user?.fullName}</Typography>
                            <Typography variant="caption" color="textSecondary">Premium Account</Typography>
                        </Box>
                    </Box>
                </Toolbar>
            </AppBar>

            <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    ModalProps={{ keepMounted: true }}
                    sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none' } }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none' } }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, pt: 10 }}>
                <Outlet />
            </Box>
        </Box>
    );
};

export default Layout;
