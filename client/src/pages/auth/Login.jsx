import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import { useAuthStore } from "../../store/authStore";
import authService from "../../services/auth.service";
import {
  triggerGoogleLogin, triggerFacebookLogin, preloadOAuthScripts,
  isGoogleConfigured, isFacebookConfigured,
} from "../../utils/oauth";
import imgIllustration from "../../assets/images/backgrounds/TravelerIllustration.png";
import imgLogo      from "../../assets/logos/logo.png";
import imgSpaceBg   from "../../assets/images/backgrounds/space-bg.png";
import imgGlobe     from "../../assets/icons/icon-globe-light.png";

const IconGoogle = (p) => (
  <svg viewBox="0 0 24 24" width="20" height="20" {...p}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);
const IconFacebook = (p) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="#1877F2" {...p}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.875v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);
const IconInstagram = (p) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#E4405F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="#E4405F"/>
  </svg>
);

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPass, setShowPass]     = useState(false);
  const [remember, setRemember]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [oauthLoading, setOauthLoading] = useState(null); // "google" | "facebook" | null

  // Précharge les SDK OAuth dès l'arrivée sur la page, pour que le
  // clic déclenche le popup de façon synchrone (sinon le navigateur
  // le bloque, voir utils/oauth.js).
  useEffect(() => { preloadOAuthScripts(); }, []);

  // Applique la réponse plate { _id, nom, email, abonnement, token, ... }
  // qu'elle vienne de /login, /google ou /facebook — même forme partout.
  // On transmet tout sauf les jetons : ne pas trier les champs ici évite
  // de perdre bio/age/preferences/followers... à chaque (re)connexion.
  const applyLoginData = (data) => {
    const { token, refreshToken: _refreshToken, ...userData } = data;
    login(userData, token);
    navigate("/dashboard");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError("Veuillez remplir tous les champs."); return; }
    setLoading(true);
    setError(null);
    try {
      // ── Appel API ──────────────────────────────────────────────
      // POST /api/auth/login → { _id, nom, email, abonnement, profilePhoto, promptsRestants, token }
      const data = await authService.login({ email, motDePasse: password });
      applyLoginData(data);
    } catch (err) {
      setError(err.response?.data?.message || "Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setOauthLoading("google");
    try {
      const accessToken = await triggerGoogleLogin();
      const data = await authService.loginWithGoogle(accessToken);
      applyLoginData(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Connexion Google impossible.");
    } finally {
      setOauthLoading(null);
    }
  };

  const handleFacebookLogin = async () => {
    setError(null);
    setOauthLoading("facebook");
    try {
      const accessToken = await triggerFacebookLogin();
      const data = await authService.loginWithFacebook(accessToken);
      applyLoginData(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Connexion Facebook impossible.");
    } finally {
      setOauthLoading(null);
    }
  };

  const OAUTH_PROVIDERS = [
    { key: "google", label: "Google", Icon: IconGoogle, configured: isGoogleConfigured(), onClick: handleGoogleLogin },
    { key: "facebook", label: "Facebook", Icon: IconFacebook, configured: isFacebookConfigured(), onClick: handleFacebookLogin },
    { key: "instagram", label: "Instagram", Icon: IconInstagram, configured: false, onClick: null },
  ];

  return (
    <div className={styles.page}>
      {/* Fond cosmique */}
      <div className={styles.cosmicBg}>
        <img src={imgSpaceBg} alt="" className={styles.cosmicBgImg} />
      </div>

      <div className={styles.container}>

        {/* ── Header ── */}
        <header className={styles.header}>
          <Link to="/" className={styles.logoWrap}>
            <img src={imgLogo} alt="Libertia" className={styles.logoImg} />
            <span className={styles.logoText}>Libertia</span>
          </Link>
          <div className={styles.headerRight}>
            <span className={styles.headerLink}>
              Pas encore de compte ?{" "}
              <Link to="/register" className={styles.headerLinkAccent}>S'inscrire</Link>
            </span>
            <button className={styles.iconBtn}>
              <img src={imgGlobe} alt="" className={styles.iconBtnImg} />
              FR
            </button>
          </div>
        </header>

        {/* ── Body ── */}
        <div className={styles.body}>

          {/* Formulaire */}
          <div className={styles.card}>
            <h1 className={styles.title}>Bon retour ! </h1>
            <p className={styles.subtitle}>
              Connectez-vous pour accéder à votre assistant de voyage personnel.
            </p>

            <form onSubmit={handleSubmit}>

              {/* Email */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Adresse email</label>
                <div className={styles.inputWrap}>
                  <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                  <input
                    className={styles.input}
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div className={`${styles.fieldGroup} ${styles.fieldGroupMt}`}>
                <label className={styles.label}>Mot de passe</label>
                <div className={styles.inputWrap}>
                  <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input
                    className={`${styles.input} ${styles.inputWithEye}`}
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
                    {showPass ? (
                      <svg className={styles.eyeIcon} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg className={styles.eyeIcon} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Se souvenir + mot de passe oublié */}
              <div className={styles.rememberRow}>
                <div className={styles.checkWrap} onClick={() => setRemember(!remember)}>
                  <div className={remember ? styles.checkBoxOn : styles.checkBoxOff}>
                    {remember && (
                      <svg className={styles.checkIcon} viewBox="0 0 14 14" fill="none" stroke="#061826" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="2 7 6 11 12 3"/>
                      </svg>
                    )}
                  </div>
                  <span className={styles.checkLabel}>Se souvenir de moi</span>
                </div>
                <Link to="/forgot-password" className={styles.forgotLink}>
                  Mot de passe oublié ?
                </Link>
              </div>

              {/* Erreur */}
              {error && <div className={styles.errorMsg}>{error}</div>}

              {/* Submit */}
              <button
                type="submit"
                className={`${styles.submitBtn} ${loading ? styles.submitBtnDisabled : ""}`}
                disabled={loading}
              >
                {loading ? "Connexion en cours..." : "Se connecter"}
              </button>

              {/* Divider */}
              <div className={styles.dividerRow}>
                <div className={styles.dividerLine} />
                <span className={styles.dividerText}>ou continuer avec</span>
                <div className={styles.dividerLine} />
              </div>

              {/* OAuth */}
              <div className={styles.oauthRow}>
                {OAUTH_PROVIDERS.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    className={styles.oauthBtn}
                    onClick={p.configured ? p.onClick : undefined}
                    disabled={!p.configured || oauthLoading !== null}
                    aria-label={p.label}
                    title={p.configured ? p.label : "Bientôt disponible"}
                    style={!p.configured ? { opacity: 0.4, cursor: "not-allowed" } : undefined}
                  >
                    <p.Icon className={styles.oauthIcon} />
                  </button>
                ))}
              </div>

            </form>
          </div>

          {/* Illustration */}
          <div className={styles.illustration}>
          < img src={imgIllustration} alt="Voyage" className={styles.illustrationImg} />
        
          </div>
          
        </div>
      </div>
    </div>
  );
}