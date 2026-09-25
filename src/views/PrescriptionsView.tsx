import React, { useState } from 'react';
import {
  FileText,
  Search,
  Printer,
  Calendar,
  User,
  Pill,
  CheckCircle2,
  X,
  Lock,
  Download,
  MapPin,
  Activity,
  ShieldCheck,
  PenTool,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { Ordonnance } from '../types';
import { Logo } from '../components/Logo';
import { OrdonnancePrintModal } from '../components/OrdonnancePrintModal';
import { ElectronicSignatureModal } from '../components/ElectronicSignatureModal';

export const PrescriptionsView: React.FC = () => {
  const { ordonnances, patients, currentRole, currentUser, signerOrdonnance } = useClinic();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrdonnance, setSelectedOrdonnance] = useState<Ordonnance | null>(null);
  const [ordonnanceToSign, setOrdonnanceToSign] = useState<Ordonnance | null>(null);

  const isAuthorized = ['medecin', 'directeur', 'patient', 'pharmacien', 'infirmier'].includes(currentRole);

  if (!isAuthorized) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Accès Restreint aux Ordonnances</h2>
        <p className="text-xs text-slate-500">
          Les prescriptions médicales sont strictement réservées aux Médecins et à la Direction.
        </p>
      </div>
    );
  }

  const filtered = ordonnances.filter(o => {
    const q = searchTerm.toLowerCase();
    return (
      o.patientNom.toLowerCase().includes(q) ||
      o.numero.toLowerCase().includes(q) ||
      (o.diagnostic && o.diagnostic.toLowerCase().includes(q)) ||
      (o.medecinNom && o.medecinNom.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B3C5D]">Ordonnances Médicales Sécurisées</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[11px] font-bold">
              {ordonnances.length} ordonnances
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Prescriptions certifiées (médecin prescripteur, voies d'administration, âge, sexe, quartier, diagnostic et action post-diagnostic)
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Rechercher par patient, médecin, numéro d'ordonnance ou diagnostic..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
        />
      </div>

      {/* Grid of Prescriptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(ord => {
          const patient = patients.find(p => p.id === ord.patientId);
          const displayAge = ord.patientAge || patient?.age || 34;
          const displaySexe = ord.patientSexe || (patient?.sexe === 'F' ? 'Féminin' : 'Masculin');
          const displayQuartier = ord.patientQuartier || patient?.quartier || 'Sabangali, N\'Djamena';

          return (
            <div
              key={ord.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-teal-300 shadow-xs hover:shadow transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {ord.numero}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{ord.patientNom}</h3>
                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[11px] text-slate-600">
                      <span className="font-medium text-slate-700">
                        {displaySexe}, {displayAge} ans
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-teal-800 font-medium flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5" />
                        {displayQuartier}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
                    {ord.dateConsultation || ord.date}
                  </span>
                </div>

                {/* Prescribing doctor */}
                <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span className="truncate">
                    Prescripteur : <strong>{ord.medecinNom.startsWith('Dr.') ? ord.medecinNom : `Dr. ${ord.medecinNom}`}</strong>
                  </span>
                </div>

                {/* Diagnostic & Action Après Diagnostic */}
                {(ord.diagnostic || ord.actionApresDiagnostic) && (
                  <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-1 text-xs">
                    {ord.diagnostic && (
                      <p className="text-emerald-950 font-bold text-[11px]">
                        Diag : {ord.diagnostic}
                      </p>
                    )}
                    {ord.actionApresDiagnostic && (
                      <p className="text-emerald-800 text-[10.5px]">
                        <strong>Action :</strong> {ord.actionApresDiagnostic}
                      </p>
                    )}
                  </div>
                )}

                {/* Items preview with Voies de prise */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-between">
                    <span>Médicaments ({ord.items.length}) :</span>
                    <span className="text-teal-700">Voies spécifiées</span>
                  </span>
                  {ord.items.map((item, idx) => (
                    <div key={idx} className="text-slate-700 text-[11px] border-b border-slate-200/60 pb-1 last:border-b-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <strong>• {item.medicament}</strong>
                        {item.voie && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-teal-100 text-teal-900 font-medium">
                            {item.voie.split(' ')[1] || item.voie}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 text-[10px] pl-2">{item.posologie} ({item.duree})</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedOrdonnance(ord)}
                  className="flex-1 py-2.5 rounded-xl bg-[#1E88E5] hover:bg-[#1565C0] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer Ordonnance</span>
                </button>

                {['medecin', 'directeur'].includes(currentRole) && (
                  <button
                    onClick={() => setOrdonnanceToSign(ord)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      ord.signatureElectronique
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-2xs'
                    }`}
                    title="Signer électroniquement sur écran tactile ou stylet"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>{ord.signatureElectronique ? 'Signé tactile ✓' : '✍️ Signer (Tactile)'}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Official Printable Prescription Modal */}
      {selectedOrdonnance && (
        <OrdonnancePrintModal
          isOpen={!!selectedOrdonnance}
          ordonnance={selectedOrdonnance}
          patient={patients.find(p => p.id === selectedOrdonnance.patientId)}
          onClose={() => setSelectedOrdonnance(null)}
        />
      )}

      {/* Tactile Electronic Signature Modal */}
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
    </div>
  );
};
