import { createContext, useContext, useState, createElement } from "react";

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme]             = useState("dark");

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const toggleTheme   = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return createElement(
    UIContext.Provider,
    { value: { sidebarOpen, setSidebarOpen, toggleSidebar, theme, toggleTheme } },
    children
  );
}

export function useUIStore() {
  const context = useContext(UIContext);
  if (!context) throw new Error("useUIStore doit être utilisé dans <UIProvider>");
  return context;
}

export default UIContext;