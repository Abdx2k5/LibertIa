import { useNavigate } from "react-router-dom";

export default function Partners() {
  const navigate = useNavigate();

  const partners = [
    {
      name: "Visit Morocco",
      url: "https://www.visitmorocco.com",
      logo: null,
      color: "#C8102E",
      letter: "VM",
      desc: "Office National Marocain du Tourisme — partenaire officiel pour les destinations marocaines.",
      tags: ["Tourisme", "Maroc", "Officiel"],
    },
    {
      name: "monvoyage.ma",
      url: "https://www.monvoyage.ma",
      logo: null,
      color: "#0066CC",
      letter: "MV",
      desc: "Plateforme marocaine de réservation de voyages — vols, hôtels et packages.",
      tags: ["Réservation", "Maroc", "Vols & Hôtels"],
    },
  ];

  const upcoming = [
    { name: "Booking.com",   color: "#003580", letter: "B", desc: "Hébergements" },
    { name: "Air Arabia",    color: "#CC0000", letter: "A", desc: "Compagnie aérienne" },
    { name: "Viator",        color: "#00B09C", letter: "V", desc: "Activités & Expériences" },
    { name: "TripAdvisor",   color: "#00AF87", letter: "T", desc: "Avis voyageurs" },
  ];

  const sty = {
    page: { minHeight:"100vh", background:"var(--bg)", padding:"48px 40px", maxWidth:900, margin:"0 auto" },
    back: { display:"inline-flex", alignItems:"center", gap:6, fontSize:13, color:"var(--text-muted)", background:"none", border:"none", cursor:"pointer", marginBottom:32, padding:0 },
    title: { fontSize:36, fontWeight:800, color:"var(--text)", letterSpacing:"-1px", margin:"0 0 8px" },
    subtitle: { fontSize:16, color:"var(--text-muted)", margin:"0 0 48px", lineHeight:1.6 },
    section: { fontSize:13, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"1px", marginBottom:20 },
    grid: { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(380px, 1fr))", gap:20, marginBottom:60 },
    card: { background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:18, padding:28, display:"flex", flexDirection:"column", gap:16, transition:"border-color 0.2s, transform 0.2s" },
    cardHead: { display:"flex", alignItems:"center", gap:16 },
    logoBox: (color) => ({ width:56, height:56, borderRadius:14, background:color, color:"white", fontSize:18, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }),
    cardName: { fontSize:20, fontWeight:700, color:"var(--text)", marginBottom:4 },
    cardDesc: { fontSize:14, color:"var(--text-muted)", lineHeight:1.65 },
    tags: { display:"flex", gap:8, flexWrap:"wrap" },
    tag: { padding:"4px 12px", borderRadius:999, background:"var(--accent-bg)", border:"1px solid var(--accent-border)", fontSize:12, color:"var(--accent-secondary)", fontWeight:500 },
    btn: { display:"inline-flex", alignItems:"center", gap:6, padding:"10px 18px", borderRadius:10, background:"var(--accent)", color:"white", fontSize:13, fontWeight:600, border:"none", cursor:"pointer", alignSelf:"flex-start", textDecoration:"none" },
    smallGrid: { display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:16, marginBottom:60 },
    smallCard: { background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:14, padding:20, display:"flex", flexDirection:"column", alignItems:"center", gap:10, textAlign:"center", opacity:0.6 },
    smallLogo: (color) => ({ width:44, height:44, borderRadius:12, background:color, color:"white", fontSize:16, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center" }),
    badge: { padding:"3px 10px", borderRadius:999, background:"var(--bg-tertiary)", border:"1px solid var(--border)", fontSize:11, color:"var(--text-muted)", fontWeight:500 },
    cta: { background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:20, padding:40, textAlign:"center" },
    ctaTitle: { fontSize:24, fontWeight:700, color:"var(--text)", margin:"0 0 12px" },
    ctaDesc: { fontSize:15, color:"var(--text-muted)", margin:"0 0 24px", lineHeight:1.6 },
    ctaBtn: { display:"inline-flex", alignItems:"center", gap:8, padding:"12px 28px", borderRadius:12, background:"var(--accent)", color:"white", fontSize:15, fontWeight:600, border:"none", cursor:"pointer" },
  };

  return (
    <div style={sty.page}>
      <button style={sty.back} onClick={() => navigate(-1)}>
        ← Retour
      </button>

      <h1 style={sty.title}>Nos partenaires</h1>
      <p style={sty.subtitle}>
        LibertIa collabore avec des acteurs de confiance du tourisme pour vous offrir
        les meilleures expériences de voyage au Maroc et dans le monde.
      </p>

      {/* Partenaires actifs */}
      <div style={sty.section}>Partenaires officiels</div>
      <div style={sty.grid}>
        {partners.map((p, i) => (
          <div key={i} style={sty.card}>
            <div style={sty.cardHead}>
              <div style={sty.logoBox(p.color)}>{p.letter}</div>
              <div>
                <div style={sty.cardName}>{p.name}</div>
                <div style={{ fontSize:13, color:"var(--accent)", fontWeight:500 }}>Partenaire officiel</div>
              </div>
            </div>
            <p style={sty.cardDesc}>{p.desc}</p>
            <div style={sty.tags}>
              {p.tags.map((t, j) => <span key={j} style={sty.tag}>{t}</span>)}
            </div>
            <a href={p.url} target="_blank" rel="noreferrer" style={sty.btn}>
              Visiter le site →
            </a>
          </div>
        ))}
      </div>

      {/* Partenaires à venir */}
      <div style={sty.section}>Intégrations à venir</div>
      <div style={sty.smallGrid}>
        {upcoming.map((p, i) => (
          <div key={i} style={sty.smallCard}>
            <div style={sty.smallLogo(p.color)}>{p.letter}</div>
            <div style={{ fontSize:14, fontWeight:600, color:"var(--text)" }}>{p.name}</div>
            <div style={{ fontSize:12, color:"var(--text-muted)" }}>{p.desc}</div>
            <span style={sty.badge}>Bientôt</span>
          </div>
        ))}
      </div>

      {/* CTA devenir partenaire */}
      <div style={sty.cta}>
        <div style={sty.ctaTitle}>Vous voulez devenir partenaire ?</div>
        <p style={sty.ctaDesc}>
          Rejoignez l'écosystème LibertIa et touchez des milliers de voyageurs.
          Contactez-nous pour discuter d'un partenariat.
        </p>
        <button style={sty.ctaBtn} onClick={() => window.open("mailto:contact@libertia.ma")}>
          📧 Nous contacter
        </button>
      </div>
    </div>
  );
}