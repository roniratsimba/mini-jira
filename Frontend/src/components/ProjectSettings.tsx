import React, { useState } from 'react';
import { Settings, Trash2, AlertTriangle, Shield, Check } from 'lucide-react';
import { Projet, Membre } from '../types';
import { projectService } from '../services/projectService';

interface ProjectSettingsProps {
  projet: Projet;
  currentUser: Membre;
  onProjectUpdated: () => void;
  onProjectDeleted: () => void;
}

export const ProjectSettings: React.FC<ProjectSettingsProps> = ({
  projet,
  currentUser,
  onProjectUpdated,
  onProjectDeleted,
}) => {
  const [nom, setNom] = useState(projet.nom);
  const [description, setDescription] = useState(projet.description || '');
  const [confirmName, setConfirmName] = useState('');
  const [savedMessage, setSavedMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const role = projectService.getUserRoleInProject(projet.id, currentUser.id);
  const isAdmin = role === 'ADMIN';

  if (!isAdmin) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-lg mx-auto space-y-3">
        <Shield className="w-8 h-8 text-amber-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">Accès restreint</h3>
        <p className="text-xs text-slate-500">
          Seul un administrateur du projet a les droits nécessaires pour accéder aux paramètres et à la suppression.
        </p>
      </div>
    );
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      projectService.updateProject(projet.id, nom, description, currentUser.id);
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 2500);
      onProjectUpdated();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur lors de la mise à jour.');
    }
  };

  const handleDelete = () => {
    if (confirmName !== projet.nom) {
      setErrorMessage('Le nom saisi pour confirmation ne correspond pas au nom du projet.');
      return;
    }

    try {
      projectService.deleteProject(projet.id, currentUser.id);
      onProjectDeleted();
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur lors de la suppression.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Messages */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {savedMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Paramètres du projet enregistrés avec succès.</span>
        </div>
      )}

      {/* General Settings */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">Informations générales</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Modifier le nom et la description du projet visible par tous les collaborateurs.
          </p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nom du projet</label>
            <input
              type="text"
              required
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full text-sm font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-indigo-500 outline-hidden transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description du projet
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:border-indigo-500 outline-hidden transition-colors"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
            >
              Enregistrer les modifications
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone: Delete Project */}
      <div className="bg-rose-50/50 rounded-2xl border border-rose-200 p-6 space-y-4">
        <div className="border-b border-rose-200/60 pb-3 flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-rose-600" />
          <h3 className="text-sm font-bold text-rose-900">Zone de danger : Supprimer le projet</h3>
        </div>

        <p className="text-xs text-rose-700 leading-relaxed">
          La suppression de ce projet entraînera la suppression définitive en cascade de toutes les tâches associées, affectations, invitations et sessions de travail enregistrées. Cette action est irréversible.
        </p>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-rose-800">
            Saisissez <span className="underline font-mono">{projet.nom}</span> pour confirmer :
          </label>
          <input
            type="text"
            placeholder={projet.nom}
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            className="w-full text-xs px-3 py-2 bg-white border border-rose-300 rounded-lg text-slate-900 outline-hidden focus:border-rose-500"
          />
        </div>

        <button
          type="button"
          onClick={handleDelete}
          disabled={confirmName !== projet.nom}
          className="w-full py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-xs"
        >
          Supprimer définitivement ce projet
        </button>
      </div>
    </div>
  );
};
