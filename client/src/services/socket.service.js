// =============================================================
// FICHIER  : src/services/socket.service.js
// TÂCHE    : T84 — Chat WebSockets boîtes collaboratives
//
// Gère une instance unique (singleton) de socket.io-client,
// authentifiée via le JWT de l'utilisateur (socket.handshake.auth.token).
// =============================================================

import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

let socket = null;

// ── Crée (ou réutilise) l'instance de socket connectée ──
export function connectSocket(token) {
  if (socket) {
    if (!socket.connected) {
      socket.auth = { token };
      socket.connect();
    }
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
  });

  return socket;
}

// ── Récupère l'instance existante (null si jamais connectée) ──
export function getSocket() {
  return socket;
}

// ── Déconnecte et libère l'instance ──
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
