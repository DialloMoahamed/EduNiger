-- ============================================================
--  EduNiger SaaS — Vérification post-migration
--  Usage : mysql -u root -p gestion_scolaire < verify_migration.sql
-- ============================================================

SELECT '===== VÉRIFICATION MIGRATION SAAS =====' AS info;

-- 1. Nouvelles tables SaaS créées
SELECT '--- Nouvelles tables SaaS ---' AS section;
SELECT TABLE_NAME
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN ('schools','pricing','payments','super_admins')
ORDER BY TABLE_NAME;

-- 2. Colonnes tenant_id présentes sur toutes les tables métier
SELECT '--- Colonnes tenant_id présentes ---' AS section;
SELECT TABLE_NAME, COLUMN_NAME, COLUMN_DEFAULT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND COLUMN_NAME = 'tenant_id'
ORDER BY TABLE_NAME;

-- 3. Données existantes rattachées au tenant 1
SELECT '--- Données par table ---' AS section;
SELECT 'users'           AS table_name, tenant_id, COUNT(*) AS nb FROM users           GROUP BY tenant_id
UNION ALL
SELECT 'eleves',                         tenant_id, COUNT(*) FROM eleves          GROUP BY tenant_id
UNION ALL
SELECT 'classes',                        tenant_id, COUNT(*) FROM classes         GROUP BY tenant_id
UNION ALL
SELECT 'matieres',                       tenant_id, COUNT(*) FROM matieres        GROUP BY tenant_id
UNION ALL
SELECT 'notes',                          tenant_id, COUNT(*) FROM notes           GROUP BY tenant_id
UNION ALL
SELECT 'presences',                      tenant_id, COUNT(*) FROM presences       GROUP BY tenant_id
UNION ALL
SELECT 'bulletins',                      tenant_id, COUNT(*) FROM bulletins       GROUP BY tenant_id
UNION ALL
SELECT 'conversations',                  tenant_id, COUNT(*) FROM conversations   GROUP BY tenant_id
UNION ALL
SELECT 'messages',                       tenant_id, COUNT(*) FROM messages        GROUP BY tenant_id
UNION ALL
SELECT 'emploi_du_temps',                tenant_id, COUNT(*) FROM emploi_du_temps GROUP BY tenant_id
UNION ALL
SELECT 'notifications',                  tenant_id, COUNT(*) FROM notifications   GROUP BY tenant_id
ORDER BY table_name;

-- 4. École pilote et tarification
SELECT '--- École pilote ---' AS section;
SELECT id, name, slug, is_active FROM schools;

SELECT '--- Tarification en vigueur ---' AS section;
SELECT installation_fee, annual_fee, currency, note FROM pricing WHERE is_current = 1;

-- 5. Statut abonnements
SELECT '--- Statut abonnements ---' AS section;
SELECT * FROM v_schools_subscription;

SELECT '===== FIN VÉRIFICATION =====' AS info;
