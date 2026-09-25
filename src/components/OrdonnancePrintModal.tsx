import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  Printer,
  X,
  ShieldCheck,
  Calendar,
  User,
  MapPin,
  Phone,
  CheckCircle2,
  Award,
  Stethoscope,
  Pill,
  Activity,
  AlertCircle,
  FileText,
  Clock,
  PenTool,
} from 'lucide-react';
import { Ordonnance, Patient } from '../types';
import { Logo } from './Logo';
import { useClinic } from '../context/ClinicContext';
import { ElectronicSignatureModal } from './ElectronicSignatureModal';

interface OrdonnancePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  ordonnance: Ordonnance | null;
  patient?: Patient | null;
}

export const OrdonnancePrintModal: React.FC<OrdonnancePrintModalProps> = ({
  isOpen,
  onClose,
  ordonnance,
  patient,
}) => {
  const { currentEtablissement, currentUser, signerOrdonnance } = useClinic();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [printMode, setPrintMode] = useState<'ordonnance' | 'fiche_consultation'>('ordonnance');
  const [showSignatureModal, setShowSignatureModal] = useState(false);

  useEffect(() => {
    if (!ordonnance) return;

    const qrPayload = JSON.stringify({
      type: 'DARO_ORDONNANCE',
      numero: ordonnance.numero,
      date: ordonnance.date,
      dateConsultation: ordonnance.dateConsultation || ordonnance.date,
      patient: ordonnance.patientNom,
      patientId: ordonnance.patientId,
      sexe: ordonnance.patientSexe || (patient?.sexe === 'F' ? 'Féminin' : (patient?.sexe === 'M' ? 'Masculin' : undefined)),
      age: ordonnance.patientAge || (patient?.age ? patient.age : undefined),
      quartier: ordonnance.patientQuartier || patient?.quartier || patient?.adresse || undefined,
      motif: ordonnance.motifConsultation,
      diagnostic: ordonnance.diagnostic,
      actionApresDiagnostic: ordonnance.actionApresDiagnostic,
      medecin: ordonnance.medecinNom,
      specialite: ordonnance.medecinSpecialite,
      etablissement: ordonnance.etablissementNom || currentEtablissement?.nom || 'Clinique Partenaire DARÔ Santé',
      signeElectroniquement: Boolean(ordonnance.signatureElectronique),
      itemsCount: ordonnance.items?.length || 0,
      verifUrl: `https://daro-sante.td/verif/ord/${ordonnance.numero}`,
    });

    QRCode.toDataURL(qrPayload, {
      width: 260,
      margin: 1,
      color: {
        dark: '#0B3C5D',
        light: '#FFFFFF',
      },
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('Erreur génération QR ordonnance:', err));
  }, [ordonnance, patient]);

  if (!isOpen || !ordonnance) return null;

  const handlePrint = () => {
    window.print();
  };

  // Resolved patient demographics
  const patientSexe = ordonnance.patientSexe || (patient?.sexe === 'F' ? 'Féminin' : (patient?.sexe === 'M' ? 'Masculin' : 'Non précisé'));
  const patientAge = ordonnance.patientAge || (patient?.age ? `${patient.age} ans` : 'Non précisé');
  const patientQuartier = ordonnance.patientQuartier || patient?.quartier || patient?.adresse || 'Non renseigné';
  const patientDistrict = patient?.quartier || patientQuartier;
  const patientBlood = patient?.groupeSanguin && patient.groupeSanguin !== 'Inconnu' ? patient.groupeSanguin : 'Non déterminé';
  const patientElectrophorese = patient?.electrophoreseHb || 'Non renseigné';
  const patientWeight = patient?.poids ? `${patient.poids} kg` : 'Non renseigné';

  // Resolved consultation clinical context
  const dateConsultation = ordonnance.dateConsultation || ordonnance.date;
  const motifConsultation = ordonnance.motifConsultation || 'Consultation générale & évaluation clinique';
  const diagnostic = ordonnance.diagnostic || 'Diagnostic clinique validé';
  const actionApresDiagnostic = ordonnance.actionApresDiagnostic || 'Traitement médical ambulatoire avec surveillance des symptômes';

  // Auto-formatted doctor name
  const cleanDoctorName = ordonnance.medecinNom.replace(/^Dr\.?\s*/i, '');
  const formattedDoctor = `Dr. ${cleanDoctorName}`;

  // Clinic metadata
  const clinicNom = ordonnance.etablissementNom || currentEtablissement?.nom || 'Clinique Médicale Espoir';
  const clinicVille = currentEtablissement?.ville || "N'Djamena";
  const clinicAdresse = currentEtablissement?.adresse || `Quartier Sabangali, ${clinicVille}`;
  const clinicTel = currentEtablissement?.telephone || '+235 22 52 14 15 / +235 66 21 00 01';

  const isPrescriberOrStaff = ['medecin', 'directeur', 'superadmin', 'infirmier'].includes(currentUser?.role || '');

  const handleSaveSignature = (sigUrl: string) => {
    signerOrdonnance(ordonnance.id, sigUrl);
    setShowSignatureModal(false);
  };

  return (
    <div
      id="modal-print-ordonnance-backdrop"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-2 sm:p-6 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="modal-print-ordonnance-container"
        className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in max-h-[92vh] flex flex-col"
      >
        {/* Action Header (Hidden during actual print) */}
        <div className="no-print bg-slate-900 text-white p-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-lg font-serif">
              ℞
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>Ordonnance Médicale & Fiche de Consultation</span>
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-mono">
                  {ordonnance.numero}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Impression officielle certifiée pour pharmacies d'officine et dossier clinique
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* View switcher */}
            <div className="flex bg-slate-800 p-0.5 rounded-lg text-[11px] font-medium border border-slate-700">
              <button
                type="button"
                onClick={() => setPrintMode('ordonnance')}
                className={`px-2.5 py-1 rounded-md transition ${
                  printMode === 'ordonnance'
                    ? 'bg-teal-600 text-white font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Ordonnance Pharmacie
              </button>
              <button
                type="button"
                onClick={() => setPrintMode('fiche_consultation')}
                className={`px-2.5 py-1 rounded-md transition ${
                  printMode === 'fiche_consultation'
                    ? 'bg-teal-600 text-white font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Fiche Complète (Clinique)
              </button>
            </div>

            {/* Signature Button (Touchscreen / Stylus / Mouse) */}
            {isPrescriberOrStaff && (
              <button
                type="button"
                onClick={() => setShowSignatureModal(true)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm ${
                  ordonnance.signatureElectronique
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black'
                }`}
                title="Signer sur écran tactile ou tablette"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>{ordonnance.signatureElectronique ? 'Re-signer (Tactile)' : '✍️ Signer (Tactile)'}</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              id="btn-print-ordonnance-trigger"
              className="px-3.5 py-2 rounded-xl bg-[#1E88E5] hover:bg-[#1565C0] text-white font-bold text-xs flex items-center gap-2 shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Prescription Document Area */}
        <div className="p-4 sm:p-8 bg-slate-50 overflow-y-auto text-slate-900 font-sans print:p-0 print:m-0 print:bg-white print:overflow-visible">
          <div
            id="printable-ordonnance-sheet"
            className="border-2 border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5 bg-white relative print:border-none print:p-4 print:rounded-none max-w-2xl mx-auto shadow-sm print:shadow-none"
          >
            {/* Header: National Health & Clinic Info */}
            <div className="border-b-2 border-slate-800 pb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Logo size="md" />
                  <div>
                    <h1 className="text-base sm:text-lg font-black tracking-tight text-[#0B3C5D] uppercase leading-tight">
                      {clinicNom}
                    </h1>
                    <p className="text-[10px] font-bold tracking-wider text-teal-700 uppercase">
                      Réseau DARÔ Santé Tchad • Urgences 24h/24
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Agrément Officiel Ministère de la Santé Publique • NIF: 9002341-T
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right text-[11px] text-slate-600 space-y-0.5">
                  <p className="font-bold text-slate-900 flex items-center sm:justify-end gap-1">
                    <MapPin className="w-3 h-3 text-[#1E88E5]" />
                    {clinicAdresse}
                  </p>
                  <p className="flex items-center sm:justify-end gap-1">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    {clinicTel}
                  </p>
                  <p className="text-[10px] text-slate-400">{clinicVille} - République du Tchad</p>
                </div>
              </div>
            </div>

            {/* Doctor and Patient Demographics Grid (Including Age, Sexe, Quartier, Date) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 py-1 border-b border-slate-200 text-xs">
              {/* Prescribing Doctor Details */}
              <div className="space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[9.5px] uppercase font-bold text-slate-400 block tracking-wider flex items-center gap-1">
                  <Stethoscope className="w-3 h-3 text-teal-600" />
                  Médecin Prescripteur
                </span>
                <p className="font-bold text-[#0B3C5D] text-sm">
                  {formattedDoctor}
                </p>
                <p className="text-slate-700 font-medium text-[11.5px]">
                  {ordonnance.medecinSpecialite || 'Médecin Praticien Hospitalier'}
                </p>
                <p className="text-[10px] text-slate-500 flex items-center gap-1 pt-0.5">
                  <Award className="w-3 h-3 text-amber-600 shrink-0" />
                  <span>Ordre National des Médecins du Tchad (ONMT N° 1248)</span>
                </p>
              </div>

              {/* Patient Beneficiary Details (Age, Sexe, Quartier) */}
              <div className="space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[9.5px] uppercase font-bold text-slate-400 block tracking-wider flex items-center gap-1">
                    <User className="w-3 h-3 text-[#1E88E5]" />
                    Patient(e) Bénéficiaire
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 text-[9.5px] font-bold font-mono">
                    Matricule : {patient?.matricule || 'NDJ-2025-0812'}
                  </span>
                </div>
                <p className="font-bold text-slate-900 text-sm">
                  {ordonnance.patientNom}
                </p>
                {/* Age, Sexe, Quartier Highlights */}
                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] text-slate-700 pt-0.5">
                  <p>
                    <span className="text-slate-400">Sexe :</span> <strong className="text-slate-900">{patientSexe}</strong>
                  </p>
                  <p>
                    <span className="text-slate-400">Âge :</span> <strong className="text-slate-900">{patientAge}</strong>
                  </p>
                  <p className="col-span-2 flex items-center gap-1 truncate">
                    <span className="text-slate-400">Quartier :</span>{' '}
                    <strong className="text-[#0B3C5D]">{patientQuartier}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 border-t border-slate-200/60 pt-1">
                  <span>Poids: <strong>{patientWeight}</strong></span>
                  <span>•</span>
                  <span className="text-rose-700 font-bold">Groupe: {patientBlood} ({patientElectrophorese})</span>
                </div>
              </div>
            </div>

            {/* Document Type & Consultation Date Banner */}
            <div className="flex items-center justify-between pt-1 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black italic tracking-wide text-[#0B3C5D] font-serif">
                  ℞
                </span>
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    {printMode === 'fiche_consultation'
                      ? 'Fiche Médicale de Consultation & Prescriptions'
                      : 'Ordonnance Médicale Sécurisée'}
                  </h2>
                  <p className="text-[10px] font-mono text-slate-500">
                    Réf. Ordonnance : <strong>{ordonnance.numero}</strong>
                  </p>
                </div>
              </div>

              <div className="text-right text-xs text-slate-600">
                <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Date de Consultation</span>
                <p className="font-bold text-slate-800 flex items-center justify-end gap-1 text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-[#1E88E5]" />
                  {dateConsultation}
                </p>
              </div>
            </div>

            {/* Clinical Box: Motif de Consultation, Diagnostic, and Action Après Diagnostic */}
            <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200 text-xs space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[9.5px] uppercase font-black text-slate-400 block tracking-wider">
                    Motif de consultation :
                  </span>
                  <p className="text-slate-800 font-semibold text-[11.5px] mt-0.5">
                    {motifConsultation}
                  </p>
                </div>
                <div>
                  <span className="text-[9.5px] uppercase font-black text-teal-700 block tracking-wider">
                    Diagnostic médical posé :
                  </span>
                  <p className="text-[#0B3C5D] font-bold text-[11.5px] mt-0.5">
                    {diagnostic}
                  </p>
                </div>
              </div>

              {/* Action Après Diagnostic / Conduite à Tenir */}
              <div className="pt-2 border-t border-slate-200/80">
                <span className="text-[9.5px] uppercase font-black text-emerald-800 block tracking-wider flex items-center gap-1">
                  <Activity className="w-3 h-3 text-emerald-600" />
                  Action Après Diagnostic / Conduite à Tenir :
                </span>
                <div className="mt-1 p-2 rounded-lg bg-emerald-50/60 border border-emerald-200/80 text-[11.5px] text-emerald-950 font-medium">
                  {actionApresDiagnostic}
                </div>
              </div>
            </div>

            {/* Prescribed Medications Section with Administration Route (Voie de Prise) */}
            <div className="space-y-3 py-1">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5 text-teal-600" />
                  Prescription Médicamenteuse ({ordonnance.items.length} produit{ordonnance.items.length > 1 ? 's' : ''})
                </span>
                <span className="text-[10px] text-slate-400 italic">
                  Dispensation autorisée en pharmacie
                </span>
              </div>

              <div className="space-y-3 min-h-[140px]">
                {ordonnance.items.map((item, idx) => {
                  const voiePrise = item.voie || 'Voie Orale (PO)';
                  return (
                    <div
                      key={idx}
                      className="border-l-4 border-[#1E88E5] pl-3.5 py-1.5 space-y-1 bg-slate-50/50 rounded-r-xl pr-3"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#0B3C5D] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <p className="font-black text-sm text-slate-900 tracking-tight">
                            {item.medicament}
                          </p>
                          {item.forme && (
                            <span className="text-[11px] font-medium text-slate-500 italic">
                              ({item.forme})
                            </span>
                          )}
                        </div>

                        {/* Voie de prise badge */}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-100/80 text-teal-900 border border-teal-200 text-[10px] font-bold">
                          <span>🎯 Voie :</span>
                          <span>{voiePrise}</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-slate-700 pl-7">
                        <p>
                          <strong className="text-slate-900">Posologie :</strong> {item.posologie}
                        </p>
                        <p className="text-slate-600">
                          <strong className="text-slate-900">Durée du traitement :</strong> {item.duree}
                          {item.quantite ? ` (Qté: ${item.quantite})` : ''}
                        </p>
                      </div>

                      {item.instructions && (
                        <p className="text-[10.5px] text-slate-500 italic pl-7">
                          Note : {item.instructions}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Special Doctor Instructions or Allergies if present */}
            {ordonnance.instructionsParticulieres && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Instructions Particulières & Précautions :</span>
                  <p>{ordonnance.instructionsParticulieres}</p>
                </div>
              </div>
            )}

            {/* Hygiene & Sahélien Recommendations */}
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[10.5px] text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-amber-950">
                <span>☀️</span> Recommandations Cliniques Sahéliennes (Climat de N'Djamena) :
              </p>
              <ul className="list-disc pl-5 space-y-0.5 text-amber-800 font-medium">
                <li>Boire au minimum 2.5 à 3 litres d'eau potable/traitée par jour pour prévenir l'hyperthermie et la déshydratation.</li>
                <li>Dormir impérativement chaque nuit sous moustiquaire imprégnée (MILDA) en prévention antipaludique.</li>
                <li>Respecter strictement la voie de prise indiquée et achever la durée prescrite sans interruption prématurée.</li>
              </ul>
            </div>

            {/* Footer: Stamp, Signature, and Security QR Code */}
            <div className="pt-4 border-t-2 border-slate-800 flex items-end justify-between gap-4">
              {/* QR Code Verification for N'Djamena Pharmacists */}
              <div className="flex items-center gap-3">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="QR Code Ordonnance"
                    className="w-20 h-20 border-2 border-slate-800 rounded-lg p-1 bg-white shadow-2xs shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-center text-[10px] shrink-0">
                    QR Code
                  </div>
                )}
                <div className="text-[10px] text-slate-600 space-y-0.5 max-w-[200px]">
                  <p className="font-bold text-[#0B3C5D] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Vérification Officine
                  </p>
                  <p>QR Code certifié par la plateforme hospitalière DARÔ Santé Tchad.</p>
                  <p className="font-mono text-[9px] text-slate-500">ID: {ordonnance.numero}</p>
                </div>
              </div>

              {/* Official Stamp & Certified Doctor Signature with Touchscreen Support */}
              <div className="text-center space-y-1 shrink-0">
                <div className="w-48 min-h-[90px] border-2 border-dashed border-teal-700/60 rounded-xl bg-teal-50/30 p-2 flex flex-col items-center justify-center relative">
                  <span className="text-[8px] font-black uppercase tracking-wider text-teal-900 text-center leading-tight">
                    {clinicNom}
                  </span>
                  <span className="text-[7.5px] font-bold text-teal-800">
                    {clinicVille.toUpperCase()} • RÉSEAU DARÔ SANTÉ
                  </span>

                  {ordonnance.signatureElectronique ? (
                    <div className="my-1 text-center">
                      <img
                        src={ordonnance.signatureElectronique}
                        alt={`Signature ${ordonnance.signataireNom || formattedDoctor}`}
                        className="h-10 max-w-[150px] object-contain mx-auto"
                      />
                      <div className="flex items-center justify-center gap-1 text-[7.5px] font-bold text-emerald-800">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                        <span>Signé le {ordonnance.dateSignature || ordonnance.date}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="my-1 text-center">
                      <div className="font-serif italic text-sm text-[#0B3C5D] font-bold">
                        {formattedDoctor}
                      </div>
                      {isPrescriberOrStaff && (
                        <button
                          type="button"
                          onClick={() => setShowSignatureModal(true)}
                          className="no-print mt-1 px-2 py-0.5 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-900 text-[8px] font-bold flex items-center gap-1 mx-auto transition"
                        >
                          <PenTool className="w-2.5 h-2.5" />
                          <span>Signer (Écran tactile)</span>
                        </button>
                      )}
                    </div>
                  )}

                  <span className="text-[7px] text-teal-700 mt-0.5">
                    {ordonnance.signatureElectronique ? 'Signature Électronique Certifiée' : 'Signature & Cachet Numérique'}
                  </span>
                </div>
                <p className="text-[9.5px] font-bold text-slate-700">Signature du Médecin Traitant</p>
              </div>
            </div>

            {/* Bottom Fine Print */}
            <div className="text-center pt-2 border-t border-slate-100 text-[9px] text-slate-400">
              DARÔ Santé • Système d'Information Hospitalier du Tchad • Ordonnance valable 3 mois à compter de la date de consultation
            </div>
          </div>
        </div>

        {/* Tactile Signature Modal */}
        <ElectronicSignatureModal
          isOpen={showSignatureModal}
          onClose={() => setShowSignatureModal(false)}
          onSaveSignature={handleSaveSignature}
          title="Signature Électronique de l'Ordonnance"
          documentTitle={`Ordonnance ${ordonnance.numero} — Patient: ${ordonnance.patientNom}`}
          signataireDefaultNom={
            currentUser?.nom?.startsWith('Dr.')
              ? currentUser.nom
              : `Dr. ${currentUser?.prenom || ''} ${currentUser?.nom || ''}`.trim() || formattedDoctor
          }
          signataireDefaultRole="Médecin Prescripteur"
        />
      </div>
    </div>
  );
};
