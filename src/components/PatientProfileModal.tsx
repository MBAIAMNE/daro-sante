import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  Upload,
  User as UserIcon,
  Mail,
  Phone,
  Heart,
  AlertTriangle,
  Calendar,
  MapPin,
  CheckCircle2,
  Sparkles,
  Trash2,
  ShieldCheck,
  Activity,
  UserCheck,
  Shield,
  FileCheck,
  Lock,
  Key,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { Patient, GroupeSanguin, AssuranceInfo } from '../types';

interface PatientProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientToEdit?: Patient | null;
  onSaved?: (updated: Patient) => void;
}

// Curated high quality patient avatars for quick selection
const PATIENT_AVATAR_PRESETS = [
  {
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
    label: 'Homme Adulte',
  },
  {
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    label: 'Femme Adulte',
  },
  {
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    label: 'Jeune Femme',
  },
  {
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    label: 'Homme Souriant',
  },
  {
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    label: 'Aîné / Senior',
  },
  {
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
    label: 'Jeune Homme',
  },
  {
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    label: 'Mère de Famille',
  },
  {
    url: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&auto=format&fit=crop&q=80',
    label: 'Portrait Simple',
  },
];

const GROUPES_SANGUINS: GroupeSanguin[] = ['Inconnu', 'O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'];

