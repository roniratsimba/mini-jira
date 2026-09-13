import React from 'react';
import { Clock, Calendar, AlertCircle, Play, Square, User } from 'lucide-react';
import { Tache, Membre } from '../types';
import { taskService } from '../services/taskService';
import { sessionTimerService } from '../services/sessionTimerService';
import { db } from '../services/mockDatabase';

interface TaskCardProps {
  tache: Tache;
  onClick: () => void;
  onStartSession: (tacheId: number) => void;
  onStopSession: () => void;
  isSessionActive: boolean;
  currentUser: Membre;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  tache,
  onClick,
  onStartSession,
  onStopSession,
  isSessionActive,
  currentUser,
}) => {
  const assignee = tache.membreAssigneId ? db.getMembreById(tache.membreAssigneId) : null;
  const isOverdue = taskService.isOverdue(tache);
  const isOvertime = taskService.isOvertime(tache);

  const priorityColors = {
    HAUTE: 'bg-rose-50 text-rose-700 border-rose-200/80',
    MOYENNE: 'bg-amber-50 text-amber-700 border-amber-200/80',
    BASSE: 'bg-slate-100 text-slate-700 border-slate-200/80',
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', tache.id.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={onClick}
      className={`group relative bg-white p-4 rounded-xl border transition-all duration-150 cursor-grab active:cursor-grabbing hover:shadow-md ${
        isSessionActive
          ? 'border-rose-400 ring-2 ring-rose-100'
          : 'border-slate-200/80 hover:border-indigo-300'
      }`}
    >
      {/* Active Session Ribbon */}
      {isSessionActive && (
        <div className="flex items-center gap-1.5 mb-2 px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
          <span>Chronomètre en cours...</span>
        </div>
      )}

      {/* Top row: ID & Priority */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[11px] font-mono font-bold text-slate-400">
          MJ-{tache.id}
        </span>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            priorityColors[tache.priorite]
          }`}
        >
          {tache.priorite}
        </span>
      </div>

      {/* Title */}
      <h4 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug mb-2">
        {tache.titre}
      </h4>

      {/* Description preview if exists */}
      {tache.description && (
        <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
          {tache.description}
        </p>
      )}

      {/* Badges / Metrics Row */}
      <div className="flex items-center flex-wrap gap-2 text-xs mb-3">
        {/* Due date */}
        {tache.dateEcheance && (
          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium ${
              isOverdue
                ? 'bg-rose-50 text-rose-700 font-bold border border-rose-200'
                : 'bg-slate-100 text-slate-600'
            }`}
            title={isOverdue ? 'Échéance dépassée !' : 'Date d’échéance'}
          >
            <Calendar className="w-3 h-3" />
            {tache.dateEcheance}
          </span>
        )}

        {/* Time Tracked */}
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium font-mono ${
            isOvertime
              ? 'bg-amber-50 text-amber-800 border border-amber-200 font-bold'
              : 'bg-slate-50 text-slate-600 border border-slate-200/50'
          }`}
          title={
            isOvertime
              ? `Temps réel (${tache.tempsReel}m) supérieur à l'estimé (${tache.tempsEstime}m)`
              : 'Temps réel / estimé'
          }
        >
          <Clock className="w-3 h-3" />
          {tache.tempsReel}m / {tache.tempsEstime}m
          {isOvertime && <span className="text-amber-600 font-bold">⚠️</span>}
        </span>
      </div>

      {/* Footer: Assignee & Quick Timer trigger */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        {/* Assignee info */}
        {assignee ? (
          <div className="flex items-center gap-1.5 text-xs text-slate-700">
            <img
              src={assignee.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${assignee.nom}`}
              alt={assignee.nom}
              className="w-5 h-5 rounded-full object-cover border border-slate-200"
            />
            <span className="text-xs font-medium max-w-[100px] truncate">{assignee.nom}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-xs text-slate-400 italic">
            <User className="w-3.5 h-3.5" />
            <span>Non assigné</span>
          </div>
        )}

        {/* Stopwatch toggle button */}
        <div onClick={(e) => e.stopPropagation()}>
          {isSessionActive ? (
            <button
              onClick={onStopSession}
              className="p-1 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium flex items-center gap-1 transition-colors px-2"
              title="Arrêter la session en cours"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Arrêter</span>
            </button>
          ) : (
            <button
              onClick={() => onStartSession(tache.id)}
              className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 text-xs font-medium transition-colors"
              title="Démarrer le chronomètre pour cette tâche"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
