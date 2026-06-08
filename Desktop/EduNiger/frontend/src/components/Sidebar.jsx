import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Items visibles par l'administrateur (accès complet)
const NAV_ITEMS_ADMIN = [
  { path: "/",            icon: "📊", label: "Tableau de bord",   section: "PRINCIPAL" },
  { path: "/eleves",      icon: "👨‍🎓", label: "Élèves",           section: "GESTION" },
  { path: "/classes",     icon: "🏫", label: "Classes",           section: "GESTION" },
  { path: "/presences",   icon: "📋", label: "Présences",         section: "GESTION" },
  { path: "/notes",       icon: "📝", label: "Notes & Bulletins", section: "GESTION" },
  { path: "/enseignants", icon: "👩‍🏫", label: "Enseignants",       section: "GESTION" },
  { path: "/emploi-du-temps", icon: "🗓️", label: "Emploi du temps", section: "GESTION" },
  { path: "/rapports",    icon: "📈", label: "Rapports",          section: "ANALYSES" },
  { path: "/messagerie",  icon: "💬", label: "Messagerie",        section: "ANALYSES", hasBadge: true },
  { path: "/parametres",  icon: "⚙️", label: "Paramètres",        section: "SYSTÈME" },
];

// Items visibles par l'enseignant (lecture seule sur EDT et liste profs)
const NAV_ITEMS_ENSEIGNANT = [
  { path: "/",                          icon: "📊", label: "Tableau de bord",   section: "PRINCIPAL" },
  { path: "/presences",                 icon: "📋", label: "Présences",         section: "GESTION" },
  { path: "/notes",                     icon: "📝", label: "Notes & Bulletins", section: "GESTION" },
  { path: "/teacher/emploi-du-temps",   icon: "🗓️", label: "Emploi du temps",   section: "GESTION" },
  { path: "/teacher/enseignants",       icon: "👩‍🏫", label: "Enseignants",       section: "GESTION" },
  { path: "/messagerie",                icon: "💬", label: "Messagerie",        section: "ANALYSES", hasBadge: true },
];

export default function Sidebar() {
  const { user, logout, isAdmin, isEnseignant } = useAuth();
  const { isDark, toggleTheme }   = useTheme();
  const location  = useLocation();
  const navigate  = useNavigate();

  // Badge messages non lus — déclaré AVANT utilisation
  const [nonLus, setNonLus] = useState(0);

  useEffect(() => {
    const fetchNonLus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res  = await fetch(`${API_URL}/messages/non-lus`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setNonLus(data.non_lus || 0);
      } catch {}
    };
    fetchNonLus();
    const interval = setInterval(fetchNonLus, 30000);
    return () => clearInterval(interval);
  }, []);

  const initials = user
    ? `${user.prenom?.[0] || ""}${user.nom?.[0] || ""}`.toUpperCase()
    : "U";

  // Choisir les items selon le rôle
  const NAV_ITEMS = isEnseignant() ? NAV_ITEMS_ENSEIGNANT : NAV_ITEMS_ADMIN;

  // Grouper par section
  const sections = {};
  NAV_ITEMS.forEach((item) => {
    const sec = item.section || "AUTRE";
    if (!sections[sec]) sections[sec] = [];
    sections[sec].push(item);
  });

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">📚</div>
        <div className="logo-text">
          <span className="logo-name">EduNiger</span>
          <span className="logo-tagline">Gestion Scolaire</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {Object.entries(sections).map(([section, items]) => (
          <div key={section}>
            <div className="nav-section-label">{section}</div>
            {items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {/* Badge messages non lus */}
                {item.hasBadge && nonLus > 0 && (
                  <span className="nav-badge">{nonLus > 99 ? "99+" : nonLus}</span>
                )}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        {/* Toggle thème */}
        <button
          onClick={toggleTheme}
          style={{
            width: "100%", background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px",
            padding: "8px 12px", marginBottom: "8px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: "8px",
            color: "rgba(255,255,255,0.5)", fontSize: "12.5px",
            fontFamily: "inherit", transition: "all 0.15s",
          }}
        >
          <span>{isDark ? "☀️" : "🌙"}</span>
          <span>{isDark ? "Mode clair" : "Mode sombre"}</span>
        </button>

        {/* User card */}
        <div
          className="user-card"
          onClick={() => navigate("/profil")}
          style={{ cursor: "pointer" }}
          title="Mon profil"
        >
          {user?.photo ? (
            <img
              src={user.photo} alt="avatar"
              style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
            />
          ) : (
            <div className="user-avatar">{initials}</div>
          )}
          <div className="user-info">
            <div className="user-name">{user?.prenom} {user?.nom}</div>
            <div className="user-role">{isAdmin() ? "Administrateur" : "Enseignant"}</div>
          </div>
          <button
            className="logout-btn"
            onClick={(e) => { e.stopPropagation(); logout(); }}
            title="Déconnexion"
          >
            ⏻
          </button>
        </div>
      </div>
    </aside>
  );
}

