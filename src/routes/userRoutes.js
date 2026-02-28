const express = require('express');
const { getProfile, updateProfile } = require('../controllers/userController');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);

module.exports = router;
