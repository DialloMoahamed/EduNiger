import { useState, useEffect } from 'react';
import ParentLayout, { parentApi, useParentAuth } from './ParentLayout';

const PERIODES = ['Trimestre 1', 'Trimestre 2', 'Trimestre 3'];

// Couleurs selon la moyenne /20
function moy2color(m) {
  m = parseFloat(m);
  if (m >= 16) return '#1a7a4a';
  if (m >= 14) return '#2563eb';
  if (m >= 12) return '#b7770d';
  if (m >= 10) return '#7c3aed';
  return '#c0392b';
}
function mention(m) {
  m = parseFloat(m);
  if (m >= 16) return 'Très Bien';
  if (m >= 14) return 'Bien';
  if (m >= 12) return 'Assez Bien';
  if (m >= 10) return 'Passable';
  return 'Insuffisant';
}

// ── Étiquettes différenciées par type d'évaluation ──────────
const TYPE_CONFIG = {
  interrogation: {
    label: 'Interrogation',
    short: 'Interro',
    bg: '#eff6ff',
    color: '#1d4ed8',
    border: '#bfdbfe',
    icon: '❓',
  },
  devoir: {
    label: 'Devoir',
    short: 'Devoir',
    bg: '#f0fdf4',
    color: '#15803d',
    border: '#bbf7d0',
    icon: '📝',
  },
  composition: {
    label: 'Composition',
    short: 'Compo',
    bg: '#fff7ed',
    color: '#c2410c',
    border: '#fed7aa',
    icon: '📋',
  },
};

