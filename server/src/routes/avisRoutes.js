const express = require('express');
const router = express.Router();
const { getAvis, creerAvis, supprimerAvis } = require('../controllers/avisController');
const { proteger } = require('../middlewares/authMiddleware');

router.get('/', proteger, getAvis);
router.post('/', proteger, creerAvis);
router.delete('/:id', proteger, supprimerAvis);

module.exports = router;
