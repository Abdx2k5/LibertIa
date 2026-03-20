const express = require('express');
const router = express.Router();
const {
    genererVoyage,
    genererVoyageStream,
    getMesVoyages,
    getVoyage
} = require('../controllers/voyageController');
const { proteger } = require('../middlewares/authMiddleware');

// Version normale
router.post('/generer',        proteger, genererVoyage);

// T24 — Version streaming SSE
router.post('/generer/stream', proteger, genererVoyageStream);

router.get('/mes-voyages',     proteger, getMesVoyages);
router.get('/:id',             proteger, getVoyage);

module.exports = router;