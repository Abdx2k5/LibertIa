import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Register.module.css";
import { useAuthStore } from "../../store/authStore";
import authService from "../../services/auth.service";
import {
  triggerGoogleLogin, triggerFacebookLogin, preloadOAuthScripts,
  isGoogleConfigured, isFacebookConfigured,
} from "../../utils/oauth";
import imgLogo from "../../assets/logos/logo.png";
import imgSpaceBg from "../../assets/images/backgrounds/space-bg.png";
import imgGlobe from "../../assets/icons/icon-globe-light.png";

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

const prefSvgProps = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" };
const IconMountain  = (p) => <svg {...prefSvgProps} {...p}><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>;
const IconUmbrella  = (p) => <svg {...prefSvgProps} {...p}><path d="M22 12a10.06 10.06 1 0 0-20 0Z"/><path d="M12 12v8a2 2 0 0 0 4 0"/><path d="M12 2v1"/></svg>;
const IconLandmark  = (p) => <svg {...prefSvgProps} {...p}><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>;
const IconUtensils  = (p) => <svg {...prefSvgProps} {...p}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>;
const IconSparkles  = (p) => <svg {...prefSvgProps} {...p}><path d="m12 3-1.9 5.7a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.7a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>;
const IconWallet    = (p) => <svg {...prefSvgProps} {...p}><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>;
const IconPlaneTitle = (p) => <svg {...prefSvgProps} {...p}><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-1 .1-1.3.5l-.7.8c-.4.5-.2 1.2.3 1.5L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.5 1 .7 1.5.3l.8-.7c.4-.3.6-.8.5-1.3Z"/></svg>;

