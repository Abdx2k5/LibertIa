import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// ── Assets Figma ────────────────────────────────────────────────
const imgParis        = "https://www.figma.com/api/mcp/asset/92bdf3fb-5f9e-480d-9079-1c2180415fd7";
const imgTokyo        = "https://www.figma.com/api/mcp/asset/171ebab0-6ce1-4d6a-b1de-c1013733cc56";
const imgNewYork      = "https://www.figma.com/api/mcp/asset/cb04f00d-596e-444e-bfdc-cb71011d9ba3";
const imgMarrakech    = "https://www.figma.com/api/mcp/asset/cace39cf-0811-45bb-a19b-04aada7e7774";
const imgSpaceBg      = "https://www.figma.com/api/mcp/asset/d42b2bd3-40e7-4c81-9e00-2f6037d84ee4";
const imgAvatar       = "https://www.figma.com/api/mcp/asset/5f1a2aee-8987-4cde-a559-838323f1b3f2";
const imgAvatar1      = "https://www.figma.com/api/mcp/asset/d1d5ba7d-f6ef-4d71-a594-3c553de39126";
const imgAvatar2      = "https://www.figma.com/api/mcp/asset/b11aad4e-a6e5-4523-a1b5-bc781996e1e1";
const imgAvatar3      = "https://www.figma.com/api/mcp/asset/b852701a-89c0-4c57-a396-5c4f33f2eb4d";
const imgTrip         = "https://www.figma.com/api/mcp/asset/2d1d879d-a4d2-4bc2-98bf-7842a9327598";
const imgTrip1        = "https://www.figma.com/api/mcp/asset/e592ac33-41cb-4f66-a2e8-c27ba00eed12";
const imgLogoGroup    = "https://www.figma.com/api/mcp/asset/7a5ce784-e9e9-4ed6-aa7b-adc4cd67a502";
const imgIconSearch   = "https://www.figma.com/api/mcp/asset/94a3da07-8c28-40f0-bd59-a220992a155e";
const imgIconAI       = "https://www.figma.com/api/mcp/asset/7fcf71f1-40e1-4dd3-9b79-ee4ee4331312";
const imgIconCommunity= "https://www.figma.com/api/mcp/asset/c6cb727c-10ea-4a6f-bc2a-08669c4a1d16";
const imgIconVoice    = "https://www.figma.com/api/mcp/asset/64ca7c34-2675-4bb8-bd3e-de86f9ac60b2";
const imgIconAll      = "https://www.figma.com/api/mcp/asset/08ed1961-af49-4eae-b73f-655e2d2bb560";
const imgIconPin      = "https://www.figma.com/api/mcp/asset/dc36d9d9-516f-410c-bb9f-b105d793f18e";
const imgIconHeart    = "https://www.figma.com/api/mcp/asset/292336c0-8311-4ec5-bb54-54820d08304e";
const imgIconComment  = "https://www.figma.com/api/mcp/asset/ae969c0b-1158-480a-aeda-45131b3848fe";
const imgIconDark     = "https://www.figma.com/api/mcp/asset/89237d47-bdf6-45f0-9122-d83426d715db";
const imgIconTranslate= "https://www.figma.com/api/mcp/asset/2deabd7e-8ea3-4d37-a349-37e2cf0710c9";
const imgFooterLogo   = "https://www.figma.com/api/mcp/asset/c3a61fd3-9247-4d1d-80d2-c1f31a6f8b75";
const imgGlobe        = "https://www.figma.com/api/mcp/asset/ce67d7c1-e338-4383-8ae7-5ea7ae0b31e4";

// ── Destinations (pour le panneau latéral) ────────────────────────
const DESTINATIONS = [
  { img: imgParis,     name: "Paris",     country: "France",       price: "~450€",  count: "1.2k intéressés", tags: ["Culture", "Gastronomie"] },
  { img: imgTokyo,     name: "Tokyo",     country: "Japon",        price: "~1200€", count: "3.4k intéressés", tags: ["Technologie", "Cuisine"] },
  { img: imgNewYork,   name: "New York",  country: "États-Unis",   price: "~850€",  count: "2.1k intéressés", tags: ["Shopping", "Culture"] },
  { img: imgMarrakech, name: "Marrakech", country: "Maroc",        price: "~320€",  count: "950 intéressés",  tags: ["Aventure", "Gastronomie"] },
  { img: null,         name: "Barcelone", country: "Espagne",      price: "~400€",  count: "1.8k intéressés", tags: ["Plage", "Nightlife"] },
  { img: null,         name: "Dubai",     country: "Émirats",      price: "~700€",  count: "2.5k intéressés", tags: ["Luxe", "Shopping"] },
];

