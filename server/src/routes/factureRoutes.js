const express = require('express');
const router = express.Router();
const { getMesFactures, getFacture, creerFacture } = require('../controllers/factureController');
const { proteger } = require('../middlewares/authMiddleware');

// T109 — Factures
router.get('/', proteger, getMesFactures);
router.get('/:id', proteger, getFacture);
router.post('/', proteger, creerFacture);

module.exports = router;
