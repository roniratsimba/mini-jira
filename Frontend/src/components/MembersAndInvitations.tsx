import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  UserCheck,
  UserX,
  Mail,
  Copy,
  Check,
  KeyRound,
  AlertTriangle,
} from 'lucide-react';
import { Projet, Membre, RoleEnum } from '../types';
import { projectService } from '../services/projectService';
import { symfonyApi } from '../services/symfonyApiClient';

interface MembersAndInvitationsProps {
  projet: Projet;
  currentUser: Membre;
  onRefresh: () => void;
}

export const MembersAndInvitations: React.FC<MembersAndInvitationsProps> = ({
  projet,
  currentUser,
  onRefresh,
}) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<RoleEnum | null>(null);

  useEffect(() => {
    let isMounted = true;
    symfonyApi.getProjectDetail(projet.id).then((projectDetail) => {
      if (!isMounted) return;
      if (projectDetail) {
        if (projectDetail.membres) {
          setMembers(projectDetail.membres);
        }
        if (projectDetail.currentUserRole) {
          setUserRole(projectDetail.currentUserRole);
        }
      }
    }).catch((err) => {
      if (isMounted) {
        setErrorMessage(err.message || 'Erreur lors du chargement des détails du projet');
      }
    });

    return () => {
      isMounted = false;
    };
  }, [projet.id, currentUser.id]);

  const isAdmin = userRole === 'ADMIN';

  const handleGenerateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const projectDetail = await symfonyApi.getProjectDetail(projet.id);
      const code = projectDetail.code || `MJ-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      setGeneratedCode(code);
      setSuccessMessage("Code d'invitation prêt à être partagé");
      setInviteEmail('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Erreur lors de la génération du code');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRemoveMember = async (targetMemberId: number, targetName: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!window.confirm(`Confirmez-vous le retrait de ${targetName} de ce projet ?`)) {
      return;
    }

    try {
      await symfonyApi.request(`/projects/${projet.id}/members/${targetMemberId}`, {
        method: 'DELETE',
      });
      setSuccessMessage(`${targetName} a été retiré du projet.`);
      onRefresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Impossible de retirer ce membre.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Messages */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Grid: Members List & Invitation Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Members List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Membres de l’équipe</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {members.length} collaborateur{members.length > 1 ? 's' : ''} affecté
                {members.length > 1 ? 's' : ''} au projet
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {members.map((item: any) => {
              const membre = item.membre || item.user || item;
              const role = item.role || item.affectation?.role || 'MEMBRE';
              const isMemberAdmin = role === 'ADMIN';
              const isMe = membre.id === currentUser.id;

              return (
                <div
                  key={membre.id}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        membre.avatarUrl ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${membre.nom || membre.email}`
                      }
                      alt={membre.nom || 'Membre'}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800">{membre.nom || membre.email}</span>
                        {isMe && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            Vous
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">{membre.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        isMemberAdmin
                          ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {isMemberAdmin ? <Shield className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                      {role}
                    </span>

                    {isAdmin && !isMe && (
                      <button
                        onClick={() => handleRemoveMember(membre.id, membre.nom || membre.email)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Retirer ce membre du projet"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Generate Invitation */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">Inviter un collaborateur</h3>
            <p className="text-xs text-slate-500 mb-4">
              Partagez le code du projet pour permettre à un collaborateur de le rejoindre.
            </p>

            <form onSubmit={handleGenerateInvitation} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email du destinataire (facultatif)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="collegue@entreprise.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 outline-hidden focus:bg-white focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Obtenir le code d’invitation</span>
              </button>
            </form>

            {/* Display generated code */}
            {generatedCode && (
              <div className="mt-4 p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2">
                <div className="text-[11px] font-semibold text-indigo-900">
                  Code d’invitation prêt à être partagé :
                </div>
                <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-indigo-200">
                  <span className="font-mono text-sm font-bold text-indigo-700 tracking-wider">
                    {generatedCode}
                  </span>
                  <button
                    onClick={() => handleCopyCode(generatedCode)}
                    className="p-1 text-slate-500 hover:text-indigo-600 transition-colors"
                    title="Copier le code"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
