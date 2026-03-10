const express = require('express');
const router = express.Router();
const { genererVoyage, getMesVoyages, getVoyage } = require('../controllers/voyageController');
const { proteger } = require('../middlewares/authMiddleware');

router.post('/generer', proteger, genererVoyage);
router.get('/mes-voyages', proteger, getMesVoyages);
router.get('/:id', proteger, getVoyage);

module.exports = router;