# 🚀 Mini-Jira — Gestionnaire de Tâches Collaboratif Agile

> Application web moderne de gestion de projets et de tâches inspirée des méthodologies Agiles / Scrum et de l'ergonomie d'outils modernes (Jira, Linear). Conçue et développée conformément aux spécifications du cahier des charges et à la note d'implémentation.

---

## 📌 Sommaire
1. [Vue d'ensemble & Contexte](#-vue-densemble--contexte)
2. [Fonctionnalités Clés](#-fonctionnalités-clés)
3. [Architecture & Modèle de Données](#-architecture--modèle-de-données)
4. [Technologies & Choix Techniques](#-technologies--choix-techniques)
5. [Installation & Démarrage](#-installation--démarrage)
6. [Guide d'Utilisation](#-guide-dutilisation)
7. [Structure du Projet](#-structure-du-projet)
8. [Documentation Complémentaire](#-documentation-complémentaire)

---

## 🎯 Vue d'ensemble & Contexte

**Mini-Jira** est un outil de productivité logicielle permettant aux équipes de concevoir, planifier, suivre et chronométrer l'avancement de leurs développements au travers de tableaux Kanban interactifs, de tableaux de bord analytiques et d'un assistant intelligent de découpage de sprint propulsé par l'IA.

Le projet répond de manière stricte aux trois phases d'exigences :
- **Version 1 (Fondations métier) :** Authentification, gestion multi-projets avec contrôle d'accès basé sur les rôles (RBAC : ADMIN / MEMBRE), tableau Kanban (À faire, En cours, Terminé) avec Glisser-Déposer (Drag & Drop), filtres de recherche et génération automatique de messages de commits conventionnels (`feat(MJ-101): ...`).
- **Version 2 (Productivité & Analytics) :** Chronométrage des temps de travail en direct avec persistance temporelle, calcul automatique des dépassements (`tempsReel > tempsEstime`), tableau de bord individuel ("Mes Tâches", temps passé, alertes), tableau de bord projet (taux d'avancement %, burndown/statistiques, décompte des membres), et système d'invitation sécurisé avec codes à jeton unique (`MJ-XXXX-YYYY`).
- **Version 3 (Intégration IA & Documentation) :** Assistant de découpage de sprint connecté au modèle Gemini (`gemini-3.8-flash`) avec fallback heuristique défensif, centre de notifications en direct avec badges, et livrables techniques intégrés (Script SQL DDL PostgreSQL et Diagramme de classes UML Mermaid).

---

## ✨ Fonctionnalités Clés

### 🔐 Authentification & Gestion des Profils
- Connexion immédiate avec comptes de démonstration pré-configurés (Alice Martin, Thomas Dubois, etc.) ou inscription de nouveaux utilisateurs.
- Contrôle de la complexité des mots de passe et validation des emails.
- Persistance de la session active dans le stockage local du navigateur.

### 📁 Gestion Multi-Projets & Contrôle d'Accès (RBAC)
- Création de projets avec attribution automatique du rôle **ADMIN** au créateur.
- Rejoindre un projet via un code d'invitation généré par un administrateur.
- Règle de sécurité stricte : **interdiction de supprimer ou rétrograder le dernier administrateur** d'un projet.
- Modification des métadonnées (nom, description) et suppression du projet (en cascade) réservées aux administrateurs.

### 📋 Tableau Kanban Interactif & Drag & Drop
- 3 colonnes de workflow Agile : **À faire (`A_FAIRE`)**, **En cours (`EN_COURS`)**, **Terminé (`TERMINE`)**.
- Glisser-déposer fluide natif HTML5 avec zones de drop en surbrillance.
- Filtres instantanés combinables : par statut, niveau de priorité (Haute, Moyenne, Basse), assignation personnelle ("Mes tâches uniquement"), et recherche textuelle en temps réel.
- Badges visuels de priorité, dates d'échéance et alertes de retard/dépassement.

### ⏱️ Chronométrage en Temps Réel (Sessions de Travail)
- Démarrage et arrêt d'un chronomètre persistant rattaché à une tâche.
- Le chronomètre continue de tourner même si la page est rafraîchie grâce au calcul dynamique du delta d'horodatage (`Date.now() - startTimestamp`).
- Historisation complète de chaque session de travail (date début, date fin, durée en minutes).
- Incrémentation automatique du temps réel cumulé sur la tâche et déclenchement d'une alerte en cas de dépassement du temps estimé initial.

### 📊 Tableaux de Bord Analytiques
- **Dashboard Projet :** Métriques d'avancement global en pourcentage, répartition des tâches par statut, comparaison visuelle temps estimé vs temps réel, liste des tâches en retard critique, et listing des membres affectés.
- **Dashboard Individuel :** Vue d'ensemble du collaborateur avec ses tâches en cours, ses priorités du jour, son volume d'heures travaillées et ses statistiques de réalisation.

### 🤖 Assistant Sprint Planner IA (Gemini)
- Découpage automatisé d'un objectif de sprint en 4 à 6 tâches techniques actionnables.
- Intégration via backend Express sécurisé appelant le modèle `gemini-3.8-flash`.
- Formatage JSON strict avec titre, description technique, priorité et temps estimé.
- Mécanisme de fallback heuristique sans interruption si aucune clé d'API n'est configurée.

### 🔔 Centre de Notifications en Direct
- Notification lors de l'assignation d'une tâche, du changement de statut, de la réception d'une invitation, ou d'un dépassement de temps de travail.
- Badges numériques non-lus, marquage individuel ou collectif comme lu.

### 🛠️ Outil Développeur : Commits Conventionnels
- Bouton de copie en un clic d'un message de commit Git normalisé au format Conventional Commits :  
  `feat(MJ-101): implementer-le-drag-drop`  
  `fix(MJ-102): corriger-la-validation-des-dates`

---

## 🏛️ Architecture & Modèle de Données

Le projet suit une **architecture en couches découplée (Clean Architecture)** :

```
┌─────────────────────────────────────────────────────────────┐
│                       INTERFACE UTILISATEUR                 │
│         Composants React (Tailwind CSS, Lucide, Motion)     │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    COUCHE SERVICES (MÉTIER)                 │
│   authService   │   projectService   │   taskService        │
│          sessionTimerService         │   sprintAIService    │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                  PERSISTANCE & LOGIQUE DAO                  │
│       mockDatabase.ts (LocalStorage, Intégrité, Événements) │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│               SERVEUR PROXY BACKEND (Express / Node)        │
│          Endpoints REST (/api/sprint-plan) + Gemini SDK     │
└─────────────────────────────────────────────────────────────┘
```

### Modèle Relationnel (PostgreSQL)
Le schéma est composé de 7 tables normalisées avec contraintes de clés étrangères et index d'optimisation :
1. `membre` : Comptes utilisateurs, hashes de mots de passe, état d'activité.
2. `projet` : Métadonnées du projet et référence au créateur.
3. `affectation` : Table de liaison N:N associant un membre à un projet avec son rôle (`ADMIN` ou `MEMBRE`).
4. `tache` : Tâches avec priorité, statut, date d'échéance, temps estimé et temps réel cumulé.
5. `invitation` : Tokens sécurisés pour rejoindre un projet avec date d'expiration.
6. `session_travail` : Logs horodatés des chronométrages de travail effectifs.
7. `notification` : Événements métier ciblés par utilisateur.

*(Le script SQL complet exécutable et le diagramme UML Mermaid sont consultables dans l'onglet **Livrables PFE** de l'application ainsi que dans `src/data/deliverables.ts`).*

---

## 💻 Technologies & Choix Techniques

| Domaine | Technologie | Rôle & Justification |
| :--- | :--- | :--- |
| **Framework UI** | **React 19** | Rendu déclaratif, virtual DOM haute performance, hooks personnalisés. |
| **Langage** | **TypeScript 5.8** | Typage statique strict garantissant la cohérence des modèles de données. |
| **Build & Bundler** | **Vite 6** | Démarrage instantané du serveur de développement et compilation optimisée. |
| **Styling** | **Tailwind CSS v4** | Utilisation de classes utilitaires modernes pour un design soigné sans surcharge CSS. |
| **Animations** | **Motion (`motion/react`)** | Micro-interactions fluides pour les modales, transitions de cartes et tiroirs. |
| **Icônes** | **Lucide React** | Bibliothèque d'icônes vectorielles cohérente, légère et accessible. |
| **Backend API** | **Express 4 & Node.js** | Passerelle d'API pour masquer les clés d'API tierces et servir le client. |
| **Intelligence Artificielle**| **@google/genai & Gemini** | Découpage de backlog Agile avec génération de JSON typé strict. |

*Une analyse approfondie de chaque technologie et des patterns d'architecture est disponible dans le fichier [`DOCUMENTATION_TECHNIQUE.md`](./DOCUMENTATION_TECHNIQUE.md).*

---

## 🚀 Installation & Démarrage

### Prérequis
- **Node.js** (version 18 ou supérieure recommandée)
- **npm** (ou yarn / pnpm)

### Étapes d'installation

1. **Cloner ou naviguer dans le répertoire du projet :**
   ```bash
   cd mini-jira
   ```

2. **Installation du Frontend (React) :**
   ```bash
   cd Frontend
   npm install
   ```

3. **Configurer les variables d'environnement (optionnel) :**
   Si vous souhaitez utiliser l'IA Gemini avec votre propre clé, créez un fichier `.env` dans le dossier Frontend :
   ```env
   GEMINI_API_KEY="votre_cle_api_gemini_ici"
   ```
   *(Remarque : Si aucune clé n'est fournie, l'application bascule automatiquement sur un moteur heuristique intelligent afin de garantir un fonctionnement à 100 % hors-ligne).*

4. **Lancer le serveur de développement Frontend :**
   ```bash
   cd Frontend
   npm run dev
   ```
   L'application est immédiatement accessible à l'adresse : **`http://localhost:3000`**.

5. **Compiler pour la production :**
   ```bash
   cd Frontend
   npm run build
   ```

---

## 📖 Guide d'Utilisation

### 1. Démarrage rapide (Mode Démo)
À l'ouverture de l'application, vous êtes connecté par défaut sous l'identité d'**Alice Martin** (Administratrice sur le projet démo *Refonte Plateforme SaaS*).
- Vous pouvez changer d'utilisateur à tout moment en cliquant sur le sélecteur d'utilisateur en haut à droite.
- Vous pouvez tester la connexion / déconnexion / inscription via le bouton de profil.

### 2. Gestion des Tâches & Kanban
- **Créer une tâche :** Cliquez sur le bouton bleu `+ Nouvelle tâche` depuis l'en-tête ou dans la colonne du Kanban. Renseignez le titre, la description, la priorité, l'échéance et le temps estimé.
- **Glisser-déposer :** Saisissez une carte de tâche avec la souris et déposez-la dans une autre colonne (`À faire`, `En cours`, `Terminé`) pour actualiser son statut.
- **Détails & Chronomètre :** Cliquez sur n'importe quelle carte pour ouvrir la modale détaillée. Vous y trouverez l'historique des sessions, le bouton `Démarrer le chronomètre`, le bouton de copie du commit conventionnel et les options de suppression.

### 3. Chronomètre persistant
- Cliquez sur `Démarrer le chronomètre` sur une tâche. Une bannière animée apparaît en haut de l'écran avec un compteur à la seconde près.
- Changez d'onglet, filtrez ou rafraîchissez votre page : le temps continue de s'écouler sans perte de synchronisation.
- En cliquant sur `Terminer la session`, la durée est calculée en minutes et ajoutée au temps réel de la tâche.

### 4. Inviter des collaborateurs
- Ouvrez l'onglet `Membres & Invitations` du projet.
- Générez un code d'invitation (ex: `MJ-7K9A-3F12`).
- Copiez ce code et utilisez le bouton `Rejoindre un projet` sur un autre compte pour intégrer automatiquement l'équipe en tant que `MEMBRE`.

### 5. Sprint Planner IA
- Cliquez sur l'onglet `Sprint Planner IA`.
- Saisissez l'objectif de votre prochain sprint (ex: *"Intégrer le système de paiement Stripe et gérer les factures PDF"*).
- Cliquez sur `Générer le découpage du Sprint`. Les tâches générées peuvent être ajoutées au Kanban en un seul clic !

---

## 🐘 Backend API RESTful Symfony 7 & PostgreSQL

En plus de l'application web React interactive, Mini-Jira inclut un backend d'entreprise complet sous **Symfony 7** (situé dans `/Backend/symfony-backend`) avec **Doctrine ORM 3**, **LexikJWTAuthenticationBundle** et **PostgreSQL 16**.

### 🚀 Installation (sans Docker)

#### Prérequis
- PHP 8.2 ou supérieur
- Composer
- PostgreSQL 16
- Extensions PHP : pdo_pgsql, intl, json, ctype, openssl

#### Étapes d'installation

1. **Installer les dépendances PHP :**
   ```bash
   cd Backend/symfony-backend
   composer install
   ```

2. **Configurer PostgreSQL :**
   Créez une base de données PostgreSQL :
   ```sql
   CREATE DATABASE minijira;
   CREATE USER minijira_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE minijira TO minijira_user;
   ```

3. **Configurer les variables d'environnement :**
   Modifiez le fichier `.env` dans `Backend/symfony-backend/` :
   ```env
   DATABASE_URL="postgresql://minijira_user:your_password@127.0.0.1:5432/minijira?serverVersion=16&charset=utf8"
   APP_ENV=dev
   APP_SECRET=your_secret_key_here
   ```

4. **Appliquer les migrations :**
   ```bash
   php bin/console doctrine:migrations:migrate --no-interaction
   ```

5. **Charger les fixtures (données de test) :**
   ```bash
   php bin/console doctrine:fixtures:load --no-interaction
   ```

6. **Générer les clés JWT :**
   ```bash
   php bin/console lexik:jwt:generate-keypair
   ```

7. **Démarrer le serveur :**
   ```bash
   php bin/console server:run
   ```

#### Points d'accès
- **API Symfony** : `http://localhost:8000`
- **PostgreSQL** : `localhost:5432`

### 🐳 Alternative avec Docker (optionnel)

Si vous préférez utiliser Docker, les instructions sont disponibles dans le fichier `docker-compose.yml` du dossier Backend.

### 🧩 Spécifications Techniques Symfony 7
- **Framework & Version :** Symfony 7.1 avec PHP 8.2+.
- **Sécurité & Authentification :** JWT Bearer tokens stateless (`LexikJWTAuthenticationBundle`) avec clés RSA 4096 bits.
- **Contrôle d'Accès RBAC :** Symfony Security Voters (`ProjectVoter`) pour valider les droits `ADMIN` vs `MEMBRE`.
- **CORS :** `NelmioCorsBundle` préconfiguré pour autoriser le client React sur n'importe quel port.
- **ORM & BDD :** Doctrine ORM 3 avec PostgreSQL 16 (Entités `User`, `Project`, `ProjectAssignment`, `Task`, `WorkSession`, `Notification`).

---

## 📂 Structure du Projet

```text
mini-jira/
├── README.md                      # Documentation générale du projet
├── SYMFONY_REACT_GUIDE.md         # Guide d'architecture & déploiement React + Symfony
├── DOCUMENTATION_TECHNIQUE.md     # Analyse détaillée des technologies & patterns
├── metadata.json                  # Métadonnées plateforme AI Studio
│
├── Frontend/                      # ⚛️ FRONTEND REACT + VITE
│   ├── package.json               # Dépendances React et scripts
│   ├── tsconfig.json              # Configuration TypeScript
│   ├── vite.config.ts             # Configuration Vite
│   ├── server.ts                  # Serveur de développement Express
│   ├── index.html                 # Point d'entrée HTML
│   ├── src/
│   │   ├── main.tsx               # Point d'entrée React 18
│   │   ├── App.tsx                # Composant racine, routage et gestion d'état globale
│   │   ├── index.css              # Feuille de styles globale (Tailwind CSS)
│   │   ├── types.ts               # Définitions TypeScript exhaustives
│   │   ├── components/            # Composants d'interface (Kanban, Chrono, Dashboards, Modales)
│   │   ├── pages/                 # Pages (LandingPage, AccountSettingsPage)
│   │   └── services/              # Logique métier et client API Symfony (symfonyApiClient.ts)
│   └── node_modules/              # Dépendances Node.js
│
└── Backend/                       # 🐘 BACKEND SYMFONY 7 + POSTGRESQL
    ├── symfony-backend/           # Application Symfony
    │   ├── composer.json          # Dépendances PHP (Symfony 7, Doctrine ORM, LexikJWT, Cors)
    │   ├── Dockerfile             # Conteneur PHP 8.2-FPM avec extensions pdo_pgsql & intl
    │   ├── docker-compose.yml     # Stack PostgreSQL 16 + Symfony + Nginx + Adminer
    │   ├── nginx.conf             # Configuration serveur Nginx FastCGI
    │   ├── config/                # Configuration Symfony (packages, doctrine, security, routes)
    │   └── src/
    │       ├── Entity/            # Entités Doctrine (User, Project, Task, WorkSession, Notification)
    │       ├── Repository/        # Requêtes DQL optimisées
    │       ├── Controller/Api/    # Contrôleurs REST JSON (Auth, Project, Task, Session, Notifs, Sprint)
    │       ├── Security/Voter/    # ProjectVoter pour le contrôle RBAC
    │       └── DataFixtures/      # Données de test (AppFixtures)
    ├── database/                  # Scripts et configurations de base de données
    └── server/                    # Scripts de serveur et utilitaires
```

---

## 📚 Documentation Complémentaire

Pour comprendre les choix d'ingénierie logicielle, les détails d'implémentation des algorithmes et la justification technologique complète, veuillez consulter le fichier **[`DOCUMENTATION_TECHNIQUE.md`](./DOCUMENTATION_TECHNIQUE.md)**.
