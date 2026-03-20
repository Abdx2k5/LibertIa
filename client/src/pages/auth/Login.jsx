import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import { useAuthStore } from "../../store/authStore";
import authService from "../../services/Auth.service";

// ── Assets Figma ──────────────────────────────────────────────
const imgLogo      = "https://www.figma.com/api/mcp/asset/d93104aa-ce16-42fe-b9cd-8bbe43f0929d";
const imgHero      = "https://www.figma.com/api/mcp/asset/2d1d879d-a4d2-4bc2-98bf-7842a9327598";
const imgSpaceBg   = "https://www.figma.com/api/mcp/asset/d42b2bd3-40e7-4c81-9e00-2f6037d84ee4";
const imgGlobe     = "https://www.figma.com/api/mcp/asset/ce67d7c1-e338-4383-8ae7-5ea7ae0b31e4";
const imgGoogle    = "https://www.figma.com/api/mcp/asset/94a3da07-8c28-40f0-bd59-a220992a155e";
const imgFacebook  = "https://www.figma.com/api/mcp/asset/7fcf71f1-40e1-4dd3-9b79-ee4ee4331312";
const imgApple     = "https://www.figma.com/api/mcp/asset/c6cb727c-10ea-4a6f-bc2a-08669c4a1d16";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPass, setShowPass]     = useState(false);
  const [remember, setRemember]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError("Veuillez remplir tous les champs."); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login({ email, motDePasse: password });
      login(data.user, data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className={styles.title}>Bon retour ! 👋</h1>
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
                {[
                  { src: imgGoogle,   alt: "Google" },
                  { src: imgFacebook, alt: "Facebook" },
                  { src: imgApple,    alt: "Apple" },
                ].map((o) => (
                  <button key={o.alt} type="button" className={styles.oauthBtn}>
                    <img src={o.src} alt={o.alt} className={styles.oauthIcon} />
                  </button>
                ))}
              </div>

            </form>
          </div>

          {/* Illustration */}
          <div className={styles.illustration}>
            <img src={imgHero} alt="Voyage" className={styles.illustrationImg} />
          </div>

        </div>
      </div>
    </div>
  );
}