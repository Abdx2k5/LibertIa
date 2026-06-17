import { useMemo, useState } from "react";
import styles from "./AdminPanel.module.css";

const KPI_DATA = [
  { label: "Utilisateurs",       num: "1,248", delta: "+12%", cls: styles.kpiCyan   },
  { label: "Voyages générés",    num: "5,842", delta: "+28%", cls: styles.kpiViolet },
  { label: "Prompts ce mois",    num: "12.4k", delta: "+34%", cls: styles.kpiGreen  },
  { label: "Signalements",       num: "7",     delta: "-2",   cls: styles.kpiOrange },
];

const SEED_USERS = [
  { id: 1, nom: "Marie Dupont",   email: "marie@email.com",  role: "premium", statut: "actif",    voyages: 12 },
  { id: 2, nom: "Jean Martin",    email: "jean@email.com",   role: "free",    statut: "actif",    voyages: 3  },
  { id: 3, nom: "Sara El Amrani", email: "sara@email.com",   role: "free",    statut: "suspendu", voyages: 1  },
  { id: 4, nom: "Admin Libertia", email: "admin@libertia.fr", role: "admin",  statut: "actif",    voyages: 0  },
  { id: 5, nom: "Lucas Bernard",  email: "lucas@email.com",  role: "premium", statut: "banni",    voyages: 8  },
  { id: 6, nom: "Nora Haddad",    email: "nora@email.com",   role: "free",    statut: "actif",    voyages: 5  },
];

const BADGE_MAP = {
  actif:    styles.badgeActive,
  suspendu: styles.badgePending,
  banni:    styles.badgeBanned,
};

const ROLE_FILTERS = ["Tous", "admin", "premium", "free"];
const STATUT_FILTERS = ["Tous", "actif", "suspendu", "banni"];
const SORT_OPTIONS = [
  { id: "nom", label: "Nom A→Z" },
  { id: "voyages", label: "+ de voyages" },
];

export default function AdminPanel() {
  const [users, setUsers] = useState(SEED_USERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("Tous");
  const [statutFilter, setStatutFilter] = useState("Tous");
  const [sortId, setSortId] = useState("nom");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const result = users.filter((u) => {
      const matchSearch =
        !q || u.nom.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchRole = roleFilter === "Tous" || u.role === roleFilter;
      const matchStatut = statutFilter === "Tous" || u.statut === statutFilter;
      return matchSearch && matchRole && matchStatut;
    });

    result.sort((a, b) =>
      sortId === "voyages" ? b.voyages - a.voyages : a.nom.localeCompare(b.nom, "fr")
    );
    return result;
  }, [users, search, roleFilter, statutFilter, sortId]);

  const toggleSuspend = (id) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, statut: u.statut === "suspendu" ? "actif" : "suspendu" } : u
      )
    );
  };

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

          {/* T121 — filtres rôle / statut + tri */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", padding: "0 4px 14px" }}>
            <FilterGroup label="Rôle" options={ROLE_FILTERS} value={roleFilter} onChange={setRoleFilter} />
            <FilterGroup label="Statut" options={STATUT_FILTERS} value={statutFilter} onChange={setStatutFilter} />
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto", fontSize: 13, color: "#94a3b8" }}>
              Trier par
              <select
                value={sortId}
                onChange={(e) => setSortId(e.target.value)}
                style={{ background: "#0f1724", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "7px 10px", fontSize: 13, color: "#e7f0ff", outline: "none" }}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
            </label>
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
                    <button className={styles.actionBtn} onClick={() => toggleSuspend(u.id)}>
                      {u.statut === "suspendu" ? "Réactiver" : "Suspendre"}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className={styles.td} colSpan={6} style={{ textAlign: "center", color: "#94a3b8" }}>
                    Aucun utilisateur ne correspond aux filtres.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

// T121 — groupe de pills de filtre réutilisable (rôle / statut)
function FilterGroup({ label, options, value, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <span style={{ fontSize: 13, color: "#94a3b8" }}>{label} :</span>
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            style={{
              border: active ? "1px solid rgba(170,59,255,0.45)" : "1px solid rgba(255,255,255,0.08)",
              background: active ? "rgba(170,59,255,0.15)" : "rgba(255,255,255,0.03)",
              color: active ? "#f3f4f6" : "#a1a1aa",
              borderRadius: 999,
              padding: "5px 12px",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "inherit",
              textTransform: "capitalize",
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}