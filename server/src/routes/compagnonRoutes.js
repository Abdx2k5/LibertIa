const express = require('express');
const router = express.Router();
const { getCompagnon, chat, ajouterPhoto, getClassement } = require('../controllers/compagnonController');
const { proteger } = require('../middlewares/authMiddleware');

router.get('/moi',        proteger, getCompagnon);
router.post('/chat',      proteger, chat);
router.post('/photo',     proteger, ajouterPhoto);
router.get('/classement', proteger, getClassement);

module.exports = router;

