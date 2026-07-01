import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useVoyage } from "../../hooks/useVoyage";
import voyageService from "../../services/voyage.service";
import api from "../../services/api";
import imgLogo from '../../assets/logos/logo.png';

// ── Icons ──
const sv = { width:18, height:18, viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:"2", strokeLinecap:"round", strokeLinejoin:"round" };
const IconSend    = () => <svg {...sv}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/></svg>;
const IconMic     = () => <svg {...sv}><path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>;
const IconClock   = () => <svg {...sv}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconEye     = () => <svg {...sv}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconPlane   = () => <svg {...sv}><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-1 .1-1.3.5l-.7.8c-.4.5-.2 1.2.3 1.5L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.5 1 .7 1.5.3l.8-.7c.4-.3.6-.8.5-1.3Z"/></svg>;
const IconBot     = () => <svg {...sv}><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>;
const IconStop    = () => <svg {...sv}><rect x="3" y="3" width="18" height="18" rx="2"/></svg>;
const IconExtLink = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>;

// ── Détection voyage vs chat ──
const VOYAGE_KEYWORDS = [
  "voyage","partir","aller","visiter","destination","itinéraire","séjour",
  "budget","jours","semaines","hôtel","vol","vols","hôtels","activités",
  "trip","travel","réserver","nuits","nuit","vacances","week-end","weekend",
  "explore","découvrir","tourisme","billet","avion","hébergement","excursion",
  "circuit","forfait","je veux aller","je voudrais aller","on veut partir",
  "planifier","organiser mon voyage"
];
const CHAT_KEYWORDS = [
  "bonjour","bonsoir","salut","hello","hi","merci","au revoir","comment tu",
  "qui es-tu","qui es tu","présente","comment ça","explique","c'est quoi",
  "qu'est-ce","aide-moi","libertia","le site","colibri","comment marche",
  "comment fonctionne","tu peux","tu sais","dis-moi","parle-moi"
];
function isVoyageRequest(text) {
  const lower = text.toLowerCase().trim();
  if (lower.split(/\s+/).length < 3) return false;
  if (CHAT_KEYWORDS.some(k => lower.startsWith(k) || lower.includes(k))) return false;
  return VOYAGE_KEYWORDS.some(k => lower.includes(k));
}

// ── Bouton lien externe ──
function BtnLien({ href, label, color = "var(--accent)" }) {
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noreferrer" style={{
      display:"inline-flex", alignItems:"center", gap:5,
      padding:"5px 12px", borderRadius:8,
      background:`${color}20`, border:`1px solid ${color}40`,
      color, fontSize:12, fontWeight:600,
      textDecoration:"none", transition:"opacity 0.15s",
    }}
    onMouseEnter={e=>e.currentTarget.style.opacity="0.75"}
    onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
      {label} <IconExtLink />
    </a>
  );
}

