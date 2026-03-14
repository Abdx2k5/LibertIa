const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Générer un token JWT
const genererToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
};

// @route   POST /api/auth/register
// @desc    Inscription d'un nouvel utilisateur
// @access  Public
const register = async (req, res) => {
    try {
        const { nom, email, motDePasse, age } = req.body;
        // Validation basique
        if (!nom || !email || !motDePasse) {
            return res.status(400).json({ 
                success: false,
                message: 'Veuillez fournir nom, email et mot de passe' 
            });
        }if (motDePasse.length < 6) {
            return res.status(400).json({ 
                success: false,
                message: 'Le mot de passe doit contenir au moins 6 caractères' 
            });
        }
        // Vérifier si l'utilisateur existe déjà
        const userExiste = await User.findOne({ email });
        if (userExiste) {
            return res.status(400).json({ message: 'Email déjà utilisé' });
        }

        // Créer l'utilisateur(les valeurs par défaut sont gérées par le modèle)
        const user = await User.create({ nom, email, motDePasse, age });
        // Générer le token
        const token = genererToken(user._id);
        res.status(201).json({
            _id: user._id,
            nom: user.nom,
            email: user.email,
            abonnement: user.abonnement,
            profilePhoto: user.profilePhoto,
            promptsRestants: user.promptsRestants(),
            token
        });

    } catch (err) {
        console.error('Erreur register:', err);
        res.status(500).json({ 
            success: false,
            message: 'Erreur lors de l\'inscription' 
        });
    }
};

// @POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, motDePasse } = req.body;

        if (!email || !motDePasse) {
            return res.status(400).json({ 
                success: false,
                message: 'Veuillez fournir email et mot de passe' 
            });
        }
        // Trouver l'utilisateur
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }
        // Vérifier si le compte est actif
        if (user.isActive === false) {
            return res.status(403).json({ 
                success: false,
                message: 'Ce compte a été désactivé' 
            });
        }
        // Vérifier le mot de passe
        const motDePasseValide = await user.comparerMotDePasse(motDePasse);
        if (!motDePasseValide) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }
        // Mettre à jour la dernière connexion
        user.lastLogin = Date.now();
        await user.save();

        // Générer le token
        const token = genererToken(user._id);
        res.json({
            _id: user._id,
            nom: user.nom,
            email: user.email,
            abonnement: user.abonnement,
            profilePhoto: user.profilePhoto,
            promptsRestants: user.promptsRestants(),
            token
        });

    } catch (err) {
        console.error('Erreur login:', err);
        res.status(500).json({ 
            success: false,
            message: 'Erreur lors de la connexion' 
        });
    }
};


// @route   GET /api/auth/me
// @desc    Obtenir le profil de l'utilisateur connecté
// @access  Private
const getMe = async (req, res) => {
try {
        // req.user est déjà chargé par le middleware proteger
        const user = await User.findById(req.user._id)
            .select('-motDePasse')
            .populate('followers', 'nom profilePhoto')
            .populate('following', 'nom profilePhoto');

        res.json(req.user);
    } catch (err) {
        console.error('Erreur getMe:', err);
        res.status(500).json({ 
            success: false,
            message: 'Erreur lors de la récupération du profil' 
        });
    }
};

// @route   POST /api/auth/logout
// @desc    Déconnexion (côté client, on peut juste renvoyer un succès)
// @access  Private
const logout = async (req, res) => {
    try {
        // Avec JWT, la déconnexion est gérée côté client en supprimant le token
        res.json({
            success: true,
            message: 'Déconnexion réussie'
        });
    } catch (err) {
        res.status(500).json({ 
            success: false,
            message: err.message 
        });
    }
};

// @route   PUT /api/auth/profile
// @desc    Mettre à jour le profil de l'utilisateur
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const { nom, age, bio, preferences } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'Utilisateur non trouvé' 
            });
        }

        // Mise à jour des champs autorisés
        if (nom) user.nom = nom;
        if (age) user.age = age;
        if (bio) user.bio = bio;
        if (preferences) user.preferences = preferences;

        await user.save();

        res.json({
            success: true,
            data: {
                _id: user._id,
                nom: user.nom,
                email: user.email,
                age: user.age,
                bio: user.bio,
                profilePhoto: user.profilePhoto,
                preferences: user.preferences,
                promptsRestants: user.promptsRestants()
            }
        });
    } catch (err) {
        console.error('Erreur updateProfile:', err);
        res.status(500).json({ 
            success: false,
            message: 'Erreur lors de la mise à jour du profil' 
        });
    }
};
module.exports = { register, login, getMe, logout, updateProfile};