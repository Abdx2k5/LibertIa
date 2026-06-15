// =============================================================
// FICHIER  : src/pages/auth/ResetPassword.jsx
// TÂCHE    : T7 — [M1] Page nouveau mot de passe
//
// Lien reçu par email → /reset-password/:token. Nouveau mot de
// passe + confirmation, jauge de robustesse, puis
// POST /api/auth/reset-password/:token. Réutilise le style Login.
// =============================================================

import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import styles from "./Login.module.css";
import authService from "../../services/auth.service";
import imgIllustration from "../../assets/images/backgrounds/TravelerIllustration.png";
import imgLogo from "../../assets/logos/logo.png";

const imgSpaceBg = "https://www.figma.com/api/mcp/asset/d42b2bd3-40e7-4c81-9e00-2f6037d84ee4";
const imgGlobe = "https://www.figma.com/api/mcp/asset/ce67d7c1-e338-4383-8ae7-5ea7ae0b31e4";

// Évalue la robustesse : 0 (vide) → 4 (fort)
function passwordScore(pwd) {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
}
const STRENGTH = [
  { label: "", color: "transparent" },
  { label: "Faible", color: "#f87171" },
  { label: "Moyen", color: "#fbbf24" },
  { label: "Bon", color: "#60a5fa" },
  { label: "Excellent", color: "#4ade80" },
];

function EyeButton({ shown, onToggle }) {
  return (
    <button type="button" className={styles.eyeBtn} onClick={onToggle} aria-label={shown ? "Masquer" : "Afficher"}>
      {shown ? (
        <svg className={styles.eyeIcon} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      ) : (
        <svg className={styles.eyeIcon} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  );
}

const LockIcon = () => (
  <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  const score = passwordScore(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Ce lien est invalide ou a expiré. Demandez un nouveau lien."
      );
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
            {done ? (
              <>
                <div style={{ fontSize: 44, marginBottom: 8 }}>✅</div>
                <h1 className={styles.title}>Mot de passe modifié</h1>
                <p className={styles.subtitle}>
                  Votre mot de passe a été réinitialisé avec succès. Redirection vers la connexion...
                </p>
                <Link to="/login" className={styles.submitBtn} style={{ display: "block", textAlign: "center", textDecoration: "none", marginTop: 8 }}>
                  Se connecter maintenant
                </Link>
              </>
            ) : (
              <>
                <h1 className={styles.title}>Nouveau mot de passe</h1>
                <p className={styles.subtitle}>
                  Choisissez un mot de passe sûr que vous n'utilisez pas ailleurs.
                </p>

                <form onSubmit={handleSubmit}>
                  {/* Nouveau mot de passe */}
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Nouveau mot de passe</label>
                    <div className={styles.inputWrap}>
                      <LockIcon />
                      <input
                        className={`${styles.input} ${styles.inputWithEye}`}
                        type={showPass ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                      />
                      <EyeButton shown={showPass} onToggle={() => setShowPass(!showPass)} />
                    </div>

                    {/* Jauge de robustesse */}
                    {password && (
                      <div style={{ marginTop: 10 }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          {[1, 2, 3, 4].map((i) => (
                            <span
                              key={i}
                              style={{
                                flex: 1,
                                height: 4,
                                borderRadius: 999,
                                background: i <= score ? STRENGTH[score].color : "rgba(255,255,255,0.1)",
                                transition: "background 0.2s",
                              }}
                            />
                          ))}
                        </div>
                        <span style={{ fontSize: 12, color: STRENGTH[score].color, fontWeight: 600 }}>
                          {STRENGTH[score].label}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Confirmation */}
                  <div className={`${styles.fieldGroup} ${styles.fieldGroupMt}`}>
                    <label className={styles.label}>Confirmer le mot de passe</label>
                    <div className={styles.inputWrap}>
                      <LockIcon />
                      <input
                        className={`${styles.input} ${styles.inputWithEye}`}
                        type={showConfirm ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        autoComplete="new-password"
                        required
                      />
                      <EyeButton shown={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} />
                    </div>
                    {confirm && confirm !== password && (
                      <span style={{ fontSize: 12, color: "#f87171", marginTop: 6, display: "block" }}>
                        Les mots de passe ne correspondent pas
                      </span>
                    )}
                  </div>

                  {error && <div className={styles.errorMsg}>{error}</div>}

                  <button
                    type="submit"
                    className={`${styles.submitBtn} ${loading ? styles.submitBtnDisabled : ""}`}
                    disabled={loading}
                  >
                    {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
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
