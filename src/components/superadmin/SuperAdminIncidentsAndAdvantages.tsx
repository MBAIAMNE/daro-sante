import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Zap,
  TrendingUp,
  FileCheck,
  Clock,
  Lock,
  WifiOff,
  Sparkles,
  HeartPulse,
  DollarSign,
  Plus,
  ThumbsUp,
  History,
  Lightbulb,
} from 'lucide-react';

interface FailleIncident {
  id: string;
  titre: string;
  categorie: 'securite' | 'medical' | 'financier' | 'technique';
  gravite: 'critique' | 'haute' | 'moderee';
  date: string;
  etablissementConcerne: string;
  description: string;
  impactEvite: string;
  statut: 'bloque_avec_succes' | 'resorbe_automatiquement' | 'en_cours_amelioration';
  ameliorationAppliquee: string;
}

const INITIAL_FAILLES: FailleIncident[] = [
  {
    id: 'f-1',
    titre: 'Tentative de double délivrance de stupéfiants',
    categorie: 'medical',
    gravite: 'critique',
    date: '2026-09-18',
    etablissementConcerne: 'Clinique La Grâce (N\'Djamena)',
    description: 'Une ordonnance de Morphine injectable déjà servie il y a 2h a été représentée à un autre guichet de pharmacie.',
    impactEvite: 'Évite un surdosage mortel et un détournement illicite de stupéfiants.',
    statut: 'bloque_avec_succes',
    ameliorationAppliquee: 'Verrouillage automatique instantané du QR Code d\'ordonnance dès la première validation au comptoir.',
  },
  {
    id: 'f-2',
    titre: 'Coupure fibre optique locale (4 heures)',
    categorie: 'technique',
    gravite: 'haute',
    date: '2026-09-15',
    etablissementConcerne: 'Hôpital Régional de Moundou',
    description: 'Interruption inopinée de la connectivité Internet pendant le service de garde de nuit.',
    impactEvite: 'Zéro interruption des soins : les soignants ont continué à saisir les constantes et consultations en mode PWA local.',
    statut: 'resorbe_automatiquement',
    ameliorationAppliquee: 'Bufferisation IndexedDB chiffrée avec resynchronisation séquentielle automatique dès le retour du réseau.',
  },
  {
    id: 'f-3',
    titre: 'Tentative de modification non autorisée d\'un compte-rendu scanné',
    categorie: 'securite',
    gravite: 'critique',
    date: '2026-09-12',
    etablissementConcerne: 'Polyclinique de Chagoua',
    description: 'Tentative d\'accès à un dossier radiologique sans mandat d\'affectation par un compte externe.',
    impactEvite: 'Protection absolue du secret médical et prévention d\'une falsification d\'expertise médico-légale.',
    statut: 'bloque_avec_succes',
    ameliorationAppliquee: 'Règle RBAC inviolable avec journalisation blockchain/audit log horodatée à la milliseconde.',
  },
  {
    id: 'f-4',
    titre: 'Écart de caisse sur paiement d\'admission aux urgences',
    categorie: 'financier',
    gravite: 'moderee',
    date: '2026-09-08',
    etablissementConcerne: 'Cabinet Médical Le Progrès',
    description: 'Décalage entre le reçu papier manuel et le bordereau de garde.',
    impactEvite: 'Évite une perte financière de 45 000 FCFA et sécurise la recette de la clinique.',
    statut: 'bloque_avec_succes',
    ameliorationAppliquee: 'Interdiction des quittances manuelles : chaque paiement génère un ticket scellé avec QR Code caisse obligatoire.',
  },
];