export const PatientProfileModal: React.FC<PatientProfileModalProps> = ({
  isOpen,
  onClose,
  patientToEdit,
  onSaved,
}) => {
  const { activePatient, patients, modifierPatient } = useClinic();

  const targetPatient = patientToEdit || activePatient || patients[0];

  const [nom, setNom] = useState(targetPatient?.nom || '');
  const [prenom, setPrenom] = useState(targetPatient?.prenom || '');
  const [dateNaissance, setDateNaissance] = useState(targetPatient?.dateNaissance || '');
  const [sexe, setSexe] = useState<'M' | 'F'>(targetPatient?.sexe || 'M');
  const [telephone, setTelephone] = useState(targetPatient?.telephone || '');
  const [email, setEmail] = useState(targetPatient?.email || '');
  const [adresse, setAdresse] = useState(targetPatient?.adresse || '');
  const [avatar, setAvatar] = useState(targetPatient?.avatar || '');
  const [groupeSanguin, setGroupeSanguin] = useState<GroupeSanguin>(targetPatient?.groupeSanguin || 'Inconnu');
  const [allergiesInput, setAllergiesInput] = useState(targetPatient?.allergies?.join(', ') || '');
  const [maladiesInput, setMaladiesInput] = useState(targetPatient?.maladiesChroniques?.join(', ') || '');
  const [contactUrgenceNom, setContactUrgenceNom] = useState(targetPatient?.contactUrgenceNom || '');
  const [contactUrgenceTel, setContactUrgenceTel] = useState(targetPatient?.contactUrgenceTel || '');
  const [contactUrgenceRelation, setContactUrgenceRelation] = useState(targetPatient?.contactUrgenceRelation || '');

  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState<'photo' | 'identite' | 'urgence' | 'assurance' | 'securite'>('photo');

  // Sécurité & Mot de Passe Espace Patient
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('');
  const [confirmerMotDePasse, setConfirmerMotDePasse] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Assurance & Tiers-Payant state
  const [hasAssurance, setHasAssurance] = useState(targetPatient?.assurance?.adherent ?? false);
  const [assuranceOrganisme, setAssuranceOrganisme] = useState(targetPatient?.assurance?.organisme || 'CNPS Tchad');
  const [assuranceNumeroPolice, setAssuranceNumeroPolice] = useState(targetPatient?.assurance?.numeroPolice || '');
  const [assuranceMatricule, setAssuranceMatricule] = useState(targetPatient?.assurance?.matriculeAssure || '');
  const [assuranceTaux, setAssuranceTaux] = useState<number>(targetPatient?.assurance?.tauxCouverture || 80);
  const [assuranceQualite, setAssuranceQualite] = useState<'assure_principal' | 'conjoint' | 'enfant' | 'autre'>(targetPatient?.assurance?.qualiteAssure || 'assure_principal');
  const [assuranceNomPrincipal, setAssuranceNomPrincipal] = useState(targetPatient?.assurance?.nomAssurePrincipal || '');
  const [assuranceValidite, setAssuranceValidite] = useState(targetPatient?.assurance?.dateValidite || '2026-12-31');
  const [assurancePlafond, setAssurancePlafond] = useState<number>(targetPatient?.assurance?.plafondAnnuelFCFA || 2000000);
  const [assuranceTelAssureur, setAssuranceTelAssureur] = useState(targetPatient?.assurance?.contactAssureurTel || '');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state whenever the target patient changes
  useEffect(() => {
    if (targetPatient) {
      setNom(targetPatient.nom || '');
      setPrenom(targetPatient.prenom || '');
      setDateNaissance(targetPatient.dateNaissance || '');
      setSexe(targetPatient.sexe || 'M');
      setTelephone(targetPatient.telephone || '');
      setEmail(targetPatient.email || '');
      setAdresse(targetPatient.adresse || '');
      setAvatar(targetPatient.avatar || '');
      setGroupeSanguin(targetPatient.groupeSanguin || 'Inconnu');
      setAllergiesInput(targetPatient.allergies?.join(', ') || '');
      setMaladiesInput(targetPatient.maladiesChroniques?.join(', ') || '');
      setContactUrgenceNom(targetPatient.contactUrgenceNom || '');
      setContactUrgenceTel(targetPatient.contactUrgenceTel || '');
      setContactUrgenceRelation(targetPatient.contactUrgenceRelation || '');
      
      // Assurance sync
      setHasAssurance(targetPatient.assurance?.adherent ?? false);
      setAssuranceOrganisme(targetPatient.assurance?.organisme || 'CNPS Tchad');
      setAssuranceNumeroPolice(targetPatient.assurance?.numeroPolice || '');
      setAssuranceMatricule(targetPatient.assurance?.matriculeAssure || '');
      setAssuranceTaux(targetPatient.assurance?.tauxCouverture || 80);
      setAssuranceQualite(targetPatient.assurance?.qualiteAssure || 'assure_principal');
      setAssuranceNomPrincipal(targetPatient.assurance?.nomAssurePrincipal || '');
      setAssuranceValidite(targetPatient.assurance?.dateValidite || '2026-12-31');
      setAssurancePlafond(targetPatient.assurance?.plafondAnnuelFCFA || 2000000);
      setAssuranceTelAssureur(targetPatient.assurance?.contactAssureurTel || '');
    }
  }, [targetPatient]);

  if (!isOpen || !targetPatient) return null;

  // Handle local image file upload & convert to base64
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide (JPG, PNG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setAvatar(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const generateInitialsAvatar = () => {
    const p = (prenom || 'P').charAt(0).toUpperCase();
    const n = (nom || 'N').charAt(0).toUpperCase();
    const svg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%230ea5e9"/><text x="50%" y="54%" font-family="sans-serif" font-weight="bold" font-size="75" fill="white" dominant-baseline="middle" text-anchor="middle">${p}${n}</text></svg>`;
    setAvatar(svg);
  };

  const handleApplyCustomUrl = () => {
    if (customUrlInput.trim()) {
      setAvatar(customUrlInput.trim());
      setShowUrlInput(false);
      setCustomUrlInput('');
    }
  };

  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return targetPatient.age || 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let calculated = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      calculated--;
    }
    return calculated > 0 ? calculated : 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const allergiesList = allergiesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const maladiesList = maladiesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const ageCalculated = dateNaissance ? calculateAge(dateNaissance) : targetPatient.age;

    // Validation du mot de passe
    if (nouveauMotDePasse.trim()) {
      if (nouveauMotDePasse.trim().length < 4) {
        setPasswordError('Le nouveau mot de passe doit comporter au moins 4 caractères.');
        setActiveTab('securite');
        setIsSaving(false);
        return;
      }
      if (nouveauMotDePasse.trim() !== confirmerMotDePasse.trim()) {
        setPasswordError('La confirmation ne correspond pas au nouveau mot de passe saisi.');
        setActiveTab('securite');
        setIsSaving(false);
        return;
      }
    }
    setPasswordError(null);

    const assuranceData: AssuranceInfo | undefined = hasAssurance
      ? {
          adherent: true,
          organisme: assuranceOrganisme.trim() || 'CNPS Tchad',
          numeroPolice: assuranceNumeroPolice.trim() || undefined,
          matriculeAssure: assuranceMatricule.trim() || undefined,
          tauxCouverture: Number(assuranceTaux) || 80,
          qualiteAssure: assuranceQualite,
          nomAssurePrincipal: assuranceQualite !== 'assure_principal' ? assuranceNomPrincipal.trim() : undefined,
          dateValidite: assuranceValidite || '2026-12-31',
          statutPriseEnCharge: 'valide',
          plafondAnnuelFCFA: Number(assurancePlafond) || 2000000,
          montantConsommeFCFA: targetPatient.assurance?.montantConsommeFCFA || 0,
          tauxPharmacie: Math.max(0, (Number(assuranceTaux) || 80) - 10),
          tauxExamens: Number(assuranceTaux) || 80,
          tauxHospitalisation: Math.min(100, (Number(assuranceTaux) || 80) + 10),
          contactAssureurTel: assuranceTelAssureur.trim() || undefined,
        }
      : undefined;

    const isPasswordChanged = !!nouveauMotDePasse.trim();
    const finalPassword = isPasswordChanged ? nouveauMotDePasse.trim() : (targetPatient.motDePasse || 'patient2025');

    const updatedPatient: Patient = {
      ...targetPatient,
      nom: nom.trim(),
      prenom: prenom.trim(),
      dateNaissance,
      age: ageCalculated,
      sexe,
      telephone: telephone.trim(),
      email: email.trim() || undefined,
      adresse: adresse.trim(),
      avatar: avatar.trim() || undefined,
      groupeSanguin,
      allergies: allergiesList,
      maladiesChroniques: maladiesList,
      contactUrgenceNom: contactUrgenceNom.trim(),
      contactUrgenceTel: contactUrgenceTel.trim(),
      contactUrgenceRelation: contactUrgenceRelation.trim(),
      assurance: assuranceData,
      motDePasse: finalPassword,
      motDePasseModifie: isPasswordChanged ? true : !!targetPatient.motDePasseModifie,
      dateDerniereModifMDP: isPasswordChanged ? new Date().toISOString() : targetPatient.dateDerniereModifMDP,
    };

    try {
      modifierPatient(updatedPatient);
      setSaveSuccess(true);
      if (onSaved) {
        onSaved(updatedPatient);
      }
      setTimeout(() => {
        setSaveSuccess(false);
        setIsSaving(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
      setIsSaving(false);
    }
  };

  return (
    <div
      id="patient-profile-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="patient-profile-modal"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto"
      >
        {/* Header with gradient badge */}
        <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-sky-700 to-blue-800 text-white flex items-center justify-between gap-3 relative">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shrink-0">
              <Camera className="w-5 h-5 text-sky-200" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold truncate">
                Dossier & Photo du Patient
              </h3>
              <p className="text-xs text-sky-100/90 truncate">
                Matricule {targetPatient.matricule} • {targetPatient.prenom} {targetPatient.nom}
              </p>
            </div>
          </div>
          <button
            id="btn-close-patient-profile-modal"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition shrink-0"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation for small & large screens */}
        <div className="flex items-center border-b border-slate-200 px-4 sm:px-6 bg-slate-50 gap-2 overflow-x-auto text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => setActiveTab('photo')}
            className={`py-3 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'photo'
                ? 'border-sky-600 text-sky-700 font-bold bg-white -mb-[1px]'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Photo de profil
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('identite')}
            className={`py-3 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'identite'
                ? 'border-sky-600 text-sky-700 font-bold bg-white -mb-[1px]'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            Identité & Coordonnées
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('urgence')}
            className={`py-3 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'urgence'
                ? 'border-sky-600 text-sky-700 font-bold bg-white -mb-[1px]'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            Constantes & Urgences QR
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('assurance')}
            className={`py-3 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'assurance'
                ? 'border-sky-600 text-sky-700 font-bold bg-white -mb-[1px]'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-amber-500" />
            Assurance & Tiers-Payant
            {hasAssurance && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 ml-0.5" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('securite')}
            className={`py-3 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'securite'
                ? 'border-sky-600 text-sky-700 font-bold bg-white -mb-[1px]'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-sky-600" />
            Sécurité & Mot de Passe
            {targetPatient?.motDePasseModifie && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 ml-0.5" title="Mot de passe personnalisé" />
            )}
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: PHOTO MANAGEMENT */}
          {activeTab === 'photo' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                {/* Avatar Preview */}
                <div className="relative group shrink-0">
                  <img
                    src={
                      avatar ||
                      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80'
                    }
                    alt={nom}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shadow-md border-2 border-white ring-2 ring-sky-500/30"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition text-xs font-semibold gap-1"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Modifier</span>
                  </div>
                </div>

                <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="text-sm font-bold text-slate-800">
                      {prenom || 'Prénom'} {nom || 'Nom'}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-rose-100 text-rose-800">
                      {groupeSanguin && groupeSanguin !== 'Inconnu' ? `Groupe ${groupeSanguin}` : 'Groupe Inconnu / Non déterminé'}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      {sexe === 'M' ? 'Homme' : 'Femme'} • {dateNaissance ? `${calculateAge(dateNaissance)} ans` : `${targetPatient.age} ans`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Cette photo apparaîtra sur la Carte d'Urgence QR, le Passeport Santé et dans la liste des dossiers patients.
                  </p>

                  {/* Actions buttons */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Importer photo
                    </button>
                    <button
                      type="button"
                      onClick={generateInitialsAvatar}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition"
                      title="Générer un avatar graphique avec les initiales"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                      Initiales
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition"
                    >
                      Lien URL
                    </button>
                    {avatar && (
                      <button
                        type="button"
                        onClick={() => setAvatar('')}
                        className="inline-flex items-center gap-1 px-2 py-1.5 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-lg transition"
                        title="Réinitialiser la photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Custom URL Input toggle */}
              {showUrlInput && (
                <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-xl space-y-2 animate-fadeIn">
                  <label className="text-xs font-bold text-sky-900 block">
                    Entrer l'adresse URL de l'image (web) :
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCustomUrl}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                    >
                      Appliquer
                    </button>
                  </div>
                </div>
              )}

              {/* Drag and Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                  dragActive
                    ? 'border-sky-500 bg-sky-50'
                    : 'border-slate-300 hover:border-sky-400 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div className="w-10 h-10 mx-auto rounded-full bg-sky-100 flex items-center justify-center text-sky-600 mb-2">
                  <Camera className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-700">
                  Glissez-déposez la photo du patient ici, ou{' '}
                  <span className="text-sky-600 underline">parcourez vos fichiers</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Formats acceptés : JPG, PNG, WebP (Prise de vue mobile ou webcam supportée)
                </p>
              </div>

              {/* Preset Avatars Gallery */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Ou choisir parmi les portraits prédéfinis :
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                  {PATIENT_AVATAR_PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatar(p.url)}
                      className={`relative group rounded-xl overflow-hidden aspect-square border-2 transition ${
                        avatar === p.url
                          ? 'border-sky-600 ring-2 ring-sky-500/50 scale-95'
                          : 'border-transparent hover:border-sky-300'
                      }`}
                      title={p.label}
                    >
                      <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                      {avatar === p.url && (
                        <div className="absolute inset-0 bg-sky-600/30 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-white drop-shadow" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IDENTITE & COORDONNEES */}
          {activeTab === 'identite' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Prénom <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    placeholder="Ex: Ousmane"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nom de famille <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    placeholder="Ex: Abdelkerim"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date de naissance <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={dateNaissance}
                    onChange={(e) => setDateNaissance(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sexe biologique <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={sexe}
                    onChange={(e) => setSexe(e.target.value as 'M' | 'F')}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="M">Masculin (Homme)</option>
                    <option value="F">Féminin (Femme)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Âge calculé
                  </label>
                  <div className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold">
                    {dateNaissance ? `${calculateAge(dateNaissance)} ans` : `${targetPatient.age} ans`}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Téléphone (WhatsApp / SMS) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      placeholder="+235 66 12 34 56"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Adresse Email (Optionnel)
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      placeholder="patient@gmail.com"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Adresse de résidence (Quartier / Ville) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={adresse}
                    onChange={(e) => setAdresse(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    placeholder="Quartier Sabangali, N'Djamena"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: URGENCES & CONSTANTES */}
          {activeTab === 'urgence' && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Groupe Sanguin & Rhésus <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {GROUPES_SANGUINS.map((gs) => (
                    <button
                      key={gs}
                      type="button"
                      onClick={() => setGroupeSanguin(gs)}
                      className={`py-2 text-xs font-extrabold rounded-lg border transition ${
                        groupeSanguin === gs
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-rose-50 hover:text-rose-700'
                      }`}
                    >
                      {gs === 'Inconnu' ? '❓ Inconnu' : gs}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Allergies Connues (séparées par une virgule) :
                </label>
                <input
                  type="text"
                  value={allergiesInput}
                  onChange={(e) => setAllergiesInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  placeholder="Ex: Pénicilline, Arachides, AINS"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Ces informations s'affichent en alerte rouge lors du scan QR d'urgence.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Maladies Chroniques ou Antécédents Majeurs :
                </label>
                <input
                  type="text"
                  value={maladiesInput}
                  onChange={(e) => setMaladiesInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  placeholder="Ex: Drépanocytose SS, Diabète Type 2, Hypertension"
                />
              </div>

              <div className="p-3.5 bg-rose-50/70 border border-rose-200/80 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
                  <Phone className="w-3.5 h-3.5 text-rose-600" />
                  Contact d'Urgence Immédiat (Secours & SAMU)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      required
                      value={contactUrgenceNom}
                      onChange={(e) => setContactUrgenceNom(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      placeholder="Brahim Mahamat"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Numéro d'urgence
                    </label>
                    <input
                      type="tel"
                      required
                      value={contactUrgenceTel}
                      onChange={(e) => setContactUrgenceTel(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      placeholder="+235 66 12 34 56"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Lien de parenté
                    </label>
                    <input
                      type="text"
                      required
                      value={contactUrgenceRelation}
                      onChange={(e) => setContactUrgenceRelation(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      placeholder="Frère, Épouse, Père..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ASSURANCE & TIERS-PAYANT */}
          {activeTab === 'assurance' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Coverage toggle banner */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-950">Couverture Assurance Maladie & Mutuelle</h4>
                    <p className="text-[11px] text-amber-700">
                      Active le tiers-payant automatique et la déduction de la part mutuelle lors de la facturation
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={hasAssurance}
                    onChange={(e) => setHasAssurance(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              {hasAssurance ? (
                <div className="space-y-4">
                  {/* Organisme selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Organisme / Mutuelle Santé :
                      </label>
                      <select
                        value={assuranceOrganisme}
                        onChange={(e) => setAssuranceOrganisme(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-semibold text-slate-800"
                      >
                        <option value="CNPS Tchad">CNPS Tchad (Caisse Nationale de Prévoyance Sociale)</option>
                        <option value="Ascoma Tchad Assurances">Ascoma Tchad Assurances Santé</option>
                        <option value="Gras Savoye / Sanlam Tchad">Gras Savoye / Sanlam Assurance</option>
                        <option value="Al Wafa Assurance Tchad">Al Wafa Assurance Tchad</option>
                        <option value="Bon Société Pétrolière SHT">Bon de Société - SHT / Pétrole</option>
                        <option value="Bon CotonTchad SN">Bon Entreprise - CotonTchad SN</option>
                        <option value="Mutuelle des Enseignants & Fonctionnaires">Mutuelle des Fonctionnaires Tchad</option>
                        <option value="Autre Organisme">Autre Assurance / Mutuelle Privée</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Taux de Prise en Charge Global (%) :
                      </label>
                      <div className="flex items-center gap-2">
                        {[70, 80, 90, 100].map((rate) => (
                          <button
                            key={rate}
                            type="button"
                            onClick={() => setAssuranceTaux(rate)}
                            className={`flex-1 py-1.5 rounded-xl border text-xs font-bold transition ${
                              assuranceTaux === rate
                                ? 'bg-amber-600 border-amber-600 text-white shadow-xs'
                                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {rate}%
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Ticket modérateur à la charge du patient : <span className="font-bold text-amber-800">{100 - assuranceTaux}%</span>
                      </p>
                    </div>
                  </div>

                  {/* Numéros de police et matricule */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Numéro de Police / Contrat :
                      </label>
                      <input
                        type="text"
                        value={assuranceNumeroPolice}
                        onChange={(e) => setAssuranceNumeroPolice(e.target.value)}
                        placeholder="POL-CNPS-8849-NDJ"
                        className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Matricule Assuré / N° Carte :
                      </label>
                      <input
                        type="text"
                        value={assuranceMatricule}
                        onChange={(e) => setAssuranceMatricule(e.target.value)}
                        placeholder="ASS-77402-A"
                        className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Qualité d'assuré */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Qualité du Bénéficiaire :
                      </label>
                      <select
                        value={assuranceQualite}
                        onChange={(e) => setAssuranceQualite(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-semibold text-slate-800"
                      >
                        <option value="assure_principal">Assuré Principal (Titulaire du contrat)</option>
                        <option value="conjoint">Ayant-droit : Conjoint(e)</option>
                        <option value="enfant">Ayant-droit : Enfant à charge</option>
                        <option value="autre">Autre ayant-droit / Parent</option>
                      </select>
                    </div>

                    {assuranceQualite !== 'assure_principal' ? (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Nom complet de l'Assuré Principal :
                        </label>
                        <input
                          type="text"
                          value={assuranceNomPrincipal}
                          onChange={(e) => setAssuranceNomPrincipal(e.target.value)}
                          placeholder="Nom du parent ou conjoint titulaire"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center text-xs text-slate-500 italic pt-6">
                        ✓ Le patient est le titulaire direct de la police.
                      </div>
                    )}
                  </div>

                  {/* Validité et Plafond */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Date de fin de validité :
                      </label>
                      <input
                        type="date"
                        value={assuranceValidite}
                        onChange={(e) => setAssuranceValidite(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Plafond Annuel (FCFA) :
                      </label>
                      <input
                        type="number"
                        value={assurancePlafond}
                        onChange={(e) => setAssurancePlafond(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Téléphone Assureur / Accord :
                      </label>
                      <input
                        type="tel"
                        value={assuranceTelAssureur}
                        onChange={(e) => setAssuranceTelAssureur(e.target.value)}
                        placeholder="+235 22 52 23 10"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center rounded-2xl border border-dashed border-slate-200 text-slate-500 space-y-1">
                  <p className="text-xs font-semibold">Aucune assurance active enregistrée pour ce patient.</p>
                  <p className="text-[11px] text-slate-400">
                    Cochez l'option ci-dessus pour associer un contrat CNPS, Ascoma ou mutuelle professionnelle.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SÉCURITÉ & MOT DE PASSE PATIENT */}
          {activeTab === 'securite' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/80 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Key className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-sky-950">Accès Sécurisé à l'Espace Patient</h3>
                    {targetPatient?.motDePasseModifie ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Mot de passe personnalisé
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        Mot de passe par défaut
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-sky-800 mt-1 leading-relaxed">
                    À la création de votre dossier, des identifiants par défaut vous sont attribués. Vous pouvez modifier votre mot de passe à tout moment pour garantir la confidentialité totale de votre dossier médical.
                  </p>
                </div>
              </div>

              {passwordError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  Définir un nouveau mot de passe
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nouveau mot de passe :
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswordText ? 'text' : 'password'}
                        value={nouveauMotDePasse}
                        onChange={(e) => setNouveauMotDePasse(e.target.value)}
                        placeholder="Min. 4 caractères"
                        className="w-full pl-3 pr-9 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswordText(!showPasswordText)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                        title={showPasswordText ? 'Masquer' : 'Afficher'}
                      >
                        {showPasswordText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Laissez vide si vous ne souhaitez pas le modifier.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirmer le nouveau mot de passe :
                    </label>
                    <input
                      type={showPasswordText ? 'text' : 'password'}
                      value={confirmerMotDePasse}
                      onChange={(e) => setConfirmerMotDePasse(e.target.value)}
                      placeholder="Répétez le mot de passe"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-500">Identifiant de connexion :</span>
                    <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {targetPatient.numeroDossier || targetPatient.telephone}
                    </span>
                  </div>
                  {targetPatient.dateDerniereModifMDP && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-slate-400">Dernière modification enregistrée :</span>
                      <span className="text-slate-600 font-mono text-[10px]">
                        {new Date(targetPatient.dateDerniereModifMDP).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
            <button
              id="btn-cancel-patient-profile"
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition text-center"
            >
              Annuler
            </button>
            <button
              id="btn-save-patient-profile"
              type="submit"
              disabled={isSaving}
              className={`w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition flex items-center justify-center gap-2 ${
                saveSuccess
                  ? 'bg-emerald-600'
                  : 'bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800'
              } disabled:opacity-50`}
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  Dossier et Photo Enregistrés !
                </>
              ) : isSaving ? (
                'Enregistrement en cours...'
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Enregistrer les modifications
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
