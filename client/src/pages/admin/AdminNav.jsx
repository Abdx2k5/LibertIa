// =============================================================
// FICHIER  : src/pages/admin/AdminNav.jsx
// TÂCHE    : T123 / T125 — navigation back-office (M9)
//
// Barre d'onglets partagée entre les pages admin
// (Panel utilisateurs, Agences, Modération).
// =============================================================

import { NavLink } from "react-router-dom";
import { ROUTES } from "../../utils/constants";
import styles from "./AdminNav.module.css";

const TABS = [
  { to: ROUTES.ADMIN,            label: "Tableau de bord", emoji: "📊", end: true },
  { to: ROUTES.ADMIN_AGENCIES,   label: "Agences",         emoji: "🏢" },
  { to: ROUTES.ADMIN_MODERATION, label: "Modération",      emoji: "🛡️" },
];

export default function AdminNav() {
  return (
    <nav className={styles.tabs}>
      {TABS.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.end}
          className={({ isActive }) =>
            `${styles.tab} ${isActive ? styles.tabActive : ""}`
          }
        >
          <span className={styles.tabIcon}>{t.emoji}</span>
          {t.label}
        </NavLink>
      ))}
    </nav>
  );
}
