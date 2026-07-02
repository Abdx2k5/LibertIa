const express = require('express');
const router = express.Router();
const { getMonCompagnon, chat, ajouterPhoto, getClassement } = require('../controllers/compagnonController');
const { proteger } = require('../middlewares/authMiddleware');

router.get('/moi',        proteger, getMonCompagnon);
router.post('/chat',      proteger, chat);
router.post('/photo',     proteger, ajouterPhoto);
router.get('/classement', proteger, getClassement);

module.exports = router;

