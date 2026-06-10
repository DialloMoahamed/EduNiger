const db = require("../config/database");
const generateBulletinPDF = require("../utils/generateBulletin");
const smsService = require("../utils/smsService");

// Obtenir les notes
exports.getNotes = async (req, res) => {
  try {
    const { classe_id, eleve_id, matiere_id, periode } = req.query;
    let query = `
      SELECT n.*,
             e.nom as eleve_nom, e.prenom as eleve_prenom, e.matricule,
             m.nom as matiere_nom, m.coefficient,
             c.nom as classe_nom
      FROM notes n
      JOIN eleves e ON n.eleve_id = e.id
      JOIN matieres m ON n.matiere_id = m.id
      JOIN classes c ON n.classe_id = c.id
      WHERE n.tenant_id = ?
    `;
    const params = [req.tenantId];

    if (classe_id)  { query += " AND n.classe_id = ?";  params.push(classe_id); }
    if (eleve_id)   { query += " AND n.eleve_id = ?";   params.push(eleve_id); }
    if (matiere_id) { query += " AND n.matiere_id = ?"; params.push(matiere_id); }
    if (periode)    { query += " AND n.periode = ?";    params.push(periode); }

    query += " ORDER BY e.nom, m.nom";
    const [notes] = await db.query(query, params);
    res.json({ success: true, count: notes.length, notes });
  } catch (error) {
    console.error("Erreur getNotes:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// Créer une note
exports.createNote = async (req, res) => {
  try {
    const { eleve_id, matiere_id, classe_id, type_evaluation, note, note_sur, periode, date_evaluation } = req.body;

    if (!eleve_id || !matiere_id || !classe_id || !type_evaluation || note === undefined || !periode)
      return res.status(400).json({ success: false, message: "Champs obligatoires manquants" });

    const [result] = await db.query(
      `INSERT INTO notes (tenant_id, eleve_id, matiere_id, classe_id, type_evaluation, note, note_sur, periode, date_evaluation, created_by)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [req.tenantId, eleve_id, matiere_id, classe_id, type_evaluation, note, note_sur || 20, periode, date_evaluation, req.user.id]
    );

    const [newNote] = await db.query("SELECT * FROM notes WHERE id = ?", [result.insertId]);
    res.status(201).json({ success: true, message: "Note enregistrée", note: newNote[0] });
  } catch (error) {
    console.error("Erreur createNote:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// Modifier une note
exports.updateNote = async (req, res) => {
  try {
    const { eleve_id, matiere_id, classe_id, type_evaluation, note, note_sur, periode, date_evaluation } = req.body;

    const [result] = await db.query(
      `UPDATE notes SET eleve_id=?, matiere_id=?, classe_id=?, type_evaluation=?,
       note=?, note_sur=?, periode=?, date_evaluation=? WHERE id=? AND tenant_id=?`,
      [eleve_id, matiere_id, classe_id, type_evaluation, note, note_sur || 20, periode, date_evaluation, req.params.id, req.tenantId]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: "Note non trouvée" });

    const [updated] = await db.query("SELECT * FROM notes WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Note modifiée", note: updated[0] });
  } catch (error) {
    console.error("Erreur updateNote:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// Supprimer une note
exports.deleteNote = async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM notes WHERE id = ? AND tenant_id = ?",
      [req.params.id, req.tenantId]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: "Note non trouvée" });

    res.json({ success: true, message: "Note supprimée" });
  } catch (error) {
    console.error("Erreur deleteNote:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// Moyenne d'un élève
exports.getEleveMoyenne = async (req, res) => {
  try {
    const { periode } = req.query;
    const eleve_id = req.params.eleve_id;

    const [notes] = await db.query(
      `SELECT n.note, n.note_sur, m.coefficient, m.nom as matiere
       FROM notes n JOIN matieres m ON n.matiere_id = m.id
       WHERE n.eleve_id = ? AND n.periode = ? AND n.tenant_id = ?`,
      [eleve_id, periode, req.tenantId]
    );

    const byMatiere = {};
    notes.forEach((n) => {
      if (!byMatiere[n.matiere]) byMatiere[n.matiere] = { notes: [], coef: n.coefficient };
      byMatiere[n.matiere].notes.push((n.note / n.note_sur) * 20);
    });

    let totalPts = 0, totalCoef = 0;
    const moyennes = Object.entries(byMatiere).map(([matiere, d]) => {
      const moy = d.notes.reduce((a, b) => a + b, 0) / d.notes.length;
      totalPts += moy * d.coef;
      totalCoef += d.coef;
      return { matiere, moyenne: moy.toFixed(2), coefficient: d.coef };
    });

    const moyenne_generale = totalCoef > 0 ? (totalPts / totalCoef).toFixed(2) : 0;
    res.json({ success: true, eleve_id, periode, moyenne_generale, moyennes });
  } catch (error) {
    console.error("Erreur getEleveMoyenne:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// Générer le bulletin PDF
exports.generateBulletin = async (req, res) => {
  try {
    const { eleve_id, periode } = req.params;

    const [eleves] = await db.query(
      `SELECT e.*, c.nom as classe_nom, c.niveau
       FROM eleves e JOIN classes c ON e.classe_id = c.id
       WHERE e.id = ? AND e.tenant_id = ?`,
      [eleve_id, req.tenantId]
    );
    if (eleves.length === 0)
      return res.status(404).json({ success: false, message: "Élève non trouvé" });
    const eleve = eleves[0];

    // Profil école depuis la table schools (SaaS) au lieu de ecole
    const [ecoles] = await db.query("SELECT * FROM schools WHERE id = ? LIMIT 1", [req.tenantId]);
    const ecole = ecoles[0] || {};

    const [notes] = await db.query(
      `SELECT n.note, n.note_sur, m.nom as matiere, m.coefficient, m.id as matiere_id
       FROM notes n JOIN matieres m ON n.matiere_id = m.id
       WHERE n.eleve_id = ? AND n.periode = ? AND n.tenant_id = ? ORDER BY m.nom`,
      [eleve_id, periode, req.tenantId]
    );

    const [moyClasse] = await db.query(
      `SELECT m.nom as matiere, AVG((n.note / n.note_sur) * 20) as moy_classe
       FROM notes n
       JOIN matieres m ON n.matiere_id = m.id
       JOIN eleves e ON n.eleve_id = e.id
       WHERE e.classe_id = ? AND n.periode = ? AND n.tenant_id = ?
       GROUP BY m.id`,
      [eleve.classe_id, periode, req.tenantId]
    );
    const moyClasseMap = {};
    moyClasse.forEach((r) => { moyClasseMap[r.matiere] = r.moy_classe; });

    const byMatiere = {};
    notes.forEach((n) => {
      if (!byMatiere[n.matiere]) byMatiere[n.matiere] = { notes: [], coef: n.coefficient };
      byMatiere[n.matiere].notes.push((n.note / n.note_sur) * 20);
    });

    let totalPts = 0, totalCoef = 0;
    const detailsNotes = Object.entries(byMatiere).map(([matiere, d]) => {
      const moy = d.notes.reduce((a, b) => a + b, 0) / d.notes.length;
      totalPts += moy * d.coef;
      totalCoef += d.coef;
      return {
        matiere,
        moyenne: moy.toFixed(2),
        coefficient: d.coef,
        moy_classe: moyClasseMap[matiere] ? parseFloat(moyClasseMap[matiere]).toFixed(2) : null,
      };
    });

    const moyenne_generale = totalCoef > 0 ? (totalPts / totalCoef).toFixed(2) : "0.00";

    const [tousEleves] = await db.query(
      "SELECT id FROM eleves WHERE classe_id = ? AND tenant_id = ?",
      [eleve.classe_id, req.tenantId]
    );
    const classement = [];
    for (const el of tousEleves) {
      const [ns] = await db.query(
        `SELECT n.note, n.note_sur, m.coefficient
         FROM notes n JOIN matieres m ON n.matiere_id = m.id
         WHERE n.eleve_id = ? AND n.periode = ? AND n.tenant_id = ?`,
        [el.id, periode, req.tenantId]
      );
      let tp = 0, tc = 0;
      ns.forEach((n) => { const v = (n.note / n.note_sur) * 20; tp += v * n.coefficient; tc += n.coefficient; });
      classement.push({ id: el.id, moy: tc > 0 ? tp / tc : 0 });
    }
    classement.sort((a, b) => b.moy - a.moy);
    const rang = classement.findIndex((e) => e.id == eleve_id) + 1;

    const { filename, filepath } = await generateBulletinPDF({
      eleve, ecole, detailsNotes, moyenne_generale, rang,
      effectif: classement.length, periode,
    });

    smsService.smsBulletinDisponible({ eleve, moyenne_generale, periode })
      .catch((err) => console.error("SMS bulletin error:", err));

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    const fileStream = require("fs").createReadStream(filepath);
    fileStream.pipe(res);
    fileStream.on("error", () => {
      res.status(500).json({ success: false, message: "Erreur lecture PDF" });
    });
  } catch (error) {
    console.error("Erreur generateBulletin:", error);
    res.status(500).json({ success: false, message: "Erreur lors de la génération du bulletin" });
  }
};