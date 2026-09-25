import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  ShieldCheck,
  Send,
  Building2,
  FileText,
  Activity,
  CheckCircle2,
  Maximize2,
  Volume2,
} from 'lucide-react';
import { Appointment, Patient } from '../types';
import { africanFemaleDoctor, africanDoctorClinic } from '../assets/africanImages';

interface TeleconsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment?: Appointment | null;
  patient: Patient;
  doctorNom?: string;
  clinicNom?: string;
}

export const TeleconsultationModal: React.FC<TeleconsultationModalProps> = ({
  isOpen,
  onClose,
  appointment,
  patient,
  doctorNom = 'Dr. Kaltouma Djibrine',
  clinicNom = 'Clinique Médicale Espoir',
}) => {
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [activeSideTab, setActiveSideTab] = useState<'chat' | 'conseils'>('chat');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string; isDoctor: boolean }>>([
    {
      sender: doctorNom,
      text: `Bonjour ${patient.prenom}. La connexion audio-vidéo sécurisée de la clinique est établie. Comment vous sentez-vous aujourd'hui ?`,
      time: '10:00',
      isDoctor: true,
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Timer of call
  useEffect(() => {
    if (!isOpen) return;
    setDurationSeconds(0);
    const timer = setInterval(() => {
      setDurationSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  // Handle local camera preview
  useEffect(() => {
    if (!isOpen) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
        mediaStreamRef.current = null;
      }
      return;
    }

    if (!isVideoOff) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: true })
          .then(stream => {
            mediaStreamRef.current = stream;
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }
          })
          .catch(err => {
            console.warn('Camera preview not accessible in sandbox, using avatar fallback:', err);
          });
      }
    } else {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getVideoTracks().forEach(t => (t.enabled = false));
      }
    }

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
        mediaStreamRef.current = null;
      }
    };
  }, [isOpen, isVideoOff]);

  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages.length]);

  if (!isOpen) return null;

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = {
      sender: `${patient.prenom} ${patient.nom}`,
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      isDoctor: false,
    };
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');

    // Doctor auto response simulation after 1.5s
    setTimeout(() => {
      const replies = [
        `Bien reçu ${patient.prenom}. Vos constantes sont stables. Je note cela dans votre dossier médical partagé.`,
        `Je viens d'actualiser votre ordonnance électronique. Elle sera disponible immédiatement dans votre onglet "Mes Ordonnances".`,
        `Parfait, continuez votre traitement comme prescrit et hydratez-vous abondamment.`,
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      setChatMessages(prev => [
        ...prev,
        {
          sender: doctorNom,
          text: randomReply,
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          isDoctor: true,
        },
      ]);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-900 rounded-3xl max-w-5xl w-full h-[90vh] max-h-[750px] shadow-2xl border border-slate-700 flex flex-col overflow-hidden animate-in zoom-in-95">
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-400/40 text-purple-300 flex items-center justify-center">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white">
                  Téléconsultation Médicale en Direct
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  HD Chiffré
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-2">
                <span>{doctorNom}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-300">
                  <Building2 className="w-3 h-3 text-sky-400" />
                  {clinicNom}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-mono font-bold text-teal-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
              <span>{formatDuration(durationSeconds)}</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Consultation Area */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Video Stream Stage */}
          <div className="lg:col-span-8 bg-slate-950 p-4 sm:p-6 flex flex-col justify-between relative">
            {/* Doctor Primary Video Feed */}
            <div className="flex-1 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-850 to-slate-900 border border-slate-800 relative overflow-hidden flex items-center justify-center shadow-inner">
              <img
                src={africanFemaleDoctor}
                alt={doctorNom}
                className="w-full h-full object-cover opacity-90 filter brightness-95"
              />

              {/* Doctor HUD Overlay */}
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-bold">{doctorNom}</span>
                <span className="text-[10px] text-emerald-400 font-mono">• Micro actif</span>
              </div>

              {/* Local Patient PIP Camera */}
              <div className="absolute bottom-4 right-4 w-36 sm:w-44 h-24 sm:h-32 rounded-2xl bg-slate-900 border-2 border-slate-700 shadow-2xl overflow-hidden relative">
                {!isVideoOff ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover mirror"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400 text-[11px] p-2 text-center">
                    <VideoOff className="w-5 h-5 text-slate-500 mb-1" />
                    <span>Caméra coupée</span>
                  </div>
                )}
                <div className="absolute bottom-1 left-2 text-[9px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded">
                  Vous ({patient.prenom})
                </div>
              </div>

              {/* Live Audio Indicator */}
              <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white text-[11px]">
                <Volume2 className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
                <span className="text-teal-300 font-semibold">Audio Stéréo Chiffré</span>
              </div>
            </div>

            {/* Bottom Controls Toolbar */}
            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsMicMuted(!isMicMuted)}
                className={`p-3.5 rounded-2xl transition cursor-pointer flex items-center gap-2 font-bold text-xs ${
                  isMicMuted
                    ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-900/30'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span className="hidden sm:inline">{isMicMuted ? 'Micro coupé' : 'Micro'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`p-3.5 rounded-2xl transition cursor-pointer flex items-center gap-2 font-bold text-xs ${
                  isVideoOff
                    ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-900/30'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                <span className="hidden sm:inline">{isVideoOff ? 'Vidéo coupée' : 'Caméra'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-bold text-xs transition cursor-pointer flex items-center gap-2 shadow-lg shadow-rose-900/40"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Terminer la consultation</span>
              </button>
            </div>
          </div>

          {/* Side Panel: In-Call Live Chat & Prescription Advice */}
          <div className="lg:col-span-4 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col h-full">
            {/* Tabs */}
            <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveSideTab('chat')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  activeSideTab === 'chat'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Messagerie en direct</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveSideTab('conseils')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  activeSideTab === 'conseils'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Synthèse Médicale</span>
              </button>
            </div>

            {/* Chat Content */}
            {activeSideTab === 'chat' ? (
              <div className="flex-1 flex flex-col justify-between p-4 overflow-hidden">
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
                  {chatMessages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${m.isDoctor ? 'items-start' : 'items-end'}`}
                    >
                      <span className="text-[10px] text-slate-500 mb-0.5 px-1 font-semibold">
                        {m.sender} • {m.time}
                      </span>
                      <div
                        className={`p-3 rounded-2xl max-w-[90%] leading-relaxed ${
                          m.isDoctor
                            ? 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-xs'
                            : 'bg-purple-600 text-white rounded-br-xs'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                  <div ref={chatScrollRef} />
                </div>

                <form onSubmit={handleSendChat} className="pt-3 border-t border-slate-800 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Écrire au médecin..."
                    className="flex-1 px-3.5 py-2.5 bg-slate-850 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white transition cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs text-slate-300">
                <div className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-teal-400 block tracking-wider">
                    Dossier Patient Associé
                  </span>
                  <p className="font-bold text-white text-sm">
                    {patient.prenom} {patient.nom} ({patient.matricule})
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Groupe Sanguin : <span className="text-rose-400 font-bold">{patient.groupeSanguin}</span> • Allergies : {patient.allergies?.join(', ') || 'Aucune'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-800/40 space-y-2 text-purple-200">
                  <span className="text-[10px] uppercase font-bold text-purple-300 block flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                    Conseils en temps réel
                  </span>
                  <ul className="space-y-1.5 text-[11px] list-disc list-inside text-slate-300">
                    <li>Repos prescrit de 48 heures suite à l'épisode fébrile.</li>
                    <li>Surveillance de la température matin et soir.</li>
                    <li>Ordonnance numérique immédiatement disponible dans l'onglet "Mes Ordonnances".</li>
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-[11px] text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Enregistré et certifié dans le Dossier Médical Partagé DARÔ.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
