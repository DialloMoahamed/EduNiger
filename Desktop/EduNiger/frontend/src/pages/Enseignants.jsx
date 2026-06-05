import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Enseignants() {
  const [enseignants, setEnseignants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const { isAdmin } = useAuth();
  const [formData, setFormData] = useState({ nom: '', prenom: '', email: '', telephone: '', password: '', role: 'enseignant' });

  useEffect(() => { loadEnseignants(); }, []);

  const loadEnseignants = async () => {
    try {
      const res = await api.get('/auth/users');
      setEnseignants((res.data.users || []).filter(u => u.role !== 'parent'));
    } catch {}
    finally { setLoading(false); }
  };

  const openModal = (u = null) => {
    setEditing(u);
    setFormData(u ? { nom: u.nom, prenom: u.prenom, email: u.email, telephone: u.telephone || '', password: '', role: u.role } : { nom: '', prenom: '', email: '', telephone: '', password: '', role: 'enseignant' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...formData };
      if (!data.password) delete data.password;
      if (editing) await api.put(`/auth/users/${editing.id}`, data);
      else await api.post('/auth/register', data);
      setShowModal(false);
      showAlertMsg('success', editing ? 'Utilisateur modifié' : 'Utilisateur créé');
      loadEnseignants();
    } catch (err) {
      showAlertMsg('danger', err.response?.data?.message || 'Erreur');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, nom) => {
    if (!window.confirm(`Supprimer l'utilisateur ${nom} ?`)) return;
    try {
      await api.delete(`/auth/users/${id}`);
      showAlertMsg('success', 'Utilisateur supprimé');
      loadEnseignants();
    } catch (err) {
      showAlertMsg('danger', err.response?.data?.message || 'Erreur');
    }
  };

  const showAlertMsg = (type, msg) => { setAlert({ type, msg }); setTimeout(() => setAlert(null), 4000); };
  const set = (f) => (e) => setFormData(p => ({ ...p, [f]: e.target.value }));

  if (loading) return <div className="loading-state"><div className="spinner"></div><span>Chargement...</span></div>;

  return (
    <div>
      {alert && <div className={`alert alert-${alert.type}`}>{alert.type === 'success' ? '✅' : '⚠️'} {alert.msg}</div>}

      <div className="page-header">
        <div className="page-header-left">
          <h1>Enseignants & Personnel</h1>
          <p>{enseignants.length} utilisateur(s) dans le système</p>
        </div>
        {isAdmin() && <button className="btn btn-primary" onClick={() => openModal()}>+ Ajouter un utilisateur</button>}
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Nom & Prénom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Rôle</th>
                <th>Inscription</th>
                {isAdmin() && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {enseignants.length === 0 ? (
                <tr><td colSpan={6}><div className="empty-state"><div className="empty-state-icon">👩‍🏫</div><h3>Aucun utilisateur</h3></div></td></tr>
              ) : enseignants.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: u.role === 'admin' ? 'var(--accent)' : u.role === 'parent' ? 'var(--info)' : 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px', flexShrink: 0 }}>
                        {u.prenom?.[0]}{u.nom?.[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{u.prenom} {u.nom}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{u.email}</td>
                  <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{u.telephone || '—'}</td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'badge-warning' : u.role === 'parent' ? 'badge-info' : 'badge-success'}`}>
                      {u.role === 'admin' ? '👑 Admin' : u.role === 'parent' ? '👨‍👩‍👧 Parent' : '👩‍🏫 Enseignant'}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {u.created_at ? new Date(u.created_at).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  {isAdmin() && (
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openModal(u)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id, `${u.prenom} ${u.nom}`)}>🗑️</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '460px' }}>
            <div className="modal-header">
              <div className="modal-title">{editing ? '✏️ Modifier utilisateur' : '➕ Nouvel utilisateur'}</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Nom *</label>
                    <input type="text" className="form-input" value={formData.nom} onChange={set('nom')} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Prénom *</label>
                    <input type="text" className="form-input" value={formData.prenom} onChange={set('prenom')} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input type="email" className="form-input" value={formData.email} onChange={set('email')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Téléphone</label>
                  <input type="tel" className="form-input" value={formData.telephone} onChange={set('telephone')} placeholder="+227 90 00 00 00" />
                </div>
                <div className="form-group">
                  <label className="form-label">{editing ? 'Nouveau mot de passe (laisser vide = inchangé)' : 'Mot de passe *'}</label>
                  <input type="password" className="form-input" value={formData.password} onChange={set('password')} required={!editing} placeholder="••••••••" />
                </div>
                <div className="form-group">
                  <label className="form-label">Rôle *</label>
                  <select className="form-select" value={formData.role} onChange={set('role')}>
                    <option value="enseignant">Enseignant</option>
                    <option value="admin">Administrateur</option>
                    {/* Parents créés via la page Élèves uniquement */}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? '⏳...' : (editing ? '✅ Modifier' : '✅ Créer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}