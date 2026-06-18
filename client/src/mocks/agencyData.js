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
        icone: "🎿",
      },
      {
        id: "s2",
        titre: "Coworking en montagne",
        description: "Espaces de travail équipés avec activités le soir.",
        prix: "À partir de 450€",
        icone: "💻",
      },
      {
        id: "s3",
        titre: "Randonnées encadrées",
        description: "Sorties accompagnées par des guides de haute montagne.",
        prix: "À partir de 60€ / jour",
        icone: "🥾",
      },
      {
        id: "s4",
        titre: "Organisation de groupe",
        description: "Devis personnalisé pour comités d'entreprise et associations.",
        prix: "Sur devis",
        icone: "👥",
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
        icone: "🗺️",
      },
      {
        id: "s2",
        titre: "Réservation vols & hôtels",
        description: "Sélection d'hôtels traditionnels (ryokans) et vols directs.",
        prix: "Variable selon disponibilité",
        icone: "✈️",
      },
      {
        id: "s3",
        titre: "Expériences culturelles",
        description: "Cérémonies du thé, ateliers cuisine, visites de temples.",
        prix: "À partir de 35€",
        icone: "⛩️",
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

// ── T125 — données admin (validation / suspension) ──
// Vue back-office : liste des agences avec leur statut de modération.
// Utilisée comme fallback quand l'API /api/agences/admin est indisponible.
export const ADMIN_AGENCIES = [
  {
    id: "1",
    nom: "Collectif Alpes Voyages",
    email: "contact@collectif-alpes.fr",
    localisation: "Chamonix, France",
    statut: "approuvee",
    dateDemande: "2024-02-12",
    specialites: ["Montagne", "Ski", "Groupes"],
  },
  {
    id: "2",
    nom: "Sakura Travel",
    email: "contact@sakura-travel.jp",
    localisation: "Tokyo, Japon",
    statut: "approuvee",
    dateDemande: "2024-01-30",
    specialites: ["Japon", "Culture", "Sur-mesure"],
  },
  {
    id: "3",
    nom: "Atlas Évasion",
    email: "hello@atlas-evasion.ma",
    localisation: "Marrakech, Maroc",
    statut: "en_attente",
    dateDemande: "2024-06-10",
    specialites: ["Désert", "Randonnée", "Groupes"],
  },
  {
    id: "4",
    nom: "Nordic Roads",
    email: "booking@nordicroads.no",
    localisation: "Tromsø, Norvège",
    statut: "en_attente",
    dateDemande: "2024-06-14",
    specialites: ["Aurores boréales", "Van", "Aventure"],
  },
  {
    id: "5",
    nom: "Sunset Deals Travel",
    email: "promo@sunset-deals.com",
    localisation: "Inconnue",
    statut: "suspendue",
    dateDemande: "2024-03-01",
    motif: "Avis frauduleux signalés à plusieurs reprises",
    specialites: ["Promotions"],
  },
];

export function getAgenciesForAdmin() {
  // Copie défensive pour ne pas muter la source lors des changements de statut.
  return ADMIN_AGENCIES.map((a) => ({ ...a }));
}
