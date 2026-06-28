import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useVoyage } from "../../hooks/useVoyage";
import voyageService from "../../services/voyage.service";
import api from "../../services/api";

// ── Icons ──
const sv = { width:18, height:18, viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:"2", strokeLinecap:"round", strokeLinejoin:"round" };
const IconSend   = () => <svg {...sv}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/></svg>;
const IconMic    = () => <svg {...sv}><path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>;
const IconClock  = () => <svg {...sv}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconEye    = () => <svg {...sv}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconPlane  = () => <svg {...sv}><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-1 .1-1.3.5l-.7.8c-.4.5-.2 1.2.3 1.5L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.5 1 .7 1.5.3l.8-.7c.4-.3.6-.8.5-1.3Z"/></svg>;
const IconBot    = () => <svg {...sv}><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>;
const IconStop   = () => <svg {...sv}><rect x="3" y="3" width="18" height="18" rx="2"/></svg>;

// ── Détection voyage vs chat ──
const VOYAGE_KEYWORDS = [
  "voyage","partir","aller","visiter","destination","itinéraire","séjour","budget","jours","semaines","hôtel","vol","vols","hôtels","activités","trip","travel","book","réserver","nuits","nuit","vacances","week-end","weekend","explore","découvrir","tourisme"
];
function isVoyageRequest(text) {
  const lower = text.toLowerCase();
  return VOYAGE_KEYWORDS.some(k => lower.includes(k));
}

