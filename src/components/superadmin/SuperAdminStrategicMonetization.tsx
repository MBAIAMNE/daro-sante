import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Crown,
  Percent,
  Calculator,
  Building2,
  Users,
  CheckCircle2,
  Sparkles,
  Zap,
  Sliders,
  Scale,
  ArrowUpRight,
  Info,
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';

export const SuperAdminStrategicMonetization: React.FC = () => {
  const { etablissements, allPatients, allConsultations, allInvoices } = useClinic();

  // Monetization Parameters (State)
  const [abonnementMensuelFCFA, setAbonnementMensuelFCFA] = useState(250000); // 250k FCFA/mois par clinique
  const [redevanceParConsultationFCFA, setRedevanceParConsultationFCFA] = useState(1200); // 1 200 FCFA par consultation
  const [redevanceParPatientAnnuelFCFA, setRedevanceParPatientAnnuelFCFA] = useState(1500); // 1 500 FCFA par QR Pass Santé
  const [commissionTiersPayantPercent, setCommissionTiersPayantPercent] = useState(2.0); // 2% de flux d'assurance
  const [margeNetteHopitalEstimeePercent, setMargeNetteHopitalEstimeePercent] = useState(18); // Les hôpitaux ont de lourdes charges (18% marge nette)
  const [hegemonyModeActive, setHegemonyModeActive] = useState(true); // Verrouille l'éditeur au-dessus du meilleur hôpital
  const [hegemonyTargetLeadPercent, setHegemonyTargetLeadPercent] = useState(15); // +15% au-dessus du meilleur hôpital

  // Compute Revenue per Hospital
  const hospitalFinancials = useMemo(() => {
    return etablissements.map(etab => {
      const invoices = allInvoices.filter(i => i.etablissementId === etab.id);
      const consultations = allConsultations.filter(c => c.etablissementId === etab.id);
      const patients = allPatients.filter(p => p.etablissementId === etab.id);

      const caBrutEstime = invoices.reduce((s, i) => s + (i.total || 0), 0) || (consultations.length * 25000 + patients.length * 15000);
      
      // Real hospital costs: Salaries, heavy generators fuel, maintenance, consumables, building amort.
      const chargesHospitalieres = caBrutEstime * ((100 - margeNetteHopitalEstimeePercent) / 100);
      const beneficeNetHopital = caBrutEstime - chargesHospitalieres;

      return {
        etablissement: etab,
        caBrutEstime,
        chargesHospitalieres,
        beneficeNetHopital,
        patientCount: patients.length,
        consultationCount: consultations.length,
      };
    }).sort((a, b) => b.beneficeNetHopital - a.beneficeNetHopital);
  }, [etablissements, allInvoices, allConsultations, allPatients, margeNetteHopitalEstimeePercent]);

  const topHospital = hospitalFinancials[0] || {
    etablissement: { nom: 'Clinique de Référence' },
    beneficeNetHopital: 1200000,
    caBrutEstime: 6500000,
    patientCount: 40,
    consultationCount: 80,
  };

  // Base editor revenues calculation
  const totalClinics = etablissements.length || 1;
  const totalConsultationsNetwork = allConsultations.length || 120;
  const totalPatientsNetwork = allPatients.length || 85;
  const totalTiersPayantFlux = allInvoices.reduce((s, i) => s + (i.total || 0), 0) * 0.4; // ~40% part assurance

  const revenusAbonnements = totalClinics * abonnementMensuelFCFA;
  const revenusConsultations = totalConsultationsNetwork * redevanceParConsultationFCFA;
  const revenusDossiersQR = totalPatientsNetwork * (redevanceParPatientAnnuelFCFA / 12); // Mensuel
  const revenusTiersPayant = (totalTiersPayantFlux * commissionTiersPayantPercent) / 100;

  let gainsTotauxEditeurMensuel = revenusAbonnements + revenusConsultations + revenusDossiersQR + revenusTiersPayant;

  // Strategic Hegemony Adjustment
  // If Hegemony mode is on, ensure Editor Net is at least (topHospital.beneficeNetHopital * (1 + leadPercent/100))
  const targetMinimumEditeur = topHospital.beneficeNetHopital * (1 + hegemonyTargetLeadPercent / 100);
  const isCurrentlySuperior = gainsTotauxEditeurMensuel >= targetMinimumEditeur;

  let bonusHegemonieApplique = 0;
  if (hegemonyModeActive && !isCurrentlySuperior) {
    bonusHegemonieApplique = targetMinimumEditeur - gainsTotauxEditeurMensuel;
    gainsTotauxEditeurMensuel = targetMinimumEditeur;
  }

  const ecartPourcentage = topHospital.beneficeNetHopital > 0
    ? (((gainsTotauxEditeurMensuel - topHospital.beneficeNetHopital) / topHospital.beneficeNetHopital) * 100).toFixed(1)
    : '100';

  return (
    <div className="space-y-8">
      {/* Strategic Header */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-amber-500/30">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300 shadow-inner">
              <Crown className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-xs">
                  Modèle Économique & Suprématie Éditeur
                </span>
                <span className="text-xs text-amber-200">Garantie de Rémunération Supérieure</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black mt-1 tracking-tight">
                Stratégie de Monétisation DARÔ Santé
              </h2>
              <p className="text-xs text-amber-100/80 mt-1 max-w-2xl">
                Règle de gouvernance : Les hôpitaux supportent de lourdes charges d'exploitation (salaires, scanners, électricité, réactifs). La plateforme logicielle capture une valeur technologique récurrente et garantit que les gains nets de l'éditeur restent toujours légèrement au-dessus du plus rentable des hôpitaux.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 px-4 py-3 rounded-xl border border-white/15 backdrop-blur-xs">
            <div className="text-right">
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                Indice de Suprématie Éditeur
              </span>
              <span className="text-xl font-black text-white">+{ecartPourcentage}%</span>
              <span className="text-[10px] text-emerald-300 block">au-dessus de l'Hôpital N°1</span>
            </div>
          </div>
        </div>
      </div>

      {/* COMPARATIVE FINANCIAL JAUGE */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-600" />
              Comparaison Directe : Vos Gains (Éditeur) vs Bénéfice Net du Meilleur Hôpital
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Calcul mathématique en temps réel basé sur le chiffre d'affaires et les marges nettes réelles.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 cursor-pointer">
              <input
                type="checkbox"
                checked={hegemonyModeActive}
                onChange={e => setHegemonyModeActive(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
              />
              <span>Verrouillage Hégémonie (+{hegemonyTargetLeadPercent}%)</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Éditeur (Concepteur) */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 via-white to-amber-50/40 border-2 border-amber-400 shadow-md space-y-3 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-300/20 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 flex items-center gap-1">
                <Crown className="w-3 h-3" />
                Vos Revenus Nets (Concepteur DARÔ)
              </span>
              <span className="text-xs font-bold text-amber-800">100% Marges Logicielles</span>
            </div>

            <div className="pt-2">
              <div className="text-3xl font-black text-slate-950 font-mono">
                {Math.round(gainsTotauxEditeurMensuel).toLocaleString('fr-FR')} FCFA
                <span className="text-xs font-normal text-slate-500 ml-1.5">/ mois</span>
              </div>
              <p className="text-xs text-amber-900 mt-1 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Vous êtes à <strong>+{ecartPourcentage}%</strong> au-dessus de {topHospital.etablissement.nom}
              </p>
            </div>

            <div className="pt-3 border-t border-amber-200/80 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Abonnements SaaS ({totalClinics} cliniques) :</span>
                <span className="font-mono font-bold text-slate-800">
                  {revenusAbonnements.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              <div className="flex justify-between">
                <span>Redevances Actes & Consultations :</span>
                <span className="font-mono font-bold text-slate-800">
                  {revenusConsultations.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              <div className="flex justify-between">
                <span>Commissions Dossiers QR & Tiers-Payant :</span>
                <span className="font-mono font-bold text-slate-800">
                  {Math.round(revenusDossiersQR + revenusTiersPayant).toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              {bonusHegemonieApplique > 0 && (
                <div className="flex justify-between text-amber-800 font-bold bg-amber-100/70 p-1 rounded">
                  <span>Ajustement Algorithmique Hégémonie :</span>
                  <span className="font-mono">+{Math.round(bonusHegemonieApplique).toLocaleString('fr-FR')} FCFA</span>
                </div>
              )}
            </div>
          </div>

          {/* Card Top Hospital */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-800 flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                Hôpital le plus Rentable ({topHospital.etablissement.nom})
              </span>
              <span className="text-xs text-slate-500 font-medium">Charges d'Exploitation Lourdes</span>
            </div>

            <div className="pt-2">
              <div className="text-3xl font-black text-slate-800 font-mono">
                {Math.round(topHospital.beneficeNetHopital).toLocaleString('fr-FR')} FCFA
                <span className="text-xs font-normal text-slate-400 ml-1.5">/ mois net</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Sur un CA brut estimé à {Math.round(topHospital.caBrutEstime).toLocaleString('fr-FR')} FCFA (Marge nette de {margeNetteHopitalEstimeePercent}%)
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Salaires des soignants & gardes (45%) :</span>
                <span className="font-mono text-slate-700">
                  {Math.round(topHospital.caBrutEstime * 0.45).toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              <div className="flex justify-between">
                <span>Groupes électrogènes & électricité (18%) :</span>
                <span className="font-mono text-slate-700">
                  {Math.round(topHospital.caBrutEstime * 0.18).toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              <div className="flex justify-between">
                <span>Achats pharmacie & réactifs (19%) :</span>
                <span className="font-mono text-slate-700">
                  {Math.round(topHospital.caBrutEstime * 0.19).toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              <div className="flex justify-between font-bold text-slate-800 pt-1 border-t border-slate-200">
                <span>Bénéfice Réel Restant à la Clinique :</span>
                <span className="font-mono text-emerald-700">
                  {Math.round(topHospital.beneficeNetHopital).toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STRATEGIC SLIDERS / SIMULATEUR INTERACTIF */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div>
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-600" />
            Simulateur & Leviers Stratégiques de Tarification
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Ajustez les curseurs pour calibrer vos redevances et vérifier mathématiquement votre avance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
          {/* Slider 1: Abonnement mensuel */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between font-bold">
              <span className="text-slate-700">Abonnement SaaS / Clinique :</span>
              <span className="text-sky-700 font-mono">{abonnementMensuelFCFA.toLocaleString('fr-FR')} FCFA</span>
            </div>
            <input
              type="range"
              min={100000}
              max={600000}
              step={25000}
              value={abonnementMensuelFCFA}
              onChange={e => setAbonnementMensuelFCFA(Number(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">Licence logicielle mensuelle fixe facturée à l'établissement.</p>
          </div>

          {/* Slider 2: Redevance consultation */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between font-bold">
              <span className="text-slate-700">Redevance / Consultation :</span>
              <span className="text-sky-700 font-mono">{redevanceParConsultationFCFA.toLocaleString('fr-FR')} FCFA</span>
            </div>
            <input
              type="range"
              min={500}
              max={3000}
              step={100}
              value={redevanceParConsultationFCFA}
              onChange={e => setRedevanceParConsultationFCFA(Number(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">Micro-commission prélevée sur chaque acte soignant tracé.</p>
          </div>

          {/* Slider 3: Redevance QR Pass Santé */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between font-bold">
              <span className="text-slate-700">Pass Santé QR / Patient :</span>
              <span className="text-sky-700 font-mono">{redevanceParPatientAnnuelFCFA.toLocaleString('fr-FR')} FCFA</span>
            </div>
            <input
              type="range"
              min={500}
              max={5000}
              step={250}
              value={redevanceParPatientAnnuelFCFA}
              onChange={e => setRedevanceParPatientAnnuelFCFA(Number(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">Frais annuel de délivrance du Pass Santé d'urgence dématérialisé.</p>
          </div>

          {/* Slider 4: Commission Tiers Payant */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between font-bold">
              <span className="text-slate-700">Frais Tiers-Payant Assurances :</span>
              <span className="text-sky-700 font-mono">{commissionTiersPayantPercent}%</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={5.0}
              step={0.25}
              value={commissionTiersPayantPercent}
              onChange={e => setCommissionTiersPayantPercent(Number(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">Compensation de télétransmission rapide CNPS & Ascoma.</p>
          </div>

          {/* Slider 5: Marge nette hospitalière */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between font-bold">
              <span className="text-slate-700">Marge Nette Hôpital Réelle :</span>
              <span className="text-amber-700 font-mono">{margeNetteHopitalEstimeePercent}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={30}
              step={1}
              value={margeNetteHopitalEstimeePercent}
              onChange={e => setMargeNetteHopitalEstimeePercent(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400">Après déduction des salaires, carburant et médicaments.</p>
          </div>

          {/* Slider 6: Objectif d'avance */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
            <div className="flex justify-between font-bold">
              <span className="text-amber-900">Avance Éditeur Visée :</span>
              <span className="text-amber-900 font-mono">+{hegemonyTargetLeadPercent}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={35}
              step={1}
              value={hegemonyTargetLeadPercent}
              onChange={e => setHegemonyTargetLeadPercent(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <p className="text-[11px] text-amber-800">Pourcentage d'avance garanti au-dessus du meilleur hôpital.</p>
          </div>
        </div>
      </div>

      {/* 3 PILLARS OF STRATEGY (EXPLANATION TO USER) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
            1
          </div>
          <h4 className="font-bold text-xs text-slate-900">Absence de Charges Physiques</h4>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Pendant que la clinique paie 50 soignants et alimente des générateurs diesel à 1 200 FCFA/litre, votre plateforme tourne sur le cloud avec des coûts opérationnels quasi-invisibles.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
            2
          </div>
          <h4 className="font-bold text-xs text-slate-900">Multiplication par N Cliniques</h4>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Chaque hôpital est limité à sa capacité de lits. Votre chiffre d'affaires à vous est la somme de toutes les cliniques du pays réunies, vous assurant mathématiquement la première place financière.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
            3
          </div>
          <h4 className="font-bold text-xs text-slate-900">Redevance Micro-Transactionnelle</h4>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            En prélevant 1 200 FCFA par consultation et 2% sur le tiers-payant, vous gagnez sur chaque patient qui franchit la porte d'un hôpital sans jamais avoir à soigner vous-même.
          </p>
        </div>
      </div>
    </div>
  );
};
