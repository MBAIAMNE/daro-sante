import React, { useState } from 'react';
import { ClinicProvider, useClinic } from './context/ClinicContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { QRModalScanner } from './components/QRModalScanner';
import { PatientJourneyWalkthrough } from './components/PatientJourneyWalkthrough';

// Views
import { LoginView } from './views/LoginView';
import { PublicLandingView } from './views/PublicLandingView';
import { EmergencyQRView } from './views/EmergencyQRView';
import { StaffWelcomeView } from './views/StaffWelcomeView';
import { DashboardView } from './views/DashboardView';
import { QueueView } from './views/QueueView';
import { PatientsView } from './views/PatientsView';
import { ConsultationsView } from './views/ConsultationsView';
import { PrescriptionsView } from './views/PrescriptionsView';
import { ExamsView } from './views/ExamsView';
import { PharmacyView } from './views/PharmacyView';
import { BillingView } from './views/BillingView';
import { AppointmentsView } from './views/AppointmentsView';
import { PatientPortalView } from './views/PatientPortalView';
import { AuditLogsView } from './views/AuditLogsView';
import { PatientMessagingView } from './views/PatientMessagingView';
import { TeamChatView } from './views/TeamChatView';
import { AssignmentsView } from './views/AssignmentsView';
import { SuperAdminView } from './views/SuperAdminView';
import { StaffManagementView } from './views/StaffManagementView';
import { ClinicalWorkflowView } from './views/ClinicalWorkflowView';
import { QRDisplayModal } from './components/QRDisplayModal';
import { WorkstationLoginModal } from './components/WorkstationLoginModal';
import { NationalDirectoryView } from './views/NationalDirectoryView';
import { InterHopitauxView } from './views/InterHopitauxView';
import { SubscriptionBillingModal } from './components/SubscriptionBillingModal';
import { SecurityComplianceModal } from './components/SecurityComplianceModal';
import { AccessDeniedWorkstationGuard } from './components/AccessDeniedWorkstationGuard';
import { UserGuideBookView } from './views/UserGuideBookView';

// Strict Role-Based Access Control (RBAC) Workstation Enforcement
// Seuls le directeur et le super-administrateur ont accès libre à tous les postes.
// Chaque autre professionnel est strictement restreint à son propre périmètre métier.
const isViewAllowedForRole = (view: string, role: string): boolean => {
  if (view === 'guide_livre' || view === 'manuel_guide' || view === 'livre') {
    return true;
  }

  if (role === 'superadmin' || role === 'directeur') {
    return true;
  }

  const rolePermissions: Record<string, string[]> = {
    medecin: [
      'welcome', 'staff_welcome', 'dashboard', 'clinical_workflow', 'chaine_production', 'queue', 'patients', 'consultations', 'prescriptions', 'ordonnances',
      'exams', 'examens', 'appointments', 'patient_messages', 'messages_patients', 'team_chat', 'chat_equipe',
      'assignments', 'assignations', 'national_directory', 'annuaire', 'inter_hopitaux', 'dmp_tchad', 'reseau_national', 'security_compliance', 'securite', 'emergency_qr'
    ],
    infirmier: [
      'welcome', 'staff_welcome', 'clinical_workflow', 'chaine_production', 'queue', 'patients', 'assignments', 'assignations',
      'patient_messages', 'messages_patients', 'team_chat', 'chat_equipe',
      'national_directory', 'annuaire', 'inter_hopitaux', 'dmp_tchad', 'reseau_national', 'security_compliance', 'securite', 'emergency_qr'
    ],
    responsable_soins: [
      'welcome', 'staff_welcome', 'clinical_workflow', 'chaine_production', 'queue', 'patients', 'exams', 'examens', 'pharmacy', 'pharmacie',
      'assignments', 'assignations', 'patient_messages', 'messages_patients', 'team_chat', 'chat_equipe',
      'national_directory', 'annuaire', 'inter_hopitaux', 'dmp_tchad', 'reseau_national', 'security_compliance', 'securite', 'emergency_qr'
    ],
    tech_laboratoire: [
      'welcome', 'staff_welcome', 'clinical_workflow', 'chaine_production', 'exams', 'examens', 'team_chat', 'chat_equipe',
      'national_directory', 'annuaire', 'inter_hopitaux', 'dmp_tchad', 'reseau_national', 'security_compliance', 'securite', 'emergency_qr'
    ],
    tech_imagerie: [
      'welcome', 'staff_welcome', 'clinical_workflow', 'chaine_production', 'exams', 'examens', 'team_chat', 'chat_equipe',
      'national_directory', 'annuaire', 'inter_hopitaux', 'dmp_tchad', 'reseau_national', 'security_compliance', 'securite', 'emergency_qr'
    ],
    accueil: [
      'welcome', 'staff_welcome', 'clinical_workflow', 'chaine_production', 'queue', 'patients', 'appointments', 'billing',
      'team_chat', 'chat_equipe', 'national_directory', 'annuaire', 'inter_hopitaux', 'dmp_tchad', 'reseau_national', 'security_compliance', 'securite', 'emergency_qr'
    ],
    gestionnaire: [
      'welcome', 'staff_welcome', 'dashboard', 'clinical_workflow', 'chaine_production', 'pharmacy', 'pharmacie', 'billing', 'appointments',
      'audit_logs', 'activity_log', 'qr_access_log',
      'team_chat', 'chat_equipe', 'national_directory', 'annuaire', 'inter_hopitaux', 'dmp_tchad', 'reseau_national', 'subscriptions', 'abonnements', 'security_compliance', 'securite', 'emergency_qr'
    ],
    patient: [
      'patient_portal', 'emergency_qr', 'national_directory', 'annuaire', 'inter_hopitaux', 'dmp_tchad', 'security_compliance', 'securite'
    ],
  };

  const allowed = rolePermissions[role] || ['welcome', 'staff_welcome', 'national_directory', 'annuaire'];
  return allowed.includes(view);
};

