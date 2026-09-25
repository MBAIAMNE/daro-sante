import React, { useState, useMemo } from 'react';
import {
  Building2,
  Globe2,
  Search,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Ambulance,
  PhoneCall,
  User,
  Heart,
  FileText,
  ShieldCheck,
  Plus,
  X,
  Printer,
  ChevronRight,
  Activity,
  Droplet,
  Send,
  Download,
  Share2,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { TransfertInterHopital, StatutTransfertHopital, DegreUrgenceTransfert } from '../types';
import { Logo } from '../components/Logo';

export const InterHopitauxView: React.FC = () => {
  const {
    currentEtablissement,
    currentUser,
    etablissements,
    patients,
    allPatients,
    transfertsInterHopitaux,
    initierTransfertInterHopital,
    mettreAJourStatutTransfert,
    rechercherDossierNationalUrgence,
  } = useClinic();

  const [activeTab, setActiveTab] = useState<'transferts' | 'recherche_dmp' | 'coordination'>('transferts');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedStatutFilter, setSelectedStatutFilter] = useState<string>('tous');

  // Modal Nouveau Transfert
  const [showNewTransfertModal, setShowNewTransfertModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [selectedDestEtabId, setSelectedDestEtabId] = useState(
    etablissements.find(e => e.id !== currentEtablissement?.id)?.id || 'etab-2'
  );
  const [degreUrgence, setDegreUrgence] = useState<DegreUrgenceTransfert>('vital_immediat');
  const [moyenTransport, setMoyenTransport] = useState<'ambulance_samu15' | 'ambulance_privee' | 'vehicule_famille'>('ambulance_samu15');
  const [motifTransfert, setMotifTransfert] = useState('');
  const [syntheseClinique, setSyntheseClinique] = useState('');

  // Détail Transfert Modal / Fiche de liaison
  const [detailTransfert, setDetailTransfert] = useState<TransfertInterHopital | null>(null);

  // DMP Search State
  const [dmpSearchQuery, setDmpSearchQuery] = useState('');
  const [dmpSearchResult, setDmpSearchResult] = useState<ReturnType<typeof rechercherDossierNationalUrgence> | null>(null);
  const [hasSearchedDmp, setHasSearchedDmp] = useState(false);

  // Filter transferts
  const filteredTransferts = useMemo(() => {
    return transfertsInterHopitaux.filter(t => {
      const q = searchFilter.toLowerCase().trim();
      const matchSearch =
        !q ||
        t.numero.toLowerCase().includes(q) ||
        t.patientNom.toLowerCase().includes(q) ||
        t.patientMatricule.toLowerCase().includes(q) ||
        t.etablissementSourceNom.toLowerCase().includes(q) ||
        t.etablissementDestNom.toLowerCase().includes(q);

      const matchStatut =
        selectedStatutFilter === 'tous' || t.statut === selectedStatutFilter;

      return matchSearch && matchStatut;
    });
  }, [transfertsInterHopitaux, searchFilter, selectedStatutFilter]);

  const handleLaunchDmpSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dmpSearchQuery.trim()) return;
    const res = rechercherDossierNationalUrgence(dmpSearchQuery);
    setDmpSearchResult(res);
    setHasSearchedDmp(true);
  };

  const handleCreateTransfert = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find(p => p.id === selectedPatientId) || patients[0];
    const destEtab = etablissements.find(e => e.id === selectedDestEtabId);

    if (!pat || !destEtab) return;

    initierTransfertInterHopital({
      patientId: pat.id,
      patientNom: `${pat.prenom} ${pat.nom}`,
      patientMatricule: pat.matricule,
      patientAge: pat.age,
      patientSexe: pat.sexe,
      patientGroupeSanguin: pat.groupeSanguin && pat.groupeSanguin !== 'Inconnu' ? pat.groupeSanguin : undefined,
      patientAllergies: pat.allergies || [],
      etablissementSourceId: currentEtablissement?.id || pat.etablissementId || 'etab-1',
      etablissementSourceNom: currentEtablissement?.nom || 'Clinique Médicale Espoir',
      etablissementDestId: destEtab.id,
      etablissementDestNom: destEtab.nom,
      medecinEmetteurId: currentUser.id,
      medecinEmetteurNom: `${currentUser.prenom} ${currentUser.nom}`,
      motifTransfert: motifTransfert.trim() || 'Nécessité de prise en charge spécialisée et plateau technique complémentaire.',
      degreUrgence,
      moyenTransport,
      syntheseClinique: syntheseClinique.trim() || `Patient ${pat.prenom} ${pat.nom}, ${pat.age} ans. Dossier médical partagé transmis d'urgence via la plateforme sécurisée DARÔ.`,
      examensTransmis: ['Derniers bilans biologiques', 'Compte-rendu imagerie'],
      ordonnancesTransmises: ['Traitements d\'urgence administrés avant évacuation'],
    });

    setShowNewTransfertModal(false);
    setMotifTransfert('');
    setSyntheseClinique('');
    setActiveTab('transferts');
  };

  const printFicheLiaison = (trf: TransfertInterHopital) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Fiche de Liaison SAMU 15 - ${trf.numero}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 24px; color: #0f172a; line-height: 1.4; }
            .header { border-bottom: 2px solid #0b3c5d; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
            .badge-urg { background: #fee2e2; color: #991b1b; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
            .box { border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; }
            .title { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #64748b; margin-bottom: 4px; }
            .val { font-size: 14px; font-weight: 600; color: #0f172a; }
            .synthese { background: #f8fafc; border: 1px dashed #94a3b8; padding: 12px; border-radius: 6px; margin-top: 12px; font-size: 13px; }
            .footer { margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 10px; color: #64748b; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h2 style="margin:0; color:#0b3c5d;">RÉSEAU INTER-HÔPITAUX N'DJAMENA (TCHAD)</h2>
              <p style="margin:2px 0 0 0; font-size:12px; color:#64748b;">FICHE DE LIAISON MÉDICALISÉE & DOSSIER D'URGENCE (SAMU 15)</p>
            </div>
            <div style="text-align:right;">
              <span class="badge-urg">URGENCE : ${trf.degreUrgence.toUpperCase()}</span>
              <div style="font-size:12px; font-weight:bold; margin-top:4px;">N° ${trf.numero}</div>
            </div>
          </div>

          <div class="grid">
            <div class="box">
              <div class="title">ÉTABLISSEMENT SOURCE (ÉMETTEUR)</div>
              <div class="val">${trf.etablissementSourceNom}</div>
              <div style="font-size:12px; color:#64748b; margin-top:4px;">Médecin : ${trf.medecinEmetteurNom}</div>
              <div style="font-size:12px; color:#64748b;">Date demande : ${trf.dateDemande}</div>
            </div>
            <div class="box">
              <div class="title">ÉTABLISSEMENT DESTINATAIRE (RÉCEPTEUR)</div>
              <div class="val">${trf.etablissementDestNom}</div>
              <div style="font-size:12px; color:#64748b; margin-top:4px;">Moyen : ${trf.moyenTransport.toUpperCase()}</div>
              <div style="font-size:12px; color:#64748b;">Statut : ${trf.statut.toUpperCase()}</div>
            </div>
          </div>

          <div class="box" style="margin-bottom:16px;">
            <div class="title">IDENTITÉ DU PATIENT & DONNÉES VITALES</div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <span style="font-size:16px; font-weight:bold;">${trf.patientNom}</span>
                <span style="font-size:13px; color:#475569;"> (${trf.patientAge} ans, Sexe ${trf.patientSexe})</span>
              </div>
              <div>
                <span style="font-size:13px; font-weight:bold; color:#0b3c5d;">Matricule National : ${trf.patientMatricule}</span>
              </div>
            </div>
            <div style="display:flex; gap:24px; margin-top:8px; font-size:12px;">
              <div><strong>Groupe Sanguin :</strong> ${trf.patientGroupeSanguin}</div>
              <div><strong>Allergies signalées :</strong> ${trf.patientAllergies.length > 0 ? trf.patientAllergies.join(', ') : 'Aucune allergie connue'}</div>
            </div>
          </div>

          <div class="box">
            <div class="title">MOTIF CLINIQUE DU TRANSFERT</div>
            <div style="font-size:13px; font-weight:600; color:#b91c1c;">${trf.motifTransfert}</div>
            <div class="synthese">
              <strong>SYNTHÈSE CLINIQUE & CONSTANTES AU DÉPART :</strong><br/>
              ${trf.syntheseClinique}
            </div>
          </div>

          <div class="footer">
            <span>Plateforme Numérique Hospitalière DARÔ Santé • République du Tchad</span>
            <span>Document horodaté et certifié conforme aux protocoles SAMU 15</span>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0B3C5D] via-[#155e75] to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 bg-white/10 rounded-lg">
              <Globe2 className="w-5 h-5 text-teal-300" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-200">
              Réseau Hospitalier National • N'Djamena
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Inter-Hôpitaux & Dossier Médical Partagé (DMP)
          </h1>
          <p className="text-sm text-slate-200 mt-1 max-w-2xl leading-relaxed">
            Chaque établissement gère ses dossiers de manière indépendante. En cas de nécessité clinique ou d'urgence,
            cette passerelle sécurisée coordonne les transferts médicalisés, SAMU 15 et le partage des constantes vitales.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          <button
            onClick={() => setShowNewTransfertModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Initier un Transfert</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('transferts')}
          className={`flex items-center gap-2 pb-3 px-4 font-bold text-sm transition-all border-b-2 cursor-pointer ${
            activeTab === 'transferts'
              ? 'border-[#0B3C5D] text-[#0B3C5D]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Ambulance className="w-4 h-4" />
          <span>Transferts & Évacuations ({transfertsInterHopitaux.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('recherche_dmp')}
          className={`flex items-center gap-2 pb-3 px-4 font-bold text-sm transition-all border-b-2 cursor-pointer ${
            activeTab === 'recherche_dmp'
              ? 'border-[#0B3C5D] text-[#0B3C5D]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Recherche d'Urgence DMP Tchad</span>
        </button>

        <button
          onClick={() => setActiveTab('coordination')}
          className={`flex items-center gap-2 pb-3 px-4 font-bold text-sm transition-all border-b-2 cursor-pointer ${
            activeTab === 'coordination'
              ? 'border-[#0B3C5D] text-[#0B3C5D]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Hôpitaux Partenaires & SAMU 15</span>
        </button>
      </div>

      {/* TAB 1: TRANSFERTS INTER-HÔPITAUX */}
      {activeTab === 'transferts' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                placeholder="Filtrer par patient, matricule, hôpital..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0B3C5D] focus:ring-1 focus:ring-[#0B3C5D]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-500">Statut :</span>
              <select
                value={selectedStatutFilter}
                onChange={e => setSelectedStatutFilter(e.target.value)}
                className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
              >
                <option value="tous">Tous les transferts</option>
                <option value="en_attente_accord">En attente d'accord</option>
                <option value="accepte_en_route">Accepté - En route</option>
                <option value="patient_admis">Patient admis</option>
                <option value="refuse">Refusé</option>
              </select>
            </div>
          </div>

          {/* List of Transfers */}
          <div className="grid grid-cols-1 gap-4">
            {filteredTransferts.map(trf => {
              const isUrgentVital = trf.degreUrgence === 'vital_immediat';
              return (
                <div
                  key={trf.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        isUrgentVital
                          ? 'bg-rose-100 text-rose-700 animate-pulse'
                          : trf.degreUrgence === 'urgent'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      <Ambulance className="w-6 h-6" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-[#0B3C5D] text-base">{trf.numero}</span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            trf.degreUrgence === 'vital_immediat'
                              ? 'bg-rose-100 text-rose-800'
                              : trf.degreUrgence === 'urgent'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {trf.degreUrgence === 'vital_immediat'
                            ? '🔴 Vital Immédiat (SAMU 15)'
                            : trf.degreUrgence === 'urgent'
                            ? '🟠 Urgent (< 2h)'
                            : '🔵 Programmé'}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            trf.statut === 'accepte_en_route'
                              ? 'bg-teal-100 text-teal-800'
                              : trf.statut === 'patient_admis'
                              ? 'bg-emerald-100 text-emerald-800'
                              : trf.statut === 'en_attente_accord'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {trf.statut === 'accepte_en_route'
                            ? 'Ambulance en route'
                            : trf.statut === 'patient_admis'
                            ? 'Patient admis'
                            : trf.statut === 'en_attente_accord'
                            ? 'En attente d\'accord'
                            : trf.statut}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                        <span>{trf.patientNom}</span>
                        <span className="text-xs text-slate-500 font-normal">
                          ({trf.patientAge} ans • Groupe {trf.patientGroupeSanguin} • Matr: {trf.patientMatricule})
                        </span>
                      </h3>

                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
                        <span className="text-[#0B3C5D]">{trf.etablissementSourceNom}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-emerald-700">{trf.etablissementDestNom}</span>
                        <span className="text-slate-400">•</span>
                        <span>{trf.dateDemande}</span>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 max-w-2xl mt-1">
                        <strong className="text-slate-700">Motif :</strong> {trf.motifTransfert}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0">
                    {trf.statut === 'en_attente_accord' && (
                      <button
                        onClick={() => mettreAJourStatutTransfert(trf.id, 'accepte_en_route', 'Ambulance SAMU 15 validée')}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg transition-all cursor-pointer"
                      >
                        Accepter & Lancer l'Ambulance
                      </button>
                    )}

                    {trf.statut === 'accepte_en_route' && (
                      <button
                        onClick={() => mettreAJourStatutTransfert(trf.id, 'patient_admis', 'Patient pris en charge aux urgences vitales')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all cursor-pointer"
                      >
                        Confirmer l'Admission
                      </button>
                    )}

                    <button
                      onClick={() => setDetailTransfert(trf)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg transition-all cursor-pointer"
                    >
                      Détails & Constantes
                    </button>

                    <button
                      onClick={() => printFicheLiaison(trf)}
                      className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all cursor-pointer"
                      title="Imprimer fiche de liaison SAMU 15"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: RECHERCHE D'URGENCE DMP */}
      {activeTab === 'recherche_dmp' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold text-[#0B3C5D]">
              Recherche Nationale de Dossier d'Urgence (DMP Tchad)
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              En cas d'arrivée d'un patient inconscient ou référé d'un autre hôpital de N'Djamena, entrez son Matricule
              National ou son numéro de téléphone pour afficher instantanément sa fiche vitale d'urgence.
            </p>
          </div>

          <form onSubmit={handleLaunchDmpSearch} className="flex gap-2 max-w-xl">
            <input
              type="text"
              value={dmpSearchQuery}
              onChange={e => setDmpSearchQuery(e.target.value)}
              placeholder="ex: NDJ-2025-0812 ou +235 66 12 34 56"
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#0B3C5D] focus:ring-1 focus:ring-[#0B3C5D] text-sm"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#0B3C5D] hover:bg-[#155e75] text-white font-bold text-sm rounded-xl transition-all cursor-pointer flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Consulter DMP</span>
            </button>
          </form>

          {hasSearchedDmp && (
            <div className="pt-4 border-t border-slate-100">
              {dmpSearchResult?.patient ? (
                <div className="p-6 bg-slate-50 border border-teal-200 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-teal-600 text-white font-black text-lg flex items-center justify-center">
                        {dmpSearchResult.patient.prenom[0]}
                        {dmpSearchResult.patient.nom[0]}
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900">
                          {dmpSearchResult.patient.prenom} {dmpSearchResult.patient.nom}
                        </h3>
                        <p className="text-xs text-slate-500 font-semibold">
                          Matricule : {dmpSearchResult.patient.matricule} • Dossier d'origine : {dmpSearchResult.sourceHopital}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Pass Certifié Réseau DARÔ
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Groupe Sanguin</span>
                      <span className="text-xl font-black text-rose-600">
                        {dmpSearchResult.patient.groupeSanguin && dmpSearchResult.patient.groupeSanguin !== 'Inconnu'
                          ? dmpSearchResult.patient.groupeSanguin
                          : 'Non déterminé'}
                      </span>
                      <span className="text-xs text-slate-400 block mt-0.5">
                        Hb: {dmpSearchResult.patient.electrophoreseHb || 'Non renseigné'}
                      </span>
                    </div>

                    <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Allergies Signalées</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {dmpSearchResult.patient.allergies && dmpSearchResult.patient.allergies.length > 0 ? (
                          dmpSearchResult.patient.allergies.map((alg, i) => (
                            <span key={i} className="text-xs font-bold px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-md">
                              {alg}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-emerald-700 font-semibold">Aucune allergie connue</span>
                        )}
                      </div>
                    </div>

                    <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Contact Famille</span>
                      {dmpSearchResult.patient.contactUrgenceNom ? (
                        <>
                          <span className="text-sm font-bold text-slate-900 block mt-0.5">
                            {dmpSearchResult.patient.contactUrgenceNom} {dmpSearchResult.patient.contactUrgenceRelation ? `(${dmpSearchResult.patient.contactUrgenceRelation})` : ''}
                          </span>
                          <span className="text-xs text-teal-700 font-semibold block">
                            {dmpSearchResult.patient.contactUrgenceTel || 'N/A'}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 italic block mt-1">Non renseigné</span>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                    <span>🔒 Accès d'urgence tracé et horodaté dans le journal de sécurité HDS.</span>
                    <span className="font-semibold text-slate-700">
                      Localisation : {dmpSearchResult.patient.adresse || (dmpSearchResult.patient.quartier ? `Quartier ${dmpSearchResult.patient.quartier}, N'Djamena` : "N'Djamena, Tchad")}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="font-bold text-slate-700">Aucun dossier trouvé pour « {dmpSearchQuery} »</p>
                  <p className="text-xs mt-1">Vérifiez le matricule ou essayez avec le numéro de téléphone du patient.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: HÔPITAUX DU RÉSEAU & SAMU */}
      {activeTab === 'coordination' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {etablissements.map(etab => {
            const isCurrent = etab.id === currentEtablissement?.id;
            return (
              <div
                key={etab.id}
                className={`p-5 rounded-2xl border bg-white shadow-xs space-y-3 transition-all ${
                  isCurrent ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
                    {etab.code}
                  </span>
                  {isCurrent && (
                    <span className="px-2.5 py-0.5 bg-teal-100 text-teal-800 text-[10px] font-bold rounded-full">
                      Votre Établissement
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-black text-slate-900 text-base leading-tight">{etab.nom}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{etab.adresse}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold">{etab.telephone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Dir: {etab.directeurNom}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md block text-center">
                    Garde Urgences & Réanimation 24/7
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: NOUVEAU TRANSFERT */}
      {showNewTransfertModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                  <Ambulance className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">Initier un Transfert Médicalisé</h3>
                  <p className="text-xs text-slate-500">Liaison inter-hospitalière & SAMU 15 Tchad</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewTransfertModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransfert} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Patient à transférer
                </label>
                <select
                  value={selectedPatientId}
                  onChange={e => setSelectedPatientId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-slate-50"
                  disabled={patients.length === 0}
                >
                  {patients.length === 0 ? (
                    <option value="">Aucun patient enregistré dans cet établissement</option>
                  ) : (
                    patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.prenom} {p.nom} ({p.matricule}{p.age ? ` • ${p.age} ans` : ''}{p.groupeSanguin && p.groupeSanguin !== 'Inconnu' ? ` • Groupe ${p.groupeSanguin}` : ''})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Hôpital Destinataire
                  </label>
                  <select
                    value={selectedDestEtabId}
                    onChange={e => setSelectedDestEtabId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-slate-50"
                  >
                    {etablissements
                      .filter(e => e.id !== currentEtablissement?.id)
                      .map(e => (
                        <option key={e.id} value={e.id}>
                          {e.nom}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Degré d'Urgence
                  </label>
                  <select
                    value={degreUrgence}
                    onChange={e => setDegreUrgence(e.target.value as DegreUrgenceTransfert)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-slate-50"
                  >
                    <option value="vital_immediat">🔴 Vital Immédiat (SAMU 15)</option>
                    <option value="urgent">🟠 Urgent (&lt; 2 heures)</option>
                    <option value="programme">🔵 Programmé (Avis spécialiste)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Moyen de transport / Évacuation
                </label>
                <select
                  value={moyenTransport}
                  onChange={e => setMoyenTransport(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold bg-slate-50"
                >
                  <option value="ambulance_samu15">Ambulance Médicalisée SAMU 15</option>
                  <option value="ambulance_privee">Ambulance Privée Clinique</option>
                  <option value="vehicule_famille">Véhicule particulier escorté</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Motif Médical du Transfert
                </label>
                <input
                  type="text"
                  required
                  value={motifTransfert}
                  onChange={e => setMotifTransfert(e.target.value)}
                  placeholder="ex: Suspicion fracture crânienne - Nécessité Scanner TDM et bloc opératoire"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Synthèse Clinique & Constantes au départ
                </label>
                <textarea
                  rows={3}
                  required
                  value={syntheseClinique}
                  onChange={e => setSyntheseClinique(e.target.value)}
                  placeholder="Glasgow, Tension artérielle, saturation O2, gestes d'urgence pratiqués avant départ..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowNewTransfertModal(false)}
                  className="px-4 py-2 text-slate-600 text-xs font-bold hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmettre au Réseau</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DÉTAIL D'UN TRANSFERT */}
      {detailTransfert && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-xs font-bold text-slate-500">TRANSFERT {detailTransfert.numero}</span>
                <h3 className="text-lg font-black text-slate-900">{detailTransfert.patientNom}</h3>
              </div>
              <button
                onClick={() => setDetailTransfert(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="font-bold text-slate-700">Trajet Médicalisé :</div>
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <span>{detailTransfert.etablissementSourceNom}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-emerald-700">{detailTransfert.etablissementDestNom}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 block">Motif du transfert :</span>
                <p className="text-slate-600 mt-0.5">{detailTransfert.motifTransfert}</p>
              </div>

              <div>
                <span className="font-bold text-slate-700 block">Synthèse clinique :</span>
                <p className="text-slate-600 bg-amber-50/50 p-2.5 rounded-lg border border-amber-200/50 mt-0.5">
                  {detailTransfert.syntheseClinique}
                </p>
              </div>

              {detailTransfert.observationsDestinataire && (
                <div>
                  <span className="font-bold text-slate-700 block">Observations du centre récepteur :</span>
                  <p className="text-teal-800 bg-teal-50 p-2 rounded-lg border border-teal-200 mt-0.5">
                    {detailTransfert.observationsDestinataire}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t">
              <button
                onClick={() => printFicheLiaison(detailTransfert)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimer fiche SAMU</span>
              </button>
              <button
                onClick={() => setDetailTransfert(null)}
                className="px-4 py-1.5 bg-[#0B3C5D] text-white font-bold text-xs rounded-lg"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
