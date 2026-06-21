import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Subscription.module.css";
import { useAuthStore } from "../../store/authStore";
import { Badge, Button, Modal } from "../../components/ui";
import FindFriendsModal from "../../components/modals/FindFriendsModal";
import { FREEMIUM, ROUTES } from "../../utils/constants";

const IconCheck      = (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 6 9 17 4 12"/></svg>;
const IconSparkles   = (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m12 3-1.9 5.7a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.7a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>;
const IconCreditCard = (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4, verticalAlign: -3 }} {...p}><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>;
const IconUserPlus   = (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>;

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
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const isPremium = user?.abonnement === "premium";
  const promptsUsed = user?.promptsUtilises || 0;
  const promptsLeft = FREEMIUM.MAX_FREE_PROMPTS - promptsUsed;

  const [billingCycle, setBillingCycle] = useState("monthly");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [findFriendsOpen, setFindFriendsOpen] = useState(false);
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
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <div>
            <h1 className={styles.pageTitle}>Mon abonnement</h1>
            <p className={styles.pageSub}>Gérez votre formule et débloquez plus de fonctionnalités.</p>
          </div>
          <button
            type="button"
            onClick={() => setFindFriendsOpen(true)}
            title="Trouver des amis"
            aria-label="Trouver des amis"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: "var(--bg-secondary)", border: "1px solid var(--border)",
              color: "var(--text)", cursor: "pointer",
            }}
          >
            <IconUserPlus />
          </button>
        </div>

        {/* ── Plan actuel ── */}
        <div className={styles.section}>
          <div className={styles.currentPlanRow}>
            <div>
              <div className={styles.currentPlanLabel}>Formule actuelle</div>
              <div className={styles.currentPlanName}>
                {isPremium ? "Premium" : "Gratuit"}
                {isPremium && <Badge variant="premium" style={{ marginLeft: 10 }}><IconSparkles /> Premium</Badge>}
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
              Débloquez des itinéraires illimités et profitez de tous les avantages Libertia.{" "}
              <button type="button" className={styles.linkBtn} onClick={() => navigate(ROUTES.PRICING)}>
                Voir la comparaison détaillée des tarifs →
              </button>
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
                    <li key={f}><span className={styles.checkIcon}><IconCheck /></span>{f}</li>
                  ))}
                </ul>
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
                <span className={styles.manageValue}><IconCreditCard />•••• •••• •••• 4242</span>
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

        <FindFriendsModal isOpen={findFriendsOpen} onClose={() => setFindFriendsOpen(false)} />

      </div>
    </div>
  );
}
