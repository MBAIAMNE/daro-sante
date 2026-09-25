import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  Upload,
  User as UserIcon,
  Mail,
  Phone,
  Shield,
  Building2,
  CheckCircle2,
  Sparkles,
  Trash2,
  Stethoscope,
  Briefcase,
  Clock,
  UserCheck,
  Power,
  Lock,
  Key,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { User, UserRole, UserAccountStatus } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: User | null;
  onSaved?: (updated: User) => void;
}

// Curated high quality avatars presets for quick selection
const AVATAR_PRESETS = [
  {
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    label: 'Fred Mbaï (Concepteur)',
  },
  {
    url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
    label: 'Médecin Homme',
  },
  {
    url: 'https://images.unsplash.com/photo-1594824813686-778f6d2f33c0?w=300&auto=format&fit=crop&q=80',
    label: 'Médecin Femme',
  },
  {
    url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop&q=80',
    label: 'Praticien Blouse Blanche',
  },
  {
    url: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&auto=format&fit=crop&q=80',
    label: 'Soignant / Triage',
  },
  {
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    label: 'Gestionnaire / Direction',
  },
  {
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    label: 'Accueil / Coordination',
  },
  {
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    label: 'Directeur Hôpital',
  },
];

const ROLE_OPTIONS: { role: UserRole; label: string }[] = [
  { role: 'superadmin', label: 'Super Administrateur Réseau (Concepteur)' },
  { role: 'directeur', label: 'Directeur d\'Établissement' },
  { role: 'gestionnaire', label: 'Gestionnaire Administratif & Financier' },
  { role: 'medecin', label: 'Médecin Praticien' },
  { role: 'infirmier', label: 'Infirmier(ère) Triage' },
  { role: 'accueil', label: 'Accueil & Facturation' },
  { role: 'responsable_soins', label: 'Responsable des Soins' },
  { role: 'tech_laboratoire', label: 'Technicien Laboratoire' },
  { role: 'tech_imagerie', label: 'Technicien Imagerie' },
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  userToEdit,
  onSaved,
}) => {
  const { currentUser, modifierUtilisateur, etablissements } = useClinic();

  const targetUser = userToEdit || currentUser;
  const isEditingSelf = targetUser.id === currentUser.id;
  const isSuperAdmin = currentUser.role === 'superadmin';

  const [nom, setNom] = useState(targetUser.nom);
  const [prenom, setPrenom] = useState(targetUser.prenom);
  const [email, setEmail] = useState(targetUser.email);
  const [telephone, setTelephone] = useState(targetUser.telephone || '');
  const [specialite, setSpecialite] = useState(targetUser.specialite || '');
  const [role, setRole] = useState<UserRole>(targetUser.role);
  const [etablissementId, setEtablissementId] = useState<string>(targetUser.etablissementId || '');
  const [avatar, setAvatar] = useState(targetUser.avatar || '');
  const [statut, setStatut] = useState<UserAccountStatus>(
    (targetUser.statut as UserAccountStatus) || (targetUser.actif !== false ? 'actif' : 'desactive')
  );
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Gestion du mot de passe (Modifiable quand l'utilisateur le souhaite)
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('');
  const [confirmerMotDePasse, setConfirmerMotDePasse] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && targetUser) {
      setNom(targetUser.nom);
      setPrenom(targetUser.prenom);
      setEmail(targetUser.email);
      setTelephone(targetUser.telephone || '');
      setSpecialite(targetUser.specialite || '');
      setRole(targetUser.role);
      setEtablissementId(targetUser.etablissementId || '');
      setAvatar(targetUser.avatar || '');
      setStatut((targetUser.statut as UserAccountStatus) || (targetUser.actif !== false ? 'actif' : 'desactive'));
      setShowUrlInput(false);
      setCustomUrlInput('');
      setSaveSuccess(false);
      setNouveauMotDePasse('');
      setConfirmerMotDePasse('');
      setShowPasswordFields(false);
      setPasswordError(null);
    }
  }, [isOpen, targetUser]);

  if (!isOpen) return null;

  // Handle file selection and read as base64 Data URL
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file);
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      alert('La taille de l\'image ne doit pas dépasser 15 Mo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawResult = event.target?.result;
      if (typeof rawResult === 'string') {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const maxDim = 360;
            let width = img.width;
            let height = img.height;
            if (width > height) {
              if (width > maxDim) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              }
            } else {
              if (height > maxDim) {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const compressed = canvas.toDataURL('image/jpeg', 0.85);
              setAvatar(compressed);
            } else {
              setAvatar(rawResult);
            }
          } catch (e) {
            setAvatar(rawResult);
          }
        };
        img.onerror = () => {
          setAvatar(rawResult);
        };
        img.src = rawResult;
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop handlers
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleApplyCustomUrl = () => {
    if (customUrlInput.trim()) {
      setAvatar(customUrlInput.trim());
      setShowUrlInput(false);
      setCustomUrlInput('');
    }
  };

  const handleResetToDefault = () => {
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      `${prenom || 'User'} ${nom || ''}`
    )}&background=1E88E5&color=fff&bold=true&size=256`;
    setAvatar(defaultAvatar);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !prenom.trim() || !email.trim()) {
      alert('Veuillez renseigner le nom, le prénom et l\'adresse e-mail.');
      return;
    }

    if (nouveauMotDePasse.trim()) {
      if (nouveauMotDePasse.trim().length < 4) {
        setPasswordError('Le nouveau mot de passe doit comporter au moins 4 caractères.');
        return;
      }
      if (nouveauMotDePasse.trim() !== confirmerMotDePasse.trim()) {
        setPasswordError('La confirmation ne correspond pas au nouveau mot de passe.');
        return;
      }
    }
    setPasswordError(null);

    setIsSaving(true);
    try {
      const isPasswordChanged = !!nouveauMotDePasse.trim();
      const finalPassword = isPasswordChanged ? nouveauMotDePasse.trim() : (targetUser.motDePasse || 'daro2025');

      const updatedUser: User = {
        ...targetUser,
        nom: nom.trim(),
        prenom: prenom.trim(),
        email: email.trim(),
        telephone: telephone.trim() || undefined,
        specialite: specialite.trim() || undefined,
        role,
        statut,
        actif: statut === 'actif',
        avatar: avatar || targetUser.avatar,
        motDePasse: finalPassword,
        motDePasseModifie: isPasswordChanged ? true : !!targetUser.motDePasseModifie,
        dateDerniereModifMDP: isPasswordChanged ? new Date().toISOString() : targetUser.dateDerniereModifMDP,
        etablissementId: role === 'superadmin' ? undefined : etablissementId || targetUser.etablissementId,
        etablissementNom:
          role === 'superadmin'
            ? 'Direction Réseau DARÔ Santé'
            : etablissements.find(e => e.id === etablissementId)?.nom || targetUser.etablissementNom,
      };

      await modifierUtilisateur(updatedUser);
      setSaveSuccess(true);
      if (onSaved) onSaved(updatedUser);

      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Error saving profile:', err);
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Title & Close */}
        <div className="bg-gradient-to-r from-[#0B3C5D] to-[#1E88E5] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-xs">
              <UserIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {isEditingSelf ? 'Modifier Mon Profil & Ma Photo' : `Modifier le Profil : ${targetUser.prenom} ${targetUser.nom}`}
              </h3>
              <p className="text-xs text-sky-100/80">
                {targetUser.id === 'u-superadmin' || targetUser.role === 'superadmin'
                  ? 'Compte Administrateur & Concepteur de la plateforme'
                  : 'Mise à jour des informations personnelles et identifiant visuel'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Alert */}
        {saveSuccess && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-800 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Profil et photo enregistrés avec succès ! Application immédiate.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* PHOTO DE PROFIL SECTION */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#1E88E5]" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Photo de Profil (Avatar)
                </h4>
              </div>
              <span className="text-[11px] text-slate-500">
                Visible par l'équipe, sur les ordonnances et la plateforme
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Circular Avatar Preview with Camera Badge */}
              <div className="relative group flex-shrink-0">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-slate-200">
                  <img
                    src={avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'}
                    alt="Aperçu photo"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        `${prenom} ${nom}`
                      )}&background=1E88E5&color=fff&size=256`;
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Téléverser une photo depuis votre appareil"
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#1E88E5] hover:bg-[#1565C0] text-white border-2 border-white shadow-sm flex items-center justify-center transition-transform group-hover:scale-105"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Upload Drop Zone & Action Buttons */}
              <div className="flex-1 w-full space-y-2.5">
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-colors ${
                    dragActive
                      ? 'border-[#1E88E5] bg-blue-50/50'
                      : 'border-slate-300 hover:border-[#1E88E5] bg-white hover:bg-slate-50/60'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp, image/gif"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-700">
                    <Upload className="w-4 h-4 text-[#1E88E5]" />
                    <span>Choisir une photo depuis votre appareil</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Glissez-déposez ou cliquez (JPG, PNG, WebP jusqu'à 8 Mo)
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors font-medium flex items-center gap-1"
                  >
                    <span>Lien URL d'image</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors font-medium flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3 text-slate-400" />
                    <span>Avatar initiales</span>
                  </button>
                </div>

                {showUrlInput && (
                  <div className="flex items-center gap-2 mt-2 animate-in fade-in">
                    <input
                      type="url"
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      placeholder="Collez ici l'URL de votre photo (https://...)"
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#1E88E5]"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCustomUrl}
                      className="px-3 py-1.5 rounded-lg bg-[#1E88E5] text-white text-xs font-semibold hover:bg-[#1565C0] transition-colors"
                    >
                      Appliquer
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* PRESET AVATARS SELECTOR */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Ou choisissez parmi nos photos types professionnelles :</span>
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatar(preset.url)}
                    title={preset.label}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all p-0.5 ${
                      avatar === preset.url
                        ? 'border-[#1E88E5] ring-2 ring-[#1E88E5]/30 scale-105'
                        : 'border-slate-200 hover:border-slate-300 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.label}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    {avatar === preset.url && (
                      <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-[#1E88E5] text-white flex items-center justify-center text-[8px] font-black shadow-xs">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* INFORMATIONS PERSONNELLES */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-[#1E88E5]" />
              <span>Identité & Coordonnées</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Prénom <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  placeholder="Ex: Fred"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#1E88E5]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom de famille <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Ex: Mbaï"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#1E88E5]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adresse e-mail <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="fredmbaiamne@gmail.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#1E88E5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Numéro de téléphone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    placeholder="+235 66 00 00 00"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#1E88E5]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>Spécialité / Titre Professionnel</span>
                </label>
                <input
                  type="text"
                  value={specialite}
                  onChange={(e) => setSpecialite(e.target.value)}
                  placeholder="Ex: Concepteur & Super Administrateur / Médecin Chef"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#1E88E5]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  <span>Rôle d'habilitation</span>
                </label>
                <select
                  value={role}
                  disabled={!isSuperAdmin && targetUser.role === 'superadmin'}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#1E88E5] bg-white disabled:bg-slate-100 disabled:text-slate-500"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.role} value={r.role}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Établissement (for non-superadmin) */}
            {role !== 'superadmin' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Établissement Hospitalier de Rattachement</span>
                </label>
                <select
                  value={etablissementId}
                  onChange={(e) => setEtablissementId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#1E88E5] bg-white"
                >
                  <option value="">-- Sélectionner un établissement --</option>
                  {etablissements.map((etab) => (
                    <option key={etab.id} value={etab.id}>
                      {etab.nom} ({etab.ville})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Statut du Compte Utilisateur (Conformité traçabilité hospitalière) */}
            <div className="pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#1E88E5]" />
                  <span>Statut d'habilitation du compte</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  Règle DARÔ : désactivation au lieu de suppression
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setStatut('actif')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    statut === 'actif'
                      ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-slate-900">Actif</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-snug">
                    Accès opérationnel aux dossiers et signatures.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setStatut('en_attente')}
                  disabled={isEditingSelf}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    statut === 'en_attente'
                      ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  } ${isEditingSelf ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock className="w-3 h-3 text-amber-500" />
                    <span className="text-xs font-bold text-slate-900">En attente</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-snug">
                    En attente de validation RH ou médicale.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setStatut('desactive')}
                  disabled={isEditingSelf}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    statut === 'desactive'
                      ? 'border-rose-500 bg-rose-50/80 ring-2 ring-rose-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  } ${isEditingSelf ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Power className="w-3 h-3 text-rose-500" />
                    <span className="text-xs font-bold text-slate-900">Désactivé</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-snug">
                    Accès bloqué, actes archivés et conservés.
                  </p>
                </button>
              </div>
            </div>

            {/* Sécurité & Modification de Mot de Passe (Autonome et modifiable à tout moment) */}
            <div className="pt-3 border-t border-slate-200">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-800">Sécurité & Mot de Passe</h4>
                        {targetUser.motDePasseModifie ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Personnalisé
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Par défaut
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {showPasswordFields 
                          ? 'Saisissez votre nouveau mot de passe ci-dessous.' 
                          : 'Modifiable librement quand vous le souhaitez.'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordFields(!showPasswordFields);
                      setPasswordError(null);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition shadow-xs flex items-center gap-1.5"
                  >
                    <Key className="w-3.5 h-3.5 text-sky-600" />
                    <span>{showPasswordFields ? 'Fermer' : 'Modifier le mot de passe'}</span>
                  </button>
                </div>

                {showPasswordFields && (
                  <div className="mt-3 pt-3 border-t border-slate-200/60 space-y-2.5">
                    {passwordError && (
                      <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-700 font-medium">
                        {passwordError}
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Nouveau mot de passe
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswordText ? 'text' : 'password'}
                            value={nouveauMotDePasse}
                            onChange={(e) => setNouveauMotDePasse(e.target.value)}
                            placeholder="Min. 4 caractères"
                            className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-[#1E88E5] focus:outline-hidden bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswordText(!showPasswordText)}
                            className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600"
                          >
                            {showPasswordText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Confirmer le mot de passe
                        </label>
                        <input
                          type={showPasswordText ? 'text' : 'password'}
                          value={confirmerMotDePasse}
                          onChange={(e) => setConfirmerMotDePasse(e.target.value)}
                          placeholder="Répétez le mot de passe"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-[#1E88E5] focus:outline-hidden bg-white"
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 italic">
                      * Le mot de passe sera immédiatement actif dès l'enregistrement.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1E88E5] hover:bg-[#1565C0] shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <span>Enregistrement en cours...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enregistrer le Profil & la Photo</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
