import { useState, useEffect } from 'react';
import { getClasses, getEleves } from '../services/api';

export default function Rapports() {
  const [classes, setClasses] = useState([]);
  const [eleves, setEleves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getClasses(), getEleves()]).then(([cr, er]) => {
      setClasses(cr.data.classes);
      setEleves(er.data.eleves);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-state"><div className="spinner"></div><span>Chargement...</span></div>;

  const total = eleves.length;
  const garcons = eleves.filter(e => e.sexe === 'M').length;
  const filles = eleves.filter(e => e.sexe === 'F').length;
  const niveaux = [...new Set(classes.map(c => c.niveau))];

  const classesByNiveau = niveaux.map(n => ({
    niveau: n,
    classes: classes.filter(c => c.niveau === n),
    eleves: eleves.filter(e => classes.filter(c => c.niveau === n).find(c => c.id == e.classe_id))
  }));

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Rapports & Statistiques</h1>
          <p>Vue analytique de l'établissement — Année 2025–2026</p>
        </div>
        <button className="btn btn-secondary" onClick={() => window.print()}>🖨️ Imprimer</button>
      </div>

      {/* Global stats */}
      <div className="stats-grid mb-3">
        <div className="stat-card">
          <div className="stat-card-icon green">👨‍🎓</div>
          <div className="stat-card-accent green"></div>
          <div className="stat-value">{total}</div>
          <div className="stat-label">Total élèves inscrits</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon blue">👦</div>
          <div className="stat-card-accent blue"></div>
          <div className="stat-value">{garcons}</div>
          <div className="stat-label">Garçons — {total ? Math.round(garcons/total*100) : 0}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon amber">👧</div>
          <div className="stat-card-accent amber"></div>
          <div className="stat-value">{filles}</div>
          <div className="stat-label">Filles — {total ? Math.round(filles/total*100) : 0}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon green">🏫</div>
          <div className="stat-card-accent green"></div>
          <div className="stat-value">{classes.length}</div>
          <div className="stat-label">Classes actives</div>
        </div>
      </div>

      {/* Breakdown by niveau */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Effectifs par Niveau</div>
          </div>
          <div className="card-body">
            {classesByNiveau.map(({ niveau, classes: cls, eleves: elvs }) => (
              <div key={niveau} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                  <span style={{ fontWeight: 600 }}>{niveau}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{elvs.length} élèves · {cls.length} classes</span>
                </div>
                <div style={{ height: '8px', background: 'var(--bg)', borderRadius: '20px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${total ? (elvs.length / total) * 100 : 0}%`,
                    background: 'linear-gradient(90deg, var(--primary), var(--primary-light))',
                    borderRadius: '20px',
                    transition: 'width 0.5s ease'
                  }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Parité par Niveau</div>
          </div>
          <div className="card-body">
            {classesByNiveau.map(({ niveau, eleves: elvs }) => {
              const g = elvs.filter(e => e.sexe === 'M').length;
              const f = elvs.filter(e => e.sexe === 'F').length;
              const pctF = elvs.length ? Math.round((f / elvs.length) * 100) : 0;
              return (
                <div key={niveau} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '13px' }}>
                    <span style={{ fontWeight: 600 }}>{niveau}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{g}G / {f}F · {pctF}% filles</span>
                  </div>
                  <div style={{ height: '8px', background: '#BEE3F8', borderRadius: '20px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pctF}%`, background: 'var(--accent)', borderRadius: '20px' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Classes table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Détail des Classes</div>
          <span className="badge badge-neutral">{classes.length} classes</span>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Classe</th>
                <th>Niveau</th>
                <th>Enseignant</th>
                <th>Effectif</th>
                <th>Garçons</th>
                <th>Filles</th>
                <th>% Filles</th>
              </tr>
            </thead>
            <tbody>
              {classes.map(c => {
                const classEleves = eleves.filter(e => e.classe_id == c.id);
                const g = classEleves.filter(e => e.sexe === 'M').length;
                const f = classEleves.filter(e => e.sexe === 'F').length;
                const pctF = classEleves.length ? Math.round((f / classEleves.length) * 100) : 0;
                return (
                  <tr key={c.id}>
                    <td><strong>{c.nom}</strong></td>
                    <td><span className="badge badge-neutral">{c.niveau}</span></td>
                    <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {c.enseignant_prenom ? `${c.enseignant_prenom} ${c.enseignant_nom}` : '—'}
                    </td>
                    <td><span className="font-mono" style={{ fontWeight: 700 }}>{classEleves.length}</span></td>
                    <td style={{ color: 'var(--info)' }}>{g}</td>
                    <td style={{ color: 'var(--warning)' }}>{f}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '50px', height: '5px', background: 'var(--bg)', borderRadius: '20px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pctF}%`, background: 'var(--accent)', borderRadius: '20px' }}></div>
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{pctF}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
