import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import styles from "./PublicProfile.module.css";
import { useAuthStore } from "../../store/authStore";
import authService from "../../services/auth.service";
import communityService from "../../services/community.service";
import AppNavbar from "../../components/layout/AppNavbar";
import { FollowButton, PostCard, Spinner } from "../../components/ui";
import { ROUTES } from "../../utils/constants";
import { MOCK_POSTS } from "../../mocks/communityPosts";
import imgAvatar from "../../assets/images/community/avatar.png";
import imgLogo from "../../assets/logos/logo.png";

const svgProps = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" };
const IconSparkles  = (p) => <svg {...svgProps} {...p}><path d="m12 3-1.9 5.7a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.7a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>;
const IconMapPin     = (p) => <svg {...svgProps} {...p}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const IconCalendar    = (p) => <svg {...svgProps} {...p}><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconWallet      = (p) => <svg {...svgProps} {...p}><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>;

function formatDate(d) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

export default function PublicProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const currentUserId = currentUser?._id || currentUser?.id;
  const isOwnProfile = isAuthenticated && currentUserId === userId;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    let actif = true;
    authService
      .getPublicProfile(userId)
      .then((data) => { if (actif) { setProfile(data); setNotFound(false); } })
      .catch(() => { if (actif) setNotFound(true); })
      .finally(() => { if (actif) setLoading(false); });
    return () => { actif = false; };
  }, [userId]);

  // Détermine si le viewer connecté suit déjà ce profil (même approche que
  // FindFriendsModal : pas de logique d'auth côté serveur sur cette route
  // publique, on réutilise l'endpoint /following déjà authentifié).
  useEffect(() => {
    if (!isAuthenticated || !currentUserId || isOwnProfile) return;
    let actif = true;
    communityService
      .getFollowing(currentUserId)
      .then((list) => { if (actif) setIsFollowing(list.some((u) => u._id === userId)); })
      .catch(() => {});
    return () => { actif = false; };
  }, [isAuthenticated, currentUserId, userId, isOwnProfile]);

  const handleToggleFollow = (next) => {
    const action = next ? communityService.followUser : communityService.unfollowUser;
    action(userId).catch(() => {});
  };

  // Publications (Vue Publique) — pas de modèle "Post" réel côté backend
  // (le fil Communauté est lui-même mocké, voir Community.jsx) : on filtre
  // les mêmes données de démonstration par auteur, pour rester cohérent.
  const publications = MOCK_POSTS.filter((p) => p.auteur.id === userId);

  if (loading) {
    return (
      <div className={styles.page}>
        {isAuthenticated ? <AppNavbar /> : <PublicTopBar />}
        <div className={styles.centered}><Spinner size={32} color="var(--accent)" label="Chargement du profil..." /></div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className={styles.page}>
        {isAuthenticated ? <AppNavbar /> : <PublicTopBar />}
        <div className={styles.centered}>
          <p className={styles.notFoundText}>Ce profil n'existe pas ou n'est pas accessible.</p>
          <button type="button" className={styles.btnBack} onClick={() => navigate(ROUTES.COMMUNITY)}>
            ← Retour à la communauté
          </button>
        </div>
      </div>
    );
  }

  const avatarSrc = profile.profilePhoto && profile.profilePhoto !== "default-avatar.png" ? profile.profilePhoto : imgAvatar;

  return (
    <div className={styles.page}>
      {isAuthenticated ? <AppNavbar /> : <PublicTopBar />}

      <div className={styles.main}>
        {/* ── Cover + avatar + identité (lecture seule) ── */}
        <div className={styles.coverCard}>
          <div className={styles.cover} />
          <div className={styles.heroRow}>
            <div className={styles.avatarWrap}>
              <img src={avatarSrc} alt={profile.nom} className={styles.avatarImg} />
            </div>

            <div className={styles.heroInfo}>
              <h1 className={styles.heroName}>{profile.nom}</h1>
              {profile.createdAt && (
                <p className={styles.heroJoined}>Membre depuis {formatDate(profile.createdAt)}</p>
              )}
              {profile.badges?.length > 0 && (
                <div className={styles.badgeRow}>
                  {profile.badges.map((b) => (
                    <span key={b} className={styles.badge}><IconSparkles /> {b}</span>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.heroAction}>
              {isOwnProfile ? (
                <Link to={ROUTES.PROFILE} className={styles.btnOwnProfile}>Modifier mon profil</Link>
              ) : isAuthenticated ? (
                <FollowButton following={isFollowing} onToggle={handleToggleFollow} />
              ) : (
                <button type="button" className={styles.btnOwnProfile} onClick={() => navigate(ROUTES.LOGIN)}>
                  Se connecter pour suivre
                </button>
              )}
            </div>
          </div>

          {profile.bio ? (
            <p className={styles.bioText}>{profile.bio}</p>
          ) : (
            <p className={styles.bioPlaceholder}>Cet utilisateur n'a pas encore renseigné de bio.</p>
          )}
        </div>

        {/* ── Stats publiques ── */}
        <div className={styles.statsBar}>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{profile.voyagesCount}</span>
            <span className={styles.statLabel}>Voyages</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{profile.photosCount}</span>
            <span className={styles.statLabel}>Photos</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{profile.followersCount}</span>
            <span className={styles.statLabel}>Abonnés</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{profile.followingCount}</span>
            <span className={styles.statLabel}>Abonnements</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNum}>{profile.paysVisitesCount}</span>
            <span className={styles.statLabel}>Pays visités</span>
          </div>
        </div>

        {/* ── Publications (Vue Publique) ── */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Publications (Vue Publique)</h2>
          {publications.length === 0 ? (
            <p className={styles.emptyText}>Aucune publication publique pour le moment.</p>
          ) : (
            <div className={styles.postsList}>
              {publications.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>

        {/* ── Voyages (Vue Publique) ── */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Voyages (Vue Publique)</h2>
          {profile.voyages.length === 0 ? (
            <p className={styles.emptyText}>Aucun voyage public pour le moment.</p>
          ) : (
            <div className={styles.voyagesGrid}>
              {profile.voyages.map((v) => (
                <div key={v._id} className={styles.voyageCard}>
                  <h3 className={styles.voyageTitle}>{v.titre || v.destination}</h3>
                  <p className={styles.voyageDestination}><IconMapPin />{v.destination}</p>
                  <div className={styles.voyageMeta}>
                    <span><IconCalendar />{formatDate(v.dates?.start)} → {formatDate(v.dates?.end)}</span>
                    {v.budget?.total != null && (
                      <span><IconWallet />{v.budget.total} {v.budget.currency || "EUR"}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Barre de navigation minimale pour les visiteurs non connectés ──
// (AppNavbar suppose un utilisateur authentifié — notifications, messages...
// — et ferait échouer ces appels pour un visiteur anonyme)
function PublicTopBar() {
  return (
    <nav className={styles.publicNav}>
      <Link to={ROUTES.HOME} className={styles.publicNavLogo}>
        <img src={imgLogo} alt="Libertia" className={styles.publicNavLogoImg} />
        <span>Libertia</span>
      </Link>
      <div className={styles.publicNavActions}>
        <Link to={ROUTES.LOGIN} className={styles.btnOutlineLink}>Se connecter</Link>
        <Link to={ROUTES.REGISTER} className={styles.btnPrimaryLink}>S'inscrire</Link>
      </div>
    </nav>
  );
}
