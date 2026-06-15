import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Profile.module.css";
import { useAuthStore } from "../../store/authStore";
import authService from "../../services/auth.service";
import dossierService from "../../services/dossier.service";
import { GaleriePhoto, CarteMapbox, LogoutButton, Modal, UploadMultiplePhotos } from "../../components/ui";
import { FREEMIUM, ROUTES } from "../../utils/constants";
import imgAvatar from "../../assets/images/community/avatar.png";

const MAX_FREE_PROMPTS = FREEMIUM.MAX_FREE_PROMPTS;

// ── Icônes inline (T85) ──
const GalleryIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
    <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2" />
    <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MapIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-.553-.894L15 4m0 13V4m0 0L9 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── Icône inline (T77) ──
const UploadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 16V4m0 0L7 9m5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// T85 — Photos de démonstration affichées si l'utilisateur n'a pas
// encore de souvenirs géolocalisés (carnets sans photos)
const MOCK_PHOTOS = [
  { id: "1", url: null, titre: "Temple Senso-ji", lieu: "Tokyo", date: "Mars 2024" },
  { id: "2", url: null, titre: "Mont Fuji", lieu: "Fuji", date: "Mars 2024" },
  { id: "3", url: null, titre: "Arashiyama Bamboo Grove", lieu: "Kyoto", date: "Avril 2024" },
  { id: "4", url: null, titre: "Shibuya Crossing", lieu: "Tokyo", date: "Mars 2024" },
  { id: "5", url: null, titre: "Fushimi Inari", lieu: "Kyoto", date: "Avril 2024" },
  { id: "6", url: null, titre: "Nezu Shrine", lieu: "Tokyo", date: "Mars 2024" },
  { id: "7", url: null, titre: "Gion District", lieu: "Kyoto", date: "Avril 2024" },
  { id: "8", url: null, titre: "Hiroshima Peace Memorial", lieu: "Hiroshima", date: "Mai 2024" },
];

// Coordonnées approximatives des lieux des souvenirs de démonstration
const MOCK_LIEUX_COORDS = {
  Tokyo: { lat: 35.6762, lng: 139.6503 },
  Fuji: { lat: 35.3606, lng: 138.7274 },
  Kyoto: { lat: 35.0116, lng: 135.7681 },
  Hiroshima: { lat: 34.3853, lng: 132.4553 },
};

// Default preferences structure
const DEFAULT_PREFERENCES = {
  profilePublic: false,
  voyagesPublic: false,
  emailNotifications: true,
  newsNotifications: false,
  language: "fr",
};

