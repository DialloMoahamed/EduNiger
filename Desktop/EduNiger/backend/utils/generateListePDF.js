/**
 * EduNiger — Générateur PDF
 *  • Liste des élèves d'une classe (feuille vierge)
 *  • Feuille d'appel avec statuts de présence
 */
const PDFDocument = require('pdfkit');

// ── Helpers couleur ──────────────────────────────────────────
function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  return [parseInt(hex.slice(0,2),16), parseInt(hex.slice(2,4),16), parseInt(hex.slice(4,6),16)];
}
function toHex(r, g, b) {
  return '#' + [r,g,b].map(v => Math.round(v).toString(16).padStart(2,'0')).join('');
}

// ── Labels statut ────────────────────────────────────────────
const STATUT_LABELS = {
  present:          { texte: 'Présent',      hex: '#1a7a4a' },
  absent:           { texte: 'Absent',       hex: '#c0392b' },
  retard:           { texte: 'Retard',       hex: '#b7770d' },
  absent_justifie:  { texte: 'Abs. Justif.', hex: '#1565c0' },
};

// ── En-tête commune ──────────────────────────────────────────
function drawHeader(doc, ecole, classe, titre, sous_titre) {
  const W = 595, PAD = 36;
  const couleur = ecole.couleur_primaire || '#0A5C36';
  const [cr,cg,cb] = hexToRgb(couleur);
  const couleurHex = toHex(cr,cg,cb);

  // Fond blanc
  doc.rect(0, 0, W, 842).fill('#ffffff');

  // Bandes décoratives
  doc.rect(0, 0, W, 6).fill(couleurHex);
  doc.rect(0, 6, 5, 836).fill(couleurHex);
  doc.rect(W - 5, 6, 5, 836).fill(couleurHex);
  doc.rect(0, 836, W, 6).fill(couleurHex);

  let y = 16;

  // ── 3 colonnes header ──
  const CL_X = 41, CL_W = 145;
  const CC_X = 195, CC_W = 210;
  const CR_X = 415, CR_W = 144;

  // Gauche
  doc.fillColor(toHex(80,90,100)).fontSize(7).font('Helvetica');
  doc.text('RÉPUBLIQUE DU NIGER',              CL_X, y,      { width: CL_W });
  doc.text("MINISTÈRE DE L'ÉDUCATION NAT.",    CL_X, y + 11, { width: CL_W });
  doc.text(`RÉGION : ${(ecole.region || 'NIAMEY').toUpperCase()}`, CL_X, y + 22, { width: CL_W });
  if (ecole.inspection) {
    doc.fillColor(couleurHex).font('Helvetica-Bold');
    doc.text(ecole.inspection.toUpperCase(), CL_X, y + 38, { width: CL_W });
  }

  // Centre
  doc.fillColor(couleurHex).fontSize(12).font('Helvetica-Bold')
     .text(ecole.nom || 'ÉTABLISSEMENT SCOLAIRE', CC_X, y, { width: CC_W, align: 'center' });
  doc.fillColor(toHex(80,90,100)).fontSize(7.5).font('Helvetica')
     .text((ecole.type_ecole || '').toUpperCase(), CC_X, y + 52, { width: CC_W, align: 'center' });
  doc.rect(CC_X, y + 63, CC_W, 1.5).fill(couleurHex);
  if (ecole.devise) {
    doc.fillColor(toHex(120,130,140)).fontSize(7).font('Helvetica-Oblique')
       .text(`« ${ecole.devise} »`, CC_X, y + 70, { width: CC_W, align: 'center' });
  }

  // Droite
  doc.fillColor(toHex(80,90,100)).fontSize(7).font('Helvetica');
  if (ecole.telephone) doc.text(`Tél : ${ecole.telephone}`, CR_X, y,      { width: CR_W, align: 'right' });
  if (ecole.email)     doc.text(ecole.email,                 CR_X, y + 11, { width: CR_W, align: 'right' });
  if (ecole.adresse)   doc.text(ecole.adresse,               CR_X, y + 22, { width: CR_W, align: 'right' });
  doc.fillColor(couleurHex).font('Helvetica-Bold').fontSize(7.5)
     .text(`A.S. ${ecole.annee_scolaire || '2025-2026'}`, CR_X, y + 38, { width: CR_W, align: 'right' });

  y += 90;

  // Séparateur
  doc.moveTo(PAD, y).lineTo(W - PAD, y).strokeColor(couleurHex).lineWidth(1.2).stroke();
  y += 8;

  // Titre du document
  doc.fillColor(couleurHex).fontSize(14).font('Helvetica-Bold')
     .text(titre.toUpperCase(), PAD, y, { width: W - PAD * 2, align: 'center' });
  y += 18;

  if (sous_titre) {
    doc.fillColor(toHex(60,70,80)).fontSize(10).font('Helvetica')
       .text(sous_titre, PAD, y, { width: W - PAD * 2, align: 'center' });
    y += 14;
  }

  // Infos classe
  const classeLabel = `Classe : ${classe.nom}  —  Niveau : ${classe.niveau}  —  Effectif : ${classe.effectif || '?'} élèves`;
  const enseignantLabel = classe.enseignant_nom
    ? `Prof. Principal : ${classe.enseignant_prenom} ${classe.enseignant_nom}`
    : '';

  doc.rect(PAD, y, W - PAD * 2, enseignantLabel ? 34 : 22).fill(toHex(245,248,250));
  doc.rect(PAD, y, 4, enseignantLabel ? 34 : 22).fill(couleurHex);
  doc.fillColor(toHex(30,40,50)).fontSize(9).font('Helvetica-Bold')
     .text(classeLabel, PAD + 10, y + 6, { width: W - PAD * 2 - 20 });
  if (enseignantLabel) {
    doc.fillColor(toHex(80,90,100)).fontSize(8).font('Helvetica')
       .text(enseignantLabel, PAD + 10, y + 20, { width: W - PAD * 2 - 20 });
  }

  y += (enseignantLabel ? 34 : 22) + 14;
  return { y, couleurHex, PAD, W };
}

