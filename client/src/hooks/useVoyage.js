import { useState } from "react";
import voyageService from "../services/Voyage.service";

export function useVoyage() {
  const [voyages, setVoyages]   = useState([]);
  const [voyage, setVoyage]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  // ── Générer un itinéraire IA ──────────────────────────────────
  const generer = async (prompt) => {
    setError(null);
    setLoading(true);
    try {
      const data = await voyageService.generer(prompt);
      setVoyage(data.voyage);
      return data.voyage;
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la génération.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ── Récupérer l'historique ────────────────────────────────────
  const getMesVoyages = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await voyageService.getMesVoyages();
      setVoyages(data.voyages || []);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du chargement.");
    } finally {
      setLoading(false);
    }
  };

  // ── Récupérer un voyage par ID ────────────────────────────────
  const getById = async (id) => {
    setError(null);
    setLoading(true);
    try {
      const data = await voyageService.getById(id);
      setVoyage(data.voyage);
      return data.voyage;
    } catch (err) {
      setError(err.response?.data?.message || "Voyage introuvable.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    voyage,
    voyages,
    loading,
    error,
    generer,
    getMesVoyages,
    getById,
    clearError: () => setError(null),
  };
}