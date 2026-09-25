import React from 'react';
import { ShieldAlert, ArrowLeft, Lock, Building2, UserX, AlertTriangle } from 'lucide-react';
import { useClinic } from '../context/ClinicContext';

interface AccessDeniedWorkstationGuardProps {
  attemptedView: string;
  onRedirectToAllowed: () => void;
}

export const AccessDeniedWorkstationGuard: React.FC<AccessDeniedWorkstationGuardProps> = ({
  attemptedView,
  onRedirectToAllowed,
}) => {
  const { currentUser, currentRole, currentEtablissement } = useClinic();

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'medecin': return 'Médecin Praticien';
      case 'infirmier': return 'Infirmier / Soignant';
      case 'tech_laboratoire': return 'Technicien de Laboratoire';
      case 'tech_imagerie': return 'Technicien d\'Imagerie Médicale';
      case 'accueil': return 'Accueil & Réception';
      case 'gestionnaire': return 'Gestionnaire / Pharmacie';
      case 'patient': return 'Espace Patient';
      default: return role;
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-3xl border-2 border-rose-200 shadow-2xl p-6 sm:p-8 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-black uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            Cloisonnement Strict des Postes de Travail
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            Accès Non Autorisé à ce Poste
          </h2>
          <p className="text-sm text-slate-600">
            Conformément à la politique de sécurité clinique <strong>DARÔ Santé HDS</strong>, chaque membre du personnel médical et administratif est strictement restreint à son poste de compétence.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-700">
            <span className="text-slate-500 font-medium">Votre Profil Connecté :</span>
            <span className="font-bold text-slate-900">{currentUser.prenom} {currentUser.nom}</span>
          </div>
          <div className="flex justify-between items-center text-slate-700">
            <span className="text-slate-500 font-medium">Rôle Attribué :</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-200 font-bold text-slate-800">
              {getRoleLabel(currentRole)}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-700">
            <span className="text-slate-500 font-medium">Poste / Espace Sollicité :</span>
            <span className="font-mono font-bold text-rose-600 uppercase bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              {attemptedView}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-700">
            <span className="text-slate-500 font-medium">Établissement :</span>
            <span className="font-semibold text-teal-800 truncate">
              {currentEtablissement?.nom || 'Clinique Médicale Espoir'}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5 text-left">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>Règle de Gouvernance :</strong> Seuls le <strong>Directeur Médical</strong> et le <strong>Super Administrateur Réseau</strong> disposent des droits de supervision transversale entre les différents postes. Cet incident a été horodaté dans le journal d'audit de sécurité.
          </span>
        </div>

        <button
          onClick={onRedirectToAllowed}
          className="w-full py-3.5 px-6 rounded-2xl bg-[#0B3C5D] hover:bg-[#07273d] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retourner à mon Poste de Travail Autorisé</span>
        </button>
      </div>
    </div>
  );
};
