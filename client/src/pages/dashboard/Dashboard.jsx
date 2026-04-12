import { useState, useEffect, useCallback } from "react";
import styles from "./Dashboard.module.css";
import { useAuthStore } from "../../store/authStore";
import { useVoyage } from "../../hooks/useVoyage";

const imgProfile      = "https://www.figma.com/api/mcp/asset/0926e5cc-1f5e-4862-a22b-22daa1cef4d7";
const imgSeoul        = "https://www.figma.com/api/mcp/asset/3c1af9b5-dd28-4164-be5d-ba041556100d";
const imgLisbonne     = "https://www.figma.com/api/mcp/asset/70e1e8fa-050a-4109-9a22-d6a1ac34a25d";
const imgLogo         = "https://www.figma.com/api/mcp/asset/d93104aa-ce16-42fe-b9cd-8bbe43f0929d";
const imgMoon         = "https://www.figma.com/api/mcp/asset/a418505c-a505-4ba9-896b-219cc8be6ab1";
const imgGlobe        = "https://www.figma.com/api/mcp/asset/13bb7fda-e931-4924-85b4-1f7753f52556";
const imgIconCalendar = "https://www.figma.com/api/mcp/asset/b038d18f-b513-43cf-bec5-084801418108";
const imgIconHistory  = "https://www.figma.com/api/mcp/asset/3fa574be-7875-4154-9644-e254d1207162";
const imgIconSuggests = "https://www.figma.com/api/mcp/asset/03afb187-49b3-467b-a113-1d28212aa74d";
const imgIconMic      = "https://www.figma.com/api/mcp/asset/855a4c97-7b80-49ae-9d3e-40688b2e60c7";
const imgIconStar     = "https://www.figma.com/api/mcp/asset/03c56ae0-a2fe-4cd1-a8c1-7a98c835b6fe";
const imgIconAssistant= "https://www.figma.com/api/mcp/asset/da457562-2f7c-406b-9c8f-af640f84933e";

const FILTERS = [
  { id: "vol",    label: "✈️ Vol uniquement" },
  { id: "hotel",  label: "🏨 Hôtel uniquement" },
  { id: "activ",  label: "🏃 Activités" },
  { id: "groupe", label: "👥 Groupe" },
];

