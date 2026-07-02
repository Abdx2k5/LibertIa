import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./Community.module.css";
import PostCard from "../../components/ui/PostCard";
import FollowButton from "../../components/ui/FollowButton";
import FindFriendsModal from "../../components/modals/FindFriendsModal";
import { ROUTES, publicProfilePath } from "../../utils/constants";
import { useTranslation } from "../../hooks/useTranslation";
import { MOCK_POSTS, MOCK_TRAVELERS } from "../../mocks/communityPosts";

const IconUserPlus = (p) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
  </svg>
);

import composerAvatar from "../../assets/images/community/profile.png";

const filterTabs = ["Pour vous", "Récent", "Populaire", "Abonnements"];
const composerActions = ["Photo", "Vidéo", "Lieu", "Écrire un article"];

const trendingDestinations = [
  { tag: "#Japon", count: 1482 },
  { tag: "#Portugal", count: 902 },
  { tag: "#Marrakech", count: 774 },
  { tag: "#Bali", count: 645 },
];

const popularGroups = [
  { nom: "Voyages solo Europe", membres: "12,4k membres" },
  { nom: "Road trips gourmands", membres: "8,1k membres" },
  { nom: "Digital nomads Asie", membres: "14,7k membres" },
];

const upcomingEvents = [
  { nom: "Rencontre Tokyo", details: "12 juin • 2h" },
  { nom: "Atelier budget voyage", details: "15 juin • 1h30" },
  { nom: "Soirée cartes postales", details: "18 juin • 3h" },
];

export default function Community() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const activeTab = "Pour vous";
  const [findFriendsOpen, setFindFriendsOpen] = useState(false);

  return (
    <main className={styles.page}>
      
      <div className={styles.container}>
        <section className={styles.mainColumn}>
          <header className={styles.heroCard}>
            <div className={styles.heroText}>
              <span className={styles.heroKicker}>{t("communityKicker")}</span>
              <h1 className={styles.heroTitle}>
                La communauté <span>Libertia</span>
              </h1>
              <p className={styles.heroSubtitle}>
                {t("communityHeroSubtitle")}
              </p>

              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <span className={styles.statValue}>12 458</span>
                  <span className={styles.statLabel}>voyageurs</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statValue}>3 892</span>
                  <span className={styles.statLabel}>voyages</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statValue}>15 240</span>
                  <span className={styles.statLabel}>photos</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statValue}>1 205</span>
                  <span className={styles.statLabel}>rencontres</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button type="button" className={styles.heroButton} onClick={() => navigate(ROUTES.GROUPS)}>
                {t("communityHeroButton")}
              </button>
              <button
                type="button"
                className={styles.heroButton}
                onClick={() => setFindFriendsOpen(true)}
                style={{ background: "var(--bg-tertiary)", color: "var(--text)", display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <IconUserPlus /> Trouver des amis
              </button>
            </div>
          </header>

          <section className={styles.composerCard}>
            <div className={styles.composerTopRow}>
              <img src={composerAvatar} alt="Votre avatar" className={styles.composerAvatar} />
              <input
                type="text"
                className={styles.composerInput}
                placeholder="Partagez votre expérience..."
                readOnly
              />
            </div>

            <div className={styles.composerActions}>
              {composerActions.map((action) => (
                <button key={action} type="button" className={styles.composerActionButton}>
                  {action}
                </button>
              ))}

              <button type="button" className={styles.publishButton}>
                Publier
              </button>
            </div>
          </section>

          <section className={styles.filterTabs} aria-label="Filtres de publications">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`${styles.filterTab} ${tab === activeTab ? styles.filterTabActive : ""}`}
              >
                {tab}
              </button>
            ))}
          </section>

          <section className={styles.feedList}>
            {MOCK_POSTS.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </section>
        </section>

        <aside className={styles.sidebarColumn}>
          <section className={styles.sidebarCard}>
            <h2 className={styles.sidebarTitle}>Voyageurs à rencontrer</h2>
            <div className={styles.userList}>
              {MOCK_TRAVELERS.map((user) => (
                <div key={user.id} className={styles.userRow}>
                  <Link to={publicProfilePath(user.id)} className={styles.userIdentity}>
                    <img src={user.avatar} alt={user.nom} className={styles.userAvatar} />
                    <div>
                      <p className={styles.userName}>{user.nom}</p>
                      <p className={styles.userInfo}>{user.info}</p>
                    </div>
                  </Link>
                  <FollowButton size="sm" />
                </div>
              ))}
            </div>
          </section>

          <section className={styles.sidebarCard}>
            <h2 className={styles.sidebarTitle}>Destinations tendances</h2>
            <div className={styles.tagList}>
              {trendingDestinations.map((item) => (
                <div key={item.tag} className={styles.tagRow}>
                  <span className={styles.tagName}>{item.tag}</span>
                  <span className={styles.tagCount}>{item.count} publications</span>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.sidebarCard}>
            <h2 className={styles.sidebarTitle}>Groupes populaires</h2>
            <div className={styles.groupList}>
              {popularGroups.map((group) => (
                <div key={group.nom} className={styles.groupRow} onClick={() => navigate(ROUTES.GROUPS)}>
                  <div>
                    <p className={styles.groupName}>{group.nom}</p>
                    <p className={styles.groupInfo}>{group.membres}</p>
                  </div>
                  <span className={styles.groupArrow}>›</span>
                </div>
              ))}
            </div>
            <button type="button" className={styles.followButton} style={{ width: "100%", marginTop: 12 }} onClick={() => navigate(ROUTES.GROUPS)}>
              Découvrir tous les groupes
            </button>
          </section>

          <section className={styles.sidebarCard}>
            <h2 className={styles.sidebarTitle}>Événements à venir</h2>
            <div className={styles.eventList}>
              {upcomingEvents.map((event) => (
                <div key={event.nom} className={styles.eventRow}>
                  <p className={styles.eventName}>{event.nom}</p>
                  <p className={styles.eventInfo}>{event.details}</p>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.partnerCard}>
            <span className={styles.partnerKicker}>Offre partenaire</span>
            <h2 className={styles.partnerTitle}>Réservez mieux, partez plus loin.</h2>
            <p className={styles.partnerText}>
              Profitez d’avantages exclusifs sur des hébergements et activités recommandés par la communauté.
            </p>
            <button type="button" className={styles.partnerButton}>
              Découvrir
            </button>
          </section>
        </aside>
      </div>

      <FindFriendsModal isOpen={findFriendsOpen} onClose={() => setFindFriendsOpen(false)} />
    </main>
  );
}
