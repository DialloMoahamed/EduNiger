import { useState, useEffect } from "react";

const API = "http://localhost:3000/api/superadmin";

const getToken = () => localStorage.getItem("sa_token");
const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// ── Palette EduNiger ──────────────────────────────────────────
const C = {
  green:      "#0A5C36",
  greenLight: "#E1F5EE",
  greenMid:   "#1D9E75",
  gold:       "#F5A623",
  goldLight:  "#FAEEDA",
  red:        "#E24B4A",
  redLight:   "#FCEBEB",
  gray:       "#F1EFE8",
  grayText:   "#5F5E5A",
  border:     "rgba(0,0,0,0.1)",
};

const badge = (label, color, bg) => (
  <span style={{
    background: bg, color, fontSize: 11, fontWeight: 500,
    padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap"
  }}>{label}</span>
);

const statutBadge = (s) => {
  if (s === "Actif")          return badge("Actif",           C.greenMid,  C.greenLight);
  if (s === "Expire bientôt") return badge("Expire bientôt",  C.gold,      C.goldLight);
  if (s === "Expiré")         return badge("Expiré",          C.red,       C.redLight);
  return badge("Inactif", C.grayText, C.gray);
};

// ── Login ─────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr]   = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true); setErr("");
    try {
      const r = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (d.success) { localStorage.setItem("sa_token", d.token); onLogin(d.admin); }
      else setErr(d.message || "Identifiants incorrects");
    } catch { setErr("Impossible de contacter le serveur"); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.gray }}>
      <div style={{ width: 360, background: "#fff", borderRadius: 16, border: `0.5px solid ${C.border}`, padding: "40px 36px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📚</div>
          <div style={{ fontSize: 20, fontWeight: 500, color: C.green }}>EduNiger</div>
          <div style={{ fontSize: 13, color: C.grayText, marginTop: 4 }}>Super Administration</div>
        </div>
        {err && <div style={{ background: C.redLight, color: C.red, padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{err}</div>}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: C.grayText, display: "block", marginBottom: 6 }}>Email</label>
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
            placeholder="admin@eduniger.ne" style={{ width: "100%", boxSizing: "border-box" }} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 12, color: C.grayText, display: "block", marginBottom: 6 }}>Mot de passe</label>
          <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
            onKeyDown={e => e.key === "Enter" && submit()} style={{ width: "100%", boxSizing: "border-box" }} />
        </div>
        <button onClick={submit} disabled={loading}
          style={{ width: "100%", background: C.green, color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </div>
    </div>
  );
}

// ── Stats cards ───────────────────────────────────────────────
function StatCard({ label, value, color }) {
  return (
    <div style={{ background: "#fff", border: `0.5px solid ${C.border}`, borderRadius: 12, padding: "16px 20px" }}>
      <div style={{ fontSize: 12, color: C.grayText, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 500, color: color || "var(--color-text-primary)" }}>{value}</div>
    </div>
  );
}

