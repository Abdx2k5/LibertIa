# Novica
# Novica – Plateforme e-commerce d’artisanat culturel

## Présentation

**Novica** est une plateforme e-commerce dédiée à la vente de produits artisanaux provenant de différentes cultures à travers le monde.
Elle met en relation directe des **artisans locaux** avec des **consommateurs internationaux** à travers une plateforme numérique moderne.

L’objectif est de valoriser l’artisanat, le commerce équitable et les traditions culturelles en proposant des produits authentiques accompagnés de l’histoire et du savoir-faire de leurs créateurs.

Contrairement aux marketplaces traditionnelles, Novica combine :

* commerce en ligne
* storytelling culturel
* engagement communautaire

Les utilisateurs peuvent découvrir des produits artisanaux, soutenir les créateurs et partager leurs expériences avec la communauté.

---

# Objectifs du projet

* Mettre en relation artisans et acheteurs
* Promouvoir l’artisanat et le commerce équitable
* Valoriser les cultures du monde
* Créer une communauté autour de l’artisanat

---

# Technologies utilisées (Stack MERN)

Le projet sera développé avec la stack **MERN**.

### Frontend

* React.js
* React Router
* Axios
* CSS / Tailwind / Bootstrap

### Backend

* Node.js
* Express.js

### Base de données

* MongoDB

### Authentification

* JWT (JSON Web Token)
* bcrypt

### Outils de développement

* Git
* GitHub
* Postman
* Visual Studio Code

---

# Architecture du projet

```
Client (React)
       │
       │ HTTP / API REST
       ▼
Backend (Node.js + Express)
       │
       │
       ▼
Base de données (MongoDB)
```

---

# Fonctionnalités principales

## Gestion des utilisateurs

* Création de compte
* Connexion
* Gestion du profil
* Historique des commandes

## Catalogue de produits

* Parcourir les catégories
* Recherche de produits
* Filtres (prix, pays, catégorie)

## Produits artisanaux

* Fiche produit détaillée
* Photos et description
* Histoire de l’artisan

## Gestion du panier

* Ajouter au panier
* Modifier les quantités
* Supprimer un produit

## Commandes

* Passer une commande
* Paiement sécurisé
* Suivi de commande

## Communauté

* Ajouter aux favoris
* Laisser un avis
* Partager un produit

## Gestion des artisans

* Création de profil artisan
* Ajout de produits
* Tableau de bord des ventes

---

# Structure du projet

novica
│
├── client
│   ├── public
│   │   ├── index.html
│   │   └── favicon.ico
│
│   ├── src
│   │   ├── components
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   └── Footer.jsx
│   │   │
│   │   ├── pages
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── ProductDetails.jsx
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
│   │   ├── productController.js
│   │   └── orderController.js
│   │
│   ├── models
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Order.js
│   │
│   ├── routes
│   │   ├── userRoutes.js
│   │   ├── productRoutes.js
│   │   └── orderRoutes.js
│   │
│   ├── middleware
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   │
│   └── server.js
│
├── package.json
└── README.md
---

# Installation du projet

## 1. Cloner le repository

```bash
git clone https://github.com/ton-username/novica.git
```

---

## 2. Installer les dépendances backend

```bash
cd server
npm install
```

---

## 3. Installer les dépendances frontend

```bash
cd client
npm install
```

---

# Lancer le projet

## Démarrer le backend

```bash
cd server
npm run dev
```

## Démarrer le frontend

```bash
cd client
npm start
```

---

# API REST (exemples)

### Utilisateurs

```
POST /api/users/register
POST /api/users/login
GET /api/users/profile
```

### Produits

```
GET /api/products
GET /api/products/:id
POST /api/products
```

### Commandes

```
POST /api/orders
GET /api/orders
GET /api/orders/:id
```

---

# Méthodologie de développement

Le projet est géré avec :

* User Stories
* Issues GitHub
* Milestones
* Backlog produit

Chaque fonctionnalité est développée à partir d’une **User Story** définissant les critères d’acceptation.

---

# Améliorations futures

* système de recommandations avec IA
* système de notation avancé
* chat entre acheteurs et artisans
* application mobile

---

# Auteur

Projet réalisé dans le cadre d’un projet académique utilisant la stack **MERN**.

---

# Licence

Ce projet est destiné à un usage éducatif.
jdn