// ── Pied de page ─────────────────────────────────────────────
function drawFooter(doc, ecole, couleurHex) {
  const W = 595, H = 842;
  doc.rect(0, H - 20, W, 14).fill(couleurHex);
  const date_gen = new Date().toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' });
  doc.fillColor('#ffffff').fontSize(7).font('Helvetica')
     .text(
       `${ecole.nom || 'EduNiger'}  •  ${ecole.annee_scolaire || '2025-2026'}  •  Généré le ${date_gen}`,
       0, H - 15, { width: W, align: 'center' }
     );
}

// ════════════════════════════════════════════════════════════
// 1. LISTE SIMPLE DES ÉLÈVES (feuille vierge)
// ════════════════════════════════════════════════════════════
async function generateListeClassePDF({ ecole, classe, eleves }) {
  return new Promise((resolve, reject) => {
    const couleur = ecole.couleur_primaire || '#0A5C36';
    const doc = new PDFDocument({ size: 'A4', margin: 0,
      info: { Title: `Liste — ${classe.nom}`, Author: ecole.nom } });

    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end',  () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const { y: startY, couleurHex, PAD, W } = drawHeader(
      doc, ecole, classe,
      `Liste des Élèves — ${classe.nom}`,
      `Année scolaire ${ecole.annee_scolaire || '2025-2026'}`
    );

    let y = startY;

    // ── En-tête tableau ──
    const cols = [
      { label: 'N°',          x: PAD,       w: 28,  align: 'center' },
      { label: 'Matricule',   x: PAD + 28,  w: 70,  align: 'left'   },
      { label: 'Nom & Prénom',x: PAD + 98,  w: 180, align: 'left'   },
      { label: 'Naissance',   x: PAD + 278, w: 70,  align: 'center' },
      { label: 'Sexe',        x: PAD + 348, w: 35,  align: 'center' },
      { label: 'Signature / Émargement', x: PAD + 383, w: 136, align: 'center' },
    ];

    const rowH = 20;

    // Fond header
    doc.rect(PAD, y, W - PAD * 2, rowH).fill(couleurHex);
    cols.forEach(({ label, x, w, align }) => {
      doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold')
         .text(label, x + 3, y + 6, { width: w - 6, align });
    });
    y += rowH;

    // Lignes élèves
    eleves.forEach((eleve, idx) => {
      const bg = idx % 2 === 0 ? '#ffffff' : toHex(247,249,252);
      doc.rect(PAD, y, W - PAD * 2, rowH).fill(bg);

      // Bordure basse
      doc.moveTo(PAD, y + rowH).lineTo(W - PAD, y + rowH)
         .strokeColor(toHex(220,225,230)).lineWidth(0.4).stroke();

      const dob = eleve.date_naissance
        ? new Date(eleve.date_naissance).toLocaleDateString('fr-FR')
        : '—';

      const cells = [
        { text: String(idx + 1),           ...cols[0] },
        { text: eleve.matricule,            ...cols[1] },
        { text: `${eleve.nom} ${eleve.prenom}`, ...cols[2] },
        { text: dob,                        ...cols[3] },
        { text: eleve.sexe || '—',          ...cols[4] },
        { text: '',                         ...cols[5] },
      ];

      cells.forEach(({ text, x, w, align }) => {
        doc.fillColor(toHex(25,35,45)).fontSize(8.5).font('Helvetica')
           .text(text, x + 3, y + 6, { width: w - 6, align, lineBreak: false });
      });

      // Ligne verticale signature
      doc.moveTo(cols[5].x, y).lineTo(cols[5].x, y + rowH)
         .strokeColor(toHex(200,210,220)).lineWidth(0.4).stroke();

      y += rowH;
    });

    // Bordure tableau
    doc.rect(PAD, startY - 14 + 14, W - PAD * 2, y - startY + rowH)
       .strokeColor(toHex(180,190,200)).lineWidth(0.5).stroke();

    // Zone signature directeur
    y += 20;
    doc.fillColor(toHex(80,90,100)).fontSize(8).font('Helvetica-Bold')
       .text('Le Professeur Principal', PAD, y, { width: 200, align: 'center' });
    doc.moveTo(PAD + 20, y + 35).lineTo(PAD + 180, y + 35)
       .strokeColor(toHex(160,170,180)).lineWidth(0.6).stroke();
    doc.fillColor(toHex(130,140,150)).fontSize(7).font('Helvetica')
       .text('Signature', PAD, y + 38, { width: 200, align: 'center' });

    drawFooter(doc, ecole, couleurHex);
    doc.end();
  });
}

