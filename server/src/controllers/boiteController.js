const Boite = require('../models/Boite');
const Message = require('../models/Message');
const User = require('../models/User');
const { creerNotification } = require('./notificationController');

// ─────────────────────────────────────────────
//  @POST /api/boites
//  Crée une boîte collaborative. Le créateur devient
//  automatiquement le premier membre.
// ─────────────────────────────────────────────
const creerBoite = async (req, res) => {
    try {
        const { nom, description, image, voyageId } = req.body;

        if (!nom || !nom.trim()) {
            return res.status(400).json({ success: false, message: 'Le nom de la boîte est requis' });
        }

        const boite = await Boite.create({
            nom: nom.trim(),
            description: description || '',
            image: image || '',
            voyageId: voyageId || null,
            createur: req.user._id,
            membres: [req.user._id]
        });

        res.status(201).json({ success: true, data: boite });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  @GET /api/boites
//  Liste les boîtes dont l'utilisateur connecté est membre
// ─────────────────────────────────────────────
const getMesBoites = async (req, res) => {
    try {
        const boites = await Boite.find({ membres: req.user._id })
            .sort({ createdAt: -1 });

        res.json({ success: true, data: boites });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  @GET /api/boites/:id
//  Détails d'une boîte (membres populés) — réservé aux membres
// ─────────────────────────────────────────────
const getBoite = async (req, res) => {
    try {
        const boite = await Boite.findById(req.params.id)
            .populate('membres', 'nom email profilePhoto')
            .populate('createur', 'nom email profilePhoto');

        if (!boite) return res.status(404).json({ success: false, message: 'Boîte non trouvée' });

        const estMembre = boite.membres.some(m => m._id.toString() === req.user._id.toString());
        if (!estMembre) {
            return res.status(403).json({ success: false, message: 'Non autorisé' });
        }

        res.json({ success: true, data: boite });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  @POST /api/boites/:id/inviter
//  Ajoute un utilisateur (par email) à la boîte — réservé aux membres
// ─────────────────────────────────────────────
const inviterMembre = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || !email.trim()) {
            return res.status(400).json({ success: false, message: 'Email requis' });
        }

        const boite = await Boite.findById(req.params.id);
        if (!boite) return res.status(404).json({ success: false, message: 'Boîte non trouvée' });

        const estMembre = boite.membres.some(m => m.toString() === req.user._id.toString());
        if (!estMembre) {
            return res.status(403).json({ success: false, message: 'Non autorisé' });
        }

        const utilisateur = await User.findOne({ email: email.toLowerCase().trim() });
        if (!utilisateur) {
            return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        }

        const dejaMembre = boite.membres.some(m => m.toString() === utilisateur._id.toString());
        if (dejaMembre) {
            return res.status(400).json({ success: false, message: 'Cet utilisateur est déjà membre de la boîte' });
        }

        boite.membres.push(utilisateur._id);
        await boite.save();

        // T71 — notifie l'utilisateur invité
        await creerNotification({
            destinataire: utilisateur._id,
            expediteur: req.user._id,
            type: 'invitation_boite',
            contenu: `${req.user.nom} vous a invité dans la boîte "${boite.nom}"`,
            lien: `/profile/boites/${boite._id}`
        });

        const boiteMaj = await Boite.findById(boite._id)
            .populate('membres', 'nom email profilePhoto')
            .populate('createur', 'nom email profilePhoto');

        res.json({ success: true, data: boiteMaj });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  @DELETE /api/boites/:id/membres/:userId
//  Retire un membre — réservé au créateur ou au membre lui-même
// ─────────────────────────────────────────────
const retirerMembre = async (req, res) => {
    try {
        const boite = await Boite.findById(req.params.id);
        if (!boite) return res.status(404).json({ success: false, message: 'Boîte non trouvée' });

        const { userId } = req.params;
        const estCreateur = boite.createur.toString() === req.user._id.toString();
        const estSoiMeme = userId === req.user._id.toString();

        if (!estCreateur && !estSoiMeme) {
            return res.status(403).json({ success: false, message: 'Non autorisé' });
        }

        const avant = boite.membres.length;
        boite.membres = boite.membres.filter(m => m.toString() !== userId);

        if (boite.membres.length === avant) {
            return res.status(404).json({ success: false, message: 'Membre non trouvé dans cette boîte' });
        }

        await boite.save();

        const boiteMaj = await Boite.findById(boite._id)
            .populate('membres', 'nom email profilePhoto')
            .populate('createur', 'nom email profilePhoto');

        res.json({ success: true, data: boiteMaj });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  @DELETE /api/boites/:id
//  Supprime la boîte et son historique de messages — réservé au créateur
// ─────────────────────────────────────────────
const supprimerBoite = async (req, res) => {
    try {
        const boite = await Boite.findById(req.params.id);
        if (!boite) return res.status(404).json({ success: false, message: 'Boîte non trouvée' });

        if (boite.createur.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Non autorisé' });
        }

        await Message.deleteMany({ boiteId: boite._id });
        await boite.deleteOne();

        res.json({ success: true, message: 'Boîte supprimée' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  @GET /api/boites/:id/messages?page=1&limit=30
//  Historique paginé (du plus récent au plus ancien côté requête,
//  puis remis dans l'ordre chronologique pour l'affichage)
// ─────────────────────────────────────────────
const getMessages = async (req, res) => {
    try {
        const boite = await Boite.findById(req.params.id);
        if (!boite) return res.status(404).json({ success: false, message: 'Boîte non trouvée' });

        const estMembre = boite.membres.some(m => m.toString() === req.user._id.toString());
        if (!estMembre) {
            return res.status(403).json({ success: false, message: 'Non autorisé' });
        }

        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 30));
        const skip = (page - 1) * limit;

        const [messages, total] = await Promise.all([
            Message.find({ boiteId: boite._id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('auteur', 'nom profilePhoto'),
            Message.countDocuments({ boiteId: boite._id })
        ]);

        res.json({
            success: true,
            data: messages.reverse(),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    creerBoite,
    getMesBoites,
    getBoite,
    inviterMembre,
    retirerMembre,
    supprimerBoite,
    getMessages
};
