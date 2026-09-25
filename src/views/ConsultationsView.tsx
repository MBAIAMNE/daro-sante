import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Plus,
  FileText,
  Microscope,
  CheckCircle2,
  AlertTriangle,
  Heart,
  Thermometer,
  Activity,
  Calendar,
  User,
  Pill,
  Send,
  Lock,
  Printer,
  MapPin,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  PenTool,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { PrescriptionItem, ExamType, Ordonnance } from '../types';
import { OrdonnancePrintModal } from '../components/OrdonnancePrintModal';
import { ElectronicSignatureModal } from '../components/ElectronicSignatureModal';
import { ElectronicSignaturePad } from '../components/ElectronicSignaturePad';
import { EXAM_NATURES } from '../data/examCatalog';
import {
  VOIES_ADMINISTRATION,
  ACTIONS_APRES_DIAGNOSTIC,
  QUARTIERS_NDJAMENA,
  CLINICAL_PRESETS_NDJAMENA,
  ClinicalPresetNdjamena,
} from '../data/prescriptionConstants';

export const ConsultationsView: React.FC = () => {
  const {
    consultations,
    patients,
    queue,
    medications,
    currentUser,
    currentRole,
    allUsers,
    completerConsultation,
    prescrireExamen,
    ordonnances,
    signerOrdonnance,
  } = useClinic();

  // Strict role security: Gestionnaire & Infirmier are strictly barred
  const isAuthorized = ['medecin', 'directeur'].includes(currentRole);

  const [showNewConsultModal, setShowNewConsultModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [ordonnanceToSign, setOrdonnanceToSign] = useState<Ordonnance | null>(null);
  const [customSignatureDraft, setCustomSignatureDraft] = useState<string | null>(currentUser.signatureElectronique || null);
  const [showTactilePadInNewConsult, setShowTactilePadInNewConsult] = useState(false);

  // Auto-generate prescribing doctor name
  const autoDoctorName = currentUser.nom.startsWith('Dr.')
    ? currentUser.nom
    : `Dr. ${currentUser.prenom} ${currentUser.nom}`;
  const [medecinPrescripteur, setMedecinPrescripteur] = useState(autoDoctorName);

  // Patient Demographics for consultation and prescription
  const [patientSexe, setPatientSexe] = useState<'Masculin' | 'Féminin'>('Masculin');
  const [patientAge, setPatientAge] = useState<number>(0);
  const [patientQuartier, setPatientQuartier] = useState<string>('');
  const [dateConsultation, setDateConsultation] = useState<string>(
    new Date().toLocaleDateString('fr-FR')
  );

  // Clinical context
  const [motif, setMotif] = useState('Fièvre élevée avec céphalées intenses et courbatures');
  const [diagnostic, setDiagnostic] = useState('Paludisme à Plasmodium falciparum non compliqué');
  const [actionApresDiagnostic, setActionApresDiagnostic] = useState<string>(
    'Traitement médical ambulatoire à domicile avec surveillance'
  );
  const [notesCliniques, setNotesCliniques] = useState(
    'Patient fébrile à 39.2°C, conjonctives pâles, langue saburrale, absence de signes méningés. Pouls 88 bpm, TA 120/75 mmHg.'
  );

  // Dynamic Prescription items with Voies de prise
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([
    {
      medicament: 'Artéméther + Luméfantrine (Coartem 80/480mg)',
      forme: 'Comprimé',
      voie: 'Voie Orale (PO - Par la bouche)',
      posologie: '1 comprimé matin et soir au milieu d\'un repas',
      duree: '3 jours',
      quantite: 6,
    },
    {
      medicament: 'Paracétamol 1g',
      forme: 'Comprimé effervescent',
      voie: 'Voie Orale (PO - Par la bouche)',
      posologie: '1 comprimé toutes les 6 heures si fièvre > 38.5°C',
      duree: '5 jours',
      quantite: 20,
    },
  ]);

  // Order exam checkbox & config across all exam natures
  const [orderExam, setOrderExam] = useState(true);
  const [examType, setExamType] = useState<ExamType>('laboratoire');
  const [examNom, setExamNom] = useState('Goutte Épaisse & Frottis Sanguin (Paludisme)');
  const [examIndications, setExamIndications] = useState('Suspicion accès palustre aigu & contrôle NFS');

  // Print modal state
  const [selectedOrdonnanceToPrint, setSelectedOrdonnanceToPrint] = useState<Ordonnance | null>(null);

  // Whenever selected patient changes, update demographics
  useEffect(() => {
    const pat = patients.find(p => p.id === selectedPatientId);
    if (pat) {
      setPatientSexe(pat.sexe === 'F' ? 'Féminin' : 'Masculin');
      setPatientAge(pat.age || 0);
      setPatientQuartier(pat.quartier || pat.adresse || '');
    }
  }, [selectedPatientId, patients]);

  if (!isAuthorized) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Accès Médical Restreint</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Conformément au secret médical et à la déontologie clinique, le module des Consultations et des diagnostics est réservé aux
          <strong> Médecins Praticiens</strong> et à la <strong>Direction Médicale</strong>.
        </p>
      </div>
    );
  }

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];
  const activeQueueTicket = queue.find(q => q.patientId === selectedPatientId && q.statut !== 'termine');

  const handleAddMedicationItem = () => {
    setPrescriptionItems([
      ...prescriptionItems,
      {
        medicament: medications[0]?.nom || 'Médicament',
        forme: 'Comprimé',
        voie: 'Voie Orale (PO - Par la bouche)',
        posologie: '1 prise par jour au repas',
        duree: '5 jours',
        quantite: 10,
      },
    ]);
  };

  const handleRemoveMedicationItem = (index: number) => {
    setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index));
  };

  const applyClinicalPreset = (preset: ClinicalPresetNdjamena) => {
    setMotif(preset.motif);
    setDiagnostic(preset.diagnostic);
    setActionApresDiagnostic(preset.action);
    setNotesCliniques(preset.notes);
    setPrescriptionItems(preset.items);
    setOrderExam(preset.orderExam);
    setExamType(preset.examType as ExamType);
    setExamNom(preset.examNom);
    setExamIndications(preset.examIndications);
  };

  const handleSubmitConsultation = (e: React.FormEvent) => {
    e.preventDefault();

    let createdExamId: string | undefined = undefined;
    if (orderExam && examNom.trim()) {
      const newExam = prescrireExamen({
        patientId: selectedPatient.id,
        patientNom: `${selectedPatient.prenom} ${selectedPatient.nom}`,
        type: examType,
        nomExamen: examNom,
        indications: examIndications,
      });
      createdExamId = newExam.id;
    }

    completerConsultation({
      ticketId: activeQueueTicket?.id,
      patientId: selectedPatient.id,
      patientNom: `${selectedPatient.prenom} ${selectedPatient.nom}`,
      patientSexe,
      patientAge,
      patientQuartier,
      dateConsultation,
      medecinNom: medecinPrescripteur,
      motif,
      diagnostic,
      actionApresDiagnostic,
      notesMedicales: notesCliniques,
      observations: notesCliniques,
      prescriptionItems,
      examenPrescritId: createdExamId,
      signatureElectronique: customSignatureDraft || currentUser.signatureElectronique,
    });

    setShowNewConsultModal(false);
  };

  // Helper to find or resolve an ordonnance object for a consultation
  const getMatchingOrdonnance = (cons: (typeof consultations)[0]): Ordonnance | undefined => {
    const targetPatient = patients.find(p => p.id === cons.patientId);
    let targetOrd = ordonnances.find(
      o => o.id === cons.ordonnanceId || (o.patientId === cons.patientId && Math.abs(new Date(o.date).getTime() - new Date(cons.date).getTime()) < 86400000)
    );

    if (!targetOrd && cons.prescriptionItems && cons.prescriptionItems.length > 0) {
      targetOrd = {
        id: `ord-gen-${cons.id}`,
        numero: `ORD-2025-0${Math.floor(Math.random() * 800 + 100)}`,
        date: cons.date.split(' ')[0] || new Date().toISOString().split('T')[0],
        dateConsultation: cons.date.split(' ')[0] || dateConsultation,
        patientId: cons.patientId,
        patientNom: cons.patientNom,
        patientAge: cons.patientAge || (targetPatient?.age ? targetPatient.age : undefined),
        patientSexe: cons.patientSexe || (targetPatient?.sexe === 'F' ? 'Féminin' : 'Masculin'),
        patientQuartier: cons.patientQuartier || targetPatient?.quartier || targetPatient?.adresse || undefined,
        motifConsultation: cons.motif,
        diagnostic: cons.diagnostic,
        actionApresDiagnostic: cons.actionApresDiagnostic || 'Traitement médical ambulatoire avec surveillance',
        medecinId: cons.medecinId,
        medecinNom: cons.medecinNom,
        medecinSpecialite: 'Médecine Générale & Urgences',
        items: cons.prescriptionItems,
        statutDispensation: 'non_delivree',
        signatureElectronique: cons.signatureElectronique,
      };
    }
    return targetOrd;
  };

  // Find or generate an ordonnance object to print for a consultation
  const handleOpenPrintModal = (consultationId: string) => {
    const cons = consultations.find(c => c.id === consultationId);
    if (!cons) return;
    const targetOrd = getMatchingOrdonnance(cons);
    if (targetOrd) {
      setSelectedOrdonnanceToPrint(targetOrd);
    }
  };

  // Selected exam nature detail
  const currentExamNature = EXAM_NATURES.find(n => n.id === examType) || EXAM_NATURES[0];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B3C5D]">Cabinet Médical & Consultations</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
              {consultations.length} consultations
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Prescription certifiée (médecin automatique, voies de prise, actions post-diagnostic) et orientation vers toutes les natures d'examens
          </p>
        </div>

        <button
          onClick={() => setShowNewConsultModal(true)}
          id="consultation-new-btn"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow transition"
        >
          <Plus className="w-4 h-4 text-emerald-200" />
          <span>Nouvelle Consultation</span>
        </button>
      </div>

      {/* Consultations Feed */}
      <div className="space-y-4">
        {consultations.map(consultation => {
          const patient = patients.find(p => p.id === consultation.patientId);

          return (
            <div
              key={consultation.id}
              className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 hover:border-teal-300 shadow-xs space-y-4 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold shrink-0">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        {consultation.patientNom}
                      </h3>
                      {consultation.patientSexe && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 font-medium text-slate-700">
                          {consultation.patientSexe}, {consultation.patientAge || patient?.age || 34} ans
                        </span>
                      )}
                      {consultation.patientQuartier && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-50 font-medium text-teal-800 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" />
                          {consultation.patientQuartier}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      <strong className="text-slate-700">Motif :</strong> {consultation.motif}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="flex items-center gap-1 font-medium text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {consultation.date}
                  </span>
                  <span className="font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-teal-600" />
                    {consultation.medecinNom}
                  </span>
                  {/* Print & Touchscreen Sign Prescription Buttons */}
                  {(consultation.ordonnanceId || (consultation.prescriptionItems && consultation.prescriptionItems.length > 0)) && (() => {
                    const ord = getMatchingOrdonnance(consultation);
                    return (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenPrintModal(consultation.id)}
                          className="px-3 py-1.5 rounded-xl bg-[#1E88E5] hover:bg-[#1565C0] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Imprimer Ordonnance</span>
                        </button>
                        {ord && (
                          <button
                            type="button"
                            onClick={() => setOrdonnanceToSign(ord)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                              ord.signatureElectronique
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-2xs'
                            }`}
                            title="Signer sur écran tactile ou tablette"
                          >
                            <PenTool className="w-3.5 h-3.5" />
                            <span>{ord.signatureElectronique ? 'Signé tactile ✓' : '✍️ Signer (Tactile)'}</span>
                          </button>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Diagnostic Box & Action Après Diagnostic */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-800 uppercase tracking-wider text-[10px]">
                      Diagnostic Retenu :
                    </span>
                    <span className="font-bold text-slate-900">{consultation.diagnostic}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    <strong>Observations :</strong> {consultation.observations}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1">
                  <span className="font-bold text-emerald-900 uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <Activity className="w-3 h-3 text-emerald-700" />
                    Action Après Diagnostic (Conduite à tenir) :
                  </span>
                  <p className="text-emerald-950 font-medium text-[11.5px]">
                    {consultation.actionApresDiagnostic || 'Traitement médical ambulatoire à domicile avec surveillance'}
                  </p>
                </div>
              </div>

              {/* Prescriptions & Examens linked */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {consultation.prescriptionItems && consultation.prescriptionItems.length > 0 && (
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-sky-600" />
                        Traitements Prescrits ({consultation.prescriptionItems.length})
                      </span>
                      <span className="text-[10px] text-teal-700 font-bold">Voies de prise intégrées</span>
                    </div>
                    <ul className="space-y-1.5">
                      {consultation.prescriptionItems.map((item, idx) => (
                        <li key={idx} className="text-slate-800 text-[11px] flex flex-col">
                          <div className="flex items-baseline justify-between">
                            <span>• <strong>{item.medicament}</strong></span>
                            {item.voie && (
                              <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-teal-50 text-teal-900 font-medium border border-teal-100">
                                {item.voie}
                              </span>
                            )}
                          </div>
                          <span className="text-slate-600 text-[10.5px] pl-3">
                            Posologie : {item.posologie} ({item.duree})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {consultation.examenPrescritId && (
                  <div className="p-3.5 rounded-xl border border-cyan-200 bg-cyan-50/60 space-y-1.5 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-cyan-900 uppercase flex items-center gap-1">
                        <Microscope className="w-3.5 h-3.5 text-cyan-600" />
                        Examen Complémentaire Associé
                      </span>
                      <p className="text-cyan-950 text-[11.5px] mt-1 font-medium">
                        Transmission automatique vers le service technique compétent.
                      </p>
                    </div>
                    <p className="text-[10.5px] text-cyan-800">
                      ID Examen : <strong className="font-mono">{consultation.examenPrescritId}</strong>
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Consultation Modal */}
      {showNewConsultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-3xl rounded-3xl bg-white p-5 sm:p-7 shadow-2xl border border-slate-200 space-y-5 my-6 animate-in fade-in max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-[#0B3C5D]">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black">Nouvelle Consultation Médicale & Ordonnance</h3>
                  <p className="text-xs text-slate-500">
                    Génération automatique du médecin prescripteur, voies de prise, démographie et bilan d'examens
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewConsultModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Quick Clinical Presets (N'Djamena Standards) */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/60 to-teal-50/70 border border-blue-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Protocoles Rapides N'Djamena (Pré-remplissage en 1 clic) :
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Gain de temps aux urgences</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {CLINICAL_PRESETS_NDJAMENA.map(preset => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyClinicalPreset(preset)}
                    className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-[11px] font-bold text-slate-800 shadow-2xs transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    <span>{preset.label}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 font-semibold">
                      {preset.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmitConsultation} className="space-y-4">
              {/* Prescribing Doctor & Consultation Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-teal-50/50 border border-teal-200">
                <div>
                  <label className="block text-[11px] font-bold text-teal-950 mb-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                    Médecin Prescripteur (Généré Automatiquement) :
                  </label>
                  <input
                    type="text"
                    value={medecinPrescripteur}
                    onChange={e => setMedecinPrescripteur(e.target.value)}
                    required
                    className="w-full rounded-xl border border-teal-300 bg-white px-3 py-1.5 text-xs font-bold text-[#0B3C5D]"
                  />
                  <span className="text-[10px] text-teal-700 block mt-0.5">
                    Certifié selon votre profil soignant ({currentUser.specialite || 'Médecin Praticien'})
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-800 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#1E88E5]" />
                    Date de Consultation :
                  </label>
                  <input
                    type="text"
                    value={dateConsultation}
                    onChange={e => setDateConsultation(e.target.value)}
                    required
                    placeholder="JJ/MM/AAAA"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Patient Selection & Demographics (Sexe, Âge, Quartier) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Sélectionner le / la Patient(e) :
                  </label>
                  <select
                    value={selectedPatientId}
                    onChange={e => setSelectedPatientId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold"
                  >
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.prenom} {p.nom} • {p.age ? `${p.age} ans` : 'Âge N/R'} • {p.sexe === 'F' ? 'Féminin' : 'Masculin'}{p.quartier ? ` • Quartier ${p.quartier}` : ''} {p.groupeSanguin && p.groupeSanguin !== 'Inconnu' ? `(Groupe ${p.groupeSanguin})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sexe, Âge and Quartier fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Sexe :</label>
                    <select
                      value={patientSexe}
                      onChange={e => setPatientSexe(e.target.value as 'Masculin' | 'Féminin')}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs"
                    >
                      <option value="Masculin">Masculin (M)</option>
                      <option value="Féminin">Féminin (F)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Âge (ans) :</label>
                    <input
                      type="number"
                      min={0}
                      max={120}
                      value={patientAge}
                      onChange={e => setPatientAge(parseInt(e.target.value, 10) || 0)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#1E88E5]" />
                      Quartier (N'Djamena) :
                    </label>
                    <input
                      type="text"
                      list="quartiers-list"
                      value={patientQuartier}
                      onChange={e => setPatientQuartier(e.target.value)}
                      placeholder="Ex: Sabangali, Chagoua..."
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs"
                    />
                    <datalist id="quartiers-list">
                      {QUARTIERS_NDJAMENA.map((q, i) => (
                        <option key={i} value={q} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Patient alerts */}
                <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-900">GS : {selectedPatient.groupeSanguin}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-rose-700 font-semibold">
                      Allergie : {selectedPatient.allergies?.join(', ') || 'Aucune'}
                    </span>
                  </div>
                  <span className="text-slate-600">
                    Antécédents : {selectedPatient.maladiesChroniques?.join(', ') || 'R.A.S'}
                  </span>
                </div>
              </div>

              {/* Motif de Consultation & Diagnostic */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Motif de consultation :
                  </label>
                  <input
                    type="text"
                    value={motif}
                    onChange={e => setMotif(e.target.value)}
                    required
                    placeholder="Ex: Fièvre continue, céphalées, toux..."
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Diagnostic Médical Posé :
                  </label>
                  <input
                    type="text"
                    value={diagnostic}
                    onChange={e => setDiagnostic(e.target.value)}
                    required
                    placeholder="Ex: Paludisme simple, Crise vaso-occlusive..."
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-[#0B3C5D]"
                  />
                </div>
              </div>

              {/* Action Après Diagnostic (Conduite à tenir) */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                <label className="block text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  Action Après Diagnostic (Conduite à Tenir) :
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={actionApresDiagnostic}
                      onChange={e => setActionApresDiagnostic(e.target.value)}
                      required
                      placeholder="Ex: Traitement ambulatoire, mise en observation, repos..."
                      className="w-full rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs font-medium text-emerald-950"
                    />
                  </div>
                  <div>
                    <select
                      onChange={e => {
                        if (e.target.value) setActionApresDiagnostic(e.target.value);
                      }}
                      className="w-full rounded-xl border border-emerald-300 bg-white px-2.5 py-2 text-xs text-slate-700"
                    >
                      <option value="">Sélection rapide...</option>
                      {ACTIONS_APRES_DIAGNOSTIC.map((act, i) => (
                        <option key={i} value={act}>
                          {act}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Observations cliniques */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Examen Physique & Observations Cliniques :
                </label>
                <textarea
                  value={notesCliniques}
                  onChange={e => setNotesCliniques(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              {/* Prescription Builder with Administration Routes (Voies de prise) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#0B3C5D] flex items-center gap-1.5">
                      <Pill className="w-4 h-4 text-sky-600" />
                      Ordonnance Médicale Sécurisée
                    </span>
                    <p className="text-[10.5px] text-slate-500">
                      Inclut la voie d'administration (PO, IV, IM, etc.) obligatoire pour l'officine
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddMedicationItem}
                    className="text-xs text-teal-700 hover:underline font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Ajouter une ligne
                  </button>
                </div>

                <div className="space-y-2.5">
                  {prescriptionItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white border border-slate-200 space-y-2 shadow-2xs"
                    >
                      <div className="flex flex-col sm:flex-row items-center gap-2">
                        <input
                          type="text"
                          value={item.medicament}
                          onChange={e => {
                            const copy = [...prescriptionItems];
                            copy[idx].medicament = e.target.value;
                            setPrescriptionItems(copy);
                          }}
                          placeholder="Nom du Médicament & Dosage"
                          className="flex-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-bold"
                        />
                        <input
                          type="text"
                          value={item.forme || ''}
                          onChange={e => {
                            const copy = [...prescriptionItems];
                            copy[idx].forme = e.target.value;
                            setPrescriptionItems(copy);
                          }}
                          placeholder="Forme (Comprimé, Sirop...)"
                          className="w-full sm:w-36 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicationItem(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1 self-end sm:self-center"
                          title="Supprimer la ligne"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                            Voie de prise / d'administration :
                          </label>
                          <select
                            value={item.voie || 'Voie Orale (PO - Par la bouche)'}
                            onChange={e => {
                              const copy = [...prescriptionItems];
                              copy[idx].voie = e.target.value;
                              setPrescriptionItems(copy);
                            }}
                            className="w-full rounded-lg border border-teal-300 bg-teal-50/40 px-2.5 py-1.5 text-xs font-semibold text-teal-950"
                          >
                            {VOIES_ADMINISTRATION.map(v => (
                              <option key={v.id} value={v.label}>
                                {v.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                            Posologie :
                          </label>
                          <input
                            type="text"
                            value={item.posologie}
                            onChange={e => {
                              const copy = [...prescriptionItems];
                              copy[idx].posologie = e.target.value;
                              setPrescriptionItems(copy);
                            }}
                            placeholder="Ex: 1 cp matin et soir"
                            className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                            Durée :
                          </label>
                          <input
                            type="text"
                            value={item.duree}
                            onChange={e => {
                              const copy = [...prescriptionItems];
                              copy[idx].duree = e.target.value;
                              setPrescriptionItems(copy);
                            }}
                            placeholder="Ex: 5 jours"
                            className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exam Order Section with All Exam Natures */}
              <div className="p-4 rounded-2xl bg-cyan-50/50 border border-cyan-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-cyan-950">
                    <input
                      type="checkbox"
                      checked={orderExam}
                      onChange={e => setOrderExam(e.target.checked)}
                      className="w-4 h-4 text-teal-600 rounded"
                    />
                    <span>Prescrire un Examen Complémentaire Paraclinique</span>
                  </label>
                  <span className="text-[10px] text-cyan-800 font-semibold">
                    Toutes les natures d'examens disponibles
                  </span>
                </div>

                {orderExam && (
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Nature de l'Examen :
                        </label>
                        <select
                          value={examType}
                          onChange={e => {
                            const newType = e.target.value as ExamType;
                            setExamType(newType);
                            const found = EXAM_NATURES.find(n => n.id === newType);
                            if (found && found.categories[0]?.examens[0]) {
                              setExamNom(found.categories[0].examens[0].nom);
                              setExamIndications(found.categories[0].examens[0].indications);
                            }
                          }}
                          className="w-full rounded-xl border border-cyan-300 bg-white px-3 py-1.5 text-xs font-semibold"
                        >
                          {EXAM_NATURES.map(n => (
                            <option key={n.id} value={n.id}>
                              {n.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Nom de l'Examen à Réaliser :
                        </label>
                        <input
                          type="text"
                          value={examNom}
                          onChange={e => setExamNom(e.target.value)}
                          placeholder="Ex: Goutte Épaisse, NFS, Échographie Abdominale, ECG..."
                          className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold"
                        />
                      </div>
                    </div>

                    {/* Quick chips from nature catalog */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                        Examens Fréquents ({currentExamNature.label}) :
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {currentExamNature.categories.flatMap(c => c.examens).slice(0, 5).map((ex, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setExamNom(ex.nom);
                              setExamIndications(ex.indications);
                            }}
                            className="text-[10px] px-2.5 py-1 rounded-lg bg-white hover:bg-cyan-100/70 text-slate-700 hover:text-cyan-950 border border-slate-200 transition"
                          >
                            + {ex.nom}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Renseignements Cliniques / Indications :
                      </label>
                      <input
                        type="text"
                        value={examIndications}
                        onChange={e => setExamIndications(e.target.value)}
                        placeholder="Indications médicales pour le plateau technique..."
                        className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Doctor Tactile Electronic Signature Section */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/80 via-orange-50/50 to-amber-50/80 border border-amber-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center font-bold shrink-0">
                      <PenTool className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-amber-950">
                        Signature Électronique Médicale Tactile
                      </h4>
                      <p className="text-[10.5px] text-amber-800 font-medium">
                        Compatible écran tactile, tablette ou stylet pour certifier l'ordonnance dès la consultation.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTactilePadInNewConsult(!showTactilePadInNewConsult)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-xs font-bold text-amber-950 hover:bg-amber-100 transition shadow-2xs self-start sm:self-auto"
                  >
                    {showTactilePadInNewConsult
                      ? 'Masquer le pavé tactile'
                      : customSignatureDraft
                      ? '✏️ Modifier la signature tactile'
                      : '✍️ Signer sur écran tactile'}
                  </button>
                </div>

                {customSignatureDraft && !showTactilePadInNewConsult && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-amber-200 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-32 border border-slate-200 rounded-lg bg-slate-50 flex items-center justify-center overflow-hidden p-1">
                        <img
                          src={customSignatureDraft}
                          alt="Signature Médecin"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="text-xs">
                        <span className="font-black text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Signature certifiée prête à être apposée
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Signataire : {medecinPrescripteur}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCustomSignatureDraft(null)}
                      className="text-xs text-rose-600 hover:text-rose-800 font-bold px-2 py-1"
                    >
                      Effacer
                    </button>
                  </div>
                )}

                {showTactilePadInNewConsult && (
                  <div className="p-3.5 bg-white rounded-2xl border border-amber-300 shadow-sm">
                    <ElectronicSignaturePad
                      documentTitle="Prescription Médicale"
                      signataireNom={medecinPrescripteur}
                      signataireRole="Médecin Praticien"
                      initialSignature={customSignatureDraft || undefined}
                      onSaveSignature={(sigUrl) => {
                        setCustomSignatureDraft(sigUrl);
                        setShowTactilePadInNewConsult(false);
                      }}
                      onCancel={() => setShowTactilePadInNewConsult(false)}
                    />
                  </div>
                )}
              </div>

              {/* Submit Actions */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewConsultModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enregistrer la Consultation & Générer l'Ordonnance</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Electronic Signature Modal */}
      {ordonnanceToSign && (
        <ElectronicSignatureModal
          isOpen={Boolean(ordonnanceToSign)}
          onClose={() => setOrdonnanceToSign(null)}
          type="ordonnance"
          documentTitle={`Ordonnance Médicale - ${ordonnanceToSign.patientNom}`}
          documentNumber={ordonnanceToSign.numero}
          patientNom={ordonnanceToSign.patientNom}
          details={ordonnanceToSign.diagnostic || ordonnanceToSign.motifConsultation}
          signataireNom={currentUser.nom.startsWith('Dr.') ? currentUser.nom : `Dr. ${currentUser.prenom} ${currentUser.nom}`}
          signataireRole={currentUser.specialite || 'Médecin Praticien'}
          onSaveSignature={(sigUrl) => {
            signerOrdonnance(ordonnanceToSign.id, sigUrl);
            setOrdonnanceToSign(null);
          }}
        />
      )}

      {/* Printable Ordonnance Modal */}
      {selectedOrdonnanceToPrint && (
        <OrdonnancePrintModal
          isOpen={Boolean(selectedOrdonnanceToPrint)}
          onClose={() => setSelectedOrdonnanceToPrint(null)}
          ordonnance={selectedOrdonnanceToPrint}
          patient={patients.find(p => p.id === selectedOrdonnanceToPrint.patientId)}
        />
      )}
    </div>
  );
};
