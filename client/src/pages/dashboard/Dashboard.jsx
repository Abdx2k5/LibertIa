import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./Dashboard.module.css";
import { useAuthStore } from "../../store/authStore";
import { useUiStore, useUIStore } from "../../store/uiStore";
import { useVoyage } from "../../hooks/useVoyage";
import { FREEMIUM , ROUTES} from "../../utils/constants";
import { ProgressBar, ShareButton, DeleteButton, StreamingOutput, ItineraireJourJour, VolCard, HotelCard, ActiviteCard, MicroAnimated, BudgetChart, RechercheVoyages, NotificationBell, PaymentModal } from "../../components/ui";
import ShareModal from "../../components/modals/ShareModal";
import DeleteConfirmModal from "../../components/modals/DeleteConfirmModal";
import HamburgerSidebar from "../../components/layout/HamburgerSidebar";

const IconMenu = (p) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
  </svg>
);
import seoulImg from "../../assets/images/destinations/seoul-1.jpg";
import lisbonneImg from "../../assets/images/destinations/lisbonne-1.jpg";
import { useTranslation } from "../../hooks/useTranslation";

const imgProfile      = "https://www.figma.com/api/mcp/asset/0926e5cc-1f5e-4862-a22b-22daa1cef4d7";
const imgLogo         = "https://www.figma.com/api/mcp/asset/d93104aa-ce16-42fe-b9cd-8bbe43f0929d";
const imgMoon         = "https://www.figma.com/api/mcp/asset/a418505c-a505-4ba9-896b-219cc8be6ab1";
const imgGlobe        = "https://www.figma.com/api/mcp/asset/13bb7fda-e931-4924-85b4-1f7753f52556";
const imgIconCalendar = "https://www.figma.com/api/mcp/asset/b038d18f-b513-43cf-bec5-084801418108";
const imgIconHistory  = "https://www.figma.com/api/mcp/asset/3fa574be-7875-4154-9644-e254d1207162";
const imgIconSuggests = "https://www.figma.com/api/mcp/asset/03afb187-49b3-467b-a113-1d28212aa74d";
const imgIconStar     = "https://www.figma.com/api/mcp/asset/03c56ae0-a2fe-4cd1-a8c1-7a98c835b6fe";
const imgIconAssistant= "https://www.figma.com/api/mcp/asset/da457562-2f7c-406b-9c8f-af640f84933e";

const IconPlane = (p) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-1 .1-1.3.5l-.7.8c-.4.5-.2 1.2.3 1.5L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.5 1 .7 1.5.3l.8-.7c.4-.3.6-.8.5-1.3Z"/>
  </svg>
);
const IconHotel = (p) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
  </svg>
);
const IconActivity = (p) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);
const IconUsers = (p) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconRocket = (p) => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
  </svg>
);

const FILTERS = [
  { id: "vol",    icon: IconPlane,    label: "Vol uniquement" },
  { id: "hotel",  icon: IconHotel,    label: "Hôtel uniquement" },
  { id: "activ",  icon: IconActivity, label: "Activités" },
  { id: "groupe", icon: IconUsers,    label: "Groupe" },
];

