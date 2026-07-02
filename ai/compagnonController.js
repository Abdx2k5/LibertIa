// compagnonController.js
// Colibri utilise le modèle fine-tuné Abdx2k5/Colibri via HuggingFace Inference API

const Compagnon = require('../models/Compagnon');

const HF_API_URL = "https://api-inference.huggingface.co/models/Abdx2k5/Colibri";
const HF_TOKEN   = process.env.HF_TOKEN;

const SYSTEM_PROMPT = `Tu es Colibri, le compagnon de voyage de LibertIa. Tu es chaleureux, enthousiaste et passionné de voyage. Tu parles avec naturel et bienveillance, parfois avec une touche d'humour léger. Tu connais très bien les destinations du monde entier et tu aides les voyageurs à préparer leurs aventures avec des conseils précis et personnalisés. Tu ne génères jamais d'itinéraires complets (c'est le rôle du moteur IA de LibertIa), mais tu réponds à toutes les questions pratiques, culturelles et de conseils voyage. Tu utilises parfois des emojis avec modération. Tu t'exprimes en français.`;

// Niveaux et humeurs
const NIVEAUX = [
  { min: 0,   max: 99,   label: "Explorateur débutant",  humeur: "curieux" },
  { min: 100, max: 299,  label: "Voyageur confirmé",     humeur: "enthousiaste" },
  { min: 300, max: 599,  label: "Globe-trotter",         humeur: "passionné" },
  { min: 600, max: 999,  label: "Aventurier chevronné",  humeur: "inspiré" },
  { min: 1000, max: Infinity, label: "Maître voyageur",  humeur: "légendaire" },
];

function calculerNiveau(points) {
  return NIVEAUX.findIndex(n => points >= n.min && points <= n.max) + 1;
}

function calculerHumeur(points) {
  const niveau = NIVEAUX.find(n => points >= n.min && points <= n.max);
  return niveau ? niveau.humeur : "enthousiaste";
}

// ── Appel HuggingFace Inference API ──
async function appelColibri(historique, messageUser) {
  // Construire le prompt ChatML
  let prompt = `<|im_start|>system\n${SYSTEM_PROMPT}<|im_end|>\n`;

  // Ajouter les 10 derniers messages de l'historique
  const recent = historique.slice(-10);
  for (const msg of recent) {
    prompt += `<|im_start|>${msg.role}\n${msg.content}<|im_end|>\n`;
  }
  prompt += `<|im_start|>user\n${messageUser}<|im_end|>\n<|im_start|>assistant\n`;

  const response = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${HF_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 300,
        temperature: 0.7,
        top_p: 0.9,
        do_sample: true,
        return_full_text: false,      // retourne seulement la réponse générée
        stop: ["<|im_end|>", "<|im_start|>"],
      },
      options: {
        wait_for_model: true,         // attend que le modèle soit chargé si cold start
      }
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`HuggingFace API error ${response.status}: ${err}`);
  }

  const data = await response.json();

  // Extraire le texte généré
  let texte = "";
  if (Array.isArray(data) && data[0]?.generated_text) {
    texte = data[0].generated_text;
  } else if (data.generated_text) {
    texte = data.generated_text;
  } else {
    throw new Error("Format de réponse HuggingFace inattendu");
  }

  // Nettoyer les tokens spéciaux
  texte = texte
    .replace(/<\|im_end\|>/g, "")
    .replace(/<\|im_start\|>/g, "")
    .replace(/^(assistant|system|user)\n/g, "")
    .trim();

  return texte;
}

// ════════════════════════════════════════════
// GET /api/compagnon/moi
// ════════════════════════════════════════════
exports.getMonCompagnon = async (req, res) => {
  try {
    let compagnon = await Compagnon.findOne({ user: req.user.id });

    if (!compagnon) {
      compagnon = await Compagnon.create({ user: req.user.id });
    }

    res.json({
      success: true,
      data: {
        points:   compagnon.points,
        niveau:   calculerNiveau(compagnon.points),
        humeur:   calculerHumeur(compagnon.points),
        niveaux:  NIVEAUX,
        nbMessages: compagnon.historique_chat.length,
        nbPhotos:   compagnon.photos.length,
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
    if (!compagnon) {
      compagnon = await Compagnon.create({ user: req.user.id });
    }

    // Appel au modèle Colibri sur HuggingFace
    const reponse = await appelColibri(compagnon.historique_chat, message);

    // Mettre à jour l'historique et les points
    compagnon.historique_chat.push(
      { role: "user",      content: message,  date: new Date() },
      { role: "assistant", content: reponse,  date: new Date() }
    );

    // Limiter l'historique à 100 messages pour ne pas surcharger MongoDB
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
    res.status(500).json({ success: false, message: "Colibri est momentanément indisponible. Réessaie dans quelques secondes !" });
  }
};

// ════════════════════════════════════════════
// POST /api/compagnon/photo
// ════════════════════════════════════════════
exports.ajouterPhoto = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: "URL de photo requise" });
    }

    let compagnon = await Compagnon.findOne({ user: req.user.id });
    if (!compagnon) {
      compagnon = await Compagnon.create({ user: req.user.id });
    }

    compagnon.photos.push(url);
    compagnon.points += 10;
    await compagnon.save();

    res.json({
      success: true,
      data: {
        message: "Belle photo ! +10 points pour toi 📸",
        points:  compagnon.points,
        niveau:  calculerNiveau(compagnon.points),
        humeur:  calculerHumeur(compagnon.points),
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
        rang:    i + 1,
        user:    c.user,
        points:  c.points,
        niveau:  calculerNiveau(c.points),
        humeur:  calculerHumeur(c.points),
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
