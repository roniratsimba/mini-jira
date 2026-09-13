# 🗄️ Base de Données PostgreSQL — Mini-Jira

Ce dossier contient le script d'initialisation complet et autonome de la base de données relationnelle **PostgreSQL 16** pour l'application **Mini-Jira**.

---

## 📁 Contenu du Dossier

- **`init_postgres.sql`** : Script DDL & DML 100% autonome et idempotent.
  - Nettoyage des tables existantes avec gestion des clés étrangères (`CASCADE`).
  - Création des 7 tables conformes au modèle 3FN (`membres`, `projets`, `affectations`, `taches`, `assignations_taches`, `sessions_travail`, `notifications`).
  - Déclaration des contraintes d'intégrité référentielle (`ON DELETE CASCADE`, `UNIQUE`, `CHECK`).
  - Index d'optimisation sur les colonnes de jointure et de recherche.
  - Insertion du jeu d'essai initial (fixtures) comprenant l'utilisateur administrateur principal `r.titankelyy@gmail.com`, 3 projets concrets, des tâches Kanban, des sessions de travail horodatées et des notifications.

---

## 🚀 Méthodes d'Exécution

### 1. Via Docker Compose (Recommandé avec le backend Symfony)
Dans le dossier `symfony-backend/` :
```bash
# Lancement de la stack (Postgres + Symfony + Nginx + Adminer)
docker-compose up -d postgres

# Injection directe du script SQL dans le conteneur PostgreSQL
docker-compose exec -T postgres psql -U postgres -d minijira < ../database/init_postgres.sql
```

### 2. Via la Ligne de Commande `psql` (PostgreSQL Local ou Distant)
```bash
psql -h localhost -p 5432 -U postgres -d minijira -f database/init_postgres.sql
```

Pour un service cloud (Supabase, Neon, AWS RDS, Cloud SQL) :
```bash
psql "postgres://utilisateur:mot_de_passe@hote.cloud.provider.com:5432/minijira?sslmode=require" -f database/init_postgres.sql
```

### 3. Via Interface Graphique (GUI)
- **Adminer (inclus dans docker-compose)** : Rendez-vous sur `http://localhost:8080`, sélectionnez le moteur *PostgreSQL*, serveur *postgres*, utilisateur *postgres*, mot de passe *secret*, base *minijira*. Cliquez sur **Commande SQL**, collez le contenu de `init_postgres.sql` et validez.
- **pgAdmin 4 / DBeaver** : Ouvrez un *Query Tool* sur votre base de données `minijira`, ouvrez le fichier `init_postgres.sql` et cliquez sur **Exécuter (F5)**.

---

## 👤 Compte Administrateur Initial
- **Nom :** Titan (Administrateur)
- **Email :** `r.titankelyy@gmail.com`
- **Mot de passe initial :** `Password123!`
- **Rôle :** `ADMIN` (Projets) / `ROLE_ADMIN` (Système)