const PREFERENCES = [
  { label: "Aventure",     icon: IconMountain },
  { label: "Plage",        icon: IconUmbrella },
  { label: "Culture",      icon: IconLandmark },
  { label: "Gastronomie",  icon: IconUtensils },
  { label: "Luxe",         icon: IconSparkles },
  { label: "Budget",       icon: IconWallet },
];

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  // ── Le backend n'a pas de champ prenom
  // On garde les 2 champs pour l'UX et on concatène avant l'envoi
  const [form, setForm] = useState({ nom: "", prenom: "", email: "", motDePasse: "" });
  const [prefs, setPrefs]             = useState([]);
  const [cgu, setCgu]                 = useState(false);
  const [newsletter, setNewsletter]   = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [errors, setErrors]           = useState({});
  const [oauthLoading, setOauthLoading] = useState(null); // "google" | "facebook" | null

  // Précharge les SDK OAuth dès l'arrivée sur la page, pour que le
  // clic déclenche le popup de façon synchrone (sinon le navigateur
  // le bloque, voir utils/oauth.js).
  useEffect(() => { preloadOAuthScripts(); }, []);

  // Applique la réponse plate { _id, nom, email, abonnement, token, ... }
  // qu'elle vienne de /register, /google ou /facebook — même forme partout.
  const applyLoginData = (data) => {
    login(
      {
        _id:             data._id,
        nom:             data.nom,
        email:           data.email,
        abonnement:      data.abonnement,
        profilePhoto:    data.profilePhoto,
        promptsRestants: data.promptsRestants,
      },
      data.token
    );
    navigate("/dashboard");
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

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const togglePref = (p) =>
    setPrefs((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);

  const validate = () => {
    const e = {};
    if (!form.nom.trim())           e.nom        = "Nom requis";
    if (!form.prenom.trim())        e.prenom     = "Prénom requis";
    if (!form.email.trim())         e.email      = "Email requis";
    if (form.motDePasse.length < 6) e.motDePasse = "6 caractères minimum";
    if (!cgu)                       e.cgu        = "Vous devez accepter les CGU";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError(null);
    try {
      // ── Appel API 
      // POST /api/auth/register
      // → Le backend attend : { nom, email, motDePasse }
      // → On concatène prenom + nom pour le champ nom du backend
      const data = await authService.register({
        nom:         `${form.prenom} ${form.nom}`.trim(), // ← concaténation
        email:       form.email,
        motDePasse:  form.motDePasse,
        preferences: prefs,
      });

      // ── Réponse à PLAT : { _id, nom, email, abonnement, profilePhoto, promptsRestants, token }
      applyLoginData(data);

    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.cosmicBg}>
        <img src={imgSpaceBg} alt="" className={styles.cosmicBgImg} />
      </div>

      <div className={styles.container}>
        <header className={styles.header}>
          <Link to="/" className={styles.logoWrap}>
            <img src={imgLogo} alt="Libertia" className={styles.logoImg} />
            <span className={styles.logoText}>Libertia</span>
          </Link>
          <div className={styles.headerRight}>
            <span className={styles.headerLink}>
              Déjà un compte ?{" "}
              <Link to="/login" className={styles.headerLinkAccent}>Se connecter</Link>
            </span>
            <button className={styles.iconBtn}>
              <img src={imgGlobe} alt="" className={styles.iconBtnImg} />
              FR
            </button>
          </div>
        </header>

        <div className={styles.body}>
          <div className={styles.card}>
            <h1 className={styles.title} style={{ display: "flex", alignItems: "center", gap: 10 }}>Créez votre compte <IconPlaneTitle width={24} height={24} /></h1>
            <p className={styles.subtitle}>
              Rejoignez Libertia et planifiez vos voyages avec l'IA.
            </p>

            <form onSubmit={handleSubmit}>

              {/* Nom + Prénom — 2 champs pour l'UX, concaténés avant envoi */}
              <div className={styles.grid2}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Prénom</label>
                  <div className={styles.inputWrap}>
                    <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <input
                      className={`${styles.input} ${errors.prenom ? styles.inputError : ""}`}
                      placeholder="Marie"
                      value={form.prenom}
                      onChange={update("prenom")}
                    />
                  </div>
                  {errors.prenom && <span className={styles.fieldError}>{errors.prenom}</span>}
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Nom</label>
                  <div className={styles.inputWrap}>
                    <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <input
                      className={`${styles.input} ${errors.nom ? styles.inputError : ""}`}
                      placeholder="Dupont"
                      value={form.nom}
                      onChange={update("nom")}
                    />
                  </div>
                  {errors.nom && <span className={styles.fieldError}>{errors.nom}</span>}
                </div>
              </div>

              {/* Email */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Adresse email</label>
                <div className={styles.inputWrap}>
                  <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                  <input
                    className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                    type="email"
                    placeholder="marie@email.com"
                    value={form.email}
                    onChange={update("email")}
                    autoComplete="email"
                  />
                </div>
                {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
              </div>

              {/* Mot de passe */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Mot de passe</label>
                <div className={styles.inputWrap}>
                  <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input
                    className={`${styles.input} ${errors.motDePasse ? styles.inputError : ""}`}
                    type="password"
                    placeholder="6 caractères minimum"
                    value={form.motDePasse}
                    onChange={update("motDePasse")}
                    autoComplete="new-password"
                  />
                </div>
                {errors.motDePasse && <span className={styles.fieldError}>{errors.motDePasse}</span>}
              </div>

              {/* Préférences */}
              <p className={styles.prefsLabel}>Vos centres d'intérêt (optionnel)</p>
              <div className={styles.prefsRow}>
                {PREFERENCES.map((p) => (
                  <button
                    key={p.label} type="button"
                    className={prefs.includes(p.label) ? styles.pillOn : styles.pillOff}
                    onClick={() => togglePref(p.label)}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                  >
                    <p.icon /> {p.label}
                  </button>
                ))}
              </div>

              {/* CGU + Newsletter */}
              <div className={styles.checkSection}>
                <div className={styles.checkRow} onClick={() => setCgu(!cgu)}>
                  <div className={cgu ? styles.checkBoxOn : styles.checkBoxOff}>
                    {cgu && (
                      <svg className={styles.checkIcon} viewBox="0 0 14 14" fill="none" stroke="#061826" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="2 7 6 11 12 3"/>
                      </svg>
                    )}
                  </div>
                  <span className={`${styles.checkLabel} ${errors.cgu ? styles.checkLabelErr : ""}`}>
                    J'accepte les{" "}
                    <Link to="/cgu" className={styles.headerLinkAccent}>conditions d'utilisation</Link>
                    {errors.cgu && ` — ${errors.cgu}`}
                  </span>
                </div>

                <div className={styles.checkRow} onClick={() => setNewsletter(!newsletter)}>
                  <div className={newsletter ? styles.checkBoxOn : styles.checkBoxOff}>
                    {newsletter && (
                      <svg className={styles.checkIcon} viewBox="0 0 14 14" fill="none" stroke="#061826" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="2 7 6 11 12 3"/>
                      </svg>
                    )}
                  </div>
                  <span className={styles.checkLabel}>Recevoir les offres et actualités Libertia</span>
                </div>
              </div>

              {/* Erreur globale */}
              {error && <div className={styles.errorMsg}>{error}</div>}

              {/* Submit */}
              <button
                type="submit"
                className={`${styles.submitBtn} ${loading ? styles.submitBtnDisabled : ""}`}
                disabled={loading}
              >
                {loading ? "Création en cours..." : "Créer mon compte"}
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
        </div>
      </div>
    </div>
  );
}