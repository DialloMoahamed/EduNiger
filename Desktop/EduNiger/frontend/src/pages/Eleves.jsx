import { useState, useEffect } from 'react';
import { getEleves, getClasses, createEleve, updateEleve, deleteEleve } from '../services/api';
import { useAuth } from '../context/AuthContext';

const emptyForm = {
  matricule: '', nom: '', prenom: '', date_naissance: '', lieu_naissance: '',
  sexe: 'M', classe_id: '', nom_parent: '', telephone_parent: '', adresse: ''
};

export default function Eleves() {
  const [eleves, setEleves] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showParentModal, setShowParentModal] = useState(false);
  const [parentEleve, setParentEleve]         = useState(null);
  const [parentForm, setParentForm]           = useState({ nom:'', prenom:'', email:'', telephone:'' });
  const [parentLoading, setParentLoading]     = useState(false);
  const [editingEleve, setEditingEleve] = useState(null);
  const [search, setSearch] = useState('');
  const [filterClasse, setFilterClasse] = useState('');
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const { isAdmin, user } = useAuth();

  // Pré-filtrer sur la classe de l'enseignant dès le premier chargement
  const [initialised, setInitialised] = useState(false);

  useEffect(() => { loadData(); }, [search, filterClasse]);

  const loadData = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (filterClasse) params.classe_id = filterClasse;
      const [elevesRes, classesRes] = await Promise.all([getEleves(params), getClasses()]);
      setEleves(elevesRes.data.eleves);
      const allClasses = classesRes.data.classes;
      setClasses(allClasses);
      // Au premier chargement, verrouiller l'enseignant sur sa classe
      if (!initialised && !isAdmin()) {
        const maClasse = allClasses.find(c => c.enseignant_id === user?.id);
        if (maClasse) setFilterClasse(String(maClasse.id));
        setInitialised(true);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openParentModal = (eleve) => {
    setParentEleve(eleve);
    setParentForm({
      nom:       eleve.nom_parent?.split(' ').slice(1).join(' ') || '',
      prenom:    eleve.nom_parent?.split(' ')[0] || '',
      email:     '',
      telephone: eleve.telephone_parent || '',
    });
    setShowParentModal(true);
  };

  const handleCreateParent = async (e) => {
    e.preventDefault();
    setParentLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const token   = localStorage.getItem('token');

      const payload = { ...parentForm, eleve_id: parentEleve.id };
      console.log('📤 Envoi création parent:', payload);

      const res  = await fetch(`${API_URL}/parent/create-account`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify(payload),
      });

      const data = await res.json();
      console.log('📥 Réponse backend:', data);

      if (data.success) {
        // Afficher le mot de passe temporaire à l'admin si l'email n'est pas configuré
        const msg = data.tempPassword
          ? `✅ Compte créé ! Mot de passe temporaire : ${data.tempPassword} — Un email a été envoyé à ${parentForm.email}`
          : `✅ Compte parent lié à l'élève`;
        setAlert({ type: 'success', msg });
        setShowParentModal(false);
        loadData();
      } else {
        console.error('❌ Erreur backend:', data.message);
        setAlert({ type: 'danger', msg: data.message || 'Erreur lors de la création' });
      }
    } catch (err) {
      console.error('❌ Erreur réseau:', err);
      setAlert({ type: 'danger', msg: 'Erreur réseau — vérifiez que le backend est démarré' });
    } finally { setParentLoading(false); }
  };

  const openModal = (eleve = null) => {
    setEditingEleve(eleve);
    setFormData(eleve ? {
      matricule: eleve.matricule, nom: eleve.nom, prenom: eleve.prenom,
      date_naissance: eleve.date_naissance?.split('T')[0] || '',
      lieu_naissance: eleve.lieu_naissance || '', sexe: eleve.sexe,
      classe_id: eleve.classe_id || '', nom_parent: eleve.nom_parent || '',
      telephone_parent: eleve.telephone_parent || '', adresse: eleve.adresse || ''
    } : emptyForm);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingEleve) await updateEleve(editingEleve.id, formData);
      else await createEleve(formData);
      setShowModal(false);
      showAlert('success', editingEleve ? 'Élève modifié avec succès' : 'Élève ajouté avec succès');
      loadData();
    } catch (err) {
      showAlert('danger', err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, nom) => {
    if (!window.confirm(`Supprimer l'élève ${nom} ? Cette action est irréversible.`)) return;
    try {
      await deleteEleve(id);
      showAlert('success', 'Élève supprimé');
      loadData();
    } catch (err) {
      showAlert('danger', err.response?.data?.message || 'Erreur');
    }
  };

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 4000);
  };

  const set = (field) => (e) => setFormData(p => ({ ...p, [field]: e.target.value }));

  const getAge = (dob) => {
    if (!dob) return '—';
    const age = Math.floor((new Date() - new Date(dob)) / (365.25 * 24 * 3600 * 1000));
    return `${age} ans`;
  };

  if (loading) return <div className="loading-state"><div className="spinner"></div><span>Chargement...</span></div>;

  return (
    <div>
      {alert && <div className={`alert alert-${alert.type}`}>{alert.type === 'success' ? '✅' : '⚠️'} {alert.msg}</div>}

      <div className="page-header">
        <div className="page-header-left">
          <h1>Élèves</h1>
          <p>{eleves.length} élève(s) trouvé(s)</p>
        </div>
        {isAdmin() && (
          <button className="btn btn-primary" onClick={() => openModal()}>
            + Nouvel élève
          </button>
        )}
      </div>

      <div className="card">
        <div className="card-body" style={{ paddingBottom: 0 }}>
          <div className="filter-bar">
            <div className="search-input-wrap">
              <span className="search-icon">🔍</span>
              <input type="text" className="form-input" placeholder="Rechercher un élève..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select
                className="form-select"
                value={filterClasse}
                onChange={(e) => setFilterClasse(e.target.value)}
                style={{ width: 'auto', minWidth: '180px' }}
              >
                <option value="">Toutes les classes</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
              {isAdmin() && (
                <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setFilterClasse(''); }}>
                  Réinitialiser
                </button>
              )}
          </div>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Matricule</th>
                <th>Nom & Prénom</th>
                <th>Sexe</th>
                <th>Âge</th>
                <th>Classe</th>
                <th>Parent / Tuteur</th>
                <th>Téléphone</th>
                {isAdmin() && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {eleves.length === 0 ? (
                <tr><td colSpan={8}>
                  <div className="empty-state">
                    <div className="empty-state-icon">👨‍🎓</div>
                    <h3>Aucun élève trouvé</h3>
                    <p>Modifiez vos critères de recherche ou ajoutez un nouvel élève</p>
                  </div>
                </td></tr>
              ) : eleves.map(eleve => (
                <tr key={eleve.id}>
                  <td><span className="font-mono" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{eleve.matricule}</span></td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{eleve.nom} {eleve.prenom}</div>
                    {eleve.lieu_naissance && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>📍 {eleve.lieu_naissance}</div>}
                  </td>
                  <td>
                    <span className={`badge ${eleve.sexe === 'M' ? 'badge-info' : 'badge-warning'}`}>
                      {eleve.sexe === 'M' ? '👦 M' : '👧 F'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{getAge(eleve.date_naissance)}</td>
                  <td>{eleve.classe_nom ? <span className="badge badge-neutral">{eleve.classe_nom}</span> : <span style={{ color: 'var(--text-light)' }}>—</span>}</td>
                  <td style={{ fontSize: '13px' }}>{eleve.nom_parent || '—'}</td>
                  <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{eleve.telephone_parent || '—'}</td>
                  {isAdmin() && (
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button onClick={() => openParentModal(eleve)} className="btn btn-secondary btn-sm" title="Créer / lier un compte parent">👨‍👩‍👦</button>
                        <button onClick={() => openModal(eleve)} className="btn btn-secondary btn-sm">✏️ Modifier</button>
                        <button onClick={() => handleDelete(eleve.id, `${eleve.nom} ${eleve.prenom}`)} className="btn btn-danger btn-sm">🗑️</button>
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
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editingEleve ? '✏️ Modifier l\'élève' : '➕ Nouvel élève'}</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Matricule *</label>
                    <input type="text" className="form-input" value={formData.matricule} onChange={set('matricule')} required placeholder="2026001" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sexe *</label>
                    <select className="form-select" value={formData.sexe} onChange={set('sexe')} required>
                      <option value="M">Masculin</option>
                      <option value="F">Féminin</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nom *</label>
                    <input type="text" className="form-input" value={formData.nom} onChange={set('nom')} required placeholder="DIALLO" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Prénom *</label>
                    <input type="text" className="form-input" value={formData.prenom} onChange={set('prenom')} required placeholder="Aissata" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date de naissance *</label>
                    <input type="date" className="form-input" value={formData.date_naissance} onChange={set('date_naissance')} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Lieu de naissance</label>
                    <input type="text" className="form-input" value={formData.lieu_naissance} onChange={set('lieu_naissance')} placeholder="Niamey" />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Classe</label>
                    <select className="form-select" value={formData.classe_id} onChange={set('classe_id')}>
                      <option value="">Aucune classe assignée</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.nom} — {c.niveau}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nom du parent / tuteur</label>
                    <input type="text" className="form-input" value={formData.nom_parent} onChange={set('nom_parent')} placeholder="DIALLO Ibrahim" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Téléphone parent</label>
                    <input type="tel" className="form-input" value={formData.telephone_parent} onChange={set('telephone_parent')} placeholder="+227 90 00 00 00" />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Adresse</label>
                    <textarea className="form-input" value={formData.adresse} onChange={set('adresse')} rows={2} placeholder="Quartier, ville..." />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? '⏳ Enregistrement...' : (editingEleve ? '✅ Mettre à jour' : '✅ Ajouter l\'élève')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal compte parent ── */}
      {showParentModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowParentModal(false)}>
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <div className="modal-title">👨‍👩‍👦 Compte parent — {parentEleve?.prenom} {parentEleve?.nom}</div>
              <button className="modal-close" onClick={() => setShowParentModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateParent}>
              <div className="modal-body">
                <div style={{ background: 'var(--info-light)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                  ℹ️ Un email sera envoyé au parent avec ses identifiants de connexion.
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Prénom *</label>
                    <input className="form-input" value={parentForm.prenom}
                      onChange={e => setParentForm(f => ({ ...f, prenom: e.target.value }))}
                      placeholder="Fatouma" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nom *</label>
                    <input className="form-input" value={parentForm.nom}
                      onChange={e => setParentForm(f => ({ ...f, nom: e.target.value }))}
                      placeholder="Diallo" required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input type="email" className="form-input" value={parentForm.email}
                    onChange={e => setParentForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="parent@email.com" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Téléphone</label>
                  <input className="form-input" value={parentForm.telephone}
                    onChange={e => setParentForm(f => ({ ...f, telephone: e.target.value }))}
                    placeholder="+227 XX XX XX XX" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowParentModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={parentLoading}>
                  {parentLoading ? '⏳ Création...' : '✅ Créer le compte parent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}// Note: La création de compte parent se fait via le bouton "Créer compte parent"
// dans le détail de chaque élève — voir parentController.createParentAccount