export const SuperAdminIncidentsAndAdvantages: React.FC = () => {
  const [failles, setFailles] = useState<FailleIncident[]>(INITIAL_FAILLES);
  const [filterCat, setFilterCat] = useState<'tous' | 'securite' | 'medical' | 'financier' | 'technique'>('tous');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [nouveauTitre, setNouveauTitre] = useState('');
  const [nouvelleCat, setNouvelleCat] = useState<'securite' | 'medical' | 'financier' | 'technique'>('technique');
  const [nouvelleGravite, setNouvelleGravite] = useState<'critique' | 'haute' | 'moderee'>('haute');
  const [nouvelEtab, setNouvelEtab] = useState('Clinique La Grâce (N\'Djamena)');
  const [nouvelleDesc, setNouvelleDesc] = useState('');
  const [nouvelImpact, setNouvelImpact] = useState('');
  const [nouvelleAmelioration, setNouvelleAmelioration] = useState('');

  const filteredFailles = failles.filter(f => filterCat === 'tous' || f.categorie === filterCat);

  const handleCreateFaille = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nouveauTitre.trim() || !nouvelleDesc.trim()) return;

    const item: FailleIncident = {
      id: `f-${Date.now()}`,
      titre: nouveauTitre.trim(),
      categorie: nouvelleCat,
      gravite: nouvelleGravite,
      date: new Date().toISOString().split('T')[0],
      etablissementConcerne: nouvelEtab,
      description: nouvelleDesc.trim(),
      impactEvite: nouvelImpact.trim() || 'Incident sécurisé sans préjudice patient.',
      statut: 'bloque_avec_succes',
      ameliorationAppliquee: nouvelleAmelioration.trim() || 'Correctif architectural déployé sur le noyau DARÔ.',
    };

    setFailles([item, ...failles]);
    setShowAddModal(false);
    setNouveauTitre('');
    setNouvelleDesc('');
    setNouvelImpact('');
    setNouvelleAmelioration('');
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-indigo-500/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-inner">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-400 text-slate-950">
                  R&D & Amélioration Continue
                </span>
                <span className="text-xs text-indigo-200">Audit de Robustesse Opérationnelle</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black mt-1 tracking-tight">
                Registre des Failles Interceptées & Avantages Comparatifs DARÔ
              </h2>
              <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
                Suivi transparent des vulnérabilités évitées, des incidents de terrain neutralisés et des gains d'efficience majeurs constatés sur le réseau hospitalier.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-indigo-50 font-bold text-xs flex items-center gap-2 shadow-sm transition"
          >
            <Plus className="w-4 h-4 text-indigo-600" />
            <span>Consigner une Faille / Retour</span>
          </button>
        </div>
      </div>

      {/* 4 KEY ADVANTAGES METRICS */}
      <div>
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Avantages Majeurs & Gains d'Efficience Mesurés
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <div className="text-2xl font-black text-slate-900">-94%</div>
            <div className="text-xs font-bold text-slate-700 mt-0.5">Temps d'Admission aux Urgences</div>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Passé de 35 min d'interrogatoire papier à <strong>1 min 45s</strong> grâce au scan du Pass Santé QR.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <FileCheck className="w-5 h-5" />
            </div>
            <div className="text-2xl font-black text-slate-900">0%</div>
            <div className="text-xs font-bold text-slate-700 mt-0.5">Perte de Dossiers Médicaux</div>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Avant DARÔ, 42% des carnets papier étaient égarés par les patients. Aujourd'hui, <strong>100%</strong> de conservation cloud.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
              <DollarSign className="w-5 h-5" />
            </div>
            <div className="text-2xl font-black text-slate-900">+38%</div>
            <div className="text-xs font-bold text-slate-700 mt-0.5">Sécurisation des Recettes de Caisse</div>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Élimination totale des actes médicaux non facturés et des tickets parallèles grâce au QR Caisse.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div className="text-2xl font-black text-slate-900">48h</div>
            <div className="text-xs font-bold text-slate-700 mt-0.5">Remboursement Tiers-Payant Assurances</div>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Les accords CNPS et Ascoma passent de 45 jours d'attente à seulement <strong>48 heures</strong> de télétransmission.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION: FAILLLES ET INCIDENTS INTERCEPTES */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Journal des Failles & Incidents Neutralisés sur le Réseau
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Toutes les anomalies détectées et les améliorations logicielles concrètement apportées.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterCat}
              onChange={e => setFilterCat(e.target.value as any)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
            >
              <option value="tous">Toutes catégories</option>
              <option value="securite">Sécurité & Accès</option>
              <option value="medical">Médical & Pharmacie</option>
              <option value="financier">Financier & Caisse</option>
              <option value="technique">Technique & Réseau</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredFailles.map(faille => {
            const isCritique = faille.gravite === 'critique';
            const isHaute = faille.gravite === 'haute';

            return (
              <div key={faille.id} className="p-5 hover:bg-slate-50/70 transition space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isCritique
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : isHaute
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}
                    >
                      Gravité {faille.gravite}
                    </span>

                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 capitalize">
                      {faille.categorie}
                    </span>

                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">{faille.titre}</h4>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span>{faille.etablissementConcerne}</span>
                    <span>•</span>
                    <span className="font-mono">{faille.date}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{faille.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs">
                    <div className="font-bold text-emerald-900 flex items-center gap-1.5 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Impact Évité Grâce à DARÔ :</span>
                    </div>
                    <p className="text-emerald-800 text-[11px]">{faille.impactEvite}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200/80 text-xs">
                    <div className="font-bold text-sky-900 flex items-center gap-1.5 mb-1">
                      <Lightbulb className="w-3.5 h-3.5 text-sky-600" />
                      <span>Amélioration Logicielle Intégrée :</span>
                    </div>
                    <p className="text-sky-800 text-[11px]">{faille.ameliorationAppliquee}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Ajouter un retour ou une faille */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-fadeIn">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Consigner une Faille ou un Incident</h3>
                  <p className="text-[11px] text-slate-500">Pour améliorer continuellement la plateforme</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFaille} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Titre de l'incident / faille :</label>
                <input
                  type="text"
                  required
                  value={nouveauTitre}
                  onChange={e => setNouveauTitre(e.target.value)}
                  placeholder="Ex: Doublon de facturation, Déconnexion inopinée..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Catégorie :</label>
                  <select
                    value={nouvelleCat}
                    onChange={e => setNouvelleCat(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden"
                  >
                    <option value="technique">Technique & Réseau</option>
                    <option value="securite">Sécurité & Accès</option>
                    <option value="medical">Médical & Posologie</option>
                    <option value="financier">Financier & Caisse</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Niveau de Gravité :</label>
                  <select
                    value={nouvelleGravite}
                    onChange={e => setNouvelleGravite(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden"
                  >
                    <option value="moderee">Modérée</option>
                    <option value="haute">Haute</option>
                    <option value="critique">Critique</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Établissement concerné :</label>
                <input
                  type="text"
                  value={nouvelEtab}
                  onChange={e => setNouvelEtab(e.target.value)}
                  placeholder="Nom de la clinique ou hôpital"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description des faits :</label>
                <textarea
                  rows={2}
                  required
                  value={nouvelleDesc}
                  onChange={e => setNouvelleDesc(e.target.value)}
                  placeholder="Que s'est-il passé exactement ?"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Impact prévenu / évité :</label>
                <input
                  type="text"
                  value={nouvelImpact}
                  onChange={e => setNouvelImpact(e.target.value)}
                  placeholder="Ex: Évite une erreur de délivrance de médicament"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Amélioration logicielle recommandée :</label>
                <input
                  type="text"
                  value={nouvelleAmelioration}
                  onChange={e => setNouvelleAmelioration(e.target.value)}
                  placeholder="Ex: Ajout d'une alerte bloquante avant validation"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md"
                >
                  Enregistrer l'incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
