const express = require('express');
const { exportToPDF, exportToCSV } = require('../controllers/exportController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authMiddleware);
router.get('/pdf', exportToPDF);
router.get('/csv', exportToCSV);

module.exports = router;
