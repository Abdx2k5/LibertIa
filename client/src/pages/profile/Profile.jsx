import { useState, useEffect } from "react";
import styles from "./Profile.module.css";
import { useAuthStore } from "../../store/authStore";
import authService from "../../services/Auth.service";
import { FREEMIUM } from "../../utils/constants";

const imgAvatar = "https://www.figma.com/api/mcp/asset/0926e5cc-1f5e-4862-a22b-22daa1cef4d7";

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [form, setForm]       = useState({ nom: "", prenom: "", email: "" });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const promptsUsed = user?.promptsUtilises || 0;
  const promptsLeft = FREEMIUM.MAX_FREE_PROMPTS - promptsUsed;

  useEffect(() => {
    if (user) setForm({ nom: user.nom || "", prenom: user.prenom || "", email: user.email || "" });
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await authService.updateProfile(form);
      updateUser(updated.user || updated);
      setEditing(false);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch {
      // gérer l'erreur
    } finally {
      setLoading(false);
    }
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
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Informations personnelles</h2>
          <form onSubmit={handleSave}>
            <div className={styles.fieldGrid}>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Nom</label>
                <input
                  className={`${styles.input} ${!editing ? styles.inputDisabled : ""}`}
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  disabled={!editing}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Prénom</label>
                <input
                  className={`${styles.input} ${!editing ? styles.inputDisabled : ""}`}
                  value={form.prenom}
                  onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                  disabled={!editing}
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
            {successMsg && (
            <p style={{ fontSize: 13, color: "#4ade80", marginBottom: 8 }}>
               Profil mis à jour avec succès !
              </p>
              )}
            <div className={styles.actions}>
              {editing ? (
                <>
                  <button type="button" className={styles.btnCancel} onClick={() => setEditing(false)}>
                    Annuler
                  </button>
                  <button type="submit" className={styles.btnSave} disabled={loading}>
                    {loading ? "Sauvegarde..." : "Sauvegarder"}
                  </button>
                </>
              ) : (
                <button type="button" className={styles.btnSave} onClick={() => setEditing(true)}>
                  Modifier le profil
                </button>
              )}
            </div>
          </form>
        </div>

        {/* ── Zone danger ── */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Zone dangereuse</h2>
          <button className={styles.btnDanger}>Supprimer mon compte</button>
        </div>

      </div>
    </div>
  );
}