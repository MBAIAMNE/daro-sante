import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  QrCode,
  Search,
  Plus,
  Activity,
  ChevronDown,
  LogOut,
  Users,
  CheckCheck,
  ShieldCheck,
  X,
  Menu,
  Building2,
  Globe2,
  UserCog,
  Monitor,
  Lock,
  Key,
  Heart,
  Receipt,
  Phone,
  BookOpen,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { PWAInstallButton } from './PWAInstallButton';
import { HospitalResilienceWidget } from './HospitalResilienceWidget';
import { UserProfileModal } from './UserProfileModal';
import { PatientProfileModal } from './PatientProfileModal';
import { WorkstationLoginModal } from './WorkstationLoginModal';
import { UserRole } from '../types';

interface HeaderProps {
  onOpenScanner?: () => void;
  onOpenQRScanner?: () => void;
  onOpenQRDisplay?: () => void;
  onOpenWalkthrough?: () => void;
  onToggleSidebar?: () => void;
  onToggleSidebarMobile?: () => void;
  onOpenSecurity?: () => void;
  onOpenSubscriptions?: () => void;
}

const ROLE_LABELS: Record<UserRole, { label: string; roleName: string }> = {
  superadmin: { label: 'Super Administrateur DARÔ', roleName: 'Plateforme' },
  directeur: { label: 'Directeur d\'Établissement', roleName: 'Direction' },
  gestionnaire: { label: 'Gestionnaire Admin', roleName: 'Gestion' },
  medecin: { label: 'Médecin Praticien', roleName: 'Médecine' },
  infirmier: { label: 'Infirmier Triage', roleName: 'Soins' },
  accueil: { label: 'Accueil & Caisse', roleName: 'Accueil' },
  responsable_soins: { label: 'Responsable Soins', roleName: 'Coordination' },
  tech_laboratoire: { label: 'Technicien Labo', roleName: 'Laboratoire' },
  tech_imagerie: { label: 'Technicien Imagerie', roleName: 'Radiologie' },
  pharmacien: { label: 'Pharmacien Hospitalier', roleName: 'Pharmacie' },
  caissier: { label: 'Caissier & Facturation', roleName: 'Caisse' },
  patient: { label: 'Espace Patient', roleName: 'Patient' },
};

