import { useState, useEffect } from 'react';
import { getClasses, createClasse, updateClasse, deleteClasse } from '../services/api';
import { getUsers } from '../services/api';
import { useAuth } from '../context/AuthContext';

const niveaux = ['Préscolaire', 'Primaire', 'Collège', 'Lycée'];
const emptyForm = { nom: '', niveau: 'Primaire', annee_scolaire: '2025-2026', enseignant_id: '' };

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [enseignants, setEnseignants] = useState([]);
  const { isAdmin } = useAuth();

  useEffect(() => { loadClasses(); loadEnseignants(); }, []);

  const loadEnseignants = async () => {
    try {
      const res = await getUsers();
      setEnseignants(res.data.users.filter(u => u.role === 'enseignant'));
    } catch {}
  };

  const loadClasses = async () => {
    try {
      const res = await getClasses();
      setClasses(res.data.classes);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openModal = (c = null) => {
    setEditing(c);
    setFormData(c
      ? { nom: c.nom, niveau: c.niveau, annee_scolaire: c.annee_scolaire, enseignant_id: c.enseignant_id || '' }
      : emptyForm);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await updateClasse(editing.id, formData);
      else await createClasse(formData);
      setShowModal(false);
      showAlert('success', editing ? 'Classe modifiée' : 'Classe créée avec succès');
      loadClasses();
    } catch (err) {
      showAlert('danger', err.response?.data?.message || 'Erreur');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, nom) => {
    if (!window.confirm(`Supprimer la classe ${nom} ?`)) return;
    try {
      await deleteClasse(id);
      showAlert('success', 'Classe supprimée');
      loadClasses();
    } catch (err) {
      showAlert('danger', err.response?.data?.message || 'Erreur');
    }
  };

  const showAlert = (type, msg) => { setAlert({ type, msg }); setTimeout(() => setAlert(null), 4000); };
  const set = (f) => (e) => setFormData(p => ({ ...p, [f]: e.target.value }));

  const niveauColor = { 'Préscolaire': 'warning', 'Primaire': 'info', 'Collège': 'success', 'Lycée': 'neutral' };

  if (loading) return <div className="loading-state"><div className="spinner"></div><span>Chargement...</span></div>;

  const byNiveau = niveaux.reduce((acc, n) => {
    acc[n] = classes.filter(c => c.niveau === n);
    return acc;
  }, {});

  return (
    <div>
      {alert && <div className={`alert alert-${alert.type}`}>{alert.type === 'success' ? '✅' : '⚠️'} {alert.msg}</div>}

      <div className="page-header">
        <div className="page-header-left">
          <h1>Classes</h1>
          <p>{classes.length} classe(s) — Année scolaire 2025–2026</p>
        </div>
        {isAdmin() && (
          <button className="btn btn-primary" onClick={() => openModal()}>+ Nouvelle classe</button>
        )}
      </div>

      {/* Stats par niveau */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '24px' }}>
        {niveaux.map(n => (
          <div className="stat-card" key={n} style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: '8px' }}>{n}</div>
            <div className="stat-value" style={{ fontSize: '24px' }}>{byNiveau[n].length}</div>
            <div className="stat-label">classe{byNiveau[n].length > 1 ? 's' : ''}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Classe</th>
                <th>Niveau</th>
                <th>Année Scolaire</th>
                <th>Enseignant Titulaire</th>
                <th>Effectif</th>
                {isAdmin() && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {classes.length === 0 ? (
                <tr><td colSpan={6}><div className="empty-state"><div className="empty-state-icon">🏫</div><h3>Aucune classe</h3><p>Créez votre première classe</p></div></td></tr>
              ) : classes.map(c => (
                <tr key={c.id}>
                  <td><strong>{c.nom}</strong></td>
                  <td><span className={`badge badge-${niveauColor[c.niveau] || 'neutral'}`}>{c.niveau}</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>{c.annee_scolaire}</td>
                  <td style={{ fontSize: '13px' }}>
                    {c.enseignant_prenom ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', border: '1px solid var(--border)' }}>
                          {c.enseignant_prenom[0]}{c.enseignant_nom[0]}
                        </div>
                        {c.enseignant_prenom} {c.enseignant_nom}
                      </div>
                    ) : <span style={{ color: 'var(--text-light)' }}>Non assigné</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, maxWidth: '80px', height: '6px', background: 'var(--bg)', borderRadius: '20px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min((c.nombre_eleves / 40) * 100, 100)}%`, background: 'var(--primary)', borderRadius: '20px' }}></div>
                      </div>
                      <span className="font-mono" style={{ fontWeight: 700, fontSize: '13px' }}>{c.nombre_eleves}</span>
                    </div>
                  </td>
                  {isAdmin() && (
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button onClick={() => openModal(c)} className="btn btn-secondary btn-sm">✏️</button>
                        <button onClick={() => handleDelete(c.id, c.nom)} className="btn btn-danger btn-sm">🗑️</button>
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
          <div className="modal" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <div className="modal-title">{editing ? '✏️ Modifier la classe' : '➕ Nouvelle classe'}</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nom de la classe *</label>
                  <input type="text" className="form-input" value={formData.nom} onChange={set('nom')} required placeholder="Ex: 6ème A, CM2 B..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Niveau *</label>
                  <select className="form-select" value={formData.niveau} onChange={set('niveau')} required>
                    {niveaux.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Enseignant titulaire</label>
                  <select className="form-select" value={formData.enseignant_id} onChange={set('enseignant_id')}>
                    <option value="">— Non assigné</option>
                    {enseignants.map(e => (
                      <option key={e.id} value={e.id}>
                        {e.prenom} {e.nom}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Année Scolaire *</label>
                  <select className="form-select" value={formData.annee_scolaire} onChange={set('annee_scolaire')} required>
                    <option value="2024-2025">2024–2025</option>
                    <option value="2025-2026">2025–2026</option>
                    <option value="2026-2027">2026–2027</option>
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
