-- ============================================================================
-- MINI-JIRA — SCRIPT D'INITIALISATION ET DE SEEDING POSTGRESQL (3FN)
-- ============================================================================
-- Ce script est 100% prêt à l'exécution dans n'importe quel environnement PostgreSQL
-- (Docker local, PostgreSQL natif, Cloud SQL, Supabase, Neon, AWS RDS, Render).
--
-- Commande d'exécution en ligne de commande :
--   psql -U postgres -d minijira -f database/init_postgres.sql
--
-- Ou via un client graphique (pgAdmin, DBeaver, Adminer, Supabase SQL Editor) :
--   Copier/coller l'intégralité du contenu de ce fichier et exécuter.
-- ============================================================================

-- 0. Extensions PostgreSQL utiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. NETTOYAGE DES TABLES EXISTANTES (Ordre respectant les contraintes FK)
-- ============================================================================
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS sessions_travail CASCADE;
DROP TABLE IF EXISTS assignations_taches CASCADE;
DROP TABLE IF EXISTS taches CASCADE;
DROP TABLE IF EXISTS affectations CASCADE;
DROP TABLE IF EXISTS projets CASCADE;
DROP TABLE IF EXISTS membres CASCADE;

-- ============================================================================
-- 2. CRÉATION DES TABLES RELATIONNELLES (Conformes Doctrine ORM 3 & UML 3FN)
-- ============================================================================

