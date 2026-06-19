// =============================================================
// FICHIER  : src/config/swagger.js
// TÂCHE    : T141 — [M10] Documentation API Swagger / OpenAPI
//
// Spécification OpenAPI 3.0 complète de l'API Libertia, écrite à
// la main (aucune dépendance npm — le registre interne bloque
// l'installation de swagger-ui-express derrière le proxy SSL).
//
// Servie en JSON sur /api-docs.json et rendue par Swagger UI
// (chargé depuis un CDN) sur /api-docs — voir app.js.
// =============================================================

// ── Réponses réutilisables ──────────────────────────────────
const unauthorized = {
    description: 'Token manquant, invalide ou expiré',
    content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
};
const forbidden = {
    description: 'Accès réservé aux administrateurs',
    content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
};
const notFound = {
    description: 'Ressource non trouvée',
    content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
};
const badRequest = {
    description: 'Requête invalide',
    content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
};

// Raccourci : opération protégée par JWT renvoyant 200 + 401
const protectedGet = (tag, summary, extra = {}) => ({
    tags: [tag],
    summary,
    security: [{ bearerAuth: [] }],
    responses: { 200: { description: 'Succès' }, 401: unauthorized, ...extra },
});

const idParam = {
    name: 'id',
    in: 'path',
    required: true,
    schema: { type: 'string' },
    description: 'Identifiant MongoDB (ObjectId)',
};

