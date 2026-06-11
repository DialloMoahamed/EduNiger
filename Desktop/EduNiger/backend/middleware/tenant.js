// ============================================================
//  middleware/tenant.js
//  Identifie l'école à partir du sous-domaine de chaque requête
//  et injecte req.tenantId + req.school dans toutes les routes.
//
//  Exemple : lycee-bosso.eduniger.com → slug = "lycee-bosso"
//            → cherche dans schools WHERE slug = "lycee-bosso"
//            → injecte req.tenantId = 3, req.school = { id, name, ... }
// ============================================================

const db = require('../config/database');

module.exports = async (req, res, next) => {
  try {
    const host = req.headers.host || '';

    // -------------------------------------------------------
    // Extraire le slug depuis le sous-domaine
    // "lycee-bosso.eduniger.com" → "lycee-bosso"
    // "localhost:5000"           → null (mode développement)
    // -------------------------------------------------------
    const parts = host.split('.');
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');

    let slug = null;

    if (isLocalhost) {
      // En développement : passer le slug via header X-Tenant-Slug
      // Exemple dans Postman ou le frontend : X-Tenant-Slug: pilote
      slug = req.headers['x-tenant-slug'] || 'pilote';
    } else if (parts.length >= 3) {
      // En production : extraire le sous-domaine
      slug = parts[0];
    } else {
      // Domaine racine eduniger.com sans sous-domaine → page d'accueil publique
      // On laisse passer sans tenant (les routes publiques ne nécessitent pas de tenant)
      return next();
    }

    // -------------------------------------------------------
    // Chercher l'école dans la base
    // -------------------------------------------------------
    const [rows] = await db.query(
      `SELECT id, name, slug, city, logo_url, primary_color, is_active, config
       FROM schools
       WHERE slug = ?
       LIMIT 1`,
      [slug]
    );

    if (!rows.length) {
      return res.status(404).json({
        error: 'École introuvable',
        message: `Aucune école trouvée pour l'identifiant "${slug}".`
      });
    }

    const school = rows[0];

    // -------------------------------------------------------
    // Vérifier que l'abonnement est actif
    // -------------------------------------------------------
    if (!school.is_active) {
      return res.status(403).json({
        error: 'Accès suspendu',
        message: 'L\'abonnement de cette école est expiré ou suspendu. Contactez EduNiger.'
      });
    }

    // -------------------------------------------------------
    // Injecter dans req — disponible dans tous les controllers
    // req.tenantId  → à utiliser dans chaque WHERE tenant_id = ?
    // req.school    → infos complètes de l'école si besoin
    // -------------------------------------------------------
    req.tenantId = school.id;
    req.school   = school;

    next();

  } catch (err) {
    console.error('[tenantMiddleware] Erreur :', err);
    res.status(500).json({ error: 'Erreur serveur lors de l\'identification de l\'école.' });
  }
};