// ── Modal onboarding nouvelle école ──────────────────────────
function OnboardModal({ pricing, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: "", slug: "", email: "", phone: "", city: "",
    payment_method: "nita", install_ref: "", annual_ref: "",
  });
  const [err, setErr]     = useState("");
  const [loading, setLoading] = useState(false);

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.name || !form.slug || !form.install_ref || !form.annual_ref)
      return setErr("Remplissez tous les champs obligatoires");
    setLoading(true); setErr("");
    try {
      const r = await fetch(`${API}/schools/onboard`, {
        method: "POST", headers: headers(), body: JSON.stringify(form),
      });
      const d = await r.json();
      if (d.success) { onSuccess(); onClose(); }
      else setErr(d.message || "Erreur lors de l'enregistrement");
    } catch { setErr("Erreur serveur"); }
    setLoading(false);
  };

  const inp = (label, key, placeholder, type = "text") => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, color: C.grayText, display: "block", marginBottom: 5 }}>{label}</label>
      <input type={type} value={form[key]} onChange={e => f(key, e.target.value)}
        placeholder={placeholder} style={{ width: "100%", boxSizing: "border-box" }} />
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ background: "#fff", borderRadius: 16, width: 520, maxHeight: "90vh", overflowY: "auto", padding: "32px 36px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 17, fontWeight: 500 }}>Enregistrer une nouvelle école</div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: C.grayText }}>×</button>
        </div>

        {err && <div style={{ background: C.redLight, color: C.red, padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{err}</div>}

        <div style={{ fontSize: 13, fontWeight: 500, color: C.grayText, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Infos école</div>
        {inp("Nom de l'école *", "name", "Lycée Bosso")}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: C.grayText, display: "block", marginBottom: 5 }}>Identifiant URL (slug) *</label>
          <input value={form.slug} onChange={e => f("slug", e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))}
            placeholder="lycee-bosso" style={{ width: "100%", boxSizing: "border-box" }} />
          {form.slug && <div style={{ fontSize: 11, color: C.grayText, marginTop: 4 }}>{form.slug}.eduniger.com</div>}
        </div>
        {inp("Email", "email", "contact@lycee-bosso.ne", "email")}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {inp("Téléphone", "phone", "+227 90 00 00 00")}
          {inp("Ville", "city", "Niamey")}
        </div>

        <div style={{ fontSize: 13, fontWeight: 500, color: C.grayText, margin: "20px 0 12px", textTransform: "uppercase", letterSpacing: 1 }}>Paiement reçu</div>

        <div style={{ background: C.greenLight, borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: C.grayText }}>Frais d'installation</span>
            <span style={{ fontWeight: 500, color: C.green }}>{pricing?.installation_fee?.toLocaleString()} FCFA</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <span style={{ color: C.grayText }}>Abonnement annuel</span>
            <span style={{ fontWeight: 500, color: C.green }}>{pricing?.annual_fee?.toLocaleString()} FCFA</span>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: C.grayText, display: "block", marginBottom: 5 }}>Moyen de paiement</label>
          <select value={form.payment_method} onChange={e => f("payment_method", e.target.value)} style={{ width: "100%" }}>
            <option value="nita">NITA</option>
            <option value="amana">Amana</option>
            <option value="virement">Virement bancaire</option>
            <option value="especes">Espèces</option>
          </select>
        </div>
        {inp("Référence paiement installation *", "install_ref", "NITA-2025-001234")}
        {inp("Référence paiement abonnement *", "annual_ref", "NITA-2025-001235")}

        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 8 }}>Annuler</button>
          <button onClick={submit} disabled={loading}
            style={{ flex: 2, padding: 12, borderRadius: 8, background: C.green, color: "#fff", border: "none", fontWeight: 500, cursor: "pointer" }}>
            {loading ? "Enregistrement..." : "✓ Activer l'école"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal renouvellement ──────────────────────────────────────
function RenewalModal({ school, pricing, onClose, onSuccess }) {
  const [form, setForm] = useState({ payment_method: "nita", payment_ref: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    if (!form.payment_ref) return setErr("Référence de paiement requise");
    setLoading(true);
    try {
      const r = await fetch(`${API}/schools/${school.id}/renew`, {
        method: "POST", headers: headers(), body: JSON.stringify(form),
      });
      const d = await r.json();
      if (d.success) { onSuccess(); onClose(); }
      else setErr(d.message);
    } catch { setErr("Erreur serveur"); }
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ background: "#fff", borderRadius: 16, width: 420, padding: "32px 36px" }}>
        <div style={{ fontSize: 17, fontWeight: 500, marginBottom: 8 }}>Renouveler l'abonnement</div>
        <div style={{ fontSize: 13, color: C.grayText, marginBottom: 24 }}>{school.name}</div>
        {err && <div style={{ background: C.redLight, color: C.red, padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{err}</div>}
        <div style={{ background: C.greenLight, borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: C.grayText }}>Montant renouvellement</span>
            <span style={{ fontWeight: 500, color: C.green }}>{pricing?.annual_fee?.toLocaleString()} FCFA</span>
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: C.grayText, display: "block", marginBottom: 5 }}>Moyen de paiement</label>
          <select value={form.payment_method} onChange={e => setForm(p => ({ ...p, payment_method: e.target.value }))} style={{ width: "100%" }}>
            <option value="nita">NITA</option>
            <option value="amana">Amana</option>
            <option value="virement">Virement bancaire</option>
            <option value="especes">Espèces</option>
          </select>
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 12, color: C.grayText, display: "block", marginBottom: 5 }}>Référence paiement *</label>
          <input value={form.payment_ref} onChange={e => setForm(p => ({ ...p, payment_ref: e.target.value }))}
            placeholder="NITA-2025-00567" style={{ width: "100%", boxSizing: "border-box" }} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 8 }}>Annuler</button>
          <button onClick={submit} disabled={loading}
            style={{ flex: 2, padding: 12, borderRadius: 8, background: C.green, color: "#fff", border: "none", fontWeight: 500, cursor: "pointer" }}>
            {loading ? "Enregistrement..." : "✓ Confirmer le renouvellement"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────
function Dashboard({ admin, onLogout }) {
  const [schools, setSchools]   = useState([]);
  const [stats, setStats]       = useState(null);
  const [pricing, setPricing]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [showOnboard, setShowOnboard] = useState(false);
  const [renewal, setRenewal]   = useState(null);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("all");

  const load = async () => {
    setLoading(true);
    try {
      const [sR, stR, pR] = await Promise.all([
        fetch(`${API}/schools`, { headers: headers() }),
        fetch(`${API}/stats`,   { headers: headers() }),
        fetch(`${API}/pricing`, { headers: headers() }),
      ]);
      const [sD, stD, pD] = await Promise.all([sR.json(), stR.json(), pR.json()]);
      if (sD.success)  setSchools(sD.schools);
      if (stD.success) setStats(stD.stats);
      if (pD.success)  setPricing(pD.pricing);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggle = async (id, active) => {
    await fetch(`${API}/schools/${id}/toggle`, { method: "POST", headers: headers(), body: JSON.stringify({ is_active: active ? 0 : 1 }) });
    load();
  };

  const filtered = schools.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.slug.toLowerCase().includes(search.toLowerCase());
    if (filter === "all")     return matchSearch;
    if (filter === "active")  return matchSearch && s.is_active;
    if (filter === "expiring")return matchSearch && s.statut_abonnement === "Expire bientôt";
    if (filter === "expired") return matchSearch && s.statut_abonnement === "Expiré";
    return matchSearch;
  });

  return (
    <div style={{ minHeight: "100vh", background: C.gray }}>
      {/* Header */}
      <div style={{ background: C.green, padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 22 }}>📚</span>
          <span style={{ color: "#fff", fontWeight: 500, fontSize: 15 }}>EduNiger</span>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>/ Super Admin</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>{admin?.name}</span>
          <button onClick={onLogout} style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "none", borderRadius: 6, padding: "6px 14px", fontSize: 13, cursor: "pointer" }}>
            Déconnexion
          </button>
        </div>
      </div>

      <div style={{ padding: "32px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
          <StatCard label="Total écoles"         value={stats?.total ?? "—"} />
          <StatCard label="Écoles actives"        value={stats?.actives ?? "—"} color={C.greenMid} />
          <StatCard label="Expirent dans 30j"    value={stats?.expirent_bientot ?? "—"} color={C.gold} />
          <StatCard label="Abonnements expirés"  value={stats?.expires ?? "—"} color={C.red} />
        </div>

        {/* Toolbar */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une école..." style={{ flex: 1, maxWidth: 300 }} />
          <select value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">Toutes les écoles</option>
            <option value="active">Actives uniquement</option>
            <option value="expiring">Expirent bientôt</option>
            <option value="expired">Expirées</option>
          </select>
          <button onClick={() => setShowOnboard(true)}
            style={{ background: C.green, color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }}>
            + Nouvelle école
          </button>
        </div>

        {/* Table */}
        <div style={{ background: "#fff", borderRadius: 12, border: `0.5px solid ${C.border}`, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: C.gray }}>
                {["École", "Slug", "Ville", "Statut", "Jours restants", "Fin abonnement", "Actions"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 500, color: C.grayText, fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: C.grayText }}>Chargement...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: C.grayText }}>Aucune école trouvée</td></tr>
              ) : filtered.map((s, i) => (
                <tr key={s.id} style={{ borderTop: `0.5px solid ${C.border}`, background: i % 2 === 0 ? "#fff" : "rgba(0,0,0,0.01)" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 500 }}>
                    <div>{s.name}</div>
                    {!s.is_active && <span style={{ fontSize: 11, color: C.red }}>Suspendu</span>}
                  </td>
                  <td style={{ padding: "12px 16px", color: C.grayText, fontFamily: "monospace" }}>{s.slug}</td>
                  <td style={{ padding: "12px 16px", color: C.grayText }}>{s.city || "—"}</td>
                  <td style={{ padding: "12px 16px" }}>{statutBadge(s.statut_abonnement)}</td>
                  <td style={{ padding: "12px 16px", color: s.jours_restants <= 30 ? C.red : C.grayText, fontWeight: s.jours_restants <= 30 ? 500 : 400 }}>
                    {s.jours_restants != null ? `${s.jours_restants}j` : "—"}
                  </td>
                  <td style={{ padding: "12px 16px", color: C.grayText }}>
                    {s.period_end ? new Date(s.period_end).toLocaleDateString("fr-FR") : "—"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => setRenewal(s)} style={{ fontSize: 12, padding: "5px 10px", borderRadius: 6, background: C.greenLight, color: C.green, border: "none", cursor: "pointer" }}>
                        Renouveler
                      </button>
                      <button onClick={() => toggle(s.id, s.is_active)}
                        style={{ fontSize: 12, padding: "5px 10px", borderRadius: 6, background: s.is_active ? C.redLight : C.greenLight, color: s.is_active ? C.red : C.greenMid, border: "none", cursor: "pointer" }}>
                        {s.is_active ? "Suspendre" : "Activer"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tarification en vigueur */}
        {pricing && (
          <div style={{ marginTop: 24, background: "#fff", borderRadius: 12, border: `0.5px solid ${C.border}`, padding: "20px 24px" }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Tarification en vigueur</div>
            <div style={{ display: "flex", gap: 24, fontSize: 13 }}>
              <div><span style={{ color: C.grayText }}>Installation : </span><strong>{pricing.installation_fee?.toLocaleString()} FCFA</strong></div>
              <div><span style={{ color: C.grayText }}>Abonnement annuel : </span><strong>{pricing.annual_fee?.toLocaleString()} FCFA</strong></div>
              <div style={{ color: C.grayText, fontSize: 12 }}>{pricing.note}</div>
            </div>
          </div>
        )}
      </div>

      {showOnboard && <OnboardModal pricing={pricing} onClose={() => setShowOnboard(false)} onSuccess={load} />}
      {renewal && <RenewalModal school={renewal} pricing={pricing} onClose={() => setRenewal(null)} onSuccess={load} />}
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────
export default function SuperAdmin() {
  const [admin, setAdmin] = useState(() => {
    const t = localStorage.getItem("sa_token");
    return t ? { name: "Admin" } : null;
  });

  const logout = () => { localStorage.removeItem("sa_token"); setAdmin(null); };

  if (!admin) return <Login onLogin={setAdmin} />;
  return <Dashboard admin={admin} onLogout={logout} />;
}