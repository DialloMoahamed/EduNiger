import { useState, useEffect } from "react";

const API = (import.meta.env.VITE_API_URL || "http://localhost:3000/api");
const getToken = () => localStorage.getItem("sa_token");
const authHdrs = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` });

export default function ProfilPage() {
  const [admin, setAdmin]       = useState(null);
  const [loading, setLoading]   = useState(true);

  // Formulaire infos
  const [infoForm, setInfoForm] = useState({ name: "", email: "" });
  const [infoSaving, setInfoSaving] = useState(false);
  const [infoMsg, setInfoMsg]   = useState(null); // { type: "success"|"error", text }

  // Formulaire mot de passe
  const [pwdForm, setPwdForm]   = useState({ current_password: "", new_password: "", confirm: "" });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg, setPwdMsg]     = useState(null);
  const [showPwd, setShowPwd]   = useState({ current: false, new: false, confirm: false });

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/superadmin/profil`, { headers: authHdrs() });
      const d = await r.json();
      if (d.success) {
        setAdmin(d.admin);
        setInfoForm({ name: d.admin.name, email: d.admin.email });
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const saveInfo = async () => {
    setInfoMsg(null);
    if (!infoForm.name.trim() || !infoForm.email.trim())
      return setInfoMsg({ type: "error", text: "Nom et email obligatoires" });
    setInfoSaving(true);
    try {
      const r = await fetch(`${API}/superadmin/profil`, {
        method: "PUT", headers: authHdrs(), body: JSON.stringify(infoForm),
      });
      const d = await r.json();
      setInfoMsg({ type: d.success ? "success" : "error", text: d.message });
      if (d.success) load();
    } catch { setInfoMsg({ type: "error", text: "Erreur serveur" }); }
    setInfoSaving(false);
  };

  const savePassword = async () => {
    setPwdMsg(null);
    if (!pwdForm.current_password || !pwdForm.new_password)
      return setPwdMsg({ type: "error", text: "Tous les champs sont requis" });
    if (pwdForm.new_password !== pwdForm.confirm)
      return setPwdMsg({ type: "error", text: "Les deux nouveaux mots de passe ne correspondent pas" });
    if (pwdForm.new_password.length < 8)
      return setPwdMsg({ type: "error", text: "Le nouveau mot de passe doit faire au moins 8 caractères" });
    setPwdSaving(true);
    try {
      const r = await fetch(`${API}/superadmin/profil/password`, {
        method: "PUT", headers: authHdrs(),
        body: JSON.stringify({ current_password: pwdForm.current_password, new_password: pwdForm.new_password }),
      });
      const d = await r.json();
      setPwdMsg({ type: d.success ? "success" : "error", text: d.message });
      if (d.success) setPwdForm({ current_password: "", new_password: "", confirm: "" });
    } catch { setPwdMsg({ type: "error", text: "Erreur serveur" }); }
    setPwdSaving(false);
  };

  if (loading) return (
    <div className="loading-state"><div className="spinner" /><span>Chargement...</span></div>
  );

  const lastLogin = admin?.last_login
    ? new Date(admin.last_login).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—";

  return (
    <div style={{ maxWidth: 640 }}>

      {/* Carte identité */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-body" style={{ padding: "28px 32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--primary-dark), var(--primary))",
              color: "#F5A623", fontSize: 28, fontWeight: 900,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              {(admin?.name || "SA").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)" }}>{admin?.name}</div>
              <div style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 2 }}>{admin?.email}</div>
              <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={{
                  background: "#FFF3CD", color: "#856404", fontSize: 12, fontWeight: 600,
                  padding: "3px 10px", borderRadius: 20, border: "1px solid #FFEAA7",
                }}>🔐 Super Admin</span>
                <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
                  Dernière connexion : {lastLogin}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modifier les informations */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div>
            <div className="card-title">Informations du compte</div>
            <div className="card-subtitle">Modifier le nom affiché et l'adresse email</div>
          </div>
        </div>
        <div className="card-body">
          {infoMsg && (
            <div className={`alert alert-${infoMsg.type === "success" ? "success" : "danger"}`} style={{ marginBottom: 16 }}>
              {infoMsg.type === "success" ? "✅" : "⚠️"} {infoMsg.text}
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Nom complet</label>
            <input className="form-input" value={infoForm.name}
              onChange={e => setInfoForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Votre nom" />
          </div>
          <div className="form-group">
            <label className="form-label">Adresse email</label>
            <input type="email" className="form-input" value={infoForm.email}
              onChange={e => setInfoForm(p => ({ ...p, email: e.target.value }))}
              placeholder="admin@eduniger.ne" />
          </div>
          <button className="btn btn-primary" onClick={saveInfo} disabled={infoSaving}>
            {infoSaving ? "⏳ Enregistrement..." : "✓ Enregistrer les modifications"}
          </button>
        </div>
      </div>

      {/* Changer le mot de passe */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Mot de passe</div>
            <div className="card-subtitle">Choisir un mot de passe fort d'au moins 8 caractères</div>
          </div>
        </div>
        <div className="card-body">
          {pwdMsg && (
            <div className={`alert alert-${pwdMsg.type === "success" ? "success" : "danger"}`} style={{ marginBottom: 16 }}>
              {pwdMsg.type === "success" ? "✅" : "⚠️"} {pwdMsg.text}
            </div>
          )}

          {[
            { key: "current_password", label: "Mot de passe actuel" },
            { key: "new_password",     label: "Nouveau mot de passe" },
            { key: "confirm",          label: "Confirmer le nouveau mot de passe" },
          ].map(({ key, label }) => (
            <div className="form-group" key={key}>
              <label className="form-label">{label}</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPwd[key] ? "text" : "password"}
                  className="form-input"
                  value={pwdForm[key]}
                  onChange={e => setPwdForm(p => ({ ...p, [key]: e.target.value }))}
                  placeholder="••••••••"
                  style={{ paddingRight: 44 }}
                />
                <button
                  onClick={() => setShowPwd(p => ({ ...p, [key]: !p[key] }))}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", fontSize: 16,
                    color: "var(--text-muted)",
                  }}
                  tabIndex={-1}
                >
                  {showPwd[key] ? "🙈" : "👁️"}
                </button>
              </div>
              {/* Indicateur force pour le nouveau mot de passe */}
              {key === "new_password" && pwdForm.new_password && (
                <PasswordStrength password={pwdForm.new_password} />
              )}
            </div>
          ))}

          <button className="btn btn-primary" onClick={savePassword} disabled={pwdSaving}>
            {pwdSaving ? "⏳ Modification..." : "🔒 Changer le mot de passe"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Indicateur de force du mot de passe ──────────────────────
function PasswordStrength({ password }) {
  let score = 0;
  if (password.length >= 8)              score++;
  if (password.length >= 12)             score++;
  if (/[A-Z]/.test(password))            score++;
  if (/[0-9]/.test(password))            score++;
  if (/[^A-Za-z0-9]/.test(password))     score++;

  const levels = [
    { label: "Très faible", color: "#E53E3E" },
    { label: "Faible",      color: "#DD6B20" },
    { label: "Moyen",       color: "#D69E2E" },
    { label: "Fort",        color: "#38A169" },
    { label: "Très fort",   color: "#0A5C36" },
  ];
  const level = levels[Math.min(score, 4)];

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
        {levels.map((l, i) => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 2,
            background: i < score ? level.color : "var(--border)",
            transition: "background 0.3s",
          }} />
        ))}
      </div>
      <div style={{ fontSize: 11, color: level.color, fontWeight: 600 }}>{level.label}</div>
    </div>
  );
}