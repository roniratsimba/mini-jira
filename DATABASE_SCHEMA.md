# 🗄️ Schéma de Base de Données Mini-Jira

Documentation complète du schéma relationnel PostgreSQL pour l'application Mini-Jira.

## 📊 Vue d'ensemble

Le schéma est composé de **6 tables principales** normalisées selon la 3ème forme normale (3FN) avec des contraintes d'intégrité et des index de performance.

### Diagramme Entité-Association (ERD)

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   membres   │         │  affectations│         │  projets    │
└──────┬──────┘         └──────┬───────┘         └──────┬──────┘
       │                      │                       │
       │ 1:N                  │ N:1                   │ 1:N
       │                      │                       │
       └──────────────────────┘                       └─────────────┐
                              │                                    │
                              │                                    │
                              │                                    │
                      ┌───────▼──────────┐              ┌────────▼──────┐
                      │ assignations_    │              │     taches     │
                      │     taches       │              └───────┬────────┘
                      └──────────────────┘                      │
                                                              │ 1:N
                                                              │
                                                      ┌───────▼──────────────┐
                                                      │ sessions_travail      │
                                                      └──────────────────────┘

┌─────────────┐
│ notifications│
└──────┬──────┘
       │
       │ N:1
       │
┌──────▼──────┐
│   membres   │
└─────────────┘
```

---

## 📋 Tables et Colonnes

### 1. Table `membres` (Users)

Table des utilisateurs/membres du système.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY, AUTO_INCREMENT | Identifiant unique du membre |
| `email` | VARCHAR(150) | UNIQUE, NOT NULL | Adresse email (identifiant de connexion) |
| `nom` | VARCHAR(100) | NOT NULL | Nom complet de l'utilisateur |
| `mot_de_passe` | VARCHAR(255) | NOT NULL | Hash du mot de passe |
| `avatar_url` | TEXT | NULLABLE | URL de l'avatar de l'utilisateur |
| `date_creation` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Date de création du compte |
| `roles` | JSON | NOT NULL, DEFAULT ["ROLE_USER"] | Rôles de l'utilisateur (RBAC) |

**Relations :**
- `1:N` avec `affectations` (via `ProjectAssignment`)
- `N:M` avec `taches` (via `assignations_taches`)
- `1:N` avec `sessions_travail` (via `WorkSession`)
- `1:N` avec `notifications` (via `Notification`)

---

### 2. Table `projets` (Projects)

Table des projets dans Mini-Jira.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY, AUTO_INCREMENT | Identifiant unique du projet |
| `code` | VARCHAR(50) | UNIQUE, NOT NULL | Code unique du projet (ex: "MJ-101") |
| `nom` | VARCHAR(150) | NOT NULL | Nom du projet |
| `description` | TEXT | NULLABLE | Description détaillée du projet |
| `date_debut` | DATE | NULLABLE | Date de début du projet |
| `date_fin` | DATE | NULLABLE | Date de fin prévue du projet |
| `date_creation` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Date de création du projet |

**Relations :**
- `1:N` avec `affectations` (via `ProjectAssignment`)
- `1:N` avec `taches` (via `Task`)

---

### 3. Table `affectations` (Project Assignments)

Table de liaison N:M entre membres et projets avec gestion des rôles RBAC.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY, AUTO_INCREMENT | Identifiant unique de l'affectation |
| `projet_id` | INT | FOREIGN KEY → projets(id), NOT NULL, ON DELETE CASCADE | Référence au projet |
| `membre_id` | INT | FOREIGN KEY → membres(id), NOT NULL, ON DELETE CASCADE | Référence au membre |
| `role` | VARCHAR(20) | NOT NULL, DEFAULT 'MEMBRE', CHECK IN ('ADMIN', 'MEMBRE') | Rôle du membre sur le projet |
| `date_affectation` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Date d'affectation au projet |

**Contraintes :**
- `UNIQUE(projet_id, membre_id)` : Un membre ne peut être affecté qu'une fois par projet

**Relations :**
- `N:1` avec `projets`
- `N:1` avec `membres`

---

### 4. Table `taches` (Tasks)

Table des tâches du système Kanban.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY, AUTO_INCREMENT | Identifiant unique de la tâche |
| `projet_id` | INT | FOREIGN KEY → projets(id), NOT NULL, ON DELETE CASCADE | Référence au projet |
| `titre` | VARCHAR(200) | NOT NULL | Titre de la tâche |
| `description` | TEXT | NULLABLE | Description détaillée de la tâche |
| `priorite` | VARCHAR(20) | NOT NULL, DEFAULT 'MOYENNE', CHECK IN ('BASSE', 'MOYENNE', 'HAUTE') | Niveau de priorité |
| `statut` | VARCHAR(20) | NOT NULL, DEFAULT 'A_FAIRE', CHECK IN ('A_FAIRE', 'EN_COURS', 'TERMINE') | Statut Kanban |
| `temps_estime` | INTEGER | NOT NULL, DEFAULT 0 | Temps estimé en minutes |
| `date_creation` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Date de création de la tâche |

**Relations :**
- `N:1` avec `projets`
- `N:M` avec `membres` (via `assignations_taches`)
- `1:N` avec `sessions_travail` (via `WorkSession`)

---

### 5. Table `assignations_taches` (Task Assignments)

Table de liaison N:M entre tâches et membres (assignation des tâches).

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `tache_id` | INT | FOREIGN KEY → taches(id), NOT NULL, ON DELETE CASCADE | Référence à la tâche |
| `membre_id` | INT | FOREIGN KEY → membres(id), NOT NULL, ON DELETE CASCADE | Référence au membre assigné |

**Contraintes :**
- `PRIMARY KEY(tache_id, membre_id)` : Association unique

**Relations :**
- `N:1` avec `taches`
- `N:1` avec `membres`

---

### 6. Table `sessions_travail` (Work Sessions)

Table des sessions de chronométrage de travail.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY, AUTO_INCREMENT | Identifiant unique de la session |
| `tache_id` | INT | FOREIGN KEY → taches(id), NOT NULL, ON DELETE CASCADE | Référence à la tâche |
| `membre_id` | INT | FOREIGN KEY → membres(id), NOT NULL, ON DELETE CASCADE | Référence au membre travaillant |
| `debut` | TIMESTAMP | NOT NULL | Date et heure de début de session |
| `fin` | TIMESTAMP | NULLABLE | Date et heure de fin de session |
| `duree_minutes` | INTEGER | NOT NULL, DEFAULT 0 | Durée calculée en minutes |

**Relations :**
- `N:1` avec `taches`
- `N:1` avec `membres`

---

### 7. Table `notifications`

Table des notifications utilisateurs.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY, AUTO_INCREMENT | Identifiant unique de la notification |
| `membre_id` | INT | FOREIGN KEY → membres(id), NOT NULL, ON DELETE CASCADE | Référence au membre destinataire |
| `type` | VARCHAR(50) | NOT NULL | Type de notification (TASK_ASSIGNED, STATUS_CHANGED, etc.) |
| `titre` | VARCHAR(150) | NOT NULL | Titre de la notification |
| `message` | TEXT | NOT NULL | Message détaillé de la notification |
| `lu` | BOOLEAN | NOT NULL, DEFAULT FALSE | Statut de lecture |
| `date_creation` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Date de création de la notification |

**Relations :**
- `N:1` avec `membres`

---

## 🔍 Index de Performance

Les index suivants sont créés pour optimiser les requêtes fréquentes :

```sql
-- Index sur les relations fréquentes
CREATE INDEX idx_affectations_membre ON affectations(membre_id);
CREATE INDEX idx_affectations_projet ON affectations(projet_id);
CREATE INDEX idx_taches_projet ON taches(projet_id);
CREATE INDEX idx_sessions_tache ON sessions_travail(tache_id);
CREATE INDEX idx_notifications_membre ON notifications(membre_id);
```

---

## 🎯 Constantes et Énumérations

### Priorités des tâches
- `BASSE` : Priorité faible
- `MOYENNE` : Priorité moyenne (défaut)
- `HAUTE` : Priorité élevée

### Statuts des tâches (Kanban)
- `A_FAIRE` : À faire (défaut)
- `EN_COURS` : En cours
- `TERMINE` : Terminé

### Rôles des membres (RBAC)
- `MEMBRE` : Membre standard (défaut)
- `ADMIN` : Administrateur du projet

### Types de notifications
- `TASK_ASSIGNED` : Tâche assignée
- `STATUS_CHANGED` : Changement de statut
- `PROJECT_INVITATION` : Invitation à un projet
- `TIME_EXCEEDED` : Dépassement de temps estimé

---

## 🔐 Sécurité et Intégrité

### Contraintes d'intégrité
- **Clés étrangères** : Toutes les relations sont protégées par des contraintes FOREIGN KEY
- **Cascade DELETE** : Suppression en cascade pour maintenir la cohérence
- **Unicité** : Contraintes UNIQUE sur les emails et codes de projet
- **CHECK** : Validation des valeurs énumérées (statuts, priorités, rôles)

### Sécurité des données
- **Mots de passe** : Stockés sous forme de hash (non en clair)
- **Rôles** : Gestion RBAC via la table `affectations`
- **Audit trail** : Dates de création sur toutes les entités

---

## 📝 Scripts SQL de référence

### Création complète du schéma

```sql
-- 1. Table MEMBRE
CREATE TABLE IF NOT EXISTS membres (
  id SERIAL PRIMARY KEY,
  email VARCHAR(150) UNIQUE NOT NULL,
  nom VARCHAR(100) NOT NULL,
  mot_de_passe VARCHAR(255) NOT NULL,
  avatar_url TEXT DEFAULT '',
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  roles JSON NOT NULL DEFAULT '["ROLE_USER"]'::json
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

-- 3. Table AFFECTATION
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
  temps_estime INT NOT NULL DEFAULT 0,
  date_creation TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Table ASSIGNATION_TACHE
CREATE TABLE IF NOT EXISTS assignations_taches (
  tache_id INT NOT NULL REFERENCES taches(id) ON DELETE CASCADE,
  membre_id INT NOT NULL REFERENCES membres(id) ON DELETE CASCADE,
  PRIMARY KEY (tache_id, membre_id)
);

-- 6. Table SESSION_TRAVAIL
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

-- Index de performance
CREATE INDEX IF NOT EXISTS idx_affectations_membre ON affectations(membre_id);
CREATE INDEX IF NOT EXISTS idx_affectations_projet ON affectations(projet_id);
CREATE INDEX IF NOT EXISTS idx_taches_projet ON taches(projet_id);
CREATE INDEX IF NOT EXISTS idx_sessions_tache ON sessions_travail(tache_id);
CREATE INDEX IF NOT EXISTS idx_notifications_membre ON notifications(membre_id);
```

---

## 🔄 Relations Symfony ORM

Les entités Symfony correspondantes sont situées dans `Backend/symfony-backend/src/Entity/` :

- `User.php` → Table `membres`
- `Project.php` → Table `projets`
- `ProjectAssignment.php` → Table `affectations`
- `Task.php` → Table `taches`
- `WorkSession.php` → Table `sessions_travail`
- `Notification.php` → Table `notifications`

---

## 📊 Statistiques du schéma

- **Nombre de tables** : 7
- **Nombre de relations** : 6
- **Nombre d'index** : 5
- **Nombre de contraintes CHECK** : 4
- **Nombre de contraintes UNIQUE** : 3
- **Contraintes FOREIGN KEY** : 10

---

**Document généré automatiquement à partir des entités Symfony Doctrine ORM.**