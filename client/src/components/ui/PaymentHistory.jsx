// =============================================================
// FICHIER  : src/components/ui/PaymentHistory.jsx
// TÂCHE    : T110 — Historique des paiements (M7)
//
// Tableau des transactions avec filtre par statut et total des
// paiements réussis. Charge les données via paymentService si
// `transactions` n'est pas fourni en prop.
//
// PROPS :
//   - transactions → array { id, date, libelle, montant, statut, methode }
//                    (optionnel ; sinon chargé via paymentService)
// =============================================================

import { useEffect, useMemo, useState } from "react";
import styles from "./PaymentHistory.module.css";
import paymentService from "../../services/payment.service";

const STATUT_FILTERS = [
  { id: "tous", label: "Tous" },
  { id: "réussi", label: "Réussis" },
  { id: "remboursé", label: "Remboursés" },
  { id: "échoué", label: "Échoués" },
];

const STATUT_CLASS = {
  réussi: "statutReussi",
  remboursé: "statutRembourse",
  échoué: "statutEchoue",
};

function formatDate(d) {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return String(d);
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function formatMontant(v) {
  return `${Number(v || 0).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €`;
}

export default function PaymentHistory({ transactions }) {
  // Données chargées via le service (null tant que le fetch n'a pas répondu)
  const [fetched, setFetched] = useState(null);
  const [filter, setFilter] = useState("tous");

  useEffect(() => {
    if (transactions) return undefined;
    let active = true;
    paymentService
      .getHistorique()
      .then((data) => {
        if (active) setFetched(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (active) setFetched([]);
      });
    return () => {
      active = false;
    };
  }, [transactions]);

  const items = useMemo(() => transactions || fetched || [], [transactions, fetched]);
  const loading = !transactions && fetched === null;

  const filtered = useMemo(
    () => (filter === "tous" ? items : items.filter((t) => t.statut === filter)),
    [items, filter]
  );

  const totalReussi = useMemo(
    () => items.filter((t) => t.statut === "réussi").reduce((acc, t) => acc + Number(t.montant || 0), 0),
    [items]
  );

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          {STATUT_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`${styles.filterPill} ${filter === f.id ? styles.filterPillActive : ""}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className={styles.total}>Total payé : {formatMontant(totalReussi)}</span>
      </div>

      {loading ? (
        <p className={styles.empty}>Chargement de l'historique…</p>
      ) : filtered.length === 0 ? (
        <p className={styles.empty}>Aucune transaction à afficher.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              {["Date", "Libellé", "Montant", "Moyen", "Statut"].map((h) => (
                <th key={h} className={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className={styles.tr}>
                <td className={styles.td}>{formatDate(t.date)}</td>
                <td className={styles.td}>{t.libelle}</td>
                <td className={styles.td}>{formatMontant(t.montant)}</td>
                <td className={styles.td}>💳 {t.methode}</td>
                <td className={styles.td}>
                  <span className={`${styles.badge} ${styles[STATUT_CLASS[t.statut]] || ""}`}>
                    {t.statut}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
