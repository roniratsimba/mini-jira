/**
 * =====================================================================
 * MINI-JIRA — SERVICE MÉTIER DES TÂCHES (TaskService)
 * =====================================================================
 * Encapsule toute la logique applicative relative aux tâches via l'API Symfony :
 * - Filtrage multi-critères et tri pondéré par priorité & échéance
 * - Gestion du cycle de vie (création, transition de statut, assignation)
 * - Détection des retards prévisionnels et des dépassements de temps
 * - Générateur de messages de commits Git conventionnels
 */

import { Tache, Statut, Priorite } from '../types';
import { symfonyApi } from './symfonyApiClient';

/**
 * Critères de filtrage applicables lors de la consultation des tâches.
 */
export interface TaskFilterOptions {
  /** Filtrer par identifiant de projet */
  projetId?: number;
  /** Filtrer par statut ('A_FAIRE', 'EN_COURS', 'TERMINE' ou 'ALL') */
  statut?: Statut | 'ALL';
  /** Filtrer par niveau de priorité ('HAUTE', 'MOYENNE', 'BASSE' ou 'ALL') */
  priorite?: Priorite | 'ALL';
  /** Terme de recherche textuelle appliqué sur le titre et la description */
  search?: string;
  /** Restreindre uniquement aux tâches assignées au collaborateur courant */
  assignedToMeOnly?: boolean;
}

