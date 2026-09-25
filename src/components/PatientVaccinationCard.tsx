import React, { useState } from 'react';
import { Syringe, Plus, Calendar, AlertCircle, CheckCircle2, ShieldCheck, MapPin, Trash2 } from 'lucide-react';
import { Patient, Vaccination } from '../types';
import { useClinic } from '../context/ClinicContext';

interface PatientVaccinationCardProps {
  patient: Patient;
}

export const PatientVaccinationCard: React.FC<PatientVaccinationCardProps> = ({ patient }) => {
  const { modifierPatient } = useClinic();
  const [showAddForm, setShowAddForm] = useState(false);
  const [nomVaccin, setNomVaccin] = useState('Fièvre Jaune (Recommandé)');
  const [dateAdministration, setDateAdministration] = useState(new Date().toISOString().split('T')[0]);
  const [dose, setDose] = useState('Dose unique 0.5 ml');
  const [prochainRappel, setProchainRappel] = useState('');
  const [lot, setLot] = useState('LOT-MED-2025');
  const [centreVaccination, setCentreVaccination] = useState("Clinique DARÔ Chagoua, N'Djamena");
  const [professionnelNom, setProfessionnelNom] = useState('Dr. Brahim Mahamat');

  const vaccinations = patient.vaccinations || [];

  const handleAddVaccination = (e: React.FormEvent) => {
    e.preventDefault();
    const newVaccine: Vaccination = {
      id: `vac-${Date.now()}`,
      nomVaccin,
      dateAdministration,
      dose,
      prochainRappel: prochainRappel || undefined,
      lot: lot || undefined,
      centreVaccination: centreVaccination || "Clinique DARÔ, N'Djamena",
      professionnelNom: professionnelNom || undefined,
    };

    const updatedPatient: Patient = {
      ...patient,
      vaccinations: [newVaccine, ...vaccinations],
    };

    modifierPatient(updatedPatient);
    setShowAddForm(false);
    // Reset form
    setNomVaccin('Fièvre Jaune (Recommandé)');
    setProchainRappel('');
  };

  const handleDeleteVaccine = (vacId: string) => {
    const updatedPatient: Patient = {
      ...patient,
      vaccinations: vaccinations.filter(v => v.id !== vacId),
    };
    modifierPatient(updatedPatient);
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Header with CTA */}
      <div className="flex items-center justify-between p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Syringe className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-amber-950 text-sm">Carnet Vaccinal & Immunisations</h4>
            <p className="text-[11px] text-amber-800">
              {vaccinations.length} vaccin{vaccinations.length > 1 ? 's' : ''} consigné{vaccinations.length > 1 ? 's' : ''} conforme aux standards médicaux & directives OMS
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-1.5 transition shadow-xs text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showAddForm ? 'Fermer' : 'Consigner Vaccin'}</span>
        </button>
      </div>

      {/* Add Vaccination Form */}
      {showAddForm && (
        <form onSubmit={handleAddVaccination} className="p-4 rounded-2xl bg-white border border-amber-300 shadow-sm space-y-3">
          <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            Enregistrer une nouvelle administration vaccinale
          </h5>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Nom du Vaccin</label>
              <input
                type="text"
                value={nomVaccin}
                onChange={e => setNomVaccin(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs bg-slate-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Dose / Posologie</label>
              <input
                type="text"
                value={dose}
                onChange={e => setDose(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Date d'Administration</label>
              <input
                type="date"
                value={dateAdministration}
                onChange={e => setDateAdministration(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Date Prochain Rappel (Optionnel)</label>
              <input
                type="date"
                value={prochainRappel}
                onChange={e => setProchainRappel(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Numéro de Lot</label>
              <input
                type="text"
                value={lot}
                onChange={e => setLot(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Centre de Vaccination</label>
              <input
                type="text"
                value={centreVaccination}
                onChange={e => setCentreVaccination(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Praticien / Vaccinateur</label>
              <input
                type="text"
                value={professionnelNom}
                onChange={e => setProfessionnelNom(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition shadow-xs"
            >
              Enregistrer au carnet
            </button>
          </div>
        </form>
      )}

      {/* List of Vaccinations */}
      {vaccinations.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 space-y-2">
          <Syringe className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="font-semibold">Aucune vaccination enregistrée dans ce dossier.</p>
          <p className="text-[11px] text-slate-400">Cliquez sur « Consigner Vaccin » pour consigner les vaccins administrés.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
          {vaccinations.map(v => (
            <div
              key={v.id}
              className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 hover:shadow-xs transition space-y-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{v.nomVaccin}</span>
                  </h5>
                  <span className="text-[10px] text-slate-500">Dose : {v.dose}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteVaccine(v.id)}
                  title="Supprimer la vaccination"
                  className="text-slate-300 hover:text-rose-600 p-1 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px] space-y-1">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Administré le :</span>
                  <span className="font-bold text-slate-800">{v.dateAdministration}</span>
                </div>
                {v.prochainRappel && (
                  <div className="flex items-center justify-between text-amber-800">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-600" />
                      Prochain rappel :
                    </span>
                    <span className="font-bold">{v.prochainRappel}</span>
                  </div>
                )}
                {v.lot && (
                  <div className="flex items-center justify-between text-slate-500 text-[10px]">
                    <span>Lot :</span>
                    <span className="font-mono">{v.lot}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <span className="flex items-center gap-1 truncate max-w-[180px]">
                  <MapPin className="w-3 h-3" />
                  {v.centreVaccination}
                </span>
                {v.professionnelNom && <span>Par {v.professionnelNom}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
