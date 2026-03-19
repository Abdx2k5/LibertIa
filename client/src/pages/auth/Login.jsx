// =============================================================
// FICHIER  : src/pages/auth/Login.jsx
// ROUTE    : /login  (déclarée dans App.jsx sous PublicLayout)
// RÔLE     : Page de connexion utilisateur
//
// FLUX DE DONNÉES :
//   1. L'user remplit email + password
//   2. handleSubmit() appelle useAuth().login(email, password)
//   3. useAuth → authService.login() → POST /api/auth/login
//   4. Si succès → authStore stocke user + token → redirect /dashboard
//   5. Si erreur → affiche le message sous le formulaire
//
// DÉPENDANCES :
//   - hooks/useAuth.js       → fournit login(), error, pending
//   - utils/constants.js     → ROUTES (chemins des pages)
//   - react-router-dom       → Link (navigation), Navigate (redirect)
// =============================================================

import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { ROUTES } from "../../utils/constants";

// ── Assets Figma (valables 7 jours — à remplacer par des fichiers locaux) ──
const imgLogo         = "https://www.figma.com/api/mcp/asset/b525c61a-ae87-427e-8518-f58338530cb0";
const imgCosmicBg     = "https://www.figma.com/api/mcp/asset/95f7b77e-d372-4d7b-b00d-8a0fb8b58cb0";
const imgTraveler     = "https://www.figma.com/api/mcp/asset/c26d121a-718a-4465-90c7-cea9084f51ae";
const imgGlobe        = "https://www.figma.com/api/mcp/asset/288cca30-e267-449b-bb67-afb30330bf2d";
const imgMoon         = "https://www.figma.com/api/mcp/asset/b8b9dfb6-7975-4a03-a6ba-ba6cf768016d";
const imgIconEmail    = "https://www.figma.com/api/mcp/asset/d85c89db-a58c-4774-91a4-7a7e611b7e1f";
const imgIconLock     = "https://www.figma.com/api/mcp/asset/62246f85-b999-44b4-8749-00909649d0d4";
const imgIconEye      = "https://www.figma.com/api/mcp/asset/b4687fca-f78d-466c-b645-8b86642bca18";
const imgIconCheck    = "https://www.figma.com/api/mcp/asset/649afbcf-a766-4cd4-ae7d-f948d9486660";
const imgIconGoogle   = "https://www.figma.com/api/mcp/asset/02431552-2f0b-48eb-8491-54da398dfebd";
const imgIconApple    = "https://www.figma.com/api/mcp/asset/f987cb7c-4b5a-4c07-ab01-754932282dd8";
const imgIconFacebook = "https://www.figma.com/api/mcp/asset/3bc36861-0583-4324-9a47-02eda55015ba";

