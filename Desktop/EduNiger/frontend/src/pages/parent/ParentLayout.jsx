import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// ── Helpers exportés ──────────────────────────────────────────
export function useParentAuth() {
  const token   = localStorage.getItem('parent_token');
  const user    = JSON.parse(localStorage.getItem('parent_user')    || 'null');
  const enfants = JSON.parse(localStorage.getItem('parent_enfants') || '[]');
  return { token, user, enfants };
}

export function parentApi(path, options = {}) {
  const token = localStorage.getItem('parent_token');
  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  }).then(r => r.json());
}

// ── Navigation ────────────────────────────────────────────────
const NAV = [
  { path: '/parent/dashboard', icon: '🏠', label: 'Accueil',     section: 'PRINCIPAL' },
  { path: '/parent/notes',     icon: '📝', label: 'Notes',       section: 'SUIVI' },
  { path: '/parent/absences',  icon: '📋', label: 'Absences',    section: 'SUIVI' },
  { path: '/parent/bulletins', icon: '📄', label: 'Bulletins',   section: 'SUIVI' },
  { path: '/parent/emploi-du-temps', icon: '🗓️', label: 'Emploi du temps', section: 'SUIVI' },
  { path: '/parent/messages',  icon: '💬', label: 'Messages',    section: 'COMMUNICATION' },
  { path: '/parent/profil',    icon: '👤', label: 'Mon profil',  section: 'COMPTE' },
];

const PAGE_TITLES = {
  '/parent/dashboard': { title: 'Tableau de bord',  subtitle: 'Suivi scolaire de votre enfant' },
  '/parent/notes':     { title: 'Notes',             subtitle: 'Résultats et évaluations' },
  '/parent/absences':  { title: 'Absences',          subtitle: 'Présences et absences' },
  '/parent/bulletins': { title: 'Bulletins',         subtitle: 'Bulletins scolaires' },
  '/parent/emploi-du-temps': { title: 'Emploi du temps',    subtitle: 'Planning hebdomadaire des cours' },
  '/parent/messages':  { title: 'Messagerie',        subtitle: 'Communication avec l\'école' },
  '/parent/profil':    { title: 'Mon Profil',        subtitle: 'Informations et préférences' },
};

export default function ParentLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const { user, enfants } = useParentAuth();

  const [selectedEnfant, setSelectedEnfant] = useState(
    () => JSON.parse(localStorage.getItem('parent_enfant_actif') || 'null') || enfants[0] || null
  );
  const [enfantMenuOpen, setEnfantMenuOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('parent_token')) navigate('/parent/login');
  }, []);

  const changeEnfant = (enfant) => {
    setSelectedEnfant(enfant);
    localStorage.setItem('parent_enfant_actif', JSON.stringify(enfant));
    setEnfantMenuOpen(false);
  };

  const logout = () => {
    ['parent_token','parent_user','parent_enfants','parent_enfant_actif'].forEach(k => localStorage.removeItem(k));
    navigate('/parent/login');
  };

  const initials = user ? `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase() : '?';
  const pageInfo = PAGE_TITLES[location.pathname] || PAGE_TITLES['/parent/dashboard'];

  // Grouper la nav par section
  const sections = {};
  NAV.forEach(item => {
    if (!sections[item.section]) sections[item.section] = [];
    sections[item.section].push(item);
  });

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="app-layout">

      {/* ── SIDEBAR (même design admin) ── */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon">📚</div>
          <div className="logo-text">
            <span className="logo-name">EduNiger</span>
            <span className="logo-tagline">Espace Parent</span>
          </div>
        </div>

        {/* Navigation groupée */}
        <nav className="sidebar-nav">
          {Object.entries(sections).map(([section, items]) => (
            <div key={section}>
              <div className="nav-section-label">{section}</div>
              {items.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer sidebar */}
        <div className="sidebar-footer">
          {/* Toggle thème */}
          <button
            onClick={toggleTheme}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
              padding: '8px 12px', marginBottom: '8px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              color: 'rgba(255,255,255,0.5)', fontSize: '12.5px',
              fontFamily: 'inherit', transition: 'all 0.15s',
            }}
          >
            <span>{isDark ? '☀️' : '🌙'}</span>
            <span>{isDark ? 'Mode clair' : 'Mode sombre'}</span>
          </button>

          {/* User card */}
          <div
            className="user-card"
            onClick={() => navigate('/parent/profil')}
            style={{ cursor: 'pointer' }}
            title="Mon profil"
          >
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{user?.prenom} {user?.nom}</div>
              <div className="user-role">Parent</div>
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

      {/* ── MAIN CONTENT ── */}
      <div className="main-content">

        {/* ── TOPBAR (même design admin) ── */}
        <header className="topbar">
          <div>
            <div className="topbar-title">{pageInfo.title}</div>
            <div className="topbar-subtitle">{pageInfo.subtitle}</div>
          </div>

          <div className="topbar-right">
            {/* Date */}
            <span className="topbar-school-name" style={{ fontSize: '12px' }}>
              📅 {today}
            </span>

            {/* Sélecteur enfant */}
            {enfants.length > 0 && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setEnfantMenuOpen(v => !v)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'var(--bg)', border: '1px solid var(--border)',
                    borderRadius: 10, padding: '5px 12px 5px 8px',
                    cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
                    color: 'var(--text-primary)', transition: 'all 0.15s',
                  }}
                >
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
                  }}>
                    {selectedEnfant ? `${selectedEnfant.prenom[0]}${selectedEnfant.nom[0]}` : '?'}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                      {selectedEnfant ? `${selectedEnfant.prenom} ${selectedEnfant.nom}` : 'Choisir'}
                    </div>
                    {selectedEnfant?.classe_nom && (
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.2 }}>
                        {selectedEnfant.classe_nom}
                      </div>
                    )}
                  </div>
                  {enfants.length > 1 && (
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 2 }}>▼</span>
                  )}
                </button>

                {enfantMenuOpen && enfants.length > 1 && (
                  <div style={{
                    position: 'absolute', top: 44, right: 0,
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 10, minWidth: 210,
                    boxShadow: 'var(--shadow-md)', zIndex: 100,
                  }}>
                    {enfants.map(en => (
                      <div
                        key={en.id}
                        onClick={() => changeEnfant(en)}
                        style={{
                          padding: '10px 14px', cursor: 'pointer',
                          background: selectedEnfant?.id === en.id ? 'rgba(10,92,54,0.06)' : 'transparent',
                          borderBottom: '1px solid var(--border)',
                          transition: 'background 0.12s',
                        }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                          {en.prenom} {en.nom}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{en.classe_nom}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Toggle thème */}
            <button
              onClick={toggleTheme}
              title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                width: '36px', height: '36px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: '16px',
                transition: 'all 0.2s',
              }}
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            {/* Avatar */}
            <button
              onClick={() => navigate('/parent/profil')}
              title="Mon profil"
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: '10px', padding: '5px 10px 5px 6px',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'var(--primary)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 700, flexShrink: 0,
              }}>
                {initials}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                  {user?.prenom} {user?.nom}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.2 }}>
                  Parent
                </div>
              </div>
            </button>
          </div>
        </header>

        {/* ── CONTENU ── */}
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
}
