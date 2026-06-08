import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// ── Badges ───────────────────────────────────────────────────────────────────
function StatutBadge({ statut }) {
  const map = {
    envoye:     'badge badge-success',
    en_attente: 'badge badge-warning',
    echec:      'badge badge-danger',
  };
  const labels = { envoye: 'Envoyé', en_attente: 'En attente', echec: 'Échec' };
  return <span className={map[statut] || 'badge badge-neutral'}>{labels[statut] || statut}</span>;
}

function TypeBadge({ type }) {
  const map = {
    bulletin:      { cls: 'badge badge-info',    label: '📄 Bulletin' },
    notes_saisies: { cls: 'badge badge-neutral',  label: '📝 Notes saisies' },
    retard:        { cls: 'badge badge-warning',  label: '⏰ Retard' },
    absence:       { cls: 'badge badge-danger',   label: '🚫 Absence' },
  };
  const t = map[type] || { cls: 'badge badge-neutral', label: type };
  return <span className={t.cls}>{t.label}</span>;
}

// ── Modal générique ───────────────────────────────────────────────────────────
function Modal({ title, onClose, onConfirm, confirmLabel, confirmDisabled, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary" onClick={onConfirm} disabled={confirmDisabled}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
export default function Notifications() {
  const [stats, setStats]           = useState(null);
  const [notifications, setNotifs]  = useState([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [filterType, setFilterType] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [page, setPage]             = useState(0);
  const LIMIT = 20;

  const [modal, setModal]     = useState(null); // 'bulletin' | 'notes' | 'retard'
  const [classes, setClasses] = useState([]);
  const [eleves, setEleves]   = useState([]);
  const [periodes]            = useState(['1er Trimestre', '2ème Trimestre', '3ème Trimestre']);
  const [sending, setSending] = useState(false);
  const [alert, setAlert]     = useState(null);

  const [fBulletin, setFBulletin] = useState({ eleve_id: '', periode: '' });
  const [fNotes, setFNotes]       = useState({ classe_id: '', periode: '' });
  const [fRetard, setFRetard]     = useState({
    eleve_id: '', date: new Date().toISOString().slice(0, 10), matiere: '', creneau: ''
  });

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 4000);
  };

  const loadStats = useCallback(async () => {
    try { const r = await api.get('/sms/stats'); setStats(r.data.stats); }
    catch { setStats(null); }
  }, []);

  const loadNotifs = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/sms', {
        params: {
          type:   filterType   || undefined,
          statut: filterStatut || undefined,
          limit:  LIMIT,
          offset: page * LIMIT,
        }
      });
      setNotifs(r.data.notifications);
      setTotal(r.data.total);
    } catch { setNotifs([]); }
    finally { setLoading(false); }
  }, [filterType, filterStatut, page]);

  useEffect(() => { loadStats(); loadNotifs(); }, [loadStats, loadNotifs]);

  useEffect(() => {
    if (modal === 'bulletin' || modal === 'retard') {
      api.get('/eleves').then(r => setEleves(r.data.eleves || []));
    }
    if (modal === 'notes') {
      api.get('/classes').then(r => setClasses(r.data.classes || []));
    }
  }, [modal]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleSend = async () => {
    setSending(true);
    try {
      if (modal === 'bulletin') {
        if (!fBulletin.eleve_id || !fBulletin.periode)
          return showAlert('warning', 'Sélectionnez un élève et une période.');
        await api.post('/sms/bulletin', fBulletin);
        showAlert('success', 'SMS bulletin envoyé avec succès.');
      } else if (modal === 'notes') {
        if (!fNotes.classe_id || !fNotes.periode)
          return showAlert('warning', 'Sélectionnez une classe et une période.');
        const r = await api.post('/sms/notes-classe', fNotes);
        showAlert('success', r.data.message);
      } else if (modal === 'retard') {
        if (!fRetard.eleve_id || !fRetard.date)
          return showAlert('warning', 'Sélectionnez un élève et une date.');
        await api.post('/sms/retard', fRetard);
        showAlert('success', 'SMS retard envoyé avec succès.');
      }
      setModal(null);
      loadStats();
      loadNotifs();
    } catch (e) {
      showAlert('danger', e.response?.data?.message || 'Erreur lors de l\'envoi.');
    } finally { setSending(false); }
  };

  const handleRenvoyer = async (id) => {
    try {
      await api.post(`/sms/${id}/renvoyer`);
      showAlert('success', 'Notification renvoyée.');
      loadNotifs();
    } catch { showAlert('danger', 'Erreur lors du renvoi.'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette notification ?')) return;
    try {
      await api.delete(`/sms/${id}`);
      loadNotifs();
      loadStats();
    } catch { showAlert('danger', 'Erreur suppression.'); }
  };

  // ── Config des actions SMS ─────────────────────────────────────────────────
  const actions = [
    {
      key: 'bulletin',
      icon: '📄',
      label: 'Bulletin disponible',
      desc: 'Envoyer au parent la moyenne et la mention d\'un élève',
      color: 'var(--info)',
      count: stats?.bulletins ?? 0,
    },
    {
      key: 'notes',
      icon: '📝',
      label: 'Notes saisies',
      desc: 'Notifier toute une classe que les notes de la période sont disponibles',
      color: 'var(--primary)',
      count: stats?.notes_saisies ?? 0,
    },
    {
      key: 'retard',
      icon: '⏰',
      label: 'Retard',
      desc: 'Alerter manuellement un parent (automatique lors de l\'appel)',
      color: 'var(--warning)',
      count: stats?.retards ?? 0,
    },
    {
      key: 'absence',
      icon: '🚫',
      label: 'Absence',
      desc: 'Envoi automatique lors de l\'enregistrement des présences',
      color: 'var(--danger)',
      count: stats?.absences ?? 0,
      readonly: true,
    },
  ];

  // ── Modal titles ───────────────────────────────────────────────────────────
  const modalTitles = {
    bulletin: '📄 SMS bulletin disponible',
    notes:    '📝 SMS résultats saisis',
    retard:   '⏰ SMS retard',
  };

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>📲 Notifications SMS</h1>
          <p>Alertes automatiques envoyées aux parents d'élèves</p>
        </div>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type}`} style={{ marginBottom: 20 }}>
          {alert.msg}
        </div>
      )}

      {/* ── Stats globales ────────────────────────────────────────────────── */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        {[
          { icon: '📨', label: 'Total envoyés',  value: stats?.total,      cls: 'blue' },
          { icon: '✅', label: 'Réussis',         value: stats?.envoyes,    cls: 'green' },
          { icon: '⏳', label: 'En attente',      value: stats?.en_attente, cls: 'amber' },
          { icon: '❌', label: 'Échecs',          value: stats?.echecs,     cls: 'red' },
        ].map(({ icon, label, value, cls }) => (
          <div key={label} className="stat-card">
            <div className={`stat-card-icon ${cls}`}>{icon}</div>
            <div className="stat-value">{value ?? '—'}</div>
            <div className="stat-label">{label}</div>
            <div className={`stat-card-accent ${cls}`} />
          </div>
        ))}
      </div>

      {/* ── Actions SMS ──────────────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="card-header">
          <div>
            <div className="card-title">Types de notifications</div>
            <div className="card-subtitle">Gérer et envoyer les SMS aux parents</div>
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {actions.map((a, i) => (
            <div key={a.key} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '16px 24px',
              borderBottom: i < actions.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              {/* Icône */}
              <div style={{
                width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                background: `${a.color}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20,
              }}>
                {a.icon}
              </div>

              {/* Texte */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{a.label}</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>{a.desc}</div>
              </div>

              {/* Compteur */}
              <div style={{ textAlign: 'right', minWidth: 60 }}>
                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Space Mono', monospace", color: a.color }}>
                  {a.count}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>envoyés</div>
              </div>

              {/* Bouton */}
              {a.readonly ? (
                <span className="badge badge-success" style={{ minWidth: 90, justifyContent: 'center' }}>
                  Automatique
                </span>
              ) : (
                <button
                  className="btn btn-primary btn-sm"
                  style={{ minWidth: 90 }}
                  onClick={() => setModal(a.key)}
                >
                  Envoyer
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Historique ───────────────────────────────────────────────────── */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Historique des notifications</div>
            <div className="card-subtitle">{total} notification{total !== 1 ? 's' : ''} au total</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <select className="form-select" style={{ width: 160, height: 36, fontSize: 13 }}
              value={filterType} onChange={e => { setFilterType(e.target.value); setPage(0); }}>
              <option value="">Tous les types</option>
              <option value="bulletin">Bulletin</option>
              <option value="notes_saisies">Notes saisies</option>
              <option value="retard">Retard</option>
              <option value="absence">Absence</option>
            </select>
            <select className="form-select" style={{ width: 140, height: 36, fontSize: 13 }}
              value={filterStatut} onChange={e => { setFilterStatut(e.target.value); setPage(0); }}>
              <option value="">Tous les statuts</option>
              <option value="envoye">Envoyé</option>
              <option value="en_attente">En attente</option>
              <option value="echec">Échec</option>
            </select>
            {(filterType || filterStatut) && (
              <button className="btn btn-secondary btn-sm"
                onClick={() => { setFilterType(''); setFilterStatut(''); setPage(0); }}>
                Réinitialiser
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="loading-state"><div className="spinner" /><span>Chargement...</span></div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>Aucune notification</h3>
            <p>Les SMS envoyés aux parents apparaîtront ici.</p>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Élève</th>
                    <th>Téléphone</th>
                    <th>Message</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map(n => (
                    <tr key={n.id}>
                      <td className="text-sm font-mono" style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                        {new Date(n.created_at).toLocaleString('fr-FR', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td><TypeBadge type={n.type} /></td>
                      <td>
                        {n.eleve_nom
                          ? <span style={{ fontWeight: 600 }}>{n.eleve_nom} {n.eleve_prenom}</span>
                          : <span className="text-muted">—</span>
                        }
                      </td>
                      <td className="text-sm font-mono">{n.telephone}</td>
                      <td style={{ maxWidth: 280 }} title={n.message}>
                        <span className="truncate" style={{ display: 'block', fontSize: 12.5, color: 'var(--text-secondary)' }}>
                          {n.message.length > 80 ? n.message.slice(0, 80) + '…' : n.message}
                        </span>
                      </td>
                      <td><StatutBadge statut={n.statut} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {n.statut !== 'envoye' && (
                            <button className="btn btn-secondary btn-sm btn-icon" title="Renvoyer"
                              onClick={() => handleRenvoyer(n.id)}>🔄</button>
                          )}
                          <button className="btn btn-danger btn-sm btn-icon" title="Supprimer"
                            onClick={() => handleDelete(n.id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {total > LIMIT && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
                <button className="btn btn-secondary btn-sm" disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}>← Précédent</button>
                <span className="text-sm text-muted">
                  Page {page + 1} / {Math.ceil(total / LIMIT)}
                </span>
                <button className="btn btn-secondary btn-sm" disabled={(page + 1) * LIMIT >= total}
                  onClick={() => setPage(p => p + 1)}>Suivant →</button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Modales ──────────────────────────────────────────────────────── */}
      {modal && (
        <Modal
          title={modalTitles[modal]}
          onClose={() => setModal(null)}
          onConfirm={handleSend}
          confirmLabel={sending ? 'Envoi en cours…' : '📤 Envoyer le SMS'}
          confirmDisabled={sending}
        >
          {modal === 'bulletin' && (
            <>
              <p style={{ marginBottom: 16, color: 'var(--text-muted)', fontSize: 13.5 }}>
                Envoie un SMS au parent avec la moyenne et la mention de l'élève.
              </p>
              <div className="form-group">
                <label className="form-label">Élève *</label>
                <select className="form-select" value={fBulletin.eleve_id}
                  onChange={e => setFBulletin(f => ({ ...f, eleve_id: e.target.value }))}>
                  <option value="">— Sélectionner un élève —</option>
                  {eleves.map(el => (
                    <option key={el.id} value={el.id} disabled={!el.telephone_parent}>
                      {el.nom} {el.prenom}{!el.telephone_parent ? ' (pas de numéro)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Période *</label>
                <select className="form-select" value={fBulletin.periode}
                  onChange={e => setFBulletin(f => ({ ...f, periode: e.target.value }))}>
                  <option value="">— Sélectionner —</option>
                  {periodes.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </>
          )}

          {modal === 'notes' && (
            <>
              <p style={{ marginBottom: 16, color: 'var(--text-muted)', fontSize: 13.5 }}>
                Notifie tous les parents de la classe que les notes sont disponibles.
              </p>
              <div className="form-group">
                <label className="form-label">Classe *</label>
                <select className="form-select" value={fNotes.classe_id}
                  onChange={e => setFNotes(f => ({ ...f, classe_id: e.target.value }))}>
                  <option value="">— Sélectionner une classe —</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Période *</label>
                <select className="form-select" value={fNotes.periode}
                  onChange={e => setFNotes(f => ({ ...f, periode: e.target.value }))}>
                  <option value="">— Sélectionner —</option>
                  {periodes.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </>
          )}

          {modal === 'retard' && (
            <>
              <p style={{ marginBottom: 16, color: 'var(--text-muted)', fontSize: 13.5 }}>
                Envoi manuel d'un retard. Ce SMS est aussi envoyé automatiquement lors de l'appel.
              </p>
              <div className="form-group">
                <label className="form-label">Élève *</label>
                <select className="form-select" value={fRetard.eleve_id}
                  onChange={e => setFRetard(f => ({ ...f, eleve_id: e.target.value }))}>
                  <option value="">— Sélectionner un élève —</option>
                  {eleves.map(el => (
                    <option key={el.id} value={el.id} disabled={!el.telephone_parent}>
                      {el.nom} {el.prenom}{!el.telephone_parent ? ' (pas de numéro)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input type="date" className="form-input" value={fRetard.date}
                    onChange={e => setFRetard(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Créneau</label>
                  <input type="text" className="form-input" placeholder="ex: 08h-10h"
                    value={fRetard.creneau}
                    onChange={e => setFRetard(f => ({ ...f, creneau: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Matière</label>
                <input type="text" className="form-input" placeholder="ex: Mathématiques"
                  value={fRetard.matiere}
                  onChange={e => setFRetard(f => ({ ...f, matiere: e.target.value }))} />
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}