// frontend/src/pages/TeacherEnseignants.jsx
// Liste des enseignants pour l'enseignant connecté — LECTURE SEULE
// Reprend le style visuel de la page Enseignants.jsx admin, sans aucune action

import { useState, useEffect } from 'react';
import api from '../services/api';

function initiales(prenom, nom) {
  return `${(prenom?.[0] || '').toUpperCase()}${(nom?.[0] || '').toUpperCase()}`;
}

// Couleur d'avatar déterministe
function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 50%, 42%)`;
}

export default function TeacherEnseignants() {
  const [enseignants, setEnseignants]   = useState([]);
  const [filtered,    setFiltered]      = useState([]);
  const [search,      setSearch]        = useState('');
  const [loading,     setLoading]       = useState(true);
  const [alert,       setAlert]         = useState(null);

  useEffect(() => {
    api.get('/emploi-du-temps/enseignant/liste-enseignants')
      .then(res => {
        const data = res.data.enseignants || [];
        setEnseignants(data);
        setFiltered(data);
      })
      .catch(() => {
        setAlert({ type: 'danger', msg: 'Impossible de charger la liste des enseignants.' });
        setTimeout(() => setAlert(null), 4000);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    if (!q) { setFiltered(enseignants); return; }
    setFiltered(
      enseignants.filter(e =>
        e.nom.toLowerCase().includes(q) ||
        e.prenom.toLowerCase().includes(q) ||
        (e.email     && e.email.toLowerCase().includes(q))    ||
        (e.matieres  && e.matieres.toLowerCase().includes(q)) ||
        (e.classes   && e.classes.toLowerCase().includes(q))
      )
    );
  }, [search, enseignants]);

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
          <h1>Enseignants</h1>
          <p>
            {enseignants.length} enseignant{enseignants.length > 1 ? 's' : ''} dans l'établissement — consultation uniquement
          </p>
        </div>
        {/* Pas de bouton "Ajouter" */}
      </div>

      {/* Barre de recherche */}
      <div className="card" style={{ marginBottom: 24, padding: '16px 20px' }}>
        <div style={{ position: 'relative', maxWidth: 400 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>🔍</span>
          <input
            type="text"
            className="form-input"
            placeholder="Rechercher un enseignant…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="spinner" />
          <span>Chargement...</span>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">👩‍🏫</div>
          <h3>Aucun enseignant trouvé</h3>
          <p>{search ? 'Aucun résultat pour cette recherche.' : 'Aucun enseignant enregistré.'}</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Enseignant</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Matières</th>
                <th>Classes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(ens => {
                const color = stringToColor(`${ens.nom}${ens.prenom}`);
                return (
                  <tr key={ens.id}>
                    {/* Avatar + nom */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {ens.photo ? (
                          <img
                            src={`/uploads/${ens.photo}`}
                            alt=""
                            style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                            onError={e => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          style={{
                            width: 38, height: 38, borderRadius: '50%',
                            background: color, color: '#fff',
                            display: ens.photo ? 'none' : 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            fontSize: 14, fontWeight: 700, flexShrink: 0,
                          }}
                        >
                          {initiales(ens.prenom, ens.nom)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>
                            {ens.prenom} {ens.nom}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Enseignant</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      {ens.email || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>

                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      {ens.telephone || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>

                    <td>
                      {ens.matieres
                        ? ens.matieres.split(', ').map(m => (
                            <span key={m} style={{
                              display: 'inline-block', marginRight: 4, marginBottom: 2,
                              fontSize: 11, padding: '2px 8px', borderRadius: 12,
                              background: 'rgba(10,92,54,0.08)', color: '#0A5C36',
                              border: '1px solid rgba(10,92,54,0.15)', fontWeight: 500,
                            }}>
                              {m}
                            </span>
                          ))
                        : <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>—</span>
                      }
                    </td>

                    <td>
                      {ens.classes
                        ? ens.classes.split(', ').map(c => (
                            <span key={c} style={{
                              display: 'inline-block', marginRight: 4, marginBottom: 2,
                              fontSize: 11, padding: '2px 8px', borderRadius: 12,
                              background: 'rgba(49,130,206,0.08)', color: '#1A4A7A',
                              border: '1px solid rgba(49,130,206,0.2)', fontWeight: 500,
                            }}>
                              {c}
                            </span>
                          ))
                        : <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>—</span>
                      }
                    </td>
                    {/* Pas de colonne "Actions" */}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
