Libertia
Libertia – Plateforme intelligente de planification de voyages
Présentation

Libertia est une plateforme numérique intelligente permettant de générer automatiquement des voyages personnalisés grâce à l’intelligence artificielle.

L’utilisateur peut décrire son voyage idéal à l’aide d’un prompt texte ou d’une commande vocale, en précisant :

la destination

les dates

le budget

le type de voyage (culturel, aventure, détente, luxe…)

La plateforme analyse ces informations et génère un itinéraire complet et personnalisé, adapté au profil de l’utilisateur.

Contrairement aux plateformes traditionnelles comme
Booking.com,
Airbnb ou
Tripadvisor,
Libertia combine trois dimensions principales :

IA conversationnelle

expérience utilisateur adaptative

dimension communautaire

Les utilisateurs peuvent également partager leurs voyages, découvrir ceux d’autres voyageurs et rejoindre des groupes de voyage, créant ainsi une communauté autour de l’exploration du monde.

Objectifs du projet

Simplifier la planification de voyage grâce à l’intelligence artificielle

Générer des itinéraires personnalisés automatiquement

Permettre aux utilisateurs de partager leurs expériences

Créer une communauté de voyageurs

Offrir une expérience interactive et intelligente

Technologies utilisées (Stack MERN)

Le projet est développé avec la stack MERN.

Frontend

React.js

React Router

Axios

TailwindCSS / CSS

Backend

Node.js

Express.js

Base de données

MongoDB

Intelligence artificielle

API IA pour génération d’itinéraires

Analyse de prompts utilisateurs

Authentification

JWT (JSON Web Token)

bcrypt

Outils de développement

Git

GitHub

Postman

Visual Studio Code

Architecture du projet
Client (React)
       │
       │ HTTP / API REST
       ▼
Backend (Node.js + Express)
       │
       │
       ▼
Base de données (MongoDB)
       │
       ▼
Service IA (génération d’itinéraires)
Fonctionnalités principales
Gestion des utilisateurs

Création de compte

Connexion

Gestion du profil

Préférences de voyage

Génération de voyages avec IA

Génération d’itinéraires via prompt

Génération de voyages via commande vocale

Adaptation selon le budget

Adaptation selon les dates

Adaptation selon le type de voyage

Itinéraires intelligents

Planning détaillé par jour

Suggestions d’activités

Estimation du budget

Recommandations de lieux à visiter

Feed communautaire

Partage de voyages

Publication de photos et d’expériences

Découverte des voyages d’autres utilisateurs

Likes et commentaires

Voyage en groupe

Création de groupes de voyage

Rejoindre des voyageurs

Organisation collaborative de voyages

Découverte et recommandations

Recherche de destinations

Suggestions personnalisées

Recommandations basées sur les préférences

Structure du projet
libertia
│
├── client
│   ├── public
│   │   ├── index.html
│   │   └── favicon.ico
│
│   ├── src
│   │   ├── components
│   │   │   ├── Navbar.jsx
│   │   │   ├── TravelCard.jsx
│   │   │   ├── Itinerary.jsx
│   │   │   └── Footer.jsx
│   │   │
│   │   ├── pages
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── TravelGenerator.jsx
│   │   │
│   │   ├── services
│   │   │   └── api.js
│   │   │
│   │   ├── context
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── App.jsx
│   │   └── index.js
│
├── server
│   ├── controllers
│   │   ├── userController.js
│   │   ├── travelController.js
│   │   └── communityController.js
│   │
│   ├── models
│   │   ├── User.js
│   │   ├── Travel.js
│   │   └── Post.js
│   │
│   ├── routes
│   │   ├── userRoutes.js
│   │   ├── travelRoutes.js
│   │   └── communityRoutes.js
│   │
│   ├── middleware
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   │
│   └── server.js
│
├── package.json
└── README.md
Installation du projet
1. Cloner le repository
git clone https://github.com/ton-username/libertia.git
2. Installer les dépendances backend
cd server
npm install
3. Installer les dépendances frontend
cd client
npm install
Lancer le projet
Démarrer le backend
cd server
npm run dev
Démarrer le frontend
cd client
npm start
API REST (exemples)
Utilisateurs
POST /api/users/register
POST /api/users/login
GET /api/users/profile
Voyages
POST /api/travel/generate
GET /api/travel/:id
GET /api/travel/history
Communauté
POST /api/posts
GET /api/posts
POST /api/posts/:id/like
POST /api/posts/:id/comment
Méthodologie de développement

Le projet est géré avec une approche Agile / Scrum.

Les outils utilisés :

User Stories

Issues GitHub

Milestones

Backlog produit

Chaque fonctionnalité est développée à partir d’une User Story avec critères d’acceptation.

Améliorations futures

recommandations avancées avec IA

intégration d’API de vols et d’hôtels

système de chat entre voyageurs

planification collaborative

application mobile
