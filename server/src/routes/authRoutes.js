const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authcontroller');
const { proteger } = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', proteger, getMe);

module.exports = router;