const express = require('express');
const router = express.Router();
const {
    getMesDossiers,
    getDossier,
    updateDossier,
    ajouterPhoto,
    supprimerPhoto
} = require('../controllers/dossierController');
const { proteger } = require('../middlewares/authMiddleware');

router.get('/mes-dossiers', proteger, getMesDossiers);
router.get('/voyage/:voyageId', proteger, getDossier);
router.patch('/:id', proteger, updateDossier);
router.post('/:id/photos', proteger, ajouterPhoto);
router.delete('/:id/photos/:photoId', proteger, supprimerPhoto);

module.exports = router;
