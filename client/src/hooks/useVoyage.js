import { useState, useCallback, useRef } from "react";
import voyageService from "../services/voyage.service.js";

export function useVoyage() {
  const [voyages, setVoyages]   = useState([]);
  const [voyage, setVoyage]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  // ── Stream state ──
  const [streaming, setStreaming]       = useState(false);
  const [streamTokens, setStreamTokens] = useState('');   // texte brut accumulé
  const [streamStatus, setStreamStatus] = useState(null); // { step, message }
  const abortRef = useRef(false);                         // T35 — AbortController prep

  // ── Génération classique (garde pour compatibilité) ──
  const generer = useCallback(async (prompt) => {
    setError(null);
    setLoading(true);
    try {
      const data = await voyageService.generer(prompt);
      setVoyage(data.voyage || data.itineraire);
      return data.voyage || data.itineraire;
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la génération.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Génération avec streaming ──
  const genererStream = useCallback(async (prompt) => {
    setError(null);
    setStreaming(true);
    setStreamTokens('');
    setStreamStatus(null);
    setVoyage(null);
    abortRef.current = false;

    try {
      await voyageService.streamGenerer(prompt, {

        onStatus: (payload) => {
          if (abortRef.current) return;
          setStreamStatus({ step: payload.step, message: payload.message });
        },

        onToken: (token) => {
          if (abortRef.current) return;
          setStreamTokens(prev => prev + token);
        },

        onDone: (payload) => {
          if (abortRef.current) return;
          setVoyage(payload.itineraire);
          setStreamStatus({ step: 'done', message: '✅ Itinéraire prêt !' });
          return payload; // exposé pour usage direct si besoin
        },

        onError: (message) => {
          setError(message);
          setStreamStatus(null);
        },
      });
    } catch (err) {
      setError(err.message || "Erreur lors du streaming.");
    } finally {
      setStreaming(false);
    }
  }, []);

  // ── Annuler le stream (T35 prep) ──
  const annulerStream = useCallback(() => {
    abortRef.current = true;
    setStreaming(false);
    setStreamTokens('');
    setStreamStatus(null);
  }, []);

  // ── Mes voyages ──
  const getMesVoyages = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await voyageService.getMesVoyages();
      setVoyages(Array.isArray(data) ? data : data.voyages || []);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du chargement.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Voyage par ID ──
  const getById = useCallback(async (id) => {
    setError(null);
    setLoading(true);
    try {
      const data = await voyageService.getById(id);
      setVoyage(data.voyage || data);
      return data.voyage || data;
    } catch (err) {
      setError(err.response?.data?.message || "Voyage introuvable.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // existing
    voyage, voyages, loading, error,
    generer, getMesVoyages, getById,
    clearError: () => setError(null),
    // stream
    streaming, streamTokens, streamStatus,
    genererStream, annulerStream,
  };
}