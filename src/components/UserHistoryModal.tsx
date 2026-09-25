import React, { useState } from 'react';
import {
  X,
  Calendar,
  Stethoscope,
  FileText,
  Microscope,
  ShieldCheck,
  CheckCircle2,
  Power,
  Clock,
  User as UserIcon,
  Building2,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { User, Consultation, Ordonnance, Examen, UserAccountStatus } from '../types';

interface UserHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  consultations: Consultation[];
  ordonnances: Ordonnance[];
  exams: Examen[];
  currentUser: User;
  onToggleStatus: (userId: string) => Promise<void>;
  onOpenDeactivateModal?: (user: User) => void;
}

export const UserHistoryModal: React.FC<UserHistoryModalProps> = ({
  isOpen,
  onClose,
  user,
  consultations,
  ordonnances,
  exams,
  currentUser,
  onToggleStatus,
  onOpenDeactivateModal,
}) => {
  const [activeTab, setActiveTab] = useState<'consultations' | 'ordonnances' | 'examens'>('consultations');

  if (!isOpen || !user) return null;

  const getUserStatut = (u: User): UserAccountStatus => {
    if (u.statut === 'en_attente') return 'en_attente';
    if (u.statut === 'desactive' || u.statut === 'suspendu' || u.actif === false) return 'desactive';
    return 'actif';
  };

  const currentStatut = getUserStatut(user);
  const isDeactivated = currentStatut === 'desactive';

  // Filter consultations attributed to this user
  const userConsultations = consultations.filter(
    c => c.medecinId === user.id || c.medecinNom?.toLowerCase().includes(user.nom.toLowerCase())
  );

  // Filter ordonnances
  const userOrdonnances = ordonnances.filter(
    o => o.medecinId === user.id || o.medecinNom?.toLowerCase().includes(user.nom.toLowerCase())
  );

  // Filter examens
  const userExams = exams.filter(
    e =>
      e.medecinPrescripteurId === user.id ||
      e.technicienId === user.id ||
      e.medecinPrescripteurNom?.toLowerCase().includes(user.nom.toLowerCase())
  );

  return (
    <div
      id="modal-user-history"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#0B3C5D] text-white flex items-center justify-center font-bold flex-shrink-0">
              <Stethoscope className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Historique des Actes & Consultations
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    currentStatut === 'actif'
                      ? 'bg-emerald-100 text-emerald-800'
                      : currentStatut === 'en_attente'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {currentStatut === 'actif'
                    ? 'Compte Actif'
                    : currentStatut === 'en_attente'
                    ? 'En attente'
                    : 'Compte Désactivé'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {user.prenom} {user.nom} • {user.role} ({user.etablissementNom || 'DARÔ Santé'})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Notice Legal Preservation Guarantee */}
          <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 flex items-start gap-2.5 text-xs text-blue-950">
            <ShieldCheck className="w-4 h-4 text-[#1E88E5] flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block mb-0.5 font-bold">
                Principe de conservation médico-légale DARÔ :
              </strong>
              <span>
                {isDeactivated
                  ? "Ce compte est actuellement désactivé. Ses accès sont révoqués, mais tous ses actes, consultations antérieures et ordonnances restent scellés et attribués à ce soignant pour garantir la traçabilité hospitalière."
                  : "Même en cas de désactivation ultérieure de ce soignant, tous les actes enregistrés ci-dessous demeurent 100% rattachés aux dossiers patients sans aucune perte d'historique."}
              </span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('consultations')}
              className={`p-3.5 rounded-xl border text-left transition ${
                activeTab === 'consultations'
                  ? 'border-[#1E88E5] bg-blue-50/50 ring-2 ring-[#1E88E5]/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Consultations</span>
                <Stethoscope className="w-4 h-4 text-[#1E88E5]" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {userConsultations.length}
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Actes médicaux</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ordonnances')}
              className={`p-3.5 rounded-xl border text-left transition ${
                activeTab === 'ordonnances'
                  ? 'border-[#1E88E5] bg-blue-50/50 ring-2 ring-[#1E88E5]/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Ordonnances</span>
                <FileText className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {userOrdonnances.length}
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Prescriptions émises</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('examens')}
              className={`p-3.5 rounded-xl border text-left transition ${
                activeTab === 'examens'
                  ? 'border-[#1E88E5] bg-blue-50/50 ring-2 ring-[#1E88E5]/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Examens</span>
                <Microscope className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {userExams.length}
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Laboratoire & Imagerie</span>
            </button>
          </div>

          {/* Tab 1: Consultations */}
          {activeTab === 'consultations' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                <span>Consultations Réalisées ({userConsultations.length})</span>
                {isDeactivated && (
                  <span className="text-[11px] text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    Historique conservé malgré compte inactif
                  </span>
                )}
              </h4>

              {userConsultations.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 text-slate-500 text-xs">
                  Aucune consultation enregistrée par ce soignant pour le moment.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {userConsultations.map(consultation => (
                    <div
                      key={consultation.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">
                            {consultation.patientNom}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500">{consultation.motif}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {consultation.date}
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-slate-50 text-xs text-slate-700 flex items-start gap-2">
                        <span className="font-bold text-emerald-800 text-[10px] uppercase tracking-wider flex-shrink-0 mt-0.5">
                          Diagnostic :
                        </span>
                        <span className="font-medium text-slate-900">
                          {consultation.diagnostic}
                        </span>
                      </div>

                      {consultation.observations && (
                        <p className="text-[11px] text-slate-500 italic">
                          Notes : {consultation.observations}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Ordonnances */}
          {activeTab === 'ordonnances' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                <span>Prescriptions & Traitements Signés ({userOrdonnances.length})</span>
              </h4>

              {userOrdonnances.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 text-slate-500 text-xs">
                  Aucune ordonnance délivrée par ce praticien.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {userOrdonnances.map(ord => (
                    <div
                      key={ord.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{ord.numero}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-600">Patient : {ord.patientNom}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {ord.date}
                        </span>
                      </div>

                      {ord.items && ord.items.length > 0 && (
                        <ul className="text-xs text-slate-700 space-y-1 pl-1">
                          {ord.items.map((it, idx) => (
                            <li key={idx} className="text-[11px]">
                              • <strong>{it.medicament}</strong> : {it.posologie} ({it.duree})
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Examens */}
          {activeTab === 'examens' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Examens Prescrits ou Réalisés ({userExams.length})
              </h4>

              {userExams.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 text-slate-500 text-xs">
                  Aucun examen complémentaire rattaché à ce compte.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {userExams.map(ex => (
                    <div
                      key={ex.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">{ex.nomExamen}</span>
                        <span className="text-[11px] text-slate-400">{ex.datePrescription}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Patient : <strong>{ex.patientNom}</strong> • Type : {ex.type} • Statut : {ex.statut}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {isDeactivated ? (
              <span className="text-rose-700 font-semibold flex items-center gap-1">
                <Power className="w-3.5 h-3.5" />
                Compte désactivé • Historique intact
              </span>
            ) : (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Compte opérationnel
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/60 rounded-xl transition"
            >
              Fermer
            </button>

            {user.id !== currentUser.id && (
              isDeactivated ? (
                <button
                  type="button"
                  onClick={async () => {
                    await onToggleStatus(user.id);
                    onClose();
                  }}
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Réactiver le Compte</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenDeactivateModal) {
                      onOpenDeactivateModal(user);
                      onClose();
                    } else {
                      onToggleStatus(user.id);
                      onClose();
                    }
                  }}
                  className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>Désactiver le Compte (Garder l'historique)</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
