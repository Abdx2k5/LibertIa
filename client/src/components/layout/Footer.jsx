import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

const imgLogo  = "https://www.figma.com/api/mcp/asset/d93104aa-ce16-42fe-b9cd-8bbe43f0929d";
const imgGlobe = "https://www.figma.com/api/mcp/asset/ce67d7c1-e338-4383-8ae7-5ea7ae0b31e4";

const COLS = [
  { title: "Explorer",    links: ["Destinations", "Communauté", "Vols & Hôtels"] },
  { title: "Légal",       links: ["Conditions d'utilisation", "Confidentialité", "Cookies"] },
  { title: "Suivez-nous", links: ["Instagram", "Twitter", "TikTok"] },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <div className={styles.brandLogo}>
              <img src={imgLogo} alt="" className={styles.brandLogoImg} />
              <p className={styles.brandName}>Libertia</p>
            </div>
            <p className={styles.brandText}>
              L'assistant de voyage nouvelle génération propulsé par l'IA
              et validé par une communauté d'explorateurs passionnés.
            </p>
          </div>
          {COLS.map((col) => (
            <div key={col.title} className={styles.col}>
              <p className={styles.colTitle}>{col.title}</p>
              <div className={styles.colLinks}>
                {col.links.map((link) => (
                  <button key={link} className={styles.colLink}>{link}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className={styles.bottom}>
          <span className={styles.copy}>© 2025 Libertia. Tous droits réservés.</span>
          <div className={styles.lang}>
            <img src={imgGlobe} alt="" className={styles.langIcon} />
            <span className={styles.langText}>Français (FR)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}