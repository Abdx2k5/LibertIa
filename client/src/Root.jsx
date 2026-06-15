import { useEffect } from "react";
import App from "./App.jsx";
import { useUiStore } from "./store/uiStore";

// T130 — Applique le thème (clair/sombre) sur <html> au montage et à
// chaque changement, via l'attribut [data-theme] consommé par index.css.
export default function Root() {
  const { theme } = useUiStore();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return <App />;
}
