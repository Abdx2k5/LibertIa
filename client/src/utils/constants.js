export const ROUTES = {
  HOME:         "/",
  LOGIN:        "/login",
  REGISTER:     "/register",
  COMMUNITY:    "/community",
  MESSAGES:     "/messages",
  DASHBOARD:    "/dashboard",
  VOYAGE_DETAIL: "/voyage/:id",
  PROFILE:      "/profile",
  PUBLIC_PROFILE: "/profil/:userId",
  SETTINGS:     "/settings",
  SUBSCRIPTION: "/abonnement",
  AGENCY_DETAIL: "/agence/:id",
  PRICING:      "/tarifs",
  MY_TRIPS:     "/mes-voyages",
  GROUPS:       "/groupes",
  ADMIN:        "/admin",
  DESIGN_SYSTEM: "/design-system",
  NOT_FOUND:    "*",
};

// Génère le lien vers la page détail d'une agence (ex: agencyDetailPath("1"))
export const agencyDetailPath = (id) => `/agence/${id}`;

// Génère le lien vers une conversation privée (ex: messageThreadPath("64f..."))
export const messageThreadPath = (userId) => `/messages/${userId}`;

// Génère le lien vers le profil public d'un utilisateur (ex: publicProfilePath("64f..."))
export const publicProfilePath = (userId) => `/profil/${userId}`;

export const ROLES = {
  USER:  "user",
  ADMIN: "admin",
};

export const FREEMIUM = {
  MAX_FREE_PROMPTS: 10,
};