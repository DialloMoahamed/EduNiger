import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const pageTitles = {
  '/':           { title: 'Tableau de bord',       subtitle: "Vue d'ensemble de l'établissement" },
  '/eleves':     { title: 'Gestion des Élèves',    subtitle: 'Inscriptions, dossiers et suivi' },
  '/classes':    { title: 'Gestion des Classes',   subtitle: 'Organisation pédagogique' },
  '/presences':  { title: 'Gestion des Présences', subtitle: 'Appel et suivi des absences' },
  '/notes':      { title: 'Notes & Bulletins',     subtitle: 'Évaluations et bulletins scolaires' },
  '/enseignants':{ title: 'Enseignants',            subtitle: 'Personnel enseignant' },
  '/rapports':   { title: 'Rapports & Statistiques',subtitle: 'Analyses et indicateurs' },
  '/parametres': { title: 'Paramètres',             subtitle: 'Configuration du système' },
  '/profil':     { title: 'Mon Profil',             subtitle: 'Informations personnelles et préférences' },
};

export default function Topbar({ pathname }) {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const info  = pageTitles[pathname] || pageTitles['/'];
  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const initials = user
    ? `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase()
    : 'U';

  return (
    <header className="topbar">
      <div>
        <div className="topbar-title">{info.title}</div>
        <div className="topbar-subtitle">{info.subtitle}</div>
      </div>

      <div className="topbar-right">
        {/* Date */}
        <span className="topbar-school-name" style={{ fontSize: '12px' }}>
          📅 {today}
        </span>

        {/* Toggle mode sombre */}
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

        {/* Avatar — lien vers profil */}
        <button
          onClick={() => navigate('/profil')}
          title="Mon profil"
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: '10px', padding: '5px 10px 5px 6px',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          {user?.photo ? (
            <img
              src={user.photo}
              alt="avatar"
              style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: 'var(--primary)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 700, flexShrink: 0,
            }}>
              {initials}
            </div>
          )}
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {user?.prenom} {user?.nom}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.2 }}>
              {user?.role === 'admin' ? 'Administrateur' : 'Enseignant'}
            </div>
          </div>
        </button>
      </div>
    </header>
  );
}
