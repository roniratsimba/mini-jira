import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  FolderKanban,
  UserPlus,
  AlertTriangle,
  Clock,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { Notification, NotificationType, Membre } from '../types';
import { symfonyApi } from '../services/symfonyApiClient';

interface NotificationsPanelProps {
  currentUser: Membre;
  onSelectTask: (taskId: number) => void;
  onSelectProject: (projectId: number) => void;
  onRefresh: () => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  currentUser,
  onSelectTask,
  onSelectProject,
  onRefresh,
}) => {
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    symfonyApi.getNotifications().then((data) => {
      setNotifications(data);
    });
  }, [currentUser.id]);

  const filtered = filterUnreadOnly ? notifications.filter((n) => !n.lu) : notifications;
  const unreadCount = notifications.filter((n) => !n.lu).length;

  const handleMarkAllRead = async () => {
    await symfonyApi.markAllNotificationsRead();
    onRefresh();
  };

  const handleNotificationClick = async (n: Notification) => {
    if (!n.lu) {
      await symfonyApi.markNotificationRead(n.id);
      onRefresh();
    }
    if (n.referenceType === 'TACHE' && n.referenceId) {
      onSelectTask(n.referenceId);
    } else if (n.referenceType === 'PROJET' && n.referenceId) {
      onSelectProject(n.referenceId);
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'TACHE_TERMINEE':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'TACHE_ASSIGNEE':
      case 'TACHE_STATUT_CHANGE':
        return <CheckCircle2 className="w-4 h-4 text-indigo-600" />;
      case 'INVITATION_RECUE':
      case 'INVITATION_ACCEPTEE':
      case 'MEMBRE_AJOUTE':
        return <UserPlus className="w-4 h-4 text-purple-600" />;
      case 'ALERTE_TEMPS_DEPASSE':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'PROJET_CREE':
        return <FolderKanban className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Centre de notifications
            </h1>
            {unreadCount > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white">
                {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Notifications in-app sur les assignations, changements d'état et invitations.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              filterUnreadOnly
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {filterUnreadOnly ? 'Afficher toutes' : 'Non lues uniquement'}
          </button>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Tout marquer comme lu</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Bell className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-700">Aucune notification</h4>
            <p className="text-xs max-w-sm mx-auto">
              {filterUnreadOnly
                ? 'Toutes vos notifications ont été lues.'
                : 'Vous n’avez aucune notification pour l’instant.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((n) => {
              const dateStr = new Date(n.dateCreation).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-4 flex items-start justify-between gap-4 transition-colors cursor-pointer ${
                    n.lu ? 'bg-white hover:bg-slate-50/70' : 'bg-indigo-50/30 hover:bg-indigo-50/60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                      {getIcon(n.type)}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">{n.titre}</span>
                        {!n.lu && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                      <span className="text-[10px] text-slate-400 block">{dateStr}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {n.referenceId && (
                      <span className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                        <span>Voir</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