// Étiquette colorée selon le type
function TypeBadge({ type }) {
  const cfg = TYPE_CONFIG[type] || {
    label: type, short: type, bg: '#f1f5f9', color: '#475569',
    border: '#cbd5e1', icon: '📄',
  };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 10px', borderRadius: 20,
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.border}`,
      fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
    }}>
      <span aria-hidden="true">{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

export default function ParentNotes() {
  const { enfants }     = useParentAuth();
  const enfantActif     = JSON.parse(localStorage.getItem('parent_enfant_actif') || 'null') || enfants[0];
  const [periode, setPeriode] = useState('Trimestre 1');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedMatiere, setExpandedMatiere] = useState(null);

  useEffect(() => {
    if (!enfantActif) return;
    setLoading(true);
    parentApi(`/parent/notes?eleve_id=${enfantActif.id}&periode=${encodeURIComponent(periode)}`)
      .then(d => { if (d.success) setData(d); })
      .finally(() => setLoading(false));
  }, [enfantActif?.id, periode]);

  // Grouper les notes brutes par matière pour afficher le détail
  const notesByMatiere = {};
  if (data?.notes) {
    data.notes.forEach(n => {
      if (!notesByMatiere[n.matiere]) notesByMatiere[n.matiere] = [];
      notesByMatiere[n.matiere].push(n);
    });
  }

  return (
    <ParentLayout>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
          Notes & Résultats
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {enfantActif ? `${enfantActif.prenom} ${enfantActif.nom} — ${enfantActif.classe_nom}` : ''}
        </p>
      </div>

      {/* Légende des types */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {Object.values(TYPE_CONFIG).map(cfg => (
          <span key={cfg.label} style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 10px', borderRadius: 20,
            background: cfg.bg, color: cfg.color,
            border: `1px solid ${cfg.border}`,
            fontSize: 11, fontWeight: 600,
          }}>
            <span aria-hidden="true">{cfg.icon}</span> {cfg.label}
          </span>
        ))}
      </div>

      {/* Sélecteur période */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {PERIODES.map(p => (
          <button key={p} onClick={() => { setPeriode(p); setExpandedMatiere(null); }}
            style={{
              padding: '8px 20px', borderRadius: 8,
              border: `.5px solid ${periode === p ? '#0A5C36' : 'var(--border)'}`,
              background: periode === p ? '#0A5C36' : 'var(--bg-card)',
              color: periode === p ? '#fff' : 'var(--text-primary)',
              fontSize: 13, cursor: 'pointer', fontWeight: periode === p ? 600 : 400,
            }}>
            {p}
          </button>
        ))}
      </div>

      {/* Moyenne générale */}
      {data?.moyenne_generale && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 14, padding: '18px 24px', marginBottom: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
              MOYENNE GÉNÉRALE — {periode.toUpperCase()}
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: moy2color(data.moyenne_generale) }}>
              {data.moyenne_generale}
              <span style={{ fontSize: 16, color: 'var(--text-muted)' }}>/20</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: moy2color(data.moyenne_generale) }}>
              {mention(data.moyenne_generale)}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Mention</div>
          </div>
        </div>
      )}

      {/* Tableau par matière avec détail */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
          Chargement...
        </div>
      ) : data?.matieres?.length > 0 ? (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 14, overflow: 'hidden',
        }}>
          {/* Header tableau */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 70px 120px 32px',
            background: 'var(--bg)', padding: '11px 20px',
            fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
          }}>
            <span>MATIÈRE</span>
            <span style={{ textAlign: 'center' }}>COEF</span>
            <span style={{ textAlign: 'center' }}>MOYENNE</span>
            <span />
          </div>

          {data.matieres.map((m, i) => {
            const isOpen = expandedMatiere === m.matiere;
            const detailNotes = notesByMatiere[m.matiere] || [];
            return (
              <div key={i} style={{ borderTop: '1px solid var(--border)' }}>
                {/* Ligne matière */}
                <div
                  style={{
                    display: 'grid', gridTemplateColumns: '1fr 70px 120px 32px',
                    padding: '14px 20px', alignItems: 'center',
                    cursor: detailNotes.length > 0 ? 'pointer' : 'default',
                    transition: 'background .15s',
                  }}
                  onClick={() => detailNotes.length > 0 && setExpandedMatiere(isOpen ? null : m.matiere)}
                  onMouseEnter={e => { if (detailNotes.length > 0) e.currentTarget.style.background = 'var(--bg)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                      {m.matiere}
                    </div>
                    {detailNotes.length > 0 && (
                      <div style={{ marginTop: 5, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        {/* Comptage par type */}
                        {Object.entries(
                          detailNotes.reduce((acc, n) => {
                            acc[n.type_evaluation] = (acc[n.type_evaluation] || 0) + 1;
                            return acc;
                          }, {})
                        ).map(([type, count]) => {
                          const cfg = TYPE_CONFIG[type] || {};
                          return (
                            <span key={type} style={{
                              display: 'inline-flex', alignItems: 'center', gap: 3,
                              padding: '1px 7px', borderRadius: 12,
                              background: cfg.bg || '#f1f5f9',
                              color: cfg.color || '#475569',
                              border: `1px solid ${cfg.border || '#cbd5e1'}`,
                              fontSize: 10, fontWeight: 600,
                            }}>
                              {cfg.icon} {count} {cfg.short || type}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>
                    {m.coefficient}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: moy2color(m.moyenne) }}>
                      {m.moyenne}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>/20</span>
                    <div style={{ fontSize: 11, color: moy2color(m.moyenne) }}>{mention(m.moyenne)}</div>
                  </div>
                  <div style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-muted)' }}>
                    {detailNotes.length > 0 ? (isOpen ? '▲' : '▼') : ''}
                  </div>
                </div>

                {/* Détail notes de la matière */}
                {isOpen && detailNotes.length > 0 && (
                  <div style={{
                    background: 'var(--bg)', borderTop: '1px solid var(--border)',
                    padding: '12px 20px 16px',
                  }}>
                    <div style={{
                      fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)',
                      textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10,
                    }}>
                      Détail des évaluations — {m.matiere}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {detailNotes.map((n, ni) => {
                        const noteSur20 = ((n.note / n.note_sur) * 20).toFixed(2);
                        return (
                          <div key={ni} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '10px 14px', borderRadius: 10,
                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <TypeBadge type={n.type_evaluation} />
                              {n.date_evaluation && (
                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                  {new Date(n.date_evaluation).toLocaleDateString('fr-FR', {
                                    day: '2-digit', month: 'short', year: 'numeric',
                                  })}
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                              <span style={{
                                fontSize: 18, fontWeight: 700,
                                color: moy2color(noteSur20),
                              }}>
                                {n.note}
                              </span>
                              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                /{n.note_sur}
                              </span>
                              {n.note_sur !== 20 && (
                                <span style={{
                                  fontSize: 11, color: 'var(--text-muted)',
                                  marginLeft: 4,
                                }}>
                                  (≈ {noteSur20}/20)
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-muted)', fontSize: 14 }}>
          <span aria-hidden="true" style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>📄</span>
          Aucune note disponible pour {periode}
        </div>
      )}
    </ParentLayout>
  );
}
