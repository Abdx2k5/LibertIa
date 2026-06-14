import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./ChatMessagerie.module.css";

const OWN_AUTHOR_ID = "__current-user__";

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

function formatTime(date = new Date()) {
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

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

function createInitialMessages() {
  return [
    {
      id: 1,
      authorId: OWN_AUTHOR_ID,
      authorName: "Vous",
      text: "J'ai noté le budget vol, on garde un hôtel confortable mais raisonnable ?",
      timestamp: "09:12",
    },
    {
      id: 2,
      authorId: "collaborator-1",
      authorName: "Léa Martin",
      text: "Oui, je vise une option autour de 650€ pour garder de la marge.",
      timestamp: "09:14",
    },
    {
      id: 3,
      authorId: OWN_AUTHOR_ID,
      authorName: "Vous",
      text: "Parfait, je bloque aussi une petite enveloppe pour les activités.",
      timestamp: "09:16",
    },
    {
      id: 4,
      authorId: "collaborator-1",
      authorName: "Léa Martin",
      text: "Super, je mets tout à jour dans la boîte collaborative.",
      timestamp: "09:18",
    },
  ];
}

export default function ChatMessagerie({ boxId, currentUser }) {
  const [messages, setMessages] = useState(createInitialMessages);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const currentUserName = getDisplayName(currentUser);
  const currentUserId = currentUser?._id || currentUser?.id || OWN_AUTHOR_ID;

  const boxName = useMemo(() => formatBoxName(boxId), [boxId]);
  const boxInitials = useMemo(() => getInitials(boxName), [boxName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        authorId: currentUserId,
        authorName: "Vous",
        text,
        timestamp: formatTime(),
      },
    ]);
    setInput("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
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
          <span className={styles.membersCount}>4 membres</span>
        </div>
      </div>

      <div className={styles.list} role="log" aria-live="polite">
        {messages.map((message) => {
          const isOwn = message.authorId === currentUserId || message.authorId === OWN_AUTHOR_ID;
          const authorName = isOwn ? currentUserName : message.authorName;
          const initials = getInitials(authorName);

          return (
            <div
              key={message.id}
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
                  {message.text}
                </div>
                <div className={`${styles.timestamp} ${isOwn ? styles.timestampOwn : styles.timestampOther}`}>
                  {message.timestamp}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputBar}>
        <input
          type="text"
          className={styles.input}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
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
