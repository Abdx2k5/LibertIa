import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./ForgotPassword.module.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim()) {
      setErrorMsg("Veuillez saisir votre adresse email.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg("Adresse email invalide.");
      return;
    }

    setStatus("loading");
    try {
      // TODO: remplacer par authService.forgotPassword(email)
      await new Promise((r) => setTimeout(r, 1400));
      setStatus("success");
    } catch {
      setErrorMsg("Une erreur est survenue. Réessayez.");
      setStatus("error");
    }
  };

  const handleReset = () => {
    setEmail("");
    setStatus("idle");
    setErrorMsg("");
  };

  return (
    <div className={styles.root}>
      {/* Orbes d'ambiance */}
      <div className={styles.orb1} />
      <div className={styles.orb2} />
      <div className={styles.orb3} />

      {/* Grille décorative */}
      <div className={styles.grid} />

      <div className={styles.card}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9,22 9,12 15,12 15,22" />
            </svg>
          </div>
          <span className={styles.logoText}>Libertia</span>
        </Link>

        {status === "success" ? (
          /* ── Vue succès ── */
          <div className={styles.successView}>
            <div className={styles.successIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2.2" strokeLinecap="round">
                <polyline points="20,6 9,17 4,12" />
              </svg>
            </div>
            <h1 className={styles.title}>Email envoyé !</h1>
            <p className={styles.subtitle}>
              Un lien de réinitialisation a été envoyé à{" "}
              <span className={styles.emailHighlight}>{email}</span>.
              Vérifiez votre boîte de réception.
            </p>
            <p className={styles.spamNote}>
              Pas reçu ?{" "}
              <button className={styles.linkBtn} onClick={handleReset}>
                Renvoyer l'email
              </button>
            </p>
            <Link to="/login" className={styles.backLink}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Retour à la connexion
            </Link>
          </div>
        ) : (
          /* ── Vue formulaire ── */
          <>
            <div className={styles.iconWrap}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#378ADD" strokeWidth="1.8" strokeLinecap="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>

            <h1 className={styles.title}>Mot de passe oublié ?</h1>
            <p className={styles.subtitle}>
              Entrez votre adresse email et nous vous enverrons un lien
              pour réinitialiser votre mot de passe.
            </p>

            <form onSubmit={handleSubmit} className={styles.form} noValidate>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="fp-email">
                  Adresse email
                </label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </span>
                  <input
                    id="fp-email"
                    type="email"
                    className={`${styles.input} ${errorMsg ? styles.inputError : ""}`}
                    placeholder="vous@exemple.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMsg) setErrorMsg("");
                    }}
                    autoComplete="email"
                    autoFocus
                    disabled={status === "loading"}
                  />
                </div>
                {errorMsg && (
                  <span className={styles.errorMsg}>{errorMsg}</span>
                )}
              </div>

              <button
                type="submit"
                className={styles.btn}
                disabled={status === "loading"}
              >
                {status === "loading" ? (
                  <span className={styles.btnInner}>
                    <span className={styles.spinner} />
                    Envoi en cours…
                  </span>
                ) : (
                  "Envoyer le lien de réinitialisation"
                )}
              </button>
            </form>

            <div className={styles.divider} />

            <Link to="/login" className={styles.backLink}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Retour à la connexion
            </Link>
          </>
        )}
      </div>
    </div>
  );
}