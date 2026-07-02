import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Landing.module.css";

// ── Icônes SVG inline ──────────────────────────────────────────
const IconPlane = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-1 .1-1.3.5l-.7.8c-.4.5-.2 1.2.3 1.5L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.5 1 .7 1.5.3l.8-.7c.4-.3.6-.8.5-1.3Z"/></svg>;
const IconMap  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>;
const IconUsers = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconStar  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IconMic   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>;
const IconSend  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/></svg>;
const IconShield = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IconZap   = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const IconGlobe = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const IconBot   = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>;
const IconMenu  = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const IconX     = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

// ── Données ─────────────────────────────────────────────────────
const SUGGESTIONS = [
  "5 jours à Tokyo, budget 1500€",
  "Voyage romantique à Paris pour 2",
  "Aventure au Maroc, 7 jours",
  "Road trip en Espagne, 10 jours",
  "Séjour culturel à Istanbul",
];

const FEATURES = [
  { icon: <IconZap />,    title: "Ultra rapide",       desc: "Votre itinéraire complet généré en moins de 60 secondes avec de vrais prix en temps réel." },
  { icon: <IconBot />,    title: "IA conversationnelle", desc: "Décrivez votre voyage en langage naturel, par texte ou par voix. L'IA comprend vos envies." },
  { icon: <IconGlobe />,  title: "Destinations du monde", desc: "Maroc, France, Japon, Espagne... Couverture mondiale avec données locales enrichies." },
  { icon: <IconUsers />,  title: "Communauté active",  desc: "Partagez, commentez et collaborez avec des voyageurs du monde entier." },
  { icon: <IconShield />, title: "Données sécurisées", desc: "Vos informations sont chiffrées (AES-256) et protégées. Conformité RGPD garantie." },
  { icon: <IconMap />,    title: "Cartes interactives", desc: "Visualisez votre itinéraire sur une carte Mapbox avec tous vos points d'intérêt." },
];

const TESTIMONIALS = [
  { name: "Sarah M.", location: "Kyoto, Japon", text: "L'itinéraire IA était parfait. Le temple d'or au lever du soleil, je n'oublierai jamais.", rating: 5 },
  { name: "Marc T.",  location: "Marrakech, Maroc", text: "Super recommandation pour le Riad. La communauté LibertIa m'a sauvé la mise !", rating: 5 },
  { name: "Léa R.",   location: "Barcelone, Espagne", text: "J'ai décrit mon voyage en 2 lignes et j'ai eu un planning complet. Bluffant.", rating: 5 },
];

const STATS = [
  { value: "50k+", label: "Voyageurs" },
  { value: "120+", label: "Destinations" },
  { value: "< 60s", label: "Génération" },
  { value: "4.9★", label: "Note moyenne" },
];

