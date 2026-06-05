import { useState, useEffect } from 'react';
import ParentLayout, { parentApi, useParentAuth } from './ParentLayout';

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

// Couleurs par matière (rotation)
const COULEURS = [
  { bg: '#e8f5ee', border: '#0A5C36', text: '#073D24' },
  { bg: '#EBF8FF', border: '#3182CE', text: '#1A4A7A' },
  { bg: '#FFFFF0', border: '#D69E2E', text: '#975A16' },
  { bg: '#FFF5F5', border: '#E53E3E', text: '#9B2335' },
  { bg: '#FAF5FF', border: '#805AD5', text: '#553C9A' },
  { bg: '#FFFBEB', border: '#F5A623', text: '#7B4F00' },
  { bg: '#E6FFFA', border: '#319795', text: '#1D4044' },
  { bg: '#FFF0F6', border: '#D53F8C', text: '#97266D' },
];

function fmt(time) {
  // time peut être "08:00:00" → "08h00"
  if (!time) return '';
  return time.slice(0, 5).replace(':', 'h');
}

export default function ParentEmploiDuTemps() {
  const { enfants }   = useParentAuth();
  const enfantActif   = JSON.parse(localStorage.getItem('parent_enfant_actif') || 'null') || enfants[0];
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur]   = useState('');

  useEffect(() => {
    if (!enfantActif) { setLoading(false); return; }
    setLoading(true);
    setErreur('');
    parentApi(`/emploi-du-temps/parent?eleve_id=${enfantActif.id}`)
      .then(d => {
        if (d.success) setData(d.emploi_du_temps || []);
        else setErreur(d.message || 'Erreur de chargement');
      })
      .catch(() => setErreur('Impossible de charger l\'emploi du temps'))
      .finally(() => setLoading(false));
  }, [enfantActif?.id]);

  // Construire une map matière → couleur stable
  const matiereIndex = {};
  data.forEach(c => {
    if (!(c.matiere_nom in matiereIndex)) {
      matiereIndex[c.matiere_nom] = Object.keys(matiereIndex).length % COULEURS.length;
    }
  });

  // Grouper par jour
  const parJour = {};
  JOURS.forEach(j => { parJour[j] = []; });
  data.forEach(c => { if (parJour[c.jour]) parJour[c.jour].push(c); });

  // Jour actuel (pour le mettre en avant)
  const joursMap = { 1: 'Lundi', 2: 'Mardi', 3: 'Mercredi', 4: 'Jeudi', 5: 'Vendredi', 6: 'Samedi' };
  const jourAujourdhui = joursMap[new Date().getDay()] || null;

  const joursActifs = JOURS.filter(j => parJour[j].length > 0);

  return (
    <ParentLayout>
      {/* En-tête */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Emploi du temps</h1>
          <p>
            {enfantActif
              ? `${enfantActif.prenom} ${enfantActif.nom} — ${enfantActif.classe_nom}`
              : 'Aucun élève sélectionné'}
          </p>
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="spinner" />
          <span>Chargement...</span>
        </div>
      )}

      {!loading && erreur && (
        <div className="alert alert-danger">{erreur}</div>
      )}

      {!loading && !erreur && data.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <h3>Emploi du temps non disponible</h3>
          <p>L'administration n'a pas encore saisi l'emploi du temps pour cette classe.</p>
        </div>
      )}

      {!loading && !erreur && data.length > 0 && (
        <>
          {/* Légende matières */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            {Object.entries(matiereIndex).map(([nom, idx]) => {
              const c = COULEURS[idx];
              return (
                <span key={nom} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '4px 12px', borderRadius: 20,
                  background: c.bg, border: `1.5px solid ${c.border}`,
                  fontSize: 12, fontWeight: 600, color: c.text,
                }}>
                  {nom}
                </span>
              );
            })}
          </div>

          {/* Grille par jour */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {joursActifs.map(jour => {
              const isToday = jour === jourAujourdhui;
              const creneaux = parJour[jour];

              return (
                <div key={jour} className="card" style={{
                  border: isToday ? '2px solid var(--primary)' : '1px solid var(--border)',
                }}>
                  {/* Titre jour */}
                  <div className="card-header" style={{
                    background: isToday ? 'var(--primary)' : 'var(--bg)',
                    padding: '12px 20px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        fontSize: 15, fontWeight: 700,
                        color: isToday ? '#fff' : 'var(--text-primary)',
                      }}>
                        {jour}
                      </span>
                      {isToday && (
                        <span style={{
                          background: 'rgba(255,255,255,0.25)',
                          color: '#fff', fontSize: 11, fontWeight: 600,
                          padding: '2px 10px', borderRadius: 20,
                        }}>
                          Aujourd'hui
                        </span>
                      )}
                      <span style={{
                        marginLeft: 'auto', fontSize: 12,
                        color: isToday ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)',
                      }}>
                        {creneaux.length} cours
                      </span>
                    </div>
                  </div>

                  {/* Créneaux */}
                  <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {creneaux.map((c, i) => {
                      const couleur = COULEURS[matiereIndex[c.matiere_nom]];
                      return (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', gap: 14,
                          padding: '12px 16px', borderRadius: 10,
                          background: couleur.bg,
                          borderLeft: `4px solid ${couleur.border}`,
                        }}>
                          {/* Horaire */}
                          <div style={{ minWidth: 90, textAlign: 'center' }}>
                            <div style={{
                              fontSize: 14, fontWeight: 700,
                              color: couleur.text, fontFamily: 'Space Mono, monospace',
                            }}>
                              {fmt(c.heure_debut)}
                            </div>
                            <div style={{ fontSize: 11, color: couleur.text, opacity: 0.7 }}>↓</div>
                            <div style={{
                              fontSize: 14, fontWeight: 700,
                              color: couleur.text, fontFamily: 'Space Mono, monospace',
                            }}>
                              {fmt(c.heure_fin)}
                            </div>
                          </div>

                          {/* Séparateur */}
                          <div style={{
                            width: 1, height: 48, background: couleur.border, opacity: 0.3,
                          }} />

                          {/* Infos cours */}
                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontSize: 15, fontWeight: 700, color: couleur.text, marginBottom: 3,
                            }}>
                              {c.matiere_nom}
                            </div>
                            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                              {c.enseignant_nom && (
                                <span style={{ fontSize: 12, color: couleur.text, opacity: 0.8 }}>
                                  👤 {c.enseignant_prenom} {c.enseignant_nom}
                                </span>
                              )}
                              {c.salle && (
                                <span style={{ fontSize: 12, color: couleur.text, opacity: 0.8 }}>
                                  🚪 {c.salle}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Durée */}
                          <div style={{ textAlign: 'right', minWidth: 50 }}>
                            {(() => {
                              const [hd, md] = c.heure_debut.split(':').map(Number);
                              const [hf, mf] = c.heure_fin.split(':').map(Number);
                              const duree = (hf * 60 + mf) - (hd * 60 + md);
                              return (
                                <span style={{
                                  fontSize: 12, fontWeight: 600,
                                  color: couleur.text, opacity: 0.7,
                                }}>
                                  {duree}min
                                </span>
                              );
                            })()}
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
    </ParentLayout>
  );
}
