# Guide Complet d'Architecture & Déploiement : React 18 + Symfony 7

Ce document décrit l'architecture full-stack découplée de **Mini-Jira**, associant un frontend réactif moderne sous **React 18 + Tailwind CSS** à une API RESTful d'entreprise sous **Symfony 7 + Doctrine ORM + PostgreSQL 16**.

---

## 1. Vue d'Ensemble & Architecture Découplée

```
┌─────────────────────────────────────────────────────────────┐
│                 FRONTEND (Client-Side)                      │
│   React 18 + TypeScript + Vite + Tailwind CSS + Lucide      │
│                                                             │
│   - Kanban Board interactif (Drag & Drop)                  │
│   - Suivi du temps en temps réel (Chronomètre)              │
│   - Décomposition intelligente de sprint (AI Planner)       │
│   - Stockage du JWT dans le client API typé                │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               │ HTTPS / JSON REST API
                               │ Authorization: Bearer <JWT>
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 BACKEND API (Server-Side)                   │
│   Symfony 7 + PHP 8.2 + Doctrine ORM 3 + PostgreSQL 16       │
│                                                             │
│   - LexikJWTAuthenticationBundle (Stateless JWT)            │
│   - NelmioCorsBundle (Gestion des en-têtes CORS)            │
│   - Symfony Security Voters (Contrôle d'accès RBAC)         │
│   - Doctrine Migrations & Fixtures                          │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               │ PDO PostgreSQL
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 BASE DE DONNÉES RELATIONNELLE               │
│   PostgreSQL 16 (Schéma 3FN avec intégrité référentielle)  │
│   - Tables : membres, projets, affectations, taches,        │
│              sessions_travail, notifications                │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Structure du Backend Symfony (`/symfony-backend`)

```
symfony-backend/
├── composer.json               # Dépendances PHP (Symfony 7, Doctrine, JWT, CORS)
├── Dockerfile                  # Image conteneurisée PHP 8.2-FPM avec extensions
├── docker-compose.yml          # Stack complète (PostgreSQL 16, Symfony, Nginx, Adminer)
├── nginx.conf                  # Configuration Nginx pour le routage FastCGI
├── .env.example                # Variables d'environnement type
├── config/
│   ├── packages/
│   │   ├── doctrine.yaml       # Configuration DBAL & ORM PostgreSQL
│   │   ├── security.yaml       # Firewalls JWT et hachage des mots de passe
│   │   ├── lexik_jwt_authentication.yaml
│   │   └── nelmio_cors.yaml    # Autorisation des requêtes cross-origin du client React
│   ├── routes.yaml
│   └── services.yaml
└── src/
    ├── Entity/                 # Entités Doctrine avec attributs PHP 8
    │   ├── User.php            # Membre avec interface PasswordAuthenticatedUserInterface
    │   ├── Project.php         # Projet avec code unique (ex: JIRA-V3)
    │   ├── ProjectAssignment.php # Rôle (ADMIN vs MEMBRE) par projet
    │   ├── Task.php            # Tâche avec priorité, statut et temps estimé
    │   ├── WorkSession.php     # Session horodatée de chronométrage
    │   └── Notification.php    # Notifications in-app
    ├── Repository/             # Requêtes DQL optimisées pour chaque entité
    ├── Controller/Api/         # Contrôleurs REST retournant du JSON
    │   ├── AuthController.php
    │   ├── ProjectController.php
    │   ├── TaskController.php
    │   ├── WorkSessionController.php
    │   ├── NotificationController.php
    │   └── SprintAIController.php
    ├── Security/Voter/         # ProjectVoter pour la vérification granulaire des droits
    └── DataFixtures/
        └── AppFixtures.php     # Données de démonstration prêtes à l'emploi
