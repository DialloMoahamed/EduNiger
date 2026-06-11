const db = require("../config/database");
const smsService = require("../utils/smsService");

// Obtenir les présences
exports.getPresences = async (req, res) => {
  try {
    const { classe_id, date, eleve_id } = req.query;

    let query = `
      SELECT p.*,
             e.nom as eleve_nom, e.prenom as eleve_prenom, e.matricule,
             c.nom as classe_nom,
             u.nom as created_by_nom,
             m.nom as matiere_nom
      FROM presences p
      JOIN eleves e ON p.eleve_id = e.id
      JOIN classes c ON p.classe_id = c.id
      LEFT JOIN users u ON p.created_by = u.id
      LEFT JOIN matieres m ON p.matiere_id = m.id
      WHERE p.tenant_id = ?
    `;
    const params = [req.tenantId];

    if (classe_id) { query += " AND p.classe_id = ?"; params.push(classe_id); }
    if (date)      { query += " AND p.date = ?";      params.push(date); }
    if (eleve_id)  { query += " AND p.eleve_id = ?";  params.push(eleve_id); }

    query += " ORDER BY p.date DESC, p.creneau_horaire, e.nom";

    const [presences] = await db.query(query, params);
    res.json({ success: true, count: presences.length, presences });
  } catch (error) {
    console.error("Erreur getPresences:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// Enregistrer les présences multi-cours
exports.markPresencesMulti = async (req, res) => {
  try {
    const { classe_id, date, matiere_id, creneau_horaire, presences } = req.body;

    if (!classe_id || !date || !presences || !Array.isArray(presences))
      return res.status(400).json({ success: false, message: "Données invalides" });

    await db.query(
      "DELETE FROM presences WHERE classe_id = ? AND date = ? AND matiere_id = ? AND creneau_horaire = ? AND tenant_id = ?",
      [classe_id, date, matiere_id || null, creneau_horaire || null, req.tenantId]
    );

    const values = presences.map((p) => [
      req.tenantId, p.eleve_id, classe_id, date,
      p.statut || "present", p.motif || null,
      matiere_id || null, creneau_horaire || null, req.user.id,
    ]);

    if (values.length > 0) {
      await db.query(
        `INSERT INTO presences (tenant_id, eleve_id, classe_id, date, statut, motif, matiere_id, creneau_horaire, created_by)
         VALUES ?`,
        [values]
      );
    }

    // SMS absences
    const absents = presences.filter((p) => p.statut === "absent");
    for (const absent of absents) {
      const [eleves] = await db.query(
        "SELECT telephone_parent, nom, prenom FROM eleves WHERE id = ? AND tenant_id = ?",
        [absent.eleve_id, req.tenantId]
      );
      if (eleves.length > 0 && eleves[0].telephone_parent) {
        const [matiereRow] = matiere_id
          ? await db.query("SELECT nom FROM matieres WHERE id = ?", [matiere_id])
          : [[]];
        const matNom = matiereRow[0]?.nom ? ` en ${matiereRow[0].nom}` : "";
        const message = `Absence de ${eleves[0].prenom} ${eleves[0].nom}${matNom} le ${date}${creneau_horaire ? ` (${creneau_horaire})` : ""}`;
        await db.query(
          `INSERT INTO notifications (tenant_id, telephone, message, type, eleve_id) VALUES (?, ?, ?, 'absence', ?)`,
          [req.tenantId, eleves[0].telephone_parent, message, absent.eleve_id]
        );
      }
    }

    // SMS retards
    const retards = presences.filter((p) => p.statut === "retard");
    const [matiereInfos] = matiere_id
      ? await db.query("SELECT nom FROM matieres WHERE id = ?", [matiere_id])
      : [[]];
    const matNomRetard = matiereInfos[0]?.nom || null;

    for (const retard of retards) {
      const [eleveRows] = await db.query(
        "SELECT * FROM eleves WHERE id = ? AND tenant_id = ?",
        [retard.eleve_id, req.tenantId]
      );
      if (eleveRows.length > 0) {
        smsService.smsRetard({
          eleve: eleveRows[0], date,
          matiere: matNomRetard, creneau: creneau_horaire || null,
        }).catch((err) => console.error("SMS retard error:", err));
      }
    }

    res.json({ success: true, message: "Présences enregistrées avec succès", absents: absents.length });
  } catch (error) {
    console.error("Erreur markPresencesMulti:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// Ancien endpoint (compatibilité)
exports.markPresences = async (req, res) => {
  try {
    const { classe_id, date, presences } = req.body;

    if (!classe_id || !date || !presences || !Array.isArray(presences))
      return res.status(400).json({ success: false, message: "Données invalides" });

    await db.query(
      "DELETE FROM presences WHERE classe_id = ? AND date = ? AND matiere_id IS NULL AND tenant_id = ?",
      [classe_id, date, req.tenantId]
    );

    const values = presences.map((p) => [
      req.tenantId, p.eleve_id, classe_id, date,
      p.statut || "present", p.motif || null, null, null, req.user.id,
    ]);

    if (values.length > 0) {
      await db.query(
        `INSERT INTO presences (tenant_id, eleve_id, classe_id, date, statut, motif, matiere_id, creneau_horaire, created_by)
         VALUES ?`,
        [values]
      );
    }

    const absents = presences.filter((p) => p.statut === "absent");
    for (const absent of absents) {
      const [eleves] = await db.query(
        "SELECT telephone_parent, nom, prenom FROM eleves WHERE id = ? AND tenant_id = ?",
        [absent.eleve_id, req.tenantId]
      );
      if (eleves.length > 0 && eleves[0].telephone_parent) {
        const message = `Absence de ${eleves[0].prenom} ${eleves[0].nom} le ${date}`;
        await db.query(
          `INSERT INTO notifications (tenant_id, telephone, message, type, eleve_id) VALUES (?, ?, ?, 'absence', ?)`,
          [req.tenantId, eleves[0].telephone_parent, message, absent.eleve_id]
        );
      }
    }

    res.json({ success: true, message: "Présences enregistrées avec succès", absents: absents.length });
  } catch (error) {
    console.error("Erreur markPresences:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// Historique du jour par matière/créneau
exports.getHistoriqueJour = async (req, res) => {
  try {
    const { classe_id, date } = req.query;
    if (!classe_id || !date)
      return res.status(400).json({ success: false, message: "classe_id et date requis" });

    const [rows] = await db.query(
      `SELECT p.*, e.nom as eleve_nom, e.prenom as eleve_prenom, m.nom as matiere_nom
       FROM presences p
       JOIN eleves e ON p.eleve_id = e.id
       LEFT JOIN matieres m ON p.matiere_id = m.id
       WHERE p.classe_id = ? AND p.date = ? AND p.tenant_id = ?
       ORDER BY p.creneau_horaire, m.nom, e.nom`,
      [classe_id, date, req.tenantId]
    );

    res.json({ success: true, historique: rows });
  } catch (error) {
    console.error("Erreur getHistoriqueJour:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// Stats présence d'un élève
exports.getElevePresenceStats = async (req, res) => {
  try {
    const [stats] = await db.query(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN statut = 'present' THEN 1 ELSE 0 END) as presents,
        SUM(CASE WHEN statut = 'absent' THEN 1 ELSE 0 END) as absents,
        SUM(CASE WHEN statut = 'retard' THEN 1 ELSE 0 END) as retards,
        SUM(CASE WHEN statut = 'absent_justifie' THEN 1 ELSE 0 END) as absents_justifies
       FROM presences WHERE eleve_id = ? AND tenant_id = ?`,
      [req.params.eleve_id, req.tenantId]
    );
    res.json({ success: true, stats: stats[0] });
  } catch (error) {
    console.error("Erreur getElevePresenceStats:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// Stats présence d'une classe
exports.getClassePresenceStats = async (req, res) => {
  try {
    const { date } = req.query;
    let query = `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN statut = 'present' THEN 1 ELSE 0 END) as presents,
        SUM(CASE WHEN statut = 'absent' THEN 1 ELSE 0 END) as absents,
        SUM(CASE WHEN statut = 'retard' THEN 1 ELSE 0 END) as retards
      FROM presences WHERE classe_id = ? AND tenant_id = ?
    `;
    const params = [req.params.classe_id, req.tenantId];
    if (date) { query += " AND date = ?"; params.push(date); }

    const [stats] = await db.query(query, params);
    res.json({ success: true, stats: stats[0] });
  } catch (error) {
    console.error("Erreur getClassePresenceStats:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// Télécharger la liste simple des élèves d'une classe
exports.downloadListeClasse = async (req, res) => {
  try {
    const { classe_id } = req.params;
    const { generateListeClassePDF } = require("../utils/generateListePDF");

    const [classes] = await db.query(
      `SELECT c.*, u.nom as enseignant_nom, u.prenom as enseignant_prenom,
              (SELECT COUNT(*) FROM eleves WHERE classe_id = c.id AND tenant_id = ?) as nb_eleves
       FROM classes c LEFT JOIN users u ON c.enseignant_id = u.id
       WHERE c.id = ? AND c.tenant_id = ?`,
      [req.tenantId, classe_id, req.tenantId]
    );
    if (classes.length === 0)
      return res.status(404).json({ success: false, message: "Classe non trouvée" });

    const [ecoles] = await db.query("SELECT * FROM schools WHERE id = ? LIMIT 1", [req.tenantId]);
    const ecole = ecoles[0] || {};

    const [eleves] = await db.query(
      "SELECT * FROM eleves WHERE classe_id = ? AND tenant_id = ? ORDER BY nom, prenom",
      [classe_id, req.tenantId]
    );

    const pdfBuffer = await generateListeClassePDF({ ecole, classe: classes[0], eleves });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="liste_${classes[0].nom.replace(/\s+/g, "_")}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Erreur downloadListeClasse:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// Feuille d'appel PDF
exports.downloadAppelPDF = async (req, res) => {
  try {
    const { classe_id, date } = req.params;
    const { generateFeuilleAppelPDF } = require("../utils/generateListePDF");

    const [classes] = await db.query(
      `SELECT c.*, u.nom as enseignant_nom, u.prenom as enseignant_prenom
       FROM classes c LEFT JOIN users u ON c.enseignant_id = u.id
       WHERE c.id = ? AND c.tenant_id = ?`,
      [classe_id, req.tenantId]
    );
    if (classes.length === 0)
      return res.status(404).json({ success: false, message: "Classe non trouvée" });

    const [ecoles] = await db.query("SELECT * FROM schools WHERE id = ? LIMIT 1", [req.tenantId]);
    const ecole = ecoles[0] || {};

    const [eleves] = await db.query(
      "SELECT * FROM eleves WHERE classe_id = ? AND tenant_id = ? ORDER BY nom, prenom",
      [classe_id, req.tenantId]
    );

    const [presRows] = await db.query(
      "SELECT eleve_id, statut FROM presences WHERE classe_id = ? AND date = ? AND tenant_id = ?",
      [classe_id, date, req.tenantId]
    );
    const presencesMap = {};
    presRows.forEach((p) => { presencesMap[p.eleve_id] = p.statut; });

    const pdfBuffer = await generateFeuilleAppelPDF({ ecole, classe: classes[0], eleves, presences: presencesMap, date });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="appel_${classes[0].nom.replace(/\s+/g, "_")}_${date}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Erreur downloadAppelPDF:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};