// =============================================================
// FICHIER  : src/store/languageStore.js
//
// Store global FR/EN — même pattern useSyncExternalStore que le
// thème dans uiStore.js (utilisable dans des composants React via
// useLanguageStore(), persisté en localStorage).
// =============================================================
import { useSyncExternalStore } from "react";

const LANGUAGE_KEY = "language";

function readStoredLanguage() {
  try {
    return localStorage.getItem(LANGUAGE_KEY) === "en" ? "en" : "fr";
  } catch {
    return "fr";
  }
}

let languageState = readStoredLanguage();
const languageListeners = new Set();

function setLanguage(next) {
  if (next === languageState) return;
  languageState = next;
  try {
    localStorage.setItem(LANGUAGE_KEY, languageState);
  } catch {
    // localStorage indisponible (navigation privée...) — état en mémoire uniquement
  }
  languageListeners.forEach((listener) => listener());
}

function toggleLanguage() {
  setLanguage(languageState === "fr" ? "en" : "fr");
}

function subscribeLanguage(listener) {
  languageListeners.add(listener);
  return () => languageListeners.delete(listener);
}

function getLanguageSnapshot() {
  return languageState;
}

export function useLanguageStore() {
  const language = useSyncExternalStore(subscribeLanguage, getLanguageSnapshot);
  return { language, toggleLanguage };
}
