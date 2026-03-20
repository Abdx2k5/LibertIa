import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Landing.module.css";

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

// ── Données ────────────────────────────────────────────────────────
const DESTINATIONS = [
  { img: imgParis,     name: "Paris",     country: "France",     price: "~450€",  count: "1.2k intéressés", tags: ["Culture", "Gastronomie"] },
  { img: imgTokyo,     name: "Tokyo",     country: "Japon",      price: "~1200€", count: "3.4k intéressés", tags: ["Technologie", "Cuisine"] },
  { img: imgNewYork,   name: "New York",  country: "États-Unis", price: "~850€",  count: "2.1k intéressés", tags: ["Shopping", "Culture"] },
  { img: imgMarrakech, name: "Marrakech", country: "Maroc",      price: "~320€",  count: "950 intéressés",  tags: ["Aventure", "Gastronomie"] },
  { img: null,         name: "Barcelone", country: "Espagne",    price: "~400€",  count: "1.8k intéressés", tags: ["Plage", "Nightlife"] },
  { img: null,         name: "Dubai",     country: "Émirats",    price: "~700€",  count: "2.5k intéressés", tags: ["Luxe", "Shopping"] },
];

const AI_EXAMPLES = [
  "Je veux 5 jours à Tokyo avec un budget de 1500€",
  "Voyage romantique à Paris pour 2 personnes",
  "Aventure au Maroc, 7 jours, budget serré",
];

const navItems = ["Accueil", "Vols", "Hébergements", "Activités", "Communauté"];

const howItWorks = [
  { icon: imgIconAI,        title: "1. Exprimez votre voyage", text: "Parlez ou écrivez vos envies. Pas besoin de formulaires complexes." },
  { icon: imgIconAI,        title: "2. L'IA organise tout",    text: "Notre assistant génère des itinéraires complets : vols, hôtels, et activités." },
  { icon: imgIconCommunity, title: "3. La communauté valide",  text: "Consultez les avis des membres et ajustez vos choix en toute confiance." },
];

const whyCards = [
  { icon: imgIconVoice,     title: "Texte & Voix",      text: "Recherchez et planifiez simplement en parlant à l'application." },
  { icon: imgIconAI,        title: "IA Personnalisée",  text: "Apprend vos préférences pour proposer des séjours sur-mesure." },
  { icon: imgIconCommunity, title: "Communauté",        text: "Des voyageurs bienveillants prêts à partager leurs astuces." },
  { icon: imgIconAll,       title: "Tout-en-un",        text: "Vols, hôtels, et activités combinés en un seul panier flexible." },
  { icon: imgIconDark,      title: "Dark & Light Mode", text: "Profitez de notre ambiance nocturne ou basculez en mode jour." },
  { icon: imgIconTranslate, title: "Traduction Auto",   text: "Parcourez les avis et interagissez dans la langue de votre choix." },
];

const communityPosts = [
  { img: imgTrip,  name: "Sarah M.", location: "à Kyoto, Japon",     text: "L'itinéraire IA était parfait. Le temple d'or au lever du soleil, sans la foule ! 🌸", likes: 124, comments: 12 },
  { img: imgTrip1, name: "Marc T.",  location: "à Marrakech, Maroc", text: "Super recommandation pour le Riad. Merci la communauté Libertia pour les conseils. 🐪", likes: 89,  comments: 5  },
];

