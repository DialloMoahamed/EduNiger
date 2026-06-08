// frontend/src/pages/TeacherEmploiDuTemps.jsx
// Vue emploi du temps pour l'enseignant connecté — LECTURE SEULE
// Affiche uniquement les créneaux où il est assigné, toutes classes confondues

import { useState, useEffect } from 'react';
import api from '../services/api';

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

const COULEURS = [
  { bg: 'rgba(10,92,54,0.08)',   border: '#0A5C36', text: '#073D24' },
  { bg: 'rgba(49,130,206,0.1)',  border: '#3182CE', text: '#1A4A7A' },
  { bg: 'rgba(214,158,46,0.1)',  border: '#D69E2E', text: '#975A16' },
  { bg: 'rgba(229,62,62,0.1)',   border: '#E53E3E', text: '#9B2335' },
  { bg: 'rgba(128,90,213,0.1)',  border: '#805AD5', text: '#553C9A' },
  { bg: 'rgba(245,166,35,0.1)',  border: '#F5A623', text: '#7B4F00' },
  { bg: 'rgba(49,151,149,0.1)',  border: '#319795', text: '#1D4044' },
  { bg: 'rgba(213,63,140,0.1)',  border: '#D53F8C', text: '#97266D' },
];

function fmt(t) {
  return t ? t.slice(0, 5).replace(':', 'h') : '';
}

function duree(debut, fin) {
  const [hd, md] = (debut || '00:00').split(':').map(Number);
  const [hf, mf] = (fin   || '00:00').split(':').map(Number);
  return (hf * 60 + mf) - (hd * 60 + md);
}

export default function TeacherEmploiDuTemps() {
  const [edt,      setEdt]      = useState([]);
  const [classes,  setClasses]  = useState([]);
  const [filtreClasse, setFiltreClasse] = useState('toutes');
  const [loading,  setLoading]  = useState(true);
  const [alert,    setAlert]    = useState(null);

  useEffect(() => {
    api.get('/emploi-du-temps/enseignant/mes-classes')
      .then(res => {
        setEdt(res.data.emploi_du_temps || []);
        setClasses(res.data.classes || []);
      })
      .catch(() => showAlert('danger', 'Impossible de charger l\'emploi du temps.'))
      .finally(() => setLoading(false));
  }, []);

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 4000);
  };

  // Filtrer
  const edtFiltre = filtreClasse === 'toutes'
    ? edt
    : edt.filter(e => String(e.classe_id) === filtreClasse);

  // Map matière → index couleur stable (basé sur le jeu filtré)
  const matiereColorIdx = {};
  edtFiltre.forEach(c => {
    if (!(c.matiere_nom in matiereColorIdx))
      matiereColorIdx[c.matiere_nom] = Object.keys(matiereColorIdx).length % COULEURS.length;
  });

  // Grouper par jour
  const parJour = {};
  JOURS.forEach(j => { parJour[j] = []; });
  edtFiltre.forEach(c => { if (parJour[c.jour]) parJour[c.jour].push(c); });

  // Stats
  const totalHeures = Math.round(
    edtFiltre.reduce((acc, c) => acc + duree(c.heure_debut?.slice(0,5), c.heure_fin?.slice(0,5)), 0) / 60
  );

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
          <h1>Mon emploi du temps</h1>
          <p>Planning hebdomadaire de vos classes — consultation uniquement</p>
        </div>
      </div>

      {/* Filtre par classe */}
      {classes.length > 1 && (
        <div className="card" style={{ marginBottom: 24, padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              🏫 Filtrer par classe :
            </span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={() => setFiltreClasse('toutes')}
                style={{
                  padding: '6px 14px', borderRadius: 8, fontSize: 13,
                  fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600,
                  border: filtreClasse === 'toutes' ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                  background: filtreClasse === 'toutes' ? 'var(--primary)' : 'var(--bg-card)',
                  color: filtreClasse === 'toutes' ? '#fff' : 'var(--text-primary)',
                  transition: 'all 0.15s',
                }}
              >
                Toutes
              </button>
              {classes.map(c => (
                <button
                  key={c.id}
                  onClick={() => setFiltreClasse(String(c.id))}
                  style={{
                    padding: '6px 14px', borderRadius: 8, fontSize: 13,
                    fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600,
                    border: filtreClasse === String(c.id) ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                    background: filtreClasse === String(c.id) ? 'var(--primary)' : 'var(--bg-card)',
                    color: filtreClasse === String(c.id) ? '#fff' : 'var(--text-primary)',
                    transition: 'all 0.15s',
                  }}
                >
                  {c.nom}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-state">
          <div className="spinner" />
          <span>Chargement...</span>
        </div>
      )}

      {!loading && edtFiltre.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🗓️</div>
          <h3>Aucun créneau trouvé</h3>
          <p>Vous n'avez pas encore de cours planifiés{filtreClasse !== 'toutes' ? ' pour cette classe' : ''}.</p>
        </div>
      )}

      {!loading && edtFiltre.length > 0 && (
        <>
          {/* Résumé */}
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 20 }}>
            <div className="stat-card" style={{ padding: '14px 20px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: 6 }}>Total créneaux</div>
              <div className="stat-value" style={{ fontSize: 22 }}>{edtFiltre.length}</div>
            </div>
            <div className="stat-card" style={{ padding: '14px 20px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: 6 }}>Classes</div>
              <div className="stat-value" style={{ fontSize: 22 }}>
                {filtreClasse === 'toutes' ? classes.length : 1}
              </div>
            </div>
            <div className="stat-card" style={{ padding: '14px 20px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: 6 }}>Heures / semaine</div>
              <div className="stat-value" style={{ fontSize: 22 }}>{totalHeures}h</div>
            </div>
          </div>

          {/* Grille par jour */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {JOURS.map(jour => {
              const creneaux = parJour[jour];
              if (creneaux.length === 0) return null;
              return (
                <div key={jour} className="card">
                  {/* Header jour */}
                  <div className="card-header" style={{ padding: '12px 20px', background: 'var(--bg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {jour}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {creneaux.length} cours
                      </span>
                    </div>
                    {/* Pas de bouton "Ajouter" — lecture seule */}
                    <span style={{
                      fontSize: 11, color: 'var(--text-muted)',
                      background: 'var(--bg)', border: '1px solid var(--border)',
                      borderRadius: 6, padding: '3px 8px',
                    }}>
                      🔒 lecture seule
                    </span>
                  </div>

                  {/* Créneaux */}
                  <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {creneaux
                      .sort((a, b) => (a.heure_debut || '').localeCompare(b.heure_debut || ''))
                      .map((c, i) => {
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
                                <span style={{ fontSize: 12, color: cl.text, opacity: 0.75 }}>
                                  🏫 {c.classe_nom}
                                </span>
                                {c.salle && (
                                  <span style={{ fontSize: 12, color: cl.text, opacity: 0.75 }}>
                                    🚪 {c.salle}
                                  </span>
                                )}
                              </div>
                            </div>
                            {/* Aucun bouton d'action */}
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
    </div>
  );
}
