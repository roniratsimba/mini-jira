/**
 * =====================================================================
 * MINI-JIRA — SERVICE DE CHRONOMÉTRAGE PERSISTANT (SessionTimerService)
 * =====================================================================
 * Gère les sessions de travail horodatées en temps réel sur les tâches via l'API Symfony :
 * - Persistance temporelle dans localStorage immunisée contre le rafraîchissement
 * - Calcul du temps écoulé basé sur les horodatages Unix absolus (zéro dérive)
 * - Pattern Observateur (pub/sub) pour notifier l'en-tête et les modales
 * - Conversion et clôture de session avec arrondi à la minute supérieure
 */

import { symfonyApi } from './symfonyApiClient';
import { SessionTravail, Tache } from '../types';

/**
 * Données de la session de chronométrage en cours d'exécution.
 */
export interface ActiveSession {
  /** Tâche sur laquelle le collaborateur travaille */
  tacheId: number;
  /** Identifiant du collaborateur */
  membreId: number;
  /** Date/heure de lancement au format ISO */
  dateDebut: string;
  /** Timestamp Unix initial en millisecondes */
  startTimestamp: number;
}

const ACTIVE_SESSION_STORAGE_KEY = 'minijira_active_session_';

class SessionTimerService {
  /** Session courante en mémoire (null si aucun chrono n'est actif) */
  private activeSession: ActiveSession | null = null;
  /** Identifiant de l'intervalle de cadencement à la seconde */
  private timerInterval: number | null = null;
  /** Nombre de secondes écoulées calculées pour affichage */
  private elapsedSeconds = 0;
  /** Liste des abonnés à l'événement de tic du chronomètre */
  private listeners: Array<(session: ActiveSession | null, elapsedSeconds: number) => void> = [];

  constructor() {
    this.restoreActiveSession();
  }

  /**
   * Restaure une session active depuis le localStorage si le navigateur a été rechargé.
   * Calcule le delta temporel réel : Math.floor((Date.now() - startTimestamp) / 1000).
   */
  private async restoreActiveSession() {
    try {
      const stored = localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
      if (stored) {
        const parsed: ActiveSession = JSON.parse(stored);
        this.activeSession = parsed;
        const now = Date.now();
        this.elapsedSeconds = Math.max(0, Math.floor((now - parsed.startTimestamp) / 1000));
        
        // Vérifier si la session est toujours active sur le serveur
        try {
          const serverSession = await symfonyApi.getActiveSession();
          if (!serverSession || serverSession.tacheId !== parsed.tacheId) {
            // La session n'existe plus sur le serveur, on la réinitialise
            this.activeSession = null;
            this.elapsedSeconds = 0;
            localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
            return;
          }
        } catch {
          // Si l'API échoue, on continue avec la session locale
        }
        
        this.startTick();
      }
    } catch {
      // Ignorer les corruptions éventuelles du stockage
    }
  }

  /**
   * Démarre la boucle de tic à la seconde (1000ms) et diffuse aux abonnés.
   */
  private startTick() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = window.setInterval(() => {
      if (this.activeSession) {
        const now = Date.now();
        this.elapsedSeconds = Math.max(0, Math.floor((now - this.activeSession.startTimestamp) / 1000));
        this.notify();
      }
    }, 1000);
  }

  /**
   * Permet aux composants React de s'abonner aux variations du chronomètre.
   * @param listener Fonction de rappel recevant la session active et le temps écoulé
   * @returns Fonction de désabonnement propre (clean-up)
   */
  public subscribe(listener: (session: ActiveSession | null, elapsedSeconds: number) => void): () => void {
    this.listeners.push(listener);
    listener(this.activeSession, this.elapsedSeconds);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /** Diffuse l'état courant à l'ensemble des écouteurs */
  private notify() {
    this.listeners.forEach((l) => l(this.activeSession, this.elapsedSeconds));
  }

  /** Retourne la session active en cours ou null */
  public getActiveSession(): ActiveSession | null {
    return this.activeSession;
  }

  /** Retourne le nombre total de secondes écoulées */
  public getElapsedSeconds(): number {
    return this.elapsedSeconds;
  }

  /** Vérifie si une tâche spécifique fait l'objet d'un chronométrage actif */
  public isTaskRunning(tacheId: number): boolean {
    return this.activeSession?.tacheId === tacheId;
  }

  /**
   * Démarre une session de travail sur une tâche.
   * Si une session tournait déjà sur une autre tâche, elle est automatiquement clôturée.
   * 
   * @param tacheId Identifiant de la tâche ciblée
   * @param membreId Identifiant du collaborateur
   */
  public async startSession(tacheId: number, membreId: number): Promise<ActiveSession> {
    if (this.activeSession) {
      if (this.activeSession.tacheId === tacheId) {
        return this.activeSession;
      }
      // Clôture automatique de la session précédente
      await this.stopSession();
    }

    try {
      await symfonyApi.startSession(tacheId);
      
      const now = new Date();
      this.activeSession = {
        tacheId,
        membreId,
        dateDebut: now.toISOString(),
        startTimestamp: now.getTime(),
      };
      this.elapsedSeconds = 0;

      localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, JSON.stringify(this.activeSession));
      this.startTick();
      this.notify();
      return this.activeSession;
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors du démarrage de la session');
    }
  }

  /**
   * Arrête le chronomètre actif, persiste la session dans la base de données
   * et incrémente le temps réel cumulé de la tâche.
   * 
   * @returns La session de travail enregistrée, ou null si aucune session n'était active
   */
  public async stopSession(): Promise<SessionTravail | null> {
    if (!this.activeSession) return null;

    try {
      const endDate = new Date();
      const durationSeconds = Math.max(1, Math.floor((endDate.getTime() - this.activeSession.startTimestamp) / 1000));
      // Règle d'arrondi : minimum 1 minute pour assurer la visibilité en démo
      const durationMinutes = Math.max(1, Math.ceil(durationSeconds / 60));

      await symfonyApi.stopSession();

      const session: SessionTravail = {
        id: 0, // L'ID sera assigné par le serveur
        tacheId: this.activeSession.tacheId,
        membreId: this.activeSession.membreId,
        dateDebut: this.activeSession.dateDebut,
        dateFin: endDate.toISOString(),
        dureeMinutes: durationMinutes,
      };

      if (this.timerInterval) clearInterval(this.timerInterval);
      this.timerInterval = null;
      this.activeSession = null;
      this.elapsedSeconds = 0;

      localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
      this.notify();
      return session;
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de l\'arrêt de la session');
    }
  }

  /** Récupère l'historique de toutes les sessions de travail enregistrées pour une tâche */
  public async getSessionsForTask(tacheId: number): Promise<SessionTravail[]> {
    try {
      const sessions = await symfonyApi.request<any[]>(`/tasks/${tacheId}/sessions`);
      return (sessions || []).map((s: any) => ({
        id: s.id,
        tacheId: s.tacheId,
        membreId: s.membreId,
        dateDebut: s.dateDebut,
        dateFin: s.dateFin,
        dureeMinutes: s.dureeMinutes,
      }));
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de la récupération des sessions');
    }
  }
  /**
   * Formate un nombre total de secondes en affichage lisible HH:MM:SS ou MM:SS.
   * @param totalSeconds Secondes écoulées
   * @example formatDuration(125) => "02:05"
   * @example formatDuration(3665) => "01:01:05"
   */
  public formatDuration(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}

/** Instance singleton partagée par toute l'application */
export const sessionTimerService = new SessionTimerService();

