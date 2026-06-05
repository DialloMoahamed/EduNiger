/**
 * EduNiger — Générateur de Bulletin PDF Professionnel
 * FIX: PDFKit n'accepte pas fillColor(r,g,b) — il faut des strings hex '#rrggbb'
 */
const PDFDocument = require('pdfkit');
const path = require('path');
const fs   = require('fs');

// ── Helpers couleur ─────────────────────────────────────────
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return [r, g, b];
}

// ✅ FIX : convertit r,g,b (0-255) en string hex pour PDFKit
function toHex(r, g, b) {
  return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
}

function mention(moy) {
  moy = parseFloat(moy);
  if (moy >= 16) return { texte: 'Très Bien',  emoji: '⭐' };
  if (moy >= 14) return { texte: 'Bien',        emoji: '👍' };
  if (moy >= 12) return { texte: 'Assez Bien',  emoji: '✔'  };
  if (moy >= 10) return { texte: 'Passable',    emoji: '~'  };
  return            { texte: 'Insuffisant', emoji: '✗'  };
}

function appreciation(moy) {
  moy = parseFloat(moy);
  if (moy >= 16) return 'Excellent travail. Continuez ainsi !';
  if (moy >= 14) return 'Bon travail. Des efforts constants.';
  if (moy >= 12) return 'Résultats satisfaisants. Peut mieux faire.';
  if (moy >= 10) return 'Travail insuffisant. Des efforts sont nécessaires.';
  return 'Résultats préoccupants. Un sérieux redressement s\'impose.';
}

// ── Dessin d'une ligne de tableau ───────────────────────────
function drawRow(doc, y, cells, isHeader, couleurPrimaire, isAlternate) {
  const [r,g,b] = hexToRgb(couleurPrimaire || '#0A5C36');
  const rowH = 22;

  if (isHeader) {
    doc.rect(40, y, 515, rowH).fill(toHex(r, g, b));
  } else if (isAlternate) {
    doc.rect(40, y, 515, rowH).fill(toHex(245, 247, 250));
  } else {
    doc.rect(40, y, 515, rowH).fill('#ffffff');
  }

  // Bordure basse
  doc.moveTo(40, y + rowH).lineTo(555, y + rowH)
     .strokeColor(toHex(220, 225, 230)).lineWidth(0.5).stroke();

  // Contenu cellules
  cells.forEach(({ text, x, w, align, bold, color }) => {
    const textHex = color ? toHex(...color) : (isHeader ? '#ffffff' : toHex(30, 40, 50));
    doc.fillColor(textHex)
       .fontSize(isHeader ? 8.5 : 9)
       .font(bold ? 'Helvetica-Bold' : 'Helvetica')
       .text(String(text), x + 4, y + 6, { width: w - 8, align: align || 'left', lineBreak: false });
  });

  return y + rowH;
}