export const taskService = {
  /**
   * Récupère l'intégralité des tâches associées à un projet donné.
   * @param projetId Identifiant du projet
   * @returns Liste des tâches du projet
   */
  async getTasksForProject(projetId: number): Promise<Tache[]> {
    try {
      const tasks = await symfonyApi.getTasks(projetId);
      return tasks.map((task: any) => ({
        id: task.id,
        projetId: task.projetId,
        titre: task.titre,
        description: task.description,
        priorite: task.priorite,
        statut: task.statut,
        tempsEstime: task.tempsEstime,
        tempsReel: task.tempsPasse || 0,
        dateCreation: task.dateCreation,
        dateEcheance: task.dateEcheance,
        membreAssigneId: task.assignes?.[0]?.id || null,
      }));
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de la récupération des tâches');
    }
  },

  /**
   * Récupère et filtre les tâches assignées à un membre spécifique.
   * Applique un tri automatique par priorité décroissante (HAUTE -> MOYENNE -> BASSE),
   * puis par date d'échéance la plus proche.
   * 
   * @param membreId Identifiant du membre
   * @param options Filtres optionnels (statut, priorité, recherche)
   * @returns Liste triée et filtrée
   */
  async getTasksForMember(membreId: number, options?: TaskFilterOptions): Promise<Tache[]> {
    try {
      // Récupérer tous les projets de l'utilisateur
      const projects = await symfonyApi.getProjects();
      let allTasks: Tache[] = [];

      // Pour chaque projet, récupérer les tâches
      for (const project of projects) {
        const tasks = await symfonyApi.getTasks(project.id);
        const filteredTasks = tasks
          .filter((task: any) => task.assignes?.some((assignee: any) => assignee.id === membreId))
          .map((task: any) => ({
            id: task.id,
            projetId: task.projetId,
            titre: task.titre,
            description: task.description,
            priorite: task.priorite,
            statut: task.statut,
            tempsEstime: task.tempsEstime,
            tempsReel: task.tempsPasse || 0,
            dateCreation: task.dateCreation,
            dateEcheance: task.dateEcheance,
            membreAssigneId: membreId,
          }));
        allTasks = [...allTasks, ...filteredTasks];
      }

      // Filtre par projet si spécifié
      if (options?.projetId) {
        allTasks = allTasks.filter((t) => t.projetId === options.projetId);
      }
      // Filtre par statut
      if (options?.statut && options.statut !== 'ALL') {
        allTasks = allTasks.filter((t) => t.statut === options.statut);
      }
      // Filtre par niveau de priorité
      if (options?.priorite && options.priorite !== 'ALL') {
        allTasks = allTasks.filter((t) => t.priorite === options.priorite);
      }
      // Filtre textuel insensible à la casse
      if (options?.search) {
        const q = options.search.toLowerCase();
        allTasks = allTasks.filter(
          (t) => t.titre.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
        );
      }

      // Poids numérique des priorités pour un tri strict
      const priorityWeight: Record<Priorite, number> = {
        HAUTE: 3,
        MOYENNE: 2,
        BASSE: 1,
      };

      // Tri composite : Priorité d'abord, puis proximité de l'échéance
      return allTasks.sort((a, b) => {
        const weightDiff = priorityWeight[b.priorite] - priorityWeight[a.priorite];
        if (weightDiff !== 0) return weightDiff;
        if (a.dateEcheance && b.dateEcheance) {
          return a.dateEcheance.localeCompare(b.dateEcheance);
        }
        return (a.dateEcheance ? -1 : 1);
      });
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de la récupération des tâches');
    }
  },

  /**
   * Recherche une tâche par son identifiant unique.
   * @param tacheId Identifiant de la tâche
   */
  async getTaskById(tacheId: number): Promise<Tache> {
    try {
      // Pour simplifier, on va chercher dans tous les projets
      const projects = await symfonyApi.getProjects();
      for (const project of projects) {
        const tasks = await symfonyApi.getTasks(project.id);
        const task = tasks.find((t: any) => t.id === tacheId);
        if (task) {
          return {
            id: task.id,
            projetId: task.projetId,
            titre: task.titre,
            description: task.description,
            priorite: task.priorite,
            statut: task.statut,
            tempsEstime: task.tempsEstime,
            tempsReel: task.tempsPasse || 0,
            dateCreation: task.dateCreation,
            dateEcheance: task.dateEcheance,
            membreAssigneId: task.assignes?.[0]?.id || null,
          };
        }
      }
      throw new Error('Tâche non trouvée');
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de la récupération de la tâche');
    }
  },

  /**
   * Crée une nouvelle tâche avec validation défensive du titre.
   * @param projectId Identifiant du projet
   * @param data Propriétés initiales de la tâche
   * @throws Error si le titre est vide
   */
  async createTask(projectId: number, data: {
    titre: string;
    description?: string;
    priorite?: string;
    statut?: string;
    tempsEstime?: number;
    dateEcheance?: string;
    assigneIds?: number[];
  }): Promise<Tache> {
    if (!data.titre.trim()) {
      throw new Error('Le titre de la tâche est obligatoire.');
    }

    try {
      const task = await symfonyApi.createTask(projectId, data);
      return {
        id: task.id,
        projetId: task.projetId,
        titre: task.titre,
        description: task.description,
        priorite: task.priorite,
        statut: task.statut,
        tempsEstime: task.tempsEstime,
        tempsReel: task.tempsPasse || 0,
        dateCreation: task.dateCreation,
        dateEcheance: task.dateEcheance,
        membreAssigneId: task.assignes?.[0]?.id || null,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de la création de la tâche');
    }
  },

  /**
   * Met à jour partiellement une tâche existante.
   * @param id Identifiant de la tâche
   * @param updates Champs à modifier
   */
  async updateTask(id: number, updates: Partial<Tache>): Promise<Tache> {
    try {
      await symfonyApi.request(`/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      return await this.getTaskById(id);
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de la mise à jour de la tâche');
    }
  },

  /**
   * Effectue une transition d'état dans le workflow Kanban (À faire -> En cours -> Terminé).
   * @param id Identifiant de la tâche
   * @param statut Nouveau statut
   */
  async changeStatus(id: number, statut: Statut): Promise<Tache> {
    try {
      await symfonyApi.updateTaskStatus(id, statut);
      return await this.getTaskById(id);
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors du changement de statut');
    }
  },

  /**
   * Supprime définitivement une tâche et ses logs de sessions de travail.
   * @param id Identifiant de la tâche à supprimer
   */
  async deleteTask(id: number) {
    try {
      await symfonyApi.deleteTask(id);
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de la suppression de la tâche');
    }
  },

  /**
   * Détermine si une tâche est en retard par rapport à sa date d'échéance.
   * Règle : Non applicable si la tâche est déjà au statut 'TERMINE'.
   * @param tache Instance de tâche
   * @returns true si la date d'échéance est antérieure à aujourd'hui
   */
  isOverdue(tache: Tache): boolean {
    if (tache.statut === 'TERMINE' || !tache.dateEcheance) return false;
    const today = new Date().toISOString().split('T')[0];
    return tache.dateEcheance < today;
  },

  /**
   * Détermine si une tâche a dépassé son budget de temps estimé.
   * Règle métier : tempsReel > tempsEstime avec tempsEstime > 0.
   * @param tache Instance de tâche
   * @returns true si le temps réel effectif excède l'estimation
   */
  isOvertime(tache: Tache): boolean {
    return (tache.tempsEstime > 0 && tache.tempsReel > tache.tempsEstime);
  },

  /**
   * Génère un message de commit Git normalisé selon la convention Conventional Commits 1.0.
   * Format produit : `<type>(MJ-<id>): <titre_normalisé>`
   * Exemple : `feat(MJ-101): mise en place du drag and drop`
   * 
   * @param tache Instance de tâche
   * @param type Type de commit Git ('feat', 'fix', 'refactor', 'docs', 'chore')
   */
  generateConventionalCommit(tache: Tache, type: 'feat' | 'fix' | 'refactor' | 'docs' | 'chore' = 'feat'): string {
    const cleanTitle = tache.titre
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim();
    return `${type}(MJ-${tache.id}): ${cleanTitle}`;
  },
};

