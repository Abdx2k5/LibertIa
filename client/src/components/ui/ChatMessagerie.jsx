import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./ChatMessagerie.module.css";
import boiteService from "../../services/boite.service";
import { connectSocket, getSocket } from "../../services/socket.service";

// T84 — délais des indicateurs "en train d'écrire"
const TYPING_DEBOUNCE_MS = 1000; // anti-spam entre deux émissions "typing"
const TYPING_IDLE_MS = 2000; // émet "stop-typing" après ce délai d'inactivité

function getDisplayName(user) {
  if (!user) return "Vous";
  return user.prenom || user.nom || user.email || "Vous";
}

function getInitials(name) {
  return String(name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "?"
  ;
}

function formatTime(date) {
  const d = date ? new Date(date) : new Date();
  return d.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Nom de repli tant que les détails de la boîte ne sont pas chargés
function formatBoxName(boxId) {
  const raw = String(boxId || "").trim();
  if (!raw) return "Boîte collaborative";

  const pretty = raw
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  return pretty ? `Boîte ${pretty}` : "Boîte collaborative";
}

// Construit le texte de l'indicateur "X est en train d'écrire..."
function buildTypingLabel(users) {
  if (users.length === 0) return null;
  if (users.length === 1) return `${users[0].nom} est en train d'écrire...`;
  if (users.length === 2) return `${users[0].nom} et ${users[1].nom} sont en train d'écrire...`;
  return "Plusieurs personnes sont en train d'écrire...";
}

export default function ChatMessagerie({ boxId, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [boxInfo, setBoxInfo] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const stopTypingTimeoutRef = useRef(null);

  const currentUserName = getDisplayName(currentUser);
  const currentUserId = currentUser?._id || currentUser?.id || "";

  const boxName = boxInfo?.nom || formatBoxName(boxId);
  const boxInitials = useMemo(() => getInitials(boxName), [boxName]);
  const membersCount = boxInfo?.membres?.length;
  const typingLabel = useMemo(() => buildTypingLabel(typingUsers), [typingUsers]);

  // ── Connexion socket + historique + abonnements temps réel (T84) ──
  useEffect(() => {
    if (!boxId) return;

    let actif = true;
    const token = localStorage.getItem("libertia_token");
    const socket = connectSocket(token);

    socket.emit("join-boite", boxId);

    boiteService
      .getMessages(boxId)
      .then((res) => {
        if (actif) setMessages(Array.isArray(res?.data) ? res.data : []);
      })
      .catch(() => {
        if (actif) setMessages([]);
      });

    boiteService
      .getBoite(boxId)
      .then((res) => {
        if (actif && res?.data) setBoxInfo(res.data);
      })
      .catch(() => {});

    const handleNewMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    const handleUserTyping = ({ userId, nom }) => {
      if (!userId || userId === currentUserId) return;
      setTypingUsers((prev) => (prev.some((u) => u.userId === userId) ? prev : [...prev, { userId, nom }]));
    };

    const handleUserStopTyping = ({ userId }) => {
      setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
    };

    socket.on("new-message", handleNewMessage);
    socket.on("user-typing", handleUserTyping);
    socket.on("user-stop-typing", handleUserStopTyping);

    return () => {
      actif = false;
      socket.emit("leave-boite", boxId);
      socket.off("new-message", handleNewMessage);
      socket.off("user-typing", handleUserTyping);
      socket.off("user-stop-typing", handleUserStopTyping);
      clearTimeout(typingTimeoutRef.current);
      clearTimeout(stopTypingTimeoutRef.current);
      typingTimeoutRef.current = null;
      stopTypingTimeoutRef.current = null;
      setTypingUsers([]);
    };
  }, [boxId, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const stopTyping = () => {
    clearTimeout(typingTimeoutRef.current);
    clearTimeout(stopTypingTimeoutRef.current);
    typingTimeoutRef.current = null;
    stopTypingTimeoutRef.current = null;

    const socket = getSocket();
    if (socket && boxId) socket.emit("stop-typing", { boiteId: boxId });
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || !boxId) return;

    const socket = getSocket();
    socket?.emit("send-message", { boiteId: boxId, contenu: text });

    stopTyping();
    setInput("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  // ── Émet "typing" (débounce 1s) puis "stop-typing" après 2s d'inactivité ──
  const handleChange = (event) => {
    setInput(event.target.value);

    const socket = getSocket();
    if (!socket || !boxId) return;

    if (!typingTimeoutRef.current) {
      socket.emit("typing", { boiteId: boxId });
      typingTimeoutRef.current = setTimeout(() => {
        typingTimeoutRef.current = null;
      }, TYPING_DEBOUNCE_MS);
    }

    clearTimeout(stopTypingTimeoutRef.current);
    stopTypingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop-typing", { boiteId: boxId });
      stopTypingTimeoutRef.current = null;
    }, TYPING_IDLE_MS);
  };

  return (
    <section className={styles.card} aria-label="Messagerie collaborative">
      <div className={styles.header}>
        <div className={styles.headerMain}>
          <div className={styles.boxAvatar} aria-hidden="true">
            {boxInitials}
          </div>
          <div className={styles.headerText}>
            <h3 className={styles.title}>{boxName}</h3>
            <p className={styles.subtitle}>Espace d'échange de voyage</p>
          </div>
        </div>

        <div className={styles.headerMeta}>
          <span className={styles.onlineBadge}>
            <span className={styles.onlineDot} />
            En ligne
          </span>
          {membersCount != null && (
            <span className={styles.membersCount}>
              {membersCount} membre{membersCount === 1 ? "" : "s"}
            </span>
          )}
        </div>
      </div>

      <div className={styles.list} role="log" aria-live="polite">
        {messages.map((message) => {
          const authorId = message.auteur?._id || message.auteur;
          const isOwn = String(authorId) === String(currentUserId);
          const authorName = isOwn ? currentUserName : getDisplayName(message.auteur);
          const initials = getInitials(authorName);

          return (
            <div
              key={message._id}
              className={`${styles.message} ${isOwn ? styles.messageOwn : styles.messageOther}`}
            >
              <div
                className={`${styles.avatar} ${isOwn ? styles.avatarOwn : styles.avatarOther}`}
                aria-hidden="true"
              >
                {initials}
              </div>

              <div className={`${styles.messageContent} ${isOwn ? styles.messageContentOwn : styles.messageContentOther}`}>
                <div className={styles.messageName}>{authorName}</div>
                <div className={`${styles.bubble} ${isOwn ? styles.bubbleOwn : styles.bubbleOther}`}>
                  {message.contenu}
                </div>
                <div className={`${styles.timestamp} ${isOwn ? styles.timestampOwn : styles.timestampOther}`}>
                  {formatTime(message.createdAt)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {typingLabel && <p className={styles.typingIndicator}>{typingLabel}</p>}

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
        <button
          type="button"
          className={styles.sendButton}
          onClick={handleSend}
          disabled={!input.trim()}
          aria-label="Envoyer le message"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 12h12m-5-5 5 5-5 5"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </section>
  );
}
