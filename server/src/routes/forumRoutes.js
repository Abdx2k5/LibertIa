const express = require('express');
const router = express.Router();
const { getForums, creerForum, getForum, ajouterPost } = require('../controllers/forumController');
const { proteger } = require('../middlewares/authMiddleware');

// T61 — Forums
router.get('/', proteger, getForums);
router.post('/', proteger, creerForum);
router.get('/:id', proteger, getForum);
router.post('/:id/posts', proteger, ajouterPost);

module.exports = router;
