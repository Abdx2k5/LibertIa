import { useState, useEffect } from "react";
import styles from "./AdminPanel.module.css";
import api from "../../services/api";

export default function AdminPanel() {
  const [stats, setStats]   = useState(null);
  const [users, setUsers]   = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get("/api/admin/stats"),
      api.get("/api/admin/users?limit=50"),
    ]).then(([statsRes, usersRes]) => {
      const s = statsRes.data?.data || statsRes.data;
      setStats(s);
      setUsers(usersRes.data?.data || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const action = async (endpoint, userId, label) => {
    if (!confirm(`Confirmer : ${label} ?`)) return;
    setActionLoading(userId + label);
    try {
      await api.patch(endpoint);
      fetchData();
    } catch (err) {
      alert("Erreur : " + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(null);
    }
  };

  const supprimer = async (userId, nom) => {
    if (!confirm(`Supprimer définitivement ${nom} et tous ses voyages ?`)) return;
    setActionLoading(userId + "sup");
    try {
      await api.delete(`/api/admin/users/${userId}`);
      fetchData();
    } catch (err) {
      alert("Erreur : " + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = users.filter(u =>
    u.nom?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const KPI = stats ? [
    { label:"Utilisateurs",    num: stats.totalUsers     ?? "—", delta:`+${stats.newUsers30j ?? 0} ce mois`,    cls: styles.kpiCyan   },
    { label:"Voyages générés", num: stats.totalVoyages   ?? "—", delta:`+${stats.newVoyages30j ?? 0} ce mois`,  cls: styles.kpiViolet },
    { label:"Premium",         num: stats.totalPremium   ?? "—", delta:"abonnements actifs",                    cls: styles.kpiGreen  },
    { label:"Signalements",    num: stats.signalements   ?? "—", delta:"en attente",                            cls: styles.kpiOrange },
  ] : Array(4).fill({ label:"…", num:"…", delta:"", cls:"" });

  return (
    <div className={styles.page}>
      <div className={styles.main}>
        <h1 className={styles.pageTitle}>Panel Admin</h1>
        <p className={styles.pageSub}>Vue d'ensemble de la plateforme LibertIa.</p>

        {/* KPI */}
        <div className={styles.kpiGrid}>
          {KPI.map((k, i) => (
            <div key={i} className={styles.kpiCard}>
              <span className={styles.kpiLabel}>{k.label}</span>
              <span className={`${styles.kpiNum} ${k.cls}`}>{k.num}</span>
              <span className={styles.kpiDelta}>{k.delta}</span>
            </div>
          ))}
        </div>

        {/* Top destinations */}
        {stats?.topDestinations?.length > 0 && (
          <div className={styles.tableWrap} style={{ marginBottom:24 }}>
            <div className={styles.tableHeader}>
              <h2 className={styles.tableTitle}>🌍 Top destinations</h2>
            </div>
            <table className={styles.table}>
              <thead><tr>
                <th className={styles.th}>Destination</th>
                <th className={styles.th}>Voyages</th>
              </tr></thead>
              <tbody>
                {stats.topDestinations.map((d, i) => (
                  <tr key={i} className={styles.tr}>
                    <td className={styles.td}>{d.destination || "—"}</td>
                    <td className={styles.td}>{d.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Utilisateurs */}
        <div className={styles.tableWrap}>
          <div className={styles.tableHeader}>
            <h2 className={styles.tableTitle}>👥 Utilisateurs</h2>
            <input
              style={{ background:"var(--bg-input)", border:"1px solid var(--border)", borderRadius:6, padding:"8px 14px", fontSize:13, color:"#e7f0ff", outline:"none" }}
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div style={{ padding:40, textAlign:"center", color:"#a1a1aa" }}>Chargement...</div>
          ) : (
            <table className={styles.table}>
              <thead><tr>
                {["Nom", "Email", "Abonnement", "Prompts", "Statut", "Actions"].map(h => (
                  <th key={h} className={styles.th}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u._id} className={styles.tr}>
                    <td className={styles.td}>{u.nom || "—"}</td>
                    <td className={styles.td} style={{ fontSize:12 }}>{u.email}</td>
                    <td className={styles.td}>
                      <span className={`${styles.badge} ${u.abonnement === "premium" ? styles.badgeActive : styles.badgePending}`}>
                        {u.abonnement || "free"}
                      </span>
                    </td>
                    <td className={styles.td}>{u.promptsUtilises ?? 0}</td>
                    <td className={styles.td}>
                      <span className={`${styles.badge} ${u.isActive ? styles.badgeActive : styles.badgeBanned}`}>
                        {u.isActive ? "actif" : "suspendu"}
                      </span>
                    </td>
                    <td className={styles.td}>
                      <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                        {/* Suspendre / Réactiver */}
                        <button className={styles.actionBtn}
                          disabled={!!actionLoading}
                          onClick={() => action(`/api/admin/users/${u._id}/suspendre`, u._id, u.isActive ? "Suspendre" : "Réactiver")}
                          style={{ color: u.isActive ? "#f97316" : "#4ade80" }}>
                          {u.isActive ? "Suspendre" : "Réactiver"}
                        </button>

                        {/* Premium / Free */}
                        <button className={styles.actionBtn}
                          disabled={!!actionLoading}
                          onClick={() => action(`/api/admin/users/${u._id}/premium`, u._id, u.abonnement === "premium" ? "Retirer Premium" : "Donner Premium")}
                          style={{ color: u.abonnement === "premium" ? "#a1a1aa" : "#8b5cf6" }}>
                          {u.abonnement === "premium" ? "Retirer Premium" : "⭐ Premium"}
                        </button>

                        {/* Supprimer */}
                        <button className={styles.actionBtn}
                          disabled={!!actionLoading}
                          onClick={() => supprimer(u._id, u.nom)}
                          style={{ color:"#ef4444" }}>
                          🗑️ Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}