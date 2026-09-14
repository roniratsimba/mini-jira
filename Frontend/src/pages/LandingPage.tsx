import React, { useState } from 'react';
import {
  FolderKanban,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Clock,
  Bell,
  Users,
  Layers,
  Laptop,
  Check,
  ChevronRight,
  Menu,
  X,
  Play,
  Terminal,
  Download,
  Star,
  Quote,
  LayoutGrid,
  BarChart3,
  Calendar,
  Lock,
} from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onEnterApp?: () => void;
  isAuthenticated?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLoginClick,
  onRegisterClick,
  onEnterApp,
  isAuthenticated = false,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTourTab, setActiveTourTab] = useState<'kanban' | 'dashboard' | 'detail' | 'members'>('kanban');

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F8] text-slate-900 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* ========================================================================= */}
      {/* 1. NAVBAR FIXE                                                            */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 bg-[#F7F8F8]/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo Mini-Jira */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 rounded-lg bg-[#5E6AD2] flex items-center justify-center text-white font-bold shadow-xs">
              <FolderKanban className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-900 tracking-tight text-lg">Mini-Jira</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-[#5E6AD2] border border-indigo-100 hidden sm:inline-block">
                Web et Desktop en cours
              </span>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <button onClick={() => scrollToSection('features')} className="hover:text-slate-900 transition-colors">
              Fonctionnalités
            </button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-slate-900 transition-colors">
              Comment ça marche
            </button>
            <button onClick={() => scrollToSection('tour')} className="hover:text-slate-900 transition-colors">
              Aperçu produit
            </button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-slate-900 transition-colors">
              Tarifs
            </button>
          </nav>

          {/* Action Buttons (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && onEnterApp ? (
              <button
                onClick={onEnterApp}
                className="px-4 py-2 text-sm font-medium text-white bg-[#5E6AD2] hover:bg-indigo-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
              >
                <span>Accéder à l'application</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={onLoginClick}
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 border border-slate-300 hover:border-slate-400 rounded-lg bg-white transition-colors"
                >
                  Se connecter
                </button>
                <button
                  onClick={onRegisterClick}
                  className="px-3.5 py-1.5 text-sm font-medium text-white bg-[#5E6AD2] hover:bg-indigo-700 rounded-lg shadow-xs transition-all flex items-center gap-1"
                >
                  <span>Commencer gratuitement</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>

          {/* Hamburger Menu (Mobile) */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col space-y-2 text-sm font-medium text-slate-700">
              <button
                onClick={() => scrollToSection('features')}
                className="text-left py-2 px-2 hover:bg-slate-50 rounded-md"
              >
                Fonctionnalités
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="text-left py-2 px-2 hover:bg-slate-50 rounded-md"
              >
                Comment ça marche
              </button>
              <button
                onClick={() => scrollToSection('tour')}
                className="text-left py-2 px-2 hover:bg-slate-50 rounded-md"
              >
                Aperçu produit
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="text-left py-2 px-2 hover:bg-slate-50 rounded-md"
              >
                Tarifs
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              {isAuthenticated && onEnterApp ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onEnterApp();
                  }}
                  className="w-full py-2.5 text-center text-sm font-medium text-white bg-[#5E6AD2] hover:bg-indigo-700 rounded-lg"
                >
                  Accéder à l'application
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLoginClick();
                    }}
                    className="w-full py-2 text-center text-sm font-medium text-slate-700 border border-slate-300 rounded-lg bg-white"
                  >
                    Se connecter
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onRegisterClick();
                    }}
                    className="w-full py-2 text-center text-sm font-medium text-white bg-[#5E6AD2] hover:bg-indigo-700 rounded-lg"
                  >
                    Commencer gratuitement
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION (Above the fold)                                          */}
      {/* ========================================================================= */}
      <section className="pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Badge discret */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200/90 shadow-2xs text-xs font-medium text-slate-700 mb-6 hover:border-slate-300 transition-colors">
          <span className="w-2 h-2 rounded-full bg-[#5E6AD2] animate-pulse" />
          <span>Web + Desktop (en cours) · Disponible partout</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </div>

        {/* Titre principal fort (style Linear) */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.12]">
          Le gestionnaire de tâches collaboratif conçu pour les équipes qui livrent vite
        </h1>

        {/* Sous-titre */}
        <p className="mt-5 sm:mt-6 text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Organisez vos projets, suivez l’avancement en Kanban, invitez votre équipe et gardez le focus.
          Disponible en version Web et Desktop native.
        </p>

        {/* CTAs principaux */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
          <button
            onClick={onRegisterClick}
            className="w-full sm:w-auto px-6 py-3 text-sm sm:text-base font-semibold text-white bg-[#5E6AD2] hover:bg-[#525dbf] active:bg-[#4752ab] rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 group"
          >
            <span>Commencer gratuitement</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={onLoginClick}
            className="w-full sm:w-auto px-6 py-3 text-sm sm:text-base font-semibold text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-lg shadow-2xs transition-colors"
          >
            Se connecter
          </button>
        </div>

        {/* Petit texte rassurant sous les boutons */}
        <p className="mt-3 text-xs text-slate-500">
          Gratuit pour commencer · Web + Windows, macOS &amp; Linux
        </p>

        {/* Mockup / Screenshot réaliste de l'interface */}
        <div className="mt-12 sm:mt-16 relative mx-auto max-w-5xl">
          <div className="absolute -inset-1 bg-gradient-to-b from-indigo-100 to-transparent rounded-2xl blur-xl opacity-60 pointer-events-none" />

          {/* Browser / Desktop Window Shell */}
          <div className="relative rounded-xl sm:rounded-2xl border border-slate-200/90 bg-white shadow-2xl overflow-hidden text-left">
            {/* Window Header / Window controls */}
            <div className="h-10 bg-slate-50 border-b border-slate-200 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-400/80" />
                <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                <span className="ml-3 text-[11px] font-mono text-slate-400">Mini-Jira · Refonte API Gateway v2</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-indigo-50 text-[#5E6AD2] font-semibold px-2 py-0.5 rounded border border-indigo-100">
                  Sprint en cours · 78% complété
                </span>
              </div>
            </div>

            {/* Inner Realistic Product Preview */}
            <div className="grid grid-cols-12 min-h-[360px] sm:min-h-[460px] bg-slate-50/50">
              {/* Mini Sidebar Preview */}
              <div className="col-span-3 sm:col-span-3 border-r border-slate-200 bg-white p-3 sm:p-4 hidden sm:flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-[#5E6AD2] flex items-center justify-center text-white text-xs font-bold">
                      M
                    </div>
                    <span className="font-semibold text-xs text-slate-800">Workspace Tech</span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="px-2 py-1.5 rounded-md bg-indigo-50 text-[#5E6AD2] font-semibold flex items-center justify-between">
                      <span>Refonte API Gateway</span>
                      <span className="text-[10px] bg-indigo-200/60 px-1 rounded">3</span>
                    </div>
                    <div className="px-2 py-1.5 rounded-md text-slate-600 hover:bg-slate-50 flex items-center justify-between">
                      <span>Module Mobile &amp; Offline</span>
                      <span className="text-[10px] text-slate-400">2</span>
                    </div>
                    <div className="px-2 py-1.5 rounded-md text-slate-600 hover:bg-slate-50">
                      <span>Suivi individuel</span>
                    </div>
                  </div>
                </div>

                <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/70 text-[11px]">
                  <div className="text-slate-500 font-medium">Chronomètre actif</div>
                  <div className="font-mono font-bold text-rose-600">01:42:18</div>
                </div>
              </div>

              {/* Mini Kanban Columns Preview */}
              <div className="col-span-12 sm:col-span-9 p-4 sm:p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Sprint Backlog · Kanban</h3>
                    <p className="text-xs text-slate-500">Glissez-déposez les tâches pour mettre à jour les statuts</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-white border border-slate-200 px-2.5 py-1 rounded-md text-slate-600 font-medium shadow-2xs">
                      Filtre : Mes tâches
                    </span>
                  </div>
                </div>

                {/* 3 Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Column 1: A Faire */}
                  <div className="bg-slate-100/70 rounded-lg p-2.5 border border-slate-200/80">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-400" /> À faire
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">1</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-md border border-slate-200/80 shadow-2xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700">
                          Moyenne
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">#102</span>
                      </div>
                      <div className="text-xs font-medium text-slate-800 line-clamp-2">
                        Système d'invitation par token sécurisé
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                        <span>Est: 3h</span>
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] flex items-center justify-center font-bold">
                          BD
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: En cours */}
                  <div className="bg-indigo-50/40 rounded-lg p-2.5 border border-indigo-100">
                    <div className="flex items-center justify-between text-xs font-bold text-[#5E6AD2] mb-2">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#5E6AD2]" /> En cours
                      </span>
                      <span className="text-[10px] text-indigo-400 font-mono">1</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-md border border-indigo-200 shadow-2xs space-y-1.5 ring-1 ring-indigo-500/10">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700">
                          Haute
                        </span>
                        <span className="text-[10px] font-mono text-[#5E6AD2] font-semibold">#101</span>
                      </div>
                      <div className="text-xs font-medium text-slate-800 line-clamp-2">
                        Drag &amp; Drop Kanban avec synchronisation
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
                        <span className="font-mono text-rose-600 font-semibold">3h10 / 4h</span>
                        <span className="w-5 h-5 rounded-full bg-[#5E6AD2] text-white text-[10px] flex items-center justify-center font-bold">
                          AM
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Terminé */}
                  <div className="bg-emerald-50/40 rounded-lg p-2.5 border border-emerald-100">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-700 mb-2">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" /> Terminé
                      </span>
                      <span className="text-[10px] text-emerald-500 font-mono">2</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-md border border-slate-200/80 shadow-2xs space-y-1.5 opacity-90">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          Basse
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">#98</span>
                      </div>
                      <div className="text-xs font-medium text-slate-700 line-clamp-2 line-through">
                        Architecture BDD PostgreSQL 3FN
                      </div>
                      <div className="text-[10px] text-emerald-600 flex items-center justify-between pt-1">
                        <span>Complété</span>
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SECTION FEATURES (Prioritaires)                                        */}
      {/* ========================================================================= */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs font-bold uppercase tracking-wider text-[#5E6AD2] mb-2">
            Fonctionnalités essentielles
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Tout ce dont votre équipe a besoin, sans superflu
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Conçu pour éliminer la friction mentale et vous permettre de livrer vos fonctionnalités à l'heure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1: Vue Kanban fluide */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-[#5E6AD2] flex items-center justify-center mb-4">
                <FolderKanban className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Vue Kanban fluide avec drag &amp; drop</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Visualisez l'état d'avancement des tâches en temps réel avec glisser-déposer immédiat et filtres avancés.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-1 text-[11px] font-semibold text-[#5E6AD2]">
              <span>Colonnes À faire, En cours, Terminé</span>
            </div>
          </div>

          {/* Feature 2: Tableau de bord projet & individuel */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Tableau de bord projet + suivi individuel</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Mesurez la vélocité du sprint, les taux de complétion et consultez les tâches assignées à chaque collaborateur.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
              <span>Métriques en direct &amp; alertes de retard</span>
            </div>
          </div>

          {/* Feature 3: Invitations sécurisées par code */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Invitations sécurisées par code</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Partagez des jetons d'invitation uniques avec expiration à 7 jours et attribution de rôle RBAC stricte.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-1 text-[11px] font-semibold text-purple-700">
              <span>Rôles Admin et Membre étanches</span>
            </div>
          </div>

          {/* Feature 4: Notifications in-app en temps réel */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Notifications in-app en temps réel</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Soyez alerté instantanément lorsqu'une tâche vous est assignée, qu'un ticket passe en revue ou en cas de retard.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-1 text-[11px] font-semibold text-amber-700">
              <span>Centre de notifications unifié</span>
            </div>
          </div>

          {/* Feature 5: Chronométrage + historique des sessions */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Chronométrage + historique des sessions</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Chronomètre persistant non-dérivant pour mesurer le temps réel consacré à chaque tâche et comparer avec le temps estimé.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-1 text-[11px] font-semibold text-rose-700">
              <span>Suivi horodaté &amp; calcul de charge</span>
            </div>
          </div>

          {/* Feature 6: Architecture Full-Stack React & Symfony */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
                <Laptop className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Architecture React &amp; Symfony 7</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Frontend React ultra-rapide interconnecté à une API REST Symfony avec Doctrine ORM, authentification JWT et PostgreSQL.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-1 text-[11px] font-semibold text-sky-700">
              <span>Stack moderne &amp; découplée</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. SECTION « COMMENT ÇA MARCHE » (3 étapes)                                */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-20 bg-white border-y border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="text-xs font-bold uppercase tracking-wider text-[#5E6AD2] mb-2">
              Prise en main en 3 minutes
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Comment ça marche
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Pas de configuration lourde, pas de formulaires interminables.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-[#F7F8F8] rounded-xl p-6 border border-slate-200 relative">
              <div className="w-8 h-8 rounded-full bg-[#5E6AD2] text-white flex items-center justify-center text-sm font-bold mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Créez votre compte</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Inscrivez-vous en 30 secondes avec votre email. Votre espace de travail sécurisé est immédiatement initialisé.
              </p>
              <div className="mt-4 p-2.5 bg-white rounded-lg border border-slate-200/80 text-[11px] font-mono text-slate-500">
                ✓ Sans carte bancaire<br />
                ✓ Mot de passe haché BCrypt
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[#F7F8F8] rounded-xl p-6 border border-slate-200 relative">
              <div className="w-8 h-8 rounded-full bg-[#5E6AD2] text-white flex items-center justify-center text-sm font-bold mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Créez un projet et invitez votre équipe</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Définissez les objectifs du sprint et générez un jeton d'invitation sécurisé pour intégrer vos développeurs.
              </p>
              <div className="mt-4 p-2.5 bg-white rounded-lg border border-slate-200/80 text-[11px] font-mono text-slate-500">
                Code : MJ-LINEAR-2025-X89K<br />
                Rôles : Admin / Développeur
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[#F7F8F8] rounded-xl p-6 border border-slate-200 relative">
              <div className="w-8 h-8 rounded-full bg-[#5E6AD2] text-white flex items-center justify-center text-sm font-bold mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Organisez, assignez et livrez</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Déplacez vos tâches dans le Kanban, déclenchez le chronomètre de session et suivez la livraison du sprint.
              </p>
              <div className="mt-4 p-2.5 bg-white rounded-lg border border-slate-200/80 text-[11px] font-mono text-slate-500">
                ✓ Glisser-déposer instantané<br />
                ✓ Suivi temps réel du dépassement
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. SECTION SCREENSHOTS / PRODUCT TOUR                                     */}
      {/* ========================================================================= */}
      <section id="tour" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="text-xs font-bold uppercase tracking-wider text-[#5E6AD2] mb-2">
            Visite guidée
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Explorez l'interface de Mini-Jira
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Une interface épurée inspirée des meilleurs outils d'ingénierie (Linear, Notion, Raycast).
          </p>
        </div>

        {/* Tabs for interactive preview */}
        <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
          <button
            onClick={() => setActiveTourTab('kanban')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all ${
              activeTourTab === 'kanban'
                ? 'bg-[#5E6AD2] text-white border-[#5E6AD2] shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            Vue Kanban
          </button>
          <button
            onClick={() => setActiveTourTab('dashboard')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all ${
              activeTourTab === 'dashboard'
                ? 'bg-[#5E6AD2] text-white border-[#5E6AD2] shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            Tableau de bord
          </button>
          <button
            onClick={() => setActiveTourTab('detail')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all ${
              activeTourTab === 'detail'
                ? 'bg-[#5E6AD2] text-white border-[#5E6AD2] shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            Détail d’une tâche
          </button>
          <button
            onClick={() => setActiveTourTab('members')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all ${
              activeTourTab === 'members'
                ? 'bg-[#5E6AD2] text-white border-[#5E6AD2] shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            Gestion des membres &amp; invitations
          </button>
        </div>

        {/* Large Annotated Mockup Box */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Top Bar */}
          <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">Aperçu :</span>
              <span className="text-xs text-[#5E6AD2] font-semibold">
                {activeTourTab === 'kanban' && 'Tableau Kanban 3 colonnes avec drag & drop'}
                {activeTourTab === 'dashboard' && 'Statistiques d’avancement & métriques Agile'}
                {activeTourTab === 'detail' && 'Fiche tâche complète, chronomètre et temps passé'}
                {activeTourTab === 'members' && 'Affectations RBAC & génération de jetons d’invitation'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">1280 × 720 px</span>
          </div>

          {/* Tab Content Display */}
          <div className="p-6 sm:p-10 bg-slate-50/40 min-h-[380px] flex items-center justify-center">
            {activeTourTab === 'kanban' && (
              <div className="w-full max-w-4xl bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">Sprint Kanban #4</span>
                    <span className="text-xs bg-indigo-50 text-[#5E6AD2] px-2 py-0.5 rounded font-medium">
                      En cours
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">Total : 8 tâches</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                    <div className="text-xs font-bold text-slate-600">À FAIRE (3)</div>
                    <div className="p-2.5 bg-white rounded border border-slate-200 text-xs space-y-1">
                      <div className="font-semibold text-slate-800">Auth OAuth Google &amp; GitHub</div>
                      <div className="text-[10px] text-slate-400">Est: 4h · Priorité Haute</div>
                    </div>
                  </div>
                  <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 space-y-2">
                    <div className="text-xs font-bold text-[#5E6AD2]">EN COURS (2)</div>
                    <div className="p-2.5 bg-white rounded border border-indigo-200 text-xs space-y-1">
                      <div className="font-semibold text-slate-800">Recherche plein texte SQLite</div>
                      <div className="text-[10px] text-rose-600 font-mono">1h20 / 2h (En chrono)</div>
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100 space-y-2">
                    <div className="text-xs font-bold text-emerald-700">TERMINÉ (3)</div>
                    <div className="p-2.5 bg-white rounded border border-slate-200 text-xs space-y-1 line-through text-slate-400">
                      <div>Schéma relationnel 3FN</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTourTab === 'dashboard' && (
              <div className="w-full max-w-4xl bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6 text-left">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-xs text-slate-500 font-medium">Progression</div>
                    <div className="text-2xl font-bold text-slate-900 mt-1">75%</div>
                    <div className="text-[11px] text-emerald-600 mt-1">6 / 8 tâches livrées</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-xs text-slate-500 font-medium">Temps estimé</div>
                    <div className="text-2xl font-bold text-slate-900 mt-1">24h</div>
                    <div className="text-[11px] text-slate-400 mt-1">Planification initiale</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-xs text-slate-500 font-medium">Temps réel</div>
                    <div className="text-2xl font-bold text-indigo-600 mt-1">19h 30m</div>
                    <div className="text-[11px] text-emerald-600 mt-1">Sous l'estimation (-18%)</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-xs text-slate-500 font-medium">Collaborateurs</div>
                    <div className="text-2xl font-bold text-slate-900 mt-1">4 actifs</div>
                    <div className="text-[11px] text-slate-400 mt-1">Équipe tech</div>
                  </div>
                </div>
              </div>
            )}

            {activeTourTab === 'detail' && (
              <div className="w-full max-w-2xl bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 text-left">
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="text-xs font-bold text-slate-400 font-mono">TACHE #101</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-700">
                    Priorité Haute
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  Implémenter le Drag &amp; Drop Kanban avec feedback visuel
                </h4>
                <p className="text-xs text-slate-600">
                  Permettre le glisser-déposer fluide entre les colonnes avec persistance immédiate et recalcul automatique des heures.
                </p>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 block">Temps passé :</span>
                    <span className="font-mono font-bold text-slate-900">3h 10m / 4h</span>
                  </div>
                  <button className="px-3 py-1.5 bg-indigo-600 text-white rounded font-medium text-xs flex items-center gap-1.5">
                    <Play className="w-3 h-3" /> Démarrer le chronomètre
                  </button>
                </div>
              </div>
            )}

            {activeTourTab === 'members' && (
              <div className="w-full max-w-2xl bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">Collaborateurs &amp; Invitations</h4>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                    3 membres
                  </span>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800">Alice Martin</span>
                      <span className="text-slate-400 block">alice@minijira.io</span>
                    </div>
                    <span className="text-[10px] bg-indigo-50 text-[#5E6AD2] font-bold px-2 py-0.5 rounded">
                      ADMIN
                    </span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800">Bob Dupont</span>
                      <span className="text-slate-400 block">bob@minijira.io</span>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded">
                      MEMBRE
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-indigo-900 font-semibold block">Jeton actif : MJ-LINEAR-2025-X89K</span>
                    <span className="text-[11px] text-indigo-600">Valide encore 6 jours</span>
                  </div>
                  <span className="text-[10px] bg-white border border-indigo-200 text-indigo-700 px-2 py-1 rounded font-mono">
                    Copier le lien
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. CTA FINAL FORT                                                         */}
      {/* ========================================================================= */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="bg-gradient-to-b from-white to-indigo-50/40 rounded-2xl sm:rounded-3xl border border-slate-200 p-8 sm:p-14 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5E6AD2]">
              Démarrez aujourd'hui
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Prêt à organiser votre prochain sprint ?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
              Rejoignez des centaines de développeurs qui ont troqué les tableaux lourds pour la rapidité de Mini-Jira.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onRegisterClick}
                className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white bg-[#5E6AD2] hover:bg-[#525dbf] rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
              >
                <span>Commencer gratuitement</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Aucune carte bancaire requise · React + Symfony
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. FOOTER                                                                 */}
      {/* ========================================================================= */}
      <footer className="border-t border-slate-200 bg-white py-12 px-4 sm:px-6 lg:px-8 text-slate-600 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Copyright */}
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-[#5E6AD2] flex items-center justify-center text-white font-bold text-xs">
              <FolderKanban className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-slate-900 text-sm">Mini-Jira</span>
            <span className="text-slate-400">© 2025 Mini-Jira Technologies. Tous droits réservés.</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 font-medium text-slate-500">
            <a href="#features" className="hover:text-slate-900 transition-colors">
              Documentation
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 transition-colors"
            >
              GitHub
            </a>
            <a href="mailto:support@minijira.io" className="hover:text-slate-900 transition-colors">
              Contact
            </a>
            <a href="#privacy" className="hover:text-slate-900 transition-colors">
              Mentions légales &amp; Confidentialité
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
