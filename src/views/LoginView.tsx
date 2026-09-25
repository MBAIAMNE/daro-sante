import React, { useState, useMemo, useEffect } from 'react';
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  User,
  UserPlus,
  Heart,
  Phone,
  MapPin,
  Calendar,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Droplet,
  QrCode,
  Shield,
  ShieldCheck,
  ShieldAlert,
  BookOpen,
  Building2,
  Globe2,
  Stethoscope,
  Activity,
  FileText,
  Clock,
  ChevronDown,
  Info,
  Search,
  Check,
  Award,
  Users,
  AlertTriangle,
  Database,
  KeyRound,
  Hospital,
  X,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { GroupeSanguin, Patient, UserRole } from '../types';
import { UserGuideBookView } from './UserGuideBookView';
import {
  africanDoctorClinic,
  africanFemaleDoctor,
  africanMotherChild,
  africanPatientId,
  africanDoctorTeam,
} from '../assets/africanImages';

interface LoginViewProps {
  onSuccess?: () => void;
}

const NDJAMENA_QUARTIERS = [
  'Sabangali',
  'Chagoua',
  'Moursal',
  'Farcha',
  'Walia',
  'Paris-Congo',
  'Diguel',
  "N'Djari",
  'Dembé',
  'Amriguébé',
  'Ridina',
  'Ardep-Djoumal',
  'Gassi',
  'Gardolé',
  'Atrona',
  'Boutalbagar',
];

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const {
    login,
    loginPatient,
    creerComptePatient,
    etablissements,
    allPatients,
    allUsers,
  } = useClinic();

  // Mode principal : 'login' (la boîte épurée fidèle à la capture utilisateur) | 'espace_sante' (présentation africaine valorisante)
  const [viewMode, setViewMode] = useState<'login' | 'espace_sante'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('daro_login_mode');
      if (saved === 'espace_sante' || saved === 'login') return saved;
    }
    return 'login';
  });

  // Formulaire Staff (Connexion gestion clinique sécurisée)
  const [identifiant, setIdentifiant] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [showGuideModal, setShowGuideModal] = useState(false);

  useEffect(() => {
    if (lockoutTime <= 0) return;
    const interval = setInterval(() => {
      setLockoutTime(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutTime]);

  // Espace Santé : onglet actif ('connexion_patient' | 'creer_pass')
  const [patientTab, setPatientTab] = useState<'connexion_patient' | 'creer_pass'>('connexion_patient');

  // Connexion Patient sécurisée (sans affichage public des dossiers d'autrui)
  const [patientIdentifiantInput, setPatientIdentifiantInput] = useState('');
  const [patientPinInput, setPatientPinInput] = useState('');
  const [showPatientPin, setShowPatientPin] = useState(false);

  // Création nouveau Pass Santé Patient rattaché à un établissement agréé
  const [regEtablissementId, setRegEtablissementId] = useState<string>(() => etablissements[0]?.id || 'etab-1');

  const [regNom, setRegNom] = useState('');
  const [regPrenom, setRegPrenom] = useState('');
  const [regTelephone, setRegTelephone] = useState('+235 ');
  const [regEmail, setRegEmail] = useState('');
  const [regDateNaissance, setRegDateNaissance] = useState('');
  const [regSexe, setRegSexe] = useState<'M' | 'F'>('M');
  const [regQuartier, setRegQuartier] = useState('');
  const [regGroupeSanguin, setRegGroupeSanguin] = useState<GroupeSanguin>('Inconnu');
  const [regElectrophorese, setRegElectrophorese] = useState<string>('');
  const [regContactNom, setRegContactNom] = useState('');
  const [regContactTel, setRegContactTel] = useState('');
  const [regContactRel, setRegContactRel] = useState('');
  const [regAllergies, setRegAllergies] = useState('');
  const [regMaladies, setRegMaladies] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPin, setRegPin] = useState('');
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Détection dynamique et instantanée de l'établissement du personnel soignant
  const autoMatchedUser = useMemo(() => {
    const clean = identifiant.trim().toLowerCase();
    if (!clean) return null;

    const found = allUsers.find(u => {
      const emailM = u.email.toLowerCase() === clean;
      const userM = Boolean(u.nomUtilisateur && u.nomUtilisateur.toLowerCase() === clean);
      const idM = u.id.toLowerCase() === clean;
      const lastNameM = u.nom.toLowerCase() === clean;
      const firstNameM = u.prenom.toLowerCase() === clean;
      const fullM = `${u.prenom}.${u.nom}`.toLowerCase() === clean;
      return emailM || userM || idM || lastNameM || firstNameM || fullM;
    });

    if (found) {
      const etab = etablissements.find(e => e.id === found.etablissementId);
      return {
        nom: `${found.prenom} ${found.nom}`,
        role: found.role,
        etabNom: etab?.nom || found.etablissementNom || 'Réseau Central DARÔ',
        etabId: found.etablissementId || 'all',
      };
    }

    return null;
  }, [identifiant, allUsers, etablissements]);

  // Connexion Staff sécurisée avec protection anti-brute force
  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTime > 0) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = login(identifiant.trim(), motDePasse.trim());
      setIsLoading(false);

      if (!result.success) {
        const nextFails = failedAttempts + 1;
        setFailedAttempts(nextFails);
        if (nextFails >= 5) {
          setLockoutTime(60);
          setErrorMsg(
            'BOUCLIER ANTI-INTRUSION ACTIF : 5 tentatives infructueuses consécutives. Ce poste est temporairement verrouillé pendant 60 secondes pour parer toute attaque.'
          );
        } else {
          setErrorMsg(
            `${result.error || 'Identifiant ou mot de passe incorrect.'} (Sécurité : ${5 - nextFails} essai(s) restant(s))`
          );
        }
      } else {
        setFailedAttempts(0);
        setLockoutTime(0);
        const etabName = result.user?.etablissementNom || 'votre établissement';
        setSuccessMsg(`Accès autorisé • Bienvenue à « ${etabName} »`);
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 300);
      }
    }, 250);
  };

  // Connexion Patient STRICTE & SÉCURISÉE (protège la vie privée de tous)
  const handlePatientSecureLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanId = patientIdentifiantInput.trim();
    const cleanPin = patientPinInput.trim();

    if (!cleanId) {
      setErrorMsg('Veuillez renseigner votre numéro de téléphone ou votre matricule.');
      return;
    }
    if (!cleanPin) {
      setErrorMsg('Veuillez renseigner votre code PIN ou mot de passe confidentiel.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = loginPatient(cleanId, cleanPin);
      setIsLoading(false);

      if (!res.success) {
        setErrorMsg(res.error || 'Identifiants ou Code PIN incorrects.');
      } else {
        setSuccessMsg(`Bienvenue ${res.patient?.prenom} • Accès autorisé à votre carnet.`);
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 300);
      }
    }, 250);
  };

  // Création d'un nouveau Pass Santé Patient rattaché à une clinique agréée
  const handlePatientRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!regNom.trim() || !regPrenom.trim()) {
      setErrorMsg('Veuillez renseigner votre nom et prénom.');
      return;
    }
    if (!regTelephone.trim() || regTelephone.trim().length < 8) {
      setErrorMsg('Veuillez renseigner un numéro de téléphone valide.');
      return;
    }
    if (!regPin.trim() || regPin.trim().length < 4) {
      setErrorMsg('Veuillez définir un code PIN à 4 chiffres pour sécuriser votre accès.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const allergiesArr = regAllergies
        ? regAllergies.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      const maladiesArr = regMaladies
        ? regMaladies.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const chosenEtab = etablissements.find(e => e.id === regEtablissementId) || etablissements[0];
      const res = creerComptePatient({
        nom: regNom.trim().toUpperCase(),
        prenom: regPrenom.trim(),
        telephone: regTelephone.trim(),
        email: regEmail.trim() || undefined,
        dateNaissance: regDateNaissance || '',
        sexe: regSexe,
        quartier: regQuartier.trim() || undefined,
        groupeSanguin: regGroupeSanguin,
        electrophoreseHb: regElectrophorese.trim() || undefined,
        contactUrgenceNom: regContactNom.trim() || undefined,
        contactUrgenceTel: regContactTel.trim() || undefined,
        contactUrgenceRelation: regContactRel.trim() || undefined,
        allergies: allergiesArr,
        maladiesChroniques: maladiesArr,
        motDePasse: regPassword.trim() || regPin.trim() || '',
        codePin: regPin.trim() || undefined,
        etablissementId: chosenEtab?.id || 'etab-1',
        etablissementNom: chosenEtab?.nom || 'Clinique Médicale Espoir',
      });

      setIsLoading(false);
      if (!res.success) {
        setErrorMsg(res.error || 'Erreur lors de la création du Pass Santé.');
      } else {
        setSuccessMsg('Pass Santé créé avec succès !');
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 350);
      }
    }, 300);
  };

  // =========================================================================
  // VUE 1 : LOGIN ÉPURÉ FIDÈLE À LA MAQUETTE UTILISATEUR
  // =========================================================================
  if (viewMode === 'login') {
    return (
      <div
        id="login-view-screen"
        className="w-full min-h-screen h-full flex flex-col justify-center items-center p-4 relative overflow-y-auto"
        style={{
          background: 'linear-gradient(145deg, #1868ac 0%, #104e88 50%, #0a3460 100%)',
        }}
      >
        {/* CARTE BLANCHE CENTRÉE FIDÈLE À LA MAQUETTE */}
        <div className="w-full max-w-[420px] bg-white rounded-[26px] shadow-2xl p-7 sm:p-9 text-slate-900 relative animate-in fade-in zoom-in-95 duration-200">
          {/* Titre & Sous-titre */}
          <div className="text-center mb-6">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0B3C5D] tracking-wide">
              DARÔ
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Gestion de clinique
            </p>
          </div>

          {/* Alertes d'état */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Alerte Verrouillage Anti-Intrusion (Force Brute) */}
          {lockoutTime > 0 && (
            <div className="mb-4 p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs font-medium space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-rose-800 text-sm">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 animate-bounce" />
                <span>Poste Verrouillé • Bouclier Anti-Intrusion</span>
              </div>
              <p>
                Suite à 5 échecs consécutifs, ce poste est temporairement consigné pendant{' '}
                <span className="font-bold text-rose-700 underline text-sm">{lockoutTime} seconde(s)</span>{' '}
                pour prévenir toute tentative de piratage.
              </p>
            </div>
          )}

          {/* FORMULAIRE CONNEXION STAFF HABILITÉ */}
          <form onSubmit={handleStaffSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email ou identifiant hospitalier
                </label>
                <input
                  type="text"
                  required
                  disabled={lockoutTime > 0}
                  autoFocus
                  value={identifiant}
                  onChange={e => {
                    setIdentifiant(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="prenom.nom@hopital.td ou nom d'utilisateur"
                  className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl bg-[#EEF4FF] border border-transparent focus:border-sky-400 focus:bg-white focus:outline-none text-sm font-medium text-slate-800 transition disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={lockoutTime > 0}
                    value={motDePasse}
                    onChange={e => {
                      setMotDePasse(e.target.value);
                      setErrorMsg(null);
                    }}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 sm:py-3 pr-10 rounded-xl bg-[#EEF4FF] border border-transparent focus:border-sky-400 focus:bg-white focus:outline-none text-sm font-medium text-slate-800 transition disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || lockoutTime > 0}
                className="w-full py-3 px-4 bg-[#0B3C5D] hover:bg-[#08293f] active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer mt-2 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isLoading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                <span>
                  {lockoutTime > 0
                    ? `Verrouillé (${lockoutTime}s)`
                    : isLoading
                    ? 'Vérification en cours...'
                    : 'Se connecter'}
                </span>
              </button>

              {/* Bouton vers l'Espace Patient / Client comme sur la maquette */}
              <div className="text-center pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setViewMode('espace_sante');
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 text-amber-900 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5 text-amber-700" />
                  <span>Vous êtes un patient ? Cliquez ici pour l'Espace Santé</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowGuideModal(true)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                  <span>Consulter le Guide d'Utilisation & Manuel Hospitalier</span>
                </button>
              </div>

              {/* Note de sécurité sur l'attribution des accès soignants */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-center text-[11px] leading-relaxed flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Accès réglementé :</strong> Les comptes soignants sont créés et attribués exclusivement par la Direction ou l'Administrateur.
                </span>
              </div>

              {/* Version & Sécurité */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 font-medium text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Forteresse de Sécurité Active
                </span>
                <span>DARÔ Santé v2.5</span>
              </div>
            </form>
          </div>
        </div>
      );
    }

  // =========================================================================
  // VUE 2 : ESPACE SANTÉ CITOYEN & PRÉSENTATION HUMAINE DE DARÔ
  // =========================================================================
  return (
    <div
      id="espace-sante-citoyen-daro"
      className="min-h-screen w-full bg-[#FAF8F5] text-slate-800 flex flex-col justify-between selection:bg-amber-100 selection:text-amber-900"
    >
      {/* 1. EN-TÊTE ÉLÉGANT AVEC RETOUR RAPIDE */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0B3C5D] to-[#1E88E5] flex items-center justify-center text-white font-black text-xl shadow-xs">
              D
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-[#0B3C5D]">DARÔ SANTÉ</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900">
                  Espace Citoyen
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium">
                Dossier Médical Partagé & Urgences Vitales au Tchad
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowGuideModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/70 text-xs font-bold transition cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-700" />
              <span>Guide & Livre DARÔ</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                setViewMode('login');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 text-xs font-bold transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Accès Professionnels de Santé</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. SECTION PRINCIPALE HERO */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 w-full space-y-12">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* COLONNE GAUCHE : PRÉSENTATION DE DARÔ SANTÉ AVEC VISUELS AFRICAINS */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Votre santé protégée partout à N'Djamena et au Tchad</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-[#0B3C5D] tracking-tight leading-[1.15]">
              Le carnet de santé numérique pensé pour{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#104e88] via-[#1E88E5] to-teal-600">
                nos familles
              </span>
            </h1>

            <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl font-normal">
              <strong>DARÔ</strong> (qui signifie <em>Refuge & Maison de Paix</em> en langue locale) garde en mémoire
              toutes vos ordonnances, vos bilans d'analyses et les vaccins de vos enfants. En cas d'accident ou de malaise,
              votre <strong>Pass Santé QR</strong> transmet instantanément votre groupe sanguin et vos allergies
              au SAMU 15 et aux urgences.
            </p>

            {/* GRANDE PHOTO IMMERSIVE D'UN SOIGNANT AFRICAIN BIENVEILLANT */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-stone-200 group bg-stone-900">
              <img
                src={africanDoctorClinic}
                alt="Médecin tchadien bienveillant dans sa clinique à N'Djamena"
                referrerPolicy="no-referrer"
                className="w-full h-72 sm:h-80 object-cover object-center opacity-95 group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-5 sm:p-6 text-white">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-bold mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Continuité des soins & urgences vitales</span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-stone-200 max-w-xl">
                  « Chaque minute compte aux urgences. Grâce au badge DARÔ, nos médecins connaissent le profil du patient
                  avant même l'arrivée de l'ambulance. »
                </p>
                <p className="text-[11px] text-stone-400 mt-1 font-semibold">
                  Dr. Haroun Mahamat • Clinique Médicale Espoir, N'Djamena
                </p>
              </div>
            </div>

            {/* 3 POINTS FORTS CLÉS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Zéro papier perdu</h4>
                  <p className="text-[11px] text-stone-500 leading-tight mt-0.5">Ordonnances toujours sur smartphone</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
                  <Droplet className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Groupe & Allergies</h4>
                  <p className="text-[11px] text-stone-500 leading-tight mt-0.5">Visible instantanément pour le SAMU 15</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Base Cloud Firebase</h4>
                  <p className="text-[11px] text-stone-500 leading-tight mt-0.5">Synchronisation inter-hôpitaux réelle</p>
                </div>
              </div>
            </div>
          </div>

          {/* COLONNE DROITE : GUICHET D'ACCÈS SÉCURISÉ PATIENT */}
          <div id="guichet-patient" className="lg:col-span-5 bg-white rounded-3xl shadow-xl border border-stone-200 p-6 sm:p-7 space-y-5">
            {/* Onglets clairs : Connexion Sécurisée ou Créer mon Pass */}
            <div className="flex rounded-xl bg-stone-100 p-1">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setPatientTab('connexion_patient');
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  patientTab === 'connexion_patient'
                    ? 'bg-white text-[#0B3C5D] shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Connexion sécurisée</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setPatientTab('creer_pass');
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  patientTab === 'creer_pass'
                    ? 'bg-white text-[#0B3C5D] shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Créer mon Pass Santé</span>
              </button>
            </div>

            {/* Alertes d'état */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* CONTENU ONGLET 1 : CONNEXION PATIENT SÉCURISÉE AVEC CODE PIN STRICT */}
            {patientTab === 'connexion_patient' && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200 text-sky-950 text-xs">
                  <p className="font-bold flex items-center gap-1.5 mb-0.5">
                    <ShieldCheck className="w-4 h-4 text-sky-700 shrink-0" />
                    <span>Confidentialité médicale garantie</span>
                  </p>
                  <p className="text-[11px] text-sky-800 leading-relaxed">
                    Votre dossier médical est strictement confidentiel. Seul le titulaire muni de son numéro de téléphone et de son Code PIN peut y accéder.
                  </p>
                </div>

                <form onSubmit={handlePatientSecureLogin} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Numéro de téléphone ou Matricule
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="text"
                        required
                        value={patientIdentifiantInput}
                        onChange={e => {
                          setPatientIdentifiantInput(e.target.value);
                          setErrorMsg(null);
                        }}
                        placeholder="ex: +235 66 28 14 90 ou NDJ-2025-0812"
                        className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-stone-50 border border-stone-300 focus:bg-white focus:border-[#1E88E5] focus:outline-none text-sm font-semibold text-stone-900 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-stone-700">
                        Code PIN (4 chiffres) ou Mot de passe
                      </label>
                      <span className="text-[10px] text-stone-400">PIN par défaut : 1234</span>
                    </div>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type={showPatientPin ? 'text' : 'password'}
                        required
                        value={patientPinInput}
                        onChange={e => {
                          setPatientPinInput(e.target.value);
                          setErrorMsg(null);
                        }}
                        placeholder="••••"
                        maxLength={20}
                        className="w-full pl-10 pr-10 py-3 rounded-xl bg-stone-50 border border-stone-300 focus:bg-white focus:border-[#1E88E5] focus:outline-none text-sm font-semibold text-stone-900 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPatientPin(!showPatientPin)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition cursor-pointer"
                      >
                        {showPatientPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-[#0B3C5D] hover:bg-[#08293f] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )}
                    <span>Accéder à mon Pass Santé sécurisé</span>
                  </button>
                </form>

                <div className="pt-2 text-center">
                  <p className="text-[11px] text-stone-500">
                    Pas encore de Pass Santé ?{' '}
                    <button
                      type="button"
                      onClick={() => setPatientTab('creer_pass')}
                      className="font-bold text-[#0B3C5D] hover:underline cursor-pointer"
                    >
                      Créez votre dossier gratuitement
                    </button>
                  </p>
                </div>
              </div>
            )}

            {/* CONTENU ONGLET 2 : CRÉATION D'UN NOUVEAU PASS SANTÉ EN LIGNE */}
            {patientTab === 'creer_pass' && (
              <form onSubmit={handlePatientRegisterSubmit} className="space-y-3.5">
                {/* Choix de la Clinique Partenaire */}
                <div className="p-3 rounded-2xl bg-blue-50/90 border border-blue-200 text-xs text-blue-950 space-y-1.5">
                  <p className="font-bold flex items-center gap-1.5 text-blue-900">
                    <Building2 className="w-4 h-4 text-blue-700" />
                    <span>Clinique ou Hôpital Partenaire de rattachement *</span>
                  </p>
                  <select
                    value={regEtablissementId}
                    onChange={e => setRegEtablissementId(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl bg-white border border-blue-300 text-xs font-bold text-stone-800"
                  >
                    {etablissements.map(etab => (
                      <option key={etab.id} value={etab.id}>
                        {etab.nom} ({etab.ville || "N'Djamena"})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-blue-700/80">
                    Votre dossier médical sera rattaché à cet établissement et accessible par ses équipes médicales.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Nom de famille *</label>
                    <input
                      type="text"
                      required
                      value={regNom}
                      onChange={e => setRegNom(e.target.value)}
                      placeholder="Mahamat"
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Prénom *</label>
                    <input
                      type="text"
                      required
                      value={regPrenom}
                      onChange={e => setRegPrenom(e.target.value)}
                      placeholder="Fatima"
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Date de Naissance (Optionnel)</label>
                    <input
                      type="date"
                      value={regDateNaissance}
                      onChange={e => setRegDateNaissance(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs font-semibold text-stone-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Sexe</label>
                    <select
                      value={regSexe}
                      onChange={e => setRegSexe(e.target.value as 'M' | 'F')}
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs font-semibold text-stone-800"
                    >
                      <option value="M">Masculin (Homme)</option>
                      <option value="F">Féminin (Femme)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Téléphone *</label>
                    <input
                      type="tel"
                      required
                      value={regTelephone}
                      onChange={e => setRegTelephone(e.target.value)}
                      placeholder="+235 66 00 00 00"
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs font-semibold text-stone-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Groupe Sanguin</label>
                    <select
                      value={regGroupeSanguin}
                      onChange={e => setRegGroupeSanguin(e.target.value as GroupeSanguin)}
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs font-semibold text-stone-800"
                    >
                      <option value="Inconnu">Je ne connais pas mon groupe (À déterminer)</option>
                      <option value="O+">O+</option>
                      <option value="A+">A+</option>
                      <option value="B+">B+</option>
                      <option value="AB+">AB+</option>
                      <option value="O-">O-</option>
                      <option value="A-">A-</option>
                      <option value="B-">B-</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Quartier (N'Djamena)</label>
                    <select
                      value={regQuartier}
                      onChange={e => setRegQuartier(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs font-semibold text-stone-800"
                    >
                      <option value="">-- Non renseigné / Autre --</option>
                      {NDJAMENA_QUARTIERS.map(q => (
                        <option key={q} value={q}>{q}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Code PIN Secret (4 chiffres) *</label>
                    <input
                      type="password"
                      required
                      maxLength={6}
                      value={regPin}
                      onChange={e => setRegPin(e.target.value)}
                      placeholder="Ex: 4 chiffres"
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs font-mono font-bold text-stone-800"
                    />
                  </div>
                </div>

                {/* Section optionnelle d'urgence */}
                <div className="pt-2 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => setShowOptionalFields(!showOptionalFields)}
                    className="w-full py-1.5 px-3 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center justify-between transition cursor-pointer"
                  >
                    <span>Informations d'urgence & médicales (Optionnel)</span>
                    <span className="text-[10px] text-stone-500 font-mono">
                      {showOptionalFields ? '▲ Réduire' : '▼ Compléter si connu'}
                    </span>
                  </button>

                  {showOptionalFields && (
                    <div className="mt-3 space-y-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200">
                      <p className="text-[11px] text-stone-500 italic">
                        Laissez vide si vous n'avez pas ces informations. Aucune donnée fictive ne sera ajoutée.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Contact d'urgence (Nom)</label>
                          <input
                            type="text"
                            value={regContactNom}
                            onChange={e => setRegContactNom(e.target.value)}
                            placeholder="Ex: Brahim Mahamat"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-stone-300 text-xs font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Téléphone d'urgence</label>
                          <input
                            type="tel"
                            value={regContactTel}
                            onChange={e => setRegContactTel(e.target.value)}
                            placeholder="Ex: +235 66 12 34 56"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-stone-300 text-xs font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Lien de parenté</label>
                          <input
                            type="text"
                            value={regContactRel}
                            onChange={e => setRegContactRel(e.target.value)}
                            placeholder="Ex: Frère, Époux, Parent"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-stone-300 text-xs font-medium"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Électrophorèse Hb (Drépanocytose)</label>
                          <select
                            value={regElectrophorese}
                            onChange={e => setRegElectrophorese(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-stone-300 text-xs font-medium"
                          >
                            <option value="">Non dépisté / Je ne sais pas</option>
                            <option value="AA">AA (Phénotype normal)</option>
                            <option value="AS">AS (Porteur sain)</option>
                            <option value="SS">SS (Drépanocytose majeure)</option>
                            <option value="AC">AC</option>
                            <option value="SC">SC</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Allergies connues</label>
                          <input
                            type="text"
                            value={regAllergies}
                            onChange={e => setRegAllergies(e.target.value)}
                            placeholder="Ex: Pénicilline, Arachides..."
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-stone-300 text-xs font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-teal-50/80 border border-teal-200 text-teal-900 text-xs">
                  <span className="font-bold">Pass Santé Sécurisé :</span> Vos informations réelles permettront aux médecins et secouristes d'accéder à vos antécédents médicaux sans aucune supposition erronée.
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer mt-2 flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Génération de votre Pass...' : 'Générer mon Pass Santé DARÔ'}
                </button>
              </form>
            )}
          </div>
        </section>

        {/* 3. SECTION VISUELLE : LA VRAIE CARTE VIRTUELLE "PASS SANTÉ DARÔ" */}
        <section className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-sm space-y-8">
          <div className="max-w-3xl mx-auto text-center space-y-2">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
              Innovation Sanitaire Nationale
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B3C5D]">
              Votre Carte Pass Santé Numérique
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              Un identifiant médical unique pour chaque citoyen tchadien, consultable à tout moment sur mobile.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Simulation graphique soignée de la carte vitale */}
            <div className="lg:col-span-6 flex justify-center">
              <div
                className="w-full max-w-sm rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden border border-white/20"
                style={{
                  background: 'linear-gradient(135deg, #0B3C5D 0%, #154c79 50%, #08293f 100%)',
                }}
              >
                {/* Liseré aux couleurs nationales du Tchad */}
                <div className="absolute top-0 left-0 right-0 h-1.5 flex">
                  <div className="flex-1 bg-blue-600" />
                  <div className="flex-1 bg-amber-400" />
                  <div className="flex-1 bg-red-600" />
                </div>

                <div className="flex items-center justify-between mt-2 mb-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                      RÉPUBLIQUE DU TCHAD
                    </p>
                    <p className="text-xs font-bold text-stone-200">PASS SANTÉ CITOYEN</p>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center font-black text-xs text-white">
                    DARÔ
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={africanPatientId}
                    alt="Photo patient tchadien"
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-300/80 shadow-md shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-black tracking-wide text-white">OUSMANE ABDELKERIM</p>
                    <p className="text-[11px] font-mono text-stone-300">MAT : NDJ-2025-0812</p>
                    <div className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-md bg-rose-500/30 border border-rose-400/40 text-[10px] font-black text-rose-200">
                      <span>GROUPE : O- (Rhésus Négatif)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-stone-300 font-medium">
                  <div>
                    <span className="text-stone-400 block text-[9px]">ÉTABLISSEMENT ATTACHÉ</span>
                    <span className="font-bold text-white">Clinique Médicale Espoir</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-white text-slate-950 flex items-center justify-center">
                    <QrCode className="w-7 h-7" />
                  </div>
                </div>
              </div>
            </div>

            {/* Explications des usages concrets */}
            <div className="lg:col-span-6 space-y-4 text-stone-700 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm mb-0.5">En cas d'urgence avec le SAMU 15</h4>
                  <p className="text-stone-600 text-xs leading-relaxed">
                    Les ambulanciers et secouristes scannent le QR Code de votre carte pour connaître votre groupe sanguin,
                    vos allergies sévères et les personnes à prévenir en priorité.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm mb-0.5">Lors de vos consultations médicales</h4>
                  <p className="text-stone-600 text-xs leading-relaxed">
                    Votre médecin traitant retrouve directement vos anciens comptes-rendus, vos radiographies et
                    l'historique de vos ordonnances sans avoir besoin de dossiers papier encombrants.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm mb-0.5">Santé pédiatrique & des mères</h4>
                  <p className="text-stone-600 text-xs leading-relaxed">
                    Enregistrez les vaccinations de vos enfants (Fièvre Jaune, Méningite, Hépatite B) avec alertes de rappel
                    automatiques.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. GALERIE DE PHOTOGRAPHIES AFRICAINES AUTHENTIQUES */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-[#0B3C5D]">
              Une médecine humaine, moderne et proche de vous
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Des professionnels de santé engagés au quotidien dans les structures de N'Djamena.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Photo 1 : Médecin africain bienveillant */}
            <div className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm group">
              <div className="h-56 overflow-hidden relative">
                <img
                  src={africanDoctorTeam}
                  alt="Équipe médicale de médecins africains qualifiés"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                  Consultation Médicale
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-sm text-stone-900 mb-1">Médecins Spécialistes Qualifiés</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Des praticiens à votre écoute pour des diagnostics précis et un suivi rigoureux de vos pathologies chroniques.
                </p>
              </div>
            </div>

            {/* Photo 2 : Mère et enfant africains */}
            <div className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm group">
              <div className="h-56 overflow-hidden relative">
                <img
                  src={africanMotherChild}
                  alt="Mère et enfant tchadiens en bonne santé"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                  Santé Maternelle
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-sm text-stone-900 mb-1">Protection Mère & Enfant</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Suivi de grossesse, consultations néonatales et carnet vaccinal dématérialisé pour la sécurité de vos tout-petits.
                </p>
              </div>
            </div>

            {/* Photo 3 : Soignante en blouse */}
            <div className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm group">
              <div className="h-56 overflow-hidden relative">
                <img
                  src={africanFemaleDoctor}
                  alt="Doctoresse tchadienne bienveillante en consultation"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                  Urgences & Soins
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-sm text-stone-900 mb-1">Disponibilité & Proximité</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Interconnexion continue avec les services de garde, les pharmacies de permanence et les laboratoires.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. ÉTABLISSEMENTS DE SANTÉ PARTENAIRES À N'DJAMENA */}
        <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0B3C5D] via-[#104e88] to-[#1E88E5] text-white shadow-lg space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left space-y-1 max-w-xl">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                Réseau de Santé Connecté
              </span>
              <h3 className="text-xl sm:text-2xl font-black">
                Les structures médicales connectées à DARÔ Santé
              </h3>
              <p className="text-xs text-stone-200">
                Sélectionnez votre structure médicale partenaire pour vous inscrire ou accéder à votre dossier.
                L'accréditation et l'enregistrement de nouveaux établissements relèvent exclusivement de l'Administration Générale.
              </p>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-stone-200 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Établissements homologués & agréés</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {etablissements.map(etab => (
              <div
                key={etab.id}
                className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col justify-between space-y-3 hover:bg-white/15 transition group"
              >
                <div className="space-y-1 text-center">
                  <Building2 className="w-6 h-6 mx-auto text-amber-300 mb-1" />
                  <p className="font-bold text-xs text-white leading-tight">{etab.nom}</p>
                  <p className="text-[10px] text-stone-300">{etab.ville || "N'Djamena"}</p>
                  {etab.telephone && (
                    <p className="text-[10px] text-sky-200/80 font-mono">{etab.telephone}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setRegEtablissementId(etab.id);
                    setPatientTab('creer_pass');
                    const targetEl = document.getElementById('guichet-patient');
                    if (targetEl) {
                      targetEl.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="w-full py-1.5 px-2.5 rounded-lg bg-white/20 hover:bg-white text-white hover:text-[#0B3C5D] text-[11px] font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>S'inscrire directement ici</span>
                </button>
              </div>
            ))}
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setViewMode('login');
              }}
              className="px-6 py-3 bg-white text-[#0B3C5D] font-black text-xs sm:text-sm rounded-xl hover:bg-stone-100 shadow-md transition cursor-pointer"
            >
              Retourner à l'Accès Professionnels de Santé →
            </button>
          </div>
        </section>
      </main>

      {/* 7. MODAL LIVRE & GUIDE D'UTILISATION OFFICIEL */}
      {showGuideModal && (
        <UserGuideBookView isModal onClose={() => setShowGuideModal(false)} />
      )}

      {/* 6. PIED DE PAGE CITOYEN */}
      <footer className="border-t border-stone-200 bg-white py-6 px-4 text-center text-xs text-stone-500 space-y-1">
        <p className="font-semibold text-stone-700">
          DARÔ Santé Tchad • Conçu pour la protection et la dignité des patients tchadiens
        </p>
        <p className="text-[11px] text-stone-400">
          Plateforme cloud interconnectée à Firebase Firestore • Clinique Médicale Espoir & Réseau National
        </p>
      </footer>
    </div>
  );
};
