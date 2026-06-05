import { useState, useEffect } from 'react';
import { getClasses, getUsers } from '../services/api';
import api from '../services/api';

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

const COULEURS = [
  { bg: 'rgba(10,92,54,0.08)',  border: '#0A5C36', text: '#073D24' },
  { bg: 'rgba(49,130,206,0.1)', border: '#3182CE', text: '#1A4A7A' },
  { bg: 'rgba(214,158,46,0.1)', border: '#D69E2E', text: '#975A16' },
  { bg: 'rgba(229,62,62,0.1)',  border: '#E53E3E', text: '#9B2335' },
  { bg: 'rgba(128,90,213,0.1)', border: '#805AD5', text: '#553C9A' },
  { bg: 'rgba(245,166,35,0.1)', border: '#F5A623', text: '#7B4F00' },
  { bg: 'rgba(49,151,149,0.1)', border: '#319795', text: '#1D4044' },
  { bg: 'rgba(213,63,140,0.1)', border: '#D53F8C', text: '#97266D' },
];

const emptyForm = {
  matiere_id: '',
  enseignant_id: '',
  jour: 'Lundi',
  heure_debut: '08:00',
  heure_fin: '09:00',
  salle: '',
};

function fmt(t) {
  return t ? t.slice(0, 5).replace(':', 'h') : '';
}

function duree(debut, fin) {
  const [hd, md] = debut.split(':').map(Number);
  const [hf, mf] = fin.split(':').map(Number);
  return (hf * 60 + mf) - (hd * 60 + md);
}

