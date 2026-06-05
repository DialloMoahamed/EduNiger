import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { changePassword } from '../services/api';
import api from '../services/api';

const COULEURS = [
  { hex: '#0A5C36', nom: 'Vert Niger (défaut)' },
  { hex: '#1A3A6B', nom: 'Bleu Marine' },
  { hex: '#8B1A1A', nom: 'Bordeaux' },
  { hex: '#2C5F2E', nom: 'Vert Forêt' },
  { hex: '#1B4F72', nom: 'Bleu Océan' },
  { hex: '#6B3A2A', nom: 'Marron' },
  { hex: '#2D3436', nom: 'Anthracite' },
  { hex: '#7B241C', nom: 'Rouge Foncé' },
];

export default function Parametres() {
  const { user, isAdmin } = useAuth();
  const [tab, setTab]     = useState('ecole');
  const [ecole, setEcole] = useState(null);
  const [saving, setSaving]     = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [alert, setAlert] = useState(null);
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [preview, setPreview] = useState(false);

  useEffect(() => { loadEcole(); }, []);

  const loadEcole = async () => {
    try {
      const res = await api.get('/ecole');
      setEcole(res.data.ecole);
    } catch {
      setEcole({
        nom: '', type_ecole: '', region: 'Niamey', departement: 'Niamey',
        inspection: '', adresse: '', telephone: '', email: '',
        boite_postale: '', devise: '', annee_scolaire: '2025-2026',
        couleur_primaire: '#0A5C36',
      });
    }
  };

  const handleSaveEcole = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/ecole', ecole);
      showAlert('success', 'Profil de l\'école enregistré avec succès');
    } catch {
      showAlert('danger', 'Erreur lors de l\'enregistrement');
    } finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) {
      return showAlert('danger', 'Les mots de passe ne correspondent pas');
    }
    if (passwords.newPass.length < 6) {
      return showAlert('danger', 'Minimum 6 caractères requis');
    }
    setSavingPwd(true);
    try {
      await changePassword({ currentPassword: passwords.current, newPassword: passwords.newPass });
      showAlert('success', 'Mot de passe modifié avec succès');
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      showAlert('danger', err.response?.data?.message || 'Erreur');
    } finally { setSavingPwd(false); }
  };

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 5000);
  };

  const setE = (field) => (e) => setEcole(p => ({ ...p, [field]: e.target.value }));

  if (!ecole) return <div className="loading-state"><div className="spinner"></div><span>Chargement...</span></div>;

  const couleur = ecole.couleur_primaire || '#0A5C36';

  return (
    <div>
      {alert && (
        <div className={`alert alert-${alert.type}`}>
          {alert.type === 'success' ? '✅' : '⚠️'} {alert.msg}
        </div>
      )}

      <div className="page-header">
        <div className="page-header-left">
          <h1>Paramètres</h1>
          <p>Configuration de l'établissement et du compte</p>
        </div>
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
        {[
          { id: 'ecole',   label: '🏫 Profil de l\'École' },
          { id: 'bulletin',label: '📄 Aperçu Bulletin' },
          { id: 'compte',  label: '🔒 Mon Compte' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: '13.5px', fontWeight: 600,
            color: tab === t.id ? couleur : 'var(--text-muted)',
            borderBottom: `2.5px solid ${tab === t.id ? couleur : 'transparent'}`,
            marginBottom: '-1px', transition: 'all 0.15s',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── ONGLET ÉCOLE ── */}
      {tab === 'ecole' && isAdmin() && (
        <form onSubmit={handleSaveEcole}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

            {/* Identité */}
            <div className="card" style={{ gridColumn: '1 / -1' }}>
              <div className="card-header">
                <div>
                  <div className="card-title">🏫 Identité de l'établissement</div>
                  <div className="card-subtitle">Ces informations apparaissent sur les bulletins</div>
                </div>
              </div>
              <div className="card-body">
                <div className="form-grid-2">
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="form-label">Nom complet de l'établissement *</label>
                    <input type="text" className="form-input" value={ecole.nom} onChange={setE('nom')} required placeholder="Ex: Collège d'Enseignement Général de Niamey" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Type d'établissement</label>
                    <select className="form-select" value={ecole.type_ecole} onChange={setE('type_ecole')}>
                      <option value="">Sélectionner...</option>
                      <option>École Primaire</option>
                      <option>Collège d'Enseignement Général</option>
                      <option>Lycée d'Enseignement Général</option>
                      <option>Lycée Technique</option>
                      <option>Institut de Formation</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Année scolaire</label>
                    <select className="form-select" value={ecole.annee_scolaire} onChange={setE('annee_scolaire')}>
                      <option value="2024-2025">2024–2025</option>
                      <option value="2025-2026">2025–2026</option>
                      <option value="2026-2027">2026–2027</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Devise / Slogan</label>
                    <input type="text" className="form-input" value={ecole.devise} onChange={setE('devise')} placeholder="Ex: L'Excellence au service de la Nation" />
                  </div>
                </div>
              </div>
            </div>

            {/* Localisation */}
            <div className="card">
              <div className="card-header"><div className="card-title">📍 Localisation administrative</div></div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Région</label>
                  <select className="form-select" value={ecole.region} onChange={setE('region')}>
                    {['Niamey','Agadez','Diffa','Dosso','Maradi','Tahoua','Tillabéri','Zinder'].map(r => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Département / Commune</label>
                  <input type="text" className="form-input" value={ecole.departement} onChange={setE('departement')} placeholder="Ex: Niamey I" />
                </div>
                <div className="form-group">
                  <label className="form-label">Inspection rattachée</label>
                  <input type="text" className="form-input" value={ecole.inspection} onChange={setE('inspection')} placeholder="Ex: Inspection de l'Enseignement Secondaire Cycle 1" />
                </div>
                <div className="form-group">
                  <label className="form-label">Adresse physique</label>
                  <input type="text" className="form-input" value={ecole.adresse} onChange={setE('adresse')} placeholder="Quartier, rue..." />
                </div>
              </div>
            </div>

            {/* Contacts */}
            <div className="card">
              <div className="card-header"><div className="card-title">📞 Contacts</div></div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Téléphone</label>
                  <input type="tel" className="form-input" value={ecole.telephone} onChange={setE('telephone')} placeholder="+227 20 73 XX XX" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" value={ecole.email} onChange={setE('email')} placeholder="contact@ecole.ne" />
                </div>
                <div className="form-group">
                  <label className="form-label">Boîte Postale</label>
                  <input type="text" className="form-input" value={ecole.boite_postale} onChange={setE('boite_postale')} placeholder="BP 1234" />
                </div>
              </div>
            </div>

            {/* Couleur */}
            <div className="card" style={{ gridColumn: '1 / -1' }}>
              <div className="card-header">
                <div>
                  <div className="card-title">🎨 Couleur des bulletins</div>
                  <div className="card-subtitle">Cette couleur sera appliquée à tous les bulletins PDF de votre école</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: couleur, border: '2px solid var(--border)' }}></div>
                  <span style={{ fontFamily: 'Space Mono', fontSize: '12px', color: 'var(--text-muted)' }}>{couleur}</span>
                </div>
              </div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  {COULEURS.map(c => (
                    <div
                      key={c.hex}
                      onClick={() => setEcole(p => ({ ...p, couleur_primaire: c.hex }))}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 14px', borderRadius: '10px', cursor: 'pointer',
                        border: `2px solid ${ecole.couleur_primaire === c.hex ? c.hex : 'var(--border)'}`,
                        background: ecole.couleur_primaire === c.hex ? `${c.hex}10` : 'var(--bg)',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: c.hex, flexShrink: 0 }}></div>
                      <span style={{ fontSize: '13px', fontWeight: ecole.couleur_primaire === c.hex ? 700 : 500 }}>{c.nom}</span>
                      {ecole.couleur_primaire === c.hex && <span style={{ marginLeft: 'auto', color: c.hex }}>✓</span>}
                    </div>
                  ))}
                </div>
                {/* Couleur personnalisée */}
                <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'var(--bg)', borderRadius: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Couleur personnalisée :</span>
                  <input type="color" value={ecole.couleur_primaire} onChange={setE('couleur_primaire')} style={{ width: '40px', height: '32px', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', padding: '2px' }} />
                  <span style={{ fontFamily: 'Space Mono', fontSize: '12px', color: 'var(--text-muted)' }}>{ecole.couleur_primaire}</span>
                </div>
              </div>
            </div>

          </div>

          <div style={{ marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setTab('bulletin')}>
              👁 Aperçu bulletin
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ background: couleur }}>
              {saving ? '⏳ Enregistrement...' : '💾 Enregistrer le profil'}
            </button>
          </div>
        </form>
      )}

      {tab === 'ecole' && !isAdmin() && (
        <div className="card">
          <div className="card-body">
            <div className="empty-state">
              <div className="empty-state-icon">🔒</div>
              <h3>Accès réservé à l'administrateur</h3>
              <p>Seul l'administrateur peut modifier le profil de l'école</p>
            </div>
          </div>
        </div>
      )}

      {/* ── ONGLET APERÇU BULLETIN ── */}
      {tab === 'bulletin' && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">📄 Aperçu du bulletin PDF</div>
              <div className="card-subtitle">Voici comment apparaîtra l'en-tête de vos bulletins</div>
            </div>
          </div>
          <div className="card-body">
            {/* Simulateur visuel */}
            <div style={{
              border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden',
              maxWidth: '680px', margin: '0 auto', boxShadow: 'var(--shadow-md)',
            }}>
              {/* Bande top */}
              <div style={{ height: '8px', background: couleur }}></div>

              <div style={{ padding: '24px 32px', background: '#fff', position: 'relative' }}>
                {/* Bande latérale gauche */}
                <div style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: '5px', background: couleur }}></div>

                {/* En-tête 3 colonnes */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', alignItems: 'start' }}>
                  {/* Col gauche — état */}
                  <div style={{ fontSize: '10px', color: '#718096', lineHeight: '1.8' }}>
                    <div>RÉPUBLIQUE DU NIGER</div>
                    <div>MINISTÈRE DE L'ÉDUCATION NATIONALE</div>
                    <div>RÉGION DE {(ecole.region || 'NIAMEY').toUpperCase()}</div>
                    {ecole.departement && <div>DÉPARTEMENT DE {ecole.departement.toUpperCase()}</div>}
                    {ecole.inspection && <div style={{ color: couleur, fontWeight: 700 }}>{ecole.inspection.toUpperCase()}</div>}
                  </div>

                  {/* Col centre — école */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: couleur, fontWeight: 800, fontSize: '14px', lineHeight: '1.3', marginBottom: '4px' }}>
                      {ecole.nom || 'NOM DE L\'ÉTABLISSEMENT'}
                    </div>
                    <div style={{ fontSize: '10px', color: '#718096', textTransform: 'uppercase', marginBottom: '6px' }}>
                      {ecole.type_ecole || 'Type d\'établissement'}
                    </div>
                    <div style={{ height: '2px', background: couleur, margin: '0 auto 6px', width: '80%' }}></div>
                    {ecole.devise && (
                      <div style={{ fontSize: '9px', color: '#a0aec0', fontStyle: 'italic' }}>
                        « {ecole.devise} »
                      </div>
                    )}
                  </div>

                  {/* Col droite — contacts */}
                  <div style={{ fontSize: '10px', color: '#718096', lineHeight: '1.8', textAlign: 'right' }}>
                    {ecole.telephone && <div>📞 {ecole.telephone}</div>}
                    {ecole.email && <div>✉ {ecole.email}</div>}
                    {ecole.adresse && <div>📍 {ecole.adresse}</div>}
                    <div style={{ color: couleur, fontWeight: 700, marginTop: '4px' }}>
                      Année {ecole.annee_scolaire || '2025-2026'}
                    </div>
                  </div>
                </div>

                {/* Titre bulletin */}
                <div style={{ textAlign: 'center', margin: '18px 0 12px', padding: '10px', borderTop: `1.5px solid ${couleur}`, borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ color: couleur, fontWeight: 800, fontSize: '16px', letterSpacing: '1px' }}>
                    BULLETIN DU 1er TRIMESTRE
                  </div>
                </div>

                {/* Fiche élève exemple */}
                <div style={{ background: '#f7f9fb', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
                  {[
                    ['NOM & PRÉNOM', 'DIALLO Aissata'],
                    ['MATRICULE', '2025001'],
                    ['CLASSE', '6ème A'],
                  ].map(([l, v]) => (
                    <div key={l}>
                      <div style={{ fontSize: '8px', color: '#a0aec0', fontWeight: 700, textTransform: 'uppercase' }}>{l}</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a202c' }}>{v}</div>
                    </div>
                  ))}
                </div>

                {/* Mini tableau notes */}
                <div style={{ marginTop: '14px' }}>
                  <div style={{ background: couleur, color: '#fff', display: 'grid', gridTemplateColumns: '2fr 0.5fr 1fr 1fr 0.7fr', padding: '6px 10px', fontSize: '9px', fontWeight: 700, borderRadius: '4px 4px 0 0' }}>
                    <span>MATIÈRE</span><span>COEF</span><span>MOY. ÉLÈVE</span><span>MOY. CLASSE</span><span>MENTION</span>
                  </div>
                  {[
                    ['Mathématiques', 4, '15.50', '13.20', 'Bien'],
                    ['Français',      3, '14.00', '12.80', 'Bien'],
                    ['Sciences Ph.',  3,  '9.50', '11.40', 'Insuffisant'],
                  ].map(([m, c, e, cl, mn], i) => (
                    <div key={m} style={{
                      display: 'grid', gridTemplateColumns: '2fr 0.5fr 1fr 1fr 0.7fr',
                      padding: '5px 10px', fontSize: '9.5px',
                      background: i % 2 === 1 ? '#f7f9fb' : '#fff',
                      borderBottom: '1px solid #e2e8f0'
                    }}>
                      <span>{m}</span>
                      <span style={{ color: '#718096' }}>{c}</span>
                      <span style={{ fontWeight: 700, color: parseFloat(e) >= 12 ? couleur : '#c53030' }}>{e}/20</span>
                      <span style={{ color: '#a0aec0' }}>{cl}/20</span>
                      <span style={{ color: parseFloat(e) >= 12 ? couleur : '#c53030', fontSize: '9px' }}>{mn}</span>
                    </div>
                  ))}
                  {/* Ligne totale */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 0.5fr 1fr 1fr 0.7fr', padding: '6px 10px', fontSize: '9.5px', background: '#f0f4f8', fontWeight: 700, borderRadius: '0 0 4px 4px' }}>
                    <span>MOYENNE GÉNÉRALE</span>
                    <span>10</span>
                    <span style={{ color: couleur }}>13.20/20</span>
                    <span style={{ color: '#718096' }}>12.50/20</span>
                    <span style={{ color: couleur }}>Assez Bien</span>
                  </div>
                </div>

                {/* Blocs résumé */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginTop: '14px' }}>
                  {[['MOYENNE', '13.20/20'], ['CLASSEMENT', '4e / 28'], ['MENTION', 'Assez Bien']].map(([l, v]) => (
                    <div key={l} style={{ background: '#f7f9fb', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
                      <div style={{ background: couleur, height: '3px', borderRadius: '2px', marginBottom: '6px' }}></div>
                      <div style={{ fontSize: '8px', color: '#a0aec0', fontWeight: 700 }}>{l}</div>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: couleur }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pied de page */}
              <div style={{ background: couleur, padding: '8px', textAlign: 'center', fontSize: '9px', color: 'rgba(255,255,255,0.8)' }}>
                {ecole.nom || 'EduNiger'} &nbsp;•&nbsp; {ecole.annee_scolaire || '2025-2026'} &nbsp;•&nbsp; Bulletin généré le {new Date().toLocaleDateString('fr-FR')}
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                💡 Allez dans <strong>Notes & Bulletins</strong> pour générer un vrai PDF avec les données d'un élève
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── ONGLET COMPTE ── */}
      {tab === 'compte' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="card">
            <div className="card-header"><div className="card-title">👤 Mon profil</div></div>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'var(--bg)', borderRadius: '12px', marginBottom: '20px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: couleur, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '20px' }}>
                  {user?.prenom?.[0]}{user?.nom?.[0]}
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 700 }}>{user?.prenom} {user?.nom}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{user?.email}</div>
                  <div style={{ marginTop: '6px' }}>
                    <span className={`badge ${user?.role === 'admin' ? 'badge-warning' : 'badge-success'}`}>
                      {user?.role === 'admin' ? '👑 Administrateur' : '👩‍🏫 Enseignant'}
                    </span>
                  </div>
                </div>
              </div>
              {[['Nom complet', `${user?.prenom} ${user?.nom}`], ['Email', user?.email], ['Rôle', user?.role === 'admin' ? 'Administrateur' : 'Enseignant']].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{l}</span>
                  <span style={{ fontWeight: 600, fontSize: '13px' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">🔒 Changer le mot de passe</div></div>
            <div className="card-body">
              <form onSubmit={handlePasswordChange}>
                <div className="form-group">
                  <label className="form-label">Mot de passe actuel *</label>
                  <input type="password" className="form-input" value={passwords.current} onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} required placeholder="••••••••" />
                </div>
                <div className="form-group">
                  <label className="form-label">Nouveau mot de passe *</label>
                  <input type="password" className="form-input" value={passwords.newPass} onChange={e => setPasswords(p => ({ ...p, newPass: e.target.value }))} required placeholder="••••••••" />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirmer le nouveau *</label>
                  <input type="password" className="form-input" value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} required placeholder="••••••••" />
                </div>
                <button type="submit" className="btn btn-primary" disabled={savingPwd} style={{ background: couleur }}>
                  {savingPwd ? '⏳...' : '🔒 Modifier le mot de passe'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
