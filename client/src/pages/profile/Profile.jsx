import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Profile.module.css";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";
import authService from "../../services/auth.service";
import dossierService from "../../services/dossier.service";
import { GaleriePhoto, CarteMapbox, LogoutButton, Modal, UploadMultiplePhotos } from "../../components/ui";
import HamburgerSidebar from "../../components/layout/HamburgerSidebar";
import { FREEMIUM, ROUTES } from "../../utils/constants";
import imgAvatar from "../../assets/images/community/avatar.png";

const IconMenu = (p) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
  </svg>
);

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

// ── Redimensionne (512px max) + compresse une photo de profil en JPEG,
//    puis la convertit en data URL base64 — même approche que
//    UploadMultiplePhotos.jsx, body attendu par PUT /api/auth/update-profile
//    : { profilePhoto: <dataURL> } ──
const AVATAR_MAX_DIMENSION = 512;
const AVATAR_JPEG_QUALITY = 0.85;

function compressAvatar(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;
      if (width > AVATAR_MAX_DIMENSION || height > AVATAR_MAX_DIMENSION) {
        if (width >= height) {
          height = Math.round((height * AVATAR_MAX_DIMENSION) / width);
          width = AVATAR_MAX_DIMENSION;
        } else {
          width = Math.round((width * AVATAR_MAX_DIMENSION) / height);
          height = AVATAR_MAX_DIMENSION;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);

      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL("image/jpeg", AVATAR_JPEG_QUALITY));
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Image invalide ou illisible"));
    };

    img.src = objectUrl;
  });
}

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

const navSvgProps = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" };
const IconHome     = (p) => <svg {...navSvgProps} {...p}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconUser      = (p) => <svg {...navSvgProps} {...p}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconFileText  = (p) => <svg {...navSvgProps} {...p}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>;
const IconSettingsP = (p) => <svg {...navSvgProps} {...p}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconSparklesP = (p) => <svg {...navSvgProps} {...p}><path d="m12 3-1.9 5.7a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.7a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>;
const IconCameraP   = (p) => <svg {...navSvgProps} {...p}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>;
const IconLockP     = (p) => <svg {...navSvgProps} {...p}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IconCheckP    = (p) => <svg {...navSvgProps} strokeWidth="2.5" width="14" height="14" {...p}><polyline points="20 6 9 17 4 12"/></svg>;
const IconXP        = (p) => <svg {...navSvgProps} strokeWidth="2.5" width="14" height="14" {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconPencilP   = (p) => <svg {...navSvgProps} width="14" height="14" {...p}><path d="M21.174 6.812a1 1 0 0 0-3.986-3.986L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497Z"/><path d="m15 5 4 4"/></svg>;
const IconTagP      = (p) => <svg {...navSvgProps} width="13" height="13" {...p}><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42Z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>;

// Sections affichées via la sidebar de navigation du profil
const SECTIONS = [
  { id: "overview",     label: "Vue d'ensemble",  icon: IconHome },
  { id: "info",         label: "Informations",    icon: IconUser },
  { id: "bio",          label: "À propos de moi", icon: IconFileText },
  { id: "preferences",  label: "Préférences",     icon: IconSettingsP },
  { id: "subscription", label: "Abonnement",      icon: IconSparklesP },
  { id: "memories",     label: "Mes souvenirs",   icon: IconCameraP },
  { id: "security",     label: "Sécurité",        icon: IconLockP },
];

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const { toggleSidebar } = useUIStore();
  const isPremium = user?.abonnement === "premium";
  const avatarInputRef = useRef(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
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
        if (value && (value.length < 2 || value.length > 50)) {
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

    if (form.prenom && (form.prenom.length < 2 || form.prenom.length > 50)) {
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

  // ── Changer la photo de profil → PUT /api/auth/update-profile { profilePhoto } ──
  const handleAvatarClick = () => {
    if (!avatarUploading) avatarInputRef.current?.click();
  };

  const handleAvatarSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setAvatarError("Format invalide. JPG, PNG ou WEBP uniquement.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Fichier trop lourd. Maximum 5 Mo.");
      return;
    }

    setAvatarError("");
    setAvatarUploading(true);
    try {
      const dataUrl = await compressAvatar(file);
      const updated = await authService.updateProfile({ profilePhoto: dataUrl });
      updateUser(updated);
    } catch {
      setAvatarError("Impossible de mettre à jour la photo de profil.");
    } finally {
      setAvatarUploading(false);
    }
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
      <HamburgerSidebar />

      <button type="button" className={styles.hamburgerBtn} onClick={toggleSidebar} aria-label="Ouvrir le menu">
        <IconMenu />
      </button>

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
              {isPremium ? <><IconSparklesP width={14} height={14} /> Membre Premium</> : <><IconTagP /> Membre Gratuit</>}
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
                <span className={styles.navBtnIcon}><section.icon /></span>
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
              <p style={{ fontSize: 13, color: "var(--accent-green)", marginBottom: 8 }}>
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
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleAvatarSelect}
                      style={{ display: "none" }}
                    />
                    <button
                      type="button"
                      className={styles.avatarEditBtn}
                      title="Changer la photo"
                      onClick={handleAvatarClick}
                      disabled={avatarUploading}
                      aria-busy={avatarUploading}
                    >
                      <IconPencilP />
                    </button>
                    {avatarError && <span className={styles.errorText} style={{ display: "block", marginTop: 8 }}>{avatarError}</span>}
                  </div>
                  <div className={styles.heroInfo}>
                    <h1 className={styles.heroName}>{user?.nom || "Utilisateur"}</h1>
                    <p className={styles.heroEmail}>{user?.email}</p>
                    <div className={styles.heroBadge}>
                      {isPremium ? <><IconSparklesP width={14} height={14} /> Membre Premium</> : <><IconTagP /> Membre Gratuit</>}
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
                          {form.preferences.profilePublic ? <IconCheckP /> : <IconXP />}
                        </span>
                        <span>Profil public</span>
                      </div>
                      <div className={styles.prefItem}>
                        <span className={styles.prefCheck}>
                          {form.preferences.voyagesPublic ? <IconCheckP /> : <IconXP />}
                        </span>
                        <span>Voyages publics</span>
                      </div>
                      <div className={styles.prefItem}>
                        <span className={styles.prefCheck}>
                          {form.preferences.emailNotifications ? <IconCheckP /> : <IconXP />}
                        </span>
                        <span>Notifications par email</span>
                      </div>
                      <div className={styles.prefItem}>
                        <span className={styles.prefCheck}>
                          {form.preferences.newsNotifications ? <IconCheckP /> : <IconXP />}
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
