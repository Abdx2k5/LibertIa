// compagnonController.js
// Colibri — Groq LLaMA 3.3 70B + RAG ChromaDB + personnalité fine-tunée

const Compagnon = require('../models/Compagnon');
const { execFile } = require('child_process');
const path = require('path');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// ── Personnalité Colibri (encodée depuis le fine-tuning dataset) ──
const SYSTEM_PROMPT = `Tu es Colibri 🐦, le compagnon de voyage intelligent de LibertIa.

PERSONNALITÉ :
- Chaleureux, enthousiaste et passionné de voyage
- Tu parles avec naturel et bienveillance, parfois avec une touche d'humour léger
- Tu utilises des emojis avec modération (1-2 max par réponse)
- Tu t'exprimes toujours en français
- Tu es curieux et tu poses des questions pour mieux aider

TON RÔLE :
- Répondre aux questions pratiques sur les voyages, la culture, les destinations
- Donner des conseils personnalisés basés sur les données de LibertIa
- Aider à choisir une destination selon le budget et les préférences
- NE PAS générer d'itinéraires complets (c'est le moteur IA de LibertIa qui fait ça)
- Pour les itinéraires : dire "utilise le générateur LibertIa juste au-dessus !"

CONTEXTE LIBERTIA :
- LibertIa génère des itinéraires complets en moins de 60 secondes
- Le système utilise du RAG (données réelles) + scraping temps réel
- Destinations couvertes : Maroc (Marrakech, Fès, Casablanca, Agadir, Chefchaouen), France (Paris, Nice, Lyon), Japon (Tokyo, Kyoto, Osaka)
- Système de points : +5 pts par message, +10 pts par photo partagée

IMPORTANT : Si l'utilisateur dit bonjour, présente-toi et demande où il veut aller. Ne génère JAMAIS d'itinéraire toi-même.`;

// ── Niveaux ──
const NIVEAUX = [
  { min:0,    max:99,        label:"Explorateur débutant",  humeur:"curieux" },
  { min:100,  max:299,       label:"Voyageur confirmé",     humeur:"enthousiaste" },
  { min:300,  max:599,       label:"Globe-trotter",         humeur:"passionné" },
  { min:600,  max:999,       label:"Aventurier chevronné",  humeur:"inspiré" },
  { min:1000, max:Infinity,  label:"Maître voyageur",       humeur:"légendaire" },
];
const calculerNiveau = (pts) => NIVEAUX.findIndex(n => pts >= n.min && pts <= n.max) + 1;
const calculerHumeur = (pts) => (NIVEAUX.find(n => pts >= n.min && pts <= n.max) || NIVEAUX[1]).humeur;

// ── RAG : interroger ChromaDB via Python ──
async function getRAGContext(query) {
  return new Promise((resolve) => {
    const scriptPath = path.join(process.cwd(), '..', 'ai', 'rag_query.py');
    execFile('python', [scriptPath, query], { timeout: 8000 }, (err, stdout) => {
      if (err || !stdout) {
        resolve(""); // RAG optionnel — pas bloquant
        return;
      }
      resolve(stdout.trim());
    });
  });
}

// ── Appel Groq ──
async function appelColibri(historique, messageUser, ragContext) {
  // System prompt + contexte RAG si disponible
  const systemContent = ragContext
    ? `${SYSTEM_PROMPT}\n\n${ragContext}`
    : SYSTEM_PROMPT;

  // Construire les messages
  const messages = [{ role: "system", content: systemContent }];

  // Historique (max 10 derniers)
  const recent = historique.slice(-10);
  for (const msg of recent) {
    if (msg.role === "user" || msg.role === "assistant") {
      messages.push({ role: msg.role, content: msg.content });
    }
  }
  messages.push({ role: "user", content: messageUser });

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages,
      max_tokens: 400,
      temperature: 0.75,
      top_p: 0.9,
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || "Je suis là pour t'aider ! 😊";
}

// ════════════════════════════════════════════
// GET /api/compagnon/moi
// ════════════════════════════════════════════
exports.getMonCompagnon = async (req, res) => {
  try {
    let compagnon = await Compagnon.findOne({ user: req.user.id });
    if (!compagnon) compagnon = await Compagnon.create({ user: req.user.id });

    res.json({
      success: true,
      data: {
        points:     compagnon.points,
        niveau:     calculerNiveau(compagnon.points),
        humeur:     calculerHumeur(compagnon.points),
        niveaux:    NIVEAUX,
        nbMessages: compagnon.historique_chat?.length || 0,
        nbPhotos:   compagnon.photos?.length || 0,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ════════════════════════════════════════════
// POST /api/compagnon/chat
// ════════════════════════════════════════════
exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: "Message requis" });
    }

    let compagnon = await Compagnon.findOne({ user: req.user.id });
    if (!compagnon) compagnon = await Compagnon.create({ user: req.user.id });

    // RAG en parallèle (non bloquant)
    const ragContext = await getRAGContext(message).catch(() => "");

    // Appel Colibri via Groq
    const reponse = await appelColibri(
      compagnon.historique_chat || [],
      message,
      ragContext
    );

    // Sauvegarder l'historique
    if (!compagnon.historique_chat) compagnon.historique_chat = [];
    compagnon.historique_chat.push(
      { role: "user",      content: message,  date: new Date() },
      { role: "assistant", content: reponse,  date: new Date() }
    );
    // Limiter à 100 messages
    if (compagnon.historique_chat.length > 100) {
      compagnon.historique_chat = compagnon.historique_chat.slice(-100);
    }
    compagnon.points += 5;
    await compagnon.save();

    res.json({
      success: true,
      data: {
        reponse,
        points:  compagnon.points,
        niveau:  calculerNiveau(compagnon.points),
        humeur:  calculerHumeur(compagnon.points),
      }
    });
  } catch (err) {
    console.error("Erreur chat Colibri:", err.message);
    res.status(500).json({ success: false, message: "Colibri est momentanément indisponible. Réessaie !" });
  }
};

// ════════════════════════════════════════════
// POST /api/compagnon/photo
// ════════════════════════════════════════════
exports.ajouterPhoto = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ success: false, message: "URL requise" });

    let compagnon = await Compagnon.findOne({ user: req.user.id });
    if (!compagnon) compagnon = await Compagnon.create({ user: req.user.id });

    if (!compagnon.photos) compagnon.photos = [];
    compagnon.photos.push(url);
    compagnon.points += 10;
    await compagnon.save();

    res.json({
      success: true,
      data: {
        message:  "Belle photo ! +10 points 📸",
        points:   compagnon.points,
        niveau:   calculerNiveau(compagnon.points),
        humeur:   calculerHumeur(compagnon.points),
        nbPhotos: compagnon.photos.length,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ════════════════════════════════════════════
// GET /api/compagnon/classement
// ════════════════════════════════════════════
exports.getClassement = async (req, res) => {
  try {
    const top10 = await Compagnon.find()
      .sort({ points: -1 })
      .limit(10)
      .populate("user", "nom profilePhoto");

    res.json({
      success: true,
      data: top10.map((c, i) => ({
        rang:   i + 1,
        user:   c.user,
        points: c.points,
        niveau: calculerNiveau(c.points),
        humeur: calculerHumeur(c.points),
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};