import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Phone,
  Mail,
  Shield,
  Stethoscope,
  Building2,
  KeyRound,
  Power,
  Edit2,
  Lock,
  Camera,
  Clock,
  UserCheck,
  UserX,
  SlidersHorizontal,
  Check,
  History,
  Eye,
  EyeOff,
  Copy,
  QrCode,
  Printer,
  ExternalLink,
  Droplet,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { User, UserRole, UserAccountStatus, Patient } from '../types';
import { UserProfileModal } from '../components/UserProfileModal';
import { DeactivateUserModal } from '../components/DeactivateUserModal';
import { UserHistoryModal } from '../components/UserHistoryModal';
import { PatientQRCardPrintModal } from '../components/PatientQRCardPrintModal';

const ROLE_OPTIONS: { role: UserRole; label: string; description: string }[] = [
  { role: 'medecin', label: 'Médecin Praticien', description: 'Consultations, diagnostics et ordonnances' },
  { role: 'infirmier', label: 'Infirmier(ère) Triage', description: 'Accueil clinique, mesure des constantes, orientation' },
  { role: 'accueil', label: 'Accueil & Facturation', description: 'Création dossier patient, tickets d\'attente, encaissement' },
  { role: 'responsable_soins', label: 'Responsable des Soins', description: 'Supervision des files, assignations et flux' },
  { role: 'tech_laboratoire', label: 'Technicien Laboratoire', description: 'Validation des analyses biologiques' },
  { role: 'tech_imagerie', label: 'Technicien Imagerie', description: 'Radiographies et échographies' },
  { role: 'gestionnaire', label: 'Gestionnaire Administratif', description: 'Gestion financière, stocks et personnel' },
  { role: 'directeur', label: 'Directeur Général', description: 'Direction générale de l\'établissement' },
];

