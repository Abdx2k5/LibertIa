import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Groups.module.css";
import { GROUP_CATEGORIES, getAllGroups } from "../../mocks/groupsData";
import { ROUTES } from "../../utils/constants";

const svgProps = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" };
const IconCheck  = (p) => <svg {...svgProps} strokeWidth="2.5" {...p}><polyline points="20 6 9 17 4 12"/></svg>;
const IconMapPin = (p) => <svg {...svgProps} {...p}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;

export default function Groups() {
  const navigate = useNavigate();
  const groups = getAllGroups();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [joinedGroups, setJoinedGroups] = useState(new Set());

  const filteredGroups = useMemo(() => {
    return groups.filter((g) => {
      const matchesCategory = activeCategory === "Tous" || g.categorie === activeCategory;
      const query = search.trim().toLowerCase();
      const matchesSearch = !query
        || g.nom.toLowerCase().includes(query)
        || g.localisation.toLowerCase().includes(query)
        || g.tags.some((t) => t.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [groups, activeCategory, search]);

  const toggleJoin = (id) => {
    setJoinedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <main className={styles.page}>
      
      <div className={styles.container}>

        {/* ── HERO ── */}
        <header className={styles.heroCard}>
          <button type="button" className={styles.backLink} onClick={() => navigate(ROUTES.COMMUNITY)}>
            ‹ Retour à la communauté
          </button>
          <span className={styles.heroKicker}>Communauté</span>
          <h1 className={styles.heroTitle}>
            Découvrez des <span>groupes de voyage</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Rejoignez des communautés de voyageurs partageant vos passions, vos destinations
            et vos prochaines aventures.
          </p>

          <input
            type="text"
            className={styles.searchInput}
            placeholder="Rechercher un groupe, une destination, un thème..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </header>

        {/* ── FILTRES CATÉGORIES ── */}
        <section className={styles.filterTabs} aria-label="Filtrer par catégorie">
          {GROUP_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`${styles.filterTab} ${cat === activeCategory ? styles.filterTabActive : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </section>

        {/* ── LISTE DES GROUPES ── */}
        {filteredGroups.length === 0 ? (
          <div className={styles.emptyState}>Aucun groupe ne correspond à votre recherche.</div>
        ) : (
          <section className={styles.groupsGrid}>
            {filteredGroups.map((group) => {
              const isJoined = joinedGroups.has(group.id);
              return (
                <article key={group.id} className={styles.groupCard}>
                  <div className={styles.groupCover}>
                    <span className={styles.groupCoverInitial}>{group.nom.charAt(0)}</span>
                  </div>

                  <div className={styles.groupBody}>
                    <div className={styles.groupHeaderRow}>
                      <h3 className={styles.groupName}>
                        {group.nom}
                        {group.verifie && <span className={styles.verifiedBadge} title="Groupe vérifié"><IconCheck /></span>}
                      </h3>
                      <span className={styles.typeBadge}>{group.type}</span>
                    </div>

                    <p className={styles.groupLocation}><IconMapPin /> {group.localisation}</p>
                    <p className={styles.groupDescription}>{group.description}</p>

                    <div className={styles.tagRow}>
                      {group.tags.map((t) => (
                        <span key={t} className={styles.tag}>{t}</span>
                      ))}
                    </div>

                    <div className={styles.groupFooter}>
                      <div className={styles.groupStats}>
                        <span className={styles.membersCount}>
                          {group.membres.toLocaleString("fr-FR")} membres
                        </span>
                        <span className={styles.nextActivity}>{group.prochaineActivite}</span>
                      </div>
                      <button
                        type="button"
                        className={isJoined ? styles.joinedButton : styles.joinButton}
                        onClick={() => toggleJoin(group.id)}
                      >
                        {isJoined ? <><IconCheck /> Rejoint</> : "Rejoindre"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}

