import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  Shield,
  User as UserIcon,
  Key,
  Eye,
  EyeOff,
  Building2,
  Monitor,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  ArrowRight,
  LogOut,
  Hospital,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { UserRole } from '../types';

interface WorkstationLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLockScreen?: boolean;
}

const POSTES_DISPONIBLES = [
  'Cabinet Consultation Médicale 01',
  'Cabinet Pédiatrie 02',
  'Box Triage Urgences & Constantes',
  'Guichet Accueil, Admissions & Caisse',
  'Bureau Direction Médicale',
  'Bureau Gestion Administrative & Finances',
  'Laboratoire d\'Analyses Médicales',
  'Salle d\'Imagerie Médicale & Échographie',
  'Console Centrale Super Admin Réseau',
];

const COMPTES_DEMO = [
  {
    role: 'superadmin' as UserRole,
    nom: 'Fred Mbaï',
    titre: 'Concepteur & Super Admin',
    identifiant: 'fred.mbai',
    motDePasse: 'daro2025',
    poste: 'Console Centrale Super Admin Réseau',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  {
    role: 'directeur' as UserRole,
    nom: 'Dr. Haroun Mahamat',
    titre: 'Directeur Général CME',
    identifiant: 'directeur',
    motDePasse: 'daro2025',
    poste: 'Bureau Direction Médicale',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  },
  {
    role: 'medecin' as UserRole,
    nom: 'Dr. Kaltouma Djibrine',
    titre: 'Médecin Praticien',
    identifiant: 'dr.djibrine',
    motDePasse: 'daro2025',
    poste: 'Cabinet Consultation Médicale 01',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
  },
  {
    role: 'infirmier' as UserRole,
    nom: 'Moussa Saleh',
    titre: 'Infirmier Major / Triage',
    identifiant: 'm.saleh',
    motDePasse: 'daro2025',
    poste: 'Box Triage Urgences & Constantes',
    badgeColor: 'bg-teal-100 text-teal-900 border-teal-300',
  },
  {
    role: 'accueil' as UserRole,
    nom: 'Fatimé Senoussi',
    titre: 'Accueil & Caisse',
    identifiant: 'accueil',
    motDePasse: 'daro2025',
    poste: 'Guichet Accueil, Admissions & Caisse',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
  },
];

export const WorkstationLoginModal: React.FC<WorkstationLoginModalProps> = ({
  isOpen,
  onClose,
  isLockScreen = false,
}) => {
  const {
    currentUser,
    connecterPoste,
    currentEtablissement,
    isWorkstationLocked,
    setIsWorkstationLocked,
  } = useClinic();

  const [identifiant, setIdentifiant] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [posteNom, setPosteNom] = useState(
    currentUser?.posteActif || 'Cabinet Consultation Médicale 01'
  );
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [switchMode, setSwitchMode] = useState(false);

  // If opening in lockscreen mode, prefill current user's identifiant
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setMotDePasse('');
      if (isLockScreen && !switchMode) {
        setIdentifiant(currentUser.nomUtilisateur || currentUser.email);
        if (currentUser.posteActif) {
          setPosteNom(currentUser.posteActif);
        }
      }
    }
  }, [isOpen, isLockScreen, currentUser, switchMode]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = connecterPoste(identifiant, motDePasse, posteNom);
      setIsLoading(false);
      if (!result.success) {
        setErrorMsg(result.error || 'Identifiant ou mot de passe incorrect.');
      } else {
        setIsWorkstationLocked(false);
        setSwitchMode(false);
        onClose();
      }
    }, 400);
  };

  const fillCredentials = (demo: typeof COMPTES_DEMO[0]) => {
    setIdentifiant(demo.identifiant);
    setMotDePasse(demo.motDePasse);
    setPosteNom(demo.poste);
    setErrorMsg(null);
    setSwitchMode(true);
  };

  const isCurrentLockedView = isLockScreen && !switchMode;

  return (
    <div
      id="workstation-login-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        // Only allow closing by backdrop click if not strictly locked
        if (!isWorkstationLocked && e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        id="workstation-login-dialog"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-lg overflow-hidden flex flex-col my-auto animate-scaleUp"
      >
        {/* Banner Top */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-blue-900 text-white p-5 sm:p-6 relative">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                {isCurrentLockedView ? (
                  <Lock className="w-6 h-6 text-amber-300 animate-pulse" />
                ) : (
                  <Shield className="w-6 h-6 text-sky-300" />
                )}
              </div>
              <div>
                <span className="text-[11px] font-bold tracking-wider uppercase text-sky-300 block">
                  Sécurité Hospitalière & Accès Poste
                </span>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                  {isCurrentLockedView
                    ? 'Poste de Travail Verrouillé'
                    : 'Authentification au Poste'}
                </h2>
              </div>
            </div>

            {!isWorkstationLocked && (
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <p className="text-xs text-slate-300 mt-3 leading-relaxed">
            {isCurrentLockedView
              ? 'Ce poste a été verrouillé pour protéger les données médicales confidentielles des patients. Veuillez saisir votre mot de passe pour reprendre votre session.'
              : 'Chaque soignant doit s\'authentifier avec son nom d\'utilisateur et son mot de passe pour enregistrer sa prise de poste.'}
          </p>

          <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-sky-200/90 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
            <Hospital className="w-4 h-4 text-sky-300 shrink-0" />
            <span className="truncate">
              {currentEtablissement?.nom || 'Clinique Médicale Espoir (N\'Djamena)'}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* If strictly locked screen for currentUser */}
          {isCurrentLockedView ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3.5">
              <img
                src={
                  currentUser.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
                }
                alt={currentUser.nom}
                className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow ring-2 ring-sky-500/30 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800 truncate">
                    {currentUser.prenom} {currentUser.nom}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-sky-100 text-sky-800">
                    {currentUser.role.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {currentUser.specialite || 'Personnel Soignant'}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium mt-1">
                  <Monitor className="w-3 h-3 text-slate-400" />
                  <span className="truncate">{posteNom}</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Workstation Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-sky-600" />
                  Sélectionner votre Poste de Travail :
                </label>
                <select
                  value={posteNom}
                  onChange={(e) => setPosteNom(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-sky-500 focus:bg-white focus:outline-none"
                >
                  {POSTES_DISPONIBLES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Username Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-sky-600" />
                  Nom d'utilisateur ou Email Professionnel :
                </label>
                <input
                  type="text"
                  required
                  value={identifiant}
                  onChange={(e) => setIdentifiant(e.target.value)}
                  placeholder="Ex: fred.mbai ou fredmbaiamne@gmail.com"
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </>
          )}

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-sky-600" />
                Mot de passe de session :
              </label>
              <span className="text-[11px] text-slate-400">
                Par défaut : <code className="bg-slate-100 px-1 py-0.5 rounded text-sky-700 font-mono">daro2025</code>
              </span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                placeholder="Entrez votre mot de passe"
                className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error message */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            id="btn-submit-workstation-login"
            type="submit"
            disabled={isLoading || !motDePasse}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              'Vérification en cours...'
            ) : isCurrentLockedView ? (
              <>
                <Unlock className="w-4 h-4" />
                Déverrouiller le Poste
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4" />
                Ouvrir la Session au Poste
              </>
            )}
          </button>

          {/* Switch User option when locked */}
          {isCurrentLockedView && (
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setSwitchMode(true);
                  setIdentifiant('');
                  setMotDePasse('');
                  setErrorMsg(null);
                }}
                className="text-xs font-semibold text-sky-700 hover:text-sky-900 underline transition inline-flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                Se connecter avec un autre utilisateur
              </button>
            </div>
          )}

          {/* Quick Demo Credentials Helper */}
          <div className="pt-3 border-t border-slate-100">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Raccourcis Démo (cliquez pour pré-remplir le compte) :
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMPTES_DEMO.map((c) => (
                <button
                  key={c.identifiant}
                  type="button"
                  onClick={() => fillCredentials(c)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition hover:scale-105 text-left flex items-center gap-1 ${c.badgeColor}`}
                  title={`${c.nom} (${c.titre}) - Identifiant: ${c.identifiant}`}
                >
                  <span className="font-bold">{c.nom}</span>
                  <span className="text-[9px] opacity-75 font-mono">({c.identifiant})</span>
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
