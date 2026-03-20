import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useVoyage } from "../../hooks/useVoyage";
import { FREEMIUM } from "../../utils/constants";

// ── Assets Figma ─────────────────────────────────────────────
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
const imgIconSend     = "https://www.figma.com/api/mcp/asset/0b60b191-82e2-4899-bd71-caf80042f766";
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
  { id: 3, date: "28 mai 2024", title: "Activités Barcelone 🇪🇸", subtitle: "12 activités recommandées pour le week-end", badge: { label: "Activités uniquement", color: "#d4d4d8", bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.1)" }, btnLabel: "Voir" },
];

const SUGGESTIONS = [
  { id: 1, img: null,     city: "Osaka, Japon",        desc: "Découvrez la capitale gastronomique du Japon.", tag: "Vous avez aimé Tokyo", price: "~1200€", type: "Vol + Hôtel" },
  { id: 2, img: imgSeoul, city: "Séoul, Corée du Sud", desc: "Une ville moderne, vibrante et accessible pour les voyageurs solitaires.", tag: "Idéal Voyage Solo", price: "~1300€", type: "Vol + Hôtel" },
];

const s = {
  page:             { minHeight: "100vh", background: "linear-gradient(135deg, #0b1026 0%, #1a1a2e 100%)", fontFamily: "'Inter', sans-serif", color: "#fff" },
  navbar:           { position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(8px)", backgroundColor: "rgba(11,16,38,0.8)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "20px 120px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  navLogo:          { display: "flex", alignItems: "center", gap: 12 },
  navLogoImg:       { width: 32, height: 32 },
  navLogoText:      { fontSize: 20, fontWeight: 700, color: "#fff" },
  navLinks:         { display: "flex", gap: 32 },
  navLink:          { fontSize: 14, fontWeight: 500, color: "#d4d4d8", background: "none", border: "none", cursor: "pointer" },
  navRight:         { display: "flex", alignItems: "center", gap: 16 },
  navIconBtn:       { background: "none", border: "none", cursor: "pointer", padding: 8, display: "flex", alignItems: "center", gap: 6, color: "#fff", fontSize: 14 },
  navIconImg:       { width: 20, height: 20 },
  navAvatar:        { width: 36, height: 36, borderRadius: 18, border: "2px solid rgba(255,255,255,0.1)", overflow: "hidden" },
  navAvatarImg:     { width: "100%", height: "100%", objectFit: "cover" },
  navBadge:         { display: "flex", alignItems: "center", gap: 8, borderLeft: "1px solid rgba(255,255,255,0.1)", paddingLeft: 17, marginLeft: 16 },
  navBadgeText:     { fontSize: 13, fontWeight: 600, color: "#00ffff" },
  main:             { maxWidth: 1200, margin: "0 auto", padding: "0 24px" },
  hero:             { display: "flex", flexDirection: "column", alignItems: "center", gap: 34, padding: "84px 0 60px" },
  heroTitle:        { fontSize: 36, fontWeight: 800, background: "linear-gradient(90deg, #00ffff, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", textAlign: "center", margin: 0 },
  heroSubtitle:     { fontSize: 18, color: "#a1a1aa", textAlign: "center", lineHeight: 1.5, margin: 0, maxWidth: 600 },
  searchBox:        { width: 800, backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(0,255,255,0.2)", borderRadius: 24, boxShadow: "0px 8px 32px 0px rgba(0,255,255,0.1)", padding: "19px 17px 13px 33px", display: "flex", gap: 16, alignItems: "flex-end" },
  searchLeft:       { flex: 1, display: "flex", flexDirection: "column", gap: 8 },
  searchInput:      { background: "none", border: "none", outline: "none", fontSize: 18, color: "#fff", width: "100%" },
  searchFilters:    { display: "flex", gap: 8, flexWrap: "wrap" },
  filterPill:       { backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "5px 11px", fontSize: 12, fontWeight: 500, color: "#d4d4d8", cursor: "pointer", background: "none" },
  filterPillActive: { backgroundColor: "rgba(0,255,255,0.1)", border: "1px solid #00ffff", borderRadius: 12, padding: "5px 11px", fontSize: 12, fontWeight: 500, color: "#00ffff", cursor: "pointer" },
  micBtn:           { width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(0,255,255,0.1)", border: "2px solid rgba(0,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 },
  sendBtn:          { width: 56, height: 56, borderRadius: 28, backgroundColor: "#00ffff", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 },
  btnImg:           { width: 24, height: 24 },
  promptCounter:    { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#a1a1aa" },
  promptNum:        { color: "#00ffff", fontWeight: 600 },
  errorText:        { textAlign: "center", color: "#f87171", padding: "20px 0", fontSize: 14 },
  loadingText:      { textAlign: "center", color: "#a1a1aa", padding: "40px 0" },
  dashboard:        { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, paddingBottom: 80 },
  sectionHeader:    { display: "flex", alignItems: "center", gap: 12, marginBottom: 6 },
  sectionIcon:      { width: 24, height: 24 },
  sectionTitle:     { fontSize: 24, fontWeight: 700, color: "#fff", margin: 0 },
  sectionSub:       { fontSize: 15, color: "#a1a1aa", marginBottom: 17 },
  historyCard:      { backdropFilter: "blur(6px)", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 21, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  historyDate:      { display: "flex", alignItems: "center", gap: 6, marginBottom: 8 },
  historyDateIcon:  { width: 13, height: 13 },
  historyDateText:  { fontSize: 13, color: "#a78bfa" },
  historyTitle:     { fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 4 },
  historySubtitle:  { fontSize: 14, color: "#a1a1aa", marginBottom: 8 },
  historyBtn:       { border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, padding: "11px 21px", fontSize: 14, color: "#fff", background: "none", cursor: "pointer", flexShrink: 0 },
  seeAllBtn:        { width: "100%", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 8, padding: "11px 21px", fontSize: 14, color: "#a1a1aa", background: "none", cursor: "pointer", marginTop: 8 },
  suggestGrid:      { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 },
  suggestCard:      { backdropFilter: "blur(6px)", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden" },
  suggestImg:       { width: "100%", height: 180, objectFit: "cover", display: "block" },
  suggestPlaceholder:{ width: "100%", height: 180, background: "linear-gradient(135deg, #1a1a2e, #0b1026)" },
  suggestBody:      { padding: 20 },
  suggestTag:       { display: "inline-flex", alignItems: "center", gap: 6, backgroundColor: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 20, padding: "7px 13px", marginBottom: 16 },
  suggestTagIcon:   { width: 12, height: 12 },
  suggestTagText:   { fontSize: 12, color: "#ffd700" },
  suggestCity:      { fontSize: 20, fontWeight: 700, color: "#fff", margin: "0 0 8px" },
  suggestDesc:      { fontSize: 14, color: "#a1a1aa", lineHeight: 1.5, margin: "0 0 16px" },
  suggestFooter:    { display: "flex", justifyContent: "space-between", alignItems: "flex-end" },
  suggestPriceLabel:{ fontSize: 12, color: "#a1a1aa", marginBottom: 4 },
  suggestPrice:     { fontSize: 18, fontWeight: 600, color: "#00ffff" },
  exploreBtn:       { background: "linear-gradient(90deg, #00ffff, #8b5cf6)", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 14, fontWeight: 700, color: "#000", cursor: "pointer" },
  suggestWide:      { backdropFilter: "blur(6px)", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden", gridColumn: "1 / -1", display: "flex", height: 246 },
  suggestWideImg:   { width: "33%", height: "100%", objectFit: "cover", flexShrink: 0 },
  suggestWideBody:  { flex: 1, padding: 20, display: "flex", flexDirection: "column", justifyContent: "center" },
  modalOverlay:     { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal:            { backgroundColor: "#0f1724", border: "1px solid rgba(0,255,255,0.2)", borderRadius: 16, padding: 40, width: 440, textAlign: "center", boxShadow: "0 25px 50px rgba(0,0,0,0.5)" },
  modalTitle:       { fontSize: 24, fontWeight: 700, color: "#fff", margin: "0 0 12px" },
  modalText:        { fontSize: 15, color: "#a1a1aa", lineHeight: 1.6, margin: "0 0 24px" },
  modalBtnPrimary:  { width: "100%", background: "linear-gradient(135deg, #00ffff, #8b5cf6)", border: "none", borderRadius: 8, padding: "12px 24px", fontSize: 15, fontWeight: 700, color: "#000", cursor: "pointer", marginBottom: 12 },
  modalBtnSecondary:{ width: "100%", background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "12px 24px", fontSize: 15, color: "#a1a1aa", cursor: "pointer" },
};

export default function Dashboard() {
  const { user } = useAuth();
  const { generer, getMesVoyages, voyages, loading, error } = useVoyage();

  // Lit sessionStorage une seule fois via useState lazy init — pas de useEffect
  const [prompt, setPrompt] = useState(() => {
    const saved = sessionStorage.getItem("libertia_prompt");
    if (saved) { sessionStorage.removeItem("libertia_prompt"); return saved; }
    return "";
  });

  const [activeFilter, setActiveFilter]     = useState(null);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const promptsUsed = user?.promptsUtilises || 0;
  const promptsLeft = FREEMIUM.MAX_FREE_PROMPTS - promptsUsed;

  // useCallback mémoïse getMesVoyages → useEffect ne boucle pas
  const loadVoyages = useCallback(() => { getMesVoyages(); }, [getMesVoyages]);

  useEffect(() => { loadVoyages(); }, [loadVoyages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    if (promptsLeft <= 0) { setShowLimitModal(true); return; }
    const fullPrompt = activeFilter ? `${prompt} [Filtre: ${activeFilter}]` : prompt;
    await generer(fullPrompt);
    setPrompt("");
    getMesVoyages();
  };

  return (
    <div style={s.page}>

      {/* NAVBAR */}
      <nav style={s.navbar}>
        <div style={s.navLogo}>
          <img src={imgLogo} alt="Libertia" style={s.navLogoImg} />
          <span style={s.navLogoText}>Libertia</span>
        </div>
        <div style={s.navLinks}>
          {["Accueil", "Vols", "Hébergements", "Activités", "Communauté"].map((item) => (
            <button key={item} style={s.navLink}>{item}</button>
          ))}
        </div>
        <div style={s.navRight}>
          <button style={s.navIconBtn}><img src={imgMoon} alt="" style={s.navIconImg} /></button>
          <button style={s.navIconBtn}><img src={imgGlobe} alt="" style={s.navIconImg} />FR</button>
          <div style={s.navAvatar}>
            <img src={imgProfile} alt={user?.name || "Profil"} style={s.navAvatarImg} />
          </div>
          <div style={s.navBadge}>
            <img src={imgIconAssistant} alt="" style={{ width: 13, height: 13 }} />
            <span style={s.navBadgeText}>Assistant IA</span>
          </div>
        </div>
      </nav>

      <div style={s.main}>

        {/* HERO */}
        <section style={s.hero}>
          <h1 style={s.heroTitle}>Où votre imagination vous porte-t-elle aujourd'hui ?</h1>
          <p style={s.heroSubtitle}>
            Je suis votre assistant de voyage personnel. Je trouve vols, hôtels et activités selon vos envies.
          </p>

          <form onSubmit={handleSubmit} style={{ width: "100%", display: "flex", justifyContent: "center" }}>
            <div style={s.searchBox}>
              <div style={s.searchLeft}>
                <input
                  style={s.searchInput}
                  placeholder="Dites où vous voulez aller, combien de temps, votre budget..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={loading}
                />
                <div style={s.searchFilters}>
                  {FILTERS.map((f) => (
                    <button
                      key={f.id} type="button"
                      style={activeFilter === f.id ? s.filterPillActive : s.filterPill}
                      onClick={() => setActiveFilter((p) => p === f.id ? null : f.id)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <button type="button" style={s.micBtn}>
                <img src={imgIconMic} alt="Micro" style={s.btnImg} />
              </button>
              <button type="submit" style={s.sendBtn} disabled={loading}>
                <img src={imgIconSend} alt="Envoyer" style={s.btnImg} />
              </button>
            </div>
          </form>

          <div style={s.promptCounter}>
            <span>Prompts restants :</span>
            <span style={s.promptNum}>{promptsLeft}/{FREEMIUM.MAX_FREE_PROMPTS}</span>
            {promptsLeft <= 2 && <span style={{ color: "#f97316", fontSize: 12 }}> — Passez à Premium !</span>}
          </div>
          {error   && <div style={s.errorText}>{error}</div>}
          {loading && <div style={s.loadingText}>🤖 L'IA génère votre itinéraire...</div>}
        </section>

        {/* DASHBOARD SPLIT */}
        <div style={s.dashboard}>

          {/* Colonne gauche — Historique */}
          <div>
            <div style={s.sectionHeader}>
              <img src={imgIconHistory} alt="" style={s.sectionIcon} />
              <h2 style={s.sectionTitle}>Mes demandes récentes</h2>
            </div>
            <p style={s.sectionSub}>Retrouvez vos dernières conversations et recherches.</p>

            {(voyages.length > 0 ? voyages : DEMO_HISTORY).map((v) => (
              <div key={v.id || v._id} style={s.historyCard}>
                <div>
                  <div style={s.historyDate}>
                    <img src={imgIconCalendar} alt="" style={s.historyDateIcon} />
                    <span style={s.historyDateText}>
                      {v.date || new Date(v.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <div style={s.historyTitle}>{v.title || v.prompt}</div>
                  <div style={s.historySubtitle}>{v.subtitle || v.destination}</div>
                  {v.badge && (
                    <div style={{ display: "inline-flex", alignItems: "center", backgroundColor: v.badge.bg, border: `1px solid ${v.badge.border}`, borderRadius: 12, padding: "5px 11px", marginTop: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: v.badge.color }}>{v.badge.label}</span>
                    </div>
                  )}
                </div>
                <button style={s.historyBtn}>{v.btnLabel || "Voir"}</button>
              </div>
            ))}
            <button style={s.seeAllBtn}>Voir tout l'historique</button>
          </div>

          {/* Colonne droite — Suggestions */}
          <div>
            <div style={s.sectionHeader}>
              <img src={imgIconSuggests} alt="" style={s.sectionIcon} />
              <h2 style={s.sectionTitle}>Suggestions pour vous</h2>
            </div>
            <p style={s.sectionSub}>Basé sur votre historique et vos préférences de voyage.</p>

            <div style={s.suggestGrid}>
              {SUGGESTIONS.map((dest) => (
                <div key={dest.id} style={s.suggestCard}>
                  {dest.img ? <img src={dest.img} alt={dest.city} style={s.suggestImg} /> : <div style={s.suggestPlaceholder} />}
                  <div style={s.suggestBody}>
                    <div style={s.suggestTag}>
                      <img src={imgIconStar} alt="" style={s.suggestTagIcon} />
                      <span style={s.suggestTagText}>{dest.tag}</span>
                    </div>
                    <h3 style={s.suggestCity}>{dest.city}</h3>
                    <p style={s.suggestDesc}>{dest.desc}</p>
                    <div style={s.suggestFooter}>
                      <div>
                        <div style={s.suggestPriceLabel}>{dest.type}</div>
                        <div style={s.suggestPrice}>{dest.price}</div>
                      </div>
                      <button style={s.exploreBtn}>Explorer</button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Card Lisbonne pleine largeur */}
              <div style={s.suggestWide}>
                <img src={imgLisbonne} alt="Lisbonne" style={s.suggestWideImg} />
                <div style={s.suggestWideBody}>
                  <div style={s.suggestTag}>
                    <img src={imgIconStar} alt="" style={s.suggestTagIcon} />
                    <span style={s.suggestTagText}>Budget 1500€ respecté</span>
                  </div>
                  <h3 style={s.suggestCity}>Lisbonne, Portugal</h3>
                  <p style={s.suggestDesc}>
                    Excellente alternative pour du soleil, une culture riche et une gastronomie exceptionnelle sans exploser votre budget.
                  </p>
                  <div style={s.suggestFooter}>
                    <div style={s.suggestPrice}>~600€</div>
                    <button style={s.exploreBtn}>Explorer</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* MODAL LIMITE (T33) */}
      {showLimitModal && (
        <div style={s.modalOverlay} onClick={() => setShowLimitModal(false)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
            <h2 style={s.modalTitle}>Limite atteinte !</h2>
            <p style={s.modalText}>
              Vous avez utilisé vos {FREEMIUM.MAX_FREE_PROMPTS} prompts gratuits ce mois-ci.
              Passez à Premium pour des itinéraires illimités.
            </p>
            <button style={s.modalBtnPrimary}>Passer à Premium</button>
            <button style={s.modalBtnSecondary} onClick={() => setShowLimitModal(false)}>
              Continuer gratuitement
            </button>
          </div>
        </div>
      )}

    </div>
  );
}