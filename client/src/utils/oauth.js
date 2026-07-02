// =============================================================
// FICHIER  : src/utils/oauth.js
//
// Connexion Google / Facebook côté client. Les deux SDK sont
// chargés dynamiquement (pas de dépendance npm) et exposent un
// accessToken qu'on envoie à POST /api/auth/google ou /facebook,
// qui se chargent de vérifier le jeton et renvoient la même forme
// de réponse que /api/auth/login ({ _id, nom, email, token, ... }).
//
// IMPORTANT : initTokenClient()/FB.login() doivent être appelés de
// façon synchrone depuis un vrai clic utilisateur, sinon le popup
// est bloqué par le navigateur. Pour ça, on précharge les scripts
// au montage des pages (Login.jsx/Register.jsx) via preloadOAuthScripts()
// pour qu'ils soient déjà prêts au moment du clic.
// =============================================================

let googleScriptPromise = null;
function loadGoogleScript() {
  if (googleScriptPromise) return googleScriptPromise;
  googleScriptPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) { resolve(); return; }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Impossible de charger Google"));
    document.head.appendChild(script);
  });
  return googleScriptPromise;
}

let fbScriptPromise = null;
function loadFacebookScript(appId) {
  if (fbScriptPromise) return fbScriptPromise;
  fbScriptPromise = new Promise((resolve, reject) => {
    if (window.FB) { resolve(); return; }
    window.fbAsyncInit = () => {
      window.FB.init({ appId, cookie: true, xfbml: false, version: "v21.0" });
      resolve();
    };
    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/fr_FR/sdk.js";
    script.async = true;
    script.onerror = () => reject(new Error("Impossible de charger Facebook"));
    document.head.appendChild(script);
  });
  return fbScriptPromise;
}

export const isGoogleConfigured = () => !!import.meta.env.VITE_GOOGLE_CLIENT_ID;
export const isFacebookConfigured = () => !!import.meta.env.VITE_FACEBOOK_APP_ID;

// Précharge les SDK en arrière-plan — à appeler au montage de la page,
// pas au clic, pour que le clic déclenche le popup de façon synchrone.
export function preloadOAuthScripts() {
  if (isGoogleConfigured()) loadGoogleScript().catch(() => {});
  if (isFacebookConfigured()) loadFacebookScript(import.meta.env.VITE_FACEBOOK_APP_ID).catch(() => {});
}

export async function triggerGoogleLogin() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("Connexion Google non configurée.");
  await loadGoogleScript();

  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: "openid email profile",
      callback: (response) => {
        if (response?.access_token) resolve(response.access_token);
        else reject(new Error("Connexion Google annulée."));
      },
      error_callback: () => reject(new Error("Connexion Google annulée.")),
    });
    client.requestAccessToken();
  });
}

export async function triggerFacebookLogin() {
  const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
  if (!appId) throw new Error("Connexion Facebook non configurée.");
  await loadFacebookScript(appId);

  return new Promise((resolve, reject) => {
    window.FB.login((response) => {
      if (response?.authResponse?.accessToken) resolve(response.authResponse.accessToken);
      else reject(new Error("Connexion Facebook annulée."));
    }, { scope: "email,public_profile" });
  });
}