// ── Composant ──────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("libertia_token");

  const [isAiMode, setIsAiMode]       = useState(false);
  const [query, setQuery]             = useState("");
  const [panelOpen, setPanelOpen]     = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError]       = useState(null);

  // Destinations filtrées selon la saisie
  const filtered = query.trim().length >= 1
    ? DESTINATIONS.filter((d) =>
        d.name.toLowerCase().includes(query.toLowerCase()) ||
        d.country.toLowerCase().includes(query.toLowerCase()) ||
        d.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
      )
    : DESTINATIONS;

  // Soumission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    if (isAiMode) {
      sessionStorage.setItem("libertia_prompt", query.trim());
      navigate(isAuthenticated ? "/dashboard" : "/register");
    } else {
      setPanelOpen(true);
    }
  };

  // Clic sur une destination
  const handleDestClick = (dest) => {
    sessionStorage.setItem("libertia_prompt", `Je veux visiter ${dest.name}, ${dest.country}`);
    navigate(isAuthenticated ? "/dashboard" : "/register");
  };

  // Switch de mode
  const handleModeSwitch = (aiMode) => {
    setIsAiMode(aiMode);
    setQuery("");
    setPanelOpen(false);
    setMicError(null);
  };

  // Microphone
  const handleMic = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      setMicError("Microphone non supporté par ce navigateur");
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = "fr-FR";
    recognition.interimResults = false;
    recognition.onstart  = () => setIsListening(true);
    recognition.onend    = () => setIsListening(false);
    recognition.onerror  = () => { setIsListening(false); setMicError("Accès micro refusé"); };
    recognition.onresult = (e) => { setQuery(e.results[0][0].transcript); setMicError(null); };
    recognition.start();
  };

  return (
    <div className={styles.page}>
      <div className={styles.background}>

        {/* ── NAVBAR ── */}
        <nav className={styles.navbar}>
          <Link to="/" className={styles.navLogo}>
            <img src={imgLogoGroup} alt="Libertia" className={styles.navLogoImg} />
            <span className={styles.navLogoText}>Libertia</span>
          </Link>
          <div className={styles.navLinks}>
            {navItems.map((item) => (
              <button key={item} className={styles.navLink}>{item}</button>
            ))}
          </div>
          <div className={styles.navActions}>
            <button className={styles.langBtn}>
              <img src={imgGlobe} alt="" style={{ width: 20, height: 20 }} />
              FR
            </button>
            <Link to="/login">
              <button className={styles.btnOutline}>Se connecter</button>
            </Link>
            <Link to="/register">
              <button className={styles.btnPurple}>S'inscrire</button>
            </Link>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className={styles.hero}>
          <div className={styles.heroBg}>
            <img src={imgSpaceBg} alt="" className={styles.heroBgImg} />
          </div>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Voyagez intelligemment<br />avec Libertia
            </h1>
            <p className={styles.heroSubtitle}>
              Une communauté de voyageurs, un assistant IA qui réserve tout pour vous.
            </p>

            {/* Toggle */}
            <div className={styles.toggleWrap}>
              <button
                type="button"
                className={`${styles.toggleBtn} ${!isAiMode ? styles.toggleBtnActive : ""}`}
                onClick={() => handleModeSwitch(false)}
              >
                🔍 Recherche
              </button>
              <button
                type="button"
                className={`${styles.toggleBtn} ${isAiMode ? styles.toggleBtnActive : ""}`}
                onClick={() => handleModeSwitch(true)}
              >
                🤖 Assistant IA
              </button>
            </div>

            {/* Barre de recherche */}
            <form onSubmit={handleSubmit} className={styles.searchForm}>
              <div className={`${styles.searchBox} ${isListening ? styles.searchBoxListening : ""}`}>

                {/* Icône gauche SVG inline */}
                {isAiMode ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                )}

                <input
                  className={styles.searchInput}
                  placeholder={
                    isListening ? "Je vous écoute..."
                    : isAiMode  ? "Décrivez votre voyage : destination, durée, budget..."
                                : "Rechercher une destination, un pays..."
                  }
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />

                {/* Bouton micro — mode IA uniquement */}
                {isAiMode && (
                  <button
                    type="button"
                    onClick={handleMic}
                    className={`${styles.micBtn} ${isListening ? styles.micBtnActive : ""}`}
                    title={isListening ? "Écoute en cours..." : "Activer le microphone"}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                      stroke={isListening ? "#8b5cf6" : "#a1a1aa"}
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    >
                      <rect x="9" y="2" width="6" height="12" rx="3"/>
                      <path d="M5 10a7 7 0 0 0 14 0"/>
                      <line x1="12" y1="17" x2="12" y2="21"/>
                    </svg>
                  </button>
                )}

                {/* Bouton envoi — flèche SVG */}
                <button type="submit" className={styles.searchSubmitBtn}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="13 6 19 12 13 18"/>
                  </svg>
                </button>
              </div>
            </form>

            {/* Exemples IA */}
            {isAiMode && (
              <div className={styles.aiExamples}>
                {AI_EXAMPLES.map((ex) => (
                  <button key={ex} className={styles.aiExample} onClick={() => setQuery(ex)}>
                    {ex}
                  </button>
                ))}
              </div>
            )}

            <p className={styles.searchHint}>
              {isAiMode
                ? isAuthenticated
                  ? "Appuyez sur Entrée pour générer votre itinéraire IA 🚀"
                  : "Vous serez invité à vous inscrire pour utiliser l'assistant IA"
                : "Tapez une destination pour voir les suggestions"}
            </p>

            {micError && <p className={styles.micError}>{micError}</p>}
          </div>
        </section>

        {/* ── COMMENT ÇA MARCHE ── */}
        <section className={styles.sectionWrap}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>Comment ça marche</h2>
              <p className={styles.sectionSub}>Trois étapes simples vers votre prochaine aventure</p>
            </div>
            <div className={styles.howCards}>
              {howItWorks.map((item) => (
                <div key={item.title} className={styles.glassCard}>
                  <div className={styles.howIconWrap}>
                    <img src={item.icon} alt="" className={styles.howIcon} />
                  </div>
                  <h3 className={styles.howCardTitle}>{item.title}</h3>
                  <p className={styles.howCardText}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── COMMUNAUTÉ ── */}
        <section className={styles.commWrap}>
          <div className={styles.commInner}>
            <div className={styles.commLeft}>
              <h2 className={styles.commTitle}>Des voyageurs comme vous</h2>
              <p className={styles.commText}>
                Rejoignez des milliers d'explorateurs. Partagez vos carnets de bord,
                trouvez l'inspiration et réservez des itinéraires approuvés par la communauté.
              </p>
              <div className={styles.commAvatars}>
                {[imgAvatar, imgAvatar1, imgAvatar2, imgAvatar3].map((src, i) => (
                  <img key={i} src={src} alt="" className={styles.commAvatar} />
                ))}
                <div className={styles.commAvatarMore}>+2k</div>
              </div>
              <Link to="/register">
                <button className={styles.btnPurple} style={{ fontSize: 16, padding: "13px 24px" }}>
                  Rejoindre la communauté
                </button>
              </Link>
            </div>
            <div className={styles.commRight}>
              {communityPosts.map((post) => (
                <div key={post.name} className={styles.commCard}>
                  <img src={post.img} alt="" className={styles.commCardImg} />
                  <div className={styles.commCardBody}>
                    <div className={styles.commCardHeader}>
                      <span className={styles.commCardName}>{post.name}</span>
                      <span className={styles.commCardLoc}>• {post.location}</span>
                    </div>
                    <p className={styles.commCardText}>{post.text}</p>
                    <div className={styles.commCardActions}>
                      <div className={styles.commCardAction}>
                        <img src={imgIconHeart} alt="" className={styles.commCardActionImg} />
                        <span className={styles.commCardActionCount}>{post.likes}</span>
                      </div>
                      <div className={styles.commCardAction}>
                        <img src={imgIconComment} alt="" className={styles.commCardActionImg} />
                        <span className={styles.commCardActionCount}>{post.comments}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DESTINATIONS POPULAIRES ── */}
        <section className={styles.sectionWrap}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>Destinations Populaires</h2>
              <p className={styles.sectionSub}>Les lieux les plus demandés cette semaine par notre IA</p>
            </div>
            <div className={styles.destCards}>
              {DESTINATIONS.slice(0, 4).map((dest) => (
                <div key={dest.name} className={styles.destCard} onClick={() => handleDestClick(dest)}>
                  {dest.img
                    ? <img src={dest.img} alt={dest.name} className={styles.destImg} />
                    : <div className={styles.destImgPlaceholder} />
                  }
                  <div className={styles.destBody}>
                    <div className={styles.destRow}>
                      <span className={styles.destName}>{dest.name}</span>
                      <span className={styles.destPrice}>{dest.price}</span>
                    </div>
                    <div className={styles.destMeta}>
                      <img src={imgIconPin} alt="" className={styles.destMetaIcon} />
                      <span className={styles.destMetaText}>{dest.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── POURQUOI LIBERTIA ── */}
        <section className={styles.sectionWrap}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>Pourquoi Libertia ?</h2>
              <p className={styles.sectionSub}>Tout ce dont vous avez besoin pour un voyage sans friction</p>
            </div>
            <div className={styles.whyGrid}>
              {whyCards.map((card) => (
                <div key={card.title} className={styles.whyCard}>
                  <img src={card.icon} alt="" className={styles.whyIcon} />
                  <div className={styles.whyBody}>
                    <h4 className={styles.whyTitle}>{card.title}</h4>
                    <p className={styles.whyText}>{card.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <div className={styles.footerTop}>
              <div className={styles.footerBrand}>
                <div className={styles.footerBrandLogo}>
                  <img src={imgFooterLogo} alt="" className={styles.footerBrandLogoImg} />
                  <p className={styles.footerBrandName}>Libertia</p>
                </div>
                <p className={styles.footerBrandText}>
                  L'assistant de voyage nouvelle génération propulsé par l'IA
                  et validé par une communauté d'explorateurs passionnés.
                </p>
              </div>
              {[
                { title: "Explorer",    links: ["Destinations", "Communauté", "Vols & Hôtels"] },
                { title: "Légal",       links: ["Conditions d'utilisation", "Confidentialité", "Cookies"] },
                { title: "Suivez-nous", links: ["Instagram", "Twitter", "TikTok"] },
              ].map((col) => (
                <div key={col.title} className={styles.footerCol}>
                  <p className={styles.footerColTitle}>{col.title}</p>
                  <div className={styles.footerColLinks}>
                    {col.links.map((link) => (
                      <button key={link} className={styles.footerColLink}>{link}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.footerBottom}>
              <span className={styles.footerCopy}>© 2025 Libertia. Tous droits réservés.</span>
              <div className={styles.footerLang}>
                <img src={imgGlobe} alt="" className={styles.footerLangIcon} />
                <span className={styles.footerLangText}>Français (FR)</span>
              </div>
            </div>
          </div>
        </footer>

      </div>

      {/* ── PANNEAU LATÉRAL ── */}
      {panelOpen && !isAiMode && (
        <div className={styles.panelOverlay}>
          <div className={styles.panelBackdrop} onClick={() => setPanelOpen(false)} />
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>Résultats pour "{query}"</span>
              <button className={styles.panelClose} onClick={() => setPanelOpen(false)}>✕</button>
            </div>
            <div className={styles.panelContent}>
              <p className={styles.panelCount}>
                {filtered.length} destination{filtered.length > 1 ? "s" : ""} trouvée{filtered.length > 1 ? "s" : ""}
              </p>
              {filtered.map((dest) => (
                <div key={dest.name} className={styles.panelDestCard} onClick={() => handleDestClick(dest)}>
                  {dest.img
                    ? <img src={dest.img} alt={dest.name} className={styles.panelDestImg} />
                    : <div className={styles.panelDestImg} />
                  }
                  <div className={styles.panelDestInfo}>
                    <div className={styles.panelDestName}>{dest.name}</div>
                    <div className={styles.panelDestCountry}>{dest.country}</div>
                    <div className={styles.panelDestTags}>
                      {dest.tags.map((t) => (
                        <span key={t} className={styles.panelDestTag}>{t}</span>
                      ))}
                    </div>
                  </div>
                  <span className={styles.panelDestPrice}>{dest.price}</span>
                </div>
              ))}
              <button
                className={styles.panelAiBtn}
                onClick={() => { setIsAiMode(true); setPanelOpen(false); setQuery(`Je veux visiter ${query}`); }}
              >
                 Générer un itinéraire IA pour "{query}"
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}