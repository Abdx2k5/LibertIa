import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Sidebar.module.css";
import { useAuthStore } from "../../store/authStore";

const imgLogo   = "https://www.figma.com/api/mcp/asset/d93104aa-ce16-42fe-b9cd-8bbe43f0929d";
const imgAvatar = "https://www.figma.com/api/mcp/asset/0926e5cc-1f5e-4862-a22b-22daa1cef4d7";

const NAV_ITEMS = [
  { label: "Assistant IA",  to: "/dashboard",   emoji: "🤖" },
  { label: "Mes Voyages",   to: "/mes-voyages",  emoji: "🗺️" },
  { label: "Profil",        to: "/profile",      emoji: "👤" },
  { label: "Paramètres",    to: "/settings",     emoji: "⚙️" },
];

export default function Sidebar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useAuthStore();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <img src={imgLogo} alt="Libertia" className={styles.logoImg} />
        <span className={styles.logoText}>Libertia</span>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.to}
            className={`${styles.navItem} ${location.pathname === item.to ? styles.navItemActive : ""}`}
            onClick={() => navigate(item.to)}
          >
            <span className={styles.navItemIcon}>{item.emoji}</span>
            {item.label}
          </button>
        ))}

        <div className={styles.divider} />

        <button
          className={styles.navItem}
          onClick={() => { logout(); navigate("/"); }}
        >
          <span className={styles.navItemIcon}>🚪</span>
          Déconnexion
        </button>
      </nav>

      <div className={styles.footer}>
        <div className={styles.userRow} onClick={() => navigate("/profile")}>
          <div className={styles.userAvatar}>
            <img src={imgAvatar} alt="Avatar" className={styles.userAvatarImg} />
          </div>
          <div>
            <div className={styles.userName}>{user?.nom || "Utilisateur"}</div>
            <div className={styles.userEmail}>{user?.email || ""}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}