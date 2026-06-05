import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

export default function Profil() {
  const { user, setUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [form, setForm]         = useState({ nom: '', prenom: '', telephone: '', bio: '' });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [photo, setPhoto]       = useState(null);
  const [preview, setPreview]   = useState(null);
  const [savingInfo, setSavingInfo]   = useState(false);
  const [savingPwd, setSavingPwd]     = useState(false);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [alert, setAlert] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    if (user) {
      setForm({
        nom:       user.nom       || '',
        prenom:    user.prenom    || '',
        telephone: user.telephone || '',
        bio:       user.bio       || '',
      });
      setPreview(user.photo || null);
    }
  }, [user]);

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 4000);
  };

  /* ── Photo ─────────────────────────────── */
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      return showAlert('danger', 'Image trop lourde (max 2 Mo)');
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target.result);
      setPhoto(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSavePhoto = async () => {
    if (!photo) return;
    setSavingPhoto(true);
    try {
      const res = await api.post('/auth/profile/photo', { photo });
      if (setUser) setUser(prev => ({ ...prev, photo: res.data.photo }));
      showAlert('success', 'Photo mise à jour');
    } catch {
      showAlert('danger', 'Erreur lors de la mise à jour de la photo');
    } finally { setSavingPhoto(false); }
  };

  /* ── Infos ──────────────────────────────── */
  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setSavingInfo(true);
    try {
      const res = await api.put('/auth/profile', form);
      if (setUser) setUser(prev => ({ ...prev, ...res.data.user }));
      showAlert('success', 'Profil mis à jour avec succès');
    } catch {
      showAlert('danger', 'Erreur lors de la mise à jour');
    } finally { setSavingInfo(false); }
  };

  /* ── Mot de passe ───────────────────────── */
  const handleSavePwd = async (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm)
      return showAlert('danger', 'Les mots de passe ne correspondent pas');
    if (passwords.newPass.length < 6)
      return showAlert('danger', 'Minimum 6 caractères');
    setSavingPwd(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: passwords.current,
        newPassword: passwords.newPass,
      });
      showAlert('success', 'Mot de passe modifié avec succès');
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      showAlert('danger', err.response?.data?.message || 'Mot de passe actuel incorrect');
    } finally { setSavingPwd(false); }
  };

  const set  = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));
  const setPwd = (f) => (e) => setPasswords(p => ({ ...p, [f]: e.target.value }));

  const initials = user
    ? `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase()
    : 'U';

  return (
    <div>
      {alert && (
        <div className={`alert alert-${alert.type}`}>
          {alert.type === 'success' ? '✅' : '⚠️'} {alert.msg}
        </div>
      )}

      <div className="page-header">
        <div className="page-header-left">
          <h1>Mon Profil</h1>
          <p>Gérez vos informations personnelles et vos préférences</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px', alignItems: 'start' }}>

        {/* ── Colonne gauche : photo + résumé ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Photo */}
          <div className="card">
            <div className="card-body" style={{ textAlign: 'center', padding: '28px 24px' }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
                {preview ? (
                  <img
                    src={preview}
                    alt="avatar"
                    style={{
                      width: '100px', height: '100px', borderRadius: '50%',
                      objectFit: 'cover', border: '3px solid var(--primary)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100px', height: '100px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                    color: '#fff', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '32px', fontWeight: 800,
                    boxShadow: '0 4px 16px rgba(10,92,54,0.3)',
                  }}>
                    {initials}
                  </div>
                )}
                {/* Bouton caméra */}
                <button
                  onClick={() => fileRef.current.click()}
                  style={{
                    position: 'absolute', bottom: 2, right: 2,
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: 'var(--primary)', color: '#fff',
                    border: '2px solid var(--bg-card)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px',
                  }}
                  title="Changer la photo"
                >
                  📷
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: 'none' }}
                  onChange={handlePhotoChange}
                />
              </div>

              <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>
                {user?.prenom} {user?.nom}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                {user?.email}
              </div>
              <span className={`badge ${user?.role === 'admin' ? 'badge-warning' : 'badge-success'}`}>
                {user?.role === 'admin' ? '👑 Administrateur' : '👩‍🏫 Enseignant'}
              </span>

              {photo && (
                <button
                  onClick={handleSavePhoto}
                  className="btn btn-primary w-full"
                  disabled={savingPhoto}
                  style={{ marginTop: '14px', justifyContent: 'center' }}
                >
                  {savingPhoto ? '⏳...' : '💾 Sauvegarder la photo'}
                </button>
              )}
              {preview && !photo && (
                <button
                  onClick={() => fileRef.current.click()}
                  className="btn btn-secondary w-full"
                  style={{ marginTop: '14px', justifyContent: 'center' }}
                >
                  📷 Changer la photo
                </button>
              )}
            </div>
          </div>

          {/* Infos rapides */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Informations</div>
            </div>
            <div className="card-body" style={{ padding: '12px 20px' }}>
              {[
                { icon: '✉️', label: user?.email },
                { icon: '📞', label: user?.telephone || 'Non renseigné' },
                { icon: '📅', label: `Membre depuis ${user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : '—'}` },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '9px 0',
                  borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
                  fontSize: '13px', color: 'var(--text-secondary)',
                }}>
                  <span style={{ fontSize: '15px' }}>{item.icon}</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mode sombre */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Apparence</div>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 600 }}>
                    {isDark ? '🌙 Mode sombre' : '☀️ Mode clair'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {isDark ? 'Interface sombre activée' : 'Interface claire activée'}
                  </div>
                </div>
                {/* Toggle switch */}
                <div
                  onClick={toggleTheme}
                  style={{
                    width: '44px', height: '24px',
                    background: isDark ? 'var(--primary)' : 'var(--border)',
                    borderRadius: '12px', cursor: 'pointer',
                    position: 'relative', transition: 'background 0.2s',
                    flexShrink: 0,
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '3px',
                    left: isDark ? '23px' : '3px',
                    width: '18px', height: '18px',
                    borderRadius: '50%', background: '#fff',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                    transition: 'left 0.2s',
                  }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Colonne droite : formulaires ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Informations personnelles */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">👤 Informations personnelles</div>
                <div className="card-subtitle">Modifiez vos informations de profil</div>
              </div>
            </div>
            <div className="card-body">
              <form onSubmit={handleSaveInfo}>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Nom *</label>
                    <input
                      type="text" className="form-input"
                      value={form.nom} onChange={set('nom')} required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Prénom *</label>
                    <input
                      type="text" className="form-input"
                      value={form.prenom} onChange={set('prenom')} required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email" className="form-input"
                    value={user?.email || ''} disabled
                    style={{ opacity: 0.6, cursor: 'not-allowed' }}
                  />
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    L'email ne peut pas être modifié directement. Contactez l'administrateur.
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Téléphone</label>
                  <input
                    type="tel" className="form-input"
                    value={form.telephone} onChange={set('telephone')}
                    placeholder="+227 90 00 00 00"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Bio / À propos</label>
                  <textarea
                    className="form-input" rows={3}
                    value={form.bio} onChange={set('bio')}
                    placeholder="Quelques mots sur vous, votre expérience..."
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary" disabled={savingInfo}>
                    {savingInfo ? '⏳ Enregistrement...' : '💾 Sauvegarder les informations'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Changer le mot de passe */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">🔒 Changer le mot de passe</div>
                <div className="card-subtitle">Utilisez un mot de passe fort d'au moins 8 caractères</div>
              </div>
            </div>
            <div className="card-body">
              <form onSubmit={handleSavePwd}>
                <div className="form-group">
                  <label className="form-label">Mot de passe actuel *</label>
                  <input
                    type="password" className="form-input"
                    value={passwords.current} onChange={setPwd('current')}
                    required placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Nouveau mot de passe *</label>
                    <input
                      type="password" className="form-input"
                      value={passwords.newPass} onChange={setPwd('newPass')}
                      required placeholder="••••••••"
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirmer *</label>
                    <input
                      type="password" className="form-input"
                      value={passwords.confirm} onChange={setPwd('confirm')}
                      required placeholder="••••••••"
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                {/* Indicateur de force */}
                {passwords.newPass && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                      {[1,2,3,4].map(i => {
                        const strength = [
                          passwords.newPass.length >= 6,
                          passwords.newPass.length >= 10,
                          /[A-Z]/.test(passwords.newPass) && /[0-9]/.test(passwords.newPass),
                          /[^A-Za-z0-9]/.test(passwords.newPass),
                        ];
                        const active = strength.slice(0, i).every(Boolean);
                        const colors = ['#e53e3e','#d69e2e','#38a169','#0a5c36'];
                        return (
                          <div key={i} style={{
                            flex: 1, height: '4px', borderRadius: '2px',
                            background: active ? colors[i-1] : 'var(--border)',
                            transition: 'background 0.2s',
                          }} />
                        );
                      })}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {passwords.newPass.length < 6 ? 'Trop court'
                        : passwords.newPass.length < 10 ? 'Faible'
                        : /[A-Z]/.test(passwords.newPass) && /[0-9]/.test(passwords.newPass) ? 'Fort'
                        : 'Moyen'} — ajoutez majuscules, chiffres et symboles
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary" disabled={savingPwd}>
                    {savingPwd ? '⏳...' : '🔒 Mettre à jour le mot de passe'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Activité */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">📋 Informations du compte</div>
            </div>
            <div className="card-body" style={{ padding: '12px 24px' }}>
              {[
                ['Identifiant', `#${user?.id}`],
                ['Rôle', user?.role === 'admin' ? 'Administrateur' : 'Enseignant'],
                ['Email', user?.email],
                ['Compte créé', user?.created_at
                  ? new Date(user.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                  : '—'],
              ].map(([label, value]) => (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0', borderBottom: '1px solid var(--border)',
                }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{label}</span>
                  <span style={{ fontWeight: 600, fontSize: '13px' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
