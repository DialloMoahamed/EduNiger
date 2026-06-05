import { useState, useEffect } from 'react';
import { getClasses, getEleves, getNotes, createNote, deleteNote, generateBulletin } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MATIERES = [
  { id: 1, nom: 'Mathématiques', code: 'MATH', coef: 4 },
  { id: 2, nom: 'Français', code: 'FR', coef: 3 },
  { id: 3, nom: 'Sciences Physiques', code: 'PC', coef: 3 },
  { id: 4, nom: 'SVT', code: 'SVT', coef: 2 },
  { id: 5, nom: 'Histoire-Géographie', code: 'HG', coef: 2 },
  { id: 6, nom: 'Anglais', code: 'ANG', coef: 2 },
  { id: 7, nom: 'EPS', code: 'EPS', coef: 1 },
  { id: 8, nom: 'Arts Plastiques', code: 'ART', coef: 1 },
];

const noteClass = (note, sur = 20) => {
  const pct = (note / sur) * 20;
  if (pct >= 16) return 'note-excellent';
  if (pct >= 12) return 'note-bien';
  if (pct >= 8) return 'note-moyen';
  return 'note-faible';
};

export default function Notes() {
  const [classes, setClasses] = useState([]);
  const [eleves, setEleves] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedClasse, setSelectedClasse] = useState('');
  const [selectedEleve, setSelectedEleve] = useState('');
  const [periode, setPeriode] = useState('Trimestre 1');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [formData, setFormData] = useState({
    eleve_id: '', matiere_id: '', type_evaluation: 'devoir',
    note: '', note_sur: '20', date_evaluation: new Date().toISOString().split('T')[0]
  });
  const { isAdmin, user } = useAuth();

  useEffect(() => { loadClasses(); }, []);
  useEffect(() => { if (selectedClasse) { loadEleves(); loadNotes(); } }, [selectedClasse, periode, selectedEleve]);

  const loadClasses = async () => {
    try {
      const r = await getClasses();
      const all = r.data.classes;
      if (isAdmin()) {
        setClasses(all);
      } else {
        // L'enseignant ne voit que sa propre classe
        const mesClasses = all.filter(c => c.enseignant_id === user?.id);
        setClasses(mesClasses);
        // Sélection automatique si une seule classe
        if (mesClasses.length === 1) setSelectedClasse(String(mesClasses[0].id));
      }
    } catch {}
  };
  const loadEleves = async () => { try { const r = await getEleves({ classe_id: selectedClasse }); setEleves(r.data.eleves); } catch {} };
  const loadNotes = async () => {
    try {
      const params = { classe_id: selectedClasse, periode };
      if (selectedEleve) params.eleve_id = selectedEleve;
      const r = await getNotes(params);
      setNotes(r.data.notes);
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createNote({ ...formData, classe_id: selectedClasse, periode });
      setShowModal(false);
      setAlert({ type: 'success', msg: 'Note ajoutée avec succès' });
      setTimeout(() => setAlert(null), 3000);
      loadNotes();
    } catch (err) {
      setAlert({ type: 'danger', msg: err.response?.data?.message || 'Erreur' });
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette note ?')) return;
    try {
      await deleteNote(id);
      setAlert({ type: 'success', msg: 'Note supprimée' });
      setTimeout(() => setAlert(null), 3000);
      loadNotes();
    } catch {}
  };

  const handleBulletin = async (eleveId) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const token = localStorage.getItem('token');
      // Ouvrir le PDF via URL directe avec le token en header — évite la page noire
      const response = await fetch(
        `${API_URL}/notes/bulletin/${eleveId}/${encodeURIComponent(periode)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error('Erreur serveur');
      const blob = await response.blob();
      const url  = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch {
      setAlert({ type: 'danger', msg: 'Erreur lors de la génération du bulletin' });
    }
  };

  const set = (f) => (e) => setFormData(p => ({ ...p, [f]: e.target.value }));

  // Group notes by student for summary
  const notesByEleve = {};
  notes.forEach(n => {
    if (!notesByEleve[n.eleve_id]) notesByEleve[n.eleve_id] = { nom: `${n.eleve_prenom} ${n.eleve_nom}`, id: n.eleve_id, notes: [] };
    notesByEleve[n.eleve_id].notes.push(n);
  });

  const calcMoyenne = (ns) => {
    if (!ns.length) return null;
    const total = ns.reduce((s, n) => s + (n.note / n.note_sur) * 20, 0);
    return (total / ns.length).toFixed(2);
  };

  return (
    <div>
      {alert && <div className={`alert alert-${alert.type}`}>{alert.type === 'success' ? '✅' : '⚠️'} {alert.msg}</div>}

      <div className="page-header">
        <div className="page-header-left">
          <h1>Notes & Bulletins</h1>
          <p>Saisie des évaluations et génération des bulletins scolaires</p>
        </div>
        {selectedClasse && (
          <button className="btn btn-primary" onClick={() => { setFormData({ eleve_id: '', matiere_id: '', type_evaluation: 'devoir', note: '', note_sur: '20', date_evaluation: new Date().toISOString().split('T')[0] }); setShowModal(true); }}>
            + Ajouter une note
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card mb-3">
        <div className="card-body" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label className="form-label">Classe</label>
              <select className="form-select" value={selectedClasse} onChange={(e) => { setSelectedClasse(e.target.value); setSelectedEleve(''); }}>
                <option value="">Sélectionner une classe...</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.nom} — {c.niveau}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Période</label>
              <select className="form-select" value={periode} onChange={(e) => setPeriode(e.target.value)}>
                <option value="Trimestre 1">Trimestre 1</option>
                <option value="Trimestre 2">Trimestre 2</option>
                <option value="Trimestre 3">Trimestre 3</option>
              </select>
            </div>
            <div>
              <label className="form-label">Élève</label>
              <select className="form-select" value={selectedEleve} onChange={(e) => setSelectedEleve(e.target.value)}>
                <option value="">Tous les élèves</option>
                {eleves.map(e => <option key={e.id} value={e.id}>{e.nom} {e.prenom}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {selectedClasse && (
        <>
          {/* Summary by student */}
          {Object.values(notesByEleve).length > 0 && (
            <div className="card mb-3">
              <div className="card-header">
                <div className="card-title">Récapitulatif — {periode}</div>
                <div className="card-subtitle">{Object.keys(notesByEleve).length} élève(s) avec des notes</div>
              </div>
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Élève</th>
                      <th>Nb Notes</th>
                      <th>Moyenne</th>
                      <th>Bulletin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(notesByEleve).map(e => {
                      const moy = calcMoyenne(e.notes);
                      return (
                        <tr key={e.id}>
                          <td><strong>{e.nom}</strong></td>
                          <td><span className="badge badge-neutral">{e.notes.length} note(s)</span></td>
                          <td>
                            {moy && <span className={`note-chip ${noteClass(moy)}`}>{moy}</span>}
                          </td>
                          <td>
                            <button className="btn btn-secondary btn-sm" onClick={() => handleBulletin(e.id)}>
                              📄 Générer bulletin
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* All notes */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Liste des notes</div>
              <span className="badge badge-info">{notes.length} note(s)</span>
            </div>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Élève</th>
                    <th>Matière</th>
                    <th>Type</th>
                    <th>Note</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {notes.length === 0 ? (
                    <tr><td colSpan={6}><div className="empty-state"><div className="empty-state-icon">📝</div><h3>Aucune note saisie</h3><p>Ajoutez des notes pour cette classe et période</p></div></td></tr>
                  ) : notes.map(n => (
                    <tr key={n.id}>
                      <td><strong>{n.eleve_prenom} {n.eleve_nom}</strong></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="badge badge-neutral" style={{ fontFamily: 'Space Mono', fontSize: '10px' }}>
                            {MATIERES.find(m => m.id == n.matiere_id)?.code || '?'}
                          </span>
                          {n.matiere_nom}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${n.type_evaluation === 'composition' ? 'badge-warning' : n.type_evaluation === 'interrogation' ? 'badge-info' : 'badge-neutral'}`}>
                          {n.type_evaluation}
                        </span>
                      </td>
                      <td>
                        <span className={`note-chip ${noteClass(n.note, n.note_sur)}`}>{n.note}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px', marginLeft: '4px' }}>/{n.note_sur}</span>
                      </td>
                      <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {n.date_evaluation ? new Date(n.date_evaluation).toLocaleDateString('fr-FR') : '—'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(n.id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!selectedClasse && (
        <div className="card"><div className="empty-state"><div className="empty-state-icon">📝</div><h3>Sélectionnez une classe</h3><p>Choisissez une classe et une période pour gérer les notes</p></div></div>
      )}

      {/* Modal add note */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div className="modal-title">➕ Ajouter une note</div>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Élève *</label>
                  <select className="form-select" value={formData.eleve_id} onChange={set('eleve_id')} required>
                    <option value="">Sélectionner un élève...</option>
                    {eleves.map(e => <option key={e.id} value={e.id}>{e.nom} {e.prenom}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Matière *</label>
                  <select className="form-select" value={formData.matiere_id} onChange={set('matiere_id')} required>
                    <option value="">Sélectionner une matière...</option>
                    {MATIERES.map(m => <option key={m.id} value={m.id}>{m.nom} (Coef. {m.coef})</option>)}
                  </select>
                </div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Type d'évaluation *</label>
                    <select className="form-select" value={formData.type_evaluation} onChange={set('type_evaluation')}>
                      <option value="devoir">Devoir</option>
                      <option value="composition">Composition</option>
                      <option value="interrogation">Interrogation</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Note sur *</label>
                    <select className="form-select" value={formData.note_sur} onChange={set('note_sur')}>
                      <option value="20">20</option>
                      <option value="10">10</option>
                      <option value="5">5</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Note obtenue *</label>
                    <input type="number" step="0.25" min="0" max={formData.note_sur} className="form-input" value={formData.note} onChange={set('note')} required placeholder={`0 à ${formData.note_sur}`} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date d'évaluation *</label>
                    <input type="date" className="form-input" value={formData.date_evaluation} onChange={set('date_evaluation')} required />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? '⏳...' : '✅ Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
