import { useState } from "react";
import styles from "./Subscription.module.css";
import { useAuthStore } from "../../store/authStore";
import { Badge, Button, Modal } from "../../components/ui";
import { FREEMIUM } from "../../utils/constants";

const PREMIUM_FEATURES = [
  "Itinéraires illimités générés par l'IA",
  "Accès prioritaire aux nouvelles fonctionnalités",
  "Historique de voyages illimité",
  "Support client prioritaire",
  "Badge Premium sur votre profil",
];

const FREE_FEATURES = [
  `${FREEMIUM.MAX_FREE_PROMPTS} prompts IA par mois`,
  "Historique des 30 derniers jours",
  "Accès à la communauté",
  "Support par email",
];

const PLANS = {
  monthly: { label: "Mensuel", price: "9,99€", period: "/ mois" },
  yearly:  { label: "Annuel",  price: "89,99€", period: "/ an", badge: "2 mois offerts" },
};

export default function Subscription() {
  const { user, updateUser } = useAuthStore();
  const isPremium = user?.abonnement === "premium";
  const promptsUsed = user?.promptsUtilises || 0;
  const promptsLeft = FREEMIUM.MAX_FREE_PROMPTS - promptsUsed;

  const [billingCycle, setBillingCycle] = useState("monthly");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // ── Simule le passage en Premium (en attendant l'API de paiement) ──
  const handleUpgrade = async () => {
    setLoading(true);
    try {
      // TODO: brancher sur l'API de paiement réelle (ex: POST /api/subscription/upgrade)
      updateUser({ ...user, abonnement: "premium" });
    } finally {
      setLoading(false);
    }
  };

  // ── Simule l'annulation de l'abonnement Premium ──
  const handleCancel = async () => {
    setLoading(true);
    try {
      // TODO: brancher sur l'API réelle (ex: POST /api/subscription/cancel)
      updateUser({ ...user, abonnement: "free" });
      setCancelModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.main}>
        <h1 className={styles.pageTitle}>Mon abonnement</h1>
        <p className={styles.pageSub}>Gérez votre formule et débloquez plus de fonctionnalités.</p>

        {/* ── Plan actuel ── */}
        <div className={styles.section}>
          <div className={styles.currentPlanRow}>
            <div>
              <div className={styles.currentPlanLabel}>Formule actuelle</div>
              <div className={styles.currentPlanName}>
                {isPremium ? "Premium" : "Gratuit"}
                {isPremium && <Badge variant="premium" style={{ marginLeft: 10 }}>✨ Premium</Badge>}
              </div>
            </div>
            <div className={styles.currentPlanStats}>
              <div className={styles.statBlock}>
                <span className={styles.statNum}>{isPremium ? "∞" : `${promptsLeft}/${FREEMIUM.MAX_FREE_PROMPTS}`}</span>
                <span className={styles.statLabel}>Prompts restants</span>
              </div>
              <div className={styles.statBlock}>
                <span className={styles.statNum}>{promptsUsed}</span>
                <span className={styles.statLabel}>Itinéraires générés</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Upgrade to Premium ── */}
        {!isPremium && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Passer à Premium</h2>
            <p className={styles.sectionSub}>
              Débloquez des itinéraires illimités et profitez de tous les avantages Libertia.
            </p>

            {/* Toggle mensuel / annuel */}
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

            <div className={styles.plansGrid}>
              {/* Plan Gratuit */}
              <div className={styles.planCard}>
                <div className={styles.planHeader}>
                  <span className={styles.planName}>Gratuit</span>
                  <Badge variant="default">Plan actuel</Badge>
                </div>
                <div className={styles.planPrice}>0€ <span className={styles.planPeriod}>/ mois</span></div>
                <ul className={styles.featuresList}>
                  {FREE_FEATURES.map((f) => (
                    <li key={f}><span className={styles.checkIcon}>✓</span>{f}</li>
                  ))}
                </ul>
              </div>

              {/* Plan Premium */}
              <div className={`${styles.planCard} ${styles.planCardPremium}`}>
                <div className={styles.planHeader}>
                  <span className={styles.planName}>Premium</span>
                  <Badge variant="premium">✨ Recommandé</Badge>
                </div>
                <div className={styles.planPrice}>
                  {PLANS[billingCycle].price} <span className={styles.planPeriod}>{PLANS[billingCycle].period}</span>
                </div>
                <ul className={styles.featuresList}>
                  {PREMIUM_FEATURES.map((f) => (
                    <li key={f}><span className={styles.checkIcon}>✓</span>{f}</li>
                  ))}
                </ul>
                <Button variant="primary" fullWidth loading={loading} onClick={handleUpgrade}>
                  Passer à Premium
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── Manage subscription ── */}
        {isPremium && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Gérer mon abonnement</h2>

            <div className={styles.manageRow}>
              <div className={styles.manageInfo}>
                <span className={styles.manageLabel}>Formule</span>
                <span className={styles.manageValue}>
                  Premium — {billingCycle === "yearly" ? "Annuel" : "Mensuel"} ({PLANS[billingCycle].price} {PLANS[billingCycle].period})
                </span>
              </div>
            </div>

            <div className={styles.manageRow}>
              <div className={styles.manageInfo}>
                <span className={styles.manageLabel}>Prochaine facturation</span>
                <span className={styles.manageValue}>13 juillet 2026</span>
              </div>
            </div>

            <div className={styles.manageRow}>
              <div className={styles.manageInfo}>
                <span className={styles.manageLabel}>Moyen de paiement</span>
                <span className={styles.manageValue}>💳 •••• •••• •••• 4242</span>
              </div>
              <Button variant="outline" size="sm">Modifier</Button>
            </div>

            <div className={styles.dangerZone}>
              <div>
                <div className={styles.dangerTitle}>Annuler l'abonnement</div>
                <div className={styles.dangerText}>
                  Vous repasserez en formule Gratuite à la fin de la période en cours.
                </div>
              </div>
              <Button variant="danger" size="sm" onClick={() => setCancelModalOpen(true)}>
                Annuler l'abonnement
              </Button>
            </div>
          </div>
        )}

        {/* ── Modal de confirmation d'annulation ── */}
        <Modal
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          title="Annuler l'abonnement Premium ?"
        >
          <p style={{ fontSize: 14, color: "#a1a1aa", marginBottom: 24 }}>
            Vous perdrez l'accès aux itinéraires illimités et aux autres avantages Premium
            à la fin de la période en cours. Cette action peut être annulée à tout moment.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <Button variant="outline" onClick={() => setCancelModalOpen(false)}>
              Conserver Premium
            </Button>
            <Button variant="danger" loading={loading} onClick={handleCancel}>
              Confirmer l'annulation
            </Button>
          </div>
        </Modal>

      </div>
    </div>
  );
}