// ── Styles CSS-in-JS ───────────────────────────────────────────────
// Couleurs du design Figma :
//   - Fond page  : gradient #09090b → #171123
//   - Card       : rgba(255,255,255,0.03) + blur(8px)  ← glassmorphism
//   - Accent     : #6ee7f3 (cyan) + #8b5cf6 (violet)
//   - Texte      : #e7f0ff (clair) / #94a3b8 (secondaire)
//   - Inputs     : fond #0f1724
const s = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #09090b 0%, #171123 100%)",
    fontFamily: "'Inter', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  // Fond étoilé cosmique à 15% d'opacité
  cosmicBg: {
    position: "absolute",
    inset: 0,
    opacity: 0.15,
    overflow: "hidden",
    pointerEvents: "none",
  },
  cosmicBgImg: {
    width: "109%",
    height: "100%",
    position: "absolute",
    left: "-4.69%",
    top: 0,
    objectFit: "cover",
  },
  container: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 24px",
    position: "relative",
    zIndex: 1,
  },
  // Navbar minimaliste : logo à gauche, actions à droite
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "24px 0",
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    textDecoration: "none",
  },
  logoImg: { width: 32, height: 32 },
  logoText: { fontSize: 24, fontWeight: 800, color: "#e7f0ff", letterSpacing: "-0.5px" },
  headerRight: { display: "flex", alignItems: "center", gap: 16 },
  headerLink: { fontSize: 14, color: "#94a3b8", paddingRight: 16 },
  headerLinkAccent: { color: "#6ee7f3", fontWeight: 500, textDecoration: "none" },
  iconBtn: {
    background: "none", border: "none", cursor: "pointer",
    padding: 8, display: "flex", alignItems: "center", gap: 6,
    color: "#e7f0ff", fontSize: 14,
  },
  iconBtnImg: { width: 20, height: 20 },
  // Zone centrale : carte formulaire (gauche) + illustration (droite)
  body: {
    display: "flex",
    gap: 64,
    alignItems: "center",
    justifyContent: "center",
    padding: "87px 0",
  },
  // Carte glassmorphism : fond semi-transparent + blur + ombre portée
  card: {
    width: 480,
    backdropFilter: "blur(8px)",
    backgroundColor: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    padding: 41,
    boxShadow: "0px 25px 50px -12px rgba(0,0,0,0.5)",
  },
  title: { fontSize: 32, fontWeight: 700, color: "#e7f0ff", margin: "0 0 8px 0" },
  subtitle: { fontSize: 15, color: "#94a3b8", lineHeight: 1.5, margin: "0 0 21px 0" },
  // Groupe label + champ input
  fieldGroup: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 9 },
  label: { fontSize: 14, fontWeight: 500, color: "#e7f0ff" },
  inputWrap: { position: "relative", display: "flex", alignItems: "center" },
  input: {
    width: "100%",
    backgroundColor: "#0f1724",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 6,
    padding: "13px 17px 13px 49px",
    fontSize: 15, color: "#e7f0ff",
    outline: "none", boxSizing: "border-box",
  },
  inputIcon: { position: "absolute", left: 16, width: 18, height: 18, pointerEvents: "none" },
  eyeBtn: { position: "absolute", right: 16, background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" },
  eyeIcon: { width: 18, height: 18, opacity: 0.6 },
  // Ligne "Se souvenir de moi" / "Mot de passe oublié"
  rememberRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0 13px" },
  checkWrap: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer" },
  // Case cochée (cyan) vs décochée (fond sombre)
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
  checkLabel: { fontSize: 14, color: "#94a3b8" },
  forgotLink: { fontSize: 14, fontWeight: 500, color: "#6ee7f3", textDecoration: "none", background: "none", border: "none", cursor: "pointer" },
  // Bouton principal avec gradient cyan → violet (design Figma)
  submitBtn: {
    width: "100%",
    background: "linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)",
    border: "none", borderRadius: 6,
    padding: "12px 24px", fontSize: 15, fontWeight: 700,
    color: "#061826", cursor: "pointer", transition: "opacity 0.2s",
    marginTop: 0,
  },
  // Message d'erreur API
  errorMsg: {
    fontSize: 13, color: "#f87171",
    backgroundColor: "rgba(248,113,113,0.1)",
    border: "1px solid rgba(248,113,113,0.3)",
    borderRadius: 6, padding: "10px 14px", marginTop: 8, marginBottom: 8,
  },
  // Séparateur "Ou continuer avec"
  dividerRow: { display: "flex", alignItems: "center", gap: 16, padding: "21px 0" },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.08)" },
  dividerText: { fontSize: 13, color: "#94a3b8", whiteSpace: "nowrap" },
  // 3 boutons OAuth en grille
  oauthRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 },
  oauthBtn: {
    backgroundColor: "#0f1724",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 6, padding: 11,
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer",
  },
  oauthIcon: { width: 20, height: 20 },
  // Illustration IA côté droit
  illustration: {
    width: 500, height: 642,
    borderRadius: 8, overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0px 25px 50px -12px rgba(0,0,0,0.5)",
    flexShrink: 0,
  },
  illustrationImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
};

