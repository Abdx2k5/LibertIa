export const ROUTES = {
  HOME:         "/",
  LOGIN:        "/login",
  REGISTER:     "/register",
  COMMUNITY:    "/community",
  DASHBOARD:    "/dashboard",
  PROFILE:      "/profile",
  SETTINGS:     "/settings",
  SUBSCRIPTION: "/abonnement",
  AGENCY_DETAIL: "/agence/:id",
  ADMIN:        "/admin",
  NOT_FOUND:    "*",
};

// Génère le lien vers la page détail d'une agence (ex: agencyDetailPath("1"))
export const agencyDetailPath = (id) => `/agence/${id}`;

export const ROLES = {
  USER:  "user",
  ADMIN: "admin",
};

export const FREEMIUM = {
  MAX_FREE_PROMPTS: 10,
};