// ── Exemples de prompts IA ─────────────────────────────────────────
const AI_EXAMPLES = [
  "Je veux 5 jours à Tokyo avec un budget de 1500€",
  "Voyage romantique à Paris pour 2 personnes",
  "Aventure au Maroc, 7 jours, budget serré",
];

// ── Data statique ──────────────────────────────────────────────────
const navItems = ["Accueil", "Vols", "Hébergements", "Activités", "Communauté"];

const howItWorks = [
  { icon: imgIconSearch,     title: "1. Exprimez votre voyage",  text: "Parlez ou écrivez vos envies. Pas besoin de formulaires complexes, dites simplement ce qui vous ferait plaisir." },
  { icon: imgIconAI,         title: "2. L'IA organise tout",     text: "Notre assistant génère des itinéraires complets : vols, hôtels, et activités parfaitement adaptés à votre profil." },
  { icon: imgIconCommunity,  title: "3. La communauté valide",   text: "Consultez les avis des membres ayant déjà fait ce parcours et ajustez vos choix en toute confiance." },
];

const whyCards = [
  { icon: imgIconVoice,      title: "Texte & Voix",      text: "Recherchez et planifiez simplement en parlant à l'application." },
  { icon: imgIconAI,         title: "IA Personnalisée",  text: "Apprend vos préférences pour proposer des séjours sur-mesure." },
  { icon: imgIconCommunity,  title: "Communauté",        text: "Des voyageurs bienveillants prêts à partager leurs astuces." },
  { icon: imgIconAll,        title: "Tout-en-un",        text: "Vols, hôtels, et activités combinés en un seul panier flexible." },
  { icon: imgIconDark,       title: "Dark & Light Mode", text: "Profitez de notre ambiance nocturne ou basculez en mode jour." },
  { icon: imgIconTranslate,  title: "Traduction Auto",   text: "Parcourez les avis et interagissez dans la langue de votre choix." },
];

const communityPosts = [
  { img: imgTrip,  name: "Sarah M.", location: "à Kyoto, Japon",     text: "L'itinéraire IA était parfait. Le temple d'or au lever du soleil, sans la foule ! 🌸", likes: 124, comments: 12 },
  { img: imgTrip1, name: "Marc T.",  location: "à Marrakech, Maroc", text: "Super recommandation pour le Riad. Merci la communauté Libertia pour les conseils. 🐪", likes: 89,  comments: 5  },
];