// ── Composant principal ──────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate();
  const [query, setQuery]           = useState("");
  const [suggIdx, setSuggIdx]       = useState(0);
  const [typed, setTyped]           = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const inputRef = useRef(null);
  const isAuth = !!localStorage.getItem("libertia_token");

  // ── Animation suggestion typewriter ──
  useEffect(() => {
    const sugg = SUGGESTIONS[suggIdx];
    let i = 0;
    setTyped("");
    const interval = setInterval(() => {
      i++;
      setTyped(sugg.slice(0, i));
      if (i >= sugg.length) {
        clearInterval(interval);
        setTimeout(() => {
          setSuggIdx(s => (s + 1) % SUGGESTIONS.length);
        }, 2000);
      }
    }, 45);
    return () => clearInterval(interval);
  }, [suggIdx]);

  // ── Navbar scroll ──
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Submit ──
  const handleSubmit = (e) => {
    e.preventDefault();
    const q = query.trim() || typed;
    if (!q) return;
    if (isAuth) {
      sessionStorage.setItem("libertia_prompt", q);
      navigate("/dashboard");
    } else {
      sessionStorage.setItem("libertia_prompt", q);
      navigate("/register");
    }
  };

  const handleSuggClick = (s) => {
    const clean = s.replace(/[\u{1F000}-\u{1FFFF}]/gu, "").trim();
    setQuery(clean);
    inputRef.current?.focus();
  };

  return (
    <div className={styles.page}>

      {/* ── NAVBAR ── */}
      <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ""}`}>
        <div className={styles.navInner}>
          <Link to="/" className={styles.logo}>
            <div className={styles.logoIcon}>L</div>
            <span className={styles.logoText}>LibertIa</span>
          </Link>

          <div className={styles.navLinks}>
            <Link to="/"          className={styles.navLink}>Accueil</Link>
            <Link to="/community" className={styles.navLink}>Communauté</Link>
            <Link to="/tarifs"    className={styles.navLink}>Tarifs</Link>
          </div>

          <div className={styles.navActions}>
            {isAuth ? (
              <button className={styles.btnPrimary} onClick={() => navigate("/dashboard")}>
                Mon espace →
              </button>
            ) : (
              <>
                <Link to="/login"    className={styles.btnGhost}>Connexion</Link>
                <Link to="/register" className={styles.btnPrimary}>Commencer gratuitement</Link>
              </>
            )}
          </div>

          <button className={styles.burger} onClick={() => setMobileOpen(o => !o)}>
            {mobileOpen ? <IconX /> : <IconMenu />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className={styles.mobileMenu}>
            <Link to="/"          className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Accueil</Link>
            <Link to="/community" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Communauté</Link>
            <Link to="/tarifs"    className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Tarifs</Link>
            <div className={styles.mobileDivider}/>
            {isAuth ? (
              <button className={styles.btnPrimary} onClick={() => navigate("/dashboard")}>Mon espace</button>
            ) : (
              <>
                <Link to="/login"    className={styles.btnGhost}   onClick={() => setMobileOpen(false)}>Connexion</Link>
                <Link to="/register" className={styles.btnPrimary} onClick={() => setMobileOpen(false)}>Commencer gratuitement</Link>
              </>
            )}
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        {/* Orbs de fond */}
        <div className={styles.orb1}/>
        <div className={styles.orb2}/>
        <div className={styles.orb3}/>

        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <IconZap /> IA générative • Données temps réel
          </div>

          <h1 className={styles.heroTitle}>
            Planifiez votre voyage<br/>
            <span className={styles.heroAccent}>en 60 secondes</span>
          </h1>

          <p className={styles.heroSub}>
            Décrivez votre voyage en langage naturel. LibertIa génère un itinéraire
            complet avec de vrais prix d'hôtels et de vols, en moins d'une minute.
          </p>

          {/* ── Search box ── */}
          <form onSubmit={handleSubmit} className={styles.searchBox}>
            <div className={styles.searchInner}>
              <input
                ref={inputRef}
                className={styles.searchInput}
                placeholder={typed || "Décrivez votre voyage idéal..."}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => setTyped("")}
              />
              <div className={styles.searchActions}>
                <button type="button" className={styles.micBtn} title="Recherche vocale">
                  <IconMic />
                </button>
                <button type="submit" className={styles.sendBtn}>
                  <IconSend />
                  <span>Générer</span>
                </button>
              </div>
            </div>

            {/* Suggestions */}
            <div className={styles.suggestions}>
              {SUGGESTIONS.slice(0, 4).map((s, i) => (
                <button
                  key={i}
                  type="button"
                  className={styles.suggPill}
                  onClick={() => handleSuggClick(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </form>

          <p className={styles.heroNote}>
            Gratuit • Sans carte bancaire • 10 itinéraires offerts
          </p>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className={styles.stats}>
        <div className={styles.statsInner}>
          {STATS.map((s, i) => (
            <div key={i} className={styles.statCard}>
              <div className={styles.statValue}>{s.value}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DEMO CARD ── */}
      <section className={styles.demo}>
        <div className={styles.demoInner}>
          <div className={styles.demoLeft}>
            <h2 className={styles.sectionTitle}>
              Votre assistant voyage<br/>personnel, disponible 24h/24
            </h2>
            <p className={styles.sectionDesc}>
              Tapez simplement ce que vous voulez faire. LibertIa comprend le langage naturel,
              recherche les meilleures offres en temps réel et génère un planning complet jour par jour.
            </p>
            <div className={styles.demoSteps}>
              {[
                { n:"1", t:"Décrivez votre voyage", d:"En texte libre ou par commande vocale" },
                { n:"2", t:"L'IA génère votre plan", d:"Hôtels, vols, activités avec vrais prix" },
                { n:"3", t:"Personnalisez & partagez", d:"Modifiez, exportez en PDF ou partagez" },
              ].map((step, i) => (
                <div key={i} className={styles.step}>
                  <div className={styles.stepNum}>{step.n}</div>
                  <div>
                    <div className={styles.stepTitle}>{step.t}</div>
                    <div className={styles.stepDesc}>{step.d}</div>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/register" className={styles.btnPrimary} style={{ display:"inline-flex", marginTop:24 }}>
              Essayer gratuitement →
            </Link>
          </div>

          <div className={styles.demoRight}>
            <div className={styles.demoCard}>
              <div className={styles.demoCardHeader}>
                <div className={styles.demoCardDot} style={{ background:"#f87171" }}/>
                <div className={styles.demoCardDot} style={{ background:"#fbbf24" }}/>
                <div className={styles.demoCardDot} style={{ background:"#4ade80" }}/>
                <span style={{ marginLeft:8, fontSize:12, color:"var(--text-muted)" }}>LibertIa IA</span>
              </div>
              <div className={styles.demoCardBody}>
                <div className={styles.demoMsg} style={{ alignSelf:"flex-end", background:"var(--accent)", color:"white" }}>
                  Je veux 5 jours à Marrakech, budget 1200€
                </div>
                <div className={styles.demoMsg}>
                  <div style={{ fontWeight:600, color:"var(--accent)", marginBottom:6 }}>Marrakech — 5 jours</div>
                  <div style={{ fontSize:13, lineHeight:1.7 }}>
                    <strong>Jour 1</strong> — Arrivée, médina, place Jemaa el-Fna<br/>
                    <strong>Jour 2</strong> — Jardins Majorelle, souks<br/>
                    <strong>Jour 3</strong> — Excursion Atlas<br/>
                    <strong>Hôtel :</strong> Riad Yasmine — 85€/nuit<br/>
                    <strong>Vol :</strong> Air Arabia — 210€ A/R<br/>
                    <strong>Total estimé :</strong> 890€
                  </div>
                </div>
                <div className={styles.demoTyping}>
                  <span/>
                  <span/>
                  <span/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className={styles.features}>
        <div className={styles.featuresInner}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Tout ce dont vous avez besoin</h2>
            <p className={styles.sectionDesc}>Une plateforme complète pour planifier, partager et vivre vos voyages.</p>
          </div>
          <div className={styles.featuresGrid}>
            {FEATURES.map((f, i) => (
              <div key={i} className={styles.featureCard}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <div className={styles.featureTitle}>{f.title}</div>
                <div className={styles.featureDesc}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className={styles.testimonials}>
        <div className={styles.testimonialsInner}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Ils ont voyagé avec LibertIa</h2>
            <p className={styles.sectionDesc}>Des milliers de voyageurs font confiance à LibertIa chaque mois.</p>
          </div>
          <div className={styles.testimonialsGrid}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className={styles.testimonialCard}>
                <div className={styles.testimonialStars}>
                  {Array(t.rating).fill(0).map((_, j) => (
                    <span key={j} style={{ color:"#fbbf24" }}><IconStar /></span>
                  ))}
                </div>
                <p className={styles.testimonialText}>"{t.text}"</p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.testimonialAvatar}>{t.name[0]}</div>
                  <div>
                    <div className={styles.testimonialName}>{t.name}</div>
                    <div className={styles.testimonialLocation}>{t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <div className={styles.orb4}/>
          <h2 className={styles.ctaTitle}>Prêt à voyager différemment ?</h2>
          <p className={styles.ctaDesc}>Rejoignez 50 000+ voyageurs qui planifient avec l'IA.</p>
          <div className={styles.ctaBtns}>
            <Link to="/register" className={styles.btnPrimary}>Commencer gratuitement</Link>
            <Link to="/tarifs"   className={styles.btnGhost}>Voir les tarifs</Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <div className={styles.logo}>
              <div className={styles.logoIcon}>L</div>
              <span className={styles.logoText}>LibertIa</span>
            </div>
            <p className={styles.footerTagline}>
              Planification de voyages propulsée par l'IA.
            </p>
          </div>
          <div className={styles.footerCols}>
            {[
              { title:"Explorer",    links:[{l:"Accueil",href:"/"},{l:"Communauté",href:"/community"},{l:"Tarifs",href:"/tarifs"}] },
              { title:"Compte",      links:[{l:"Connexion",href:"/login"},{l:"Inscription",href:"/register"},{l:"Mon espace",href:"/dashboard"}] },
              { title:"Légal",       links:[{l:"Confidentialité",href:"#"},{l:"Conditions",href:"#"},{l:"Cookies",href:"#"}] },
            ].map((col, i) => (
              <div key={i} className={styles.footerCol}>
                <div className={styles.footerColTitle}>{col.title}</div>
                {col.links.map((link, j) => (
                  <Link key={j} to={link.href} className={styles.footerLink}>{link.l}</Link>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>© 2026 LibertIa — ESISA Fès</span>
          <span>Fait avec passion et de l'IA</span>
        </div>
      </footer>

    </div>
  );
}