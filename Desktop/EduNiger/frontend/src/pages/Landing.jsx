import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// ── Composant principal ────────────────────────────────────────
export default function Landing() {
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    document.title = "EduNiger — Gestion scolaire pour l'Afrique de l'Ouest";
  }, []);

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#1A202C", overflowX: "hidden" }}>
      <HeroSection onCTA={() => setShowForm(true)} />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection onCTA={() => setShowForm(true)} />
      <TestimonialsSection />
      <CTASection onCTA={() => setShowForm(true)} />
      <FooterSection />
      {showForm && <InscriptionModal onClose={() => setShowForm(false)} />}
    </div>
  );
}

// ── Hero ───────────────────────────────────────────────────────
function HeroSection({ onCTA }) {
  return (
    <section style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #073D24 0%, #0A5C36 60%, #12854F 100%)",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Navbar */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 60px", position: "relative", zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 32 }}>📚</span>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 22, letterSpacing: "-0.5px" }}>EduNiger</span>
        </div>
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          <a href="#fonctionnalites" style={{ color: "rgba(255,255,255,0.75)", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>Fonctionnalités</a>
          <a href="#tarifs" style={{ color: "rgba(255,255,255,0.75)", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>Tarifs</a>
          <button onClick={onCTA} style={{
            background: "#F5A623", color: "#073D24", border: "none", borderRadius: 30,
            padding: "10px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer",
          }}>
            Inscrire mon école
          </button>
        </div>
      </nav>

      {/* Décor cercles */}
      <div style={{
        position: "absolute", top: -100, right: -100, width: 500, height: 500,
        borderRadius: "50%", background: "rgba(245,166,35,0.06)", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: -150, left: -80, width: 400, height: 400,
        borderRadius: "50%", background: "rgba(18,133,79,0.3)", pointerEvents: "none",
      }} />

      {/* Contenu hero */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", textAlign: "center", padding: "40px 40px 80px",
        position: "relative", zIndex: 5,
      }}>
        <div style={{
          display: "inline-block", background: "rgba(245,166,35,0.15)", color: "#F5A623",
          border: "1px solid rgba(245,166,35,0.3)", borderRadius: 30, padding: "6px 18px",
          fontSize: 13, fontWeight: 600, marginBottom: 28,
        }}>
          🇳🇪 Conçu pour le système éducatif nigérien
        </div>

        <h1 style={{
          color: "#fff", fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 900,
          lineHeight: 1.1, maxWidth: 800, marginBottom: 24, letterSpacing: "-1px",
        }}>
          La gestion scolaire<br />
          <span style={{ color: "#F5A623" }}>simple et moderne</span><br />
          pour votre établissement
        </h1>

        <p style={{
          color: "rgba(255,255,255,0.7)", fontSize: 18, maxWidth: 560, lineHeight: 1.7, marginBottom: 40,
        }}>
          Gérez élèves, notes, présences et bulletins depuis une seule plateforme.
          Accessible aux enseignants et aux parents, 100 % en français.
        </p>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <button onClick={onCTA} style={{
            background: "#F5A623", color: "#073D24", border: "none", borderRadius: 40,
            padding: "16px 36px", fontWeight: 800, fontSize: 16, cursor: "pointer",
            boxShadow: "0 8px 30px rgba(245,166,35,0.4)",
          }}>
            Démarrer gratuitement →
          </button>
          <a href="#fonctionnalites" style={{
            background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 40, padding: "16px 36px", fontWeight: 600, fontSize: 16,
            textDecoration: "none", display: "inline-block",
          }}>
            Voir les fonctionnalités
          </a>
        </div>

        {/* Stats */}
        <div style={{
          display: "flex", gap: 48, marginTop: 64, flexWrap: "wrap", justifyContent: "center",
        }}>
          {[
            { n: "500+", l: "Élèves gérés" },
            { n: "15+", l: "Établissements" },
            { n: "3 rôles", l: "Admin · Enseignant · Parent" },
            { n: "100%", l: "En français" },
          ].map(({ n, l }) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ color: "#F5A623", fontSize: 28, fontWeight: 800 }}>{n}</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Features ───────────────────────────────────────────────────
function FeaturesSection() {
  const features = [
    { icon: "👨‍🎓", title: "Gestion des élèves", desc: "Dossiers complets, photos, contacts parents, recherche instantanée. Chaque élève a son profil." },
    { icon: "📝", title: "Notes & Bulletins PDF", desc: "Saisie des évaluations, calcul automatique des moyennes, génération de bulletins officiels en PDF." },
    { icon: "📋", title: "Feuille d'appel", desc: "Appel numérique par classe, suivi des absences et retards, alertes SMS automatiques aux parents." },
    { icon: "📅", title: "Emploi du temps", desc: "Planification des cours, visualisation semaine par semaine, accessible aux enseignants et parents." },
    { icon: "💬", title: "Messagerie interne", desc: "Communication directe entre administration, enseignants et parents. Notifications en temps réel." },
    { icon: "📊", title: "Rapports & Statistiques", desc: "Tableaux de bord avec taux de présence, statistiques par niveau, parité garçons/filles." },
  ];

  return (
    <section id="fonctionnalites" style={{ padding: "100px 60px", background: "#F7F8FA" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{
            display: "inline-block", background: "#E8F5EE", color: "#0A5C36",
            borderRadius: 30, padding: "6px 16px", fontSize: 13, fontWeight: 600, marginBottom: 16,
          }}>Fonctionnalités</div>
          <h2 style={{ fontSize: 40, fontWeight: 800, color: "#1A202C", letterSpacing: "-0.5px" }}>
            Tout ce dont vous avez besoin
          </h2>
          <p style={{ color: "#718096", fontSize: 17, marginTop: 12, maxWidth: 500, margin: "12px auto 0" }}>
            Une plateforme complète pensée pour la réalité des établissements scolaires du Niger.
          </p>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24,
        }}>
          {features.map(({ icon, title, desc }) => (
            <div key={title} style={{
              background: "#fff", borderRadius: 16, padding: "28px 28px",
              border: "1px solid #E2E8F0", transition: "box-shadow 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.1)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
            >
              <div style={{ fontSize: 36, marginBottom: 16 }}>{icon}</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: "#1A202C" }}>{title}</h3>
              <p style={{ color: "#718096", fontSize: 14, lineHeight: 1.7 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Comment ça marche ─────────────────────────────────────────
function HowItWorksSection() {
  const steps = [
    { num: "1", title: "Remplissez le formulaire", desc: "Indiquez le nom de votre école, vos coordonnées et le nombre d'élèves. 2 minutes suffisent." },
    { num: "2", title: "Nous vous contactons", desc: "Notre équipe vous rappelle sous 48h pour valider votre inscription et procéder au paiement." },
    { num: "3", title: "Votre espace est activé", desc: "Vous recevez vos identifiants. Ajoutez vos classes, enseignants et élèves dès le premier jour." },
  ];

  return (
    <section style={{ padding: "100px 60px", background: "#fff" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <div style={{
          display: "inline-block", background: "#E8F5EE", color: "#0A5C36",
          borderRadius: 30, padding: "6px 16px", fontSize: 13, fontWeight: 600, marginBottom: 16,
        }}>Comment démarrer</div>
        <h2 style={{ fontSize: 40, fontWeight: 800, color: "#1A202C", letterSpacing: "-0.5px", marginBottom: 56 }}>
          En service en 48h
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 32 }}>
          {steps.map(({ num, title, desc }) => (
            <div key={num} style={{ textAlign: "center" }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "linear-gradient(135deg, #073D24, #0A5C36)",
                color: "#F5A623", fontSize: 26, fontWeight: 900,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px",
              }}>{num}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{title}</h3>
              <p style={{ color: "#718096", fontSize: 14, lineHeight: 1.7 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Tarifs ─────────────────────────────────────────────────────
function PricingSection({ onCTA }) {
  return (
    <section id="tarifs" style={{ padding: "100px 60px", background: "#F7F8FA" }}>
      <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
        <div style={{
          display: "inline-block", background: "#E8F5EE", color: "#0A5C36",
          borderRadius: 30, padding: "6px 16px", fontSize: 13, fontWeight: 600, marginBottom: 16,
        }}>Tarification</div>
        <h2 style={{ fontSize: 40, fontWeight: 800, color: "#1A202C", letterSpacing: "-0.5px", marginBottom: 12 }}>
          Un tarif simple et transparent
        </h2>
        <p style={{ color: "#718096", fontSize: 16, marginBottom: 48 }}>
          Paiement par NITA, Amana, virement ou espèces.
        </p>

        <div style={{
          background: "#fff", borderRadius: 24, padding: "40px 48px",
          border: "2px solid #0A5C36", boxShadow: "0 20px 60px rgba(10,92,54,0.1)",
          position: "relative",
        }}>
          <div style={{
            position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
            background: "#0A5C36", color: "#fff", borderRadius: 20, padding: "4px 20px",
            fontSize: 12, fontWeight: 700,
          }}>OFFRE DE LANCEMENT</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
            {[
              { label: "Frais d'installation", amount: "50 000", note: "Une seule fois", icon: "🔧" },
              { label: "Abonnement annuel", amount: "75 000", note: "Par an", icon: "📅" },
            ].map(({ label, amount, note, icon }) => (
              <div key={label} style={{ background: "#F7F8FA", borderRadius: 14, padding: "20px 24px", textAlign: "left" }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
                <div style={{ color: "#718096", fontSize: 13, marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#0A5C36" }}>
                  {amount} <span style={{ fontSize: 16, fontWeight: 600 }}>FCFA</span>
                </div>
                <div style={{ color: "#A0AEC0", fontSize: 12, marginTop: 4 }}>{note}</div>
              </div>
            ))}
          </div>

          <ul style={{ listStyle: "none", textAlign: "left", marginBottom: 32, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
            {[
              "Élèves illimités", "Enseignants illimités", "Bulletins PDF inclus",
              "Espace parent inclus", "Support par email", "Mises à jour gratuites",
            ].map(item => (
              <li key={item} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#4A5568" }}>
                <span style={{ color: "#0A5C36", fontWeight: 700 }}>✓</span> {item}
              </li>
            ))}
          </ul>

          <button onClick={onCTA} style={{
            width: "100%", background: "#0A5C36", color: "#fff", border: "none",
            borderRadius: 12, padding: "16px", fontSize: 16, fontWeight: 700, cursor: "pointer",
          }}>
            Inscrire mon établissement →
          </button>
        </div>
      </div>
    </section>
  );
}

// ── Témoignages ────────────────────────────────────────────────
function TestimonialsSection() {
  const testimonials = [
    { nom: "M. Moussa Issoufou", role: "Directeur, Collège Privé Al-Amal · Niamey", text: "EduNiger a transformé notre gestion. Les bulletins sont générés en quelques secondes et les parents reçoivent les résultats directement." },
    { nom: "Mme Fatouma Abdou", role: "Directrice, École Primaire La Réussite · Maradi", text: "L'interface est simple, notre secrétaire a appris à l'utiliser en une heure. Le suivi des absences nous fait gagner un temps précieux." },
  ];

  return (
    <section style={{ padding: "80px 60px", background: "#073D24" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: "#fff", marginBottom: 48 }}>
          Ce que disent nos directeurs
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 24 }}>
          {testimonials.map(({ nom, role, text }) => (
            <div key={nom} style={{
              background: "rgba(255,255,255,0.07)", borderRadius: 16, padding: "28px 32px",
              border: "1px solid rgba(255,255,255,0.1)", textAlign: "left",
            }}>
              <div style={{ color: "#F5A623", fontSize: 28, marginBottom: 16 }}>"</div>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>{text}</p>
              <div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{nom}</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 2 }}>{role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA final ─────────────────────────────────────────────────
function CTASection({ onCTA }) {
  return (
    <section style={{ padding: "100px 60px", background: "#fff", textAlign: "center" }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <div style={{ fontSize: 56, marginBottom: 24 }}>🏫</div>
        <h2 style={{ fontSize: 36, fontWeight: 800, color: "#1A202C", letterSpacing: "-0.5px", marginBottom: 16 }}>
          Prêt à moderniser votre école ?
        </h2>
        <p style={{ color: "#718096", fontSize: 16, lineHeight: 1.7, marginBottom: 40 }}>
          Rejoignez les établissements qui font confiance à EduNiger pour leur gestion quotidienne.
        </p>
        <button onClick={onCTA} style={{
          background: "linear-gradient(135deg, #073D24, #0A5C36)",
          color: "#fff", border: "none", borderRadius: 40, padding: "18px 44px",
          fontSize: 17, fontWeight: 800, cursor: "pointer",
          boxShadow: "0 10px 40px rgba(10,92,54,0.25)",
        }}>
          Envoyer ma demande d'inscription →
        </button>
      </div>
    </section>
  );
}

// ── Footer ─────────────────────────────────────────────────────
function FooterSection() {
  return (
    <footer style={{ background: "#073D24", padding: "40px 60px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 24 }}>📚</span>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>EduNiger</span>
        </div>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
          © 2026 EduNiger — Plateforme SaaS de gestion scolaire · Niger
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          <a href="mailto:contact@eduniger.ne" style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, textDecoration: "none" }}>contact@eduniger.ne</a>
          <a href="tel:+22790000000" style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, textDecoration: "none" }}>+227 90 00 00 00</a>
        </div>
      </div>
    </footer>
  );
}

// ── Modal formulaire d'inscription ────────────────────────────
function InscriptionModal({ onClose }) {
  const [step, setStep]     = useState(1); // 1 = formulaire, 2 = succès
  const [loading, setLoading] = useState(false);
  const [err, setErr]       = useState("");
  const [form, setForm]     = useState({
    name: "", contact_nom: "", contact_prenom: "", email: "",
    phone: "", city: "", type_ecole: "", nb_eleves: "", message: "",
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.name.trim() || !form.contact_nom.trim() || !form.email.trim()) {
      return setErr("Nom de l'école, responsable et email sont obligatoires.");
    }
    setLoading(true); setErr("");
    try {
      const r = await fetch(`${API_BASE}/school-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, nb_eleves: form.nb_eleves ? parseInt(form.nb_eleves) : null }),
      });
      const d = await r.json();
      if (d.success) setStep(2);
      else setErr(d.message || "Erreur lors de l'envoi.");
    } catch { setErr("Impossible de contacter le serveur."); }
    setLoading(false);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 9999, padding: 20,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "#fff", borderRadius: 20, width: "100%", maxWidth: 560,
        maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 80px rgba(0,0,0,0.3)",
      }}>
        {step === 2 ? (
          // ── Succès ──
          <div style={{ textAlign: "center", padding: "60px 40px" }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Demande envoyée !</h2>
            <p style={{ color: "#718096", lineHeight: 1.7, marginBottom: 32 }}>
              Merci pour votre intérêt. Notre équipe vous contactera sous <strong>48h</strong> pour finaliser votre inscription.
            </p>
            <button onClick={onClose} style={{
              background: "#0A5C36", color: "#fff", border: "none",
              borderRadius: 10, padding: "12px 32px", fontWeight: 700, cursor: "pointer",
            }}>Fermer</button>
          </div>
        ) : (
          // ── Formulaire ──
          <>
            <div style={{ padding: "28px 32px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Demande d'inscription</h2>
                <p style={{ color: "#718096", fontSize: 13 }}>Nous vous contacterons sous 48h</p>
              </div>
              <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#A0AEC0" }}>×</button>
            </div>

            <div style={{ padding: "20px 32px 32px" }}>
              {err && (
                <div style={{ background: "#FFF5F5", color: "#C53030", border: "1px solid #FED7D7", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13 }}>
                  ⚠️ {err}
                </div>
              )}

              <fieldset style={{ border: "1px solid #E2E8F0", borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
                <legend style={{ fontSize: 12, fontWeight: 700, color: "#718096", padding: "0 8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Établissement</legend>
                <Field label="Nom de l'établissement *" value={form.name} onChange={v => set("name", v)} placeholder="Lycée National Bosso" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="Ville" value={form.city} onChange={v => set("city", v)} placeholder="Niamey" />
                  <div>
                    <label style={labelStyle}>Type d'école</label>
                    <select value={form.type_ecole} onChange={e => set("type_ecole", e.target.value)} style={inputStyle}>
                      <option value="">— Choisir —</option>
                      <option>École primaire</option>
                      <option>Collège</option>
                      <option>Lycée</option>
                      <option>Collège et Lycée</option>
                      <option>École privée mixte</option>
                      <option>École professionnelle</option>
                      <option>Madrassa</option>
                    </select>
                  </div>
                </div>
                <Field label="Nombre d'élèves (estimation)" value={form.nb_eleves} onChange={v => set("nb_eleves", v)} placeholder="250" type="number" />
              </fieldset>

              <fieldset style={{ border: "1px solid #E2E8F0", borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
                <legend style={{ fontSize: 12, fontWeight: 700, color: "#718096", padding: "0 8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Contact responsable</legend>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="Nom *" value={form.contact_nom} onChange={v => set("contact_nom", v)} placeholder="Diallo" />
                  <Field label="Prénom" value={form.contact_prenom} onChange={v => set("contact_prenom", v)} placeholder="Moussa" />
                </div>
                <Field label="Email *" value={form.email} onChange={v => set("email", v)} placeholder="directeur@ecole.ne" type="email" />
                <Field label="Téléphone" value={form.phone} onChange={v => set("phone", v)} placeholder="+227 90 00 00 00" />
              </fieldset>

              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Message (optionnel)</label>
                <textarea value={form.message} onChange={e => set("message", e.target.value)}
                  placeholder="Précisez vos besoins spécifiques ou posez vos questions..."
                  style={{ ...inputStyle, height: 90, resize: "vertical" }} />
              </div>

              <button onClick={submit} disabled={loading} style={{
                width: "100%", background: loading ? "#A0AEC0" : "#0A5C36",
                color: "#fff", border: "none", borderRadius: 10,
                padding: "14px", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              }}>
                {loading ? "⏳ Envoi en cours..." : "✓ Envoyer ma demande"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#4A5568", marginBottom: 5, marginTop: 12 };
const inputStyle = {
  width: "100%", padding: "9px 12px", border: "1px solid #E2E8F0", borderRadius: 8,
  fontSize: 14, fontFamily: "inherit", outline: "none", background: "#fff",
  color: "#1A202C", boxSizing: "border-box",
};

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} style={inputStyle} />
    </div>
  );
}