export default function Login() {
  // ── Récupère depuis useAuth :
  //   login(email, pwd) → déclenche POST /api/auth/login
  //   isAuthenticated   → true si token présent (rehydraté depuis localStorage)
  //   error             → message d'erreur du serveur (ex: "Email incorrect")
  //   pending           → true pendant l'appel API
  //   clearError        → remet error à null
  const { login, isAuthenticated, error, pending, clearError } = useAuth();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false); // true = texte, false = masqué
  const [remember, setRemember] = useState(true);  // case "Se souvenir de moi"

  // Déjà connecté → redirige directement, pas besoin d'afficher le formulaire
  if (isAuthenticated) return <Navigate to={ROUTES.DASHBOARD} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();  // bloque le comportement natif du formulaire HTML
    clearError();        // efface le message d'erreur précédent
    await login(email, password); // useAuth gère la redirection après succès
  };

  return (
    <div style={s.page}>

      {/* Fond étoilé cosmique (décoratif, opacity 15%) */}
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
              Pas encore de compte ?{" "}
              <Link to={ROUTES.REGISTER} style={s.headerLinkAccent}>S'inscrire</Link>
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

        {/* ── CORPS : formulaire + illustration ── */}
        <div style={s.body}>

          {/* ── CARTE FORMULAIRE ── */}
          <div style={s.card}>
            <h1 style={s.title}>Bon retour parmi nous ✈️</h1>
            <p style={s.subtitle}>
              Connectez-vous pour retrouver votre communauté de voyageurs et votre assistant IA.
            </p>

            <form onSubmit={handleSubmit}>

              {/* Champ Email */}
              <div style={s.fieldGroup}>
                <label style={s.label}>Email</label>
                <div style={s.inputWrap}>
                  <img src={imgIconEmail} alt="" style={s.inputIcon} />
                  <input
                    style={s.input}
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Champ Mot de passe avec toggle affichage */}
              <div style={{ ...s.fieldGroup, marginTop: 9 }}>
                <label style={s.label}>Mot de passe</label>
                <div style={s.inputWrap}>
                  <img src={imgIconLock} alt="" style={s.inputIcon} />
                  <input
                    style={{ ...s.input, paddingRight: 48 }}
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  {/* Clique sur l'œil → bascule showPass true/false */}
                  <button type="button" style={s.eyeBtn} onClick={() => setShowPass(!showPass)}>
                    <img src={imgIconEye} alt={showPass ? "Masquer" : "Voir"} style={s.eyeIcon} />
                  </button>
                </div>
              </div>

              {/* Ligne "Se souvenir" + "Mot de passe oublié" */}
              <div style={s.rememberRow}>
                <div style={s.checkWrap} onClick={() => setRemember(!remember)}>
                  <div style={remember ? s.checkBoxOn : s.checkBoxOff}>
                    {remember && <img src={imgIconCheck} alt="" style={s.checkIcon} />}
                  </div>
                  <span style={s.checkLabel}>Se souvenir de moi</span>
                </div>
                <button type="button" style={s.forgotLink}>Mot de passe oublié ?</button>
              </div>

              {/* Message d'erreur (visible uniquement si error !== null) */}
              {error && <div style={s.errorMsg}>{error}</div>}

              {/* Bouton submit — désactivé pendant l'appel API */}
              <button
                type="submit"
                style={{ ...s.submitBtn, opacity: pending ? 0.6 : 1, cursor: pending ? "not-allowed" : "pointer" }}
                disabled={pending}
              >
                {pending ? "Connexion en cours..." : "Se connecter"}
              </button>
            </form>

            {/* Séparateur OAuth */}
            <div style={s.dividerRow}>
              <div style={s.dividerLine} />
              <span style={s.dividerText}>Ou continuer avec</span>
              <div style={s.dividerLine} />
            </div>

            {/* Boutons OAuth (à brancher sur Passport.js ou OAuth provider) */}
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

          {/* ── ILLUSTRATION IA côté droit ── */}
          <div style={s.illustration}>
            <img src={imgTraveler} alt="Voyageur IA Libertia" style={s.illustrationImg} />
          </div>

        </div>
      </div>
    </div>
  );
}