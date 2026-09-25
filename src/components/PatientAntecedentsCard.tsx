import React, { useState } from 'react';
import { Activity, Scissors, Users, Coffee, Plus, X, Save, ShieldAlert } from 'lucide-react';
import { Patient } from '../types';
import { useClinic } from '../context/ClinicContext';

interface PatientAntecedentsCardProps {
  patient: Patient;
}

export const PatientAntecedentsCard: React.FC<PatientAntecedentsCardProps> = ({ patient }) => {
  const { modifierPatient } = useClinic();

  const [antecedentsMedicaux, setAntecedentsMedicaux] = useState<string[]>(
    patient.antecedentsMedicaux || patient.maladiesChroniques || ['Paludisme grave en 2022', 'Gastro-entérite aiguë']
  );
  const [antecedentsChirurgicaux, setAntecedentsChirurgicaux] = useState<string[]>(
    patient.antecedentsChirurgicaux || ['Appendicectomie (2018, HGRN N\'Djamena)']
  );
  const [antecedentsFamiliaux, setAntecedentsFamiliaux] = useState<string[]>(
    patient.antecedentsFamiliaux || ['Père : HTA essentielle', 'Mère : Diabète de type 2']
  );
  const [habitudesVie, setHabitudesVie] = useState<string[]>(
    patient.habitudesVie || ['Non-fumeur', 'Consommation thé vert sahélien quotidien', 'Activité physique modérée']
  );

  const [newMed, setNewMed] = useState('');
  const [newChir, setNewChir] = useState('');
  const [newFam, setNewFam] = useState('');
  const [newHab, setNewHab] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveAll = () => {
    const updatedPatient: Patient = {
      ...patient,
      antecedentsMedicaux,
      antecedentsChirurgicaux,
      antecedentsFamiliaux,
      habitudesVie,
    };
    modifierPatient(updatedPatient);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleAddItem = (type: 'med' | 'chir' | 'fam' | 'hab') => {
    if (type === 'med' && newMed.trim()) {
      setAntecedentsMedicaux([...antecedentsMedicaux, newMed.trim()]);
      setNewMed('');
    } else if (type === 'chir' && newChir.trim()) {
      setAntecedentsChirurgicaux([...antecedentsChirurgicaux, newChir.trim()]);
      setNewChir('');
    } else if (type === 'fam' && newFam.trim()) {
      setAntecedentsFamiliaux([...antecedentsFamiliaux, newFam.trim()]);
      setNewFam('');
    } else if (type === 'hab' && newHab.trim()) {
      setHabitudesVie([...habitudesVie, newHab.trim()]);
      setNewHab('');
    }
  };

  const handleRemoveItem = (type: 'med' | 'chir' | 'fam' | 'hab', index: number) => {
    if (type === 'med') setAntecedentsMedicaux(antecedentsMedicaux.filter((_, i) => i !== index));
    if (type === 'chir') setAntecedentsChirurgicaux(antecedentsChirurgicaux.filter((_, i) => i !== index));
    if (type === 'fam') setAntecedentsFamiliaux(antecedentsFamiliaux.filter((_, i) => i !== index));
    if (type === 'hab') setHabitudesVie(habitudesVie.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Header and Save */}
      <div className="flex items-center justify-between p-3.5 bg-indigo-50/60 rounded-2xl border border-indigo-200">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-indigo-950 text-sm">Profil Antécédents & Terrain Clinique</h4>
            <p className="text-[11px] text-indigo-800">
              Antécédents médicaux, chirurgicaux, familiaux et mode de vie
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSaveAll}
          className="px-4 py-1.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold flex items-center gap-1.5 transition shadow-xs text-xs"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saveSuccess ? 'Enregistré ✓' : 'Sauvegarder'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* 1. Antécédents Médicaux */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-rose-500" />
              Antécédents Médicaux
            </span>
            <span className="text-[10px] text-slate-400 font-mono">{antecedentsMedicaux.length} entrées</span>
          </div>
          <div className="flex flex-wrap gap-1.5 min-h-[42px]">
            {antecedentsMedicaux.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-[11px] font-medium"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveItem('med', idx)}
                  className="hover:text-rose-950"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-1.5 pt-1">
            <input
              type="text"
              value={newMed}
              onChange={e => setNewMed(e.target.value)}
              placeholder="Ajouter affection ou épisode..."
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddItem('med'))}
              className="flex-1 rounded-xl border border-slate-300 px-2.5 py-1 text-xs"
            />
            <button
              type="button"
              onClick={() => handleAddItem('med')}
              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. Antécédents Chirurgicaux */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <Scissors className="w-4 h-4 text-teal-600" />
              Antécédents Chirurgicaux
            </span>
            <span className="text-[10px] text-slate-400 font-mono">{antecedentsChirurgicaux.length} entrées</span>
          </div>
          <div className="flex flex-wrap gap-1.5 min-h-[42px]">
            {antecedentsChirurgicaux.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 text-[11px] font-medium"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveItem('chir', idx)}
                  className="hover:text-teal-950"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-1.5 pt-1">
            <input
              type="text"
              value={newChir}
              onChange={e => setNewChir(e.target.value)}
              placeholder="Ajouter chirurgie / date..."
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddItem('chir'))}
              className="flex-1 rounded-xl border border-slate-300 px-2.5 py-1 text-xs"
            />
            <button
              type="button"
              onClick={() => handleAddItem('chir')}
              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3. Antécédents Familiaux */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-purple-600" />
              Antécédents Familiaux / Génétiques
            </span>
            <span className="text-[10px] text-slate-400 font-mono">{antecedentsFamiliaux.length} entrées</span>
          </div>
          <div className="flex flex-wrap gap-1.5 min-h-[42px]">
            {antecedentsFamiliaux.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 text-[11px] font-medium"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveItem('fam', idx)}
                  className="hover:text-purple-950"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-1.5 pt-1">
            <input
              type="text"
              value={newFam}
              onChange={e => setNewFam(e.target.value)}
              placeholder="Ajouter antécédent familial..."
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddItem('fam'))}
              className="flex-1 rounded-xl border border-slate-300 px-2.5 py-1 text-xs"
            />
            <button
              type="button"
              onClick={() => handleAddItem('fam')}
              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4. Habitudes de Vie */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <Coffee className="w-4 h-4 text-amber-600" />
              Habitudes de Vie & Facteurs de Risque
            </span>
            <span className="text-[10px] text-slate-400 font-mono">{habitudesVie.length} entrées</span>
          </div>
          <div className="flex flex-wrap gap-1.5 min-h-[42px]">
            {habitudesVie.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-medium"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveItem('hab', idx)}
                  className="hover:text-amber-950"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-1.5 pt-1">
            <input
              type="text"
              value={newHab}
              onChange={e => setNewHab(e.target.value)}
              placeholder="Ajouter facteur ou habitude..."
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddItem('hab'))}
              className="flex-1 rounded-xl border border-slate-300 px-2.5 py-1 text-xs"
            />
            <button
              type="button"
              onClick={() => handleAddItem('hab')}
              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
