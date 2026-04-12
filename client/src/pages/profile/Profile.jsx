import { useState, useEffect } from "react";
import styles from "./Profile.module.css";
import { useAuthStore } from "../../store/authStore";
import authService from "../../services/Auth.service";

const imgAvatar = "https://www.figma.com/api/mcp/asset/0926e5cc-1f5e-4862-a22b-22daa1cef4d7";

const MAX_FREE_PROMPTS = 10;

export default function Profile() {
  const { user, updateUser } = useAuthStore();

  const [form, setForm]           = useState({ nom: "", email: "", bio: "", age: "" });
  const [editing, setEditing]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [error, setError]         = useState(null);

  // ── Calcul prompts ────────────────────────────────────────
  // user.promptsRestants vient du backend
  const isPremium   = user?.abonnement === "premium";
  const promptsLeft = isPremium ? "∞" : (user?.promptsRestants ?? MAX_FREE_PROMPTS);
  const promptsUsed = isPremium ? "∞" : (MAX_FREE_PROMPTS - (user?.promptsRestants ?? MAX_FREE_PROMPTS));

  // ── Pré-remplit le formulaire depuis le store ─────────────
  useEffect(() => {
    if (user) {
      setForm({
        nom:   user.nom   || "",
        email: user.email || "",
        bio:   user.bio   || "",
        age:   user.age   || "",
      });
    }
  }, [user]);

  // ── Sauvegarde → PUT /api/auth/profile ───────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // authService.updateProfile retourne directement data.data (objet user)
      // car le backend retourne { success: true, data: { _id, nom, ... } }
      const updated = await authService.updateProfile({
        nom:  form.nom,
        age:  form.age  || undefined,
        bio:  form.bio  || undefined,
      });

      // Met à jour le store avec les nouvelles données
      updateUser(updated); // ← directement, pas updated.user ni updated.data

      setEditing(false);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la mise à jour.");
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
              <img
                src={user?.profilePhoto && user.profilePhoto !== "default-avatar.png"
                  ? user.profilePhoto
                  : imgAvatar}
                alt="Avatar"
                className={styles.avatarImg}
              />
            </div>
            <button className={styles.avatarEditBtn} title="Changer la photo">✏️</button>
          </div>
          <div className={styles.heroInfo}>
            <h1 className={styles.heroName}>{user?.nom || "Utilisateur"}</h1>
            <p className={styles.heroEmail}>{user?.email}</p>
            <div className={styles.heroBadge}>
              {isPremium ? "✨ Membre Premium" : "🆓 Membre Gratuit"}
            </div>
            {user?.bio && <p style={{ fontSize: 14, color: "#a1a1aa", marginTop: 8 }}>{user.bio}</p>}
          </div>
        </div>

        {/* ── Stats ── */}
        <div className={styles.statsBar}>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{promptsUsed}</span>
            <span className={styles.statLabel}>Itinéraires générés</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{promptsLeft}</span>
            <span className={styles.statLabel}>Prompts restants</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{user?.followers?.length || 0}</span>
            <span className={styles.statLabel}>Abonnés</span>
          </div>
        </div>

        {/* ── Abonnement ── */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Mon abonnement</h2>
          <div className={styles.promptWrap}>
            <div className={styles.promptInfo}>
              <span className={styles.promptTitle}>
                {isPremium ? "Premium — Illimité" : "Gratuit — Prompts IA ce mois"}
              </span>
              <span className={styles.promptSub}>
                {isPremium
                  ? "Vous avez accès à des itinéraires illimités"
                  : `${promptsUsed} utilisés sur ${MAX_FREE_PROMPTS} disponibles`}
              </span>
            </div>
            <span className={styles.promptNum}>
              {isPremium ? "∞" : `${promptsLeft}/${MAX_FREE_PROMPTS}`}
            </span>
          </div>
        </div>

        {/* ── Formulaire infos ── */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Informations personnelles</h2>
          <form onSubmit={handleSave}>
            <div className={styles.fieldGrid}>

              <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
                <label className={styles.label}>Nom complet</label>
                <input
                  className={`${styles.input} ${!editing ? styles.inputDisabled : ""}`}
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  disabled={!editing}
                  placeholder="Marie Dupont"
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

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Âge (optionnel)</label>
                <input
                  className={`${styles.input} ${!editing ? styles.inputDisabled : ""}`}
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  disabled={!editing}
                  placeholder="25"
                  min="1" max="120"
                />
              </div>

              <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
                <label className={styles.label}>Bio (optionnel)</label>
                <input
                  className={`${styles.input} ${!editing ? styles.inputDisabled : ""}`}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  disabled={!editing}
                  placeholder="Passionné de voyages..."
                  maxLength={500}
                />
              </div>

            </div>

            {/* Message succès */}
            {successMsg && (
              <p style={{ fontSize: 13, color: "#4ade80", marginBottom: 8 }}>
                ✅ Profil mis à jour avec succès !
              </p>
            )}

            {/* Message erreur */}
            {error && (
              <p style={{ fontSize: 13, color: "#f87171", marginBottom: 8 }}>{error}</p>
            )}

            <div className={styles.actions}>
              {editing ? (
                <>
                  <button type="button" className={styles.btnCancel} onClick={() => { setEditing(false); setError(null); }}>
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
{/**************************************************************/}
        {/* ── Zone danger ── */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Zone dangereuse</h2>
          <button
            className={styles.btnDanger}
            onClick={() => alert("Fonctionnalité à venir — Abdelwahab doit ajouter DELETE /api/auth/account")}
          >
            Supprimer mon compte
          </button>
        </div>

      </div>
    </div>
  );
}