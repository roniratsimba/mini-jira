# 📘 Documentation Technique & Analyse des Technologies — Mini-Jira

> Ce document fournit une analyse exhaustive de l'architecture logicielle, des choix technologiques, des modèles de conception (Design Patterns) et des règles métier appliquées au sein du projet **Mini-Jira**.

---

## 📑 Sommaire
1. [Introduction & Principes Architecturaux](#1-introduction--principes-architecturaux)
2. [Analyse Détaillée de la Stack Technologique](#2-analyse-détaillée-de-la-stack-technologique)
   - [React 19 & Écosystème Frontend](#21-react-19--écosystème-frontend)
   - [TypeScript 5.8](#22-typescript-58)
   - [Tailwind CSS v4](#23-tailwind-css-v4)
   - [Vite 6 & Esbuild](#24-vite-6--esbuild)
   - [Express 4 & Node.js (Architecture Hybride)](#25-express-4--nodejs-architecture-hybride)
   - [Motion & Lucide React](#26-motion--lucide-react)
3. [Patterns de Conception (Design Patterns)](#3-patterns-de-conception-design-patterns)
4. [Analyse du Schéma de Données & Intégrité](#4-analyse-du-schéma-de-données--intégrité)
5. [Algorithmes & Fonctionnalités Métier Spécifiques](#5-algorithmes--fonctionnalités-métier-spécifiques)
6. [Sécurité, Résilience & Performance](#6-sécurité-résilience--performance)

---

## 1. Introduction & Principes Architecturaux

Le projet **Mini-Jira** a été conçu pour allier **simplicité d'exécution**, **rigueur conceptuelle** et **expérience utilisateur de haut niveau (UX/UI)**.

### Principes directeurs :
1. **Clean Architecture & Séparation des Responsabilités (SoC) :**  
   Chaque couche logicielle a un rôle strict :
   - Les composants d'interface (`src/components/`) ne traitent aucune logique de stockage bas niveau.
   - Les services (`src/services/`) encapsulent les calculs métier, les vérifications d'autorisation et les déclenchements d'événements.
   - La couche de données gérée par Symfony/Doctrine ORM gère l'intégrité référentielle, le stockage et la conformité au modèle relationnel.
2. **Architecture Découplée Client/Serveur :**  
   L'application suit une architecture complète React + Symfony 7 avec communication API REST, garantissant une séparation claire entre frontend et backend.
3. **Résilience et Mode Déconnecté :**  
   L'application est conçue pour être 100 % opérationnelle grâce à son backend Symfony complet et ses algorithmes heuristiques pour la planification de sprint.

---

## 2. Analyse Détaillée de la Stack Technologique

### 2.1. React 19 & Écosystème Frontend
- **Pourquoi React 19 ?**  
  React est la bibliothèque de référence pour la création d'interfaces utilisateur déclaratives et dynamiques. React 19 apporte une gestion optimisée du rendu, des performances accrues dans la manipulation du DOM virtuel et une réactivité native idéale pour les tableaux Kanban interactifs.
- **Rôle dans Mini-Jira :**
  - Rendu modulaire des colonnes du Kanban et synchronisation d'état en temps réel.
  - Utilisation poussée des hooks personnalisés (`useState`, `useEffect`, `useCallback`, `useMemo`) pour isoler l'état local du chronomètre, des filtres et des modales.
  - Élimination des re-rendus inutiles lors des saisies dans les champs de recherche.

### 2.2. TypeScript 5.8
- **Pourquoi TypeScript ?**  
  TypeScript ajoute un typage statique strict à JavaScript. Dans une application modélisant des entités interconnectées (Membres, Projets, Affectations avec rôles, Tâches avec statuts, Sessions de travail), TypeScript prévient les erreurs à l'exécution et sert de documentation vivante du code.
- **Rôle dans Mini-Jira :**
  - Définition d'un contrat de types strict dans `src/types.ts` calqué directement sur le diagramme de classes UML.
  - Sécurisation des transitions d'état (`Statut = 'A_FAIRE' | 'EN_COURS' | 'TERMINE'`) et des permissions (`RoleEnum = 'ADMIN' | 'MEMBRE'`).
  - Autocomplétion et refactoring sécurisé sur l'ensemble de la base de code.

### 2.3. Tailwind CSS v4
- **Pourquoi Tailwind CSS v4 ?**  
  Tailwind CSS v4 est le moteur de styles utilitaires le plus performant du marché. Grâce à son nouveau moteur ultra-rapide basé sur Rust/LightningCSS, la compilation des styles est instantanée.
- **Rôle dans Mini-Jira :**
  - Mise en place d'une identité visuelle professionnelle ("Linear/Jira modern theme") caractérisée par des contrastes soignés, une typographie lisible, et des palettes de couleurs sémantiques (bleu pour `En cours`, vert pour `Terminé`, gris/ardoise pour `À faire`, rouge pour les alertes de retard ou de dépassement).
  - Évitement strict des "AI slop clichés" (pas de dégradés violet/bleu agressifs, pas d'effets de verre flou illisibles).
  - Responsive design complet du mobile (touch targets >= 44px) au desktop haute résolution.

### 2.4. Vite 6 & Esbuild
- **Pourquoi Vite 6 ?**  
  Vite remplace les bundlers traditionnels lents (Webpack) en tirant parti des modules ES natifs du navigateur en développement et d'Esbuild / Rollup pour la production. Le démarrage du serveur s'effectue en quelques millisecondes.
- **Rôle dans Mini-Jira :**
  - Serveur de développement avec Hot Module Replacement (HMR).
  - Intégration transparente comme middleware au sein du serveur Express via `vite.middlewares`.
  - Minification et optimisation automatique des assets lors du build de production (`npm run build`).

### 2.5. Express 4 & Node.js (Architecture Hybride)
- **Pourquoi Express & Node.js ?**  
  Bien que l'application puisse tourner en SPA autonome, l'ajout d'un serveur Express permet de transformer Mini-Jira en une application full-stack moderne.
- **Rôle dans Mini-Jira :**
  - **Endpoint de planification de sprint :** Le client React contacte `POST /api/sprint-plan` pour générer des tâches via un algorithme heuristique intelligent.
  - **Serveur de fichiers statiques en production :** En mode production, Express sert les fichiers compilés du dossier `dist/` et gère le fallback SPA sur `index.html`.

### 2.6. Motion & Lucide React
- **Motion (`motion/react`) :**  
  Permet d'ajouter des micro-animations naturelles (glissement des cartes du Kanban, apparition douce des modales, indicateur pulsant du chronomètre).
- **Lucide React :**  
  Fournit une collection unifiée de plus de 50 icônes vectorielles cohérentes (horloge, alerte, dossier, utilisateurs, étiquettes, flèches) sans impacter le poids du bundle grâce au tree-shaking.

---

## 3. Patterns de Conception (Design Patterns)

### A. Pattern Service / Repository (DAO)
Le fichier `mockDatabase.ts` agit comme une unité de persistance centralisée (simulant un ORM/DAO type Prisma ou TypeORM).  
Les services spécialisés (`taskService`, `projectService`, `authService`, `sessionTimerService`) consomment cette couche et exposent des méthodes orientées cas d'usage (`isOverdue()`, `generateConventionalCommit()`, `getProjectDetailedStats()`).

### B. Pattern Observer (Écouteurs d'Événements)
Pour éviter de déclencher des re-rendus continus dans l'ensemble de l'arbre de composants, le `sessionTimerService` et l'`authService` implémentent le pattern Observateur :
- `sessionTimerService.subscribe((session, elapsedSeconds) => { ... })`
- Les composants intéressés (ex : la bannière de Header ou le bouton unitaire de la modale) s'abonnent à la seconde près sans impacter le reste du tableau Kanban.

### C. Pattern Finite State Machine (Machine à États)
Le cycle de vie d'une tâche suit un graphe de transition strict :
$$\text{À FAIRE} \xrightarrow{\quad\text{début des travaux}\quad} \text{EN COURS} \xrightarrow{\quad\text{validation}\quad} \text{TERMINÉ}$$
Le passage à un statut supérieur déclenche automatiquement des effets de bord normalisés :
- Notification au membre assigné.
- Mise à jour des compteurs du tableau de bord.
- Vérification des critères d'échéance.

---

## 4. Analyse du Schéma de Données & Intégrité

Le schéma relationnel modélisé dans l'application respecte les formes normales (3FN) :

```sql
-- Extrait de l'intégrité référentielle
ALTER TABLE affectation 
  ADD CONSTRAINT fk_affectation_membre FOREIGN KEY (membre_id) REFERENCES membre(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_affectation_projet FOREIGN KEY (projet_id) REFERENCES projet(id) ON DELETE CASCADE,
  ADD CONSTRAINT uk_membre_projet UNIQUE(membre_id, projet_id);

ALTER TABLE tache 
  ADD CONSTRAINT fk_tache_projet FOREIGN KEY (projet_id) REFERENCES projet(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_tache_assigne FOREIGN KEY (membre_assigne_id) REFERENCES membre(id) ON DELETE SET NULL;
```

### Règles d'intégrité implémentées :
1. **Suppression en cascade (`ON DELETE CASCADE`) :**  
   Lorsqu'un projet est supprimé par un administrateur, toutes ses tâches, ses affectations de membres, ses invitations et ses logs de session sont purgés automatiquement, garantissant l'absence totale de données orphelines.
2. **Désassignation gracieuse (`ON DELETE SET NULL`) :**  
   Si un membre quitte un projet, les tâches qui lui étaient affectées ne sont pas supprimées ; son assignation est simplement remise à `null` pour permettre à un autre équipier de la reprendre.
3. **Unicité de l'affectation (`UNIQUE(membre_id, projet_id)`) :**  
   Un utilisateur ne peut pas être affecté deux fois au même projet.

---

## 5. Algorithmes & Fonctionnalités Métier Spécifiques

### 5.1. Chronomètre Persistant avec Immunité au Rafraîchissement
Dans les applications web classiques, un `setInterval` en mémoire perd son décompte dès que l'utilisateur recharge la page ou ferme son onglet.  
**Solution implémentée :**
1. Au clic sur `Démarrer`, on enregistre dans `localStorage` l'objet suivant :
   ```json
   {
     "tacheId": 101,
     "membreId": 1,
     "dateDebut": "2025-03-09T10:00:00.000Z",
     "startTimestamp": 1741514400000
   }
   ```
2. À chaque seconde (et lors de toute réouverture du navigateur), le temps écoulé réel est recalculé mathématiquement :
   $$\text{secondesÉcoulées} = \left\lfloor \frac{\text{Date.now}() - \text{startTimestamp}}{1000} \right\rfloor$$
3. Cette approche garantit une précision absolue, sans dérive temporelle et sans perte de données en cas de crash du navigateur.

### 5.2. Règle Métier de Protection du Dernier Administrateur
Afin d'éviter qu'un projet devienne orphelin et ingérable :
```typescript
const projectAdmins = this.state.affectations.filter(
  (a) => a.projetId === projetId && a.role === 'ADMIN'
);
if (targetAff.role === 'ADMIN' && projectAdmins.length <= 1) {
  throw new Error('Impossible de retirer le dernier administrateur du projet.');
}
```

### 5.3. Générateur de Commits Conventionnels (Conventional Commits 1.0)
Pour faciliter le travail quotidien des développeurs, le service `taskService` transforme automatiquement le titre et l'identifiant de la tâche en message normalisé :
```typescript
const cleanTitle = tache.titre.toLowerCase().replace(/[^\w\s-]/g, '').trim();
return `${type}(MJ-${tache.id}): ${cleanTitle}`;
// Résultat : feat(MJ-101): implementer-le-drag-drop-kanban
```

---

## 6. Sécurité, Résilience & Performance

| Enjeu | Mesure Appliquée |
| :--- | :--- |
| **Fuite de clés secrètes** | Aucune clé Gemini dans le code client (`VITE_`). Clé stockée dans `process.env.GEMINI_API_KEY` et utilisée exclusivement dans `server.ts`. |
| **XSS & Injection** | Échappement natif de React pour toutes les entrées utilisateurs. Validation stricte des données avant insertion dans le mock. |
| **Attaque par déni de service / Quotas IA** | Présence d'un fallback déterministe immédiat en cas d'erreur réseau, de quota dépassé ou de clé manquante. |
| **Performance du rendu** | Indexation en mémoire des tableaux par `id`, tri mémoïsé des listes de tâches, et pagination conceptuelle via filtrage direct. |
| **Auditabilité & Traçabilité** | Centre de notifications historisant chaque action clé (changement de statut, assignation, dépassement d'heures). |

---

*Document rédigé dans le cadre des livrables techniques d'ingénierie logicielle pour Mini-Jira.*
