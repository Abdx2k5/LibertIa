const express = require('express');
const router = express.Router();
const { getAgences, getAgence, creerAgence, updateAgence, supprimerAgence } = require('../controllers/agenceController');
const { proteger } = require('../middlewares/authMiddleware');

// T91 — Agences CRUD
router.get('/', getAgences);
router.get('/:id', getAgence);
router.post('/', proteger, creerAgence);
router.put('/:id', proteger, updateAgence);
router.delete('/:id', proteger, supprimerAgence);

module.exports = router;
