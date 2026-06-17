// Données factices pour l'historique des paiements (T110).
// Tant que le backend n'expose pas d'endpoint dédié, on affiche
// ces transactions de démonstration.

export const PAYMENTS_SEED = [
  { id: "TXN-1718200000000", date: "2026-06-13", libelle: "Abonnement Premium — Mensuel", montant: 9.99, statut: "réussi", methode: "•••• 4242" },
  { id: "TXN-1715521600000", date: "2026-05-13", libelle: "Abonnement Premium — Mensuel", montant: 9.99, statut: "réussi", methode: "•••• 4242" },
  { id: "TXN-1712929600000", date: "2026-04-13", libelle: "Abonnement Premium — Mensuel", montant: 9.99, statut: "remboursé", methode: "•••• 4242" },
  { id: "TXN-1710251200000", date: "2026-03-12", libelle: "Abonnement Premium — Mensuel", montant: 9.99, statut: "échoué", methode: "•••• 1881" },
  { id: "TXN-1707572800000", date: "2026-02-10", libelle: "Abonnement Premium — Mensuel", montant: 9.99, statut: "réussi", methode: "•••• 4242" },
];

export function getPaymentsHistory() {
  return PAYMENTS_SEED;
}