// ── Fonction principale ──────────────────────────────────────
async function generateBulletinPDF({ eleve, ecole, detailsNotes, moyenne_generale, rang, effectif, periode, moy_classe }) {

  const couleur = ecole.couleur_primaire || '#0A5C36';
  const [cr,cg,cb] = hexToRgb(couleur);
  const couleurHex = toHex(cr, cg, cb);
  const men = mention(moyenne_generale);

  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const filename = `bulletin_${eleve.matricule}_${periode.replace(/\s/g,'_')}.pdf`;
  const filepath = path.join(uploadsDir, filename);

  const doc = new PDFDocument({
    size: 'A4',
    margin: 0,
    info: {
      Title: `Bulletin de Notes — ${eleve.prenom} ${eleve.nom}`,
      Author: ecole.nom,
      Subject: `${periode} — ${ecole.annee_scolaire || '2025-2026'}`
    }
  });

  const stream = fs.createWriteStream(filepath);
  doc.pipe(stream);

  const W = 595, H = 842;
  const PAD = 40;

  // ── FOND blanc ──
  doc.rect(0, 0, W, H).fill('#ffffff');

  // ── BANDE TOP colorée ──
  doc.rect(0, 0, W, 8).fill(couleurHex);

  // ── BANDE LATÉRALE gauche ──
  doc.rect(0, 8, 6, H - 16).fill(couleurHex);

  // ── EN-TÊTE — 3 colonnes sans chevauchement ──
  // Page utile : x=46 → x=549 = 503px divisé en 3 colonnes
  // Gauche  : x=46,  w=155 → finit à 201
  // Centre  : x=207, w=185 → finit à 392  (centre page ≈ 299)
  // Droite  : x=398, w=151 → finit à 549
  const CL_X = 46,  CL_W = 155;
  const CC_X = 207, CC_W = 185;
  const CR_X = 398, CR_W = 151;

  // Hauteur header : le nom peut faire 3 lignes à fontSize 13
  // → on réserve 110px au total
  const HDR_H = 110;
  let y = 24;

  // ── Bloc gauche : infos état (espacées sur toute la hauteur) ──
  doc.fillColor(toHex(80, 90, 100)).fontSize(7.5).font('Helvetica');
  doc.text('RÉPUBLIQUE DU NIGER',                               CL_X, y,      { width: CL_W });
  doc.text("MINISTÈRE DE L'ÉDUCATION NATIONALE",               CL_X, y + 14, { width: CL_W });
  doc.text(`RÉGION DE ${(ecole.region || 'NIAMEY').toUpperCase()}`, CL_X, y + 28, { width: CL_W });
  if (ecole.departement) {
    doc.text(`DÉPARTEMENT DE ${ecole.departement.toUpperCase()}`,   CL_X, y + 42, { width: CL_W });
  }
  if (ecole.inspection) {
    doc.fillColor(couleurHex).fontSize(7.5).font('Helvetica-Bold');
    doc.text(ecole.inspection.toUpperCase(), CL_X, y + 62, { width: CL_W });
  }

  // ── Bloc central : nom de l'école ──
  // Le nom peut être long → fontSize 13, les lignes suivantes partent après ~55px
  doc.fillColor(couleurHex).fontSize(13).font('Helvetica-Bold')
     .text(ecole.nom || 'ÉTABLISSEMENT SCOLAIRE', CC_X, y, { width: CC_W, align: 'center' });

  // type_ecole : y+58 pour laisser la place à 3 lignes de nom (13pt ≈ 18px/ligne)
  doc.fillColor(toHex(80, 90, 100)).fontSize(8).font('Helvetica')
     .text((ecole.type_ecole || '').toUpperCase(), CC_X, y + 58, { width: CC_W, align: 'center' });

  // Ligne décorative : y+72
  doc.rect(CC_X, y + 72, CC_W, 2).fill(couleurHex);

  // Devise : y+80
  if (ecole.devise) {
    doc.fillColor(toHex(120, 130, 140)).fontSize(7.5).font('Helvetica-Oblique')
       .text(`« ${ecole.devise} »`, CC_X, y + 80, { width: CC_W, align: 'center' });
  }

  // ── Bloc droit : contacts (espacés comme le bloc gauche) ──
  doc.fillColor(toHex(80, 90, 100)).fontSize(7.5).font('Helvetica');
  if (ecole.telephone)     doc.text(`Tél : ${ecole.telephone}`,      CR_X, y,      { width: CR_W, align: 'right' });
  if (ecole.email)         doc.text(`${ecole.email}`,                 CR_X, y + 14, { width: CR_W, align: 'right' });
  if (ecole.adresse)       doc.text(`${ecole.adresse}`,               CR_X, y + 28, { width: CR_W, align: 'right' });
  if (ecole.boite_postale) doc.text(`BP ${ecole.boite_postale}`,      CR_X, y + 42, { width: CR_W, align: 'right' });
  doc.fillColor(couleurHex).font('Helvetica-Bold').fontSize(8)
     .text(`Année scolaire ${ecole.annee_scolaire || '2025-2026'}`,   CR_X, y + 62, { width: CR_W, align: 'right' });

  y += HDR_H;

  // ── SÉPARATEUR ──
  doc.moveTo(PAD, y).lineTo(W - PAD, y).strokeColor(couleurHex).lineWidth(1.5).stroke();
  y += 8;

  // ── TITRE BULLETIN ──
  const titreMap = {
    'Trimestre 1': 'BULLETIN DU 1er TRIMESTRE',
    'Trimestre 2': 'BULLETIN DU 2ème TRIMESTRE',
    'Trimestre 3': 'BULLETIN DU 3ème TRIMESTRE',
    'Semestre 1':  'BULLETIN DU 1er SEMESTRE',
    'Semestre 2':  'BULLETIN DU 2ème SEMESTRE',
  };
  const titreTxt = titreMap[periode] || `BULLETIN — ${periode.toUpperCase()}`;

  doc.fillColor(couleurHex).fontSize(15).font('Helvetica-Bold')
     .text(titreTxt, PAD, y, { width: W - PAD*2, align: 'center' });
  y += 22;
  doc.moveTo(PAD, y).lineTo(W-PAD, y).strokeColor(toHex(200, 210, 220)).lineWidth(0.5).stroke();
  y += 12;

  // ── FICHE ÉLÈVE ──
  doc.rect(PAD, y, W - PAD*2, 58).fill(toHex(247, 249, 251));
  doc.rect(PAD, y, W - PAD*2, 58).strokeColor(toHex(220, 225, 230)).lineWidth(0.7).stroke();
  doc.rect(PAD, y, 4, 58).fill(couleurHex);

  const dob = eleve.date_naissance
    ? new Date(eleve.date_naissance).toLocaleDateString('fr-FR')
    : '—';

  const eleveInfos = [
    ['NOM & PRÉNOM',  `${eleve.nom.toUpperCase()} ${eleve.prenom}`],
    ['MATRICULE',      eleve.matricule],
    ['DATE DE NAISS.', dob],
    ['CLASSE',         eleve.classe_nom],
    ['NIVEAU',         eleve.niveau || '—'],
  ];

  const colW = (W - PAD*2 - 4) / 3;
  eleveInfos.slice(0,3).forEach(([lbl, val], i) => {
    const cx = PAD + 4 + i * colW;
    doc.fillColor(toHex(130, 140, 150)).fontSize(7).font('Helvetica-Bold')
       .text(lbl, cx + 6, y + 8, { width: colW - 12 });
    doc.fillColor(toHex(20, 30, 40)).fontSize(10).font('Helvetica-Bold')
       .text(val, cx + 6, y + 18, { width: colW - 12 });
  });
  eleveInfos.slice(3,5).forEach(([lbl, val], i) => {
    const cx = PAD + 4 + i * (colW * 1.5);
    doc.fillColor(toHex(130, 140, 150)).fontSize(7).font('Helvetica-Bold')
       .text(lbl, cx + 6, y + 38, { width: colW - 12 });
    doc.fillColor(toHex(20, 30, 40)).fontSize(10).font('Helvetica-Bold')
       .text(val, cx + 6, y + 48, { width: colW - 12 });
  });
  y += 70;

  // ── TABLEAU DES NOTES ──
  doc.fillColor(toHex(30, 40, 50)).fontSize(10).font('Helvetica-Bold')
     .text('RÉSULTATS DÉTAILLÉS', PAD, y);
  y += 14;

  const cols = [
    { text: 'MATIÈRE',      x: PAD, w: 165, align: 'left'   },
    { text: 'COEF',         x: 205, w:  45, align: 'center' },
    { text: 'MOY. ÉLÈVE',   x: 250, w:  80, align: 'center' },
    { text: 'MOY. CLASSE',  x: 330, w:  80, align: 'center' },
    { text: 'POINTS',       x: 410, w:  60, align: 'center' },
    { text: 'APPRÉCIATION', x: 470, w:  85, align: 'left'   },
  ];

  y = drawRow(doc, y, cols, true, couleur, false);

  let totalPts = 0, totalCoef = 0;
  detailsNotes.forEach((n, idx) => {
    const moy = parseFloat(n.moyenne);
    const pts = moy * n.coefficient;
    totalPts  += pts;
    totalCoef += n.coefficient;

    const noteColorHex = moy >= 14 ? couleurHex : moy >= 10 ? toHex(160, 100, 0) : toHex(180, 30, 30);

    y = drawRow(doc, y, [
      { text: n.matiere,              x: PAD, w: 165, align: 'left'   },
      { text: String(n.coefficient),  x: 205, w:  45, align: 'center' },
      { text: `${moy.toFixed(2)}/20`, x: 250, w:  80, align: 'center', bold: true,  color: [...hexToRgb(noteColorHex)] },
      { text: n.moy_classe ? `${parseFloat(n.moy_classe).toFixed(2)}/20` : '—', x: 330, w: 80, align: 'center', color: [100,110,120] },
      { text: pts.toFixed(2),         x: 410, w:  60, align: 'center' },
      { text: mention(moy).texte,     x: 470, w:  85, align: 'left',   color: [...hexToRgb(noteColorHex)] },
    ], false, couleur, idx % 2 === 1);
  });

  // Ligne totale
  y = drawRow(doc, y, [
    { text: 'TOTAL / MOYENNE GÉNÉRALE', x: PAD, w: 210, align: 'left', bold: true },
    { text: String(totalCoef),  x: 205, w:  45, align: 'center', bold: true },
    { text: `${moyenne_generale}/20`, x: 250, w: 80, align: 'center', bold: true, color: [cr,cg,cb] },
    { text: '—',                x: 330, w:  80, align: 'center' },
    { text: totalPts.toFixed(2), x: 410, w: 60, align: 'center', bold: true },
    { text: men.texte,          x: 470, w:  85, align: 'left',   bold: true, color: [cr,cg,cb] },
  ], false, couleur, false);

  y += 18;

  // ── RÉCAPITULATIF ──
  const blocs = [
    { label: 'MOYENNE GÉNÉRALE', val: `${moyenne_generale} / 20` },
    { label: 'CLASSEMENT',       val: `${rang}e  /  ${effectif} élèves` },
    { label: 'MENTION',          val: men.texte },
  ];

  const bW = (W - PAD*2 - 20) / 3;
  blocs.forEach(({ label, val }, i) => {
    const bx = PAD + i * (bW + 10);
    doc.rect(bx, y, bW, 44).fill(toHex(247, 249, 251));
    doc.rect(bx, y, bW, 44).strokeColor(toHex(220, 225, 230)).lineWidth(0.7).stroke();
    doc.rect(bx, y, bW, 3).fill(couleurHex);
    doc.fillColor(toHex(120, 130, 140)).fontSize(7).font('Helvetica-Bold')
       .text(label, bx, y + 9, { width: bW, align: 'center' });
    doc.fillColor(couleurHex).fontSize(13).font('Helvetica-Bold')
       .text(val, bx, y + 20, { width: bW, align: 'center' });
  });

  y += 56;

  // ── APPRÉCIATION GÉNÉRALE ──
  doc.rect(PAD, y, W - PAD*2, 34).fill(toHex(247, 249, 251));
  doc.rect(PAD, y, W - PAD*2, 34).strokeColor(toHex(220, 225, 230)).lineWidth(0.7).stroke();
  doc.rect(PAD, y, 4, 34).fill(couleurHex);
  doc.fillColor(toHex(100, 110, 120)).fontSize(7.5).font('Helvetica-Bold')
     .text('APPRÉCIATION DU CONSEIL DE CLASSE', PAD + 10, y + 6, { width: W - PAD*2 - 20 });
  doc.fillColor(toHex(30, 40, 50)).fontSize(9).font('Helvetica-Oblique')
     .text(appreciation(moyenne_generale), PAD + 10, y + 18, { width: W - PAD*2 - 20 });
  y += 46;

  // ── SIGNATURES ──
  const sigs = [
    'Le Professeur Principal',
    "Le Chef d'Établissement",
    'Les Parents / Tuteurs',
  ];
  const sigW = (W - PAD*2) / 3;

  doc.fillColor(toHex(80, 90, 100)).fontSize(8).font('Helvetica-Bold');
  sigs.forEach((s, i) => {
    const sx = PAD + i * sigW;
    doc.text(s, sx, y, { width: sigW, align: 'center' });
    doc.moveTo(sx + 15, y + 40).lineTo(sx + sigW - 15, y + 40)
       .strokeColor(toHex(180, 190, 200)).lineWidth(0.7).stroke();
    doc.fillColor(toHex(140, 150, 160)).fontSize(7).font('Helvetica')
       .text('Signature', sx, y + 44, { width: sigW, align: 'center' });
  });
  y += 62;

  // ── PIED DE PAGE ──
  doc.rect(0, H - 22, W, 22).fill(couleurHex);
  doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica')
     .text(
       `${ecole.nom || 'EduNiger'}  •  ${ecole.annee_scolaire || '2025-2026'}  •  Bulletin généré le ${new Date().toLocaleDateString('fr-FR')}`,
       0, H - 14, { width: W, align: 'center' }
     );

  // ── BANDES LATÉRALES DROITE ET BASSE ──
  doc.rect(W - 6, 8, 6, H - 16).fill(couleurHex);
  doc.rect(0, H - 8, W, 8).fill(couleurHex);

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve({ filename, filepath }));
    stream.on('error', reject);
  });
}

module.exports = generateBulletinPDF;