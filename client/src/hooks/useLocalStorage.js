// =============================================================
// FICHIER  : src/hooks/useLocalStorage.js
//
// Hook d'état persistant dans localStorage. Identique à useState
// mais la valeur est lue au montage puis réécrite à chaque
// changement — pratique pour des pages "utiles hors-ligne"
// (Mes souvenirs T72, Boîtes collaboratives T80).
//
// USAGE :
//   const [items, setItems] = useLocalStorage("ma_cle", []);
// =============================================================

import { useEffect, useState } from "react";

function readValue(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return typeof fallback === "function" ? fallback() : fallback;
    return JSON.parse(raw);
  } catch {
    return typeof fallback === "function" ? fallback() : fallback;
  }
}

export default function useLocalStorage(key, fallback) {
  const [value, setValue] = useState(() => readValue(key, fallback));

  // Synchronise vers localStorage (système externe → autorisé dans un effet).
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // quota dépassé / mode privé : on ignore silencieusement
    }
  }, [key, value]);

  return [value, setValue];
}
