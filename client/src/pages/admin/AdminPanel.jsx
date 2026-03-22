import { useState } from "react";
import styles from "./AdminPanel.module.css";

const KPI_DATA = [
  { label: "Utilisateurs",       num: "1,248", delta: "+12%", cls: styles.kpiCyan   },
  { label: "Voyages générés",    num: "5,842", delta: "+28%", cls: styles.kpiViolet },
  { label: "Prompts ce mois",    num: "12.4k", delta: "+34%", cls: styles.kpiGreen  },
  { label: "Signalements",       num: "7",     delta: "-2",   cls: styles.kpiOrange },
];

const USERS = [
  { id: 1, nom: "Marie Dupont",   email: "marie@email.com",  role: "premium", statut: "actif",    voyages: 12 },
  { id: 2, nom: "Jean Martin",    email: "jean@email.com",   role: "free",    statut: "actif",    voyages: 3  },
  { id: 3, nom: "Sara El Amrani", email: "sara@email.com",   role: "free",    statut: "suspendu", voyages: 1  },
];

const BADGE_MAP = {
  actif:    styles.badgeActive,
  suspendu: styles.badgePending,
  banni:    styles.badgeBanned,
};

export default function AdminPanel() {
  const [search, setSearch] = useState("");

  const filtered = USERS.filter(
    (u) => u.nom.toLowerCase().includes(search.toLowerCase()) ||
           u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <div className={styles.main}>
        <h1 className={styles.pageTitle}>Panel Admin</h1>
        <p className={styles.pageSub}>Vue d'ensemble de la plateforme LibertIA.</p>

        {/* KPI */}
        <div className={styles.kpiGrid}>
          {KPI_DATA.map((k) => (
            <div key={k.label} className={styles.kpiCard}>
              <span className={styles.kpiLabel}>{k.label}</span>
              <span className={`${styles.kpiNum} ${k.cls}`}>{k.num}</span>
              <span className={styles.kpiDelta}>{k.delta} ce mois</span>
            </div>
          ))}
        </div>

        {/* Table utilisateurs */}
        <div className={styles.tableWrap}>
          <div className={styles.tableHeader}>
            <h2 className={styles.tableTitle}>Utilisateurs</h2>
            <input
              style={{ background: "#0f1724", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "8px 14px", fontSize: 13, color: "#e7f0ff", outline: "none" }}
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                {["Nom", "Email", "Rôle", "Voyages", "Statut", "Actions"].map((h) => (
                  <th key={h} className={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className={styles.tr}>
                  <td className={styles.td}>{u.nom}</td>
                  <td className={styles.td}>{u.email}</td>
                  <td className={styles.td}>
                    <span className={`${styles.badge} ${u.role === "premium" ? styles.badgeActive : styles.badgePending}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className={styles.td}>{u.voyages}</td>
                  <td className={styles.td}>
                    <span className={`${styles.badge} ${BADGE_MAP[u.statut]}`}>{u.statut}</span>
                  </td>
                  <td className={styles.td}>
                    <button className={styles.actionBtn}>Voir</button>
                    <button className={styles.actionBtn}>Suspendre</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}