-- ============================================================================
-- MINI-JIRA SYMFONY BACKEND — SCRIPT SQL POSTGRESQL DIRECT
-- ============================================================================
-- Ce fichier est le miroir de /database/init_postgres.sql pour le backend Symfony.
-- Exécution directe :
--   docker-compose exec postgres psql -U postgres -d minijira -f /var/www/symfony/database/init_postgres.sql
-- Ou :
--   cat database/init_postgres.sql | docker-compose exec -T postgres psql -U postgres -d minijira
-- ============================================================================

\i ../database/init_postgres.sql
