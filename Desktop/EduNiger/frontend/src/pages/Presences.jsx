import { useState, useEffect } from 'react';
import { getClasses, getEleves, markPresences, getPresences } from '../services/api';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const STATUTS = [
  { value: 'present',         label: 'Présent',       color: 'success' },
  { value: 'absent',          label: 'Absent',         color: 'danger' },
  { value: 'retard',          label: 'Retard',         color: 'warning' },
  { value: 'absent_justifie', label: 'Abs. Justifié', color: 'info' },
];

// Créneaux horaires prédéfinis (modifiables)
const CRENEAUX = [
  '07h00 - 08h00',
  '08h00 - 09h00',
  '09h00 - 10h00',
  '10h00 - 11h00',
  '11h00 - 12h00',
  '13h00 - 14h00',
  '14h00 - 15h00',
  '15h00 - 16h00',
  '16h00 - 17h00',
];

// Ouvre un PDF depuis une URL protégée par token
async function openPDF(url) {
  const token = localStorage.getItem('token');
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Erreur serveur');
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl; a.target = '_blank'; a.rel = 'noopener noreferrer';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}

export default function Presences() {
  const [classes, setClasses] = useState([]);
  const [eleves, setEleves] = useState([]);
  const [selectedClasse, setSelectedClasse] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [matiere, setMatiere] = useState('');
  const [creneau, setCreneau] = useState(CRENEAUX[0]);
  const [presences, setPresences] = useState({});
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState('');
  const [saved, setSaved] = useState(false);
  const [alert, setAlert] = useState(null);
  const [matieres, setMatieres] = useState([]);
  const [historiqueJour, setHistoriqueJour] = useState([]);
  const { isAdmin, user } = useAuth();

  useEffect(() => { loadClasses(); loadMatieres(); }, []);
  useEffect(() => {
    if (selectedClasse) { loadEleves(); loadPresences(); loadHistoriqueJour(); }
  }, [selectedClasse, date]);

  const loadMatieres = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/matieres`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      if (d.success) setMatieres(d.matieres || []);
    } catch {}
  };

  const loadClasses = async () => {
    try {
      const res = await getClasses();
      const all = res.data.classes;
      if (isAdmin()) {
        setClasses(all);
      } else {
        const mesClasses = all.filter(c => c.enseignant_id === user?.id);
        setClasses(mesClasses);
        if (mesClasses.length === 1) setSelectedClasse(String(mesClasses[0].id));
      }
    } catch {}
  };

  const loadEleves = async () => {
    try {
      const res = await getEleves({ classe_id: selectedClasse });
      setEleves(res.data.eleves);
      const init = {};
      res.data.eleves.forEach(e => { init[e.id] = 'present'; });
      setPresences(init);
      setSaved(false);
    } catch {}
  };

  const loadPresences = async () => {
    try {
      const res = await getPresences({ classe_id: selectedClasse, date });
      if (res.data.presences.length > 0) {
        const existing = {};
        res.data.presences.forEach(p => { existing[p.eleve_id] = p.statut; });
        setPresences(prev => ({ ...prev, ...existing }));
        setSaved(true);
      }
    } catch {}
  };

  // Charger l'historique de toutes les présences enregistrées ce jour pour cette classe
  const loadHistoriqueJour = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${API_URL}/presences/historique?classe_id=${selectedClasse}&date=${date}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const d = await res.json();
      if (d.success) setHistoriqueJour(d.historique || []);
    } catch {}
  };

  const setStatut = (eleveId, statut) => {
    setPresences(prev => ({ ...prev, [eleveId]: statut }));
    setSaved(false);
  };

  const marquerTous = (statut) => {
    const newP = {};
    eleves.forEach(e => { newP[e.id] = statut; });
    setPresences(newP);
    setSaved(false);
  };

  const handleDownloadListe = async () => {
    setPdfLoading('liste');
    try {
      await openPDF(`${API_URL}/presences/classe/${selectedClasse}/liste-pdf`);
    } catch {
      setAlert({ type: 'danger', msg: 'Erreur lors du téléchargement de la liste' });
    } finally { setPdfLoading(''); }
  };

  const handleDownloadAppel = async () => {
    setPdfLoading('appel');
    try {
      await openPDF(`${API_URL}/presences/classe/${selectedClasse}/appel-pdf/${date}`);
    } catch {
      setAlert({ type: 'danger', msg: 'Erreur lors du téléchargement de la feuille d\'appel' });
    } finally { setPdfLoading(''); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!matiere) {
      setAlert({ type: 'danger', msg: 'Veuillez sélectionner une matière avant d\'enregistrer.' });
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        classe_id: selectedClasse,
        date,
        matiere_id: matiere,
        creneau_horaire: creneau,
        presences: Object.entries(presences).map(([eleve_id, statut]) => ({
          eleve_id: parseInt(eleve_id),
          statut,
        })),
      };
      const res = await fetch(`${API_URL}/presences/multi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.message);
      setSaved(true);
      await loadHistoriqueJour();
      const matNom = matieres.find(m => String(m.id) === String(matiere))?.nom || '';
      setAlert({
        type: 'success',
        msg: `✅ Présences de ${matNom} (${creneau}) du ${new Date(date).toLocaleDateString('fr-FR')} enregistrées !`,
      });
      setTimeout(() => setAlert(null), 4000);
    } catch (err) {
      setAlert({ type: 'danger', msg: err.message || 'Erreur lors de l\'enregistrement' });
    } finally { setLoading(false); }
  };

  const stats = {
    presents: Object.values(presences).filter(s => s === 'present').length,
    absents: Object.values(presences).filter(s => s === 'absent').length,
    retards: Object.values(presences).filter(s => s === 'retard').length,
    justifies: Object.values(presences).filter(s => s === 'absent_justifie').length,
  };

  // Grouper l'historique par matière/créneau
  const historiqueGrouped = {};
  historiqueJour.forEach(h => {
    const key = `${h.matiere_nom || 'Sans matière'} — ${h.creneau_horaire || ''}`;
    if (!historiqueGrouped[key]) historiqueGrouped[key] = [];
    historiqueGrouped[key].push(h);
  });

  return (
    <div>
      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

      <div className="page-header">
        <div className="page-header-left">
          <h1>Présences</h1>
          <p>Enregistrez les présences par matière et par créneau horaire</p>
        </div>
        {selectedClasse && eleves.length > 0 && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-secondary"
              onClick={handleDownloadListe}
              disabled={pdfLoading === 'liste'}
              title="Télécharger la liste des élèves"
            >
              {pdfLoading === 'liste' ? '⏳ Génération...' : '📄 Liste de classe'}
            </button>
            <button
              className="btn btn-primary"
              onClick={handleDownloadAppel}
              disabled={pdfLoading === 'appel'}
              style={{ opacity: saved ? 1 : 0.7 }}
            >
              {pdfLoading === 'appel' ? '⏳ Génération...' : '📥 Feuille d\'appel'}
            </button>
          </div>
        )}
      </div>

      {/* Filtres */}
      <div className="card mb-3">
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Classe</label>
              <select
                className="form-select"
                value={selectedClasse}
                onChange={(e) => setSelectedClasse(e.target.value)}
              >
                <option value="">Sélectionner une classe...</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.nom} — {c.niveau}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Date</label>
              <input
                type="date" className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Matière <span style={{ color: '#c0392b' }}>*</span></label>
              <select
                className="form-select"
                value={matiere}
                onChange={(e) => setMatiere(e.target.value)}
              >
                <option value="">Sélectionner une matière...</option>
                {matieres.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Créneau horaire</label>
              <select
                className="form-select"
                value={creneau}
                onChange={(e) => setCreneau(e.target.value)}
              >
                {CRENEAUX.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Historique du jour (présences déjà enregistrées) */}
      {selectedClasse && Object.keys(historiqueGrouped).length > 0 && (
        <div className="card mb-3">
          <div className="card-header">
            <div className="card-title">📋 Appels déjà enregistrés ce jour</div>
            <span className="badge badge-info">{Object.keys(historiqueGrouped).length} cours</span>
          </div>
          <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(historiqueGrouped).map(([key, entries]) => {
              const absents = entries.filter(e => e.statut !== 'present');
              return (
                <div key={key} style={{
                  background: 'var(--bg)', borderRadius: 10, padding: '12px 16px',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>
                      🕐 {key}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span className="badge badge-success">{entries.filter(e => e.statut === 'present').length} présents</span>
                      {absents.length > 0 && (
                        <span className="badge badge-danger">{absents.length} absent(s)</span>
                      )}
                    </div>
                  </div>
                  {absents.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {absents.map((e, i) => (
                        <span key={i} style={{
                          padding: '2px 10px', borderRadius: 12,
                          background: e.statut === 'absent' ? '#fdecea'
                            : e.statut === 'retard' ? '#fff8e1' : '#e3f0fd',
                          color: e.statut === 'absent' ? '#c0392b'
                            : e.statut === 'retard' ? '#b7770d' : '#1565c0',
                          fontSize: 12, fontWeight: 600,
                        }}>
                          {e.eleve_prenom} {e.eleve_nom} — {e.statut === 'absent' ? 'Absent' : e.statut === 'retard' ? 'Retard' : 'Abs. Justifié'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedClasse && eleves.length > 0 && (
        <>
          {/* Mini stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
            {[
              { label: 'Présents', value: stats.presents, color: 'var(--success)' },
              { label: 'Absents', value: stats.absents, color: 'var(--danger)' },
              { label: 'Retards', value: stats.retards, color: 'var(--warning)' },
              { label: 'Abs. Justifiés', value: stats.justifies, color: 'var(--info)' },
            ].map(s => (
              <div key={s.label} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: '10px', padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: '12px',
              }}>
                <div style={{ width: '8px', height: '36px', borderRadius: '4px', background: s.color, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'Space Mono', color: s.color }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">
                  Feuille d'appel — {classes.find(c => c.id == selectedClasse)?.nom}
                  {matiere && (
                    <span className="badge badge-info" style={{ marginLeft: 10 }}>
                      {matieres.find(m => String(m.id) === String(matiere))?.nom}
                    </span>
                  )}
                  {creneau && (
                    <span className="badge badge-neutral" style={{ marginLeft: 6 }}>
                      🕐 {creneau}
                    </span>
                  )}
                </div>
                <div className="card-subtitle">
                  {new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" className="btn btn-success btn-sm" onClick={() => marquerTous('present')}>
                  ✓ Tous présents
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => marquerTous('absent')}>
                  ✗ Tous absents
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              {!matiere && (
                <div style={{
                  padding: '10px 20px', background: '#fff8e1',
                  borderBottom: '1px solid #fde68a',
                  color: '#92400e', fontSize: 13,
                }}>
                  ⚠️ Sélectionnez une matière et un créneau horaire avant d'enregistrer.
                </div>
              )}
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Matricule</th>
                      <th>Nom & Prénom</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eleves.map((eleve, idx) => (
                      <tr key={eleve.id} style={{
                        background: presences[eleve.id] === 'absent' ? 'rgba(229,62,62,0.02)' : '',
                      }}>
                        <td style={{ color: 'var(--text-muted)', width: '40px' }}>{idx + 1}</td>
                        <td>
                          <span className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>
                            {eleve.matricule}
                          </span>
                        </td>
                        <td><strong>{eleve.nom}</strong> {eleve.prenom}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {STATUTS.map(s => (
                              <button
                                key={s.value}
                                type="button"
                                className={`presence-status-btn ${s.value} ${presences[eleve.id] === s.value ? 'selected' : ''}`}
                                onClick={() => setStatut(eleve.id, s.value)}
                              >
                                {s.label}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{
                padding: '16px 24px', borderTop: '1px solid var(--border)',
                display: 'flex', gap: '10px', alignItems: 'center',
              }}>
                <button type="submit" className="btn btn-primary" disabled={loading || !matiere}>
                  {loading ? '⏳ Enregistrement...' : '💾 Enregistrer les présences'}
                </button>
                {saved && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleDownloadAppel}
                    disabled={pdfLoading === 'appel'}
                  >
                    {pdfLoading === 'appel' ? '⏳ Génération...' : '📥 Télécharger avec statuts'}
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleDownloadListe}
                  disabled={pdfLoading === 'liste'}
                  style={{ marginLeft: 'auto' }}
                >
                  {pdfLoading === 'liste' ? '⏳...' : '📄 Liste vierge'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {selectedClasse && eleves.length === 0 && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">👨‍🎓</div>
            <h3>Aucun élève dans cette classe</h3>
            <p>Assignez des élèves à cette classe pour faire l'appel</p>
          </div>
        </div>
      )}

      {!selectedClasse && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>Sélectionnez une classe</h3>
            <p>Choisissez une classe et une date pour commencer l'appel</p>
          </div>
        </div>
      )}
    </div>
  );
}
