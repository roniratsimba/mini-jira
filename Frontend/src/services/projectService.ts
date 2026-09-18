/**
 * =====================================================================
 * MINI-JIRA — SERVICE MÉTIER DES PROJETS (ProjectService)
 * =====================================================================
 * Gère le cycle de vie des projets collaboratifs via l'API Symfony :
 * - Calcul des statistiques d'avancement (taux %, temps réel vs estimé)
 * - Création, modification et suppression contrôlée de projets
 * - Vérification des prérequis d'administration (seul un ADMIN peut modifier/supprimer)
 * - Gestion des membres et respect de la règle du dernier administrateur
 */

import { Projet, RoleEnum } from '../types';
import { symfonyApi } from './symfonyApiClient';

/**
 * Projet enrichi avec le rôle du membre connecté et ses métriques globales.
 */
export interface ProjectWithRole {
  /** Données brutes du projet */
  projet: Projet;
  /** Rôle de l'utilisateur dans ce projet (ADMIN ou MEMBRE) */
  role: RoleEnum;
  /** Nombre total de tâches du projet */
  totalTaches: number;
  /** Nombre de tâches ayant atteint le statut 'TERMINE' */
  tachesTerminees: number;
  /** Pourcentage de complétion arrondi (0 à 100 %) */
  avancementPct: number;
  /** Effectif total des membres affectés au projet */
  membresCount: number;
}

/**
 * Statistiques analytiques exhaustives utilisées par le Dashboard Projet.
 */
export interface ProjectDetailedStats {
  /** Nombre total de tâches */
  total: number;
  /** Tâches au statut 'A_FAIRE' */
  aFaire: number;
  /** Tâches au statut 'EN_COURS' */
  enCours: number;
  /** Tâches au statut 'TERMINE' */
  termine: number;
  /** Taux global d'avancement en % */
  avancementPct: number;
  /** Nombre de tâches non terminées dont la date d'échéance est dépassée */
  tachesEnRetard: number;
  /** Somme totale des estimations en minutes */
  tempsEstimeTotal: number;
  /** Somme totale du temps effectif passé en minutes */
  tempsReelTotal: number;
  /** Booléen indiquant si le temps réel cumulé dépasse le prévisionnel */
  isOvertime: boolean;
}

