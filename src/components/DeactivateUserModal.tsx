import React from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Power,
  X,
  CheckCircle2,
  FileText,
  Stethoscope,
  Clock,
  Building2,
} from 'lucide-react';
import { User, Consultation, Ordonnance, Examen } from '../types';

interface DeactivateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  consultations: Consultation[];
  ordonnances: Ordonnance[];
  exams: Examen[];
  onConfirmDeactivate: (userId: string) => Promise<void>;
}

export const DeactivateUserModal: React.FC<DeactivateUserModalProps> = ({
  isOpen,
  onClose,
  user,
  consultations,
  ordonnances,
  exams,
  onConfirmDeactivate,
}) => {
  const [isProcessing, setIsProcessing] = React.useState(false);

  if (!isOpen || !user) return null;

  // Calculate past contributions
  const userConsultations = consultations.filter(
    c => c.medecinId === user.id || c.medecinNom?.toLowerCase().includes(user.nom.toLowerCase())
  );
  const userOrdonnances = ordonnances.filter(
    o => o.medecinId === user.id || o.medecinNom?.toLowerCase().includes(user.nom.toLowerCase())
  );
  const userExams = exams.filter(
    e =>
      e.medecinPrescripteurId === user.id ||
      e.technicienId === user.id ||
      e.medecinPrescripteurNom?.toLowerCase().includes(user.nom.toLowerCase())
  );

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirmDeactivate(user.id);
      setIsProcessing(false);
      onClose();
    } catch (err) {
      console.error('Erreur lors de la désactivation du compte:', err);
      setIsProcessing(false);
    }
  };

  return (
    <div
      id="modal-deactivate-user"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-rose-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0">
              <Power className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Désactiver le compte utilisateur
              </h3>
              <p className="text-xs text-rose-700 font-medium">
                Suspension des accès avec conservation intégrale de l'historique
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Target User Info */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0">
              <img
                src={
                  user.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    `${user.prenom} ${user.nom}`
                  )}&background=0B3C5D&color=fff&size=128`
                }
                alt={`${user.prenom} ${user.nom}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 truncate">
                  {user.prenom} {user.nom}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700 uppercase">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                <Building2 className="w-3 h-3" />
                <span className="truncate">
                  {user.etablissementNom || 'Direction Réseau DARÔ'}
                </span>
              </p>
            </div>
          </div>

          {/* Past History Preservation Guarantee Banner */}
          <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Historique médico-légal 100% préservé</span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              La désactivation suspend les futures connexions de ce compte, mais
              conserve <strong>rigoureusement</strong> l'ensemble de ses actes
              enregistrés :
            </p>
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="p-2 rounded-lg bg-white/80 border border-emerald-100">
                <div className="text-base font-black text-emerald-900">
                  {userConsultations.length}
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold">
                  Consultation(s)
                </div>
              </div>
              <div className="p-2 rounded-lg bg-white/80 border border-emerald-100">
                <div className="text-base font-black text-emerald-900">
                  {userOrdonnances.length}
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold">
                  Ordonnance(s)
                </div>
              </div>
              <div className="p-2 rounded-lg bg-white/80 border border-emerald-100">
                <div className="text-base font-black text-emerald-900">
                  {userExams.length}
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold">
                  Examen(s)
                </div>
              </div>
            </div>
          </div>

          {/* Summary of what will happen */}
          <div className="space-y-2 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">
              Effets de la désactivation :
            </p>
            <ul className="space-y-1.5 pl-1">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                <span>
                  L'accès à l'application et aux dossiers patients est{' '}
                  <strong>immédiatement verrouillé</strong> pour cet identifiant.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                <span>
                  Les consultations antérieures restent visibles dans les dossiers
                  patients avec la signature originale de ce soignant.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                <span>
                  Le Super Admin ou la Direction peut réactiver ce compte à tout
                  moment en un seul clic.
                </span>
              </li>
            </ul>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isProcessing}
              className="px-5 py-2.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition flex items-center gap-2 disabled:opacity-50"
            >
              <Power className="w-4 h-4" />
              <span>
                {isProcessing ? 'Désactivation en cours...' : 'Confirmer la Désactivation'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
