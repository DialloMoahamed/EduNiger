import { useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function ForgotPassword() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/auth/forgot-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
      } else {
        setError(data.message || "Erreur lors de l'envoi");
      }
    } catch {
      setError('Impossible de contacter le serveur. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-branding">
          <div className="login-logo">📚</div>
          <div className="login-brand-name">EduNiger</div>
          <div className="login-brand-desc">
            La plateforme de gestion scolaire conçue pour les établissements
            d'enseignement du Niger et de l'Afrique de l'Ouest.
          </div>
        </div>
        <div className="login-features">
          {[
            { icon: '🔒', text: 'Réinitialisation sécurisée par email' },
            { icon: '⏱️', text: 'Lien valable 1 heure seulement' },
            { icon: '✉️', text: 'Email envoyé à votre adresse enregistrée' },
            { icon: '🔑', text: 'Nouveau mot de passe en 2 étapes' },
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
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>📬</div>
              <h2 style={{ marginBottom: 8 }}>Email envoyé !</h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
                Si <strong>{email}</strong> est enregistré dans le système,
                vous recevrez un lien de réinitialisation dans quelques minutes.
              </p>
              <div style={{
                background: '#f0fdf4', border: '1px solid #bbf7d0',
                borderRadius: 8, padding: '12px 16px',
                color: '#166534', fontSize: 13, marginBottom: 24, textAlign: 'left',
              }}>
                💡 Vérifiez votre dossier <strong>Courrier indésirable</strong> si vous ne recevez rien sous 5 minutes.
              </div>
              <Link to="/login" className="btn btn-primary w-full" style={{ justifyContent: 'center', display: 'flex' }}>
                ← Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <h1 className="login-form-title">Mot de passe oublié</h1>
              <p className="login-form-sub">
                Entrez votre adresse email. Vous recevrez un lien pour créer un nouveau mot de passe.
              </p>

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
                <button
                  type="submit"
                  className="btn btn-primary w-full btn-lg mt-2"
                  disabled={loading}
                  style={{ justifyContent: 'center' }}
                >
                  {loading ? '⏳ Envoi en cours...' : '📧 Envoyer le lien de réinitialisation'}
                </button>
              </form>

              <div className="divider" />
              <div style={{ textAlign: 'center' }}>
                <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: 14 }}>
                  ← Retour à la connexion
                </Link>
              </div>
            </>
          )}

          <div style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: 'var(--text-light)' }}>
            EduNiger v2.0 — Tous droits réservés © 2026
          </div>
        </div>
      </div>
    </div>
  );
}
