// Données factices pour la page détail agence (T92).
// Tant que le backend n'expose pas de modèle "Agence", on affiche
// ces informations statiques via /agence/:id.

export const AGENCIES = {
  "1": {
    id: "1",
    nom: "Collectif Alpes Voyages",
    logo: null,
    couverture: null,
    note: 4.8,
    avis: 312,
    localisation: "Chamonix, France",
    membreDepuis: "2019",
    verifiee: true,
    description:
      "Agence spécialisée dans les séjours montagne, ski et coworking. Nous organisons des voyages de groupe sur-mesure avec des activités encadrées par des guides certifiés, pour débutants comme pour confirmés.",
    specialites: ["Montagne", "Ski", "Coworking", "Groupes"],
    contact: {
      telephone: "+33 4 50 12 34 56",
      email: "contact@collectif-alpes.fr",
      adresse: "12 rue des Alpages, 74400 Chamonix-Mont-Blanc, France",
      siteWeb: "www.collectif-alpes.fr",
      horaires: "Lun - Sam · 9h00 - 18h00",
    },
    services: [
      {
        id: "s1",
        titre: "Séjours ski tout compris",
        description: "Hébergement, forfaits remontées et cours collectifs inclus.",
        prix: "À partir de 690€",
        icone: "ski",
      },
      {
        id: "s2",
        titre: "Coworking en montagne",
        description: "Espaces de travail équipés avec activités le soir.",
        prix: "À partir de 450€",
        icone: "coworking",
      },
      {
        id: "s3",
        titre: "Randonnées encadrées",
        description: "Sorties accompagnées par des guides de haute montagne.",
        prix: "À partir de 60€ / jour",
        icone: "randonnee",
      },
      {
        id: "s4",
        titre: "Organisation de groupe",
        description: "Devis personnalisé pour comités d'entreprise et associations.",
        prix: "Sur devis",
        icone: "groupe",
      },
    ],
  },
  "2": {
    id: "2",
    nom: "Sakura Travel",
    logo: null,
    couverture: null,
    note: 4.6,
    avis: 894,
    localisation: "Tokyo, Japon",
    membreDepuis: "2017",
    verifiee: true,
    description:
      "Sakura Travel conçoit des itinéraires sur-mesure au Japon : vols, hébergements traditionnels et activités culturelles authentiques pour les voyageurs solo ou en groupe.",
    specialites: ["Japon", "Culture", "Vols + Hôtel", "Sur-mesure"],
    contact: {
      telephone: "+81 3 1234 5678",
      email: "contact@sakura-travel.jp",
      adresse: "3-1 Shibuya, Tokyo 150-0002, Japon",
      siteWeb: "www.sakura-travel.jp",
      horaires: "Lun - Ven · 10h00 - 19h00 (JST)",
    },
    services: [
      {
        id: "s1",
        titre: "Itinéraires sur-mesure",
        description: "Circuit personnalisé selon vos envies et votre budget.",
        prix: "À partir de 1200€",
        icone: "itineraire",
      },
      {
        id: "s2",
        titre: "Réservation vols & hôtels",
        description: "Sélection d'hôtels traditionnels (ryokans) et vols directs.",
        prix: "Variable selon disponibilité",
        icone: "vol",
      },
      {
        id: "s3",
        titre: "Expériences culturelles",
        description: "Cérémonies du thé, ateliers cuisine, visites de temples.",
        prix: "À partir de 35€",
        icone: "culture",
      },
    ],
  },
};

export function getAgencyById(id) {
  return AGENCIES[id] || null;
}

export function getAllAgencies() {
  return Object.values(AGENCIES);
}
