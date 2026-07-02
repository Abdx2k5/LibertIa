const express = require('express');
const router = express.Router();
const { getConversations, getThread } = require('../controllers/messagePriveController');
const { proteger } = require('../middlewares/authMiddleware');

// Messagerie privée — l'envoi se fait en temps réel via socket (voir sockets/dmSocket.js),
// ces routes ne servent qu'à charger l'historique (mêmes conventions que /api/boites).
router.get('/conversations', proteger, getConversations);
router.get('/:userId', proteger, getThread);

module.exports = router;
