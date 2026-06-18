// =============================================================
// FICHIER  : src/mocks/signalementData.js
// TÂCHE    : T123 — Modération contenus signalements (M9)
//
// Données factices pour le back-office de modération. Servent de
// fallback quand l'API /api/signalements est indisponible.
//
// Les motifs ("reason") sont alignés sur ReportModal (T69).
// =============================================================

export const SIGNALEMENTS = [
  {
    id: "sig-1",
    cibleType: "publication",
    contenu:
      "🔥 PROMO CHOC -90% sur tous les vols ! Cliquez vite : bit.ly/voyage-pas-cher 🔥",
    auteur: { id: "u-21", nom: "Deals Express" },
    reason: "spam",
    details: "Lien suspect partagé en boucle sur plusieurs forums.",
    signalePar: "Marie Dupont",
    date: "2024-06-16T09:24:00Z",
    statut: "en_attente",
  },
  {
    id: "sig-2",
    cibleType: "commentaire",
    contenu:
      "Franchement t'es nul, personne veut de tes conseils de voyage à deux balles.",
    auteur: { id: "u-44", nom: "TrollDuNet" },
    reason: "harcelement",
    details: "Insultes répétées envers un autre membre.",
    signalePar: "Jean Martin",
    date: "2024-06-16T14:02:00Z",
    statut: "en_attente",
  },
  {
    id: "sig-3",
    cibleType: "avis",
    contenu:
      "Cette agence est une arnaque totale, ils ont pris mon argent et jamais de billets. NE RÉSERVEZ PAS.",
    auteur: { id: "u-77", nom: "Anonyme123" },
    reason: "faux",
    details: "Concurrent présumé, avis non vérifié.",
    signalePar: "Sakura Travel",
    date: "2024-06-15T18:45:00Z",
    statut: "en_attente",
  },
  {
    id: "sig-4",
    cibleType: "publication",
    contenu: "Photos de mon trek au Népal 🏔️ — un rêve devenu réalité !",
    auteur: { id: "u-09", nom: "Nora Haddad" },
    reason: "inapproprie",
    details: "Signalement probablement abusif, contenu sain.",
    signalePar: "Lucas Bernard",
    date: "2024-06-14T11:10:00Z",
    statut: "traite",
    decision: "conserve",
  },
  {
    id: "sig-5",
    cibleType: "commentaire",
    contenu: "Envoyez-moi 200€ et je vous donne mon code parrainage premium gratuit à vie.",
    auteur: { id: "u-88", nom: "FastMoney" },
    reason: "arnaque",
    details: "",
    signalePar: "Sara El Amrani",
    date: "2024-06-13T08:30:00Z",
    statut: "traite",
    decision: "supprime",
  },
];

export function getSignalements() {
  // Copie défensive : les actions de modération modifient le statut local.
  return SIGNALEMENTS.map((s) => ({ ...s }));
}
