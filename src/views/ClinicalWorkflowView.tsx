import React, { useState, useMemo } from 'react';
import {
  Activity,
  Clock,
  UserCheck,
  Stethoscope,
  Microscope,
  CreditCard,
  Pill,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Search,
  Filter,
  Users,
  Building2,
  Phone,
  MapPin,
  Flame,
  Zap,
  ChevronRight,
  ExternalLink,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { QueueTicket, UrgenceLevel } from '../types';

export const ClinicalWorkflowView: React.FC = () => {
  const {
    queue,
    patients,
    users,
    exams,
    invoices,
    medications,
    currentEtablissement,
    currentRole,
    setCurrentView,
    setSelectedPatientForDetail,
  } = useClinic();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStationFilter, setSelectedStationFilter] = useState<string>('all');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('all');

  // Stats for the live hospital production line
  const totalInClinic = queue.length;
  const criticalCount = queue.filter(q => q.priorite === 'critique' || q.niveauUrgence === 'critique').length;
  const triageDoneCount = queue.filter(q => q.statut === 'triage_fait').length;
  const inConsultationCount = queue.filter(q => q.statut === 'en_consultation').length;
  const pendingExams = exams.filter(e => e.statut === 'prescrit' || e.statut === 'en_cours').length;
  const pendingInvoices = invoices.filter(i => i.statut === 'en_attente').length;

  // Real-time stations in N'Djamena clinical production flow
  const workflowStations = [
    {
      id: 'admissions',
      stepNumber: '01',
      title: 'Accueil & Admissions',
      subtitle: 'Guichet d\'entrée',
      description: 'Enregistrement rapide (Nom, Tél Airtel/Moov, Quartier), attribution du numéro de passage.',
      icon: Users,
      color: 'border-blue-200 bg-blue-50/70 text-blue-800',
      iconColor: 'text-blue-600 bg-blue-100',
      activeCount: queue.filter(q => q.statut === 'en_attente').length,
      viewTarget: 'queue',
      roleBadge: 'Accueil / Admissions',
    },
    {
      id: 'triage',
      stepNumber: '02',
      title: 'Triage & Constantes Vitales',
      subtitle: 'Box de soins infirmier',
      description: 'Prise de TA, Température, Pouls, Glycémie, SaO2 et cotation de gravité (Rouge/Jaune/Vert).',
      icon: Activity,
      color: 'border-teal-200 bg-teal-50/70 text-teal-800',
      iconColor: 'text-teal-600 bg-teal-100',
      activeCount: queue.filter(q => q.statut === 'en_attente').length,
      viewTarget: 'queue',
      roleBadge: 'Infirmier Triage',
    },
    {
      id: 'caisse',
      stepNumber: '03',
      title: 'Caisse & Modalités Locales',
      subtitle: 'Règlements & Tiers-Payant',
      description: 'Espèces FCFA, Airtel Money, Moov Money, Prise en charge CNPS / Assurances (dérogation vitale).',
      icon: CreditCard,
      color: 'border-emerald-200 bg-emerald-50/70 text-emerald-800',
      iconColor: 'text-emerald-600 bg-emerald-100',
      activeCount: pendingInvoices,
      viewTarget: 'billing',
      roleBadge: 'Caisse / Accueil',
    },
    {
      id: 'consultation',
      stepNumber: '04',
      title: 'Consultations Médicales',
      subtitle: 'Cabinet & Box Médecins',
      description: 'Appel du patient prioritaire, diagnostic ciblé (Paludisme, Typhoïde, HTA), prescription numérique.',
      icon: Stethoscope,
      color: 'border-indigo-200 bg-indigo-50/70 text-indigo-800',
      iconColor: 'text-indigo-600 bg-indigo-100',
      activeCount: queue.filter(q => q.statut === 'triage_fait' || q.statut === 'en_consultation').length,
      viewTarget: 'consultations',
      roleBadge: 'Médecin Praticien',
    },
    {
      id: 'labo_imagerie',
      stepNumber: '05',
      title: 'Plateaux Techniques',
      subtitle: 'Laboratoire & Radiologie',
      description: 'Analyses directes (Goutte Épaisse, Widal, NFS, Glycémie) & Radiographies sans support papier égaré.',
      icon: Microscope,
      color: 'border-cyan-200 bg-cyan-50/70 text-cyan-800',
      iconColor: 'text-cyan-600 bg-cyan-100',
      activeCount: pendingExams,
      viewTarget: 'examens',
      roleBadge: 'Techniciens Labo/Radio',
    },
    {
      id: 'pharmacie_soins',
      stepNumber: '06',
      title: 'Pharmacie & Dispensation',
      subtitle: 'Officine & Perfusion',
      description: 'Délivrance immédiate des solutés et antipaludiques, orientation officine de garde si rupture.',
      icon: Pill,
      color: 'border-rose-200 bg-rose-50/70 text-rose-800',
      iconColor: 'text-rose-600 bg-rose-100',
      activeCount: medications.filter(m => m.quantiteEnStock <= m.seuilAlerte).length,
      viewTarget: 'pharmacie',
      roleBadge: 'Pharmacie & Soins',
    },
  ];

  // Patients mapped with active workflow position
  const activePatientsInFlow = useMemo(() => {
    return queue.map((ticket, index) => {
      const pat = patients.find(p => p.id === ticket.patientId);
      const doctor = users.find(u => u.id === ticket.orienteVersMedecinId);
      const patExams = exams.filter(e => e.patientId === ticket.patientId);
      const patInvoices = invoices.filter(i => i.patientId === ticket.patientId);

      // Determine precise station
      let currentStation = 'Admissions / Attente Triage';
      let stationId = 'admissions';
      let stationColor = 'bg-blue-100 text-blue-800 border-blue-200';

      if (ticket.statut === 'en_consultation') {
        currentStation = 'En Consultation avec ' + (doctor ? `${doctor.prenom} ${doctor.nom}` : 'le Médecin');
        stationId = 'consultation';
        stationColor = 'bg-indigo-100 text-indigo-800 border-indigo-200';
      } else if (ticket.statut === 'triage_fait') {
        if (patExams.some(e => e.statut === 'prescrit' || e.statut === 'en_cours')) {
          currentStation = 'Au Laboratoire / Examens en cours';
          stationId = 'labo_imagerie';
          stationColor = 'bg-cyan-100 text-cyan-800 border-cyan-200';
        } else {
          currentStation = 'Attente Appel Médecin (Triage validé)';
          stationId = 'consultation';
          stationColor = 'bg-teal-100 text-teal-800 border-teal-200';
        }
      }

      return {
        ticket,
        patient: pat,
        patientNom: pat ? `${pat.prenom} ${pat.nom}` : ticket.patientNom,
        quartier: pat?.quartier || 'Sabangali, N\'Djamena',
        telephone: pat?.telephone || '+235 66 00 00 00',
        age: pat?.age || 30,
        sexe: pat?.sexe || 'M',
        priorite: ticket.priorite,
        vitals: ticket.constantesVitales,
        currentStation,
        stationId,
        stationColor,
        motif: ticket.motifArrivee,
        heureArrivee: ticket.heureArrivee,
      };
    });
  }, [queue, patients, users, exams, invoices]);

  // Filtered list
  const filteredPatients = activePatientsInFlow.filter(item => {
    const matchesSearch =
      item.patientNom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.quartier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.motif.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.telephone.includes(searchQuery);

    const matchesStation = selectedStationFilter === 'all' || item.stationId === selectedStationFilter;
    const matchesPriority = selectedPriorityFilter === 'all' || item.priorite === selectedPriorityFilter;

    return matchesSearch && matchesStation && matchesPriority;
  });

  const getPriorityBadge = (prio: UrgenceLevel) => {
    switch (prio) {
      case 'critique':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-rose-600 text-white animate-pulse shadow-xs">
            <Flame className="w-3.5 h-3.5" />
            🔴 Urgence Vitale Immédiate
          </span>
        );
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            🟡 Urgence Relative
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            🟢 Consultation Simple
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner: Context N'Djamena & Production Flow */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0B3C5D] via-[#114B73] to-[#1E88E5] text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-bold text-teal-200 border border-white/20">
            <Activity className="w-3.5 h-3.5 text-teal-300" />
            <span>Organisation Optimisée pour le Tchad • N'Djamena</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Chaîne de Production de Soins Hospitalière
          </h1>
          <p className="text-sm sm:text-base text-blue-100 leading-relaxed font-normal">
            Fluidifiez chaque étape de prise en charge pour supprimer les temps d'attente excessifs, éviter les pertes de dossiers papier et prioriser instantanément les urgences vitales.
          </p>
        </div>

        {/* Live Hospital Metrics Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 relative z-10">
          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <span className="text-[11px] text-blue-200 uppercase font-bold block">Patients Présents</span>
            <span className="text-2xl font-black text-white">{totalInClinic}</span>
            <span className="text-[10px] text-teal-200 block mt-0.5">Dans la clinique</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-500/20 backdrop-blur-md border border-rose-300/30">
            <span className="text-[11px] text-rose-200 uppercase font-bold block">Urgences Vitales</span>
            <span className="text-2xl font-black text-rose-300 flex items-center gap-1">
              {criticalCount}
              {criticalCount > 0 && <Flame className="w-4 h-4 text-rose-400 animate-bounce" />}
            </span>
            <span className="text-[10px] text-rose-100 block mt-0.5">Priorité absolue</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <span className="text-[11px] text-blue-200 uppercase font-bold block">Examens Labo/Radio</span>
            <span className="text-2xl font-black text-white">{pendingExams}</span>
            <span className="text-[10px] text-teal-200 block mt-0.5">En cours d'analyse</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <span className="text-[11px] text-blue-200 uppercase font-bold block">Temps Moyen de Passage</span>
            <span className="text-2xl font-black text-emerald-300">32 min</span>
            <span className="text-[10px] text-teal-200 block mt-0.5">Vs 3h auparavant</span>
          </div>
        </div>
      </div>

      {/* The 6 Sequential Stations of Hospital Workflow */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900">
              Les 6 Postes de la Chaîne Hospitalière
            </h2>
            <p className="text-xs text-slate-500">
              Parcours séquentiel du patient : du portail d'accueil jusqu'à la délivrance des soins
            </p>
          </div>
          <button
            onClick={() => setCurrentView('queue')}
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#1E88E5] hover:underline"
          >
            <span>Ouvrir la file d'attente complète</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflowStations.map(station => {
            const Icon = station.icon;
            return (
              <div
                key={station.id}
                onClick={() => setCurrentView(station.viewTarget)}
                className={`p-5 rounded-3xl border-2 transition-all cursor-pointer hover:shadow-md hover:border-blue-400 group relative flex flex-col justify-between ${station.color}`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black tracking-wider uppercase opacity-60">
                      Étape {station.stepNumber}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/80 border border-current shadow-xs">
                      {station.activeCount} en cours
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${station.iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                        {station.title}
                      </h3>
                      <span className="text-[11px] font-bold text-slate-600 block">
                        {station.subtitle}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {station.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-black/5 mt-4 flex items-center justify-between text-xs font-bold">
                  <span className="text-[11px] opacity-75">{station.roleBadge}</span>
                  <span className="flex items-center gap-1 text-[#1E88E5] group-hover:translate-x-1 transition-transform">
                    Accéder au poste
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-Time Patient Tracking in Workflow */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Suivi en Direct des Patients dans la Chaîne</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Localisez immédiatement chaque patient dans la clinique, ses constantes et le praticien en charge
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Patient, téléphone, quartier..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <select
              value={selectedStationFilter}
              onChange={e => setSelectedStationFilter(e.target.value)}
              className="py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
            >
              <option value="all">Tous les Postes</option>
              <option value="admissions">1. Admissions / Triage</option>
              <option value="consultation">2. Consultations</option>
              <option value="labo_imagerie">3. Labo / Imagerie</option>
            </select>

            <select
              value={selectedPriorityFilter}
              onChange={e => setSelectedPriorityFilter(e.target.value)}
              className="py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
            >
              <option value="all">Toutes Priorités</option>
              <option value="critique">🔴 Urgences Vitales</option>
              <option value="urgent">🟡 Urgences Relatives</option>
              <option value="standard">🟢 Standard</option>
            </select>
          </div>
        </div>

        {/* Patients Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <th className="p-3.5">Ticket & Patient</th>
                <th className="p-3.5">Quartier & Contact</th>
                <th className="p-3.5">Degré d'Urgence</th>
                <th className="p-3.5">Constantes Triage</th>
                <th className="p-3.5">Poste Actuel dans la Chaîne</th>
                <th className="p-3.5 text-right">Actions Cliniques</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 text-xs">
                    Aucun patient ne correspond aux critères sélectionnés.
                  </td>
                </tr>
              ) : (
                filteredPatients.map(item => (
                  <tr key={item.ticket.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 text-sm">{item.patientNom}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Ticket #{item.ticket.numero} • {item.age} ans ({item.sexe})
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Arrivé à {item.heureArrivee}</div>
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-1 font-semibold text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{item.quartier}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span>{item.telephone}</span>
                      </div>
                    </td>

                    <td className="p-3.5">
                      {getPriorityBadge(item.priorite)}
                    </td>

                    <td className="p-3.5">
                      {item.vitals ? (
                        <div className="space-y-0.5 text-[11px]">
                          <div className="flex items-center gap-1 font-bold text-slate-800">
                            <span>T° {item.vitals.temperature}°C</span>
                            <span className="text-slate-300">•</span>
                            <span>TA {item.vitals.tensionArterielle}</span>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            FC {item.vitals.frequenceCardiaque} bpm • SaO2 {item.vitals.saturationO2}%
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Non mesurées</span>
                      )}
                    </td>

                    <td className="p-3.5">
                      <span className={`inline-block px-3 py-1 rounded-xl text-xs font-bold border ${item.stationColor}`}>
                        {item.currentStation}
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.stationId === 'admissions' && (
                          <button
                            onClick={() => setCurrentView('queue')}
                            className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors"
                          >
                            Faire le Triage
                          </button>
                        )}

                        {item.stationId === 'consultation' && (
                          <button
                            onClick={() => setCurrentView('consultations')}
                            className="px-3 py-1.5 rounded-xl bg-[#1E88E5] hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center gap-1"
                          >
                            <span>Consulter</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {item.stationId === 'labo_imagerie' && (
                          <button
                            onClick={() => setCurrentView('examens')}
                            className="px-3 py-1.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs transition-colors flex items-center gap-1"
                          >
                            <span>Résultats Labo</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clinical Guidance: Common N'Djamena Pathologies & Fast Response Protocols */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>Protocoles d'Efficacité Médicale N'Djamena</span>
            </h3>
            <p className="text-xs text-slate-400">
              Standards cliniques pour les 5 urgences médicales les plus fréquentes dans les cliniques du Tchad
            </p>
          </div>
          <button
            onClick={() => setCurrentView('consultations')}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-colors shadow-sm"
          >
            Nouvelle Consultation Rapide
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <span className="text-[11px] font-black text-rose-400 uppercase">1. Paludisme Grave / Accès Palustre</span>
            <p className="text-xs text-slate-300 leading-relaxed">
              T° &gt; 39.5°C, prostration, vomissements. TDR Palu &amp; GE immédiats.
              <br />
              <strong>Traitement :</strong> Artésunate injectable IV (2.4 mg/kg) + Perfusion Ringer Lactate.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <span className="text-[11px] font-black text-amber-400 uppercase">2. Fièvre Typhoïde (Salmonellose)</span>
            <p className="text-xs text-slate-300 leading-relaxed">
              Fièvre en plateau, céphalées occipitales, douleur abdominale. Sérodiagnostic Widal &amp; NFS.
              <br />
              <strong>Traitement :</strong> Ciprofloxacine 500mg PO ou Ceftriaxone 1g IV.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <span className="text-[11px] font-black text-teal-400 uppercase">3. Gastro-entérite &amp; Déshydratation</span>
            <p className="text-xs text-slate-300 leading-relaxed">
              Saison des pluies / canicule de mars-mai. Pli cutané, soif intense.
              <br />
              <strong>Traitement :</strong> Sels de Réhydratation Orale (SRO) + Ringer IV + Zinc + Métronidazole.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <span className="text-[11px] font-black text-purple-400 uppercase">4. Crise Drépanocytaire Vaso-occlusive</span>
            <p className="text-xs text-slate-300 leading-relaxed">
              Douleurs osseuses intenses (thorax, membres). Facteur déclenchant : infection ou froid.
              <br />
              <strong>Traitement :</strong> Hyperhydratation IV Sérum Glucosé 5% + Tramadol + Oxygène.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <span className="text-[11px] font-black text-blue-400 uppercase">5. Poussée Hypertensive Aiguë (HTA)</span>
            <p className="text-xs text-slate-300 leading-relaxed">
              TA &gt; 180/100 mmHg, céphalées pulsatiles, vertiges, bourdonnements.
              <br />
              <strong>Traitement :</strong> Amlodipine 10mg PO ou Loxen/Nicardipine + Surveillance ECG.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <span className="text-[11px] font-black text-emerald-400 uppercase">6. Traumatisme Accident Voie Publique</span>
            <p className="text-xs text-slate-300 leading-relaxed">
              Chute de moto ou collision clando. Plaies ouvertes, contusions.
              <br />
              <strong>Traitement :</strong> Nettoyage Bétadine, Sérum antitétanique (SAT) + Radio os/thorax.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
