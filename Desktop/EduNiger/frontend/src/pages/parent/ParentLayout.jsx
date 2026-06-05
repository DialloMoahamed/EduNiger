import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

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
  { path: '/parent/dashboard', icon: '🏠', label: 'Accueil'    },
  { path: '/parent/notes',     icon: '📝', label: 'Notes'      },
  { path: '/parent/absences',  icon: '📋', label: 'Absences'   },
  { path: '/parent/bulletins', icon: '📄', label: 'Bulletins'  },
  { path: '/parent/messages',  icon: '💬', label: 'Messages'   },
  { path: '/parent/profil',    icon: '👤', label: 'Mon profil' },
];

export default function ParentLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, enfants } = useParentAuth();

  const [selectedEnfant, setSelectedEnfant] = useState(
    () => JSON.parse(localStorage.getItem('parent_enfant_actif') || 'null') || enfants[0] || null
  );
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('parent_token')) navigate('/parent/login');
  }, []);

  const changeEnfant = (enfant) => {
    setSelectedEnfant(enfant);
    localStorage.setItem('parent_enfant_actif', JSON.stringify(enfant));
    setMenuOpen(false);
  };

  const logout = () => {
    ['parent_token','parent_user','parent_enfants','parent_enfant_actif'].forEach(k => localStorage.removeItem(k));
    navigate('/parent/login');
  };

  const initials = user ? `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase() : '?';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      {/* ── TOPBAR ── */}
      <header style={{
        background: '#0A5C36', height: 56,
        display: 'flex', alignItems: 'center',
        padding: '0 20px', gap: 12, flexShrink: 0,
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)', zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 'auto' }}>
          <span style={{ fontSize: 22 }}>📚</span>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 16, fontFamily: 'Space Mono, monospace' }}>EduNiger</span>
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>· Espace parent</span>
        </div>

        {/* Sélecteur enfant */}
        {enfants.length > 0 && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuOpen(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.15)', border: 'none',
                borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: '#fff',
                fontFamily: 'inherit', fontSize: 13,
              }}
            >
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: 'rgba(255,255,255,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700,
              }}>
                {selectedEnfant ? `${selectedEnfant.prenom[0]}${selectedEnfant.nom[0]}` : '?'}
              </div>
              <span>{selectedEnfant ? `${selectedEnfant.prenom} ${selectedEnfant.nom}` : 'Choisir un enfant'}</span>
              {enfants.length > 1 && <span style={{ fontSize: 10 }}>▼</span>}
            </button>

            {menuOpen && enfants.length > 1 && (
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

        {/* Avatar + déconnexion */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link
            to="/parent/profil"
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 12, fontWeight: 700, textDecoration: 'none',
            }}
          >
            {initials}
          </Link>
          <button
            onClick={logout}
            title="Déconnexion"
            style={{
              background: 'rgba(255,255,255,0.15)', border: 'none',
              borderRadius: 6, color: '#fff', fontSize: 13,
              padding: '5px 10px', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            ⏻
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>

        {/* ── SIDEBAR ── */}
        <nav style={{
          width: 200, background: 'var(--bg-card)', flexShrink: 0,
          borderRight: '1px solid var(--border)', padding: '12px 8px',
          display: 'flex', flexDirection: 'column',
        }}>
          {NAV.map(({ path, icon, label }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 8, marginBottom: 2,
                  textDecoration: 'none',
                  background: active ? 'rgba(10,92,54,0.08)' : 'transparent',
                  color: active ? '#0A5C36' : 'var(--text-secondary)',
                  fontWeight: active ? 700 : 500,
                  fontSize: 13.5,
                  transition: 'all 0.12s',
                  borderLeft: active ? '3px solid #0A5C36' : '3px solid transparent',
                }}
              >
                <span style={{ fontSize: 16 }}>{icon}</span>
                {label}
              </Link>
            );
          })}

          {/* Info enfant actif */}
          {selectedEnfant && (
            <div style={{
              padding: '12px',
              borderTop: '1px solid var(--border)', marginTop: 16,
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: 4 }}>
                ÉLÈVE SUIVI
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                {selectedEnfant.prenom} {selectedEnfant.nom}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{selectedEnfant.classe_nom}</div>
            </div>
          )}
        </nav>

        {/* ── CONTENU ── */}
        <main style={{ flex: 1, overflow: 'auto', padding: '28px 32px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
