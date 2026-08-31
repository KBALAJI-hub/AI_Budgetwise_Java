const googleDriveService = require('../services/googleDriveService');
const { generatePDFBuffer } = require('../services/exportService');
const jwt = require('jsonwebtoken');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const getGoogleAuthUrl = async (req, res, next) => {
    try {
        let userId = req.userId;
        
        // If it's a browser redirect, we may pass the JWT token in query param 'token'
        const token = req.query.token;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
                userId = decoded.id;
            } catch (err) {
                return res.status(401).json({ error: 'Invalid token' });
            }
        }

        if (!userId) {
            return res.status(401).json({ error: 'User ID is required' });
        }

        const url = googleDriveService.getAuthUrl(userId);

        if (token) {
            // Full browser redirect
            return res.redirect(url);
        } else {
            // JSON response for API call
            const configured = await googleDriveService.isConfigured(userId);
            res.json({ configured, url });
        }
    } catch (err) { 
        next(err); 
    }
};

const handleGoogleCallback = async (req, res, next) => {
    try {
        const { code, state } = req.query;
        if (!code || !state) {
            return res.redirect(`${FRONTEND_URL}/dashboard?error=google-auth-failed`);
        }

        await googleDriveService.handleCallback(code, state);
        res.redirect(`${FRONTEND_URL}/dashboard?google_connected=true`);
    } catch (err) { 
        console.error('Google OAuth callback error:', err);
        try {
            const fs = require('fs');
            const path = require('path');
            fs.writeFileSync(path.join(__dirname, '../google-error.log'), `${err.message}\n${err.stack}`);
        } catch (e) {
            console.error('Failed to write error log:', e);
        }
        res.redirect(`${FRONTEND_URL}/dashboard?error=google-auth-failed`);
    }
};

const getGoogleStatus = async (req, res, next) => {
    try {
        const userId = req.userId;
        const connected = await googleDriveService.isConfigured(userId);
        res.json({ connected });
    } catch (err) { 
        next(err); 
    }
};

const backupToGoogleDrive = async (req, res, next) => {
    try {
        const userId = req.userId;
        const configured = await googleDriveService.isConfigured(userId);
        if (!configured) {
            return res.status(401).json({ error: 'Not authorized with Google Drive. Please connect first.' });
        }
        
        const fileBuffer = await generatePDFBuffer(userId);
        const fileName = `financial_report_${Date.now()}.pdf`;
        
        const file = await googleDriveService.uploadFile(userId, fileName, fileBuffer, 'application/pdf');
        
        res.json({ 
            message: 'Backup to Google Drive successful', 
            link: file.webViewLink || 'uploaded successfully' 
        });
    } catch (err) { 
        try {
            const fs = require('fs');
            const path = require('path');
            fs.writeFileSync(path.join(__dirname, '../google-error.log'), `Backup Error: ${err.message}\n${err.stack}`);
        } catch (e) {
            console.error('Failed to write backup error log:', e);
        }
        next(err); 
    }
};

module.exports = { 
    getGoogleAuthUrl, 
    handleGoogleCallback, 
    getGoogleStatus, 
    backupToGoogleDrive 
};
