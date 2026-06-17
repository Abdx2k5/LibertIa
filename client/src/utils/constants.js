export const ROUTES = {
  HOME:         "/",
  LOGIN:        "/login",
  REGISTER:     "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD:  "/reset-password/:token",
  COMMUNITY:    "/community",
  DASHBOARD:    "/dashboard",
  VOYAGE_DETAIL: "/voyage/:id",
  PROFILE:      "/profile",
  SETTINGS:     "/settings",
  SUBSCRIPTION: "/abonnement",
  AGENCIES:     "/agences",
  AGENCY_DETAIL: "/agence/:id",
  PRICING:      "/tarifs",
  MY_TRIPS:     "/mes-voyages",
  GROUPS:       "/groupes",
  FORUMS:       "/forums",
  MEMORIES:     "/souvenirs",
  COLLAB_BOXES: "/boites",
  ADMIN:        "/admin",
  DESIGN_SYSTEM: "/design-system",
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