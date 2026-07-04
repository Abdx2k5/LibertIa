const express = require('express');
const router = express.Router();
const { estAdmin, getStats, getUsers, suspendreUser, supprimerUser, togglePremium, changerRole, getAgences, validerAgence } = require('../controllers/adminController');
const { proteger } = require('../middlewares/authMiddleware');

router.use(proteger, estAdmin);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.patch('/users/:id/suspendre', suspendreUser);
router.delete('/users/:id', supprimerUser);
router.patch('/users/:id/premium', togglePremium);
router.patch('/users/:id/role', changerRole);
router.get('/agences', getAgences);
router.patch('/agences/:id/valider', validerAgence);

module.exports = router;