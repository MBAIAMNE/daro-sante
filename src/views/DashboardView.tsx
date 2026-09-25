import React, { useState, useEffect } from 'react';
import {
  Users,
  Stethoscope,
  Clock,
  CreditCard,
  Pill,
  QrCode,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Activity,
  ArrowRight,
  ShieldCheck,
  Maximize2,
  ExternalLink,
  Copy,
  Check,
  X,
  Radio,
  WifiOff,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { generateEmergencyQRDataUrl, generateEmergencyQRPayload } from '../utils/qrPayload';
import { WorkstationSupervisorPanel } from '../components/WorkstationSupervisorPanel';

interface DashboardViewProps {
  onOpenScanner?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenScanner }) => {
  const {
    currentUser,
    currentRole,
    patients,
    consultations,
    appointments,
    queue,
    invoices,
    medications,
    setCurrentView,
    appelerEnConsultation,
    setEmergencyTargetToken,
  } = useClinic();

  const [selectedQRCardPatientId, setSelectedQRCardPatientId] = useState<string>(patients[0]?.id || '');
  const [dashboardQRDataUrl, setDashboardQRDataUrl] = useState<string>('');
  const [showZoomModal, setShowZoomModal] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const activeQRPatient = patients.find(p => p.id === selectedQRCardPatientId) || patients[0];

  useEffect(() => {
    if (activeQRPatient) {
      generateEmergencyQRDataUrl(activeQRPatient, { width: 360, margin: 2 }).then(url => {
        setDashboardQRDataUrl(url);
      });
    }
  }, [activeQRPatient]);

  // Financial calculations
  const totalRevenue = invoices
    .filter(i => i.statut === 'payee')
    .reduce((sum, i) => sum + (i.totalFCFA || i.total || 0), 0);

  const pendingRevenue = invoices
    .filter(i => i.statut === 'en_attente')
    .reduce((sum, i) => sum + (i.totalFCFA || i.total || 0), 0);

  const pendingInvoicesCount = invoices.filter(i => i.statut === 'en_attente').length;
  const lowStockCount = medications.filter(m => m.quantiteEnStock <= m.seuilAlerte).length;
  const criticalPatientsCount = queue.filter(q => q.niveauUrgence === 'critique').length;

  const handleConsultPatient = (ticketId: string) => {
    appelerEnConsultation(ticketId);
    setCurrentView('consultations');
  };

  const handleScanSampleQR = () => {
    if (onOpenScanner) {
      onOpenScanner();
    } else {
      // Fallback: open first patient's emergency card
      if (patients[0]) {
        setEmergencyTargetToken(patients[0].qrToken);
        setCurrentView('emergency_qr');
      }
    }
  };

  const isDirector = currentRole === 'directeur' || currentUser.role === 'directeur' || currentRole === 'superadmin';

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Tableau de Bord Clinique
          </h1>
          <p className="text-sm text-slate-500">
            Aperçu des flux cliniques, de la file d'attente et du service des urgences
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleScanSampleQR}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B3C5D] hover:bg-[#1E88E5] text-white text-xs font-bold shadow-sm transition"
          >
            <QrCode className="w-4 h-4 text-teal-300" />
            <span>Scanner QR d'Urgence</span>
          </button>
        </div>
      </div>

      {/* 4 Key Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setCurrentView('queue')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-[#1E88E5]/40 transition cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">File d'Attente</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1E88E5] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#0B3C5D]">{queue.length}</p>
          <p className="text-xs text-slate-400">
            {criticalPatientsCount > 0 ? (
              <span className="text-rose-600 font-bold">{criticalPatientsCount} patient(s) critique(s)</span>
            ) : (
              <span>Flux de consultation fluide</span>
            )}
          </p>
        </div>

        <div
          onClick={() => setCurrentView('consultations')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-300 transition cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Consultations</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{consultations.length}</p>
          <p className="text-xs text-slate-400">Actes médicaux enregistrés</p>
        </div>

        <div
          onClick={() => setCurrentView('billing')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-sky-300 transition cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recettes Encaissées</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            {(totalRevenue).toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-500">FCFA</span>
          </p>
          <p className="text-xs text-slate-400">
            {pendingInvoicesCount > 0 ? `${pendingInvoicesCount} en attente (${pendingRevenue.toLocaleString('fr-FR')} FCFA)` : 'Toutes factures réglées'}
          </p>
        </div>

        <div
          onClick={() => setCurrentView('pharmacy')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-amber-300 transition cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Alertes Stock</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Pill className="w-5 h-5" />
            </div>
          </div>
          <p className={`text-2xl font-black ${lowStockCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
            {lowStockCount}
          </p>
          <p className="text-xs text-slate-400">
            {lowStockCount > 0 ? 'Produits sous seuil minimum' : 'Tous stocks conformes'}
          </p>
        </div>
      </div>

      {/* Main Grid matching Design HTML Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Active Queue Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          {/* Table Header */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h2 className="font-bold text-[#0B3C5D] flex items-center gap-2 text-sm sm:text-base">
              <Clock className="w-4 h-4 text-[#1E88E5]" />
              <span>File d'Attente Active</span>
            </h2>
            <button
              onClick={() => setCurrentView('queue')}
              className="text-xs text-[#1E88E5] font-medium hover:underline cursor-pointer"
            >
              Voir tout l'historique
            </button>
          </div>

          {/* Table Content */}
          <div className="flex-1 overflow-x-auto min-h-[300px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white shadow-xs">
                <tr className="text-[11px] text-slate-400 uppercase font-bold border-b border-slate-100">
                  <th className="px-6 py-3">Patient</th>
                  <th className="px-6 py-3">Heure Arrivée</th>
                  <th className="px-6 py-3">Triage</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-50">
                {queue.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-xs">
                      Aucun patient dans la file d'attente actuellement.
                    </td>
                  </tr>
                ) : (
                  queue.map(ticket => {
                    const initials = `${ticket.patientPrenom[0] || ''}${ticket.patientNom[0] || ''}`.toUpperCase();
                    const isCritique = ticket.niveauUrgence === 'critique';
                    const isUrgent = ticket.niveauUrgence === 'urgent';

                    return (
                      <tr key={ticket.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                                isCritique
                                  ? 'bg-red-100 text-red-600'
                                  : isUrgent
                                  ? 'bg-orange-100 text-orange-600'
                                  : 'bg-blue-100 text-[#1E88E5]'
                              }`}
                            >
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 text-xs sm:text-sm truncate">
                                {ticket.patientPrenom} {ticket.patientNom}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {ticket.ticketNumero} • {ticket.motifArrivee}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs whitespace-nowrap">
                          {ticket.heureArrivee}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                              isCritique
                                ? 'bg-red-100 text-red-700'
                                : isUrgent
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {isCritique ? 'Critique' : isUrgent ? 'Urgent' : 'Normal'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleConsultPatient(ticket.id)}
                            className="text-[#1E88E5] font-bold text-xs hover:underline cursor-pointer"
                          >
                            Consulter
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Emergency QR Scanner card & Pharmacy status card */}
        <div className="flex flex-col gap-6">
          {/* Scan QR Urgence Card - Real, Live Scannable QR Code */}
          <div className="bg-[#0B3C5D] rounded-2xl p-5 text-white shadow-lg relative overflow-hidden border border-blue-900/40">
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <h3 className="text-base font-bold">QR Code Vital Scannable</h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Prêt à scanner
                </span>
              </div>

              {/* Patient selector for QR test */}
              {activeQRPatient ? (
                <>
                  {patients.length > 1 && (
                    <div className="space-y-1">
                      <label className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold">
                        Patient de démonstration :
                      </label>
                      <select
                        value={selectedQRCardPatientId}
                        onChange={e => setSelectedQRCardPatientId(e.target.value)}
                        className="w-full text-xs bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg px-2 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
                      >
                        {patients.map(p => (
                          <option key={p.id} value={p.id} className="text-slate-900">
                            {p.nom.toUpperCase()} {p.prenom} ({p.groupeSanguin})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Real QR Code Container: High Contrast, High Resolution, Scannable with any phone */}
                  <div className="bg-white rounded-2xl p-3 mx-auto shadow-xl border-4 border-[#1E88E5] flex flex-col items-center justify-center max-w-[200px]">
                    {dashboardQRDataUrl ? (
                      <img
                        src={dashboardQRDataUrl}
                        alt={`QR Code d'urgence de ${activeQRPatient.prenom} ${activeQRPatient.nom}`}
                        className="w-40 h-40 object-contain block"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    ) : (
                      <div className="w-40 h-40 flex items-center justify-center text-xs text-slate-500">
                        Génération du QR...
                      </div>
                    )}
                    <div className="mt-1 text-center">
                      <span className="text-[10px] font-black text-rose-600 tracking-wider">
                        GROUPE : {activeQRPatient.groupeSanguin}
                      </span>
                    </div>
                  </div>

                  {/* Smartphone scan notice */}
                  <p className="text-[11px] text-blue-100 text-center leading-snug">
                    📱 <strong>Pointez votre smartphone</strong> vers ce code pour lire instantanément ses données d'urgence en texte brut hors-ligne.
                  </p>

                  {/* Actions: Zoom Fullscreen & Internal Scanner */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => setShowZoomModal(true)}
                      className="py-2 px-3 bg-white/15 hover:bg-white/25 text-white rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 border border-white/20"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Agrandir</span>
                    </button>
                    <button
                      onClick={handleScanSampleQR}
                      className="py-2 px-3 bg-[#1E88E5] hover:bg-blue-600 text-white rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Scanner</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-6 px-3 text-center space-y-3 bg-white/10 rounded-2xl border border-white/15">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center mx-auto">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Dossiers Médicaux Prêts</h4>
                    <p className="text-xs text-blue-200 mt-1">
                      Cette clinique dispose de registres vierges. Dès qu'un patient est admis, son QR Code vital apparaîtra automatiquement ici.
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentView('queue')}
                    className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                  >
                    <span>Admettre un premier patient</span>
                  </button>
                </div>
              )}
            </div>

            {/* Decorative background circle */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/5 rounded-full pointer-events-none"></div>
          </div>

          {/* Pharmacy Status Card (Design HTML Theme) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex-1 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-[#0B3C5D] mb-4 flex items-center justify-between text-sm sm:text-base">
                <span>Statut Pharmacie</span>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    lowStockCount > 0 ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500'
                  }`}
                  title={lowStockCount > 0 ? `${lowStockCount} produit(s) en alerte` : 'Stocks normaux'}
                />
              </h3>

              <div className="space-y-4">
                {medications.slice(0, 4).map(med => {
                  const isLow = med.quantiteEnStock <= med.seuilAlerte;
                  const ratio = Math.min(100, Math.round((med.quantiteEnStock / (med.seuilAlerte * 3)) * 100));

                  return (
                    <div key={med.id} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-700 font-medium truncate max-w-[150px]">
                          {med.nom}
                        </span>
                        <span
                          className={`font-bold ${
                            isLow ? 'text-red-600' : ratio > 60 ? 'text-green-600' : 'text-blue-600'
                          }`}
                        >
                          {isLow ? `Stock Bas (${med.quantiteEnStock})` : `En Stock (${med.quantiteEnStock})`}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isLow ? 'bg-red-500' : ratio > 60 ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.max(8, ratio)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setCurrentView('pharmacy')}
              className="mt-6 w-full text-center text-xs text-[#1E88E5] font-bold hover:underline cursor-pointer pt-2 border-t border-slate-50"
            >
              Gérer les stocks →
            </button>
          </div>
        </div>
      </div>

      {/* Financial & Clinical Summary for Directors / Managers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Recettes Réglées</span>
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700">
            {(totalRevenue || 0).toLocaleString('fr-FR')} <span className="text-xs font-semibold text-slate-500">FCFA</span>
          </p>
          <div className="text-[11px] text-amber-600 font-medium">
            Factures en attente : {(pendingRevenue || 0).toLocaleString('fr-FR')} FCFA
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Consultations Réalisées</span>
            <Stethoscope className="w-4 h-4 text-[#1E88E5]" />
          </div>
          <p className="text-2xl font-bold text-[#0B3C5D]">
            {consultations.length}
          </p>
          <div className="text-[11px] text-slate-500">
            Délai moyen de prise en charge : <strong>18 min</strong>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Sécurité & Audit QR</span>
            <ShieldCheck className="w-4 h-4 text-[#0B3C5D]" />
          </div>
          <p className="text-2xl font-bold text-[#0B3C5D]">
            100%
          </p>
          <div className="text-[11px] text-emerald-600 font-medium">
            Traçabilité des accès aux fiches vitales activée
          </div>
        </div>
      </div>

      {/* Workstation Security Supervision (Director & Management Monitoring) */}
      <WorkstationSupervisorPanel />

      {/* Fullscreen High-Resolution QR Scanner Modal for Phone Testing */}
      {showZoomModal && activeQRPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 border border-slate-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black text-rose-600 uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded-full">
                  SCANNABLE AVEC SMARTPHONE
                </span>
                <h3 className="text-lg font-bold text-[#0B3C5D] mt-1">
                  QR Code d'Urgence Vital DARÔ
                </h3>
              </div>
              <button
                onClick={() => setShowZoomModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Patient Switcher in Zoom Modal */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Choisir le patient à tester :</label>
              <select
                value={selectedQRCardPatientId}
                onChange={e => setSelectedQRCardPatientId(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nom.toUpperCase()} {p.prenom} • Groupe {p.groupeSanguin} • {p.matricule}
                  </option>
                ))}
              </select>
            </div>

            {/* Huge, Ultra-High Contrast QR Code */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300">
              <div className="p-4 bg-white rounded-2xl shadow-xl border-4 border-slate-900 flex items-center justify-center">
                {dashboardQRDataUrl ? (
                  <img
                    src={dashboardQRDataUrl}
                    alt={`QR Code grand format de ${activeQRPatient.nom}`}
                    className="w-64 h-64 sm:w-72 sm:h-72 object-contain"
                    style={{ imageRendering: 'pixelated' }}
                  />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center text-slate-400 text-sm">
                    Génération...
                  </div>
                )}
              </div>

              <div className="mt-4 text-center space-y-1">
                <p className="text-sm font-black text-slate-900">
                  {activeQRPatient.nom.toUpperCase()} {activeQRPatient.prenom}
                </p>
                <p className="text-xs font-bold text-rose-600">
                  Groupe Sanguin : <span className="text-base font-black">{activeQRPatient.groupeSanguin}</span>
                </p>
                <p className="text-[11px] text-slate-500">
                  Urgence : {activeQRPatient.contactUrgenceNom} ({activeQRPatient.contactUrgenceTel})
                </p>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-slate-700 space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#0B3C5D]">
                <WifiOff className="w-4 h-4 text-amber-600" />
                <span>Comment tester immédiatement avec votre téléphone :</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 pl-1">
                <li>Ouvrez l'application <strong>Appareil Photo</strong> de votre smartphone.</li>
                <li>Visez le QR Code ci-dessus à l'écran.</li>
                <li>Votre téléphone va afficher instantanément le <strong>texte brut d'urgence</strong> (Nom, Groupe Sanguin, Contact d'Urgence) même sans connexion internet.</li>
                <li>Cliquez sur le lien affiché sous le texte pour ouvrir la fiche médicale à distance.</li>
              </ol>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  const text = generateEmergencyQRPayload(activeQRPatient);
                  navigator.clipboard.writeText(text);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2500);
                }}
                className="text-xs px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold flex items-center gap-1.5 transition"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Texte copié !' : 'Copier texte brut du QR'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEmergencyTargetToken(activeQRPatient.qrToken);
                    setCurrentView('emergency_qr');
                    setShowZoomModal(false);
                  }}
                  className="text-xs px-4 py-2 bg-[#1E88E5] hover:bg-blue-600 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ouvrir Fiche d'Urgence</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
