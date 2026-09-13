/**
 * =====================================================================
 * MINI-JIRA — PLANIFICATEUR DE SPRINT IA (SprintPlannerAI)
 * =====================================================================
 * Module d'assistance intelligente propulsé par Gemini 2.5 Flash via proxy sécurisé :
 * - Décompose un objectif de sprint en user stories actionnables
 * - Évalue les priorités et estime le temps prévisionnel (en minutes)
 * - Permet l'intégration sélective (1 par 1) ou l'injection groupée dans le Kanban
 * - Fallback heuristique automatique garanti en cas d'indisponibilité réseau
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Check,
  Plus,
  ArrowRight,
  Clock,
  Layers,
  AlertCircle,
  Loader2,
  ListPlus,
} from 'lucide-react';
import { Projet, Priorite, Tache } from '../types';
import { taskService } from '../services/taskService';

interface SprintPlannerAIProps {
  /** Projet de destination pour les tâches décomposées */
  projet: Projet;
  /** Callback invoqué après l'ajout de tâches pour rafraîchir le tableau Kanban */
  onTasksAdded: () => void;
}

/** Tâche prévisionnelle générée par le modèle d'IA */
interface GeneratedTask {
  titre: string;
  description: string;
  priorite: Priorite;
  tempsEstime: number;
}

export const SprintPlannerAI: React.FC<SprintPlannerAIProps> = ({ projet, onTasksAdded }) => {
  const [sprintGoal, setSprintGoal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<GeneratedTask[]>([]);
  const [addedTaskIndices, setAddedTaskIndices] = useState<number[]>([]);
  const [source, setSource] = useState<string | null>(null);

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setGeneratedTasks([]);
    setAddedTaskIndices([]);

    try {
      const response = await fetch('/api/sprint-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectTitle: projet.nom,
          projectDescription: projet.description,
          sprintGoal: sprintGoal.trim() || 'Livrer les fonctionnalités prioritaires du sprint',
        }),
      });

      const data = await response.json();
      if (data.tasks && Array.isArray(data.tasks)) {
        setGeneratedTasks(data.tasks);
        setSource(data.source);
      }
    } catch (error) {
      console.error('Failed to generate sprint plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTask = (task: GeneratedTask, index: number) => {
    taskService.createTask({
      projetId: projet.id,
      titre: task.titre,
      description: task.description,
      priorite: task.priorite || 'MOYENNE',
      statut: 'A_FAIRE',
      dateEcheance: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
      tempsEstime: task.tempsEstime || 120,
      membreAssigneId: null,
    });

    setAddedTaskIndices((prev) => [...prev, index]);
    onTasksAdded();
  };

  const handleAddAllTasks = () => {
    generatedTasks.forEach((task, index) => {
      if (!addedTaskIndices.includes(index)) {
        handleAddTask(task, index);
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 p-6 rounded-2xl border border-indigo-100 shadow-2xs">
        <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Sprint Planner Intelligent (Version 3)</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Générateur automatique de backlog & estimations
        </h2>
        <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
          Décrivez l'objectif de votre prochain sprint ou une fonctionnalité clé. Le moteur d'analyse logicielle découpera le travail en user stories concrètes avec estimations de temps en minutes.
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <form onSubmit={handleGeneratePlan} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Objectif du Sprint ou Fonctionnalité à découper
            </label>
            <textarea
              rows={3}
              placeholder="Ex: Refonte du tunnel d'authentification avec vérification à deux facteurs et notification par e-mail..."
              value={sprintGoal}
              onChange={(e) => setSprintGoal(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:border-indigo-500 outline-hidden transition-colors leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Projet cible : <strong className="text-slate-700">{projet.nom}</strong>
            </span>

            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors shadow-xs flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Génération en cours...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Générer les tâches du sprint</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {generatedTasks.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Tâches proposées ({generatedTasks.length})
              </h3>
              <p className="text-xs text-slate-500">
                Ajoutez les tickets directement dans la colonne « À faire » du Kanban.
              </p>
            </div>

            {addedTaskIndices.length < generatedTasks.length && (
              <button
                onClick={handleAddAllTasks}
                className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <ListPlus className="w-3.5 h-3.5" />
                <span>Tout ajouter au Kanban</span>
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100">
            {generatedTasks.map((t, index) => {
              const isAdded = addedTaskIndices.includes(index);

              return (
                <div
                  key={index}
                  className="py-3.5 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-800 truncate">
                        {t.titre}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          t.priorite === 'HAUTE'
                            ? 'bg-rose-50 text-rose-700'
                            : t.priorite === 'MOYENNE'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {t.priorite}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2">{t.description}</p>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Estimé : {t.tempsEstime} min ({Math.round(t.tempsEstime / 60)}h)</span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isAdded ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                        <Check className="w-3.5 h-3.5" />
                        <span>Ajouté</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAddTask(t, index)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Ajouter</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