// ── Styles ─────────────────────────────────────────────────────────
const s = {
  page:       { backgroundColor: "#0b1020", minHeight: "100vh", fontFamily: "'Inter', sans-serif", color: "#fafafa" },
  background: { background: "linear-gradient(135deg, #09090b 0%, #171123 100%)", position: "relative" },
  navbar:     { position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "20px 120px", display: "flex", alignItems: "center", justifyContent: "space-between", backdropFilter: "blur(12px)", backgroundColor: "rgba(9,9,11,0.8)" },
  navLogo:    { display: "flex", alignItems: "center", gap: 12, textDecoration: "none" },
  navLogoImg: { width: 32, height: 32 },
  navLogoText:{ fontSize: 20, fontWeight: 700, color: "#fff" },
  navLinks:   { display: "flex", gap: 32, alignItems: "center" },
  navLink:    { fontSize: 14, fontWeight: 500, color: "#d4d4d8", textDecoration: "none", cursor: "pointer", background: "none", border: "none", padding: 0 },
  navActions: { display: "flex", alignItems: "center", gap: 16 },
  btnOutline: { border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, padding: "10px 20px", fontSize: 14, color: "#fff", background: "transparent", cursor: "pointer" },
  btnPurple:  { backgroundColor: "#8b5cf6", borderRadius: 6, padding: "10px 20px", fontSize: 14, color: "#fff", border: "none", cursor: "pointer" },
  langBtn:    { display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#fff", fontSize: 14, cursor: "pointer" },
  section:    { maxWidth: 1200, margin: "0 auto", padding: "0 24px" },
  sectionWrap:{ padding: "106px 120px 80px" },
  hero:       { position: "relative", overflow: "hidden", padding: "156px 320px 80px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" },
  heroBg:     { position: "absolute", inset: 0, opacity: 0.15, overflow: "hidden" },
  heroBgImg:  { width: "100%", height: "158%", position: "absolute", top: "-29%", left: 0, objectFit: "cover" },
  heroContent:{ position: "relative", zIndex: 1, maxWidth: 800, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 },
  heroTitle:  { fontSize: 56, fontWeight: 800, lineHeight: 1.1, background: "linear-gradient(131deg, #ffffff 0%, #a78bfa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", margin: 0 },
  heroSubtitle:{ fontSize: 20, fontWeight: 400, color: "#d4d4d8", margin: 0, paddingBottom: 8 },

  // Toggle switch
  toggleWrap: { display: "flex", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 40, padding: 4, gap: 4 },
  toggleBtn:  { padding: "8px 20px", borderRadius: 36, fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 6 },

  // Barre de recherche
  heroSearch: { display: "flex", alignItems: "center", gap: 16, width: 600, backdropFilter: "blur(8px)", backgroundColor: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 40, padding: "9px 9px 9px 25px" },
  heroSearchIcon: { width: 24, height: 24, flexShrink: 0 },
  heroSearchInput: { flex: 1, background: "none", border: "none", outline: "none", fontSize: 15, color: "#fff", width: "100%" },
  heroSearchBtn: { backgroundColor: "#8b5cf6", borderRadius: 30, border: "none", padding: "12px 24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  heroSearchBtnImg: { width: 20, height: 20 },

  // Exemples IA
  aiExamples: { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" },
  aiExample:  { backgroundColor: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 20, padding: "5px 12px", fontSize: 12, color: "#a78bfa", cursor: "pointer", background: "none" },

  // Panneau latéral
  panelOverlay:  { position: "fixed", inset: 0, zIndex: 200, display: "flex" },
  panelBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" },
  panel:         { width: 440, backgroundColor: "#0f1724", borderLeft: "1px solid rgba(255,255,255,0.08)", height: "100vh", overflowY: "auto", display: "flex", flexDirection: "column" },
  panelHeader:   { padding: "24px 24px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" },
  panelTitle:    { fontSize: 16, fontWeight: 600, color: "#fafafa" },
  panelClose:    { background: "none", border: "none", color: "#71717a", fontSize: 20, cursor: "pointer" },
  panelContent:  { padding: 16, flex: 1, display: "flex", flexDirection: "column", gap: 12 },
  panelCount:    { fontSize: 13, color: "#a1a1aa", padding: "0 0 4px" },
  destCard:      { display: "flex", gap: 12, padding: 16, backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, cursor: "pointer" },
  destCardImg:   { width: 72, height: 72, borderRadius: 8, objectFit: "cover", flexShrink: 0, backgroundColor: "#1a1a2e" },
  destCardInfo:  { flex: 1 },
  destCardName:  { fontSize: 15, fontWeight: 600, color: "#fafafa", marginBottom: 2 },
  destCardCountry:{ fontSize: 12, color: "#71717a", marginBottom: 6 },
  destCardTags:  { display: "flex", gap: 6, flexWrap: "wrap" },
  destCardTag:   { fontSize: 10, color: "#a78bfa", backgroundColor: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 99, padding: "2px 8px" },
  destCardPrice: { fontSize: 14, fontWeight: 600, color: "#a78bfa", alignSelf: "center", flexShrink: 0 },
  panelAiBtn:    { margin: "4px 0 8px", background: "linear-gradient(135deg, #06b6d4, #8b5cf6)", border: "none", borderRadius: 8, padding: "12px 24px", fontSize: 14, fontWeight: 700, color: "#061826", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },

  // Sections
  sectionHeadWrap:{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginBottom: 32 },
  sectionTitle:  { fontSize: 32, fontWeight: 700, background: "linear-gradient(90deg, #c4b5fd, #ffffff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", margin: 0, textAlign: "center" },
  sectionSub:    { fontSize: 16, color: "#a1a1aa", margin: 0, textAlign: "center" },
  howCards:      { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, paddingTop: 32 },
  glassCard:     { backdropFilter: "blur(6px)", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "40px 24px 32px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 16 },
  howIconWrap:   { width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(139,92,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center" },
  howIcon:       { width: 32, height: 32 },
  howCardTitle:  { fontSize: 20, fontWeight: 600, color: "#fafafa", margin: 0 },
  howCardText:   { fontSize: 15, color: "#a1a1aa", lineHeight: 1.5, margin: 0 },
  commWrap:      { padding: "80px 144px" },
  commInner:     { display: "flex", gap: 48, alignItems: "center", justifyContent: "center", maxWidth: 1200, margin: "0 auto" },
  commLeft:      { flex: 1, display: "flex", flexDirection: "column", gap: 16 },
  commTitle:     { fontSize: 32, fontWeight: 700, background: "linear-gradient(90deg, #c4b5fd, #ffffff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", margin: 0 },
  commText:      { fontSize: 16, color: "#a1a1aa", lineHeight: 1.6, margin: 0 },
  commAvatars:   { display: "flex", gap: 16, alignItems: "center", padding: "16px 0" },
  commAvatar:    { width: 56, height: 56, borderRadius: 28, border: "2px solid #27272a", objectFit: "cover", flexShrink: 0 },
  commAvatarMore:{ width: 56, height: 56, borderRadius: 28, backgroundColor: "#27272a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#fff", flexShrink: 0 },
  commRight:     { flex: 1, display: "flex", flexDirection: "column", gap: 16 },
  commCard:      { backdropFilter: "blur(6px)", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: 25, display: "flex", gap: 16, alignItems: "flex-start" },
  commCardImg:   { width: 80, height: 80, borderRadius: 6, objectFit: "cover", flexShrink: 0 },
  commCardBody:  { flex: 1, display: "flex", flexDirection: "column", gap: 8 },
  commCardHeader:{ display: "flex", gap: 8, alignItems: "center" },
  commCardName:  { fontSize: 13, fontWeight: 500, color: "#d4d4d8" },
  commCardLoc:   { fontSize: 13, fontWeight: 500, color: "#71717a" },
  commCardText:  { fontSize: 14, color: "#a1a1aa", lineHeight: 1.5, margin: 0 },
  commCardActions:{ display: "flex", gap: 12, alignItems: "center" },
  commCardAction:{ display: "flex", gap: 4, alignItems: "center" },
  commCardActionImg:{ width: 12, height: 12 },
  commCardActionCount:{ fontSize: 12, color: "#71717a" },
  destCards:     { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, paddingTop: 32 },
  destCard2:     { backdropFilter: "blur(6px)", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, overflow: "hidden", display: "flex", flexDirection: "column", cursor: "pointer" },
  destImg:       { width: "100%", height: 200, objectFit: "cover", display: "block" },
  destBody:      { padding: 20, display: "flex", flexDirection: "column", gap: 8 },
  destRow:       { display: "flex", justifyContent: "space-between", alignItems: "center" },
  destName:      { fontSize: 18, fontWeight: 600, color: "#fafafa", margin: 0 },
  destPrice:     { fontSize: 16, fontWeight: 500, color: "#a78bfa" },
  destMeta:      { display: "flex", gap: 6, alignItems: "center" },
  destMetaIcon:  { width: 14, height: 14 },
  destMetaText:  { fontSize: 13, color: "#a1a1aa" },
  whyGrid:       { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, paddingTop: 32 },
  whyCard:       { backdropFilter: "blur(6px)", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: 25, display: "flex", gap: 16, alignItems: "flex-start" },
  whyIcon:       { width: 24, height: 24, flexShrink: 0, marginTop: 2 },
  whyBody:       { display: "flex", flexDirection: "column", gap: 8 },
  whyTitle:      { fontSize: 16, fontWeight: 600, color: "#fafafa", margin: 0 },
  whyText:       { fontSize: 14, color: "#a1a1aa", lineHeight: 1.5, margin: 0 },
  footer:        { borderTop: "1px solid rgba(255,255,255,0.05)", padding: "65px 120px 32px", marginTop: 40 },
  footerInner:   { maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", flexDirection: "column", gap: 48 },
  footerTop:     { display: "flex", gap: 48, alignItems: "flex-start" },
  footerBrand:   { display: "flex", flexDirection: "column", gap: 12, flex: "0 0 400px" },
  footerBrandLogo:{ display: "flex", alignItems: "center", gap: 12 },
  footerBrandLogoImg:{ width: 24, height: 24 },
  footerBrandName:{ fontSize: 20, fontWeight: 700, color: "#fff", margin: 0 },
  footerBrandText:{ fontSize: 14, color: "#a1a1aa", lineHeight: 1.6, margin: 0 },
  footerCol:     { display: "flex", flexDirection: "column", gap: 20, flex: 1 },
  footerColTitle:{ fontSize: 16, fontWeight: 600, color: "#fff", margin: 0 },
  footerColLinks:{ display: "flex", flexDirection: "column", gap: 12 },
  footerColLink: { fontSize: 16, color: "#fafafa", textDecoration: "none", cursor: "pointer", background: "none", border: "none", textAlign: "left", padding: 0 },
  footerBottom:  { borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 25, display: "flex", justifyContent: "space-between", alignItems: "center" },
  footerCopy:    { fontSize: 13, color: "#71717a" },
  footerLang:    { display: "flex", gap: 8, alignItems: "center" },
  footerLangIcon:{ width: 16, height: 16 },
  footerLangText:{ fontSize: 13, color: "#71717a" },
};

// ── Composant ──────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate();
    // mic checking 
    const [isListening, setIsListening] = useState(false);
    const [micError, setMicError]       = useState(null);
  // Vérifie si l'user est connecté via localStorage (pas d'import de store)
  const isAuthenticated = !!localStorage.getItem("libertia_token");

  const [isAiMode, setIsAiMode]   = useState(false);
  const [query, setQuery]         = useState("");
  const [panelOpen, setPanelOpen] = useState(false);

  // Filtre les destinations selon la saisie
  const filtered = query.trim().length >= 1
    ? DESTINATIONS.filter((d) =>
        d.name.toLowerCase().includes(query.toLowerCase()) ||
        d.country.toLowerCase().includes(query.toLowerCase()) ||
        d.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
      )
    : DESTINATIONS;

  // Soumission de la barre
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (isAiMode) {
      // Mode IA → stocke le prompt et redirige
      sessionStorage.setItem("libertia_prompt", query.trim());
      navigate(isAuthenticated ? "/dashboard" : "/register");
    } else {
      // Mode Recherche → ouvre le panneau latéral
      setPanelOpen(true);
    }
  };

  // Clic sur une destination dans le panneau
  const handleDestClick = (dest) => {
    const prompt = `Je veux visiter ${dest.name}, ${dest.country}`;
    sessionStorage.setItem("libertia_prompt", prompt);
    navigate(isAuthenticated ? "/dashboard" : "/register");
  };

  // Switch de mode
  const handleModeSwitch = (aiMode) => {
    setIsAiMode(aiMode);
    setQuery("");
    setPanelOpen(false);
  };

  const handleMic = () => {
  if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
    setMicError("Microphone non supporté par ce navigateur");
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = "fr-FR";
  recognition.interimResults = false;

  recognition.onstart  = () => setIsListening(true);
  recognition.onend    = () => setIsListening(false);
  recognition.onerror  = () => { setIsListening(false); setMicError("Accès micro refusé"); };
  recognition.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    setQuery(transcript);
    setMicError(null);
  };

  recognition.start();
};

  return (
    <div style={s.page}>
      <div style={s.background}>

        {/* ── NAVBAR ── */}
        <nav style={s.navbar}>
          <Link to="/" style={s.navLogo}>
            <img src={imgLogoGroup} alt="Libertia" style={s.navLogoImg} />
            <span style={s.navLogoText}>Libertia</span>
          </Link>
          <div style={s.navLinks}>
            {navItems.map((item) => (
              <button key={item} style={s.navLink}>{item}</button>
            ))}
          </div>
          <div style={s.navActions}>
            <button style={s.langBtn}>
              <img src={imgGlobe} alt="" style={{ width: 20, height: 20 }} />
              FR
            </button>
            <Link to="/login">
              <button style={s.btnOutline}>Se connecter</button>
            </Link>
            <Link to="/register">
              <button style={s.btnPurple}>S'inscrire</button>
            </Link>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section style={{ ...s.hero, paddingTop: 160 }}>
          <div style={s.heroBg}>
            <img src={imgSpaceBg} alt="" style={s.heroBgImg} />
          </div>
          <div style={s.heroContent}>
            <h1 style={s.heroTitle}>
              Voyagez intelligemment<br />avec Libertia
            </h1>
            <p style={s.heroSubtitle}>
              Une communauté de voyageurs, un assistant IA qui réserve tout pour vous.
            </p>

            {/* Toggle Recherche / Assistant IA */}
            <div style={s.toggleWrap}>
              <button
                type="button"
                style={{ ...s.toggleBtn, backgroundColor: !isAiMode ? "#8b5cf6" : "transparent", color: !isAiMode ? "#fff" : "#a1a1aa" }}
                onClick={() => handleModeSwitch(false)}
              >
                 Recherche
              </button>
              <button
                type="button"
                style={{ ...s.toggleBtn, backgroundColor: isAiMode ? "#8b5cf6" : "transparent", color: isAiMode ? "#fff" : "#a1a1aa" }}
                onClick={() => handleModeSwitch(true)}
              >
                 Assistant IA
              </button>
            </div>

            {/* Barre de recherche */}
            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                <div style={{
                        ...s.heroSearch,
                        border: isListening
                      ? "1px solid rgba(139,92,246,0.8)"
                      : "1px solid rgba(255,255,255,0.15)",
                transition: "border-color 0.3s",}}>
                {isAiMode ? (
  // Icône IA — étoile sparkle
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
                </svg>
                ) : (
                    // Icône Recherche — loupe
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                )}
                <input
                style={s.heroSearchInput}
                placeholder={
                isListening ? "Je vous écoute...": isAiMode
                ? "Décrivez votre voyage : destination, durée, budget..."
                : "Rechercher une destination, un pays..."
                }
            value={query}
            onChange={(e) => setQuery(e.target.value)}/>

    {/* Bouton mic — visible UNIQUEMENT en mode IA */}
    {isAiMode && (
      <button
        type="button"
        onClick={handleMic}
        style={{
          background: isListening
            ? "rgba(139,92,246,0.3)"
            : "rgba(255,255,255,0.05)",
          border: isListening
            ? "1px solid #8b5cf6"
            : "1px solid rgba(255,255,255,0.1)",
          borderRadius: 24,
          padding: "10px 12px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "all 0.2s",
        }}
        title={isListening ? "Écoute en cours..." : "Activer le microphone"}
      >
        {isListening ? (
          // Animation pulsation quand actif
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#8b5cf6">
            <rect x="9" y="2" width="6" height="12" rx="3"/>
            <path d="M5 10a7 7 0 0 0 14 0" stroke="#8b5cf6" strokeWidth="2" fill="none" strokeLinecap="round"/>
            <line x1="12" y1="17" x2="12" y2="21" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ) : (
          // Icône mic normal
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="2" width="6" height="12" rx="3"/>
            <path d="M5 10a7 7 0 0 0 14 0"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
        )}
      </button>
    )}

    {/* Bouton submit — flèche SVG */}
            <button type="submit" style={s.heroSearchBtn}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="13 6 19 12 13 18" />
                </svg>
                </button>
            </div>
        </form>

        {/* Message d'erreur micro */}
        {micError && (
        <p style={{ fontSize: 12, color: "#f87171", margin: 0 }}>{micError}</p>
        )}

            {/* Exemples de prompts (mode IA uniquement) */}
            {isAiMode && (
              <div style={s.aiExamples}>
                {AI_EXAMPLES.map((ex) => (
                  <button key={ex} style={s.aiExample} onClick={() => setQuery(ex)}>
                    {ex}
                  </button>
                ))}
              </div>
            )}

            {/* Info contextuelle */}
            <p style={{ fontSize: 13, color: "#71717a", margin: 0 }}>
              {isAiMode
                ? isAuthenticated
                  ? "Appuyez sur Entrée pour générer votre itinéraire IA 🚀"
                  : "Vous serez invité à vous inscrire pour utiliser l'assistant IA"
                : "Tapez une destination pour voir les suggestions"}
            </p>
          </div>
        </section>

        {/* ── COMMENT ÇA MARCHE ── */}
        <section style={s.sectionWrap}>
          <div style={s.section}>
            <div style={s.sectionHeadWrap}>
              <h2 style={s.sectionTitle}>Comment ça marche</h2>
              <p style={s.sectionSub}>Trois étapes simples vers votre prochaine aventure</p>
            </div>
            <div style={s.howCards}>
              {howItWorks.map((item) => (
                <div key={item.title} style={s.glassCard}>
                  <div style={s.howIconWrap}>
                    <img src={item.icon} alt="" style={s.howIcon} />
                  </div>
                  <h3 style={s.howCardTitle}>{item.title}</h3>
                  <p style={s.howCardText}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── COMMUNAUTÉ ── */}
        <section style={s.commWrap}>
          <div style={s.commInner}>
            <div style={s.commLeft}>
              <h2 style={s.commTitle}>Des voyageurs comme vous</h2>
              <p style={s.commText}>
                Rejoignez des milliers d'explorateurs. Partagez vos carnets de bord,
                trouvez l'inspiration et réservez des itinéraires approuvés par la communauté.
              </p>
              <div style={s.commAvatars}>
                {[imgAvatar, imgAvatar1, imgAvatar2, imgAvatar3].map((src, i) => (
                  <img key={i} src={src} alt="" style={s.commAvatar} />
                ))}
                <div style={s.commAvatarMore}>+2k</div>
              </div>
              <Link to="/register">
                <button style={{ ...s.btnPurple, fontSize: 16, padding: "13px 24px" }}>
                  Rejoindre la communauté
                </button>
              </Link>
            </div>
            <div style={s.commRight}>
              {communityPosts.map((post) => (
                <div key={post.name} style={s.commCard}>
                  <img src={post.img} alt="" style={s.commCardImg} />
                  <div style={s.commCardBody}>
                    <div style={s.commCardHeader}>
                      <span style={s.commCardName}>{post.name}</span>
                      <span style={s.commCardLoc}>• {post.location}</span>
                    </div>
                    <p style={s.commCardText}>{post.text}</p>
                    <div style={s.commCardActions}>
                      <div style={s.commCardAction}>
                        <img src={imgIconHeart} alt="" style={s.commCardActionImg} />
                        <span style={s.commCardActionCount}>{post.likes}</span>
                      </div>
                      <div style={s.commCardAction}>
                        <img src={imgIconComment} alt="" style={s.commCardActionImg} />
                        <span style={s.commCardActionCount}>{post.comments}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DESTINATIONS POPULAIRES ── */}
        <section style={s.sectionWrap}>
          <div style={s.section}>
            <div style={s.sectionHeadWrap}>
              <h2 style={s.sectionTitle}>Destinations Populaires</h2>
              <p style={s.sectionSub}>Les lieux les plus demandés cette semaine par notre IA</p>
            </div>
            <div style={s.destCards}>
              {DESTINATIONS.slice(0, 4).map((dest) => (
                <div
                  key={dest.name}
                  style={s.destCard2}
                  onClick={() => handleDestClick(dest)}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(139,92,246,0.4)"}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
                >
                  {dest.img
                    ? <img src={dest.img} alt={dest.name} style={s.destImg} />
                    : <div style={{ ...s.destImg, backgroundColor: "#1a1a2e" }} />
                  }
                  <div style={s.destBody}>
                    <div style={s.destRow}>
                      <span style={s.destName}>{dest.name}</span>
                      <span style={s.destPrice}>{dest.price}</span>
                    </div>
                    <div style={s.destMeta}>
                      <img src={imgIconPin} alt="" style={s.destMetaIcon} />
                      <span style={s.destMetaText}>{dest.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── POURQUOI LIBERTIA ── */}
        <section style={s.sectionWrap}>
          <div style={s.section}>
            <div style={s.sectionHeadWrap}>
              <h2 style={s.sectionTitle}>Pourquoi Libertia ?</h2>
              <p style={s.sectionSub}>Tout ce dont vous avez besoin pour un voyage sans friction</p>
            </div>
            <div style={s.whyGrid}>
              {whyCards.map((card) => (
                <div key={card.title} style={s.whyCard}>
                  <img src={card.icon} alt="" style={s.whyIcon} />
                  <div style={s.whyBody}>
                    <h4 style={s.whyTitle}>{card.title}</h4>
                    <p style={s.whyText}>{card.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={s.footer}>
          <div style={s.footerInner}>
            <div style={s.footerTop}>
              <div style={s.footerBrand}>
                <div style={s.footerBrandLogo}>
                  <img src={imgFooterLogo} alt="" style={s.footerBrandLogoImg} />
                  <p style={s.footerBrandName}>Libertia</p>
                </div>
                <p style={s.footerBrandText}>
                  L'assistant de voyage nouvelle génération propulsé par l'IA
                  et validé par une communauté d'explorateurs passionnés.
                </p>
              </div>
              {[
                { title: "Explorer",    links: ["Destinations", "Communauté", "Vols & Hôtels"] },
                { title: "Légal",       links: ["Conditions d'utilisation", "Confidentialité", "Cookies"] },
                { title: "Suivez-nous", links: ["Instagram", "Twitter", "TikTok"] },
              ].map((col) => (
                <div key={col.title} style={s.footerCol}>
                  <p style={s.footerColTitle}>{col.title}</p>
                  <div style={s.footerColLinks}>
                    {col.links.map((link) => (
                      <button key={link} style={s.footerColLink}>{link}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={s.footerBottom}>
              <span style={s.footerCopy}>© 2025 Libertia. Tous droits réservés.</span>
              <div style={s.footerLang}>
                <img src={imgGlobe} alt="" style={s.footerLangIcon} />
                <span style={s.footerLangText}>Français (FR)</span>
              </div>
            </div>
          </div>
        </footer>

      </div>

      {/* ── PANNEAU LATÉRAL (Mode Recherche) ── */}
      {panelOpen && !isAiMode && (
        <div style={s.panelOverlay}>
          <div style={s.panelBackdrop} onClick={() => setPanelOpen(false)} />
          <div style={s.panel}>
            <div style={s.panelHeader}>
              <span style={s.panelTitle}>Résultats pour "{query}"</span>
              <button style={s.panelClose} onClick={() => setPanelOpen(false)}>✕</button>
            </div>
            <div style={s.panelContent}>
              <p style={s.panelCount}>
                {filtered.length} destination{filtered.length > 1 ? "s" : ""} trouvée{filtered.length > 1 ? "s" : ""}
              </p>

              {filtered.map((dest) => (
                <div
                  key={dest.name}
                  style={s.destCard}
                  onClick={() => handleDestClick(dest)}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(139,92,246,0.4)"}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
                >
                  {dest.img
                    ? <img src={dest.img} alt={dest.name} style={s.destCardImg} />
                    : <div style={s.destCardImg} />
                  }
                  <div style={s.destCardInfo}>
                    <div style={s.destCardName}>{dest.name}</div>
                    <div style={s.destCardCountry}>{dest.country}</div>
                    <div style={s.destCardTags}>
                      {dest.tags.map((t) => (
                        <span key={t} style={s.destCardTag}>{t}</span>
                      ))}
                    </div>
                  </div>
                  <span style={s.destCardPrice}>{dest.price}</span>
                </div>
              ))}

              {/* Bouton pour basculer en mode IA */}
              <button
                style={s.panelAiBtn}
                onClick={() => {
                  setIsAiMode(true);
                  setPanelOpen(false);
                  setQuery(`Je veux visiter ${query}`);
                }}
              >
                🤖 Générer un itinéraire IA pour "{query}"
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}