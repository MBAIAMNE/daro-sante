import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  Phone,
  Mail,
  MapPin,
  Users,
  Activity,
  Calendar,
  ShieldCheck,
  Stethoscope,
  Globe2,
  Power,
  Filter,
  Layers,
  Sparkles,
  Camera,
  Key,
  TrendingUp,
  ShieldAlert,
  Crown,
  BarChart3,
  Lock,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { Etablissement } from '../types';
import { UserProfileModal } from '../components/UserProfileModal';
import { WorkstationSupervisorPanel } from '../components/WorkstationSupervisorPanel';
import { SuperAdminCredentialsRegistry } from '../components/superadmin/SuperAdminCredentialsRegistry';
import { SuperAdminUsageAnalytics } from '../components/superadmin/SuperAdminUsageAnalytics';
import { SuperAdminIncidentsAndAdvantages } from '../components/superadmin/SuperAdminIncidentsAndAdvantages';
import { SuperAdminStrategicMonetization } from '../components/superadmin/SuperAdminStrategicMonetization';

export const SuperAdminView: React.FC = () => {
  const {
    currentUser,
    etablissements,
    allPatients,
    allConsultations,
    allUsers,
    creerEtablissement,
    toggleEtablissementStatut,
    setSelectedEtablissementId,
    selectedEtablissementId,
    setCurrentView,
  } = useClinic();

  const superAdminUser = allUsers.find(u => u.id === 'u-superadmin' || u.role === 'superadmin') || currentUser;

  const [activeSuperTab, setActiveSuperTab] = useState<
    'etablissements' | 'statistiques' | 'mots_de_passe' | 'failles_avantages' | 'monetisation'
  >('etablissements');

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'tous' | 'clinique' | 'hopital' | 'centre_sante'>('tous');
  const [filterStatut, setFilterStatut] = useState<'tous' | 'actif' | 'suspendu'>('tous');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Form State
  const [formNom, setFormNom] = useState('');
  const [formVille, setFormVille] = useState('N\'Djamena');
  const [formType, setFormType] = useState<'clinique' | 'hopital' | 'centre_sante'>('clinique');
  const [formDirecteurNom, setFormDirecteurNom] = useState('');
  const [formTelephone, setFormTelephone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAdresse, setFormAdresse] = useState('');

  // Global Network Stats
  const totalEtablissements = etablissements.length;
  const etablissementsActifs = etablissements.filter(e => e.statut === 'actif').length;
  const totalPatients = allPatients.length;
  const totalConsultations = allConsultations.length;
  const totalPersonnel = allUsers.filter(u => u.role !== 'patient').length;

  const filteredEtablissements = etablissements.filter(e => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      e.nom.toLowerCase().includes(q) ||
      e.ville.toLowerCase().includes(q) ||
      (e.directeurNom && e.directeurNom.toLowerCase().includes(q));

    const matchesType = filterType === 'tous' || e.type === filterType;
    const matchesStatut = filterStatut === 'tous' || e.statut === filterStatut;

    return matchesSearch && matchesType && matchesStatut;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNom.trim() || !formVille.trim()) return;

    setIsSubmitting(true);
    try {
      await creerEtablissement({
        nom: formNom.trim(),
        ville: formVille.trim(),
        type: formType,
        directeurNom: formDirecteurNom.trim() || 'Dr. Nouveau Directeur',
        telephone: formTelephone.trim() || '+235 22 51 00 00',
        email: formEmail.trim() || 'contact@etablissement-daro.td',
        adresse: formAdresse.trim() || `${formVille}`,
      });

      setActionSuccess(`L'établissement « ${formNom} » a été raccordé au réseau DARÔ avec succès.`);
      setShowAddModal(false);
      // Reset form
      setFormNom('');
      setFormVille('N\'Djamena');
      setFormDirecteurNom('');
      setFormTelephone('');
      setFormEmail('');
      setFormAdresse('');
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatut = async (etablissement: Etablissement) => {
    const nouveauStatut = etablissement.statut === 'actif' ? 'suspendu' : 'actif';
    const confirmMessage = nouveauStatut === 'suspendu'
      ? `Êtes-vous certain de vouloir suspendre l'accès pour « ${etablissement.nom} » ? Le personnel ne pourra plus se connecter.`
      : `Activer l'accès pour « ${etablissement.nom} » ?`;

    if (window.confirm(confirmMessage)) {
      await toggleEtablissementStatut(etablissement.id);
      setActionSuccess(`Le statut de « ${etablissement.nom} » est désormais ${nouveauStatut.toUpperCase()}.`);
      setTimeout(() => setActionSuccess(null), 3500);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Creator & Super Admin Profile Card */}
      <div className="bg-gradient-to-r from-[#0B3C5D] via-[#0e4871] to-[#1E88E5] rounded-2xl p-5 sm:p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border border-white/10">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/40 shadow-md bg-white/10 flex-shrink-0">
              <img
                src={superAdminUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'}
                alt={`${superAdminUser?.prenom} ${superAdminUser?.nom}`}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowProfileModal(true)}
              title="Changer ma photo de profil"
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white text-[#1E88E5] shadow-sm flex items-center justify-center hover:scale-110 transition-transform"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                <Sparkles className="w-3 h-3 text-slate-900" />
                Concepteur de la plateforme & Super Administrateur
              </span>
              <span className="text-[11px] text-sky-200">Direction Réseau DARÔ Santé</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black mt-1 tracking-tight">
              {superAdminUser?.prenom || 'Fred'} {superAdminUser?.nom || 'Mbaï'}
            </h2>
            <p className="text-xs text-sky-100/90 flex items-center gap-2 flex-wrap mt-0.5">
              <span>{superAdminUser?.email || 'fredmbaiamne@gmail.com'}</span>
              <span>•</span>
              <span>{superAdminUser?.telephone || '+235 66 00 00 00'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setShowProfileModal(true)}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/20 transition-all backdrop-blur-xs shadow-xs"
          >
            <Camera className="w-4 h-4" />
            <span>Modifier Mon Profil & Photo</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            id="btn-ajouter-etablissement"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#0B3C5D] hover:bg-sky-50 font-bold text-xs shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 text-[#1E88E5]" />
            <span>Ajouter un Établissement</span>
          </button>
        </div>
      </div>

      {/* Top Banner / Breadcrumb & Notice */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5" />
              Opérateur Réseau DARÔ Santé
            </span>
            <span className="text-xs text-slate-500">• Supervision Multi-Cliniques</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0B3C5D] mt-1">
            Supervision du Réseau d'Établissements DARÔ
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5 max-w-3xl">
            Gestion centralisée des cliniques, cabinets et hôpitaux partenaires connectés à la plateforme DARÔ Santé.
          </p>
        </div>
      </div>

      {/* Master Navigation Tabs for SuperAdmin */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200 overflow-x-auto text-xs font-bold text-slate-600">
        <button
          type="button"
          onClick={() => setActiveSuperTab('etablissements')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
            activeSuperTab === 'etablissements'
              ? 'bg-white text-[#0B3C5D] shadow-sm font-black'
              : 'hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Building2 className="w-4 h-4 text-sky-600" />
          <span>Établissements & Licences</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-sky-100 text-sky-800">
            {totalEtablissements}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSuperTab('statistiques')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
            activeSuperTab === 'statistiques'
              ? 'bg-white text-[#0B3C5D] shadow-sm font-black'
              : 'hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>Courbe & Statistiques d'Utilisation</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800">
            Temps Réel
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSuperTab('mots_de_passe')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
            activeSuperTab === 'mots_de_passe'
              ? 'bg-white text-[#0B3C5D] shadow-sm font-black'
              : 'hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Key className="w-4 h-4 text-amber-500" />
          <span>Master Mots de Passe</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-900 font-extrabold">
            Exclusif Éditeur
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSuperTab('failles_avantages')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
            activeSuperTab === 'failles_avantages'
              ? 'bg-white text-[#0B3C5D] shadow-sm font-black'
              : 'hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-indigo-600" />
          <span>Failles & Avantages DARÔ</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSuperTab('monetisation')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
            activeSuperTab === 'monetisation'
              ? 'bg-white text-[#0B3C5D] shadow-sm font-black'
              : 'hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Crown className="w-4 h-4 text-amber-500" />
          <span>Monétisation & Suprématie Éditeur</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black">
            +15% Top Clinique
          </span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* TAB 1: ÉTABLISSEMENTS & LICENCES */}
      {activeSuperTab === 'etablissements' && (
        <div className="space-y-6">
          {/* Medical Confidentiality Policy Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-xs text-[#0B3C5D] flex items-start gap-3 shadow-xs">
            <ShieldCheck className="w-5 h-5 text-[#1E88E5] flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900">
                Cloisonnement des Données de Santé & Secret Médical
              </p>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                En tant que Super Administrateur de l'infrastructure DARÔ, votre rôle est d'administrer le réseau, d'activer les licences des cliniques et de superviser la disponibilité technique. Les dossiers médicaux (constantes, diagnostics, ordonnances) sont strictement cloisonnés par établissement et réservés au personnel soignant habilité.
              </p>
            </div>
          </div>

          {/* Consolidated Network KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Établissements Réseau
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1E88E5] flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalEtablissements}</span>
                <span className="text-xs text-emerald-600 font-semibold">({etablissementsActifs} actifs)</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Hôpitaux et cliniques partenaires</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Total Patients Réseau
                </span>
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalPatients}</span>
                <span className="text-xs text-slate-500">dossiers</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Patients avec QR code actif</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Consultations Réalisées
                </span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Stethoscope className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalConsultations}</span>
                <span className="text-xs text-slate-500">actes</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Totalité des consultations réseau</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Personnel Soignant
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalPersonnel}</span>
                <span className="text-xs text-slate-500">agents</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Médecins, infirmiers & techniciens</p>
            </div>
          </div>

          {/* Directory Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Search & Filters Toolbar */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par nom d'établissement, ville, directeur..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#1E88E5] focus:outline-hidden"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value as any)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-hidden"
                >
                  <option value="tous">Tous types</option>
                  <option value="clinique">Cliniques Privées</option>
                  <option value="hopital">Hôpitaux</option>
                  <option value="centre_sante">Centres de Santé</option>
                </select>

                <select
                  value={filterStatut}
                  onChange={e => setFilterStatut(e.target.value as any)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-hidden"
                >
                  <option value="tous">Tous statuts</option>
                  <option value="actif">Actif uniquement</option>
                  <option value="suspendu">Suspendu uniquement</option>
                </select>
              </div>
            </div>

            {/* Establishments Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Établissement</th>
                    <th className="py-3 px-4">Ville & Adresse</th>
                    <th className="py-3 px-4">Direction & Contact</th>
                    <th className="py-3 px-4 text-center">Patients</th>
                    <th className="py-3 px-4 text-center">Personnel</th>
                    <th className="py-3 px-4 text-center">Statut Accès</th>
                    <th className="py-3 px-4 text-right">Actions Opérateur</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEtablissements.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 text-xs italic">
                        Aucun établissement ne correspond aux filtres sélectionnés.
                      </td>
                    </tr>
                  ) : (
                    filteredEtablissements.map(etablissement => {
                      const patientsCount = allPatients.filter(p => p.etablissementId === etablissement.id).length;
                      const staffCount = allUsers.filter(u => u.etablissementId === etablissement.id && u.role !== 'patient').length;
                      const isActif = etablissement.statut === 'actif';

                      return (
                        <tr key={etablissement.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1E88E5] font-bold text-sm shrink-0">
                                <Building2 className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 text-sm">{etablissement.nom}</div>
                                <div className="text-[11px] text-slate-500 capitalize">
                                  {etablissement.type === 'hopital' ? 'Hôpital' : etablissement.type === 'clinique' ? 'Clinique Privée' : 'Centre de Santé'}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 font-medium text-slate-800">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{etablissement.ville}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                              {etablissement.adresse || `${etablissement.ville}`}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-800">
                              {etablissement.directeurNom || 'Direction non renseignée'}
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                              {etablissement.telephone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  {etablissement.telephone}
                                </span>
                              )}
                              {etablissement.email && (
                                <span className="flex items-center gap-1 truncate max-w-[150px]">
                                  <Mail className="w-3 h-3 text-slate-400" />
                                  {etablissement.email}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 font-bold text-slate-800">
                              {patientsCount}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 font-bold text-slate-800">
                              {staffCount}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                isActif
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-rose-100 text-rose-800 border border-rose-200'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isActif ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                              {isActif ? 'Actif' : 'Suspendu'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleToggleStatut(etablissement)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                  isActif
                                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                }`}
                                title={isActif ? 'Suspendre l\'accès de cet établissement' : 'Réactiver l\'accès'}
                              >
                                <Power className="w-3.5 h-3.5" />
                                <span>{isActif ? 'Suspendre' : 'Activer'}</span>
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedEtablissementId(etablissement.id);
                                  setCurrentView('users');
                                }}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                                title="Voir le personnel de cet établissement"
                              >
                                Personnel
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

          {/* Network-wide Workstation Security & Login Surveillance */}
          <WorkstationSupervisorPanel />
        </div>
      )}

      {/* TAB 2: COURBE & STATISTIQUES D'UTILISATION */}
      {activeSuperTab === 'statistiques' && <SuperAdminUsageAnalytics />}

      {/* TAB 3: MASTER MOTS DE PASSE (EXCLUSIF ÉDITEUR) */}
      {activeSuperTab === 'mots_de_passe' && <SuperAdminCredentialsRegistry />}

      {/* TAB 4: FAILLES & AVANTAGES */}
      {activeSuperTab === 'failles_avantages' && <SuperAdminIncidentsAndAdvantages />}

      {/* TAB 5: MONÉTISATION & SUPRÉMATIE ÉDITEUR */}
      {activeSuperTab === 'monetisation' && <SuperAdminStrategicMonetization />}

      {/* Modal: Ajouter un Établissement */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#1E88E5] flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Raccorder un Établissement</h3>
                  <p className="text-xs text-slate-500">Ajout au réseau national DARÔ</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nom de l'établissement <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formNom}
                  onChange={e => setFormNom(e.target.value)}
                  placeholder="Ex: Hôpital Régional de Moundou, Clinique La Grâce..."
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#1E88E5] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ville <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formVille}
                    onChange={e => setFormVille(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#1E88E5] focus:outline-none"
                  >
                    <option value="N'Djamena">N'Djamena</option>
                    <option value="Moundou">Moundou</option>
                    <option value="Sarh">Sarh</option>
                    <option value="Abéché">Abéché</option>
                    <option value="Kélo">Kélo</option>
                    <option value="Koumra">Koumra</option>
                    <option value="Pala">Pala</option>
                    <option value="Am Timan">Am Timan</option>
                    <option value="Bongor">Bongor</option>
                    <option value="Doba">Doba</option>
                    <option value="Autre ville">Autre ville</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Type d'établissement
                  </label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value as any)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#1E88E5] focus:outline-none"
                  >
                    <option value="clinique">Clinique Privée</option>
                    <option value="hopital">Hôpital Public / Référence</option>
                    <option value="centre_sante">Centre de Santé / Dispensaire</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nom du Directeur ou Médecin-Chef
                </label>
                <input
                  type="text"
                  value={formDirecteurNom}
                  onChange={e => setFormDirecteurNom(e.target.value)}
                  placeholder="Ex: Dr. Mahamat Saleh"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#1E88E5] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Téléphone de contact
                  </label>
                  <input
                    type="tel"
                    value={formTelephone}
                    onChange={e => setFormTelephone(e.target.value)}
                    placeholder="+235 66 00 00 00"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#1E88E5] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email officiel
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    placeholder="direction@clinique.td"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#1E88E5] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Adresse & Quartier
                </label>
                <input
                  type="text"
                  value={formAdresse}
                  onChange={e => setFormAdresse(e.target.value)}
                  placeholder="Ex: Quartier Sabangali, Avenue Bokassa"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#1E88E5] focus:outline-none"
                />
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
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer l\'Établissement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile & Photo Edit Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        userToEdit={superAdminUser}
        onClose={() => setShowProfileModal(false)}
        onSaved={(updated) => {
          setActionSuccess(`Le profil et la photo de ${updated.prenom} ${updated.nom} ont été mis à jour.`);
          setTimeout(() => setActionSuccess(null), 3500);
        }}
      />
    </div>
  );
};
