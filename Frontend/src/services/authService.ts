/**
 * =====================================================================
 * MINI-JIRA — SERVICE D'AUTHENTIFICATION & SESSIONS (AuthService)
 * =====================================================================
 * Gère l'état d'authentification de l'utilisateur connecté via l'API Symfony :
 * - Restauration automatique de session depuis le localStorage (token JWT)
 * - Connexion, inscription avec contrôles défensifs
 * - Gestion du token JWT via symfonyApiClient
 * - Met à jour le profil utilisateur
 */

import { Membre } from '../types';
import { symfonyApi } from './symfonyApiClient';

const SESSION_KEY = 'minijira_current_user';

class AuthService {
  /** Membre actuellement authentifié (ou null si déconnecté) */
  private currentMembre: Membre | null = null;
  /** Écouteurs abonnés aux changements d'utilisateur connecté */
  private listeners: Array<(user: Membre | null) => void> = [];

  constructor() {
    this.restoreSession();
  }

  /**
   * Restaure la session précédente depuis localStorage au démarrage.
   */
  private async restoreSession() {
    try {
      const storedUser = localStorage.getItem(SESSION_KEY);
      if (storedUser) {
        this.currentMembre = JSON.parse(storedUser);
        // Vérifier si le token est toujours valide en appelant l'API
        try {
          const me = await symfonyApi.getMe();
          this.currentMembre = me;
          localStorage.setItem(SESSION_KEY, JSON.stringify(me));
        } catch {
          // Token invalide, déconnecter
          this.logout();
        }
      }
    } catch {
      // Fallback gracieux en cas d'erreur de parsing
      this.currentMembre = null;
    }
  }

  /** Retourne le membre connecté actuel */
  public getCurrentUser(): Membre | null {
    return this.currentMembre;
  }

  /**
   * S'abonne aux changements d'état d'authentification.
   * @param listener Callback appelé lors d'une connexion, déconnexion ou permutation
   * @returns Fonction de désabonnement
   */
  public subscribe(listener: (user: Membre | null) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /** Notifie tous les abonnés du changement d'utilisateur */
  private notify() {
    this.listeners.forEach((l) => l(this.currentMembre));
  }

  /**
   * Authentifie un collaborateur via son email et mot de passe.
   * @param email Adresse email
   * @param password Mot de passe
   * @throws Error si les identifiants sont invalides
   */
  public async login(email: string, password: string): Promise<Membre> {
    if (!email || !password) {
      throw new Error('Veuillez renseigner votre adresse email et votre mot de passe.');
    }

    try {
      const result = await symfonyApi.login(email, password);
      if (result.user) {
        this.currentMembre = result.user;
        localStorage.setItem(SESSION_KEY, JSON.stringify(result.user));
        this.notify();
        return result.user;
      }
      throw new Error('Identifiants invalides');
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de la connexion');
    }
  }

  /**
   * Enregistre un nouveau compte collaborateur avec contrôles de validation.
   * @param nom Nom complet
   * @param email Email unique
   * @param password Mot de passe (min 6 caractères)
   * @param confirmation Confirmation identique
   * @throws Error si un champ est invalide ou si l'email existe déjà
   */
  public async register(nom: string, email: string, password: string, confirmation: string): Promise<Membre> {
    if (!nom.trim() || !email.trim() || !password) {
      throw new Error('Tous les champs sont obligatoires.');
    }

    if (password !== confirmation) {
      throw new Error('Les mots de passe ne correspondent pas.');
    }

    if (password.length < 6) {
      throw new Error('Le mot de passe doit comporter au moins 6 caractères.');
    }

    try {
      const result = await symfonyApi.register({
        nom: nom.trim(),
        email: email.trim(),
        motDePasse: password,
      });
      
      if (result.user) {
        this.currentMembre = result.user;
        localStorage.setItem(SESSION_KEY, JSON.stringify(result.user));
        this.notify();
        return result.user;
      }
      throw new Error('Erreur lors de l\'inscription');
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de l\'inscription');
    }
  }

  /**
   * Met à jour le profil de l'utilisateur connecté de façon sécurisée.
   * @param updates Données à mettre à jour (nom, email, avatarUrl, nouveau mot de passe)
   */
  public async updateProfile(updates: {
    nom?: string;
    email?: string;
    avatarUrl?: string;
    oldPassword?: string;
    newPassword?: string;
  }): Promise<Membre> {
    if (!this.currentMembre) {
      throw new Error('Aucun utilisateur actuellement connecté.');
    }

    const payload: { nom?: string; avatarUrl?: string } = {};

    if (updates.nom !== undefined) {
      if (!updates.nom.trim()) throw new Error('Le nom ne peut pas être vide.');
      payload.nom = updates.nom.trim();
    }

    if (updates.avatarUrl !== undefined) {
      payload.avatarUrl = updates.avatarUrl;
    }

    if (updates.newPassword && updates.oldPassword) {
      try {
        await symfonyApi.changePassword(updates.oldPassword, updates.newPassword);
      } catch (error: any) {
        throw new Error(error.message || 'Erreur lors du changement de mot de passe');
      }
    }

    try {
      const updated = await symfonyApi.updateProfile(payload);
      this.currentMembre = updated;
      localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      this.notify();
      return updated;
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de la mise à jour du profil');
    }
  }

  /**
   * Supprime définitivement le compte de l'utilisateur connecté,
   * nettoie la session et notifie les abonnés.
   */
  public async deleteAccount(password: string): Promise<void> {
    if (!this.currentMembre) {
      throw new Error('Aucun utilisateur actuellement connecté.');
    }

    try {
      await symfonyApi.deleteAccount(password);
      this.currentMembre = null;
      localStorage.removeItem(SESSION_KEY);
      this.notify();
    } catch (error: any) {
      throw new Error(error.message || 'Erreur lors de la suppression du compte');
    }
  }

  /**
   * Déconnecte l'utilisateur et purge la session du localStorage.
   * Procédure obligatoire pour changer de compte en toute sécurité.
   */
  public logout() {
    this.currentMembre = null;
    localStorage.removeItem(SESSION_KEY);
    symfonyApi.clearToken();
    this.notify();
  }
}

/** Instance singleton partagée */
export const authService = new AuthService();

