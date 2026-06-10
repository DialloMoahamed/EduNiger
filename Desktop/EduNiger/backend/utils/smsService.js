/**
 * EduNiger — Service de Notifications
 * ─────────────────────────────────────────────────────────────────────────────
 * Canaux supportés (par ordre de priorité) :
 *   1. WhatsApp Cloud API (Meta) — gratuit jusqu'à 1 000 msg/mois, ~0,01$/msg après
 *   2. Twilio SMS              — fallback si WhatsApp échoue ou non configuré
 *   3. En attente              — aucun canal configuré, notification stockée en BDD
 *
 * Variables .env nécessaires :
 *   WhatsApp : WHATSAPP_TOKEN, WHATSAPP_PHONE_ID
 *              WHATSAPP_TEMPLATE_BULLETIN, WHATSAPP_TEMPLATE_NOTES, WHATSAPP_TEMPLATE_RETARD
 *   Twilio   : TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER
 * ─────────────────────────────────────────────────────────────────────────────
 */

const db = require('../config/database');

// ── Helpers ──────────────────────────────────────────────────────────────────

function getMention(moy) {
  moy = parseFloat(moy);
  if (moy >= 16) return 'Très Bien';
  if (moy >= 14) return 'Bien';
  if (moy >= 12) return 'Assez Bien';
  if (moy >= 10) return 'Passable';
  return 'Insuffisant';
}

/**
 * Formate un numéro de téléphone au format international E.164
 * Ex : "0096 12 34 56" → "+22796123456"  |  "+227 96 12 34 56" → "+22796123456"
 */
function formatTelephone(tel) {
  if (!tel) return null;
  // Supprimer tout sauf les chiffres et le + initial
  let t = tel.toString().trim().replace(/\s+/g, '');
  // Si commence par 00, remplacer par +
  if (t.startsWith('00')) t = '+' + t.slice(2);
  // Si ne commence pas par +, supposer Niger (+227)
  if (!t.startsWith('+')) t = '+227' + t.replace(/^0+/, '');
  // Supprimer tous les caractères non numériques sauf le + initial
  return '+' + t.slice(1).replace(/\D/g, '');
}

// ── Canal 1 : WhatsApp Cloud API ─────────────────────────────────────────────

/**
 * Envoie un message WhatsApp via un template Meta approuvé.
 * @param {string} telephone   - Numéro destinataire (sera formaté automatiquement)
 * @param {string} templateName - Nom du template Meta (ex: "eduniger_bulletin")
 * @param {Array}  params       - Paramètres du template [ {type:'text', text:'...'}, ... ]
 * @returns {boolean} true si envoyé avec succès
 */
