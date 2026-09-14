import React, { useState, useEffect } from 'react';
import {
  Bell,
  Square,
  ChevronRight,
  FolderKanban,
  Menu,
} from 'lucide-react';
import { Membre, Projet, Tache } from '../types';
import { ActiveSession, sessionTimerService } from '../services/sessionTimerService';
import { taskService } from '../services/taskService';
import { UserAvatar } from './UserAvatar';

interface HeaderProps {
  currentUser: Membre;
  currentView: 'projects' | 'project-detail' | 'individual-dashboard' | 'notifications' | 'deliverables' | 'account-settings';
  currentProject: Projet | null;
  activeProjectTab?: string;
  activeSession: ActiveSession | null;
  elapsedSeconds: number;
  unreadCount: number;
  onOpenNotifications: () => void;
  onStopSession: () => void;
  onOpenTaskDetail: (taskId: number) => void;
  onNavigateToProjects: () => void;
  onToggleMobileSidebar?: () => void;
  onOpenProfileSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  currentView,
  currentProject,
  activeProjectTab,
  activeSession,
  elapsedSeconds,
  unreadCount,
  onOpenNotifications,
  onStopSession,
  onOpenTaskDetail,
  onNavigateToProjects,
  onToggleMobileSidebar,
  onOpenProfileSettings,
}) => {
  const [activeTask, setActiveTask] = useState<Tache | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (activeSession?.tacheId) {
      taskService.getTaskById(activeSession.tacheId).then((task) => {
        if (isMounted) setActiveTask(task);
      }).catch(() => {
        if (isMounted) setActiveTask(null);
      });
    } else {
      setActiveTask(null);
    }
    return () => {
      isMounted = false;
    };
  }, [activeSession?.tacheId]);

  return (
    <header className="h-14 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shrink-0 z-10">
      {/* Mobile menu trigger & Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-3 text-sm text-slate-500 font-medium">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="p-1.5 -ml-1.5 md:hidden text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            title="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={onNavigateToProjects}
          className="hover:text-indigo-600 transition-colors flex items-center gap-1.5"
        >
          <FolderKanban className="w-4 h-4 text-slate-400" />
          <span>Projets</span>
        </button>

        {currentProject && currentView === 'project-detail' && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-800 font-semibold max-w-[200px] truncate">
              {currentProject.nom}
            </span>
            {activeProjectTab && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-indigo-600 font-medium capitalize">
                  {activeProjectTab === 'dashboard'
                    ? 'Tableau de bord'
                    : activeProjectTab === 'kanban'
                    ? 'Vue Kanban'
                    : activeProjectTab === 'members'
                    ? 'Membres & Invitations'
                    : activeProjectTab === 'planner'
                    ? 'Sprint Planner IA'
                    : 'Paramètres'}
                </span>
              </>
            )}
          </>
        )}

        {currentView === 'individual-dashboard' && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-800 font-semibold">Tableau de suivi individuel</span>
          </>
        )}

        {currentView === 'notifications' && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-800 font-semibold">Centre de notifications</span>
          </>
        )}

        {currentView === 'deliverables' && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-800 font-semibold">Spécifications & Schéma SQL PFE</span>
          </>
        )}

        {currentView === 'account-settings' && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-800 font-semibold">Paramètres du compte</span>
          </>
        )}
      </div>

      {/* Right controls: Live Stopwatch & Notifications */}
      <div className="flex items-center gap-3">
        {/* Active Timer Pill */}
        {activeSession && activeTask && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-200/80 rounded-full shadow-xs animate-in fade-in duration-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <button
              onClick={() => onOpenTaskDetail(activeTask.id)}
              className="text-xs font-semibold text-rose-900 hover:underline max-w-[140px] truncate"
              title={activeTask.titre}
            >
              #{activeTask.id} {activeTask.titre}
            </button>
            <span className="text-xs font-mono font-bold text-rose-600">
              {sessionTimerService.formatDuration(elapsedSeconds)}
            </span>
            <button
              onClick={onStopSession}
              className="p-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white transition-colors ml-1"
              title="Arrêter et enregistrer la session"
            >
              <Square className="w-3 h-3 fill-current" />
            </button>
          </div>
        )}

        {/* Notifications Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User Identity Pill */}
        <button
          type="button"
          onClick={onOpenProfileSettings}
          className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 hover:opacity-80 transition-opacity text-left"
          title="Gérer mon profil"
        >
          <UserAvatar
            nom={currentUser.nom}
            avatarUrl={currentUser.avatarUrl}
            size="xs"
          />
          <div className="text-left">
            <div className="text-xs font-semibold text-slate-800 leading-tight">
              {currentUser.nom}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Gérer mon profil</div>
          </div>
        </button>
      </div>
    </header>
  );
};
