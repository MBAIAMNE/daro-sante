import React, { useState } from 'react';
import {
  CreditCard,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Printer,
  ShieldCheck,
  X,
  Phone,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Receipt,
  FileCheck,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { SAAS_PLANS, INITIAL_CLINIC_SUBSCRIPTIONS } from '../data/nationalDirectory';
import { SubscriptionPlan, ClinicSubscription } from '../types';
import { Logo } from './Logo';

interface SubscriptionBillingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionBillingModal: React.FC<SubscriptionBillingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentEtablissement, currentUser } = useClinic();

  const [subscriptions, setSubscriptions] = useState<ClinicSubscription[]>(() => {
    try {
      const saved = localStorage.getItem('daro_subscriptions');
      return saved ? JSON.parse(saved) : INITIAL_CLINIC_SUBSCRIPTIONS;
    } catch {
      return INITIAL_CLINIC_SUBSCRIPTIONS;
    }
  });

  const [activeTab, setActiveTab] = useState<'mon_abonnement' | 'plans' | 'factures'>('mon_abonnement');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan-pro');
  const [paymentMode, setPaymentMode] = useState<'airtel_money' | 'moov_money' | 'virement_bancaire'>('airtel_money');
  const [paymentPhone, setPaymentPhone] = useState('+235 66 00 00 00');
  const [paymentRef, setPaymentRef] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentEtabId = currentEtablissement?.id || 'etab-1';
  const currentSub = subscriptions.find(s => s.etablissementId === currentEtabId) || subscriptions[0];
  const activePlan = SAAS_PLANS.find(p => p.id === currentSub.planId) || SAAS_PLANS[1];

  const handleSimulatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const ref = paymentRef.trim() || `DARO-${paymentMode.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
      const newInvoice = {
        id: `inv-${Date.now()}`,
        numero: `DARO-SUB-2025-${Math.floor(1000 + Math.random() * 9000)}`,
        dateEmission: new Date().toISOString().split('T')[0],
        periodeMois: 'Novembre 2025',
        montantFCFA: activePlan.prixMensuelFCFA,
        statut: 'payee' as const,
        moyenPaiement: paymentMode === 'airtel_money' ? 'Airtel Money Tchad' : paymentMode === 'moov_money' ? 'Moov Money Tchad' : 'Virement Bancaire',
        datePaiement: new Date().toLocaleString('fr-FR'),
        recuNumero: `REC-DARO-${Math.floor(10000 + Math.random() * 90000)}`,
      };

      const updatedSub: ClinicSubscription = {
        ...currentSub,
        statut: 'actif',
        dateProchaineEcheance: '2025-12-01',
        modePaiementPrefere: paymentMode,
        referencePaiementDernier: ref,
        historiqueFactures: [newInvoice, ...currentSub.historiqueFactures],
      };

      const newSubs = subscriptions.map(s => s.id === currentSub.id ? updatedSub : s);
      setSubscriptions(newSubs);
      localStorage.setItem('daro_subscriptions', JSON.stringify(newSubs));

      setIsProcessing(false);
      setPaymentSuccess(`Paiement de l'abonnement mensuel (${activePlan.prixMensuelFCFA.toLocaleString('fr-FR')} FCFA) validé avec succès via ${newInvoice.moyenPaiement} (Réf : ${ref}).`);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-4xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-auto max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-[#0B3C5D]">
                  Abonnement Clinique & Modèle SaaS DARÔ Santé
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Licence Active
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Gestion de l'abonnement mensuel pour l'accès aux serveurs cliniques, télémédecine et plateforme HDS au Tchad.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 rounded-2xl bg-slate-100 max-w-md">
          <button
            onClick={() => { setActiveTab('mon_abonnement'); setPaymentSuccess(null); }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition ${
              activeTab === 'mon_abonnement' ? 'bg-white text-[#0B3C5D] shadow-xs' : 'text-slate-600'
            }`}
          >
            Mon Contrat Clinique
          </button>
          <button
            onClick={() => { setActiveTab('plans'); setPaymentSuccess(null); }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition ${
              activeTab === 'plans' ? 'bg-white text-[#0B3C5D] shadow-xs' : 'text-slate-600'
            }`}
          >
            Grille Tarifaire (3 Plans)
          </button>
          <button
            onClick={() => { setActiveTab('factures'); setPaymentSuccess(null); }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition ${
              activeTab === 'factures' ? 'bg-white text-[#0B3C5D] shadow-xs' : 'text-slate-600'
            }`}
          >
            Factures & Reçus ({currentSub.historiqueFactures.length})
          </button>
        </div>

        {paymentSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">Confirmation de Règlement d'Abonnement :</p>
              <p>{paymentSuccess}</p>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 1: MON ABONNEMENT EN COURS */}
        {/* ========================================================= */}
        {activeTab === 'mon_abonnement' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0B3C5D] to-[#1E88E5] text-white space-y-3 md:col-span-2 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                      Établissement Enregistré :
                    </span>
                    <h3 className="text-lg font-black">{currentEtablissement?.nom || 'Clinique Médicale Espoir'}</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-400 text-slate-950 font-black text-[10px]">
                    ● Statut : ACTIF
                  </span>
                </div>

                <div className="pt-2 border-t border-white/20 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] opacity-80 block">Formule en vigueur :</span>
                    <span className="text-base font-bold">{activePlan.nom}</span>
                  </div>
                  <div>
                    <span className="text-[10px] opacity-80 block">Tarif mensuel :</span>
                    <span className="text-base font-black">
                      {activePlan.prixMensuelFCFA.toLocaleString('fr-FR')} FCFA / mois
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] opacity-80 block">Prochaine Échéance :</span>
                    <span className="text-base font-bold">{currentSub.dateProchaineEcheance}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-2 text-xs">
                <span className="text-[11px] font-bold uppercase text-slate-400">
                  Praticiens & Quotas Inclus :
                </span>
                <div className="space-y-1 text-slate-700">
                  <p>• Praticiens : <strong>{activePlan.maxPraticiens} comptes</strong></p>
                  <p>• Dossiers patients : <strong>{typeof activePlan.maxDossiersPatients === 'number' ? activePlan.maxDossiersPatients.toLocaleString('fr-FR') : 'Illimités'}</strong></p>
                  <p>• Télémédecine vidéo : <strong>{activePlan.teleconsultationIllimitee ? 'Illimitée' : 'Standard'}</strong></p>
                  <p>• Support : <strong>{activePlan.supportPrioritaire}</strong></p>
                </div>
                <div className="pt-2">
                  <span className="text-[10px] text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    Hébergement HDS Cloud Certifié
                  </span>
                </div>
              </div>
            </div>

            {/* Renouveler / Payer l'échéance mensuelle */}
            <div className="p-6 rounded-3xl bg-white border-2 border-teal-200 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Régler ou Renouveler l'Abonnement Mensuel (Moyens de Paiement Tchad)
                </h3>
              </div>

              <form onSubmit={handleSimulatePayment} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Sélectionnez le mode de versement :
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMode('airtel_money')}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition ${
                        paymentMode === 'airtel_money'
                          ? 'border-rose-500 bg-rose-50/50 ring-2 ring-rose-500/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-rose-600 text-white font-black text-[11px] flex items-center justify-center shrink-0">
                        AM
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Airtel Money Tchad</p>
                        <p className="text-[10px] text-slate-500">Marchand : 9920148</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMode('moov_money')}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition ${
                        paymentMode === 'moov_money'
                          ? 'border-sky-500 bg-sky-50/50 ring-2 ring-sky-500/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-sky-600 text-white font-black text-[11px] flex items-center justify-center shrink-0">
                        MM
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Moov Money Tchad</p>
                        <p className="text-[10px] text-slate-500">Code Express : 44102</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMode('virement_bancaire')}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition ${
                        paymentMode === 'virement_bancaire'
                          ? 'border-teal-500 bg-teal-50/50 ring-2 ring-teal-500/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-teal-700 text-white font-black text-[11px] flex items-center justify-center shrink-0">
                        RIB
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Virement Ecobank / SGT</p>
                        <p className="text-[10px] text-slate-500">Compte DARÔ Santé Tchad</p>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Numéro Téléphone Débiteur / Contact Clinique :
                    </label>
                    <input
                      type="text"
                      value={paymentPhone}
                      onChange={e => setPaymentPhone(e.target.value)}
                      placeholder="+235 66 ..."
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Référence de Transaction ou N° Bordereau :
                    </label>
                    <input
                      type="text"
                      value={paymentRef}
                      onChange={e => setPaymentRef(e.target.value)}
                      placeholder="Ex: AM-NDJ-994102 ou Virement SGT..."
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-slate-500 block">Total à régler pour 1 mois :</span>
                    <span className="text-lg font-black text-[#0B3C5D]">
                      {activePlan.prixMensuelFCFA.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="py-3 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <span>Validation en cours...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Confirmer le Règlement de la Mensualité</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: GRILLE TARIFAIRE DES 3 FORMULES */}
        {/* ========================================================= */}
        {activeTab === 'plans' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SAAS_PLANS.map(plan => {
              const isCurrent = plan.id === currentSub.planId;

              return (
                <div
                  key={plan.id}
                  className={`p-6 rounded-3xl border flex flex-col justify-between space-y-4 transition ${
                    isCurrent
                      ? 'border-2 border-teal-500 bg-teal-50/20 shadow-md ring-2 ring-teal-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="space-y-3">
                    {isCurrent && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-600 text-white inline-block">
                        Formule Actuelle
                      </span>
                    )}
                    <h3 className="text-base font-black text-slate-900">{plan.nom}</h3>
                    <p className="text-xs text-slate-500">{plan.description}</p>

                    <div className="py-2 border-y border-slate-100">
                      <span className="text-2xl font-black text-[#0B3C5D]">
                        {plan.prixMensuelFCFA.toLocaleString('fr-FR')}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold"> FCFA / mois</span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-700">
                      <span className="text-[11px] uppercase font-bold text-slate-400 block pb-1">
                        Inclus dans ce pack :
                      </span>
                      {plan.fonctionnalites.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                          <span className="text-[11.5px] leading-tight">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedPlanId(plan.id);
                      setActiveTab('mon_abonnement');
                    }}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition ${
                      isCurrent
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-[#0B3C5D] hover:bg-[#07273d] text-white'
                    }`}
                  >
                    {isCurrent ? 'Renouveler ce Pack' : 'Migrer vers ce Pack'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: FACTURES ET REÇUS D'ABONNEMENT */}
        {/* ========================================================= */}
        {activeTab === 'factures' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Historique certifié des cotisations d'abonnement plateforme</span>
              <span className="text-teal-700 font-semibold">Reçus conformes OHADA / Tchad</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Facture N°</th>
                    <th className="p-3">Période</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Mode de Règlement</th>
                    <th className="p-3 text-right">Montant</th>
                    <th className="p-3 text-center">Statut</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentSub.historiqueFactures.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-mono font-bold text-teal-800">{inv.numero}</td>
                      <td className="p-3 font-medium text-slate-800">{inv.periodeMois}</td>
                      <td className="p-3 text-slate-500">{inv.dateEmission}</td>
                      <td className="p-3 text-slate-600">{inv.moyenPaiement}</td>
                      <td className="p-3 text-right font-black text-slate-900">
                        {inv.montantFCFA.toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          Payée
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => window.print()}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                          title="Télécharger / Imprimer Reçu"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
