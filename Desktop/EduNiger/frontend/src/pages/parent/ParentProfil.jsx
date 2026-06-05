import { useState, useEffect } from 'react';
import ParentLayout, { parentApi, useParentAuth } from './ParentLayout';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function ParentProfil() {
  const { user } = useParentAuth();

  const [tab, setTab]             = useState('infos');
  const [form, setForm]           = useState({ nom: '', prenom: '', email: '', telephone: '' });
  const [pwdForm, setPwdForm]     = useState({ actuel: '', nouveau: '', confirmer: '' });
  const [showPwd, setShowPwd]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [alert, setAlert]         = useState(null);
  const [alertPwd, setAlertPwd]   = useState(null);

  useEffect(() => {
    if (user) {
      setForm({ nom: user.nom || '', prenom: user.prenom || '', email: user.email || '', telephone: user.telephone || '' });
    }
  }, []);

  const showAlert = (setter, type, msg) => {
    setter({ type, msg });
    setTimeout(() => setter(null), 4000);
  };

  const handleSaveInfos = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('parent_token');
      const res   = await fetch(`${API_URL}/auth/profile`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ nom: form.nom, prenom: form.prenom, telephone: form.telephone }),
      });
      const data = await res.json();
      if (data.success) {
        // Mettre à jour le localStorage
        const updated = { ...user, nom: form.nom, prenom: form.prenom, telephone: form.telephone };
        localStorage.setItem('parent_user', JSON.stringify(updated));
        showAlert(setAlert, 'success', 'Profil mis à jour avec succès');
      } else {
        showAlert(setAlert, 'danger', data.message || 'Erreur lors de la mise à jour');
      }
    } catch {
      showAlert(setAlert, 'danger', 'Erreur réseau');
    } finally { setSaving(false); }
  };

  const handleChangePwd = async (e) => {
    e.preventDefault();
    if (pwdForm.nouveau !== pwdForm.confirmer) {
      showAlert(setAlertPwd, 'danger', 'Les mots de passe ne correspondent pas');
      return;
    }
    if (pwdForm.nouveau.length < 6) {
      showAlert(setAlertPwd, 'danger', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    setSavingPwd(true);
    try {
      const token = localStorage.getItem('parent_token');
      const res   = await fetch(`${API_URL}/auth/change-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ currentPassword: pwdForm.actuel, newPassword: pwdForm.nouveau }),
      });
      const data = await res.json();
      if (data.success) {
        showAlert(setAlertPwd, 'success', 'Mot de passe modifié avec succès');
        setPwdForm({ actuel: '', nouveau: '', confirmer: '' });
      } else {
        showAlert(setAlertPwd, 'danger', data.message || 'Mot de passe actuel incorrect');
      }
    } catch {
      showAlert(setAlertPwd, 'danger', 'Erreur réseau');
    } finally { setSavingPwd(false); }
  };

  // Indicateur force mot de passe
  const strength = (() => {
    const p = pwdForm.nouveau;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6)           s++;
    if (p.length >= 10)          s++;
    if (/[A-Z]/.test(p))        s++;
    if (/[0-9]/.test(p))        s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const strengthLabels = ['', 'Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'];
  const strengthColors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'];

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));
  const setPwd = (key) => (e) => setPwdForm(f => ({ ...f, [key]: e.target.value }));

  const initiales = user ? `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase() : '?';

  return (
    <ParentLayout>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Mon Profil</h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Gérez vos informations personnelles et votre sécurité</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24, alignItems: 'start' }}>

        {/* Carte identité */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 16, padding: '28px 20px', textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#e8f5ee',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, fontWeight: 700, color: '#0A5C36', margin: '0 auto 14px' }}>
            {initiales}
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
            {form.prenom} {form.nom}
          </div>
          <div style={{ fontSize: 12, color: '#1565c0', marginTop: 4, fontWeight: 500 }}>Parent</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{form.email}</div>
          {form.telephone && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{form.telephone}</div>
          )}
        </div>

        {/* Formulaires */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
            {[['infos','Informations personnelles'],['securite','Sécurité']].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)}
                style={{ flex: 1, padding: '14px 20px', border: 'none', background: 'none', cursor: 'pointer',
                  fontSize: 14, fontWeight: tab === id ? 600 : 400,
                  color: tab === id ? '#0A5C36' : 'var(--text-secondary)',
                  borderBottom: tab === id ? '2px solid #0A5C36' : '2px solid transparent' }}>
                <i className={`ti ${id === 'infos' ? 'ti-user' : 'ti-lock'}`} aria-hidden="true" style={{ marginRight: 8 }} />
                {label}
              </button>
            ))}
          </div>

          <div style={{ padding: '28px' }}>

            {/* ── Infos personnelles ── */}
            {tab === 'infos' && (
              <form onSubmit={handleSaveInfos}>
                {alert && (
                  <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 20, fontSize: 13,
                    background: alert.type === 'success' ? '#e8f5ee' : '#fdecea',
                    color: alert.type === 'success' ? '#1a7a4a' : '#c0392b',
                    border: `.5px solid ${alert.type === 'success' ? '#a7f3d0' : '#fca5a5'}` }}>
                    {alert.type === 'success' ? '✅' : '⚠️'} {alert.msg}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Prénom *</label>
                    <input value={form.prenom} onChange={set('prenom')} required
                      style={{ width: '100%', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Nom *</label>
                    <input value={form.nom} onChange={set('nom')} required
                      style={{ width: '100%', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Adresse email</label>
                  <input value={form.email} disabled
                    style={{ width: '100%', boxSizing: 'border-box', opacity: .6, cursor: 'not-allowed', background: 'var(--bg)' }} />
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    L'email ne peut pas être modifié. Contactez l'administration.
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Téléphone</label>
                  <input value={form.telephone} onChange={set('telephone')} placeholder="+227 XX XX XX XX"
                    style={{ width: '100%', boxSizing: 'border-box' }} />
                </div>

                <button type="submit" disabled={saving}
                  style={{ padding: '10px 24px', background: '#0A5C36', color: '#fff', border: 'none',
                    borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: saving ? .7 : 1 }}>
                  {saving ? '⏳ Enregistrement...' : '💾 Enregistrer les modifications'}
                </button>
              </form>
            )}

            {/* ── Sécurité ── */}
            {tab === 'securite' && (
              <form onSubmit={handleChangePwd}>
                {alertPwd && (
                  <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 20, fontSize: 13,
                    background: alertPwd.type === 'success' ? '#e8f5ee' : '#fdecea',
                    color: alertPwd.type === 'success' ? '#1a7a4a' : '#c0392b',
                    border: `.5px solid ${alertPwd.type === 'success' ? '#a7f3d0' : '#fca5a5'}` }}>
                    {alertPwd.type === 'success' ? '✅' : '⚠️'} {alertPwd.msg}
                  </div>
                )}

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Mot de passe actuel *</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPwd ? 'text' : 'password'} value={pwdForm.actuel}
                      onChange={setPwd('actuel')} required
                      style={{ width: '100%', boxSizing: 'border-box', paddingRight: 44 }} />
                    <button type="button" onClick={() => setShowPwd(v => !v)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-secondary)', padding: 0 }}>
                      <i className={`ti ${showPwd ? 'ti-eye-off' : 'ti-eye'}`} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: 8 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Nouveau mot de passe *</label>
                  <input type={showPwd ? 'text' : 'password'} value={pwdForm.nouveau}
                    onChange={setPwd('nouveau')} required
                    style={{ width: '100%', boxSizing: 'border-box' }} />
                  {pwdForm.nouveau && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                        {[1,2,3,4,5].map(i => (
                          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2,
                            background: i <= strength ? strengthColors[strength] : 'var(--border)' }} />
                        ))}
                      </div>
                      <div style={{ fontSize: 11, color: strengthColors[strength] }}>{strengthLabels[strength]}</div>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Confirmer le nouveau mot de passe *</label>
                  <input type={showPwd ? 'text' : 'password'} value={pwdForm.confirmer}
                    onChange={setPwd('confirmer')} required
                    style={{ width: '100%', boxSizing: 'border-box',
                      borderColor: pwdForm.confirmer && pwdForm.confirmer !== pwdForm.nouveau ? '#ef4444' : undefined }} />
                  {pwdForm.confirmer && pwdForm.confirmer !== pwdForm.nouveau && (
                    <div style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>✗ Les mots de passe ne correspondent pas</div>
                  )}
                  {pwdForm.confirmer && pwdForm.confirmer === pwdForm.nouveau && (
                    <div style={{ fontSize: 12, color: '#16a34a', marginTop: 4 }}>✓ Les mots de passe correspondent</div>
                  )}
                </div>

                <button type="submit" disabled={savingPwd || (pwdForm.confirmer && pwdForm.confirmer !== pwdForm.nouveau)}
                  style={{ padding: '10px 24px', background: '#0A5C36', color: '#fff', border: 'none',
                    borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: savingPwd ? .7 : 1 }}>
                  {savingPwd ? '⏳ Modification...' : '🔒 Changer le mot de passe'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </ParentLayout>
  );
}
