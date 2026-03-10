const express = require('express');
const router = express.Router();
const { genererVoyage } = require('../controllers/voyageController');
const { proteger } = require('../middlewares/authMiddleware');

router.post('/generer', proteger, genererVoyage);

module.exports = router;