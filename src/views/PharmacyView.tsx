import React, { useState } from 'react';
import {
  Pill,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  ArrowUpRight,
  Package,
  Boxes,
  X,
  Lock,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { MedicationStock } from '../types';

export const PharmacyView: React.FC = () => {
  const {
    medications,
    reapprovisionnerMedicament,
    ajouterMedicament,
    currentRole,
  } = useClinic();

  const isAuthorized = ['directeur', 'gestionnaire', 'responsable_soins', 'pharmacien'].includes(currentRole);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('tous');
  const [restockMed, setRestockMed] = useState<MedicationStock | null>(null);
  const [restockQty, setRestockQty] = useState(50);

  // New medication modal
  const [showNewMedModal, setShowNewMedModal] = useState(false);
  const [newMed, setNewMed] = useState({
    nom: '',
    dosage: '500mg',
    forme: 'Comprimé',
    categorie: 'Antipaludique',
    quantiteEnStock: 100,
    seuilAlerte: 20,
    prixUnitaireFCFA: 2500,
    dateExpiration: '2027-12-31',
    lot: 'LOT-NDJ-99',
    unite: 'boîtes',
  });

  if (!isAuthorized) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Accès Restreint à la Pharmacie</h2>
        <p className="text-xs text-slate-500">
          La gestion des stocks et de la pharmacie clinique est réservée à la Direction, au Gestionnaire et à la Responsable des Soins.
        </p>
      </div>
    );
  }

  const lowStockMeds = medications.filter(m => m.quantiteEnStock <= m.seuilAlerte);

  const filteredMeds = medications.filter(m => {
    const matchesSearch =
      m.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.categorie.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.dosage.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'tous' || m.categorie === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockMed) return;
    reapprovisionnerMedicament(restockMed.id, restockQty);
    setRestockMed(null);
  };

  const handleCreateMed = (e: React.FormEvent) => {
    e.preventDefault();
    ajouterMedicament(newMed);
    setShowNewMedModal(false);
  };

  const categories = Array.from(new Set(medications.map(m => m.categorie)));

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B3C5D]">Pharmacie & Gestion des Stocks</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold">
              {medications.length} références
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Approvisionnement, solutés d'urgence, antipaludiques et suivi des seuils de sécurité
          </p>
        </div>

        <button
          onClick={() => setShowNewMedModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B3C5D] hover:bg-[#1E88E5] text-white text-xs font-bold shadow transition"
        >
          <Plus className="w-4 h-4 text-teal-300" />
          <span>Nouveau Médicament</span>
        </button>
      </div>

      {/* Critical Stock Alert Banner */}
      {lowStockMeds.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-black text-rose-900 uppercase tracking-wider">
              Alerte Rupture Imminente : {lowStockMeds.length} produit(s) sous le seuil d'alerte à N'Djamena
            </h3>
            <p className="text-xs text-rose-800 mt-0.5">
              Ces médicaments essentiels doivent être réapprovisionnés d'urgence auprès des grossistes répartiteurs :{' '}
              <strong>{lowStockMeds.map(m => `${m.nom} (${m.quantiteEnStock} restant)`).join(', ')}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Rechercher un médicament, soluté, forme..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          <button
            onClick={() => setSelectedCategory('tous')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedCategory === 'tous'
                ? 'bg-[#0B3C5D] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Toutes ({medications.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#0B3C5D] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Désignation</th>
                <th className="py-3 px-3">Catégorie</th>
                <th className="py-3 px-3">Forme & Dosage</th>
                <th className="py-3 px-3">En Stock</th>
                <th className="py-3 px-3">Seuil Alerte</th>
                <th className="py-3 px-3">Prix Unitaire</th>
                <th className="py-3 px-3">Expiration & Lot</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMeds.map(med => {
                const isCritical = med.quantiteEnStock <= med.seuilAlerte;

                return (
                  <tr key={med.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl border ${isCritical ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                          <Pill className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{med.nom}</p>
                          <span className="text-[10px] text-slate-400 font-mono">{med.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                        {med.categorie}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-600">
                      {med.forme} • {med.dosage}
                    </td>

                    <td className="py-3 px-3">
                      <span className={`font-mono font-bold text-sm ${isCritical ? 'text-rose-600' : 'text-slate-900'}`}>
                        {med.quantiteEnStock}
                      </span>{' '}
                      <span className="text-[10px] text-slate-400">{med.unite}</span>
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-500">
                      {med.seuilAlerte} {med.unite}
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-slate-800">
                      {(med.prixUnitaireFCFA || 0).toLocaleString('fr-FR')} FCFA
                    </td>

                    <td className="py-3 px-3 text-slate-500 text-[11px]">
                      <p>{med.dateExpiration}</p>
                      <span className="text-[10px] font-mono text-slate-400">{med.lot}</span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setRestockMed(med);
                          setRestockQty(50);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 font-bold text-xs transition inline-flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Réapprovisionner</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      {restockMed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#0B3C5D]">Réapprovisionnement Stock</h3>
              <button onClick={() => setRestockMed(null)} className="text-slate-400 hover:text-slate-700 p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="space-y-4">
              <div>
                <span className="text-xs text-slate-500">Produit sélectionné :</span>
                <p className="text-sm font-bold text-slate-900">{restockMed.nom} ({restockMed.dosage})</p>
                <p className="text-xs text-slate-600 mt-0.5">Stock actuel : {restockMed.quantiteEnStock} {restockMed.unite}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantité reçue à ajouter ({restockMed.unite}) :
                </label>
                <input
                  type="number"
                  min="1"
                  value={restockQty}
                  onChange={e => setRestockQty(parseInt(e.target.value) || 1)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono font-bold"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                <p>Nouveau total en stock : <strong>{restockMed.quantiteEnStock + restockQty} {restockMed.unite || 'unités'}</strong></p>
                <p>Valeur marchande : <strong>{(((restockMed.quantiteEnStock + restockQty) * (restockMed.prixUnitaireFCFA || 0)) || 0).toLocaleString('fr-FR')} FCFA</strong></p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRestockMed(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow"
                >
                  Valider l'entrée en stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Medication Modal */}
      {showNewMedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#0B3C5D]">Ajouter une Référence Pharmacie</h3>
              <button onClick={() => setShowNewMedModal(false)} className="text-slate-400 hover:text-slate-700 p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMed} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nom du produit :</label>
                <input
                  type="text"
                  value={newMed.nom}
                  onChange={e => setNewMed({ ...newMed, nom: e.target.value })}
                  required
                  placeholder="Ex: Céfotaxime 1g injectable"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Dosage :</label>
                  <input
                    type="text"
                    value={newMed.dosage}
                    onChange={e => setNewMed({ ...newMed, dosage: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Catégorie :</label>
                  <input
                    type="text"
                    value={newMed.categorie}
                    onChange={e => setNewMed({ ...newMed, categorie: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Quantité initiale :</label>
                  <input
                    type="number"
                    value={newMed.quantiteEnStock}
                    onChange={e => setNewMed({ ...newMed, quantiteEnStock: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Seuil d'alerte :</label>
                  <input
                    type="number"
                    value={newMed.seuilAlerte}
                    onChange={e => setNewMed({ ...newMed, seuilAlerte: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Prix unitaire (FCFA) :</label>
                  <input
                    type="number"
                    value={newMed.prixUnitaireFCFA}
                    onChange={e => setNewMed({ ...newMed, prixUnitaireFCFA: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewMedModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0B3C5D] hover:bg-[#1E88E5] text-white text-xs font-bold shadow"
                >
                  Enregistrer le produit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
