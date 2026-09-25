import React, { useState } from 'react';
import {
  Monitor,
  Shield,
  UserCheck,
  AlertTriangle,
  Lock,
  LogOut,
  Clock,
  Key,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Hospital,
  Activity,
  Users,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { WorkstationSession, LoginLogEntry } from '../types';

export const WorkstationSupervisorPanel: React.FC = () => {
  const {
    currentUser,
    workstationSessions,
    loginLogs,
    currentEtablissement,
    forcerDeconnexionPoste,
  } = useClinic();

  const [activeTab, setActiveTab] = useState<'sessions' | 'logs'>('sessions');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSuccess, setFilterSuccess] = useState<'all' | 'success' | 'failed'>('all');

  const filteredSessions = workstationSessions.filter((s) => {
    const q = searchTerm.toLowerCase();
    return (
      s.userNom.toLowerCase().includes(q) ||
      s.userPrenom.toLowerCase().includes(q) ||
      s.posteNom.toLowerCase().includes(q) ||
      s.userRole.toLowerCase().includes(q)
    );
  });

  const filteredLogs = loginLogs.filter((l) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      l.identifiantSaisi.toLowerCase().includes(q) ||
      l.userNom.toLowerCase().includes(q) ||
      l.posteNom.toLowerCase().includes(q) ||
      (l.motif && l.motif.toLowerCase().includes(q));

    if (!matchesSearch) return false;
    if (filterSuccess === 'success') return l.succes;
    if (filterSuccess === 'failed') return !l.succes;
    return true;
  });

  const activeCount = workstationSessions.filter((s) => s.statut === 'actif').length;
  const lockedCount = workstationSessions.filter((s) => s.statut === 'verrouille').length;
  const failedAttempts = loginLogs.filter((l) => !l.succes).length;

  return (
    <div
      id="workstation-supervisor-panel"
      className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-400/30">
              <Shield className="w-4 h-4" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-300">
              Contrôle & Sécurité Hospitalière
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight">
            Supervision des Postes de Travail & Accès
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Tableau de bord de traçabilité en temps réel réservé à la Direction Médicale et à l'Administration.
          </p>
        </div>

        {/* Quick stats pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center gap-2 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{activeCount} Poste(s) Actif(s)</span>
          </div>
          {lockedCount > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-300 flex items-center gap-2 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>{lockedCount} Verrouillé(s)</span>
            </div>
          )}
          {failedAttempts > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-400/30 text-rose-300 flex items-center gap-2 text-xs font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{failedAttempts} Échec(s)</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('sessions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'sessions'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Postes Connectés ({workstationSessions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'logs'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Historique des Connexions ({loginLogs.length})</span>
          </button>
        </div>

        {/* Search & log filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher soignant, poste..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {activeTab === 'logs' && (
            <select
              value={filterSuccess}
              onChange={(e) => setFilterSuccess(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">Tous les logs</option>
              <option value="success">Succès uniquement</option>
              <option value="failed">Tentatives échouées</option>
            </select>
          )}
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="p-4 sm:p-6">
        {activeTab === 'sessions' ? (
          <div>
            {filteredSessions.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <Monitor className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-600">
                  Aucun poste de travail actif trouvé
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Les soignants apparaîtront dès qu'ils se connectent avec leurs identifiants.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSessions.map((session) => {
                  const isCurrent = session.userId === currentUser.id;
                  return (
                    <div
                      key={session.id}
                      className={`p-4 rounded-2xl border transition-all hover:shadow-md ${
                        session.statut === 'actif'
                          ? 'bg-gradient-to-b from-white to-sky-50/30 border-sky-200 ring-1 ring-sky-500/20'
                          : 'bg-gradient-to-b from-white to-amber-50/30 border-amber-200 ring-1 ring-amber-500/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={
                              session.userAvatar ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
                            }
                            alt={session.userNom}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-bold text-slate-900 truncate">
                                {session.userPrenom} {session.userNom}
                              </h4>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-sky-100 text-sky-800">
                                  Vous
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-semibold text-sky-700 block uppercase">
                              {session.userRole}
                            </span>
                            <span className="text-[11px] text-slate-500 truncate block">
                              {session.etablissementNom}
                            </span>
                          </div>
                        </div>

                        {/* Status badge */}
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full border shrink-0 ${
                            session.statut === 'actif'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                          }`}
                        >
                          {session.statut === 'actif' ? 'En Service' : 'Verrouillé'}
                        </span>
                      </div>

                      {/* Workstation Info */}
                      <div className="mt-3.5 p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="font-semibold flex items-center gap-1">
                            <Monitor className="w-3.5 h-3.5 text-sky-600" />
                            Poste :
                          </span>
                          <span className="font-bold text-slate-900 truncate max-w-[180px]">
                            {session.posteNom}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            Connexion :
                          </span>
                          <span className="font-mono">{session.heureConnexion}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-500">
                          <span>Dernière activité :</span>
                          <span className="font-medium text-slate-700">
                            {session.derniereActivite}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400 text-[10px]">
                          <span>Adresse IP :</span>
                          <span className="font-mono">{session.adresseIP || '192.168.1.45'}</span>
                        </div>
                      </div>

                      {/* Actions for Director */}
                      {(currentUser.role === 'directeur' ||
                        currentUser.role === 'superadmin' ||
                        currentUser.role === 'gestionnaire') && (
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => forcerDeconnexionPoste(session.id)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition flex items-center gap-1"
                            title="Révoquer cette session et déconnecter le poste à distance"
                          >
                            <LogOut className="w-3 h-3" />
                            <span>Déconnecter à distance</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Logs Tab */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] bg-slate-50/60">
                  <th className="py-2.5 px-3 font-bold">Statut</th>
                  <th className="py-2.5 px-3 font-bold">Date & Heure</th>
                  <th className="py-2.5 px-3 font-bold">Identifiant & Soignant</th>
                  <th className="py-2.5 px-3 font-bold">Poste de Travail</th>
                  <th className="py-2.5 px-3 font-bold">Établissement</th>
                  <th className="py-2.5 px-3 font-bold">Détails / Motif</th>
                  <th className="py-2.5 px-3 font-bold">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Aucun enregistrement d'audit trouvé.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className={`hover:bg-slate-50/80 transition ${
                        !log.succes ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        {log.succes ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Succès
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            Refusé
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                        {log.timestampFormatted}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">
                          {log.userNom}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          ID : {log.identifiantSaisi}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">
                        {log.posteNom}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 truncate max-w-[150px]">
                        {log.etablissementNom || currentEtablissement?.nom || 'Clinique Espoir'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-xs ${
                            !log.succes
                              ? 'font-semibold text-rose-700'
                              : 'text-slate-600'
                          }`}
                        >
                          {log.motif || (log.succes ? 'Session validée' : 'Échec de connexion')}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400">
                        {log.adresseIP || '192.168.1.45'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
