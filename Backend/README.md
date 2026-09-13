# Mini-Jira Backend

Backend API RESTful Symfony 7 avec PostgreSQL 16 pour Mini-Jira.

## 🐘 Technologies

- Symfony 7.1
- PHP 8.2+
- Doctrine ORM 3
- PostgreSQL 16
- LexikJWTAuthenticationBundle
- NelmioCorsBundle

## 🚀 Installation (sans Docker)

### Prérequis

- PHP 8.2 ou supérieur
- Composer
- PostgreSQL 16
- Extensions PHP : pdo_pgsql, intl, json, ctype, openssl

### Étapes d'installation

1. **Installer les dépendances PHP :**
   ```bash
   cd symfony-backend
   composer install
   ```

2. **Configurer la base de données PostgreSQL :**
   
   Créez une base de données PostgreSQL :
   ```sql
   CREATE DATABASE minijira;
   CREATE USER minijira_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE minijira TO minijira_user;
   ```

3. **Configurer les variables d'environnement :**
   
   Créez ou modifiez le fichier `.env` dans `symfony-backend/` :
   ```env
   DATABASE_URL="postgresql://minijira_user:your_password@127.0.0.1:5432/minijira?serverVersion=16&charset=utf8"
   APP_ENV=dev
   APP_SECRET=your_secret_key_here
   ```

4. **Appliquer les migrations de base de données :**
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

7. **Démarrer le serveur Symfony :**
   ```bash
   php bin/console server:run
   ```

## 🔗 Points d'accès

- **API Symfony** : `http://localhost:8000`
- **PostgreSQL** : `localhost:5432`

## 🐳 Alternative avec Docker (optionnel)

Si vous préférez utiliser Docker, les instructions sont disponibles dans le fichier `docker-compose.yml`.

## 📁 Structure

```
symfony-backend/
├── composer.json              # Dépendances PHP
├── Dockerfile                 # Conteneur PHP 8.2-FPM
├── docker-compose.yml         # Stack complète
├── nginx.conf                 # Configuration Nginx
├── config/                    # Configuration Symfony
└── src/
    ├── Entity/                # Entités Doctrine
    ├── Repository/            # Requêtes DQL
    ├── Controller/Api/        # Contrôleurs REST
    ├── Security/Voter/        # Contrôle RBAC
    └── DataFixtures/          # Données de test
```

## 🔐 Sécurité

- Authentification JWT Bearer tokens stateless
- Clés RSA 4096 bits
- Contrôle d'accès RBAC via Security Voters
- CORS préconfiguré pour le frontend React

## 📊 API Endpoints

Les contrôleurs API fournissent les endpoints REST pour :
- Authentification (`/api/auth`)
- Projets (`/api/projects`)
- Tâches (`/api/tasks`)
- Sessions de travail (`/api/work-sessions`)
- Notifications (`/api/notifications`)
- Sprint Planner IA (`/api/sprint-plan`)