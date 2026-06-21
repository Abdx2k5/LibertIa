import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./Messages.module.css";
import AppNavbar from "../../components/layout/AppNavbar";
import messagePriveService from "../../services/messagePrive.service";
import { useAuthStore } from "../../store/authStore";
import { connectSocket, getSocket } from "../../services/socket.service";
import { messageThreadPath } from "../../utils/constants";
import imgAvatar from "../../assets/images/community/avatar.png";

const TYPING_DEBOUNCE_MS = 1000;
const TYPING_IDLE_MS = 2000;

const IconSend = (p) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M5 12h12m-5-5 5 5-5 5" />
  </svg>
);
const IconMessageCircle = (p) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

function formatTime(date) {
  const d = date ? new Date(date) : new Date();
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export default function Messages() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const currentUserId = currentUser?._id || currentUser?.id || "";

  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const stopTypingTimeoutRef = useRef(null);

  const loadConversations = useCallback(() => {
    messagePriveService
      .getConversations()
      .then((data) => setConversations(data))
      .catch(() => setConversations([]))
      .finally(() => setLoadingConversations(false));
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // ── Notifications temps réel : rafraîchit la liste quand un message arrive ──
  useEffect(() => {
    const token = localStorage.getItem("libertia_token");
    const socket = connectSocket(token);
    const handleNotif = () => loadConversations();
    socket.on("dm-notification", handleNotif);
    return () => socket.off("dm-notification", handleNotif);
  }, [loadConversations]);

  // ── Charge la conversation active + abonnements temps réel ──
  useEffect(() => {
    if (!userId) return undefined;

    let actif = true;
    const token = localStorage.getItem("libertia_token");
    const socket = connectSocket(token);
    socket.emit("join-dm", userId);

    messagePriveService
      .getThread(userId)
      .then((res) => {
        if (!actif) return;
        setMessages(Array.isArray(res?.data) ? res.data : []);
        setActiveUser(res?.utilisateur || null);
      })
      .catch(() => {
        if (actif) { setMessages([]); setActiveUser(null); }
      });

    const handleNewDm = (message) => {
      setMessages((prev) => [...prev, message]);
      loadConversations();
    };
    const handleTyping = ({ userId: fromId }) => { if (String(fromId) === String(userId)) setTyping(true); };
    const handleStopTyping = ({ userId: fromId }) => { if (String(fromId) === String(userId)) setTyping(false); };

    socket.on("new-dm", handleNewDm);
    socket.on("dm-user-typing", handleTyping);
    socket.on("dm-user-stop-typing", handleStopTyping);

    return () => {
      actif = false;
      socket.emit("leave-dm", userId);
      socket.off("new-dm", handleNewDm);
      socket.off("dm-user-typing", handleTyping);
      socket.off("dm-user-stop-typing", handleStopTyping);
      clearTimeout(typingTimeoutRef.current);
      clearTimeout(stopTypingTimeoutRef.current);
      typingTimeoutRef.current = null;
      stopTypingTimeoutRef.current = null;
      setTyping(false);
    };
  }, [userId, loadConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const stopTyping = () => {
    clearTimeout(typingTimeoutRef.current);
    clearTimeout(stopTypingTimeoutRef.current);
    typingTimeoutRef.current = null;
    stopTypingTimeoutRef.current = null;
    const socket = getSocket();
    if (socket && userId) socket.emit("dm-stop-typing", { destinataire: userId });
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || !userId) return;
    const socket = getSocket();
    socket?.emit("send-dm", { destinataire: userId, contenu: text });
    stopTyping();
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleChange = (e) => {
    setInput(e.target.value);
    const socket = getSocket();
    if (!socket || !userId) return;

    if (!typingTimeoutRef.current) {
      socket.emit("dm-typing", { destinataire: userId });
      typingTimeoutRef.current = setTimeout(() => { typingTimeoutRef.current = null; }, TYPING_DEBOUNCE_MS);
    }
    clearTimeout(stopTypingTimeoutRef.current);
    stopTypingTimeoutRef.current = setTimeout(() => {
      socket.emit("dm-stop-typing", { destinataire: userId });
      stopTypingTimeoutRef.current = null;
    }, TYPING_IDLE_MS);
  };

  return (
    <div className={styles.page}>
      <AppNavbar />
      <div className={styles.layout}>
        <aside className={styles.list}>
          <h1 className={styles.listTitle}>Messages</h1>

          {loadingConversations && <p className={styles.muted}>Chargement...</p>}

          {!loadingConversations && conversations.length === 0 && (
            <p className={styles.muted}>
              Aucune conversation pour le moment. Trouvez des amis depuis la Communauté ou l'Abonnement pour démarrer une discussion.
            </p>
          )}

          {conversations.map((c) => (
            <button
              key={c.utilisateur._id}
              type="button"
              className={`${styles.convItem} ${userId === c.utilisateur._id ? styles.convItemActive : ""}`}
              onClick={() => navigate(messageThreadPath(c.utilisateur._id))}
            >
              <img
                src={c.utilisateur.profilePhoto || imgAvatar}
                alt={c.utilisateur.nom}
                className={styles.convAvatar}
              />
              <div className={styles.convInfo}>
                <div className={styles.convName}>{c.utilisateur.nom}</div>
                <div className={styles.convPreview}>{c.dernierMessage?.contenu}</div>
              </div>
              {c.nonLus > 0 && <span className={styles.convBadge}>{c.nonLus}</span>}
            </button>
          ))}
        </aside>

        <section className={styles.thread}>
          {!userId && (
            <div className={styles.emptyState}>
              <IconMessageCircle />
              <p>Sélectionnez une conversation pour commencer à discuter.</p>
            </div>
          )}

          {userId && (
            <>
              <header className={styles.threadHeader}>
                <img src={activeUser?.profilePhoto || imgAvatar} alt={activeUser?.nom || ""} className={styles.threadAvatar} />
                <div className={styles.threadName}>{activeUser?.nom || "..."}</div>
              </header>

              <div className={styles.messagesList} role="log" aria-live="polite">
                {messages.map((m) => {
                  const fromId = m.expediteur?._id || m.expediteur;
                  const isOwn = String(fromId) === String(currentUserId);
                  return (
                    <div key={m._id} className={`${styles.message} ${isOwn ? styles.messageOwn : styles.messageOther}`}>
                      <div className={`${styles.bubble} ${isOwn ? styles.bubbleOwn : styles.bubbleOther}`}>
                        {m.contenu}
                      </div>
                      <div className={styles.timestamp}>{formatTime(m.createdAt)}</div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {typing && <p className={styles.typingIndicator}>{activeUser?.nom || "Cette personne"} est en train d'écrire...</p>}

              <div className={styles.inputBar}>
                <input
                  type="text"
                  className={styles.input}
                  value={input}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  onBlur={stopTyping}
                  placeholder="Écrire un message..."
                  aria-label="Écrire un message"
                />
                <button type="button" className={styles.sendButton} onClick={handleSend} disabled={!input.trim()} aria-label="Envoyer">
                  <IconSend />
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
