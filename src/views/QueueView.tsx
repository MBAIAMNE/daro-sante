import React, { useState } from 'react';
import {
  Clock,
  UserCheck,
  AlertTriangle,
  Stethoscope,
  Plus,
  HeartPulse,
  Thermometer,
  Activity,
  ArrowRight,
  Filter,
  CheckCircle2,
  Sparkles,
  User,
  UserPlus,
  Smartphone,
  Printer,
  QrCode,
  Search,
  Phone,
  Shield,
  Droplet,
  MapPin,
  Calendar,
  ChevronDown,
  ChevronUp,
  Check,
  Layers,
  Heart,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { QueueTicket, VitalSigns, UrgenceLevel, Patient } from '../types';
import { PatientQRCardPrintModal } from '../components/PatientQRCardPrintModal';

const NDJAMENA_QUARTIERS = [
  'Moursal',
  'Dembé',
  'Farcha',
  'Amriguebé',
  'Chagoua',
  'Sabangali',
  'Bololo',
  'Paris-Congo',
  'Walia',
  'Diguel',
  'Habena',
  'Gassi',
  'N\'Gueli',
  'Ridina',
  'Gardolé',
  'Atrone',
];

const QUICK_MOTIFS = [
  'Fièvre élevée & frissons intenses',
  'Suspicion Paludisme aigu',
  'Malaise, vertiges & faiblesse',
  'Douleurs abdominales aiguës',
  'Traumatisme / Chute récente',
  'Accident de moto / circulation',
  'Crise drépanocytaire vaso-occlusive',
  'Détresse respiratoire & toux fébrile',
  'Vomissements & déshydratation',
  'Céphalées intenses avec photophobie',
];

export const QueueView: React.FC = () => {
  const {
    queue,
    patients,
    users,
    currentRole,
    currentUser,
    enregistrerArriveePatient,
    ajouterPatient,
    effectuerTriage,
    appelerEnConsultation,
    setCurrentView,
  } = useClinic();

  const [activeTab, setActiveTab] = useState<'tous' | 'en_attente' | 'triage_fait' | 'en_consultation'>('tous');

  // Intake Modal state (Accueil / Directeur)
  const [showArrivalModal, setShowArrivalModal] = useState(false);
  const [arrivalMode, setArrivalMode] = useState<'nouveau' | 'existant'>('nouveau');
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [existingPatientSearch, setExistingPatientSearch] = useState('');
  const [motifArrivee, setMotifArrivee] = useState('Fièvre élevée avec frissons intenses');

  // New patient form fields
  const [newPatientForm, setNewPatientForm] = useState({
    nom: '',
    prenom: '',
    sexe: 'M' as 'M' | 'F',
    age: '30',
    dateNaissance: '',
    telephone: '+235 ',
    quartier: 'Moursal',
    adresse: '',
    groupeSanguin: 'Inconnu' as any,
    contactUrgenceNom: '',
    contactUrgenceTel: '',
    contactUrgenceRelation: 'Famille / Proche',
    allergies: '',
    maladiesChroniques: '',
    motif: 'Fièvre élevée avec frissons intenses',
  });
  const [showMedicalAccordion, setShowMedicalAccordion] = useState(false);

  // Success Confirmation Modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastCreatedPatient, setLastCreatedPatient] = useState<Patient | null>(null);
  const [lastIssuedTicket, setLastIssuedTicket] = useState<QueueTicket | null>(null);

  // QR Print Modal state
  const [patientToPrintQR, setPatientToPrintQR] = useState<Patient | null>(null);
  const [printModalInitialMode, setPrintModalInitialMode] = useState<'sticker' | 'carte' | 'fiche'>('sticker');

  // Triage Modal state (Infirmier / Directeur)
  const [triageTicket, setTriageTicket] = useState<QueueTicket | null>(null);
  const [vitals, setVitals] = useState<VitalSigns>({
    temperature: 38.5,
    tensionArterielle: '120/80',
    frequenceCardiaque: 88,
    saturationO2: 97,
    glycemie: 105,
    poids: 65,
    douleurEchelle: 4,
    notesInfirmier: 'Patient conscient, se plaint de céphalées frontales et courbatures.',
  });
  const [selectedUrgence, setSelectedUrgence] = useState<UrgenceLevel>('urgent');
  const [selectedDoctorId, setSelectedDoctorId] = useState(
    users.find(u => u.role === 'medecin')?.id || users[0]?.id || ''
  );

  // Filtered queue items
  const filteredQueue = queue.filter(ticket => {
    if (activeTab === 'tous') return true;
    return ticket.statut === activeTab;
  });

  // Role permissions
  const canRegisterArrival = ['accueil', 'directeur', 'infirmier'].includes(currentRole);
  const canDoTriage = ['infirmier', 'directeur'].includes(currentRole);
  const canConsult = ['medecin', 'directeur'].includes(currentRole);

  // Filter existing patients for selection
  const filteredExistingPatients = patients.filter(p => {
    const q = existingPatientSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      p.nom.toLowerCase().includes(q) ||
      p.prenom.toLowerCase().includes(q) ||
      p.matricule.toLowerCase().includes(q) ||
      p.telephone.includes(q)
    );
  });

  // Calculate age if dateNaissance changes
  const handleDateNaissanceChange = (dob: string) => {
    setNewPatientForm(prev => {
      let calculatedAge = prev.age;
      if (dob && !isNaN(new Date(dob).getTime())) {
        const birthYear = parseInt(dob.split('-')[0], 10);
        calculatedAge = String(Math.max(0, new Date().getFullYear() - birthYear));
      }
      return { ...prev, dateNaissance: dob, age: calculatedAge };
    });
  };

  const handleCreateArrival = (e: React.FormEvent) => {
    e.preventDefault();

    if (arrivalMode === 'nouveau') {
      // 1. Create Patient in Database (with automatic Firestore & server sync)
      const cleanNom = newPatientForm.nom.toUpperCase().trim() || 'INCONNU';
      const cleanPrenom = newPatientForm.prenom.trim() || 'Patient';
      const ageNum = parseInt(String(newPatientForm.age), 10) || 0;
      const adresseFinale = newPatientForm.adresse.trim()
        ? newPatientForm.adresse.trim()
        : newPatientForm.quartier
        ? `Quartier ${newPatientForm.quartier}, N'Djamena`
        : "N'Djamena, Tchad";

      const created = ajouterPatient({
        nom: cleanNom,
        prenom: cleanPrenom,
        sexe: newPatientForm.sexe,
        age: ageNum,
        dateNaissance: newPatientForm.dateNaissance || '',
        telephone: newPatientForm.telephone.trim() || '+235 66 00 00 00',
        adresse: adresseFinale,
        quartier: newPatientForm.quartier,
        groupeSanguin: newPatientForm.groupeSanguin,
        contactUrgenceNom: newPatientForm.contactUrgenceNom.trim() || undefined,
        contactUrgenceTel: newPatientForm.contactUrgenceTel.trim() || undefined,
        contactUrgenceRelation: newPatientForm.contactUrgenceRelation || undefined,
        allergies: newPatientForm.allergies
          ? newPatientForm.allergies.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        maladiesChroniques: newPatientForm.maladiesChroniques
          ? newPatientForm.maladiesChroniques.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        avatar:
          newPatientForm.sexe === 'F'
            ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
            : 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
      });

      // 2. Issue Queue Ticket
      const motifFinal = newPatientForm.motif.trim() || 'Consultation d\'urgence';
      const ticket = enregistrerArriveePatient(created.id, motifFinal);

      // 3. Open Success & QR Sticker confirmation
      setLastCreatedPatient(created);
      setLastIssuedTicket(ticket);
      setShowArrivalModal(false);
      setShowSuccessModal(true);

      // Reset form
      setNewPatientForm({
        nom: '',
        prenom: '',
        sexe: 'M',
        age: '30',
        dateNaissance: '',
        telephone: '+235 ',
        quartier: 'Moursal',
        adresse: '',
        groupeSanguin: 'Inconnu',
        contactUrgenceNom: '',
        contactUrgenceTel: '',
        contactUrgenceRelation: 'Famille / Proche',
        allergies: '',
        maladiesChroniques: '',
        motif: 'Fièvre élevée avec frissons intenses',
      });
    } else {
      // Existing patient selected
      const targetId = selectedPatientId || patients[0]?.id;
      if (!targetId) return;

      const motifFinal = motifArrivee.trim() || 'Consultation générale';
      const ticket = enregistrerArriveePatient(targetId, motifFinal);
      const existingPat = patients.find(p => p.id === targetId) || null;

      setLastCreatedPatient(existingPat);
      setLastIssuedTicket(ticket);
      setShowArrivalModal(false);
      setShowSuccessModal(true);
      setMotifArrivee('Fièvre élevée avec frissons intenses');
    }
  };

  const handleSubmitTriage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!triageTicket) return;
    effectuerTriage(triageTicket.id, selectedUrgence, selectedDoctorId, vitals);
    setTriageTicket(null);
  };

  const handleStartConsultation = (ticket: QueueTicket) => {
    appelerEnConsultation(ticket.id);
    setCurrentView('consultations');
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B3C5D]">File d'Attente & Triage Médical</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold">
              Chaîne de Prise en Charge
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestion continue : Accueil (Arrivée & Pass QR) → Infirmier (Triage & Constantes) → Médecin (Consultation)
          </p>
        </div>

        {canRegisterArrival && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Primary Action: Direct New Patient Intake */}
            <button
              onClick={() => {
                setArrivalMode('nouveau');
                setShowArrivalModal(true);
              }}
              id="queue-new-patient-arrival-btn"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md transition"
            >
              <UserPlus className="w-4 h-4 text-teal-200" />
              <span>Nouveau Patient (Accueil & QR)</span>
            </button>

            {/* Secondary Action: Existing Patient */}
            <button
              onClick={() => {
                setArrivalMode('existant');
                setShowArrivalModal(true);
              }}
              id="queue-existing-arrival-btn"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B3C5D] hover:bg-[#1E88E5] text-white text-xs font-bold shadow transition"
            >
              <Clock className="w-4 h-4 text-sky-300" />
              <span>Patient Déjà Enregistré</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs / Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('tous')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'tous' ? 'bg-white text-[#0B3C5D] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tous ({queue.length})
          </button>
          <button
            onClick={() => setActiveTab('en_attente')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'en_attente' ? 'bg-white text-[#0B3C5D] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>En attente de Triage</span>
            <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[10px]">
              {queue.filter(q => q.statut === 'en_attente').length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('triage_fait')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'triage_fait' ? 'bg-white text-[#0B3C5D] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Triés (Prêts Médecin)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-teal-100 text-teal-800 text-[10px]">
              {queue.filter(q => q.statut === 'triage_fait').length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('en_consultation')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'en_consultation' ? 'bg-white text-[#0B3C5D] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>En Consultation</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
              {queue.filter(q => q.statut === 'en_consultation').length}
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-500">
          Priorité automatique : <strong className="text-rose-600 font-bold">Critique</strong> &gt; <strong className="text-amber-600 font-bold">Urgent</strong> &gt; Normal
        </div>
      </div>

      {/* Queue Tickets List */}
      <div className="space-y-3">
        {filteredQueue.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 space-y-3">
            <Clock className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-600">Aucun patient dans cette section de la file</p>
            <p className="text-xs">
              Utilisez « Nouveau Patient (Accueil & QR) » pour enregistrer un arrivant directement dans la base de données.
            </p>
            {canRegisterArrival && (
              <button
                onClick={() => {
                  setArrivalMode('nouveau');
                  setShowArrivalModal(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-xs transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>Enregistrer une nouvelle admission</span>
              </button>
            )}
          </div>
        ) : (
          filteredQueue.map(ticket => {
            const ticketPatient = patients.find(p => p.id === ticket.patientId);

            return (
              <div
                key={ticket.id}
                className={`p-4 sm:p-5 rounded-2xl bg-white border transition shadow-sm hover:shadow flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  ticket.niveauUrgence === 'critique'
                    ? 'border-rose-400 bg-rose-50/20'
                    : ticket.niveauUrgence === 'urgent'
                    ? 'border-amber-300'
                    : 'border-slate-200'
                }`}
              >
                {/* Patient Information & Motif */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <span className="font-mono text-xs font-black text-[#0B3C5D] bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                      {ticket.ticketNumero}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 font-mono">{ticket.heureArrivee}</span>
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        {ticket.patientPrenom} {ticket.patientNom}
                      </h3>
                      <span className="text-xs text-slate-500">
                        ({ticket.patientAge} ans • {ticket.patientSexe === 'M' ? 'H' : 'F'})
                      </span>

                      {/* Blood Group if available */}
                      {ticketPatient?.groupeSanguin && ticketPatient.groupeSanguin !== 'Inconnu' && (
                        <span className="px-1.5 py-0.2 rounded bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-black">
                          {ticketPatient.groupeSanguin}
                        </span>
                      )}

                      {/* Urgency Badge */}
                      {ticket.niveauUrgence && (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            ticket.niveauUrgence === 'critique'
                              ? 'bg-red-100 text-red-700'
                              : ticket.niveauUrgence === 'urgent'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {ticket.niveauUrgence}
                        </span>
                      )}

                      {/* Status indicator */}
                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {ticket.statut === 'en_attente' && '1. En attente Triage'}
                        {ticket.statut === 'triage_fait' && '2. Triage effectué'}
                        {ticket.statut === 'en_consultation' && '3. En Consultation'}
                        {ticket.statut === 'examens_requis' && '4. Examens en cours'}
                        {ticket.statut === 'termine' && '5. Terminé'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700">
                      <strong>Motif d'arrivée :</strong> {ticket.motifArrivee}
                    </p>

                    {/* Vitals summary if triage is already done */}
                    {ticket.constantesVitales && (
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-600">
                        <span className="flex items-center gap-1 font-mono">
                          <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                          {ticket.constantesVitales.temperature}°C
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Activity className="w-3.5 h-3.5 text-sky-500" />
                          TA: {ticket.constantesVitales.tension || (ticket.constantesVitales as any).tensionArterielle}
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <HeartPulse className="w-3.5 h-3.5 text-emerald-500" />
                          SpO2: {ticket.constantesVitales.saturationO2}%
                        </span>
                        {ticket.orienteVersMedecinNom && (
                          <span className="text-teal-800 font-semibold bg-teal-50 px-2 py-0.2 rounded border border-teal-200">
                            Dr. assigné : {ticket.orienteVersMedecinNom}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions per role */}
                <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                  {/* Smartphone Sticker QR code print button */}
                  {ticketPatient && (
                    <button
                      onClick={() => {
                        setPatientToPrintQR(ticketPatient);
                        setPrintModalInitialMode('sticker');
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 text-xs font-bold transition shadow-2xs"
                      title="Imprimer le QR Code autocollant pour smartphone"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-teal-600" />
                      <span>Sticker QR</span>
                    </button>
                  )}

                  {/* Infirmier Triage Button */}
                  {canDoTriage && ticket.statut === 'en_attente' && (
                    <button
                      onClick={() => {
                        setTriageTicket(ticket);
                        setVitals(prev => ({
                          ...prev,
                          notesInfirmier: `Admission ${ticket.motifArrivee}.`,
                        }));
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-xs transition"
                    >
                      <HeartPulse className="w-4 h-4" />
                      <span>Faire le Triage</span>
                    </button>
                  )}

                  {/* Doctor Consultation Call Button */}
                  {canConsult && (ticket.statut === 'triage_fait' || ticket.statut === 'en_consultation') && (
                    <button
                      onClick={() => handleStartConsultation(ticket)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs transition"
                    >
                      <Stethoscope className="w-4 h-4" />
                      <span>{ticket.statut === 'en_consultation' ? 'Ouvrir Consultation' : 'Appeler en Consultation'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* View patient dossier shortcut */}
                  <button
                    onClick={() => setCurrentView('patients')}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium"
                    title="Voir le dossier médical"
                  >
                    <User className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Arrival Intake Modal (Accueil) */}
      {showArrivalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-6 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-5 sm:p-7 shadow-2xl border border-slate-200 space-y-4 my-auto animate-in fade-in max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-[#0B3C5D]">
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-700 flex items-center justify-center font-bold">
                  {arrivalMode === 'nouveau' ? <UserPlus className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {arrivalMode === 'nouveau'
                      ? 'Admission & Enregistrement d\'un Nouveau Patient'
                      : 'Enregistrer l\'Arrivée d\'un Patient Existant'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {arrivalMode === 'nouveau'
                      ? 'Enregistre directement le patient dans la base de données et prépare son sticker QR'
                      : 'Sélectionnez un patient déjà dans la base pour lui émettre un ticket de file'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowArrivalModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                ✕
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setArrivalMode('nouveau')}
                className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
                  arrivalMode === 'nouveau'
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-4 h-4 text-teal-600" />
                <span>✨ Nouveau Patient (Direct Base)</span>
              </button>
              <button
                type="button"
                onClick={() => setArrivalMode('existant')}
                className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
                  arrivalMode === 'existant'
                    ? 'bg-white text-[#0B3C5D] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Search className="w-4 h-4 text-[#0B3C5D]" />
                <span>🔍 Patient Déjà Enregistré</span>
              </button>
            </div>

            <form onSubmit={handleCreateArrival} className="space-y-4">
              {arrivalMode === 'nouveau' ? (
                /* NEW PATIENT FORM FIELDS */
                <div className="space-y-4">
                  {/* Identity Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nom de famille <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: DEBBI, BRAHIM, ALIO..."
                        value={newPatientForm.nom}
                        onChange={e => setNewPatientForm({ ...newPatientForm, nom: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs uppercase focus:ring-2 focus:ring-teal-500 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Prénom(s) <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Mahamat, Fatimé, Jean..."
                        value={newPatientForm.prenom}
                        onChange={e => setNewPatientForm({ ...newPatientForm, prenom: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 font-medium"
                      />
                    </div>
                  </div>

                  {/* Sexe, Âge & Date de Naissance */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Sexe</label>
                      <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-300">
                        <button
                          type="button"
                          onClick={() => setNewPatientForm({ ...newPatientForm, sexe: 'M' })}
                          className={`py-1.5 text-xs font-bold rounded-lg transition ${
                            newPatientForm.sexe === 'M'
                              ? 'bg-[#0B3C5D] text-white shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Masculin (H)
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewPatientForm({ ...newPatientForm, sexe: 'F' })}
                          className={`py-1.5 text-xs font-bold rounded-lg transition ${
                            newPatientForm.sexe === 'F'
                              ? 'bg-rose-600 text-white shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Féminin (F)
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Âge approximatif (ans)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="125"
                        placeholder="Ex: 30"
                        value={newPatientForm.age}
                        onChange={e => setNewPatientForm({ ...newPatientForm, age: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono font-bold focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Date de Naissance (si connue)
                      </label>
                      <input
                        type="date"
                        value={newPatientForm.dateNaissance}
                        onChange={e => handleDateNaissanceChange(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  {/* Téléphone & Groupe Sanguin */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Téléphone du patient <span className="text-rose-600">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="tel"
                          required
                          placeholder="+235 66 12 34 56"
                          value={newPatientForm.telephone}
                          onChange={e => setNewPatientForm({ ...newPatientForm, telephone: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs font-mono focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Groupe Sanguin (pour badge & sticker)
                      </label>
                      <div className="relative">
                        <Droplet className="w-3.5 h-3.5 text-rose-500 absolute left-3 top-3" />
                        <select
                          value={newPatientForm.groupeSanguin}
                          onChange={e => setNewPatientForm({ ...newPatientForm, groupeSanguin: e.target.value as any })}
                          className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs font-bold focus:ring-2 focus:ring-teal-500 bg-white"
                        >
                          <option value="Inconnu">Inconnu / Non déterminé</option>
                          <option value="O+">O+ (Le plus courant au Tchad)</option>
                          <option value="A+">A+</option>
                          <option value="B+">B+</option>
                          <option value="AB+">AB+</option>
                          <option value="O-">O- (Donneur universel)</option>
                          <option value="A-">A-</option>
                          <option value="B-">B-</option>
                          <option value="AB-">AB-</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Quartier & Adresse à N'Djamena */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Quartier de résidence à N'Djamena :
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {NDJAMENA_QUARTIERS.slice(0, 8).map(q => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setNewPatientForm({ ...newPatientForm, quartier: q })}
                          className={`px-2.5 py-1 rounded-lg text-[10.5px] font-semibold border transition ${
                            newPatientForm.quartier === q
                              ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="Préciser l'adresse ou rue (ex: Moursal, Rue 40, vers le rond-point...)"
                        value={newPatientForm.adresse}
                        onChange={e => setNewPatientForm({ ...newPatientForm, adresse: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  {/* Contact d'urgence / Personne à prévenir */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-emerald-600" />
                      Contact d'Urgence / Proche (imprimé sur le sticker smartphone)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Nom du proche (ex: Brahim Mahamat)"
                        value={newPatientForm.contactUrgenceNom}
                        onChange={e => setNewPatientForm({ ...newPatientForm, contactUrgenceNom: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs bg-white focus:ring-2 focus:ring-teal-500"
                      />
                      <input
                        type="tel"
                        placeholder="Tél proche (ex: +235 66 00 00 00)"
                        value={newPatientForm.contactUrgenceTel}
                        onChange={e => setNewPatientForm({ ...newPatientForm, contactUrgenceTel: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-mono bg-white focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  {/* Motif d'arrivée / Plaintes exprimées */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-800">
                        Motif de venue / Plaintes exprimées <span className="text-rose-600">*</span>
                      </label>
                      <span className="text-[10px] text-slate-400">Cliquez sur un motif fréquent :</span>
                    </div>

                    {/* Quick chips */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {QUICK_MOTIFS.slice(0, 6).map(motif => (
                        <button
                          key={motif}
                          type="button"
                          onClick={() => setNewPatientForm({ ...newPatientForm, motif })}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-medium border transition ${
                            newPatientForm.motif === motif
                              ? 'bg-teal-700 text-white border-teal-700'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {motif}
                        </button>
                      ))}
                    </div>

                    <textarea
                      value={newPatientForm.motif}
                      onChange={e => setNewPatientForm({ ...newPatientForm, motif: e.target.value })}
                      rows={2}
                      required
                      placeholder="Décrivez les symptômes rapportés par le patient à l'accueil..."
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Optional Accordion: Allergies & Maladies Chroniques */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setShowMedicalAccordion(!showMedicalAccordion)}
                      className="w-full px-4 py-2.5 bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                    >
                      <span className="flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-rose-500" />
                        Allergies & Antécédents Médicaux (Optionnel)
                      </span>
                      {showMedicalAccordion ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {showMedicalAccordion && (
                      <div className="p-4 space-y-3 bg-white border-t border-slate-200 text-xs">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Allergies connues (séparées par virgules) :
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Pénicilline, Aspirine, AINS, Arachide..."
                            value={newPatientForm.allergies}
                            onChange={e => setNewPatientForm({ ...newPatientForm, allergies: e.target.value })}
                            className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Affections chroniques / Pathologies :
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Drépanocytose SS, Diabète Type 2, HTA, Asthme..."
                            value={newPatientForm.maladiesChroniques}
                            onChange={e => setNewPatientForm({ ...newPatientForm, maladiesChroniques: e.target.value })}
                            className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* EXISTING PATIENT SELECTOR */
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Rechercher le patient (Nom, Matricule, Téléphone) :
                    </label>
                    <div className="relative mb-2">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="Rechercher par nom, matricule NDJ..., téléphone..."
                        value={existingPatientSearch}
                        onChange={e => setExistingPatientSearch(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-200 rounded-xl p-1 bg-slate-50">
                      {filteredExistingPatients.length === 0 ? (
                        <p className="p-3 text-center text-xs text-slate-500">Aucun patient trouvé.</p>
                      ) : (
                        filteredExistingPatients.map(p => {
                          const isSelected = selectedPatientId === p.id;
                          return (
                            <div
                              key={p.id}
                              onClick={() => setSelectedPatientId(p.id)}
                              className={`p-2.5 rounded-xl border cursor-pointer transition flex items-center justify-between gap-2 ${
                                isSelected
                                  ? 'bg-teal-50 border-teal-500 text-teal-950 font-bold shadow-2xs'
                                  : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 flex-shrink-0">
                                  {p.nom.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs truncate">
                                    {p.prenom} {p.nom}
                                  </p>
                                  <p className="text-[10px] text-slate-500 font-mono">
                                    {p.matricule} • {p.age} ans • Groupe {p.groupeSanguin}
                                  </p>
                                </div>
                              </div>
                              {isSelected && <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Motif de venue / Plaintes exprimées :
                    </label>
                    <textarea
                      value={motifArrivee}
                      onChange={e => setMotifArrivee(e.target.value)}
                      rows={3}
                      required
                      placeholder="Ex: Douleurs abdominales aiguës, vomissements, fièvre depuis hier..."
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Submit / Cancel Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowArrivalModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md transition flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {arrivalMode === 'nouveau'
                      ? 'Enregistrer dans la Base & Émettre Ticket'
                      : 'Créer le Ticket de File'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMISSION SUCCESS & SMARTPHONE STICKER PROMPT MODAL */}
      {showSuccessModal && lastCreatedPatient && lastIssuedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in text-center">
            <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-700 mx-auto flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">
                Patient Admis & Enregistré avec Succès !
              </h3>
              <p className="text-xs text-slate-500">
                Les données sont enregistrées dans la base de données et le ticket de file d'attente est actif.
              </p>
            </div>

            {/* Ticket & Patient Recap Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Ticket N°</span>
                  <span className="text-lg font-black text-[#0B3C5D] font-mono">
                    {lastIssuedTicket.ticketNumero}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Statut</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                    1. En attente de triage
                  </span>
                </div>
              </div>

              <div className="text-xs space-y-1">
                <p className="font-bold text-slate-900">
                  {lastCreatedPatient.prenom} {lastCreatedPatient.nom} ({lastCreatedPatient.age} ans)
                </p>
                <p className="text-slate-600 font-mono text-[11px]">
                  Matricule : <strong>{lastCreatedPatient.matricule}</strong> • Groupe :{' '}
                  <span className="text-rose-600 font-bold">{lastCreatedPatient.groupeSanguin}</span>
                </p>
                <p className="text-slate-500 text-[11px]">
                  Motif : {lastIssuedTicket.motifArrivee}
                </p>
              </div>
            </div>

            {/* Smartphone Sticker Print Highlight Box */}
            <div className="p-4 rounded-2xl bg-teal-50 border-2 border-teal-300 text-left space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-teal-950 uppercase tracking-tight">
                    Sticker QR Code pour Smartphone
                  </h4>
                  <p className="text-[11px] text-teal-800 leading-tight">
                    Imprimez immédiatement l'autocollant compact à coller au dos du téléphone portable du patient pour ses urgences vitales.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPatientToPrintQR(lastCreatedPatient);
                    setPrintModalInitialMode('sticker');
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow transition flex items-center justify-center gap-2"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Imprimer Sticker Smartphone</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPatientToPrintQR(lastCreatedPatient);
                    setPrintModalInitialMode('carte');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  <span>Carte Poche</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowSuccessModal(false);
                setLastCreatedPatient(null);
                setLastIssuedTicket(null);
              }}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
            >
              Fermer & Voir la File d'Attente
            </button>
          </div>
        </div>
      )}

      {/* Triage & Vitals Modal (Infirmier) */}
      {triageTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 my-8 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-[#0B3C5D]">
                <HeartPulse className="w-5 h-5 text-teal-600" />
                <div>
                  <h3 className="text-base font-bold">
                    Triage Médical & Constantes Vitales
                  </h3>
                  <p className="text-xs text-slate-500">
                    Patient : {triageTicket.patientPrenom} {triageTicket.patientNom} ({triageTicket.patientAge} ans)
                  </p>
                </div>
              </div>
              <button onClick={() => setTriageTicket(null)} className="text-slate-400 hover:text-slate-700 p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitTriage} className="space-y-4">
              {/* Urgency Level Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">Niveau d'Urgence Déterminé :</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedUrgence('normal')}
                    className={`p-3 rounded-xl border text-center transition ${
                      selectedUrgence === 'normal'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full bg-emerald-500 mx-auto mb-1" />
                    <p className="text-xs">Normal</p>
                    <p className="text-[10px] text-slate-500">Consultation standard</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedUrgence('urgent')}
                    className={`p-3 rounded-xl border text-center transition ${
                      selectedUrgence === 'urgent'
                        ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold ring-2 ring-amber-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full bg-amber-500 mx-auto mb-1" />
                    <p className="text-xs">Urgent</p>
                    <p className="text-[10px] text-slate-500">Délai &lt; 20 min</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedUrgence('critique')}
                    className={`p-3 rounded-xl border text-center transition ${
                      selectedUrgence === 'critique'
                        ? 'bg-rose-50 border-rose-500 text-rose-900 font-bold ring-2 ring-rose-500/20 animate-pulse'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full bg-rose-600 mx-auto mb-1" />
                    <p className="text-xs">Critique</p>
                    <p className="text-[10px] text-slate-500">Prise en charge vitale immédiate</p>
                  </button>
                </div>
              </div>

              {/* Vitals Input Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Température (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={vitals.temperature}
                    onChange={e => setVitals({ ...vitals, temperature: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tension Artérielle</label>
                  <input
                    type="text"
                    placeholder="120/80"
                    value={vitals.tensionArterielle}
                    onChange={e => setVitals({ ...vitals, tensionArterielle: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Fréquence Cardiaque (bpm)</label>
                  <input
                    type="number"
                    value={vitals.frequenceCardiaque}
                    onChange={e => setVitals({ ...vitals, frequenceCardiaque: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Saturation O2 (%)</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={vitals.saturationO2}
                    onChange={e => setVitals({ ...vitals, saturationO2: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Glycémie (mg/dL)</label>
                  <input
                    type="number"
                    value={vitals.glycemie || 100}
                    onChange={e => setVitals({ ...vitals, glycemie: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Poids (kg)</label>
                  <input
                    type="number"
                    value={vitals.poids || 65}
                    onChange={e => setVitals({ ...vitals, poids: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Target Doctor Assignment */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Orienter vers le Médecin Praticien :
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={e => setSelectedDoctorId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 font-semibold"
                >
                  {users
                    .filter(u => u.role === 'medecin' || u.role === 'directeur')
                    .map(doc => (
                      <option key={doc.id} value={doc.id}>
                        {doc.prenom} {doc.nom} ({doc.specialite || 'Médecine Générale & Urgences'})
                      </option>
                    ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Le médecin sélectionné recevra immédiatement une notification avec les constantes vitales.
                </p>
              </div>

              {/* Observations */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observations de l'Infirmier de Triage :
                </label>
                <textarea
                  value={vitals.notesInfirmier || ''}
                  onChange={e => setVitals({ ...vitals, notesInfirmier: e.target.value })}
                  rows={2}
                  className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTriageTicket(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Valider le Triage & Notifier le Médecin</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Patient QR Card & Smartphone Sticker Modal */}
      {patientToPrintQR && (
        <PatientQRCardPrintModal
          isOpen={!!patientToPrintQR}
          patient={patientToPrintQR}
          initialMode={printModalInitialMode}
          onClose={() => setPatientToPrintQR(null)}
        />
      )}
    </div>
  );
};

