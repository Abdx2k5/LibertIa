import styles from "./Community.module.css";
import PostCard from "../../components/ui/PostCard";

import avatar1 from "../../assets/images/community/avatar-1.png";
import avatar2 from "../../assets/images/community/avatar-2.png";
import avatar3 from "../../assets/images/community/avatar-3.png";
import composerAvatar from "../../assets/images/community/profile.png";
import tripMark from "../../assets/images/community/trip-mark.png";
import tripSarah from "../../assets/images/community/trip-sarah.png";

const mockPosts = [
  {
    id: "1",
    auteur: {
      nom: "Sophie Martin",
      avatar: null,
      badge: "Guide certifié",
      localisation: "Tokyo, Japon",
    },
    temps: "il y a 2 heures",
    contenu: "Ma première expérience avec Libertia a été impeccable. J’ai trouvé un vol, un hôtel et même des activités adaptées à mon budget en quelques minutes.",
    images: [tripMark, tripSarah],
    tags: ["#Japon", "#voyage", "#solo"],
    likes: 234,
    commentaires: 45,
    partages: 12,
    type: "post",
  },
  {
    id: "2",
    auteur: {
      nom: "Mehdi El Amrani",
      avatar: avatar1,
      badge: "Membre actif",
      localisation: "Lisbonne, Portugal",
    },
    temps: "il y a 4 heures",
    contenu: "Quelqu’un a testé les quartiers calmes pour un séjour de 4 jours ? Je cherche une ambiance locale, pas trop touristique.",
    images: [],
    tags: ["#Portugal", "#citybreak", "#conseils"],
    likes: 98,
    commentaires: 21,
    partages: 7,
    type: "post",
  },
  {
    id: "3",
    auteur: {
      nom: "Nina Laurent",
      avatar: avatar2,
      badge: "Rédactrice voyage",
      localisation: "Bali, Indonésie",
    },
    temps: "hier",
    contenu: "Découvrez comment organiser un voyage lent à Bali sans exploser votre budget ni rater les meilleurs spots au lever du soleil.",
    images: [tripSarah],
    tags: ["#article", "#budget", "#inspiration"],
    likes: 412,
    commentaires: 66,
    partages: 24,
    type: "article",
  },
  {
    id: "4",
    auteur: {
      nom: "Collectif Alpes",
      avatar: avatar3,
      badge: "Groupe vérifié",
      localisation: "Chamonix, France",
    },
    temps: "il y a 6 heures",
    contenu: "Nous organisons une semaine ski et coworking avec des activités le soir. Débutants bienvenus, ambiance détendue.",
    images: [tripMark, tripSarah, composerAvatar],
    tags: ["#groupe", "#alpines", "#coworking"],
    likes: 156,
    commentaires: 18,
    partages: 9,
    type: "groupe",
  },
  {
    id: "5",
    auteur: {
      nom: "Thomas R.",
      avatar: null,
      badge: "Explorateur",
      localisation: "Séoul, Corée du Sud",
    },
    temps: "il y a 1 jour",
    contenu: "Libertia m’a évité trois heures de recherche. J’ai pu comparer les activités, réserver rapidement et garder une vraie marge pour profiter sur place.",
    images: [tripSarah, tripMark],
    tags: ["#avis", "#gaindetemps"],
    likes: 12400,
    commentaires: 318,
    partages: 89,
    type: "post",
  },
  {
    id: "6",
    auteur: {
      nom: "Clara Benali",
      avatar: avatar1,
      badge: "Guide certifié",
      localisation: "Marrakech, Maroc",
    },
    temps: "il y a 2 jours",
    contenu: "Petit carnet de route pour ceux qui aiment les escapades gourmandes et les ruelles animées. J’ai listé mes adresses préférées et les meilleurs créneaux pour visiter.",
    images: [],
    tags: ["#Marrakech", "#food", "#culture", "#tips"],
    likes: 367,
    commentaires: 29,
    partages: 16,
    type: "post",
  },
];

const filterTabs = ["Pour vous", "Récent", "Populaire", "Abonnements"];
const composerActions = ["Photo", "Vidéo", "Lieu", "Écrire un article"];

const travelerCards = [
  { nom: "Sophie Martin", info: "Guide certifié • Tokyo", avatar: avatar1 },
  { nom: "Mehdi El Amrani", info: "Voyageur solo • Lisbonne", avatar: avatar2 },
  { nom: "Nina Laurent", info: "Rédactrice voyage • Bali", avatar: avatar3 },
];

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
  const activeTab = "Pour vous";

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <section className={styles.mainColumn}>
          <header className={styles.heroCard}>
            <div className={styles.heroText}>
              <span className={styles.heroKicker}>Communauté</span>
              <h1 className={styles.heroTitle}>
                La communauté <span>Libertia</span>
              </h1>
              <p className={styles.heroSubtitle}>
                Échangez avec des voyageurs passionnés, partagez vos découvertes et trouvez l’inspiration pour votre prochaine aventure.
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

            <button type="button" className={styles.heroButton}>
              Rejoindre un voyage de groupe
            </button>
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
            {mockPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </section>
        </section>

        <aside className={styles.sidebarColumn}>
          <section className={styles.sidebarCard}>
            <h2 className={styles.sidebarTitle}>Voyageurs à rencontrer</h2>
            <div className={styles.userList}>
              {travelerCards.map((user) => (
                <div key={user.nom} className={styles.userRow}>
                  <div className={styles.userIdentity}>
                    <img src={user.avatar} alt={user.nom} className={styles.userAvatar} />
                    <div>
                      <p className={styles.userName}>{user.nom}</p>
                      <p className={styles.userInfo}>{user.info}</p>
                    </div>
                  </div>
                  <button type="button" className={styles.followButton}>
                    Suivre
                  </button>
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
                <div key={group.nom} className={styles.groupRow}>
                  <div>
                    <p className={styles.groupName}>{group.nom}</p>
                    <p className={styles.groupInfo}>{group.membres}</p>
                  </div>
                  <span className={styles.groupArrow}>›</span>
                </div>
              ))}
            </div>
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
    </main>
  );
}