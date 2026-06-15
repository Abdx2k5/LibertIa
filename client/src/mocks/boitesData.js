// Données de départ pour la page "Boîtes collaboratives" (T80 — Collaboration workspace).
// Une "boîte" est un espace partagé où des voyageurs déposent des idées,
// votent et valident ensemble les éléments d'un futur voyage.

export const ITEM_CATEGORIES = [
  { id: "destination", label: "Destination", icon: "📍" },
  { id: "hebergement", label: "Hébergement", icon: "🏨" },
  { id: "activite",    label: "Activité",    icon: "🎟️" },
  { id: "transport",   label: "Transport",   icon: "✈️" },
  { id: "budget",      label: "Budget",      icon: "💰" },
  { id: "autre",       label: "Autre",       icon: "💡" },
];

// Statuts d'un élément dans le flux de décision collaboratif.
export const ITEM_STATUSES = [
  { id: "idee",   label: "Idée",    color: "#9ca3af" },
  { id: "valide", label: "Validé",  color: "#4ade80" },
  { id: "ecarte", label: "Écarté",  color: "#f87171" },
];

export const BOX_COLORS = ["#aa3bff", "#06b6d4", "#f97316", "#22c55e", "#ec4899", "#eab308"];

export const BOITES_SEED = [
  {
    id: "b-1",
    nom: "Roadtrip Portugal 🇵🇹",
    description: "On planifie 10 jours de Porto à Lagos en septembre. Déposez vos idées !",
    couleur: "#06b6d4",
    membres: [
      { id: "m-1", nom: "Vous" },
      { id: "m-2", nom: "Sophie Martin" },
      { id: "m-3", nom: "Mehdi El Amrani" },
    ],
    items: [
      { id: "i-1", texte: "Dormir une nuit dans les vignobles de la vallée du Douro", categorie: "hebergement", auteur: "Sophie Martin", votes: 3, voted: true, statut: "valide" },
      { id: "i-2", texte: "Surf à Nazaré (même juste regarder les vagues géantes)", categorie: "activite", auteur: "Mehdi El Amrani", votes: 2, voted: false, statut: "idee" },
      { id: "i-3", texte: "Louer une voiture hybride pour le trajet", categorie: "transport", auteur: "Vous", votes: 1, voted: true, statut: "idee" },
      { id: "i-4", texte: "Budget cible : 900€ / personne hors vols", categorie: "budget", auteur: "Sophie Martin", votes: 2, voted: false, statut: "valide" },
      { id: "i-5", texte: "Évora — un peu trop loin de notre boucle", categorie: "destination", auteur: "Mehdi El Amrani", votes: 0, voted: false, statut: "ecarte" },
    ],
  },
  {
    id: "b-2",
    nom: "Week-end ski entre amis ⛷️",
    description: "Chamonix ou Les Arcs ? On vise le premier week-end de février.",
    couleur: "#aa3bff",
    membres: [
      { id: "m-1", nom: "Vous" },
      { id: "m-4", nom: "Clara Benali" },
    ],
    items: [
      { id: "i-6", texte: "Chalet avec sauna pour 6 personnes", categorie: "hebergement", auteur: "Clara Benali", votes: 2, voted: true, statut: "idee" },
      { id: "i-7", texte: "Forfait 2 jours Les Arcs", categorie: "activite", auteur: "Vous", votes: 1, voted: false, statut: "idee" },
    ],
  },
];
