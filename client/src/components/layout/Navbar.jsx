import { Link, useNavigate, useLocation } from "react-router-dom";
import styles from "./Navbar.module.css";
import { useAuthStore } from "../../store/authStore";

const imgLogo   = "https://www.figma.com/api/mcp/asset/d93104aa-ce16-42fe-b9cd-8bbe43f0929d";
const imgGlobe  = "https://www.figma.com/api/mcp/asset/ce67d7c1-e338-4383-8ae7-5ea7ae0b31e4";
const imgAvatar = "https://www.figma.com/api/mcp/asset/0926e5cc-1f5e-4862-a22b-22daa1cef4d7";

const NAV_LINKS = [
  { label: "Accueil",       to: "/" },
  { label: "Vols",          to: "/vols" },
  { label: "Hébergements",  to: "/hebergements" },
  { label: "Activités",     to: "/activites" },
  { label: "Communauté",    to: "/communaute" },
];

export default function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.logo}>
        <img src={imgLogo} alt="Libertia" className={styles.logoImg} />
        <span className={styles.logoText}>Libertia</span>
      </Link>

      <div className={styles.links}>
        {NAV_LINKS.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className={`${styles.link} ${location.pathname === l.to ? styles.linkActive : ""}`}
          >
            {l.label}
          </Link>
        ))}
      </div>

      <div className={styles.actions}>
        <button className={styles.iconBtn}>
          <img src={imgGlobe} alt="" className={styles.iconBtnImg} />
          FR
        </button>

        {isAuthenticated ? (
          <>
            <div className={styles.avatar} onClick={() => navigate("/profile")}>
              <img src={imgAvatar} alt="Profil" className={styles.avatarImg} />
            </div>
            <button className={styles.btnOutline} onClick={handleLogout}>
              Déconnexion
            </button>
          </>
        ) : (
          <>
            <Link to="/login">
              <button className={styles.btnOutline}>Se connecter</button>
            </Link>
            <Link to="/register">
              <button className={styles.btnPrimary}>S'inscrire</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}