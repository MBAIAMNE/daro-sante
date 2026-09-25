import React, { useState } from 'react';
import { Scale, Plus, Activity, Heart, TrendingUp, AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';
import { Patient, MesureBiometrique } from '../types';
import { useClinic } from '../context/ClinicContext';

interface PatientBiometrieCardProps {
  patient: Patient;
}

export const PatientBiometrieCard: React.FC<PatientBiometrieCardProps> = ({ patient }) => {
  const { modifierPatient } = useClinic();
  const [showAddForm, setShowAddForm] = useState(false);
  const [poids, setPoids] = useState<number | ''>(patient.poids || '');
  const [taille, setTaille] = useState<number | ''>(patient.taille || '');
  const [tension, setTension] = useState<string>(patient.tensionHabituelle || '');
  const [glycemie, setGlycemie] = useState<number | ''>(patient.glycemieHabituelle || '');
  const [notes, setNotes] = useState<string>('');

  const mesures = patient.mesuresBiometriques || [];

  // Live BMI calculation if both valid numbers
  const imcLive = (typeof poids === 'number' && poids > 0 && typeof taille === 'number' && taille > 0)
    ? Number((poids / Math.pow(taille / 100, 2)).toFixed(1))
    : null;

  const getIMCCategory = (val: number) => {
    if (val < 18.5) return { label: 'Insuffisance pondérale', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    if (val <= 24.9) return { label: 'Poids normal (OMS)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (val <= 29.9) return { label: 'Surpoids', color: 'text-orange-700 bg-orange-50 border-orange-200' };
    return { label: 'Obésité', color: 'text-rose-700 bg-rose-50 border-rose-200' };
  };

  const currentCategory = patient.imc ? getIMCCategory(patient.imc) : (imcLive ? getIMCCategory(imcLive) : null);

  const handleAddMesure = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPoids = typeof poids === 'number' ? poids : 0;
    const finalTaille = typeof taille === 'number' ? taille : 0;
    const finalImc = imcLive || (finalPoids > 0 && finalTaille > 0 ? Number((finalPoids / Math.pow(finalTaille / 100, 2)).toFixed(1)) : 0);

    const newMesure: MesureBiometrique = {
      id: `bio-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      poidsKg: finalPoids,
      tailleCm: finalTaille,
      imc: finalImc,
      tension: tension || undefined,
      glycemie: typeof glycemie === 'number' ? glycemie : undefined,
      notes: notes || undefined,
    };

    const updatedPatient: Patient = {
      ...patient,
      poids: finalPoids > 0 ? finalPoids : patient.poids,
      taille: finalTaille > 0 ? finalTaille : patient.taille,
      imc: finalImc > 0 ? finalImc : patient.imc,
      tensionHabituelle: tension || patient.tensionHabituelle,
      glycemieHabituelle: typeof glycemie === 'number' ? glycemie : patient.glycemieHabituelle,
      mesuresBiometriques: [newMesure, ...mesures],
    };

    modifierPatient(updatedPatient);
    setShowAddForm(false);
  };

  const handleDeleteMesure = (id: string) => {
    const updated = mesures.filter(m => m.id !== id);
    const updatedPatient: Patient = {
      ...patient,
      mesuresBiometriques: updated,
    };
    modifierPatient(updatedPatient);
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Current Biometric Status Bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-900 to-[#0B3C5D] text-white shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-teal-300" />
            <div>
              <h4 className="font-bold text-sm">Constantes Physiques & Biométrie OMS</h4>
              <p className="text-[11px] text-teal-200">Suivi morphologique, tensionnel et métabolique</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddForm ? 'Fermer' : 'Nouvelle Mesure'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
            <span className="text-[10px] text-teal-200 uppercase font-bold block">Poids Actuel</span>
            {patient.poids ? (
              <p className="text-xl font-black text-white">{patient.poids} <span className="text-xs font-normal text-teal-200">kg</span></p>
            ) : (
              <p className="text-xs font-semibold text-teal-200/80 italic mt-1">Non renseigné</p>
            )}
          </div>
          <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
            <span className="text-[10px] text-teal-200 uppercase font-bold block">Taille</span>
            {patient.taille ? (
              <p className="text-xl font-black text-white">{patient.taille} <span className="text-xs font-normal text-teal-200">cm</span></p>
            ) : (
              <p className="text-xs font-semibold text-teal-200/80 italic mt-1">Non renseignée</p>
            )}
          </div>
          <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
            <span className="text-[10px] text-teal-200 uppercase font-bold block">Indice IMC</span>
            {patient.imc ? (
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-xl font-black text-white">{patient.imc}</span>
                {currentCategory && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${currentCategory.color}`}>
                    {currentCategory.label}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-xs font-semibold text-teal-200/80 italic mt-1">Non calculé</p>
            )}
          </div>
          <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
            <span className="text-[10px] text-teal-200 uppercase font-bold block">Tension Repos</span>
            {patient.tensionHabituelle ? (
              <p className="text-xl font-black text-white">{patient.tensionHabituelle}</p>
            ) : (
              <p className="text-xs font-semibold text-teal-200/80 italic mt-1">Non mesurée</p>
            )}
          </div>
        </div>
      </div>

      {/* Add Measurement Form */}
      {showAddForm && (
        <form onSubmit={handleAddMesure} className="p-4 rounded-2xl bg-white border border-teal-300 shadow-sm space-y-3">
          <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-teal-600" />
            Consigner un nouveau relevé biométrique
          </h5>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Poids (kg)</label>
              <input
                type="number"
                step="0.5"
                value={poids}
                onChange={e => setPoids(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="Ex: 68"
                className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Taille (cm)</label>
              <input
                type="number"
                value={taille}
                onChange={e => setTaille(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                placeholder="Ex: 172"
                className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">IMC Calculé</label>
              <div className="w-full rounded-xl bg-teal-50 border border-teal-200 px-3 py-1.5 text-xs font-black text-teal-900 flex items-center justify-between">
                <span>{imcLive ?? '—'}</span>
                {imcLive && (
                  <span className="text-[10px] font-bold text-teal-700">{getIMCCategory(imcLive).label}</span>
                )}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Tension (mmHg)</label>
              <input
                type="text"
                value={tension}
                onChange={e => setTension(e.target.value)}
                placeholder="ex: 120/80"
                className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Glycémie à jeun (mg/dL)</label>
              <input
                type="number"
                value={glycemie}
                onChange={e => setGlycemie(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                placeholder="Ex: 90"
                className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Contexte / Notes</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Ex: Contrôle de routine consultation"
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
              className="px-4 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold transition shadow-xs"
            >
              Enregistrer le relevé
            </button>
          </div>
        </form>
      )}

      {/* Historical Measurements Log */}
      <div className="space-y-2">
        <h5 className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
          <span>Historique des Pesées & Constantes</span>
        </h5>

        {mesures.length === 0 ? (
          <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500">
            Aucun historique biométrique consigné pour le moment.
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Poids (kg)</th>
                    <th className="p-3">Taille (cm)</th>
                    <th className="p-3">IMC (kg/m²)</th>
                    <th className="p-3">Tension</th>
                    <th className="p-3">Glycémie</th>
                    <th className="p-3">Observations</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mesures.map(m => {
                    const cat = getIMCCategory(m.imc);
                    return (
                      <tr key={m.id} className="hover:bg-slate-50/70 transition">
                        <td className="p-3 font-semibold text-slate-700">{m.date}</td>
                        <td className="p-3 font-bold text-slate-900">{m.poidsKg} kg</td>
                        <td className="p-3 text-slate-600">{m.tailleCm} cm</td>
                        <td className="p-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${cat.color}`}>
                            {m.imc} • {cat.label}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-800">{m.tension || '—'}</td>
                        <td className="p-3 font-mono text-slate-800">{m.glycemie ? `${m.glycemie} mg/dL` : '—'}</td>
                        <td className="p-3 text-slate-500 text-[11px]">{m.notes || '—'}</td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteMesure(m.id)}
                            className="text-slate-300 hover:text-rose-600 p-1 transition"
                            title="Supprimer la mesure"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
