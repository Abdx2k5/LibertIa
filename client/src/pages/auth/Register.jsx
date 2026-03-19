// =============================================================
// FICHIER  : src/pages/auth/Register.jsx
// ROUTE    : /register  (déclarée dans App.jsx sous PublicLayout)
// RÔLE     : Page d'inscription d'un nouvel utilisateur
//
// FLUX DE DONNÉES :
//   1. L'user remplit nom, email, mot de passe, confirm
//   2. handleSubmit() valide les champs côté client
//   3. Appelle useAuth().register(formData)
//   4. useAuth → authService.register() → POST /api/auth/register
//   5. Si succès → authStore stocke user + token → redirect /dashboard
//   6. Si erreur → affiche le message sous le formulaire
//
// DÉPENDANCES :
//   - hooks/useAuth.js       → fournit register(), error, pending
//   - utils/constants.js     → ROUTES
//   - react-router-dom       → Link, Navigate
// =============================================================

import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { ROUTES } from "../../utils/constants";

// ── Assets Figma ───────────────────────────────────────────────────
const imgLogo         = "https://www.figma.com/api/mcp/asset/4c6c3c8f-61ab-4e74-8290-7d59f0f139dd";
const imgCosmicBg     = "https://www.figma.com/api/mcp/asset/95f7b77e-d372-4d7b-b00d-8a0fb8b58cb0";
const imgGlobe        = "https://www.figma.com/api/mcp/asset/b13c4f09-5a8d-4425-b8cb-0b72b0dc8595";
const imgMoon         = "https://www.figma.com/api/mcp/asset/b8b9dfb6-7975-4a03-a6ba-ba6cf768016d";
const imgIconUser     = "https://www.figma.com/api/mcp/asset/ac6a6758-2dfa-481a-9935-047d7a0aba34"; // icône personne
const imgIconEmail    = "https://www.figma.com/api/mcp/asset/d85c89db-a58c-4774-91a4-7a7e611b7e1f"; // icône email
const imgIconLock     = "https://www.figma.com/api/mcp/asset/62246f85-b999-44b4-8749-00909649d0d4"; // icône cadenas
const imgIconCheck    = "https://www.figma.com/api/mcp/asset/649afbcf-a766-4cd4-ae7d-f948d9486660"; // icône checkmark
//const imgIconUncheck  = "https://www.figma.com/api/mcp/asset/6e635b7b-a720-4bf9-bd86-f18ca7baa9c1"; // icône carré vide
const imgIconGoogle   = "https://www.figma.com/api/mcp/asset/c4fb7b07-f30f-4d77-9784-eca89f5c01ea";
const imgIconApple    = "https://www.figma.com/api/mcp/asset/ac6a6758-2dfa-481a-9935-047d7a0aba34";
const imgIconFacebook = "https://www.figma.com/api/mcp/asset/3bc36861-0583-4324-9a47-02eda55015ba";

// ── Préférences de voyage disponibles (design Figma) ──────────────
// Stockées dans formData.preferences[]
// Affichées comme "pills" sélectionnables
const PREFERENCES = [
  { id: "vol",      label: "Plutôt vol ✈️" },
  { id: "train",    label: "Plutôt train 🚆" },
  { id: "aventure", label: "Aventure 🏔️" },
  { id: "detente",  label: "Détente 🏖️" },
];

