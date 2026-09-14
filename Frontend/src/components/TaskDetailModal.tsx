/**
 * =====================================================================
 * MINI-JIRA — FICHE DÉTAILLÉE D'UNE TÂCHE (TaskDetailModal)
 * =====================================================================
 * Panneau modal central pour l'inspection et la gestion d'une tâche :
 * - Onglet Détails : Modification titre, description, priorité, statut, assignation
 * - Onglet Sessions : Historique des sessions de travail horodatées et cumul réel
 * - Onglet Commit / Git : Générateur de messages de commit conventionnels (ex: feat(PROJ-101): ...)
 * - Commandes de chronomètre temps réel (Play / Stop) avec comparaison estimé vs réel
 * - Suppression sécurisée avec confirmation
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  AlertTriangle,
  Play,
  Square,
  Copy,
  Check,
  Trash2,
  GitCommit,
  History,
  FileText,
} from 'lucide-react';
import { Tache, Membre, Priorite, Statut, SessionTravail, Projet } from '../types';
import { taskService } from '../services/taskService';
import { sessionTimerService, ActiveSession } from '../services/sessionTimerService';
import { projectService } from '../services/projectService';
import { symfonyApi } from '../services/symfonyApiClient';

interface TaskDetailModalProps {
  /** Identifiant de la tâche ouverte (null si fermé) */
  taskId: number | null;
  /** Collaborateur connecté */
  currentUser: Membre;
  /** Session de chronométrage en cours */
  activeSession: ActiveSession | null;
  /** Secondes écoulées sur le chronomètre */
  elapsedSeconds: number;
  /** Fermeture de la modale */
  onClose: () => void;
  /** Sauvegarde des modifications */
  onUpdateTask: (taskId: number, updates: Partial<Tache>) => void;
  /** Suppression définitive de la tâche */
  onDeleteTask: (taskId: number) => void;
  /** Démarrage d'une session de travail */
  onStartSession: (taskId: number) => void;
  /** Arrêt de la session en cours */
  onStopSession: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  taskId,
  currentUser,
  activeSession,
  elapsedSeconds,
  onClose,
  onUpdateTask,
  onDeleteTask,
  onStartSession,
  onStopSession,
}) => {
  if (!taskId) return null;

  const [tache, setTache] = useState<Tache | null>(null);
  const [project, setProject] = useState<Projet | null>(null);
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const [sessions, setSessions] = useState<SessionTravail[]>([]);

  const [activeTab, setActiveTab] = useState<'details' | 'sessions' | 'commit'>('details');
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [priorite, setPriorite] = useState<Priorite>('MOYENNE');
  const [statut, setStatut] = useState<Statut>('A_FAIRE');
  const [membreAssigneId, setMembreAssigneId] = useState<number | null>(null);
  const [dateEcheance, setDateEcheance] = useState<string>('');
  const [tempsEstime, setTempsEstime] = useState<number>(0);

  // Commit generator state
  const [commitType, setCommitType] = useState<'feat' | 'fix' | 'refactor' | 'docs' | 'chore'>('feat');
  const [copiedCommit, setCopiedCommit] = useState(false);

  useEffect(() => {
    let isMounted = true;
    taskService.getTaskById(taskId).then((t) => {
      if (!isMounted) return;
      setTache(t);
      setTitre(t.titre);
      setDescription(t.description || '');
      setPriorite(t.priorite);
      setStatut(t.statut);
      setMembreAssigneId(t.membreAssigneId);
      setDateEcheance(t.dateEcheance || '');
      setTempsEstime(t.tempsEstime || 0);

      projectService.getProjectById(t.projetId).then((p) => {
        if (isMounted) setProject(p);
      }).catch(() => {});

      symfonyApi.getProjectDetail(t.projetId).then((detail) => {
        if (isMounted && detail?.affectations) {
          setProjectMembers(detail.affectations);
        }
      }).catch(() => {});
    }).catch(() => {});

    // Charger les sessions via l'API Symfony si endpoint disponible
    symfonyApi.request<any[]>(`/tasks/${taskId}/sessions`).then((sList) => {
      if (isMounted && Array.isArray(sList)) {
        setSessions(sList);
      }
    }).catch(() => {
      if (isMounted) setSessions([]);
    });

    return () => {
      isMounted = false;
    };
  }, [taskId]);

  if (!tache) return null;

  const isThisSessionActive = activeSession?.tacheId === taskId;
  const isOvertime = taskService.isOvertime(tache);
  const isOverdue = taskService.isOverdue(tache);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTask(taskId, {
      titre: titre.trim(),
      description: description.trim(),
      priorite,
      statut,
      membreAssigneId: membreAssigneId || null,
      dateEcheance: dateEcheance || null,
      tempsEstime: Number(tempsEstime) || 0,
    });
    onClose();
  };

  const commitMessage = taskService.generateConventionalCommit(
    { ...tache, titre },
    commitType
  );

  const handleCopyCommit = () => {
    navigator.clipboard.writeText(commitMessage);
    setCopiedCommit(true);
    setTimeout(() => setCopiedCommit(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
              MJ-{tache.id}
            </span>
            <span className="text-xs text-slate-500 font-medium truncate max-w-[240px]">
              {project?.nom}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Stopwatch CTA */}
            {isThisSessionActive ? (
              <button
                type="button"
                onClick={onStopSession}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>Arrêter ({sessionTimerService.formatDuration(elapsedSeconds)})</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onStartSession(taskId)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Démarrer session</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 border-b border-slate-200/80 flex items-center gap-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'details'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Détails & Édition</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sessions')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'sessions'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Sessions de travail ({sessions.length})</span>
            {isOvertime && (
              <span className="w-2 h-2 rounded-full bg-amber-500" title="Dépassement" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('commit')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'commit'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span>Conventional Commits (V2)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'details' && (
            <form id="task-detail-form" onSubmit={handleSave} className="space-y-4">
              {/* Overtime & Overdue Alerts */}
              {isOvertime && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Alerte dépassement :</span> Le temps passé ({tache.tempsReel} min) a dépassé l'estimation initiale ({tache.tempsEstime} min).
                  </div>
                </div>
              )}

              {isOverdue && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
                  <Calendar className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Échéance dépassée :</span> La date prévue ({tache.dateEcheance}) est échue.
                  </div>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Titre de la tâche
                </label>
                <input
                  type="text"
                  required
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  className="w-full text-sm font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-indigo-500 outline-hidden transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description & critères d'acceptation
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez les objectifs, contraintes et étapes de réalisation..."
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:border-indigo-500 outline-hidden transition-colors leading-relaxed"
                />
              </div>

              {/* Row: Status & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Statut</label>
                  <select
                    value={statut}
                    onChange={(e) => setStatut(e.target.value as Statut)}
                    className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-hidden focus:border-indigo-500"
                  >
                    <option value="A_FAIRE">À faire</option>
                    <option value="EN_COURS">En cours</option>
                    <option value="TERMINE">Terminé</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priorité</label>
                  <select
                    value={priorite}
                    onChange={(e) => setPriorite(e.target.value as Priorite)}
                    className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-hidden focus:border-indigo-500"
                  >
                    <option value="BASSE">Basse</option>
                    <option value="MOYENNE">Moyenne</option>
                    <option value="HAUTE">Haute</option>
                  </select>
                </div>
              </div>

              {/* Row: Assignee & Due date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigné à</label>
                  <select
                    value={membreAssigneId ?? ''}
                    onChange={(e) =>
                      setMembreAssigneId(e.target.value ? Number(e.target.value) : null)
                    }
                    className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-hidden focus:border-indigo-500"
                  >
                    <option value="">-- Non assigné --</option>
                    {projectMembers.map((item: any) => {
                      const m = item.membre || item.user || item;
                      const role = item.role || item.affectation?.role || 'MEMBRE';
                      return (
                        <option key={m.id} value={m.id}>
                          {m.nom || m.email} ({role})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date d’échéance
                  </label>
                  <input
                    type="date"
                    value={dateEcheance}
                    onChange={(e) => setDateEcheance(e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Row: Temps estimé & Temps réel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Temps estimé (minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="15"
                    value={tempsEstime}
                    onChange={(e) => setTempsEstime(Number(e.target.value))}
                    className="w-full text-xs font-mono font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Temps réel cumulé (minutes)
                  </label>
                  <div className="flex items-center justify-between px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800">
                    <span>{tache.tempsReel} min ({Math.round(tache.tempsReel / 60 * 10) / 10}h)</span>
                    <span className="text-[10px] text-slate-400 font-sans font-normal">
                      Calculé via sessions
                    </span>
                  </div>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'sessions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Historique des sessions de travail</h4>
                  <p className="text-xs text-slate-500">
                    Enregistrements de chronométrage associés à cette tâche.
                  </p>
                </div>

                <div className="text-xs font-mono font-bold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">
                  Total : {tache.tempsReel} min
                </div>
              </div>

              {sessions.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                  Aucune session de travail enregistrée pour cette tâche.
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => onStartSession(taskId)}
                      className="text-xs font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" /> Lancer le chronomètre
                    </button>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {sessions.map((s: any) => (
                    <div
                      key={s.id}
                      className="p-3 bg-white flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div>
                          <span className="font-semibold text-slate-800">
                            Membre #{s.membreId || s.user?.id || 'Inconnu'}
                          </span>
                          <div className="text-[10px] text-slate-400">
                            Début : {new Date(s.dateDebut).toLocaleString('fr-FR')}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-800">
                          +{s.dureeMinutes || 0} min
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'commit' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Générateur de message Conventional Commits
                </h4>
                <p className="text-xs text-slate-500">
                  Formate automatiquement un message standardisé avec la référence de la tâche.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Type de commit
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {(['feat', 'fix', 'refactor', 'docs', 'chore'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setCommitType(type)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all ${
                        commitType === type
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Message généré
                </label>
                <div className="relative">
                  <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                    {commitMessage}
                  </pre>
                  <button
                    type="button"
                    onClick={handleCopyCommit}
                    className="absolute top-2 right-2 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-medium flex items-center gap-1 transition-colors"
                  >
                    {copiedCommit ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copier</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Voulez-vous vraiment supprimer cette tâche ?')) {
                onDeleteTask(taskId);
                onClose();
              }
            }}
            className="px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Supprimer</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              Fermer
            </button>
            <button
              type="submit"
              form="task-detail-form"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
            >
              Enregistrer les modifications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