async function sendViaWhatsApp(telephone, templateName, params = []) {
  try {
    const token   = process.env.WHATSAPP_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_ID;
    if (!token || !phoneId) return false;

    const to = formatTelephone(telephone);
    if (!to) return false;

    const body = {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name:     templateName,
        language: { code: 'fr' },
        ...(params.length > 0 && {
          components: [{
            type:       'body',
            parameters: params.map(p => ({ type: 'text', text: String(p) })),
          }],
        }),
      },
    };

    const res = await fetch(
      `https://graph.facebook.com/v19.0/${phoneId}/messages`,
      {
        method:  'POST',
        headers: {
          Authorization:  `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('WhatsApp API error:', JSON.stringify(err));
      return false;
    }
    return true;
  } catch (err) {
    console.error('WhatsApp error:', err.message);
    return false;
  }
}

// ── Canal 2 : Twilio SMS ─────────────────────────────────────────────────────

async function sendViaTwilio(telephone, message) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken  = process.env.TWILIO_AUTH_TOKEN;
    const from       = process.env.TWILIO_FROM_NUMBER;
    if (!accountSid || !authToken || !from) return false;

    const to = formatTelephone(telephone);
    if (!to) return false;

    const twilio = require('twilio')(accountSid, authToken);
    await twilio.messages.create({ body: message, from, to });
    return true;
  } catch (err) {
    console.error('Twilio error:', err.message);
    return false;
  }
}

// ── Enregistrement + envoi ────────────────────────────────────────────────────

/**
 * Insère une notification en BDD puis tente l'envoi (WhatsApp → Twilio → en_attente).
 * @param {object} opts
 *   telephone      - Numéro du parent
 *   message        - Texte du message (pour SMS Twilio et BDD)
 *   type           - 'bulletin' | 'notes_saisies' | 'retard' | 'absence'
 *   eleve_id       - ID de l'élève (optionnel)
 *   whatsappTemplate - Nom du template WhatsApp (optionnel)
 *   whatsappParams   - Paramètres du template [ '...', '...', ... ] (optionnel)
 * @returns {{ success, notif_id, canal, envoye }}
 */
async function envoyerNotification({
  telephone,
  message,
  type,
  eleve_id         = null,
  whatsappTemplate = null,
  whatsappParams   = [],
}) {
  try {
    // 1. Insérer en BDD avec statut initial "en_attente"
    const [result] = await db.query(
      `INSERT INTO notifications (telephone, message, type, statut, eleve_id, created_at)
       VALUES (?, ?, ?, 'en_attente', ?, NOW())`,
      [telephone, message, type, eleve_id]
    );
    const notif_id = result.insertId;

    let envoye = false;
    let canal  = null;

    // 2. Essayer WhatsApp en priorité
    if (whatsappTemplate) {
      envoye = await sendViaWhatsApp(telephone, whatsappTemplate, whatsappParams);
      if (envoye) canal = 'whatsapp';
    }

    // 3. Fallback Twilio SMS
    if (!envoye) {
      envoye = await sendViaTwilio(telephone, message);
      if (envoye) canal = 'twilio';
    }

    // 4. Mettre à jour le statut en BDD
    if (envoye) {
      await db.query(
        `UPDATE notifications SET statut = 'envoye', sent_at = NOW() WHERE id = ?`,
        [notif_id]
      );
    }

    if (envoye) {
      console.log(`✅ Notification [${type}] envoyée via ${canal} → ${telephone}`);
    } else {
      console.warn(`⏳ Notification [${type}] en attente (aucun canal configuré) → ${telephone}`);
    }

    return { success: true, notif_id, canal, envoye };
  } catch (err) {
    console.error('envoyerNotification error:', err.message);
    return { success: false, error: err.message };
  }
}

// Alias rétrocompatible (ancienne API appelait envoyerSMS)
const envoyerSMS = ({ telephone, message, type, eleve_id }) =>
  envoyerNotification({ telephone, message, type, eleve_id });

// ── Notifications métier ──────────────────────────────────────────────────────

/**
 * Notifie le parent de la disponibilité du bulletin.
 * Template WhatsApp attendu : "eduniger_bulletin"
 * Corps : "Le bulletin de {{1}} pour le {{2}} est disponible.\nMoyenne : {{3}}/20 — {{4}}.\nConnectez-vous sur l'espace parent EduNiger pour le consulter."
 */
async function smsBulletinDisponible({ eleve, moyenne_generale, periode }) {
  if (!eleve.telephone_parent) return null;

  const mention = getMention(moyenne_generale);
  const moyenne = parseFloat(moyenne_generale).toFixed(2);

  // Message texte pour Twilio / BDD
  const message =
    `[EduNiger] Bulletin de ${eleve.prenom} ${eleve.nom} (${periode}) disponible. ` +
    `Moyenne : ${moyenne}/20 — ${mention}. ` +
    `Connectez-vous sur l'espace parent pour le consulter.`;

  return envoyerNotification({
    telephone:        eleve.telephone_parent,
    message,
    type:             'bulletin',
    eleve_id:         eleve.id,
    whatsappTemplate: process.env.WHATSAPP_TEMPLATE_BULLETIN || 'eduniger_bulletin',
    whatsappParams:   [
      `${eleve.prenom} ${eleve.nom}`,  // {{1}} prénom nom
      periode,                          // {{2}} période
      `${moyenne}/20`,                  // {{3}} moyenne
      mention,                          // {{4}} mention
    ],
  });
}

/**
 * Notifie le parent que les notes ont été saisies pour son enfant.
 * Template WhatsApp attendu : "eduniger_notes"
 * Corps : "Les notes du {{1}} de {{2}} sont disponibles ({{3}} matière(s)).\nConsultez l'espace parent EduNiger."
 */
async function smsNotesSaisies({ eleve, periode, nb_matieres }) {
  if (!eleve.telephone_parent) return null;

  const message =
    `[EduNiger] Les notes du ${periode} de ${eleve.prenom} ${eleve.nom} ` +
    `sont disponibles (${nb_matieres} matière${nb_matieres > 1 ? 's' : ''}). ` +
    `Consultez l'espace parent.`;

  return envoyerNotification({
    telephone:        eleve.telephone_parent,
    message,
    type:             'notes_saisies',
    eleve_id:         eleve.id,
    whatsappTemplate: process.env.WHATSAPP_TEMPLATE_NOTES || 'eduniger_notes',
    whatsappParams:   [
      periode,                                                    // {{1}}
      `${eleve.prenom} ${eleve.nom}`,                            // {{2}}
      `${nb_matieres} matière${nb_matieres > 1 ? 's' : ''}`,    // {{3}}
    ],
  });
}

/**
 * Notifie le parent d'un retard de son enfant.
 * Template WhatsApp attendu : "eduniger_retard"
 * Corps : "{{1}} a été marqué(e) en retard{{2}} le {{3}}{{4}}."
 */
async function smsRetard({ eleve, date, matiere = null, creneau = null }) {
  if (!eleve.telephone_parent) return null;

  const matInfo = matiere ? ` en ${matiere}` : '';
  const crInfo  = creneau ? ` (${creneau})`  : '';

  const message =
    `[EduNiger] ${eleve.prenom} ${eleve.nom} a été marqué(e) en retard` +
    `${matInfo} le ${date}${crInfo}.`;

  return envoyerNotification({
    telephone:        eleve.telephone_parent,
    message,
    type:             'retard',
    eleve_id:         eleve.id,
    whatsappTemplate: process.env.WHATSAPP_TEMPLATE_RETARD || 'eduniger_retard',
    whatsappParams:   [
      `${eleve.prenom} ${eleve.nom}`,  // {{1}}
      matInfo,                          // {{2}} " en Mathématiques" ou ""
      date,                             // {{3}}
      crInfo,                           // {{4}} " (08h-09h)" ou ""
    ],
  });
}

module.exports = {
  envoyerSMS,          // alias rétrocompatible
  envoyerNotification,
  smsBulletinDisponible,
  smsNotesSaisies,
  smsRetard,
  getMention,
  formatTelephone,
};