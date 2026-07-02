const Avis = require('../models/Avis');

const CIBLE_TYPES = ['agence', 'hotel', 'vol'];
const UTILISATEUR_SELECT = 'nom profilePhoto';

// ─────────────────────────────────────────────
//  HELPER — moyenne des notes (arrondie à 0.1)
// ─────────────────────────────────────────────
function calculerMoyenne(avis) {
    if (!avis.length) return 0;
    const total = avis.reduce((acc, a) => acc + a.note, 0);
    return Math.round((total / avis.length) * 10) / 10;
}

// ─────────────────────────────────────────────
//  @GET /api/avis?cibleNom=...&cibleType=...
//  Liste des avis pour une cible, plus récents en premier,
//  + moyenne et total calculés.
// ─────────────────────────────────────────────
const getAvis = async (req, res) => {
    try {
        const cibleNom = (req.query.cibleNom || '').trim();
        const cibleType = req.query.cibleType;

        if (!cibleNom || !cibleType) {
            return res.status(400).json({ success: false, message: 'cibleNom et cibleType sont requis' });
        }
        if (!CIBLE_TYPES.includes(cibleType)) {
            return res.status(400).json({ success: false, message: 'cibleType invalide' });
        }

        const avis = await Avis.find({ cibleNom, cibleType })
            .sort({ createdAt: -1 })
            .populate('utilisateur', UTILISATEUR_SELECT);

        res.json({
            success: true,
            data: avis,
            moyenne: calculerMoyenne(avis),
            total: avis.length
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  @POST /api/avis
//  body : { cibleType, cibleNom, note, commentaire }
//  Crée un avis, ou met à jour celui de l'utilisateur s'il en
//  a déjà laissé un pour cette cible.
// ─────────────────────────────────────────────
const creerAvis = async (req, res) => {
    try {
        const cibleType = req.body.cibleType;
        const cibleNom = (req.body.cibleNom || '').trim();
        const note = Number(req.body.note);
        const commentaire = (req.body.commentaire || '').trim();

        if (!cibleType || !cibleNom) {
            return res.status(400).json({ success: false, message: 'cibleType et cibleNom sont requis' });
        }
        if (!CIBLE_TYPES.includes(cibleType)) {
            return res.status(400).json({ success: false, message: 'cibleType invalide' });
        }
        if (!Number.isInteger(note) || note < 1 || note > 5) {
            return res.status(400).json({ success: false, message: 'La note doit être un entier entre 1 et 5' });
        }
        if (commentaire.length > 500) {
            return res.status(400).json({ success: false, message: 'Le commentaire dépasse 500 caractères' });
        }

        let avis = await Avis.findOne({
            cibleType,
            cibleNom,
            utilisateur: req.user._id
        });

        if (avis) {
            avis.note = note;
            avis.commentaire = commentaire;
            await avis.save();
        } else {
            avis = await Avis.create({
                cibleType,
                cibleNom,
                utilisateur: req.user._id,
                note,
                commentaire
            });
        }

        await avis.populate('utilisateur', UTILISATEUR_SELECT);

        res.status(201).json({ success: true, data: avis });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  @DELETE /api/avis/:id — supprime son propre avis uniquement
// ─────────────────────────────────────────────
const supprimerAvis = async (req, res) => {
    try {
        const avis = await Avis.findById(req.params.id);
        if (!avis) return res.status(404).json({ success: false, message: 'Avis non trouvé' });

        if (avis.utilisateur.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Non autorisé' });
        }

        await avis.deleteOne();

        res.json({ success: true, message: 'Avis supprimé' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getAvis, creerAvis, supprimerAvis };
