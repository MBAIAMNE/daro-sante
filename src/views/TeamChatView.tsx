import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MessagesSquare,
  Hash,
  User,
  Send,
  Search,
  CheckCheck,
  Check,
  Radio,
  Flame,
  BellRing,
  Sparkles,
  Shield,
  Stethoscope,
  Microscope,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';

const CHANNELS = [
  {
    id: 'urgences-gardes',
    name: 'Urgences & Garde',
    desc: 'Coordination temps réel des urgences vitales et relève',
    icon: Flame,
    color: 'text-rose-500 bg-rose-50',
  },
  {
    id: 'annonces-generales',
    name: 'Annonces Générales',
    desc: 'Communications d\'établissement, protocoles et plannings',
    icon: BellRing,
    color: 'text-blue-500 bg-blue-50',
  },
  {
    id: 'laboratoire-imagerie',
    name: 'Plateaux Techniques',
    desc: 'Échanges directs labo d\'analyses, radiologie et prescripteurs',
    icon: Microscope,
    color: 'text-indigo-500 bg-indigo-50',
  },
  {
    id: 'soins-infirmiers',
    name: 'Soins & Triage',
    desc: 'Transmissions de constantes, perfusions et observations',
    icon: Stethoscope,
    color: 'text-emerald-500 bg-emerald-50',
  },
];

