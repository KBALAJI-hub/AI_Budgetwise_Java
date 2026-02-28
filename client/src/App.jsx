import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, Outlet } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Container, Paper, Box, Typography, TextField, Button, Grid, LinearProgress, CircularProgress, Table, TableBody, TableCell, TableRow, IconButton, MenuItem, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, AppBar, Toolbar, Avatar } from '@mui/material';
import { Dashboard as DashIcon, SyncAlt, AccountBalanceWallet, Savings, PieChart, Logout, Menu, Add, Download, Delete, TrendingUp, TrendingDown, AccountBalance } from '@mui/icons-material';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const api = axios.create({ baseURL: '/api' });
api.interceptors.request.use(c => {
    const t = localStorage.getItem('token');
    if (t) c.headers.Authorization = `Bearer ${t}`;
    return c;
});

const AuthContext = createContext();
const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const t = localStorage.getItem('token');
        if (t) api.get('/users/profile').then(r => setUser(r.data)).catch(() => localStorage.removeItem('token')).finally(() => setLoading(false));
        else setLoading(false);
    }, []);
    const login = async (e, p) => {
        const r = await api.post('/auth/login', { email: e, password: p });
        localStorage.setItem('token', r.data.token);
        setUser(r.data.user);
    };
    return <AuthContext.Provider value={{ user, loading, login, logout: () => { localStorage.removeItem('token'); setUser(null); } }}>{children}</AuthContext.Provider>;
};

const theme = createTheme({
    palette: { mode: 'dark', primary: { main: '#6366f1' }, background: { default: '#0f172a', paper: '#1e293b' } },
    typography: { fontFamily: 'Outfit, sans-serif' },
    shape: { borderRadius: 12 }
});

const Login = () => {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const { login } = useContext(AuthContext);
    const nav = useNavigate();
    return (
        <Container maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
            <Paper sx={{ p: 4, width: '100%', bgcolor: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                <Typography variant="h4" gutterBottom fontWeight={700}>Login</Typography>
                <TextField fullWidth label="Email" margin="normal" onChange={e => setEmail(e.target.value)} />
                <TextField fullWidth label="Password" type="password" margin="normal" onChange={e => setPass(e.target.value)} />
                <Button fullWidth variant="contained" sx={{ mt: 3 }} onClick={async () => { await login(email, pass); nav('/'); }}>Login</Button>
            </Paper>
        </Container>
    );
};

const Layout = () => {
    const { user, logout } = useContext(AuthContext);
    const nav = useNavigate();
    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed" sx={{ zIndex: 1201, bgcolor: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(10px)' }}>
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>FinanceTracker</Typography>
                    <Button color="inherit" onClick={() => { logout(); nav('/login'); }}><Logout /></Button>
                </Toolbar>
            </AppBar>
            <Drawer variant="permanent" sx={{ width: 240, '& .MuiDrawer-paper': { width: 240, boxSizing: 'border-box', bgcolor: '#0f172a' } }}>
                <Toolbar />
                <List>
                    {[
                        { t: 'Dashboard', i: <DashIcon />, p: '/' },
                        { t: 'Transactions', i: <SyncAlt />, p: '/transactions' },
                        { t: 'Budgets', i: <AccountBalanceWallet />, p: '/budgets' },
                        { t: 'Savings', i: <Savings />, p: '/savings' },
                        { t: 'Analytics', i: <PieChart />, p: '/analytics' }
                    ].map(x => (
                        <ListItem key={x.t} disablePadding><ListItemButton onClick={() => nav(x.p)}><ListItemIcon>{x.i}</ListItemIcon><ListItemText primary={x.t} /></ListItemButton></ListItem>
                    ))}
                </List>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3, pt: 10 }}><Outlet /></Box>
        </Box>
    );
};

const Dashboard = () => {
    const [data, setData] = useState(null);
    useEffect(() => { api.get('/analytics/summary').then(r => setData(r.data)); }, []);
    return (
        <Grid container spacing={3}>
            {['Income', 'Expenses', 'Balance'].map((l, i) => (
                <Grid item xs={12} md={4} key={l}>
                    <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.05)' }}>
                        <Typography variant="body2">{l}</Typography>
                        <Typography variant="h4" fontWeight={700}>${(i === 0 ? data?.totalIncome : i === 1 ? data?.totalExpense : data?.netSavings) || 0}</Typography>
                    </Paper>
                </Grid>
            ))}
        </Grid>
    );
};

const Transactions = () => {
    const [ts, setTs] = useState([]);
    useEffect(() => { api.get('/transactions').then(r => setTs(r.data)); }, []);
    return (
        <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.05)' }}>
            <Table><TableBody>{ts.map(t => (
                <TableRow key={t.id}><TableCell>{t.category}</TableCell><TableCell>{t.type}</TableCell><TableCell align="right">${t.amount}</TableCell></TableRow>
            ))}</TableBody></Table>
        </Paper>
    );
};

const App = () => (
    <AuthProvider>
        <ThemeProvider theme={theme}><CssBaseline />
            <BrowserRouter><Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Layout />}><Route index element={<Dashboard />} /><Route path="transactions" element={<Transactions />} /><Route path="budgets" element={<div>Budgets</div>} /><Route path="savings" element={<div>Savings</div>} /><Route path="analytics" element={<div>Analytics</div>} /></Route>
            </Routes></BrowserRouter>
        </ThemeProvider>
    </AuthProvider>
);
export default App;
