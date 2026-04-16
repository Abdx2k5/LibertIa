# 🐦 LibertIA

> **Voyagez intelligemment avec Libertia**  
> Une plateforme de planification de voyage propulsée par l'IA, combinée à une communauté de voyageurs passionnés.

---

## 📖 Description

LibertIA est une application web qui permet à l'utilisateur de décrire son voyage en langage naturel (texte ou voix), et génère automatiquement un itinéraire complet et personnalisé incluant vols, hôtels, activités et restaurants — le tout enrichi par les données de la communauté.

---

## ✨ Fonctionnalités

### 🤖 Intelligence Artificielle
- Génération d'itinéraires personnalisés via **Mistral 7B** (100% local)
- Pipeline **RAG** (Retrieval-Augmented Generation) avec ChromaDB
- Données réelles : OpenStreetMap, Hotels-API, Booking.com
- Système freemium : 10 prompts gratuits puis abonnement

### 👥 Communauté
- Forum thématique (étudiants, voyage entre filles, voyage de noce, omra)
- Partage d'itinéraires et carnets de voyage
- Avis et recommandations validés par la communauté
- Organisation de voyages en groupe

### 🔒 Sécurité
- Authentification JWT + bcrypt
- 2FA (Two-Factor Authentication)
- Rate limiting & protection CORS
- Audit logs & monitoring

### 💰 Monétisation
- Freemium (10 prompts/mois gratuits)
- Affiliation Travelpayouts (Booking.com, Skyscanner, Viator)
- Commission sur réservations
- Data B2B pour agences partenaires

---

## 🛠️ Stack Technique

| Composant | Technologie |
|-----------|-------------|
| Frontend | React.js |
| Backend | Node.js + Express |
| Base de données | MongoDB |
| IA | Mistral 7B (via Ollama) |
| Embeddings | nomic-embed-text |
| Base vectorielle | ChromaDB |
| Données | OpenStreetMap + Hotels-API |
| Authentification | JWT + bcrypt |

---

## 📁 Structure du Projet

```
LibertIA/
├── client/                     # Frontend React
│   └── src/
│       ├── pages/              # Landing, Login, Register, Dashboard
│       ├── components/         # Composants réutilisables
│       └── services/           # Appels API
├── server/                     # Backend Node.js
│   └── src/
│       ├── config/
│       │   └── db.js           # Connexion MongoDB
│       ├── controllers/
│       │   ├── authController.js
│       │   └── voyageController.js
│       ├── models/
│       │   ├── User.js
│       │   └── Voyage.js
│       ├── routes/
│       │   ├── authRoutes.js
│       │   └── voyageRoutes.js
│       ├── middlewares/
│       │   └── authMiddleware.js
│       └── app.js
├── ai/                         # Scripts IA & RAG
│   ├── import_data.py          # Import données OpenStreetMap + Hotels-API
│   ├── embeddings.py           # Vectorisation ChromaDB
│   └── requirements.txt
├── data/                       # Données brutes
├── docs/                       # Documentation
└── README.md
```

---

## 🚀 Installation

### Prérequis
- Node.js 18+
- Python 3.14+
- MongoDB (local)
- Ollama

### 1. Cloner le projet
```bash
git clone https://github.com/Abdx2k5/LibertIa.git
cd LibertIa
```

### 2. Backend
```bash
cd server
npm install
```

Créer le fichier `.env` :
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/libertia
JWT_SECRET=libertia_secret_key_2026
```

Lancer le serveur :
```bash
node src/app.js
```

### 3. IA (Ollama + Mistral)
```bash
# Installer Ollama sur https://ollama.com
ollama pull mistral
ollama pull nomic-embed-text
ollama run mistral
```

### 4. Import des données
```bash
cd ai
pip install -r requirements.txt
python import_data.py
```

### 5. Frontend
```bash
cd client
npm install
npm start
```

---

## 🔌 API Endpoints

### Authentification
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/register` | Créer un compte |
| POST | `/api/auth/login` | Se connecter |
| GET | `/api/auth/me` | Profil utilisateur (protégé) |

### Voyages
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/voyages/generer` | Générer un itinéraire IA |
| GET | `/api/voyages/mes-voyages` | Historique des voyages |
| GET | `/api/voyages/:id` | Détail d'un voyage |

---

## 🗺️ Roadmap

### ✅ Mois 1 — IA + Auth + Frontend
- [x] Authentification JWT
- [x] Pipeline Mistral 7B
- [x] Import données OSM + Hotels-API
- [ ] RAG avec ChromaDB
- [ ] Frontend React (Landing, Login, Dashboard)

### 🔜 Mois 2 — Communauté + Sécurité
- [ ] Forum thématique
- [ ] Partage d'itinéraires
- [ ] 2FA + OAuth
- [ ] Rate limiting & audit logs

### ⏳ Mois 3 — Finalisation
- [ ] Affiliation Travelpayouts
- [ ] Data warehouse
- [ ] Tests end-to-end
- [ ] Export PDF itinéraires

---

## 🌿 Branches Git

| Branche | Description |
|---------|-------------|
| `main` | Production — code stable livrable |
| `develop` | Intégration — toutes les features |
| `feature/auth` | ✅ Authentification |
| `feature/ai` | ✅ Pipeline IA Mistral |
| `feature/rag` | 🔜 RAG + ChromaDB |
| `feature/client` | 🔜 Frontend React |
| `feature/forum` | ⏳ Communauté |
| `feature/security` | ⏳ Sécurité |

---

## 📄 Licence

Projet académique — ESISA 2026 — Groupe Colibri  
Usage privé uniquement.

---

<div align="center">
  <strong>🐦 LibertIA — Voyagez intelligemment</strong><br/>
  Groupe Colibri • ESISA • 2026
</div>