export const TeamChatView: React.FC = () => {
  const {
    currentUser,
    users,
    chatMessages,
    envoyerMessageEquipe,
    marquerMessagesLus,
    getUnreadTeamMessagesCount,
  } = useClinic();

  const [activeMode, setActiveMode] = useState<'channels' | 'direct'>('channels');
  const [activeChannelId, setActiveChannelId] = useState<string>('urgences-gardes');
  const [activeColleagueId, setActiveColleagueId] = useState<string>('');
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Other colleagues excluding currentUser
  const colleagues = useMemo(
    () => users.filter(u => u.id !== currentUser.id),
    [users, currentUser.id]
  );

  // When view loads or switched to direct mode, set first colleague if empty
  useEffect(() => {
    if (activeMode === 'direct' && !activeColleagueId && colleagues.length > 0) {
      setActiveColleagueId(colleagues[0].id);
    }
  }, [activeMode, activeColleagueId, colleagues.length]);

  // Unread messages count for current active thread
  const unreadInActiveThread = useMemo(() => {
    if (activeMode === 'channels') {
      return chatMessages.filter(
        m => !m.estPatientChat && m.channel === activeChannelId && !m.lu && m.senderId !== currentUser.id
      ).length;
    } else if (activeColleagueId) {
      return chatMessages.filter(
        m => !m.estPatientChat && m.senderId === activeColleagueId && m.receiverId === currentUser.id && !m.lu
      ).length;
    }
    return 0;
  }, [chatMessages, activeMode, activeChannelId, activeColleagueId, currentUser.id]);

  // Mark as read only when unread messages exist in active thread
  useEffect(() => {
    if (unreadInActiveThread > 0) {
      if (activeMode === 'channels') {
        marquerMessagesLus('channel', '', activeChannelId);
      } else if (activeMode === 'direct' && activeColleagueId) {
        marquerMessagesLus('team', activeColleagueId);
      }
    }
  }, [unreadInActiveThread, activeMode, activeChannelId, activeColleagueId, marquerMessagesLus]);

  // Auto-scroll on thread change or new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMode, activeChannelId, activeColleagueId, chatMessages.length]);

  const activeChannel = CHANNELS.find(c => c.id === activeChannelId);
  const activeColleague = colleagues.find(c => c.id === activeColleagueId);

  // Filter messages based on active channel or direct chat
  const threadMessages = chatMessages.filter(m => {
    if (m.estPatientChat) return false;
    if (activeMode === 'channels') {
      return m.channel === activeChannelId;
    } else {
      // Direct message between currentUser and activeColleague
      return (
        (m.senderId === currentUser.id && m.receiverId === activeColleagueId) ||
        (m.senderId === activeColleagueId && m.receiverId === currentUser.id)
      );
    }
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (activeMode === 'channels') {
      envoyerMessageEquipe(inputText.trim(), { channel: activeChannelId });
    } else {
      envoyerMessageEquipe(inputText.trim(), { receiverId: activeColleagueId });
    }
    setInputText('');
  };

  const filteredColleagues = colleagues.filter(c =>
    `${c.prenom} ${c.nom}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-4 h-[calc(100vh-5rem)] flex flex-col">
      {/* View Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#0B3C5D] tracking-tight">
              Chat d'Équipe & Coordination Clinique
            </h1>
            <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
              <Radio className="w-3 h-3 text-emerald-600 animate-pulse" /> Direct 3s
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Échanges sécurisés instantanés entre tous les membres du personnel médical et administratif.
          </p>
        </div>
      </div>

      {/* Main Layout Card */}
      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-slate-200 shadow-xs flex overflow-hidden">
        {/* Left Column: Channels & Direct Messages Sidebar */}
        <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50/50 flex-shrink-0">
          {/* Mode Switcher Tabs */}
          <div className="p-3 border-b border-slate-200 bg-white">
            <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setActiveMode('channels')}
                className={`py-1.5 px-3 rounded-lg transition flex items-center justify-center gap-1.5 ${
                  activeMode === 'channels'
                    ? 'bg-white text-[#0B3C5D] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Hash className="w-3.5 h-3.5 text-[#1E88E5]" />
                <span>Canaux ({CHANNELS.length})</span>
              </button>

              <button
                onClick={() => setActiveMode('direct')}
                className={`py-1.5 px-3 rounded-lg transition flex items-center justify-center gap-1.5 relative ${
                  activeMode === 'direct'
                    ? 'bg-white text-[#0B3C5D] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5 text-indigo-500" />
                <span>Directs</span>
                {getUnreadTeamMessagesCount() > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>
            </div>
          </div>

          {/* List Area */}
          {activeMode === 'channels' ? (
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              <div className="px-2 py-1 text-[10px] uppercase tracking-wider font-bold text-slate-400">
                Canaux Cliniques
              </div>
              {CHANNELS.map(ch => {
                const IconComp = ch.icon;
                const isSelected = activeChannelId === ch.id;

                return (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChannelId(ch.id)}
                    className={`w-full p-2.5 rounded-xl text-left transition flex items-center gap-3 ${
                      isSelected
                        ? 'bg-white shadow-xs border border-slate-200 text-[#0B3C5D]'
                        : 'hover:bg-slate-100/70 text-slate-700'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${ch.color}`}>
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{ch.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{ch.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="p-2.5 border-b border-slate-200 bg-white">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Filtrer un collègue..."
                    className="w-full pl-7 pr-3 py-1 bg-slate-100 border border-transparent rounded-lg text-xs focus:bg-white focus:border-[#1E88E5] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {filteredColleagues.map(colleague => {
                  const unread = getUnreadTeamMessagesCount(colleague.id);
                  const isSelected = activeColleagueId === colleague.id;

                  return (
                    <button
                      key={colleague.id}
                      onClick={() => setActiveColleagueId(colleague.id)}
                      className={`w-full p-3 text-left transition flex items-center gap-3 relative ${
                        isSelected ? 'bg-white shadow-xs border-l-4 border-[#1E88E5]' : 'hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={colleague.avatar || 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100'}
                          alt={colleague.nom}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                        />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-xs truncate ${unread > 0 ? 'font-black text-slate-900' : 'font-bold text-slate-800'}`}>
                            {colleague.prenom} {colleague.nom}
                          </p>
                          {unread > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-bold text-[9px]">
                              {unread}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 capitalize truncate mt-0.5">
                          {colleague.role === 'medecin' ? 'Médecin' : colleague.role === 'infirmier' ? 'Infirmier' : colleague.role}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Active Chat Feed & Input */}
        <div className="flex-1 flex flex-col bg-white min-w-0">
          {/* Header */}
          <div className="p-3.5 px-6 border-b border-slate-200 flex items-center justify-between bg-white flex-shrink-0">
            {activeMode === 'channels' && activeChannel ? (
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${activeChannel.color}`}>
                  <Hash className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">{activeChannel.name}</h2>
                  <p className="text-[11px] text-slate-400">{activeChannel.desc}</p>
                </div>
              </div>
            ) : activeColleague ? (
              <div className="flex items-center gap-3">
                <img
                  src={activeColleague.avatar || 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100'}
                  alt={activeColleague.nom}
                  className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    {activeColleague.prenom} {activeColleague.nom}
                  </h2>
                  <p className="text-[11px] text-slate-400 capitalize">
                    {activeColleague.role} • En ligne
                  </p>
                </div>
              </div>
            ) : null}

            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-full">
                Personnel DARÔ
              </span>
            </div>
          </div>

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-[#F8FAFC]">
            {threadMessages.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Aucun message dans ce fil. Soyez le premier à envoyer un message à vos collègues !
              </div>
            ) : (
              threadMessages.map(msg => {
                const isMe = msg.senderId === currentUser.id;
                const senderUser = users.find(u => u.id === msg.senderId);

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-end gap-2 max-w-[80%]">
                      {!isMe && (
                        <img
                          src={senderUser?.avatar || 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100'}
                          alt={msg.senderNom}
                          className="w-7 h-7 rounded-lg object-cover mb-1 border border-slate-200"
                        />
                      )}

                      <div>
                        {!isMe && (
                          <div className="flex items-center gap-1.5 mb-1 ml-1">
                            <span className="text-[11px] font-bold text-slate-800">{msg.senderNom}</span>
                            <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded font-semibold capitalize">
                              {msg.senderRole}
                            </span>
                          </div>
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
                    </div>

                    <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-slate-400">
                      <span>{msg.timestamp}</span>
                      {isMe && (
                        <span className="flex items-center text-slate-400">
                          {msg.lu ? (
                            <CheckCheck className="w-3.5 h-3.5 text-blue-500" title="Vu" />
                          ) : (
                            <Check className="w-3.5 h-3.5" title="Transmis" />
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

          {/* Chat Input */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={
                activeMode === 'channels'
                  ? `Message sur #${activeChannel?.name || 'canal'}...`
                  : `Message direct pour ${activeColleague?.prenom || 'collègue'}...`
              }
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
      </div>
    </div>
  );
};
