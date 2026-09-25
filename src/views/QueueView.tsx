import React, { useState } from 'react';
import {
  Clock,
  UserCheck,
  AlertTriangle,
  Stethoscope,
  Plus,
  HeartPulse,
  Thermometer,
  Activity,
  ArrowRight,
  Filter,
  CheckCircle2,
  Sparkles,
  User,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { QueueTicket, VitalSigns, UrgenceLevel } from '../types';

export const QueueView: React.FC = () => {
  const {
    queue,
    patients,
    users,
    currentRole,
    currentUser,
    enregistrerArriveePatient,
    effectuerTriage,
    appelerEnConsultation,
    setCurrentView,
  } = useClinic();

  const [activeTab, setActiveTab] = useState<'tous' | 'en_attente' | 'triage_fait' | 'en_consultation'>('tous');

  // Intake Modal state (Accueil / Directeur)
  const [showArrivalModal, setShowArrivalModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [motifArrivee, setMotifArrivee] = useState('Fièvre élevée avec frissons intenses');

  // Triage Modal state (Infirmier / Directeur)
  const [triageTicket, setTriageTicket] = useState<QueueTicket | null>(null);
  const [vitals, setVitals] = useState<VitalSigns>({
    temperature: 38.5,
    tensionArterielle: '120/80',
    frequenceCardiaque: 88,
    saturationO2: 97,
    glycemie: 105,
    poids: 65,
    douleurEchelle: 4,
    notesInfirmier: 'Patient conscient, se plaint de céphalées frontales et courbatures.',
  });
  const [selectedUrgence, setSelectedUrgence] = useState<UrgenceLevel>('urgent');
  const [selectedDoctorId, setSelectedDoctorId] = useState(
    users.find(u => u.role === 'medecin')?.id || users[0].id
  );

  // Filtered queue items
  const filteredQueue = queue.filter(ticket => {
    if (activeTab === 'tous') return true;
    return ticket.statut === activeTab;
  });

  // Role permissions
  const canRegisterArrival = ['accueil', 'directeur', 'infirmier'].includes(currentRole);
  const canDoTriage = ['infirmier', 'directeur'].includes(currentRole);
  const canConsult = ['medecin', 'directeur'].includes(currentRole);

  const handleCreateArrival = (e: React.FormEvent) => {
    e.preventDefault();
    enregistrerArriveePatient(selectedPatientId, motifArrivee);
    setShowArrivalModal(false);
    setMotifArrivee('');
  };

  const handleSubmitTriage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!triageTicket) return;
    effectuerTriage(triageTicket.id, selectedUrgence, selectedDoctorId, vitals);
    setTriageTicket(null);
  };

  const handleStartConsultation = (ticket: QueueTicket) => {
    appelerEnConsultation(ticket.id);
    // Navigate directly to consultation view
    setCurrentView('consultations');
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B3C5D]">File d'Attente & Triage Médical</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold">
              Chaîne de Prise en Charge
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestion continue : Accueil (Arrivée) → Infirmier (Triage & Constantes) → Médecin (Consultation)
          </p>
        </div>

        {canRegisterArrival && (
          <button
            onClick={() => setShowArrivalModal(true)}
            id="queue-new-arrival-btn"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B3C5D] hover:bg-[#1E88E5] text-white text-xs font-bold shadow transition"
          >
            <Plus className="w-4 h-4 text-teal-300" />
            <span>Enregistrer une Arrivée (Accueil)</span>
          </button>
        )}
      </div>

      {/* Tabs / Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('tous')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'tous' ? 'bg-white text-[#0B3C5D] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tous ({queue.length})
          </button>
          <button
            onClick={() => setActiveTab('en_attente')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'en_attente' ? 'bg-white text-[#0B3C5D] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>En attente de Triage</span>
            <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[10px]">
              {queue.filter(q => q.statut === 'en_attente').length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('triage_fait')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'triage_fait' ? 'bg-white text-[#0B3C5D] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Triés (Prêts Médecin)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-teal-100 text-teal-800 text-[10px]">
              {queue.filter(q => q.statut === 'triage_fait').length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('en_consultation')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'en_consultation' ? 'bg-white text-[#0B3C5D] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>En Consultation</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
              {queue.filter(q => q.statut === 'en_consultation').length}
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-500">
          Priorité automatique : <strong className="text-rose-600 font-bold">Critique</strong> &gt; <strong className="text-amber-600 font-bold">Urgent</strong> &gt; Normal
        </div>
      </div>

      {/* Queue Tickets List */}
      <div className="space-y-3">
        {filteredQueue.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 space-y-2">
            <Clock className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-600">Aucun patient dans cette section de la file</p>
            <p className="text-xs">Utilisez le bouton « Enregistrer une Arrivée » pour ajouter un patient.</p>
          </div>
        ) : (
          filteredQueue.map(ticket => {
            const isAssignedToCurrentDoctor =
              currentRole === 'medecin' && ticket.orienteVersMedecinId === currentUser.id;

            return (
              <div
                key={ticket.id}
                className={`p-4 sm:p-5 rounded-2xl bg-white border transition shadow-sm hover:shadow flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  ticket.niveauUrgence === 'critique'
                    ? 'border-rose-400 bg-rose-50/20'
                    : ticket.niveauUrgence === 'urgent'
                    ? 'border-amber-300'
                    : 'border-slate-200'
                }`}
              >
                {/* Patient Information & Motif */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <span className="font-mono text-xs font-black text-[#0B3C5D] bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                      {ticket.ticketNumero}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1">{ticket.heureArrivee}</span>
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        {ticket.patientPrenom} {ticket.patientNom}
                      </h3>
                      <span className="text-xs text-slate-500">
                        ({ticket.patientAge} ans • {ticket.patientSexe === 'M' ? 'H' : 'F'})
                      </span>

                      {/* Urgency Badge */}
                      {ticket.niveauUrgence && (
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                            ticket.niveauUrgence === 'critique'
                              ? 'bg-red-100 text-red-700'
                              : ticket.niveauUrgence === 'urgent'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {ticket.niveauUrgence}
                        </span>
                      )}

                      {/* Status indicator */}
                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {ticket.statut === 'en_attente' && '1. En attente Triage'}
                        {ticket.statut === 'triage_fait' && '2. Triage effectué'}
                        {ticket.statut === 'en_consultation' && '3. En Consultation'}
                        {ticket.statut === 'examens_requis' && '4. Examens en cours'}
                        {ticket.statut === 'termine' && '5. Terminé'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700">
                      <strong>Motif d'arrivée :</strong> {ticket.motifArrivee}
                    </p>

                    {/* Vitals summary if triage is already done */}
                    {ticket.constantesVitales && (
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-600">
                        <span className="flex items-center gap-1 font-mono">
                          <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                          {ticket.constantesVitales.temperature}°C
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Activity className="w-3.5 h-3.5 text-sky-500" />
                          TA: {ticket.constantesVitales.tension || (ticket.constantesVitales as any).tensionArterielle}
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <HeartPulse className="w-3.5 h-3.5 text-emerald-500" />
                          SpO2: {ticket.constantesVitales.saturationO2}%
                        </span>
                        {ticket.orienteVersMedecinNom && (
                          <span className="text-teal-800 font-semibold bg-teal-50 px-2 py-0.2 rounded border border-teal-200">
                            Dr. assigné : {ticket.orienteVersMedecinNom}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions per role */}
                <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                  {/* Infirmier Triage Button */}
                  {canDoTriage && ticket.statut === 'en_attente' && (
                    <button
                      onClick={() => {
                        setTriageTicket(ticket);
                        setVitals(prev => ({
                          ...prev,
                          notesInfirmier: `Admission ${ticket.motifArrivee}.`,
                        }));
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-xs transition"
                    >
                      <HeartPulse className="w-4 h-4" />
                      <span>Faire le Triage</span>
                    </button>
                  )}

                  {/* Doctor Consultation Call Button */}
                  {canConsult && (ticket.statut === 'triage_fait' || ticket.statut === 'en_consultation') && (
                    <button
                      onClick={() => handleStartConsultation(ticket)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs transition"
                    >
                      <Stethoscope className="w-4 h-4" />
                      <span>{ticket.statut === 'en_consultation' ? 'Ouvrir Consultation' : 'Appeler en Consultation'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* View patient dossier shortcut */}
                  <button
                    onClick={() => setCurrentView('patients')}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium"
                    title="Voir le dossier médical"
                  >
                    <User className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Arrival Intake Modal (Accueil) */}
      {showArrivalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-[#0B3C5D]">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold">Enregistrer l'Arrivée d'un Patient (Accueil)</h3>
              </div>
              <button onClick={() => setShowArrivalModal(false)} className="text-slate-400 hover:text-slate-700 p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateArrival} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sélectionner le Patient :</label>
                <select
                  value={selectedPatientId}
                  onChange={e => setSelectedPatientId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.prenom} {p.nom} • {p.matricule} (Groupe {p.groupeSanguin})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Motif de venue / Plaintes exprimées :
                </label>
                <textarea
                  value={motifArrivee}
                  onChange={e => setMotifArrivee(e.target.value)}
                  rows={3}
                  required
                  placeholder="Ex: Douleurs abdominales aiguës, vomissements, fièvre depuis hier..."
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowArrivalModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0B3C5D] hover:bg-[#1E88E5] text-white text-xs font-bold shadow"
                >
                  Créer le ticket de file
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Triage & Vitals Modal (Infirmier) */}
      {triageTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 my-8 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-[#0B3C5D]">
                <HeartPulse className="w-5 h-5 text-teal-600" />
                <div>
                  <h3 className="text-base font-bold">
                    Triage Médical & Constantes Vitales
                  </h3>
                  <p className="text-xs text-slate-500">
                    Patient : {triageTicket.patientPrenom} {triageTicket.patientNom} ({triageTicket.patientAge} ans)
                  </p>
                </div>
              </div>
              <button onClick={() => setTriageTicket(null)} className="text-slate-400 hover:text-slate-700 p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitTriage} className="space-y-4">
              {/* Urgency Level Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">Niveau d'Urgence Déterminé :</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedUrgence('normal')}
                    className={`p-3 rounded-xl border text-center transition ${
                      selectedUrgence === 'normal'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full bg-emerald-500 mx-auto mb-1" />
                    <p className="text-xs">Normal</p>
                    <p className="text-[10px] text-slate-500">Consultation standard</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedUrgence('urgent')}
                    className={`p-3 rounded-xl border text-center transition ${
                      selectedUrgence === 'urgent'
                        ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold ring-2 ring-amber-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full bg-amber-500 mx-auto mb-1" />
                    <p className="text-xs">Urgent</p>
                    <p className="text-[10px] text-slate-500">Délai &lt; 20 min</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedUrgence('critique')}
                    className={`p-3 rounded-xl border text-center transition ${
                      selectedUrgence === 'critique'
                        ? 'bg-rose-50 border-rose-500 text-rose-900 font-bold ring-2 ring-rose-500/20 animate-pulse'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full bg-rose-600 mx-auto mb-1" />
                    <p className="text-xs">Critique</p>
                    <p className="text-[10px] text-slate-500">Prise en charge vitale immédiate</p>
                  </button>
                </div>
              </div>

              {/* Vitals Input Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Température (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={vitals.temperature}
                    onChange={e => setVitals({ ...vitals, temperature: parseFloat(e.target.value) || 37 })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tension Artérielle (ex: 120/80)</label>
                  <input
                    type="text"
                    value={vitals.tensionArterielle}
                    onChange={e => setVitals({ ...vitals, tensionArterielle: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Pouls (bpm)</label>
                  <input
                    type="number"
                    value={vitals.frequenceCardiaque}
                    onChange={e => setVitals({ ...vitals, frequenceCardiaque: parseInt(e.target.value) || 80 })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Saturation O2 (%)</label>
                  <input
                    type="number"
                    value={vitals.saturationO2}
                    onChange={e => setVitals({ ...vitals, saturationO2: parseInt(e.target.value) || 98 })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Glycémie (mg/dL)</label>
                  <input
                    type="number"
                    value={vitals.glycemie || ''}
                    onChange={e => setVitals({ ...vitals, glycemie: parseFloat(e.target.value) || undefined })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Échelle Douleur (0 à 10)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={vitals.douleurEchelle || 0}
                    onChange={e => setVitals({ ...vitals, douleurEchelle: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Target Doctor Assignment */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Orienter vers le Médecin Praticien :
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={e => setSelectedDoctorId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 font-semibold"
                >
                  {users
                    .filter(u => u.role === 'medecin' || u.role === 'directeur')
                    .map(doc => (
                      <option key={doc.id} value={doc.id}>
                        {doc.prenom} {doc.nom} ({doc.specialite || 'Médecine Générale & Urgences'})
                      </option>
                    ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Le médecin sélectionné recevra immédiatement une notification avec les constantes vitales.
                </p>
              </div>

              {/* Observations */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observations de l'Infirmier de Triage :
                </label>
                <textarea
                  value={vitals.notesInfirmier || ''}
                  onChange={e => setVitals({ ...vitals, notesInfirmier: e.target.value })}
                  rows={2}
                  className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTriageTicket(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Valider le Triage & Notifier le Médecin</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