export const StaffManagementView: React.FC = () => {
  const {
    currentUser,
    currentRole,
    users,
    allUsers,
    currentEtablissement,
    creerUtilisateur,
    modifierUtilisateur,
    changerStatutUtilisateur,
    toggleStatutUtilisateur,
    reinitialiserMotDePasse,
    selectedEtablissementId,
    etablissements,
    allConsultations,
    ordonnances,
    exams,
    patients,
    allPatients,
    modifierPatient,
  } = useClinic();

  const isSuperAdmin = currentUser.role === 'superadmin';
  const isDirecteurOrAdmin = ['directeur', 'superadmin'].includes(currentUser.role);

  // Target establishment: For Director, strictly their own. For SuperAdmin, selected or all.
  const targetEtablissementNom = isSuperAdmin
    ? (selectedEtablissementId === 'all'
        ? 'Tous les Établissements (Mode Global Réseau)'
        : etablissements.find(e => e.id === selectedEtablissementId)?.nom || 'Établissement')
    : (currentUser.etablissementNom || currentEtablissement?.nom || 'Clinique');

  // Navigation tab between Staff & Patient Accounts
  const [adminTab, setAdminTab] = useState<'staff' | 'patients'>('staff');

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('tous');
  const [filterStatut, setFilterStatut] = useState<'tous' | UserAccountStatus>('tous');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToEditProfile, setUserToEditProfile] = useState<User | null>(null);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [statusModalUser, setStatusModalUser] = useState<User | null>(null);
  const [targetStatutSelection, setTargetStatutSelection] = useState<UserAccountStatus>('actif');
  const [userToDeactivate, setUserToDeactivate] = useState<User | null>(null);
  const [userForHistory, setUserForHistory] = useState<User | null>(null);
  const [passwordResetModalUser, setPasswordResetModalUser] = useState<User | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formNom, setFormNom] = useState('');
  const [formPrenom, setFormPrenom] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formTelephone, setFormTelephone] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('medecin');
  const [formSpecialite, setFormSpecialite] = useState('');
  const [formStatut, setFormStatut] = useState<UserAccountStatus>('actif');
  const [formEtabId, setFormEtabId] = useState<string>(currentUser.etablissementId || 'etab-ndj-1');
  const [formAvatar, setFormAvatar] = useState('');
  const [formMotDePasse, setFormMotDePasse] = useState('daro2025');
  const [formNomUtilisateur, setFormNomUtilisateur] = useState('');
  const [showFormPassword, setShowFormPassword] = useState(false);

  // Credentials visibility and patient management states
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [revealedPatientPasswords, setRevealedPatientPasswords] = useState<Record<string, boolean>>({});
  const [patientToPrintQR, setPatientToPrintQR] = useState<Patient | null>(null);
  const [editingPatientPassword, setEditingPatientPassword] = useState<Patient | null>(null);
  const [newPatientPasswordInput, setNewPatientPasswordInput] = useState('');
  const [copiedCredentialId, setCopiedCredentialId] = useState<string | null>(null);

  const handleCopyCredential = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCredentialId(id);
    setTimeout(() => setCopiedCredentialId(null), 2500);
  };

  const handleSavePatientPassword = () => {
    if (!editingPatientPassword) return;
    modifierPatient({
      ...editingPatientPassword,
      motDePasse: newPatientPasswordInput.trim() || 'daro2025',
    });
    setNotificationMsg(`Le mot de passe de ${editingPatientPassword.prenom} ${editingPatientPassword.nom} a été mis à jour avec succès.`);
    setEditingPatientPassword(null);
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  // Patients list for admin view: strictly isolated to current clinic unless superadmin is in national view ('all')
  const patientsList = (currentUser.role === 'superadmin' && selectedEtablissementId === 'all') ? allPatients : patients;
  const filteredPatients = patientsList.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      p.nom.toLowerCase().includes(q) ||
      p.prenom.toLowerCase().includes(q) ||
      p.matricule.toLowerCase().includes(q) ||
      p.telephone.includes(q) ||
      (p.quartier && p.quartier.toLowerCase().includes(q))
    );
  });

  // Normalize user status helper
  const getUserStatut = (user: User): UserAccountStatus => {
    if (user.statut === 'en_attente') return 'en_attente';
    if (user.statut === 'desactive' || user.statut === 'suspendu' || user.actif === false) return 'desactive';
    return 'actif';
  };

  // Filtered staff (strictly excluding patient accounts)
  const staffList = (isSuperAdmin && selectedEtablissementId === 'all' ? allUsers : users)
    .filter(u => u.role !== 'patient');

  const totalCount = staffList.length;
  const actifsCount = staffList.filter(u => getUserStatut(u) === 'actif').length;
  const enAttenteCount = staffList.filter(u => getUserStatut(u) === 'en_attente').length;
  const desactivesCount = staffList.filter(u => getUserStatut(u) === 'desactive').length;

  const filteredStaff = staffList.filter(u => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      u.nom.toLowerCase().includes(q) ||
      u.prenom.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.specialite && u.specialite.toLowerCase().includes(q));

    const matchesRole = filterRole === 'tous' || u.role === filterRole;
    const matchesStatut = filterStatut === 'tous' || getUserStatut(u) === filterStatut;
    return matchesSearch && matchesRole && matchesStatut;
  });

  const openAddModal = () => {
    setEditingUser(null);
    setFormNom('');
    setFormPrenom('');
    setFormEmail('');
    setFormTelephone('');
    setFormRole('medecin');
    setFormSpecialite('');
    setFormStatut('actif');
    setFormMotDePasse('daro2025');
    setFormNomUtilisateur('');
    setShowFormPassword(false);
    setFormAvatar('https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80');
    setFormEtabId(currentUser.etablissementId || (isSuperAdmin && selectedEtablissementId !== 'all' ? selectedEtablissementId : 'etab-ndj-1'));
    setShowAddModal(true);
  };

  const openEditModal = (user: User) => {
    setUserToEditProfile(user);
    setShowUserProfileModal(true);
  };

  const handleOpenStatusModal = (user: User) => {
    setStatusModalUser(user);
    setTargetStatutSelection(getUserStatut(user));
  };

  const handleApplyStatusChange = async () => {
    if (!statusModalUser) return;
    if (statusModalUser.id === currentUser.id && targetStatutSelection !== 'actif') {
      alert('Vous ne pouvez pas suspendre ou désactiver votre propre compte.');
      return;
    }
    await changerStatutUtilisateur(statusModalUser.id, targetStatutSelection);
    const labels: Record<UserAccountStatus, string> = {
      actif: 'ACTIF',
      en_attente: 'EN ATTENTE DE VALIDATION',
      desactive: 'DÉSACTIVÉ',
    };
    setNotificationMsg(`Le statut de ${statusModalUser.prenom} ${statusModalUser.nom} est désormais ${labels[targetStatutSelection]}.`);
    setStatusModalUser(null);
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  const handleQuickValidate = async (user: User) => {
    await changerStatutUtilisateur(user.id, 'actif');
    setNotificationMsg(`Le compte de ${user.prenom} ${user.nom} est désormais ACTIF et validé.`);
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  const handleQuickDeactivate = (user: User) => {
    if (user.id === currentUser.id) {
      setNotificationMsg('Vous ne pouvez pas désactiver votre propre compte administrateur.');
      setTimeout(() => setNotificationMsg(null), 3500);
      return;
    }
    setUserToDeactivate(user);
  };

  const handleConfirmDeactivation = async (userId: string) => {
    const targetUser = staffList.find(u => u.id === userId);
    await changerStatutUtilisateur(userId, 'desactive');
    setNotificationMsg(
      `Le compte de ${targetUser?.prenom || ''} ${targetUser?.nom || ''} a été DÉSACTIVÉ. L'historique complet de ses consultations et actes passés reste rigoureusement préservé.`
    );
    setTimeout(() => setNotificationMsg(null), 4500);
  };

  const handleQuickReactivate = async (user: User) => {
    await changerStatutUtilisateur(user.id, 'actif');
    setNotificationMsg(`Le compte de ${user.prenom} ${user.nom} a été réactivé avec succès.`);
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNom.trim() || !formPrenom.trim() || !formEmail.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingUser) {
        // Update
        const targetEtab = isSuperAdmin ? formEtabId : (editingUser.etablissementId || currentUser.etablissementId || 'etab-1');
        await modifierUtilisateur({
          ...editingUser,
          nom: formNom.trim(),
          prenom: formPrenom.trim(),
          email: formEmail.trim(),
          telephone: formTelephone.trim(),
          role: formRole,
          specialite: formSpecialite.trim() || undefined,
          etablissementId: targetEtab,
        });
        setNotificationMsg(`Le profil de ${formPrenom} ${formNom} a été mis à jour.`);
      } else {
        // Create - enforce director's establishment or selected by superadmin
        const targetEtab = isSuperAdmin ? formEtabId : (currentUser.etablissementId || 'etab-1');
        await creerUtilisateur({
          nom: formNom.trim(),
          prenom: formPrenom.trim(),
          email: formEmail.trim(),
          telephone: formTelephone.trim() || '+235 66 00 00 00',
          role: formRole,
          specialite: formSpecialite.trim() || undefined,
          etablissementId: targetEtab,
          statut: formStatut,
          motDePasse: formMotDePasse.trim() || 'daro2025',
          nomUtilisateur: formNomUtilisateur.trim() || formEmail.trim().split('@')[0],
          avatar: `https://images.unsplash.com/photo-${formRole === 'medecin' ? '1622253692010-333f2da6031d' : '1534528741775-53994a69daeb'}?w=150&auto=format&fit=crop&q=80`,
        });
        setNotificationMsg(`Le collaborateur ${formPrenom} ${formNom} a été créé avec succès (Identifiant: ${formNomUtilisateur.trim() || formEmail.trim().split('@')[0]} / Mot de passe: ${formMotDePasse.trim() || 'daro2025'}).`);
      }

      setShowAddModal(false);
      setTimeout(() => setNotificationMsg(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatut = async (user: User) => {
    if (user.id === currentUser.id) {
      setNotificationMsg('Vous ne pouvez pas modifier votre propre statut.');
      setTimeout(() => setNotificationMsg(null), 3500);
      return;
    }

    const currentStat = getUserStatut(user);
    if (currentStat === 'actif') {
      setUserToDeactivate(user);
    } else {
      await handleQuickReactivate(user);
    }
  };

  const handleResetPassword = async (user: User) => {
    const res = await reinitialiserMotDePasse(user.id);
    setPasswordResetModalUser(user);
    setTempPassword(res.resetCode);
  };

  if (!isDirecteurOrAdmin) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Accès Restreint</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          La création et l'administration des comptes du personnel de la clinique sont strictement réservées au Directeur de l'établissement et à l'Administrateur Réseau DARÔ.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-blue-100 text-[#1E88E5] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              {targetEtablissementNom}
            </span>
            <span className="text-xs text-slate-500">• Gestion du Personnel</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B3C5D] mt-1">
            Équipe Médicale & Administrative
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            {isSuperAdmin
              ? 'Supervision des accès et comptes soignants sur l\'ensemble du réseau DARÔ.'
              : `Gérez les soignants, médecins et agents d'accueil habilités pour votre établissement (${targetEtablissementNom}).`}
          </p>
        </div>

        <button
          onClick={openAddModal}
          id="btn-ajouter-collaborateur"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E88E5] hover:bg-[#1565C0] text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex-shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Nouveau Collaborateur</span>
        </button>
      </div>

      {/* Scoping Guarantee Banner */}
      <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 flex items-center gap-2.5">
        <Shield className="w-4 h-4 text-[#1E88E5] flex-shrink-0" />
        <span>
          <strong>Cloisonnement strict par établissement :</strong> Un directeur ne peut ajouter ou administrer que le personnel rattaché à son propre établissement.
        </span>
      </div>

      {/* Notification */}
      {notificationMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Top Switcher: Staff & Collaborators vs. Patients Accounts & Passwords */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-1 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setAdminTab('staff')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              adminTab === 'staff'
                ? 'bg-white text-[#0B3C5D] shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Users className="w-4 h-4 text-[#1E88E5]" />
            <span>Personnel Soignant & Staff</span>
            <span className="px-1.5 py-0.5 rounded-md bg-blue-100 text-[#1E88E5] text-[10px] font-bold">
              {totalCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setAdminTab('patients')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              adminTab === 'patients'
                ? 'bg-white text-teal-950 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <KeyRound className="w-4 h-4 text-teal-600" />
            <span>Comptes Patients & Mots de Passe</span>
            <span className="px-1.5 py-0.5 rounded-md bg-teal-100 text-teal-800 text-[10px] font-bold">
              {patientsList.length} en ligne
            </span>
          </button>
        </div>

        {adminTab === 'patients' && (
          <div className="flex items-center gap-1.5 text-xs text-teal-800 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200">
            <Shield className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
            <span>Gestion des accès créés sur le portail en ligne DARÔ</span>
          </div>
        )}
      </div>

      {/* Staff Table Card */}
      {adminTab === 'staff' ? (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Status Filter Chips Header */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterStatut('tous')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterStatut === 'tous'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <span>Tous les collaborateurs</span>
            <span className="px-1.5 py-0.5 rounded-md bg-slate-200/80 text-[10px] text-slate-700 font-bold">
              {totalCount}
            </span>
          </button>

          <button
            onClick={() => setFilterStatut('actif')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterStatut === 'actif'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-xs'
                : 'text-slate-600 hover:bg-emerald-50/50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Actifs</span>
            <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-[10px] text-emerald-800 font-bold">
              {actifsCount}
            </span>
          </button>

          <button
            onClick={() => setFilterStatut('en_attente')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterStatut === 'en_attente'
                ? 'bg-amber-50 text-amber-900 border border-amber-300 shadow-xs'
                : 'text-slate-600 hover:bg-amber-50/50'
            }`}
          >
            <Clock className="w-3 h-3 text-amber-600" />
            <span>En attente de validation</span>
            {enAttenteCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-md bg-amber-200 text-[10px] text-amber-900 font-bold animate-pulse">
                {enAttenteCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setFilterStatut('desactive')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterStatut === 'desactive'
                ? 'bg-slate-200 text-slate-900 border border-slate-300 shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span>Désactivés</span>
            <span className="px-1.5 py-0.5 rounded-md bg-slate-300/80 text-[10px] text-slate-700 font-bold">
              {desactivesCount}
            </span>
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher un soignant par nom, spécialité, email..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#1E88E5] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none"
            >
              <option value="tous">Tous les rôles ({staffList.length})</option>
              <option value="medecin">Médecins</option>
              <option value="infirmier">Infirmiers</option>
              <option value="accueil">Accueil / Caisse</option>
              <option value="responsable_soins">Responsable des Soins</option>
              <option value="tech_laboratoire">Labo</option>
              <option value="tech_imagerie">Imagerie</option>
              <option value="directeur">Directeur</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Collaborateur</th>
                <th className="py-3 px-4">Rôle & Spécialité</th>
                <th className="py-3 px-4">Établissement</th>
                <th className="py-3 px-4">Contact & Accès (MDP)</th>
                <th className="py-3 px-4 text-center">Statut du Compte</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                    Aucun collaborateur trouvé pour les critères indiqués.
                  </td>
                </tr>
              ) : (
                filteredStaff.map(staff => {
                  const stat = getUserStatut(staff);
                  const etab = etablissements.find(e => e.id === staff.etablissementId);

                  return (
                    <tr key={staff.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => openEditModal(staff)}
                            title="Cliquer pour modifier le profil et la photo"
                            className="relative group rounded-xl overflow-hidden focus:outline-hidden"
                          >
                            <img
                              src={staff.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150'}
                              alt={staff.nom}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 group-hover:opacity-80 transition-opacity"
                            />
                            <span className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                              <Camera className="w-3.5 h-3.5" />
                            </span>
                          </button>
                          <div>
                            <button
                              type="button"
                              onClick={() => openEditModal(staff)}
                              className="font-bold text-slate-900 text-sm hover:text-[#1E88E5] text-left transition-colors"
                            >
                              {staff.prenom} {staff.nom}
                            </button>
                            <div className="text-[11px] text-slate-400">
                              Matricule : DAR-STF-{staff.id.slice(-4).toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-blue-50 text-[#1E88E5] font-bold text-[11px]">
                          {ROLE_OPTIONS.find(r => r.role === staff.role)?.label || staff.role}
                        </span>
                        {staff.specialite && (
                          <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                            {staff.specialite}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">
                          {staff.etablissementNom || etab?.nom || 'Clinique Espoir'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {etab?.ville || 'N\'Djamena'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{staff.email}</span>
                        </div>
                        {staff.telephone && (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{staff.telephone}</span>
                          </div>
                        )}
                        <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center gap-1 text-[11px]">
                          <span className="text-slate-400 font-mono text-[10px]">MDP:</span>
                          {isSuperAdmin ? (
                            <>
                              <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                                {revealedPasswords[staff.id] ? (staff.motDePasse || 'daro2025') : '••••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => setRevealedPasswords(prev => ({ ...prev, [staff.id]: !prev[staff.id] }))}
                                className="text-slate-400 hover:text-slate-700 p-0.5 rounded"
                                title={revealedPasswords[staff.id] ? 'Masquer' : 'Afficher le mot de passe (SuperAdmin)'}
                              >
                                {revealedPasswords[staff.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3 text-slate-500" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCopyCredential(staff.motDePasse || 'daro2025', `staff-pwd-${staff.id}`)}
                                className="text-slate-400 hover:text-[#1E88E5] p-0.5 rounded"
                                title="Copier le mot de passe"
                              >
                                {copiedCredentialId === `staff-pwd-${staff.id}` ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3 text-slate-500" />
                                )}
                              </button>
                              {staff.motDePasseModifie && (
                                <span className="text-[9px] bg-sky-100 text-sky-800 px-1 py-0.2 rounded font-semibold" title="Mot de passe personnalisé par l'utilisateur">
                                  Modifié
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1" title="Seul le Super Administrateur & Concepteur DARÔ a accès aux mots de passe">
                              <span>••••••••</span>
                              <span className="text-[9px] text-slate-400 font-sans italic">(Protégé Éditeur)</span>
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {stat === 'actif' && (
                          <button
                            type="button"
                            onClick={() => handleOpenStatusModal(staff)}
                            title="Compte Actif - Cliquer pour changer le statut"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Actif</span>
                          </button>
                        )}
                        {stat === 'en_attente' && (
                          <button
                            type="button"
                            onClick={() => handleOpenStatusModal(staff)}
                            title="En attente de validation - Cliquer pour valider ou gérer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition-colors animate-pulse"
                          >
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>En attente</span>
                          </button>
                        )}
                        {stat === 'desactive' && (
                          <button
                            type="button"
                            onClick={() => handleOpenStatusModal(staff)}
                            title="Compte Désactivé (accès suspendu, historique conservé) - Cliquer pour réactiver"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-colors"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            <span>Désactivé</span>
                          </button>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {stat === 'en_attente' && (
                            <button
                              onClick={() => handleQuickValidate(staff)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition"
                              title="Valider et activer ce compte soignant en 1 clic"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Valider</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenStatusModal(staff)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#1E88E5] hover:bg-blue-50 transition"
                            title="Gérer le statut (Actif / Désactivé / En attente)"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setUserForHistory(staff)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                            title="Consulter l'historique des actes et consultations passées"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => openEditModal(staff)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                            title="Modifier le profil & la photo"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleResetPassword(staff)}
                            className="p-1.5 rounded-lg text-amber-600 hover:text-amber-800 hover:bg-amber-50 transition"
                            title="Réinitialiser le mot de passe"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => stat === 'actif' ? handleQuickDeactivate(staff) : handleQuickReactivate(staff)}
                            className={`p-1.5 rounded-lg transition ${
                              stat === 'actif'
                                ? 'text-rose-600 hover:bg-rose-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={
                              stat === 'actif'
                                ? "Désactiver ce compte (au lieu d'une suppression irréversible)"
                                : "Réactiver l'accès au compte"
                            }
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      ) : (
        /* Patient Accounts & Passwords Table Card */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
          {/* Header info & stats */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-teal-500/30 border border-teal-400/40 text-teal-200 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" />
                  Espace Patient & Authentification
                </span>
                <span className="text-xs text-teal-200/80">• Centralisation Clinique</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black">
                Mots de Passe & Identifiants des Patients En Ligne
              </h2>
              <p className="text-xs text-teal-100/80 max-w-2xl">
                Visualisez et administrez en toute transparence les identifiants de connexion des patients de N'Djamena créés sur le portail DARÔ.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 text-center">
                <span className="text-[11px] text-teal-200 block font-medium">Patients Répertoriés</span>
                <span className="text-base font-black">{patientsList.length}</span>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 text-center">
                <span className="text-[11px] text-teal-200 block font-medium">Mots de passe Actifs</span>
                <span className="text-base font-black text-emerald-300">{patientsList.length}</span>
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="px-4 sm:px-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom, téléphone (+235), matricule ou quartier..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Affichage de <strong>{filteredPatients.length}</strong> patient{filteredPatients.length > 1 ? 's' : ''}
            </div>
          </div>

          {/* Table of Patient Accounts */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Patient & Matricule</th>
                  <th className="py-3 px-4">Localisation & Quartier</th>
                  <th className="py-3 px-4">Identifiant de Connexion</th>
                  <th className="py-3 px-4">Mot de Passe & Code PIN</th>
                  <th className="py-3 px-4 text-center">Pass QR Vital</th>
                  <th className="py-3 px-4 text-right">Actions Administrateur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                      Aucun compte patient correspondant à votre recherche.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map(patient => {
                    const isPasswordRevealed = !!revealedPatientPasswords[patient.id];
                    const patientPwd = patient.motDePasse || 'daro2025';
                    const patientPin = patient.codePin || '1234';

                    return (
                      <tr key={patient.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Patient & Matricule */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={patient.avatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100'}
                              alt={patient.nom}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-xs"
                            />
                            <div>
                              <div className="font-bold text-slate-900 text-sm">
                                {patient.prenom} {patient.nom}
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                                <span className="font-mono font-semibold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                                  {patient.matricule}
                                </span>
                                <span>• {patient.age} ans • {patient.sexe === 'M' ? 'Homme' : 'Femme'}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Localisation & Quartier N'Djamena */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1 text-slate-800 font-semibold">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                            <span>{patient.quartier || 'N\'Djamena (Centre)'}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {patient.adresse || 'N\'Djamena, Tchad'}
                          </div>
                          {patient.electrophoreseHb && (
                            <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-mono font-bold text-[10px] border border-purple-200">
                              Hb: {patient.electrophoreseHb}
                            </span>
                          )}
                        </td>

                        {/* Identifiant de Connexion */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-900">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{patient.telephone}</span>
                              <button
                                type="button"
                                onClick={() => handleCopyCredential(patient.telephone, `tel-${patient.id}`)}
                                className="text-slate-400 hover:text-teal-600 p-0.5"
                                title="Copier le numéro identifiant"
                              >
                                {copiedCredentialId === `tel-${patient.id}` ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                            {patient.email && (
                              <div className="text-[11px] text-slate-400 flex items-center gap-1 truncate max-w-[160px]">
                                <Mail className="w-2.5 h-2.5" />
                                <span>{patient.email}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Mot de passe & Code PIN */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">MDP:</span>
                              {isSuperAdmin ? (
                                <>
                                  <span className={`px-2 py-0.5 rounded font-mono font-black text-xs ${
                                    isPasswordRevealed
                                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                                  }`}>
                                    {isPasswordRevealed ? patientPwd : '••••••••'}
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setRevealedPatientPasswords(prev => ({
                                        ...prev,
                                        [patient.id]: !prev[patient.id],
                                      }))
                                    }
                                    className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                                    title={isPasswordRevealed ? 'Masquer le mot de passe' : 'Afficher le mot de passe (SuperAdmin)'}
                                  >
                                    {isPasswordRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleCopyCredential(patientPwd, `pwd-${patient.id}`)}
                                    className="p-1 rounded text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition"
                                    title="Copier le mot de passe"
                                  >
                                    {copiedCredentialId === `pwd-${patient.id}` ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                  {patient.motDePasseModifie && (
                                    <span className="text-[9px] bg-sky-100 text-sky-800 px-1.5 py-0.2 rounded font-semibold" title="Mot de passe personnalisé par le patient">
                                      Modifié
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="px-2 py-0.5 rounded font-mono text-slate-400 bg-slate-100 border border-slate-200 text-xs flex items-center gap-1.5" title="Accès réservé au Super Administrateur / Concepteur">
                                  <span>••••••••</span>
                                  <span className="text-[9px] font-sans text-slate-400 italic">(Protégé Éditeur)</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-[11px]">
                              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">PIN:</span>
                              <span className="px-1.5 py-0.2 rounded font-mono font-bold text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200">
                                {patientPin}
                              </span>
                              <span className="text-[10px] text-slate-400">(Accès rapide mobile)</span>
                            </div>
                          </div>
                        </td>

                        {/* Pass QR & Groupe Sanguin */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`px-2 py-0.5 rounded font-black text-xs ${
                              patient.groupeSanguin.includes('-')
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-slate-100 text-slate-800 border border-slate-200'
                            }`}>
                              {patient.groupeSanguin}
                            </span>
                            <span className="text-[10px] text-teal-700 font-bold flex items-center gap-1">
                              <QrCode className="w-3 h-3" />
                              Token prêt
                            </span>
                          </div>
                        </td>

                        {/* Actions Administrateur */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setPatientToPrintQR(patient)}
                              className="px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition flex items-center gap-1 border border-teal-200 shadow-xs"
                              title="Imprimer la carte d'urgence avec QR pour ce patient"
                            >
                              <Printer className="w-3.5 h-3.5 text-teal-700" />
                              <span>Carte QR</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setEditingPatientPassword(patient);
                                setNewPatientPasswordInput(patient.motDePasse || 'daro2025');
                              }}
                              className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-50 border border-amber-200 transition"
                              title="Réinitialiser le code d'accès temporaire de ce patient"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add or Edit Staff Member */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#1E88E5] flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingUser ? 'Modifier un Collaborateur' : 'Nouveau Collaborateur'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Rattaché à : {targetEtablissementNom}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {isSuperAdmin && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Établissement de rattachement
                  </label>
                  <select
                    value={formEtabId}
                    onChange={e => setFormEtabId(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#1E88E5] focus:outline-none"
                  >
                    {etablissements.map(e => (
                      <option key={e.id} value={e.id}>
                        {e.nom} ({e.ville})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nom de famille <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formNom}
                    onChange={e => setFormNom(e.target.value)}
                    placeholder="Ex: Mahamat, Brahim..."
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#1E88E5] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Prénom <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formPrenom}
                    onChange={e => setFormPrenom(e.target.value)}
                    placeholder="Ex: Ali, Fatimé..."
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#1E88E5] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rôle fonctionnel <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formRole}
                    onChange={e => setFormRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#1E88E5] focus:outline-none"
                  >
                    {ROLE_OPTIONS.filter(r => r.role !== 'patient').map(r => (
                      <option key={r.role} value={r.role}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Spécialité / Service
                  </label>
                  <input
                    type="text"
                    value={formSpecialite}
                    onChange={e => setFormSpecialite(e.target.value)}
                    placeholder="Ex: Médecine Générale, Urgences..."
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#1E88E5] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email professionnel <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    placeholder="prenom.nom@clinique.td"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#1E88E5] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formTelephone}
                    onChange={e => setFormTelephone(e.target.value)}
                    placeholder="+235 66 12 34 56"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#1E88E5] focus:outline-none"
                  />
                </div>
              </div>

              {/* Identifiants & Mot de Passe de Connexion */}
              <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0B3C5D]">
                  <KeyRound className="w-4 h-4 text-[#1E88E5]" />
                  <span>Identifiants & Accès Sécurisé DARÔ</span>
                  <span className="text-[10px] font-normal text-slate-500">(Consultables dans l'espace admin)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Nom d'utilisateur (Login)
                    </label>
                    <input
                      type="text"
                      value={formNomUtilisateur}
                      onChange={e => setFormNomUtilisateur(e.target.value)}
                      placeholder={formEmail ? formEmail.split('@')[0] : 'ex: dr.ali'}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-[#1E88E5] focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Mot de passe initial <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showFormPassword ? 'text' : 'password'}
                        required
                        value={formMotDePasse}
                        onChange={e => setFormMotDePasse(e.target.value)}
                        placeholder="Ex: daro2025"
                        className="w-full pr-9 px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-[#1E88E5] focus:outline-none font-mono font-bold text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => setShowFormPassword(!showFormPassword)}
                        className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700"
                        title={showFormPassword ? 'Masquer' : 'Afficher'}
                      >
                        {showFormPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500">
                  Le mot de passe pourra être réinitialisé ou consulté directement à tout moment depuis cet espace d'administration.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Statut d'accès initial
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormStatut('actif')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      formStatut === 'actif'
                        ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Actif</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Accès immédiat aux dossiers et aux soins
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormStatut('en_attente')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      formStatut === 'en_attente'
                        ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                      <Clock className="w-3 h-3 text-amber-500" />
                      <span>En attente</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Validation requise avant activation
                    </p>
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold bg-[#1E88E5] hover:bg-[#1565C0] text-white rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Enregistrement...' : editingUser ? 'Sauvegarder les Modifications' : 'Créer le Compte Soignant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Gérer le Statut du Compte Utilisateur (Actif / En attente / Désactivé) */}
      {statusModalUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#1E88E5] flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Statut du Compte Collaborateur
                  </h3>
                  <p className="text-xs text-slate-500">
                    {statusModalUser.prenom} {statusModalUser.nom} • {ROLE_OPTIONS.find(r => r.role === statusModalUser.role)?.label || statusModalUser.role}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStatusModalUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Notice traçabilité DARÔ */}
              <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-100 text-xs text-blue-900 flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-[#1E88E5] flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block mb-0.5">Règle de traçabilité médico-légale DARÔ Santé :</strong>
                  <span>
                    La désactivation remplace toute suppression simple de compte. Cela garantit la conservation intégrale de l'historique des prescriptions, actes et consultations réalisés par ce soignant.
                  </span>
                </div>
              </div>

              {/* Status options */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => setTargetStatutSelection('actif')}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                    targetStatutSelection === 'actif'
                      ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Actif (Opérationnel)</span>
                      {targetStatutSelection === 'actif' && (
                        <span className="text-[11px] font-bold text-emerald-700">Sélectionné</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      L'utilisateur peut se connecter, consulter et créer des dossiers patients, prescrire des ordonnances et réaliser des actes.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetStatutSelection('en_attente')}
                  disabled={statusModalUser.id === currentUser.id}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                    targetStatutSelection === 'en_attente'
                      ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  } ${statusModalUser.id === currentUser.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">En attente de validation</span>
                      {targetStatutSelection === 'en_attente' && (
                        <span className="text-[11px] font-bold text-amber-700">Sélectionné</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Compte créé mais en cours de vérification administrative ou médicale. La connexion reste verrouillée jusqu'à validation.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetStatutSelection('desactive')}
                  disabled={statusModalUser.id === currentUser.id}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                    targetStatutSelection === 'desactive'
                      ? 'border-rose-500 bg-rose-50/80 ring-2 ring-rose-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  } ${statusModalUser.id === currentUser.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Power className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Désactivé (Accès suspendu)</span>
                      {targetStatutSelection === 'desactive' && (
                        <span className="text-[11px] font-bold text-rose-700">Sélectionné</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      L'accès est révoqué (départ, suspension, fin de contrat). Les signatures et antécédents médicaux passés sont rigoureusement préservés.
                    </p>
                  </div>
                </button>
              </div>

              {statusModalUser.id === currentUser.id && (
                <p className="text-[11px] text-amber-700 font-medium">
                  Vous ne pouvez pas modifier votre propre statut pour des raisons de sécurité.
                </p>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setStatusModalUser(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleApplyStatusChange}
                  disabled={statusModalUser.id === currentUser.id && targetStatutSelection !== 'actif'}
                  className="px-5 py-2 text-xs font-bold bg-[#1E88E5] hover:bg-[#1565C0] text-white rounded-xl shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Appliquer le Statut</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {passwordResetModalUser && tempPassword && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Mot de Passe Réinitialisé</h3>
              <p className="text-xs text-slate-500">
                Un mot de passe temporaire a été généré pour {passwordResetModalUser.prenom} {passwordResetModalUser.nom}.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-center font-mono font-bold text-base text-slate-800 tracking-wider">
              {tempPassword}
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              Transmettez ce mot de passe sécurisé à l'agent. Il lui sera demandé de le changer à sa prochaine connexion.
            </p>

            <button
              onClick={() => {
                setPasswordResetModalUser(null);
                setTempPassword(null);
              }}
              className="w-full py-2.5 rounded-xl bg-[#0B3C5D] hover:bg-[#1E88E5] text-white font-bold text-xs shadow-sm transition"
            >
              Fermer & Notifier
            </button>
          </div>
        </div>
      )}

      {/* User Profile & Photo Edit Modal */}
      {showUserProfileModal && (
        <UserProfileModal
          isOpen={showUserProfileModal}
          userToEdit={userToEditProfile}
          onClose={() => {
            setShowUserProfileModal(false);
            setUserToEditProfile(null);
          }}
          onSaved={(updated) => {
            setNotificationMsg(`Le profil et la photo de ${updated.prenom} ${updated.nom} ont été mis à jour avec succès.`);
            setTimeout(() => setNotificationMsg(null), 4000);
          }}
        />
      )}

      {/* Deactivate Account Modal with Past History Guarantee */}
      {userToDeactivate && (
        <DeactivateUserModal
          isOpen={!!userToDeactivate}
          user={userToDeactivate}
          consultations={allConsultations}
          ordonnances={ordonnances}
          exams={exams}
          onClose={() => setUserToDeactivate(null)}
          onConfirmDeactivate={handleConfirmDeactivation}
        />
      )}

      {/* User Past History & Consultations Inspection Modal */}
      {userForHistory && (
        <UserHistoryModal
          isOpen={!!userForHistory}
          user={userForHistory}
          consultations={allConsultations}
          ordonnances={ordonnances}
          exams={exams}
          currentUser={currentUser}
          onClose={() => setUserForHistory(null)}
          onToggleStatus={handleToggleStatut}
          onOpenDeactivateModal={(u) => setUserToDeactivate(u)}
        />
      )}

      {/* Modal: Modifier le mot de passe d'un patient */}
      {editingPatientPassword && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Modifier le Mot de Passe Patient
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingPatientPassword.prenom} {editingPatientPassword.nom} ({editingPatientPassword.matricule})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingPatientPassword(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border text-xs text-slate-600 space-y-1">
                <p>
                  <strong>Identifiant de connexion :</strong> <span className="font-mono font-bold text-slate-900">{editingPatientPassword.telephone}</span>
                </p>
                <p>
                  <strong>Quartier N'Djamena :</strong> {editingPatientPassword.quartier || 'Non précisé'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nouveau mot de passe de connexion :
                </label>
                <input
                  type="text"
                  required
                  value={newPatientPasswordInput}
                  onChange={e => setNewPatientPasswordInput(e.target.value)}
                  placeholder="Ex: daro2025"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingPatientPassword(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSavePatientPassword}
                className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-sm transition"
              >
                Enregistrer le mot de passe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Patient QR & Emergency Card Printable Modal */}
      {patientToPrintQR && (
        <PatientQRCardPrintModal
          isOpen={!!patientToPrintQR}
          patient={patientToPrintQR}
          onClose={() => setPatientToPrintQR(null)}
        />
      )}
    </div>
  );
};
