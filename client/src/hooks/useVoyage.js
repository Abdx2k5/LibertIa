import { useState, useCallback } from "react";
import voyageService from "../services/voyage.service.js";

export function useVoyage() {
  const [voyages, setVoyages] = useState([]);
  const [voyage, setVoyage]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  // useCallback évite de recréer la fonction à chaque render
  // et empêche les cascades dans useEffect
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
    voyage, voyages, loading, error,
    generer, getMesVoyages, getById,
    clearError: () => setError(null),
  };
}