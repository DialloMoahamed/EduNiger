import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function ResetPassword() {
  const [searchParams]        = useSearchParams();
  const navigate               = useNavigate();
  const token                  = searchParams.get('token');

  const [step, setStep]        = useState('verifying'); // verifying | form | success | invalid
  const [email, setEmail]      = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPwd, setShowPwd]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  // Vérifier le token dès l'arrivée sur la page
  useEffect(() => {
    if (!token) { setStep('invalid'); return; }
    fetch(`${API_URL}/auth/reset-password/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setEmail(data.email);
          setStep('form');
        } else {
          setStep('invalid');
        }
      })
      .catch(() => setStep('invalid'));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (password !== confirm) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/auth/reset-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (data.success) {
        setStep('success');
      } else {
        setError(data.message || 'Erreur lors de la réinitialisation.');
      }
    } catch {
      setError('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  };

  // Force meter
  const strength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 6)  s++;
    if (password.length >= 10) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();
  const strengthLabel = ['', 'Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'][strength];
  const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'][strength];

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
            { icon: '🔒', text: 'Choisissez un mot de passe fort' },
            { icon: '✅', text: 'Minimum 6 caractères' },
            { icon: '🔠', text: 'Mélangez lettres, chiffres et symboles' },
            { icon: '🚫', text: 'N\'utilisez pas votre nom ou email' },
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

          {/* Vérification en cours */}
          {step === 'verifying' && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
              <p style={{ color: 'var(--text-muted)' }}>Vérification du lien...</p>
            </div>
          )}

          {/* Lien invalide ou expiré */}
          {step === 'invalid' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>⏰</div>
              <h2 style={{ marginBottom: 8 }}>Lien invalide ou expiré</h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
                Ce lien de réinitialisation n'est plus valide.
                Il a peut-être déjà été utilisé ou il a expiré (validité : 1 heure).
              </p>
              <Link to="/forgot-password" className="btn btn-primary w-full" style={{ justifyContent: 'center', display: 'flex', marginBottom: 12 }}>
                📧 Faire une nouvelle demande
              </Link>
              <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: 14 }}>
                ← Retour à la connexion
              </Link>
            </div>
          )}

          {/* Formulaire */}
          {step === 'form' && (
            <>
              <h1 className="login-form-title">Nouveau mot de passe</h1>
              <p className="login-form-sub">
                Compte : <strong>{email}</strong>
              </p>

              {error && <div className="alert alert-danger">⚠️ {error}</div>}

              <form onSubmit={handleSubmit}>
                {/* Nouveau mot de passe */}
                <div className="form-group">
                  <label className="form-label">Nouveau mot de passe</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPwd ? 'text' : 'password'}
                      className="form-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoFocus
                      style={{ paddingRight: 44 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(v => !v)}
                      style={{
                        position: 'absolute', right: 12, top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none', border: 'none',
                        cursor: 'pointer', color: 'var(--text-muted)',
                        fontSize: 18, padding: 0,
                      }}
                    >
                      {showPwd ? '🙈' : '👁️'}
                    </button>
                  </div>

                  {/* Barre de force */}
                  {password && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                        {[1,2,3,4,5].map(i => (
                          <div key={i} style={{
                            flex: 1, height: 4, borderRadius: 2,
                            background: i <= strength ? strengthColor : 'var(--border)',
                            transition: 'background .2s',
                          }} />
                        ))}
                      </div>
                      <div style={{ fontSize: 11, color: strengthColor }}>{strengthLabel}</div>
                    </div>
                  )}
                </div>

                {/* Confirmation */}
                <div className="form-group">
                  <label className="form-label">Confirmer le mot de passe</label>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    className="form-input"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{
                      borderColor: confirm && confirm !== password ? '#ef4444' : undefined,
                    }}
                  />
                  {confirm && confirm !== password && (
                    <div style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>
                      ✗ Les mots de passe ne correspondent pas
                    </div>
                  )}
                  {confirm && confirm === password && (
                    <div style={{ fontSize: 12, color: '#16a34a', marginTop: 4 }}>
                      ✓ Les mots de passe correspondent
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full btn-lg mt-2"
                  disabled={loading || (confirm && confirm !== password)}
                  style={{ justifyContent: 'center' }}
                >
                  {loading ? '⏳ Réinitialisation...' : '🔒 Enregistrer le nouveau mot de passe'}
                </button>
              </form>
            </>
          )}

          {/* Succès */}
          {step === 'success' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
              <h2 style={{ marginBottom: 8 }}>Mot de passe modifié !</h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
                Votre mot de passe a été réinitialisé avec succès.
                Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
              </p>
              <button
                className="btn btn-primary w-full btn-lg"
                style={{ justifyContent: 'center' }}
                onClick={() => navigate('/login')}
              >
                → Se connecter
              </button>
            </div>
          )}

          <div style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: 'var(--text-light)' }}>
            EduNiger v2.0 — Tous droits réservés © 2026
          </div>
        </div>
      </div>
    </div>
  );
}
