// =============================================================
// FICHIER  : src/components/ui/NotificationBell.jsx
// TÂCHE    : T71 — Notifications temps réel
//
// Cloche de notifications avec badge non-lues + panneau
// déroulant. Connexion Socket.IO (T84) pour recevoir les
// nouvelles notifications en direct.
// =============================================================

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./NotificationBell.module.css";
import notificationService from "../../services/notification.service";
import { connectSocket } from "../../services/socket.service";

const MAX_BADGE = 9;

// ── Formate une date en "il y a ..." ──
function formatRelativeTime(date) {
  if (!date) return "";
  const then = new Date(date);
  const diffSec = Math.floor((Date.now() - then.getTime()) / 1000);

  if (diffSec < 60) return "à l'instant";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `il y a ${diffHour}h`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `il y a ${diffDay}j`;

  return then.toLocaleDateString("fr-FR");
}

// ── Icônes (SVG inline, pas d'emoji) ──
function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function MessageCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function UserPlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function getTypeIcon(type) {
  switch (type) {
    case "like":
      return <HeartIcon />;
    case "commentaire":
      return <MessageCircleIcon />;
    case "abonnement":
      return <UserPlusIcon />;
    case "invitation_boite":
    case "message":
    default:
      return <MailIcon />;
  }
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const wrapRef = useRef(null);

  // ── Connexion socket + chargement initial (T71) ──
  useEffect(() => {
    let actif = true;
    const token = localStorage.getItem("libertia_token");
    if (!token) return undefined;

    const socket = connectSocket(token);

    notificationService
      .getUnreadCount()
      .then((res) => {
        if (actif) setUnreadCount(res?.count || 0);
      })
      .catch(() => {});

    notificationService
      .getNotifications({ limit: 20 })
      .then((res) => {
        if (actif) setNotifications(Array.isArray(res?.data) ? res.data : []);
      })
      .catch(() => {});

    const handleNouvelleNotification = (notification) => {
      if (!notification) return;
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("nouvelle-notification", handleNouvelleNotification);

    return () => {
      actif = false;
      socket.off("nouvelle-notification", handleNouvelleNotification);
    };
  }, []);

  // ── Fermeture au clic extérieur + Escape ──
  useEffect(() => {
    if (!open) return undefined;

    const onClickOutside = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleMarkRead = async (notification) => {
    if (!notification.lu) {
      setNotifications((prev) =>
        prev.map((n) => (n._id === notification._id ? { ...n, lu: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      try {
        await notificationService.marquerLue(notification._id);
      } catch {
        // silencieux — l'UI reste optimiste
      }
    }

    setOpen(false);
    if (notification.lien) navigate(notification.lien);
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, lu: true })));
    setUnreadCount(0);

    try {
      await notificationService.marquerToutLu();
    } catch {
      // silencieux — l'UI reste optimiste
    }
  };

  const badgeLabel = unreadCount > MAX_BADGE ? `${MAX_BADGE}+` : String(unreadCount);

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Notifications"
      >
        <BellIcon />
        {unreadCount > 0 && <span className={styles.badge}>{badgeLabel}</span>}
      </button>

      {open ? (
        <div className={styles.panel} role="menu" aria-label="Liste des notifications">
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Notifications</span>
            <button
              type="button"
              className={styles.markAllBtn}
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
            >
              Tout marquer comme lu
            </button>
          </div>

          <div className={styles.list}>
            {notifications.length === 0 ? (
              <p className={styles.empty}>Aucune notification pour le moment</p>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification._id}
                  type="button"
                  role="menuitem"
                  className={`${styles.item} ${!notification.lu ? styles.unread : ""}`}
                  onClick={() => handleMarkRead(notification)}
                >
                  <span className={styles.itemIcon}>{getTypeIcon(notification.type)}</span>
                  <span className={styles.itemBody}>
                    <span className={styles.itemText}>{notification.contenu}</span>
                    <span className={styles.itemTime}>{formatRelativeTime(notification.createdAt)}</span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
