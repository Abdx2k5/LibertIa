const express = require('express');
const router = express.Router();
const { getLogs, getLogsStats } = require('../controllers/adminController');
const { proteger, admin } = require('../middlewares/authMiddleware');

// T127 — Logs d'activité, réservés aux administrateurs.
// Route littérale "/logs/stats" déclarée avant "/logs".
router.get('/logs/stats', proteger, admin, getLogsStats);
router.get('/logs', proteger, admin, getLogs);

module.exports = router;
