// Données factices pour la page "Groupes de voyage" (T62).
// Tant que le backend n'expose pas de modèle "Groupe", on affiche
// ces informations statiques via /groupes.

export const GROUP_CATEGORIES = [
  "Tous",
  "Aventure",
  "Culture",
  "Budget",
  "Digital Nomad",
  "Famille",
  "Gastronomie",
];

export const TRAVEL_GROUPS = [
  {
    id: "1",
    nom: "Voyages solo Europe",
    description: "Pour les voyageurs solo qui veulent explorer l'Europe en toute sécurité, partager des bons plans et organiser des rencontres entre membres.",
    membres: 12400,
    localisation: "Europe",
    categorie: "Budget",
    type: "Public",
    verifie: true,
    prochaineActivite: "Rencontre à Lisbonne · 20 juin",
    tags: ["#solo", "#europe", "#budget"],
  },
  {
    id: "2",
    nom: "Road trips gourmands",
    description: "Itinéraires routiers à travers les régions gastronomiques, dégustations et adresses secrètes partagées par la communauté.",
    membres: 8100,
    localisation: "France",
    categorie: "Gastronomie",
    type: "Public",
    verifie: false,
    prochaineActivite: "Road trip Provence · 5 juillet",
    tags: ["#roadtrip", "#food", "#france"],
  },
  {
    id: "3",
    nom: "Digital nomads Asie",
    description: "Communauté de travailleurs nomades partageant coworkings, logements longue durée et conseils visas en Asie du Sud-Est.",
    membres: 14700,
    localisation: "Asie du Sud-Est",
    categorie: "Digital Nomad",
    type: "Public",
    verifie: true,
    prochaineActivite: "Meetup Bangkok · 28 juin",
    tags: ["#remote", "#asie", "#coworking"],
  },
  {
    id: "4",
    nom: "Collectif Alpes Voyages",
    description: "Séjours ski et coworking en montagne, randonnées encadrées et soirées conviviales. Débutants bienvenus.",
    membres: 3200,
    localisation: "Chamonix, France",
    categorie: "Aventure",
    type: "Public",
    verifie: true,
    prochaineActivite: "Semaine ski & coworking · 12 juillet",
    tags: ["#montagne", "#ski", "#groupe"],
  },
  {
    id: "5",
    nom: "Familles globe-trotteuses",
    description: "Conseils, itinéraires adaptés et bons plans pour voyager sereinement avec des enfants de tous âges.",
    membres: 5600,
    localisation: "Monde",
    categorie: "Famille",
    type: "Privé",
    verifie: false,
    prochaineActivite: "Discussion logements familiaux · 22 juin",
    tags: ["#famille", "#enfants", "#conseils"],
  },
  {
    id: "6",
    nom: "Sur les traces du Japon",
    description: "Itinéraires sur-mesure, expériences culturelles authentiques et échanges entre passionnés du Japon.",
    membres: 9300,
    localisation: "Japon",
    categorie: "Culture",
    type: "Public",
    verifie: true,
    prochaineActivite: "Rencontre Tokyo · 12 juin",
    tags: ["#japon", "#culture", "#voyage"],
  },
];

export function getAllGroups() {
  return TRAVEL_GROUPS;
}

export function getGroupById(id) {
  return TRAVEL_GROUPS.find((g) => g.id === id) || null;
}
