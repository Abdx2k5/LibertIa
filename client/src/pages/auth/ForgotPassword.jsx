// =============================================================
// FICHIER  : src/pages/auth/ForgotPassword.jsx
// TÂCHE    : T5 — [M1] Page mot de passe oublié
//
// Saisie de l'email → POST /api/auth/forgot-password.
// Affiche un écran de confirmation (toujours "succès" pour ne pas
// révéler si l'email existe). Réutilise le style de Login.
// =============================================================

import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Login.module.css";
import authService from "../../services/auth.service";
import imgIllustration from "../../assets/images/backgrounds/TravelerIllustration.png";
import imgLogo from "../../assets/logos/logo.png";

const imgSpaceBg = "https://www.figma.com/api/mcp/asset/d42b2bd3-40e7-4c81-9e00-2f6037d84ee4";
const imgGlobe = "https://www.figma.com/api/mcp/asset/ce67d7c1-e338-4383-8ae7-5ea7ae0b31e4";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Veuillez saisir votre adresse email.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err) {
      // On affiche quand même la confirmation si le backend renvoie 404
      // (sécurité : ne pas divulguer l'existence d'un compte).
      if (err.response && err.response.status >= 500) {
        setError("Une erreur est survenue. Réessayez plus tard.");
      } else {
        setSent(true);
      }
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
        {/* Header */}
        <header className={styles.header}>
          <Link to="/" className={styles.logoWrap}>
            <img src={imgLogo} alt="Libertia" className={styles.logoImg} />
            <span className={styles.logoText}>Libertia</span>
          </Link>
          <div className={styles.headerRight}>
            <span className={styles.headerLink}>
              Vous vous souvenez ?{" "}
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
            {sent ? (
              <>
                <div style={{ fontSize: 44, marginBottom: 8 }}>📬</div>
                <h1 className={styles.title}>Vérifiez vos emails</h1>
                <p className={styles.subtitle}>
                  Si un compte est associé à <strong style={{ color: "#e7f0ff" }}>{email}</strong>,
                  vous recevrez un lien pour réinitialiser votre mot de passe dans quelques minutes.
                </p>
                <Link to="/login" className={styles.submitBtn} style={{ display: "block", textAlign: "center", textDecoration: "none", marginTop: 8 }}>
                  Retour à la connexion
                </Link>
                <p className={styles.subtitle} style={{ marginTop: 16, fontSize: 13 }}>
                  Pas reçu d'email ?{" "}
                  <button
                    type="button"
                    onClick={() => setSent(false)}
                    style={{ background: "none", border: "none", color: "#00d9ff", cursor: "pointer", padding: 0, font: "inherit" }}
                  >
                    Réessayer
                  </button>
                </p>
              </>
            ) : (
              <>
                <h1 className={styles.title}>Mot de passe oublié ?</h1>
                <p className={styles.subtitle}>
                  Pas de panique. Saisissez votre email et nous vous enverrons un lien de réinitialisation.
                </p>

                <form onSubmit={handleSubmit}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Adresse email</label>
                    <div className={styles.inputWrap}>
                      <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
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

                  {error && <div className={styles.errorMsg}>{error}</div>}

                  <button
                    type="submit"
                    className={`${styles.submitBtn} ${loading ? styles.submitBtnDisabled : ""}`}
                    disabled={loading}
                  >
                    {loading ? "Envoi en cours..." : "Envoyer le lien"}
                  </button>
                </form>

                <p className={styles.subtitle} style={{ marginTop: 18, textAlign: "center", fontSize: 13 }}>
                  <Link to="/login" className={styles.headerLinkAccent}>← Retour à la connexion</Link>
                </p>
              </>
            )}
          </div>

          <div className={styles.illustration}>
            <img src={imgIllustration} alt="Voyage" className={styles.illustrationImg} />
          </div>
        </div>
      </div>
    </div>
  );
}
