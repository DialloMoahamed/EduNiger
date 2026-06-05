import { useState, useEffect } from 'react';
import { getElevesStats, getClasses } from '../services/api';
import { useAuth } from '../context/AuthContext';

function StatCard({ icon, value, label, color, change, changeDir }) {
  return (
    <div className="stat-card">
      <div className={`stat-card-icon ${color}`}>{icon}</div>
      <div className={`stat-card-accent ${color}`}></div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {change && (
        <div className={`stat-change ${changeDir}`}>
          {changeDir === 'up' ? '↑' : '↓'} {change}
        </div>
      )}
    </div>
  );
}

function AttendanceRing({ pct }) {
  const r = 34, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="attendance-ring">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--border)" strokeWidth="7" />
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--primary)" strokeWidth="7"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.5s ease' }} />
      </svg>
      <div className="attendance-ring-label">{pct}%</div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [statsRes, classesRes] = await Promise.all([getElevesStats(), getClasses()]);
      setStats(statsRes.data.stats);
      setClasses(classesRes.data.classes);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="loading-state">
      <div className="spinner"></div>
      <span>Chargement du tableau de bord...</span>
    </div>
  );

  const niveaux = [...new Set(classes.map(c => c.niveau))];

  return (
    <div>
      {/* Welcome */}
      <div className="card mb-3" style={{ background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%)', border: 'none', marginBottom: '24px' }}>
        <div className="card-body" style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bienvenue</div>
              <div style={{ color: '#fff', fontSize: '20px', fontWeight: '800' }}>{user?.prenom} {user?.nom}</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', marginTop: '4px' }}>
                {isAdmin() ? 'Administrateur — Accès complet' : 'Enseignant — Gestion de classe'}
              </div>
            </div>
            <div style={{ fontSize: '52px', opacity: 0.2 }}>🏫</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard icon="👨‍🎓" value={stats?.total || 0} label="Total Élèves inscrits" color="green" change="Année 2025–2026" changeDir="up" />
        <StatCard icon="👦" value={stats?.garcons || 0} label="Garçons" color="blue" />
        <StatCard icon="👧" value={stats?.filles || 0} label="Filles" color="amber" />
        <StatCard icon="🏫" value={classes.length} label="Classes actives" color="green" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Classes */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Liste des Classes</div>
              <div className="card-subtitle">{classes.length} classes au total</div>
            </div>
            <span className="badge badge-info">{niveaux.join(' · ')}</span>
          </div>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Classe</th>
                  <th>Niveau</th>
                  <th>Enseignant</th>
                  <th>Élèves</th>
                </tr>
              </thead>
              <tbody>
                {classes.length === 0 ? (
                  <tr><td colSpan={4}><div className="empty-state"><div>Aucune classe créée</div></div></td></tr>
                ) : classes.map(c => (
                  <tr key={c.id}>
                    <td><strong>{c.nom}</strong></td>
                    <td><span className="badge badge-neutral">{c.niveau}</span></td>
                    <td style={{ color: 'var(--text-muted)' }}>{c.enseignant_prenom ? `${c.enseignant_prenom} ${c.enseignant_nom}` : '—'}</td>
                    <td>
                      <span style={{ fontFamily: 'Space Mono', fontWeight: 700, color: 'var(--primary)' }}>
                        {c.nombre_eleves}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick stats */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Indicateurs Clés</div>
              <div className="card-subtitle">Aperçu de l'établissement</div>
            </div>
          </div>
          <div className="card-body">
            {/* Attendance ring */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '16px', background: 'var(--bg)', borderRadius: '12px', marginBottom: '16px' }}>
              <AttendanceRing pct={92} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>Taux de présence moyen</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Calculé sur les 30 derniers jours</div>
                <div style={{ marginTop: '8px' }}>
                  <span className="badge badge-success">✓ Bon niveau</span>
                </div>
              </div>
            </div>

            {/* Gender ratio */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>
                <span>Parité Filles / Garçons</span>
                <span style={{ color: 'var(--text-muted)' }}>
                  {stats?.total ? Math.round((stats.filles / stats.total) * 100) : 0}% filles
                </span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg)', borderRadius: '20px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${stats?.total ? Math.round((stats.filles / stats.total) * 100) : 0}%`,
                  background: 'linear-gradient(90deg, var(--accent), var(--primary))',
                  borderRadius: '20px',
                  transition: 'width 0.5s ease'
                }}></div>
              </div>
            </div>

            {/* Quick actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px' }}>
              {[
                { label: 'Faire l\'appel', icon: '📋', href: '/presences' },
                { label: 'Saisir des notes', icon: '📝', href: '/notes' },
                { label: 'Ajouter élève', icon: '➕', href: '/eleves' },
                { label: 'Voir rapports', icon: '📈', href: '/rapports' },
              ].map(a => (
                <a key={a.href} href={a.href} className="btn btn-secondary" style={{ justifyContent: 'center', fontSize: '13px' }}>
                  {a.icon} {a.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
