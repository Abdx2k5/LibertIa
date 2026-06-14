const Dossier = require('../models/Dossier');
const Voyage = require('../models/Voyage');
const { estVoyageVisiblePour } = require('../utils/visibilite');

// Taille max d'une photo encodée en base64 (~4 Mo)
const MAX_PHOTO_SIZE = 4 * 1024 * 1024;

// ─────────────────────────────────────────────
//  @GET /api/dossiers/mes-dossiers
// ─────────────────────────────────────────────
const getMesDossiers = async (req, res) => {
    try {
        const dossiers = await Dossier.find({ user: req.user._id })
            .select('-photos.data')
            .sort({ updatedAt: -1 })
            .populate('voyage', 'titre destination dates');

        res.json({ success: true, dossiers });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  @GET /api/dossiers/voyage/:voyageId
//  Crée le carnet à la volée pour le propriétaire s'il n'existe pas encore
// ─────────────────────────────────────────────
const getDossier = async (req, res) => {
    try {
        const voyage = await Voyage.findById(req.params.voyageId);
        if (!voyage) return res.status(404).json({ success: false, message: 'Voyage non trouvé' });
        if (!(await estVoyageVisiblePour(voyage, req.user))) {
            return res.status(403).json({ success: false, message: 'Non autorisé' });
        }

        let dossier = await Dossier.findOne({ voyage: voyage._id });
        const estProprietaire = voyage.user.toString() === req.user._id.toString();

        if (!dossier) {
            if (!estProprietaire) return res.status(404).json({ success: false, message: 'Carnet non trouvé' });
            dossier = await Dossier.create({ voyage: voyage._id, user: req.user._id, titre: voyage.titre });
        }

        res.json({ success: true, dossier });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  @PATCH /api/dossiers/:id
// ─────────────────────────────────────────────
const updateDossier = async (req, res) => {
    try {
        const dossier = await Dossier.findById(req.params.id);
        if (!dossier) return res.status(404).json({ success: false, message: 'Carnet non trouvé' });
        if (dossier.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Non autorisé' });
        }

        const { titre, notes } = req.body;
        if (titre !== undefined) dossier.titre = titre;
        if (notes !== undefined) dossier.notes = notes;

        await dossier.save();
        res.json({ success: true, dossier });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  @POST /api/dossiers/:id/photos
// ─────────────────────────────────────────────
const ajouterPhoto = async (req, res) => {
    try {
        const { data, caption } = req.body;
        if (!data) return res.status(400).json({ success: false, message: 'Photo requise' });
        if (data.length > MAX_PHOTO_SIZE) {
            return res.status(400).json({ success: false, message: 'Photo trop volumineuse (4 Mo max)' });
        }

        const dossier = await Dossier.findById(req.params.id);
        if (!dossier) return res.status(404).json({ success: false, message: 'Carnet non trouvé' });
        if (dossier.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Non autorisé' });
        }

        dossier.photos.push({ data, caption: caption || '' });
        await dossier.save();

        res.status(201).json({ success: true, photo: dossier.photos[dossier.photos.length - 1] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  @DELETE /api/dossiers/:id/photos/:photoId
// ─────────────────────────────────────────────
const supprimerPhoto = async (req, res) => {
    try {
        const dossier = await Dossier.findById(req.params.id);
        if (!dossier) return res.status(404).json({ success: false, message: 'Carnet non trouvé' });
        if (dossier.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Non autorisé' });
        }

        const avant = dossier.photos.length;
        dossier.photos = dossier.photos.filter(p => p._id.toString() !== req.params.photoId);
        if (dossier.photos.length === avant) {
            return res.status(404).json({ success: false, message: 'Photo non trouvée' });
        }

        await dossier.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getMesDossiers, getDossier, updateDossier, ajouterPhoto, supprimerPhoto };
