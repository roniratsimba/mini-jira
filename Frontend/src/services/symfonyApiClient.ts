/**
 * Client API TypeScript pour connecter le Frontend React au Backend Symfony 7
 * Gère le stockage sécurisé du token JWT, les headers d'authentification et les erreurs.
 */

// Safe fallback for Vite environment variables
const SYMFONY_API_BASE_URL = ((import.meta as any).env?.VITE_SYMFONY_API_URL as string) || 'http://localhost:8000/api';
const TOKEN_KEY = 'minijira_jwt_token';

class SymfonyApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem(TOKEN_KEY);
  }

  public setToken(token: string) {
    this.token = token;
    localStorage.setItem(TOKEN_KEY, token);
  }

  public getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem(TOKEN_KEY);
    }
    return this.token;
  }

  public clearToken() {
    this.token = null;
    localStorage.removeItem(TOKEN_KEY);
  }

  public async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${SYMFONY_API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Token expiré ou invalide
      this.clearToken();
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = data?.error || data?.message || `Erreur HTTP ${response.status}`;
      throw new Error(errorMessage);
    }

    return data as T;
  }

  // --- AUTHENTIFICATION ---
  public async login(email: string, motDePasse: string) {
    const result = await this.request<{ token: string; user?: any }>('/login_check', {
      method: 'POST',
      body: JSON.stringify({ email, password: motDePasse }),
    });
    if (result.token) {
      this.setToken(result.token);
    }
    return result;
  }

  public async register(userData: { nom: string; email: string; motDePasse: string; avatarUrl?: string }) {
    const result = await this.request<{ token: string; user: any }>('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (result.token) {
      this.setToken(result.token);
    }
    return result;
  }

  public async getMe() {
    return this.request<any>('/me', { method: 'GET' });
  }

  public async updateProfile(data: { nom?: string; avatarUrl?: string }) {
    return this.request<any>('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  public async changePassword(currentPassword: string, newPassword: string) {
    return this.request<{ message: string }>('/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  public async deleteAccount(password: string) {
    return this.request<{ message: string }>('/account', {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    });
  }

  // --- PROJETS ---
  public async getProjects() {
    return this.request<any[]>('/projects', { method: 'GET' });
  }

  public async createProject(project: { code: string; nom: string; description?: string; dateDebut?: string; dateFin?: string }) {
    return this.request<any>('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  public async getProjectDetail(id: number) {
    return this.request<any>(`/projects/${id}`, { method: 'GET' });
  }

  public async joinProject(code: string) {
    return this.request<{ message: string; project: any }>('/projects/join', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  // --- TÂCHES ---
  public async getTasks(projectId: number) {
    return this.request<any[]>(`/projects/${projectId}/tasks`, { method: 'GET' });
  }

  public async createTask(projectId: number, task: {
    titre: string;
    description?: string;
    priorite?: string;
    statut?: string;
    tempsEstime?: number;
    assigneIds?: number[];
  }) {
    return this.request<any>(`/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  public async updateTaskStatus(taskId: number, statut: 'A_FAIRE' | 'EN_COURS' | 'TERMINE') {
    return this.request<any>(`/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ statut }),
    });
  }

  public async deleteTask(taskId: number) {
    return this.request<{ message: string }>(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  // --- SESSIONS DE TRAVAIL & CHRONOMÈTRE ---
  public async startSession(taskId: number) {
    return this.request<any>(`/sessions/start/${taskId}`, { method: 'POST' });
  }

  public async stopSession() {
    return this.request<any>('/sessions/stop', { method: 'POST' });
  }

  public async getActiveSession() {
    return this.request<any | null>('/sessions/active', { method: 'GET' });
  }

  // --- NOTIFICATIONS ---
  public async getNotifications() {
    return this.request<any[]>('/notifications', { method: 'GET' });
  }

  public async markNotificationRead(id: number) {
    return this.request<any>(`/notifications/${id}/read`, { method: 'PATCH' });
  }

  public async markAllNotificationsRead() {
    return this.request<{ message: string }>('/notifications/read-all', { method: 'POST' });
  }

  // --- IA SPRINT PLANNER ---
  public async decomposeSprint(goal: string, projectId: number) {
    return this.request<{ success: boolean; tasks: any[] }>('/sprint/decompose', {
      method: 'POST',
      body: JSON.stringify({ goal, projectId }),
    });
  }
}

export const symfonyApi = new SymfonyApiClient();
