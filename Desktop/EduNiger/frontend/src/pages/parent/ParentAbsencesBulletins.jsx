import { useState, useEffect } from 'react';
import ParentLayout, { parentApi, useParentAuth } from './ParentLayout';

const STATUT = {
  present:         { label: 'Présent',      bg: '#e8f5ee', color: '#1a7a4a' },
  absent:          { label: 'Absent',       bg: '#fdecea', color: '#c0392b' },
  retard:          { label: 'Retard',       bg: '#fff8e1', color: '#b7770d' },
  absent_justifie: { label: 'Abs. Justif.', bg: '#e3f0fd', color: '#1565c0' },
};

export function ParentAbsences() {
  const { enfants } = useParentAuth();
  const enfantActif = JSON.parse(localStorage.getItem('parent_enfant_actif') || 'null') || enfants[0];
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!enfantActif) return;
    parentApi(`/parent/presences?eleve_id=${enfantActif.id}`)
      .then(d => { if (d.success) setData(d); });
  }, [enfantActif?.id]);

  const absences = data?.presences?.filter(p => p.statut !== 'present') || [];

  return (
    <ParentLayout>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Absences & Retards</h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {enfantActif ? `${enfantActif.prenom} ${enfantActif.nom}` : ''}
        </p>
      </div>

      {data?.stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Présents',       val: data.stats.presents,          bg: '#e8f5ee', color: '#1a7a4a' },
            { label: 'Absents',        val: data.stats.absents,           bg: '#fdecea', color: '#c0392b' },
            { label: 'Retards',        val: data.stats.retards,           bg: '#fff8e1', color: '#b7770d' },
            { label: 'Abs. justif.',   val: data.stats.absents_justifies, bg: '#e3f0fd', color: '#1565c0' },
          ].map((s, i) => (
            <div key={i} style={{ background: s.bg, borderRadius: 12, padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 12, color: s.color }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {absences.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-muted)', fontSize: 14 }}>
          <span aria-hidden="true">✓</span>
          Aucune absence enregistrée 🎉
        </div>
      ) : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px', background: 'var(--bg)',
            padding: '11px 20px', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
            <span>DATE</span><span>STATUT</span>
          </div>
          {absences.map((p, i) => {
            const s = STATUT[p.statut] || STATUT.absent;
            return (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 130px',
                padding: '13px 20px', borderTop: '1px solid var(--border)', alignItems: 'center' }}>
                <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>
                  {(() => {
                    // p.date peut être une string "2025-11-15", un objet Date sérialisé,
                    // ou une string ISO complète — on normalise dans les 3 cas
                    const raw = typeof p.date === 'string' ? p.date.slice(0, 10) : new Date(p.date).toISOString().slice(0, 10);
                    const [y, m, d] = raw.split('-').map(Number);
                    return new Date(y, m - 1, d).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
                  })()}
                </div>
                <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: 6,
                  background: s.bg, color: s.color, fontSize: 12, fontWeight: 600 }}>{s.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </ParentLayout>
  );
}

// ── Bulletins ────────────────────────────────────────────────
const PERIODES = ['Trimestre 1', 'Trimestre 2', 'Trimestre 3'];
const API_URL  = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function ParentBulletins() {
  const { enfants } = useParentAuth();
  const enfantActif = JSON.parse(localStorage.getItem('parent_enfant_actif') || 'null') || enfants[0];
  const [loading, setLoading] = useState('');

  const download = async (periode) => {
    setLoading(periode);
    try {
      const token = localStorage.getItem('parent_token');
      const res   = await fetch(
        `${API_URL}/parent/bulletin/${enfantActif.id}/${encodeURIComponent(periode)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error();
      const blob   = await res.blob();
      const url    = URL.createObjectURL(blob);
      const a      = document.createElement('a');
      a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      alert('Bulletin non disponible pour cette période.');
    } finally { setLoading(''); }
  };

  return (
    <ParentLayout>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Bulletins scolaires</h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {enfantActif ? `${enfantActif.prenom} ${enfantActif.nom} — ${enfantActif.classe_nom}` : ''}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {PERIODES.map(p => (
          <div key={p} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 14, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{p}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                Année scolaire 2025-2026 · {enfantActif?.classe_nom}
              </div>
            </div>
            <button onClick={() => download(p)} disabled={loading === p}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
                borderRadius: 10, border: '.5px solid #0A5C36', background: '#fff', color: '#0A5C36',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: loading === p ? .6 : 1 }}>
              <span aria-hidden="true">📥</span>
              {loading === p ? 'Génération...' : 'Télécharger PDF'}
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20, padding: '14px 18px', background: '#fff8e1',
        border: '.5px solid #fde68a', borderRadius: 10, fontSize: 13, color: '#92400e' }}>
        💡 Les bulletins sont disponibles après la saisie des notes par les enseignants et la génération par l'administration.
      </div>
    </ParentLayout>
  );
}