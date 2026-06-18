// =============================================================
// FICHIER  : src/pages/admin/AgencesAdmin.jsx
// TÂCHE    : T125 — [M9] Gestion agences : validation & suspension
//
// Back-office permettant à l'admin de :
//   • valider / rejeter les agences en attente,
//   • suspendre / réactiver les agences approuvées.
// S'appuie sur agencyService (fallback mock si l'API est absente).
// =============================================================

import { useEffect, useMemo, useState } from "react";
import styles from "./AgencesAdmin.module.css";
import AdminNav from "./AdminNav";
import agencyService from "../../services/agency.service";

const STATUTS = {
  en_attente: { label: "En attente", cls: "badgePending" },
  approuvee:  { label: "Approuvée",  cls: "badgeActive" },
  suspendue:  { label: "Suspendue",  cls: "badgeBanned" },
  rejetee:    { label: "Rejetée",    cls: "badgeMuted" },
};

const FILTERS = [
  { id: "tous",       label: "Toutes" },
  { id: "en_attente", label: "En attente" },
  { id: "approuvee",  label: "Approuvées" },
  { id: "suspendue",  label: "Suspendues" },
  { id: "rejetee",    label: "Rejetées" },
];

export default function AgencesAdmin() {
  const [agences, setAgences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("tous");
  const [busyId, setBusyId] = useState(null);

  // Modal de saisie du motif (rejet / suspension)
  const [motifModal, setMotifModal] = useState(null); // { id, action }
  const [motif, setMotif] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      const data = await agencyService.listerToutes();
      if (alive) {
        setAgences(data);
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const counts = useMemo(() => {
    return agences.reduce(
      (acc, a) => { acc[a.statut] = (acc[a.statut] || 0) + 1; return acc; },
      {}
    );
  }, [agences]);

  const filtered = useMemo(
    () => (filter === "tous" ? agences : agences.filter((a) => a.statut === filter)),
    [agences, filter]
  );

  // Met à jour le statut localement après l'appel API
  const patchLocal = (id, changes) =>
    setAgences((prev) => prev.map((a) => (a.id === id ? { ...a, ...changes } : a)));

  const handleValider = async (id) => {
    setBusyId(id);
    try {
      await agencyService.validerAgence(id);
      patchLocal(id, { statut: "approuvee", motif: undefined });
    } catch (e) {
      console.error("Validation échouée", e);
    } finally {
      setBusyId(null);
    }
  };

  const handleReactiver = async (id) => {
    setBusyId(id);
    try {
      await agencyService.reactiverAgence(id);
      patchLocal(id, { statut: "approuvee", motif: undefined });
    } catch (e) {
      console.error("Réactivation échouée", e);
    } finally {
      setBusyId(null);
    }
  };

  const openMotif = (id, action) => { setMotifModal({ id, action }); setMotif(""); };
  const closeMotif = () => { setMotifModal(null); setMotif(""); };

  const confirmMotif = async () => {
    const { id, action } = motifModal;
    setBusyId(id);
    closeMotif();
    try {
      if (action === "rejeter") {
        await agencyService.rejeterAgence(id, motif);
        patchLocal(id, { statut: "rejetee", motif });
      } else {
        await agencyService.suspendreAgence(id, motif);
        patchLocal(id, { statut: "suspendue", motif });
      }
    } catch (e) {
      console.error("Action échouée", e);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.main}>
        <h1 className={styles.pageTitle}>Gestion des agences</h1>
        <p className={styles.pageSub}>
          Validez les nouvelles demandes et gérez les suspensions.
        </p>

        <AdminNav />

        {/* ── Stats ── */}
        <div className={styles.statGrid}>
          <Stat label="En attente" value={counts.en_attente || 0} cls={styles.statOrange} />
          <Stat label="Approuvées" value={counts.approuvee || 0}  cls={styles.statGreen} />
          <Stat label="Suspendues" value={counts.suspendue || 0}  cls={styles.statRed} />
          <Stat label="Rejetées"   value={counts.rejetee || 0}    cls={styles.statMuted} />
        </div>

        {/* ── Filtres ── */}
        <div className={styles.filters}>
          {FILTERS.map((f) => (
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

        {/* ── Tableau ── */}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {["Agence", "Localisation", "Demande", "Statut", "Actions"].map((h) => (
                  <th key={h} className={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td className={styles.td} colSpan={5} style={{ textAlign: "center", color: "#94a3b8" }}>
                    Chargement des agences…
                  </td>
                </tr>
              )}

              {!loading && filtered.map((a) => {
                const st = STATUTS[a.statut] || STATUTS.rejetee;
                return (
                  <tr key={a.id} className={styles.tr}>
                    <td className={styles.td}>
                      <div className={styles.agencyName}>{a.nom}</div>
                      <div className={styles.agencyEmail}>{a.email}</div>
                      {a.motif && (a.statut === "suspendue" || a.statut === "rejetee") && (
                        <div className={styles.motif}>Motif : {a.motif}</div>
                      )}
                    </td>
                    <td className={styles.td}>{a.localisation}</td>
                    <td className={styles.td}>
                      {a.dateDemande
                        ? new Date(a.dateDemande).toLocaleDateString("fr-FR")
                        : "—"}
                    </td>
                    <td className={styles.td}>
                      <span className={`${styles.badge} ${styles[st.cls]}`}>{st.label}</span>
                    </td>
                    <td className={styles.td}>
                      <div className={styles.actions}>
                        {a.statut === "en_attente" && (
                          <>
                            <button
                              className={`${styles.actionBtn} ${styles.btnApprove}`}
                              disabled={busyId === a.id}
                              onClick={() => handleValider(a.id)}
                            >
                              Valider
                            </button>
                            <button
                              className={`${styles.actionBtn} ${styles.btnReject}`}
                              disabled={busyId === a.id}
                              onClick={() => openMotif(a.id, "rejeter")}
                            >
                              Rejeter
                            </button>
                          </>
                        )}
                        {a.statut === "approuvee" && (
                          <button
                            className={`${styles.actionBtn} ${styles.btnReject}`}
                            disabled={busyId === a.id}
                            onClick={() => openMotif(a.id, "suspendre")}
                          >
                            Suspendre
                          </button>
                        )}
                        {a.statut === "suspendue" && (
                          <button
                            className={`${styles.actionBtn} ${styles.btnApprove}`}
                            disabled={busyId === a.id}
                            onClick={() => handleReactiver(a.id)}
                          >
                            Réactiver
                          </button>
                        )}
                        {a.statut === "rejetee" && (
                          <button
                            className={`${styles.actionBtn} ${styles.btnApprove}`}
                            disabled={busyId === a.id}
                            onClick={() => handleValider(a.id)}
                          >
                            Réexaminer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td className={styles.td} colSpan={5} style={{ textAlign: "center", color: "#94a3b8" }}>
                    Aucune agence dans cette catégorie.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal motif (rejet / suspension) ── */}
      {motifModal && (
        <div className={styles.overlay} onClick={closeMotif}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>
              {motifModal.action === "rejeter" ? "Rejeter l'agence" : "Suspendre l'agence"}
            </h2>
            <p className={styles.modalText}>
              Indiquez le motif communiqué à l'agence (optionnel).
            </p>
            <textarea
              className={styles.textarea}
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Ex : informations incomplètes, avis frauduleux…"
              rows={3}
              maxLength={300}
            />
            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={closeMotif}>Annuler</button>
              <button className={styles.modalConfirm} onClick={confirmMotif}>
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, cls }) {
  return (
    <div className={styles.statCard}>
      <span className={styles.statLabel}>{label}</span>
      <span className={`${styles.statNum} ${cls}`}>{value}</span>
    </div>
  );
}
