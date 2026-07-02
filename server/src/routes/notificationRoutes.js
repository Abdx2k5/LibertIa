const express = require('express');
const router = express.Router();
const {
    getNotifications,
    getNonLuesCount,
    marquerLue,
    marquerToutLu,
    supprimerNotification
} = require('../controllers/notificationController');
const { proteger } = require('../middlewares/authMiddleware');

router.get('/', proteger, getNotifications);
router.get('/non-lues/count', proteger, getNonLuesCount);
router.patch('/tout-lire', proteger, marquerToutLu);
router.patch('/:id/lire', proteger, marquerLue);
router.delete('/:id', proteger, supprimerNotification);

module.exports = router;
