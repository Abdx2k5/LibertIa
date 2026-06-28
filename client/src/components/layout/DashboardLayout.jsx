import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import imgAvatar from '../../assets/images/community/avatar.png';

const sv = { width:18, height:18, viewBox:"0 0 24 24", fill:"none", stroke:"currentColor", strokeWidth:"2", strokeLinecap:"round", strokeLinejoin:"round" };
const IconHome     = () => <svg {...sv}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconMap      = () => <svg {...sv}><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>;
const IconUsers    = () => <svg {...sv}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconUser     = () => <svg {...sv}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconSettings = () => <svg {...sv}><circle cx="12" cy="12" r="3"/><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/></svg>;
const IconStar     = () => <svg {...sv} fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IconLogOut   = () => <svg {...sv}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IconMenu     = () => <svg {...sv}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const IconX        = () => <svg {...sv}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

const NAV = [
  { label:"Accueil",     to:"/dashboard",   icon:IconHome },
  { label:"Mes voyages", to:"/mes-voyages", icon:IconMap },
  { label:"Communauté",  to:"/community",   icon:IconUsers },
  { label:"Profil",      to:"/profile",     icon:IconUser },
  { label:"Paramètres",  to:"/settings",    icon:IconSettings },
  { label:"Premium",     to:"/abonnement",  icon:IconStar },
];

const SIDEBAR_W = 220;

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/"); };

  const navItem = (active) => ({
    display:"flex", alignItems:"center", gap:10,
    padding:"9px 12px", borderRadius:10,
    border:"none",
    background: active ? "var(--accent-bg)" : "none",
    color: active ? "var(--accent)" : "var(--text-muted)",
    fontSize:14, fontWeight: active ? 600 : 500,
    cursor:"pointer", textAlign:"left", width:"100%",
    transition:"background 0.15s, color 0.15s",
  });

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"var(--bg)" }}>

      <style>{`
        @media (max-width: 768px) {
          .lib-sidebar {
            transform: translateX(-100%);
            pointer-events: none;
          }
          .lib-sidebar.open {
            transform: translateX(0);
            pointer-events: auto;
          }
          .lib-main {
            margin-left: 0 !important;
            padding-top: 52px;
          }
          .lib-topbar {
            display: flex !important;
          }
          .lib-overlay {
            display: block !important;
          }
          .lib-close {
            display: flex !important;
          }
        }
        @media (min-width: 769px) {
          .lib-sidebar {
            transform: translateX(0) !important;
            pointer-events: auto !important;
          }
          .lib-topbar { display: none !important; }
          .lib-overlay { display: none !important; }
          .lib-close { display: none !important; }
        }
      `}</style>

      {/* ── SIDEBAR ── */}
      <aside className={`lib-sidebar${open ? " open" : ""}`} style={{
        width: SIDEBAR_W,
        display:"flex", flexDirection:"column",
        background:"var(--bg-secondary)",
        borderRight:"1px solid var(--border)",
        position:"fixed", top:0, left:0, bottom:0,
        zIndex:300, overflowY:"auto",
        transition:"transform 0.25s",
      }}>

        {/* Logo + bouton fermer */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 14px", borderBottom:"1px solid var(--border)" }}>
          <a href="/dashboard" style={{ display:"flex", alignItems:"center", gap:9, textDecoration:"none" }}>
            <div style={{ width:30, height:30, borderRadius:8, background:"var(--accent)", color:"white", fontSize:14, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center" }}>L</div>
            <span style={{ fontSize:16, fontWeight:700, color:"var(--text)" }}>LibertIa</span>
          </a>
          <button className="lib-close" onClick={() => setOpen(false)} style={{ display:"none", background:"none", border:"none", color:"var(--text-muted)", cursor:"pointer", padding:4 }}>
            <IconX />
          </button>
        </div>

        {/* Nav items */}
        <nav style={{ display:"flex", flexDirection:"column", gap:2, padding:"10px 8px", flex:1 }}>
          {NAV.map(item => (
            <button key={item.to} style={navItem(location.pathname === item.to)}
              onClick={() => { navigate(item.to); setOpen(false); }}>
              <item.icon />
              {item.label}
            </button>
          ))}
          <div style={{ height:1, background:"var(--border)", margin:"8px 0" }}/>
          <button style={navItem(false)} onClick={handleLogout}>
            <IconLogOut />
            Déconnexion
          </button>
        </nav>

        {/* Profil en bas */}
        <div style={{ padding:"10px 8px 14px", borderTop:"1px solid var(--border)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", borderRadius:10, cursor:"pointer" }}
            onClick={() => { navigate("/profile"); setOpen(false); }}>
            <img
              src={user?.profilePhoto && user.profilePhoto !== "default-avatar.png" ? user.profilePhoto : imgAvatar}
              alt="avatar"
              style={{ width:32, height:32, borderRadius:"50%", objectFit:"cover", border:"2px solid var(--border)", flexShrink:0 }}
            />
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:600, color:"var(--text)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {user?.nom || "Utilisateur"}
              </div>
              <div style={{ fontSize:11, color:"var(--text-muted)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {user?.email || ""}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── OVERLAY MOBILE ── */}
      <div className="lib-overlay" onClick={() => setOpen(false)} style={{
        display:"none",
        position:"fixed", inset:0,
        background:"rgba(0,0,0,0.5)",
        zIndex:290,
        pointerEvents: open ? "auto" : "none",
        opacity: open ? 1 : 0,
        transition:"opacity 0.25s",
      }}/>

      {/* ── TOPBAR MOBILE ── */}
      <div className="lib-topbar" style={{
        display:"none",
        position:"fixed", top:0, left:0, right:0, height:52,
        background:"var(--bg-secondary)",
        borderBottom:"1px solid var(--border)",
        zIndex:280,
        alignItems:"center",
        padding:"0 16px",
        gap:12,
      }}>
        <button onClick={() => setOpen(true)} style={{ background:"none", border:"none", color:"var(--text)", cursor:"pointer", padding:4, display:"flex" }}>
          <IconMenu />
        </button>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:26, height:26, borderRadius:7, background:"var(--accent)", color:"white", fontSize:13, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center" }}>L</div>
          <span style={{ fontSize:15, fontWeight:700, color:"var(--text)" }}>LibertIa</span>
        </div>
      </div>

      {/* ── CONTENU PRINCIPAL ── */}
      <main className="lib-main" style={{
        marginLeft: SIDEBAR_W,
        flex:1,
        minHeight:"100vh",
        display:"flex",
        flexDirection:"column",
        minWidth:0,
      }}>
        <Outlet />
      </main>

    </div>
  );
}