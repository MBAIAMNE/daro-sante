import React, { useState, useMemo } from 'react';
import {
  Search,
  Microscope,
  Pill,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Printer,
  Sparkles,
  Building2,
  Navigation,
  ShieldCheck,
  X,
  Share2,
  Download,
  Calendar,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { NATIONAL_EXAMS_DIRECTORY, NATIONAL_PHARMACIES_DIRECTORY } from '../data/nationalDirectory';
import { ExamDirectoryItem, MedicationDirectoryItem, ExamDirectoryFacility, PharmacyStockOffer } from '../types';
import { Logo } from '../components/Logo';

export const NationalDirectoryView: React.FC = () => {
  const { currentEtablissement, currentUser, currentRole } = useClinic();

  const [activeTab, setActiveTab] = useState<'examens' | 'pharmacies'>('examens');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuartier, setSelectedQuartier] = useState<string>('tous');
  const [filterAvailability, setFilterAvailability] = useState<'tous' | 'immediat' | 'en_stock' | 'garde_24h'>('tous');

  // Printable orientation ticket modal
  const [selectedExamForTicket, setSelectedExamForTicket] = useState<{
    exam: ExamDirectoryItem;
    centre: ExamDirectoryFacility;
  } | null>(null);

  const [selectedMedForTicket, setSelectedMedForTicket] = useState<{
    med: MedicationDirectoryItem;
    pharmacie: PharmacyStockOffer;
  } | null>(null);

  // Neighborhoods for filtering in N'Djamena
  const quartiers = [
    'tous',
    'Chagoua',
    'Sabangali',
    'Moursal',
    'Farcha',
    'Diguel',
    'Centre-Ville',
    'Dembé',
    'Ardep-Djoumal',
    'Walia',
  ];

  // Filtered Exams
  const filteredExams = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return NATIONAL_EXAMS_DIRECTORY.filter(exam => {
      const matchQuery =
        !q ||
        exam.nom.toLowerCase().includes(q) ||
        exam.description.toLowerCase().includes(q) ||
        exam.natureLabel.toLowerCase().includes(q) ||
        exam.motsCles.some(k => k.toLowerCase().includes(q));

      if (!matchQuery) return false;

      // Filter by neighborhood or availability inside centres
      if (selectedQuartier !== 'tous') {
        const hasCenterInQuartier = exam.centresDisponibles.some(
          c => c.quartier.toLowerCase() === selectedQuartier.toLowerCase()
        );
        if (!hasCenterInQuartier) return false;
      }

      if (filterAvailability === 'immediat') {
        const hasImmediat = exam.centresDisponibles.some(c => c.disponibilite === 'disponible_immediat');
        if (!hasImmediat) return false;
      }

      return true;
    });
  }, [searchQuery, selectedQuartier, filterAvailability]);

  // Filtered Medications
  const filteredMedications = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return NATIONAL_PHARMACIES_DIRECTORY.filter(med => {
      const matchQuery =
        !q ||
        med.nomCommercial.toLowerCase().includes(q) ||
        med.dci.toLowerCase().includes(q) ||
        med.classeTherapeutique.toLowerCase().includes(q) ||
        med.dosage.toLowerCase().includes(q);

      if (!matchQuery) return false;

      // Filter by neighborhood or availability in pharmacies
      if (selectedQuartier !== 'tous') {
        const hasPharmaInQuartier = med.officinesDisponibles.some(
          p => p.quartier.toLowerCase() === selectedQuartier.toLowerCase()
        );
        if (!hasPharmaInQuartier) return false;
      }

      if (filterAvailability === 'en_stock') {
        const hasStock = med.officinesDisponibles.some(p => p.disponibilite === 'en_stock');
        if (!hasStock) return false;
      } else if (filterAvailability === 'garde_24h') {
        const hasGarde = med.officinesDisponibles.some(p => p.pharmacieDeGarde || p.ouvert24h);
        if (!hasGarde) return false;
      }

      return true;
    });
  }, [searchQuery, selectedQuartier, filterAvailability]);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B3C5D]">
              Annuaire National Médical & Plateau Technique
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold">
              Inter-Établissements Tchad
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Localisez instantanément les examens spécialisés (scanners, IRM, labos) et les médicaments disponibles en stock pour éviter toute perte de temps au patient.
          </p>
        </div>

        {/* Current Clinic Indicator */}
        <div className="flex items-center gap-2 text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 shrink-0">
          <Building2 className="w-4 h-4 text-teal-700" />
          <span>Poste connecté : <strong>{currentEtablissement?.nom || 'Clinique Espoir'}</strong></span>
        </div>
      </div>

      {/* Main Mode Toggle: Exams vs Medications */}
      <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto p-1.5 rounded-2xl bg-slate-200/80">
        <button
          onClick={() => {
            setActiveTab('examens');
            setFilterAvailability('tous');
          }}
          className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'examens'
              ? 'bg-white text-[#0B3C5D] shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Microscope className="w-4 h-4 text-teal-600" />
          <span>Plateau Technique & Examens</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-teal-50 text-teal-700">
            {NATIONAL_EXAMS_DIRECTORY.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('pharmacies');
            setFilterAvailability('tous');
          }}
          className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'pharmacies'
              ? 'bg-white text-[#0B3C5D] shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Pill className="w-4 h-4 text-sky-600" />
          <span>Pharmacies & Médicaments</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-sky-50 text-sky-700">
            {NATIONAL_PHARMACIES_DIRECTORY.length}
          </span>
        </button>
      </div>

      {/* Real-time Search Box */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'examens'
                ? 'Tapez simplement le nom de l\'examen (ex: Scanner, IRM, Électrophorèse Hb, Échographie cardiaque, Fibroscopie, Hémoculture...)'
                : 'Tapez le médicament ou DCI (ex: Artéméther Coartem, Insuline Lantus, Ceftriaxone, Augmentin, Sérum antivenimeux, Ventoline...)'
            }
            className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-slate-200 bg-slate-50 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:outline-none transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3.5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500 font-bold">Quartier (N'Djamena) :</span>
            <div className="flex flex-wrap gap-1.5">
              {quartiers.map(q => (
                <button
                  key={q}
                  onClick={() => setSelectedQuartier(q)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition capitalize ${
                    selectedQuartier === q
                      ? 'bg-[#0B3C5D] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold">Disponibilité :</span>
            <select
              value={filterAvailability}
              onChange={e => setFilterAvailability(e.target.value as any)}
              className="px-3 py-1 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700"
            >
              <option value="tous">Tous les statuts</option>
              {activeTab === 'examens' ? (
                <option value="immediat">Disponible Immédiatement</option>
              ) : (
                <>
                  <option value="en_stock">En stock confirmé</option>
                  <option value="garde_24h">Pharmacies de garde 24h/24</option>
                </>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* EXAMS DIRECTORY RESULTS */}
      {/* ========================================================= */}
      {activeTab === 'examens' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              {filteredExams.length} nature(s) d'examen trouvée(s) dans le réseau tchadien
            </span>
            <span className="text-teal-700 font-semibold">
              Réseau national certifié DARÔ
            </span>
          </div>

          {filteredExams.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
              <Microscope className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">Aucun examen correspondant trouvé</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Essayez avec un mot-clé plus simple (ex: "scanner", "irm", "bilan", "echo", "sang", "coeur").
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredExams.map(exam => (
                <div
                  key={exam.id}
                  className="rounded-3xl bg-white border border-slate-200 hover:border-teal-300 shadow-xs overflow-hidden transition"
                >
                  {/* Exam Card Header */}
                  <div className="p-5 sm:p-6 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 font-mono text-[10px] font-bold">
                          {exam.natureLabel}
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-slate-900">
                          {exam.nom}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-600 max-w-3xl">
                        {exam.description}
                      </p>
                      {exam.conditionsPreparation && (
                        <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 mt-1">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Préparation : {exam.conditionsPreparation}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs text-slate-400 font-medium">Centres équipés :</span>
                      <p className="text-sm font-bold text-teal-900">
                        {exam.centresDisponibles.length} établissement(s) à N'Djamena
                      </p>
                    </div>
                  </div>

                  {/* Centers offering this exam */}
                  <div className="p-5 sm:p-6 divide-y divide-slate-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block pb-3">
                      Où réaliser cet examen sans attendre :
                    </span>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-3">
                      {exam.centresDisponibles.map(centre => {
                        const isCurrentClinic = centre.etablissementNom.includes(currentEtablissement?.nom || 'Clinique Espoir');

                        return (
                          <div
                            key={centre.id}
                            className={`p-4 rounded-2xl border transition flex flex-col justify-between space-y-3 ${
                              isCurrentClinic
                                ? 'bg-teal-50/40 border-teal-300 ring-1 ring-teal-400/30'
                                : 'bg-white border-slate-200 hover:border-teal-200 shadow-2xs'
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  {isCurrentClinic && (
                                    <span className="text-[9px] uppercase tracking-wide font-black px-1.5 py-0.5 rounded bg-teal-600 text-white inline-block mb-1">
                                      Votre Clinique
                                    </span>
                                  )}
                                  <h4 className="text-sm font-bold text-slate-900">
                                    {centre.etablissementNom}
                                  </h4>
                                </div>

                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                    centre.disponibilite === 'disponible_immediat'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {centre.disponibilite === 'disponible_immediat'
                                    ? 'Disponible Immédiat'
                                    : 'Sur RDV sous 24h'}
                                </span>
                              </div>

                              <div className="space-y-1 text-xs text-slate-600">
                                <div className="flex items-center gap-1.5 text-slate-700">
                                  <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                                  <span className="font-semibold text-slate-900">{centre.quartier}</span>
                                  <span className="text-slate-400">•</span>
                                  <span className="truncate">{centre.adresse}</span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <a
                                    href={`tel:${centre.telephone}`}
                                    className="text-teal-700 hover:underline font-mono font-medium"
                                  >
                                    {centre.telephone}
                                  </a>
                                </div>

                                {centre.equipementMarque && (
                                  <p className="text-[11px] text-slate-500 pl-5">
                                    Machine : <em>{centre.equipementMarque}</em>
                                  </p>
                                )}

                                <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-500">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <span>Délai résultats : <strong>{centre.delaiResultatHeures}</strong></span>
                                </div>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                              <div>
                                <span className="text-[10px] text-slate-400 block">Tarif indicatif :</span>
                                <span className="text-sm font-black text-slate-900">
                                  {centre.prixFCFA.toLocaleString('fr-FR')} FCFA
                                </span>
                              </div>

                              <button
                                onClick={() => setSelectedExamForTicket({ exam, centre })}
                                className="py-2 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition flex items-center gap-1.5"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Bon d'Orientation</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* PHARMACIES & MEDICATIONS DIRECTORY RESULTS */}
      {/* ========================================================= */}
      {activeTab === 'pharmacies' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              {filteredMedications.length} médicament(s) essentiel(s) répertorié(s)
            </span>
            <span className="text-sky-700 font-semibold">
              Officines & Pharmacies de Garde N'Djamena
            </span>
          </div>

          {filteredMedications.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
              <Pill className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">Aucun médicament trouvé</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Tapez le nom de marque (ex: Coartem, Lantus, Augmentin, Rocephine, Fav-Afrique, Ventoline, Amlor) ou la molécule DCI.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredMedications.map(med => (
                <div
                  key={med.id}
                  className="rounded-3xl bg-white border border-slate-200 hover:border-sky-300 shadow-xs overflow-hidden transition"
                >
                  {/* Medication Header */}
                  <div className="p-5 sm:p-6 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-mono text-[10px] font-bold">
                          {med.dosage}
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-slate-900">
                          {med.nomCommercial}
                        </h3>
                        {med.necessiteOrdonnance && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">
                            Sur Ordonnance
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600">
                        <strong>DCI :</strong> {med.dci} • <em>{med.classeTherapeutique}</em>
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Forme : {med.forme}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs text-slate-400 font-medium">Prix homologué Tchad :</span>
                      <p className="text-base font-black text-[#0B3C5D]">
                        {med.prixOfficielFCFA.toLocaleString('fr-FR')} FCFA
                      </p>
                    </div>
                  </div>

                  {/* Available Pharmacies Grid */}
                  <div className="p-5 sm:p-6">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block pb-3">
                      Officines avec stock confirmé en temps réel :
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {med.officinesDisponibles.map(pharma => (
                        <div
                          key={pharma.id}
                          className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-sky-300 transition flex flex-col justify-between space-y-3"
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-1.5">
                              <h4 className="text-sm font-bold text-slate-900">
                                {pharma.pharmacieNom}
                              </h4>

                              <span
                                className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                  pharma.disponibilite === 'en_stock'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : pharma.disponibilite === 'stock_limite'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {pharma.disponibilite === 'en_stock'
                                  ? `En Stock (${pharma.quantiteEstimee} btes)`
                                  : pharma.disponibilite === 'stock_limite'
                                  ? `Stock Limité (${pharma.quantiteEstimee} btes)`
                                  : 'Rupture'}
                              </span>
                            </div>

                            {pharma.pharmacieDeGarde && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                                <Sparkles className="w-2.5 h-2.5" />
                                Pharmacie de Garde 24h/24
                              </span>
                            )}

                            <div className="space-y-1 text-xs text-slate-600">
                              <div className="flex items-center gap-1.5 text-slate-700">
                                <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                                <span className="font-semibold">{pharma.quartier}</span>
                                <span className="text-slate-300">•</span>
                                <span className="truncate">{pharma.adresse}</span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <a
                                  href={`tel:${pharma.telephone}`}
                                  className="text-sky-700 hover:underline font-mono font-medium"
                                >
                                  {pharma.telephone}
                                </a>
                              </div>

                              <p className="text-[11px] text-slate-500 pt-0.5">
                                Horaires : {pharma.horairesOuverture}
                              </p>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                            <div>
                              <span className="text-[10px] text-slate-400 block">Prix officine :</span>
                              <span className="text-xs font-bold text-slate-800">
                                {pharma.prixFCFA.toLocaleString('fr-FR')} FCFA
                              </span>
                            </div>

                            <button
                              onClick={() => setSelectedMedForTicket({ med, pharmacie: pharma })}
                              disabled={pharma.disponibilite === 'rupture'}
                              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                                pharma.disponibilite === 'rupture'
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                  : 'bg-sky-50 hover:bg-sky-100 text-sky-800'
                              }`}
                            >
                              <Navigation className="w-3.5 h-3.5" />
                              <span>Itinéraire & Fiche</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: BON D'ORIENTATION EXAMEN (IMPRESSION / TELECHARGEMENT) */}
      {/* ========================================================= */}
      {selectedExamForTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Logo size={28} />
                <div>
                  <h3 className="text-base font-bold text-[#0B3C5D]">
                    Bon d'Orientation Inter-Clinique
                  </h3>
                  <p className="text-[11px] text-slate-500">Plateau Technique DARÔ Santé</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedExamForTicket(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-2 text-xs text-teal-950">
              <p className="font-bold text-sm text-teal-900">
                {selectedExamForTicket.exam.nom}
              </p>
              <p className="text-[11.5px] text-teal-800">
                {selectedExamForTicket.exam.description}
              </p>
              {selectedExamForTicket.exam.conditionsPreparation && (
                <p className="text-amber-900 bg-amber-50 p-2 rounded-xl border border-amber-200 font-semibold">
                  ⚠️ Préparation requise : {selectedExamForTicket.exam.conditionsPreparation}
                </p>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Centre d'Orientation Recommandé :
              </span>
              <p className="text-base font-bold text-slate-900">
                {selectedExamForTicket.centre.etablissementNom}
              </p>
              <div className="space-y-1 text-slate-600">
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  <span>{selectedExamForTicket.centre.adresse} (Quartier {selectedExamForTicket.centre.quartier})</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-teal-600" />
                  <span className="font-mono font-bold text-slate-900">{selectedExamForTicket.centre.telephone}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  <span>Délai de remise des résultats : <strong>{selectedExamForTicket.centre.delaiResultatHeures}</strong></span>
                </p>
                <p className="text-slate-900 font-bold pt-1">
                  Tarif prévu : {selectedExamForTicket.centre.prixFCFA.toLocaleString('fr-FR')} FCFA
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-sky-50 text-sky-900 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
              <span>
                Présentez ce bon au secrétariat du laboratoire ou de l'imagerie. Vos résultats seront également synchronisés sur votre espace patient DARÔ.
              </span>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-xl bg-[#0B3C5D] hover:bg-[#07273d] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer le Bon d'Orientation</span>
              </button>
              <button
                onClick={() => setSelectedExamForTicket(null)}
                className="py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: FICHE OFFICINE PHARMACIE */}
      {/* ========================================================= */}
      {selectedMedForTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Logo size={28} />
                <div>
                  <h3 className="text-base font-bold text-[#0B3C5D]">
                    Fiche Disponibilité Médicament
                  </h3>
                  <p className="text-[11px] text-slate-500">Réseau Pharmaceutique DARÔ Tchad</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMedForTicket(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-xs space-y-1.5">
              <p className="text-base font-bold text-sky-950">
                {selectedMedForTicket.med.nomCommercial} ({selectedMedForTicket.med.dosage})
              </p>
              <p className="text-sky-800">
                <strong>DCI :</strong> {selectedMedForTicket.med.dci}
              </p>
              <p className="text-sky-700">
                Classe : {selectedMedForTicket.med.classeTherapeutique}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Pharmacie Dépositaire en Stock :
              </span>
              <div className="flex justify-between items-start">
                <p className="text-base font-bold text-slate-900">
                  {selectedMedForTicket.pharmacie.pharmacieNom}
                </p>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  En stock ({selectedMedForTicket.pharmacie.quantiteEstimee} btes)
                </span>
              </div>

              <div className="space-y-1 text-slate-600">
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-600" />
                  <span>{selectedMedForTicket.pharmacie.adresse} ({selectedMedForTicket.pharmacie.quartier})</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-sky-600" />
                  <a href={`tel:${selectedMedForTicket.pharmacie.telephone}`} className="font-mono font-bold text-slate-900 underline">
                    {selectedMedForTicket.pharmacie.telephone}
                  </a>
                </p>
                <p className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-600" />
                  <span>{selectedMedForTicket.pharmacie.horairesOuverture}</span>
                </p>
                <p className="text-slate-900 font-bold pt-1">
                  Prix officiel : {selectedMedForTicket.pharmacie.prixFCFA.toLocaleString('fr-FR')} FCFA
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <a
                href={`tel:${selectedMedForTicket.pharmacie.telephone}`}
                className="flex-1 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Phone className="w-4 h-4" />
                <span>Appeler pour Réserver la Boîte</span>
              </a>
              <button
                onClick={() => setSelectedMedForTicket(null)}
                className="py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold"
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
