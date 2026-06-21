import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import styles from "./AppNavbar.module.css";
import { useAuthStore } from "../../store/authStore";
import { useUiStore, useUIStore } from "../../store/uiStore";
import { useTranslation } from "../../hooks/useTranslation";
import { ROUTES } from "../../utils/constants";
import { NotificationBell } from "../ui";
import HamburgerSidebar from "./HamburgerSidebar";
import imgLogo from "../../assets/logos/logo.png";
import imgAvatar from "../../assets/images/community/avatar.png";
import iconMoonDark from "../../assets/icons/icon-dark-mode.png";
import iconMoonLight from "../../assets/icons/icon-dark-mode-light.png";
import iconGlobeDark from "../../assets/icons/icon-globe.png";
import iconGlobeLight from "../../assets/icons/icon-globe-light.png";

const menuSvgProps = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" };
const IconMenu        = (p) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>;
const IconUser         = (p) => <svg {...menuSvgProps} {...p}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconSettingsGear = (p) => <svg {...menuSvgProps} {...p}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconCreditCard   = (p) => <svg {...menuSvgProps} {...p}><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;
const IconLogOut       = (p) => <svg {...menuSvgProps} {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IconInstagram    = (p) => <svg {...menuSvgProps} {...p}><rect width="20" height="20" x="2" y="2" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>;
const IconTwitter      = (p) => <svg {...menuSvgProps} {...p}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5 1.8 9.1 2 6c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>;
const IconFacebook     = (p) => <svg {...menuSvgProps} {...p}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
const IconMessageCircle = (p) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>;

const NAV_LINKS = [
  { key: "navHome",       filter: null },
  { key: "navFlights",    filter: "vol" },
  { key: "navHotels",     filter: "hotel" },
  { key: "navActivities", filter: "activ" },
  { key: "navCommunity",  filter: null, to: ROUTES.COMMUNITY },
];

// ── Barre de navigation persistante des pages connectées ──
// (logo, liens, thème, langue, notifications, menu profil + accès au tiroir HamburgerSidebar)
export default function AppNavbar({ onFilterSelect }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useUiStore();
  const { toggleSidebar } = useUIStore();
  const { t, language, toggleLanguage } = useTranslation();
  const { user, logout } = useAuthStore();

  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const avatarMenuRef = useRef(null);

  useEffect(() => {
    if (!avatarMenuOpen) return undefined;
    const onClickOutside = (e) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target)) setAvatarMenuOpen(false);
    };
    const onKey = (e) => { if (e.key === "Escape") setAvatarMenuOpen(false); };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [avatarMenuOpen]);

  const handleLogout = () => {
    setAvatarMenuOpen(false);
    logout();
    navigate(ROUTES.HOME);
  };

  const handleNavClick = (item) => {
    if (item.to) { navigate(item.to); return; }
    if (item.filter === null) { navigate(ROUTES.DASHBOARD); return; }
    if (location.pathname === ROUTES.DASHBOARD && onFilterSelect) {
      onFilterSelect(item.filter);
    } else {
      navigate(ROUTES.DASHBOARD, { state: { filter: item.filter } });
    }
  };

  return (
    <>
      <HamburgerSidebar />
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          <button type="button" className={styles.hamburgerBtn} onClick={toggleSidebar} aria-label="Ouvrir le menu">
            <IconMenu />
          </button>
          <Link to={ROUTES.DASHBOARD} className={styles.navLogo}>
            <img src={imgLogo} alt="Libertia" className={styles.navLogoImg} />
            <span className={styles.navLogoText}>Libertia</span>
          </Link>
        </div>

        <div className={styles.navLinks}>
          {NAV_LINKS.map((item) => (
            <button key={item.key} type="button" className={styles.navLink} onClick={() => handleNavClick(item)}>
              {t(item.key)}
            </button>
          ))}
        </div>

        <div className={styles.navRight}>
          <button type="button" className={styles.navIconBtn} onClick={toggleTheme} aria-label="Changer de thème">
            <img src={theme === "dark" ? iconMoonDark : iconMoonLight} alt="" className={styles.navIconImg} />
          </button>
          <button type="button" className={styles.navIconBtn} onClick={toggleLanguage} aria-label="Changer de langue">
            <img src={theme === "dark" ? iconGlobeDark : iconGlobeLight} alt="" className={styles.navIconImg} />{language.toUpperCase()}
          </button>
          <NotificationBell />
          <button type="button" className={styles.navIconBtn} onClick={() => navigate(ROUTES.MESSAGES)} aria-label="Messages">
            <IconMessageCircle />
          </button>

          <div className={styles.avatarMenuWrap} ref={avatarMenuRef}>
            <button
              type="button"
              className={styles.navAvatar}
              onClick={() => setAvatarMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={avatarMenuOpen}
              aria-label="Menu du profil"
            >
              <img src={user?.profilePhoto || imgAvatar} alt={user?.nom || "Profil"} className={styles.navAvatarImg} />
            </button>

            {avatarMenuOpen && (
              <div className={styles.avatarMenu} role="menu">
                <div className={styles.avatarMenuHeader}>
                  <div className={styles.avatarMenuName}>{user?.nom || "Utilisateur"}</div>
                  <div className={styles.avatarMenuEmail}>{user?.email || ""}</div>
                </div>

                <button type="button" role="menuitem" className={styles.avatarMenuItem} onClick={() => { setAvatarMenuOpen(false); navigate(ROUTES.PROFILE); }}>
                  <IconUser /> Voir le profil
                </button>
                <button type="button" role="menuitem" className={styles.avatarMenuItem} onClick={() => { setAvatarMenuOpen(false); navigate(ROUTES.SETTINGS); }}>
                  <IconSettingsGear /> Paramètres
                </button>
                <button type="button" role="menuitem" className={styles.avatarMenuItem} onClick={() => { setAvatarMenuOpen(false); navigate(ROUTES.SUBSCRIPTION); }}>
                  <IconCreditCard /> Abonnement
                </button>

                <div className={styles.avatarMenuDivider} />

                <div className={styles.avatarMenuSocial}>
                  <span className={styles.avatarMenuSocialLabel}>Suivez-nous</span>
                  <div className={styles.avatarMenuSocialIcons}>
                    <button type="button" className={styles.avatarMenuSocialIcon} disabled title="Bientôt disponible" aria-label="Instagram"><IconInstagram /></button>
                    <button type="button" className={styles.avatarMenuSocialIcon} disabled title="Bientôt disponible" aria-label="Twitter"><IconTwitter /></button>
                    <button type="button" className={styles.avatarMenuSocialIcon} disabled title="Bientôt disponible" aria-label="Facebook"><IconFacebook /></button>
                  </div>
                </div>

                <div className={styles.avatarMenuDivider} />

                <button type="button" role="menuitem" className={`${styles.avatarMenuItem} ${styles.avatarMenuLogout}`} onClick={handleLogout}>
                  <IconLogOut /> Se déconnecter
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
