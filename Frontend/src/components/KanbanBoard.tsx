/**
 * =====================================================================
 * MINI-JIRA — TABLEAU KANBAN INTERACTIF (KanbanBoard)
 * =====================================================================
 * Vue centrale agile inspirée de Jira/Trello :
 * - 3 Colonnes de statut : À FAIRE (Backlog), EN COURS (WIP), TERMINÉ (Done)
 * - Glisser-déposer HTML5 natif (Drag & Drop) fluide avec retour visuel d'accroche
 * - Recherche instantanée sur titres/descriptions et filtrage par priorité
 * - Prise en charge des alertes de retard et intégration directe du chronomètre
 */

import React, { useState } from 'react';
import { Plus, Search, Filter, Clock, CheckCircle2, CircleDashed, PlayCircle } from 'lucide-react';
import { Projet, Statut, Priorite, Tache, Membre } from '../types';
import { taskService } from '../services/taskService';
import { TaskCard } from './TaskCard';
import { ActiveSession } from '../services/sessionTimerService';

interface KanbanBoardProps {
  /** Projet actif en consultation */
  projet: Projet;
  /** Utilisateur authentifié */
  currentUser: Membre;
  /** Session de chronométrage en cours (si active) */
  activeSession: ActiveSession | null;
  /** Ouvre le panneau modal de détails d'une tâche */
  onOpenTaskDetail: (taskId: number) => void;
  /** Ouvre le modal de création d'une tâche avec pré-sélection d'une colonne */
  onOpenCreateTask: (defaultStatus?: Statut) => void;
  /** Démarre le chronométrage sur une tâche */
  onStartSession: (taskId: number) => void;
  /** Stoppe la session de chronomètre active */
  onStopSession: () => void;
  /** Transitionne le statut d'une tâche (A_FAIRE -> EN_COURS -> TERMINE) */
  onStatusChange: (taskId: number, newStatus: Statut) => void;
  /** Filtre initial optionnel transmis depuis le tableau de bord (ex: 'RETARD') */
  initialFilter?: string;
}

/** Configuration des colonnes Kanban avec leurs styles et icônes sémantiques */
const COLUMNS: Array<{ id: Statut; label: string; icon: any; color: string; badgeBg: string }> = [
  {
    id: 'A_FAIRE',
    label: 'À faire',
    icon: CircleDashed,
    color: 'text-slate-600',
    badgeBg: 'bg-slate-100 text-slate-700',
  },
  {
    id: 'EN_COURS',
    label: 'En cours',
    icon: PlayCircle,
    color: 'text-indigo-600',
    badgeBg: 'bg-indigo-50 text-indigo-700',
  },
  {
    id: 'TERMINE',
    label: 'Terminé',
    icon: CheckCircle2,
    color: 'text-emerald-600',
    badgeBg: 'bg-emerald-50 text-emerald-700',
  },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  projet,
  currentUser,
  activeSession,
  onOpenTaskDetail,
  onOpenCreateTask,
  onStartSession,
  onStopSession,
  onStatusChange,
  initialFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<Priorite | 'ALL'>('ALL');
  const [dragOverColumn, setDragOverColumn] = useState<Statut | null>(null);

  const allTasks = taskService.getTasksForProject(projet.id);

  // Filter tasks
  const filteredTasks = allTasks.filter((t) => {
    if (initialFilter === 'RETARD') {
      if (!taskService.isOverdue(t)) return false;
    } else if (initialFilter && initialFilter !== 'ALL' && initialFilter !== t.statut) {
      // If clicked from dashboard status button
      // Allow user to reset or view
    }

    if (priorityFilter !== 'ALL' && t.priorite !== priorityFilter) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return t.titre.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
    }
    return true;
  });

  const handleDragOver = (e: React.DragEvent, colId: Statut) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== colId) {
      setDragOverColumn(colId);
    }
  };

  const handleDragLeave = (colId: Statut) => {
    if (dragOverColumn === colId) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: Statut) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskIdStr = e.dataTransfer.getData('text/plain');
    if (!taskIdStr) return;
    const taskId = parseInt(taskIdStr, 10);
    if (taskId) {
      onStatusChange(taskId, targetStatus);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filtrer les tâches du Kanban..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-200/80 text-slate-800 placeholder-slate-400 outline-hidden focus:border-indigo-400 focus:bg-white transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-medium hidden sm:inline">Priorité:</span>
            <select
              aria-label="Filtrer par priorité"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="text-xs bg-slate-50 border border-slate-200/80 rounded-lg px-2 py-1 text-slate-700 outline-hidden cursor-pointer"
            >
              <option value="ALL">Toutes les priorités</option>
              <option value="HAUTE">Haute</option>
              <option value="MOYENNE">Moyenne</option>
              <option value="BASSE">Basse</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {initialFilter === 'RETARD' && (
            <span className="text-xs font-semibold px-2 py-1 rounded bg-rose-100 text-rose-800 border border-rose-200">
              Filtre: En retard
            </span>
          )}
          <button
            onClick={() => onOpenCreateTask()}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-2xs flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter une tâche</span>
          </button>
        </div>
      </div>

      {/* 3 Kanban Columns with Drag & Drop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.statut === col.id);
          const totalEstimatedMinutes = colTasks.reduce((acc, t) => acc + (t.tempsEstime || 0), 0);
          const isDraggingOver = dragOverColumn === col.id;
          const IconComponent = col.icon;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={() => handleDragLeave(col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`rounded-2xl border transition-colors flex flex-col min-h-[580px] ${
                isDraggingOver
                  ? 'bg-indigo-50/60 border-indigo-300 ring-2 ring-indigo-200'
                  : 'bg-slate-100/70 border-slate-200/80'
              }`}
            >
              {/* Column Header */}
              <div className="p-4 flex items-center justify-between border-b border-slate-200/50">
                <div className="flex items-center gap-2">
                  <IconComponent className={`w-4 h-4 ${col.color}`} />
                  <h3 className="text-sm font-bold text-slate-800">{col.label}</h3>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${col.badgeBg}`}
                  >
                    {colTasks.length}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-mono text-slate-400" title="Temps estimé total">
                    {Math.round(totalEstimatedMinutes / 60)}h
                  </span>
                  <button
                    onClick={() => onOpenCreateTask(col.id)}
                    className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-white transition-colors"
                    title={`Ajouter une tâche dans ${col.label}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Cards Container */}
              <div className="p-3 flex-1 space-y-3 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center text-slate-400 text-xs border-2 border-dashed border-slate-200 rounded-xl p-4 text-center">
                    <span>Glissez un ticket ici</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">ou cliquez sur + pour créer</span>
                  </div>
                ) : (
                  colTasks.map((tache) => (
                    <TaskCard
                      key={tache.id}
                      tache={tache}
                      onClick={() => onOpenTaskDetail(tache.id)}
                      onStartSession={onStartSession}
                      onStopSession={onStopSession}
                      isSessionActive={activeSession?.tacheId === tache.id}
                      currentUser={currentUser}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