// ── Styles CSS-in-JS ───────────────────────────────────────────────
const s = {
  // Page avec le même fond cosmique que Login
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #09090b 0%, #171123 100%)",
    fontFamily: "'Inter', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  cosmicBg: { position: "absolute", inset: 0, opacity: 0.15, overflow: "hidden", pointerEvents: "none" },
  cosmicBgImg: { width: "109%", height: "100%", position: "absolute", left: "-4.69%", top: 0, objectFit: "cover" },
  container: { maxWidth: 1200, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 0" },
  logoWrap: { display: "flex", alignItems: "center", gap: 12, textDecoration: "none" },
  logoImg: { width: 32, height: 32 },
  logoText: { fontSize: 24, fontWeight: 800, color: "#e7f0ff", letterSpacing: "-0.5px" },
  headerRight: { display: "flex", alignItems: "center", gap: 16 },
  headerLink: { fontSize: 14, color: "#94a3b8", paddingRight: 16 },
  headerLinkAccent: { color: "#6ee7f3", fontWeight: 500, textDecoration: "none" },
  iconBtn: { background: "none", border: "none", cursor: "pointer", padding: 8, display: "flex", alignItems: "center", gap: 6, color: "#e7f0ff", fontSize: 14 },
  iconBtnImg: { width: 20, height: 20 },
  // Formulaire centré (plus large que Login : 540px)
  body: { display: "flex", justifyContent: "center", padding: "24px 0 44px" },
  // Carte glassmorphism
  card: {
    width: 540,
    backdropFilter: "blur(8px)",
    backgroundColor: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8, padding: 40,
    boxShadow: "0px 25px 50px -12px rgba(0,0,0,0.5)",
  },
  title: { fontSize: 32, fontWeight: 700, color: "#e7f0ff", margin: "0 0 8px 0", lineHeight: 1.2 },
  subtitle: { fontSize: 15, color: "#94a3b8", lineHeight: 1.5, margin: "0 0 21px 0" },
  // Grille 2 colonnes pour les champs nom+email et mdp+confirm
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 14, fontWeight: 500, color: "#e7f0ff" },
  inputWrap: { position: "relative", display: "flex", alignItems: "center" },
  input: {
    width: "100%", backgroundColor: "#0f1724",
    border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6,
    padding: "13px 17px 13px 49px", fontSize: 15, color: "#e7f0ff",
    outline: "none", boxSizing: "border-box",
  },
  inputError: { borderColor: "rgba(248,113,113,0.5)" }, // bordure rouge si erreur de validation
  inputIcon: { position: "absolute", left: 16, width: 18, height: 18, pointerEvents: "none" },
  // Section préférences de voyage
  prefsLabel: { fontSize: 14, fontWeight: 500, color: "#e7f0ff", marginBottom: 8 },
  prefsRow: { display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 },
  // Pill sélectionnée : fond violet semi-transparent + bordure cyan
  pillOn: {
    backgroundColor: "rgba(139,92,246,0.2)",
    border: "1px solid #6ee7f3",
    borderRadius: 12, padding: "9px 17px",
    fontSize: 14, color: "#e7f0ff",
    cursor: "pointer", background: "rgba(139,92,246,0.2)",
  },
  // Pill non sélectionnée : fond sombre
  pillOff: {
    backgroundColor: "#0f1724",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12, padding: "9px 17px",
    fontSize: 14, color: "#94a3b8",
    cursor: "pointer",
  },
  // Section cases à cocher (CGU + newsletter)
  checkSection: { display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 },
  checkRow: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer" },
  checkBoxOn: {
    width: 18, height: 18, borderRadius: 4,
    border: "1px solid #6ee7f3", backgroundColor: "#6ee7f3",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  checkBoxOff: {
    width: 18, height: 18, borderRadius: 4,
    border: "1px solid rgba(255,255,255,0.2)", backgroundColor: "#0f1724", flexShrink: 0,
  },
  checkIcon: { width: 14, height: 14 },
  checkLabel: { fontSize: 13, color: "#94a3b8" },
  // Bouton principal gradient
  submitBtn: {
    width: "100%",
    background: "linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)",
    border: "none", borderRadius: 6,
    padding: "12px 24px", fontSize: 15, fontWeight: 700,
    color: "#061826", cursor: "pointer", marginBottom: 0,
  },
  // Messages d'erreur
  errorMsg: {
    fontSize: 13, color: "#f87171",
    backgroundColor: "rgba(248,113,113,0.1)",
    border: "1px solid rgba(248,113,113,0.3)",
    borderRadius: 6, padding: "10px 14px", marginBottom: 8,
  },
  fieldError: { fontSize: 12, color: "#f87171", marginTop: 4 },
  // Séparateur OAuth
  dividerRow: { display: "flex", alignItems: "center", gap: 16, padding: "21px 0" },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.08)" },
  dividerText: { fontSize: 13, color: "#94a3b8", whiteSpace: "nowrap" },
  // 3 boutons OAuth
  oauthRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 },
  oauthBtn: {
    backgroundColor: "#0f1724", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 6, padding: 11,
    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
  },
  oauthIcon: { width: 20, height: 20 },
};

