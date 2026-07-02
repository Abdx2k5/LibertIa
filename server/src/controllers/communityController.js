const Voyage = require('../models/Voyage');
const Comment = require('../models/Comment');
const User = require('../models/User');
const Groupe = require('../models/Groupe');
const Dossier = require('../models/Dossier');
const Signalement = require('../models/Signalement');
const { estVoyageVisiblePour } = require('../utils/visibilite');
const { creerNotification } = require('./notificationController');

// ─────────────────────────────────────────────
//  HELPER — Pagination (page/limit depuis req.query)
// ─────────────────────────────────────────────
function getPagination(req, { defaultLimit = 10, maxLimit = 20 } = {}) {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(maxLimit, Math.max(1, parseInt(req.query.limit) || defaultLimit));
    return { page, limit, skip: (page - 1) * limit };
}

// ─────────────────────────────────────────────
//  HELPER — Échapper les caractères spéciaux regex (T68)
// ─────────────────────────────────────────────
function echapperRegex(texte) {
    return texte.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ─────────────────────────────────────────────
//  HELPER — Filtre des voyages visibles par l'utilisateur (T68)
//  (public, ses propres voyages, ou voyages "amis" des comptes suivis)
// ─────────────────────────────────────────────
async function construireFiltreVisibilite(user) {
    const moi = await User.findById(user._id).select('following');
    return {
        $or: [
            { visibilite: 'public' },
            { user: user._id },
            { visibilite: 'amis', user: { $in: moi?.following || [] } }
        ]
    };
}

const FEED_SELECT = 'titre destination dates budget likes likeCount commentCount visibilite user createdAt itineraire.duree_jours itineraire.budget_estime';

// ─────────────────────────────────────────────
//  @GET /api/community/feed
//  Query : page, limit, tri = recent | populaire | abonnements
// ─────────────────────────────────────────────
const getFeed = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req);
        const tri = req.query.tri || 'recent';

        let query = { visibilite: 'public' };
        let sort = { createdAt: -1 };

        if (tri === 'populaire') {
            sort = { likeCount: -1, createdAt: -1 };
        } else if (tri === 'abonnements') {
            const moi = await User.findById(req.user._id).select('following');
            query = {
                visibilite: { $in: ['public', 'amis'] },
                user: { $in: moi?.following || [] }
            };
        }

        const [voyages, total] = await Promise.all([
            Voyage.find(query)
                .select(FEED_SELECT)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate('user', 'nom profilePhoto'),
            Voyage.countDocuments(query)
        ]);

        const feed = voyages.map(v => {
            const voyage = v.toObject();
            voyage.aLike = voyage.likes.some(id => id.toString() === req.user._id.toString());
            delete voyage.likes;
            return voyage;
        });

        res.json({
            success: true,
            voyages: feed,
            page,
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  @GET /api/community/voyages/:id/commentaires
// ─────────────────────────────────────────────
const getCommentaires = async (req, res) => {
    try {
        const voyage = await Voyage.findById(req.params.id);
        if (!voyage) return res.status(404).json({ success: false, message: 'Voyage non trouvé' });
        if (!(await estVoyageVisiblePour(voyage, req.user))) {
            return res.status(403).json({ success: false, message: 'Non autorisé' });
        }

        const { page, limit, skip } = getPagination(req, { defaultLimit: 20, maxLimit: 50 });

        const [commentaires, total] = await Promise.all([
            Comment.find({ voyage: voyage._id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('user', 'nom profilePhoto'),
            Comment.countDocuments({ voyage: voyage._id })
        ]);

        res.json({
            success: true,
            commentaires,
            page,
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  @POST /api/community/voyages/:id/commentaires
// ─────────────────────────────────────────────
const ajouterCommentaire = async (req, res) => {
    try {
        const texte = (req.body.texte || '').trim();
        if (!texte) {
            return res.status(400).json({ success: false, message: 'Le commentaire ne peut pas être vide' });
        }
        if (texte.length > 1000) {
            return res.status(400).json({ success: false, message: 'Le commentaire dépasse 1000 caractères' });
        }

        const voyage = await Voyage.findById(req.params.id);
        if (!voyage) return res.status(404).json({ success: false, message: 'Voyage non trouvé' });
        if (!(await estVoyageVisiblePour(voyage, req.user))) {
            return res.status(403).json({ success: false, message: 'Non autorisé' });
        }

        const commentaire = await Comment.create({
            voyage: voyage._id,
            user: req.user._id,
            texte
        });
        await commentaire.populate('user', 'nom profilePhoto');

        await Voyage.updateOne({ _id: voyage._id }, { $inc: { commentCount: 1 } });

        // T71 — notifie le propriétaire du voyage
        await creerNotification({
            destinataire: voyage.user,
            expediteur: req.user._id,
            type: 'commentaire',
            contenu: `${req.user.nom} a commenté votre voyage "${voyage.titre}"`,
            lien: `/voyage/${voyage._id}`
        });

        res.status(201).json({ success: true, commentaire, commentCount: voyage.commentCount + 1 });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  @DELETE /api/community/voyages/:id/commentaires/:commentId
//  Auteur du commentaire OU propriétaire du voyage
// ─────────────────────────────────────────────
const supprimerCommentaire = async (req, res) => {
    try {
        const commentaire = await Comment.findById(req.params.commentId);
        if (!commentaire || commentaire.voyage.toString() !== req.params.id) {
            return res.status(404).json({ success: false, message: 'Commentaire non trouvé' });
        }

        const voyage = await Voyage.findById(req.params.id);
        if (!voyage) return res.status(404).json({ success: false, message: 'Voyage non trouvé' });

        const estAuteur = commentaire.user.toString() === req.user._id.toString();
        const estProprietaireVoyage = voyage.user.toString() === req.user._id.toString();
        if (!estAuteur && !estProprietaireVoyage) {
            return res.status(403).json({ success: false, message: 'Non autorisé' });
        }

        await commentaire.deleteOne();
        await Voyage.updateOne({ _id: voyage._id }, { $inc: { commentCount: -1 } });

        res.json({ success: true, commentCount: Math.max(0, voyage.commentCount - 1) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  @POST /api/community/groupes
//  Crée un groupe (le créateur devient automatiquement membre)
// ─────────────────────────────────────────────
const creerGroupe = async (req, res) => {
    try {
        const nom = (req.body.nom || '').trim();
        if (!nom) {
            return res.status(400).json({ success: false, message: 'Le nom du groupe est requis' });
        }
        if (nom.length > 100) {
            return res.status(400).json({ success: false, message: 'Le nom du groupe dépasse 100 caractères' });
        }

        const description = (req.body.description || '').trim();
        if (description.length > 1000) {
            return res.status(400).json({ success: false, message: 'La description dépasse 1000 caractères' });
        }

        const tags = Array.isArray(req.body.tags)
            ? req.body.tags.map(t => String(t).trim().toLowerCase()).filter(Boolean)
            : [];

        const groupe = await Groupe.create({
            nom,
            description,
            image: req.body.image || '',
            destination: (req.body.destination || '').trim(),
            tags,
            createur: req.user._id,
            membres: [req.user._id]
        });
        await groupe.populate('createur', 'nom profilePhoto');

        res.status(201).json({ success: true, data: groupe });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  @GET /api/community/groupes
//  Liste paginée de tous les groupes
// ─────────────────────────────────────────────
const getGroupes = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req);

        const [groupes, total] = await Promise.all([
            Groupe.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('createur', 'nom profilePhoto'),
            Groupe.countDocuments()
        ]);

        const data = groupes.map(g => {
            const groupe = g.toObject();
            groupe.membreCount = groupe.membres.length;
            delete groupe.membres;
            return groupe;
        });

        res.json({
            success: true,
            data,
            page,
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  @GET /api/community/groupes/:id
//  Détails d'un groupe + membres populés
// ─────────────────────────────────────────────
const getGroupe = async (req, res) => {
    try {
        const groupe = await Groupe.findById(req.params.id)
            .populate('createur', 'nom profilePhoto')
            .populate('membres', 'nom profilePhoto');

        if (!groupe) return res.status(404).json({ success: false, message: 'Groupe non trouvé' });

        res.json({ success: true, data: groupe });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  @POST /api/community/groupes/:id/rejoindre
// ─────────────────────────────────────────────
const rejoindreGroupe = async (req, res) => {
    try {
        const groupe = await Groupe.findById(req.params.id);
        if (!groupe) return res.status(404).json({ success: false, message: 'Groupe non trouvé' });

        const dejaMembre = groupe.membres.some(id => id.toString() === req.user._id.toString());
        if (dejaMembre) {
            return res.status(400).json({ success: false, message: 'Vous êtes déjà membre de ce groupe' });
        }

        groupe.membres.push(req.user._id);
        await groupe.save();

        res.json({ success: true, data: { membreCount: groupe.membres.length } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  @POST /api/community/groupes/:id/quitter
// ─────────────────────────────────────────────
const quitterGroupe = async (req, res) => {
    try {
        const groupe = await Groupe.findById(req.params.id);
        if (!groupe) return res.status(404).json({ success: false, message: 'Groupe non trouvé' });

        const estMembre = groupe.membres.some(id => id.toString() === req.user._id.toString());
        if (!estMembre) {
            return res.status(400).json({ success: false, message: 'Vous n\'êtes pas membre de ce groupe' });
        }
        if (groupe.createur.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'Le créateur ne peut pas quitter son propre groupe' });
        }

        groupe.membres = groupe.membres.filter(id => id.toString() !== req.user._id.toString());
        await groupe.save();

        res.json({ success: true, data: { membreCount: groupe.membres.length } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  @GET /api/community/recherche?q=...&type=posts|groupes|users|all
//  Recherche transversale (regex insensible à la casse), limitée à 10
//  résultats par type
// ─────────────────────────────────────────────
const RECHERCHE_LIMIT = 10;
const RECHERCHE_TYPES = ['posts', 'groupes', 'users', 'all'];

const recherche = async (req, res) => {
    try {
        const q = (req.query.q || '').trim();
        const type = req.query.type || 'all';

        if (!q) {
            return res.status(400).json({ success: false, message: 'Le paramètre de recherche "q" est requis' });
        }
        if (!RECHERCHE_TYPES.includes(type)) {
            return res.status(400).json({ success: false, message: 'Type de recherche invalide' });
        }

        const regex = new RegExp(echapperRegex(q), 'i');
        const data = {};
        const taches = [];

        if (type === 'posts' || type === 'all') {
            taches.push((async () => {
                const filtreVisibilite = await construireFiltreVisibilite(req.user);
                data.posts = await Voyage.find({
                    $and: [
                        filtreVisibilite,
                        { $or: [{ titre: regex }, { destination: regex }, { prompt: regex }] }
                    ]
                })
                    .select('titre destination dates visibilite user createdAt')
                    .sort({ createdAt: -1 })
                    .limit(RECHERCHE_LIMIT)
                    .populate('user', 'nom profilePhoto');
            })());
        }

        if (type === 'groupes' || type === 'all') {
            taches.push((async () => {
                const groupes = await Groupe.find({
                    $or: [{ nom: regex }, { destination: regex }, { tags: regex }]
                })
                    .sort({ createdAt: -1 })
                    .limit(RECHERCHE_LIMIT)
                    .populate('createur', 'nom profilePhoto');

                data.groupes = groupes.map(g => {
                    const groupe = g.toObject();
                    groupe.membreCount = groupe.membres.length;
                    delete groupe.membres;
                    return groupe;
                });
            })());
        }

        if (type === 'users' || type === 'all') {
            taches.push((async () => {
                data.users = await User.find({ nom: regex })
                    .select('nom profilePhoto')
                    .limit(RECHERCHE_LIMIT);
            })());
        }

        await Promise.all(taches);

        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  T66 — @POST /api/community/users/:id/follow
// ─────────────────────────────────────────────
const followUser = async (req, res) => {
    try {
        const targetId = req.params.id;
        const userId = req.user._id.toString();

        if (targetId === userId) {
            return res.status(400).json({ success: false, message: 'Vous ne pouvez pas vous suivre vous-même' });
        }

        const target = await User.findById(targetId);
        if (!target) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });

        await Promise.all([
            User.findByIdAndUpdate(userId, { $addToSet: { following: targetId } }),
            User.findByIdAndUpdate(targetId, { $addToSet: { followers: userId } })
        ]);

        await creerNotification({
            destinataire: targetId,
            expediteur: userId,
            type: 'follow',
            contenu: `${req.user.nom} vous suit maintenant`,
            lien: `/profil/${userId}`
        });

        res.json({ success: true, message: 'Utilisateur suivi' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  T66 — @DELETE /api/community/users/:id/unfollow
// ─────────────────────────────────────────────
const unfollowUser = async (req, res) => {
    try {
        const targetId = req.params.id;
        const userId = req.user._id;

        await Promise.all([
            User.findByIdAndUpdate(userId, { $pull: { following: targetId } }),
            User.findByIdAndUpdate(targetId, { $pull: { followers: userId } })
        ]);

        res.json({ success: true, message: 'Abonnement retiré' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  T66 — @GET /api/community/users/:id/followers
// ─────────────────────────────────────────────
const getFollowers = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('followers')
            .populate('followers', 'nom profilePhoto');
        if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        res.json({ success: true, data: user.followers, total: user.followers.length });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  T66 — @GET /api/community/users/:id/following
// ─────────────────────────────────────────────
const getFollowing = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('following')
            .populate('following', 'nom profilePhoto');
        if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        res.json({ success: true, data: user.following, total: user.following.length });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  T70 — @POST /api/community/signalements
// ─────────────────────────────────────────────
const creerSignalement = async (req, res) => {
    try {
        const { type, cible, cibleId, raison } = req.body;

        if (!type || !cible || !cibleId || !raison) {
            return res.status(400).json({ success: false, message: 'type, cible, cibleId et raison sont requis' });
        }

        const signalement = await Signalement.create({
            type,
            cible,
            cibleId,
            raison: String(raison).substring(0, 500),
            auteur: req.user._id
        });

        res.status(201).json({ success: true, data: signalement });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  T88 — @GET /api/timeline
//  Voyages + photos de l'utilisateur, triés par date
// ─────────────────────────────────────────────
const getTimeline = async (req, res) => {
    try {
        const userId = req.user._id;

        const [voyages, dossiers] = await Promise.all([
            Voyage.find({ user: userId })
                .select('titre destination dates createdAt visibilite budget')
                .sort({ createdAt: -1 })
                .limit(100),
            Dossier.find({ user: userId, 'photos.0': { $exists: true } })
                .select('titre voyage photos.caption photos.date photos._id')
                .populate('voyage', 'titre destination')
        ]);

        const items = [];

        voyages.forEach(v => {
            items.push({
                type: 'voyage',
                date: v.dates?.start || v.createdAt,
                data: v
            });
        });

        dossiers.forEach(d => {
            d.photos.forEach(p => {
                items.push({
                    type: 'photo',
                    date: p.date || d.createdAt,
                    data: {
                        id: p._id,
                        caption: p.caption,
                        dossierId: d._id,
                        voyage: d.voyage
                    }
                });
            });
        });

        items.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json({ success: true, data: items.slice(0, 100), total: items.length });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    getFeed,
    getCommentaires,
    ajouterCommentaire,
    supprimerCommentaire,
    creerGroupe,
    getGroupes,
    getGroupe,
    rejoindreGroupe,
    quitterGroupe,
    recherche,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    creerSignalement,
    getTimeline
};
