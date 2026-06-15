// Données factices pour la page "Forums" (T60 — Community discussions).
// Tant que le backend n'expose pas de modèle "Discussion", on affiche
// ces sujets statiques via /forums.

export const FORUM_CATEGORIES = [
  { id: "tous",        label: "Tous les sujets", icon: "💬" },
  { id: "destinations", label: "Destinations",   icon: "🌍" },
  { id: "conseils",    label: "Conseils & astuces", icon: "💡" },
  { id: "budget",      label: "Budget",          icon: "💰" },
  { id: "solo",        label: "Voyage solo",     icon: "🎒" },
  { id: "famille",     label: "Famille",         icon: "👨‍👩‍👧" },
  { id: "ia",          label: "Assistant IA",    icon: "🤖" },
];

export const FORUM_SORTS = [
  { id: "recent",     label: "Récents" },
  { id: "populaire",  label: "Populaires" },
  { id: "sans_reponse", label: "Sans réponse" },
];

// derniereActiviteTs : timestamp relatif (minutes écoulées) pour le tri "Récents".
export const FORUM_THREADS = [
  {
    id: "1",
    titre: "Itinéraire de 10 jours au Japon : vos incontournables ?",
    extrait: "Je prépare mon premier voyage à Tokyo + Kyoto en octobre. Quels quartiers privilégier et faut-il réserver le JR Pass à l'avance ?",
    auteur: { nom: "Sophie Martin", badge: "Guide certifié" },
    categorie: "destinations",
    tags: ["#Japon", "#itinéraire", "#JRPass"],
    reponses: 42,
    vues: 1280,
    votes: 96,
    derniereActivite: "il y a 12 min",
    derniereActiviteTs: 12,
    epingle: true,
    populaire: true,
    resolu: false,
  },
  {
    id: "2",
    titre: "Comment l'IA Libertia gère-t-elle les vols avec escales ?",
    extrait: "J'ai remarqué que l'assistant propose parfois des escales très longues. Y a-t-il un moyen de prioriser les vols directs dans le prompt ?",
    auteur: { nom: "Thomas R.", badge: "Explorateur" },
    categorie: "ia",
    tags: ["#IA", "#vols", "#prompt"],
    reponses: 0,
    vues: 134,
    votes: 8,
    derniereActivite: "il y a 35 min",
    derniereActiviteTs: 35,
    epingle: false,
    populaire: false,
    resolu: false,
  },
  {
    id: "3",
    titre: "Voyager en solo à Lisbonne : sécurité et bons quartiers",
    extrait: "Première fois en solo, je cherche des quartiers calmes mais animés le soir. Des retours d'expérience récents ?",
    auteur: { nom: "Mehdi El Amrani", badge: "Membre actif" },
    categorie: "solo",
    tags: ["#Portugal", "#solo", "#sécurité"],
    reponses: 21,
    vues: 540,
    votes: 37,
    derniereActivite: "il y a 2 h",
    derniereActiviteTs: 120,
    epingle: false,
    populaire: true,
    resolu: true,
  },
  {
    id: "4",
    titre: "Budget Bali 2 semaines : mon récap détaillé (poste par poste)",
    extrait: "Je partage mon budget complet pour 14 jours à Bali, des logements aux scooters. Spoiler : moins cher que prévu !",
    auteur: { nom: "Nina Laurent", badge: "Rédactrice voyage" },
    categorie: "budget",
    tags: ["#Bali", "#budget", "#récap"],
    reponses: 66,
    vues: 2310,
    votes: 188,
    derniereActivite: "il y a 4 h",
    derniereActiviteTs: 240,
    epingle: false,
    populaire: true,
    resolu: false,
  },
  {
    id: "5",
    titre: "Astuces pour voyager léger avec un seul bagage cabine",
    extrait: "Après 3 ans en sac à dos, voici ma checklist minimaliste et les erreurs à éviter pour ne jamais enregistrer de valise.",
    auteur: { nom: "Clara Benali", badge: "Guide certifié" },
    categorie: "conseils",
    tags: ["#packing", "#cabine", "#minimalisme"],
    reponses: 18,
    vues: 870,
    votes: 54,
    derniereActivite: "hier",
    derniereActiviteTs: 1440,
    epingle: false,
    populaire: false,
    resolu: false,
  },
  {
    id: "6",
    titre: "Roadtrip en famille dans les Alpes : étapes adaptées aux enfants",
    extrait: "On part 8 jours avec deux enfants (4 et 7 ans). Je cherche des étapes pas trop longues et des activités sympas en chemin.",
    auteur: { nom: "Collectif Alpes", badge: "Groupe vérifié" },
    categorie: "famille",
    tags: ["#famille", "#roadtrip", "#alpes"],
    reponses: 9,
    vues: 312,
    votes: 14,
    derniereActivite: "hier",
    derniereActiviteTs: 1500,
    epingle: false,
    populaire: false,
    resolu: false,
  },
  {
    id: "7",
    titre: "Quelle est la meilleure période pour Marrakech ?",
    extrait: "J'hésite entre avril et octobre. La chaleur de l'été me fait un peu peur. Vos conseils sur la météo et l'affluence ?",
    auteur: { nom: "Yanis K.", badge: "Nouveau membre" },
    categorie: "destinations",
    tags: ["#Maroc", "#météo", "#saison"],
    reponses: 0,
    vues: 76,
    votes: 3,
    derniereActivite: "il y a 1 jour",
    derniereActiviteTs: 1600,
    epingle: false,
    populaire: false,
    resolu: false,
  },
];

export const FORUM_STATS = [
  { label: "Discussions", value: "3 892" },
  { label: "Messages", value: "48 210" },
  { label: "Membres actifs", value: "12 458" },
];

export const TOP_CONTRIBUTORS = [
  { nom: "Sophie Martin", info: "Guide certifié", messages: 1240 },
  { nom: "Nina Laurent", info: "Rédactrice voyage", messages: 980 },
  { nom: "Clara Benali", info: "Guide certifié", messages: 745 },
];

export function getAllThreads() {
  return FORUM_THREADS;
}
