import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Search,
  Filter,
  Play,
  Square,
  Calendar,
  Clock,
  AlertTriangle,
  FolderKanban,
  CheckCircle2,
  CircleDashed,
  PlayCircle,
} from 'lucide-react';
import { Membre, Tache, Statut, Priorite, Projet } from '../types';
import { taskService } from '../services/taskService';
import { sessionTimerService, ActiveSession } from '../services/sessionTimerService';
import { projectService } from '../services/projectService';

interface IndividualDashboardProps {
  currentUser: Membre;
  activeSession: ActiveSession | null;
  onOpenTaskDetail: (taskId: number) => void;
  onStartSession: (taskId: number) => void;
  onStopSession: () => void;
  onStatusChange: (taskId: number, newStatus: Statut) => void;
}

export const IndividualDashboard: React.FC<IndividualDashboardProps> = ({
  currentUser,
  activeSession,
  onOpenTaskDetail,
  onStartSession,
  onStopSession,
  onStatusChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<number | 'ALL'>('ALL');
  const [selectedStatut, setSelectedStatut] = useState<Statut | 'ALL'>('ALL');
  const [selectedPriorite, setSelectedPriorite] = useState<Priorite | 'ALL'>('ALL');
  const [myProjects, setMyProjects] = useState<Projet[]>([]);
  const [tasks, setTasks] = useState<Tache[]>([]);

  useEffect(() => {
    projectService.getProjectsForUser().then((projects) => {
      setMyProjects(projects.map(p => p.projet));
    });
  }, [currentUser.id]);

  useEffect(() => {
    taskService.getTasksForMember(currentUser.id, {
      projetId: selectedProject === 'ALL' ? undefined : selectedProject,
      statut: selectedStatut,
      priorite: selectedPriorite,
      search: searchTerm,
    }).then(setTasks);
  }, [currentUser.id, selectedProject, selectedStatut, selectedPriorite, searchTerm]);

  const totalAssigned = tasks.length;
  const completed = tasks.filter((t) => t.statut === 'TERMINE').length;
  const inProgress = tasks.filter((t) => t.statut === 'EN_COURS').length;
  const todo = tasks.filter((t) => t.statut === 'A_FAIRE').length;

  const totalEstimated = tasks.reduce((acc, t) => acc + (t.tempsEstime || 0), 0);
  const totalReal = tasks.reduce((acc, t) => acc + (t.tempsReel || 0), 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Tableau de suivi individuel
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {currentUser.nom}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Visualisez et gérez toutes les tâches qui vous sont assignées à travers l’ensemble de vos projets.
          </p>
        </div>

        {/* Quick summary stats */}
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-center px-3 border-r border-slate-100">
            <span className="text-xs text-slate-400 block font-medium">À faire</span>
            <span className="text-sm font-bold text-slate-800">{todo}</span>
          </div>
          <div className="text-center px-3 border-r border-slate-100">
            <span className="text-xs text-slate-400 block font-medium">En cours</span>
            <span className="text-sm font-bold text-indigo-600">{inProgress}</span>
          </div>
          <div className="text-center px-3">
            <span className="text-xs text-slate-400 block font-medium">Terminées</span>
            <span className="text-sm font-bold text-emerald-600">{completed}</span>
          </div>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par titre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 outline-hidden focus:bg-white focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Project Filter */}
          <div>
            <select
              aria-label="Filtrer par projet"
              value={selectedProject}
              onChange={(e) =>
                setSelectedProject(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
              }
              className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-hidden focus:border-indigo-500"
            >
              <option value="ALL">Tous les projets</option>
                {myProjects.map((projet) => (
                  <option key={projet.id} value={projet.id}>
                    {projet.nom}
                  </option>
                ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              aria-label="Filtrer par statut"
              value={selectedStatut}
              onChange={(e) => setSelectedStatut(e.target.value as any)}
              className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-hidden focus:border-indigo-500"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="A_FAIRE">À faire</option>
              <option value="EN_COURS">En cours</option>
              <option value="TERMINE">Terminé</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              aria-label="Filtrer par priorité"
              value={selectedPriorite}
              onChange={(e) => setSelectedPriorite(e.target.value as any)}
              className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-hidden focus:border-indigo-500"
            >
              <option value="ALL">Toutes les priorités</option>
              <option value="HAUTE">Haute</option>
              <option value="MOYENNE">Moyenne</option>
              <option value="BASSE">Basse</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-100">
          <span>Tri automatique : Priorité (Haute → Basse) puis Date d’échéance</span>
          <span className="font-medium text-slate-600">
            {tasks.length} tâche{tasks.length > 1 ? 's' : ''} trouvée{tasks.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Task List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {tasks.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <CheckSquare className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-700">Aucune tâche assignée</h4>
            <p className="text-xs max-w-sm mx-auto">
              Vous n’avez aucune tâche correspondant aux critères actuels.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Tâche & Projet</th>
                  <th className="p-4">Priorité</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4">Échéance</th>
                  <th className="p-4">Temps (Réel / Estimé)</th>
                  <th className="p-4 text-right">Action Chrono</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.map((t) => {
                  const proj = myProjects.find(p => p.id === t.projetId);
                  const isOverdue = taskService.isOverdue(t);
                  const isOvertime = taskService.isOvertime(t);
                  const isRunning = activeSession?.tacheId === t.id;

                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      onClick={() => onOpenTaskDetail(t.id)}
                    >
                      {/* Title & Project */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-400 font-semibold shrink-0">
                            MJ-{t.id}
                          </span>
                          <span className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {t.titre}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <FolderKanban className="w-3 h-3 text-slate-400" />
                          <span>{proj?.nom}</span>
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="p-4">
                        <span
                          className={`inline-block font-bold text-[10px] px-2 py-0.5 rounded-full ${
                            t.priorite === 'HAUTE'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : t.priorite === 'MOYENNE'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {t.priorite}
                        </span>
                      </td>

                      {/* Status with quick selector */}
                      <td className="p-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          aria-label="Changer le statut de la tâche"
                          value={t.statut}
                          onChange={(e) => onStatusChange(t.id, e.target.value as Statut)}
                          className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 font-medium text-slate-700 outline-hidden hover:border-indigo-400 cursor-pointer"
                        >
                          <option value="A_FAIRE">À faire</option>
                          <option value="EN_COURS">En cours</option>
                          <option value="TERMINE">Terminé</option>
                        </select>
                      </td>

                      {/* Due Date */}
                      <td className="p-4">
                        {t.dateEcheance ? (
                          <span
                            className={`inline-flex items-center gap-1 font-medium ${
                              isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'
                            }`}
                          >
                            <Calendar className="w-3 h-3" />
                            {t.dateEcheance}
                            {isOverdue && <span className="text-[10px]">(Retard)</span>}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Non définie</span>
                        )}
                      </td>

                      {/* Time real / estimate */}
                      <td className="p-4 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-semibold ${
                              isOvertime ? 'text-amber-700 font-bold' : 'text-slate-700'
                            }`}
                          >
                            {t.tempsReel}m
                          </span>
                          <span className="text-slate-400">/ {t.tempsEstime}m</span>
                          {isOvertime && (
                            <span
                              className="text-amber-600 text-xs"
                              title="Dépassement du temps estimé"
                            >
                              ⚠️
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stopwatch action */}
                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        {isRunning ? (
                          <button
                            onClick={onStopSession}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold flex items-center gap-1 transition-colors ml-auto shadow-xs"
                            title="Arrêter la session en cours"
                          >
                            <Square className="w-3 h-3 fill-current" />
                            <span>Arrêter</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onStartSession(t.id)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-lg font-semibold flex items-center gap-1 transition-colors ml-auto border border-slate-200/80"
                            title="Démarrer le chronomètre pour cette tâche"
                          >
                            <Play className="w-3 h-3 fill-current text-slate-400 group-hover:text-indigo-600" />
                            <span>Chrono</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