// Sections affichées via la sidebar de navigation du profil
const SECTIONS = [
  { id: "overview",     label: "Vue d'ensemble",  icon: "🏠" },
  { id: "info",         label: "Informations",    icon: "👤" },
  { id: "bio",          label: "À propos de moi", icon: "📝" },
  { id: "preferences",  label: "Préférences",     icon: "⚙️" },
  { id: "subscription", label: "Abonnement",      icon: "✨" },
  { id: "memories",     label: "Mes souvenirs",   icon: "📸" },
  { id: "security",     label: "Sécurité",        icon: "🔒" },
];

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const isPremium = user?.abonnement === "premium";
  const [activeSection, setActiveSection] = useState("overview");
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

  // T85 — Carte des souvenirs géolocalisés
  const [souvenirsVue, setSouvenirsVue] = useState("galerie"); // "galerie" | "carte"
  const [souvenirsCarte, setSouvenirsCarte] = useState([]);
  const [souvenirsLoading, setSouvenirsLoading] = useState(false);

  // T77 — Modal de téléversement de souvenirs (photos multiples)
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dossiers, setDossiers] = useState([]);
  const [selectedDossierId, setSelectedDossierId] = useState("");
  const [dossiersLoading, setDossiersLoading] = useState(false);

  const promptsUsed = user?.promptsUtilises || 0;
  const promptsLeft = FREEMIUM.MAX_FREE_PROMPTS - promptsUsed;
  const avatarSrc = user?.profilePhoto && user.profilePhoto !== "default-avatar.png"
    ? user.profilePhoto
    : imgAvatar;

  // ── Pré-remplit le formulaire depuis le store ─────────────
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

  // T85 — Charge les souvenirs géolocalisés à l'ouverture de l'onglet
  useEffect(() => {
    if (activeSection !== "memories") return;
    let actif = true;
    setSouvenirsLoading(true);
    dossierService
      .getCarteSouvenirs()
      .then((data) => {
        if (actif) setSouvenirsCarte(Array.isArray(data?.data) ? data.data : []);
      })
      .catch(() => {
        if (actif) setSouvenirsCarte([]);
      })
      .finally(() => {
        if (actif) setSouvenirsLoading(false);
      });
    return () => {
      actif = false;
    };
  }, [activeSection]);

  // T77 — Charge la liste des carnets (dossiers) à l'ouverture de la modale
  // de téléversement, pour permettre de choisir le carnet cible
  useEffect(() => {
    if (!showUploadModal) return;
    let actif = true;
    setDossiersLoading(true);
    dossierService
      .getMesDossiers()
      .then((data) => {
        if (!actif) return;
        const liste = Array.isArray(data?.dossiers) ? data.dossiers : [];
        setDossiers(liste);
        setSelectedDossierId((prev) => prev || (liste[0]?._id || ""));
      })
      .catch(() => {
        if (actif) setDossiers([]);
      })
      .finally(() => {
        if (actif) setDossiersLoading(false);
      });
    return () => {
      actif = false;
    };
  }, [showUploadModal]);

  // T77 — Appelé une fois le lot de photos envoyé : ferme la modale et
  // rafraîchit la carte des souvenirs avec les nouvelles données
  const handleUploadComplete = (uploadedPhotos) => {
    if (!uploadedPhotos || uploadedPhotos.length === 0) return;
    setShowUploadModal(false);
    setSouvenirsLoading(true);
    dossierService
      .getCarteSouvenirs()
      .then((data) => setSouvenirsCarte(Array.isArray(data?.data) ? data.data : []))
      .catch(() => {})
      .finally(() => setSouvenirsLoading(false));
  };

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

  // ── Sauvegarde → PUT /api/auth/profile ───────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setErrorMsg("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    setLoading(true);
    setErrorMsg("");

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

  // T85 — points géolocalisés pour la carte des souvenirs
  const souvenirsPoints = souvenirsCarte.length > 0
    ? souvenirsCarte
        .filter((s) => s.coordonnees?.lat != null && s.coordonnees?.lng != null)
        .map((s) => ({
          id: s.id,
          lat: s.coordonnees.lat,
          lng: s.coordonnees.lng,
          title: s.caption || s.voyage?.titre || s.voyage?.destination,
          subtitle: s.voyage?.destination,
          onClick: s.voyage?.id ? () => navigate(ROUTES.VOYAGE_DETAIL.replace(":id", s.voyage.id)) : undefined,
        }))
    : MOCK_PHOTOS
        .filter((p) => MOCK_LIEUX_COORDS[p.lieu])
        .map((p) => ({
          id: p.id,
          lat: MOCK_LIEUX_COORDS[p.lieu].lat,
          lng: MOCK_LIEUX_COORDS[p.lieu].lng,
          title: p.titre,
          subtitle: `${p.lieu} • ${p.date}`,
        }));

  return (
    <div className={styles.page}>
      <div className={styles.layout}>

        {/* ── Sidebar de navigation du profil ── */}
        <aside className={styles.sideNav}>
          <div className={styles.sideNavCard}>
            <div className={styles.sideNavAvatar}>
              <img src={avatarSrc} alt="Avatar" className={styles.sideNavAvatarImg} />
            </div>
            <div className={styles.sideNavName}>{user?.nom || "Utilisateur"}</div>
            <div className={styles.sideNavEmail}>{user?.email}</div>
            <div className={styles.heroBadge}>
              {isPremium ? "✨ Membre Premium" : "🆓 Membre Gratuit"}
            </div>
          </div>

          <nav className={styles.navList}>
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                className={`${styles.navBtn} ${activeSection === section.id ? styles.navBtnActive : ""}`}
                onClick={() => setActiveSection(section.id)}
              >
                <span className={styles.navBtnIcon}>{section.icon}</span>
                {section.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Contenu de la section active ── */}
        <div className={styles.content}>
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

            {/* ── Vue d'ensemble ── */}
            {activeSection === "overview" && (
              <div className={styles.fadeIn}>
                <div className={styles.hero}>
                  <div className={styles.avatarWrap}>
                    <div className={styles.avatar}>
                      <img src={avatarSrc} alt="Avatar" className={styles.avatarImg} />
                    </div>
                    <button type="button" className={styles.avatarEditBtn} title="Changer la photo">✏️</button>
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

                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Mon abonnement</h2>
                    <button type="button" className={styles.btnEdit} onClick={() => setActiveSection("subscription")}>
                      Voir
                    </button>
                  </div>
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
              </div>
            )}

            {/* ── Informations personnelles ── */}
            {activeSection === "info" && (
              <div className={`${styles.section} ${styles.fadeIn}`}>
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
            )}

            {/* ── Bio ── */}
            {activeSection === "bio" && (
              <div className={`${styles.section} ${styles.fadeIn}`}>
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
            )}

            {/* ── Préférences ── */}
            {activeSection === "preferences" && (
              <div className={`${styles.section} ${styles.fadeIn}`}>
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
            )}

            {/* ── Abonnement ── */}
            {activeSection === "subscription" && (
              <div className={`${styles.section} ${styles.fadeIn}`}>
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
                <div className={styles.formActions} style={{ borderTop: "none", paddingTop: 0, marginTop: 16 }}>
                  <button
                    type="button"
                    className={styles.btnSave}
                    onClick={() => navigate(ROUTES.SUBSCRIPTION)}
                  >
                    {isPremium ? "Gérer mon abonnement" : "Passer à Premium"}
                  </button>
                </div>
              </div>
            )}

            {/* ── Mes souvenirs personnels ── */}
            {activeSection === "memories" && (
              <div className={`${styles.section} ${styles.fadeIn}`}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Mes souvenirs personnels</h2>

                  <div className={styles.sectionHeaderActions}>
                    {/* T77 — ouvre la modale de téléversement de photos */}
                    <button
                      type="button"
                      className={styles.btnUpload}
                      onClick={() => setShowUploadModal(true)}
                    >
                      <UploadIcon />
                      Téléverser des souvenirs
                    </button>

                    {/* T85 — bascule Galerie / Carte */}
                    <div className={styles.souvenirsToggle} role="group" aria-label="Mode d'affichage des souvenirs">
                      <button
                        type="button"
                        className={`${styles.souvenirsBtn} ${souvenirsVue === "galerie" ? styles.souvenirsBtnActive : ""}`}
                        onClick={() => setSouvenirsVue("galerie")}
                        aria-pressed={souvenirsVue === "galerie"}
                      >
                        <GalleryIcon />
                        Galerie
                      </button>
                      <button
                        type="button"
                        className={`${styles.souvenirsBtn} ${souvenirsVue === "carte" ? styles.souvenirsBtnActive : ""}`}
                        onClick={() => setSouvenirsVue("carte")}
                        aria-pressed={souvenirsVue === "carte"}
                      >
                        <MapIcon />
                        Carte
                      </button>
                    </div>
                  </div>
                </div>

                {souvenirsVue === "carte" ? (
                  <div className={styles.souvenirsCarteWrap}>
                    {souvenirsLoading && <p className={styles.souvenirsCarteLoading}>Chargement de la carte...</p>}
                    <CarteMapbox
                      points={souvenirsPoints}
                      height={420}
                      emptyMessage="Aucun souvenir géolocalisé pour le moment."
                    />
                  </div>
                ) : (
                  <GaleriePhoto photos={MOCK_PHOTOS} colonnes={3} />
                )}

                {/* T77 — Modale de téléversement de photos multiples */}
                <Modal
                  isOpen={showUploadModal}
                  onClose={() => setShowUploadModal(false)}
                  title="Téléverser des souvenirs"
                  size="lg"
                >
                  {dossiersLoading ? (
                    <p className={styles.souvenirsCarteLoading}>Chargement de vos carnets...</p>
                  ) : dossiers.length === 0 ? (
                    <p className={styles.bioPlaceholder}>
                      Créez un voyage pour commencer à ajouter des souvenirs.
                    </p>
                  ) : (
                    <>
                      {dossiers.length > 1 && (
                        <div className={styles.fieldGroup} style={{ marginBottom: 16 }}>
                          <label className={styles.label} htmlFor="dossierSelect">Carnet de voyage</label>
                          <select
                            id="dossierSelect"
                            className={styles.selectInput}
                            value={selectedDossierId}
                            onChange={(e) => setSelectedDossierId(e.target.value)}
                          >
                            {dossiers.map((d) => (
                              <option key={d._id} value={d._id}>
                                {d.titre || d.voyage?.titre || d.voyage?.destination || "Carnet"}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <UploadMultiplePhotos
                        key={selectedDossierId}
                        folderId={selectedDossierId}
                        onUploadComplete={handleUploadComplete}
                      />
                    </>
                  )}
                </Modal>
              </div>
            )}

            {/* ── Sécurité / Zone dangereuse ── */}
            {activeSection === "security" && (
              <div className={`${styles.section} ${styles.fadeIn}`}>
                <h2 className={styles.sectionTitle}>Sécurité du compte</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <LogoutButton variant="outline" size="md" />
                  <button
                    type="button" className={styles.btnDanger}
                    onClick={() => alert("Fonctionnalité à venir — Abdelwahab doit ajouter DELETE /api/auth/account")}
                  >
                    Supprimer mon compte
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

      </div>
    </div>
  );
}
