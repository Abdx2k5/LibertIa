const express = require('express');
const router = express.Router();
const {
    listerAgences,
    listerEnAttente,
    getAgence,
    creerAgence,
    validerAgence,
    rejeterAgence
} = require('../controllers/agencyController');
const { proteger, admin } = require('../middlewares/authMiddleware');

// Routes littérales avant /:id
router.get('/en-attente', proteger, admin, listerEnAttente);

router.get('/', proteger, listerAgences);
router.post('/', proteger, creerAgence);
router.get('/:id', proteger, getAgence);

router.patch('/:id/valider', proteger, admin, validerAgence);
router.patch('/:id/rejeter', proteger, admin, rejeterAgence);

module.exports = router;