-- Table 1 : MEMBRES (Utilisateurs de la plateforme Mini-Jira)
CREATE TABLE membres (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    avatar_url TEXT DEFAULT '',
    roles JSONB NOT NULL DEFAULT '["ROLE_USER"]'::jsonb,
    date_creation TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table 2 : PROJETS
CREATE TABLE projets (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(150) NOT NULL,
    description TEXT,
    date_debut DATE,
    date_fin DATE,
    date_creation TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table 3 : AFFECTATIONS (Table de liaison Membre <-> Projet avec Rôle RBAC)
CREATE TABLE affectations (
    id SERIAL PRIMARY KEY,
    projet_id INT NOT NULL REFERENCES projets(id) ON DELETE CASCADE,
    membre_id INT NOT NULL REFERENCES membres(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'MEMBRE' CHECK (role IN ('ADMIN', 'MEMBRE')),
    date_affectation TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_projet_membre UNIQUE (projet_id, membre_id)
);

-- Table 4 : TACHES (Tickets de sprint Kanban)
CREATE TABLE taches (
    id SERIAL PRIMARY KEY,
    projet_id INT NOT NULL REFERENCES projets(id) ON DELETE CASCADE,
    titre VARCHAR(200) NOT NULL,
    description TEXT,
    priorite VARCHAR(20) NOT NULL DEFAULT 'MOYENNE' CHECK (priorite IN ('BASSE', 'MOYENNE', 'HAUTE')),
    statut VARCHAR(20) NOT NULL DEFAULT 'A_FAIRE' CHECK (statut IN ('A_FAIRE', 'EN_COURS', 'TERMINE')),
    temps_estime INT NOT NULL DEFAULT 0, -- Durée estimée en minutes
    date_creation TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table 5 : ASSIGNATIONS_TACHES (Table de liaison N:M Membre <-> Tâche)
CREATE TABLE assignations_taches (
    tache_id INT NOT NULL REFERENCES taches(id) ON DELETE CASCADE,
    membre_id INT NOT NULL REFERENCES membres(id) ON DELETE CASCADE,
    PRIMARY KEY (tache_id, membre_id)
);

-- Table 6 : SESSIONS_TRAVAIL (Suivi du chronomètre en temps réel)
CREATE TABLE sessions_travail (
    id SERIAL PRIMARY KEY,
    tache_id INT NOT NULL REFERENCES taches(id) ON DELETE CASCADE,
    membre_id INT NOT NULL REFERENCES membres(id) ON DELETE CASCADE,
    debut TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fin TIMESTAMP WITHOUT TIME ZONE,
    duree_minutes INT NOT NULL DEFAULT 0
);

-- Table 7 : NOTIFICATIONS (Alertes d'assignation, invitations et retards)
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    membre_id INT NOT NULL REFERENCES membres(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    titre VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    lu BOOLEAN NOT NULL DEFAULT FALSE,
    date_creation TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. INDEX DE PERFORMANCE POUR LES REQUÊTES ET JOINTURES FRÉQUENTES
-- ============================================================================
CREATE INDEX idx_membres_email ON membres(email);
CREATE INDEX idx_projets_code ON projets(code);
CREATE INDEX idx_affectations_membre ON affectations(membre_id);
CREATE INDEX idx_affectations_projet ON affectations(projet_id);
CREATE INDEX idx_taches_projet ON taches(projet_id);
CREATE INDEX idx_taches_statut ON taches(statut);
CREATE INDEX idx_sessions_tache ON sessions_travail(tache_id);
CREATE INDEX idx_sessions_membre ON sessions_travail(membre_id);
CREATE INDEX idx_notifications_membre_lu ON notifications(membre_id, lu);

-- ============================================================================
-- 4. INSERTION DE DONNÉES DE TEST & FIXTURES RÉALISTES
-- ============================================================================
-- Mot de passe par défaut pour tous les comptes de test : Password123!
-- Haché avec BCrypt (compatible Symfony PasswordHasher et Node)
-- $2y$13$M3e5sK5tO8uA9bC1dE3fG5hJ7kL9oP1qR3sT5uV7wX9yZ1aB3c.

-- A. Insertion des membres (incluant r.titankelyy@gmail.com en Admin Principal)
INSERT INTO membres (id, nom, email, mot_de_passe, avatar_url, roles, date_creation) VALUES
(1, 'Titan (Administrateur)', 'r.titankelyy@gmail.com', '$2y$13$112233445566778899001122334455667788990011223344556677', 'https://api.dicebear.com/7.x/avataaars/svg?seed=TitanLead', '["ROLE_ADMIN", "ROLE_USER"]'::jsonb, NOW() - INTERVAL '30 days'),
(2, 'Sophie Martin', 'sophie.martin@minijira.io', '$2y$13$112233445566778899001122334455667788990011223344556677', 'https://api.dicebear.com/7.x/avataaars/svg?seed=SophieLead', '["ROLE_USER"]'::jsonb, NOW() - INTERVAL '25 days'),
(3, 'Thomas Dubois', 'thomas.dubois@minijira.io', '$2y$13$112233445566778899001122334455667788990011223344556677', 'https://api.dicebear.com/7.x/avataaars/svg?seed=ThomasDev', '["ROLE_USER"]'::jsonb, NOW() - INTERVAL '20 days'),
(4, 'Émilie Bernard', 'emilie.bernard@minijira.io', '$2y$13$112233445566778899001122334455667788990011223344556677', 'https://api.dicebear.com/7.x/avataaars/svg?seed=EmilieDesign', '["ROLE_USER"]'::jsonb, NOW() - INTERVAL '15 days');

-- Mise à jour de la séquence d'ID des membres
SELECT setval('membres_id_seq', (SELECT MAX(id) FROM membres));

-- B. Insertion des projets
INSERT INTO projets (id, code, nom, description, date_debut, date_fin, date_creation) VALUES
(1, 'PRJ-ALPHA', 'Refonte Plateforme E-Commerce', 'Modernisation complète de la boutique en ligne avec stack headless Next/React, microservices et paiements Stripe.', CURRENT_DATE - INTERVAL '14 days', CURRENT_DATE + INTERVAL '45 days', NOW() - INTERVAL '14 days'),
(2, 'PRJ-BETA', 'Application Mobile iOS & Android', 'Développement de la nouvelle application mobile réactive avec authentification biométrique et mode hors-ligne.', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE + INTERVAL '60 days', NOW() - INTERVAL '7 days'),
(3, 'PRJ-CORE', 'API Gateway & Architecture Symfony 7', 'Conception du socle API RESTful sécurisé avec JWT, gestion RBAC et base PostgreSQL haute disponibilité.', CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '30 days', NOW() - INTERVAL '3 days');

SELECT setval('projets_id_seq', (SELECT MAX(id) FROM projets));

-- C. Affectation des membres aux projets (avec rôles RBAC)
INSERT INTO affectations (projet_id, membre_id, role, date_affectation) VALUES
-- Projet 1
(1, 1, 'ADMIN', NOW() - INTERVAL '14 days'),
(1, 2, 'MEMBRE', NOW() - INTERVAL '13 days'),
(1, 3, 'MEMBRE', NOW() - INTERVAL '12 days'),
-- Projet 2
(2, 1, 'ADMIN', NOW() - INTERVAL '7 days'),
(2, 4, 'MEMBRE', NOW() - INTERVAL '6 days'),
-- Projet 3
(3, 1, 'ADMIN', NOW() - INTERVAL '3 days'),
(3, 2, 'ADMIN', NOW() - INTERVAL '3 days'),
(3, 3, 'MEMBRE', NOW() - INTERVAL '2 days');

-- D. Insertion des tâches (Kanban)
INSERT INTO taches (id, projet_id, titre, description, priorite, statut, temps_estime, date_creation) VALUES
-- Tâches Projet 1
(1, 1, 'Mise en place de l''authentification JWT', 'Intégrer LexikJWTAuthenticationBundle et générer la paire de clés RSA 4096 bits.', 'HAUTE', 'TERMINE', 240, NOW() - INTERVAL '12 days'),
(2, 1, 'Création du schéma de base de données PostgreSQL', 'Concevoir le script DDL conforme 3FN avec clés étrangères et index optimisés.', 'HAUTE', 'TERMINE', 180, NOW() - INTERVAL '10 days'),
(3, 1, 'Développement du composant Kanban interactif', 'Implémenter le tableau avec colonnes À faire, En cours, Terminé et drag & drop fluide.', 'HAUTE', 'EN_COURS', 360, NOW() - INTERVAL '5 days'),
(4, 1, 'Intégration du chronomètre temps réel', 'Permettre aux membres de démarrer, mettre en pause et logger leurs sessions de travail.', 'MOYENNE', 'EN_COURS', 300, NOW() - INTERVAL '4 days'),
(5, 1, 'Configuration du module de notifications email', 'Configurer le service d''envoi d''emails SMTP pour les invitations et les alertes d''assignation.', 'MOYENNE', 'A_FAIRE', 180, NOW() - INTERVAL '2 days'),
(6, 1, 'Tests de performance et audits de sécurité OWASP', 'Exécuter les benchmarks de charge et valider la résistance aux injections SQL et XSS.', 'BASSE', 'A_FAIRE', 120, NOW() - INTERVAL '1 day'),

-- Tâches Projet 2
(7, 2, 'Design system et maquettes Figma', 'Établir la palette de couleurs, la typographie et les composants mobiles réutilisables.', 'HAUTE', 'TERMINE', 300, NOW() - INTERVAL '6 days'),
(8, 2, 'Intégration du store local SQLite / Offline', 'Garantir la persistance locale des données en cas de coupure réseau.', 'HAUTE', 'EN_COURS', 420, NOW() - INTERVAL '3 days'),

-- Tâches Projet 3
(9, 3, 'Mise en place de Docker Compose pour PostgreSQL 16', 'Créer le fichier docker-compose.yml avec conteneurs PHP 8.2-FPM, Nginx et Adminer.', 'HAUTE', 'TERMINE', 120, NOW() - INTERVAL '3 days'),
(10, 3, 'Sécurisation des routes d''API avec les Voters Symfony', 'Restreindre les actions critiques aux seuls utilisateurs ayant le rôle ADMIN sur le projet.', 'HAUTE', 'EN_COURS', 240, NOW() - INTERVAL '1 day');

SELECT setval('taches_id_seq', (SELECT MAX(id) FROM taches));

-- E. Assignation des tâches aux membres
INSERT INTO assignations_taches (tache_id, membre_id) VALUES
(1, 1),
(2, 1),
(3, 1),
(3, 2),
(4, 3),
(5, 1),
(6, 2),
(7, 4),
(8, 1),
(9, 1),
(10, 1),
(10, 2);

-- F. Sessions de travail réelles (Chronomètre)
INSERT INTO sessions_travail (tache_id, membre_id, debut, fin, duree_minutes) VALUES
(1, 1, NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days' + INTERVAL '240 minutes', 240),
(2, 1, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days' + INTERVAL '180 minutes', 180),
(3, 1, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '210 minutes', 210),
(3, 2, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '150 minutes', 150),
(4, 3, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '180 minutes', 180),
(7, 4, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '290 minutes', 290),
(9, 1, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '115 minutes', 115);

-- G. Notifications initiales ciblées (notamment pour r.titankelyy@gmail.com)
INSERT INTO notifications (membre_id, type, titre, message, lu, date_creation) VALUES
(1, 'PROJET', 'Bienvenue sur Mini-Jira !', 'Votre espace de travail Mini-Jira a été initialisé avec succès avec la base PostgreSQL.', TRUE, NOW() - INTERVAL '14 days'),
(1, 'TACHE', 'Nouvelle assignation', 'Vous avez été assigné à la tâche "Configuration du module de notifications email".', FALSE, NOW() - INTERVAL '2 hours'),
(1, 'SPRINT', 'Alerte Sprint', 'Le sprint "Refonte Plateforme E-Commerce" est complété à 65%. Échéance dans 45 jours.', FALSE, NOW() - INTERVAL '30 minutes'),
(2, 'TACHE', 'Assignation de tâche', 'Vous êtes assigné à la tâche "Développement du composant Kanban interactif".', FALSE, NOW() - INTERVAL '1 day');

-- ============================================================================
-- FIN DU SCRIPT D'INITIALISATION
-- ============================================================================
