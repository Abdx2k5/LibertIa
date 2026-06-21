// Données de démonstration du fil Communauté — il n'existe pas encore de
// backend "publications" distinct des Voyages (voir T55/T88 : le fil
// communauté réel se base sur Voyage.visibilite, pas sur un modèle Post).
// Centralisé ici pour être partagé entre Community.jsx (fil complet) et
// PublicProfile.jsx (filtré par auteur), plutôt que dupliqué.
import avatar1 from "../assets/images/community/avatar-1.png";
import avatar2 from "../assets/images/community/avatar-2.png";
import avatar3 from "../assets/images/community/avatar-3.png";
import tripMark from "../assets/images/community/trip-mark.png";
import tripSarah from "../assets/images/community/trip-sarah.png";
import composerAvatar from "../assets/images/community/profile.png";

export const MOCK_POSTS = [
  {
    id: "1",
    auteur: {
      id: "mock-sophie",
      nom: "Sophie Martin",
      avatar: null,
      badge: "Guide certifié",
      localisation: "Tokyo, Japon",
    },
    temps: "il y a 2 heures",
    contenu: "Ma première expérience avec Libertia a été impeccable. J’ai trouvé un vol, un hôtel et même des activités adaptées à mon budget en quelques minutes.",
    images: [tripMark, tripSarah],
    tags: ["#Japon", "#voyage", "#solo"],
    likes: 234,
    commentaires: 45,
    partages: 12,
    type: "post",
  },
  {
    id: "2",
    auteur: {
      id: "mock-mehdi",
      nom: "Mehdi El Amrani",
      avatar: avatar1,
      badge: "Membre actif",
      localisation: "Lisbonne, Portugal",
    },
    temps: "il y a 4 heures",
    contenu: "Quelqu’un a testé les quartiers calmes pour un séjour de 4 jours ? Je cherche une ambiance locale, pas trop touristique.",
    images: [],
    tags: ["#Portugal", "#citybreak", "#conseils"],
    likes: 98,
    commentaires: 21,
    partages: 7,
    type: "post",
  },
  {
    id: "3",
    auteur: {
      id: "mock-nina",
      nom: "Nina Laurent",
      avatar: avatar2,
      badge: "Rédactrice voyage",
      localisation: "Bali, Indonésie",
    },
    temps: "hier",
    contenu: "Découvrez comment organiser un voyage lent à Bali sans exploser votre budget ni rater les meilleurs spots au lever du soleil.",
    images: [tripSarah],
    tags: ["#article", "#budget", "#inspiration"],
    likes: 412,
    commentaires: 66,
    partages: 24,
    type: "article",
  },
  {
    id: "4",
    auteur: {
      id: "mock-collectif-alpes",
      nom: "Collectif Alpes",
      avatar: avatar3,
      badge: "Groupe vérifié",
      localisation: "Chamonix, France",
    },
    temps: "il y a 6 heures",
    contenu: "Nous organisons une semaine ski et coworking avec des activités le soir. Débutants bienvenus, ambiance détendue.",
    images: [tripMark, tripSarah, composerAvatar],
    tags: ["#groupe", "#alpines", "#coworking"],
    likes: 156,
    commentaires: 18,
    partages: 9,
    type: "groupe",
  },
  {
    id: "5",
    auteur: {
      id: "mock-thomas",
      nom: "Thomas R.",
      avatar: null,
      badge: "Explorateur",
      localisation: "Séoul, Corée du Sud",
    },
    temps: "il y a 1 jour",
    contenu: "Libertia m’a évité trois heures de recherche. J’ai pu comparer les activités, réserver rapidement et garder une vraie marge pour profiter sur place.",
    images: [tripSarah, tripMark],
    tags: ["#avis", "#gaindetemps"],
    likes: 12400,
    commentaires: 318,
    partages: 89,
    type: "post",
  },
  {
    id: "6",
    auteur: {
      id: "mock-clara",
      nom: "Clara Benali",
      avatar: avatar1,
      badge: "Guide certifié",
      localisation: "Marrakech, Maroc",
    },
    temps: "il y a 2 jours",
    contenu: "Petit carnet de route pour ceux qui aiment les escapades gourmandes et les ruelles animées. J’ai listé mes adresses préférées et les meilleurs créneaux pour visiter.",
    images: [],
    tags: ["#Marrakech", "#food", "#culture", "#tips"],
    likes: 367,
    commentaires: 29,
    partages: 16,
    type: "post",
  },
];

export const MOCK_TRAVELERS = [
  { id: "mock-sophie", nom: "Sophie Martin", info: "Guide certifié • Tokyo", avatar: avatar1 },
  { id: "mock-mehdi", nom: "Mehdi El Amrani", info: "Voyageur solo • Lisbonne", avatar: avatar2 },
  { id: "mock-nina", nom: "Nina Laurent", info: "Rédactrice voyage • Bali", avatar: avatar3 },
];
