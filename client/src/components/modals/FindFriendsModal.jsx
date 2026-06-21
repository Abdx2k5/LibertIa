import { useState, useEffect, useRef } from "react";
import Modal from "../ui/Modal";
import FollowButton from "../ui/FollowButton";
import communityService from "../../services/community.service";
import { useAuthStore } from "../../store/authStore";
import imgAvatar from "../../assets/images/community/avatar.png";

const IconSearch = (p) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

export default function FindFriendsModal({ isOpen, onClose }) {
  const { user } = useAuthStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [followingIds, setFollowingIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef(null);

  // Charge la liste des comptes déjà suivis une fois à l'ouverture,
  // pour afficher le bon état initial (Suivre / Abonné) par résultat
  useEffect(() => {
    if (!isOpen || !user?._id) return;
    communityService
      .getFollowing(user._id)
      .then((list) => setFollowingIds(new Set(list.map((u) => u._id))))
      .catch(() => {});
  }, [isOpen, user?._id]);

  useEffect(() => {
    if (!isOpen) { setQuery(""); setResults([]); setError(""); }
  }, [isOpen]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); return; }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const users = await communityService.rechercheUsers(query.trim());
        setResults(users.filter((u) => u._id !== user?._id));
      } catch {
        setError("Recherche impossible pour le moment.");
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [query, user?._id]);

  const handleToggleFollow = (targetId, nextFollowing) => {
    const action = nextFollowing ? communityService.followUser : communityService.unfollowUser;
    action(targetId).catch(() => {});
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Trouver des amis" size="md">
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ position: "relative" }}>
          <IconSearch style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par nom..."
            style={{
              width: "100%", boxSizing: "border-box", padding: "10px 12px 10px 38px",
              borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-input)",
              color: "var(--text)", fontSize: 14, outline: "none",
            }}
          />
        </div>

        {error && <div style={{ fontSize: 13, color: "var(--error)" }}>{error}</div>}
        {loading && <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Recherche...</div>}

        {!loading && query.trim() && results.length === 0 && !error && (
          <div style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "12px 0" }}>
            Aucun utilisateur trouvé pour "{query.trim()}"
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 320, overflowY: "auto" }}>
          {results.map((u) => (
            <div key={u._id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 4px" }}>
              <img
                src={u.profilePhoto && u.profilePhoto !== "default-avatar.png" ? u.profilePhoto : imgAvatar}
                alt={u.nom}
                style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
              />
              <span style={{ flex: 1, fontSize: 14, color: "var(--text)", fontWeight: 500 }}>{u.nom}</span>
              <FollowButton
                following={followingIds.has(u._id)}
                size="sm"
                onToggle={(next) => handleToggleFollow(u._id, next)}
              />
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
