import { useState, useEffect } from "react";
import DemandesPage from "./DemandesPage";
import ProfilPage from "./ProfilPage";

// ── API ───────────────────────────────────────────────────────
const BASE = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/api$/, "");
const API  = `${BASE}/api/superadmin`;

const getToken  = () => localStorage.getItem("sa_token");
const authHdrs  = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` });

// ── Navigation superadmin ─────────────────────────────────────
const NAV = [
  { key: "dashboard", icon: "📊", label: "Tableau de bord",       section: "PRINCIPAL" },
  { key: "demandes",  icon: "📬", label: "Demandes d'inscription", section: "GESTION", badge: true },
  { key: "schools",   icon: "🏫", label: "Écoles",                 section: "GESTION" },
  { key: "pricing",   icon: "💳", label: "Tarification",           section: "GESTION" },
  { key: "profil",    icon: "👤", label: "Mon profil",             section: "COMPTE" },
];

// ═══════════════════════════════════════════════════════════════
//  LAYOUT SUPERADMIN (sidebar + topbar + contenu)
// ═══════════════════════════════════════════════════════════════
function SuperAdminLayout({ admin, onLogout, page, setPage, pendingCount, children }) {
  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  const pageTitles = {
    dashboard: { title: "Tableau de bord",        subtitle: "Vue globale de la plateforme EduNiger" },
    demandes:  { title: "Demandes d'inscription",  subtitle: "Nouvelles écoles souhaitant rejoindre EduNiger" },
    schools:   { title: "Gestion des Écoles",      subtitle: "Onboarding, abonnements et accès" },
    pricing:   { title: "Tarification",            subtitle: "Frais d'installation et abonnements annuels" },
    profil:    { title: "Mon profil",              subtitle: "Modifier vos identifiants de connexion" },
  };
  const info = pageTitles[page] || pageTitles.dashboard;

  // Grouper la nav par section
  const sections = {};
  NAV.forEach(item => {
    if (!sections[item.section]) sections[item.section] = [];
    sections[item.section].push(item);
  });

  return (
    <div className="app-layout">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">📚</div>
          <div className="logo-text">
            <span className="logo-name">EduNiger</span>
            <span className="logo-tagline">Super Admin</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {Object.entries(sections).map(([section, items]) => (
            <div key={section}>
              <div className="nav-section-label">{section}</div>
              {items.map(item => (
                <button
                  key={item.key}
                  onClick={() => setPage(item.key)}
                  className={`nav-item ${page === item.key ? "active" : ""}`}
                  style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", font: "inherit" }}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge && pendingCount > 0 && (
                    <span style={{
                      background: "#E53E3E", color: "#fff", borderRadius: "50%",
                      width: 20, height: 20, display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0,
                    }}>{pendingCount}</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">SA</div>
            <div className="user-info">
              <div className="user-name">{admin?.name || "Super Admin"}</div>
              <div className="user-role">Super Administrateur</div>
            </div>
            <button className="logout-btn" onClick={onLogout} title="Déconnexion">⏻</button>
          </div>
        </div>
      </aside>

      {/* ── Contenu principal ── */}
      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div>
            <div className="topbar-title">{info.title}</div>
            <div className="topbar-subtitle">{info.subtitle}</div>
          </div>
          <div className="topbar-right">
            <span className="topbar-school-name" style={{ fontSize: 12 }}>📅 {today}</span>
            <span style={{
              background: "#FFF3CD", color: "#856404", fontSize: 11, fontWeight: 600,
              padding: "4px 10px", borderRadius: 20, border: "1px solid #FFEAA7"
            }}>🔐 Super Admin</span>
          </div>
        </header>

        <div className="page-content">{children}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  PAGE LOGIN
// ═══════════════════════════════════════════════════════════════
function LoginPage({ onLogin }) {
  // 3 vues : "login" | "forgot" | "reset"
  const [view, setView] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("reset_token") ? "reset" : "login";
  });
  const resetToken = new URLSearchParams(window.location.search).get("reset_token") || "";

  if (view === "forgot") return <ForgotView onBack={() => setView("login")} />;
  if (view === "reset")  return <ResetView  token={resetToken} onBack={() => setView("login")} />;

  // ── Vue connexion ──
  const [form, setForm]       = useState({ email: "", password: "" });
  const [err, setErr]         = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const submit = async () => {
    if (!form.email || !form.password) return setErr("Email et mot de passe requis");
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
    <div className="login-page">
      <div className="login-left">
        <div className="login-branding">
          <div className="login-logo">📚</div>
          <div className="login-brand-name">EduNiger</div>
          <div className="login-brand-desc">
            Plateforme SaaS de gestion scolaire pour les établissements du Niger et de l'Afrique de l'Ouest.
          </div>
        </div>
        <div className="login-features">
          {[
            { icon: "🏫", text: "Gestion multi-école centralisée" },
            { icon: "💳", text: "Suivi des abonnements et paiements" },
            { icon: "🔑", text: "Activation et suspension des accès" },
            { icon: "📊", text: "Tableau de bord global en temps réel" },
          ].map((f, i) => (
            <div className="login-feature" key={i}>
              <div className="login-feature-icon">{f.icon}</div>
              <div className="login-feature-text">{f.text}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-wrap">
          <div style={{ marginBottom: 20 }}>
            <span style={{
              background: "#FFF3CD", color: "#856404", fontSize: 12, fontWeight: 600,
              padding: "4px 12px", borderRadius: 20, border: "1px solid #FFEAA7"
            }}>🔐 Super Administration</span>
          </div>
          <h1 className="login-form-title">Connexion</h1>
          <p className="login-form-sub">Accès réservé aux administrateurs EduNiger</p>

          {err && <div className="alert alert-danger">⚠️ {err}</div>}

          <div className="form-group">
            <label className="form-label">Adresse email</label>
            <input type="email" className="form-input" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="admin@eduniger.ne" autoFocus />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Mot de passe</span>
              <button onClick={() => setView("forgot")} style={{
                background: "none", border: "none", color: "var(--primary)", cursor: "pointer",
                fontSize: 12, fontWeight: 600, padding: 0,
              }}>Mot de passe oublié ?</button>
            </label>
            <div style={{ position: "relative" }}>
              <input type={showPwd ? "text" : "password"} className="form-input"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                onKeyDown={e => e.key === "Enter" && submit()}
                placeholder="••••••••" style={{ paddingRight: 40 }} />
              <button onClick={() => setShowPwd(v => !v)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "var(--text-muted)" }}
                tabIndex={-1}>{showPwd ? "🙈" : "👁️"}</button>
            </div>
          </div>

          <button className="btn btn-primary w-full btn-lg mt-2" onClick={submit} disabled={loading}
            style={{ justifyContent: "center" }}>
            {loading ? "⏳ Connexion..." : "→ Se connecter"}
          </button>

          <div style={{ marginTop: 32, textAlign: "center", fontSize: 12, color: "var(--text-light)" }}>
            EduNiger SaaS — Tous droits réservés © 2026
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Vue : Mot de passe oublié ─────────────────────────────────
function ForgotView({ onBack }) {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [err, setErr]         = useState("");

  const submit = async () => {
    if (!email.trim()) return setErr("Veuillez saisir votre email");
    setLoading(true); setErr("");
    try {
      const r = await fetch(`${API}/forgot-password`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const d = await r.json();
      if (d.success) setSent(true);
      else setErr(d.message || "Erreur serveur");
    } catch { setErr("Impossible de contacter le serveur"); }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-branding">
          <div className="login-logo">📚</div>
          <div className="login-brand-name">EduNiger</div>
          <div className="login-brand-desc">Récupération de votre accès Super Admin.</div>
        </div>
      </div>
      <div className="login-right">
        <div className="login-form-wrap">
          {sent ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 56, marginBottom: 20 }}>📧</div>
              <h2 style={{ marginBottom: 12 }}>Email envoyé !</h2>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 32 }}>
                Si l'adresse <strong>{email}</strong> correspond à un compte Super Admin, vous recevrez un lien de réinitialisation dans quelques minutes.
              </p>
              <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 24 }}>
                Pensez à vérifier vos spams.
              </p>
              <button className="btn btn-secondary w-full" onClick={onBack}>
                ← Retour à la connexion
              </button>
            </div>
          ) : (
            <>
              <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 13, marginBottom: 24, padding: 0, display: "flex", alignItems: "center", gap: 6 }}>
                ← Retour
              </button>
              <h1 className="login-form-title">Mot de passe oublié</h1>
              <p className="login-form-sub">Entrez votre email, nous vous enverrons un lien de réinitialisation.</p>

              {err && <div className="alert alert-danger">⚠️ {err}</div>}

              <div className="form-group">
                <label className="form-label">Adresse email</label>
                <input type="email" className="form-input" value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && submit()}
                  placeholder="admin@eduniger.ne" autoFocus />
              </div>

              <button className="btn btn-primary w-full btn-lg mt-2" onClick={submit} disabled={loading}
                style={{ justifyContent: "center" }}>
                {loading ? "⏳ Envoi..." : "📧 Envoyer le lien"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Vue : Réinitialiser le mot de passe ───────────────────────
function ResetView({ token, onBack }) {
  const [form, setForm]       = useState({ new_password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [err, setErr]         = useState("");
  const [showPwd, setShowPwd] = useState({ new: false, confirm: false });

  const submit = async () => {
    if (!form.new_password || !form.confirm) return setErr("Veuillez remplir les deux champs");
    if (form.new_password !== form.confirm) return setErr("Les mots de passe ne correspondent pas");
    if (form.new_password.length < 8) return setErr("Minimum 8 caractères");
    setLoading(true); setErr("");
    try {
      const r = await fetch(`${API}/reset-password`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: form.new_password }),
      });
      const d = await r.json();
      if (d.success) {
        setDone(true);
        // Nettoyer le token de l'URL
        window.history.replaceState({}, "", window.location.pathname);
      } else setErr(d.message || "Lien invalide ou expiré");
    } catch { setErr("Impossible de contacter le serveur"); }
    setLoading(false);
  };

  // Indicateur force
  const pwd = form.new_password;
  let score = 0;
  if (pwd.length >= 8)           score++;
  if (pwd.length >= 12)          score++;
  if (/[A-Z]/.test(pwd))         score++;
  if (/[0-9]/.test(pwd))         score++;
  if (/[^A-Za-z0-9]/.test(pwd))  score++;
  const colors = ["#E53E3E","#DD6B20","#D69E2E","#38A169","#0A5C36"];
  const labels = ["Très faible","Faible","Moyen","Fort","Très fort"];

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-branding">
          <div className="login-logo">📚</div>
          <div className="login-brand-name">EduNiger</div>
          <div className="login-brand-desc">Choisissez un nouveau mot de passe sécurisé.</div>
        </div>
      </div>
      <div className="login-right">
        <div className="login-form-wrap">
          {done ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 56, marginBottom: 20 }}>✅</div>
              <h2 style={{ marginBottom: 12 }}>Mot de passe modifié !</h2>
              <p style={{ color: "var(--text-secondary)", marginBottom: 32, lineHeight: 1.7 }}>
                Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.
              </p>
              <button className="btn btn-primary w-full" onClick={onBack} style={{ justifyContent: "center" }}>
                → Se connecter
              </button>
            </div>
          ) : (
            <>
              <h1 className="login-form-title">Nouveau mot de passe</h1>
              <p className="login-form-sub">Choisissez un mot de passe d'au moins 8 caractères.</p>

              {err && <div className="alert alert-danger">⚠️ {err}</div>}

              {[
                { key: "new_password", label: "Nouveau mot de passe" },
                { key: "confirm",      label: "Confirmer le mot de passe" },
              ].map(({ key, label }) => (
                <div className="form-group" key={key}>
                  <label className="form-label">{label}</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPwd[key === "new_password" ? "new" : "confirm"] ? "text" : "password"}
                      className="form-input"
                      value={form[key]}
                      onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                      onKeyDown={e => e.key === "Enter" && submit()}
                      placeholder="••••••••"
                      style={{ paddingRight: 40 }}
                      autoFocus={key === "new_password"}
                    />
                    <button
                      onClick={() => setShowPwd(p => ({ ...p, [key === "new_password" ? "new" : "confirm"]: !p[key === "new_password" ? "new" : "confirm"] }))}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "var(--text-muted)" }}
                      tabIndex={-1}
                    >{showPwd[key === "new_password" ? "new" : "confirm"] ? "🙈" : "👁️"}</button>
                  </div>
                  {key === "new_password" && pwd && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: "flex", gap: 3, marginBottom: 4 }}>
                        {[0,1,2,3,4].map(i => (
                          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < score ? colors[Math.min(score-1,4)] : "var(--border)", transition: "background 0.3s" }} />
                        ))}
                      </div>
                      <div style={{ fontSize: 11, color: colors[Math.min(score-1,4)], fontWeight: 600 }}>{labels[Math.min(score-1,4)]}</div>
                    </div>
                  )}
                </div>
              ))}

              <button className="btn btn-primary w-full btn-lg mt-2" onClick={submit} disabled={loading}
                style={{ justifyContent: "center" }}>
                {loading ? "⏳ Enregistrement..." : "🔒 Réinitialiser le mot de passe"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  PAGE DASHBOARD
// ═══════════════════════════════════════════════════════════════
function DashboardPage() {
  const [stats, setStats]     = useState(null);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [sR, stR] = await Promise.all([
        fetch(`${API}/schools`, { headers: authHdrs() }),
        fetch(`${API}/stats`,   { headers: authHdrs() }),
      ]);
      const [sD, stD] = await Promise.all([sR.json(), stR.json()]);
      if (sD.success)  setSchools(sD.schools);
      if (stD.success) setStats(stD.stats);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  if (loading) return (
    <div className="loading-state">
      <div className="spinner"></div>
      <span>Chargement du tableau de bord...</span>
    </div>
  );

  // 5 dernières écoles
  const recent = [...schools].sort((a, b) => b.id - a.id).slice(0, 5);

  return (
    <div>
      {/* Bannière bienvenue */}
      <div className="card mb-3" style={{ background: "linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%)", border: "none", marginBottom: 24 }}>
        <div className="card-body" style={{ padding: "24px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Bienvenue</div>
              <div style={{ color: "#fff", fontSize: 20, fontWeight: 800 }}>Super Administrateur</div>
              <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, marginTop: 4 }}>Accès complet à la plateforme EduNiger</div>
            </div>
            <div style={{ fontSize: 52, opacity: 0.2 }}>🏫</div>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="stats-grid">
        {[
          { icon: "🏫", value: stats?.total ?? "—",            label: "Total écoles",         color: "green" },
          { icon: "✅", value: stats?.actives ?? "—",           label: "Écoles actives",       color: "blue" },
          { icon: "⚠️",  value: stats?.expirent_bientot ?? "—", label: "Expirent dans 30j",   color: "amber" },
          { icon: "❌", value: stats?.expires ?? "—",           label: "Abonnements expirés", color: "red" },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className={`stat-card-icon ${s.color}`}>{s.icon}</div>
            <div className={`stat-card-accent ${s.color}`}></div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Dernières écoles enregistrées */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Dernières écoles enregistrées</div>
            <div className="card-subtitle">{schools.length} école(s) au total</div>
          </div>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>École</th>
                <th>Slug</th>
                <th>Ville</th>
                <th>Statut</th>
                <th>Fin abonnement</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr><td colSpan={5}><div className="empty-state"><div>Aucune école enregistrée</div></div></td></tr>
              ) : recent.map(s => (
                <tr key={s.id}>
                  <td><strong>{s.name}</strong></td>
                  <td style={{ fontFamily: "monospace", color: "var(--text-muted)" }}>{s.slug}</td>
                  <td style={{ color: "var(--text-muted)" }}>{s.city || "—"}</td>
                  <td><StatusBadge status={s.statut_abonnement} /></td>
                  <td style={{ color: "var(--text-muted)" }}>
                    {s.period_end ? new Date(s.period_end).toLocaleDateString("fr-FR") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  PAGE ÉCOLES
// ═══════════════════════════════════════════════════════════════
function SchoolsPage() {
  const [schools, setSchools]         = useState([]);
  const [pricing, setPricing]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [filter, setFilter]           = useState("all");
  const [showOnboard, setShowOnboard] = useState(false);
  const [renewal, setRenewal]         = useState(null);
  const [detail, setDetail]           = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [sR, pR] = await Promise.all([
        fetch(`${API}/schools`, { headers: authHdrs() }),
        fetch(`${API}/pricing`, { headers: authHdrs() }),
      ]);
      const [sD, pD] = await Promise.all([sR.json(), pR.json()]);
      if (sD.success) setSchools(sD.schools);
      if (pD.success) setPricing(pD.pricing);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const toggle = async (id, isActive) => {
    await fetch(`${API}/schools/${id}/toggle`, {
      method: "POST", headers: authHdrs(),
      body: JSON.stringify({ is_active: isActive ? 0 : 1 }),
    });
    load();
  };

  const filtered = schools.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = s.name.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q);
    if (filter === "active")   return matchSearch && s.is_active;
    if (filter === "expiring") return matchSearch && s.statut_abonnement === "Expire bientôt";
    if (filter === "expired")  return matchSearch && s.statut_abonnement === "Expiré";
    return matchSearch;
  });

  return (
    <div>
      {/* Toolbar */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ padding: "16px 20px" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <input className="form-input" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Rechercher une école..." style={{ flex: 1, minWidth: 200, marginBottom: 0 }} />
            <select className="form-input" value={filter} onChange={e => setFilter(e.target.value)}
              style={{ width: "auto", marginBottom: 0 }}>
              <option value="all">Toutes les écoles</option>
              <option value="active">Actives uniquement</option>
              <option value="expiring">Expirent bientôt</option>
              <option value="expired">Expirées</option>
            </select>
            <button className="btn btn-primary" onClick={() => setShowOnboard(true)}>
              + Nouvelle école
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Liste des écoles</div>
            <div className="card-subtitle">{filtered.length} résultat(s)</div>
          </div>
        </div>
        <div className="table-wrapper">
          {loading ? (
            <div className="loading-state"><div className="spinner"></div><span>Chargement...</span></div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>École</th>
                  <th>Slug</th>
                  <th>Ville</th>
                  <th>Statut</th>
                  <th>Jours restants</th>
                  <th>Fin abonnement</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7}>
                    <div className="empty-state">
                      <div className="empty-state-icon">🏫</div>
                      <h3>Aucune école trouvée</h3>
                    </div>
                  </td></tr>
                ) : filtered.map(s => (
                  <tr key={s.id}>
                    <td>
                      <strong>{s.name}</strong>
                      {!s.is_active && <div style={{ fontSize: 11, color: "var(--danger)" }}>Suspendu</div>}
                    </td>
                    <td style={{ fontFamily: "monospace", color: "var(--text-muted)" }}>{s.slug}</td>
                    <td style={{ color: "var(--text-muted)" }}>{s.city || "—"}</td>
                    <td><StatusBadge status={s.statut_abonnement} /></td>
                    <td style={{ fontWeight: s.jours_restants <= 30 ? 600 : 400, color: s.jours_restants <= 30 ? "var(--danger)" : "var(--text-muted)" }}>
                      {s.jours_restants != null ? `${s.jours_restants}j` : "—"}
                    </td>
                    <td style={{ color: "var(--text-muted)" }}>
                      {s.period_end ? new Date(s.period_end).toLocaleDateString("fr-FR") : "—"}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-secondary" style={{ fontSize: 12, padding: "4px 10px" }} onClick={() => setDetail(s)}>Détail</button>
                        <button className="btn btn-secondary" style={{ fontSize: 12, padding: "4px 10px", color: "var(--primary)", borderColor: "var(--primary)" }} onClick={() => setRenewal(s)}>Renouveler</button>
                        <button className="btn btn-secondary" style={{ fontSize: 12, padding: "4px 10px", color: s.is_active ? "var(--danger)" : "var(--success)", borderColor: s.is_active ? "var(--danger)" : "var(--success)" }} onClick={() => toggle(s.id, s.is_active)}>
                          {s.is_active ? "Suspendre" : "Activer"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showOnboard && <OnboardModal pricing={pricing} onClose={() => setShowOnboard(false)} onSuccess={load} />}
      {renewal     && <RenewalModal school={renewal} pricing={pricing} onClose={() => setRenewal(null)} onSuccess={load} />}
      {detail      && <DetailModal school={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  PAGE TARIFICATION
// ═══════════════════════════════════════════════════════════════
function PricingPage() {
  const [pricing, setPricing]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [form, setForm]         = useState({ installation_fee: "", annual_fee: "", note: "" });
  const [success, setSuccess]   = useState("");
  const [err, setErr]           = useState("");

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/pricing`, { headers: authHdrs() });
      const d = await r.json();
      if (d.success) {
        setPricing(d.pricing);
        setForm({ installation_fee: d.pricing.installation_fee, annual_fee: d.pricing.annual_fee, note: d.pricing.note || "" });
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const save = async () => {
    setErr(""); setSuccess(""); setSaving(true);
    try {
      const r = await fetch(`${API}/pricing`, { method: "PUT", headers: authHdrs(), body: JSON.stringify(form) });
      const d = await r.json();
      if (d.success) { setSuccess("Tarification mise à jour avec succès !"); load(); }
      else setErr(d.message || "Erreur");
    } catch { setErr("Impossible de contacter le serveur"); }
    setSaving(false);
  };

  if (loading) return <div className="loading-state"><div className="spinner"></div><span>Chargement...</span></div>;

  return (
    <div style={{ maxWidth: 600 }}>
      {/* Tarif actuel */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div>
            <div className="card-title">Tarif en vigueur</div>
            <div className="card-subtitle">Tarification actuelle appliquée aux nouvelles écoles</div>
          </div>
          <span className="badge badge-success">✓ Actif</span>
        </div>
        <div className="card-body">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { label: "Frais d'installation", value: `${Number(pricing?.installation_fee).toLocaleString()} FCFA`, icon: "🔧" },
              { label: "Abonnement annuel",    value: `${Number(pricing?.annual_fee).toLocaleString()} FCFA`,      icon: "📅" },
            ].map(item => (
              <div key={item.label} style={{ background: "var(--bg)", borderRadius: 12, padding: "16px 20px" }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--primary)" }}>{item.value}</div>
              </div>
            ))}
          </div>
          {pricing?.note && (
            <div style={{ marginTop: 16, padding: "10px 14px", background: "var(--bg)", borderRadius: 8, fontSize: 13, color: "var(--text-muted)" }}>
              📝 {pricing.note}
            </div>
          )}
        </div>
      </div>

      {/* Formulaire modification */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Modifier la tarification</div>
            <div className="card-subtitle">Un nouvel enregistrement sera créé (historique conservé)</div>
          </div>
        </div>
        <div className="card-body">
          {success && <div className="alert alert-success" style={{ marginBottom: 16 }}>✅ {success}</div>}
          {err     && <div className="alert alert-danger"  style={{ marginBottom: 16 }}>⚠️ {err}</div>}

          <div className="form-group">
            <label className="form-label">Frais d'installation (FCFA) *</label>
            <input type="number" className="form-input" value={form.installation_fee}
              onChange={e => setForm(p => ({ ...p, installation_fee: Number(e.target.value) }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Abonnement annuel (FCFA) *</label>
            <input type="number" className="form-input" value={form.annual_fee}
              onChange={e => setForm(p => ({ ...p, annual_fee: Number(e.target.value) }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Note (facultatif)</label>
            <input type="text" className="form-input" value={form.note}
              onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
              placeholder="ex: Tarif lancement 2026" />
          </div>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? "⏳ Enregistrement..." : "✓ Enregistrer le nouveau tarif"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  COMPOSANTS PARTAGÉS
// ═══════════════════════════════════════════════════════════════
function StatusBadge({ status }) {
  const map = {
    "Actif":          { cls: "badge-success", label: "Actif" },
    "Expire bientôt": { cls: "badge-warning", label: "Expire bientôt" },
    "Expiré":         { cls: "badge-danger",  label: "Expiré" },
  };
  const s = map[status] || { cls: "badge-neutral", label: status || "Inactif" };
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}

function ModalWrap({ children, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="card" style={{ width: 460, maxHeight: "90vh", overflowY: "auto", margin: 0 }}>
        {children}
      </div>
    </div>
  );
}

function OnboardModal({ pricing, onClose, onSuccess }) {
  const [form, setForm] = useState({ name: "", slug: "", email: "", phone: "", city: "", payment_method: "nita", install_ref: "", annual_ref: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");

  const field = (label, key, type = "text", placeholder = "") => (
    <div className="form-group" key={key}>
      <label className="form-label">{label}</label>
      <input type={type} className="form-input" value={form[key]} placeholder={placeholder}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
    </div>
  );

  const submit = async () => {
    if (!form.name || !form.slug || !form.install_ref || !form.annual_ref)
      return setErr("Nom, slug et références de paiement sont obligatoires");
    setLoading(true); setErr("");
    try {
      const r = await fetch(`${API}/schools/onboard`, { method: "POST", headers: authHdrs(), body: JSON.stringify(form) });
      const d = await r.json();
      if (d.success) { onSuccess(); onClose(); }
      else setErr(d.message || "Erreur");
    } catch { setErr("Impossible de contacter le serveur"); }
    setLoading(false);
  };

  return (
    <ModalWrap onClose={onClose}>
      <div className="card-header">
        <div>
          <div className="card-title">Nouvelle école</div>
          <div className="card-subtitle">Onboarding et activation immédiate</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)" }}>×</button>
      </div>
      <div className="card-body">
        {err && <div className="alert alert-danger" style={{ marginBottom: 16 }}>⚠️ {err}</div>}
        {pricing && (
          <div className="alert alert-success" style={{ marginBottom: 16, fontSize: 13 }}>
            💳 Installation : <strong>{Number(pricing.installation_fee).toLocaleString()} FCFA</strong> + Annuel : <strong>{Number(pricing.annual_fee).toLocaleString()} FCFA</strong>
          </div>
        )}
        {field("Nom de l'école *",        "name",           "text", "Lycée National Bosso")}
        {field("Slug (identifiant URL) *", "slug",           "text", "lycee-bosso")}
        {field("Email",                    "email",          "email","contact@ecole.ne")}
        {field("Téléphone",                "phone",          "tel",  "+227 90 00 00 00")}
        {field("Ville",                    "city",           "text", "Niamey")}
        <div className="form-group">
          <label className="form-label">Moyen de paiement</label>
          <select className="form-input" value={form.payment_method} onChange={e => setForm(p => ({ ...p, payment_method: e.target.value }))}>
            <option value="nita">NITA</option>
            <option value="amana">Amana</option>
            <option value="virement">Virement bancaire</option>
            <option value="especes">Espèces</option>
          </select>
        </div>
        {field("Réf. paiement installation *", "install_ref", "text", "NITA-2026-00001")}
        {field("Réf. paiement annuel *",        "annual_ref",  "text", "NITA-2026-00002")}
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>Annuler</button>
          <button className="btn btn-primary" onClick={submit} disabled={loading} style={{ flex: 2 }}>
            {loading ? "⏳ Création..." : "✓ Créer et activer l'école"}
          </button>
        </div>
      </div>
    </ModalWrap>
  );
}

function RenewalModal({ school, pricing, onClose, onSuccess }) {
  const [form, setForm]       = useState({ payment_method: "nita", payment_ref: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");

  const submit = async () => {
    if (!form.payment_ref) return setErr("Référence de paiement requise");
    setLoading(true); setErr("");
    try {
      const r = await fetch(`${API}/schools/${school.id}/renew`, { method: "POST", headers: authHdrs(), body: JSON.stringify(form) });
      const d = await r.json();
      if (d.success) { onSuccess(); onClose(); }
      else setErr(d.message || "Erreur");
    } catch { setErr("Impossible de contacter le serveur"); }
    setLoading(false);
  };

  return (
    <ModalWrap onClose={onClose}>
      <div className="card-header">
        <div>
          <div className="card-title">Renouveler l'abonnement</div>
          <div className="card-subtitle">{school.name}</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)" }}>×</button>
      </div>
      <div className="card-body">
        {err && <div className="alert alert-danger" style={{ marginBottom: 16 }}>⚠️ {err}</div>}
        {pricing && (
          <div style={{ background: "var(--bg)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-muted)" }}>Montant renouvellement</span>
            <strong style={{ color: "var(--primary)" }}>{Number(pricing.annual_fee).toLocaleString()} FCFA</strong>
          </div>
        )}
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
          <label className="form-label">Référence paiement *</label>
          <input type="text" className="form-input" value={form.payment_ref}
            onChange={e => setForm(p => ({ ...p, payment_ref: e.target.value }))}
            placeholder="NITA-2026-00567" />
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>Annuler</button>
          <button className="btn btn-primary" onClick={submit} disabled={loading} style={{ flex: 2 }}>
            {loading ? "⏳ Enregistrement..." : "✓ Confirmer le renouvellement"}
          </button>
        </div>
      </div>
    </ModalWrap>
  );
}

function DetailModal({ school, onClose }) {
  return (
    <ModalWrap onClose={onClose}>
      <div className="card-header">
        <div>
          <div className="card-title">{school.name}</div>
          <div className="card-subtitle">Détails de l'école</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)" }}>×</button>
      </div>
      <div className="card-body">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px" }}>
          {[
            ["Slug",              school.slug],
            ["Ville",             school.city || "—"],
            ["Email",             school.email || "—"],
            ["Téléphone",         school.phone || "—"],
            ["Début abonnement",  school.period_start ? new Date(school.period_start).toLocaleDateString("fr-FR") : "—"],
            ["Fin abonnement",    school.period_end   ? new Date(school.period_end).toLocaleDateString("fr-FR")   : "—"],
            ["Jours restants",    school.jours_restants != null ? `${school.jours_restants} jours` : "—"],
            ["Statut",            <StatusBadge key="s" status={school.statut_abonnement} />],
          ].map(([label, val]) => (
            <div key={label}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 3 }}>{label}</div>
              <div style={{ fontWeight: 500 }}>{val}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 20, padding: "10px 14px", background: "var(--bg)", borderRadius: 8, fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace" }}>
          🌐 {school.slug}.eduniger.com
        </div>
      </div>
    </ModalWrap>
  );
}

// ═══════════════════════════════════════════════════════════════
//  EXPORT PRINCIPAL
// ═══════════════════════════════════════════════════════════════
export default function SuperAdmin() {
  const [admin, setAdmin] = useState(() => {
    const token = localStorage.getItem("sa_token");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return { name: payload.email || "Admin", email: payload.email };
    } catch { return { name: "Admin" }; }
  });
  const [page, setPage] = useState("dashboard");
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!admin) return;
    const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:3000/api");
    fetch(`${baseUrl}/school-requests/pending-count`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("sa_token")}` }
    }).then(r => r.json()).then(d => { if (d.success) setPendingCount(d.count); }).catch(() => {});
  }, [admin]);

  const logout = () => { localStorage.removeItem("sa_token"); setAdmin(null); };

  if (!admin) return <LoginPage onLogin={setAdmin} />;

  return (
    <SuperAdminLayout admin={admin} onLogout={logout} page={page} setPage={setPage} pendingCount={pendingCount}>
      {page === "dashboard" && <DashboardPage />}
      {page === "demandes"  && <DemandesPage onCountChange={setPendingCount} />}
      {page === "schools"   && <SchoolsPage />}
      {page === "pricing"   && <PricingPage />}
      {page === "profil"    && <ProfilPage />}
    </SuperAdminLayout>
  );
}