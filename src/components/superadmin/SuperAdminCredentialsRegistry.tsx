import React, { useState, useMemo } from 'react';
import {
  Key,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  Search,
  Filter,
  Users,
  Building2,
  ShieldCheck,
  RefreshCw,
  Clock,
  Sparkles,
  AlertCircle,
  UserCheck,
  Heart,
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { User, Patient } from '../../types';

export const SuperAdminCredentialsRegistry: React.FC = () => {
  const { allUsers, allPatients, etablissements, modifierUtilisateur, modifierPatient } = useClinic();

  const [searchQuery, setSearchQuery] = useState('');
  const [targetType, setTargetType] = useState<'tous' | 'personnel' | 'patients'>('tous');
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('all');
  const [passwordStateFilter, setPasswordStateFilter] = useState<'tous' | 'modifies' | 'defaut'>('tous');

  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingPasswordId, setEditingPasswordId] = useState<string | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Quick copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Toggle reveal for a specific account
  const togglePasswordReveal = (id: string) => {
    setRevealedPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Handle manual reset or password assignment by SuperAdmin
  const handleSaveNewPassword = (id: string, isPatient: boolean) => {
    if (!newPasswordInput.trim()) return;
    const now = new Date().toISOString();

    if (isPatient) {
      const patient = allPatients.find(p => p.id === id);
      if (patient) {
        modifierPatient({
          ...patient,
          motDePasse: newPasswordInput.trim(),
          motDePasseModifie: true,
          dateDerniereModifMDP: now,
        });
        setActionMessage(`Mot de passe du patient ${patient.prenom} ${patient.nom} mis à jour avec succès.`);
      }
    } else {
      const user = allUsers.find(u => u.id === id);
      if (user) {
        modifierUtilisateur({
          ...user,
          motDePasse: newPasswordInput.trim(),
          motDePasseModifie: true,
          dateDerniereModifMDP: now,
        });
        setActionMessage(`Mot de passe de l'agent ${user.prenom} ${user.nom} mis à jour avec succès.`);
      }
    }

    setEditingPasswordId(null);
    setNewPasswordInput('');
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleResetToDefault = (id: string, isPatient: boolean) => {
    const defaultPwd = isPatient ? 'patient2025' : 'daro2025';
    if (window.confirm(`Rétablir le mot de passe par défaut (${defaultPwd}) pour cet utilisateur ?`)) {
      if (isPatient) {
        const patient = allPatients.find(p => p.id === id);
        if (patient) {
          modifierPatient({
            ...patient,
            motDePasse: defaultPwd,
            motDePasseModifie: false,
            dateDerniereModifMDP: undefined,
          });
          setActionMessage(`Mot de passe par défaut rétabli pour ${patient.prenom} ${patient.nom}.`);
        }
      } else {
        const user = allUsers.find(u => u.id === id);
        if (user) {
          modifierUtilisateur({
            ...user,
            motDePasse: defaultPwd,
            motDePasseModifie: false,
            dateDerniereModifMDP: undefined,
          });
          setActionMessage(`Mot de passe par défaut rétabli pour ${user.prenom} ${user.nom}.`);
        }
      }
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  // Unified items list
  const unifiedAccounts = useMemo(() => {
    const list: Array<{
      id: string;
      isPatient: boolean;
      nom: string;
      prenom: string;
      identifiantPrincipal: string;
      motDePasse: string;
      motDePasseModifie: boolean;
      dateDerniereModifMDP?: string;
      roleOuTitre: string;
      etablissementNom: string;
      etablissementId?: string;
      avatar?: string;
      email?: string;
      telephone?: string;
    }> = [];

    // Add Staff Users
    allUsers.forEach(u => {
      if (u.role === 'patient') return;
      const etab = etablissements.find(e => e.id === u.etablissementId);
      list.push({
        id: u.id,
        isPatient: false,
        nom: u.nom,
        prenom: u.prenom,
        identifiantPrincipal: u.nomUtilisateur || u.email,
        motDePasse: u.motDePasse || 'daro2025',
        motDePasseModifie: Boolean(u.motDePasseModifie),
        dateDerniereModifMDP: u.dateDerniereModifMDP,
        roleOuTitre: u.specialite || (u.role === 'superadmin' ? 'Super Administrateur' : u.role === 'directeur' ? 'Directeur Médical' : u.role),
        etablissementNom: u.role === 'superadmin' ? 'Direction Réseau DARÔ' : etab?.nom || u.etablissementNom || 'Réseau National',
        etablissementId: u.etablissementId,
        avatar: u.avatar,
        email: u.email,
        telephone: u.telephone,
      });
    });

    // Add Patients
    allPatients.forEach(p => {
      const etab = etablissements.find(e => e.id === p.etablissementId);
      list.push({
        id: p.id,
        isPatient: true,
        nom: p.nom,
        prenom: p.prenom,
        identifiantPrincipal: p.matricule || p.telephone,
        motDePasse: p.motDePasse || 'patient2025',
        motDePasseModifie: Boolean(p.motDePasseModifie),
        dateDerniereModifMDP: p.dateDerniereModifMDP,
        roleOuTitre: `Patient (${p.age} ans • Grp ${p.groupeSanguin || '?'})`,
        etablissementNom: etab?.nom || 'Clinique Centrale N\'Djamena',
        etablissementId: p.etablissementId,
        avatar: p.avatar,
        email: p.email,
        telephone: p.telephone,
      });
    });

    return list;
  }, [allUsers, allPatients, etablissements]);

  // Filter accounts
  const filteredAccounts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return unifiedAccounts.filter(acc => {
      // Type filter
      if (targetType === 'personnel' && acc.isPatient) return false;
      if (targetType === 'patients' && !acc.isPatient) return false;

      // Hospital filter
      if (selectedHospitalId !== 'all') {
        if (acc.etablissementId !== selectedHospitalId) return false;
      }

      // Password state filter
      if (passwordStateFilter === 'modifies' && !acc.motDePasseModifie) return false;
      if (passwordStateFilter === 'defaut' && acc.motDePasseModifie) return false;

      // Search query
      if (!q) return true;
      const matchNom = acc.nom.toLowerCase().includes(q);
      const matchPrenom = acc.prenom.toLowerCase().includes(q);
      const matchId = acc.identifiantPrincipal.toLowerCase().includes(q);
      const matchEtab = acc.etablissementNom.toLowerCase().includes(q);
      const matchPhone = acc.telephone ? acc.telephone.includes(q) : false;
      const matchEmail = acc.email ? acc.email.toLowerCase().includes(q) : false;

      return matchNom || matchPrenom || matchId || matchEtab || matchPhone || matchEmail;
    });
  }, [unifiedAccounts, searchQuery, targetType, selectedHospitalId, passwordStateFilter]);

  // Statistics
  const totalModifies = unifiedAccounts.filter(a => a.motDePasseModifie).length;
  const staffModifies = unifiedAccounts.filter(a => !a.isPatient && a.motDePasseModifie).length;
  const patientsModifies = unifiedAccounts.filter(a => a.isPatient && a.motDePasseModifie).length;

  return (
    <div className="space-y-6">
      {/* Strategic Header & Privileged Notice */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 rounded-2xl p-6 text-white shadow-xl border border-sky-500/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300 shadow-inner">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-900 shadow-xs">
                  Exclusivité Concepteur & SuperAdmin
                </span>
                <span className="text-xs text-sky-200">Accès Restreint Éditeur</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black mt-1 tracking-tight">
                Annuaire Master des Mots de Passe & Identifiants Réseau
              </h2>
              <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
                Visualisation en clair de tous les mots de passe (soignants et patients), y compris lorsqu'ils ont été personnalisés par l'utilisateur. Aucun directeur ni responsable d'établissement n'a accès à cette vue centrale.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/10 text-xs backdrop-blur-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="font-bold text-white">{totalModifies}</span>
              <span className="text-sky-200 ml-1">mots de passe personnalisés</span>
              <div className="text-[10px] text-slate-300">
                ({staffModifies} soignants • {patientsModifies} patients)
              </div>
            </div>
          </div>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-fadeIn shadow-xs">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, tél, identifiant..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-sky-500 focus:outline-hidden"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={targetType}
              onChange={e => setTargetType(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
            >
              <option value="tous">Tous les comptes ({unifiedAccounts.length})</option>
              <option value="personnel">Personnel soignant uniquement ({allUsers.filter(u => u.role !== 'patient').length})</option>
              <option value="patients">Patients uniquement ({allPatients.length})</option>
            </select>
          </div>

          {/* Hospital Filter */}
          <div>
            <select
              value={selectedHospitalId}
              onChange={e => setSelectedHospitalId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
            >
              <option value="all">Tous les établissements</option>
              {etablissements.map(etab => (
                <option key={etab.id} value={etab.id}>
                  {etab.nom} ({etab.ville})
                </option>
              ))}
            </select>
          </div>

          {/* Password state Filter */}
          <div>
            <select
              value={passwordStateFilter}
              onChange={e => setPasswordStateFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
            >
              <option value="tous">Tous statuts de mot de passe</option>
              <option value="modifies">Modifiés par l'utilisateur ({totalModifies})</option>
              <option value="defaut">Identifiants par défaut ({unifiedAccounts.length - totalModifies})</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Affichage de <strong>{filteredAccounts.length}</strong> compte(s) sur un total de {unifiedAccounts.length}
          </span>
          <span className="text-[11px] text-amber-700 font-medium">
            🔒 Protégé : Seul votre compte SuperAdmin peut afficher et copier ces mots de passe.
          </span>
        </div>
      </div>

      {/* Credentials Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Utilisateur / Profil</th>
                <th className="py-3 px-4">Établissement</th>
                <th className="py-3 px-4">Identifiant de Connexion</th>
                <th className="py-3 px-4">Mot de Passe Confidentiel</th>
                <th className="py-3 px-4 text-center">État du Mot de Passe</th>
                <th className="py-3 px-4 text-right">Actions SuperAdmin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                    Aucun compte ne correspond aux filtres de recherche.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map(account => {
                  const isRevealed = Boolean(revealedPasswords[account.id]);
                  const isEditing = editingPasswordId === account.id;

                  return (
                    <tr key={account.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                            <img
                              src={
                                account.avatar ||
                                (account.isPatient
                                  ? 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80'
                                  : 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80')
                              }
                              alt={account.nom}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>
                                {account.prenom} {account.nom}
                              </span>
                              {account.isPatient ? (
                                <span className="px-1.5 py-0.2 rounded text-[10px] bg-rose-50 text-rose-700 font-bold border border-rose-200">
                                  Patient
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.2 rounded text-[10px] bg-sky-50 text-sky-700 font-bold border border-sky-200">
                                  Staff
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500">{account.roleOuTitre}</div>
                          </div>
                        </div>
                      </td>

                      {/* Hospital */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[180px]">{account.etablissementNom}</span>
                        </div>
                        {account.telephone && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{account.telephone}</div>
                        )}
                      </td>

                      {/* Username / Login ID */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs border border-slate-200">
                            {account.identifiantPrincipal}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(account.identifiantPrincipal, `id-${account.id}`)}
                            className="p-1 rounded text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition"
                            title="Copier l'identifiant"
                          >
                            {copiedId === `id-${account.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        {account.email && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[170px] mt-0.5">
                            {account.email}
                          </div>
                        )}
                      </td>

                      {/* Password */}
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={newPasswordInput}
                              onChange={e => setNewPasswordInput(e.target.value)}
                              placeholder="Nouveau mot de passe"
                              className="px-2 py-1 text-xs border border-sky-400 rounded-lg focus:ring-1 focus:ring-sky-500 font-mono w-36"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveNewPassword(account.id, account.isPatient)}
                              className="px-2 py-1 rounded bg-sky-600 text-white font-bold text-[10px] hover:bg-sky-700"
                            >
                              OK
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPasswordId(null);
                                setNewPasswordInput('');
                              }}
                              className="px-1.5 py-1 rounded text-slate-400 hover:bg-slate-100 text-[10px]"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`font-mono font-bold px-2 py-0.5 rounded text-xs border ${
                                account.motDePasseModifie
                                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                                  : 'bg-slate-100 text-slate-800 border-slate-200'
                              }`}
                            >
                              {isRevealed ? account.motDePasse : '••••••••'}
                            </span>

                            <button
                              type="button"
                              onClick={() => togglePasswordReveal(account.id)}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                              title={isRevealed ? 'Masquer' : 'Afficher le mot de passe'}
                            >
                              {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCopy(account.motDePasse, `pwd-${account.id}`)}
                              className="p-1 rounded text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition"
                              title="Copier le mot de passe"
                            >
                              {copiedId === `pwd-${account.id}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        )}
                      </td>

                      {/* State */}
                      <td className="py-3 px-4 text-center">
                        {account.motDePasseModifie ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              Modifié par l'utilisateur
                            </span>
                            {account.dateDerniereModifMDP && (
                              <div className="text-[9px] text-slate-400 mt-0.5 font-mono">
                                {new Date(account.dateDerniereModifMDP).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            Par défaut ({account.isPatient ? 'patient2025' : 'daro2025'})
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPasswordId(account.id);
                              setNewPasswordInput(account.motDePasse);
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                            title="Modifier ce mot de passe manuellement"
                          >
                            Éditer
                          </button>

                          {account.motDePasseModifie && (
                            <button
                              type="button"
                              onClick={() => handleResetToDefault(account.id, account.isPatient)}
                              className="p-1 rounded-lg text-amber-600 hover:bg-amber-50 transition"
                              title="Rétablir le mot de passe par défaut"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
