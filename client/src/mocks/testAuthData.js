// Données factices utilisées quand VITE_TEST_AUTH=true (voir authStore.js)
// Permet d'afficher les pages protégées (Dashboard, Profile, Admin...) sans
// avoir à se connecter manuellement pendant les tests/dev.

export const TEST_TOKEN = "test-token-libertia";

export const TEST_USERS = {
  user: {
    _id: "test-user-id",
    nom: "Dupont",
    prenom: "Jean",
    email: "jean.dupont@test.com",
    role: "user",
    abonnement: "free",
    promptsRestants: 7,
    promptsUtilises: 3,
    age: 28,
    bio: "Passionné de voyages et de découvertes culturelles.",
    profilePhoto: null,
    followers: ["a", "b", "c"],
    preferences: {
      profilePublic: true,
      voyagesPublic: true,
      emailNotifications: true,
      newsNotifications: false,
      language: "fr",
    },
  },
  admin: {
    _id: "test-admin-id",
    nom: "Admin",
    prenom: "Super",
    email: "admin@test.com",
    role: "admin",
    abonnement: "premium",
    promptsRestants: "Illimité",
    promptsUtilises: 42,
    age: 35,
    bio: "Compte administrateur de test.",
    profilePhoto: null,
    followers: [],
    preferences: {
      profilePublic: false,
      voyagesPublic: false,
      emailNotifications: true,
      newsNotifications: true,
      language: "fr",
    },
  },
};

// Rôle utilisé pour le compte de test, configurable via VITE_TEST_AUTH_ROLE
export function getTestUser(role) {
  return TEST_USERS[role] || TEST_USERS.user;
}
