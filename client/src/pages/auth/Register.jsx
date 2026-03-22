import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Register.module.css";
import { useAuthStore } from "../../store/authStore";
import authService from "../../services/Auth.service";

// ── Assets Figma ──────────────────────────────────────────────
const imgLogo     = "https://www.figma.com/api/mcp/asset/d93104aa-ce16-42fe-b9cd-8bbe43f0929d";
const imgSpaceBg  = "https://www.figma.com/api/mcp/asset/d42b2bd3-40e7-4c81-9e00-2f6037d84ee4";
const imgGlobe    = "https://www.figma.com/api/mcp/asset/ce67d7c1-e338-4383-8ae7-5ea7ae0b31e4";
const imgGoogle   = "https://www.figma.com/api/mcp/asset/94a3da07-8c28-40f0-bd59-a220992a155e";
const imgFacebook = "https://www.figma.com/api/mcp/asset/7fcf71f1-40e1-4dd3-9b79-ee4ee4331312";
const imgApple    = "https://www.figma.com/api/mcp/asset/c6cb727c-10ea-4a6f-bc2a-08669c4a1d16";

const PREFERENCES = ["Aventure 🏔️", "Plage 🏖️", "Culture 🏛️", "Gastronomie 🍜", "Luxe ✨", "Budget 💰"];

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [form, setForm] = useState({ nom: "", prenom: "", email: "", motDePasse: "" });
  const [prefs, setPrefs]         = useState([]);
  const [cgu, setCgu]             = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [errors, setErrors]       = useState({});

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const togglePref = (p) =>
    setPrefs((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);

  const validate = () => {
    const e = {};
    if (!form.nom.trim())      e.nom      = "Nom requis";
    if (!form.prenom.trim())   e.prenom   = "Prénom requis";
    if (!form.email.trim())    e.email    = "Email requis";
    if (form.motDePasse.length < 8) e.motDePasse = "8 caractères minimum";
    if (!cgu)                  e.cgu      = "Vous devez accepter les CGU";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await authService.register({ ...form, preferences: prefs });
      login(data.user, data.token);
      // Si un prompt IA était stocké → redirige vers dashboard
      navigate(sessionStorage.getItem("libertia_prompt") ? "/dashboard" : "/dashboard");
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

        {/* ── Header ── */}
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

        {/* ── Body ── */}
        <div className={styles.body}>
          <div className={styles.card}>
            <h1 className={styles.title}>Créez votre compte ✈️</h1>
            <p className={styles.subtitle}>
              Rejoignez Libertia et planifiez vos voyages avec l'IA.
            </p>

            <form onSubmit={handleSubmit}>

              {/* Nom + Prénom */}
              <div className={styles.grid2}>
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
                    placeholder="8 caractères minimum"
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
                    key={p} type="button"
                    className={prefs.includes(p) ? styles.pillOn : styles.pillOff}
                    onClick={() => togglePref(p)}
                  >
                    {p}
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
        </div>
      </div>
    </div>
  );
}