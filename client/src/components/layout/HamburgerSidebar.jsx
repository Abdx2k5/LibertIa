import { Link, useNavigate } from "react-router-dom";
import styles from "./HamburgerSidebar.module.css";
import { useUIStore } from "../../store/uiStore";
import { ROUTES } from "../../utils/constants";

const imgLogo = "https://www.figma.com/api/mcp/asset/d93104aa-ce16-42fe-b9cd-8bbe43f0929d";

const navSvgProps = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" };
const IconHome      = (p) => <svg {...navSvgProps} {...p}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconMap       = (p) => <svg {...navSvgProps} {...p}><path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83a1 1 0 0 1-1.447-.894V6.619a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0Z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/></svg>;
const IconUsers     = (p) => <svg {...navSvgProps} {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconUser      = (p) => <svg {...navSvgProps} {...p}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconSettings  = (p) => <svg {...navSvgProps} {...p}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;

const NAV_ITEMS = [
  { label: "Accueil",      to: ROUTES.DASHBOARD, icon: IconHome },
  { label: "Mes voyages",  to: ROUTES.MY_TRIPS,  icon: IconMap },
  { label: "Communauté",   to: ROUTES.COMMUNITY, icon: IconUsers },
  { label: "Profil",       to: ROUTES.PROFILE,   icon: IconUser },
  { label: "Paramètres",   to: ROUTES.SETTINGS,  icon: IconSettings },
];

export default function HamburgerSidebar() {
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const navigate = useNavigate();

  const close = () => setSidebarOpen(false);

  const handleNavClick = (to) => {
    close();
    navigate(to);
  };

  return (
    <>
      <div
        className={`${styles.overlay} ${sidebarOpen ? styles.overlayOpen : ""}`}
        onClick={close}
        aria-hidden="true"
      />
      <aside className={`${styles.panel} ${sidebarOpen ? styles.panelOpen : ""}`}>
        <Link to="/" className={styles.logo} onClick={close}>
          <img src={imgLogo} alt="Libertia" className={styles.logoImg} />
          <span className={styles.logoText}>Libertia</span>
        </Link>

        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.to}
              type="button"
              className={styles.navItem}
              onClick={() => handleNavClick(item.to)}
            >
              <item.icon />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}
