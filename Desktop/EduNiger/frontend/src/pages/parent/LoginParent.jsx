import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function LoginParent() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/parent/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('parent_token',   data.token);
        localStorage.setItem('parent_user',    JSON.stringify(data.user));
        localStorage.setItem('parent_enfants', JSON.stringify(data.enfants));
        navigate('/parent/dashboard');
      } else {
        setError(data.message || 'Identifiants incorrects');
      }
    } catch {
      setError('Impossible de contacter le serveur. Vérifiez votre connexion.');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      {/* Gauche */}
      <div className="login-left">
        <div className="login-branding">
          <div className="login-logo">👨‍👩‍👧‍👦</div>
          <div className="login-brand-name">EduNiger</div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>
            Espace Parents
          </div>
          <div className="login-brand-desc">
            Suivez la scolarité de vos enfants en temps réel — notes, présences et bulletins accessibles depuis chez vous.
          </div>
        </div>
        <div className="login-features">
          {[
            { icon: '📊', text: 'Tableau de bord de chaque enfant' },
            { icon: '📝', text: 'Notes et moyennes par matière' },
            { icon: '📋', text: 'Suivi des absences et retards' },
            { icon: '📄', text: 'Téléchargement des bulletins PDF' },
          ].map((f, i) => (
            <div className="login-feature" key={i}>
              <div className="login-feature-icon">{f.icon}</div>
              <div className="login-feature-text">{f.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Droite */}
      <div className="login-right">
        <div className="login-form-wrap">
          <h1 className="login-form-title">Connexion Parent</h1>
          <p className="login-form-sub">
            Accédez au suivi scolaire de votre enfant
          </p>

          {error && <div className="alert alert-danger">⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Adresse email</label>
              <input
                type="email" className="form-input"
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com" required autoFocus
              />
            </div>

            <div className="form-group">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Mot de passe</label>
                <Link to="/forgot-password" style={{ fontSize:'12.5px', color:'var(--primary)', fontWeight:600, textDecoration:'none' }}>
                  Mot de passe oublié ?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'} className="form-input"
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required style={{ paddingRight: '44px' }}
                />
                <button type="button" onClick={() => setShowPwd(v => !v)} style={{
                  position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', cursor:'pointer', fontSize:'16px', color:'var(--text-muted)',
                }}>
                  {showPwd ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button
              type="submit" className="btn btn-primary w-full btn-lg mt-2"
              disabled={loading} style={{ justifyContent: 'center' }}
            >
              {loading ? '⏳ Connexion...' : '→ Accéder à l\'espace parent'}
            </button>
          </form>

          <div className="divider"></div>

          <div style={{ textAlign:'center' }}>
            <Link to="/login" style={{ fontSize:'13px', color:'var(--text-muted)', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:'6px' }}>
              ← Connexion administration / enseignants
            </Link>
          </div>

          <div style={{ marginTop:'24px', textAlign:'center', fontSize:'12px', color:'var(--text-light)' }}>
            EduNiger v2.0 — Tous droits réservés © 2026
          </div>
        </div>
      </div>
    </div>
  );
}
