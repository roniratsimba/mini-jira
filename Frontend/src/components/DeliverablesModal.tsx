import React, { useState } from 'react';
import {
  FileCode2,
  Copy,
  Check,
  Database,
  Layers,
  Shield,
  GitBranch,
  BookOpen,
} from 'lucide-react';
import { SQL_SCHEMA_CONTENT, MERMAID_CLASS_DIAGRAM } from '../data/deliverables';

export const DeliverablesModal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sql' | 'uml' | 'architecture' | 'commits'>('sql');
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedUml, setCopiedUml] = useState(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_CONTENT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleCopyUml = () => {
    navigator.clipboard.writeText(MERMAID_CLASS_DIAGRAM);
    setCopiedUml(true);
    setTimeout(() => setCopiedUml(false), 2000);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              Projet de fin d’études — Licence Génie Logiciel
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Spécifications Techniques, Schéma SQL & Modélisation UML
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Livrables formels requis par le cahier des charges : script DDL PostgreSQL avec contraintes d’intégrité, modélisation UML et architecture en couches.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('sql')}
          className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'sql'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Script SQL PostgreSQL 15/16</span>
        </button>

        <button
          onClick={() => setActiveTab('uml')}
          className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'uml'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Diagramme de Classes (Mermaid)</span>
        </button>

        <button
          onClick={() => setActiveTab('architecture')}
          className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'architecture'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Architecture en couches</span>
        </button>

        <button
          onClick={() => setActiveTab('commits')}
          className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'commits'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>Conventional Commits</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'sql' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Script DDL complet (/sql/schema.sql)
              </h3>
              <p className="text-xs text-slate-500">
                Contraintes CHECK, ON DELETE CASCADE, indexation des clés étrangères et triggers.
              </p>
            </div>
            <button
              onClick={handleCopySql}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors flex items-center gap-1.5"
            >
              {copiedSql ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copier le script SQL</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto max-h-[500px] leading-relaxed">
            {SQL_SCHEMA_CONTENT}
          </pre>
        </div>
      )}

      {activeTab === 'uml' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Diagramme de Classes Mermaid (Section 4.1 du Cahier des charges)
              </h3>
              <p className="text-xs text-slate-500">
                Relations N:N Affectation, associations faibles et énumérations typées.
              </p>
            </div>
            <button
              onClick={handleCopyUml}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors flex items-center gap-1.5"
            >
              {copiedUml ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copier la source Mermaid</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto max-h-[500px] leading-relaxed">
            {MERMAID_CLASS_DIAGRAM}
          </pre>
        </div>
      )}

      {activeTab === 'architecture' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Architecture Découplée Full-Stack (React 18 + Symfony 7 REST API)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Séparation stricte frontend/backend via contrat d'API REST JSON, Doctrine ORM et JWT.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <div className="text-xs font-bold text-indigo-700 font-mono">App\Entity (Doctrine ORM)</div>
              <div className="text-xs text-slate-700">
                Entités relationnelles 3FN : User (Membre), Project (Projet), Assignment (Affectation), Task (Tache), WorkSession, Notification.
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <div className="text-xs font-bold text-emerald-700 font-mono">App\Repository</div>
              <div className="text-xs text-slate-700">
                Repositories Doctrine spécialisés avec requêtes DQL optimisées pour les filtres Kanban, vélocité et temps cumulé.
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <div className="text-xs font-bold text-purple-700 font-mono">App\Controller\Api</div>
              <div className="text-xs text-slate-700">
                Contrôleurs RESTful JSON (AuthController, ProjectController, TaskController, NotificationController, SprintController).
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <div className="text-xs font-bold text-amber-700 font-mono">App\Security (LexikJWT & Voter)</div>
              <div className="text-xs text-slate-700">
                Authentification stateless JWT Bearer token, PasswordHasher (Argon2id/Bcrypt) et Symfony Security Voters pour le RBAC (ADMIN vs MEMBRE).
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <div className="text-xs font-bold text-blue-700 font-mono">Frontend React (Vite + TS + Tailwind)</div>
              <div className="text-xs text-slate-700">
                Interface utilisateur réactive inspirée de Linear : Kanban drag & drop, chronomètre de session temps réel, dashboards individuels et IA de sprint.
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <div className="text-xs font-bold text-rose-700 font-mono">Config & Docker</div>
              <div className="text-xs text-slate-700">
                NelmioCorsBundle (CORS configuré pour le client React), Doctrine Migrations (PostgreSQL 16), et orchestration Docker Compose.
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'commits' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            Guide de Conventional Commits pour le projet
          </h3>
          <p className="text-xs text-slate-500">
            Chaque message de commit doit obligatoirement être lié à l'identifiant de la tâche.
          </p>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono">
              <span className="text-indigo-600 font-bold">feat(MJ-101):</span> implémenter le drag & drop kanban avec feedback visuel
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono">
              <span className="text-amber-600 font-bold">fix(MJ-106):</span> empêcher la suppression du dernier admin d'un projet
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono">
              <span className="text-emerald-600 font-bold">refactor(MJ-103):</span> découpler le chronomètre en service réactif
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
