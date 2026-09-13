# 🛠️ Guide Technique de Maintenance & Architecture — Mini-Jira

Ce document est le guide de référence complet pour le développeur ou l'administrateur système chargé de l'installation, de la maintenance, de la configuration de la base de données PostgreSQL, de la connexion API React ↔ Symfony 7 et de la configuration de l'envoi d'emails (notamment avec **`r.titankelyy@gmail.com`**).

---

## 📑 Sommaire

1. [Structure & Organisation des Dossiers (Frontend / Backend / Database)](#1-structure--organisation-des-dossiers)
2. [Fichier Base de Données PostgreSQL Prêt à l'Emploi (`database/init_postgres.sql`)](#2-fichier-base-de-données-postgresql-prêt-à-lemploi)
3. [Configuration des Fichiers `.env` et `.gitignore`](#3-configuration-des-fichiers-env-et-gitignore)
4. [Connexion API Frontend (React) ↔ Backend (Symfony 7)](#4-connexion-api-frontend-react--backend-symfony-7)
5. [Configuration de l'Envoi d'Emails & Notifications (`r.titankelyy@gmail.com`)](#5-configuration-de-lenvoi-demails--notifications)
6. [Cartographie Exhaustive des Fichiers (« Quel fichier fait quoi et où »)](#6-cartographie-exhaustive-des-fichiers)
7. [Sécurité & Rôles RBAC (Admin vs Membre)](#7-sécurité--rôles-rbac)
8. [FAQ & Recettes de Maintenance (Cookbook)](#8-faq--recettes-de-maintenance)

---

## 1. Structure & Organisation des Dossiers

Le projet Mini-Jira est scrupuleusement structuré en **3 espaces indépendants et découplés** :

```text
mini-jira/
├── database/                      # 🗄️ BASE DE DONNÉES POSTGRESQL 16
│   ├── init_postgres.sql          # ⭐️ SCRIPT SQL COMPLET 100% PRÊT À EXÉCUTER (DDL + FIXTURES)
│   └── README.md                  # Instructions d'exécution psql, Docker, Adminer, Cloud SQL
│
├── symfony-backend/               # 🐘 BACKEND API RESTFUL SYMFONY 7 + PHP 8.2+
│   ├── .env                       # Variables locales (DATABASE_URL, MAILER_DSN...)
│   ├── .env.example               # Modèle documenté pour la production
│   ├── .gitignore                 # Exclusion des vendors, var/, clés privées JWT
│   ├── composer.json              # Dépendances PHP (Doctrine ORM, LexikJWT, Cors, Mailer)
│   ├── Dockerfile                 # Conteneur PHP 8.2-FPM optimisé
│   ├── docker-compose.yml         # Stack orchestrée (PostgreSQL 16 + Symfony + Nginx + Adminer)
│   ├── nginx.conf                 # Configuration reverse proxy FastCGI
│   ├── config/                    # Configuration Symfony (sécurité, routes, bundles)
│   └── src/
│       ├── Entity/                # Entités Doctrine 3FN (User, Project, Task, WorkSession, Notification)
│       ├── Repository/            # Requêtes DQL optimisées
│       ├── Controller/Api/        # Contrôleurs REST JSON (Auth, Project, Task, Session, Notifs)
│       ├── Security/Voter/        # Voter RBAC (ProjectVoter pour ségrégation ADMIN / MEMBRE)
│       └── DataFixtures/          # Jeux de données d'amorce
│
├── src/                           # ⚛️ FRONTEND REACT 18 + TYPESCRIPT + TAILWIND CSS
│   ├── components/                # Composants UI (Kanban, Chronomètre, Dashboards, Modales)
│   ├── pages/                     # Pages complètes (LandingPage, AccountSettingsPage)
│   ├── services/                  # Services métier & Client API (symfonyApiClient.ts, authService...)
│   ├── types.ts                   # Modèles de données TypeScript stricts
│   ├── index.css                  # Styles Tailwind CSS
│   ├── App.tsx                    # Routeur et état applicatif global
│   └── main.tsx                   # Point d'entrée React 18
│
├── server.ts                      # Serveur BFF / Proxy Express & Vite en développement
├── package.json                   # Dépendances npm et scripts du frontend
├── vite.config.ts                 # Configuration du bundler Vite
├── .env                           # Variables d'environnement frontend & proxy local
├── .env.example                   # Modèle documenté
└── .gitignore                     # Exclusion de node_modules/, dist/, .env
```

---

## 2. Fichier Base de Données PostgreSQL Prêt à l'Emploi

Un script complet, vérifié et immédiatement exécutable a été généré dans **`/database/init_postgres.sql`** (et dupliqué dans `/symfony-backend/database/init_postgres.sql`).

### Ce que contient ce fichier :
1. **Nettoyage idempotent :** Suppression ordonnée des tables existantes avec contraintes (`CASCADE`).
2. **7 Tables Relationnelles conformes 3FN & Doctrine ORM :**
   - `membres` : Comptes utilisateurs, email unique, mot de passe haché BCrypt, avatar, rôles JSON.
   - `projets` : Code projet unique, nom, description, dates de début et de fin.
   - `affectations` : Table associative N:M liant Membres et Projets avec attribution du rôle **`ADMIN`** ou **`MEMBRE`**.
   - `taches` : Tickets Kanban avec statuts (`A_FAIRE`, `EN_COURS`, `TERMINE`), priorités (`BASSE`, `MOYENNE`, `HAUTE`) et temps estimé.
   - `assignations_taches` : Attribution N:M des membres aux tâches.
   - `sessions_travail` : Suivi horodaté du chronomètre temps réel (début, fin, durée en minutes).
   - `notifications` : Alertes in-app ciblées avec statut lu/non-lu.
3. **Index de performance :** Index sur les clés étrangères, emails, codes projets et statuts de tâches.
4. **Données de test réalistes & Fixtures :**
   - **Administrateur Principal créé :** **`r.titankelyy@gmail.com`** (Mot de passe initial : `Password123!`, rôle système `ROLE_ADMIN`, rôle projet `ADMIN`).
   - 3 collaborateurs supplémentaires.
   - 3 projets actifs d'ingénierie avec tâches réparties sur les colonnes Kanban.
   - Sessions de chronomètre réelles enregistrées.
   - Notifications déjà envoyées sur le compte de Titan (`r.titankelyy@gmail.com`).

### Comment exécuter le fichier dans PostgreSQL :

#### Méthode 1 : Via la ligne de commande `psql` (Postgres local ou distant)
```bash
# Sur votre machine locale ou serveur :
psql -h localhost -p 5432 -U postgres -d minijira -f database/init_postgres.sql
```

#### Méthode 2 : Via Docker Compose (avec la stack Symfony)
```bash
cd symfony-backend
docker-compose up -d postgres
docker-compose exec -T postgres psql -U postgres -d minijira < ../database/init_postgres.sql
```

#### Méthode 3 : Via Interface Graphique (Adminer, pgAdmin 4, DBeaver, Supabase SQL Editor)
1. Ouvrez votre outil de gestion SQL.
2. Connectez-vous à votre base de données PostgreSQL `minijira`.
3. Ouvrez le fichier `database/init_postgres.sql`, copiez tout son contenu et cliquez sur **Exécuter**.

---

## 3. Configuration des Fichiers `.env` et `.gitignore`

Les fichiers d'environnement ont été créés et pré-configurés avec des variables explicites pour que vous puissiez adapter vos identifiants sans risquer de fuite dans Git.

### A. Côté Racine / Frontend (`/.env`)
Fichier : `/.env` (ignoré par le contrôle de version grâce à `/.gitignore`) :
```env
# URL publique de l'application
APP_URL=http://localhost:3000

# URL de l'API REST Symfony 7
VITE_SYMFONY_API_URL=http://localhost:8000/api

# Identifiants de la base PostgreSQL (À ADAPTER AVEC VOTRE MOT DE PASSE)
DATABASE_URL=postgresql://postgres:VOTRE_MOT_DE_PASSE_ICI@localhost:5432/minijira

PGHOST=localhost
PGPORT=5432
PGDATABASE=minijira
PGUSER=postgres
PGPASSWORD=VOTRE_MOT_DE_PASSE_ICI
PGSSLMODE=disable

# Clé secrète pour signatures internes
JWT_SECRET=generer_une_cle_aleatoire_64_caracteres_hex

# Configuration Email d'envoi
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=r.titankelyy@gmail.com
SMTP_PASS=votre_mot_de_passe_d_application_google
SMTP_FROM="Mini-Jira <r.titankelyy@gmail.com>"
```

### B. Côté Backend Symfony (`symfony-backend/.env`)
Fichier : `/symfony-backend/.env` (ignoré par `symfony-backend/.gitignore`) :
```env
APP_ENV=dev
APP_SECRET=a8f43b6791e847c210d3e5812903ab76

# Chaîne de connexion Doctrine PostgreSQL (À ADAPTER AVEC VOTRE MOT DE PASSE)
DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE_POSTGRES@127.0.0.1:5432/minijira?serverVersion=16&charset=utf8"

# Origines autorisées par NelmioCorsBundle (Frontend React)
CORS_ALLOW_ORIGIN='^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$'

# Authentification JWT Lexik
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=minijira_jwt_passphrase_secure_2025

# Configuration de l'envoi d'emails Symfony Mailer
MAILER_DSN="gmail+smtp://r.titankelyy%40gmail.com:VOTRE_APP_PASSWORD_GOOGLE@default"
MAILER_FROM="Mini-Jira <r.titankelyy@gmail.com>"
```

### C. Vérification des `.gitignore`
- **Frontend (`/.gitignore`)** : Exclut `node_modules/`, `dist/`, `.env`, `.env.local` tout en conservant `.env.example`.
- **Backend (`/symfony-backend/.gitignore`)** : Exclut `/vendor/`, `/var/`, `.env.local`, `.env.*.local`, `/config/jwt/*.pem`.

---

## 4. Connexion API Frontend (React) ↔ Backend (Symfony 7)

### A. Principe Architectural
La communication entre le Frontend React et le Backend Symfony repose sur une **API RESTful stateless** sécurisée par des jetons **JWT (JSON Web Tokens)** :

```text
[ React Frontend ]  ──(1. POST /api/login_check)──>  [ Symfony 7 Security ]
        │                                                   │
        │ <───(2. Retourne le token JWT signé RSA)──────────┘
        │
   (Stockage token dans sessionStorage ou localStorage)
        │
        ├──(3. GET /api/projects avec Header "Authorization: Bearer <token>")──> [ ProjectController ]
        │                                                                               │
        │ <──(4. Réponse JSON sérialisée avec Doctrine ORM & Groups)────────────────────┘
```

### B. Le Client Typé : `src/services/symfonyApiClient.ts`
Ce fichier est le point de contact unique pour toutes les requêtes frontend vers Symfony :
- **Injection automatique du Bearer Token :** Récupère le token stocké et l'ajoute dans l'en-tête HTTP `Authorization: Bearer <token>` à chaque appel.
- **Interception des erreurs 401 :** Déconnecte proprement l'utilisateur si son token a expiré.
- **Typage strict TypeScript :** Toutes les méthodes (`getProjects()`, `createTask()`, `updateTaskStatus()`, `startWorkSession()`) retournent des promesses fortement typées correspondant aux interfaces de `src/types.ts`.

### C. Configuration CORS (Cross-Origin Resource Sharing)
Pour que React (sur le port 3000 ou 5173) puisse interroger Symfony (sur le port 8000), le bundle `nelmio/cors-bundle` est activé dans `symfony-backend/config/packages/nelmio_cors.yaml` :
- Autorise les en-têtes : `Content-Type`, `Authorization`, `Accept`.
- Autorise les méthodes HTTP : `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`.
- Répond aux requêtes pré-vol (`OPTIONS`) avec un code HTTP `200 OK`.

### D. Tableau des Endpoints de l'API Symfony 7
| Méthode | URL Endpoint | Description & Données | Auth Requise |
|---|---|---|---|
| `POST` | `/api/register` | Inscription nouvel utilisateur (`email`, `nom`, `motDePasse`) | Non |
| `POST` | `/api/login_check` | Authentification JWT (`username`, `password`) -> `{ token }` | Non |
| `GET` | `/api/me` | Profil de l'utilisateur connecté et liste de ses projets | Oui (JWT) |
| `PUT` | `/api/profile` | Mise à jour du nom ou de la photo de profil | Oui (JWT) |
| `PUT` | `/api/profile/password` | Modification du mot de passe avec vérification de l'ancien | Oui (JWT) |
| `DELETE` | `/api/account` | Suppression définitive du compte utilisateur | Oui (JWT) |
| `GET` | `/api/projects` | Liste des projets dont l'utilisateur est membre ou admin | Oui (JWT) |
| `POST` | `/api/projects` | Création d'un projet (l'auteur devient automatiquement ADMIN) | Oui (JWT) |
| `POST` | `/api/projects/join` | Rejoindre un projet via son code d'invitation | Oui (JWT) |
| `GET` | `/api/projects/{id}` | Détails complets d'un projet avec membres et tâches | Oui (JWT) |
| `POST` | `/api/projects/{id}/tasks` | Création d'une tâche dans le projet | Oui (JWT) |
| `PATCH` | `/api/tasks/{id}/status` | Déplacement Kanban (statut `A_FAIRE`, `EN_COURS`, `TERMINE`) | Oui (JWT) |
| `POST` | `/api/tasks/{id}/sessions/start` | Démarrage du chronomètre de travail | Oui (JWT) |
| `POST` | `/api/tasks/{id}/sessions/stop` | Arrêt du chronomètre et calcul de la durée | Oui (JWT) |
| `GET` | `/api/notifications` | Récupération des alertes de l'utilisateur connecté | Oui (JWT) |
| `PATCH` | `/api/notifications/{id}/read` | Marquer une notification comme lue | Oui (JWT) |

---

## 5. Configuration de l'Envoi d'Emails & Notifications

### A. Ajouter votre adresse `r.titankelyy@gmail.com`
Votre adresse email **`r.titankelyy@gmail.com`** est déjà inscrite dans le script SQL `database/init_postgres.sql` en tant qu'**Administrateur Système et Lead Projet** avec le mot de passe initial **`Password123!`**.

### B. Configurer l'Envoi Réel d'Emails via Gmail (Mot de Passe d'Application)
Pour que Mini-Jira envoie de vrais emails transactionnels (invitations, alertes de sprint, assignations de tâches) depuis votre compte Gmail :

1. **Activez la validation en 2 étapes** sur votre compte Google si ce n'est pas déjà fait :
   - Allez sur [https://myaccount.google.com/security](https://myaccount.google.com/security).
2. **Générez un "Mot de passe des applications" :**
   - Dans le champ de recherche de votre compte Google, tapez *« Mots de passe des applications »* (App Passwords).
   - Donnez-lui le nom **Mini-Jira**.
   - Google va afficher un mot de passe unique de 16 caractères (ex: `abcd efgh ijkl mnop`).
3. **Renseignez ce mot de passe dans `symfony-backend/.env` :**
   ```env
   # Notez le %40 qui remplace l'@ dans l'identifiant pour l'encodage d'URL
   MAILER_DSN="gmail+smtp://r.titankelyy%40gmail.com:abcdefghijklmnop@default"
   MAILER_FROM="Mini-Jira <r.titankelyy@gmail.com>"
   ```
4. **Renseignez également dans le `.env` de l'application racine :**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=r.titankelyy@gmail.com
   SMTP_PASS=abcdefghijklmnop
   SMTP_FROM="Mini-Jira <r.titankelyy@gmail.com>"
   ```

### C. Déclenchement Automatique des Notifications par Email dans Symfony
Voici le service Symfony `NotificationMailerService.php` qui notifie automatiquement `r.titankelyy@gmail.com` :

```php
// symfony-backend/src/Service/NotificationMailerService.php
namespace App\Service;

use App\Entity\User;
use App\Entity\Task;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;

class NotificationMailerService
{
    public function __construct(
        private MailerInterface $mailer,
        private string $senderEmail = 'r.titankelyy@gmail.com'
    ) {}

    public function notifyTaskAssigned(User $recipient, Task $task): void
    {
        $email = (new Email())
            ->from($this->senderEmail)
            ->to($recipient->getEmail())
            ->subject('🎯 Mini-Jira — Nouvelle tâche assignée : ' . $task->getTitre())
            ->html(sprintf(
                '<h2>Bonjour %s,</h2>
                <p>Vous avez été assigné à la tâche : <strong>%s</strong> sur le projet <em>%s</em>.</p>
                <p>Priorité : %s | Estimation : %d min</p>',
                htmlspecialchars($recipient->getNom()),
                htmlspecialchars($task->getTitre()),
                htmlspecialchars($task->getProject()->getNom()),
                htmlspecialchars($task->getPriorite()),
                $task->getTempsEstime()
            ));

        $this->mailer->send($email);
    }
}
```

---

## 6. Cartographie Exhaustive des Fichiers

### ⚛️ Frontend React & Interface Utilisateur (`/src`)
| Fichier | Rôle & Responsabilité Technique |
|---|---|
| `src/main.tsx` | Point de montage de l'application React 18 dans l'élément `#root`. |
| `src/App.tsx` | Composant racine : initialise l'état, gère le routage par vue (`landing`, `projects`, `kanban`, `settings`), écoute les événements de session et les toasts de notification. |
| `src/types.ts` | Définitions TypeScript strictes des modèles métier (`Membre`, `Projet`, `Tache`, `SessionTravail`, `Notification`). |
| `src/index.css` | Importation des polices Google Fonts et des styles utilitaires Tailwind CSS. |
| `src/pages/LandingPage.tsx` | Page d'accueil marketing avec présentation du produit, tour interactif et appel à l'action. |
| `src/pages/AccountSettingsPage.tsx` | Interface complète de gestion de profil : nom, avatar, modification de mot de passe et suppression du compte. |
| `src/components/Header.tsx` | Barre supérieure : sélection de projet, chronomètre actif, indicateur de rôle RBAC, cloche de notifications et menu utilisateur. |
| `src/components/KanbanBoard.tsx` | Tableau Kanban interactif avec colonnes (À faire, En cours, Terminé), drag & drop et filtres de recherche. |
| `src/components/WorkSessionTimer.tsx` | Chronomètre temps réel avec persistance en secondes et calcul des dépassements horaires. |
| `src/components/ProjectsList.tsx` | Grille des projets avec indicateurs de progression, dates et badges de sprint. |
| `src/components/ProjectSettings.tsx` | Panneau d'administration du projet réservé aux utilisateurs ayant le rôle `ADMIN`. |
| `src/components/MembersAndInvitations.tsx` | Gestion des membres du projet, génération de codes d'invitation avec expiration. |
| `src/components/SprintPlannerModal.tsx` | Assistant intelligent de découpage d'objectifs de sprint. |
| `src/components/DeliverablesModal.tsx` | Modale interactive affichant le schéma relationnel PostgreSQL 3FN, les tables et la documentation d'architecture. |

### 🛠️ Services & Communication Données (`/src/services`)
| Fichier | Rôle & Responsabilité Technique |
|---|---|
| `src/services/symfonyApiClient.ts` | Client HTTP vers l'API Symfony 7 (authentification JWT, gestion automatique des Bearer tokens, requêtes REST). |
| `src/services/authService.ts` | Gestion de la session utilisateur, souscription Pub-Sub aux changements d'état d'authentification. |
| `src/services/projectService.ts` | Logique métier des projets, vérification des rôles `ADMIN` vs `MEMBRE`. |
| `src/services/taskService.ts` | Logique CRUD des tâches et calcul des dépassements d'estimation. |
| `src/services/sessionTimerService.ts` | Moteur de chronomètre en arrière-plan avec pattern Observer. |
| `src/services/mockDatabase.ts` | Singleton de données mémoire locales garantissant un fonctionnement 100% autonome et fluide en mode test/preview. |

### 🐘 Backend Symfony 7 (`/symfony-backend`)
| Fichier | Rôle & Responsabilité Technique |
|---|---|
| `symfony-backend/composer.json` | Manifeste des dépendances PHP : Symfony 7.1, Doctrine ORM 3, LexikJWT, NelmioCors, Symfony Mailer. |
| `symfony-backend/docker-compose.yml` | Stack multi-conteneurs : PostgreSQL 16 (port 5432), Symfony PHP-FPM, Nginx (port 8000), Adminer (port 8080). |
| `symfony-backend/src/Entity/User.php` | Entité `User` mappée sur la table `membres` avec hachage de mot de passe et rôles JSON. |
| `symfony-backend/src/Entity/Project.php` | Entité `Project` mappée sur la table `projets` avec code unique et dates de sprint. |
| `symfony-backend/src/Entity/ProjectAssignment.php` | Entité associative `affectations` liant Membre et Projet avec rôle `ADMIN` / `MEMBRE`. |
| `symfony-backend/src/Entity/Task.php` | Entité `Task` mappée sur `taches` avec colonnes Kanban, priorités et assignations. |
| `symfony-backend/src/Entity/WorkSession.php` | Entité `WorkSession` mappée sur `sessions_travail` pour l'enregistrement du temps. |
| `symfony-backend/src/Entity/Notification.php` | Entité `Notification` mappée sur `notifications`. |
| `symfony-backend/src/Controller/Api/AuthController.php` | Endpoints d'inscription, de profil, de mot de passe et de suppression de compte. |
| `symfony-backend/src/Controller/Api/ProjectController.php` | Endpoints de création, consultation et adhésion à un projet. |
| `symfony-backend/src/Controller/Api/TaskController.php` | Endpoints de création de tâche et de changement de statut Kanban. |
| `symfony-backend/src/Controller/Api/WorkSessionController.php` | Endpoints de démarrage et d'arrêt de session de chronomètre. |
| `symfony-backend/src/Controller/Api/NotificationController.php` | Endpoints de consultation et de lecture des notifications. |
| `symfony-backend/src/Security/Voter/ProjectVoter.php` | Voter Symfony contrôlant l'autorisation fine (`ADMIN_PROJECT`, `VIEW_PROJECT`, `EDIT_TASK`). |

---

## 7. Sécurité & Rôles RBAC

Mini-Jira applique le principe du moindre privilège (PoLP) avec une séparation stricte :

- **Rôle `ADMIN` (Créateur ou Gestionnaire du Projet) :**
  - Modifier le nom, le code et les dates de sprint du projet.
  - Supprimer définitivement le projet.
  - Inviter de nouveaux membres et révoquer des accès.
  - Modifier ou supprimer n'importe quelle tâche du projet.
- **Rôle `MEMBRE` (Développeur ou Collaborateur) :**
  - Consulter le Kanban et les détails des tâches.
  - Créer des tâches et modifier celles qui lui sont assignées.
  - Déplacer ses tâches dans les colonnes Kanban.
  - Démarrer et arrêter son chronomètre de travail personnel.
  - *Interdiction stricte* d'accéder aux réglages sensibles du projet ou de supprimer des membres.

---

## 8. FAQ & Recettes de Maintenance

### Q1 : Comment réinitialiser complètement la base de données PostgreSQL ?
Exécutez simplement le script `init_postgres.sql` :
```bash
psql -h localhost -U postgres -d minijira -f database/init_postgres.sql
```
Toutes les tables seront recréées à neuf avec les fixtures et l'administrateur `r.titankelyy@gmail.com`.

### Q2 : Comment régénérer la paire de clés RSA pour LexikJWT ?
Dans le dossier `symfony-backend/` :
```bash
php bin/console lexik:jwt:generate-keypair --overwrite
```

### Q3 : Comment vérifier que l'envoi d'email fonctionne ?
Dans le dossier `symfony-backend/` :
```bash
php bin/console mailer:test r.titankelyy@gmail.com
```
Si vous recevez l'email de test, votre configuration Gmail/SMTP est 100% opérationnelle.
