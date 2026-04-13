import React, { useState } from 'react';
import { Container, Paper, Box, Typography, TextField, Button, Link, InputAdornment } from '@mui/material';
import { Email, Lock, Person } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { fetchUser } = useAuth();

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            console.log('Attempting registration for:', formData.email);
            const response = await api.post('/auth/register', formData);
            console.log('Registration response:', response.data);
            
            localStorage.setItem("token", response.data.token);
            if (fetchUser) await fetchUser();
            navigate('/');
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.response?.data?.error || err.response?.data?.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <Container maxWidth="xs">
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
                    <Paper className="glass-card" sx={{ p: 4, width: '100%', maxWidth: 400 }}>
                        <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 700 }}>
                            Create Account
                        </Typography>
                        <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 4 }}>
                            Start tracking your personal finances today
                        </Typography>

                        {error && (
                            <Typography color="error" variant="body2" align="center" sx={{ mb: 2, fontWeight: 600 }}>
                                {error}
                            </Typography>
                        )}

                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Full Name"
                                variant="outlined"
                                margin="normal"
                                value={formData.fullName}
                                onChange={(e) => handleChange('fullName', e.target.value)}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><Person fontSize="small" /></InputAdornment>,
                                }}
                            />
                            <TextField
                                fullWidth
                                label="Email"
                                variant="outlined"
                                margin="normal"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><Email fontSize="small" /></InputAdornment>,
                                }}
                            />
                            <TextField
                                fullWidth
                                label="Password"
                                type="password"
                                variant="outlined"
                                margin="normal"
                                value={formData.password}
                                onChange={(e) => handleChange('password', e.target.value)}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><Lock fontSize="small" /></InputAdornment>,
                                }}
                            />
                            <TextField
                                fullWidth
                                label="Confirm Password"
                                type="password"
                                variant="outlined"
                                margin="normal"
                                value={formData.confirmPassword}
                                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                error={!!error && formData.password !== formData.confirmPassword}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><Lock fontSize="small" /></InputAdornment>,
                                }}
                            />
                            <Button fullWidth variant="contained" type="submit" size="large" sx={{ mt: 3, mb: 2 }}>
                                Register
                            </Button>
                        </form>

                        <Typography variant="body2" align="center">
                            Already have an account?{' '}
                            <Link component={RouterLink} to="/login" underline="none" sx={{ fontWeight: 600 }}>
                                Login
                            </Link>
                        </Typography>
                    </Paper>
                </motion.div>
            </Box>
        </Container>
    );
};

export default Register;
