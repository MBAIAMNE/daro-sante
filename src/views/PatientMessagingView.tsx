import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MessageSquare,
  Send,
  UserCheck,
  Search,
  CheckCheck,
  Check,
  User,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Phone,
  Clock,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';

export const PatientMessagingView: React.FC = () => {
  const {
    currentUser,
    patients,
    assignments,
    chatMessages,
    envoyerMessagePatient,
    marquerMessagesLus,
    getUnreadPatientMessagesCount,
    setSelectedPatientForDetail,
    setCurrentView,
  } = useClinic();

  // Find patients assigned to this staff member
  const isDirector = currentUser.role === 'directeur';
  
  // Assigned relationships for this current user
  const myAssignments = assignments.filter(a => a.staffId === currentUser.id && a.actif);
  
  // If director or if no assignments for this user, allow viewing clinic-wide assigned patients
  const assignedPatientIds = useMemo(() => {
    return new Set(
      isDirector 
        ? assignments.map(a => a.patientId) 
        : myAssignments.map(a => a.patientId)
    );
  }, [isDirector, assignments, myAssignments]);

  const assignedPatients = useMemo(() => {
    const directList = patients.filter(p => assignedPatientIds.has(p.id));
    return directList.length > 0 ? directList : patients;
  }, [patients, assignedPatientIds]);

  const [selectedPatientId, setSelectedPatientId] = useState<string>(() => {
    return assignedPatients[0]?.id || patients[0]?.id || '';
  });
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if selected patient has unread messages
  const unreadCountForSelectedPatient = useMemo(() => {
    if (!selectedPatientId) return 0;
    return chatMessages.filter(
      m => m.estPatientChat && m.patientId === selectedPatientId && !m.lu && m.senderId !== currentUser.id
    ).length;
  }, [chatMessages, selectedPatientId, currentUser.id]);

  // Mark messages as read ONLY when there are unread messages
  useEffect(() => {
    if (selectedPatientId && unreadCountForSelectedPatient > 0) {
      marquerMessagesLus('patient', selectedPatientId);
    }
  }, [selectedPatientId, unreadCountForSelectedPatient, marquerMessagesLus]);

  // Auto-scroll when switching patient or when message count changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedPatientId, chatMessages.length]);

  const activePatient = patients.find(p => p.id === selectedPatientId);
  const activeAssignment = assignments.find(
    a => a.patientId === selectedPatientId && (a.staffId === currentUser.id || isDirector)
  );

  // Filter messages for this patient thread
  const threadMessages = chatMessages.filter(
    m => m.estPatientChat && m.patientId === selectedPatientId
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedPatientId) return;

    envoyerMessagePatient(inputText.trim(), selectedPatientId, currentUser.id);
    setInputText('');
  };

  const handleQuickReply = (text: string) => {
    if (!selectedPatientId) return;
    envoyerMessagePatient(text, selectedPatientId, currentUser.id);
  };

  const filteredPatients = assignedPatients.filter(p =>
    `${p.prenom} ${p.nom}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.matricule.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-4 h-[calc(100vh-5rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-black text-[#0B3C5D] tracking-tight">
            Messagerie Patients Sécurisée
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Échanges directs avec les patients qui vous sont assignés • Actualisation en temps réel (3s)
          </p>
        </div>

        <button
          onClick={() => setCurrentView('assignments')}
          className="text-xs font-bold text-[#1E88E5] hover:text-[#1677cc] bg-blue-50 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <UserCheck className="w-4 h-4" />
          <span>Gérer les assignations</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-slate-200 shadow-xs flex overflow-hidden">
        {/* Left: Assigned Patients List */}
        <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50/50 flex-shrink-0">
          <div className="p-3 border-b border-slate-200 bg-white">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Filtrer mes patients assignés..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-100 border border-transparent rounded-lg text-xs focus:bg-white focus:border-[#1E88E5] focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {assignedPatients.length === 0 ? (
              <div className="p-6 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-700">Aucun patient assigné</p>
                <p className="text-[11px] text-slate-400">
                  Vous ne pouvez discuter qu'avec les patients qui vous sont formellement assignés.
                </p>
                <button
                  onClick={() => setCurrentView('assignments')}
                  className="text-xs bg-[#1E88E5] text-white px-3 py-1.5 rounded-lg font-bold hover:bg-[#1677cc] transition shadow-xs"
                >
                  Ouvrir les assignations
                </button>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Aucun patient ne correspond à la recherche.
              </div>
            ) : (
              filteredPatients.map(pat => {
                const unread = getUnreadPatientMessagesCount(pat.id);
                const lastMsg = [...chatMessages]
                  .filter(m => m.estPatientChat && m.patientId === pat.id)
                  .pop();
                const isSelected = pat.id === selectedPatientId;
                const asg = assignments.find(
                  a => a.patientId === pat.id && (a.staffId === currentUser.id || isDirector)
                );

                return (
                  <button
                    key={pat.id}
                    onClick={() => setSelectedPatientId(pat.id)}
                    className={`w-full p-3.5 text-left transition flex items-center gap-3 relative ${
                      isSelected ? 'bg-white shadow-xs border-l-4 border-[#1E88E5]' : 'hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={pat.avatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100'}
                        alt={pat.nom}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                      />
                      {unread > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-black flex items-center justify-center border-2 border-white shadow-xs animate-pulse">
                          {unread}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-xs truncate ${unread > 0 ? 'font-black text-slate-900' : 'font-bold text-slate-800'}`}>
                          {pat.prenom} {pat.nom}
                        </p>
                        {lastMsg && (
                          <span className="text-[9px] text-slate-400 flex-shrink-0 ml-1 font-medium">
                            {lastMsg.timestamp}
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] text-slate-400 truncate">
                        {asg?.roleAssignation || pat.matricule}
                      </p>

                      {lastMsg ? (
                        <p className={`text-[11px] truncate mt-0.5 ${unread > 0 ? 'font-bold text-slate-800' : 'text-slate-500'}`}>
                          {lastMsg.senderRole === 'patient' ? '' : 'Vous: '}{lastMsg.texte}
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic mt-0.5">Aucun message pour l'instant</p>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Active Chat Conversation */}
        {activePatient ? (
          <div className="flex-1 flex flex-col bg-white min-w-0">
            {/* Thread Header */}
            <div className="p-3.5 px-6 border-b border-slate-200 flex items-center justify-between bg-white flex-shrink-0">
              <div className="flex items-center gap-3">
                <img
                  src={activePatient.avatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100'}
                  alt={activePatient.nom}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-slate-900">
                      {activePatient.prenom} {activePatient.nom}
                    </h2>
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold">
                      {activePatient.matricule}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-emerald-700 font-semibold">Canal sécurisé</span>
                    <span>•</span>
                    <span className="text-slate-600 font-medium">
                      Rôle : {activeAssignment?.roleAssignation || 'Soignant assigné'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedPatientForDetail(activePatient);
                    setCurrentView('patients');
                  }}
                  className="text-xs font-semibold text-slate-600 hover:text-[#1E88E5] bg-slate-50 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-slate-200 transition flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Voir Dossier Patient</span>
                </button>
              </div>
            </div>

            {/* Message Feed */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-[#F8FAFC]">
              <div className="text-center my-2">
                <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-3 py-1 rounded-full uppercase tracking-wider shadow-2xs">
                  Début de la conversation médicale sécurisée
                </span>
              </div>

              {threadMessages.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Aucun message échangé pour le moment. Envoyez un premier message ci-dessous.
                </div>
              ) : (
                threadMessages.map(msg => {
                  const isMe = msg.senderId === currentUser.id || msg.senderRole !== 'patient';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-end gap-2 max-w-[80%]">
                        {!isMe && (
                          <img
                            src={activePatient.avatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100'}
                            alt={msg.senderNom}
                            className="w-6 h-6 rounded-lg object-cover mb-1 border border-slate-200"
                          />
                        )}

                        <div
                          className={`rounded-2xl px-4 py-2.5 text-xs shadow-2xs leading-relaxed ${
                            isMe
                              ? 'bg-[#1E88E5] text-white rounded-br-xs font-medium'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.texte}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-slate-400">
                        <span>{msg.timestamp}</span>
                        {isMe && (
                          <span className="flex items-center text-slate-400">
                            {msg.lu ? (
                              <CheckCheck className="w-3.5 h-3.5 text-blue-500" title="Lu par le patient" />
                            ) : (
                              <Check className="w-3.5 h-3.5" title="Envoyé" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick response suggestions */}
            <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-[11px]">
              <span className="text-slate-400 font-bold whitespace-nowrap text-[10px]">Réponses rapides :</span>
              <button
                type="button"
                onClick={() => handleQuickReply('Bonjour, comment vous sentez-vous aujourd\'hui ?')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-[#1E88E5] rounded-full text-slate-600 whitespace-nowrap transition"
              >
                Comment vous sentez-vous ?
              </button>
              <button
                type="button"
                onClick={() => handleQuickReply('Vos résultats d\'analyses sont validés et rassurants.')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-[#1E88E5] rounded-full text-slate-600 whitespace-nowrap transition"
              >
                Résultats rassurants
              </button>
              <button
                type="button"
                onClick={() => handleQuickReply('Merci de bien poursuivre votre ordonnance comme indiqué.')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-[#1E88E5] rounded-full text-slate-600 whitespace-nowrap transition"
              >
                Poursuivre l'ordonnance
              </button>
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder={`Écrire un message à ${activePatient.prenom} ${activePatient.nom}...`}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#1E88E5] focus:outline-none transition-all"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="bg-[#1E88E5] hover:bg-[#1677cc] disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Envoyer</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50">
            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-400 mb-4">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Sélectionnez un patient assigné</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Choisissez un patient dans la colonne de gauche pour démarrer la conversation sécurisée.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
