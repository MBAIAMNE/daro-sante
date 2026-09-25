import React from 'react';
import {
  Clock,
  Stethoscope,
  Users,
  Microscope,
  CreditCard,
  Pill,
  MessageSquare,
  MessagesSquare,
  Calendar,
  AlertCircle,
  ArrowRight,
  Sparkles,
  QrCode,
  CheckCircle2,
  HeartPulse,
  Building2,
  BarChart3,
  Shield,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { UserRole } from '../types';

interface RoleWelcomeConfig {
  greeting: string;
  dutyDescription: string;
  roleBadge: string;
  shortcuts: {
    label: string;
    description: string;
    viewId: string;
    icon: React.ElementType;
    color: string;
    badgeCount?: number;
  }[];
}

export const StaffWelcomeView: React.FC<{ onOpenScanner: () => void }> = ({ onOpenScanner }) => {
  const {
    currentUser,
    currentRole,
    setCurrentView,
    queue,
    exams,
    appointments,
    invoices,
    medications,
    notifications,
  } = useClinic();

  // Role-specific metrics
  const unreadNotifs = notifications.filter(
    n => !n.lu && (!n.destinataireRole || n.destinataireRole === currentRole)
  ).length;

  const enAttenteTriage = queue.filter(q => q.statut === 'en_attente').length;
  const mesPatientsTriés = queue.filter(
    q => q.statut === 'triage_fait' && (!q.orienteVersMedecinId || q.orienteVersMedecinId === currentUser.id)
  ).length;
  const mesExamensLabo = exams.filter(e => e.type === 'laboratoire' && (e.statut === 'prescrit' || e.statut === 'en_cours')).length;
  const mesExamensImagerie = exams.filter(e => e.type === 'imagerie' && (e.statut === 'prescrit' || e.statut === 'en_cours')).length;
  const facturesEnAttente = invoices.filter(i => i.statut === 'en_attente').length;
  const rdvAujourdhui = appointments.filter(a => a.statut === 'programme').length;
  const medicamentsAlerte = medications.filter(m => m.quantiteEnStock <= m.seuilAlerte).length;

  const roleConfigs: Record<UserRole, RoleWelcomeConfig> = {
    medecin: {
      greeting: `Bonjour ${currentUser.prenom} ${currentUser.nom}`,
      dutyDescription: 'Vous êtes en service aux Urgences & Consultations de la Clinique DARÔ. Vos patients triés par l\'équipe infirmière vous attendent par ordre de gravité.',
      roleBadge: 'Médecin Praticien',
      shortcuts: [
        {
          label: 'File de Consultation',
          description: 'Consulter vos patients triés par gravité',
          viewId: 'queue',
          icon: Clock,
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          badgeCount: mesPatientsTriés,
        },
        {
          label: 'Nouvelle Consultation',
          description: 'Saisie observation, diagnostic & ordonnance',
          viewId: 'consultations',
          icon: Stethoscope,
          color: 'bg-teal-50 text-teal-700 border-teal-200',
        },
        {
          label: 'Prescrire un Examen',
          description: 'Analyses biologiques ou imagerie médicale',
          viewId: 'examens',
          icon: Microscope,
          color: 'bg-sky-50 text-sky-700 border-sky-200',
        },
        {
          label: 'Rendez-vous & Téléconsult',
          description: 'Consultations programmées et visio intégrée',
          viewId: 'appointments',
          icon: Calendar,
          color: 'bg-purple-50 text-purple-700 border-purple-200',
          badgeCount: rdvAujourdhui,
        },
      ],
    },
    infirmier: {
      greeting: `Bonjour ${currentUser.prenom} ${currentUser.nom}`,
      dutyDescription: 'Poste de Triage Médical DARÔ. Vous êtes le premier rempart pour évaluer les urgences vitales et orienter les patients vers les médecins.',
      roleBadge: 'Infirmier(ère) Triage',
      shortcuts: [
        {
          label: 'Effectuer le Triage',
          description: 'Mesurer les constantes & orienter les arrivées',
          viewId: 'queue',
          icon: Clock,
          color: 'bg-teal-50 text-teal-700 border-teal-200',
          badgeCount: enAttenteTriage,
        },
        {
          label: 'Dossiers Patients',
          description: 'Vérifier antécédents, allergies et groupes sanguins',
          viewId: 'patients',
          icon: Users,
          color: 'bg-sky-50 text-sky-700 border-sky-200',
        },
        {
          label: 'Chat Soignants & Garde',
          description: 'Communication directe avec les médecins de garde',
          viewId: 'team_chat',
          icon: MessagesSquare,
          color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        },
      ],
    },
    accueil: {
      greeting: `Bonjour ${currentUser.prenom} ${currentUser.nom}`,
      dutyDescription: 'Guichet d\'Accueil & Admissions DARÔ. Vous enregistrez les arrivées, éditez les tickets de file et gérez les encaissements de caisse.',
      roleBadge: 'Accueil & Admissions',
      shortcuts: [
        {
          label: 'Enregistrer une Arrivée',
          description: 'Créer un ticket pour la file d\'attente',
          viewId: 'queue',
          icon: Clock,
          color: 'bg-blue-50 text-blue-700 border-blue-200',
        },
        {
          label: 'Nouveau Dossier Patient',
          description: 'Enregistrer un patient & générer sa carte QR',
          viewId: 'patients',
          icon: Users,
          color: 'bg-teal-50 text-teal-700 border-teal-200',
        },
        {
          label: 'Caisse & Facturation',
          description: 'Règlements consultations & analyses en FCFA',
          viewId: 'billing',
          icon: CreditCard,
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          badgeCount: facturesEnAttente,
        },
        {
          label: 'Prendre Rendez-vous',
          description: 'Planification des consultations à venir',
          viewId: 'appointments',
          icon: Calendar,
          color: 'bg-purple-50 text-purple-700 border-purple-200',
        },
      ],
    },
    responsable_soins: {
      greeting: `Bonjour ${currentUser.prenom} ${currentUser.nom}`,
      dutyDescription: 'Coordination générale des soins et du personnel soignant de la Clinique DARÔ.',
      roleBadge: 'Responsable des Soins',
      shortcuts: [
        {
          label: 'Assignations Soignants',
          description: 'Répartition des patients par équipe médicale',
          viewId: 'assignments',
          icon: Users,
          color: 'bg-amber-50 text-amber-700 border-amber-200',
        },
        {
          label: 'Approvisionnement Pharmacie',
          description: 'Vérifier les stocks de solutés et médicaments',
          viewId: 'pharmacie',
          icon: Pill,
          color: 'bg-rose-50 text-rose-700 border-rose-200',
          badgeCount: medicamentsAlerte,
        },
        {
          label: 'File Active des Soins',
          description: 'Supervision des flux patients en temps réel',
          viewId: 'queue',
          icon: Clock,
          color: 'bg-teal-50 text-teal-700 border-teal-200',
        },
      ],
    },
    tech_laboratoire: {
      greeting: `Bonjour ${currentUser.prenom} ${currentUser.nom}`,
      dutyDescription: 'Laboratoire d\'Analyses Médicales DARÔ. Saisissez les résultats des examens biologiques prescrits pour éclairer les diagnostics.',
      roleBadge: 'Technicien Laboratoire',
      shortcuts: [
        {
          label: 'Examens Prescrits (Labo)',
          description: 'Goutte épaisse, NFS, glycémies en attente',
          viewId: 'examens',
          icon: Microscope,
          color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
          badgeCount: mesExamensLabo,
        },
        {
          label: 'Chat Équipe Urgences',
          description: 'Alerter les médecins sur les résultats critiques',
          viewId: 'team_chat',
          icon: MessagesSquare,
          color: 'bg-slate-50 text-slate-700 border-slate-200',
        },
      ],
    },
    tech_imagerie: {
      greeting: `Bonjour ${currentUser.prenom} ${currentUser.nom}`,
      dutyDescription: 'Pôle Imagerie Médicale & Radiologie DARÔ. Réalisez les clichés radiologiques et échographies demandés.',
      roleBadge: 'Technicien Imagerie',
      shortcuts: [
        {
          label: 'Examens Radiologie',
          description: 'Radiographies thorax, membres et échographies',
          viewId: 'examens',
          icon: Microscope,
          color: 'bg-sky-50 text-sky-700 border-sky-200',
          badgeCount: mesExamensImagerie,
        },
        {
          label: 'Chat Équipe Médicale',
          description: 'Transmission rapide des comptes-rendus radio',
          viewId: 'team_chat',
          icon: MessagesSquare,
          color: 'bg-slate-50 text-slate-700 border-slate-200',
        },
      ],
    },
    directeur: {
      greeting: `Bonjour ${currentUser.prenom} ${currentUser.nom}`,
      dutyDescription: `Direction Médicale & Stratégique • ${currentUser.etablissementNom || "Établissement DARÔ"}. Supervisez l'activité médicale, les finances et le personnel de votre établissement.`,
      roleBadge: 'Directeur d\'Établissement',
      shortcuts: [
        {
          label: 'Tableau de Bord Directeur',
          description: 'Métriques clés, flux de patients & recettes',
          viewId: 'directeur',
          icon: BarChart3,
          color: 'bg-blue-50 text-blue-700 border-blue-200',
        },
        {
          label: 'Gestion du Personnel',
          description: 'Créer et gérer les comptes soignants de votre clinique',
          viewId: 'users_admin',
          icon: Users,
          color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        },
        {
          label: 'Dossiers Patients',
          description: 'Consulter l\'ensemble des dossiers de la clinique',
          viewId: 'patients',
          icon: Users,
          color: 'bg-sky-50 text-sky-700 border-sky-200',
        },
        {
          label: 'Journal d\'Audit',
          description: 'Historique des accès et actions sécurisées',
          viewId: 'journal',
          icon: Shield,
          color: 'bg-slate-50 text-slate-700 border-slate-200',
        },
      ],
    },
    superadmin: {
      greeting: `Bonjour ${currentUser.prenom} ${currentUser.nom}`,
      dutyDescription: 'Super Administration DARÔ. En tant que concepteur de la plateforme et Super Administrateur, vous supervisez tous les hôpitaux et cliniques partenaires à l\'échelle nationale.',
      roleBadge: 'Concepteur & Super Admin DARÔ',
      shortcuts: [
        {
          label: 'Gestion des Établissements',
          description: 'Ajouter, activer/suspendre les cliniques et hôpitaux',
          viewId: 'superadmin',
          icon: Building2,
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        },
        {
          label: 'Statistiques Réseau DARÔ',
          description: 'Volume d\'activité consolidé multi-établissements',
          viewId: 'superadmin',
          icon: BarChart3,
          color: 'bg-blue-50 text-blue-700 border-blue-200',
        },
        {
          label: 'Journal d\'Activité Global',
          description: 'Traçabilité complète des actions sur tous les sites',
          viewId: 'journal',
          icon: Shield,
          color: 'bg-amber-50 text-amber-700 border-amber-200',
        },
        {
          label: 'Registre des Accès QR',
          description: 'Audits des scans QR code d\'urgence en temps réel',
          viewId: 'qr_scans_audit',
          icon: QrCode,
          color: 'bg-purple-50 text-purple-700 border-purple-200',
        },
      ],
    },
    gestionnaire: {
      greeting: `Bonjour ${currentUser.prenom} ${currentUser.nom}`,
      dutyDescription: `Direction Administrative & Financière • ${currentUser.etablissementNom || "Clinique DARÔ"}.`,
      roleBadge: 'Gestionnaire',
      shortcuts: [],
    },
    pharmacien: {
      greeting: `Bonjour ${currentUser.prenom} ${currentUser.nom}`,
      dutyDescription: `Pharmacie Hospitalière & Gestion des Stocks • ${currentUser.etablissementNom || "Clinique DARÔ"}. Dispensation des ordonnances sécurisées et gestion des alertes de rupture.`,
      roleBadge: 'Pharmacien Hospitalier',
      shortcuts: [
        {
          label: 'Gestion de la Pharmacie',
          description: 'Stocks de médicaments, seuils d\'alerte et entrées de lots',
          viewId: 'pharmacie',
          icon: Pill,
          color: 'bg-teal-50 text-teal-700 border-teal-200',
          badgeCount: medicamentsAlerte,
        },
        {
          label: 'Ordonnances Médicales',
          description: 'Consulter et dispenser les prescriptions des médecins',
          viewId: 'ordonnances',
          icon: Stethoscope,
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        },
      ],
    },
    caissier: {
      greeting: `Bonjour ${currentUser.prenom} ${currentUser.nom}`,
      dutyDescription: `Caisse & Facturation des Soins • ${currentUser.etablissementNom || "Clinique DARÔ"}. Encaissements en Espèces, Airtel Money et Moov Money Tchad.`,
      roleBadge: 'Caissier & Facturation',
      shortcuts: [
        {
          label: 'Factures & Règlements',
          description: 'Encaisser les consultations, examens et actes médicaux',
          viewId: 'facturation',
          icon: CreditCard,
          color: 'bg-amber-50 text-amber-700 border-amber-200',
          badgeCount: facturesEnAttente,
        },
        {
          label: 'Enregistrement Patient',
          description: 'Accueil guichet et ouverture de dossier médical',
          viewId: 'patients',
          icon: Users,
          color: 'bg-sky-50 text-sky-700 border-sky-200',
        },
      ],
    },
    patient: {
      greeting: `Bonjour`,
      dutyDescription: 'Espace Patient DARÔ.',
      roleBadge: 'Patient',
      shortcuts: [],
    },
  };

  const config = roleConfigs[currentRole] || roleConfigs['medecin'];

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      {/* Personalized Greeting Card */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0B3C5D] via-[#0E4971] to-[#0B3C5D] p-6 sm:p-8 text-white shadow-xl border border-teal-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.nom}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-white/20 shadow-xl"
            />
            <div className="space-y-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-teal-400/20 text-teal-300 text-xs font-bold border border-teal-400/30">
                {config.roleBadge}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white">{config.greeting}</h1>
              <p className="text-xs sm:text-sm text-slate-200 max-w-xl leading-relaxed">
                {config.dutyDescription}
              </p>
            </div>
          </div>

          {/* Quick Scanner Action */}
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-[#0B3C5D] font-bold text-xs shadow-lg transition flex-shrink-0"
          >
            <QrCode className="w-4 h-4" />
            <span>Scanner QR Patient</span>
          </button>
        </div>

        {/* Status Bar */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span>
              {currentUser.role === 'superadmin'
                ? 'Opérateur DARÔ Santé • Réseau Hospitalier Privé'
                : `Poste de travail actif • ${currentUser.etablissementNom || 'Établissement de Santé Partenaire'}`}
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>{unreadNotifs} notification(s) non lue(s)</span>
            <span>Date : {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Module Shortcuts Grid strictly filtered for this role */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#0B3C5D]">Raccourcis & Modules Autorisés</h2>
          <span className="text-xs text-slate-500">Accès direct à vos tâches quotidiennes</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {config.shortcuts.map((shortcut, idx) => {
            const Icon = shortcut.icon;
            return (
              <button
                key={idx}
                onClick={() => setCurrentView(shortcut.viewId)}
                className="group p-5 rounded-2xl bg-white border border-slate-200 hover:border-teal-300 shadow-sm hover:shadow-md transition text-left flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl border ${shortcut.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    {shortcut.badgeCount !== undefined && shortcut.badgeCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[11px]">
                        {shortcut.badgeCount} en cours
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0B3C5D] transition">
                      {shortcut.label}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {shortcut.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-700">
                  <span>Accéder au module</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Team Notice / Alert Banner */}
      <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 flex items-start gap-3 text-xs text-sky-900">
        <Sparkles className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Protocole QR Urgences DARÔ :</p>
          <p className="text-slate-600 mt-0.5">
            Pour tout patient admis en détresse, scannez son QR code immédiatement via le bouton en haut ou dans le viseur optique
            afin de vérifier son groupe sanguin et ses allergies médicamenteuses avant toute injection.
          </p>
        </div>
      </div>
    </div>
  );
};
