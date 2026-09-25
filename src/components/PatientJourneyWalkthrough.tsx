import React from 'react';
import {
  Activity,
  UserCheck,
  Stethoscope,
  Microscope,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  X,
  Clock,
  AlertCircle,
  BellRing,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';

interface WalkthroughProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PatientJourneyWalkthrough: React.FC<WalkthroughProps> = ({ isOpen, onClose }) => {
  const {
    queue,
    exams,
    switchRole,
    setCurrentView,
    simulerParcoursComplet,
  } = useClinic();

  if (!isOpen) return null;

  const enAttente = queue.filter(q => q.statut === 'en_attente');
  const triages = queue.filter(q => q.statut === 'triage_fait');
  const enConsult = queue.filter(q => q.statut === 'en_consultation');
  const examensEnCours = exams.filter(e => e.statut === 'prescrit' || e.statut === 'en_cours');
  const examensValides = exams.filter(e => e.statut === 'valide');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700 border border-sky-200">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#0B3C5D]">Le Parcours Patient DARÔ</h3>
                <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
                  Chaîne de Production & Triage
                </span>
              </div>
              <p className="text-xs text-slate-500">
                La chaîne médicale intégrée avec notifications en cascade entre les 8 corps de métier.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto pt-4 space-y-6 flex-1 pr-1">
          {/* Action to simulate a live cycle */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-sky-50 via-teal-50 to-emerald-50 border border-teal-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs font-bold text-[#0B3C5D] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Démonstration Interactive en 1 Clic
              </p>
              <p className="text-xs text-slate-600">
                Génère instantanément l'arrivée d'un patient d'urgence au guichet, effectue le triage infirmier et notifie le médecin.
              </p>
            </div>
            <button
              onClick={() => {
                simulerParcoursComplet();
                onClose();
              }}
              className="flex-shrink-0 px-4 py-2 rounded-xl bg-[#0B3C5D] hover:bg-[#1E88E5] text-white text-xs font-bold shadow-md transition"
            >
              Lancer la simulation
            </button>
          </div>

          {/* 5 Steps Visual Workflow */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
            {/* Step 1: Accueil */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">1</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                    {enAttente.length} en attente
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">1. Accueil</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Enregistre l'arrivée du patient & crée le ticket de file ("en attente").
                </p>
              </div>
              <button
                onClick={() => {
                  switchRole('accueil');
                  setCurrentView('queue');
                  onClose();
                }}
                className="mt-3 w-full py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold transition flex items-center justify-center gap-1"
              >
                <span>Poste Accueil</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Step 2: Infirmier */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-black flex items-center justify-center">2</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">
                    {triages.length} triés
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">2. Infirmier Triage</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Mesure les constantes (T°, TA, SpO2), classe l'urgence et oriente vers un médecin.
                </p>
              </div>
              <button
                onClick={() => {
                  switchRole('infirmier');
                  setCurrentView('queue');
                  onClose();
                }}
                className="mt-3 w-full py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 text-[11px] font-bold transition flex items-center justify-center gap-1"
              >
                <span>Poste Triage</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Step 3: Médecin */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center">3</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {enConsult.length} en cours
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">3. Médecin</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Reçoit la notification, consulte par ordre d'urgence, pose le diagnostic et prescrit.
                </p>
              </div>
              <button
                onClick={() => {
                  switchRole('medecin');
                  setCurrentView('queue');
                  onClose();
                }}
                className="mt-3 w-full py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold transition flex items-center justify-center gap-1"
              >
                <span>Cabinet Médecin</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Step 4: Examens */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-6 h-6 rounded-full bg-cyan-600 text-white text-xs font-black flex items-center justify-center">4</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800">
                    {examensEnCours.length} requis
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">4. Labo & Imagerie</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Techniciens notifiés, réalisent l'examen (Goutte épaisse, Radio) et saisissent les valeurs.
                </p>
              </div>
              <button
                onClick={() => {
                  switchRole('tech_laboratoire');
                  setCurrentView('examens');
                  onClose();
                }}
                className="mt-3 w-full py-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-[11px] font-bold transition flex items-center justify-center gap-1"
              >
                <span>Paillasse Labo</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Step 5: Clôture & Notification */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center">5</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
                    {examensValides.length} validés
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">5. Notification & Clôture</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Médecin immédiatement alerté des résultats disponibles, ajustement du traitement.
                </p>
              </div>
              <button
                onClick={() => {
                  switchRole('directeur');
                  setCurrentView('dashboard');
                  onClose();
                }}
                className="mt-3 w-full py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold transition flex items-center justify-center gap-1"
              >
                <span>Vue Directeur</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Current Live Queue Overview inside Modal */}
          <div className="border-t border-slate-100 pt-4">
            <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-500" />
              État Actuel de la File en Temps Réel
            </h4>
            <div className="space-y-2">
              {queue.map(t => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-black text-[#0B3C5D] bg-slate-100 px-2 py-0.5 rounded">
                      {t.ticketNumero}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {t.patientPrenom} {t.patientNom} ({t.patientAge} ans)
                      </p>
                      <p className="text-[11px] text-slate-500">{t.motifArrivee}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {t.niveauUrgence && (
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          t.niveauUrgence === 'critique'
                            ? 'bg-rose-100 text-rose-800 animate-pulse'
                            : t.niveauUrgence === 'urgent'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {t.niveauUrgence}
                      </span>
                    )}
                    <span className="text-[11px] font-medium text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      {t.statut === 'en_attente' && '1. En attente accueil'}
                      {t.statut === 'triage_fait' && '2. Triage fait'}
                      {t.statut === 'en_consultation' && '3. En consultation'}
                      {t.statut === 'examens_requis' && '4. Examens requis'}
                      {t.statut === 'termine' && '5. Terminé'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
