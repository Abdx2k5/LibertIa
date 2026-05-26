import api from "./api";

// ─────────────────────────────────────────────
//  Helper — get token from storage
//  (adapte selon où tu stockes le JWT)
// ─────────────────────────────────────────────
function getToken() {
  return localStorage.getItem("libertia_token");
}

const voyageService = {
  // ── Génération classique (non-stream) ──
  generer: async (prompt) => {
    const response = await api.post("/api/voyages/generer", { prompt });
    return response.data;
  },

  // ── Génération avec streaming SSE ──
  // callbacks: { onStatus, onToken, onDone, onError }
  streamGenerer: async (prompt, callbacks = {}, signal) => {
    const { onStatus, onToken, onDone, onError } = callbacks;

    const token = getToken();
    const controller = new AbortController();
    const abortWithSignal = () => {
      if (!controller.signal.aborted) {
        const reason = signal?.reason || new DOMException('aborted', 'AbortError');
        controller.abort(reason);
      }
    };

    if (signal) {
      if (signal.aborted) {
        abortWithSignal();
      } else {
        signal.addEventListener('abort', abortWithSignal, { once: true });
      }
    }

    const timeoutId = setTimeout(() => {
      if (!controller.signal.aborted) {
        controller.abort(new DOMException('timeout', 'AbortError'));
      }
    }, 30000);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/voyages/generer/stream`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ prompt }),
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: 'Erreur serveur' }));
        onError?.(err.message || 'Erreur serveur');
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE peut arriver en morceaux — on traite ligne par ligne
        const lines = buffer.split('\n');
        // La dernière ligne peut être incomplète, on la remet en buffer
        buffer = lines.pop();

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            // on lit l'event name mais on le récupère avec la data juste après
            continue;
          }
          if (line.startsWith('data: ')) {
            const raw = line.slice(6).trim();
            if (!raw) continue;

            try {
              const payload = JSON.parse(raw);

              // On détermine le type d'event en regardant les clés du payload
              if (payload.step)   onStatus?.(payload);   // event: status
              if (payload.token !== undefined) onToken?.(payload.token);  // event: token
              if (payload.voyageId) onDone?.(payload);   // event: done
              if (payload.message && !payload.step && !payload.voyageId) {
                onError?.(payload.message);               // event: error
              }
            } catch {
              // ligne SSE malformée, on ignore
            }
          }
        }
      }
    } finally {
      clearTimeout(timeoutId);
      if (signal) {
        signal.removeEventListener('abort', abortWithSignal);
      }
    }
  },

  // GET /api/voyages/mes-voyages
  getMesVoyages: async () => {
    const response = await api.get("/api/voyages/mes-voyages");
    return response.data;
  },

  // GET /api/voyages/:id
  getById: async (id) => {
    const response = await api.get(`/api/voyages/${id}`);
    return response.data;
  },
};

export default voyageService;
