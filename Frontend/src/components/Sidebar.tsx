import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  CheckSquare,
  Bell,
  Plus,
  KeyRound,
  LogOut,
  Settings,
  X,
} from 'lucide-react';
import { Membre, Projet } from '../types';
import { projectService } from '../services/projectService';
import { UserAvatar } from './UserAvatar';

interface SidebarProps {
  currentUser: Membre;
  currentView: 'projects' | 'project-detail' | 'individual-dashboard' | 'notifications' | 'deliverables' | 'account-settings';
  currentProject: Projet | null;
  unreadCount: number;
  onNavigate: (view: 'projects' | 'individual-dashboard' | 'notifications' | 'deliverables' | 'account-settings') => void;
  onOpenCreateProject: () => void;
  onOpenJoinProject: () => void;
  onOpenProfileSettings?: () => void;
  onLogout: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  currentView,
  currentProject,
  unreadCount,
  onNavigate,
  onOpenCreateProject,
  onOpenJoinProject,
  onLogout,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const [projectCount, setProjectCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    projectService.getProjectsForUser().then((projects) => {
      if (isMounted) {
        setProjectCount(projects.length);
      }
    }).catch(() => {
      if (isMounted) setProjectCount(0);
    });

    return () => {
      isMounted = false;
    };
  }, [currentUser.id]);

  return (
    <>
      {/* Backdrop for mobile drawer */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 flex flex-col h-screen shrink-0 select-none transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm shadow-indigo-200">
              <FolderKanban className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-semibold text-slate-900 tracking-tight text-base block leading-tight">
                Mini-Jira
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Workspace Collaboratif</span>
            </div>
          </div>

          {/* Close button on mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1 text-slate-400 hover:text-slate-700 md:hidden rounded-lg hover:bg-slate-100"
              title="Fermer le menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Current User Profile Card & Settings Action */}
        <div className="p-3 mx-3 my-3 bg-slate-50/90 rounded-xl border border-slate-200/70">
          <div className="flex items-center gap-2.5">
            <UserAvatar
              nom={currentUser.nom}
              avatarUrl={currentUser.avatarUrl}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-800 truncate">{currentUser.nom}</div>
              <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
            </div>
          </div>

          {/* Secure Profile Settings trigger */}
          <div className="mt-2.5 pt-2 border-t border-slate-200/60">
            <button
              onClick={() => {
                onNavigate('account-settings');
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white hover:bg-indigo-50/80 text-slate-700 hover:text-indigo-700 border border-slate-200/80 text-xs font-semibold transition-colors group"
              title="Modifier mes informations, photo ou supprimer mon compte"
            >
              <div className="flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                <span>Modifier mon profil</span>
              </div>
              <span className="text-[10px] text-slate-400 group-hover:text-indigo-600 font-normal">Paramètres</span>
            </button>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          <div className="text-[10px] uppercase font-semibold text-slate-400 px-2 py-1 tracking-wider">
            Espace de travail
          </div>

          <button
            onClick={() => {
              onNavigate('projects');
              if (onCloseMobile) onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'projects' || currentView === 'project-detail'
                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FolderKanban className="w-4 h-4 text-indigo-600" />
              <span>Mes Projets</span>
            </div>
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
              {projectCount}
            </span>
          </button>

          <button
            onClick={() => {
              onNavigate('individual-dashboard');
              if (onCloseMobile) onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'individual-dashboard'
                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              <span>Suivi individuel</span>
            </div>
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold">
              Mes tâches
            </span>
          </button>

          <button
            onClick={() => {
              onNavigate('notifications');
              if (onCloseMobile) onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'notifications'
                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-amber-500" />
              <span>Notifications</span>
            </div>
            {unreadCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              onNavigate('account-settings');
              if (onCloseMobile) onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'account-settings'
                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Settings className="w-4 h-4 text-slate-500" />
              <span>Paramètres du compte</span>
            </div>
          </button>

          {/* Quick actions */}
          <div className="pt-4 text-[10px] uppercase font-semibold text-slate-400 px-2 py-1 tracking-wider">
            Actions rapides
          </div>

          <button
            onClick={() => {
              onOpenCreateProject();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Créer un projet</span>
          </button>

          <button
            onClick={() => {
              onOpenJoinProject();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5 text-slate-400" />
            <span>Rejoindre via code</span>
          </button>
        </nav>

        {/* Footer / Logout */}
        <div className="p-3 border-t border-slate-200/80 bg-slate-50/50">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
};