const DEMO_HISTORY = [
  { id: 1, date: "10 juin 2024", title: "Recherche Tokyo 🇯🇵", subtitle: "Vol + Hôtel proposés • Budget respecté", badge: { label: "Budget 1500€", color: "var(--accent-green)", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.2)" }, btnLabel: "Voir les résultats" },
  { id: 2, date: "5 juin 2024",  title: "Hôtel Paris 🇫🇷",    subtitle: "3 hôtels trouvés dans votre budget",   badge: { label: "Dépassement +50€", color: "#f97316", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.2)" }, btnLabel: "Réserver à nouveau" },
  { id: 3, date: "28 mai 2024", title: "Activités Barcelone 🇪🇸", subtitle: "12 activités recommandées", badge: { label: "Activités uniquement", color: "#d4d4d8", bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.1)" }, btnLabel: "Voir" },
];

const SUGGESTIONS = [
  { id: 1, img: null,     city: "Osaka, Japon",        desc: "Découvrez la capitale gastronomique du Japon.", tag: "Vous avez aimé Tokyo", price: "~1200€", type: "Vol + Hôtel" },
  { id: 2, img: seoulImg, city: "Séoul, Corée du Sud", desc: "Une ville moderne et accessible pour les voyageurs solitaires.", tag: "Idéal Voyage Solo", price: "~1300€", type: "Vol + Hôtel" },
];

const MAX_FREE_PROMPTS = 10;

// Mock data for cards
const MOCK_VOLS = [
  {
    compagnie: "Air France",
    numero: "AF 275",
    depart: { ville: "Paris", heure: "08:30" },
    arrivee: { ville: "Tokyo", heure: "06:20+1" },
    duree: "14h50",
    escales: 0,
    prix: 780,
    classe: "Économique"
  },
  {
    compagnie: "Lufthansa",
    numero: "LH 512",
    depart: { ville: "Berlin", heure: "10:15" },
    arrivee: { ville: "Tokyo", heure: "08:45+1" },
    duree: "15h30",
    escales: 1,
    prix: 650,
    classe: "Économique"
  },
  {
    compagnie: "JAL",
    numero: "JL 789",
    depart: { ville: "Paris", heure: "14:00" },
    arrivee: { ville: "Tokyo", heure: "12:30+1" },
    duree: "13h30",
    escales: 0,
    prix: 920,
    classe: "Affaires"
  }
];

const MOCK_HOTELS = [
  {
    nom: "APA Hotel Asakusa",
    etoiles: 3,
    note: 4.2,
    avis: 1580,
    quartier: "Asakusa",
    prixNuit: 65,
    nuits: 10,
    prixTotal: 650,
    services: ["Petit-déjeuner", "Wifi", "Bon transport"],
    budgetStatus: "ok"
  },
  {
    nom: "Tokyo Daiichi Hotel",
    etoiles: 4,
    note: 4.5,
    avis: 2340,
    quartier: "Shibuya",
    prixNuit: 120,
    nuits: 10,
    prixTotal: 1200,
    services: ["Petit-déjeuner", "Spa", "Parking"],
    budgetStatus: "warning"
  },
  {
    nom: "Mitsui Garden Hotel",
    etoiles: 5,
    note: 4.8,
    avis: 3100,
    quartier: "Ginza",
    prixNuit: 180,
    nuits: 10,
    prixTotal: 1800,
    services: ["Petit-déjeuner", "Concierge", "Wifi", "Restaurant"],
    budgetStatus: "exceeded"
  }
];

const MOCK_ACTIVITES = [
  {
    titre: "Temple Senso-ji",
    note: 4.75,
    duree: "3h",
    prix: 25,
    categorie: "Culture"
  },
  {
    titre: "Traversée de Shibuya Crossing",
    note: 4.6,
    duree: "2h",
    prix: 0,
    categorie: "Découverte"
  },
  {
    titre: "Parc Rikugien et jardins",
    note: 4.4,
    duree: "2h30",
    prix: 35,
    categorie: "Nature"
  }
];

const MOCK_BUDGET = {
  total: 1500,
  vols: 780,
  hotel: 650,
  activites: 70,
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useUiStore();
  const { toggleSidebar } = useUIStore();
  const { t, language, toggleLanguage } = useTranslation();
  const { user } = useAuthStore();
  const { getMesVoyages, voyages } = useVoyage();

  // ── Selected items state ──
  const [selectedVol, setSelectedVol] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [addedActivites, setAddedActivites] = useState([]);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  // ── Lit sessionStorage une seule fois (fix cascading renders) ──
  const [prompt, setPrompt] = useState(() => {
    const saved = sessionStorage.getItem("libertia_prompt");
    if (saved) { sessionStorage.removeItem("libertia_prompt"); return saved; }
    return "";
  });
  const [streamPrompt, setStreamPrompt] = useState("");
  const [streamId, setStreamId] = useState(0);

  const [activeFilter, setActiveFilter]     = useState(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedVoyage, setSelectedVoyage] = useState(null);
  const [loading] = useState(false);
  const [error] = useState(null);

  // ── Calcul prompts restants ────────────────────────────────────
  // user.promptsRestants vient directement du backend :
  //   → free    : nombre (ex: 7)
  //   → premium : "Illimité"
  const isPremium   = user?.abonnement === "premium";
  const promptsLeft = isPremium ? "∞" : (user?.promptsRestants ?? MAX_FREE_PROMPTS);
  const canGenerate = isPremium || (typeof promptsLeft === "number" && promptsLeft > 0);

  const loadVoyages = useCallback(() => { getMesVoyages(); }, [getMesVoyages]);
  const handleRechercheVoyagesFilter = useCallback(() => {}, []);
  useEffect(() => { loadVoyages(); }, [loadVoyages]);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    // Vérifie si l'user peut encore générer
    if (!canGenerate) { setShowLimitModal(true); return; }

    const fullPrompt = activeFilter ? `${prompt} [Filtre: ${activeFilter}]` : prompt;
    setStreamPrompt(fullPrompt);
    setStreamId((id) => id + 1);
    setPrompt("");
  };

  const handleSelectVol = (vol) => {
    setSelectedVol(selectedVol?.numero === vol.numero ? null : vol);
  };

  const handleSelectHotel = (hotel) => {
    setSelectedHotel(selectedHotel?.nom === hotel.nom ? null : hotel);
  };

  const handleAddActivite = (activite) => {
    if (addedActivites.some((a) => a.titre === activite.titre)) {
      setAddedActivites(addedActivites.filter((a) => a.titre !== activite.titre));
    } else {
      setAddedActivites([...addedActivites, activite]);
    }
  };

  const handleShareClick = (voyageId) => {
    const voyage = voyages.find(v => v._id === voyageId || v.id === voyageId);
    setSelectedVoyage(voyage);
    setShareModalOpen(true);
  };

  const handleDeleteClick = (voyageId) => {
    const voyage = voyages.find(v => v._id === voyageId || v.id === voyageId);
    setSelectedVoyage(voyage);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedVoyage) {
      // TODO: Call API to delete voyage when backend is ready
      console.log("Deleting voyage:", selectedVoyage);
      setDeleteModalOpen(false);
      setSelectedVoyage(null);
      // After deletion, refresh voyages list:
      // await getMesVoyages();
    }
  };

  // ── T102 — Paiement confirmé : ferme la modal et réinitialise la sélection ──
  const handlePaymentSuccess = () => {
    setPaymentModalOpen(false);
    setSelectedVol(null);
    setSelectedHotel(null);
    setAddedActivites([]);
  };

  return (
    <div className={`${styles.page} ${theme === "dark" ? styles.dark : ""}`}>

      <HamburgerSidebar />

      {/* ── NAVBAR ── */}
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          <button type="button" className={styles.hamburgerBtn} onClick={toggleSidebar} aria-label="Ouvrir le menu">
            <IconMenu />
          </button>
          <Link to="/" className={styles.navLogo}>
            <img src={imgLogo} alt="Libertia" className={styles.navLogoImg} />
            <span className={styles.navLogoText}>Libertia</span>
          </Link>
        </div>
        <div className={styles.navLinks}>
          {[t("navHome"), t("navFlights"), t("navHotels"), t("navActivities"), t("navCommunity")].map((item) => (
            <button key={item} className={styles.navLink}>{item}</button>
          ))}
        </div>
        <div className={styles.navRight}>
          <button className={styles.navIconBtn} onClick={toggleTheme}><img src={imgMoon} alt="" className={styles.navIconImg} /></button>
          <button className={styles.navIconBtn} onClick={toggleLanguage}><img src={imgGlobe} alt="" className={styles.navIconImg} />{language.toUpperCase()}</button>
          <NotificationBell />
          <div className={styles.navAvatar}>
            <img src={user?.profilePhoto || imgProfile} alt={user?.nom || "Profil"} className={styles.navAvatarImg} />
          </div>
          <div className={styles.navBadge}>
            <img src={imgIconAssistant} alt="" style={{ width: 13, height: 13 }} />
            <span className={styles.navBadgeText}>{t("assistantBadge")}</span>
          </div>
        </div>
      </nav>

      <div className={styles.main}>

        {/* ── HERO ── */}
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>{t("dashboardHeroTitle")}</h1>
          <p className={styles.heroSubtitle}>
            {t("dashboardGreeting")} {user?.nom?.split(" ")[0] || ""} {t("dashboardHeroSubtitleRest")}
          </p>

          <form onSubmit={handleSubmit} style={{ width: "100%", display: "flex", justifyContent: "center" }}>
            <div className={styles.searchBox}>
              <div className={styles.searchLeft}>
                <input
                  className={styles.searchInput}
                  placeholder="Dites où vous voulez aller, combien de temps, votre budget..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <div className={styles.searchFilters}>
                  {FILTERS.map((f) => (
                    <button
                      key={f.id} type="button"
                      className={activeFilter === f.id ? styles.filterPillActive : styles.filterPill}
                      onClick={() => setActiveFilter((p) => p === f.id ? null : f.id)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <f.icon /> {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <MicroAnimated onResult={(text) => setPrompt(text)} disabled={!canGenerate} />
              <button type="submit" className={styles.sendBtn}>
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

          {/* Progress Bar - Show during generation */}
          {loading && (
            <div style={{ marginTop: '20px', maxWidth: '600px', margin: '20px auto 0' }}>
              <ProgressBar progress={65} label="Scraping en cours..." status="generating" />
            </div>
          )}

          {error   && <div className={styles.errorText}>{error}</div>}
          {!loading && <div className={styles.loadingText}> </div>}
        </section>

        {/* ── RESULTS SECTION ── */}
        {streamPrompt && (
          <section className={styles.resultsSection} style={{ animation: `${styles.fadeIn} 0.4s ease` }}>
            {/* AI Streaming block */}
            <div className={styles.streamingWrapper}>
              <StreamingOutput prompt={streamPrompt} key={streamId} />
            </div>

            <div style={{ marginTop: 24 }}>
              <BudgetChart budget={MOCK_BUDGET} />
            </div>

            {/* Results grid with title and subsections */}
            <div style={{ animation: `${styles.fadeIn} 0.4s ease` }}>
              <h2 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', marginBottom: 8, position: 'relative', paddingBottom: 12 }}>
                Résultats de votre recherche
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: 60, height: 3, background: 'var(--accent)', borderRadius: 2 }} />
              </h2>

              {/* Flights subsection */}
              <div>
                <div className={styles.subsectionLabel}><IconPlane width={18} height={18} /> Vols disponibles</div>
                <div className={styles.cardsGrid}>
                  {MOCK_VOLS.map((v) => (
                    <VolCard key={v.numero} vol={v} onSelect={handleSelectVol} isSelected={selectedVol?.numero === v.numero} />
                  ))}
                </div>
              </div>

              {/* Hotels subsection */}
              <div>
                <div className={styles.subsectionLabel}><IconHotel width={18} height={18} /> Hébergements</div>
                <div className={styles.cardsGrid}>
                  {MOCK_HOTELS.map((h) => (
                    <HotelCard key={h.nom} hotel={h} onSelect={handleSelectHotel} isSelected={selectedHotel?.nom === h.nom} budgetRestant={70} />
                  ))}
                </div>
              </div>

              {/* Activities subsection */}
              <div>
                <div className={styles.subsectionLabel}><IconActivity width={18} height={18} /> Activités recommandées</div>
                <div className={styles.cardsGrid}>
                  {MOCK_ACTIVITES.map((a) => (
                    <ActiviteCard key={a.titre} activite={a} onAdd={handleAddActivite} isAdded={addedActivites.some(x => x.titre === a.titre)} />
                  ))}
                </div>
              </div>

              {/* Itinerary block */}
              <div style={{ marginTop: 32 }}>
                <ItineraireJourJour voyage={null} />
              </div>
            </div>
          </section>
        )}

        {/* ── SELECTION SUMMARY BAR ── */}
        {selectedVol && selectedHotel && (
          <div className={styles.confirmBar}>
            <div style={{ display: 'flex', gap: 32, alignItems: 'center', flex: 1 }}>
              <div>
                <div style={{ fontSize: 12, color: '#a1a1aa' }}>Vol</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{selectedVol.compagnie} {selectedVol.numero}</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--accent)' }}>{selectedVol.prix}€</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#a1a1aa' }}>Hôtel</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{selectedHotel.nom}</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--accent)' }}>{selectedHotel.prixTotal}€</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className={styles.confirmBarTotal}>
                Total : {selectedVol.prix + selectedHotel.prixTotal}€
              </div>
            </div>
            <button className={styles.confirmBtn} onClick={() => setPaymentModalOpen(true)}>Confirmer la réservation →</button>
          </div>
        )}

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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                  <button
                    className={styles.historyBtn}
                    disabled={!(v._id || v.id)}
                    onClick={() => navigate(`/voyage/${v._id || v.id}`)}
                  >
                    {v.btnLabel || "Voir"}
                  </button>
                  {v._id || v.id ? (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <ShareButton 
                        voyageId={v._id || v.id} 
                        onShare={handleShareClick}
                        variant="outline"
                        size="sm"
                      />
                      <DeleteButton 
                        voyageId={v._id || v.id} 
                        onDelete={handleDeleteClick}
                        variant="danger"
                        size="sm"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
            <button className={styles.seeAllBtn} onClick={() => navigate(ROUTES.MY_TRIPS)}>Voir tout l'historique</button>
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
                <img src={lisbonneImg} alt="Lisbonne" className={styles.suggestWideImg} />
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

              <section className={styles.rechercheVoyagesSection}>
                <RechercheVoyages voyages={voyages} onFilter={handleRechercheVoyagesFilter} />
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL LIMITE ── */}
      {showLimitModal && (
        <div className={styles.modalOverlay} onClick={() => setShowLimitModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalEmoji}><IconRocket /></div>
            <h2 className={styles.modalTitle}>Limite atteinte !</h2>
            <p className={styles.modalText}>
              Vous avez utilisé vos {MAX_FREE_PROMPTS} prompts gratuits ce mois-ci.
              Passez à Premium pour des itinéraires illimités.
            </p>
            <button className={styles.modalBtnPrimary} onClick={() => navigate(ROUTES.SUBSCRIPTION)}>Passer à Premium</button>
            <button className={styles.modalBtnSecondary} onClick={() => setShowLimitModal(false)}>
              Continuer gratuitement
            </button>
          </div>
        </div>
      )}

      {/* ── SHARE MODAL ── */}
      {selectedVoyage && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false);
            setSelectedVoyage(null);
          }}
          voyageTitle={selectedVoyage.title || selectedVoyage.prompt || "Mon voyage"}
          voyageId={selectedVoyage._id || selectedVoyage.id}
        />
      )}

      {/* ── DELETE MODAL ── */}
      {selectedVoyage && (
        <DeleteConfirmModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedVoyage(null);
          }}
          onConfirm={handleConfirmDelete}
          voyageTitle={selectedVoyage.title || selectedVoyage.prompt || "Mon voyage"}
          loading={false}
        />
      )}

      {/* ── PAYMENT MODAL (T102) ── */}
      {selectedVol && selectedHotel && (
        <PaymentModal
          isOpen={paymentModalOpen}
          amount={selectedVol.prix + selectedHotel.prixTotal}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setPaymentModalOpen(false)}
        />
      )}

    </div>
  );
}
