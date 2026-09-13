import React, { useState, useRef } from 'react';
import {
  User,
  Mail,
  Lock,
  Camera,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Shield,
  Save,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { Membre } from '../types';
import { authService } from '../services/authService';
import { UserAvatar } from '../components/UserAvatar';

interface AccountSettingsPageProps {
  currentUser: Membre;
  onBack: () => void;
  onAccountDeleted: () => void;
  onUserUpdated?: (updated: Membre) => void;
}

const SUGGESTED_AVATARS = [
  { label: 'Professionnel 1', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80' },
  { label: 'Professionnel 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
  { label: 'Professionnel 3', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' },
  { label: 'Professionnel 4', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80' },
  { label: 'Professionnel 5', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80' },
];

export const AccountSettingsPage: React.FC<AccountSettingsPageProps> = ({
  currentUser,
  onBack,
  onAccountDeleted,
  onUserUpdated,
}) => {
  const [nom, setNom] = useState(currentUser.nom);
  const [email, setEmail] = useState(currentUser.email);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');

  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status & Feedback
  const [infoSuccess, setInfoSuccess] = useState<string | null>(null);
  const [infoError, setInfoError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle local image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setInfoError('Veuillez sélectionner un fichier image valide (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setInfoError('L’image est trop volumineuse. Taille maximale recommandée : 2 Mo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatarUrl(result);
      setInfoError(null);
    };
    reader.readAsDataURL(file);
  };

  // Remove photo -> resets to empty Facebook-style default silhouette
  const handleRemovePhoto = () => {
    setAvatarUrl('');
    setInfoSuccess('Photo retirée. La silhouette neutre par défaut sera utilisée.');
    setTimeout(() => setInfoSuccess(null), 4000);
  };

  // Save profile information
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setInfoError(null);
    setInfoSuccess(null);

    if (!nom.trim()) {
      setInfoError('Le nom ne peut pas être vide.');
      return;
    }

    if (!email.trim()) {
      setInfoError("L'adresse email ne peut pas être vide.");
      return;
    }

    try {
      const updated = authService.updateProfile({
        nom: nom.trim(),
        email: email.trim(),
        avatarUrl: avatarUrl.trim(),
      });
      if (onUserUpdated) onUserUpdated(updated);
      setInfoSuccess('Vos informations de profil ont été enregistrées avec succès.');
      setTimeout(() => setInfoSuccess(null), 4000);
    } catch (err: any) {
      setInfoError(err.message || 'Erreur lors de l’enregistrement du profil.');
    }
  };

  // Save password
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Le nouveau mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('La confirmation ne correspond pas au nouveau mot de passe.');
      return;
    }

    try {
      authService.updateProfile({
        oldPassword,
        newPassword,
      });
      setPasswordSuccess('Votre mot de passe a été mis à jour avec succès.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(null), 4000);
    } catch (err: any) {
      setPasswordError(err.message || 'Erreur lors du changement de mot de passe.');
    }
  };

  // Confirm delete account
  const handleConfirmDelete = () => {
    if (deleteConfirmationText !== 'SUPPRIMER') {
      setDeleteError('Veuillez taper exactement SUPPRIMER pour confirmer.');
      return;
    }

    try {
      authService.deleteAccount();
      setIsDeleteModalOpen(false);
      onAccountDeleted();
    } catch (err: any) {
      setDeleteError(err.message || 'Erreur lors de la suppression du compte.');
    }
  };

  return (
    <div className="min-h-full bg-slate-50/70 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation / Header */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-2xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour aux projets</span>
          </button>
          <span className="text-xs font-medium text-slate-400">ID Compte #{currentUser.id}</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Paramètres du compte</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gérez vos informations personnelles, votre photo de profil et la sécurité de votre compte.
          </p>
        </div>

        {/* Section 1: Photo de profil */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Camera className="w-4 h-4 text-indigo-600" />
              <span>Photo de profil</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cette photo est visible par vos collaborateurs sur les tâches, projets et commentaires.
              Par défaut, une silhouette neutre est affichée si aucune photo n'est choisie.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Visual Preview */}
            <div className="relative">
              <UserAvatar nom={nom} avatarUrl={avatarUrl} size="2xl" />
              {!avatarUrl && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[10px] font-medium bg-slate-100 border border-slate-300 text-slate-600 rounded-full whitespace-nowrap shadow-2xs">
                  Silhouette par défaut
                </span>
              )}
            </div>

            {/* Photo Action Controls */}
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Choisir une photo</span>
                </button>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-rose-200 text-xs font-semibold transition-colors"
                    title="Supprimer la photo et revenir à la silhouette par défaut"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Supprimer la photo</span>
                  </button>
                )}
              </div>

              <div className="text-[11px] text-slate-400">
                Formats acceptés : JPG, PNG, WebP. Taille maximale : 2 Mo.
              </div>

              {/* Suggestions d'avatars professionnels */}
              <div className="pt-2">
                <div className="text-[11px] font-medium text-slate-500 mb-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Ou choisir un avatar suggéré :</span>
                </div>
                <div className="flex items-center gap-2">
                  {SUGGESTED_AVATARS.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(sug.url)}
                      className={`relative rounded-full transition-transform hover:scale-110 ${
                        avatarUrl === sug.url ? 'ring-2 ring-indigo-600 ring-offset-2' : 'opacity-80 hover:opacity-100'
                      }`}
                      title={sug.label}
                    >
                      <img
                        src={sug.url}
                        alt={sug.label}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-2xs"
                      />
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAvatarUrl('')}
                    className={`w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-500 hover:bg-slate-300 transition-colors ${
                      !avatarUrl ? 'ring-2 ring-indigo-600 ring-offset-2' : ''
                    }`}
                    title="Silhouette vide par défaut"
                  >
                    <User className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Informations personnelles */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              <span>Informations personnelles</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Modifiez votre nom complet et votre adresse email de connexion.
            </p>
          </div>

          {infoSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{infoSuccess}</span>
            </div>
          )}

          {infoError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{infoError}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom complet
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Votre nom complet"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-indigo-500 outline-hidden transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nom@entreprise.com"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-indigo-500 outline-hidden transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Enregistrer les modifications</span>
              </button>
            </div>
          </form>
        </div>

        {/* Section 3: Sécurité & Mot de passe */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-600" />
              <span>Sécurité & Mot de passe</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Assurez la sécurité de votre compte avec un mot de passe robuste d'au moins 6 caractères.
            </p>
          </div>

          {passwordSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ancien mot de passe
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-indigo-500 outline-hidden transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 caractères"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-indigo-500 outline-hidden transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirmation du mot de passe
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Répéter le mot de passe"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-indigo-500 outline-hidden transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Mettre à jour le mot de passe</span>
              </button>
            </div>
          </form>
        </div>

        {/* Section 4: Zone de danger — Suppression du compte */}
        <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-6 shadow-2xs space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rose-100 text-rose-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-rose-900">Zone de danger : Suppression de compte</h2>
              <p className="text-xs text-rose-700 mt-1 max-w-2xl">
                La suppression de votre compte est irréversible. Vos affectations de projets seront supprimées
                et les tâches qui vous étaient assignées redeviendront non assignées. Votre session sera
                immédiatement fermée.
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setDeleteConfirmationText('');
                setDeleteError(null);
                setIsDeleteModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Supprimer définitivement mon compte</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Account Deletion */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Êtes-vous absolument sûr ?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Cette opération supprimera votre profil utilisateur ({currentUser.email}).
                Pour confirmer, veuillez saisir le mot <strong className="text-rose-600 font-bold">SUPPRIMER</strong> ci-dessous.
              </p>
            </div>

            {deleteError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs">
                {deleteError}
              </div>
            )}

            <div>
              <input
                type="text"
                placeholder="Tapez SUPPRIMER"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                className="w-full px-3 py-2 text-xs text-center font-bold tracking-wider bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:border-rose-500 outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteConfirmationText !== 'SUPPRIMER'}
                className="flex-1 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 rounded-lg transition-colors shadow-xs"
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