export default function Register() {
  // ── Récupère depuis useAuth :
  //   register(data) → déclenche POST /api/auth/register
  //   isAuthenticated → true si déjà connecté
  //   error           → message d'erreur serveur
  //   pending         → true pendant l'appel API
  //   clearError      → remet error à null
  const { register, isAuthenticated, error, pending, clearError } = useAuth();

  // ── State du formulaire ───────────────────────────────────
  const [form, setForm] = useState({
    name: "",        // Nom complet
    email: "",       // Email
    password: "",    // Mot de passe
    confirm: "",     // Confirmation mot de passe
  });

  // Préférences sélectionnées (array d'IDs, ex: ["vol", "aventure"])
  const [preferences, setPreferences] = useState([]);
  const [acceptCGU, setAcceptCGU]     = useState(false); // obligatoire
  const [newsletter, setNewsletter]   = useState(true);  // optionnel

  // Erreurs de validation côté client (avant l'envoi à l'API)
  const [validationErrors, setValidationErrors] = useState({});

  // Déjà connecté → redirige directement
  if (isAuthenticated) return <Navigate to={ROUTES.DASHBOARD} replace />;

  // ── Met à jour un champ du formulaire ─────────────────────
  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    // Efface l'erreur de validation du champ modifié
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: null });
    }
  };

  // ── Toggle une préférence de voyage ──────────────────────
  // Si déjà sélectionnée → retire, sinon → ajoute
  const togglePref = (id) => {
    setPreferences((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  // ── Validation côté client avant envoi ───────────────────
  const validate = () => {
    const errors = {};
    if (!form.name.trim())         errors.name     = "Le nom est requis";
    if (!form.email.trim())        errors.email    = "L'email est requis";
    if (form.password.length < 6)  errors.password = "Minimum 6 caractères";
    if (form.password !== form.confirm) errors.confirm = "Les mots de passe ne correspondent pas";
    if (!acceptCGU)                errors.cgu      = "Vous devez accepter les CGU";
    return errors;
  };

  // ── Soumission du formulaire ──────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    // Validation locale d'abord — si erreurs, on n'envoie pas à l'API
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Envoi à l'API : on inclut les préférences et le choix newsletter
    await register({
      name: form.name,
      email: form.email,
      password: form.password,
      preferences,
      newsletter,
    });
    // useAuth.register() gère la redirection vers /dashboard si succès
  };

  return (
    <div style={s.page}>

      {/* Fond cosmique (décoratif) */}
      <div style={s.cosmicBg}>
        <img src={imgCosmicBg} alt="" style={s.cosmicBgImg} />
      </div>

      <div style={s.container}>

        {/* ── HEADER ── */}
        <header style={s.header}>
          <Link to={ROUTES.HOME} style={s.logoWrap}>
            <img src={imgLogo} alt="Libertia" style={s.logoImg} />
            <span style={s.logoText}>Libertia</span>
          </Link>
          <div style={s.headerRight}>
            <span style={s.headerLink}>
              Déjà inscrit ?{" "}
              <Link to={ROUTES.LOGIN} style={s.headerLinkAccent}>Se connecter</Link>
            </span>
            <button style={s.iconBtn} aria-label="Thème">
              <img src={imgMoon} alt="" style={s.iconBtnImg} />
            </button>
            <button style={s.iconBtn} aria-label="Langue">
              <img src={imgGlobe} alt="" style={s.iconBtnImg} />
              FR
            </button>
          </div>
        </header>

        {/* ── FORMULAIRE D'INSCRIPTION ── */}
        <div style={s.body}>
          <div style={s.card}>
            <h1 style={s.title}>Rejoignez l'aventure Libertia 🌍</h1>
            <p style={s.subtitle}>
              Créez votre compte et partez à l'aventure avec notre communauté.
            </p>

            {/* Erreur globale renvoyée par l'API */}
            {error && <div style={s.errorMsg}>{error}</div>}

            <form onSubmit={handleSubmit}>

              {/* ── Ligne 1 : Nom complet + Email ── */}
              <div style={s.grid2}>
                {/* Champ Nom */}
                <div style={s.fieldGroup}>
                  <label style={s.label}>Nom complet</label>
                  <div style={s.inputWrap}>
                    <img src={imgIconUser} alt="" style={s.inputIcon} />
                    <input
                      style={{ ...s.input, ...(validationErrors.name ? s.inputError : {}) }}
                      type="text"
                      placeholder="Jean Dupont"
                      value={form.name}
                      onChange={handleChange("name")}
                      autoComplete="name"
                    />
                  </div>
                  {/* Erreur de validation locale */}
                  {validationErrors.name && <span style={s.fieldError}>{validationErrors.name}</span>}
                </div>

                {/* Champ Email */}
                <div style={s.fieldGroup}>
                  <label style={s.label}>Email</label>
                  <div style={s.inputWrap}>
                    <img src={imgIconEmail} alt="" style={s.inputIcon} />
                    <input
                      style={{ ...s.input, ...(validationErrors.email ? s.inputError : {}) }}
                      type="email"
                      placeholder="jean@email.com"
                      value={form.email}
                      onChange={handleChange("email")}
                      autoComplete="email"
                    />
                  </div>
                  {validationErrors.email && <span style={s.fieldError}>{validationErrors.email}</span>}
                </div>
              </div>

              {/* ── Ligne 2 : Mot de passe + Confirmation ── */}
              <div style={s.grid2}>
                {/* Champ Mot de passe */}
                <div style={s.fieldGroup}>
                  <label style={s.label}>Mot de passe</label>
                  <div style={s.inputWrap}>
                    <img src={imgIconLock} alt="" style={s.inputIcon} />
                    <input
                      style={{ ...s.input, ...(validationErrors.password ? s.inputError : {}) }}
                      type="password"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={handleChange("password")}
                      autoComplete="new-password"
                    />
                  </div>
                  {validationErrors.password && <span style={s.fieldError}>{validationErrors.password}</span>}
                </div>

                {/* Champ Confirmation mot de passe */}
                <div style={s.fieldGroup}>
                  <label style={s.label}>Confirmer</label>
                  <div style={s.inputWrap}>
                    <img src={imgIconLock} alt="" style={s.inputIcon} />
                    <input
                      style={{ ...s.input, ...(validationErrors.confirm ? s.inputError : {}) }}
                      type="password"
                      placeholder="••••••••"
                      value={form.confirm}
                      onChange={handleChange("confirm")}
                      autoComplete="new-password"
                    />
                  </div>
                  {validationErrors.confirm && <span style={s.fieldError}>{validationErrors.confirm}</span>}
                </div>
              </div>

              {/* ── Préférences de voyage (optionnel) ── */}
              {/* Chaque pill est un toggle — les IDs sélectionnés sont envoyés à l'API */}
              <div style={{ marginBottom: 16 }}>
                <p style={s.prefsLabel}>Vos préférences de voyage (optionnel)</p>
                <div style={s.prefsRow}>
                  {PREFERENCES.map((pref) => (
                    <button
                      key={pref.id}
                      type="button"
                      style={preferences.includes(pref.id) ? s.pillOn : s.pillOff}
                      onClick={() => togglePref(pref.id)}
                    >
                      {pref.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Cases à cocher ── */}
              <div style={s.checkSection}>
                {/* CGU — obligatoire (validé côté client) */}
                <div style={s.checkRow} onClick={() => setAcceptCGU(!acceptCGU)}>
                  <div style={acceptCGU ? s.checkBoxOn : s.checkBoxOff}>
                    {acceptCGU && <img src={imgIconCheck} alt="" style={s.checkIcon} />}
                  </div>
                  <span style={{ ...s.checkLabel, color: validationErrors.cgu ? "#f87171" : "#94a3b8" }}>
                    J'accepte les conditions d'utilisation et la politique de confidentialité
                  </span>
                </div>
                {validationErrors.cgu && <span style={{ ...s.fieldError, marginTop: -8 }}>{validationErrors.cgu}</span>}

                {/* Newsletter — optionnelle */}
                <div style={s.checkRow} onClick={() => setNewsletter(!newsletter)}>
                  <div style={newsletter ? s.checkBoxOn : s.checkBoxOff}>
                    {newsletter && <img src={imgIconCheck} alt="" style={s.checkIcon} />}
                  </div>
                  <span style={s.checkLabel}>Je souhaite recevoir des offres et inspirations voyage</span>
                </div>
              </div>

              {/* ── Bouton "Créer mon compte" ── */}
              <button
                type="submit"
                style={{ ...s.submitBtn, opacity: pending ? 0.6 : 1, cursor: pending ? "not-allowed" : "pointer" }}
                disabled={pending}
              >
                {pending ? "Création en cours..." : "Créer mon compte"}
              </button>
            </form>

            {/* ── Séparateur OAuth ── */}
            <div style={s.dividerRow}>
              <div style={s.dividerLine} />
              <span style={s.dividerText}>Ou s'inscrire avec</span>
              <div style={s.dividerLine} />
            </div>

            {/* ── Boutons OAuth ── */}
            <div style={s.oauthRow}>
              <button style={s.oauthBtn} type="button" aria-label="Google">
                <img src={imgIconGoogle} alt="Google" style={s.oauthIcon} />
              </button>
              <button style={s.oauthBtn} type="button" aria-label="Apple">
                <img src={imgIconApple} alt="Apple" style={s.oauthIcon} />
              </button>
              <button style={s.oauthBtn} type="button" aria-label="Facebook">
                <img src={imgIconFacebook} alt="Facebook" style={s.oauthIcon} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}