export default function EmploiDuTemps() {
  const [classes,     setClasses]     = useState([]);
  const [matieres,    setMatieres]    = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [classeId,    setClasseId]    = useState('');
  const [edt,         setEdt]         = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [showModal,   setShowModal]   = useState(false);
  const [editing,     setEditing]     = useState(null);
  const [form,        setForm]        = useState(emptyForm);
  const [saving,      setSaving]      = useState(false);
  const [alert,       setAlert]       = useState(null);

  useEffect(() => { loadInit(); }, []);
  useEffect(() => { if (classeId) loadEdt(classeId); else setEdt([]); }, [classeId]);

  const loadInit = async () => {
    try {
      const [resC, resU, resM] = await Promise.all([
        getClasses(),
        getUsers(),
        api.get('/emploi-du-temps/matieres'),
      ]);
      setClasses(resC.data.classes || []);
      setEnseignants((resU.data.users || []).filter(u => u.role === 'enseignant'));
      setMatieres(resM.data.matieres || []);
    } catch (e) {
      console.error('Init EDT:', e);
    }
  };

  const loadEdt = async (id) => {
    setLoading(true);
    try {
      const res = await api.get(`/emploi-du-temps/classe/${id}`);
      setEdt(res.data.emploi_du_temps || []);
    } catch { setEdt([]); }
    finally { setLoading(false); }
  };

  // Map matière → index couleur stable
  const matiereColorIdx = {};
  edt.forEach(c => {
    if (!(c.matiere_nom in matiereColorIdx))
      matiereColorIdx[c.matiere_nom] = Object.keys(matiereColorIdx).length % COULEURS.length;
  });

  // Grouper par jour
  const parJour = {};
  JOURS.forEach(j => { parJour[j] = []; });
  edt.forEach(c => { if (parJour[c.jour]) parJour[c.jour].push(c); });

  const openAdd = (jourPrefill = null) => {
    setEditing(null);
    setForm({ ...emptyForm, jour: jourPrefill || 'Lundi' });
    setShowModal(true);
  };

  const openEdit = (creneau) => {
    setEditing(creneau);
    setForm({
      matiere_id:    creneau.matiere_id,
      enseignant_id: creneau.enseignant_id || '',
      jour:          creneau.jour,
      heure_debut:   creneau.heure_debut?.slice(0, 5),
      heure_fin:     creneau.heure_fin?.slice(0, 5),
      salle:         creneau.salle || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!classeId) return;
    if (form.heure_debut >= form.heure_fin) {
      showAlert('danger', 'L\'heure de fin doit être après l\'heure de début');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/emploi-du-temps/${editing.id}`, { ...form, classe_id: classeId });
        showAlert('success', 'Créneau modifié');
      } else {
        await api.post('/emploi-du-temps', { ...form, classe_id: classeId });
        showAlert('success', 'Créneau ajouté');
      }
      setShowModal(false);
      loadEdt(classeId);
    } catch (err) {
      showAlert('danger', err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce créneau ?')) return;
    try {
      await api.delete(`/emploi-du-temps/${id}`);
      showAlert('success', 'Créneau supprimé');
      loadEdt(classeId);
    } catch {
      showAlert('danger', 'Erreur lors de la suppression');
    }
  };

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 4000);
  };

  const classeSelectionnee = classes.find(c => String(c.id) === String(classeId));

  return (
    <div>
      {alert && (
        <div className={`alert alert-${alert.type}`}>
          {alert.type === 'success' ? '✅' : '⚠️'} {alert.msg}
        </div>
      )}

      {/* En-tête */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Emploi du temps</h1>
          <p>Gérer les plannings hebdomadaires par classe</p>
        </div>
        {classeId && (
          <button className="btn btn-primary" onClick={() => openAdd()}>
            + Ajouter un créneau
          </button>
        )}
      </div>

      {/* Sélecteur de classe */}
      <div className="card" style={{ marginBottom: 24, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
            📚 Sélectionner une classe :
          </span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1 }}>
            {classes.map(c => (
              <button
                key={c.id}
                onClick={() => setClasseId(String(c.id))}
                style={{
                  padding: '7px 16px', borderRadius: 8, fontSize: 13,
                  fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600,
                  border: String(classeId) === String(c.id)
                    ? '2px solid var(--primary)'
                    : '1.5px solid var(--border)',
                  background: String(classeId) === String(c.id)
                    ? 'var(--primary)' : 'var(--bg-card)',
                  color: String(classeId) === String(c.id)
                    ? '#fff' : 'var(--text-primary)',
                  transition: 'all 0.15s',
                }}
              >
                {c.nom}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* État vide — aucune classe sélectionnée */}
      {!classeId && (
        <div className="empty-state">
          <div className="empty-state-icon">🗓️</div>
          <h3>Aucune classe sélectionnée</h3>
          <p>Choisissez une classe ci-dessus pour voir ou modifier son emploi du temps.</p>
        </div>
      )}

      {/* Chargement */}
      {classeId && loading && (
        <div className="loading-state">
          <div className="spinner" />
          <span>Chargement...</span>
        </div>
      )}

      {/* Grille EDT */}
      {classeId && !loading && (
        <>
          {/* Résumé */}
          {edt.length > 0 && (
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 20 }}>
              <div className="stat-card" style={{ padding: '14px 20px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: 6 }}>Total créneaux</div>
                <div className="stat-value" style={{ fontSize: 22 }}>{edt.length}</div>
              </div>
              <div className="stat-card" style={{ padding: '14px 20px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: 6 }}>Matières</div>
                <div className="stat-value" style={{ fontSize: 22 }}>{Object.keys(matiereColorIdx).length}</div>
              </div>
              <div className="stat-card" style={{ padding: '14px 20px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: 6 }}>Heures / semaine</div>
                <div className="stat-value" style={{ fontSize: 22 }}>
                  {Math.round(edt.reduce((acc, c) => acc + duree(c.heure_debut?.slice(0,5), c.heure_fin?.slice(0,5)), 0) / 60)}h
                </div>
              </div>
            </div>
          )}

          {/* Jours */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {JOURS.map(jour => {
              const creneaux = parJour[jour];
              return (
                <div key={jour} className="card">
                  {/* Header jour */}
                  <div className="card-header" style={{ padding: '12px 20px', background: 'var(--bg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {jour}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {creneaux.length > 0 ? `${creneaux.length} cours` : 'Aucun cours'}
                      </span>
                    </div>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => openAdd(jour)}
                      style={{ fontSize: 12 }}
                    >
                      + Ajouter
                    </button>
                  </div>

                  {/* Créneaux */}
                  <div style={{ padding: creneaux.length ? '12px 16px' : '0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {creneaux.length === 0 ? (
                      <div
                        onClick={() => openAdd(jour)}
                        style={{
                          padding: '14px 20px', textAlign: 'center',
                          color: 'var(--text-light)', fontSize: 13,
                          cursor: 'pointer', borderTop: '1px solid var(--border)',
                          transition: 'background 0.12s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        Cliquez pour ajouter un cours
                      </div>
                    ) : creneaux.map((c, i) => {
                      const cl = COULEURS[matiereColorIdx[c.matiere_nom]];
                      return (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', gap: 14,
                          padding: '12px 14px', borderRadius: 10,
                          background: cl.bg,
                          borderLeft: `4px solid ${cl.border}`,
                        }}>
                          {/* Horaire */}
                          <div style={{ minWidth: 80, textAlign: 'center' }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: cl.text, fontFamily: 'Space Mono, monospace' }}>
                              {fmt(c.heure_debut)}
                            </div>
                            <div style={{ fontSize: 10, color: cl.text, opacity: 0.5 }}>↓</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: cl.text, fontFamily: 'Space Mono, monospace' }}>
                              {fmt(c.heure_fin)}
                            </div>
                          </div>

                          <div style={{ width: 1, height: 40, background: cl.border, opacity: 0.25 }} />

                          {/* Infos */}
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: cl.text, marginBottom: 3 }}>
                              {c.matiere_nom}
                              <span style={{ fontSize: 11, fontWeight: 400, color: cl.text, opacity: 0.6, marginLeft: 8 }}>
                                {duree(c.heure_debut?.slice(0,5), c.heure_fin?.slice(0,5))}min
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                              {c.enseignant_nom && (
                                <span style={{ fontSize: 12, color: cl.text, opacity: 0.75 }}>
                                  👤 {c.enseignant_prenom} {c.enseignant_nom}
                                </span>
                              )}
                              {c.salle && (
                                <span style={{ fontSize: 12, color: cl.text, opacity: 0.75 }}>
                                  🚪 {c.salle}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              onClick={() => openEdit(c)}
                              className="btn btn-secondary btn-sm btn-icon"
                              title="Modifier"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDelete(c.id)}
                              className="btn btn-danger btn-sm btn-icon"
                              title="Supprimer"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Modal ajout / modification */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <div className="modal-title">
                {editing ? '✏️ Modifier le créneau' : '➕ Nouveau créneau'}
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">

                {/* Infos classe */}
                {classeSelectionnee && (
                  <div style={{
                    background: 'var(--bg)', borderRadius: 8,
                    padding: '10px 14px', marginBottom: 16,
                    fontSize: 13, color: 'var(--text-secondary)',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <span>🏫</span>
                    <span>Classe : <strong style={{ color: 'var(--text-primary)' }}>{classeSelectionnee.nom}</strong></span>
                  </div>
                )}

                {/* Jour */}
                <div className="form-group">
                  <label className="form-label">Jour *</label>
                  <select
                    className="form-select"
                    value={form.jour}
                    onChange={e => setForm(f => ({ ...f, jour: e.target.value }))}
                    required
                  >
                    {JOURS.map(j => <option key={j} value={j}>{j}</option>)}
                  </select>
                </div>

                {/* Horaires */}
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Heure de début *</label>
                    <input
                      type="time"
                      className="form-input"
                      value={form.heure_debut}
                      onChange={e => setForm(f => ({ ...f, heure_debut: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Heure de fin *</label>
                    <input
                      type="time"
                      className="form-input"
                      value={form.heure_fin}
                      onChange={e => setForm(f => ({ ...f, heure_fin: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {/* Durée calculée */}
                {form.heure_debut && form.heure_fin && form.heure_debut < form.heure_fin && (
                  <div style={{
                    marginTop: -8, marginBottom: 16,
                    fontSize: 12, color: 'var(--text-muted)',
                  }}>
                    ⏱ Durée : {duree(form.heure_debut, form.heure_fin)} minutes
                  </div>
                )}

                {/* Matière */}
                <div className="form-group">
                  <label className="form-label">Matière *</label>
                  <select
                    className="form-select"
                    value={form.matiere_id}
                    onChange={e => setForm(f => ({ ...f, matiere_id: e.target.value }))}
                    required
                  >
                    <option value="">— Choisir une matière</option>
                    {matieres.map(m => (
                      <option key={m.id} value={m.id}>{m.nom}</option>
                    ))}
                  </select>
                </div>

                {/* Enseignant */}
                <div className="form-group">
                  <label className="form-label">Enseignant</label>
                  <select
                    className="form-select"
                    value={form.enseignant_id}
                    onChange={e => setForm(f => ({ ...f, enseignant_id: e.target.value }))}
                  >
                    <option value="">— Non assigné</option>
                    {enseignants.map(u => (
                      <option key={u.id} value={u.id}>{u.prenom} {u.nom}</option>
                    ))}
                  </select>
                </div>

                {/* Salle */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Salle</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex : Salle 3, Labo sciences..."
                    value={form.salle}
                    onChange={e => setForm(f => ({ ...f, salle: e.target.value }))}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? '⏳...' : (editing ? '✅ Modifier' : '✅ Ajouter')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
