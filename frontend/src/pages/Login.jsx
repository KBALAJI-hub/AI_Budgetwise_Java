import React, { useState } from 'react';
import { Container, Paper, Box, Typography, TextField, Button, Link, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to login');
        }
    };

    return (
        <Container maxWidth="xs">
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <Paper className="glass-card" sx={{ p: 4, width: '100%', maxWidth: 400 }}>
                        <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 700 }}>
                            Welcome Back
                        </Typography>
                        <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 4 }}>
                            Enter your credentials to access your account
                        </Typography>

                        {error && (
                            <Typography color="error" variant="body2" align="center" sx={{ mb: 2 }}>
                                {error}
                            </Typography>
                        )}

                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Email"
                                variant="outlined"
                                margin="normal"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><Email fontSize="small" /></InputAdornment>,
                                }}
                            />
                            <TextField
                                fullWidth
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                variant="outlined"
                                margin="normal"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><Lock fontSize="small" /></InputAdornment>,
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <Button fullWidth variant="contained" type="submit" size="large" sx={{ mt: 3, mb: 2 }}>
                                Login
                            </Button>
                        </form>

                        <Typography variant="body2" align="center">
                            Don't have an account?{' '}
                            <Link component={RouterLink} to="/register" underline="none" sx={{ fontWeight: 600 }}>
                                Register
                            </Link>
                        </Typography>
                    </Paper>
                </motion.div>
            </Box>
        </Container>
    );
};

export default Login;