// ════════════════════════════════════════════════════════════
// 2. FEUILLE D'APPEL AVEC STATUTS
// ════════════════════════════════════════════════════════════
async function generateFeuilleAppelPDF({ ecole, classe, eleves, presences, date }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 0,
      info: { Title: `Appel ${classe.nom} — ${date}`, Author: ecole.nom } });

    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end',  () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const dateStr = new Date(date + 'T12:00:00').toLocaleDateString('fr-FR', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    });

    const { y: startY, couleurHex, PAD, W } = drawHeader(
      doc, ecole, classe,
      `Feuille d'Appel — ${classe.nom}`,
      dateStr.charAt(0).toUpperCase() + dateStr.slice(1)
    );

    let y = startY;

    // Stats rapides
    const stats = { present: 0, absent: 0, retard: 0, absent_justifie: 0 };
    eleves.forEach(e => {
      const s = presences[e.id] || 'present';
      if (stats[s] !== undefined) stats[s]++;
    });

    const statItems = [
      { label: 'Présents',       val: stats.present,          bg: '#e8f5ee', fg: '#1a7a4a' },
      { label: 'Absents',        val: stats.absent,           bg: '#fdecea', fg: '#c0392b' },
      { label: 'Retards',        val: stats.retard,           bg: '#fff8e1', fg: '#b7770d' },
      { label: 'Abs. Justifiés', val: stats.absent_justifie,  bg: '#e3f0fd', fg: '#1565c0' },
    ];

    const statW = (W - PAD * 2 - 12) / 4;
    statItems.forEach(({ label, val, bg, fg }, i) => {
      const sx = PAD + i * (statW + 4);
      doc.rect(sx, y, statW, 32).fill(bg);
      doc.fillColor(fg).fontSize(16).font('Helvetica-Bold')
         .text(String(val), sx, y + 4, { width: statW, align: 'center' });
      doc.fillColor(fg).fontSize(7).font('Helvetica')
         .text(label, sx, y + 22, { width: statW, align: 'center' });
    });
    y += 42;

    // ── Tableau ──
    const cols = [
      { label: 'N°',         x: PAD,        w: 28,  align: 'center' },
      { label: 'Matricule',  x: PAD + 28,   w: 72,  align: 'left'   },
      { label: 'Nom & Prénom', x: PAD + 100, w: 210, align: 'left'   },
      { label: 'Statut',     x: PAD + 310,  w: 100, align: 'center' },
      { label: 'Motif / Observation', x: PAD + 410, w: 109, align: 'left' },
    ];

    const rowH = 20;

    doc.rect(PAD, y, W - PAD * 2, rowH).fill(couleurHex);
    cols.forEach(({ label, x, w, align }) => {
      doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold')
         .text(label, x + 3, y + 6, { width: w - 6, align });
    });
    y += rowH;

    eleves.forEach((eleve, idx) => {
      const statut = presences[eleve.id] || 'present';
      const info   = STATUT_LABELS[statut] || STATUT_LABELS.present;
      const bg     = idx % 2 === 0 ? '#ffffff' : toHex(247,249,252);

      doc.rect(PAD, y, W - PAD * 2, rowH).fill(bg);
      doc.moveTo(PAD, y + rowH).lineTo(W - PAD, y + rowH)
         .strokeColor(toHex(220,225,230)).lineWidth(0.4).stroke();

      // Badge statut
      const [sr,sg,sb] = hexToRgb(info.hex);
      const badgeBg = toHex(sr + Math.round((255-sr)*0.85), sg + Math.round((255-sg)*0.85), sb + Math.round((255-sb)*0.85));
      const bx = cols[3].x + 4, bw = 88, bh = 14;
      const by = y + (rowH - bh) / 2;
      doc.rect(bx, by, bw, bh).fill(badgeBg);
      doc.fillColor(info.hex).fontSize(8).font('Helvetica-Bold')
         .text(info.texte, bx, by + 3, { width: bw, align: 'center', lineBreak: false });

      // Autres cellules
      const dob = eleve.date_naissance
        ? new Date(eleve.date_naissance).toLocaleDateString('fr-FR')
        : '';

      [
        { text: String(idx + 1),                  ...cols[0] },
        { text: eleve.matricule,                   ...cols[1] },
        { text: `${eleve.nom} ${eleve.prenom}`,    ...cols[2] },
        { text: '',                                ...cols[4] }, // motif vide
      ].forEach(({ text, x, w, align }) => {
        doc.fillColor(toHex(25,35,45)).fontSize(8.5).font('Helvetica')
           .text(text, x + 3, y + 6, { width: w - 6, align, lineBreak: false });
      });

      y += rowH;
    });

    // Signature
    y += 20;
    doc.fillColor(toHex(80,90,100)).fontSize(8).font('Helvetica-Bold')
       .text('Le Professeur Principal', PAD, y, { width: 200, align: 'center' });
    doc.moveTo(PAD + 20, y + 35).lineTo(PAD + 180, y + 35)
       .strokeColor(toHex(160,170,180)).lineWidth(0.6).stroke();
    doc.fillColor(toHex(130,140,150)).fontSize(7).font('Helvetica')
       .text('Signature & Cachet', PAD, y + 38, { width: 200, align: 'center' });

    drawFooter(doc, ecole, couleurHex);
    doc.end();
  });
}

module.exports = { generateListeClassePDF, generateFeuilleAppelPDF };
