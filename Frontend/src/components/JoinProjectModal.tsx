import React, { useState } from 'react';
import { X, KeyRound, AlertCircle } from 'lucide-react';
import { Membre, Projet } from '../types';
import { projectService } from '../services/projectService';

interface JoinProjectModalProps {
  currentUser: Membre;
  onClose: () => void;
  onProjectJoined: (joinedProject: Projet) => void;
}

export const JoinProjectModal: React.FC<JoinProjectModalProps> = ({
  currentUser,
  onClose,
  onProjectJoined,
}) => {
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token.trim()) {
      setError('Veuillez renseigner le code d\'invitation.');
      return;
    }

    try {
      // console.log('1. Avant appel joinProject');
      const joinedProject = await projectService.joinProject(token.trim());
      // console.log('2. Projet rejoint reçu:', joinedProject);
      onProjectJoined(joinedProject);
      // console.log('3. onProjectJoined appelé');
      onClose();
      // console.log('4. onClose appelé');
    } catch (err: any) {
      console.log('ERREUR CATCHÉE:', err);
      setError(err.message || 'Code d\'invitation non valide ou expiré.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Rejoindre un projet</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleJoin} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Code d’invitation du projet
            </label>
            <input
              type="text"
              required
              placeholder="Ex: PROJ-CODE"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full text-xs font-mono font-bold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 outline-hidden transition-colors tracking-wider"
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
              Valider le code et rejoindre
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
