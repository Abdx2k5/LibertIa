const Forum = require('../models/Forum');

function getPagination(req, { defaultLimit = 10, maxLimit = 20 } = {}) {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(maxLimit, Math.max(1, parseInt(req.query.limit) || defaultLimit));
    return { page, limit, skip: (page - 1) * limit };
}

// ─────────────────────────────────────────────
//  @GET /api/forums
//  Liste paginée, filtre optionnel par ?categorie=
// ─────────────────────────────────────────────
const getForums = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req);
        const filtre = req.query.categorie ? { categorie: req.query.categorie } : {};

        const [forums, total] = await Promise.all([
            Forum.find(filtre)
                .select('-posts')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('auteur', 'nom profilePhoto'),
            Forum.countDocuments(filtre)
        ]);

        res.json({
            success: true,
            data: forums,
            page,
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  @POST /api/forums
// ─────────────────────────────────────────────
const creerForum = async (req, res) => {
    try {
        const titre = (req.body.titre || '').trim();
        const categorie = (req.body.categorie || '').trim();

        if (!titre) return res.status(400).json({ success: false, message: 'Le titre est requis' });
        if (titre.length > 200) return res.status(400).json({ success: false, message: 'Titre trop long (200 max)' });
        if (!categorie) return res.status(400).json({ success: false, message: 'La catégorie est requise' });

        const forum = await Forum.create({
            titre,
            categorie,
            auteur: req.user._id,
            posts: []
        });
        await forum.populate('auteur', 'nom profilePhoto');

        res.status(201).json({ success: true, data: forum });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  @GET /api/forums/:id
// ─────────────────────────────────────────────
const getForum = async (req, res) => {
    try {
        const forum = await Forum.findById(req.params.id)
            .populate('auteur', 'nom profilePhoto')
            .populate('posts.auteur', 'nom profilePhoto');

        if (!forum) return res.status(404).json({ success: false, message: 'Forum non trouvé' });

        res.json({ success: true, data: forum });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  @POST /api/forums/:id/posts
// ─────────────────────────────────────────────
const ajouterPost = async (req, res) => {
    try {
        const contenu = (req.body.contenu || '').trim();
        if (!contenu) return res.status(400).json({ success: false, message: 'Le contenu est requis' });
        if (contenu.length > 5000) return res.status(400).json({ success: false, message: 'Contenu trop long (5000 max)' });

        const forum = await Forum.findById(req.params.id);
        if (!forum) return res.status(404).json({ success: false, message: 'Forum non trouvé' });

        forum.posts.push({ auteur: req.user._id, contenu });
        await forum.save();
        await forum.populate('posts.auteur', 'nom profilePhoto');

        const post = forum.posts[forum.posts.length - 1];
        res.status(201).json({ success: true, data: post });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getForums, creerForum, getForum, ajouterPost };
