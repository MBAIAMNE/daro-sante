import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar as CalendarIcon,
  Video,
  Clock,
  User,
  Plus,
  CheckCircle2,
  PhoneCall,
  VideoOff,
  Mic,
  MicOff,
  X,
  Send,
  Sparkles,
  Camera,
  Share2,
  ShieldCheck,
  Activity,
  Save,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { Appointment } from '../types';

export const AppointmentsView: React.FC = () => {
  const {
    appointments,
    patients,
    users,
    creerRendezVous,
    currentRole,
    currentUser,
    isPatientMode,
    activePatient,
    enregistrerActionJournal,
  } = useClinic();

  const [activeTab, setActiveTab] = useState<'tous' | 'teleconsultation' | 'presentiel'>('tous');
  const [activeCallAppointment, setActiveCallAppointment] = useState<Appointment | null>(null);

  // Video call controls state
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDurationSeconds, setCallDurationSeconds] = useState(0);
  const [teleconsultNotes, setTeleconsultNotes] = useState('Patient consulte pour suivi d\'hypertension. Pouls régulier à distance.');
  const [callChatMessages, setCallChatMessages] = useState<string[]>([
    'Dr. Kaltouma : Bonjour, la liaison vidéo cryptée DARÔ est établie.',
    'Patient : Bonjour Docteur, je vous entends très clairement.',
  ]);
  const [chatInput, setChatInput] = useState('');
  const [notesSavedNotice, setNotesSavedNotice] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Live timer during active teleconsultation
  useEffect(() => {
    let interval: any = null;
    if (activeCallAppointment) {
      setCallDurationSeconds(0);
      interval = setInterval(() => {
        setCallDurationSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeCallAppointment]);

  // Handle local camera stream acquisition
  useEffect(() => {
    if (activeCallAppointment && !isVideoOff) {
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
            console.warn('Camera access fallback (permission or virtual container):', err);
          });
      }
    } else {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
    }

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
    };
  }, [activeCallAppointment, isVideoOff]);

  // Toggle mic track
  const toggleMic = () => {
    setIsMicMuted(!isMicMuted);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach(t => {
        t.enabled = isMicMuted;
      });
    }
  };

  // Toggle camera track
  const toggleCamera = () => {
    setIsVideoOff(!isVideoOff);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach(t => {
        t.enabled = isVideoOff;
      });
    }
  };

  const formatCallTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSaveNotes = () => {
    enregistrerActionJournal(
      'Notes Téléconsultation',
      `Notes de télémédecine enregistrées pour ${activeCallAppointment?.patientNom}`
    );
    setNotesSavedNotice(true);
    setTimeout(() => setNotesSavedNotice(false), 2500);
  };

  // New appointment modal
  const [showNewApptModal, setShowNewApptModal] = useState(false);
  const [newPatientId, setNewPatientId] = useState(isPatientMode && activePatient ? activePatient.id : patients[0]?.id || '');
  const [newDoctorId, setNewDoctorId] = useState(users.find(u => u.role === 'medecin')?.id || users[0]?.id || '');
  const [newDate, setNewDate] = useState('2025-10-18');
  const [newHeure, setNewHeure] = useState('11:00');
  const [newType, setNewType] = useState<'presentiel' | 'teleconsultation'>('teleconsultation');
  const [newMotif, setNewMotif] = useState('Suivi glycémie et renouvellement ordonnance');

  const filtered = appointments.filter(a => {
    // If patient mode, only their appointments
    if (isPatientMode && activePatient && a.patientId !== activePatient.id) {
      return false;
    }
    if (activeTab === 'tous') return true;
    return a.type === activeTab;
  });

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find(p => p.id === newPatientId) || patients[0];
    const doc = users.find(u => u.id === newDoctorId) || users[0];

    creerRendezVous({
      patientId: pat.id,
      patientNom: `${pat.prenom} ${pat.nom}`,
      medecinId: doc.id,
      medecinNom: `${doc.prenom} ${doc.nom}`,
      date: newDate,
      heure: newHeure,
      type: newType,
      motif: newMotif,
    });

    setShowNewApptModal(false);
  };

  const handleSendCallChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = `${currentUser.prenom} : ${chatInput.trim()}`;
    setCallChatMessages(prev => [...prev, userMsg]);
    const currentInput = chatInput.trim().toLowerCase();
    setChatInput('');

    // Dynamic simulated responsive dialogue from remote interlocutor
    setTimeout(() => {
      let reply = '';
      if (currentInput.includes('tension') || currentInput.includes('pouls') || currentInput.includes('constante')) {
        reply = 'Patient : Ma tension mesurée ce matin à domicile est de 13/8 avec un pouls à 74 bpm.';
      } else if (currentInput.includes('medicament') || currentInput.includes('ordonnance') || currentInput.includes('traitement')) {
        reply = 'Patient : Merci Docteur, je pourrai récupérer les médicaments à la pharmacie de garde dès la fin de l\'appel.';
      } else if (currentInput.includes('examen') || currentInput.includes('labo') || currentInput.includes('prise')) {
        reply = 'Patient : Entendu, j\'irai faire l\'analyse dans le laboratoire indiqué sur l\'annuaire.';
      } else {
        reply = 'Patient : C\'est bien noté Docteur, vos conseils sont très clairs.';
      }
      setCallChatMessages(prev => [...prev, reply]);
    }, 1200);
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B3C5D]">Rendez-vous & Téléconsultation</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold">
              DARÔ Télémédecine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Consultations en présentiel à la clinique ou consultations médicales vidéo à distance
          </p>
        </div>

        <button
          onClick={() => setShowNewApptModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B3C5D] hover:bg-[#1E88E5] text-white text-xs font-bold shadow transition"
        >
          <Plus className="w-4 h-4 text-teal-300" />
          <span>Prendre un Rendez-vous</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('tous')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'tous' ? 'bg-[#0B3C5D] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Tous ({appointments.length})
        </button>
        <button
          onClick={() => setActiveTab('teleconsultation')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'teleconsultation' ? 'bg-[#0B3C5D] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>Téléconsultations Vidéo ({appointments.filter(a => a.type === 'teleconsultation').length})</span>
        </button>
        <button
          onClick={() => setActiveTab('presentiel')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'presentiel' ? 'bg-[#0B3C5D] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Présentiel Clinique ({appointments.filter(a => a.type === 'presentiel').length})
        </button>
      </div>

      {/* Appointments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(appt => {
          const isTeleconsult = appt.type === 'teleconsultation';

          return (
            <div
              key={appt.id}
              className={`p-5 rounded-2xl bg-white border transition shadow-xs flex flex-col justify-between space-y-4 ${
                isTeleconsult ? 'border-purple-200 hover:border-purple-400' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isTeleconsult ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {isTeleconsult ? <Video className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    <span>{isTeleconsult ? 'Téléconsultation Vidéo' : 'En Présentiel'}</span>
                  </span>

                  <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {appt.heure}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">{appt.patientNom}</h3>
                  <p className="text-xs text-slate-500">Avec {appt.medecinNom}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs text-slate-600">
                  <p className="font-semibold text-slate-800">Motif :</p>
                  <p className="text-[11px]">{appt.motif}</p>
                  <p className="text-[10px] text-slate-400 pt-1">Date prévue : {appt.date}</p>
                </div>
              </div>

              {/* Action Button */}
              {isTeleconsult ? (
                <button
                  onClick={() => setActiveCallAppointment(appt)}
                  className="w-full py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow"
                >
                  <Video className="w-4 h-4" />
                  <span>Rejoindre la Téléconsultation Visio</span>
                </button>
              ) : (
                <div className="text-center py-1.5 text-xs text-slate-400 font-medium bg-slate-50 rounded-xl">
                  Présentation à l'accueil recommandée 15 min avant
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Live Teleconsultation Room Simulator Modal */}
      {activeCallAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4 backdrop-blur-md">
          <div className="w-full max-w-5xl rounded-3xl bg-slate-950 text-white p-4 sm:p-6 shadow-2xl border border-slate-800 flex flex-col h-[92vh]">
            {/* Call Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    Téléconsultation en Direct • Clinique DARÔ
                  </h3>
                  <p className="text-xs text-slate-400">
                    Patient : {activeCallAppointment.patientNom} | Médecin : {activeCallAppointment.medecinNom}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold bg-slate-800 px-3 py-1 rounded-full text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {formatCallTime(callDurationSeconds)} • Chiffré de bout en bout
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-teal-400 bg-teal-950/60 border border-teal-800/40 px-2 py-0.5 rounded-md">
                  <ShieldCheck className="w-3 h-3" />
                  Conforme HDS & DARÔ SecOps
                </span>
              </div>
            </div>

            {/* Video Streams and Clinical Chat layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 my-3 overflow-hidden">
              {/* Left: Dual Video Screens */}
              <div className="lg:col-span-2 relative rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col justify-between p-4">
                {/* Main Remote View (The other participant) */}
                <div className="relative w-full h-full rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800"
                    alt="Remote stream"
                    className="w-full h-full object-cover"
                  />

                  {/* Remote Patient Name & Status */}
                  <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-xs text-xs font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>{activeCallAppointment.patientNom}</span>
                    <span className="text-[10px] text-slate-400 font-normal">Flux HD stable</span>
                  </div>
                </div>

                {/* Picture in Picture (Self view with live webcam or camera off state) */}
                <div className="absolute top-6 right-6 w-36 sm:w-52 aspect-video rounded-xl overflow-hidden border-2 border-teal-400/90 shadow-2xl bg-slate-950 flex items-center justify-center">
                  {!isVideoOff ? (
                    <>
                      <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover mirror"
                      />
                      {/* Fallback image if user webcam not granted */}
                      <img
                        src="https://images.unsplash.com/photo-1594824813589-4e4b518bb050?w=300"
                        alt="Praticien"
                        className="w-full h-full object-cover absolute inset-0 -z-10"
                      />
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-2 text-center text-slate-400">
                      <VideoOff className="w-6 h-6 mb-1 text-slate-500" />
                      <span className="text-[10px] font-semibold">Caméra désactivée</span>
                    </div>
                  )}
                  <span className="absolute bottom-1 left-2 text-[10px] font-bold bg-black/70 px-1.5 py-0.5 rounded text-white flex items-center gap-1">
                    {isMicMuted ? <MicOff className="w-2.5 h-2.5 text-rose-400" /> : <Mic className="w-2.5 h-2.5 text-emerald-400" />}
                    <span>{currentUser.prenom} {currentUser.nom} (Vous)</span>
                  </span>
                </div>
              </div>

              {/* Right: Notes & In-Call Chat */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col justify-between overflow-hidden">
                <div className="space-y-3 flex-1 flex flex-col overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-teal-400" />
                      Observations & Télémédecine
                    </span>
                    {notesSavedNotice && (
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded animate-fade-in">
                        ✓ Enregistré
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] text-slate-400">Notes du Médecin :</label>
                      <button
                        type="button"
                        onClick={handleSaveNotes}
                        className="text-[10px] text-teal-400 hover:text-teal-300 flex items-center gap-1 font-semibold"
                      >
                        <Save className="w-3 h-3" />
                        Sauvegarder
                      </button>
                    </div>
                    <textarea
                      value={teleconsultNotes}
                      onChange={e => setTeleconsultNotes(e.target.value)}
                      rows={3}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 p-2 text-xs text-white focus:outline-none focus:border-teal-400"
                    />
                  </div>

                  {/* Messages Feed */}
                  <div className="flex-1 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-slate-950 border border-slate-800">
                    {callChatMessages.map((msg, i) => (
                      <p key={i} className="text-xs text-slate-300 leading-snug">
                        {msg}
                      </p>
                    ))}
                  </div>

                  <form onSubmit={handleSendCallChat} className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      placeholder="Message dans l'appel..."
                      className="flex-1 rounded-xl bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs text-white"
                    />
                    <button type="submit" className="p-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white">
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Bottom Controls Toolbar */}
            <div className="flex items-center justify-center gap-4 pt-2 border-t border-slate-800 flex-shrink-0">
              <button
                onClick={() => setIsMicMuted(!isMicMuted)}
                className={`p-3.5 rounded-full transition ${
                  isMicMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
                title={isMicMuted ? 'Activer micro' : 'Couper micro'}
              >
                {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`p-3.5 rounded-full transition ${
                  isVideoOff ? 'bg-rose-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
                title={isVideoOff ? 'Activer caméra' : 'Couper caméra'}
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setActiveCallAppointment(null)}
                className="px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg transition flex items-center gap-2"
              >
                <PhoneCall className="w-4 h-4 rotate-[135deg]" />
                <span>Raccrocher & Terminer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Appointment Modal */}
      {showNewApptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#0B3C5D]">Programmer un Rendez-vous</h3>
              <button onClick={() => setShowNewApptModal(false)} className="text-slate-400 hover:text-slate-700 p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Patient :</label>
                <select
                  value={newPatientId}
                  onChange={e => setNewPatientId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Médecin Praticien :</label>
                <select
                  value={newDoctorId}
                  onChange={e => setNewDoctorId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                >
                  {users.filter(u => u.role === 'medecin' || u.role === 'directeur').map(u => (
                    <option key={u.id} value={u.id}>{u.prenom} {u.nom} ({u.specialite})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date :</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Heure :</label>
                  <input
                    type="time"
                    value={newHeure}
                    onChange={e => setNewHeure(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Format de la consultation :</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewType('teleconsultation')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      newType === 'teleconsultation' ? 'bg-purple-50 border-purple-500 text-purple-900 ring-2 ring-purple-500/20' : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Téléconsultation Visio</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType('presentiel')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      newType === 'presentiel' ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-500/20' : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>En Présentiel</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Motif de consultation :</label>
                <textarea
                  value={newMotif}
                  onChange={e => setNewMotif(e.target.value)}
                  rows={2}
                  required
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewApptModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0B3C5D] hover:bg-[#1E88E5] text-white text-xs font-bold shadow"
                >
                  Confirmer le Rendez-vous
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
