import { useNavigate, useLocation, Link } from "react-router-dom";
import styles from "./Sidebar.module.css";
import { useAuthStore } from "../../store/authStore";

const imgLogo   = "https://www.figma.com/api/mcp/asset/d93104aa-ce16-42fe-b9cd-8bbe43f0929d";
const imgAvatar = "https://www.figma.com/api/mcp/asset/0926e5cc-1f5e-4862-a22b-22daa1cef4d7";

const svgProps = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" };
const IconBot      = (p) => <svg {...svgProps} {...p}><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>;
const IconMap      = (p) => <svg {...svgProps} {...p}><path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83a1 1 0 0 1-1.447-.894V6.619a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0Z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/></svg>;
const IconUser     = (p) => <svg {...svgProps} {...p}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconSparkles = (p) => <svg {...svgProps} {...p}><path d="m12 3-1.9 5.7a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.7a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>;
const IconSettings = (p) => <svg {...svgProps} {...p}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconLogOut   = (p) => <svg {...svgProps} {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

const NAV_ITEMS = [
  { label: "Assistant IA",  to: "/dashboard",    icon: IconBot },
  { label: "Mes Voyages",   to: "/mes-voyages",  icon: IconMap },
  { label: "Profil",        to: "/profile",      icon: IconUser },
  { label: "Abonnement",    to: "/abonnement",   icon: IconSparkles },
  { label: "Paramètres",    to: "/settings",     icon: IconSettings },
];

export default function Sidebar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useAuthStore();

  return (
    <aside className={styles.sidebar}>
      <Link to="/" className={styles.logo}>
        <img src={imgLogo} alt="Libertia" className={styles.logoImg} />
        <span className={styles.logoText}>Libertia</span>
      </Link>

      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.to}
            className={`${styles.navItem} ${location.pathname === item.to ? styles.navItemActive : ""}`}
            onClick={() => navigate(item.to)}
          >
            <span className={styles.navItemIcon}><item.icon /></span>
            {item.label}
          </button>
        ))}

        <div className={styles.divider} />

        <button
          className={styles.navItem}
          onClick={() => { logout(); navigate("/"); }}
        >
          <span className={styles.navItemIcon}><IconLogOut /></span>
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