const swaggerSpec = {
    openapi: '3.0.3',
    info: {
        title: 'Libertia API',
        version: '1.0.0',
        description:
            "API REST de la plateforme de voyage Libertia.\n\n" +
            "La plupart des routes nécessitent un **JWT** (header `Authorization: Bearer <token>`). " +
            "Obtenez un token via `POST /api/auth/login`, puis cliquez sur **Authorize** ci-dessus.",
        contact: { name: 'Équipe Libertia' },
    },
    servers: [
        { url: 'http://localhost:5000', description: 'Développement local' },
    ],
    tags: [
        { name: 'Auth', description: 'Inscription, connexion, profil, RGPD' },
        { name: 'Voyages', description: 'Génération IA, budget, conseils, partage' },
        { name: 'Communauté', description: 'Fil, commentaires, groupes, recherche' },
        { name: 'Avis', description: 'Avis sur les agences' },
        { name: 'Agences', description: 'Annuaire et validation des agences (admin)' },
        { name: 'Boîtes', description: 'Boîtes collaboratives temps réel' },
        { name: 'Dossiers', description: 'Souvenirs de voyage (photos)' },
        { name: 'Notifications', description: 'Notifications utilisateur' },
        { name: 'Compagnon', description: 'Compagnon IA gamifié' },
        { name: 'Export', description: 'Export CSV/Excel (admin)' },
        { name: 'Admin', description: 'Journaux d\'activité (admin)' },
    ],
    components: {
        securitySchemes: {
            bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
        schemas: {
            Error: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string', example: "Message d'erreur" },
                },
            },
            User: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '665f1a2b3c4d5e6f7a8b9c0d' },
                    nom: { type: 'string', example: 'Marie Dupont' },
                    email: { type: 'string', format: 'email', example: 'marie@email.com' },
                    age: { type: 'integer', example: 29 },
                    role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
                    abonnement: { type: 'string', enum: ['free', 'premium'], example: 'free' },
                    promptsUtilises: { type: 'integer', example: 3 },
                    profilePhoto: { type: 'string', example: 'default-avatar.png' },
                    bio: { type: 'string', example: 'Voyageuse passionnée 🌍' },
                    preferences: { type: 'array', items: { type: 'string' }, example: ['montagne', 'culture'] },
                    isActive: { type: 'boolean', example: true },
                    createdAt: { type: 'string', format: 'date-time' },
                },
            },
            AuthResponse: {
                type: 'object',
                properties: {
                    accessToken: { type: 'string', description: 'JWT (15 min)' },
                    refreshToken: { type: 'string', description: 'Refresh token (7 jours)' },
                    user: { $ref: '#/components/schemas/User' },
                },
            },
            Voyage: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    user: { type: 'string', description: 'ObjectId du propriétaire' },
                    prompt: { type: 'string', example: '10 jours au Japon en avril, budget 2000€' },
                    titre: { type: 'string', example: 'Aventure au Japon' },
                    destination: { type: 'string', example: 'Tokyo, Japon' },
                    itineraire: { type: 'object', description: 'Itinéraire généré par l\'IA' },
                    dates: {
                        type: 'object',
                        properties: {
                            start: { type: 'string', format: 'date' },
                            end: { type: 'string', format: 'date' },
                        },
                    },
                    budget: {
                        type: 'object',
                        properties: {
                            total: { type: 'number', example: 2000 },
                            currency: { type: 'string', example: 'EUR' },
                        },
                    },
                    coordonnees: {
                        type: 'object',
                        properties: { lat: { type: 'number' }, lng: { type: 'number' } },
                    },
                    visibilite: { type: 'string', enum: ['prive', 'amis', 'public'], example: 'prive' },
                    likeCount: { type: 'integer', example: 12 },
                    commentCount: { type: 'integer', example: 4 },
                    createdAt: { type: 'string', format: 'date-time' },
                },
            },
            Agency: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    nom: { type: 'string', example: 'Sakura Travel' },
                    description: { type: 'string' },
                    localisation: { type: 'string', example: 'Tokyo, Japon' },
                    specialites: { type: 'array', items: { type: 'string' } },
                    contact: {
                        type: 'object',
                        properties: {
                            telephone: { type: 'string' },
                            email: { type: 'string' },
                            adresse: { type: 'string' },
                            siteWeb: { type: 'string' },
                            horaires: { type: 'string' },
                        },
                    },
                    statut: { type: 'string', enum: ['en_attente', 'approuvee', 'rejetee'] },
                    verifiee: { type: 'boolean' },
                    motifRejet: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                },
            },
            Avis: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    agence: { type: 'string', description: 'ObjectId de l\'agence' },
                    auteur: { type: 'string', description: 'ObjectId de l\'auteur' },
                    note: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
                    commentaire: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                },
            },
            Notification: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    type: { type: 'string', example: 'like' },
                    message: { type: 'string' },
                    lue: { type: 'boolean', example: false },
                    createdAt: { type: 'string', format: 'date-time' },
                },
            },
        },
    },

    // ── Sécurité par défaut : JWT (les routes publiques la lèvent
    //    individuellement via `security: []`) ─────────────────────
    security: [{ bearerAuth: [] }],

    paths: {
        // ───────────────── AUTH ─────────────────
        '/api/auth/register': {
            post: {
                tags: ['Auth'], summary: 'Inscription', security: [],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: {
                        type: 'object', required: ['nom', 'email', 'motDePasse'],
                        properties: {
                            nom: { type: 'string', example: 'Marie Dupont' },
                            email: { type: 'string', format: 'email', example: 'marie@email.com' },
                            motDePasse: { type: 'string', format: 'password', example: 'Secret123!' },
                            age: { type: 'integer', example: 29 },
                        },
                    } } },
                },
                responses: {
                    201: { description: 'Compte créé', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
                    400: badRequest,
                },
            },
        },
        '/api/auth/login': {
            post: {
                tags: ['Auth'], summary: 'Connexion', security: [],
                requestBody: {
                    required: true,
                    content: { 'application/json': { schema: {
                        type: 'object', required: ['email', 'motDePasse'],
                        properties: {
                            email: { type: 'string', format: 'email', example: 'marie@email.com' },
                            motDePasse: { type: 'string', format: 'password', example: 'Secret123!' },
                        },
                    } } },
                },
                responses: {
                    200: { description: 'Connecté', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
                    401: { description: 'Identifiants invalides', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                },
            },
        },
        '/api/auth/me': {
            get: {
                tags: ['Auth'], summary: 'Profil de l\'utilisateur connecté',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'Profil', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
                    401: unauthorized,
                },
            },
        },
        '/api/auth/forgot-password': {
            post: {
                tags: ['Auth'], summary: 'Demande de réinitialisation (email)', security: [],
                requestBody: { required: true, content: { 'application/json': { schema: {
                    type: 'object', required: ['email'],
                    properties: { email: { type: 'string', format: 'email' } },
                } } } },
                responses: { 200: { description: 'Email envoyé si le compte existe' } },
            },
        },
        '/api/auth/reset-password/{token}': {
            post: {
                tags: ['Auth'], summary: 'Réinitialisation du mot de passe', security: [],
                parameters: [{ name: 'token', in: 'path', required: true, schema: { type: 'string' } }],
                requestBody: { required: true, content: { 'application/json': { schema: {
                    type: 'object', required: ['motDePasse'],
                    properties: { motDePasse: { type: 'string', format: 'password' } },
                } } } },
                responses: { 200: { description: 'Mot de passe mis à jour' }, 400: badRequest },
            },
        },
        '/api/auth/update-profile': {
            put: {
                tags: ['Auth'], summary: 'Modifier le profil',
                security: [{ bearerAuth: [] }],
                requestBody: { content: { 'application/json': { schema: {
                    type: 'object',
                    properties: {
                        nom: { type: 'string' }, bio: { type: 'string' },
                        age: { type: 'integer' }, profilePhoto: { type: 'string' },
                        preferences: { type: 'array', items: { type: 'string' } },
                    },
                } } } },
                responses: { 200: { description: 'Profil mis à jour', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } }, 401: unauthorized },
            },
        },
        '/api/auth/supprimer-compte': {
            delete: {
                tags: ['Auth'], summary: 'Supprimer son compte (RGPD)',
                security: [{ bearerAuth: [] }],
                responses: { 200: { description: 'Compte supprimé' }, 401: unauthorized },
            },
        },
        '/api/auth/refresh-token': {
            post: {
                tags: ['Auth'], summary: 'Rafraîchir l\'access token', security: [],
                requestBody: { required: true, content: { 'application/json': { schema: {
                    type: 'object', required: ['refreshToken'],
                    properties: { refreshToken: { type: 'string' } },
                } } } },
                responses: { 200: { description: 'Nouveau token', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } }, 401: unauthorized },
            },
        },
        '/api/auth/logout': {
            post: {
                tags: ['Auth'], summary: 'Déconnexion (blacklist du token)',
                security: [{ bearerAuth: [] }],
                responses: { 200: { description: 'Déconnecté' }, 401: unauthorized },
            },
        },

        // ───────────────── VOYAGES ─────────────────
        '/api/voyages/generer': {
            post: {
                tags: ['Voyages'], summary: 'Générer un voyage via l\'IA',
                security: [{ bearerAuth: [] }],
                requestBody: { required: true, content: { 'application/json': { schema: {
                    type: 'object', required: ['prompt'],
                    properties: { prompt: { type: 'string', example: 'Un week-end romantique à Rome avec 600€' } },
                } } } },
                responses: {
                    201: { description: 'Voyage généré', content: { 'application/json': { schema: { $ref: '#/components/schemas/Voyage' } } } },
                    401: unauthorized,
                    403: { description: 'Limite de prompts atteinte (compte free)', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                },
            },
        },
        '/api/voyages/mes-voyages': { get: protectedGet('Voyages', 'Lister mes voyages') },
        '/api/voyages/carte': { get: protectedGet('Voyages', 'Voyages géolocalisés pour la carte') },
        '/api/voyages/{id}': {
            get: { ...protectedGet('Voyages', 'Détail d\'un voyage', { 404: notFound }), parameters: [idParam] },
            delete: { tags: ['Voyages'], summary: 'Supprimer un voyage', security: [{ bearerAuth: [] }], parameters: [idParam], responses: { 200: { description: 'Supprimé' }, 401: unauthorized, 404: notFound } },
        },
        '/api/voyages/{id}/partage': {
            patch: { tags: ['Voyages'], summary: 'Basculer le partage public', security: [{ bearerAuth: [] }], parameters: [idParam], responses: { 200: { description: 'Partage mis à jour' }, 401: unauthorized, 404: notFound } },
        },
        '/api/voyages/{id}/like': {
            post: { tags: ['Voyages'], summary: 'Liker un voyage', security: [{ bearerAuth: [] }], parameters: [idParam], responses: { 200: { description: 'Like ajouté' }, 401: unauthorized } },
            delete: { tags: ['Voyages'], summary: 'Retirer son like', security: [{ bearerAuth: [] }], parameters: [idParam], responses: { 200: { description: 'Like retiré' }, 401: unauthorized } },
        },
        '/api/voyages/{id}/budget': {
            get: { ...protectedGet('Voyages', 'Budget d\'un voyage'), parameters: [idParam] },
            patch: {
                tags: ['Voyages'], summary: 'Mettre à jour le budget', security: [{ bearerAuth: [] }], parameters: [idParam],
                requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { total: { type: 'number' }, currency: { type: 'string' } } } } } },
                responses: { 200: { description: 'Budget mis à jour' }, 401: unauthorized },
            },
        },
        '/api/voyages/{id}/budget/recalculer': {
            post: { tags: ['Voyages'], summary: 'Recalculer le budget', security: [{ bearerAuth: [] }], parameters: [idParam], responses: { 200: { description: 'Budget recalculé' }, 401: unauthorized } },
        },
        '/api/voyages/{id}/conseils': {
            get: { ...protectedGet('Voyages', 'Conseils IA pour le voyage'), parameters: [idParam] },
        },
        '/api/voyages/{id}/conseils/regenerer': {
            post: { tags: ['Voyages'], summary: 'Régénérer les conseils', security: [{ bearerAuth: [] }], parameters: [idParam], responses: { 200: { description: 'Conseils régénérés' }, 401: unauthorized } },
        },
        '/api/voyages/{id}/privacite': {
            get: { ...protectedGet('Voyages', 'Niveau de visibilité'), parameters: [idParam] },
            patch: {
                tags: ['Voyages'], summary: 'Changer la visibilité', security: [{ bearerAuth: [] }], parameters: [idParam],
                requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { visibilite: { type: 'string', enum: ['prive', 'amis', 'public'] } } } } } },
                responses: { 200: { description: 'Visibilité mise à jour' }, 401: unauthorized },
            },
        },

        // ───────────────── COMMUNAUTÉ ─────────────────
        '/api/community/feed': { get: protectedGet('Communauté', 'Fil des voyages publics') },
        '/api/community/recherche': {
            get: {
                tags: ['Communauté'], summary: 'Recherche transversale', security: [{ bearerAuth: [] }],
                parameters: [{ name: 'q', in: 'query', schema: { type: 'string' }, description: 'Terme recherché' }],
                responses: { 200: { description: 'Résultats' }, 401: unauthorized },
            },
        },
        '/api/community/voyages/{id}/commentaires': {
            get: { ...protectedGet('Communauté', 'Commentaires d\'un voyage'), parameters: [idParam] },
            post: {
                tags: ['Communauté'], summary: 'Ajouter un commentaire', security: [{ bearerAuth: [] }], parameters: [idParam],
                requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['contenu'], properties: { contenu: { type: 'string' } } } } } },
                responses: { 201: { description: 'Commentaire ajouté' }, 401: unauthorized },
            },
        },
        '/api/community/voyages/{id}/commentaires/{commentId}': {
            delete: {
                tags: ['Communauté'], summary: 'Supprimer un commentaire', security: [{ bearerAuth: [] }],
                parameters: [idParam, { name: 'commentId', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'Supprimé' }, 401: unauthorized, 404: notFound },
            },
        },
        '/api/community/groupes': {
            get: protectedGet('Communauté', 'Lister les groupes'),
            post: {
                tags: ['Communauté'], summary: 'Créer un groupe', security: [{ bearerAuth: [] }],
                requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['nom'], properties: { nom: { type: 'string' }, description: { type: 'string' } } } } } },
                responses: { 201: { description: 'Groupe créé' }, 401: unauthorized },
            },
        },
        '/api/community/groupes/{id}': { get: { ...protectedGet('Communauté', 'Détail d\'un groupe', { 404: notFound }), parameters: [idParam] } },
        '/api/community/groupes/{id}/rejoindre': { post: { tags: ['Communauté'], summary: 'Rejoindre un groupe', security: [{ bearerAuth: [] }], parameters: [idParam], responses: { 200: { description: 'Rejoint' }, 401: unauthorized } } },
        '/api/community/groupes/{id}/quitter': { post: { tags: ['Communauté'], summary: 'Quitter un groupe', security: [{ bearerAuth: [] }], parameters: [idParam], responses: { 200: { description: 'Quitté' }, 401: unauthorized } } },

        // ───────────────── AVIS ─────────────────
        '/api/avis': {
            get: {
                tags: ['Avis'], summary: 'Lister les avis d\'une agence', security: [{ bearerAuth: [] }],
                parameters: [{ name: 'agence', in: 'query', required: true, schema: { type: 'string' }, description: 'ObjectId de l\'agence' }],
                responses: { 200: { description: 'Liste des avis' }, 401: unauthorized },
            },
            post: {
                tags: ['Avis'], summary: 'Publier un avis', security: [{ bearerAuth: [] }],
                requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['agence', 'note'], properties: { agence: { type: 'string' }, note: { type: 'integer', minimum: 1, maximum: 5 }, commentaire: { type: 'string' } } } } } },
                responses: { 201: { description: 'Avis créé', content: { 'application/json': { schema: { $ref: '#/components/schemas/Avis' } } } }, 401: unauthorized },
            },
        },
        '/api/avis/{id}': {
            delete: { tags: ['Avis'], summary: 'Supprimer un avis', security: [{ bearerAuth: [] }], parameters: [idParam], responses: { 200: { description: 'Supprimé' }, 401: unauthorized, 404: notFound } },
        },

        // ───────────────── AGENCES ─────────────────
        '/api/agences': {
            get: {
                tags: ['Agences'], summary: 'Annuaire des agences approuvées', security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'statut', in: 'query', schema: { type: 'string', enum: ['en_attente', 'approuvee', 'rejetee'] } },
                    { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Recherche nom / localisation' },
                ],
                responses: { 200: { description: 'Liste', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Agency' } } } } }, 401: unauthorized },
            },
            post: {
                tags: ['Agences'], summary: 'Créer une agence (statut en_attente)', security: [{ bearerAuth: [] }],
                requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Agency' } } } },
                responses: { 201: { description: 'Agence créée', content: { 'application/json': { schema: { $ref: '#/components/schemas/Agency' } } } }, 400: badRequest, 401: unauthorized },
            },
        },
        '/api/agences/en-attente': {
            get: { tags: ['Agences'], summary: 'Agences en attente (admin)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Liste' }, 401: unauthorized, 403: forbidden } },
        },
        '/api/agences/{id}': {
            get: { ...protectedGet('Agences', 'Détail d\'une agence', { 404: notFound }), parameters: [idParam] },
        },
        '/api/agences/{id}/valider': {
            patch: { tags: ['Agences'], summary: 'Valider une agence (admin)', security: [{ bearerAuth: [] }], parameters: [idParam], responses: { 200: { description: 'Approuvée' }, 401: unauthorized, 403: forbidden, 404: notFound } },
        },
        '/api/agences/{id}/rejeter': {
            patch: {
                tags: ['Agences'], summary: 'Rejeter une agence (admin)', security: [{ bearerAuth: [] }], parameters: [idParam],
                requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { motif: { type: 'string' } } } } } },
                responses: { 200: { description: 'Rejetée' }, 401: unauthorized, 403: forbidden, 404: notFound },
            },
        },

        // ───────────────── BOÎTES ─────────────────
        '/api/boites': {
            get: protectedGet('Boîtes', 'Mes boîtes collaboratives'),
            post: {
                tags: ['Boîtes'], summary: 'Créer une boîte', security: [{ bearerAuth: [] }],
                requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['nom'], properties: { nom: { type: 'string' }, description: { type: 'string' } } } } } },
                responses: { 201: { description: 'Boîte créée' }, 401: unauthorized },
            },
        },
        '/api/boites/{id}': {
            get: { ...protectedGet('Boîtes', 'Détail d\'une boîte', { 404: notFound }), parameters: [idParam] },
            delete: { tags: ['Boîtes'], summary: 'Supprimer une boîte', security: [{ bearerAuth: [] }], parameters: [idParam], responses: { 200: { description: 'Supprimée' }, 401: unauthorized, 404: notFound } },
        },
        '/api/boites/{id}/inviter': {
            post: {
                tags: ['Boîtes'], summary: 'Inviter un membre', security: [{ bearerAuth: [] }], parameters: [idParam],
                requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email'], properties: { email: { type: 'string', format: 'email' } } } } } },
                responses: { 200: { description: 'Membre invité' }, 401: unauthorized },
            },
        },
        '/api/boites/{id}/membres/{userId}': {
            delete: {
                tags: ['Boîtes'], summary: 'Retirer un membre', security: [{ bearerAuth: [] }],
                parameters: [idParam, { name: 'userId', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'Membre retiré' }, 401: unauthorized },
            },
        },
        '/api/boites/{id}/messages': { get: { ...protectedGet('Boîtes', 'Historique des messages'), parameters: [idParam] } },

        // ───────────────── DOSSIERS (souvenirs) ─────────────────
        '/api/dossiers/mes-dossiers': { get: protectedGet('Dossiers', 'Mes dossiers de souvenirs') },
        '/api/dossiers/carte': { get: protectedGet('Dossiers', 'Souvenirs géolocalisés') },
        '/api/dossiers/voyage/{voyageId}': {
            get: {
                tags: ['Dossiers'], summary: 'Dossier d\'un voyage', security: [{ bearerAuth: [] }],
                parameters: [{ name: 'voyageId', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'Dossier' }, 401: unauthorized, 404: notFound },
            },
        },
        '/api/dossiers/{id}': {
            patch: { tags: ['Dossiers'], summary: 'Mettre à jour un dossier', security: [{ bearerAuth: [] }], parameters: [idParam], responses: { 200: { description: 'Mis à jour' }, 401: unauthorized } },
        },
        '/api/dossiers/{id}/photos': {
            post: {
                tags: ['Dossiers'], summary: 'Ajouter une photo', security: [{ bearerAuth: [] }], parameters: [idParam],
                requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { image: { type: 'string', description: 'Image base64' }, legende: { type: 'string' } } } } } },
                responses: { 201: { description: 'Photo ajoutée' }, 401: unauthorized },
            },
        },
        '/api/dossiers/{id}/photos/{photoId}': {
            delete: {
                tags: ['Dossiers'], summary: 'Supprimer une photo', security: [{ bearerAuth: [] }],
                parameters: [idParam, { name: 'photoId', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'Supprimée' }, 401: unauthorized },
            },
        },

        // ───────────────── NOTIFICATIONS ─────────────────
        '/api/notifications': {
            get: { ...protectedGet('Notifications', 'Mes notifications'), responses: { 200: { description: 'Liste', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Notification' } } } } }, 401: unauthorized } },
        },
        '/api/notifications/non-lues/count': { get: protectedGet('Notifications', 'Nombre de notifications non lues') },
        '/api/notifications/tout-lire': { patch: { tags: ['Notifications'], summary: 'Tout marquer comme lu', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' }, 401: unauthorized } } },
        '/api/notifications/{id}/lire': { patch: { tags: ['Notifications'], summary: 'Marquer comme lue', security: [{ bearerAuth: [] }], parameters: [idParam], responses: { 200: { description: 'OK' }, 401: unauthorized } } },
        '/api/notifications/{id}': { delete: { tags: ['Notifications'], summary: 'Supprimer une notification', security: [{ bearerAuth: [] }], parameters: [idParam], responses: { 200: { description: 'Supprimée' }, 401: unauthorized } } },

        // ───────────────── COMPAGNON ─────────────────
        '/api/compagnon/moi': { get: protectedGet('Compagnon', 'Mon compagnon IA') },
        '/api/compagnon/chat': {
            post: {
                tags: ['Compagnon'], summary: 'Discuter avec le compagnon', security: [{ bearerAuth: [] }],
                requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['message'], properties: { message: { type: 'string' } } } } } },
                responses: { 200: { description: 'Réponse du compagnon' }, 401: unauthorized },
            },
        },
        '/api/compagnon/photo': { post: { tags: ['Compagnon'], summary: 'Ajouter une photo au compagnon', security: [{ bearerAuth: [] }], responses: { 200: { description: 'OK' }, 401: unauthorized } } },
        '/api/compagnon/classement': { get: protectedGet('Compagnon', 'Classement des compagnons') },

        // ───────────────── EXPORT (admin) ─────────────────
        '/api/export/utilisateurs': {
            get: {
                tags: ['Export'], summary: 'Exporter les utilisateurs (CSV)', security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'role', in: 'query', schema: { type: 'string', enum: ['user', 'admin'] } },
                    { name: 'abonnement', in: 'query', schema: { type: 'string', enum: ['free', 'premium'] } },
                    { name: 'actif', in: 'query', schema: { type: 'string', enum: ['true', 'false'] } },
                    { name: 'sep', in: 'query', schema: { type: 'string', enum: [',', ';'] }, description: 'Séparateur (";" pour Excel FR)' },
                ],
                responses: { 200: { description: 'Fichier CSV', content: { 'text/csv': { schema: { type: 'string', format: 'binary' } } } }, 401: unauthorized, 403: forbidden },
            },
        },
        '/api/export/voyages': {
            get: {
                tags: ['Export'], summary: 'Exporter les voyages (CSV)', security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'visibilite', in: 'query', schema: { type: 'string', enum: ['prive', 'amis', 'public'] } },
                    { name: 'sep', in: 'query', schema: { type: 'string', enum: [',', ';'] } },
                ],
                responses: { 200: { description: 'Fichier CSV', content: { 'text/csv': { schema: { type: 'string', format: 'binary' } } } }, 401: unauthorized, 403: forbidden },
            },
        },
        '/api/export/agences': {
            get: {
                tags: ['Export'], summary: 'Exporter les agences (CSV)', security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'statut', in: 'query', schema: { type: 'string', enum: ['en_attente', 'approuvee', 'rejetee'] } },
                    { name: 'sep', in: 'query', schema: { type: 'string', enum: [',', ';'] } },
                ],
                responses: { 200: { description: 'Fichier CSV', content: { 'text/csv': { schema: { type: 'string', format: 'binary' } } } }, 401: unauthorized, 403: forbidden },
            },
        },

        // ───────────────── ADMIN — LOGS (T127) ─────────────────
        '/api/admin/logs': {
            get: {
                tags: ['Admin'], summary: 'Consulter les journaux d\'activité', security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'action', in: 'query', schema: { type: 'string' }, description: 'Filtrer par type d\'action' },
                    { name: 'success', in: 'query', schema: { type: 'string', enum: ['true', 'false'] } },
                    { name: 'userId', in: 'query', schema: { type: 'string' } },
                    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 50, maximum: 200 } },
                ],
                responses: { 200: { description: 'Liste paginée des logs' }, 401: unauthorized, 403: forbidden },
            },
        },
        '/api/admin/logs/stats': {
            get: { tags: ['Admin'], summary: 'Statistiques des journaux (par action)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Statistiques' }, 401: unauthorized, 403: forbidden } },
        },
    },
};

// Page HTML qui monte Swagger UI depuis un CDN et pointe sur /api-docs.json.
// (Évite la dépendance swagger-ui-express, non installable derrière le proxy.)
const swaggerHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Libertia API — Documentation</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css" />
  <link rel="icon" href="data:," />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js" crossorigin></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '/api-docs.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        persistAuthorization: true,
      });
    };
  </script>
</body>
</html>`;

module.exports = { swaggerSpec, swaggerHtml };
