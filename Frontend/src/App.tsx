/**
 * =====================================================================
 * MINI-JIRA — COMPOSANT RACINE & ROUTEUR DE VUES (App.tsx)
 * =====================================================================
 * Orchestre l'état global et la navigation sans rechargement de page :
 * - Navigation : Liste Projets, Détail Projet, Tableau de Bord Individuel, Notifications, Livrables
 * - Onglets Projet : Dashboard KPI, Tableau Kanban interactif, Membres & Invitations, Planificateur IA, Paramètres
 * - Chronométrage unifié : Écouteur global sur SessionTimerService
 * - Authentification : Abonnement au service AuthService avec synchronisation immédiate
 * - Gestion modale : Création/rejoindre projet, création tâche, fiche détaillée tâche, cahier des charges
 */

import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  Kanban,
  Users,
  Settings,
  Sparkles,
  Layers,
  ArrowLeft,
  Plus,
} from 'lucide-react';
import { Membre, Projet, Statut, Tache } from './types';
import { authService } from './services/authService';
import { projectService } from './services/projectService';
import { taskService } from './services/taskService';
import { sessionTimerService, ActiveSession } from './services/sessionTimerService';

import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ProjectsList } from './components/ProjectsList';
import { ProjectDashboard } from './components/ProjectDashboard';
import { KanbanBoard } from './components/KanbanBoard';
import { MembersAndInvitations } from './components/MembersAndInvitations';
import { ProjectSettings } from './components/ProjectSettings';
import { IndividualDashboard } from './components/IndividualDashboard';
import { NotificationsPanel } from './components/NotificationsPanel';
import { SprintPlannerAI } from './components/SprintPlannerAI';
import { TaskDetailModal } from './components/TaskDetailModal';
import { CreateProjectModal } from './components/CreateProjectModal';
import { JoinProjectModal } from './components/JoinProjectModal';
import { CreateTaskModal } from './components/CreateTaskModal';
import { DeliverablesModal } from './components/DeliverablesModal';
import { AuthModal } from './components/AuthModal';
import { LandingPage } from './pages/LandingPage';
import { AccountSettingsPage } from './pages/AccountSettingsPage';