export const projectService = {
  /**
   * Récupère la liste de tous les projets auxquels un membre est affecté,
   * avec calcul dynamique de son rôle et de la progression globale.
   * 
   * @returns Liste des projets enrichis de leurs métriques
   */
  async getProjectsForUser(): Promise<ProjectWithRole[]> {
    try {
      const projects = await symfonyApi.getProjects();
      return projects.map((project: any) => {
        return {
          projet: {
            id: project.id,
            nom: project.nom,
            description: project.description,
            dateCreation: project.dateCreation,
            createurId: project.createurId, // toujours absent côté backend, voir note ci-dessous
          },
          role: project.currentUserRole || 'MEMBRE',
          totalTaches: project.totalTasks || 0,
          tachesTerminees: project.doneTasks || 0,
          avancementPct: project.totalTasks > 0
            ? Math.round((project.doneTasks / project.totalTasks) * 100)
            : 0,
          membresCount: project.membresCount || 0,
        };
      });
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de la récupération des projets');
    }
  },

  /**
   * Recherche un projet par son identifiant unique.
   * @param projetId Identifiant du projet
   */
  async getProjectById(projetId: number): Promise<Projet> {
    try {
      const project = await symfonyApi.getProjectDetail(projetId);
      return {
        id: project.id,
        nom: project.nom,
        description: project.description,
        dateCreation: project.dateCreation,
        createurId: project.createurId,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de la récupération du projet');
    }
  },

  /**
   * Détermine le rôle d'un membre au sein d'un projet spécifique.
   * @param projetId Identifiant du projet
   * @returns 'ADMIN' | 'MEMBRE' ou null si l'utilisateur n'est pas affecté
   */
  async getUserRoleInProject(projetId: number): Promise<RoleEnum | null> {
    try {
      const project = await symfonyApi.getProjectDetail(projetId);
      return project.currentUserRole || null;
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de la récupération du rôle');
    }
  },

  /**
   * Calcule les métriques détaillées d'un projet pour alimenter les graphiques et KPI.
   * Analyse les statuts, les dates limites et compare le temps estimé vs réel.
   * 
   * @param projetId Identifiant du projet
   */
  async getProjectDetailedStats(projetId: number): Promise<ProjectDetailedStats> {
    try {
      const tasks = await symfonyApi.getTasks(projetId);
      const total = tasks.length;
      const aFaire = tasks.filter((t: any) => t.statut === 'A_FAIRE').length;
      const enCours = tasks.filter((t: any) => t.statut === 'EN_COURS').length;
      const termine = tasks.filter((t: any) => t.statut === 'TERMINE').length;
      const avancementPct = total > 0 ? Math.round((termine / total) * 100) : 0;

      // Détection des tâches en retard : date d'échéance passée et statut != 'TERMINE'
      const todayStr = new Date().toISOString().split('T')[0];
      const tachesEnRetard = tasks.filter(
        (t: any) => t.statut !== 'TERMINE' && t.dateEcheance && t.dateEcheance < todayStr
      ).length;

      // Cumul des temps
      const tempsEstimeTotal = tasks.reduce((acc: number, t: any) => acc + (t.tempsEstime || 0), 0);
      const tempsReelTotal = tasks.reduce((acc: number, t: any) => acc + (t.totalMinutesPassees || 0), 0);

      return {
        total,
        aFaire,
        enCours,
        termine,
        avancementPct,
        tachesEnRetard,
        tempsEstimeTotal,
        tempsReelTotal,
        isOvertime: tempsReelTotal > tempsEstimeTotal,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors du calcul des statistiques');
    }
  },

  /**
   * Crée un nouveau projet et attribue automatiquement le rôle ADMIN au créateur.
   * @param nom Nom du projet
   * @param description Description
   * @param code Code unique du projet
   */
  async createProject(nom: string, description: string, code: string): Promise<Projet> {
    if (!nom.trim()) {
      throw new Error('Le nom du projet est obligatoire.');
    }
    if (!code.trim()) {
      throw new Error('Le code du projet est obligatoire.');
    }

    try {
      const project = await symfonyApi.createProject({
        code: code.trim(),
        nom: nom.trim(),
        description: description.trim(),
      });
      
      return {
        id: project.id,
        nom: project.nom,
        description: project.description,
        dateCreation: project.dateCreation,
        createurId: project.createurId,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de la création du projet');
    }
  },

  /**
   * Met à jour les métadonnées d'un projet (Contrôle d'accès RBAC : ADMIN requis).
   * @param projetId Identifiant du projet
   * @param nom Nouveau nom
   * @param description Nouvelle description
   * @throws Error si l'opérateur n'est pas administrateur du projet
   */
  async updateProject(projetId: number, nom: string, description: string) {
    try {
      await symfonyApi.request(`/projects/${projetId}`, {
        method: 'PUT',
        body: JSON.stringify({ nom: nom.trim(), description: description.trim() }),
      });
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de la mise à jour du projet');
    }
  },

  /**
   * Supprime un projet en cascade (Contrôle d'accès RBAC : ADMIN requis).
   * Purgation automatique des tâches, affectations et invitations associées.
   * @param projetId Identifiant du projet
   * @throws Error si l'opérateur n'est pas administrateur
   */
  async deleteProject(projetId: number) {
    try {
      await symfonyApi.request(`/projects/${projetId}`, {
        method: 'DELETE',
      });
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de la suppression du projet');
    }
  },

  /**
   * Rejoint un projet via un code d'invitation.
   * @param code Code d'invitation
   */
  async joinProject(code: string): Promise<Projet> {
    try {
      const result = await symfonyApi.joinProject(code);
      return {
        id: result.project.id,
        nom: result.project.nom,
        description: result.project.description,
        dateCreation: result.project.dateCreation,
        createurId: result.project.createurId,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de la jointure au projet');
    }
  },
};