// ── Composant Itinéraire ──
function ItineraireAffichage({ data }) {
  if (!data) return null;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

      {/* En-tête + liens globaux */}
      <div style={{ borderBottom:"1px solid var(--border)", paddingBottom:12 }}>
        <div style={{ fontSize:18, fontWeight:700, color:"var(--text)", marginBottom:6 }}>
          ✈️ {data.destination || "Destination"}
        </div>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:10 }}>
          {data.duree_jours && <span style={{ fontSize:12, color:"var(--text-muted)" }}>📅 {data.duree_jours} jour{data.duree_jours>1?"s":""}</span>}
          {data.checkin && <span style={{ fontSize:12, color:"var(--text-muted)" }}>🗓️ {data.checkin} → {data.checkout}</span>}
        </div>
        {/* Liens globaux */}
        {data.liens && (
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {data.liens.hotels_booking && <BtnLien href={data.liens.hotels_booking} label="🏨 Hôtels Booking" color="#003580"/>}
            {data.liens.vols_kiwi && <BtnLien href={data.liens.vols_kiwi} label="✈️ Kiwi.com" color="#e5432e"/> }
            {data.liens.vols_kayak && <BtnLien href={data.liens.vols_kayak} label="✈️ Kayak" color="#ff690f"/>}
            {data.liens.vols_google_flights && <BtnLien href={data.liens.vols_google_flights} label="🔍 Google Flights" color="#4285f4"/>}
            {data.liens.activites_viator && <BtnLien href={data.liens.activites_viator} label="🎯 Activités Viator" color="#00b09c"/>}
          </div>
        )}
      </div>

      {/* Jours */}
      {data.jours?.map((j,i) => (
        <div key={i} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid var(--border)", borderRadius:10, padding:"10px 14px" }}>
          <div style={{ fontSize:13, fontWeight:700, color:"var(--accent)", marginBottom:8 }}>Jour {j.jour}</div>
          {["matin","apres_midi","soir"].map(moment => {
            const m = j[moment];
            if (!m) return null;
            const label = moment === "matin" ? "🌅 Matin" : moment === "apres_midi" ? "☀️ Après-midi" : "🌙 Soir";
            return (
              <div key={moment} style={{ fontSize:13, color:"var(--text)", marginBottom:4, lineHeight:1.6 }}>
                <strong>{label} :</strong> {m.activite}
                {m.lieu && <span style={{color:"var(--text-muted)"}}> — {m.lieu}</span>}
                {m.duree && <span style={{color:"#6b7280"}}> ({m.duree})</span>}
                {m.lien_maps && (
                  <a href={m.lien_maps} target="_blank" rel="noreferrer" style={{ marginLeft:8, fontSize:11, color:"#60a5fa", textDecoration:"none" }}>
                    📍 Maps
                  </a>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* Hébergement */}
      {data.hebergement_recommande && (
        <div style={{ background:"rgba(167,139,250,0.08)", borderRadius:10, padding:"10px 14px" }}>
          <div style={{ fontSize:12, fontWeight:600, color:"var(--accent)", marginBottom:6 }}>🏨 Hébergement recommandé</div>
          <div style={{ fontSize:13, color:"var(--text)", marginBottom:8 }}>
            <strong>{data.hebergement_recommande.nom}</strong>
            {data.hebergement_recommande.prix_nuit && <span style={{color:"var(--text-muted)"}}> — {data.hebergement_recommande.prix_nuit}/nuit</span>}
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {data.hebergement_recommande.lien_booking && <BtnLien href={data.hebergement_recommande.lien_booking} label="Réserver sur Booking" color="#003580"/>}
            {!data.hebergement_recommande.lien_booking && data.hebergement_recommande.lien && <BtnLien href={data.hebergement_recommande.lien} label="Réserver" color="#003580"/>}
          </div>
        </div>
      )}

      {/* Vol */}
      {data.vol_recommande && (
        <div style={{ background:"rgba(59,130,246,0.08)", borderRadius:10, padding:"10px 14px" }}>
          <div style={{ fontSize:12, fontWeight:600, color:"#60a5fa", marginBottom:6 }}>✈️ Vol recommandé</div>
          <div style={{ fontSize:13, color:"var(--text)", marginBottom:8 }}>
            <strong>{data.vol_recommande.compagnie}</strong>
            {data.vol_recommande.prix && <span style={{color:"var(--text-muted)"}}> — {data.vol_recommande.prix}</span>}
            {data.vol_recommande.duree && <span style={{color:"#6b7280"}}> ({data.vol_recommande.duree})</span>}
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {data.vol_recommande.lien_kiwi && <BtnLien href={data.vol_recommande.lien_kiwi} label="Kiwi.com" color="#e5432e"/> }
                {data.vol_recommande.lien_kayak && <BtnLien href={data.vol_recommande.lien_kayak} label="Kayak" color="#ff690f"/>}
            {data.vol_recommande.lien_google_flights && <BtnLien href={data.vol_recommande.lien_google_flights} label="Google Flights" color="#4285f4"/>}
          </div>
        </div>
      )}

      {/* Restaurants */}
      {data.restaurants_recommandes?.length > 0 && (
        <div style={{ background:"rgba(34,197,94,0.07)", borderRadius:10, padding:"10px 14px" }}>
          <div style={{ fontSize:12, fontWeight:600, color:"#4ade80", marginBottom:8 }}>🍽️ Restaurants recommandés</div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {data.restaurants_recommandes.map((r,i) => {
              const nom = typeof r === "string" ? r : r?.nom || r?.name || "";
              const cuisine = typeof r === "object" ? r?.cuisine : "";
              const prix = typeof r === "object" ? r?.prix : "";
              const lienMaps = typeof r === "object" ? r?.lien_maps : null;
              const lienTrip = typeof r === "object" ? r?.lien_tripadvisor : null;
              return (
                <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:6 }}>
                  <div style={{ fontSize:13, color:"var(--text)" }}>
                    <strong>{nom}</strong>
                    {cuisine && <span style={{color:"var(--text-muted)"}}> — {cuisine}</span>}
                    {prix && <span style={{color:"#6b7280"}}> ({prix})</span>}
                  </div>
                  <div style={{ display:"flex", gap:6 }}>
                    {lienMaps && <BtnLien href={lienMaps} label="Maps" color="#4285f4"/>}
                    {lienTrip && <BtnLien href={lienTrip} label="TripAdvisor" color="#00af87"/>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Budget */}
      {data.budget_detail && (
        <div style={{ background:"rgba(251,191,36,0.07)", borderRadius:10, padding:"10px 14px" }}>
          <div style={{ fontSize:12, fontWeight:600, color:"#fbbf24", marginBottom:6 }}>💰 Budget estimé</div>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
            {Object.entries(data.budget_detail).map(([k,v]) => (
              <div key={k} style={{ fontSize:12, color:"var(--text)" }}>
                <span style={{color:"var(--text-muted)", textTransform:"capitalize"}}>{k} : </span>
                <strong>{v}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conseils */}
      {data.conseils?.length > 0 && (
        <div>
          <div style={{ fontSize:12, fontWeight:600, color:"var(--text)", marginBottom:6 }}>💡 Conseils pratiques</div>
          <ul style={{ margin:0, paddingLeft:16, display:"flex", flexDirection:"column", gap:3 }}>
            {data.conseils.map((c,i) => (
              <li key={i} style={{ fontSize:12, color:"var(--text-muted)" }}>
                {typeof c === "string" ? c : c?.texte || c?.text || JSON.stringify(c)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Bulle de message ──
function MessageBubble({ msg }) {
  const isUser = msg.role === "user";

  if (msg.role === "system") {
    return (
      <div style={{ display:"flex", justifyContent:"center", padding:"6px 0" }}>
        <span style={{ fontSize:11, color:"var(--text-muted)", background:"var(--bg-tertiary)", borderRadius:999, padding:"3px 12px" }}>{msg.content}</span>
      </div>
    );
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems: isUser ? "flex-end" : "flex-start", marginBottom:16 }}>
      {!isUser && (
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
          <div style={{ width:28, height:28, borderRadius:"50%", background:"var(--accent)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <IconBot />
          </div>
          <span style={{ fontSize:12, fontWeight:600, color:"var(--accent)" }}>
            {msg.type === "voyage" ? "LibertIa IA" : "Colibri"}
          </span>
        </div>
      )}
      <div style={{
        maxWidth:"85%",
        padding: isUser ? "10px 16px" : "14px 18px",
        borderRadius: isUser ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
        background: isUser ? "var(--accent)" : "var(--bg-secondary)",
        border: isUser ? "none" : "1px solid var(--border)",
        color: isUser ? "white" : "var(--text)",
        fontSize:14, lineHeight:1.65,
      }}>
        {msg.type === "voyage" && msg.itineraire ? (
          <ItineraireAffichage data={msg.itineraire} />
        ) : msg.type === "streaming" ? (
          <div>
            {msg.status && !msg.content && !msg.itineraire && (
              <div style={{ color:"var(--text-muted)", fontSize:12, marginBottom:6, display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ display:"inline-block", width:6, height:6, borderRadius:"50%", background:"var(--accent)", animation:"pulse 1s infinite" }}/>
                {msg.status}
              </div>
            )}
            {msg.itineraire ? (
              <ItineraireAffichage data={msg.itineraire} />
            ) : msg.content ? (
              <div style={{ whiteSpace:"pre-wrap", fontFamily:"var(--mono)", fontSize:12, color:"var(--text-muted)" }}>
                {msg.content}
                {msg.loading && <span style={{ animation:"blink 1s infinite", marginLeft:2 }}>▌</span>}
              </div>
            ) : null}
          </div>
        ) : (
          <div style={{ whiteSpace:"pre-wrap" }}>
            {msg.content}
            {msg.loading && <span style={{ animation:"blink 1s infinite", marginLeft:2 }}>▌</span>}
          </div>
        )}
      </div>
      {msg.voyageId && (
        <div style={{ marginTop:6, fontSize:11, color:"var(--accent-green)" }}>
          ✅ Voyage enregistré
        </div>
      )}
    </div>
  );
}

const SUGGESTIONS = [
  "5 jours à Marrakech, budget 1200€",
  "Week-end romantique à Paris pour 2",
  "Aventure au Japon 10 jours",
  "Road trip Espagne 2 semaines",
];

// ── Dashboard principal ──
export default function Dashboard() {
  const navigate  = useNavigate();
  const { user }  = useAuthStore();
  const { getMesVoyages, voyages } = useVoyage();

  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const abortRef  = useRef(null);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  const isPremium   = user?.abonnement === "premium";
  const promptsLeft = isPremium ? "∞" : (user?.promptsRestants ?? 10);
  const canGenerate = isPremium || (typeof promptsLeft === "number" && promptsLeft > 0);

  useEffect(() => {
    getMesVoyages();
    const saved = sessionStorage.getItem("libertia_prompt");
    if (saved) { sessionStorage.removeItem("libertia_prompt"); setInput(saved); }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages]);

  const addMsg    = (msg) => setMessages(prev => [...prev, { id: Date.now() + Math.random(), ...msg }]);
  const updateLast = (upd) => setMessages(prev => { const n=[...prev]; n[n.length-1]={...n[n.length-1],...upd}; return n; });

  const handleSend = useCallback(async (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput("");
    setLoading(true);
    addMsg({ role:"user", content:q });

    if (isVoyageRequest(q)) {
      if (!canGenerate) {
        addMsg({ role:"assistant", type:"chat", content:"Vous avez atteint votre quota de générations. Passez à Premium pour continuer ! 🚀" });
        setLoading(false); return;
      }
      addMsg({ role:"assistant", type:"streaming", content:"", status:"Analyse de votre demande...", loading:true });
      let buffer = "";
      const controller = new AbortController();
      abortRef.current = controller;

      voyageService.streamGenerer(q, {
        onStatus: (p)     => updateLast({ status: p?.message || p?.step || "Génération en cours..." }),
        onToken:  (token) => {
          buffer += token;
          updateLast({ content:buffer, status:"", loading:true });
          try { const parsed = JSON.parse(buffer); updateLast({ content:"", itineraire:parsed, loading:true }); } catch {}
        },
        onDone: (payload) => {
          const itin = payload?.itineraire || (() => { try { return JSON.parse(buffer); } catch { return null; } })();
          updateLast({ type:"voyage", content:"", status:"", itineraire:itin, loading:false, voyageId:payload?.voyageId });
          setLoading(false); getMesVoyages(); abortRef.current = null;
        },
        onError: (msg) => {
          updateLast({ type:"chat", content:`❌ ${msg || "Erreur lors de la génération"}`, loading:false, status:"" });
          setLoading(false); abortRef.current = null;
        },
      }, controller.signal).catch(err => {
        if (err?.name === "AbortError") updateLast({ type:"chat", content:"⏹️ Génération annulée.", loading:false, status:"" });
        else updateLast({ type:"chat", content:`❌ ${err?.message || "Erreur réseau"}`, loading:false, status:"" });
        setLoading(false); abortRef.current = null;
      });

    } else {
      addMsg({ role:"assistant", type:"chat", content:"", loading:true });
      try {
        const res = await api.post("/api/compagnon/chat", { message:q });
        const reponse = res.data?.data?.reponse || res.data?.reponse || "Je suis là pour t'aider ! 😊";
        updateLast({ content:reponse, loading:false });
      } catch {
        updateLast({ content:"Désolé, Colibri est momentanément indisponible. Réessaie !", loading:false });
      }
      setLoading(false);
    }
  }, [input, loading, canGenerate]);

  const handleSubmit = (e) => { e.preventDefault(); handleSend(input); };
  const handleStop   = () => { abortRef.current?.abort(); setLoading(false); };
  const isEmpty      = messages.length === 0;

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:"var(--bg)" }}>
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* ── ZONE MESSAGES ── */}
      <div style={{ flex:1, overflowY:"auto", padding:"24px 0" }}>
        {isEmpty ? (
          <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 24px", gap:28, minHeight:"60vh" }}>
            <div style={{ width:56, height:56, borderRadius:16, background:"var(--accent)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <IconPlane />
            </div>
            <div style={{ textAlign:"center" }}>
              <h1 style={{ fontSize:"clamp(24px,4vw,40px)", fontWeight:800, color:"var(--text)", letterSpacing:"-1px", margin:"0 0 10px" }}>
                Bonjour {user?.nom?.split(" ")[0] || ""} 👋
              </h1>
              <p style={{ fontSize:15, color:"var(--text-muted)", margin:0, lineHeight:1.6 }}>
                Décrivez votre voyage ou discutez avec Colibri, votre compagnon IA.
              </p>
            </div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center", maxWidth:560 }}>
              {SUGGESTIONS.map((s,i) => (
                <button key={i} onClick={() => handleSend(s)} style={{ padding:"8px 16px", borderRadius:999, background:"var(--bg-secondary)", border:"1px solid var(--border)", color:"var(--text-muted)", fontSize:13, cursor:"pointer" }}
                  onMouseEnter={e=>{e.target.style.borderColor="var(--accent-border)";e.target.style.color="var(--accent)"}}
                  onMouseLeave={e=>{e.target.style.borderColor="var(--border)";e.target.style.color="var(--text-muted)"}}>
                  ✈️ {s}
                </button>
              ))}
            </div>
            {voyages.length > 0 && (
              <div style={{ width:"100%", maxWidth:580 }}>
                <div style={{ fontSize:12, fontWeight:600, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:10, display:"flex", alignItems:"center", gap:6 }}>
                  <IconClock /> Récemment générés
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {voyages.slice(0,3).map((v,i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:10, gap:10 }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:500, color:"var(--text)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{v.prompt || v.titre}</div>
                        <div style={{ fontSize:11, color:"var(--text-muted)" }}>{v.destination && `📍 ${v.destination} · `}{new Date(v.createdAt).toLocaleDateString("fr-FR")}</div>
                      </div>
                      <button onClick={() => navigate(`/voyage/${v._id}`)} style={{ padding:"5px 12px", borderRadius:7, border:"1px solid var(--border)", background:"none", color:"var(--text-muted)", fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
                        <IconEye /> Voir
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ maxWidth:760, width:"100%", margin:"0 auto", padding:"0 24px", animation:"fadeIn 0.3s ease" }}>
            {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
            <div ref={bottomRef}/>
          </div>
        )}
      </div>

      {/* ── BARRE DE SAISIE ── */}
      <div style={{ borderTop:"1px solid var(--border)", background:"var(--bg)", padding:"16px 24px 20px" }}>
        <div style={{ maxWidth:760, margin:"0 auto" }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display:"flex", alignItems:"flex-end", gap:8, background:"var(--bg-secondary)", border:"1.5px solid var(--border)", borderRadius:16, padding:"10px 10px 10px 16px", transition:"border-color 0.2s" }}
              onFocus={e=>e.currentTarget.style.borderColor="var(--accent-border)"}
              onBlur={e=>e.currentTarget.style.borderColor="var(--border)"}>
              <textarea ref={inputRef} rows={1}
                style={{ flex:1, background:"none", border:"none", outline:"none", resize:"none", fontSize:15, color:"var(--text)", fontFamily:"var(--sans)", lineHeight:1.5, maxHeight:160, overflowY:"auto" }}
                placeholder="Décrivez votre voyage ou posez une question à Colibri..."
                value={input}
                onChange={e => { setInput(e.target.value); e.target.style.height="auto"; e.target.style.height=Math.min(e.target.scrollHeight,160)+"px"; }}
                onKeyDown={e => { if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();handleSubmit(e);} }}
              />
              <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                <button type="button" style={{ width:34, height:34, borderRadius:8, background:"var(--bg-tertiary)", border:"1px solid var(--border)", color:"var(--text-muted)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><IconMic /></button>
                {loading ? (
                  <button type="button" onClick={handleStop} style={{ width:34, height:34, borderRadius:8, background:"var(--error)", border:"none", color:"white", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><IconStop /></button>
                ) : (
                  <button type="submit" disabled={!input.trim()} style={{ width:34, height:34, borderRadius:8, background:input.trim()?"var(--accent)":"var(--bg-tertiary)", border:"none", color:input.trim()?"white":"var(--text-muted)", cursor:input.trim()?"pointer":"not-allowed", display:"flex", alignItems:"center", justifyContent:"center", transition:"background 0.2s" }}><IconSend /></button>
                )}
              </div>
            </div>
          </form>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:8 }}>
            <span style={{ fontSize:11, color:"var(--text-muted)" }}>Entrée pour envoyer · Maj+Entrée pour nouvelle ligne</span>
            <span style={{ fontSize:11, color:isPremium?"var(--accent-green)":"var(--text-muted)" }}>
              {isPremium ? "✨ Premium" : `${promptsLeft}/10 prompts`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}