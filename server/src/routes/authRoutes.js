const express = require('express');
const router = express.Router();
const { register, login, getMe ,logout ,updateProfile } = require('../controllers/authcontroller');
const { proteger } = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', proteger, getMe);
router.post('/logout', proteger, logout);
router.put('/profile', proteger, updateProfile);

module.exports = router;