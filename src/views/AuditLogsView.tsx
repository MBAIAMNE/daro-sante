import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Lock,
  Unlock,
  Eye,
  Clock,
  User,
  Calendar,
  Filter,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';

export const AuditLogsView: React.FC = () => {
  const { auditLogs, currentRole, patients } = useClinic();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<'tous' | 'public' | 'deverrouille'>('tous');

  const isAuthorized = ['directeur', 'responsable_soins', 'gestionnaire', 'superadmin'].includes(currentRole);

  if (!isAuthorized) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Accès Restreint aux Logs de Sécurité</h2>
        <p className="text-xs text-slate-500">
          Le registre d'audit des accès aux dossiers d'urgence est exclusivement consultable par la Direction Médicale et la Responsable des Soins.
        </p>
      </div>
    );
  }

  const filtered = auditLogs.filter(log => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      log.patientNom.toLowerCase().includes(q) ||
      log.agentNom.toLowerCase().includes(q) ||
      log.qrToken.toLowerCase().includes(q);
    const matchesFilter =
      filterAction === 'tous' ||
      (filterAction === 'public' && log.action === 'consultation_urgence_publique') ||
      (filterAction === 'deverrouille' && log.action === 'dossier_deverrouille');
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B3C5D]">Registre d'Audit & Sécurité QR</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold">
              {auditLogs.length} accès enregistrés
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Traçabilité légale et horodatage de chaque scan de QR code ou déverrouillage de dossier patient
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <FileCheck className="w-4 h-4" />
          <span>Conforme Déontologie & Secret Médical</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom de patient, agent ou jeton QR..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterAction('tous')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterAction === 'tous' ? 'bg-[#0B3C5D] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tous ({auditLogs.length})
          </button>
          <button
            onClick={() => setFilterAction('deverrouille')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
              filterAction === 'deverrouille' ? 'bg-[#0B3C5D] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Unlock className="w-3 h-3 text-emerald-400" />
            <span>Dossiers Déverrouillés</span>
          </button>
          <button
            onClick={() => setFilterAction('public')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
              filterAction === 'public' ? 'bg-[#0B3C5D] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Eye className="w-3 h-3 text-amber-500" />
            <span>Scans Publics</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Horodatage</th>
                <th className="py-3 px-3">Patient Concerné</th>
                <th className="py-3 px-3">Type d'Accès</th>
                <th className="py-3 px-3">Opérateur / Agent</th>
                <th className="py-3 px-3">Rôle Déclaré</th>
                <th className="py-3 px-4">Jeton QR Scanné</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(log => {
                const isUnlocked = log.action === 'dossier_deverrouille';

                return (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>

                    <td className="py-3 px-3 font-bold text-slate-900">
                      {log.patientNom}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isUnlocked
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isUnlocked ? <Unlock className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>
                          {isUnlocked ? 'Dossier Complet Déverrouillé' : 'Consultation Urgence Vitale'}
                        </span>
                      </span>
                    </td>

                    <td className="py-3 px-3 font-medium text-slate-800">
                      {log.agentNom}
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                        {log.agentRole || 'Secouriste'}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-[10px] text-slate-400">
                      {log.qrToken}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