const AppContent: React.FC = () => {
  const { currentView, currentUser, isWorkstationLocked, isAuthenticated, setCurrentView } = useClinic();
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showQRDisplay, setShowQRDisplay] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  // 1. MANDATORY AUTHENTICATION GUARD
  // Tant que l'utilisateur n'est pas authentifié, l'application est strictement inaccessible.
  // La page de connexion (Login) s'affiche en premier en plein écran (100% largeur et hauteur).
  if (!isAuthenticated) {
    return (
      <div id="daro-login-container" className="w-full h-full min-h-screen flex flex-col bg-slate-900 text-slate-100 overflow-y-auto">
        <LoginView />
      </div>
    );
  }

  // If in public landing mode, render landing page
  if (currentView === 'public_landing') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
        <PublicLandingView onOpenScanner={() => setShowQRScanner(true)} />
        <QRModalScanner isOpen={showQRScanner} onClose={() => setShowQRScanner(false)} />
        <PatientJourneyWalkthrough isOpen={showWalkthrough} onClose={() => setShowWalkthrough(false)} />
      </div>
    );
  }

  // If viewing emergency QR card (standalone mode or accessed via scan)
  if (currentView === 'emergency_qr') {
    return (
      <div className="min-h-screen bg-slate-950 text-white font-sans antialiased">
        <EmergencyQRView />
        <QRModalScanner isOpen={showQRScanner} onClose={() => setShowQRScanner(false)} />
        <PatientJourneyWalkthrough isOpen={showWalkthrough} onClose={() => setShowWalkthrough(false)} />
      </div>
    );
  }

  const renderView = () => {
    // Check strict role-based access for non-director / non-superadmin users
    if (!isViewAllowedForRole(currentView, currentUser.role)) {
      return (
        <AccessDeniedWorkstationGuard
          attemptedView={currentView}
          onRedirectToAllowed={() =>
            setCurrentView(
              currentUser.role === 'patient'
                ? 'patient_portal'
                : currentUser.role === 'gestionnaire'
                ? 'dashboard'
                : 'welcome'
            )
          }
        />
      );
    }

    switch (currentView) {
      case 'welcome':
      case 'staff_welcome':
        return <StaffWelcomeView onOpenScanner={() => setShowQRScanner(true)} />;
      case 'dashboard':
        return <DashboardView onOpenScanner={() => setShowQRScanner(true)} />;
      case 'clinical_workflow':
      case 'chaine_production':
        return <ClinicalWorkflowView />;
      case 'queue':
        return <QueueView />;
      case 'patients':
        return <PatientsView />;
      case 'consultations':
        return <ConsultationsView />;
      case 'prescriptions':
      case 'ordonnances':
        return <PrescriptionsView />;
      case 'exams':
      case 'examens':
        return <ExamsView />;
      case 'pharmacy':
      case 'pharmacie':
        return <PharmacyView />;
      case 'billing':
        return <BillingView />;
      case 'appointments':
        return <AppointmentsView />;
      case 'patient_portal':
        return <PatientPortalView />;
      case 'patient_messages':
      case 'messages_patients':
        return <PatientMessagingView />;
      case 'team_chat':
      case 'chat_equipe':
        return <TeamChatView />;
      case 'assignments':
      case 'assignations':
        return <AssignmentsView />;
      case 'superadmin':
      case 'etablissements':
        return <SuperAdminView />;
      case 'users':
      case 'users_admin':
      case 'personnel':
        return <StaffManagementView />;
      case 'audit_logs':
      case 'activity_log':
      case 'qr_access_log':
        return <AuditLogsView />;
      case 'national_directory':
      case 'annuaire':
        return <NationalDirectoryView />;
      case 'inter_hopitaux':
      case 'dmp_tchad':
      case 'reseau_national':
        return <InterHopitauxView />;
      case 'subscriptions':
      case 'abonnements':
        return (
          <div className="p-4 sm:p-8 max-w-7xl mx-auto">
            <SubscriptionBillingModal
              isOpen={true}
              onClose={() => setCurrentView(currentUser.role === 'superadmin' ? 'superadmin' : 'dashboard')}
            />
          </div>
        );
      case 'security_compliance':
      case 'securite':
        return (
          <div className="p-4 sm:p-8 max-w-7xl mx-auto">
            <SecurityComplianceModal
              isOpen={true}
              onClose={() => setCurrentView(currentUser.role === 'superadmin' ? 'superadmin' : 'dashboard')}
            />
          </div>
        );
      case 'guide_livre':
      case 'manuel_guide':
      case 'livre':
        return (
          <div className="p-2 sm:p-6 max-w-7xl mx-auto">
            <UserGuideBookView
              onClose={() => setCurrentView(currentUser.role === 'superadmin' ? 'superadmin' : 'dashboard')}
            />
          </div>
        );
      default:
        return currentUser.role === 'superadmin' ? (
          <SuperAdminView />
        ) : (
          <DashboardView onOpenScanner={() => setShowQRScanner(true)} />
        );
    }
  };

  // Main Clinical Application Layout matching the "Professional Polish" Theme
  // Structure: Full-height flex row with left sidebar, and right main column with header and scrollable view
  return (
    <div id="daro-app-layout" className="flex h-[100dvh] min-h-[100dvh] w-full max-w-[100vw] bg-[#F8FAFC] font-sans overflow-hidden text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900 relative">
      {/* Left Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isMobileOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
      />

      {/* Right Column: Header + Main View */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 h-full w-full">
        <Header
          onOpenScanner={() => setShowQRScanner(true)}
          onOpenQRScanner={() => setShowQRScanner(true)}
          onOpenQRDisplay={() => setShowQRDisplay(true)}
          onOpenWalkthrough={() => setShowWalkthrough(true)}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onToggleSidebarMobile={() => setSidebarOpen(!sidebarOpen)}
          onOpenSecurity={() => setShowSecurityModal(true)}
          onOpenSubscriptions={() => setShowSubscriptionModal(true)}
        />

        {/* Scrollable Main View Container (Centralized full-width & full-height inheritance with mobile bottom nav space) */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#F8FAFC] w-full h-full pb-16 md:pb-0">
          <div className="w-full min-h-full">
            {renderView()}
          </div>
        </main>

        {/* Mobile Bottom Navigation Bar (< 768px) */}
        <MobileBottomNav onOpenMenu={() => setSidebarOpen(true)} />
      </div>

      {/* Global Modals */}
      <QRDisplayModal isOpen={showQRDisplay} onClose={() => setShowQRDisplay(false)} />
      <QRModalScanner isOpen={showQRScanner} onClose={() => setShowQRScanner(false)} />
      <PatientJourneyWalkthrough isOpen={showWalkthrough} onClose={() => setShowWalkthrough(false)} />
      <WorkstationLoginModal isOpen={isWorkstationLocked} isLockScreen={true} onClose={() => {}} />
      <SubscriptionBillingModal isOpen={showSubscriptionModal} onClose={() => setShowSubscriptionModal(false)} />
      <SecurityComplianceModal isOpen={showSecurityModal} onClose={() => setShowSecurityModal(false)} />
    </div>
  );
};

export default function App() {
  return (
    <ClinicProvider>
      <AppContent />
    </ClinicProvider>
  );
}