const DEMO_HISTORY = [
  { id: 1, date: "10 juin 2024", title: "Recherche Tokyo 🇯🇵", subtitle: "Vol + Hôtel proposés • Budget respecté", badge: { label: "Budget 1500€", color: "#4ade80", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.2)" }, btnLabel: "Voir les résultats" },
  { id: 2, date: "5 juin 2024",  title: "Hôtel Paris 🇫🇷",    subtitle: "3 hôtels trouvés dans votre budget",   badge: { label: "Dépassement +50€", color: "#f97316", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.2)" }, btnLabel: "Réserver à nouveau" },
  { id: 3, date: "28 mai 2024", title: "Activités Barcelone 🇪🇸", subtitle: "12 activités recommandées", badge: { label: "Activités uniquement", color: "#d4d4d8", bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.1)" }, btnLabel: "Voir" },
];

const SUGGESTIONS = [
  { id: 1, img: null,     city: "Osaka, Japon",        desc: "Découvrez la capitale gastronomique du Japon.", tag: "Vous avez aimé Tokyo", price: "~1200€", type: "Vol + Hôtel" },
  { id: 2, img: imgSeoul, city: "Séoul, Corée du Sud", desc: "Une ville moderne et accessible pour les voyageurs solitaires.", tag: "Idéal Voyage Solo", price: "~1300€", type: "Vol + Hôtel" },
];

const MAX_FREE_PROMPTS = 10;

export default function Dashboard() {
  const [dark, setDark] = useState(() => {
  return localStorage.getItem("theme") === "dark";
});
  const { user } = useAuthStore();
  const { generer, getMesVoyages, voyages, loading, error } = useVoyage();

  // ── Lit sessionStorage une seule fois (fix cascading renders) ──
  const [prompt, setPrompt] = useState(() => {
    const saved = sessionStorage.getItem("libertia_prompt");
    if (saved) { sessionStorage.removeItem("libertia_prompt"); return saved; }
    return "";
  });

  const [activeFilter, setActiveFilter]     = useState(null);
  const [showLimitModal, setShowLimitModal] = useState(false);

  // ── Calcul prompts restants ────────────────────────────────────
  // user.promptsRestants vient directement du backend :
  //   → free    : nombre (ex: 7)
  //   → premium : "Illimité"
  const isPremium   = user?.abonnement === "premium";
  const promptsLeft = isPremium ? "∞" : (user?.promptsRestants ?? MAX_FREE_PROMPTS);
  const canGenerate = isPremium || (typeof promptsLeft === "number" && promptsLeft > 0);

  const loadVoyages = useCallback(() => { getMesVoyages(); }, [getMesVoyages]);
  useEffect(() => { loadVoyages(); }, [loadVoyages]);
  useEffect(() => {
  localStorage.setItem("theme", dark ? "dark" : "light");
}, [dark]);

useEffect(() => {
  localStorage.setItem("theme", dark ? "dark" : "light");
}, [dark]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    // Vérifie si l'user peut encore générer
    if (!canGenerate) { setShowLimitModal(true); return; }

    const fullPrompt = activeFilter ? `${prompt} [Filtre: ${activeFilter}]` : prompt;
    await generer(fullPrompt);
    setPrompt("");
    getMesVoyages(); // rafraîchit l'historique
  };

  return (
    <div className={`${styles.page} ${dark ? styles.dark : ""}`}>

      {/* ── NAVBAR ── */}
      <nav className={styles.navbar}>
        <div className={styles.navLogo}>
          <img src={imgLogo} alt="Libertia" className={styles.navLogoImg} />
          <span className={styles.navLogoText}>Libertia</span>
        </div>
        <div className={styles.navLinks}>
          {["Accueil", "Vols", "Hébergements", "Activités", "Communauté"].map((item) => (
            <button key={item} className={styles.navLink}>{item}</button>
          ))}
        </div>
        <div className={styles.navRight}>
          <button className={styles.navIconBtn} onClick={() => setDark(!dark)}><img src={imgMoon} alt="" className={styles.navIconImg} /></button>
          <button className={styles.navIconBtn}><img src={imgGlobe} alt="" className={styles.navIconImg} />FR</button>
          <div className={styles.navAvatar}>
            <img src={user?.profilePhoto || imgProfile} alt={user?.nom || "Profil"} className={styles.navAvatarImg} />
          </div>
          <div className={styles.navBadge}>
            <img src={imgIconAssistant} alt="" style={{ width: 13, height: 13 }} />
            <span className={styles.navBadgeText}>Assistant IA</span>
          </div>
        </div>
      </nav>

      <div className={styles.main}>

        {/* ── HERO ── */}
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>Où votre imagination vous porte-t-elle aujourd'hui ?</h1>
          <p className={styles.heroSubtitle}>
            Bonjour {user?.nom?.split(" ")[0] || ""}  ! Je trouve vols, hôtels et activités selon vos envies.
          </p>

          <form onSubmit={handleSubmit} style={{ width: "100%", display: "flex", justifyContent: "center" }}>
            <div className={styles.searchBox}>
              <div className={styles.searchLeft}>
                <input
                  className={styles.searchInput}
                  placeholder="Dites où vous voulez aller, combien de temps, votre budget..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={loading}
                />
                <div className={styles.searchFilters}>
                  {FILTERS.map((f) => (
                    <button
                      key={f.id} type="button"
                      className={activeFilter === f.id ? styles.filterPillActive : styles.filterPill}
                      onClick={() => setActiveFilter((p) => p === f.id ? null : f.id)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <button type="button" className={styles.micBtn}>
                <img src={imgIconMic} alt="Micro" className={styles.btnImg} />
              </button>
              <button type="submit" className={styles.sendBtn} disabled={loading}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="13 6 19 12 13 18"/>
                </svg>
              </button>
            </div>
          </form>

          {/* ── Compteur prompts ── */}
          {/* Vient directement de user.promptsRestants (backend) */}
          <div className={styles.promptCounter}>
            <span>Prompts restants :</span>
            <span className={styles.promptNum}>
              {isPremium ? "∞" : `${promptsLeft}/${MAX_FREE_PROMPTS}`}
            </span>
            {!isPremium && typeof promptsLeft === "number" && promptsLeft <= 2 && (
              <span className={styles.promptWarn}> — Passez à Premium !</span>
            )}
          </div>

          {error   && <div className={styles.errorText}>{error}</div>}
          {loading && <div className={styles.loadingText}>🤖 L'IA génère votre itinéraire...</div>}
        </section>

        {/* ── DASHBOARD SPLIT ── */}
        <div className={styles.dashboard}>

          {/* Colonne gauche — Historique */}
          <div>
            <div className={styles.sectionHeader}>
              <img src={imgIconHistory} alt="" className={styles.sectionIcon} />
              <h2 className={styles.sectionTitle}>Mes demandes récentes</h2>
            </div>
            <p className={styles.sectionSub}>Retrouvez vos dernières conversations et recherches.</p>

            {/* Données réelles si disponibles, sinon démo */}
            {(voyages.length > 0 ? voyages : DEMO_HISTORY).map((v) => (
              <div key={v.id || v._id} className={styles.historyCard}>
                <div>
                  <div className={styles.historyDate}>
                    <img src={imgIconCalendar} alt="" className={styles.historyDateIcon} />
                    <span className={styles.historyDateText}>
                      {v.date || new Date(v.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <div className={styles.historyTitle}>{v.title || v.prompt}</div>
                  <div className={styles.historySubtitle}>{v.subtitle || v.destination}</div>
                  {v.badge && (
                    <div style={{ display: "inline-flex", alignItems: "center", backgroundColor: v.badge.bg, border: `1px solid ${v.badge.border}`, borderRadius: 12, padding: "5px 11px", marginTop: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: v.badge.color }}>{v.badge.label}</span>
                    </div>
                  )}
                </div>
                <button className={styles.historyBtn}>{v.btnLabel || "Voir"}</button>
              </div>
            ))}
            <button className={styles.seeAllBtn}>Voir tout l'historique</button>
          </div>

          {/* Colonne droite — Suggestions */}
          <div>
            <div className={styles.sectionHeader}>
              <img src={imgIconSuggests} alt="" className={styles.sectionIcon} />
              <h2 className={styles.sectionTitle}>Suggestions pour vous</h2>
            </div>
            <p className={styles.sectionSub}>Basé sur votre historique et vos préférences.</p>

            <div className={styles.suggestGrid}>
              {SUGGESTIONS.map((dest) => (
                <div key={dest.id} className={styles.suggestCard}>
                  {dest.img ? <img src={dest.img} alt={dest.city} className={styles.suggestImg} /> : <div className={styles.suggestPlaceholder} />}
                  <div className={styles.suggestBody}>
                    <div className={styles.suggestTag}>
                      <img src={imgIconStar} alt="" className={styles.suggestTagIcon} />
                      <span className={styles.suggestTagText}>{dest.tag}</span>
                    </div>
                    <h3 className={styles.suggestCity}>{dest.city}</h3>
                    <p className={styles.suggestDesc}>{dest.desc}</p>
                    <div className={styles.suggestFooter}>
                      <div>
                        <div className={styles.suggestPriceLabel}>{dest.type}</div>
                        <div className={styles.suggestPrice}>{dest.price}</div>
                      </div>
                      <button className={styles.exploreBtn}>Explorer</button>
                    </div>
                  </div>
                </div>
              ))}

              <div className={styles.suggestWide}>
                <img src={imgLisbonne} alt="Lisbonne" className={styles.suggestWideImg} />
                <div className={styles.suggestWideBody}>
                  <div className={styles.suggestTag}>
                    <img src={imgIconStar} alt="" className={styles.suggestTagIcon} />
                    <span className={styles.suggestTagText}>Budget 1500€ respecté</span>
                  </div>
                  <h3 className={styles.suggestCity}>Lisbonne, Portugal</h3>
                  <p className={styles.suggestDesc}>Excellente alternative pour du soleil, une culture riche et une gastronomie exceptionnelle.</p>
                  <div className={styles.suggestFooter}>
                    <div className={styles.suggestPrice}>~600€</div>
                    <button className={styles.exploreBtn}>Explorer</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL LIMITE ── */}
      {showLimitModal && (
        <div className={styles.modalOverlay} onClick={() => setShowLimitModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalEmoji}>🚀</div>
            <h2 className={styles.modalTitle}>Limite atteinte !</h2>
            <p className={styles.modalText}>
              Vous avez utilisé vos {MAX_FREE_PROMPTS} prompts gratuits ce mois-ci.
              Passez à Premium pour des itinéraires illimités.
            </p>
            <button className={styles.modalBtnPrimary}>Passer à Premium</button>
            <button className={styles.modalBtnSecondary} onClick={() => setShowLimitModal(false)}>
              Continuer gratuitement
            </button>
          </div>
        </div>
      )}
    </div>
  );
}