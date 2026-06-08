/**
 * EduNiger — Service SMS
 * Insère une notification dans la table `notifications`.
 * Si TWILIO_ACCOUNT_SID est configuré dans .env, envoie réellement le SMS.
 * Sinon, la notification reste en statut "en_attente" (envoi manuel ou futur provider).
 */

const db = require('../config/database');

function getMention(moy) {
  moy = parseFloat(moy);
  if (moy >= 16) return 'Très Bien';
  if (moy >= 14) return 'Bien';
  if (moy >= 12) return 'Assez Bien';
  if (moy >= 10) return 'Passable';
  return 'Insuffisant';
}

async function sendViaTwilio(telephone, message) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken  = process.env.TWILIO_AUTH_TOKEN;
    const from       = process.env.TWILIO_FROM_NUMBER;
    if (!accountSid || !authToken || !from) return false;
    const twilio = require('twilio')(accountSid, authToken);
    await twilio.messages.create({ body: message, from, to: telephone });
    return true;
  } catch (err) {
    console.error('Twilio error:', err.message);
    return false;
  }
}

async function envoyerSMS({ telephone, message, type, eleve_id = null }) {
  try {
    const [result] = await db.query(
      `INSERT INTO notifications (telephone, message, type, statut, eleve_id, created_at)
       VALUES (?, ?, ?, 'en_attente', ?, NOW())`,
      [telephone, message, type, eleve_id]
    );
    const notif_id = result.insertId;
    const envoye = await sendViaTwilio(telephone, message);
    if (envoye) {
      await db.query(
        `UPDATE notifications SET statut = 'envoye', sent_at = NOW() WHERE id = ?`,
        [notif_id]
      );
    }
    return { success: true, notif_id, envoye };
  } catch (err) {
    console.error('envoyerSMS error:', err.message);
    return { success: false, error: err.message };
  }
}

async function smsBulletinDisponible({ eleve, moyenne_generale, periode }) {
  if (!eleve.telephone_parent) return null;
  const mention = getMention(moyenne_generale);
  const message =
    `[EduNiger] Bulletin de ${eleve.prenom} ${eleve.nom} (${periode}) disponible. ` +
    `Moyenne : ${parseFloat(moyenne_generale).toFixed(2)}/20 — ${mention}. ` +
    `Connectez-vous sur l'espace parent pour le consulter.`;
  return envoyerSMS({ telephone: eleve.telephone_parent, message, type: 'bulletin', eleve_id: eleve.id });
}

async function smsNotesSaisies({ eleve, periode, nb_matieres }) {
  if (!eleve.telephone_parent) return null;
  const message =
    `[EduNiger] Les notes du ${periode} de ${eleve.prenom} ${eleve.nom} ` +
    `sont disponibles (${nb_matieres} matière${nb_matieres > 1 ? 's' : ''}). ` +
    `Consultez l'espace parent.`;
  return envoyerSMS({ telephone: eleve.telephone_parent, message, type: 'notes_saisies', eleve_id: eleve.id });
}

async function smsRetard({ eleve, date, matiere = null, creneau = null }) {
  if (!eleve.telephone_parent) return null;
  const matInfo = matiere ? ` en ${matiere}` : '';
  const crInfo  = creneau ? ` (${creneau})` : '';
  const message =
    `[EduNiger] ${eleve.prenom} ${eleve.nom} a été marqué(e) en retard` +
    `${matInfo} le ${date}${crInfo}.`;
  return envoyerSMS({ telephone: eleve.telephone_parent, message, type: 'retard', eleve_id: eleve.id });
}

module.exports = { envoyerSMS, smsBulletinDisponible, smsNotesSaisies, smsRetard, getMention };