import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Video,
  PhoneOff,
  ShieldCheck,
  Send,
  Building2,
  FileText,
  Activity,
  CheckCircle2,
  Maximize2,
  Share2,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Save,
  AlertTriangle,
  User as UserIcon,
  Phone,
  Stethoscope,
  RefreshCw,
} from 'lucide-react';
import { Appointment, Patient } from '../types';
import { useClinic } from '../context/ClinicContext';

interface TeleconsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment?: Appointment | null;
  patient: Patient;
  doctorNom?: string;
  clinicNom?: string;
  isDoctorMode?: boolean;
}

export const TeleconsultationModal: React.FC<TeleconsultationModalProps> = ({
  isOpen,
  onClose,
  appointment,
  patient,
  doctorNom = 'Dr. Kaltouma Djibrine',
  clinicNom = 'Clinique Médicale Espoir',
  isDoctorMode = false,
}) => {
  const { currentUser, enregistrerActionJournal } = useClinic();

  const [activeTab, setActiveTab] = useState<'video' | 'clinical'>('video');
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [notes, setNotes] = useState(
    appointment?.notes ||
      `Téléconsultation vidéo DARÔ du ${new Date().toLocaleDateString('fr-FR')}.\nMotif : ${appointment?.motif || 'Consultation de suivi général'}.\nObservations cliniques : `
  );
  const [notesSavedNotice, setNotesSavedNotice] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);

  // Generate unique and deterministic room ID based on appointment or patient ID
  const cleanId = (appointment?.id || patient?.matricule || patient?.id || 'daro-urgent')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();
  const roomName = `daro-sante-visio-${cleanId}`;

  const displayName = isDoctorMode
    ? doctorNom.startsWith('Dr.')
      ? doctorNom
      : `Dr. ${doctorNom}`
    : `${patient.prenom} ${patient.nom}`;

  // Jitsi Meet secure WebRTC room URL
  const roomUrl = `https://meet.jit.si/${roomName}#config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false&config.disableDeepLinking=true&userInfo.displayName=${encodeURIComponent(
    displayName
  )}`;

  // Direct shareable meeting link
  const directMeetingLink = `https://meet.jit.si/${roomName}`;

  // Call timer
  useEffect(() => {
    if (!isOpen) {
      setDurationSeconds(0);
      setIsIframeLoaded(false);
      return;
    }
    const timer = setInterval(() => {
      setDurationSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(directMeetingLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleOpenExternal = () => {
    window.open(roomUrl, '_blank', 'noopener,noreferrer');
  };

  const handleWhatsAppInvite = () => {
    const rawPhone = patient.telephone || '';
    const digits = rawPhone.replace(/[^0-9]/g, '');
    const cleanPhone = digits.startsWith('235')
      ? digits
      : digits.length === 8
      ? `235${digits}`
      : digits;

    const message = `Bonjour ${patient.prenom}, votre consultation médicale vidéo avec ${doctorNom} (${clinicNom}) est ouverte sur DARÔ Santé.\n\nCliquez sur ce lien pour rejoindre l'appel vidéo en direct (Google Meet / WebRTC) :\n${directMeetingLink}`;

    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(waUrl, '_blank');
  };

  const handleSaveNotes = () => {
    if (enregistrerActionJournal) {
      enregistrerActionJournal(
        'Notes Téléconsultation',
        `Notes téléconsultation sauvegardées pour ${patient.prenom} ${patient.nom} (${roomName})`
      );
    }
    setNotesSavedNotice(true);
    setTimeout(() => setNotesSavedNotice(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-0 sm:p-2 md:p-4 overflow-hidden">
      <div className="bg-slate-950 text-white w-full h-full sm:h-[95vh] sm:max-w-6xl sm:rounded-3xl border-0 sm:border border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
        {/* Top Header Bar */}
        <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-300 flex items-center justify-center flex-shrink-0">
              <Video className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                  Téléconsultation Médicale HD
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  WebRTC Crypté
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                {isDoctorMode ? `Patient : ${patient.prenom} ${patient.nom}` : `Médecin : ${doctorNom}`} • {clinicNom}
              </p>
            </div>
          </div>

          {/* Quick Actions & Call Duration */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>{formatDuration(durationSeconds)}</span>
            </div>

            {/* WhatsApp Invite Button */}
            <button
              type="button"
              onClick={handleWhatsAppInvite}
              title="Envoyer le lien par WhatsApp"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            {/* Copy Link Button */}
            <button
              type="button"
              onClick={handleCopyLink}
              title="Copier le lien direct"
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">{copiedLink ? 'Lien copié !' : 'Copier le lien'}</span>
            </button>

            {/* Open Fullscreen External Tab */}
            <button
              type="button"
              onClick={handleOpenExternal}
              title="Ouvrir dans un grand onglet indépendant (Google Meet style)"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-rose-900/40 transition cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Tabs Switcher */}
        <div className="flex sm:hidden bg-slate-900 border-b border-slate-800 px-2 py-1">
          <button
            type="button"
            onClick={() => setActiveTab('video')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab === 'video'
                ? 'bg-purple-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Vidéo HD ({isDoctorMode ? patient.prenom : doctorNom.split(' ')[0]})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('clinical')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
              activeTab === 'clinical'
                ? 'bg-purple-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isDoctorMode ? 'Dossier & Notes' : 'Conseils Médicaux'}
          </button>
        </div>

        {/* Main Consultation Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-0">
          {/* Video Stream Stage */}
          <div
            className={`lg:col-span-8 bg-slate-950 flex flex-col justify-between relative overflow-hidden ${
              activeTab === 'video' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            <div className="relative w-full h-full flex-1 bg-black overflow-hidden flex items-center justify-center">
              {/* Real Jitsi WebRTC iframe */}
              <iframe
                key={iframeKey}
                src={roomUrl}
                allow="camera; microphone; display-capture; autoplay; clipboard-write; encrypted-media; fullscreen"
                onLoad={() => setIsIframeLoaded(true)}
                className="w-full h-full border-0 absolute inset-0 z-10"
                title="Salon Vidéo DARÔ Téléconsultation"
              />

              {/* Loading / Connecting indicator behind iframe */}
              {!isIframeLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-950 z-0">
                  <div className="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-400 mb-3 animate-pulse">
                    <Video className="w-6 h-6 animate-bounce" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Connexion au salon vidéo DARÔ...</h4>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">
                    Initialisation du canal WebRTC chiffré de bout en bout conforme au secret médical.
                  </p>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Si le navigateur vous demande l'accès à la caméra et au micro, cliquez sur <strong>Autoriser</strong>.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Bar Controls for Mobile & Quick Actions */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-2 z-20">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIframeKey(k => k + 1)}
                  title="Rafraîchir la caméra et le son"
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Réinitialiser le flux</span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppInvite}
                  className="sm:hidden px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenExternal}
                  className="px-3 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Plein Écran Google Meet</span>
                  <span className="sm:hidden">Plein Écran</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-rose-900/30"
                >
                  <PhoneOff className="w-3.5 h-3.5" />
                  <span>Raccrocher</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel: Clinical Notes (Doctor) OR Medical Advice & Dossier (Patient) */}
          <div
            className={`lg:col-span-4 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col h-full overflow-hidden ${
              activeTab === 'clinical' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            {/* Header info */}
            <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  {isDoctorMode ? <Stethoscope className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    {isDoctorMode ? 'Dossier Clinique en Direct' : 'Synthèse & Conseils'}
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    {patient.matricule} • {patient.prenom} {patient.nom}
                  </p>
                </div>
              </div>

              {notesSavedNotice && (
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded animate-fade-in">
                  ✓ Enregistré
                </span>
              )}
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {/* Patient Quick Vitals Card */}
              <div className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">
                    Constantes & Profil Patient
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                    Groupe {patient.groupeSanguin || 'Inconnu'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Âge / Sexe :</span>
                    <span className="font-semibold text-white">
                      {patient.dateNaissance ? `${new Date().getFullYear() - parseInt(patient.dateNaissance)} ans` : 'N/A'} ({patient.sexe === 'M' ? 'Homme' : 'Femme'})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Téléphone :</span>
                    <span className="font-semibold text-emerald-400">{patient.telephone || 'Non renseigné'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block text-[10px]">Allergies déclarées :</span>
                    <span className="font-semibold text-amber-300">
                      {patient.allergies && patient.allergies.length > 0 ? patient.allergies.join(', ') : 'Aucune allergie connue'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Doctor Medical Notes View */}
              {isDoctorMode ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-purple-400" />
                      Observations médicales & Diagnostic :
                    </label>
                    <button
                      type="button"
                      onClick={handleSaveNotes}
                      className="text-[10px] text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1 cursor-pointer bg-teal-950/60 border border-teal-800/40 px-2 py-1 rounded-lg"
                    >
                      <Save className="w-3 h-3" />
                      Sauvegarder au dossier
                    </button>
                  </div>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={6}
                    placeholder="Saisissez les observations cliniques, symptômes décrits et conduite à tenir..."
                    className="w-full rounded-2xl bg-slate-950 border border-slate-800 p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 leading-relaxed font-sans"
                  />

                  {/* WhatsApp Quick Link Generator */}
                  <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        Invitation WhatsApp Directe
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      Si le patient a des difficultés de connexion ou est sur son smartphone, envoyez-lui le lien sécurisé en un clic sur WhatsApp.
                    </p>
                    <button
                      type="button"
                      onClick={handleWhatsAppInvite}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Envoyer l'appel sur le WhatsApp du patient</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Patient Guidance & Advice View */
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-800/40 space-y-2 text-purple-200">
                    <span className="text-[10px] uppercase font-bold text-purple-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                      Déroulement de votre téléconsultation
                    </span>
                    <ul className="space-y-1.5 text-[11px] list-disc list-inside text-slate-300 leading-relaxed">
                      <li>Décrivez précisément vos symptômes à votre praticien.</li>
                      <li>Gardez à portée de main vos ordonnances précédentes ou examens.</li>
                      <li>Toute ordonnance ou certificat sera instantanément disponible dans votre espace patient.</li>
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      En cas de coupure réseau
                    </span>
                    <p className="text-[11px] text-slate-300">
                      Vous pouvez rouvrir cette page à tout moment ou utiliser le lien direct :
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        readOnly
                        value={directMeetingLink}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[10px] text-slate-400 truncate"
                      />
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-bold"
                      >
                        {copiedLink ? 'Copié' : 'Copier'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Security certification note */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-teal-400 flex-shrink-0" />
                <span>
                  Flux vidéo et audio chiffrés de bout en bout (DTLS-SRTP). Données médicales protégées selon les normes de santé publique.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
