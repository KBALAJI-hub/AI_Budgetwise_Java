import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './ProfileModal.css';

const ProfileModal = ({ isOpen, onClose }) => {
    const { user, fetchUser, updateProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        income: 0,
        savings: 0,
        targetExpenses: 0
    });

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            fetchUser().finally(() => setLoading(false));
            setIsEditing(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                income: user.income || 0,
                savings: user.savings || 0,
                targetExpenses: user.targetExpenses || 0
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateProfile(formData);
            setIsEditing(false);
        } catch (err) {
            console.error('Error updating profile:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className={`profile-card ${isOpen ? 'animate-in' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="card-header">
                    <h2>{isEditing ? 'Edit Profile' : 'User Profile'}</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                {loading && !isEditing ? (
                    <div className="spinner-container">
                        <div className="spinner"></div>
                    </div>
                ) : user ? (
                    <div className="profile-content">
                        {isEditing ? (
                            <form className="edit-form" onSubmit={handleSave}>
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Monthly Income ($)</label>
                                    <input
                                        type="number"
                                        name="income"
                                        value={formData.income}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Savings ($)</label>
                                    <input
                                        type="number"
                                        name="savings"
                                        value={formData.savings}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Target Expenses ($)</label>
                                    <input
                                        type="number"
                                        name="targetExpenses"
                                        value={formData.targetExpenses}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-actions">
                                    <button type="button" className="cancel-link" onClick={() => setIsEditing(false)}>Cancel</button>
                                    <button type="submit" className="save-btn" disabled={loading}>
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="profile-details">
                                <div className="detail-row">
                                    <span className="label">Full Name</span>
                                    <span className="value">{user.fullName}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Email</span>
                                    <span className="value">{user.email}</span>
                                </div>
                                <div className="stats-grid">
                                    <div className="stat-box">
                                        <span className="stat-label">Monthly Income</span>
                                        <span className="stat-value">${user.income?.toLocaleString()}</span>
                                    </div>
                                    <div className="stat-box">
                                        <span className="stat-label">Savings</span>
                                        <span className="stat-value">${user.savings?.toLocaleString()}</span>
                                    </div>
                                    <div className="stat-box">
                                        <span className="stat-label">Target Expenses</span>
                                        <span className="stat-value">${user.targetExpenses?.toLocaleString()}</span>
                                    </div>
                                </div>
                                <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="error-msg">Failed to load profile.</div>
                )}
            </div>
        </div>
    );
};

export default ProfileModal;
