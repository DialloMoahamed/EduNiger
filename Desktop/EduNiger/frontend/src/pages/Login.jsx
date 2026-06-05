import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login({ email, password });
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-branding">
          <div className="login-logo">📚</div>
          <div className="login-brand-name">EduNiger</div>
          <div className="login-brand-desc">
            La plateforme de gestion scolaire conçue pour les établissements d'enseignement du Niger et de l'Afrique de l'Ouest.
          </div>
        </div>
        <div className="login-features">
          {[
            { icon: '👨‍🎓', text: 'Gestion complète des élèves et inscriptions' },
            { icon: '📝', text: 'Notes, bulletins et génération PDF automatique' },
            { icon: '📋', text: 'Suivi des présences et des absences' },
            { icon: '📈', text: 'Rapports et statistiques en temps réel' },
          ].map((f, i) => (
            <div className="login-feature" key={i}>
              <div className="login-feature-icon">{f.icon}</div>
              <div className="login-feature-text">{f.text}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-wrap">
          <h1 className="login-form-title">Connexion</h1>
          <p className="login-form-sub">Entrez vos identifiants pour accéder au système</p>

          {error && <div className="alert alert-danger">⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Adresse email</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <div style={{ textAlign: 'right', marginTop: 6 }}>
                <Link
                  to="/forgot-password"
                  style={{ fontSize: 12.5, color: 'var(--primary)', textDecoration: 'none' }}
                >
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-full btn-lg mt-2" disabled={loading} style={{ justifyContent: 'center' }}>
              {loading ? '⏳ Connexion...' : '→ Se connecter'}
            </button>
          </form>

          <div className="divider"></div>
          <div style={{ background: 'var(--bg)', borderRadius: '10px', padding: '14px 16px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
            <div style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--text-secondary)' }}>Comptes de démonstration :</div>
            <div>🔑 <strong>Admin</strong> : admin@ecole.com / Admin123!</div>
            <div style={{ marginTop: '4px' }}>🔑 <strong>Prof</strong> : prof@ecole.com / Prof123!</div>
          </div>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: 'var(--text-light)' }}>
            EduNiger v2.0 — Tous droits réservés © 2026
          </div>
        </div>
      </div>
    </div>
  );
}