// ── Composant Itinéraire ──
function ItineraireAffichage({ data }) {
  if (!data) return null;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ borderBottom:"1px solid var(--border)", paddingBottom:12 }}>
        <div style={{ fontSize:18, fontWeight:700, color:"var(--text)", marginBottom:4 }}>
          ✈️ {data.destination || "Destination"}
        </div>
        <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
          {data.duree_jours && <span style={{ fontSize:12, color:"var(--text-muted)" }}>📅 {data.duree_jours} jour{data.duree_jours>1?"s":""}</span>}
          {data.checkin && <span style={{ fontSize:12, color:"var(--text-muted)" }}>🗓️ {data.checkin} → {data.checkout}</span>}
        </div>
      </div>

      {data.jours?.map((j,i) => (
        <div key={i} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid var(--border)", borderRadius:10, padding:"10px 14px" }}>
          <div style={{ fontSize:13, fontWeight:700, color:"var(--accent)", marginBottom:8 }}>Jour {j.jour}</div>
          {j.matin && <div style={{ fontSize:13, color:"var(--text)", marginBottom:3, lineHeight:1.6 }}>🌅 <strong>Matin :</strong> {j.matin.activite}{j.matin.lieu&&<span style={{color:"var(--text-muted)"}}> — {j.matin.lieu}</span>}{j.matin.duree&&<span style={{color:"#6b7280"}}> ({j.matin.duree})</span>}</div>}
          {j.apres_midi && <div style={{ fontSize:13, color:"var(--text)", marginBottom:3, lineHeight:1.6 }}>☀️ <strong>Après-midi :</strong> {j.apres_midi.activite}{j.apres_midi.lieu&&<span style={{color:"var(--text-muted)"}}> — {j.apres_midi.lieu}</span>}</div>}
          {j.soir && <div style={{ fontSize:13, color:"var(--text)", lineHeight:1.6 }}>🌙 <strong>Soir :</strong> {j.soir.activite}{j.soir.lieu&&<span style={{color:"var(--text-muted)"}}> — {j.soir.lieu}</span>}</div>}
        </div>
      ))}

      {data.hebergement_recommande && (
        <div style={{ background:"rgba(167,139,250,0.08)", borderRadius:10, padding:"10px 14px" }}>
          <div style={{ fontSize:12, fontWeight:600, color:"var(--accent)", marginBottom:4 }}>🏨 Hébergement</div>
          <div style={{ fontSize:13, color:"var(--text)" }}>{data.hebergement_recommande.nom}{data.hebergement_recommande.prix_nuit&&<span style={{color:"var(--text-muted)"}}> — {data.hebergement_recommande.prix_nuit}/nuit</span>}</div>
        </div>
      )}

      {data.vol_recommande && (
        <div style={{ background:"rgba(59,130,246,0.08)", borderRadius:10, padding:"10px 14px" }}>
          <div style={{ fontSize:12, fontWeight:600, color:"#60a5fa", marginBottom:4 }}>✈️ Vol</div>
          <div style={{ fontSize:13, color:"var(--text)" }}>{data.vol_recommande.compagnie}{data.vol_recommande.prix&&<span style={{color:"var(--text-muted)"}}> — {data.vol_recommande.prix}</span>}</div>
        </div>
      )}

      {data.restaurants_recommandes?.length > 0 && (
        <div style={{ background:"rgba(34,197,94,0.07)", borderRadius:10, padding:"10px 14px" }}>
          <div style={{ fontSize:12, fontWeight:600, color:"#4ade80", marginBottom:6 }}>🍽️ Restaurants</div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {data.restaurants_recommandes.map((r,i) => <span key={i} style={{ fontSize:12, color:"var(--text)", background:"rgba(255,255,255,0.05)", borderRadius:6, padding:"2px 8px" }}>{typeof r === "string" ? r : r?.nom || r?.name || JSON.stringify(r)}</span>)}
          </div>
        </div>
      )}

      {data.budget_detail && (
        <div style={{ background:"rgba(251,191,36,0.07)", borderRadius:10, padding:"10px 14px" }}>
          <div style={{ fontSize:12, fontWeight:600, color:"#fbbf24", marginBottom:6 }}>💰 Budget</div>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
            {Object.entries(data.budget_detail).map(([k,v]) => (
              <div key={k} style={{ fontSize:12, color:"var(--text)" }}><span style={{color:"var(--text-muted)", textTransform:"capitalize"}}>{k} : </span><strong>{v}</strong></div>
            ))}
          </div>
        </div>
      )}

      {data.conseils?.length > 0 && (
        <div>
          <div style={{ fontSize:12, fontWeight:600, color:"var(--text)", marginBottom:6 }}>💡 Conseils</div>
          <ul style={{ margin:0, paddingLeft:16, display:"flex", flexDirection:"column", gap:3 }}>
            {data.conseils.map((c,i) => <li key={i} style={{ fontSize:12, color:"var(--text-muted)" }}>{typeof c === "string" ? c : c?.texte || c?.text || JSON.stringify(c)}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Bulle de message ──
function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  const isSystem = msg.role === "system";

  if (isSystem) {
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
        maxWidth: "85%",
        padding: isUser ? "10px 16px" : "14px 18px",
        borderRadius: isUser ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
        background: isUser ? "var(--accent)" : "var(--bg-secondary)",
        border: isUser ? "none" : "1px solid var(--border)",
        color: isUser ? "white" : "var(--text)",
        fontSize: 14,
        lineHeight: 1.65,
      }}>
        {msg.type === "voyage" && msg.itineraire ? (
          <ItineraireAffichage data={msg.itineraire} />
        ) : msg.type === "streaming" ? (
          <div>
            {msg.status && !msg.content && (
              <div style={{ color:"var(--text-muted)", fontSize:12, marginBottom:6, display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ display:"inline-block", width:6, height:6, borderRadius:"50%", background:"var(--accent)", animation:"pulse 1s infinite" }}/>
                {msg.status}
              </div>
            )}
            {msg.content && (
              <div style={{ whiteSpace:"pre-wrap", fontFamily:"var(--mono)", fontSize:12, color:"var(--text-muted)" }}>
                {msg.content}
                {msg.loading && <span style={{ animation:"blink 1s infinite", marginLeft:2 }}>▌</span>}
              </div>
            )}
            {msg.itineraire && <ItineraireAffichage data={msg.itineraire} />}
          </div>
        ) : (
          <div style={{ whiteSpace:"pre-wrap" }}>{msg.content}
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
  const navigate = useNavigate();
  const { user } = useAuthStore();
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

  // ── Ajouter / mettre à jour un message ──
  const addMsg = (msg) => {
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), ...msg }]);
  };
  const updateLastMsg = (updater) => {
    setMessages(prev => {
      const next = [...prev];
      next[next.length - 1] = { ...next[next.length - 1], ...updater };
      return next;
    });
  };

  // ── Envoi ──
  const handleSend = useCallback(async (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput("");
    setLoading(true);

    // Message utilisateur
    addMsg({ role:"user", content: q });

    if (isVoyageRequest(q)) {
      // ── MODE VOYAGE ──
      if (!canGenerate) {
        addMsg({ role:"assistant", type:"chat", content:"Vous avez atteint votre quota de générations. Passez à Premium pour continuer ! 🚀" });
        setLoading(false);
        return;
      }

      // Placeholder streaming
      addMsg({ role:"assistant", type:"streaming", content:"", status:"Analyse de votre demande...", loading:true });

      let buffer = "";
      const controller = new AbortController();
      abortRef.current = controller;

      voyageService.streamGenerer(q, {
        onStatus: (payload) => {
          updateLastMsg({ status: payload?.message || payload?.step || "Génération en cours..." });
        },
        onToken: (token) => {
          buffer += token;
          updateLastMsg({ content: buffer, status:"", loading:true });
          // Essai de parsing partiel
          try {
            const parsed = JSON.parse(buffer);
            updateLastMsg({ content:"", itineraire: parsed, loading:true });
          } catch {}
        },
        onDone: (payload) => {
          const itineraire = payload?.itineraire || (() => { try { return JSON.parse(buffer); } catch { return null; } })();
          updateLastMsg({ type:"voyage", content:"", status:"", itineraire, loading:false, voyageId: payload?.voyageId });
          setLoading(false);
          getMesVoyages();
          abortRef.current = null;
        },
        onError: (msg) => {
          updateLastMsg({ type:"chat", content:`❌ ${msg || "Erreur lors de la génération"}`, loading:false, status:"" });
          setLoading(false);
          abortRef.current = null;
        },
      }, controller.signal).catch(err => {
        if (err?.name === "AbortError") updateLastMsg({ type:"chat", content:"⏹️ Génération annulée.", loading:false, status:"" });
        else updateLastMsg({ type:"chat", content:`❌ ${err?.message || "Erreur réseau"}`, loading:false, status:"" });
        setLoading(false);
        abortRef.current = null;
      });

    } else {
      // ── MODE CHAT (Colibri) ──
      addMsg({ role:"assistant", type:"chat", content:"", loading:true });
      try {
        const res = await api.post("/api/compagnon/chat", { message: q });
        const reponse = res.data?.data?.reponse || res.data?.reponse || "Je suis là pour t'aider ! 😊";
        updateLastMsg({ content: reponse, loading:false });
      } catch (err) {
        updateLastMsg({ content:"Désolé, je ne suis pas disponible pour le moment. Réessaie !", loading:false });
      }
      setLoading(false);
    }
  }, [input, loading, canGenerate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSend(input);
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setLoading(false);
  };

  const isEmpty = messages.length === 0;

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:"var(--bg)" }}>
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* ── ZONE MESSAGES ── */}
      <div style={{ flex:1, overflowY:"auto", padding:"24px 0", display:"flex", flexDirection:"column" }}>
        {isEmpty ? (
          /* État vide — accueil */
          <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 24px", gap:28 }}>
            <div style={{ width:56, height:56, borderRadius:16, background:"var(--accent)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <IconPlane />
            </div>
            <div style={{ textAlign:"center" }}>
              <h1 style={{ fontSize:"clamp(26px,4vw,42px)", fontWeight:800, color:"var(--text)", letterSpacing:"-1px", margin:"0 0 10px" }}>
                Bonjour {user?.nom?.split(" ")[0] || ""} 👋
              </h1>
              <p style={{ fontSize:16, color:"var(--text-muted)", margin:0, lineHeight:1.6 }}>
                Décrivez votre voyage ou discutez avec Colibri, votre compagnon IA.
              </p>
            </div>

            {/* Suggestions */}
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center", maxWidth:560 }}>
              {SUGGESTIONS.map((s,i) => (
                <button key={i} onClick={() => handleSend(s)} style={{ padding:"8px 16px", borderRadius:999, background:"var(--bg-secondary)", border:"1px solid var(--border)", color:"var(--text-muted)", fontSize:13, cursor:"pointer", transition:"all 0.15s" }}
                  onMouseEnter={e=>{e.target.style.borderColor="var(--accent-border)";e.target.style.color="var(--accent)"}}
                  onMouseLeave={e=>{e.target.style.borderColor="var(--border)";e.target.style.color="var(--text-muted)"}}>
                  ✈️ {s}
                </button>
              ))}
            </div>

            {/* Historique récent */}
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
          /* Messages */
          <div style={{ maxWidth:760, width:"100%", margin:"0 auto", padding:"0 24px", display:"flex", flexDirection:"column", animation:"fadeIn 0.3s ease" }}>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
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
              <textarea
                ref={inputRef}
                rows={1}
                style={{ flex:1, background:"none", border:"none", outline:"none", resize:"none", fontSize:15, color:"var(--text)", fontFamily:"var(--sans)", lineHeight:1.5, maxHeight:160, overflowY:"auto" }}
                placeholder="Décrivez votre voyage ou posez une question à Colibri..."
                value={input}
                onChange={e => { setInput(e.target.value); e.target.style.height="auto"; e.target.style.height=Math.min(e.target.scrollHeight,160)+"px"; }}
                onKeyDown={e => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
              />
              <div style={{ display:"flex", gap:6, alignItems:"center", flexShrink:0 }}>
                <button type="button" style={{ width:34, height:34, borderRadius:8, background:"var(--bg-tertiary)", border:"1px solid var(--border)", color:"var(--text-muted)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <IconMic />
                </button>
                {loading ? (
                  <button type="button" onClick={handleStop} style={{ width:34, height:34, borderRadius:8, background:"var(--error)", border:"none", color:"white", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <IconStop />
                  </button>
                ) : (
                  <button type="submit" disabled={!input.trim()} style={{ width:34, height:34, borderRadius:8, background: input.trim() ? "var(--accent)" : "var(--bg-tertiary)", border:"none", color: input.trim() ? "white" : "var(--text-muted)", cursor: input.trim() ? "pointer" : "not-allowed", display:"flex", alignItems:"center", justifyContent:"center", transition:"background 0.2s" }}>
                    <IconSend />
                  </button>
                )}
              </div>
            </div>
          </form>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:8 }}>
            <span style={{ fontSize:11, color:"var(--text-muted)" }}>
              Entrée pour envoyer · Maj+Entrée pour nouvelle ligne · Colibri répond aux questions, LibertIa IA génère vos voyages
            </span>
            <span style={{ fontSize:11, color: isPremium ? "var(--accent-green)" : "var(--text-muted)" }}>
              {isPremium ? "✨ Premium" : `${promptsLeft}/10 prompts`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
