import React from 'react';
import {
  LayoutDashboard,
  Users,
  Video,
  Clock,
  Menu,
  CreditCard,
  Building2,
  FileText,
  MessageSquare,
  QrCode,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';

interface MobileBottomNavProps {
  onOpenMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenMenu }) => {
  const {
    currentRole,
    currentView,
    setCurrentView,
    isPatientMode,
    patientPortalTab,
    openPatientTab,
    queue,
    appointments,
    getUnreadPatientMessagesCount,
  } = useClinic();

  const waitingCount = queue.filter(
    q => q.statut === 'en_attente' || q.statut === 'triage_fait'
  ).length;

  const teleconsultCount = appointments.filter(
    a => a.type === 'teleconsultation' && a.statut !== 'termine'
  ).length;

  // Patient Mode Bottom Navigation
  if (isPatientMode || currentRole === 'patient') {
    return (
      <nav
        aria-label="Navigation mobile patient"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg safe-area-pb"
      >
        <button
          type="button"
          onClick={() => openPatientTab('carte')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition cursor-pointer ${
            currentView === 'patient_portal' && patientPortalTab === 'carte'
              ? 'text-[#1E88E5] font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <QrCode className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Pass Vital</span>
        </button>

        <button
          type="button"
          onClick={() => openPatientTab('rdv')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition cursor-pointer relative ${
            currentView === 'patient_portal' && patientPortalTab === 'rdv'
              ? 'text-purple-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Video className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Téléconsult</span>
          {teleconsultCount > 0 && (
            <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-purple-600" />
          )}
        </button>

        <button
          type="button"
          onClick={() => openPatientTab('ordonnances')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition cursor-pointer ${
            currentView === 'patient_portal' && patientPortalTab === 'ordonnances'
              ? 'text-[#1E88E5] font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Ordonnances</span>
        </button>

        <button
          type="button"
          onClick={() => openPatientTab('messages')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition cursor-pointer ${
            currentView === 'patient_portal' && patientPortalTab === 'messages'
              ? 'text-[#1E88E5] font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Messages</span>
        </button>

        <button
          type="button"
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-500 hover:text-slate-800 transition cursor-pointer"
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Plus</span>
        </button>
      </nav>
    );
  }

  // Staff / Doctor / Admin / Superadmin Mode Bottom Navigation
  return (
    <nav
      aria-label="Navigation mobile clinique"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg safe-area-pb"
    >
      <button
        type="button"
        onClick={() => setCurrentView(currentRole === 'superadmin' ? 'superadmin' : 'dashboard')}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition cursor-pointer ${
          currentView === 'dashboard' || currentView === 'superadmin'
            ? 'text-[#1E88E5] font-bold'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        {currentRole === 'superadmin' ? (
          <Building2 className="w-5 h-5 mb-0.5" />
        ) : (
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
        )}
        <span className="text-[10px] tracking-tight">
          {currentRole === 'superadmin' ? 'Réseau' : 'Accueil'}
        </span>
      </button>

      {currentRole !== 'superadmin' && (
        <button
          type="button"
          onClick={() => setCurrentView('queue')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition cursor-pointer relative ${
            currentView === 'queue' ? 'text-[#1E88E5] font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Urgences</span>
          {waitingCount > 0 && (
            <span className="absolute top-0 right-1 px-1 min-w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[8px] font-black flex items-center justify-center">
              {waitingCount}
            </span>
          )}
        </button>
      )}

      <button
        type="button"
        onClick={() => setCurrentView('patients')}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition cursor-pointer ${
          currentView === 'patients' ? 'text-[#1E88E5] font-bold' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <Users className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">Patients</span>
      </button>

      <button
        type="button"
        onClick={() => setCurrentView('appointments')}
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition cursor-pointer relative ${
          currentView === 'appointments' ? 'text-purple-600 font-bold' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <Video className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">Téléconsult</span>
        {teleconsultCount > 0 && (
          <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-purple-600" />
        )}
      </button>

      <button
        type="button"
        onClick={onOpenMenu}
        className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-500 hover:text-slate-800 transition cursor-pointer"
      >
        <Menu className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">Menu</span>
      </button>
    </nav>
  );
};
