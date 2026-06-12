import { useState, useEffect } from "react";

const API = (import.meta.env.VITE_API_URL || "http://localhost:3000/api");
const getToken = () => localStorage.getItem("sa_token");
const authHdrs = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` });

const STATUS_MAP = {
  pending:   { label: "En attente",  cls: "badge-warning" },
  contacted: { label: "Contacté",    cls: "badge-info" },
  approved:  { label: "Approuvé",    cls: "badge-success" },
  rejected:  { label: "Refusé",      cls: "badge-danger" },
};

export default function DemandesPage({ onCountChange }) {
  const [demandes, setDemandes]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState("pending");
  const [selected, setSelected]   = useState(null);
  const [onboard, setOnboard]     = useState(null);

  useEffect(() => { load(); }, [filter]);

  const load = async () => {
    setLoading(true);
    try {
      const url = `${API}/school-requests${filter !== "all" ? `?status=${filter}` : ""}`;
      const r = await fetch(url, { headers: authHdrs() });
      const d = await r.json();
      if (d.success) {
        setDemandes(d.requests);
        // Remonter le count des pending au parent
        if (onCountChange) {
          const pending = d.requests.filter(x => x.status === "pending").length;
          onCountChange(pending);
        }
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const updateStatus = async (id, status, notes_admin) => {
    await fetch(`${API}/school-requests/${id}`, {
      method: "PUT", headers: authHdrs(),
      body: JSON.stringify({ status, notes_admin }),
    });
    setSelected(null);
    load();
  };

  const counts = {
    all:       demandes.length,
    pending:   demandes.filter(d => d.status === "pending").length,
    contacted: demandes.filter(d => d.status === "contacted").length,
    approved:  demandes.filter(d => d.status === "approved").length,
    rejected:  demandes.filter(d => d.status === "rejected").length,
  };

  // Charger tous pour avoir les counts corrects
  const [allDemandes, setAllDemandes] = useState([]);
  useEffect(() => {
    fetch(`${API}/school-requests`, { headers: authHdrs() })
      .then(r => r.json()).then(d => { if (d.success) setAllDemandes(d.requests); });
  }, [demandes]);

  const allCounts = {
    all:       allDemandes.length,
    pending:   allDemandes.filter(d => d.status === "pending").length,
    contacted: allDemandes.filter(d => d.status === "contacted").length,
    approved:  allDemandes.filter(d => d.status === "approved").length,
    rejected:  allDemandes.filter(d => d.status === "rejected").length,
  };

  return (
    <div>
      {/* Filtres */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ padding: "12px 20px" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { key: "pending",   label: "En attente" },
              { key: "contacted", label: "Contactés" },
              { key: "approved",  label: "Approuvés" },
              { key: "rejected",  label: "Refusés" },
              { key: "all",       label: "Toutes" },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setFilter(key)} style={{
                padding: "7px 16px", borderRadius: 20, border: "none", cursor: "pointer",
                fontWeight: 600, fontSize: 13,
                background: filter === key ? "var(--primary)" : "var(--bg)",
                color: filter === key ? "#fff" : "var(--text-secondary)",
              }}>
                {label}
                {allCounts[key] > 0 && (
                  <span style={{
                    marginLeft: 6, background: filter === key ? "rgba(255,255,255,0.2)" : "var(--border)",
                    borderRadius: 10, padding: "1px 7px", fontSize: 11,
                  }}>{allCounts[key]}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Demandes d'inscription</div>
            <div className="card-subtitle">{demandes.length} demande(s)</div>
          </div>
        </div>
        <div className="table-wrapper">
          {loading ? (
            <div className="loading-state"><div className="spinner" /><span>Chargement...</span></div>
          ) : demandes.length === 0 ? (
            <div className="empty-state" style={{ padding: 48 }}>
              <div className="empty-state-icon">📬</div>
              <h3>Aucune demande {filter !== "all" ? STATUS_MAP[filter]?.label?.toLowerCase() : ""}</h3>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>École</th>
                  <th>Responsable</th>
                  <th>Contact</th>
                  <th>Ville</th>
                  <th>Élèves</th>
                  <th>Statut</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {demandes.map(d => (
                  <tr key={d.id}>
                    <td><strong>{d.name}</strong><div style={{ fontSize: 11, color: "var(--text-muted)" }}>{d.type_ecole || "—"}</div></td>
                    <td>{d.contact_prenom} {d.contact_nom}</td>
                    <td style={{ fontSize: 13 }}>
                      <div>{d.email}</div>
                      <div style={{ color: "var(--text-muted)" }}>{d.phone || "—"}</div>
                    </td>
                    <td style={{ color: "var(--text-muted)" }}>{d.city || "—"}</td>
                    <td style={{ color: "var(--text-muted)" }}>{d.nb_eleves || "—"}</td>
                    <td><span className={`badge ${STATUS_MAP[d.status]?.cls || ""}`}>{STATUS_MAP[d.status]?.label || d.status}</span></td>
                    <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{new Date(d.created_at).toLocaleDateString("fr-FR")}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-secondary" style={{ fontSize: 12, padding: "4px 10px" }} onClick={() => setSelected(d)}>
                          Voir
                        </button>
                        {d.status === "pending" && (
                          <button className="btn btn-secondary" style={{ fontSize: 12, padding: "4px 10px", color: "var(--primary)", borderColor: "var(--primary)" }}
                            onClick={() => updateStatus(d.id, "contacted", d.notes_admin)}>
                            Contacté
                          </button>
                        )}
                        {(d.status === "pending" || d.status === "contacted") && (
                          <button className="btn btn-secondary" style={{ fontSize: 12, padding: "4px 10px", color: "var(--success)", borderColor: "var(--success)" }}
                            onClick={() => setOnboard(d)}>
                            Onboarder
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selected && <DetailDemandeModal demand={selected} onClose={() => setSelected(null)} onUpdate={(status, notes) => updateStatus(selected.id, status, notes)} onOnboard={() => { setSelected(null); setOnboard(selected); }} />}
      {onboard  && <OnboardFromDemandModal demand={onboard} onClose={() => setOnboard(null)} onSuccess={() => { setOnboard(null); load(); }} />}
    </div>
  );
}

// ── Modal détail demande ───────────────────────────────────────
function DetailDemandeModal({ demand: d, onClose, onUpdate, onOnboard }) {
  const [notes, setNotes] = useState(d.notes_admin || "");

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="card" style={{ width: 500, maxHeight: "90vh", overflowY: "auto", margin: 0 }}>
        <div className="card-header">
          <div>
            <div className="card-title">{d.name}</div>
            <div className="card-subtitle">Demande du {new Date(d.created_at).toLocaleDateString("fr-FR")}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)" }}>×</button>
        </div>
        <div className="card-body">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px", marginBottom: 20 }}>
            {[
              ["Responsable", `${d.contact_prenom || ""} ${d.contact_nom}`],
              ["Email", d.email],
              ["Téléphone", d.phone || "—"],
              ["Ville", d.city || "—"],
              ["Type école", d.type_ecole || "—"],
              ["Nb élèves", d.nb_eleves || "—"],
              ["Slug souhaité", d.slug_souhaite || "—"],
              ["Statut", <span key="s" className={`badge ${STATUS_MAP[d.status]?.cls}`}>{STATUS_MAP[d.status]?.label}</span>],
            ].map(([label, val]) => (
              <div key={label}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 3 }}>{label}</div>
                <div style={{ fontWeight: 500 }}>{val}</div>
              </div>
            ))}
          </div>

          {d.message && (
            <div style={{ background: "var(--bg)", borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 13, color: "var(--text-secondary)" }}>
              <strong>Message :</strong> {d.message}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Notes internes</label>
            <textarea className="form-input" value={notes} onChange={e => setNotes(e.target.value)}
              style={{ height: 80, resize: "vertical" }} placeholder="Notes sur ce dossier..." />
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
            {d.status === "pending" && (
              <button className="btn btn-secondary" style={{ color: "var(--info)" }} onClick={() => onUpdate("contacted", notes)}>
                ✉️ Marquer contacté
              </button>
            )}
            {(d.status === "pending" || d.status === "contacted") && (
              <>
                <button className="btn btn-primary" onClick={onOnboard}>🏫 Onboarder</button>
                <button className="btn btn-secondary" style={{ color: "var(--danger)" }} onClick={() => onUpdate("rejected", notes)}>
                  ✗ Refuser
                </button>
              </>
            )}
            <button className="btn btn-secondary" onClick={() => onUpdate(d.status, notes)}>
              💾 Enregistrer notes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Modal onboard depuis demande ──────────────────────────────
function OnboardFromDemandModal({ demand: d, onClose, onSuccess }) {
  const [form, setForm]   = useState({ slug: d.slug_souhaite || "", payment_method: "nita", install_ref: "", annual_ref: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr]     = useState("");

  const submit = async () => {
    if (!form.slug || !form.install_ref || !form.annual_ref)
      return setErr("Slug et références de paiement obligatoires");
    setLoading(true); setErr("");
    try {
      const r = await fetch(`${API}/school-requests/${d.id}/approve`, {
        method: "POST", headers: authHdrs(), body: JSON.stringify(form),
      });
      const data = await r.json();
      if (data.success) onSuccess();
      else setErr(data.message || "Erreur");
    } catch { setErr("Erreur serveur"); }
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1001 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="card" style={{ width: 440, margin: 0 }}>
        <div className="card-header">
          <div>
            <div className="card-title">Onboarder : {d.name}</div>
            <div className="card-subtitle">Créer et activer l'école</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)" }}>×</button>
        </div>
        <div className="card-body">
          {err && <div className="alert alert-danger" style={{ marginBottom: 16 }}>⚠️ {err}</div>}

          <div style={{ background: "var(--bg)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13 }}>
            <strong>{d.name}</strong> · {d.email} · {d.city || "—"}
          </div>

          <div className="form-group">
            <label className="form-label">Slug URL * <span style={{ color: "var(--text-muted)", fontSize: 11 }}>ex: lycee-bosso</span></label>
            <input className="form-input" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} placeholder="lycee-bosso" />
          </div>
          <div className="form-group">
            <label className="form-label">Moyen de paiement</label>
            <select className="form-input" value={form.payment_method} onChange={e => setForm(p => ({ ...p, payment_method: e.target.value }))}>
              <option value="nita">NITA</option>
              <option value="amana">Amana</option>
              <option value="virement">Virement bancaire</option>
              <option value="especes">Espèces</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Réf. paiement installation *</label>
            <input className="form-input" value={form.install_ref} onChange={e => setForm(p => ({ ...p, install_ref: e.target.value }))} placeholder="NITA-2026-00001" />
          </div>
          <div className="form-group">
            <label className="form-label">Réf. paiement annuel *</label>
            <input className="form-input" value={form.annual_ref} onChange={e => setForm(p => ({ ...p, annual_ref: e.target.value }))} placeholder="NITA-2026-00002" />
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>Annuler</button>
            <button className="btn btn-primary" onClick={submit} disabled={loading} style={{ flex: 2 }}>
              {loading ? "⏳ Création..." : "✓ Créer et activer l'école"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
