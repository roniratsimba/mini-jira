export const SQL_SCHEMA_CONTENT = `-- =====================================================================
-- MINI-JIRA — Script SQL de référence PostgreSQL 16 & Doctrine ORM 3
-- Emplacement dans le projet : /database/init_postgres.sql
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Nettoyage idempotent
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS sessions_travail CASCADE;
DROP TABLE IF EXISTS assignations_taches CASCADE;
DROP TABLE IF EXISTS taches CASCADE;
DROP TABLE IF EXISTS affectations CASCADE;
DROP TABLE IF EXISTS projets CASCADE;
DROP TABLE IF EXISTS membres CASCADE;

-- 1. Table MEMBRES (Utilisateurs et profils)
CREATE TABLE membres (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    avatar_url TEXT DEFAULT '',
    roles JSONB NOT NULL DEFAULT '["ROLE_USER"]'::jsonb,
    date_creation TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table PROJETS
CREATE TABLE projets (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(150) NOT NULL,
    description TEXT,
    date_debut DATE,
    date_fin DATE,
    date_creation TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table AFFECTATIONS (Association N:M entre Membre et Projet avec Rôle RBAC)
CREATE TABLE affectations (
    id SERIAL PRIMARY KEY,
    projet_id INT NOT NULL REFERENCES projets(id) ON DELETE CASCADE,
    membre_id INT NOT NULL REFERENCES membres(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'MEMBRE' CHECK (role IN ('ADMIN', 'MEMBRE')),
    date_affectation TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_projet_membre UNIQUE (projet_id, membre_id)
);

-- 4. Table TACHES (Tickets Kanban)
CREATE TABLE taches (
    id SERIAL PRIMARY KEY,
    projet_id INT NOT NULL REFERENCES projets(id) ON DELETE CASCADE,
    titre VARCHAR(200) NOT NULL,
    description TEXT,
    priorite VARCHAR(20) NOT NULL DEFAULT 'MOYENNE' CHECK (priorite IN ('BASSE', 'MOYENNE', 'HAUTE')),
    statut VARCHAR(20) NOT NULL DEFAULT 'A_FAIRE' CHECK (statut IN ('A_FAIRE', 'EN_COURS', 'TERMINE')),
    temps_estime INT NOT NULL DEFAULT 0, -- Durée en minutes
    date_creation TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Table ASSIGNATIONS_TACHES (Attribution N:M des membres aux tâches)
CREATE TABLE assignations_taches (
    tache_id INT NOT NULL REFERENCES taches(id) ON DELETE CASCADE,
    membre_id INT NOT NULL REFERENCES membres(id) ON DELETE CASCADE,
    PRIMARY KEY (tache_id, membre_id)
);

-- 6. Table SESSIONS_TRAVAIL (Suivi du chronomètre temps réel)
CREATE TABLE sessions_travail (
    id SERIAL PRIMARY KEY,
    tache_id INT NOT NULL REFERENCES taches(id) ON DELETE CASCADE,
    membre_id INT NOT NULL REFERENCES membres(id) ON DELETE CASCADE,
    debut TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fin TIMESTAMP WITHOUT TIME ZONE,
    duree_minutes INT NOT NULL DEFAULT 0
);

-- 7. Table NOTIFICATIONS (Alertes et notifications in-app)
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    membre_id INT NOT NULL REFERENCES membres(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    titre VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    lu BOOLEAN NOT NULL DEFAULT FALSE,
    date_creation TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index de performance
CREATE INDEX idx_membres_email ON membres(email);
CREATE INDEX idx_projets_code ON projets(code);
CREATE INDEX idx_affectations_membre ON affectations(membre_id);
CREATE INDEX idx_affectations_projet ON affectations(projet_id);
CREATE INDEX idx_taches_projet ON taches(projet_id);
CREATE INDEX idx_taches_statut ON taches(statut);
CREATE INDEX idx_sessions_tache ON sessions_travail(tache_id);
CREATE INDEX idx_notifications_membre_lu ON notifications(membre_id, lu);

-- Compte Administrateur Initial inclus dans le script :
-- r.titankelyy@gmail.com | Password123! | Rôle ADMIN
`;

export const MERMAID_CLASS_DIAGRAM = `classDiagram
    class Membre {
        -int id
        -string nom
        -string email
        -string motDePasse
        -string avatarUrl
        -array roles
        -DateTime dateCreation
    }

    class Projet {
        -int id
        -string code
        -string nom
        -string description
        -Date dateDebut
        -Date dateFin
        -DateTime dateCreation
    }

    class Affectation {
        -int id
        -string role
        -DateTime dateAffectation
    }

    class Tache {
        -int id
        -string titre
        -string description
        -string priorite
        -string statut
        -int tempsEstime
        -DateTime dateCreation
    }

    class SessionTravail {
        -int id
        -DateTime debut
        -DateTime fin
        -int dureeMinutes
    }

    class Notification {
        -int id
        -string type
        -string titre
        -string message
        -boolean lu
        -DateTime dateCreation
    }

    Membre "1" --> "0..*" Affectation
    Projet "1" --> "0..*" Affectation
    Projet "1" --> "0..*" Tache
    Tache "0..*" <--> "0..*" Membre : Assignations
    Tache "1" --> "0..*" SessionTravail
    Membre "1" --> "0..*" SessionTravail
    Membre "1" --> "0..*" Notification`;