export default function App() {
  const [currentUser, setCurrentUser] = useState<Membre | null>(authService.getCurrentUser());
  const [currentView, setCurrentView] = useState<
    'projects' | 'project-detail' | 'individual-dashboard' | 'notifications' | 'deliverables' | 'landing' | 'account-settings'
  >('projects');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(1); // Default to project 1
  const [projectTab, setProjectTab] = useState<
    'dashboard' | 'kanban' | 'members' | 'planner' | 'settings'
  >('dashboard');
  const [kanbanFilter, setKanbanFilter] = useState<string | undefined>(undefined);

  // Auth modal state for unauthenticated landing page interaction
  const [authModalState, setAuthModalState] = useState<{ isOpen: boolean; tab: 'login' | 'register' }>({
    isOpen: false,
    tab: 'login',
  });

  // Mobile sidebar drawer state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Active Stopwatch state
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(
    sessionTimerService.getActiveSession()
  );
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(
    sessionTimerService.getElapsedSeconds()
  );

  // Modals state
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isJoinProjectOpen, setIsJoinProjectOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [createTaskDefaultStatus, setCreateTaskDefaultStatus] = useState<Statut>('A_FAIRE');

  // Trigger re-render upon database writes
  const [, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  // Subscribe to AuthService and SessionTimerService
  useEffect(() => {
    const unsubAuth = authService.subscribe((user) => {
      setCurrentUser(user);
      triggerRefresh();
    });

    const unsubTimer = sessionTimerService.subscribe((session, seconds) => {
      setActiveSession(session);
      setElapsedSeconds(seconds);
    });

    return () => {
      unsubAuth();
      unsubTimer();
    };
  }, []);

  // Load project data when selectedProjectId changes
  useEffect(() => {
    if (selectedProjectId && currentUser) {
      projectService.getProjectById(selectedProjectId).then((project) => {
        setCurrentProject(project);
        projectService.getUserRoleInProject(selectedProjectId).then((role) => {
          setUserRole(role);
        });
      });
    }
  }, [selectedProjectId, currentUser]);

  if (!currentUser) {
    return (
      <>
        <LandingPage
          isAuthenticated={false}
          onLoginClick={() => setAuthModalState({ isOpen: true, tab: 'login' })}
          onRegisterClick={() => setAuthModalState({ isOpen: true, tab: 'register' })}
        />
        {authModalState.isOpen && (
          <AuthModal
            initialTab={authModalState.tab}
            onSuccess={() => {
              setAuthModalState({ isOpen: false, tab: 'login' });
              triggerRefresh();
            }}
            onClose={() => setAuthModalState({ isOpen: false, tab: 'login' })}
          />
        )}
      </>
    );
  }

  // If logged-in user explicitly visits the public marketing landing page
  if (currentView === 'landing') {
    return (
      <LandingPage
        isAuthenticated={true}
        onEnterApp={() => setCurrentView('projects')}
        onLoginClick={() => setCurrentView('projects')}
        onRegisterClick={() => setCurrentView('projects')}
      />
    );
  }

  const [currentProject, setCurrentProject] = useState<Projet | null>(null);
  const [userRole, setUserRole] = useState<'ADMIN' | 'MEMBRE' | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleSelectProject = (projectId: number) => {
    setSelectedProjectId(projectId);
    setCurrentView('project-detail');
    setProjectTab('dashboard');
    setKanbanFilter(undefined);
  };

  const handleNavigateToKanban = (filter?: string) => {
    setKanbanFilter(filter);
    setProjectTab('kanban');
  };

  const handleStartSession = (taskId: number) => {
    sessionTimerService.startSession(taskId, currentUser.id);
    triggerRefresh();
  };

  const handleStopSession = () => {
    sessionTimerService.stopSession();
    triggerRefresh();
  };

  const handleStatusChange = (taskId: number, newStatus: Statut) => {
    taskService.changeStatus(taskId, newStatus, currentUser.id);
    triggerRefresh();
  };

  const handleUpdateTask = (taskId: number, updates: Partial<Tache>) => {
    taskService.updateTask(taskId, updates, currentUser.id);
    triggerRefresh();
  };

  const handleDeleteTask = (taskId: number) => {
    taskService.deleteTask(taskId);
    triggerRefresh();
  };

  const handleResetData = () => {
    if (window.confirm('Voulez-vous réinitialiser toutes les données de la base à l’état d’origine ?')) {
      // Backend mode - no reset functionality
      sessionTimerService.stopSession();
      setSelectedProjectId(1);
      setCurrentView('projects');
      triggerRefresh();
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8F9FB] text-slate-800">
      {/* Permanent / Responsive Sidebar */}
      <Sidebar
        currentUser={currentUser}
        currentView={currentView as any}
        currentProject={currentProject}
        unreadCount={unreadCount}
        onNavigate={(view) => {
          setCurrentView(view);
          if (view === 'projects') setSelectedProjectId(null);
        }}
        onOpenCreateProject={() => setIsCreateProjectOpen(true)}
        onOpenJoinProject={() => setIsJoinProjectOpen(true)}
        onOpenProfileSettings={() => setCurrentView('account-settings')}
        onLogout={() => authService.logout()}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          currentUser={currentUser}
          currentView={currentView as any}
          currentProject={currentProject}
          activeProjectTab={currentView === 'project-detail' ? projectTab : undefined}
          activeSession={activeSession}
          elapsedSeconds={elapsedSeconds}
          unreadCount={unreadCount}
          onOpenNotifications={() => setCurrentView('notifications')}
          onStopSession={handleStopSession}
          onOpenTaskDetail={(taskId) => setSelectedTaskId(taskId)}
          onNavigateToProjects={() => {
            setCurrentView('projects');
            setSelectedProjectId(null);
          }}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
          onOpenProfileSettings={() => setCurrentView('account-settings')}
        />

        {/* Dynamic Center Area */}
        <main className="flex-1 overflow-y-auto">
          {/* 1. Projects List View */}
          {currentView === 'projects' && (
            <ProjectsList
              currentUser={currentUser}
              onSelectProject={handleSelectProject}
              onOpenCreateProject={() => setIsCreateProjectOpen(true)}
              onOpenJoinProject={() => setIsJoinProjectOpen(true)}
            />
          )}

          {/* 2. Individual Dashboard View */}
          {currentView === 'individual-dashboard' && (
            <IndividualDashboard
              currentUser={currentUser}
              activeSession={activeSession}
              onOpenTaskDetail={(taskId) => setSelectedTaskId(taskId)}
              onStartSession={handleStartSession}
              onStopSession={handleStopSession}
              onStatusChange={handleStatusChange}
            />
          )}

          {/* 3. Notifications Panel */}
          {currentView === 'notifications' && (
            <NotificationsPanel
              currentUser={currentUser}
              onSelectTask={async (taskId) => {
                setSelectedTaskId(taskId);
                try {
                  const t = await taskService.getTaskById(taskId);
                  if (t) {
                    setSelectedProjectId(t.projetId);
                    setCurrentView('project-detail');
                  }
                } catch (error) {
                  console.error('Erreur lors de la récupération de la tâche:', error);
                }
              }}
              onSelectProject={(projectId) => {
                handleSelectProject(projectId);
              }}
              onRefresh={triggerRefresh}
            />
          )}

          {/* 4. Page Paramètres du compte */}
          {currentView === 'account-settings' && (
            <AccountSettingsPage
              currentUser={currentUser}
              onBack={() => {
                setCurrentView('projects');
                setSelectedProjectId(null);
              }}
              onAccountDeleted={() => {
                authService.logout();
                setCurrentView('landing');
                triggerRefresh();
              }}
              onUserUpdated={(updatedMembre) => {
                setCurrentUser(updatedMembre);
                triggerRefresh();
              }}
            />
          )}

          {/* 5. Deliverables & Specifications View */}
          {currentView === 'deliverables' && <DeliverablesModal />}

          {/* 5. Project Detail View */}
          {currentView === 'project-detail' && currentProject && (
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
              {/* Project Sub-Navigation Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 gap-3">
                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  <button
                    onClick={() => {
                      setCurrentView('projects');
                      setSelectedProjectId(null);
                    }}
                    className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg mr-1 shrink-0 transition-colors"
                    title="Retour à la liste des projets"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setProjectTab('dashboard')}
                    className={`py-3 px-3 text-xs font-semibold border-b-2 shrink-0 transition-colors flex items-center gap-1.5 ${
                      projectTab === 'dashboard'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Tableau de bord</span>
                  </button>

                  <button
                    onClick={() => {
                      setProjectTab('kanban');
                      setKanbanFilter(undefined);
                    }}
                    className={`py-3 px-3 text-xs font-semibold border-b-2 shrink-0 transition-colors flex items-center gap-1.5 ${
                      projectTab === 'kanban'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Kanban className="w-3.5 h-3.5" />
                    <span>Vue Kanban</span>
                  </button>

                  <button
                    onClick={() => setProjectTab('members')}
                    className={`py-3 px-3 text-xs font-semibold border-b-2 shrink-0 transition-colors flex items-center gap-1.5 ${
                      projectTab === 'members'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Membres & Invitations</span>
                  </button>

                  <button
                    onClick={() => setProjectTab('planner')}
                    className={`py-3 px-3 text-xs font-semibold border-b-2 shrink-0 transition-colors flex items-center gap-1.5 ${
                      projectTab === 'planner'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Sprint Planner (IA V3)</span>
                  </button>

                  {userRole === 'ADMIN' && (
                    <button
                      onClick={() => setProjectTab('settings')}
                      className={`py-3 px-3 text-xs font-semibold border-b-2 shrink-0 transition-colors flex items-center gap-1.5 ${
                        projectTab === 'settings'
                          ? 'border-indigo-600 text-indigo-600'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Paramètres</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-end pb-2 sm:pb-0">
                  <button
                    onClick={() => {
                      setCreateTaskDefaultStatus('A_FAIRE');
                      setIsCreateTaskOpen(true);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nouvelle tâche</span>
                  </button>
                </div>
              </div>

              {/* Sub-tab views */}
              {projectTab === 'dashboard' && (
                <ProjectDashboard
                  projet={currentProject}
                  currentUser={currentUser}
                  onNavigateToKanban={handleNavigateToKanban}
                  onOpenTaskDetail={(taskId) => setSelectedTaskId(taskId)}
                  onOpenCreateTask={() => {
                    setCreateTaskDefaultStatus('A_FAIRE');
                    setIsCreateTaskOpen(true);
                  }}
                />
              )}

              {projectTab === 'kanban' && (
                <KanbanBoard
                  projet={currentProject}
                  currentUser={currentUser}
                  activeSession={activeSession}
                  initialFilter={kanbanFilter}
                  onOpenTaskDetail={(taskId) => setSelectedTaskId(taskId)}
                  onOpenCreateTask={(colStatus) => {
                    setCreateTaskDefaultStatus(colStatus || 'A_FAIRE');
                    setIsCreateTaskOpen(true);
                  }}
                  onStartSession={handleStartSession}
                  onStopSession={handleStopSession}
                  onStatusChange={handleStatusChange}
                />
              )}

              {projectTab === 'members' && (
                <MembersAndInvitations
                  projet={currentProject}
                  currentUser={currentUser}
                  onRefresh={triggerRefresh}
                />
              )}

              {projectTab === 'planner' && (
                <SprintPlannerAI projet={currentProject} onTasksAdded={triggerRefresh} />
              )}

              {projectTab === 'settings' && (
                <ProjectSettings
                  projet={currentProject}
                  currentUser={currentUser}
                  onProjectUpdated={triggerRefresh}
                  onProjectDeleted={() => {
                    setSelectedProjectId(null);
                    setCurrentView('projects');
                    triggerRefresh();
                  }}
                />
              )}
            </div>
          )}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          currentUser={currentUser}
          activeSession={activeSession}
          elapsedSeconds={elapsedSeconds}
          onClose={() => setSelectedTaskId(null)}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onStartSession={handleStartSession}
          onStopSession={handleStopSession}
        />
      )}

      {isCreateProjectOpen && (
        <CreateProjectModal
          currentUser={currentUser}
          onClose={() => setIsCreateProjectOpen(false)}
          onProjectCreated={(newProj) => {
            handleSelectProject(newProj.id);
            triggerRefresh();
          }}
        />
      )}

      {isJoinProjectOpen && (
        <JoinProjectModal
          currentUser={currentUser}
          onClose={() => setIsJoinProjectOpen(false)}
          onProjectJoined={(joinedProj) => {
            handleSelectProject(joinedProj.id);
            triggerRefresh();
          }}
        />
      )}

      {isCreateTaskOpen && currentProject && (
        <CreateTaskModal
          projet={currentProject}
          currentUser={currentUser}
          defaultStatus={createTaskDefaultStatus}
          onClose={() => setIsCreateTaskOpen(false)}
          onTaskCreated={() => triggerRefresh()}
        />
      )}
    </div>
  );
}
