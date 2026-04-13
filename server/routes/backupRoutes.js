const express = require('express');
const { backupToGoogleDrive, backupToDropbox, getGoogleAuthUrl, handleGoogleCallback } = require('../controllers/backupController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/google/callback', handleGoogleCallback);

router.use(authMiddleware);
router.get('/google/auth', getGoogleAuthUrl);
router.post('/google-drive', backupToGoogleDrive);
router.post('/dropbox', backupToDropbox);

module.exports = router;
