import React, { useState, useEffect, useRef, useMemo } from 'react';
import QRCode from 'qrcode';
import {
  User,
  Heart,
  QrCode,
  Calendar,
  FileText,
  Microscope,
  Receipt,
  PhoneCall,
  AlertTriangle,
  Download,
  Printer,
  ShieldCheck,
  Video,
  Clock,
  MessageSquare,
  Send,
  UserCheck,
  CheckCheck,
  Check,
  Radio,
  WifiOff,
  Copy,
  ExternalLink,
  Maximize2,
  X,
  Users,
  ChevronDown,
  UserCog,
  LogOut,
  Building2,
  ArrowRightLeft,
  Network,
  Activity,
  Shield,
  CreditCard,
  BadgeCheck,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { Logo } from '../components/Logo';
import { PatientProfileModal } from '../components/PatientProfileModal';
import { generateEmergencyQRPayload, generateEmergencyQRDataUrl } from '../utils/qrPayload';
import { OrdonnancePrintModal } from '../components/OrdonnancePrintModal';
import { ExamenPrintModal } from '../components/ExamenPrintModal';
import { PatientQRCardPrintModal } from '../components/PatientQRCardPrintModal';
import { TeleconsultationModal } from '../components/TeleconsultationModal';
import { PatientHospitalCard } from '../components/PatientHospitalCard';
import { Ordonnance, ExamenPrescrit, Appointment } from '../types';
import { africanFemaleDoctor, africanDoctorClinic } from '../assets/africanImages';

export const PatientPortalView: React.FC = () => {
  const {
    activePatient,
    patients,
    logout,
    logoutToPublic,
    ordonnances,
    exams,
    appointments,
    invoices,
    assignments,
    users,
    allUsers,
    etablissements,
    chatMessages,
    envoyerMessagePatient,
    marquerMessagesLus,
    getUnreadStaffMessagesCount,
    setCurrentView,
    creerRendezVous,
    transfertsInterHopitaux,
    initierTransfertInterHopital,
    ajouterAssignation,
    currentEtablissement,
    modifierPatient,
    patientPortalTab,
    setPatientPortalTab,
  } = useClinic();

  // Fallback to first patient if none active
  const patient = activePatient || patients[0];
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [activeTab, setActiveTabState] = useState<'carte' | 'hopital' | 'rdv' | 'messages' | 'ordonnances' | 'analyses' | 'interhopitaux' | 'factures' | 'assurance'>(() => patientPortalTab || 'carte');

  const setActiveTab = (tab: 'carte' | 'hopital' | 'rdv' | 'messages' | 'ordonnances' | 'analyses' | 'interhopitaux' | 'factures' | 'assurance') => {
    setActiveTabState(tab);
    setPatientPortalTab(tab);
  };

  useEffect(() => {
    if (patientPortalTab && patientPortalTab !== activeTab) {
      setActiveTabState(patientPortalTab);
    }
  }, [patientPortalTab]);

  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [chatInputText, setChatInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  // In-portal new appointment booking modal
  const [showNewApptModal, setShowNewApptModal] = useState(false);
  const [newApptDoctorId, setNewApptDoctorId] = useState('');
  const [newApptDate, setNewApptDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newApptTime, setNewApptTime] = useState('09:30');
  const [newApptType, setNewApptType] = useState<'presentiel' | 'teleconsultation'>('presentiel');
  const [newApptMotif, setNewApptMotif] = useState('Consultation de suivi');
  const [apptSuccessNotice, setApptSuccessNotice] = useState(false);

  // Teleconsultation active room state
  const [showTeleconsultModal, setShowTeleconsultModal] = useState(false);
  const [selectedApptForTeleconsult, setSelectedApptForTeleconsult] = useState<Appointment | null>(null);
  const [teleconsultDoctorNom, setTeleconsultDoctorNom] = useState('Dr. Kaltouma Djibrine');

  // Print modals state
  const [selectedOrdToPrint, setSelectedOrdToPrint] = useState<Ordonnance | null>(null);
  const [selectedExamToPrint, setSelectedExamToPrint] = useState<ExamenPrescrit | null>(null);
  const [showQRCardPrintModal, setShowQRCardPrintModal] = useState(false);

  // Filter assignments strictly for this patient
  const myAssignedRelations = useMemo(
    () => assignments.filter(a => a.patientId === patient?.id && a.actif),
    [assignments, patient?.id]
  );

  // Select initial staff member when relations change
  useEffect(() => {
    if (myAssignedRelations.length > 0 && !selectedStaffId) {
      setSelectedStaffId(myAssignedRelations[0].staffId);
    }
  }, [myAssignedRelations.length, selectedStaffId]);

  // Count unread messages from staff for this patient
  const unreadFromStaffCount = useMemo(() => {
    return chatMessages.filter(
      m => m.estPatientChat && m.patientId === patient?.id && !m.lu && m.senderRole !== 'patient'
    ).length;
  }, [chatMessages, patient?.id]);

  // Mark messages as read only when unread messages exist and tab is active
  useEffect(() => {
    if (activeTab === 'messages' && patient && unreadFromStaffCount > 0) {
      marquerMessagesLus('patient', patient.id);
    }
  }, [activeTab, patient?.id, unreadFromStaffCount, marquerMessagesLus]);

  // Auto-scroll when messages tab is active or message count changes
  useEffect(() => {
    if (activeTab === 'messages') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab, selectedStaffId, chatMessages.length]);

  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [qrPayloadString, setQrPayloadString] = useState<string>('');
  const [showFullscreenPortalQR, setShowFullscreenPortalQR] = useState<boolean>(false);

  useEffect(() => {
    if (patient) {
      const payload = generateEmergencyQRPayload(patient);
      setQrPayloadString(payload);
      generateEmergencyQRDataUrl(patient, { width: 380, margin: 2 })
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error('Error generating QR:', err));
    }
  }, [patient]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(label);
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  if (!patient) return null;

  const patientOrdonnances = ordonnances.filter(o => o.patientId === patient.id);
  const patientExams = exams.filter(e => e.patientId === patient.id);
  const patientAppointments = appointments.filter(a => a.patientId === patient.id);
  const patientInvoices = invoices.filter(i => i.patientId === patient.id);
  const patientTransfers = useMemo(
    () => (transfertsInterHopitaux || []).filter(t => t.patientId === patient.id),
    [transfertsInterHopitaux, patient.id]
  );

  // Filter messages for current patient and selected staff
  const currentStaffRelation = myAssignedRelations.find(r => r.staffId === selectedStaffId);
  const selectedStaffUser = users.find(u => u.id === selectedStaffId);

  const patientStaffMessages = chatMessages.filter(m => {
    if (!m.estPatientChat || m.patientId !== patient.id) return false;
    // Messages sent by this patient or received by this patient for selected staff
    if (selectedStaffId) {
      return (
        m.staffId === selectedStaffId ||
        m.receiverId === selectedStaffId ||
        m.senderId === selectedStaffId ||
        (m.senderRole !== 'patient' && (m.staffId === selectedStaffId || m.senderId === selectedStaffId))
      );
    }
    return true;
  });

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim() || !selectedStaffId) return;

    envoyerMessagePatient(chatInputText.trim(), patient.id, selectedStaffId);
    setChatInputText('');
  };

  const patientHospital = useMemo(() => {
    return (
      etablissements.find(e => e.id === patient?.etablissementId) ||
      etablissements[0] || {
        id: 'etab-1',
        nom: patient?.etablissementNom || 'Clinique Médicale Espoir',
        code: 'CME-01',
        type: 'clinique',
        ville: "N'Djamena",
        pays: 'Tchad',
        adresse: "Quartier Moursal, N'Djamena",
        telephone: '+235 22 51 45 00',
        email: 'contact@clinique-espoir.td',
        directeurNom: 'Dr. Kaltouma Djibrine',
        directeurEmail: 'direction@clinique-espoir.td',
        statut: 'actif',
        dateCreation: '2024-01-01',
      }
    );
  }, [etablissements, patient?.etablissementId, patient?.etablissementNom]);

  const availableDoctors = useMemo(() => {
    const pool = (allUsers && allUsers.length > 0) ? allUsers : users;
    const sameEtab = pool.filter(
      u =>
        (u.role === 'medecin' || u.role === 'directeur') &&
        (!patient?.etablissementId || u.etablissementId === patient?.etablissementId || u.etablissementId === 'all')
    );
    if (sameEtab.length > 0) return sameEtab;
    return pool.filter(u => u.role === 'medecin' || u.role === 'directeur');
  }, [allUsers, users, patient?.etablissementId]);

  useEffect(() => {
    if (availableDoctors.length > 0 && !newApptDoctorId) {
      setNewApptDoctorId(availableDoctors[0].id);
    }
  }, [availableDoctors, newApptDoctorId]);

  const handleSelectDoctorChat = (doc: any) => {
    const existing = assignments.find(a => a.patientId === patient.id && a.staffId === doc.id);
    if (!existing) {
      ajouterAssignation({
        patientId: patient.id,
        patientNom: `${patient.prenom} ${patient.nom}`,
        staffId: doc.id,
        staffNom: `${doc.prenom} ${doc.nom}`,
        staffRole: doc.role,
        dateAssignation: new Date().toISOString().split('T')[0],
      });
    }
    setSelectedStaffId(doc.id);
    setActiveTab('messages');
  };

  const handleSelectDoctorAppt = (doc: any, type: 'presentiel' | 'teleconsultation' = 'presentiel') => {
    setNewApptDoctorId(doc.id);
    setNewApptType(type);
    setShowNewApptModal(true);
  };

  const handleStartTeleconsult = (docName: string) => {
    setTeleconsultDoctorNom(docName);
    setSelectedApptForTeleconsult(null);
    setShowTeleconsultModal(true);
  };

  const handleChangeHospital = (newEtabId: string) => {
    const targetEtab = etablissements.find(e => e.id === newEtabId);
    if (!targetEtab) return;
    modifierPatient({
      ...patient,
      etablissementId: targetEtab.id,
      etablissementNom: targetEtab.nom,
    });
  };

  const handleDownloadQR = () => {
    if (!qrCodeUrl) return;
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `Pass-Sante-QR-${patient.matricule}.png`;
    link.click();
  };

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const pool = (allUsers && allUsers.length > 0) ? allUsers : users;
    const doc = pool.find(u => u.id === newApptDoctorId) || availableDoctors[0];
    if (!doc) return;

    creerRendezVous({
      patientId: patient.id,
      patientNom: `${patient.prenom} ${patient.nom}`,
      patientTelephone: patient.telephone,
      medecinId: doc.id,
      medecinNom: `${doc.prenom} ${doc.nom}`,
      date: newApptDate,
      heure: newApptTime,
      type: newApptType,
      motif: newApptMotif,
      statut: 'confirme',
      etablissementId: patient.etablissementId,
      etablissementNom: patient.etablissementNom,
    });

    setApptSuccessNotice(true);
    setTimeout(() => {
      setApptSuccessNotice(false);
      setShowNewApptModal(false);
    }, 1200);
  };

  const unreadMessagesCount = getUnreadStaffMessagesCount();

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Patient Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2.5">
          <Logo size="sm" />
          <span className="text-xs font-black text-[#0B3C5D] hidden sm:inline">
            Espace Citoyen & Patient
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Badge Identité Patient Connecté (Strictement Cloisonné) */}
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="max-w-[140px] truncate">{patient.prenom} {patient.nom}</span>
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">({patient.matricule})</span>
          </div>

          {/* Edit Profile & Photo */}
          <button
            onClick={() => setShowEditProfileModal(true)}
            className="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-[#1E88E5] text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            title="Modifier mes informations ou ma photo"
          >
            <UserCog className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Modifier mon Profil</span>
          </button>

          {/* Déconnexion Sécurisée */}
          <button
            onClick={logout}
            className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            title="Se déconnecter de mon Espace Patient"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Patient Profile Header Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0B3C5D] via-[#0E4971] to-[#1E88E5] text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          {patient.avatar ? (
            <img
              src={patient.avatar}
              alt={patient.nom}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-teal-400 shadow-md"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-white/10 border-2 border-teal-400 text-teal-200 font-black flex items-center justify-center text-2xl shadow-md flex-shrink-0">
              {patient.prenom?.[0]}{patient.nom?.[0]}
            </div>
          )}
          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="text-[10px] font-mono font-bold bg-white/20 px-2 py-0.5 rounded-full text-teal-200">
                {patient.matricule}
              </span>
              <span className="text-[10px] bg-emerald-500/30 text-emerald-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Espace Patient Vérifié
              </span>
              <span className="text-[10px] bg-sky-500/30 text-sky-200 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Building2 className="w-3 h-3" /> {patient.etablissementNom || 'Clinique Médicale Espoir'}
              </span>
              {patient.assurance?.adherent ? (
                <button
                  type="button"
                  onClick={() => setActiveTab('assurance')}
                  className="text-[10px] bg-amber-400/30 text-amber-200 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 hover:bg-amber-400/40 transition cursor-pointer"
                  title="Voir ma carte et mes droits d'assurance"
                >
                  <Shield className="w-3 h-3 text-amber-300" />
                  <span>Assuré {patient.assurance.organisme} ({patient.assurance.tauxCouverture}%)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveTab('assurance')}
                  className="text-[10px] bg-white/10 text-slate-300 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 hover:bg-white/20 transition cursor-pointer"
                  title="Ajouter une mutuelle ou assurance médicale"
                >
                  <Shield className="w-3 h-3 text-slate-300" />
                  <span>Mutuelle santé : Ajouter</span>
                </button>
              )}
            </div>
            <h1 className="text-2xl font-black text-white mt-1">
              {patient.prenom} {patient.nom}
            </h1>
            <p className="text-xs text-slate-200 mt-0.5">
              {patient.age && patient.age > 0 ? `${patient.age} ans` : (patient.dateNaissance ? `Né(e) le ${patient.dateNaissance}` : 'Âge non renseigné')} • Tél : {patient.telephone || 'Non renseigné'} • {patient.adresse || 'Adresse non renseignée'}
            </p>
          </div>
        </div>

        {/* Vital Quick Pill */}
        <div className="flex items-center gap-3 bg-white/10 p-3.5 rounded-2xl border border-white/20">
          <div className="text-center px-2">
            <span className="text-[10px] uppercase text-slate-300 block font-bold">Groupe Sanguin</span>
            <span className="text-xl font-black text-rose-400">{patient.groupeSanguin === 'Inconnu' ? 'Inconnu' : patient.groupeSanguin}</span>
          </div>
          <div className="h-8 w-px bg-white/20" />
          <div className="text-left text-xs space-y-0.5">
            <p className="text-amber-300 font-bold text-[11px] line-clamp-1">
              ⚠️ Allergie : {patient.allergies && patient.allergies.length > 0 ? patient.allergies.join(', ') : 'Aucune déclarée'}
            </p>
            <p className="text-slate-200 text-[11px]">
              📞 Urgence : {patient.contactUrgenceNom ? `${patient.contactUrgenceNom} (${patient.contactUrgenceTel || 'N/A'})` : 'Non renseigné'}
            </p>
          </div>
        </div>
      </div>

      {/* Emergency Assistance Banner N'Djamena */}
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-xs">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-rose-950 text-xs">Urgences Médicales & Secours N'Djamena :</p>
            <p className="text-[11px] text-rose-700">SAMU Tchad (15 ou 22 51 00 00) • Hôpital Général Référence (22 52 23 23)</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="tel:15"
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition flex items-center gap-1.5 shadow-xs"
          >
            <PhoneCall className="w-3 h-3" />
            <span>Appeler SAMU 15</span>
          </a>
          {patient.contactUrgenceTel && (
            <a
              href={`tel:${patient.contactUrgenceTel.replace(/\s+/g, '')}`}
              className="px-3 py-1.5 rounded-xl bg-white border border-rose-300 text-rose-800 hover:bg-rose-100 font-bold text-xs transition flex items-center gap-1.5"
            >
              <span>Contact : {patient.contactUrgenceNom}</span>
            </a>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('carte')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition whitespace-nowrap ${
            activeTab === 'carte' ? 'bg-white text-[#0B3C5D] shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <QrCode className="w-4 h-4 text-teal-600" />
          <span>Ma Carte Vitale QR</span>
        </button>

        <button
          onClick={() => setActiveTab('hopital')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition whitespace-nowrap ${
            activeTab === 'hopital' ? 'bg-white text-[#0B3C5D] shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4 text-sky-600" />
          <span>Mon Hôpital & Médecins</span>
        </button>

        <button
          onClick={() => setActiveTab('rdv')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition whitespace-nowrap ${
            activeTab === 'rdv' ? 'bg-white text-[#0B3C5D] shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4 text-purple-600" />
          <span>Rendez-vous & Visio ({patientAppointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition whitespace-nowrap relative ${
            activeTab === 'messages' ? 'bg-white text-[#0B3C5D] shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-blue-600" />
          <span>Messagerie Soignants</span>
          {unreadMessagesCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse ml-0.5" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('ordonnances')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition whitespace-nowrap ${
            activeTab === 'ordonnances' ? 'bg-white text-[#0B3C5D] shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-600" />
          <span>Mes Ordonnances ({patientOrdonnances.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analyses')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition whitespace-nowrap ${
            activeTab === 'analyses' ? 'bg-white text-[#0B3C5D] shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Microscope className="w-4 h-4 text-cyan-600" />
          <span>Mes Résultats d'Analyses ({patientExams.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('interhopitaux')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition whitespace-nowrap relative ${
            activeTab === 'interhopitaux' ? 'bg-white text-[#0B3C5D] shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4 text-teal-600" />
          <span>Réseau Inter-Hôpitaux & DMP ({patientTransfers.length})</span>
          {patientTransfers.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse ml-0.5" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('factures')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition whitespace-nowrap ${
            activeTab === 'factures' ? 'bg-white text-[#0B3C5D] shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-4 h-4 text-stone-600" />
          <span>Mes Reçus ({patientInvoices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('assurance')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition whitespace-nowrap ${
            activeTab === 'assurance' ? 'bg-white text-amber-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shield className="w-4 h-4 text-amber-600" />
          <span>Mon Assurance & Tiers-Payant {patient.assurance?.adherent ? '🛡️' : ''}</span>
        </button>
      </div>

      {/* Tab 1: Digital QR Card Screen */}
      {activeTab === 'carte' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="rounded-3xl bg-gradient-to-br from-[#0B3C5D] via-[#0E4971] to-[#0B3C5D] p-6 sm:p-8 text-white shadow-2xl border-2 border-teal-400/40 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/15">
              <Logo size="sm" lightMode={true} />
              <span className="text-[10px] font-mono tracking-widest text-teal-300 font-black uppercase">
                CARTE D'URGENCE DARÔ
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="p-3 bg-white rounded-2xl shadow-xl flex flex-col items-center">
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt="QR Personnel"
                    className="w-40 h-40 object-contain cursor-pointer hover:opacity-95 transition"
                    style={{ imageRendering: 'pixelated' }}
                    onClick={() => setShowFullscreenPortalQR(true)}
                    title="Agrandir en plein écran"
                  />
                ) : (
                  <div className="w-40 h-40 flex items-center justify-center text-slate-400 text-xs">Génération...</div>
                )}
                <button
                  onClick={() => setShowFullscreenPortalQR(true)}
                  className="mt-1.5 px-2.5 py-1 bg-slate-100 hover:bg-teal-50 text-[#0B3C5D] rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                >
                  <Maximize2 className="w-3 h-3 text-teal-600" />
                  <span>Agrandir pour scanner</span>
                </button>
              </div>

              <div className="space-y-3 text-center sm:text-left">
                <div>
                  <h3 className="text-xl font-black text-white">{patient.prenom} {patient.nom}</h3>
                  <p className="text-xs text-teal-200 font-mono">{patient.matricule}</p>
                </div>

                <div className="p-2 rounded-xl bg-white/10 border border-white/10 inline-block">
                  <span className="text-[10px] uppercase text-slate-300 block font-bold">Groupe Sanguin</span>
                  <span className="text-2xl font-black text-rose-400">
                    {patient.groupeSanguin === 'Inconnu' ? 'Inconnu (À typer)' : patient.groupeSanguin}
                  </span>
                </div>

                <div className="text-[11px] space-y-1">
                  <p className="text-amber-300">
                    ⚠️ {patient.allergies && patient.allergies.length > 0 ? patient.allergies.join(', ') : 'Aucune allergie renseignée'}
                  </p>
                  <p className="text-slate-200">
                    📞 Urgence : {patient.contactUrgenceNom ? `${patient.contactUrgenceNom} (${patient.contactUrgenceTel || 'N/A'})` : 'Non renseigné'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowQRCardPrintModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5 text-teal-300" />
                  <span>Imprimer la Carte</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadQR}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-500/25 hover:bg-teal-500/40 text-teal-100 text-xs font-bold transition flex items-center gap-1.5 shadow-sm border border-teal-300/30"
                  title="Enregistrer l'image du QR code dans votre téléphone"
                >
                  <Download className="w-3.5 h-3.5 text-teal-300" />
                  <span>Télécharger PNG</span>
                </button>
              </div>

              <span className="text-[10px] text-teal-300 font-mono">Clinique DARÔ • N'Djamena</span>
            </div>
          </div>

          {/* Safety & Instructions box */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 text-xs">
            <div className="flex items-center gap-2 text-[#0B3C5D]">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
              <h3 className="text-base font-bold">Comment fonctionne votre QR Code d'Urgence ?</h3>
            </div>
            <p className="text-slate-600 leading-relaxed">
              En cas d'accident ou de malaise inconscient à N'Djamena, n'importe quel secouriste ou soignant peut scanner ce QR Code avec un smartphone standard.
            </p>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                  1
                </span>
                <div>
                  <strong className="text-slate-900 block">Accès instantané aux constantes vitales (Sans Internet) :</strong>
                  <span className="text-slate-500 text-[11px]">
                    Votre nom, prénom, groupe sanguin ({patient.groupeSanguin}) et votre contact d'urgence ({patient.contactUrgenceNom}) sont gravés dans le QR code sous forme de texte brut lisible immédiatement même sans réseau.
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                  2
                </span>
                <div>
                  <strong className="text-slate-900 block">Lien Médecin à Distance (Sous le texte) :</strong>
                  <span className="text-slate-500 text-[11px]">
                    Le QR code contient également le lien sécurisé permettant au médecin ou secouriste d'accéder à votre fiche clinique complète sur la plateforme DARÔ.
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                  3
                </span>
                <div>
                  <strong className="text-slate-900 block">Toujours sur votre téléphone :</strong>
                  <span className="text-slate-500 text-[11px]">
                    Vous pouvez enregistrer cette carte dans vos photos ou l'imprimer pour la garder dans votre portefeuille ou en faire un bracelet d'urgence.
                  </span>
                </div>
              </div>
            </div>

            {/* Offline text & Doctor URL live copy box */}
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                  Contenu textuel brut gravé dans le QR code :
                </span>
                <button
                  onClick={() => handleCopy(qrPayloadString, 'brut')}
                  className="text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1 hover:underline"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copier le texte brut</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[10px] space-y-1">
                <p className="text-emerald-400 font-bold">🏥 FICHE D'URGENCE DARÔ (SANS INTERNET)</p>
                <p>PATIENT : {patient.nom.toUpperCase()} {patient.prenom}</p>
                <p className="text-rose-400 font-bold">GROUPE SANGUIN : {patient.groupeSanguin === 'Inconnu' ? 'Inconnu (À typer)' : patient.groupeSanguin}</p>
                <p>CONTACT URGENCE : {patient.contactUrgenceNom ? `${patient.contactUrgenceNom} (${patient.contactUrgenceRelation || 'Proche'}) • ${patient.contactUrgenceTel || 'N/A'}` : 'Non renseigné'}</p>
                <p className="text-amber-300">ALLERGIES : {patient.allergies && patient.allergies.length > 0 ? patient.allergies.join(', ') : 'Aucune'}</p>
                <p className="text-teal-300">LIEN MÉDECIN : {typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?qr=${encodeURIComponent(patient.qrToken)}` : `https://daro-sante.td/?qr=${patient.qrToken}`}</p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => handleCopy(`${window.location.origin}${window.location.pathname}?qr=${encodeURIComponent(patient.qrToken)}`, 'lien')}
                  className="text-[11px] text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1.5 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Copier le lien direct médecin</span>
                </button>

                {copyFeedback && (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    ✓ {copyFeedback === 'lien' ? 'Lien copié !' : 'Texte brut copié !'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Mon Hôpital & Médecins */}
      {activeTab === 'hopital' && (
        <PatientHospitalCard
          patient={patient}
          patientHospital={patientHospital}
          etablissements={etablissements}
          doctors={availableDoctors}
          onSelectDoctorChat={handleSelectDoctorChat}
          onSelectDoctorAppt={handleSelectDoctorAppt}
          onStartTeleconsult={handleStartTeleconsult}
          onChangeHospital={handleChangeHospital}
        />
      )}

      {/* Tab 2: Prescriptions */}
      {activeTab === 'ordonnances' && (
        <div className="space-y-4">
          {patientOrdonnances.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
              Aucune ordonnance délivrée pour le moment.
            </div>
          ) : (
            patientOrdonnances.map(ord => (
              <div key={ord.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {ord.numero}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">Dr. {ord.medecinNom}</h3>
                  </div>
                  <span className="text-xs text-slate-400">{ord.date}</span>
                </div>

                <div className="space-y-2">
                  {ord.items.map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <p className="font-bold text-slate-900">{item.medicament}</p>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        Posologie : {item.posologie} — Durée : {item.duree}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedOrdToPrint(ord)}
                    className="px-3.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition flex items-center gap-1.5 border border-teal-200"
                  >
                    <Printer className="w-3.5 h-3.5 text-teal-600" />
                    <span>Imprimer l'Ordonnance & QR</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Analyses */}
      {activeTab === 'analyses' && (
        <div className="space-y-4">
          {patientExams.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
              Aucun examen biologique ou radiologique enregistré.
            </div>
          ) : (
            patientExams.map(exam => (
              <div key={exam.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                      {exam.type === 'laboratoire' ? 'Laboratoire d\'Analyses' : 'Imagerie Médicale'}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{exam.nomExamen}</h3>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      exam.statut === 'valide'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {exam.statut === 'valide' ? 'Résultat disponible' : 'En attente d\'analyse'}
                  </span>
                </div>

                {exam.statut === 'valide' && exam.resultat ? (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <p className="font-semibold text-slate-900">Résultat : {exam.resultat}</p>
                    {exam.valeursNormales && (
                      <p className="text-slate-500 text-[11px]">Normes : {exam.valeursNormales}</p>
                    )}
                    <p className="text-[10px] text-teal-700 pt-1">
                      Validé par {exam.technicienNom} le {exam.dateResultat}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    L'échantillon est en cours de traitement au laboratoire de la clinique.
                  </p>
                )}

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedExamToPrint(exam)}
                    className="px-3.5 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-xs font-bold transition flex items-center gap-1.5 border border-cyan-200"
                  >
                    <Printer className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Imprimer le Bulletin d'Examen & QR</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 4: Rendez-vous */}
      {activeTab === 'rdv' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Mes consultations & téléconsultations ({patientAppointments.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Prenez rendez-vous en présentiel à l'hôpital ({patientHospital.nom}) ou en vidéo à distance.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleStartTeleconsult(patientHospital.directeurNom || 'Dr. Kaltouma Djibrine')}
                className="px-4 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Video className="w-3.5 h-3.5 text-purple-700" />
                <span>Visio Urgence Directe</span>
              </button>
              <button
                type="button"
                onClick={() => setShowNewApptModal(true)}
                className="px-4 py-2 rounded-xl bg-[#0B3C5D] hover:bg-[#1E88E5] text-white text-xs font-bold shadow flex items-center gap-1.5 transition cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>+ Prendre un rendez-vous</span>
              </button>
            </div>
          </div>

          {patientAppointments.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs space-y-3">
              <p>Aucun rendez-vous prévu pour le moment.</p>
              <button
                type="button"
                onClick={() => setShowNewApptModal(true)}
                className="px-4 py-2 rounded-xl bg-[#0B3C5D] hover:bg-[#1E88E5] text-white text-xs font-bold shadow inline-flex items-center gap-1.5 transition cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Programmer votre première consultation</span>
              </button>
            </div>
          ) : (
            patientAppointments.map(appt => (
              <div key={appt.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                      {appt.type === 'teleconsultation' ? 'Téléconsultation Vidéo Sécurisée' : 'Présentiel Clinique'}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">{appt.date} à {appt.heure}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-1.5">{appt.motif}</h4>
                  <p className="text-xs text-[#1E88E5] font-semibold mt-0.5">{appt.medecinNom} • {patientHospital.nom}</p>
                </div>

                <div className="flex items-center gap-2">
                  {appt.type === 'teleconsultation' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedApptForTeleconsult(appt);
                        setTeleconsultDoctorNom(appt.medecinNom);
                        setShowTeleconsultModal(true);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-bold transition flex items-center gap-2 shadow-md shadow-purple-900/20 cursor-pointer"
                    >
                      <Video className="w-4 h-4" />
                      <span>Rejoindre la Téléconsultation</span>
                    </button>
                  ) : (
                    <span className="text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                      Sur place à l'accueil
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 5: Factures */}
      {activeTab === 'factures' && (
        <div className="space-y-4">
          {patientInvoices.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
              Aucune facture ou reçu.
            </div>
          ) : (
            patientInvoices.map(inv => (
              <div key={inv.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">{inv.numero}</span>
                    {inv.partAssuranceFCFA ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                        <Shield className="w-3 h-3 text-amber-600" />
                        Tiers-Payant ({inv.tauxCouvertureApplique || 80}%)
                      </span>
                    ) : null}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {inv.items.map(it => it.description).join(' + ')}
                  </h4>
                  <p className="text-xs text-slate-500">Date : {inv.date} • Mode : {inv.modePaiement}</p>

                  {inv.partAssuranceFCFA ? (
                    <div className="mt-2 text-xs bg-amber-50/80 rounded-xl p-2.5 border border-amber-200 text-amber-950 space-y-0.5">
                      <div className="flex items-center justify-between font-semibold">
                        <span>🛡️ Prise en charge {inv.organismeAssurance || 'Assurance'} :</span>
                        <span className="font-mono font-bold text-emerald-800">
                          - {inv.partAssuranceFCFA.toLocaleString('fr-FR')} FCFA
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-700">
                        <span>Ticket modérateur réglé par le patient :</span>
                        <span className="font-mono font-bold text-slate-900">
                          {inv.partPatientFCFA?.toLocaleString('fr-FR')} FCFA
                        </span>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="text-right sm:self-center">
                  <span className="text-base font-black text-[#0B3C5D] font-mono">
                    {(inv.totalFCFA ?? inv.total ?? 0).toLocaleString('fr-FR')} FCFA
                  </span>
                  <p className="text-[10px] text-emerald-700 font-bold uppercase mt-0.5">
                    {inv.statut === 'payee' ? '✓ Reçu réglé' : 'En attente'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Assurance Médicale & Tiers-Payant */}
      {activeTab === 'assurance' && (
        <div className="space-y-6 animate-in fade-in">
          {patient.assurance?.adherent ? (
            <>
              {/* Carte d'Assurance Digitale */}
              <div className="max-w-2xl mx-auto rounded-3xl bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 text-white p-6 sm:p-8 shadow-2xl border-2 border-amber-400/50 space-y-6 relative overflow-hidden">
                <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

                {/* Top header of card */}
                <div className="flex items-center justify-between pb-4 border-b border-amber-400/30">
                  <div className="flex items-center gap-2">
                    <Shield className="w-6 h-6 text-amber-300" />
                    <div>
                      <h4 className="text-xs font-black tracking-widest text-amber-200 uppercase">
                        CARTE MUTUELLE SANTÉ & TIERS-PAYANT
                      </h4>
                      <p className="text-[10px] text-amber-100 font-medium">Clinique Médicale Darô • Réseau Tchad</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/30 border border-emerald-400/40 text-[10px] font-bold text-emerald-200 flex items-center gap-1">
                    <BadgeCheck className="w-3 h-3" /> Droits Ouverts
                  </span>
                </div>

                {/* Main body of insurance card */}
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {patient.avatar ? (
                    <img
                      src={patient.avatar}
                      alt={patient.nom}
                      className="w-24 h-24 rounded-2xl object-cover border-2 border-amber-300 shadow-md shrink-0"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-white/10 border-2 border-amber-300 text-amber-200 font-black flex items-center justify-center text-3xl shadow-md shrink-0">
                      {patient.prenom?.[0]}{patient.nom?.[0]}
                    </div>
                  )}

                  <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-amber-200">Bénéficiaire / Assuré</p>
                      <h3 className="text-xl font-black truncate">{patient.prenom} {patient.nom}</h3>
                      <p className="text-xs text-amber-100 font-mono">Matricule Patient : {patient.matricule}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                      <div>
                        <span className="text-[10px] uppercase text-amber-200 block font-bold">Organisme Assureur</span>
                        <strong className="text-sm font-black text-white">{patient.assurance.organisme}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-amber-200 block font-bold">Prise en Charge</span>
                        <strong className="text-sm font-black text-emerald-300">{patient.assurance.tauxCouverture}% Tiers-Payant</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom details */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-amber-400/30 text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-amber-200 block">N° Police / Adhérent</span>
                    <strong className="font-mono text-white text-xs">{patient.assurance.numeroPolice || 'Non renseigné'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-amber-200 block">Date de Validité</span>
                    <strong className="text-white text-xs">{patient.assurance.dateValidite || '31/12/2026'}</strong>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-[10px] uppercase text-amber-200 block">Ticket Modérateur</span>
                    <strong className="text-amber-200 text-xs">{100 - (patient.assurance.tauxCouverture || 80)}% à charge patient</strong>
                  </div>
                </div>
              </div>

              {/* Rights and covered treatments */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Prestations couvertes par votre contrat</h3>
                      <p className="text-xs text-slate-500">Plafond et conditions de prise en charge contractuelle avec {patient.assurance.organisme}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowEditProfileModal(true)}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer"
                  >
                    Modifier mes informations
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-1">
                    <p className="font-bold text-emerald-950 flex items-center justify-between">
                      <span>🩺 Consultations Générales & Spécialisées</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px]">Couvert à {patient.assurance.tauxCouverture}%</span>
                    </p>
                    <p className="text-[11px] text-slate-600">Médecine générale, Pédiatrie, Gynécologie, Cardiologie, Médecine d'urgence.</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-1">
                    <p className="font-bold text-emerald-950 flex items-center justify-between">
                      <span>🔬 Analyses & Laboratoire Biologique</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px]">Couvert à {patient.assurance.tauxCouverture}%</span>
                    </p>
                    <p className="text-[11px] text-slate-600">Goutte épaisse/Paludisme, Hémogramme NFS, Électrophorèse Hb, Bilan hépatique.</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-1">
                    <p className="font-bold text-emerald-950 flex items-center justify-between">
                      <span>💊 Pharmacie & Médicaments</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px]">Couvert à {patient.assurance.tauxCouverture}%</span>
                    </p>
                    <p className="text-[11px] text-slate-600">Médicaments inscrits sur la liste agréée par votre mutuelle / CNPS.</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-1">
                    <p className="font-bold text-emerald-950 flex items-center justify-between">
                      <span>🏥 Hospitalisation & Chirurgie</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px]">Entente préalable</span>
                    </p>
                    <p className="text-[11px] text-slate-600">Chambre, soins intensifs et interventions chirurgicales avec bon d'accord.</p>
                  </div>
                </div>
              </div>

              {/* How Tiers-Payant works guide */}
              <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 space-y-3">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Comment utiliser votre Tiers-Payant à la Clinique Darô ?
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1">
                    <span className="w-6 h-6 rounded-lg bg-[#0B3C5D] text-white flex items-center justify-center font-bold text-xs">1</span>
                    <p className="font-bold text-slate-900">Présentation du QR Code</p>
                    <p className="text-[11px] text-slate-500">Présentez votre QR Code Darô ou cette carte à l'accueil lors de votre arrivée.</p>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1">
                    <span className="w-6 h-6 rounded-lg bg-[#0B3C5D] text-white flex items-center justify-center font-bold text-xs">2</span>
                    <p className="font-bold text-slate-900">Transmission Automatique</p>
                    <p className="text-[11px] text-slate-500">La clinique envoie directement la feuille de soins électronique à {patient.assurance.organisme}.</p>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1">
                    <span className="w-6 h-6 rounded-lg bg-[#0B3C5D] text-white flex items-center justify-center font-bold text-xs">3</span>
                    <p className="font-bold text-slate-900">Zéro Avance de Frais</p>
                    <p className="text-[11px] text-slate-500">Vous ne payez que le ticket modérateur ({100 - (patient.assurance.tauxCouverture || 80)}%) en espèces ou Mobile Money.</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Patient has no insurance declared yet */
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center max-w-lg mx-auto space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-black text-slate-900">
                  Déclarez votre Mutuelle ou Assurance Santé
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Bénéficiez immédiatement du Tiers-Payant à la Clinique Darô : CNPS Tchad, Ascoma, Sanlam, Al Wafa, ou bon de société (SHT, CotonTchad). Vous n'aurez plus à faire l'avance des frais médicaux.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditProfileModal(true)}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow transition inline-flex items-center gap-2 cursor-pointer"
              >
                <Shield className="w-4 h-4" />
                <span>Renseigner ma Mutuelle & Tiers-Payant</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab: Réseau Inter-Hôpitaux & DMP (SAMU 15) */}
      {activeTab === 'interhopitaux' && (
        <div className="space-y-5 animate-in fade-in">
          {/* Banner: Dossier Médical Partagé d'Urgence */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#0B3C5D] via-[#0E4971] to-[#1E88E5] text-white shadow-lg space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Network className="w-6 h-6 text-teal-300" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300 block">
                    Réseau Hospitalier National • N'Djamena (Tchad)
                  </span>
                  <h3 className="text-lg font-black">
                    Mon Dossier Médical Partagé (DMP) & SAMU 15
                  </h3>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Synchronisation Urgences Active
              </span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed max-w-2xl">
              Chaque hôpital opère sur une base de données autonome et indépendante. Cependant, en cas d'urgence absolue, d'accident ou d'évacuation par le SAMU 15, votre profil vital (Groupe sanguin, Drépanocytose, Allergies et Contacts de secours) est synchronisé et consultable par les services d'urgence accrédités.
            </p>

            {/* Connected Hospitals Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              {etablissements.slice(0, 4).map(e => (
                <div key={e.id} className="p-2.5 rounded-xl bg-white/10 border border-white/10 text-center">
                  <p className="font-bold text-xs truncate">{e.nom}</p>
                  <p className="text-[10px] text-teal-300 truncate">
                    {e.id === patient.etablissementId ? '⭐ Clinique de rattachement' : e.ville || "N'Djamena"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Patient's Transfers List */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Mes Transferts & Évacuations Inter-Hôpitaux ({patientTransfers.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Historique et statut en temps réel des transferts coordonnés pour vos soins.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  initierTransfertInterHopital({
                    patientId: patient.id,
                    patientNom: `${patient.prenom} ${patient.nom}`,
                    patientMatricule: patient.matricule,
                    patientAge: patient.age,
                    patientSexe: patient.sexe,
                    patientGroupeSanguin: patient.groupeSanguin,
                    patientAllergies: patient.allergies,
                    etablissementSourceId: currentEtablissement?.id || 'etab-1',
                    etablissementSourceNom: currentEtablissement?.nom || 'Clinique Médicale Espoir',
                    etablissementDestId: 'etab-2',
                    etablissementDestNom: 'Hôpital Général de Référence Nationale (HGRN)',
                    medecinEmetteurId: 'usr-1',
                    medecinEmetteurNom: 'Dr. Haroun Mahamat',
                    motifTransfert: 'Besoin d\'examen scanner cérébral haute résolution et avis chirurgical d\'urgence',
                    degreUrgence: 'urgent',
                    moyenTransport: 'ambulance_samu15',
                    syntheseClinique: `Patient ${patient.prenom} ${patient.nom}, ${patient.age} ans, Groupe ${patient.groupeSanguin}. Allergies: ${patient.allergies.join(', ') || 'Aucune'}. Évacuation d'urgence demandée.`,
                  });
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow cursor-pointer"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>+ Simuler un Transfert vers HGRN</span>
              </button>
            </div>

            {patientTransfers.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs space-y-2">
                <p className="font-semibold text-slate-700">Aucun transfert inter-hospitalier actif pour votre dossier.</p>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                  Vos soins sont actuellement dispensés dans votre établissement principal. Si un examen lourd (Scanner, IRM, chirurgie cardiaque) ou une réanimation est requise, votre médecin coordonnera une évacuation sécurisée via le SAMU 15.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {patientTransfers.map(tr => (
                  <div key={tr.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white transition space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          tr.degreUrgence === 'vital_immediat' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {tr.degreUrgence === 'vital_immediat' ? '🚨 Urgence Vitale' : '⚠️ Urgent'}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-500">{tr.numero}</span>
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md ${
                        tr.statut === 'patient_admis' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        Statut : {tr.statut.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-black text-slate-900">
                      <Building2 className="w-4 h-4 text-slate-500" />
                      <span>{tr.etablissementSourceNom}</span>
                      <span className="text-[#1E88E5]">➔</span>
                      <span>{tr.etablissementDestNom}</span>
                    </div>

                    <p className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200">
                      <strong>Motif :</strong> {tr.motifTransfert}
                    </p>

                    <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                      <span>Transport : {tr.moyenTransport === 'ambulance_samu15' ? 'SAMU 15' : tr.moyenTransport}</span>
                      <span>Demandé le {tr.dateDemande}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 6: Messagerie Soignants (Chat patient <-> personnel assigné) */}
      {activeTab === 'messages' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {myAssignedRelations.length === 0 ? (
            /* Strict rule: If no assignment exists for this patient */
            <div className="p-8 sm:p-12 text-center max-w-lg mx-auto space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 mx-auto flex items-center justify-center">
                <UserCheck className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-black text-slate-800">
                  Démarrez une discussion avec un médecin de votre hôpital
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Pour votre sécurité médicale et la confidentialité de vos données, DARÔ établit une liaison chiffrée de bout en bout avec l'équipe soignante de votre établissement ({patientHospital.nom}).
                </p>
              </div>

              {/* Doctors of patient hospital */}
              <div className="space-y-2 pt-2">
                <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  Médecins disponibles immédiatement
                </p>
                <div className="space-y-2 text-left">
                  {availableDoctors.slice(0, 3).map(doc => (
                    <div
                      key={doc.id}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3 hover:border-slate-300 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={doc.avatar || africanDoctorClinic}
                          alt={doc.nom}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                        />
                        <div className="truncate">
                          <h4 className="text-xs font-bold text-slate-900">Dr. {doc.prenom} {doc.nom}</h4>
                          <p className="text-[10px] text-slate-500">{doc.specialite || 'Médecin Généraliste'}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectDoctorChat(doc)}
                        className="px-3 py-1.5 rounded-xl bg-[#0B3C5D] hover:bg-[#1E88E5] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Contacter</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
              {/* Left col: Assigned staff members list */}
              <div className="md:col-span-4 border-r border-slate-200 p-4 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Mon Équipe Soignante ({myAssignedRelations.length})
                  </h3>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                    Assignés
                  </span>
                </div>

                <div className="space-y-1.5">
                  {myAssignedRelations.map(rel => {
                    const staffMember = users.find(u => u.id === rel.staffId);
                    const isSelected = selectedStaffId === rel.staffId;
                    const staffUnread = chatMessages.filter(
                      m => m.estPatientChat && !m.lu && m.patientId === patient.id && m.senderId === rel.staffId
                    ).length;

                    return (
                      <button
                        key={rel.id}
                        onClick={() => setSelectedStaffId(rel.staffId)}
                        className={`w-full p-3 rounded-2xl text-left transition flex items-center gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-white shadow-xs border border-slate-200 text-slate-900 ring-2 ring-[#1E88E5]/20'
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="relative flex-shrink-0">
                          <img
                            src={staffMember?.avatar || africanDoctorClinic}
                            alt={rel.staffNom}
                            className="w-11 h-11 rounded-xl object-cover border border-slate-200"
                          />
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold truncate text-slate-900">{rel.staffNom}</p>
                            {staffUnread > 0 && (
                              <span className="px-1.5 py-0.5 bg-rose-500 text-white rounded-full text-[9px] font-black animate-pulse">
                                {staffUnread}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#1E88E5] font-semibold truncate">
                            {rel.roleAssignation}
                          </p>
                          <p className="text-[10px] text-slate-400 capitalize">
                            {staffMember?.role === 'medecin' ? 'Médecin' : staffMember?.role === 'infirmier' ? 'Infirmier' : staffMember?.role}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Other doctors of hospital */}
                {availableDoctors.filter(d => !myAssignedRelations.some(r => r.staffId === d.id)).length > 0 && (
                  <div className="pt-3 border-t border-slate-200 space-y-2">
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      Autres Médecins de {patientHospital.nom}
                    </p>
                    <div className="space-y-1">
                      {availableDoctors
                        .filter(d => !myAssignedRelations.some(r => r.staffId === d.id))
                        .map(doc => (
                          <button
                            key={doc.id}
                            type="button"
                            onClick={() => handleSelectDoctorChat(doc)}
                            className="w-full p-2.5 rounded-xl border border-dashed border-slate-200 hover:border-[#1E88E5] hover:bg-blue-50/50 text-left transition flex items-center justify-between text-xs cursor-pointer"
                          >
                            <span className="truncate font-bold text-slate-700">Dr. {doc.prenom} {doc.nom}</span>
                            <span className="text-[10px] text-sky-600 font-bold shrink-0">+ Message</span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100 text-[11px] text-blue-800 space-y-1 mt-4">
                  <p className="font-bold flex items-center gap-1">
                    <Radio className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                    Messagerie Clinique Directe
                  </p>
                  <p className="text-slate-600 text-[10px]">
                    Vos messages sont transmis en direct au soignant assigné.
                  </p>
                </div>
              </div>

              {/* Right col: Active conversation with selected staff */}
              <div className="md:col-span-8 flex flex-col bg-white">
                {selectedStaffUser && currentStaffRelation ? (
                  <>
                    {/* Header */}
                    <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-white">
                      <div className="flex items-center gap-3">
                        <img
                          src={selectedStaffUser.avatar || africanDoctorClinic}
                          alt={selectedStaffUser.nom}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">
                            {selectedStaffUser.prenom} {selectedStaffUser.nom}
                          </h4>
                          <p className="text-[11px] text-[#1E88E5] font-semibold">
                            {currentStaffRelation.roleAssignation} • <span className="text-emerald-700 font-bold">Disponible</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleStartTeleconsult(`Dr. ${selectedStaffUser.prenom} ${selectedStaffUser.nom}`)}
                          className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition flex items-center gap-1.5 border border-purple-200 cursor-pointer"
                          title="Lancer une téléconsultation vidéo immédiate avec ce médecin"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Lancer Visio</span>
                        </button>
                        <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-2 py-1 rounded-md">
                          Canal Chiffré DARÔ
                        </span>
                      </div>
                    </div>

                    {/* Messages Feed */}
                    <div className="flex-1 p-4 sm:p-6 space-y-3 overflow-y-auto max-h-[380px] bg-slate-50/50">
                      {patientStaffMessages.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 text-xs space-y-2">
                          <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
                          <p>Vous n'avez pas encore échangé de message avec ce soignant.</p>
                          <p className="text-[11px]">Posez votre question médicale ou demandez un conseil ci-dessous.</p>
                        </div>
                      ) : (
                        patientStaffMessages.map(msg => {
                          const isPatientSender = msg.senderRole === 'patient';

                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col ${isPatientSender ? 'items-end' : 'items-start'}`}
                            >
                              <div className="flex items-end gap-2 max-w-[85%]">
                                {!isPatientSender && (
                                  <img
                                    src={selectedStaffUser.avatar || africanDoctorClinic}
                                    alt={msg.senderNom}
                                    className="w-6 h-6 rounded-lg object-cover mb-1 border border-slate-200"
                                  />
                                )}

                                <div
                                  className={`rounded-2xl px-4 py-2.5 text-xs shadow-2xs leading-relaxed ${
                                    isPatientSender
                                      ? 'bg-[#1E88E5] text-white rounded-br-xs font-medium'
                                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                                  }`}
                                >
                                  <p className="whitespace-pre-wrap">{msg.texte}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-slate-400">
                                <span>{msg.timestamp}</span>
                                {isPatientSender && (
                                  <span className="flex items-center text-slate-400">
                                    {msg.lu ? (
                                      <CheckCheck className="w-3.5 h-3.5 text-blue-500" title="Lu par le soignant" />
                                    ) : (
                                      <Check className="w-3.5 h-3.5" title="Transmis" />
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Chat input */}
                    <form onSubmit={handleSendChatMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                      <input
                        type="text"
                        value={chatInputText}
                        onChange={e => setChatInputText(e.target.value)}
                        placeholder={`Message à ${selectedStaffUser.prenom} ${selectedStaffUser.nom}...`}
                        className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#1E88E5] focus:outline-none transition-all"
                      />
                      <button
                        type="submit"
                        disabled={!chatInputText.trim()}
                        className="bg-[#1E88E5] hover:bg-[#1677cc] disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Envoyer</span>
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 text-xs">
                    Sélectionnez un soignant dans la liste pour démarrer la conversation.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fullscreen High-Resolution QR Scan Overlay */}
      {showFullscreenPortalQR && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Visez avec votre appareil photo
              </span>
              <button
                onClick={() => setShowFullscreenPortalQR(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-3xl shadow-2xl border-4 border-slate-900 inline-block mx-auto">
              <img
                src={qrCodeUrl}
                alt="QR Grand Format"
                className="w-64 h-64 sm:w-72 sm:h-72 object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>

            <div>
              <h3 className="text-lg font-black text-[#0B3C5D]">
                {patient.nom.toUpperCase()} {patient.prenom}
              </h3>
              <p className="text-sm font-bold text-rose-600 mt-0.5">
                Groupe Sanguin : {patient.groupeSanguin}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Urgence: {patient.contactUrgenceNom} ({patient.contactUrgenceTel})
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border text-xs text-slate-600 text-left space-y-1">
              <p className="font-bold text-slate-800">✅ Scannable sans connexion :</p>
              <p className="text-[11px]">
                Tout secouriste ou médecin avec un smartphone ordinaire lit instantanément vos données vitales d'urgence et dispose du lien vers votre dossier à distance.
              </p>
            </div>

            <button
              onClick={() => setShowFullscreenPortalQR(false)}
              className="w-full py-2.5 rounded-xl bg-[#0B3C5D] text-white font-bold text-xs hover:bg-[#1E88E5] transition"
            >
              Fermer le plein écran
            </button>
          </div>
        </div>
      )}

      {/* Edit Patient Profile Modal */}
      <PatientProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        patientToEdit={patient}
      />

      {/* Printable Emergency QR Card Modal */}
      {showQRCardPrintModal && (
        <PatientQRCardPrintModal
          isOpen={showQRCardPrintModal}
          patient={patient}
          onClose={() => setShowQRCardPrintModal(false)}
        />
      )}

      {/* Printable Prescription Modal */}
      {selectedOrdToPrint && (
        <OrdonnancePrintModal
          isOpen={!!selectedOrdToPrint}
          ordonnance={selectedOrdToPrint}
          onClose={() => setSelectedOrdToPrint(null)}
        />
      )}

      {/* Printable Exam Results Modal */}
      {selectedExamToPrint && (
        <ExamenPrintModal
          isOpen={!!selectedExamToPrint}
          examen={selectedExamToPrint}
          onClose={() => setSelectedExamToPrint(null)}
        />
      )}

      {/* In-Portal New Appointment Booking Modal */}
      {showNewApptModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1E88E5] flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Prendre un Rendez-vous</h3>
                  <p className="text-xs text-slate-400">Pour {patient.prenom} {patient.nom}</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewApptModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {apptSuccessNotice ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center font-black">
                  ✓
                </div>
                <h4 className="text-base font-bold text-slate-900">Rendez-vous Confirmé !</h4>
                <p className="text-xs text-slate-500">
                  Votre consultation a été enregistrée avec succès. Vous recevrez une notification de rappel.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookAppointment} className="space-y-4">
                {/* Consultation Type Switch */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Type de consultation</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewApptType('presentiel')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                        newApptType === 'presentiel'
                          ? 'border-[#0B3C5D] bg-[#0B3C5D] text-white shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Présentiel à la clinique</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewApptType('teleconsultation')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                        newApptType === 'teleconsultation'
                          ? 'border-purple-700 bg-purple-700 text-white shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Téléconsultation Vidéo</span>
                    </button>
                  </div>
                </div>

                {/* Doctor Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Médecin traitant ou spécialiste</label>
                  <select
                    value={newApptDoctorId}
                    onChange={e => setNewApptDoctorId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#1E88E5] focus:outline-none"
                    required
                  >
                    {availableDoctors.map(doc => (
                      <option key={doc.id} value={doc.id}>
                        Dr. {doc.prenom} {doc.nom} ({doc.specialite || 'Médecin Généraliste'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Date souhaitée</label>
                    <input
                      type="date"
                      value={newApptDate}
                      onChange={e => setNewApptDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-[#1E88E5] focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Heure de rendez-vous</label>
                    <select
                      value={newApptTime}
                      onChange={e => setNewApptTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-[#1E88E5] focus:outline-none"
                    >
                      <option value="08:30">08h30</option>
                      <option value="09:00">09h00</option>
                      <option value="09:30">09h30</option>
                      <option value="10:00">10h00</option>
                      <option value="11:00">11h00</option>
                      <option value="12:00">12h00</option>
                      <option value="15:00">15h00</option>
                      <option value="16:00">16h00</option>
                      <option value="17:00">17h00</option>
                    </select>
                  </div>
                </div>

                {/* Motif */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Motif de consultation</label>
                  <input
                    type="text"
                    value={newApptMotif}
                    onChange={e => setNewApptMotif(e.target.value)}
                    placeholder="Ex : Suivi tension artérielle, renouvellement de traitement..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-[#1E88E5] focus:outline-none"
                    required
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowNewApptModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#0B3C5D] hover:bg-[#1E88E5] text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirmer le rendez-vous</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Interactive Teleconsultation Video Room */}
      <TeleconsultationModal
        isOpen={showTeleconsultModal}
        onClose={() => {
          setShowTeleconsultModal(false);
          setSelectedApptForTeleconsult(null);
        }}
        appointment={selectedApptForTeleconsult}
        patient={patient}
        doctorNom={teleconsultDoctorNom}
        clinicNom={patientHospital.nom}
      />
    </div>
  );
};
