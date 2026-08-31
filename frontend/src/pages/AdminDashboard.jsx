import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Select, MenuItem, Chip, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Grid, Card, CardContent } from '@mui/material';
import { Delete, SupervisorAccount, AccountBalanceWallet, SyncAlt, Forum, Assessment } from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../utils/api';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await api.get('/admin/users');
            setUsers(res.data);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError(err.response?.data?.error || 'Failed to fetch users. Access denied.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        try {
            setError('');
            setSuccessMsg('');
            const res = await api.put(`/admin/users/${userId}/role`, { role: newRole });
            
            // Update local state
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            setSuccessMsg(res.data.message || 'Role updated successfully.');
            
            // Clear message after 3 seconds
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            console.error('Error updating role:', err);
            setError(err.response?.data?.error || 'Failed to update user role.');
        }
    };

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!userToDelete) return;
        try {
            setError('');
            setSuccessMsg('');
            const res = await api.delete(`/admin/users/${userToDelete.id}`);
            
            // Remove user from local state
            setUsers(users.filter(u => u.id !== userToDelete.id));
            setSuccessMsg(res.data.message || 'User deleted successfully.');
            setDeleteConfirmOpen(false);
            setUserToDelete(null);

            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            console.error('Error deleting user:', err);
            setError(err.response?.data?.error || 'Failed to delete user.');
            setDeleteConfirmOpen(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <CircularProgress size={60} thickness={4} />
            </Box>
        );
    }

    // Quick stats calculations
    const totalUsers = users.length;
    const adminCount = users.filter(u => u.role === 'ADMIN').length;
    const userCount = totalUsers - adminCount;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Box>
                        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ letterSpacing: -0.5 }}>
                            Admin Console
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                            Manage user system accounts, roles, and view usage statistics
                        </Typography>
                    </Box>
                </Box>
            </motion.div>

            {/* Quick Stat Widgets */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={4}>
                    <Card className="glass-card" sx={{ height: '100%' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(99, 102, 241, 0.1)', color: 'primary.main' }}>
                                <SupervisorAccount sx={{ fontSize: 32 }} />
                            </Box>
                            <Box>
                                <Typography variant="body2" color="textSecondary" fontWeight={600}>Total Registered</Typography>
                                <Typography variant="h4" fontWeight={700}>{totalUsers}</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card className="glass-card" sx={{ height: '100%' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
                                <SupervisorAccount sx={{ fontSize: 32 }} />
                            </Box>
                            <Box>
                                <Typography variant="body2" color="textSecondary" fontWeight={600}>Administrators</Typography>
                                <Typography variant="h4" fontWeight={700}>{adminCount}</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card className="glass-card" sx={{ height: '100%' }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(74, 222, 128, 0.1)', color: 'success.main' }}>
                                <Assessment sx={{ fontSize: 32 }} />
                            </Box>
                            <Box>
                                <Typography variant="body2" color="textSecondary" fontWeight={600}>Regular Users</Typography>
                                <Typography variant="h4" fontWeight={700}>{userCount}</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
                    {error}
                </Alert>
            )}

            {successMsg && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: 3 }}>
                    {successMsg}
                </Alert>
            )}

            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }}>
                <TableContainer component={Paper} className="glass-card" sx={{ overflow: 'hidden' }}>
                    <Table>
                        <TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700 }}>User ID</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Full Name</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Email Address</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>User Role</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="center">Usage Activity</TableCell>
                                <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id} sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' } }}>
                                    <TableCell>{user.id}</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>{user.fullName}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            size="small"
                                            sx={{
                                                minWidth: 120,
                                                borderRadius: 2,
                                                bgcolor: 'rgba(255,255,255,0.02)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                '& .MuiSelect-select': { py: 0.8 }
                                            }}
                                        >
                                            <MenuItem value="USER">USER</MenuItem>
                                            <MenuItem value="ADMIN">ADMIN</MenuItem>
                                        </Select>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5 }}>
                                            <Chip
                                                size="small"
                                                icon={<SyncAlt fontSize="small" />}
                                                label={`${user._count?.transactions || 0} Tx`}
                                                variant="outlined"
                                                sx={{ borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)' }}
                                            />
                                            <Chip
                                                size="small"
                                                icon={<AccountBalanceWallet fontSize="small" />}
                                                label={`${user._count?.budgets || 0} Budgets`}
                                                variant="outlined"
                                                sx={{ borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)' }}
                                            />
                                            <Chip
                                                size="small"
                                                icon={<Forum fontSize="small" />}
                                                label={`${user._count?.posts || 0} Posts`}
                                                variant="outlined"
                                                sx={{ borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)' }}
                                            />
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDeleteClick(user)}
                                            sx={{
                                                bgcolor: 'rgba(239, 68, 68, 0.05)',
                                                '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' }
                                            }}
                                        >
                                            <Delete size="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </motion.div>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                PaperProps={{
                    sx: {
                        background: '#1e293b',
                        borderRadius: 4,
                        border: '1px solid rgba(255,255,255,0.1)'
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 700 }}>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: 'text.secondary' }}>
                        Are you sure you want to permanently delete user <strong>{userToDelete?.fullName}</strong> ({userToDelete?.email})?
                        This will recursively delete all their transactions, budgets, savings goals, posts, comments, and likes. This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setDeleteConfirmOpen(false)} sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteConfirm} variant="contained" color="error" sx={{ fontWeight: 600, borderRadius: 2 }}>
                        Delete User
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AdminDashboard;
