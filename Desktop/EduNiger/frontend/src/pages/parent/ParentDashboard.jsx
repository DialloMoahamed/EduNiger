import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ParentLayout, { parentApi, useParentAuth } from './ParentLayout';

function mention(moy) {
  const m = parseFloat(moy);
  if (m >= 16) return { txt: 'Très Bien',  color: '#1a7a4a' };
  if (m >= 14) return { txt: 'Bien',        color: '#2563eb' };
  if (m >= 12) return { txt: 'Assez Bien',  color: '#b7770d' };
  if (m >= 10) return { txt: 'Passable',    color: '#7c3aed' };
  return             { txt: 'Insuffisant', color: '#c0392b' };
}

function StatCard({ icon, value, label, color, bg }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 46, height: 46, borderRadius: 12, background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
        <i className={`ti ${icon}`} style={{ color }} aria-hidden="true" />
      </div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>{label}</div>
      </div>
    </div>
  );
}

export default function ParentDashboard() {
  const { enfants } = useParentAuth();
  const enfantActif = JSON.parse(localStorage.getItem('parent_enfant_actif') || 'null') || enfants[0];
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!enfantActif) return;
    parentApi(`/parent/dashboard?eleve_id=${enfantActif.id}`)
      .then(d => { if (d.success) setData(d); });
  }, [enfantActif?.id]);

  const eleve = data?.eleve;
  const stats = data?.stats;
  const notes = data?.dernieres_notes || [];
  const tauxPresence = stats?.total > 0
    ? Math.round((stats.presents / stats.total) * 100) : null;

  return (
    <ParentLayout>
      {/* En-tête élève */}
      {eleve && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 16, padding: '20px 24px', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 18,
          borderLeft: '4px solid #0A5C36' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#e8f5ee',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 700, color: '#0A5C36', flexShrink: 0 }}>
            {eleve.prenom[0]}{eleve.nom[0]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)' }}>
              {eleve.prenom} {eleve.nom}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
              {eleve.classe_nom} — {eleve.niveau} &nbsp;·&nbsp; Matricule : {eleve.matricule}
            </div>
            {eleve.enseignant_nom && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                Prof. principal : {eleve.enseignant_prenom} {eleve.enseignant_nom}
              </div>
            )}
          </div>
          {tauxPresence !== null && (
            <div style={{ textAlign: 'center', padding: '10px 20px',
              background: tauxPresence >= 90 ? '#e8f5ee' : tauxPresence >= 75 ? '#fff8e1' : '#fdecea',
              borderRadius: 12 }}>
              <div style={{ fontSize: 26, fontWeight: 700,
                color: tauxPresence >= 90 ? '#1a7a4a' : tauxPresence >= 75 ? '#b7770d' : '#c0392b' }}>
                {tauxPresence}%
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Assiduité</div>
            </div>
          )}
        </div>
      )}

      {/* Stats présence */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 12, marginBottom: 28 }}>
          <StatCard icon="ti-calendar-check"      value={stats.presents}          label="Jours présent"    color="#1a7a4a" bg="#e8f5ee" />
          <StatCard icon="ti-calendar-x"          value={stats.absents}           label="Absences"         color="#c0392b" bg="#fdecea" />
          <StatCard icon="ti-clock-exclamation"   value={stats.retards}           label="Retards"          color="#b7770d" bg="#fff8e1" />
          <StatCard icon="ti-clipboard-check"     value={stats.absents_justifies} label="Abs. justifiées"  color="#1565c0" bg="#e3f0fd" />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Dernières notes */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              <span aria-hidden="true">★</span>
              Dernières notes
            </div>
            <Link to="/parent/notes" style={{ fontSize: 12, color: '#0A5C36', textDecoration: 'none' }}>Voir tout →</Link>
          </div>
          {notes.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              Aucune note disponible
            </div>
          ) : notes.map((n, i) => {
            const note20 = ((n.note / n.note_sur) * 20).toFixed(2);
            const { color } = mention(note20);
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '13px 20px', borderBottom: i < notes.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{n.matiere}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {n.periode} · {new Date(n.date_evaluation).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color }}>{note20}<span style={{ fontSize: 12, color: 'var(--text-muted)' }}>/20</span></div>
              </div>
            );
          })}
        </div>

        {/* Accès rapides */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { to: '/parent/notes',     icon: 'ti-file-text',   label: 'Voir toutes les notes',   sub: 'Notes par matière et par trimestre', color: '#0A5C36', bg: '#e8f5ee' },
            { to: '/parent/absences',  icon: 'ti-calendar-x',  label: 'Historique des absences', sub: 'Absences, retards et justificatifs', color: '#c0392b', bg: '#fdecea' },
            { to: '/parent/bulletins', icon: 'ti-download',    label: 'Télécharger les bulletins', sub: 'Bulletins trimestriels en PDF',     color: '#1565c0', bg: '#e3f0fd' },
          ].map(({ to, icon, label, sub, color, bg }) => (
            <Link key={to} to={to} style={{ textDecoration: 'none' }}>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 14, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14,
                transition: 'border-color .15s', cursor: 'pointer' }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={`ti ${icon}`} style={{ color, fontSize: 20 }} aria-hidden="true" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{sub}</div>
                </div>
                <span aria-hidden="true">›</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </ParentLayout>
  );
}