```

---

## 3. Contrat d'API RESTful (Endpoints)

Toutes les requêtes de l'API utilisent le format `application/json`. Les routes protégées nécessitent l'en-tête `Authorization: Bearer <token>`.

| Méthode | Route | Rôle / Accès | Description |
|---|---|---|---|
| `POST` | `/api/register` | Public | Inscription d'un nouvel utilisateur |
| `POST` | `/api/login_check` | Public | Authentification et émission du token JWT |
| `GET` | `/api/me` | Authentifié | Profil de l'utilisateur connecté |
| `PUT` | `/api/profile` | Authentifié | Mise à jour du nom et de l'avatar |
| `POST` | `/api/change-password` | Authentifié | Changement sécurisé de mot de passe |
| `DELETE` | `/api/account` | Authentifié | Suppression définitive du compte |
| `GET` | `/api/projects` | Authentifié | Projets du membre connecté |
| `POST` | `/api/projects` | Authentifié | Création d'un projet (le créateur devient ADMIN) |
| `POST` | `/api/projects/join` | Authentifié | Rejoindre un projet via son code unique |
| `GET` | `/api/projects/{id}` | Membre projet | Détails et liste des membres du projet |
| `GET` | `/api/projects/{id}/tasks` | Membre projet | Tâches associées à un projet |
| `POST` | `/api/projects/{id}/tasks` | Membre projet | Création d'une nouvelle tâche |
| `PATCH` | `/api/tasks/{id}/status` | Membre projet | Déplacement Kanban (`A_FAIRE`, `EN_COURS`, `TERMINE`) |
| `DELETE` | `/api/tasks/{id}` | Admin / Auteur | Suppression d'une tâche |
| `POST` | `/api/sessions/start/{taskId}` | Authentifié | Démarrage du chronomètre de travail |
| `POST` | `/api/sessions/stop` | Authentifié | Arrêt du chronomètre et enregistrement du temps |
| `GET` | `/api/sessions/active` | Authentifié | Session de travail actuellement active |
| `GET` | `/api/notifications` | Authentifié | Notifications in-app de l'utilisateur |
| `PATCH` | `/api/notifications/{id}/read` | Destinataire | Marquer une notification comme lue |
| `POST` | `/api/sprint/decompose` | Authentifié | Découpage IA d'un objectif de sprint |

---

## 4. Démarrage Rapide

### Option A : Avec Docker Compose (Recommandé en production)

Lancez l'ensemble de la pile backend en une seule commande :

```bash
cd symfony-backend
docker-compose up -d --build
```

Services démarrés :
- **API Symfony Nginx** : http://localhost:8000
- **Base de données PostgreSQL 16** : `localhost:5432`
- **Adminer (gestionnaire SQL Web)** : http://localhost:8080

Pour appliquer les migrations et charger les données initiales :
```bash
docker-compose exec symfony_app php bin/console doctrine:migrations:migrate --no-interaction
docker-compose exec symfony_app php bin/console doctrine:fixtures:load --no-interaction
```

### Option B : En Local avec le CLI Symfony

1. **Prérequis** : PHP 8.2+, Composer, PostgreSQL 16.
2. **Installation des dépendances** :
   ```bash
   cd symfony-backend
   composer install
   ```
3. **Génération des clés RSA pour JWT** :
   ```bash
   php bin/console lexik:jwt:generate-keypair
   ```
4. **Création de la base et migrations** :
   ```bash
   php bin/console doctrine:database:create
   php bin/console doctrine:migrations:migrate
   php bin/console doctrine:fixtures:load
   ```
5. **Démarrage du serveur de développement** :
   ```bash
   symfony server:start --port=8000
   ```

---

## 5. Connexion avec le Frontend React

Dans le frontend React, le service typé `src/services/symfonyApiClient.ts` est préconfiguré pour consommer l'API Symfony :

```typescript
import { symfonyApi } from './services/symfonyApiClient';

// Connexion
const { token, user } = await symfonyApi.login('sarah@minijira.io', 'password123');

// Récupération des projets
const projects = await symfonyApi.getProjects();

// Mise à jour de statut Kanban (drag & drop)
await symfonyApi.updateTaskStatus(taskId, 'EN_COURS');

// Chronométrage en direct
await symfonyApi.startSession(taskId);
```

Configurez l'URL cible dans votre `.env` frontend si le backend tourne sur un autre port :
```env
VITE_SYMFONY_API_URL=http://localhost:8000/api
```
