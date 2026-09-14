import React, { useState, useEffect } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { Projet, Statut, Priorite, Tache, Membre } from '../types';
import { taskService } from '../services/taskService';
import { projectService } from '../services/projectService';

interface CreateTaskModalProps {
  projet: Projet;
  currentUser: Membre;
  defaultStatus?: Statut;
  onClose: () => void;
  onTaskCreated: (newTask: Tache) => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  projet,
  currentUser,
  defaultStatus = 'A_FAIRE',
  onClose,
  onTaskCreated,
}) => {
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [priorite, setPriorite] = useState<Priorite>('MOYENNE');
  const [statut, setStatut] = useState<Statut>(defaultStatus);
  const [membreAssigneId, setMembreAssigneId] = useState<number | null>(currentUser.id);
  const [dateEcheance, setDateEcheance] = useState<string>(
    new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [tempsEstime, setTempsEstime] = useState<number>(120);
  const [error, setError] = useState<string | null>(null);
  const [projectMembers, setProjectMembers] = useState<any[]>([]);

  useEffect(() => {
    projectService.getProjectDetailedStats(projet.id).then(() => {
      // We'll need to get the members from the project detail
      projectService.getProjectById(projet.id).then((project) => {
        // For now, we'll use the current user as available member
        setProjectMembers([{ id: currentUser.id, nom: currentUser.nom }]);
      });
    });
  }, [projet.id, currentUser.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!titre.trim()) {
      setError('Le titre de la tâche est obligatoire.');
      return;
    }

    try {
      const created = await taskService.createTask(projet.id, {
        titre: titre.trim(),
        description: description.trim(),
        priorite,
        statut,
        tempsEstime: Number(tempsEstime) || 0,
        assigneIds: membreAssigneId ? [membreAssigneId] : [],
      });

      onTaskCreated(created);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de la tâche.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Ajouter une nouvelle tâche</h3>
            <span className="text-xs text-slate-400">Projet: {projet.nom}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Titre de la tâche *</label>
            <input
              type="text"
              required
              placeholder="Ex: Conception de l'architecture microservices..."
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-indigo-500 outline-hidden transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description / Spécification
            </label>
            <textarea
              rows={3}
              placeholder="Critères d'acceptation et détails techniques..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:border-indigo-500 outline-hidden transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Statut initial</label>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assigner à</label>
              <select
                value={membreAssigneId ?? ''}
                onChange={(e) =>
                  setMembreAssigneId(e.target.value ? Number(e.target.value) : null)
                }
                className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-hidden focus:border-indigo-500"
              >
                <option value="">-- Non assigné --</option>
                {projectMembers.map(({ membre, affectation }) => (
                  <option key={membre.id} value={membre.id}>
                    {membre.nom} ({affectation.role})
                  </option>
                ))}
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

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Temps estimé (en minutes)
            </label>
            <input
              type="number"
              min="15"
              step="15"
              value={tempsEstime}
              onChange={(e) => setTempsEstime(Number(e.target.value))}
              className="w-full text-xs font-mono font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
            >
              Créer la tâche
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
