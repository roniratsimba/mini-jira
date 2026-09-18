import React, { useState } from 'react';
import { X, FolderPlus, AlertCircle } from 'lucide-react';
import { Membre, Projet } from '../types';
import { projectService } from '../services/projectService';
import { generateProjectCode } from '../utils/projectCode';
interface CreateProjectModalProps {
  currentUser: Membre;
  onClose: () => void;
  onProjectCreated: (newProject: Projet) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  currentUser,
  onClose,
  onProjectCreated,
}) => {
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nom.trim()) {
      setError('Le nom du projet est obligatoire.');
      return;
    }

    try {
      const code = generateProjectCode(nom.trim()); // ex: "REFONTE-DASH-X7K2"
      const proj = await projectService.createProject(nom.trim(), description.trim(), code);
      onProjectCreated(proj);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du projet.');
    }
  };
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FolderPlus className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Créer un nouveau projet</h3>
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
            <label className="block text-xs font-bold text-slate-700 mb-1">Nom du projet *</label>
            <input
              type="text"
              required
              placeholder="Ex: Refonte Dashboard Client..."
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-indigo-500 outline-hidden transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description & Objectifs
            </label>
            <textarea
              rows={3}
              placeholder="Décrivez les enjeux principaux et les livrables attendus..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:border-indigo-500 outline-hidden transition-colors"
            />
          </div>

          <div className="p-3 bg-indigo-50/60 rounded-xl text-[11px] text-indigo-900 border border-indigo-100">
            ℹ️ En créant ce projet, vous en devenez automatiquement <strong>ADMINISTRATEUR</strong> avec tous les droits de gestion et d'invitation.
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
              Créer le projet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
