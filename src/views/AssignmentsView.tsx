import React, { useState } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  Trash2,
  MessageSquare,
  ShieldCheck,
  Users,
  AlertCircle,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { CareAssignment } from '../types';

export const AssignmentsView: React.FC = () => {
  const {
    assignments,
    patients,
    users,
    currentUser,
    ajouterAssignation,
    supprimerAssignation,
    setCurrentView,
  } = useClinic();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [selectedStaffId, setSelectedStaffId] = useState(users[0]?.id || '');
  const [roleAssignation, setRoleAssignation] = useState('Médecin Référent');
  const [notes, setNotes] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Eligible staff members for clinical assignments
  const eligibleStaff = users.filter(u =>
    ['medecin', 'infirmier', 'responsable_soins', 'directeur'].includes(u.role)
  );

  const filteredAssignments = assignments.filter(a => {
    const matchesSearch =
      a.patientNom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.staffNom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.roleAssignation || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.patientMatricule || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = filterRole === 'all' || a.staffRole === filterRole;

    return matchesSearch && matchesRole;
  });

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find(p => p.id === selectedPatientId);
    const staff = users.find(u => u.id === selectedStaffId);
    if (!pat || !staff) return;

    ajouterAssignation({
      patientId: pat.id,
      patientNom: `${pat.prenom} ${pat.nom}`,
      patientMatricule: pat.matricule,
      staffId: staff.id,
      staffNom: `${staff.prenom} ${staff.nom}`,
      staffRole: staff.role,
      roleAssignation,
      dateAssignation: new Date().toLocaleDateString('fr-FR'),
      notes: notes || undefined,
    });

    setShowAddModal(false);
    setNotes('');
    setSuccessToast(`Soignant ${staff.prenom} ${staff.nom} assigné à ${pat.prenom} ${pat.nom}`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleRemoveAssignment = (id: string, staffNom: string, patientNom: string) => {
    if (window.confirm(`Retirer l'assignation de ${staffNom} pour le patient ${patientNom} ?`)) {
      supprimerAssignation(id);
      setSuccessToast(`Assignation retirée avec succès`);
      setTimeout(() => setSuccessToast(null), 3000);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#0B3C5D] tracking-tight">
              Assignations Soignants & Équipes Référentes
            </h1>
            <span className="bg-blue-100 text-[#1E88E5] text-xs px-2.5 py-0.5 rounded-full font-bold">
              {assignments.length} actives
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Définissez strictement quels membres du personnel médical sont autorisés à communiquer et suivre chaque patient.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#1E88E5] text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-[#1677cc] transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle Assignation</span>
        </button>
      </div>

      {/* Success Banner */}
      {successToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1E88E5] flex items-center justify-center font-bold">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Assignations Actives</p>
            <p className="text-2xl font-black text-slate-800">{assignments.length}</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Patients Couverts</p>
            <p className="text-2xl font-black text-slate-800">
              {new Set(assignments.map(a => a.patientId)).size} / {patients.length}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Soignants Référents</p>
            <p className="text-2xl font-black text-slate-800">
              {new Set(assignments.map(a => a.staffId)).size} soignants
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher par patient, matricule ou soignant..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#1E88E5] focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:border-[#1E88E5]"
          >
            <option value="all">Tous les rôles soignants</option>
            <option value="medecin">Médecins</option>
            <option value="infirmier">Infirmiers</option>
            <option value="responsable_soins">Responsables Soins</option>
          </select>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredAssignments.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">Aucune assignation trouvée</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery
                ? 'Aucune assignation ne correspond à vos filtres de recherche.'
                : 'Créez une première assignation pour autoriser le chat sécurisé entre le patient et le personnel.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Soignant Assigné</th>
                  <th className="py-3 px-4">Rôle d'Assignation</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssignments.map(asg => {
                  const pat = patients.find(p => p.id === asg.patientId);
                  const staff = users.find(u => u.id === asg.staffId);

                  return (
                    <tr key={asg.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={pat?.avatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100'}
                            alt={asg.patientNom}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                          />
                          <div>
                            <p className="font-bold text-slate-800">{asg.patientNom}</p>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-semibold">
                              {asg.patientMatricule}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={staff?.avatar || 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100'}
                            alt={asg.staffNom}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                          />
                          <div>
                            <p className="font-bold text-slate-800">{asg.staffNom}</p>
                            <p className="text-[10px] text-slate-500 capitalize">
                              {staff?.role === 'medecin' ? 'Médecin' : staff?.role === 'infirmier' ? 'Infirmier' : staff?.role}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-[#1E88E5] border border-blue-100">
                          {asg.roleAssignation}
                        </span>
                        {asg.notes && (
                          <p className="text-[10px] text-slate-400 mt-0.5 italic">{asg.notes}</p>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 font-medium">
                        {asg.dateAssignation}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setCurrentView('patient_messages')}
                            title="Ouvrir la messagerie avec ce patient"
                            className="p-1.5 text-slate-500 hover:text-[#1E88E5] hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveAssignment(asg.id, asg.staffNom, asg.patientNom)}
                            title="Retirer l'assignation"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: New Assignment */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-[#1E88E5]">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Assigner un Soignant à un Patient</h3>
                  <p className="text-[11px] text-slate-400">Autorise la messagerie directe et le suivi clinique</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
              {/* Patient Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Sélectionner le Patient</label>
                <select
                  value={selectedPatientId}
                  onChange={e => setSelectedPatientId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#1E88E5] focus:outline-none"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.prenom} {p.nom} — {p.matricule} ({p.age} ans)
                    </option>
                  ))}
                </select>
              </div>

              {/* Staff Member Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Membre du Personnel Médical</label>
                <select
                  value={selectedStaffId}
                  onChange={e => setSelectedStaffId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#1E88E5] focus:outline-none"
                >
                  {eligibleStaff.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.prenom} {s.nom} ({s.role === 'medecin' ? 'Médecin' : s.role === 'infirmier' ? 'Infirmier' : s.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Role of Assignment */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Rôle d'Assignation Référente</label>
                <select
                  value={roleAssignation}
                  onChange={e => setRoleAssignation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#1E88E5] focus:outline-none"
                >
                  <option value="Médecin Traitant Référent">Médecin Traitant Référent</option>
                  <option value="Infirmier Référent Suivi">Infirmier Référent Suivi</option>
                  <option value="Cardiologue Référent">Cardiologue Référent</option>
                  <option value="Diabétologue">Diabétologue</option>
                  <option value="Coordination Soins">Coordination Soins</option>
                  <option value="Prise en Charge Urgence">Prise en Charge Urgence</option>
                </select>
              </div>

              {/* Clinical note */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes Cliniques (Optionnel)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Ex: Suivi post-consultation hebdomadaire, adaptation posologique..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#1E88E5] focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#1E88E5] text-white hover:bg-[#1677cc] font-bold shadow-xs"
                >
                  Confirmer l'Assignation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