export const Header: React.FC<HeaderProps> = ({
  onOpenScanner,
  onOpenQRScanner,
  onOpenQRDisplay,
  onOpenWalkthrough,
  onToggleSidebar,
  onToggleSidebarMobile,
  onOpenSecurity,
  onOpenSubscriptions,
}) => {
  const {
    currentUser,
    currentRole,
    users,
    patients,
    setSelectedPatientForDetail,
    isPatientMode,
    activePatient,
    logoutToPublic,
    notifications,
    userNotifications,
    unreadCount,
    marquerNotificationLue,
    marquerToutesNotificationsLues,
    setCurrentView,
    etablissements,
    currentEtablissement,
    selectedEtablissementId,
    setSelectedEtablissementId,
    verrouillerPoste,
    logout,
  } = useClinic();

  const displayNotifications = userNotifications || notifications;

  const handleScanner = onOpenScanner || onOpenQRScanner || (() => {});
  const handleWalkthrough = onOpenWalkthrough || (() => {});
  const handleSidebarToggle = onToggleSidebar || onToggleSidebarMobile || (() => {});

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPatientProfileModal, setShowPatientProfileModal] = useState(false);
  const [showWorkstationLogin, setShowWorkstationLogin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifMenu(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setShowRoleMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const matchingPatients = searchQuery.trim()
    ? patients.filter(
        p =>
          p.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.matricule.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.telephone.includes(searchQuery)
      )
    : [];

  const handleSelectPatient = (patient: (typeof patients)[0]) => {
    setSelectedPatientForDetail(patient);
    setCurrentView('patients');
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleNotificationClick = (notif: { id: string; cibleModule?: string }) => {
    marquerNotificationLue(notif.id);
    if (notif.cibleModule) {
      setCurrentView(notif.cibleModule);
    }
    setShowNotifMenu(false);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 flex-shrink-0">
      {/* Left: Mobile hamburger & Search input OR Patient space indicator */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={handleSidebarToggle}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {isPatientMode || currentRole === 'patient' ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-700 shadow-2xs flex-shrink-0">
              <Heart className="w-4 h-4 fill-teal-500 text-teal-600" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 truncate">
                  Espace Santé Patient
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-teal-100 text-teal-800 border border-teal-200 flex-shrink-0">
                  Compte Indépendant
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium truncate max-w-[200px] sm:max-w-none">
                {activePatient?.etablissementNom || 'Clinique Partenaire'} • Pass Vital {activePatient?.matricule || currentUser.nomUtilisateur}
              </p>
            </div>
          </div>
        ) : (
          /* Search bar matching Professional Polish Theme */
          <div ref={searchRef} className="relative w-full">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              placeholder="Rechercher un patient ou un dossier..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-transparent rounded-lg text-sm focus:bg-white focus:border-[#1E88E5] focus:ring-1 focus:ring-[#1E88E5] focus:outline-none transition-all placeholder:text-slate-400 text-slate-800"
            />

            {/* Real-time search results popup */}
            {showSearchResults && searchQuery.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 max-h-80 overflow-y-auto">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400">
                  Résultats patients ({matchingPatients.length})
                </div>
                {matchingPatients.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-slate-500 italic">
                    Aucun dossier trouvé pour « {searchQuery} »
                  </div>
                ) : (
                  matchingPatients.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectPatient(p)}
                      className="w-full px-4 py-2.5 hover:bg-blue-50 text-left flex items-center justify-between transition-colors"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-800">
                          {p.nom} {p.prenom}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {p.matricule} • {p.adresse}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-[#1E88E5]">
                        {p.groupeSanguin}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {isPatientMode || currentRole === 'patient' ? (
          <>
            {/* Quick Action: Emergency SAMU 15 */}
            <a
              href="tel:15"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-lg transition-colors shadow-2xs"
              title="Appeler les urgences SAMU 15"
            >
              <Phone className="w-3.5 h-3.5 text-rose-600" />
              <span>SAMU 15</span>
            </a>

            {/* Quick Action: My Pass QR */}
            {onOpenQRDisplay && (
              <button
                type="button"
                onClick={onOpenQRDisplay}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold text-xs rounded-lg transition-colors shadow-2xs cursor-pointer"
                title="Afficher mon QR code Pass Vital"
              >
                <QrCode className="w-4 h-4 text-teal-600" />
                <span className="hidden sm:inline">Mon Pass QR</span>
              </button>
            )}

            {/* PWA Install Button */}
            <div className="hidden xl:block">
              <PWAInstallButton />
            </div>

            {/* Notification Bell for Patient */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
                aria-label="Notifications patient"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-teal-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] text-white font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifMenu && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-900">Mes Notifications Santé</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={marquerToutesNotificationsLues}
                        className="text-[10px] text-teal-600 hover:underline font-semibold"
                      >
                        Tout marquer comme lu
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                    {displayNotifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        Aucune notification pour le moment
                      </div>
                    ) : (
                      displayNotifications.slice(0, 8).map(n => (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                            !n.lu ? 'bg-teal-50/50 font-medium' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-slate-800">{n.titre}</p>
                            {!n.lu && <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>}
                          </div>
                          <p className="text-slate-500 text-[11px] mt-0.5">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">{n.timestamp}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Vertical Divider */}
            <div className="h-8 w-[1px] bg-slate-200"></div>

            {/* Patient Profile Dropdown */}
            <div ref={roleRef} className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-teal-100 overflow-hidden border border-teal-300 flex-shrink-0">
                  <img
                    src={
                      activePatient?.avatar ||
                      currentUser.avatar ||
                      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
                    }
                    alt={activePatient?.nom || currentUser.nom}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden sm:block text-left pr-1">
                  <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                    {activePatient ? `${activePatient.prenom} ${activePatient.nom}` : `${currentUser.prenom} ${currentUser.nom}`}
                  </p>
                  <p className="text-[10px] text-teal-700 font-semibold leading-tight">
                    Patient • {activePatient?.matricule || 'Citoyen'}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-800">
                      {activePatient ? `${activePatient.prenom} ${activePatient.nom}` : `${currentUser.prenom} ${currentUser.nom}`}
                    </p>
                    <p className="text-[10px] text-teal-700 font-medium">
                      Pass Médical Citoyen N° {activePatient?.matricule || currentUser.nomUtilisateur}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                      Compte Patient Indépendant
                    </span>
                  </div>

                  <div className="p-2 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPatientProfileModal(true);
                        setShowRoleMenu(false);
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold flex items-center gap-2 transition"
                    >
                      <UserCog className="w-3.5 h-3.5 text-teal-600" />
                      <span>Consulter / Modifier mon profil</span>
                    </button>

                    {onOpenQRDisplay && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenQRDisplay();
                          setShowRoleMenu(false);
                        }}
                        className="w-full px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-2 transition text-left"
                      >
                        <QrCode className="w-3.5 h-3.5 text-slate-500" />
                        <span>Afficher mon Pass QR Vital</span>
                      </button>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-1 mt-1">
                    <button
                      onClick={() => {
                        logout();
                        setShowRoleMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-bold transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Déconnexion Espace Patient</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Header Logout Button */}
            <button
              type="button"
              id="header-logout-btn"
              onClick={logout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 hover:text-rose-800 border border-rose-200/80 text-xs font-bold transition-all shadow-2xs cursor-pointer ml-1"
              title="Se déconnecter et retourner à la page de connexion"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </>
        ) : (
          /* Clinical Staff Header Controls */
          <>
            {/* Establishment Scoping Pill */}
            {currentUser.role === 'superadmin' ? (
              <div className="hidden md:flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
                <Globe2 className="w-3.5 h-3.5 text-[#1E88E5]" />
                <select
                  value={selectedEtablissementId}
                  onChange={(e) => setSelectedEtablissementId(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 border-none outline-none cursor-pointer pr-1"
                  title="Filtrer l'affichage par établissement"
                >
                  <option value="all">🌐 Réseau DARÔ Santé (Tous)</option>
                  {etablissements.map(e => (
                    <option key={e.id} value={e.id}>
                      🏥 {e.nom} ({e.ville})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div
                className="hidden md:flex items-center gap-1.5 bg-blue-50/80 border border-blue-100 rounded-lg px-2.5 py-1 text-xs text-[#0B3C5D]"
                title={`Établissement rattaché : ${currentUser.etablissementNom || currentEtablissement?.nom || 'Clinique Espoir'}`}
              >
                <Building2 className="w-3.5 h-3.5 text-[#1E88E5]" />
                <span className="font-bold truncate max-w-[160px]">
                  {currentUser.etablissementNom || currentEtablissement?.nom || 'Clinique Médicale Espoir'}
                </span>
                <span className="text-[10px] text-slate-500 font-normal">
                  • {currentEtablissement?.ville || "N'Djamena"}
                </span>
              </div>
            )}

            {/* Hospital Resilience & Continuity Indicator (Anti-Coupures SNE / Générateur / Solaire) */}
            <div className="hidden lg:block">
              <HospitalResilienceWidget />
            </div>

            {/* Quick Action: Display Scannable QR Code */}
            {onOpenQRDisplay && (
              <button
                onClick={onOpenQRDisplay}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-lg transition-colors shadow-xs"
                title="Afficher le QR code d'urgence pour le scanner avec votre téléphone"
              >
                <QrCode className="w-4 h-4 text-rose-600" />
                <span className="hidden sm:inline">Afficher</span>
                <span>QR à Scanner</span>
              </button>
            )}

            {/* Quick Action: Scan QR (Emergency) */}
            <button
              onClick={handleScanner}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#0B3C5D] font-semibold text-xs rounded-lg transition-colors"
              title="Scanner un QR code patient d'urgence"
            >
              <QrCode className="w-4 h-4 text-[#1E88E5]" />
              <span>Scanner QR</span>
            </button>

            {/* Quick Action: Walkthrough simulation */}
            <button
              onClick={handleWalkthrough}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#1E88E5] font-semibold text-xs rounded-lg transition-colors"
              title="Simulation de la chaîne patient"
            >
              <Activity className="w-3.5 h-3.5 text-[#1E88E5]" />
              <span>Chaîne Patient</span>
            </button>

            {/* Quick Action: Security & Encryption HDS Modal */}
            {onOpenSecurity && (
              <button
                onClick={onOpenSecurity}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs rounded-lg transition-colors shadow-xs"
                title="Consulter le bouclier de sécurité clinique et conformité HDS"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sécurité HDS</span>
              </button>
            )}

            {/* Quick Action: Grand Livre & Manuel d'utilisation */}
            <button
              onClick={() => setCurrentView('guide_livre')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs rounded-lg transition-colors shadow-xs cursor-pointer"
              title="Consulter le Grand Livre & Manuel d'Utilisation Officiel DARÔ"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-700" />
              <span>Guide Livre</span>
            </button>

            {/* Quick Action: Subscriptions & SaaS (Admin / Director) */}
            {onOpenSubscriptions && (currentUser.role === 'superadmin' || currentUser.role === 'directeur' || currentUser.role === 'gestionnaire') && (
              <button
                onClick={onOpenSubscriptions}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs rounded-lg transition-colors shadow-xs"
                title="Gérer les abonnements et forfaits SaaS hospitaliers"
              >
                <Receipt className="w-3.5 h-3.5 text-indigo-600" />
                <span>Abonnements</span>
              </button>
            )}

            {/* PWA Install Button */}
            <div className="hidden xl:block">
              <PWAInstallButton />
            </div>

            {/* Notification Bell with Badge (Professional Polish Theme) */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] text-white font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifMenu && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0B3C5D]">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={marquerToutesNotificationsLues}
                        className="text-[10px] text-[#1E88E5] hover:underline font-semibold"
                      >
                        Tout marquer comme lu
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                    {displayNotifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        Aucune notification
                      </div>
                    ) : (
                      displayNotifications.slice(0, 8).map(n => (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                            !n.lu ? 'bg-blue-50/50 font-medium' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-slate-800">{n.titre}</p>
                            {!n.lu && <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
                          </div>
                          <p className="text-slate-500 text-[11px] mt-0.5">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">{n.timestamp}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Vertical Divider (Professional Polish Theme) */}
            <div className="h-8 w-[1px] bg-slate-200"></div>

            {/* Primary Action Button: + Nouvelle Consultation */}
            <button
              onClick={() => setCurrentView('consultations')}
              className="bg-[#1E88E5] text-white px-3.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-[#1677cc] transition-colors shadow-sm flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">Nouvelle Consultation</span>
              <span className="xs:hidden">Consultation</span>
            </button>

            {/* Workstation Badge & Quick Lock (Hospital Security) */}
            {!isPatientMode && (
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100/90 hover:bg-slate-200/80 rounded-xl border border-slate-200 text-xs text-slate-700 transition">
                <Monitor className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span
                  className="font-semibold max-w-[120px] lg:max-w-[150px] truncate text-[11px]"
                  title={`Poste actif : ${currentUser.posteActif || 'Poste Clinique'}`}
                >
                  {currentUser.posteActif || 'Poste Clinique'}
                </span>
                <div className="h-3 w-[1px] bg-slate-300 mx-0.5" />
                <button
                  type="button"
                  onClick={verrouillerPoste}
                  className="p-1 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded transition"
                  title="Verrouiller mon poste de travail"
                >
                  <Lock className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowWorkstationLogin(true)}
                  className="p-1 text-slate-500 hover:text-sky-700 hover:bg-sky-50 rounded transition"
                  title="Connexion / Changer de poste avec mot de passe"
                >
                  <Key className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Bouton Grand Livre d'Exploitation & Manuel */}
            <button
              onClick={() => setCurrentView('guide_livre')}
              className="p-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              title="Consulter le Grand Livre & Manuel d'Utilisation"
            >
              <BookOpen className="w-4 h-4 text-teal-700" />
              <span className="hidden xl:inline">Livre Guide</span>
            </button>

            {/* Role Switcher Pill Dropdown */}
            <div ref={roleRef} className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-300 flex-shrink-0">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.nom}
                    className="w-full h-full object-cover"
                  />
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
              </button>

              {/* Role selector dropdown */}
              {showRoleMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {currentUser.prenom} {currentUser.nom}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {currentUser.id === 'u-superadmin' || currentUser.role === 'superadmin'
                          ? 'Concepteur & Super Admin'
                          : (ROLE_LABELS[currentRole]?.label || currentRole)}
                      </p>
                    </div>
                  </div>

                  {/* Edit my profile & photo button */}
                  <div className="p-2 border-b border-slate-100 bg-slate-50/50 space-y-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileModal(true);
                        setShowRoleMenu(false);
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-white hover:bg-blue-50 text-[#1E88E5] border border-blue-100 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
                    >
                      <UserCog className="w-3.5 h-3.5" />
                      <span>Modifier mon profil & photo</span>
                    </button>

                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          verrouillerPoste();
                          setShowRoleMenu(false);
                        }}
                        className="px-2 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-bold flex items-center justify-center gap-1.5 transition"
                        title="Verrouiller ce poste"
                      >
                        <Lock className="w-3 h-3 text-amber-700" />
                        <span>Verrouiller</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowWorkstationLogin(true);
                          setShowRoleMenu(false);
                        }}
                        className="px-2 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 text-[11px] font-bold flex items-center justify-center gap-1.5 transition"
                        title="Connexion sécurisée"
                      >
                        <Key className="w-3 h-3 text-sky-700" />
                        <span>Connexion</span>
                      </button>
                    </div>
                  </div>

                  <div className="py-2.5 px-3 bg-slate-50/70 border-y border-slate-100 text-[11px] space-y-1.5">
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Statut de session</span>
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active & Sécurisée
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Établissement</span>
                      <span className="font-semibold text-slate-700 max-w-[140px] truncate text-right">
                        {currentEtablissement?.nom || 'Clinique Espoir'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Poste actif</span>
                      <span className="font-mono text-slate-700">
                        {currentUser.posteActif || 'Bureau Médical'}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-1 mt-1">
                    <button
                      onClick={() => {
                        logout();
                        setShowRoleMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-bold transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Se déconnecter de DARÔ</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Header Logout Button */}
            <button
              type="button"
              id="header-logout-btn"
              onClick={logout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 hover:text-rose-800 border border-rose-200/80 text-xs font-bold transition-all shadow-2xs cursor-pointer ml-1"
              title="Se déconnecter et retourner à la page de connexion"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </>
        )}
      </div>

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

      {/* Workstation Authentication & Login Modal */}
      <WorkstationLoginModal
        isOpen={showWorkstationLogin}
        onClose={() => setShowWorkstationLogin(false)}
      />
    </header>
  );
};
