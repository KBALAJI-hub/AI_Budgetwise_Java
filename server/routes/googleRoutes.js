const express = require('express');
const { 
    getGoogleAuthUrl, 
    handleGoogleCallback, 
    getGoogleStatus, 
    backupToGoogleDrive 
} = require('../controllers/googleController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public callback handler for Google redirect
router.get('/callback', handleGoogleCallback);

// GET /api/google/auth can be accessed either via JWT authorization header (API call) 
// or token query parameter (browser redirect connection initiation)
router.get('/auth', getGoogleAuthUrl);

// Protected status and upload routes
router.get('/status', authMiddleware, getGoogleStatus);
router.post('/upload', authMiddleware, backupToGoogleDrive);

module.exports = router;
