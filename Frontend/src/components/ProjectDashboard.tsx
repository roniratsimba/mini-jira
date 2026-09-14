import React, { useState, useEffect } from 'react';
import {
  Clock,
  AlertCircle,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Projet, Tache, Membre } from '../types';
import { projectService, ProjectDetailedStats } from '../services/projectService';
import { taskService } from '../services/taskService';

interface ProjectDashboardProps {
  projet: Projet;
  currentUser: Membre;
  onNavigateToKanban: (statusFilter?: string) => void;
  onOpenTaskDetail: (taskId: number) => void;
  onOpenCreateTask: () => void;
}

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
  projet,
  currentUser,
  onNavigateToKanban,
  onOpenTaskDetail,
  onOpenCreateTask,
}) => {
  const [stats, setStats] = useState<ProjectDetailedStats>({
    total: 0,
    aFaire: 0,
    enCours: 0,
    termine: 0,
    avancementPct: 0,
    tachesEnRetard: 0,
    tempsEstimeTotal: 0,
    tempsReelTotal: 0,
    isOvertime: false,
  });
  const [taches, setTaches] = useState<Tache[]>([]);

  useEffect(() => {
    let isMounted = true;
    projectService.getProjectDetailedStats(projet.id).then((res) => {
      if (isMounted) setStats(res);
    }).catch(() => {});

    taskService.getTasksForProject(projet.id).then((res) => {
      if (isMounted) setTaches(res);
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [projet.id]);

  // Recent / High priority tasks
  const priorityTasks = [...taches].sort((a, b) => {
    if (a.priorite === 'HAUTE' && b.priorite !== 'HAUTE') return -1;
    if (b.priorite === 'HAUTE' && a.priorite !== 'HAUTE') return 1;
    return b.id - a.id;
  }).slice(0, 5);

  const formatHours = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
              Projet #{projet.id}
            </span>
            <span className="text-xs text-slate-400">Créé le {projet.dateCreation}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">{projet.nom}</h2>
          <p className="text-sm text-slate-500 mt-0.5 max-w-2xl">
            {projet.description || 'Suivi des indicateurs de performance, état du sprint et allocation du temps.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigateToKanban()}
            className="px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <span>Ouvrir Kanban</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>
          <button
            onClick={onOpenCreateTask}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs shadow-indigo-200 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle tâche</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div
          onClick={() => onNavigateToKanban('ALL')}
          className="bg-white p-5 rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-xs cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Tâches</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{stats.total}</span>
            <span className="text-xs text-slate-500 font-medium">tickets actifs</span>
          </div>
          <div className="mt-3 text-[11px] text-indigo-600 font-medium flex items-center gap-1">
            <span>Voir tout le tableau</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* Global Progress % */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avancement Global</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{stats.avancementPct}%</span>
            <span className="text-xs text-emerald-600 font-medium font-semibold">
              {stats.termine}/{stats.total} terminées
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${stats.avancementPct}%` }}
            />
          </div>
        </div>

        {/* Overdue Tasks Alert */}
        <div
          onClick={() => onNavigateToKanban('RETARD')}
          className={`p-5 rounded-xl border cursor-pointer transition-all ${
            stats.tachesEnRetard > 0
              ? 'bg-rose-50/50 border-rose-200 hover:border-rose-400'
              : 'bg-white border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tâches en retard
            </span>
            <AlertCircle
              className={`w-4 h-4 ${stats.tachesEnRetard > 0 ? 'text-rose-600' : 'text-slate-400'}`}
            />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold ${
                stats.tachesEnRetard > 0 ? 'text-rose-700' : 'text-slate-900'
              }`}
            >
              {stats.tachesEnRetard}
            </span>
            <span className="text-xs text-slate-500 font-medium">échéance dépassée</span>
          </div>
          <div
            className={`mt-3 text-[11px] font-medium ${
              stats.tachesEnRetard > 0 ? 'text-rose-600' : 'text-slate-400'
            }`}
          >
            {stats.tachesEnRetard > 0 ? 'Action requise sur le Kanban' : 'Aucun retard détecté'}
          </div>
        </div>

        {/* Temps Estimé vs Réel */}
        <div
          className={`p-5 rounded-xl border ${
            stats.isOvertime ? 'bg-amber-50/50 border-amber-200' : 'bg-white border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Temps Réel / Estimé</span>
            <Clock
              className={`w-4 h-4 ${stats.isOvertime ? 'text-amber-600' : 'text-slate-500'}`}
            />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-2xl font-bold ${stats.isOvertime ? 'text-amber-800' : 'text-slate-900'}`}
            >
              {formatHours(stats.tempsReelTotal)}
            </span>
            <span className="text-xs text-slate-400">/ {formatHours(stats.tempsEstimeTotal)}</span>
          </div>
          <div className="mt-3 text-[11px] font-medium flex items-center justify-between">
            <span className={stats.isOvertime ? 'text-amber-700 font-semibold' : 'text-slate-500'}>
              {stats.isOvertime ? '⚠️ Dépassement d’estimation' : 'Sous contrôle'}
            </span>
            <span className="text-slate-400">
              {stats.tempsEstimeTotal > 0
                ? `${Math.round((stats.tempsReelTotal / stats.tempsEstimeTotal) * 100)}%`
                : '0%'}
            </span>
          </div>
        </div>
      </div>

      {/* Status Breakdown Bar & Cards */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Répartition par statut</h3>

        {/* Multi-segment visual bar */}
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
          {stats.total > 0 ? (
            <>
              <div
                style={{ width: `${(stats.aFaire / stats.total) * 100}%` }}
                className="bg-slate-400 transition-all duration-300"
                title={`À faire: ${stats.aFaire}`}
              />
              <div
                style={{ width: `${(stats.enCours / stats.total) * 100}%` }}
                className="bg-indigo-500 transition-all duration-300"
                title={`En cours: ${stats.enCours}`}
              />
              <div
                style={{ width: `${(stats.termine / stats.total) * 100}%` }}
                className="bg-emerald-500 transition-all duration-300"
                title={`Terminé: ${stats.termine}`}
              />
            </>
          ) : (
            <div className="w-full bg-slate-100" />
          )}
        </div>

        {/* 3 Clickable status filter blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <button
            onClick={() => onNavigateToKanban('A_FAIRE')}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span className="text-xs font-semibold text-slate-700">À faire</span>
            </div>
            <div className="text-xs font-bold text-slate-900">
              {stats.aFaire}{' '}
              <span className="text-slate-400 font-normal">
                ({stats.total > 0 ? Math.round((stats.aFaire / stats.total) * 100) : 0}%)
              </span>
            </div>
          </button>

          <button
            onClick={() => onNavigateToKanban('EN_COURS')}
            className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-200/60 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span className="text-xs font-semibold text-indigo-900">En cours</span>
            </div>
            <div className="text-xs font-bold text-indigo-900">
              {stats.enCours}{' '}
              <span className="text-indigo-400 font-normal">
                ({stats.total > 0 ? Math.round((stats.enCours / stats.total) * 100) : 0}%)
              </span>
            </div>
          </button>

          <button
            onClick={() => onNavigateToKanban('TERMINE')}
            className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 hover:bg-emerald-50 border border-emerald-200/60 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-emerald-900">Terminé</span>
            </div>
            <div className="text-xs font-bold text-emerald-900">
              {stats.termine}{' '}
              <span className="text-emerald-400 font-normal">
                ({stats.total > 0 ? Math.round((stats.termine / stats.total) * 100) : 0}%)
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Priority & Recent Tasks Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Tâches prioritaires et récentes</h3>
            <p className="text-xs text-slate-500 mt-0.5">Tickets nécessitant une attention immédiate</p>
          </div>
          <button
            onClick={() => onNavigateToKanban()}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>Voir toutes les tâches ({taches.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {priorityTasks.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            Aucune tâche dans ce projet pour le moment.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {priorityTasks.map((t) => {
              const isOverdue = taskService.isOverdue(t);

              return (
                <div
                  key={t.id}
                  onClick={() => onOpenTaskDetail(t.id)}
                  className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono font-medium text-slate-400 shrink-0">
                      #{t.id}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-800 truncate hover:text-indigo-600 transition-colors">
                        {t.titre}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span
                          className={`font-semibold px-1.5 py-0.5 rounded ${
                            t.priorite === 'HAUTE'
                              ? 'bg-rose-50 text-rose-700'
                              : t.priorite === 'MOYENNE'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {t.priorite}
                        </span>
                        <span>•</span>
                        <span className="capitalize">{t.statut.replace('_', ' ').toLowerCase()}</span>
                        {t.dateEcheance && (
                          <>
                            <span>•</span>
                            <span className={isOverdue ? 'text-rose-600 font-bold' : ''}>
                              Échéance: {t.dateEcheance} {isOverdue && '(En retard)'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    {t.membreAssigneId ? (
                      <span className="text-xs font-medium text-slate-600">
                        Membre #{t.membreAssigneId}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Non assigné</span>
                    )}

                    <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      {t.tempsReel}m / {t.tempsEstime}m
                    </span>
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
