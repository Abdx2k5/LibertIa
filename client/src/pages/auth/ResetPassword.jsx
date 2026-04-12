import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import styles from "./ResetPassword.module.css";
import { ROUTES } from "../../utils/constants";

// TODO: importer authService.resetPassword(token, newPassword)

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [showPwd, setShowPwd]     = useState(false);
  const [showCfm, setShowCfm]     = useState(false);
  const [status, setStatus]       = useState("idle"); // idle | loading | success | error
  const [errors, setErrors]       = useState({});

  /* ── Calcul force mot de passe ── */
  const getStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8)  score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score; // 0–5
  };
  const strength = getStrength(password);
  const strengthLabel = ["", "Très faible", "Faible", "Moyen", "Fort", "Très fort"][strength];
  const strengthClass = ["", styles.s1, styles.s2, styles.s3, styles.s4, styles.s5][strength];

  /* ── Validation ── */
  const validate = () => {
    const e = {};
    if (!password) e.password = "Le mot de passe est requis.";
    else if (password.length < 8) e.password = "Minimum 8 caractères.";
    if (!confirm) e.confirm = "Veuillez confirmer le mot de passe.";
    else if (password !== confirm) e.confirm = "Les mots de passe ne correspondent pas.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStatus("loading");
    try {
      // TODO: await authService.resetPassword(token, password);
      await new Promise((r) => setTimeout(r, 1400));
      setStatus("success");
    } catch {
      setStatus("error");
      setErrors({ global: "Lien invalide ou expiré. Demandez un nouveau lien." });
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.orb1} />
      <div className={styles.orb2} />
      <div className={styles.orb3} />
      <div className={styles.grid} />

      <div className={styles.card}>

        {/* Logo */}
        <Link to={ROUTES.HOME} className={styles.logo}>
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
            <h1 className={styles.title}>Mot de passe mis à jour !</h1>
            <p className={styles.subtitle}>
              Votre mot de passe a été réinitialisé avec succès.
              Vous pouvez maintenant vous connecter.
            </p>
            <button
              className={styles.btn}
              onClick={() => navigate(ROUTES.LOGIN)}
            >
              Se connecter
            </button>
          </div>
        ) : (
          /* ── Vue formulaire ── */
          <>
            <div className={styles.iconWrap}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#378ADD" strokeWidth="1.8" strokeLinecap="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>

            <h1 className={styles.title}>Nouveau mot de passe</h1>
            <p className={styles.subtitle}>
              Choisissez un mot de passe fort et unique pour sécuriser votre compte.
            </p>

            {errors.global && (
              <div className={styles.globalError}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {errors.global}
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form} noValidate>

              {/* ── Nouveau mot de passe ── */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="rp-password">
                  Nouveau mot de passe
                </label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  </span>
                  <input
                    id="rp-password"
                    type={showPwd ? "text" : "password"}
                    className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
                    placeholder="Min. 8 caractères"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors((v) => ({ ...v, password: "" })); }}
                    disabled={status === "loading"}
                    autoFocus
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowPwd((v) => !v)}
                    tabIndex={-1}
                    aria-label={showPwd ? "Masquer" : "Afficher"}
                  >
                    {showPwd ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width="16" height="16">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width="16" height="16">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Barre de force */}
                {password && (
                  <div className={styles.strengthWrap}>
                    <div className={styles.strengthBar}>
                      {[1,2,3,4,5].map((i) => (
                        <div
                          key={i}
                          className={`${styles.strengthSegment} ${i <= strength ? strengthClass : ""}`}
                        />
                      ))}
                    </div>
                    <span className={`${styles.strengthLabel} ${strengthClass}`}>
                      {strengthLabel}
                    </span>
                  </div>
                )}

                {errors.password && <span className={styles.errorMsg}>{errors.password}</span>}
              </div>

              {/* ── Confirmation ── */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="rp-confirm">
                  Confirmer le mot de passe
                </label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M9 12l2 2 4-4" />
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  </span>
                  <input
                    id="rp-confirm"
                    type={showCfm ? "text" : "password"}
                    className={`${styles.input} ${errors.confirm ? styles.inputError : (confirm && confirm === password ? styles.inputSuccess : "")}`}
                    placeholder="Répétez le mot de passe"
                    value={confirm}
                    onChange={(e) => { setConfirm(e.target.value); setErrors((v) => ({ ...v, confirm: "" })); }}
                    disabled={status === "loading"}
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowCfm((v) => !v)}
                    tabIndex={-1}
                    aria-label={showCfm ? "Masquer" : "Afficher"}
                  >
                    {showCfm ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width="16" height="16">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width="16" height="16">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                  {/* Checkmark si match */}
                  {confirm && confirm === password && (
                    <span className={styles.matchIcon}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2.5" strokeLinecap="round" width="14" height="14">
                        <polyline points="20,6 9,17 4,12" />
                      </svg>
                    </span>
                  )}
                </div>
                {errors.confirm && <span className={styles.errorMsg}>{errors.confirm}</span>}
              </div>

              {/* Règles */}
              <ul className={styles.rules}>
                <li className={password.length >= 8 ? styles.ruleOk : ""}>Au moins 8 caractères</li>
                <li className={/[A-Z]/.test(password) ? styles.ruleOk : ""}>Une majuscule</li>
                <li className={/[0-9]/.test(password) ? styles.ruleOk : ""}>Un chiffre</li>
                <li className={/[^A-Za-z0-9]/.test(password) ? styles.ruleOk : ""}>Un caractère spécial</li>
              </ul>

              <button
                type="submit"
                className={styles.btn}
                disabled={status === "loading"}
              >
                {status === "loading" ? (
                  <span className={styles.btnInner}>
                    <span className={styles.spinner} />
                    Réinitialisation…
                  </span>
                ) : (
                  "Réinitialiser le mot de passe"
                )}
              </button>
            </form>

            <div className={styles.divider} />

            <Link to={ROUTES.LOGIN} className={styles.backLink}>
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