import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  Printer,
  X,
  ShieldCheck,
  Calendar,
  User,
  FlaskConical,
  Activity,
  MapPin,
  Phone,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  PenTool,
} from 'lucide-react';
import { Examen, Patient } from '../types';
import { Logo } from './Logo';
import { getExamNatureDetail } from '../data/examCatalog';
import { useClinic } from '../context/ClinicContext';
import { ElectronicSignatureModal } from './ElectronicSignatureModal';

interface ExamenPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  examen: Examen | null;
  patient?: Patient | null;
}

export const ExamenPrintModal: React.FC<ExamenPrintModalProps> = ({
  isOpen,
  onClose,
  examen,
  patient,
}) => {
  const { currentEtablissement, currentUser, signerExamen } = useClinic();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [showSignatureModal, setShowSignatureModal] = useState<boolean>(false);

  useEffect(() => {
    if (!examen) return;

    const qrPayload = JSON.stringify({
      type: 'DARO_EXAMEN',
      numero: examen.numero,
      date: examen.datePrescription,
      examen: examen.nomExamen,
      patient: examen.patientNom,
      medecin: examen.medecinPrescripteurNom || examen.prescripteurNom,
      statut: examen.statut,
      signeElectroniquement: Boolean(examen.signatureElectronique),
      etablissement: examen.etablissementNom || currentEtablissement?.nom || 'Clinique Partenaire DARÔ Santé',
      verifUrl: `https://daro-sante.td/verif/exam/${examen.numero}`,
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
      .catch(err => console.error('Erreur génération QR examen:', err));
  }, [examen]);

  if (!isOpen || !examen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSaveSignature = (sigUrl: string) => {
    signerExamen(examen.id, sigUrl);
    setShowSignatureModal(false);
  };

  const clinicNom = examen.etablissementNom || currentEtablissement?.nom || 'Clinique Médicale Espoir';
  const clinicVille = currentEtablissement?.ville || "N'Djamena";
  const clinicAdresse = currentEtablissement?.adresse || `Quartier Sabangali, ${clinicVille}`;
  const clinicTel = currentEtablissement?.telephone || '+235 22 52 14 15';

  const canSign = ['tech_laboratoire', 'tech_imagerie', 'medecin', 'directeur', 'superadmin'].includes(
    currentUser?.role || ''
  );

  const patientDistrict = patient?.quartier || examen.patientQuartier || patient?.adresse || 'Non renseigné';
  const patientBlood = patient?.groupeSanguin && patient.groupeSanguin !== 'Inconnu' ? patient.groupeSanguin : 'Non déterminé';
  const patientElectrophorese = patient?.electrophoreseHb || 'Non renseigné';
  const natureDetail = getExamNatureDetail(examen.type);
  const patientSexe = patient?.sexe === 'F' ? 'Féminin' : (patient?.sexe === 'M' ? 'Masculin' : 'Non précisé');
  const patientAge = patient?.age || examen.patientAge;

  // Parser helper for structured display if available
  const resultText = examen.resultats || examen.resultat || 'En cours d\'analyse au laboratoire.';
  const normalRef = examen.valeursNormales || 'Négatif / Absence de trophozoïtes';

  return (
    <div
      id="modal-print-examen-backdrop"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-3 sm:p-6 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="modal-print-examen-container"
        className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in"
      >
        {/* Action Header (Hidden during actual print) */}
        <div className="no-print bg-slate-900 text-white p-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              <FlaskConical className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>Bulletin d'Examen & Résultats Médicaux</span>
                {examen.signatureElectronique && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-[10px] font-bold border border-emerald-400/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Signé tactile
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400">
                {natureDetail.label} • {clinicNom} ({clinicVille})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canSign && (
              <button
                type="button"
                onClick={() => setShowSignatureModal(true)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm ${
                  examen.signatureElectronique
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black'
                }`}
                title="Signer sur écran tactile ou tablette"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>{examen.signatureElectronique ? 'Re-signer (Tactile)' : '✍️ Signer (Tactile)'}</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              id="btn-print-examen-trigger"
              className="px-4 py-2 rounded-xl bg-[#1E88E5] hover:bg-[#1565C0] text-white font-bold text-xs flex items-center gap-2 shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer le Bulletin</span>
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

        {/* Printable Document Area */}
        <div className="p-6 sm:p-10 bg-white text-slate-900 font-sans print:p-0 print:m-0">
          <div
            id="printable-examen-sheet"
            className="border-2 border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 bg-white relative print:border-none print:p-4 print:rounded-none"
          >
            {/* Header: Republic of Chad & Health Establishment */}
            <div className="border-b-2 border-slate-800 pb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Logo size="md" />
                  <div>
                    <h1 className="text-base sm:text-lg font-black tracking-tight text-[#0B3C5D] uppercase">
                      {clinicNom}
                    </h1>
                    <p className="text-[10px] font-bold tracking-wider text-teal-700 uppercase">
                      Plateau Technique DARÔ • {natureDetail.label}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Homologation Ministère de la Santé Publique • NIF: 9002341-T
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
                    {clinicTel} • Plateau Technique 24h/24
                  </p>
                  <p className="text-[10px] text-slate-400">{clinicVille} - République du Tchad</p>
                </div>
              </div>
            </div>

            {/* Document Title Banner */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md border ${natureDetail.badgeColor}`}>
                    Nature : {natureDetail.label}
                  </span>
                </div>
                <h2 className="text-base font-black text-[#0B3C5D]">
                  {examen.nomExamen}
                </h2>
              </div>
              <div className="text-right text-xs">
                <p className="font-mono font-bold text-slate-800">Réf: {examen.numero}</p>
                <p className="text-[11px] text-slate-500">
                  Prescrit le : <strong>{examen.datePrescription}</strong>
                </p>
              </div>
            </div>

            {/* Prescriber & Patient Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Médecin Prescripteur & Indication
                </span>
                <p className="font-bold text-[#0B3C5D] text-sm">
                  Dr. {examen.medecinPrescripteurNom?.replace(/^Dr\.?\s*/i, '') || examen.prescripteurNom?.replace(/^Dr\.?\s*/i, '') || 'Médecin Référent'}
                </p>
                <div className="pt-1 text-[11px] text-slate-700">
                  <span className="font-bold text-slate-900">Renseignements Cliniques : </span>
                  <span className="italic">{examen.indicationClinique || examen.indications || 'Bilan de contrôle clinique'}</span>
                </div>
              </div>

              <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200 space-y-1 sm:text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Patient(e)
                </span>
                <p className="font-bold text-slate-900 text-sm">
                  {examen.patientNom}
                </p>
                <p className="font-mono text-slate-600 text-[11px]">
                  Matricule : <strong>{patient?.matricule || 'N/A'}</strong>
                </p>
                <div className="flex flex-wrap items-center sm:justify-end gap-2 text-[11px] text-slate-700 font-medium">
                  <span>Sexe : <strong>{patientSexe}</strong></span>
                  <span>•</span>
                  <span>Âge : <strong>{patientAge ? `${patientAge} ans` : 'Non précisé'}</strong></span>
                  <span>•</span>
                  <span className="text-rose-700 font-bold">GS: {patientBlood}</span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium">
                  Quartier : <strong className="text-[#0B3C5D]">{patientDistrict}</strong>
                </p>
              </div>
            </div>

            {/* Results Table Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#1E88E5]" />
                  Résultats & Mesures Obtenues
                </h3>
                <span className="text-[11px] text-slate-500">
                  Statut : <strong className="uppercase text-emerald-700">{examen.statut}</strong>
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3.5">Paramètre Testé</th>
                      <th className="py-2.5 px-3.5">Résultat Trouvé</th>
                      <th className="py-2.5 px-3.5">Valeurs de Référence</th>
                      <th className="py-2.5 px-3.5 text-right">Interprétation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="bg-white">
                      <td className="py-3 px-3.5 font-bold text-slate-900">
                        {examen.nomExamen}
                      </td>
                      <td className="py-3 px-3.5 font-mono font-bold text-[#0B3C5D]">
                        {resultText}
                      </td>
                      <td className="py-3 px-3.5 text-slate-600">
                        {normalRef}
                      </td>
                      <td className="py-3 px-3.5 text-right">
                        {examen.valeursAnormales || examen.anormal ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                            Anormal / Positif
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Normal / Négatif
                          </span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Medical Conclusion & Interpretation */}
            <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1.5 text-xs">
              <span className="text-[10px] uppercase font-black text-[#0B3C5D] block tracking-wider flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5 text-[#1E88E5]" />
                Conclusion Médicale & Biologique
              </span>
              <p className="text-slate-800 font-medium leading-relaxed">
                {examen.conclusion ||
                  (examen.valeursAnormales || examen.anormal
                    ? `Résultats pathologiques confirmés pour ${examen.nomExamen}. Adaptation thérapeutique recommandée sous supervision médicale.`
                    : `Absence d'anomalie significative détectée sur ce paramètre. Les valeurs observées sont conformes aux normes physiologiques.`)}
              </p>
            </div>

            {/* Signatures, Lab Stamp, and QR Code */}
            <div className="pt-6 border-t-2 border-slate-800 flex items-end justify-between">
              <div className="flex items-center gap-3">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="QR Code Examen"
                    className="w-20 h-20 border-2 border-slate-800 rounded-lg p-1 bg-white shadow-2xs"
                  />
                ) : (
                  <div className="w-20 h-20 bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-center text-[10px]">
                    QR Code
                  </div>
                )}
                <div className="text-[10px] text-slate-600 space-y-0.5 max-w-[190px]">
                  <p className="font-bold text-[#0B3C5D] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                    Authenticité Laboratoire
                  </p>
                  <p>Document numérique scellé et traçable dans le réseau DARÔ.</p>
                  <p className="font-mono text-[9px] text-slate-400">Bulletin N° {examen.numero}</p>
                </div>
              </div>

              {/* Lab Technician / Biologist Signature */}
              <div className="text-center space-y-1">
                <div className="w-48 min-h-[90px] border-2 border-dashed border-blue-700/60 rounded-xl bg-blue-50/40 p-2 flex flex-col items-center justify-center">
                  <span className="text-[8px] font-black uppercase tracking-wider text-[#0B3C5D] text-center leading-tight">
                    {clinicNom}
                  </span>
                  <span className="text-[7.5px] font-bold text-teal-700">
                    {clinicVille.toUpperCase()} • TCHAD
                  </span>

                  {examen.signatureElectronique ? (
                    <div className="my-1 text-center">
                      <img
                        src={examen.signatureElectronique}
                        alt={`Signature ${examen.signataireNom || examen.technicienNom}`}
                        className="h-10 max-w-[150px] object-contain mx-auto"
                      />
                      <div className="flex items-center justify-center gap-1 text-[7.5px] font-bold text-emerald-800">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                        <span>Signé le {examen.dateSignature || examen.dateRealisation}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="my-1 text-center">
                      <div className="font-serif italic text-sm text-[#0B3C5D] font-bold mt-0.5">
                        {examen.technicienNom || `${currentUser.prenom} ${currentUser.nom}`}
                      </div>
                      {canSign && (
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

                  <span className="text-[7.5px] text-slate-500">
                    {examen.signatureElectronique ? 'Signature Électronique Certifiée' : 'Biologiste / Technicien Validateur'}
                  </span>
                </div>
                <p className="text-[10px] font-bold text-slate-700">Cachet du Laboratoire & Signature</p>
              </div>
            </div>

            {/* Bottom Disclaimer */}
            <div className="text-center pt-2 border-t border-slate-100 text-[9px] text-slate-400">
              Bulletin officiel d'analyses médicales • DARÔ Santé {clinicVille} • Toute reproduction partielle est interdite
            </div>
          </div>
        </div>

        {/* Tactile Signature Modal */}
        <ElectronicSignatureModal
          isOpen={showSignatureModal}
          onClose={() => setShowSignatureModal(false)}
          onSaveSignature={handleSaveSignature}
          title="Signature Électronique du Bulletin d'Examen"
          documentTitle={`Bulletin ${examen.numero} — ${examen.nomExamen} (Patient: ${examen.patientNom})`}
          signataireDefaultNom={
            examen.technicienNom || `${currentUser?.prenom || ''} ${currentUser?.nom || ''}`.trim() || 'Praticien Biologiste'
          }
          signataireDefaultRole={
            currentUser?.role === 'tech_laboratoire'
              ? 'Biologiste Médical Validateur'
              : currentUser?.role === 'tech_imagerie'
              ? 'Praticien Radiologue'
              : 'Praticien Hospitalier'
          }
        />
      </div>
    </div>
  );
};
