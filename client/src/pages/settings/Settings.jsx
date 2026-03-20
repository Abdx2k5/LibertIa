import { useState } from "react";
import styles from "./Settings.module.css";

const TABS = ["Général", "Notifications", "Confidentialité", "Sécurité"];
const Toggle = ({ on, onToggle }) => (
  <button
    type="button"
    className={`${styles.toggleBtn} ${on ? styles.toggleBtnOn : styles.toggleBtnOff}`}
    onClick={onToggle}
  >
    <div className={`${styles.toggleDot} ${on ? styles.toggleDotOn : styles.toggleDotOff}`} />
  </button>
);
export default function Settings() {
  //const { } = useAuthStore();
  // ✅ Pas d'import du store, juste un placeholder
//const handleDeleteAccount = () => {
  // TODO : appeler authService.deleteAccount() + logout
  //console.log("Suppression compte...");
//};
  const [activeTab, setActiveTab] = useState("Général");

  const [notifs, setNotifs] = useState({
    email:     true,
    push:      false,
    newsletter:true,
    rappels:   true,
  });

  const [privacy, setPrivacy] = useState({
    profilPublic: true,
    voyagesPublics: false,
    historiqueIA: true,
  });

  const [lang, setLang] = useState("fr");

  return (
    <div className={styles.page}>
      <div className={styles.main}>
        <h1 className={styles.pageTitle}>Paramètres</h1>
        <p className={styles.pageSub}>Gérez vos préférences et votre compte.</p>

        {/* Tabs */}
        <div className={styles.tabs}>
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Général ── */}
        {activeTab === "Général" && (
          <>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Langue & Région</h2>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Langue de l'interface</label>
                <select
                  className={styles.select}
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                </select>
              </div>
            </div>
            <div className={styles.saveWrap}>
              <button className={styles.btnSave}>Sauvegarder</button>
            </div>
          </>
        )}

        {/* ── Notifications ── */}
        {activeTab === "Notifications" && (
          <>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Notifications</h2>
              {[
                { key: "email",      label: "Notifications par email",       desc: "Recevez les mises à jour importantes par email" },
                { key: "push",       label: "Notifications push",            desc: "Alertes en temps réel dans le navigateur" },
                { key: "newsletter", label: "Newsletter hebdomadaire",       desc: "Inspirations voyage et offres exclusives" },
                { key: "rappels",    label: "Rappels de voyage",             desc: "Rappels avant vos dates de départ" },
              ].map((n) => (
                <div key={n.key} className={styles.toggleRow}>
                  <div className={styles.toggleInfo}>
                    <span className={styles.toggleLabel}>{n.label}</span>
                    <span className={styles.toggleDesc}>{n.desc}</span>
                  </div>
                  <Toggle
                    on={notifs[n.key]}
                    onToggle={() => setNotifs({ ...notifs, [n.key]: !notifs[n.key] })}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Confidentialité ── */}
        {activeTab === "Confidentialité" && (
          <>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Confidentialité</h2>
              {[
                { key: "profilPublic",    label: "Profil public",         desc: "Votre profil est visible par les autres membres" },
                { key: "voyagesPublics",  label: "Voyages publics",       desc: "Vos voyages apparaissent dans le fil communauté" },
                { key: "historiqueIA",    label: "Historique IA visible", desc: "Vos recherches IA sont utilisées pour améliorer les suggestions" },
              ].map((p) => (
                <div key={p.key} className={styles.toggleRow}>
                  <div className={styles.toggleInfo}>
                    <span className={styles.toggleLabel}>{p.label}</span>
                    <span className={styles.toggleDesc}>{p.desc}</span>
                  </div>
                  <Toggle
                    on={privacy[p.key]}
                    onToggle={() => setPrivacy({ ...privacy, [p.key]: !privacy[p.key] })}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Sécurité ── */}
        {activeTab === "Sécurité" && (
          <>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Sécurité du compte</h2>
              <div className={styles.toggleRow}>
                <div className={styles.toggleInfo}>
                  <span className={styles.toggleLabel}>Authentification à deux facteurs</span>
                  <span className={styles.toggleDesc}>Sécurisez votre compte avec un code SMS</span>
                </div>
                <Toggle on={false} onToggle={() => {}} />
              </div>
            </div>

            <div className={styles.dangerZone}>
              <h2 className={styles.dangerTitle}>Zone dangereuse</h2>
              <p className={styles.dangerText}>
                La suppression de votre compte est irréversible. Toutes vos données seront effacées.
              </p>
              <button className={styles.btnDanger} onClick={() => alert("Fonctionnalité à venir")}>Supprimer mon compte</button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}