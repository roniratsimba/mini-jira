/**
 * =====================================================================
 * MINI-JIRA — DÉFINITIONS DES TYPES ET MODÈLE DE DONNÉES
 * =====================================================================
 * Ce fichier contient les contrats de typage TypeScript stricts
 * régissant l'application Mini-Jira, conçus en parfaite cohérence avec
 * le diagramme de classes UML et le schéma relationnel PostgreSQL (3FN).
 */

/**
 * Rôles d'accès au projet (RBAC).
 * - ADMIN  : Droits complets (création d'invitations, modification métadonnées, suppression projet, assignations).
 * - MEMBRE : Droits opérationnels (visualisation, création et mise à jour de tâches, chronométrage).
 */
export type RoleEnum = 'ADMIN' | 'MEMBRE';

/**
 * Niveaux de priorité d'une tâche pour ordonner le backlog Agile.
 * Utilisé pour le tri intelligent et l'affichage des badges visuels.
 */
export type Priorite = 'BASSE' | 'MOYENNE' | 'HAUTE';

/**
 * Statuts d'avancement d'une tâche dans le workflow Kanban.
 * - A_FAIRE  : Tâche planifiée en attente de prise en charge.
 * - EN_COURS : Tâche activement développée (chronométrable).
 * - TERMINE  : Tâche validée et livrée.
 */
export type Statut = 'A_FAIRE' | 'EN_COURS' | 'TERMINE';

/**
 * Cycle de vie d'une invitation projet sécurisée par jeton unique.
 * - EN_ATTENTE : Jeton valide en attente d'utilisation.
 * - ACCEPTEE   : Jeton consommé par un collaborateur.
 * - EXPIREE    : Date limite de validité (7 jours) dépassée.
 * - ANNULEE    : Révoquée manuellement par un administrateur.
 */
export type StatutInvitation = 'EN_ATTENTE' | 'ACCEPTEE' | 'EXPIREE' | 'ANNULEE';

/**
 * Typologie des notifications applicatives générées lors des actions métier.
 */
export type NotificationType =
  | 'INVITATION_RECUE'
  | 'INVITATION_ACCEPTEE'
  | 'TACHE_ASSIGNEE'
  | 'TACHE_STATUT_CHANGE'
  | 'TACHE_TERMINEE'
  | 'PROJET_CREE'
  | 'MEMBRE_AJOUTE'
  | 'MEMBRE_RETIRE'
  | 'ALERTE_TEMPS_DEPASSE';

/**
 * Représente un compte utilisateur collaborateur.
 * Correspond à la table SQL `membre`.
 */
export interface Membre {
  /** Identifiant unique (Clé primaire) */
  id: number;
  /** Nom complet du collaborateur */
  nom: string;
  /** Adresse email unique pour l'authentification */
  email: string;
  /** Empreinte chiffrée du mot de passe (simulation bcrypt) */
  passwordHash?: string;
  /** Date de création du compte au format ISO (YYYY-MM-DD) */
  dateCreation: string;
  /** Indicateur d'activité du compte */
  actif: boolean;
  /** URL de l'avatar utilisateur */
  avatarUrl?: string;
}

/**
 * Représente un espace projet de développement logiciel.
 * Correspond à la table SQL `projet`.
 */
export interface Projet {
  /** Identifiant unique du projet (Clé primaire) */
  id: number;
  /** Nom explicite du projet */
  nom: string;
  /** Description synthétique des objectifs et du périmètre */
  description: string;
  /** Date de création au format ISO (YYYY-MM-DD) */
  dateCreation: string;
  /** Identifiant du membre créateur (Clé étrangère vers `membre.id`) */
  createurId: number;
}

/**
 * Table de liaison N:N associant un membre à un projet avec un niveau de rôle.
 * Correspond à la table SQL `affectation`.
 */
