// =============================================================
// FICHIER  : src/store/uiStore.js
// TÂCHE    : T130 — Mode sombre / clair (infrastructure globale)
//
// PÉRIMÈTRE — IMPORTANT :
// Les composants "feature" (cards de résultats, chat, galerie photo,
// modals, AvisSection, etc.) utilisent des valeurs hexadécimales
// codées en dur conformes au design system sombre et NE changeront
// PAS visuellement avec ce toggle. Seule la mise en page de base
// (variables CSS de index.css, Navbar, PublicLayout, DashboardLayout)
// réagit au changement de thème. Le retrofit complet des composants
// "feature" vers les variables de thème est une tâche future.
// =============================================================

import { createContext, useContext, useState, useSyncExternalStore, createElement } from "react";

// ── Sidebar (Context React — inchangé) ────────────────────────────
const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return createElement(
    UIContext.Provider,
    { value: { sidebarOpen, setSidebarOpen, toggleSidebar } },
    children
  );
}

export function useUIStore() {
  const context = useContext(UIContext);
  if (!context) throw new Error("useUIStore doit être utilisé dans <UIProvider>");
  return context;
}

// ── Thème clair/sombre — store global type "Zustand" (sans dépendance) ─
// Implémenté via useSyncExternalStore : utilisable aussi bien dans des
// composants React (useUiStore()) que hors arbre React (main.jsx, qui
// applique [data-theme] sur <html> avant/autour du rendu de <App />,
// donc en dehors de tout Provider de Contexte).
const THEME_KEY = "theme";

function readStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

let themeState = readStoredTheme();
const themeListeners = new Set();

function setTheme(next) {
  if (next === themeState) return;
  themeState = next;
  try {
    localStorage.setItem(THEME_KEY, themeState);
  } catch {
    // localStorage indisponible (navigation privée...) — état en mémoire uniquement
  }
  themeListeners.forEach((listener) => listener());
}

function toggleTheme() {
  setTheme(themeState === "dark" ? "light" : "dark");
}

function subscribeTheme(listener) {
  themeListeners.add(listener);
  return () => themeListeners.delete(listener);
}

function getThemeSnapshot() {
  return themeState;
}

export function useUiStore() {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot);
  return { theme, toggleTheme };
}

export default UIContext;
