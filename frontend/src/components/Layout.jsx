import React, { useState, useEffect } from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider, useTheme, Snackbar, Alert, CircularProgress, Backdrop } from '@mui/material';
import { Dashboard, SyncAlt, PieChart, Savings, AccountBalanceWallet, Logout, Menu, Forum, PictureAsPdf, TableView, CloudUpload } from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import api from '../utils/api';


const drawerWidth = 280;

const Layout = ({ toggleColorMode, mode, onProfileClick }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [backupLoading, setBackupLoading] = useState(false);

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        if (queryParams.get('error') === 'google-auth-failed') {
            setSnackbar({ open: true, message: 'Google Auth Failed. Please try again.', severity: 'error' });
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [location]);

    const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

    const menuItems = [
        { text: 'Dashboard', icon: <Dashboard />, path: '/' },
        { text: 'Transactions', icon: <SyncAlt />, path: '/transactions' },
        { text: 'Budgets', icon: <AccountBalanceWallet />, path: '/budget' },
        { text: 'Savings Goals', icon: <Savings />, path: '/savings' },
        { text: 'Analytics', icon: <PieChart />, path: '/analytics' },
        { text: 'Community Forum', icon: <Forum />, path: '/forum' },
    ];

    const handleExport = async (type) => {
        try {
            const res = await api.get(`/export/${type}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `financial_report.${type}`);
            document.body.appendChild(link);
            link.click();
        } catch (err) { console.error(err); }
    };

    const connectGoogleDrive = () => {
     window.location.href = "http://localhost:5000/auth/google?upload=true";
    };

    const handleBackup = async (provider) => {
        try {
            setBackupLoading(true);
            if (provider === 'google-drive') {
                const authCheck = await api.get('/backup/google/auth');
                if (!authCheck.data.configured) {
                    window.location.href = authCheck.data.url;
                    return;
                }
            }
            const res = await api.post(`/backup/${provider}`);
            setSnackbar({ open: true, message: res.data.message || 'Backup successful!', severity: 'success' });
        } catch (err) {
            console.error(err);
            setSnackbar({ open: true, message: err.response?.data?.error || 'Failed to backup data.', severity: 'error' });
        } finally {
            setBackupLoading(false);
        }
    };

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', borderRight: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <AccountBalanceWallet sx={{ fontSize: 32, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: -0.5 }}>
                    FinanceTracker
                </Typography>
            </Box>
            <Divider sx={{ mx: 2, opacity: 0.1 }} />
            
            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
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

                    <Divider sx={{ my: 2, opacity: 0.1 }} />
                    <Typography variant="overline" sx={{ px: 2, pb: 1, color: 'text.secondary', display: 'block', fontWeight: 600 }}>EXPORT & BACKUP</Typography>
                    
                    <ListItem disablePadding sx={{ mb: 1 }}>
                        <ListItemButton onClick={() => handleExport('pdf')} sx={{ borderRadius: 3 }}>
                            <ListItemIcon sx={{ minWidth: 45, color: 'text.secondary' }}><PictureAsPdf /></ListItemIcon>
                            <ListItemText primary="Export PDF" primaryTypographyProps={{ fontWeight: 600 }} />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding sx={{ mb: 1 }}>
                        <ListItemButton onClick={() => handleExport('csv')} sx={{ borderRadius: 3 }}>
                            <ListItemIcon sx={{ minWidth: 45, color: 'text.secondary' }}><TableView /></ListItemIcon>
                            <ListItemText primary="Export CSV" primaryTypographyProps={{ fontWeight: 600 }} />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding sx={{ mb: 1 }}>
                        <ListItemButton onClick={connectGoogleDrive} sx={{ borderRadius: 3 }}>
                            <ListItemIcon sx={{ minWidth: 45, color: 'text.secondary' }}><CloudUpload /></ListItemIcon>
                            <ListItemText primary="Google Drive" primaryTypographyProps={{ fontWeight: 600 }} />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding sx={{ mb: 1 }}>
                        <ListItemButton onClick={() => handleBackup('dropbox')} sx={{ borderRadius: 3 }}>
                            <ListItemIcon sx={{ minWidth: 45, color: 'text.secondary' }}><CloudUpload /></ListItemIcon>
                            <ListItemText primary="Dropbox" primaryTypographyProps={{ fontWeight: 600 }} />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Box>

            <Box sx={{ p: 2, mt: 'auto' }}>
                <Divider sx={{ mb: 2, opacity: 0.1 }} />
                <ListItemButton onClick={logout} sx={{ borderRadius: 3, color: 'error.main', '&:hover': { background: 'rgba(239, 68, 68, 0.1)' } }}>
                    <ListItemIcon sx={{ minWidth: 45, color: 'inherit' }}><Logout /></ListItemIcon>
                    <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 600 }} />
                </ListItemButton>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <Navbar
                onProfileClick={onProfileClick}
                toggleColorMode={toggleColorMode}
                mode={mode}
                onMenuClick={() => setMobileOpen(!mobileOpen)}
            />

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

            <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 2 }} open={backupLoading}>
                <CircularProgress color="inherit" />
                <Typography sx={{ ml: 2, fontWeight: 600 }}>Processing Backup...</Typography>
            </Backdrop>

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Layout;
