// =============================================================
// FICHIER  : src/pages/admin/ModerationAdmin.jsx
// TÂCHE    : T123 — [M9] Modération des contenus signalés
//
// File de modération : l'admin examine les signalements
// (publications, commentaires, avis) et décide :
//   • Conserver  → contenu conforme,
//   • Supprimer  → retire le contenu signalé,
//   • Rejeter    → signalement abusif / non fondé,
//   • Bannir     → exclut l'auteur du contenu.
// S'appuie sur moderationService (fallback mock).
// =============================================================

import { useEffect, useMemo, useState } from "react";
import styles from "./ModerationAdmin.module.css";
import AdminNav from "./AdminNav";
import moderationService from "../../services/moderation.service";

// Aligné sur les motifs de ReportModal (T69)
const REASONS = {
  spam:        { label: "Spam / publicité",   icon: "🚫" },
  harcelement: { label: "Harcèlement",        icon: "⚠️" },
  faux:        { label: "Fausse information", icon: "❌" },
  inapproprie: { label: "Inapproprié",        icon: "🔞" },
  arnaque:     { label: "Arnaque / fraude",   icon: "🎣" },
  autre:       { label: "Autre",              icon: "✏️" },
};

const STATUS_FILTERS = [
  { id: "en_attente", label: "À traiter" },
  { id: "traite",     label: "Traités" },
  { id: "tous",       label: "Tous" },
];

const DECISIONS = {
  conserve: { label: "Conservé",  cls: "decKeep" },
  supprime: { label: "Supprimé",  cls: "decDelete" },
  rejete:   { label: "Signalement rejeté", cls: "decMuted" },
  banni:    { label: "Auteur banni", cls: "decDelete" },
};

export default function ModerationAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("en_attente");
  const [reasonFilter, setReasonFilter] = useState("tous");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const data = await moderationService.listerSignalements();
      if (alive) {
        setItems(data);
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const pendingCount = useMemo(
    () => items.filter((s) => s.statut === "en_attente").length,
    [items]
  );

  const filtered = useMemo(() => {
    return items.filter((s) => {
      const matchStatus = status === "tous" || s.statut === status;
      const matchReason = reasonFilter === "tous" || s.reason === reasonFilter;
      return matchStatus && matchReason;
    });
  }, [items, status, reasonFilter]);

  const patchLocal = (id, changes) =>
    setItems((prev) => prev.map((s) => (s.id === id ? { ...s, ...changes } : s)));

  const runAction = async (sig, action) => {
    setBusyId(sig.id);
    try {
      if (action === "conserve") {
        await moderationService.conserverContenu(sig.id);
        patchLocal(sig.id, { statut: "traite", decision: "conserve" });
      } else if (action === "supprime") {
        await moderationService.supprimerContenu(sig.id);
        patchLocal(sig.id, { statut: "traite", decision: "supprime" });
      } else if (action === "rejete") {
        await moderationService.rejeterSignalement(sig.id);
        patchLocal(sig.id, { statut: "traite", decision: "rejete" });
      } else if (action === "banni") {
        await moderationService.bannirAuteur(sig.auteur?.id, `Signalement ${sig.id}`);
        patchLocal(sig.id, { statut: "traite", decision: "banni" });
      }
    } catch (e) {
      console.error("Action de modération échouée", e);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.main}>
        <h1 className={styles.pageTitle}>Modération des contenus</h1>
        <p className={styles.pageSub}>
          {pendingCount > 0
            ? `${pendingCount} signalement${pendingCount > 1 ? "s" : ""} en attente de traitement.`
            : "Aucun signalement en attente. 🎉"}
        </p>

        <AdminNav />

        {/* ── Filtres statut ── */}
        <div className={styles.filters}>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`${styles.filterPill} ${status === f.id ? styles.filterPillActive : ""}`}
              onClick={() => setStatus(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ── Filtres motif ── */}
        <div className={styles.reasonFilters}>
          <button
            type="button"
            className={`${styles.reasonChip} ${reasonFilter === "tous" ? styles.reasonChipActive : ""}`}
            onClick={() => setReasonFilter("tous")}
          >
            Tous les motifs
          </button>
          {Object.entries(REASONS).map(([id, r]) => (
            <button
              key={id}
              type="button"
              className={`${styles.reasonChip} ${reasonFilter === id ? styles.reasonChipActive : ""}`}
              onClick={() => setReasonFilter(id)}
            >
              <span>{r.icon}</span> {r.label}
            </button>
          ))}
        </div>

        {/* ── Liste ── */}
        {loading && <p className={styles.empty}>Chargement des signalements…</p>}

        {!loading && filtered.length === 0 && (
          <p className={styles.empty}>Aucun signalement ne correspond à ces filtres.</p>
        )}

        <div className={styles.list}>
          {!loading && filtered.map((sig) => {
            const r = REASONS[sig.reason] || REASONS.autre;
            const traite = sig.statut === "traite";
            const dec = traite ? DECISIONS[sig.decision] : null;

            return (
              <article key={sig.id} className={styles.card}>
                <header className={styles.cardHead}>
                  <span className={styles.reasonBadge}>
                    {r.icon} {r.label}
                  </span>
                  <span className={styles.targetType}>{sig.cibleType}</span>
                  {dec && (
                    <span className={`${styles.decisionBadge} ${styles[dec.cls]}`}>
                      {dec.label}
                    </span>
                  )}
                  <span className={styles.date}>
                    {new Date(sig.date).toLocaleDateString("fr-FR", {
                      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                </header>

                <blockquote className={styles.content}>"{sig.contenu}"</blockquote>

                <div className={styles.meta}>
                  <span>Auteur : <strong>{sig.auteur?.nom || "Inconnu"}</strong></span>
                  <span>Signalé par : <strong>{sig.signalePar}</strong></span>
                </div>

                {sig.details && (
                  <p className={styles.details}>📝 {sig.details}</p>
                )}

                {!traite && (
                  <div className={styles.actions}>
                    <button
                      className={`${styles.actionBtn} ${styles.btnKeep}`}
                      disabled={busyId === sig.id}
                      onClick={() => runAction(sig, "conserve")}
                    >
                      Conserver
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.btnReject}`}
                      disabled={busyId === sig.id}
                      onClick={() => runAction(sig, "rejete")}
                    >
                      Rejeter le signalement
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.btnDelete}`}
                      disabled={busyId === sig.id}
                      onClick={() => runAction(sig, "supprime")}
                    >
                      Supprimer le contenu
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.btnBan}`}
                      disabled={busyId === sig.id}
                      onClick={() => runAction(sig, "banni")}
                    >
                      Bannir l'auteur
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
