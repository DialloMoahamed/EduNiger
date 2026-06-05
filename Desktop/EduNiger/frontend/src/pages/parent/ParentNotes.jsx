import { useState, useEffect } from 'react';
import ParentLayout, { parentApi, useParentAuth } from './ParentLayout';

const PERIODES = ['Trimestre 1', 'Trimestre 2', 'Trimestre 3'];

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

export default function ParentNotes() {
  const { enfants }     = useParentAuth();
  const enfantActif     = JSON.parse(localStorage.getItem('parent_enfant_actif') || 'null') || enfants[0];
  const [periode, setPeriode] = useState('Trimestre 1');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enfantActif) return;
    setLoading(true);
    parentApi(`/parent/notes?eleve_id=${enfantActif.id}&periode=${encodeURIComponent(periode)}`)
      .then(d => { if (d.success) setData(d); })
      .finally(() => setLoading(false));
  }, [enfantActif?.id, periode]);

  return (
    <ParentLayout>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Notes & Résultats</h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {enfantActif ? `${enfantActif.prenom} ${enfantActif.nom} — ${enfantActif.classe_nom}` : ''}
        </p>
      </div>

      {/* Sélecteur période */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {PERIODES.map(p => (
          <button key={p} onClick={() => setPeriode(p)}
            style={{ padding: '8px 20px', borderRadius: 8,
              border: `.5px solid ${periode === p ? '#0A5C36' : 'var(--border)'}`,
              background: periode === p ? '#0A5C36' : 'var(--bg-card)',
              color: periode === p ? '#fff' : 'var(--text-primary)',
              fontSize: 13, cursor: 'pointer', fontWeight: periode === p ? 600 : 400 }}>
            {p}
          </button>
        ))}
      </div>

      {/* Moyenne générale */}
      {data?.moyenne_generale && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 14, padding: '18px 24px', marginBottom: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>MOYENNE GÉNÉRALE — {periode.toUpperCase()}</div>
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

      {/* Tableau par matière */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>Chargement...</div>
      ) : data?.matieres?.length > 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 120px', background: 'var(--bg)',
            padding: '11px 20px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
            <span>MATIÈRE</span><span style={{ textAlign: 'center' }}>COEF</span><span style={{ textAlign: 'center' }}>MOYENNE</span>
          </div>
          {data.matieres.map((m, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 70px 120px',
              padding: '14px 20px', borderTop: '1px solid var(--border)', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{m.matiere}</div>
              </div>
              <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>{m.coefficient}</div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: moy2color(m.moyenne) }}>{m.moyenne}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>/20</span>
                <div style={{ fontSize: 11, color: moy2color(m.moyenne) }}>{mention(m.moyenne)}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-muted)', fontSize: 14 }}>
          <span aria-hidden="true">📄</span>
          Aucune note disponible pour {periode}
        </div>
      )}
    </ParentLayout>
  );
}