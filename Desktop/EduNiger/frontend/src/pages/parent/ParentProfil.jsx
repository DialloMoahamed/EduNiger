import { useState, useEffect, useRef } from 'react';
import ParentLayout, { parentApi, useParentAuth } from './ParentLayout';
import { useTheme } from '../../context/ThemeContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function ParentProfil() {
  const { user, enfants }      = useParentAuth();
  const { isDark, toggleTheme } = useTheme();

  const [form, setForm]           = useState({ nom: '', prenom: '', telephone: '', email: '' });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [photo, setPhoto]         = useState(null);
  const [preview, setPreview]     = useState(null);
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
        email:     user.email     || '',
      });
      setPreview(user.photo || null);
    }
  }, []);

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 4000);
  };

  /* ── Photo ───────────────────────────────────────────────── */
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return showAlert('danger', 'Image trop lourde (max 2 Mo)');
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
      const token = localStorage.getItem('parent_token');
      const res = await fetch(`${API_URL}/auth/profile/photo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ photo }),
      });
      const data = await res.json();
      if (data.success) {
        const updated = { ...user, photo: data.photo };
        localStorage.setItem('parent_user', JSON.stringify(updated));
        setPhoto(null);
        showAlert('success', 'Photo mise à jour');
      } else {
        showAlert('danger', 'Erreur lors de la mise à jour de la photo');
      }
    } catch {
      showAlert('danger', 'Erreur réseau');
    } finally { setSavingPhoto(false); }
  };

  /* ── Infos personnelles ──────────────────────────────────── */
  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setSavingInfo(true);
    try {
      const token = localStorage.getItem('parent_token');
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nom: form.nom, prenom: form.prenom, telephone: form.telephone }),
      });
      const data = await res.json();
      if (data.success) {
        const updated = { ...user, nom: form.nom, prenom: form.prenom, telephone: form.telephone };
        localStorage.setItem('parent_user', JSON.stringify(updated));
        showAlert('success', 'Profil mis à jour avec succès');
      } else {
        showAlert('danger', data.message || 'Erreur lors de la mise à jour');
      }
    } catch {
      showAlert('danger', 'Erreur réseau');
    } finally { setSavingInfo(false); }
  };

  /* ── Mot de passe ────────────────────────────────────────── */
  const handleSavePwd = async (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm)
      return showAlert('danger', 'Les mots de passe ne correspondent pas');
    if (passwords.newPass.length < 6)
      return showAlert('danger', 'Minimum 6 caractères');
    setSavingPwd(true);
    try {
      const token = localStorage.getItem('parent_token');
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.newPass }),
      });
      const data = await res.json();
      if (data.success) {
        showAlert('success', 'Mot de passe modifié avec succès');
        setPasswords({ current: '', newPass: '', confirm: '' });
      } else {
        showAlert('danger', data.message || 'Mot de passe actuel incorrect');
      }
    } catch {
      showAlert('danger', 'Erreur réseau');
    } finally { setSavingPwd(false); }
  };

  const setF   = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));
  const setPwd = (f) => (e) => setPasswords(p => ({ ...p, [f]: e.target.value }));

  const initials = user
    ? `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase()
    : '?';

  // Enfants liés
  const enfantsList = enfants || [];

  return (
    <ParentLayout>
      {alert && (
        <div className={`alert alert-${alert.type}`} style={{ marginBottom: 20 }}>
          {alert.type === 'success' ? '✅' : '⚠️'} {alert.msg}
        </div>
      )}

      <div className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <h1>Mon Profil</h1>
          <p>Gérez vos informations personnelles et vos préférences</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px', alignItems: 'start' }}>

        {/* ── Colonne gauche ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Photo + identité */}
          <div className="card">
            <div className="card-body" style={{ textAlign: 'center', padding: '28px 24px' }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
                {preview ? (
                  <img
                    src={preview} alt="avatar"
                    style={{
                      width: '100px', height: '100px', borderRadius: '50%',
                      objectFit: 'cover', border: '3px solid var(--primary)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100px', height: '100px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0A5C36, #12854F)',
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
                  title="Changer la photo"
                  style={{
                    position: 'absolute', bottom: 2, right: 2,
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: 'var(--primary)', color: '#fff',
                    border: '2px solid var(--bg-card)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px',
                  }}
                >
                  📷
                </button>
                <input
                  ref={fileRef} type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: 'none' }}
                  onChange={handlePhotoChange}
                />
              </div>

              <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>
                {form.prenom} {form.nom}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                {form.email}
              </div>
              <span className="badge badge-info" style={{ marginBottom: photo ? '12px' : 0 }}>
                👨‍👩‍👧 Parent
              </span>

              {photo && (
                <button
                  onClick={handleSavePhoto}
                  className="btn btn-primary w-full"
                  disabled={savingPhoto}
                  style={{ marginTop: '14px', justifyContent: 'center', width: '100%' }}
                >
                  {savingPhoto ? '⏳...' : '💾 Sauvegarder la photo'}
                </button>
              )}
              {preview && !photo && (
                <button
                  onClick={() => fileRef.current.click()}
                  className="btn btn-secondary w-full"
                  style={{ marginTop: '10px', justifyContent: 'center', width: '100%' }}
                >
                  📷 Changer la photo
                </button>
              )}
            </div>
          </div>

          {/* Informations rapides */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Informations</div>
            </div>
            <div className="card-body" style={{ padding: '12px 20px' }}>
              {[
                { icon: '✉️', label: form.email || 'Non renseigné' },
                { icon: '📞', label: form.telephone || 'Non renseigné' },
                { icon: '📅', label: `Membre depuis ${user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : '—'}` },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '9px 0',
                  borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
                  fontSize: '13px', color: 'var(--text-secondary)',
                }}>
                  <span style={{ fontSize: '15px' }}>{item.icon}</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Enfants */}
          {enfantsList.length > 0 && (
            <div className="card">
              <div className="card-header">
                <div className="card-title">Mes enfants</div>
                <span className="badge badge-neutral">{enfantsList.length}</span>
              </div>
              <div className="card-body" style={{ padding: '12px 20px' }}>
                {enfantsList.map((enfant, i) => (
                  <div key={enfant.id} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '9px 0',
                    borderBottom: i < enfantsList.length - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #0A5C36, #12854F)',
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, flexShrink: 0,
                    }}>
                      {enfant.prenom?.[0]}{enfant.nom?.[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {enfant.prenom} {enfant.nom}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {enfant.classe_nom || 'Classe non assignée'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Apparence */}
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
                    position: 'absolute', top: '3px',
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
                    <label className="form-label">Prénom *</label>
                    <input
                      type="text" className="form-input"
                      value={form.prenom} onChange={setF('prenom')} required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nom *</label>
                    <input
                      type="text" className="form-input"
                      value={form.nom} onChange={setF('nom')} required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Adresse email</label>
                  <input
                    type="email" className="form-input"
                    value={form.email} disabled
                    style={{ opacity: 0.6, cursor: 'not-allowed' }}
                  />
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    L'email ne peut pas être modifié. Contactez l'administration.
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Téléphone</label>
                  <input
                    type="tel" className="form-input"
                    value={form.telephone} onChange={setF('telephone')}
                    placeholder="+227 90 00 00 00"
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
                <div className="card-title">🔒 Sécurité — Changer le mot de passe</div>
                <div className="card-subtitle">Utilisez un mot de passe fort d'au moins 6 caractères</div>
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
                      style={{
                        borderColor: passwords.confirm && passwords.confirm !== passwords.newPass
                          ? '#ef4444' : undefined,
                      }}
                    />
                    {passwords.confirm && passwords.confirm !== passwords.newPass && (
                      <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>
                        ✗ Les mots de passe ne correspondent pas
                      </div>
                    )}
                    {passwords.confirm && passwords.confirm === passwords.newPass && (
                      <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '4px' }}>
                        ✓ Les mots de passe correspondent
                      </div>
                    )}
                  </div>
                </div>

                {/* Indicateur de force */}
                {passwords.newPass && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                      {[1, 2, 3, 4].map(i => {
                        const checks = [
                          passwords.newPass.length >= 6,
                          passwords.newPass.length >= 10,
                          /[A-Z]/.test(passwords.newPass) && /[0-9]/.test(passwords.newPass),
                          /[^A-Za-z0-9]/.test(passwords.newPass),
                        ];
                        const active = checks.slice(0, i).every(Boolean);
                        const colors = ['#e53e3e', '#d69e2e', '#38a169', '#0a5c36'];
                        return (
                          <div key={i} style={{
                            flex: 1, height: '4px', borderRadius: '2px',
                            background: active ? colors[i - 1] : 'var(--border)',
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
                  <button
                    type="submit" className="btn btn-primary"
                    disabled={savingPwd || !!(passwords.confirm && passwords.confirm !== passwords.newPass)}
                  >
                    {savingPwd ? '⏳...' : '🔒 Mettre à jour le mot de passe'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Informations du compte */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">📋 Informations du compte</div>
            </div>
            <div className="card-body" style={{ padding: '12px 24px' }}>
              {[
                ['Identifiant',   `#${user?.id}`],
                ['Rôle',          'Parent'],
                ['Email',         user?.email],
                ['Enfants liés',  `${enfantsList.length} enfant${enfantsList.length > 1 ? 's' : ''}`],
                ['Compte créé',   user?.created_at
                  ? new Date(user.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })
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
    </ParentLayout>
  );
}
