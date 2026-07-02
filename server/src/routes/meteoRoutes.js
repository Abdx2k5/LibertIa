const express = require('express');
const router = express.Router();
const { getMeteo } = require('../controllers/meteoController');
const { proteger } = require('../middlewares/authMiddleware');

// T112 — Météo
router.get('/', proteger, getMeteo);

module.exports = router;