export interface Affectation {
  /** Identifiant unique de l'affectation */
  id: number;
  /** Référence au membre affecté (Clé étrangère) */
  membreId: number;
  /** Référence au projet concerné (Clé étrangère) */
  projetId: number;
  /** Rôle accordé au membre dans ce projet (ADMIN ou MEMBRE) */
  role: RoleEnum;
  /** Date d'intégration au projet au format ISO (YYYY-MM-DD) */
  dateAjout: string;
}

/**
 * Représente une tâche de développement unitaire dans le backlog ou le Kanban.
 * Correspond à la table SQL `tache`.
 */
export interface Tache {
  /** Identifiant unique de la tâche */
  id: number;
  /** Référence au projet parent (Clé étrangère vers `projet.id`) */
  projetId: number;
  /** Titre concis et actionnable */
  titre: string;
  /** Description détaillée et critères d'acceptation */
  description: string;
  /** Degré de priorité pour le tri */
  priorite: Priorite;
  /** Statut courant dans le tableau Kanban */
  statut: Statut;
  /** Date de création au format ISO (YYYY-MM-DD) */
  dateCreation: string;
  /** Date limite prévisionnelle de réalisation (peut être null) */
  dateEcheance: string | null;
  /** Estimation initiale de charge en minutes */
  tempsEstime: number;
  /** Temps réel effectif cumulé via les sessions de travail (en minutes) */
  tempsReel: number;
  /** Membre actuellement assigné à la tâche (null si non assignée) */
  membreAssigneId: number | null;
}

/**
 * Représente un jeton d'invitation sécurisé pour intégrer un projet.
 * Correspond à la table SQL `invitation`.
 */
export interface Invitation {
  /** Identifiant unique de l'invitation */
  id: number;
  /** Référence au projet ciblé */
  projetId: number;
  /** Jeton alphanumérique unique (ex: MJ-A8F3-9K2L) */
  token: string;
  /** Email du destinataire prévisionnel (optionnel) */
  emailDestinataire?: string;
  /** Administrateur ayant généré l'invitation */
  createurId: number;
  /** Horodatage de génération (ISO) */
  dateCreation: string;
  /** Horodatage d'expiration (7 jours après création) */
  dateExpiration: string;
  /** État de validité du jeton */
  statut: StatutInvitation;
}

/**
 * Journalise une période de travail effectif chronométrée sur une tâche.
 * Correspond à la table SQL `session_travail`.
 */
export interface SessionTravail {
  /** Identifiant unique de la session */
  id: number;
  /** Référence à la tâche travaillée (Clé étrangère) */
  tacheId: number;
  /** Référence au collaborateur ayant travaillé (Clé étrangère) */
  membreId: number;
  /** Horodatage de début de session (ISO) */
  dateDebut: string;
  /** Horodatage de fin de session (null si en cours) */
  dateFin: string | null;
  /** Durée calculée en minutes (arrondie à la minute supérieure) */
  dureeMinutes: number | null;
}

/**
 * Alerte ou message informatif temps réel adressé à un membre.
 * Correspond à la table SQL `notification`.
 */
export interface Notification {
  /** Identifiant unique de la notification */
  id: number;
  /** Membre destinataire de la notification (Clé étrangère) */
  destinataireId: number;
  /** Type d'événement déclencheur */
  type: NotificationType;
  /** Titre bref de l'alerte */
  titre: string;
  /** Message d'explication détaillé */
  message: string;
  /** Indicateur d'accusé de lecture */
  lu: boolean;
  /** Horodatage d'émission (ISO) */
  dateCreation: string;
  /** Identifiant de l'entité liée (tâche, projet ou invitation) */
  referenceId?: number;
  /** Type de l'entité liée */
  referenceType?: 'TACHE' | 'PROJET' | 'INVITATION';
}

/**
 * Structure d'état volatile pour le suivi du chronomètre actif en direct.
 * Permet de recalculer le temps écoulé sans dépendre d'un intervalle volatile.
 */
export interface ActiveSessionTimer {
  sessionTravailId: number;
  tacheId: number;
  membreId: number;
  /** Timestamp Unix (en millisecondes) marquant le démarrage de la session */
  startTime: number;
}

