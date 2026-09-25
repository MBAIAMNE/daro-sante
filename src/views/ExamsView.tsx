import React, { useState } from 'react';
import {
  Microscope,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  User,
  Plus,
  Send,
  Calendar,
  X,
  Filter,
  Printer,
  QrCode,
  MapPin,
  Stethoscope,
  Activity,
  PenTool,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { ExamenPrescrit, ExamType } from '../types';
import { ExamenPrintModal } from '../components/ExamenPrintModal';
import { ElectronicSignatureModal } from '../components/ElectronicSignatureModal';
import { EXAM_NATURES, getExamNatureDetail } from '../data/examCatalog';

export const ExamsView: React.FC = () => {
  const {
    exams,
    saisirResultatExamen,
    currentRole,
    currentUser,
    prescrireExamen,
    patients,
    signerExamen,
  } = useClinic();

  const [activeFilter, setActiveFilter] = useState<string>('tous');
  const [selectedExamToResult, setSelectedExamToResult] = useState<ExamenPrescrit | null>(null);
  const [selectedExamToPrint, setSelectedExamToPrint] = useState<ExamenPrescrit | null>(null);
  const [examToSign, setExamToSign] = useState<ExamenPrescrit | null>(null);

  // Result entry form
  const [resultText, setResultText] = useState('Présence de trophozoïtes de Plasmodium falciparum. Densité parasitaire : 4 500 trophozoïtes/µL de sang.');
  const [valeursNormales, setValeursNormales] = useState('Absence de parasites (Négatif).');
  const [isAbnormal, setIsAbnormal] = useState(true);

  // Order modal state (for doctors)
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderPatientId, setOrderPatientId] = useState(patients[0]?.id || '');
  const [orderType, setOrderType] = useState<ExamType>('laboratoire');
  const [orderName, setOrderName] = useState('Goutte Épaisse & Frottis Sanguin');
  const [orderIndications, setOrderIndications] = useState('Syndrome fébrile aigu avec céphalées');

  const canEnterResults = ['tech_laboratoire', 'tech_imagerie', 'medecin', 'directeur'].includes(currentRole);
  const canPrescribe = ['medecin', 'directeur'].includes(currentRole);

  const filteredExams = exams.filter(e => {
    if (activeFilter === 'tous') return true;
    return e.type === activeFilter;
  });

  const handleSaveResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamToResult) return;
    saisirResultatExamen(
      selectedExamToResult.id,
      resultText,
      valeursNormales,
      isAbnormal
    );
    setSelectedExamToResult(null);
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find(p => p.id === orderPatientId) || patients[0];
    prescrireExamen({
      patientId: pat.id,
      patientNom: `${pat.prenom} ${pat.nom}`,
      type: orderType,
      nomExamen: orderName,
      indications: orderIndications,
    });
    setShowOrderModal(false);
  };

  const currentSelectedNature = EXAM_NATURES.find(n => n.id === orderType) || EXAM_NATURES[0];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B3C5D]">Examens & Explorations Cliniques</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 text-[11px] font-bold">
              {exams.length} examens enregistrés
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Intégration de toutes les natures : Biologie Médicale, Imagerie, Cardiologie, Endoscopie, Anapath, ORL/Ophtalmo
          </p>
        </div>

        {canPrescribe && (
          <button
            onClick={() => setShowOrderModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-bold shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Prescrire un Examen</span>
          </button>
        )}
      </div>

      {/* Filter Tabs by Exam Nature */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveFilter('tous')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeFilter === 'tous' ? 'bg-[#0B3C5D] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Tous ({exams.length})
        </button>
        {EXAM_NATURES.map(nature => {
          const count = exams.filter(e => e.type === nature.id).length;
          return (
            <button
              key={nature.id}
              onClick={() => setActiveFilter(nature.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeFilter === nature.id ? 'bg-[#0B3C5D] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {nature.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredExams.map(exam => {
          const isPending = exam.statut === 'prescrit' || exam.statut === 'en_cours';
          const natureDetail = getExamNatureDetail(exam.type);

          return (
            <div
              key={exam.id}
              className={`p-5 rounded-2xl bg-white border transition shadow-xs flex flex-col justify-between space-y-4 ${
                exam.anormal ? 'border-rose-300' : 'border-slate-200 hover:border-cyan-300'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${natureDetail.badgeColor}`}>
                      {natureDetail.label}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{exam.nomExamen}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-slate-600">
                      <span>Patient : <strong>{exam.patientNom}</strong></span>
                      {exam.patientSexe && (
                        <span className="text-[10.5px] px-1.5 py-0.2 rounded bg-slate-100 font-medium text-slate-700">
                          {exam.patientSexe}, {exam.patientAge || 34} ans
                        </span>
                      )}
                      {exam.patientQuartier && (
                        <span className="text-[10.5px] px-1.5 py-0.2 rounded bg-cyan-50 font-medium text-cyan-800 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" />
                          {exam.patientQuartier}
                        </span>
                      )}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      exam.statut === 'valide'
                        ? 'bg-emerald-100 text-emerald-800'
                        : exam.statut === 'en_cours'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {exam.statut === 'valide' && 'Résultat validé'}
                    {exam.statut === 'en_cours' && 'En cours'}
                    {exam.statut === 'prescrit' && 'Prescrit (en attente)'}
                  </span>
                </div>

                <div className="text-xs space-y-1 text-slate-600">
                  <p><strong>Indications cliniques :</strong> {exam.indications || exam.indicationClinique}</p>
                  <p className="text-[11px] text-slate-400">
                    Prescrit par <strong>{exam.medecinPrescripteurNom || exam.prescripteurNom}</strong> le {exam.datePrescription}
                  </p>
                </div>

                {/* If result is ready */}
                {exam.statut === 'valide' && exam.resultat && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                        Compte-Rendu / Mesures Constatées
                      </span>
                      {exam.anormal && (
                        <span className="text-[10px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                          Valeur Pathologique
                        </span>
                      )}
                    </div>
                    <p className="text-slate-900 font-medium whitespace-pre-line">{exam.resultat}</p>
                    {exam.valeursNormales && (
                      <p className="text-slate-500 text-[11px]">Normes de référence : {exam.valeursNormales}</p>
                    )}
                    <p className="text-[10px] text-teal-800 font-semibold pt-1 border-t border-slate-200">
                      Validé par : {exam.technicienNom} ({exam.dateResultat})
                    </p>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedExamToPrint(exam)}
                  className="flex-1 min-w-[130px] py-2 px-3 rounded-xl bg-slate-100 hover:bg-cyan-50 text-slate-700 hover:text-cyan-800 text-xs font-bold transition flex items-center justify-center gap-1.5 border border-slate-200"
                  title="Imprimer le bulletin officiel avec QR de vérification médicale"
                >
                  <Printer className="w-3.5 h-3.5 text-cyan-700" />
                  <span>Imprimer Bulletin & QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setExamToSign(exam)}
                  className={`min-w-[120px] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    exam.signatureElectronique
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-2xs'
                  }`}
                  title="Signer électroniquement sur écran tactile ou stylet"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>{exam.signatureElectronique ? 'Signé tactile ✓' : '✍️ Signer (Tactile)'}</span>
                </button>

                {canEnterResults && isPending && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedExamToResult(exam);
                      setResultText(exam.type === 'laboratoire' ? 'Goutte épaisse positive : Plasmodium falciparum.' : 'Compte-rendu conforme sans anomalie aiguë.');
                    }}
                    className="flex-1 min-w-[130px] py-2 px-3 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Saisir le Résultat</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Result Entry Modal */}
      {selectedExamToResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 my-8 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-[#0B3C5D]">
                <Microscope className="w-5 h-5 text-cyan-600" />
                <div>
                  <h3 className="text-base font-bold">Saisie des Résultats & Validation</h3>
                  <p className="text-xs text-slate-500">{selectedExamToResult.nomExamen} • {selectedExamToResult.patientNom}</p>
                </div>
              </div>
              <button onClick={() => setSelectedExamToResult(null)} className="text-slate-400 hover:text-slate-700 p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveResult} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Résultats constatés / Mesures :
                </label>
                <textarea
                  value={resultText}
                  onChange={e => setResultText(e.target.value)}
                  rows={3}
                  required
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Valeurs de référence / Normes du plateau technique :
                </label>
                <input
                  type="text"
                  value={valeursNormales}
                  onChange={e => setValeursNormales(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-rose-700 p-3 rounded-xl bg-rose-50 border border-rose-200">
                <input
                  type="checkbox"
                  checked={isAbnormal}
                  onChange={e => setIsAbnormal(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded"
                />
                <span>Alerte : Résultat pathologique / Anormal nécessitant l'attention du médecin</span>
              </label>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedExamToResult(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold shadow flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Valider & Transmettre au Dr. {selectedExamToResult.medecinPrescripteurNom || selectedExamToResult.prescripteurNom}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Exam Modal across all natures */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#0B3C5D]">Prescrire un Examen Complémentaire</h3>
              <button onClick={() => setShowOrderModal(false)} className="text-slate-400 hover:text-slate-700 p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Patient :</label>
                <select
                  value={orderPatientId}
                  onChange={e => setOrderPatientId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.prenom} {p.nom} ({p.age} ans, {p.quartier || 'N\'Djamena'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nature de l'Examen :</label>
                <select
                  value={orderType}
                  onChange={e => {
                    const newType = e.target.value as ExamType;
                    setOrderType(newType);
                    const found = EXAM_NATURES.find(n => n.id === newType);
                    if (found && found.categories[0]?.examens[0]) {
                      setOrderName(found.categories[0].examens[0].nom);
                      setOrderIndications(found.categories[0].examens[0].indications);
                    }
                  }}
                  className="w-full rounded-xl border border-cyan-300 px-3 py-2 text-xs font-semibold"
                >
                  {EXAM_NATURES.map(n => (
                    <option key={n.id} value={n.id}>{n.label}</option>
                  ))}
                </select>
              </div>

              {/* Suggestions */}
              <div>
                <span className="text-[10.5px] uppercase font-bold text-slate-500 block mb-1">
                  Exemples fréquents ({currentSelectedNature.label}) :
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentSelectedNature.categories.flatMap(c => c.examens).slice(0, 4).map((ex, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setOrderName(ex.nom);
                        setOrderIndications(ex.indications);
                      }}
                      className="text-[10.5px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-cyan-100 text-slate-700 border border-slate-200 transition"
                    >
                      + {ex.nom}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Intitulé de l'examen :</label>
                <input
                  type="text"
                  value={orderName}
                  onChange={e => setOrderName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Indications cliniques :</label>
                <textarea
                  value={orderIndications}
                  onChange={e => setOrderIndications(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-700 text-white text-xs font-bold shadow"
                >
                  Transmettre au plateau technique
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Exam Results Modal with QR Code */}
      {selectedExamToPrint && (
        <ExamenPrintModal
          isOpen={!!selectedExamToPrint}
          examen={selectedExamToPrint}
          onClose={() => setSelectedExamToPrint(null)}
        />
      )}

      {/* Tactile Electronic Signature Modal */}
      {examToSign && (
        <ElectronicSignatureModal
          isOpen={Boolean(examToSign)}
          onClose={() => setExamToSign(null)}
          type="examen"
          documentTitle={`Bulletin d'Examen - ${examToSign.nomExamen}`}
          documentNumber={`EX-${examToSign.id.slice(-6).toUpperCase()}`}
          patientNom={examToSign.patientNom}
          details={`Nature : ${getExamNatureDetail(examToSign.type).label} • Prescrit par ${examToSign.medecinPrescripteurNom || examToSign.prescripteurNom}`}
          signataireNom={currentUser.nom.startsWith('Dr.') ? currentUser.nom : `${currentUser.prenom} ${currentUser.nom}`}
          signataireRole={currentUser.specialite || 'Biologiste / Praticien Médical'}
          onSaveSignature={(sigUrl) => {
            signerExamen(examToSign.id, sigUrl);
            setExamToSign(null);
          }}
        />
      )}
    </div>
  );
};
