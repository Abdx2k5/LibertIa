import { useState, useEffect } from "react";
import styles from "./Profile.module.css";
import { useAuthStore } from "../../store/authStore";
import authService from "../../services/Auth.service";
import { FREEMIUM } from "../../utils/constants";

const imgAvatar = "https://www.figma.com/api/mcp/asset/0926e5cc-1f5e-4862-a22b-22daa1cef4d7";

// Default preferences structure
const DEFAULT_PREFERENCES = {
  profilePublic: false,
  voyagesPublic: false,
  emailNotifications: true,
  newsNotifications: false,
  language: "fr",
};

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    age: "",
    bio: "",
    preferences: DEFAULT_PREFERENCES,
  });
  const [editingSection, setEditingSection] = useState(null); // "info", "bio", "preferences", or null
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [errors, setErrors] = useState({});

  const promptsUsed = user?.promptsUtilises || 0;
  const promptsLeft = FREEMIUM.MAX_FREE_PROMPTS - promptsUsed;

  useEffect(() => {
    if (user) {
      setForm({
        nom: user.nom || "",
        prenom: user.prenom || "",
        email: user.email || "",
        age: user.age || "",
        bio: user.bio || "",
        preferences: user.preferences || DEFAULT_PREFERENCES,
      });
    }
  }, [user]);

  // Validation functions
  const validateField = (name, value) => {
    const newErrors = { ...errors };
    switch (name) {
      case "nom":
        if (!value.trim()) {
          newErrors.nom = "Le nom est requis";
        } else if (value.length < 2 || value.length > 50) {
          newErrors.nom = "Le nom doit contenir entre 2 et 50 caractères";
        } else {
          delete newErrors.nom;
        }
        break;
      case "prenom":
        if (!value.trim()) {
          newErrors.prenom = "Le prénom est requis";
        } else if (value.length < 2 || value.length > 50) {
          newErrors.prenom = "Le prénom doit contenir entre 2 et 50 caractères";
        } else {
          delete newErrors.prenom;
        }
        break;
      case "age":
        if (value && (isNaN(value) || value < 13 || value > 120)) {
          newErrors.age = "L'âge doit être entre 13 et 120";
        } else {
          delete newErrors.age;
        }
        break;
      case "bio":
        if (value && value.length > 500) {
          newErrors.bio = "La bio ne peut pas dépasser 500 caractères";
        } else {
          delete newErrors.bio;
        }
        break;
      default:
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    if (!form.nom.trim()) {
      newErrors.nom = "Le nom est requis";
      isValid = false;
    } else if (form.nom.length < 2 || form.nom.length > 50) {
      newErrors.nom = "Le nom doit contenir entre 2 et 50 caractères";
      isValid = false;
    }

    if (!form.prenom.trim()) {
      newErrors.prenom = "Le prénom est requis";
      isValid = false;
    } else if (form.prenom.length < 2 || form.prenom.length > 50) {
      newErrors.prenom = "Le prénom doit contenir entre 2 et 50 caractères";
      isValid = false;
    }

    if (form.age && (isNaN(form.age) || form.age < 13 || form.age > 120)) {
      newErrors.age = "L'âge doit être entre 13 et 120";
      isValid = false;
    }

    if (form.bio && form.bio.length > 500) {
      newErrors.bio = "La bio ne peut pas dépasser 500 caractères";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setErrorMsg("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const updated = await authService.updateProfile(form);
      updateUser(updated.user || updated);
      setEditingSection(null);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Erreur lors de la mise à jour du profil");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form to current user data
    if (user) {
      setForm({
        nom: user.nom || "",
        prenom: user.prenom || "",
        email: user.email || "",
        age: user.age || "",
        bio: user.bio || "",
        preferences: user.preferences || DEFAULT_PREFERENCES,
      });
    }
    setEditingSection(null);
    setErrors({});
    setErrorMsg("");
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
        <form onSubmit={handleSave}>
          {errorMsg && (
            <div className={styles.errorMsg} style={{ fontSize: 13, color: "#ef4444", marginBottom: 16 }}>
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <p style={{ fontSize: 13, color: "#4ade80", marginBottom: 8 }}>
              Profil mis à jour avec succès !
            </p>
          )}

          {/* Section 1: Informations personnelles */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Informations personnelles</h2>
              {editingSection !== "info" && (
                <button
                  type="button"
                  className={styles.btnEdit}
                  onClick={() => setEditingSection("info")}
                >
                  Modifier
                </button>
              )}
            </div>

            {editingSection === "info" ? (
              <div className={styles.fieldGrid}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Nom</label>
                  <input
                    type="text"
                    className={`${styles.input} ${errors.nom ? styles.inputError : ""}`}
                    value={form.nom}
                    onChange={(e) => {
                      setForm({ ...form, nom: e.target.value });
                      validateField("nom", e.target.value);
                    }}
                  />
                  {errors.nom && <span className={styles.errorText}>{errors.nom}</span>}
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Prénom</label>
                  <input
                    type="text"
                    className={`${styles.input} ${errors.prenom ? styles.inputError : ""}`}
                    value={form.prenom}
                    onChange={(e) => {
                      setForm({ ...form, prenom: e.target.value });
                      validateField("prenom", e.target.value);
                    }}
                  />
                  {errors.prenom && <span className={styles.errorText}>{errors.prenom}</span>}
                </div>

                <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
                  <label className={styles.label}>Email</label>
                  <input
                    type="email"
                    className={`${styles.input} ${styles.inputDisabled}`}
                    value={form.email}
                    disabled
                    title="L'email ne peut pas être modifié"
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Âge (optionnel)</label>
                  <input
                    type="number"
                    className={`${styles.input} ${errors.age ? styles.inputError : ""}`}
                    value={form.age}
                    onChange={(e) => {
                      setForm({ ...form, age: e.target.value });
                      if (e.target.value) validateField("age", e.target.value);
                    }}
                    placeholder="13-120"
                    min="13"
                    max="120"
                  />
                  {errors.age && <span className={styles.errorText}>{errors.age}</span>}
                </div>

                <div className={styles.formActions}>
                  <button type="button" className={styles.btnCancel} onClick={handleCancel}>
                    Annuler
                  </button>
                  <button type="submit" className={styles.btnSave} disabled={loading}>
                    {loading ? "Sauvegarde..." : "Sauvegarder"}
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.viewMode}>
                <div className={styles.viewRow}>
                  <span className={styles.viewLabel}>Nom:</span>
                  <span className={styles.viewValue}>{form.nom}</span>
                </div>
                <div className={styles.viewRow}>
                  <span className={styles.viewLabel}>Prénom:</span>
                  <span className={styles.viewValue}>{form.prenom}</span>
                </div>
                <div className={styles.viewRow}>
                  <span className={styles.viewLabel}>Email:</span>
                  <span className={styles.viewValue}>{form.email}</span>
                </div>
                {form.age && (
                  <div className={styles.viewRow}>
                    <span className={styles.viewLabel}>Âge:</span>
                    <span className={styles.viewValue}>{form.age}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Bio */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>À propos de moi</h2>
              {editingSection !== "bio" && (
                <button
                  type="button"
                  className={styles.btnEdit}
                  onClick={() => setEditingSection("bio")}
                >
                  Modifier
                </button>
              )}
            </div>

            {editingSection === "bio" ? (
              <div className={styles.fieldGroup} style={{ marginBottom: 16 }}>
                <label className={styles.label}>Bio</label>
                <textarea
                  className={`${styles.textarea} ${errors.bio ? styles.inputError : ""}`}
                  value={form.bio}
                  onChange={(e) => {
                    setForm({ ...form, bio: e.target.value });
                    validateField("bio", e.target.value);
                  }}
                  placeholder="Parlez-nous un peu de vous..."
                  maxLength={500}
                />
                <div className={styles.charCounter}>
                  {form.bio.length}/500 caractères
                </div>
                {errors.bio && <span className={styles.errorText}>{errors.bio}</span>}

                <div className={styles.formActions}>
                  <button type="button" className={styles.btnCancel} onClick={handleCancel}>
                    Annuler
                  </button>
                  <button type="submit" className={styles.btnSave} disabled={loading}>
                    {loading ? "Sauvegarde..." : "Sauvegarder"}
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.viewMode}>
                {form.bio ? (
                  <p className={styles.bioText}>{form.bio}</p>
                ) : (
                  <p className={styles.bioPlaceholder}>Aucune bio pour le moment</p>
                )}
              </div>
            )}
          </div>

          {/* Section 3: Préférences */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Préférences</h2>
              {editingSection !== "preferences" && (
                <button
                  type="button"
                  className={styles.btnEdit}
                  onClick={() => setEditingSection("preferences")}
                >
                  Modifier
                </button>
              )}
            </div>

            {editingSection === "preferences" ? (
              <div className={styles.preferencesGrid}>
                <div className={styles.preferenceItem}>
                  <div className={styles.preferenceCheck}>
                    <input
                      type="checkbox"
                      id="profilePublic"
                      checked={form.preferences.profilePublic}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          preferences: { ...form.preferences, profilePublic: e.target.checked },
                        })
                      }
                    />
                    <label htmlFor="profilePublic">Profil public</label>
                  </div>
                  <span className={styles.preferenceDesc}>Permettre à d'autres utilisateurs de voir votre profil</span>
                </div>

                <div className={styles.preferenceItem}>
                  <div className={styles.preferenceCheck}>
                    <input
                      type="checkbox"
                      id="voyagesPublic"
                      checked={form.preferences.voyagesPublic}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          preferences: { ...form.preferences, voyagesPublic: e.target.checked },
                        })
                      }
                    />
                    <label htmlFor="voyagesPublic">Voyages publics</label>
                  </div>
                  <span className={styles.preferenceDesc}>Partager vos itinéraires avec la communauté</span>
                </div>

                <div className={styles.preferenceItem}>
                  <div className={styles.preferenceCheck}>
                    <input
                      type="checkbox"
                      id="emailNotifications"
                      checked={form.preferences.emailNotifications}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          preferences: { ...form.preferences, emailNotifications: e.target.checked },
                        })
                      }
                    />
                    <label htmlFor="emailNotifications">Notifications par email</label>
                  </div>
                  <span className={styles.preferenceDesc}>Recevoir des mises à jour importantes par email</span>
                </div>

                <div className={styles.preferenceItem}>
                  <div className={styles.preferenceCheck}>
                    <input
                      type="checkbox"
                      id="newsNotifications"
                      checked={form.preferences.newsNotifications}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          preferences: { ...form.preferences, newsNotifications: e.target.checked },
                        })
                      }
                    />
                    <label htmlFor="newsNotifications">Infolettre hebdomadaire</label>
                  </div>
                  <span className={styles.preferenceDesc}>Recevez nos nouvelles et conseils de voyage</span>
                </div>

                <div className={styles.preferenceItem}>
                  <label className={styles.label} htmlFor="language">Langue préférée</label>
                  <select
                    id="language"
                    className={styles.selectInput}
                    value={form.preferences.language}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        preferences: { ...form.preferences, language: e.target.value },
                      })
                    }
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>

                <div className={styles.formActions}>
                  <button type="button" className={styles.btnCancel} onClick={handleCancel}>
                    Annuler
                  </button>
                  <button type="submit" className={styles.btnSave} disabled={loading}>
                    {loading ? "Sauvegarde..." : "Sauvegarder"}
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.viewMode}>
                <div className={styles.preferencesList}>
                  <div className={styles.prefItem}>
                    <span className={styles.prefCheck}>
                      {form.preferences.profilePublic ? "✓" : "✗"}
                    </span>
                    <span>Profil public</span>
                  </div>
                  <div className={styles.prefItem}>
                    <span className={styles.prefCheck}>
                      {form.preferences.voyagesPublic ? "✓" : "✗"}
                    </span>
                    <span>Voyages publics</span>
                  </div>
                  <div className={styles.prefItem}>
                    <span className={styles.prefCheck}>
                      {form.preferences.emailNotifications ? "✓" : "✗"}
                    </span>
                    <span>Notifications par email</span>
                  </div>
                  <div className={styles.prefItem}>
                    <span className={styles.prefCheck}>
                      {form.preferences.newsNotifications ? "✓" : "✗"}
                    </span>
                    <span>Infolettre hebdomadaire</span>
                  </div>
                  <div className={styles.prefItem}>
                    <span className={styles.prefLabel}>Langue:</span>
                    <span>{form.preferences.language === "fr" ? "Français" : form.preferences.language === "en" ? "English" : "العربية"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Zone danger ── */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Zone dangereuse</h2>
            <button type="button" className={styles.btnDanger}>Supprimer mon compte</button>
          </div>
        </form>

      </div>
    </div>
  );
}