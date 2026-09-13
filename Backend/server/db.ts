/**
 * =====================================================================
 * MINI-JIRA — MODULE DE CONNEXION ET SCHÉMA POSTGRESQL
 * =====================================================================
 * Ce module initialise le pool de connexions PostgreSQL via la bibliothèque 'pg'.
 * Il supporte :
 * 1. La connexion via variable d'environnement DATABASE_URL (ex: Supabase, Neon, AWS RDS, Cloud SQL)
 * 2. Les variables individuelles (PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE)
 * 3. Une initialisation automatique et idempotente des tables si elles n'existent pas
 * 4. Une gestion défensive des erreurs pour continuer à servir l'application même si
 *    la base de données externe n'est pas encore démarrée localement.
 */

import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

let pool: Pool | null = null;
let isConnected = false;
let lastError: string | null = null;

function getPoolConfig(): PoolConfig {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    };
  }

  return {
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432', 10),
    database: process.env.PGDATABASE || 'minijira',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : undefined,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  };
}

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool(getPoolConfig());

    pool.on('error', (err) => {
      console.error('[PostgreSQL] Erreur inattendue sur le client idle:', err.message);
      lastError = err.message;
      isConnected = false;
    });
  }
  return pool;
}

/**
 * Teste la connexion à PostgreSQL de façon non-bloquante
 */
export async function testConnection(): Promise<{ connected: boolean; message: string; version?: string }> {
  try {
    const p = getPool();
    const client = await p.connect();
    try {
      const res = await client.query('SELECT version();');
      isConnected = true;
      lastError = null;
      return {
        connected: true,
        message: 'Connexion PostgreSQL réussie.',
        version: res.rows[0]?.version || 'PostgreSQL',
      };
    } finally {
      client.release();
    }
  } catch (err: any) {
    isConnected = false;
    lastError = err.message;
    return {
      connected: false,
      message: `Impossible de joindre la base PostgreSQL : ${err.message}`,
    };
  }
}

/**
 * Initialise le schéma relationnel conforme au modèle 3FN PFE de Mini-Jira
 */
export async function initDatabaseSchema(): Promise<{ success: boolean; message: string }> {
  const p = getPool();
  const ddl = `
    -- 1. Table MEMBRE (Utilisateurs et profils)
    CREATE TABLE IF NOT EXISTS membres (
      id SERIAL PRIMARY KEY,
      nom VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      mot_de_passe VARCHAR(255) NOT NULL,
      avatar_url TEXT DEFAULT '',
      date_creation TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. Table PROJET
    CREATE TABLE IF NOT EXISTS projets (
      id SERIAL PRIMARY KEY,
      code VARCHAR(50) UNIQUE NOT NULL,
      nom VARCHAR(150) NOT NULL,
      description TEXT,
      date_debut DATE,
      date_fin DATE,
      date_creation TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- 3. Table AFFECTATION (Association N:M entre Membre et Projet avec Rôle RBAC)
    CREATE TABLE IF NOT EXISTS affectations (
      id SERIAL PRIMARY KEY,
      projet_id INT NOT NULL REFERENCES projets(id) ON DELETE CASCADE,
      membre_id INT NOT NULL REFERENCES membres(id) ON DELETE CASCADE,
      role VARCHAR(20) NOT NULL DEFAULT 'MEMBRE' CHECK (role IN ('ADMIN', 'MEMBRE')),
      date_affectation TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_projet_membre UNIQUE (projet_id, membre_id)
    );

    -- 4. Table TACHE
    CREATE TABLE IF NOT EXISTS taches (
      id SERIAL PRIMARY KEY,
      projet_id INT NOT NULL REFERENCES projets(id) ON DELETE CASCADE,
      titre VARCHAR(200) NOT NULL,
      description TEXT,
      priorite VARCHAR(20) NOT NULL DEFAULT 'MOYENNE' CHECK (priorite IN ('BASSE', 'MOYENNE', 'HAUTE')),
      statut VARCHAR(20) NOT NULL DEFAULT 'A_FAIRE' CHECK (statut IN ('A_FAIRE', 'EN_COURS', 'TERMINE')),
      temps_estime INT NOT NULL DEFAULT 0, -- durée en minutes
      date_creation TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- 5. Table ASSIGNATION_TACHE (Attribution N:M des membres aux tâches)
    CREATE TABLE IF NOT EXISTS assignations_taches (
      tache_id INT NOT NULL REFERENCES taches(id) ON DELETE CASCADE,
      membre_id INT NOT NULL REFERENCES membres(id) ON DELETE CASCADE,
      PRIMARY KEY (tache_id, membre_id)
    );

    -- 6. Table SESSION_TRAVAIL (V2 - Chronomètre temps réel)
    CREATE TABLE IF NOT EXISTS sessions_travail (
      id SERIAL PRIMARY KEY,
      tache_id INT NOT NULL REFERENCES taches(id) ON DELETE CASCADE,
      membre_id INT NOT NULL REFERENCES membres(id) ON DELETE CASCADE,
      debut TIMESTAMP WITH TIME ZONE NOT NULL,
      fin TIMESTAMP WITH TIME ZONE,
      duree_minutes INT DEFAULT 0
    );

    -- 7. Table NOTIFICATION
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      membre_id INT NOT NULL REFERENCES membres(id) ON DELETE CASCADE,
      type VARCHAR(50) NOT NULL,
      titre VARCHAR(150) NOT NULL,
      message TEXT NOT NULL,
      lu BOOLEAN NOT NULL DEFAULT FALSE,
      date_creation TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Index de performance pour les jointures fréquentes
    CREATE INDEX IF NOT EXISTS idx_affectations_membre ON affectations(membre_id);
    CREATE INDEX IF NOT EXISTS idx_affectations_projet ON affectations(projet_id);
    CREATE INDEX IF NOT EXISTS idx_taches_projet ON taches(projet_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_tache ON sessions_travail(tache_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_membre ON notifications(membre_id);
  `;

  try {
    const client = await p.connect();
    try {
      await client.query(ddl);
      return { success: true, message: 'Schéma de base de données PostgreSQL initialisé avec succès.' };
    } finally {
      client.release();
    }
  } catch (err: any) {
    return { success: false, message: `Erreur lors de l'initialisation du schéma : ${err.message}` };
  }
}

/**
 * Retourne l'état de santé et de diagnostic PostgreSQL
 */
export function getDbHealthState() {
  return {
    engine: 'PostgreSQL',
    configured: Boolean(process.env.DATABASE_URL || process.env.PGHOST),
    isConnected,
    lastError,
    configTarget: process.env.DATABASE_URL ? 'DATABASE_URL' : `${process.env.PGHOST || 'localhost'}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE || 'minijira'}`,
  };
}
