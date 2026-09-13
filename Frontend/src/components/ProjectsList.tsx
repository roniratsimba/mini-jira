import React from 'react';
import {
  FolderKanban,
  Plus,
  ArrowRight,
  Shield,
  User,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  Search,
} from 'lucide-react';
import { Membre } from '../types';
import { projectService, ProjectWithRole } from '../services/projectService';

interface ProjectsListProps {
  currentUser: Membre;
  onSelectProject: (projectId: number) => void;
  onOpenCreateProject: () => void;
  onOpenJoinProject: () => void;
}

export const ProjectsList: React.FC<ProjectsListProps> = ({
  currentUser,
  onSelectProject,
  onOpenCreateProject,
  onOpenJoinProject,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const projects = projectService.getProjectsForUser(currentUser.id);

  const filteredProjects = projects.filter(
    (p) =>
      p.projet.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.projet.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Mes Projets</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gérez vos sprints, visualisez l’avancement Kanban et coordonnez votre équipe logicielle.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenJoinProject}
            className="px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            Rejoindre avec un code
          </button>
          <button
            onClick={onOpenCreateProject}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs shadow-indigo-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau projet</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher parmi vos projets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-transparent placeholder-slate-400 text-slate-800 outline-hidden"
          />
        </div>
        <span className="text-xs text-slate-400 px-3 font-medium border-l border-slate-200">
          {filteredProjects.length} projet{filteredProjects.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <FolderKanban className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">Aucun projet trouvé</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? 'Aucun projet ne correspond à vos critères de recherche.'
              : 'Vous ne participez à aucun projet pour le moment. Créez-en un ou rejoignez une équipe.'}
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <button
              onClick={onOpenCreateProject}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
            >
              Créer mon premier projet
            </button>
            <button
              onClick={onOpenJoinProject}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Rejoindre une équipe
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((item) => {
            const { projet, role, totalTaches, tachesTerminees, avancementPct, membresCount } = item;
            const isAdmin = role === 'ADMIN';

            return (
              <div
                key={projet.id}
                onClick={() => onSelectProject(projet.id)}
                className="group bg-white rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  {/* Card Header: Role Badge + Project Name */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-1">
                      {projet.nom}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                        isAdmin
                          ? 'bg-purple-50 text-purple-700 border border-purple-200/70'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {isAdmin ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                      {role}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px] mb-4 leading-relaxed">
                    {projet.description || 'Aucune description fournie pour ce projet.'}
                  </p>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-xs font-medium text-slate-600">
                      <span>Progression</span>
                      <span className="font-semibold text-slate-900">{avancementPct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${avancementPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Metrics */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-medium text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      {tachesTerminees}/{totalTaches} tâches
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {membresCount} membre{membresCount > 1 ? 's' : ''}
                    </span>
                  </div>

                  <span className="text-indigo-600 group-hover:translate-x-0.5 transition-transform font-semibold inline-flex items-center gap-0.5 text-xs">
                    Ouvrir <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
