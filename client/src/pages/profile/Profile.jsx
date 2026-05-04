import { useState, useEffect } from "react";
import styles from "./Profile.module.css";
import { useAuthStore } from "../../store/authStore";
import authService from "../../services/Auth.service";
import { FREEMIUM } from "../../utils/constants";
import EditProfileForm from "./EditProfileForm";

const imgAvatar = "https://www.figma.com/api/mcp/asset/0926e5cc-1f5e-4862-a22b-22daa1cef4d7";

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [form, setForm]           = useState({ nom: "", prenom: "", email: "" });
  const [editing, setEditing]     = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const promptsUsed = user?.promptsUtilises || 0;
  const promptsLeft = FREEMIUM.MAX_FREE_PROMPTS - promptsUsed;

  useEffect(() => {
    if (user) setForm({ nom: user.nom || "", prenom: user.prenom || "", email: user.email || "" });
  }, [user]);

  const handleSaved = () => {
    setEditing(false);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  return (
    <div className={styles.page}>
      <div className={styles.main}>

        {/* ── Hero profil ── */}
        <div className={styles.hero}>
          <div className={styles.avatarWrap}>
            <div className={styles.avatar}>
              <img src={imgAvatar} alt="Avatar" className={styles.avatarImg} />
            </div>
            <button className={styles.avatarEditBtn} title="Changer la photo">✏️</button>
          </div>
          <div className={styles.heroInfo}>
            <h1 className={styles.heroName}>{user?.prenom} {user?.nom}</h1>
            <p className={styles.heroEmail}>{user?.email}</p>
            <div className={styles.heroBadge}>
              ✨ {user?.role === "premium" ? "Membre Premium" : "Membre Gratuit"}
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className={styles.statsBar}>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{user?.promptsUtilises || 0}</span>
            <span className={styles.statLabel}>Itinéraires générés</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{promptsLeft}</span>
            <span className={styles.statLabel}>Prompts restants</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNum}>0</span>
            <span className={styles.statLabel}>Voyages partagés</span>
          </div>
        </div>

        {/* ── Compteur freemium ── */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Mon abonnement</h2>
          <div className={styles.promptWrap}>
            <div className={styles.promptInfo}>
              <span className={styles.promptTitle}>Prompts IA ce mois</span>
              <span className={styles.promptSub}>
                {promptsUsed} utilisés sur {FREEMIUM.MAX_FREE_PROMPTS} disponibles
              </span>
            </div>
            <span className={styles.promptNum}>{promptsLeft}/{FREEMIUM.MAX_FREE_PROMPTS}</span>
          </div>
        </div>

        {/* ── Formulaire infos ── */}
        {editing ? (
          <EditProfileForm
            onCancel={() => setEditing(false)}
            onSaved={handleSaved}
          />
        ) : (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Informations personnelles</h2>

            {successMsg && (
              <p style={{ fontSize: 13, color: "#4ade80", marginBottom: 8 }}>
                ✓ Profil mis à jour avec succès !
              </p>
            )}

            <div className={styles.fieldGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Nom</label>
                <input
                  className={`${styles.input} ${styles.inputDisabled}`}
                  value={form.nom}
                  disabled
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Prénom</label>
                <input
                  className={`${styles.input} ${styles.inputDisabled}`}
                  value={form.prenom}
                  disabled
                />
              </div>
              <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
                <label className={styles.label}>Email</label>
                <input
                  className={`${styles.input} ${styles.inputDisabled}`}
                  value={form.email}
                  disabled
                  title="L'email ne peut pas être modifié"
                />
              </div>
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.btnSave}
                onClick={() => setEditing(true)}
              >
                Modifier le profil
              </button>
            </div>
          </div>
        )}

        {/* ── Zone danger ── */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Zone dangereuse</h2>
          <button className={styles.btnDanger}>Supprimer mon compte</button>
        </div>

      </div>
    </div>
  );
}