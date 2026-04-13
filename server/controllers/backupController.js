const { generatePDFBuffer } = require('../services/exportService');
const googleDriveService = require('../services/googleDriveService');
const dropboxService = require('../services/dropboxService');

const getGoogleAuthUrl = async (req, res, next) => {
    try {
        const userId = req.userId;
        if (googleDriveService.isConfigured(userId)) {
            return res.json({ configured: true });
        }
        const url = googleDriveService.getAuthUrl(userId);
        res.json({ configured: false, url });
    } catch (err) { next(err); }
};

const handleGoogleCallback = async (req, res, next) => {
    try {
        const { code, state } = req.query;
        await googleDriveService.handleCallback(code, state);
        res.redirect('http://localhost:3000/');
    } catch (err) { 
        res.redirect('http://localhost:3000/?error=google-auth-failed');
    }
};

const backupToGoogleDrive = async (req, res, next) => {
    try {
        const userId = req.userId;
        if (!googleDriveService.isConfigured(userId)) {
            return res.status(401).json({ error: 'Not authorized with Google Drive' });
        }
        
        const fileBuffer = await generatePDFBuffer(userId);
        const fileName = `financial_report_${Date.now()}.pdf`;
        
        const file = await googleDriveService.uploadFile(userId, fileName, fileBuffer, 'application/pdf');
        
        res.json({ message: 'Backup to Google Drive successful', link: file.webViewLink || 'uploaded successfully' });
    } catch (err) { next(err); }
};

const backupToDropbox = async (req, res, next) => {
    try {
        const userId = req.userId;
        const fileBuffer = await generatePDFBuffer(userId);
        const fileName = `financial_report_${Date.now()}.pdf`;
        
        await dropboxService.uploadFile(fileName, fileBuffer);
        
        res.json({ message: 'Backup to Dropbox successful' });
    } catch (err) {
        if (err.message && err.message.includes('token not configured')) {
            return res.status(500).json({ error: 'Dropbox token missing in server configuration.' });
        }
        next(err);
    }
};

module.exports = { backupToGoogleDrive, backupToDropbox, getGoogleAuthUrl, handleGoogleCallback };
