import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Pricing.module.css";
import { Badge, Button } from "../../components/ui";
import { ROUTES } from "../../utils/constants";
import imgLogo from "../../assets/logos/logo.png";

const IconCheck    = (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 6 9 17 4 12"/></svg>;
const IconSparkles = (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m12 3-1.9 5.7a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.7a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>;

const PREMIUM_FEATURES = [
  "Itinéraires illimités générés par l'IA",
  "Accès prioritaire aux nouvelles fonctionnalités",
  "Historique de voyages illimité",
  "Support client prioritaire",
  "Badge Premium sur votre profil",
];

const FREE_FEATURES = [
  "10 prompts IA par mois",
  "Historique des 30 derniers jours",
  "Accès à la communauté",
  "Support par email",
];

const PLANS = {
  monthly: { label: "Mensuel", price: "9,99€", period: "/ mois" },
  yearly:  { label: "Annuel",  price: "89,99€", period: "/ an", badge: "2 mois offerts" },
};

const FAQ = [
  { q: "Puis-je changer de formule à tout moment ?", a: "Oui, vous pouvez passer en Premium ou repasser en Gratuit à tout moment depuis la page de gestion de votre abonnement." },
  { q: "Que se passe-t-il si j'atteins ma limite de prompts gratuits ?", a: "Vous pourrez toujours consulter vos voyages déjà générés, mais devrez attendre le mois suivant ou passer en Premium pour continuer à générer de nouveaux itinéraires." },
  { q: "Y a-t-il un engagement ?", a: "Non, l'abonnement Premium est sans engagement et peut être annulé à tout moment." },
];

export default function Pricing() {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("libertia_token");
  const [billingCycle, setBillingCycle] = useState("monthly");

  const handleFreeClick = () => {
    navigate(isAuthenticated ? ROUTES.DASHBOARD : ROUTES.REGISTER);
  };

  const handlePremiumClick = () => {
    navigate(isAuthenticated ? ROUTES.SUBSCRIPTION : ROUTES.REGISTER);
  };

  return (
    <div className={styles.page}>
      {/* ── NAVBAR ── */}
      <nav className={styles.navbar}>
        <Link to={ROUTES.HOME} className={styles.navLogo}>
          <img src={imgLogo} alt="Libertia" className={styles.navLogoImg} />
          <span className={styles.navLogoText}>Libertia</span>
        </Link>
        <div className={styles.navActions}>
          {isAuthenticated ? (
            <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.DASHBOARD)}>
              Tableau de bord
            </Button>
          ) : (
            <>
              <Link to={ROUTES.LOGIN}><Button variant="outline" size="sm">Se connecter</Button></Link>
              <Link to={ROUTES.REGISTER}><Button variant="primary" size="sm">S'inscrire</Button></Link>
            </>
          )}
        </div>
      </nav>

      <div className={styles.main}>

        {/* ── HERO ── */}
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>Des tarifs simples, pour voyager sans limites</h1>
          <p className={styles.heroSub}>
            Commencez gratuitement et passez à Premium quand vous êtes prêt à explorer sans contraintes.
          </p>
        </section>

        {/* ── BILLING TOGGLE ── */}
        <div className={styles.billingToggle}>
          {Object.entries(PLANS).map(([key, plan]) => (
            <button
              key={key}
              type="button"
              className={`${styles.billingOption} ${billingCycle === key ? styles.billingOptionActive : ""}`}
              onClick={() => setBillingCycle(key)}
            >
              {plan.label}
              {plan.badge && <span className={styles.billingBadge}>{plan.badge}</span>}
            </button>
          ))}
        </div>

        {/* ── PLANS GRID ── */}
        <div className={styles.plansGrid}>
          {/* Plan Gratuit */}
          <div className={styles.planCard}>
            <div className={styles.planHeader}>
              <span className={styles.planName}>Gratuit</span>
              <Badge variant="default">Pour démarrer</Badge>
            </div>
            <div className={styles.planPrice}>0€ <span className={styles.planPeriod}>/ mois</span></div>
            <ul className={styles.featuresList}>
              {FREE_FEATURES.map((f) => (
                <li key={f}><span className={styles.checkIcon}><IconCheck /></span>{f}</li>
              ))}
            </ul>
            <Button variant="outline" fullWidth onClick={handleFreeClick}>
              {isAuthenticated ? "Accéder au tableau de bord" : "Commencer gratuitement"}
            </Button>
          </div>

          {/* Plan Premium */}
          <div className={`${styles.planCard} ${styles.planCardPremium}`}>
            <div className={styles.planHeader}>
              <span className={styles.planName}>Premium</span>
              <Badge variant="premium"><IconSparkles /> Recommandé</Badge>
            </div>
            <div className={styles.planPrice}>
              {PLANS[billingCycle].price} <span className={styles.planPeriod}>{PLANS[billingCycle].period}</span>
            </div>
            <ul className={styles.featuresList}>
              {PREMIUM_FEATURES.map((f) => (
                <li key={f}><span className={styles.checkIcon}><IconCheck /></span>{f}</li>
              ))}
            </ul>
            <Button variant="primary" fullWidth onClick={handlePremiumClick}>
              {isAuthenticated ? "Passer à Premium" : "S'inscrire et passer à Premium"}
            </Button>
          </div>
        </div>

        {/* ── FAQ ── */}
        <section className={styles.faqSection}>
          <h2 className={styles.faqTitle}>Questions fréquentes</h2>
          <div className={styles.faqList}>
            {FAQ.map((item) => (
              <div key={item.q} className={styles.faqItem}>
                <div className={styles.faqQuestion}>{item.q}</div>
                <div className={styles.faqAnswer}>{item.a}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section className={styles.ctaSection}>
          <h2 className={styles.ctaTitle}>Prêt à préparer votre prochain voyage ?</h2>
          <p className={styles.ctaSub}>Rejoignez Libertia et laissez l'IA organiser votre itinéraire en quelques secondes.</p>
          <Button variant="primary" size="lg" onClick={handleFreeClick}>
            {isAuthenticated ? "Aller au tableau de bord" : "Créer mon compte gratuit"}
          </Button>
        </section>

      </div>
    </div>
  );
}
