import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Clock,
  Stethoscope,
  FileText,
  Calendar,
  Pill,
  CreditCard,
  Microscope,
  MessageSquare,
  MessagesSquare,
  UserCheck,
  UserCog,
  History,
  QrCode,
  HeartPulse,
  Compass,
  X,
  ChevronDown,
  Building2,
  Globe2,
  Lock,
  LogOut,
  ShieldCheck,
  Receipt,
  Activity,
  BookOpen,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { UserRole } from '../types';
import { Logo } from './Logo';
import { UserProfileModal } from './UserProfileModal';
import { PatientProfileModal } from './PatientProfileModal';

interface SidebarProps {
  isOpen?: boolean;
  isMobileOpen?: boolean;
  onClose?: () => void;
  onCloseMobile?: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  section: 'medical' | 'plateaux' | 'admin';
  allowedRoles: UserRole[];
  badge?: number | string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  isMobileOpen,
  onClose,
  onCloseMobile,
}) => {
  const {
    currentRole,
    currentUser,
    currentView,
    setCurrentView,
    isPatientMode,
    activePatient,
    currentEtablissement,
    queue,
    medications,
    invoices,
    exams,
    assignments,
    getUnreadPatientMessagesCount,
    getUnreadTeamMessagesCount,
    transfertsInterHopitaux,
    verrouillerPoste,
    logout,
    patientPortalTab,
    openPatientTab,
  } = useClinic();

  const open = isOpen ?? isMobileOpen ?? false;
  const handleClose = onClose || onCloseMobile || (() => {});
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPatientProfileModal, setShowPatientProfileModal] = useState(false);

  // Badges
  const waitingQueueCount = queue.filter(q => q.statut === 'en_attente' || q.statut === 'triage_fait').length;
  const lowStockCount = medications.filter(m => m.quantiteEnStock <= m.seuilAlerte).length;
  const pendingInvoicesCount = invoices.filter(i => i.statut === 'en_attente').length;
  const pendingExamsCount = exams.filter(e => e.statut === 'prescrit' || e.statut === 'en_cours').length;
  const unreadPatientMessages = getUnreadPatientMessagesCount();
  const unreadTeamMessages = getUnreadTeamMessagesCount();

  const menuItems: MenuItem[] = [
    // Section Super Admin (Plateforme & Réseau)
    {
      id: 'superadmin',
      label: 'Établissements Réseau',
      icon: Building2,
      section: 'medical',
      allowedRoles: ['superadmin'],
    },

    // Section Médicale
    {
      id: 'welcome',
      label: 'Mon Accueil Poste',
      icon: Compass,
      section: 'medical',
      allowedRoles: ['medecin', 'infirmier', 'accueil', 'responsable_soins', 'tech_laboratoire', 'tech_imagerie'],
    },
    {
      id: 'dashboard',
      label: 'Tableau de Bord',
      icon: LayoutDashboard,
      section: 'medical',
      allowedRoles: ['directeur', 'gestionnaire'],
    },
    {
      id: 'clinical_workflow',
      label: 'Chaîne de Soins (Flux)',
      icon: Activity,
      section: 'medical',
      allowedRoles: ['directeur', 'gestionnaire', 'medecin', 'infirmier', 'accueil', 'responsable_soins', 'tech_laboratoire', 'tech_imagerie'],
    },
    {
      id: 'queue',
      label: 'Ma File d\'Attente',
      icon: Clock,
      section: 'medical',
      allowedRoles: ['directeur', 'medecin', 'infirmier', 'accueil', 'responsable_soins'],
      badge: waitingQueueCount > 0 ? waitingQueueCount : undefined,
    },
    {
      id: 'patients',
      label: 'Mes Patients',
      icon: Users,
      section: 'medical',
      allowedRoles: ['directeur', 'medecin', 'infirmier', 'accueil', 'responsable_soins'],
    },
    {
      id: 'consultations',
      label: 'Consultations',
      icon: Stethoscope,
      section: 'medical',
      allowedRoles: ['directeur', 'medecin'],
    },
    {
      id: 'ordonnances',
      label: 'Ordonnances',
      icon: FileText,
      section: 'medical',
      allowedRoles: ['directeur', 'medecin'],
    },
    {
      id: 'appointments',
      label: 'Rendez-vous',
      icon: Calendar,
      section: 'medical',
      allowedRoles: ['directeur', 'gestionnaire', 'medecin', 'accueil'],
    },

    // Section Plateaux & Gestion
    {
      id: 'examens',
      label: 'Examens & Labo',
      icon: Microscope,
      section: 'plateaux',
      allowedRoles: ['directeur', 'medecin', 'tech_laboratoire', 'tech_imagerie', 'responsable_soins'],
      badge: pendingExamsCount > 0 ? pendingExamsCount : undefined,
    },
    {
      id: 'pharmacie',
      label: 'Pharmacie & Stocks',
      icon: Pill,
      section: 'plateaux',
      allowedRoles: ['directeur', 'gestionnaire', 'responsable_soins'],
      badge: lowStockCount > 0 ? `${lowStockCount}` : undefined,
    },
    {
      id: 'billing',
      label: 'Facturation & Caisse',
      icon: CreditCard,
      section: 'plateaux',
      allowedRoles: ['directeur', 'gestionnaire', 'accueil'],
      badge: pendingInvoicesCount > 0 ? pendingInvoicesCount : undefined,
    },
    {
      id: 'assignments',
      label: 'Assignations Soignants',
      icon: UserCheck,
      section: 'plateaux',
      allowedRoles: ['directeur', 'responsable_soins', 'medecin'],
    },

    // Section Communication & Admin
    {
      id: 'patient_messages',
      label: 'Messagerie Patients',
      icon: MessageSquare,
      section: 'admin',
      allowedRoles: ['directeur', 'medecin', 'infirmier', 'responsable_soins'],
      badge: unreadPatientMessages > 0 ? unreadPatientMessages : undefined,
    },
    {
      id: 'team_chat',
      label: 'Chat d\'Équipe',
      icon: MessagesSquare,
      section: 'admin',
      allowedRoles: ['directeur', 'gestionnaire', 'medecin', 'infirmier', 'accueil', 'responsable_soins', 'tech_laboratoire', 'tech_imagerie'],
      badge: unreadTeamMessages > 0 ? unreadTeamMessages : undefined,
    },
    {
      id: 'users',
      label: currentRole === 'superadmin' ? 'Personnel Réseau' : 'Personnel Clinique',
      icon: UserCog,
      section: 'admin',
      allowedRoles: ['superadmin', 'directeur'],
    },
    {
      id: 'activity_log',
      label: currentRole === 'superadmin' ? 'Journal Global' : 'Journal d\'Activité',
      icon: History,
      section: 'admin',
      allowedRoles: ['superadmin', 'directeur', 'gestionnaire'],
    },
    {
      id: 'qr_access_log',
      label: 'Historique Scans QR',
      icon: QrCode,
      section: 'admin',
      allowedRoles: ['superadmin', 'directeur', 'gestionnaire'],
    },
    {
      id: 'inter_hopitaux',
      label: 'Réseau Inter-Hôpitaux & DMP',
      icon: Globe2,
      section: 'medical',
      allowedRoles: ['superadmin', 'directeur', 'gestionnaire', 'medecin', 'infirmier', 'accueil', 'tech_laboratoire', 'tech_imagerie', 'responsable_soins'],
      badge: transfertsInterHopitaux.filter(t => t.statut === 'en_attente_accord' || t.statut === 'accepte_en_route').length || undefined,
    },
    {
      id: 'national_directory',
      label: 'Annuaire Examens & Stocks',
      icon: Globe2,
      section: 'plateaux',
      allowedRoles: ['superadmin', 'directeur', 'gestionnaire', 'medecin', 'infirmier', 'accueil', 'tech_laboratoire', 'tech_imagerie', 'responsable_soins'],
    },
    {
      id: 'subscriptions',
      label: 'Abonnements & Licences',
      icon: Receipt,
      section: 'admin',
      allowedRoles: ['superadmin', 'directeur', 'gestionnaire'],
    },
    {
      id: 'security_compliance',
      label: 'Forteresse de Cyberdéfense',
      icon: ShieldCheck,
      section: 'admin',
      badge: 'Bouclier 100%',
      allowedRoles: ['superadmin', 'directeur', 'gestionnaire', 'medecin', 'infirmier', 'accueil', 'tech_laboratoire', 'tech_imagerie', 'responsable_soins', 'pharmacien', 'caissier'],
    },
    {
      id: 'guide_livre',
      label: 'Grand Livre & Manuel',
      icon: BookOpen,
      section: 'admin',
      allowedRoles: ['superadmin', 'directeur', 'gestionnaire', 'medecin', 'infirmier', 'accueil', 'tech_laboratoire', 'tech_imagerie', 'responsable_soins', 'pharmacien', 'caissier'],
    },
  ];

  // Filter items matching currently authenticated role
  const visibleItems = menuItems.filter(item => item.allowedRoles.includes(currentRole));

  const handleNavClick = (viewId: string) => {
    setCurrentView(viewId);
    handleClose();
  };

  const medicalItems = visibleItems.filter(i => i.section === 'medical');
  const plateauxItems = visibleItems.filter(i => i.section === 'plateaux');
  const adminItems = visibleItems.filter(i => i.section === 'admin');

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {open && (
        <div
          onClick={handleClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        id="app-sidebar"
        className={`w-64 bg-white border-r border-slate-200 flex flex-col justify-between flex-shrink-0 z-40 transition-transform duration-200 ease-in-out fixed md:static top-0 bottom-0 h-full ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 sm:p-6 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Logo size="sm" showText={false} />
            <div>
              <span className="text-2xl font-bold tracking-tight text-[#0B3C5D] leading-none block">DARÔ</span>
              <span className="text-[10px] text-slate-600 font-bold tracking-wider uppercase block mt-0.5 truncate max-w-[145px]">
                {isPatientMode || currentRole === 'patient'
                  ? (activePatient?.etablissementNom || 'Clinique Partenaire')
                  : currentRole === 'superadmin'
                  ? 'Réseau DARÔ Santé'
                  : (currentUser.etablissementNom || currentEtablissement?.nom || 'Clinique Partenaire')}
              </span>
              <span className="text-[9px] text-slate-400 block font-medium">
                {isPatientMode || currentRole === 'patient'
                  ? 'Espace Patient Citoyen'
                  : currentRole === 'superadmin'
                  ? 'Système Hospitalier'
                  : (currentEtablissement?.ville || "N'Djamena")}
              </span>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto py-4">
          {isPatientMode || currentRole === 'patient' ? (
            <div className="space-y-1">
              <div className="px-6 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Espace Patient Citoyen
              </div>
              <button
                type="button"
                onClick={() => {
                  openPatientTab('carte');
                  handleClose();
                }}
                className={`w-full flex items-center gap-3 px-6 py-2.5 font-medium text-sm transition-colors text-left cursor-pointer ${
                  currentView === 'patient_portal' && patientPortalTab === 'carte'
                    ? 'bg-blue-50 text-[#1E88E5] border-r-4 border-[#1E88E5] font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <HeartPulse className="w-5 h-5 opacity-80" />
                <span>Ma Carte & Pass Vital</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  openPatientTab('messages');
                  handleClose();
                }}
                className={`w-full flex items-center gap-3 px-6 py-2.5 font-medium text-sm transition-colors text-left cursor-pointer ${
                  currentView === 'patient_portal' && patientPortalTab === 'messages'
                    ? 'bg-blue-50 text-[#1E88E5] border-r-4 border-[#1E88E5] font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <MessageSquare className="w-5 h-5 opacity-80" />
                <span>Mon Équipe Médicale</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  openPatientTab('rdv');
                  handleClose();
                }}
                className={`w-full flex items-center gap-3 px-6 py-2.5 font-medium text-sm transition-colors text-left cursor-pointer ${
                  currentView === 'patient_portal' && patientPortalTab === 'rdv'
                    ? 'bg-blue-50 text-[#1E88E5] border-r-4 border-[#1E88E5] font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Calendar className="w-5 h-5 opacity-80" />
                <span>Mes Rendez-vous & Visio</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  openPatientTab('hopital');
                  handleClose();
                }}
                className={`w-full flex items-center gap-3 px-6 py-2.5 font-medium text-sm transition-colors text-left cursor-pointer ${
                  currentView === 'patient_portal' && patientPortalTab === 'hopital'
                    ? 'bg-blue-50 text-[#1E88E5] border-r-4 border-[#1E88E5] font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Building2 className="w-5 h-5 opacity-80" />
                <span>Mon Hôpital & Médecins</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  openPatientTab('ordonnances');
                  handleClose();
                }}
                className={`w-full flex items-center gap-3 px-6 py-2.5 font-medium text-sm transition-colors text-left cursor-pointer ${
                  currentView === 'patient_portal' && patientPortalTab === 'ordonnances'
                    ? 'bg-blue-50 text-[#1E88E5] border-r-4 border-[#1E88E5] font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-5 h-5 opacity-80" />
                <span>Mes Ordonnances</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  openPatientTab('analyses');
                  handleClose();
                }}
                className={`w-full flex items-center gap-3 px-6 py-2.5 font-medium text-sm transition-colors text-left cursor-pointer ${
                  currentView === 'patient_portal' && patientPortalTab === 'analyses'
                    ? 'bg-blue-50 text-[#1E88E5] border-r-4 border-[#1E88E5] font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Stethoscope className="w-5 h-5 opacity-80" />
                <span>Mes Examens & Résultats</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  openPatientTab('factures');
                  handleClose();
                }}
                className={`w-full flex items-center gap-3 px-6 py-2.5 font-medium text-sm transition-colors text-left cursor-pointer ${
                  currentView === 'patient_portal' && patientPortalTab === 'factures'
                    ? 'bg-blue-50 text-[#1E88E5] border-r-4 border-[#1E88E5] font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-5 h-5 opacity-80" />
                <span>Mes Factures & Règlements</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Espace Médical ou Réseau */}
              {medicalItems.length > 0 && (
                <div>
                  <div className="px-6 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {currentRole === 'superadmin' ? 'Plateforme & Réseau' : 'Espace Médical'}
                  </div>
                  {medicalItems.map(item => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id ||
                      (item.id === 'welcome' && currentView === 'staff_welcome') ||
                      (item.id === 'superadmin' && currentView === 'etablissements');
                    return (
                      <button
                        key={item.id}
                        id={`sidebar-nav-${item.id}`}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center gap-3 px-6 py-2.5 font-medium text-sm transition-colors text-left ${
                          isActive
                            ? 'bg-blue-50 text-[#1E88E5] border-r-4 border-[#1E88E5]'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-4 h-4 opacity-80 flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                        {item.badge !== undefined && (
                          <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Plateaux & Gestion */}
              {plateauxItems.length > 0 && (
                <div>
                  <div className="px-6 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Plateaux & Soins
                  </div>
                  {plateauxItems.map(item => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id || 
                      (item.id === 'pharmacie' && currentView === 'pharmacy') ||
                      (item.id === 'examens' && currentView === 'exams') ||
                      (item.id === 'ordonnances' && currentView === 'prescriptions');
                    return (
                      <button
                        key={item.id}
                        id={`sidebar-nav-${item.id}`}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center gap-3 px-6 py-2.5 font-medium text-sm transition-colors text-left ${
                          isActive
                            ? 'bg-blue-50 text-[#1E88E5] border-r-4 border-[#1E88E5]'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-4 h-4 opacity-80 flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                        {item.badge !== undefined && (
                          <span className="ml-auto bg-[#1E88E5] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Communication & Admin */}
              {adminItems.length > 0 && (
                <div>
                  <div className="px-6 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Communication & Admin
                  </div>
                  {adminItems.map(item => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id ||
                      (item.id === 'users' && (currentView === 'users_admin' || currentView === 'personnel')) ||
                      (item.id === 'activity_log' && currentView === 'audit_logs') ||
                      (item.id === 'qr_access_log' && currentView === 'audit_logs');
                    return (
                      <button
                        key={item.id}
                        id={`sidebar-nav-${item.id}`}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center gap-3 px-6 py-2.5 font-medium text-sm transition-colors text-left ${
                          isActive
                            ? 'bg-blue-50 text-[#1E88E5] border-r-4 border-[#1E88E5]'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-4 h-4 opacity-80 flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                        {item.badge !== undefined && (
                          <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* User Card at bottom of sidebar (Professional Polish Theme) */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 space-y-1.5">
          <button
            type="button"
            onClick={() => {
              if (isPatientMode || currentRole === 'patient') {
                setShowPatientProfileModal(true);
              } else {
                setShowProfileModal(true);
              }
            }}
            title={isPatientMode || currentRole === 'patient' ? "Consulter ou modifier mes informations patient" : "Modifier mon profil et ma photo"}
            className="w-full flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-200/60 transition-colors text-left group"
          >
            <div className="relative w-9 h-9 rounded-full bg-slate-300 border-2 border-white shadow-xs overflow-hidden flex-shrink-0">
              <img
                src={
                  (isPatientMode || currentRole === 'patient') && activePatient
                    ? (activePatient.avatar || currentUser.avatar)
                    : currentUser.avatar
                }
                alt={
                  (isPatientMode || currentRole === 'patient') && activePatient
                    ? `${activePatient.prenom} ${activePatient.nom}`
                    : `${currentUser.prenom} ${currentUser.nom}`
                }
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <p className="text-xs font-bold text-slate-800 truncate group-hover:text-[#1E88E5] transition-colors">
                  {(isPatientMode || currentRole === 'patient') && activePatient
                    ? `${activePatient.prenom} ${activePatient.nom}`
                    : `${currentUser.prenom} ${currentUser.nom}`}
                </p>
                <UserCog className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#1E88E5] flex-shrink-0" />
              </div>
              <p className="text-[10px] text-slate-500 truncate">
                {(isPatientMode || currentRole === 'patient') && activePatient
                  ? `Patient • Pass ${activePatient.matricule}`
                  : (currentUser.id === 'u-superadmin' || currentUser.role === 'superadmin'
                    ? 'Concepteur & Super Admin'
                    : currentUser.specialite || (currentRole === 'directeur' ? 'Directeur Général' : 'Personnel Clinique'))}
              </p>
            </div>
          </button>

          {/* Quick Workstation Session Status on sidebar */}
          {!isPatientMode && currentRole !== 'patient' && (
            <div className="flex items-center justify-between px-2 py-1 bg-white rounded-lg border border-slate-200/70 text-[10px] text-slate-600">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="truncate font-semibold text-slate-700 max-w-[110px]" title={currentUser.posteActif || 'Poste Clinique'}>
                  {currentUser.posteActif || 'Poste Clinique'}
                </span>
              </div>
              <button
                type="button"
                onClick={verrouillerPoste}
                className="text-amber-700 hover:text-amber-900 font-bold hover:underline flex items-center gap-0.5 shrink-0"
                title="Verrouiller ce poste"
              >
                <Lock className="w-2.5 h-2.5" />
                <span>Verrouiller</span>
              </button>
            </div>
          )}

          {/* Déconnexion (Logout) Button */}
          <button
            type="button"
            id="sidebar-logout-btn"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 text-xs font-bold transition-colors border border-rose-200/80 shadow-2xs cursor-pointer group"
            title="Se déconnecter et revenir à la page de connexion"
          >
            <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* User Profile & Photo Edit Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      {/* Patient Profile Modal for patient independent account */}
      {activePatient && (
        <PatientProfileModal
          isOpen={showPatientProfileModal}
          onClose={() => setShowPatientProfileModal(false)}
          patientToEdit={activePatient}
        />
      )}
    </>
  );
};
