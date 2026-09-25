import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Printer,
  CheckCircle2,
  DollarSign,
  Smartphone,
  Wallet,
  Clock,
  ArrowRight,
  Receipt,
  X,
  Lock,
  Shield,
  FileCheck,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { Facture, PaymentMethod } from '../types';
import { Logo } from '../components/Logo';

export const BillingView: React.FC = () => {
  const {
    invoices,
    patients,
    payerFacture,
    creerFacture,
    currentRole,
  } = useClinic();

  const isAuthorized = ['accueil', 'gestionnaire', 'directeur', 'caissier', 'superadmin'].includes(currentRole);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'tous' | 'en_attente' | 'payee' | 'tiers_payant'>('tous');
  const [selectedInvoiceToPay, setSelectedInvoiceToPay] = useState<Facture | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('especes');
  const [referencePaiement, setReferencePaiement] = useState('REC-NDJ-2025-098');
  const [montantRecu, setMontantRecu] = useState<number>(10000);
  const [tiersPayantOrganisme, setTiersPayantOrganisme] = useState('CNPS Tchad (Prise en charge 80%)');
  const [tiersPayantAccordNum, setTiersPayantAccordNum] = useState('');

  // Receipt modal
  const [showReceiptModal, setShowReceiptModal] = useState<Facture | null>(null);

  // New Invoice modal
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [newPatientId, setNewPatientId] = useState(patients[0]?.id || '');
  const [newDesignation, setNewDesignation] = useState('Consultation Spécialisée + Bilan Biologique Paludisme');
  const [newMontant, setNewMontant] = useState(15000);
  const [newApplyTiersPayant, setNewApplyTiersPayant] = useState(false);
  const [newTPOrganisme, setNewTPOrganisme] = useState('CNPS Tchad');
  const [newTPTaux, setNewTPTaux] = useState(80);
  const [newTPNumAccord, setNewTPNumAccord] = useState('');

  // Auto-detect patient insurance when newPatientId changes
  const handleSelectNewPatient = (patId: string) => {
    setNewPatientId(patId);
    const pat = patients.find(p => p.id === patId);
    if (pat?.assurance?.adherent) {
      setNewApplyTiersPayant(true);
      setNewTPOrganisme(pat.assurance.organisme);
      setNewTPTaux(pat.assurance.tauxCouverture || 80);
      setNewTPNumAccord(`PEC-${pat.matricule || 'CNPS'}-${Date.now().toString().slice(-4)}`);
    } else {
      setNewApplyTiersPayant(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Accès Restreint à la Caisse</h2>
        <p className="text-xs text-slate-500">
          La facturation et les encaissements sont gérés par les Agents d'Accueil, le Gestionnaire et le Directeur.
        </p>
      </div>
    );
  }

  const totalEncaisse = invoices
    .filter(i => i.statut === 'payee')
    .reduce((sum, i) => sum + (i.totalFCFA ?? i.total ?? 0), 0);

  const totalEnAttente = invoices
    .filter(i => i.statut === 'en_attente')
    .reduce((sum, i) => sum + (i.totalFCFA ?? i.total ?? 0), 0);

  const filtered = invoices.filter(inv => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = inv.patientNom.toLowerCase().includes(q) || inv.numero.toLowerCase().includes(q);
    const matchesTab =
      activeTab === 'tous'
        ? true
        : activeTab === 'tiers_payant'
        ? (inv.modePaiement === 'tiers_payant' || !!inv.partAssuranceFCFA)
        : inv.statut === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleExecutePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceToPay) return;

    const isTP = paymentMethod === 'tiers_payant' || !!selectedInvoiceToPay.partAssuranceFCFA;
    const total = selectedInvoiceToPay.totalFCFA ?? selectedInvoiceToPay.total ?? 0;
    const taux = selectedInvoiceToPay.tauxCouvertureApplique || 80;
    const partAssurance = selectedInvoiceToPay.partAssuranceFCFA || (isTP ? Math.round(total * (taux / 100)) : undefined);
    const partPatient = selectedInvoiceToPay.partPatientFCFA || (isTP ? total - (partAssurance || 0) : undefined);

    payerFacture(
      selectedInvoiceToPay.id,
      paymentMethod,
      referencePaiement,
      isTP
        ? {
            organismeAssurance: selectedInvoiceToPay.organismeAssurance || tiersPayantOrganisme,
            partAssuranceFCFA: partAssurance,
            partPatientFCFA: partPatient,
            tauxCouvertureApplique: taux,
            numeroPriseEnCharge: tiersPayantAccordNum || selectedInvoiceToPay.numeroPriseEnCharge || referencePaiement,
          }
        : undefined
    );
    setSelectedInvoiceToPay(null);
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find(p => p.id === newPatientId) || patients[0];
    const partAssurance = newApplyTiersPayant ? Math.round(newMontant * (newTPTaux / 100)) : undefined;
    const partPatient = newApplyTiersPayant ? newMontant - (partAssurance || 0) : undefined;

    creerFacture({
      patientId: pat.id,
      patientNom: `${pat.prenom} ${pat.nom}`,
      items: [
        {
          description: newDesignation,
          quantite: 1,
          prixUnitaire: newMontant,
          total: newMontant,
        },
      ],
      total: newMontant,
      modePaiement: newApplyTiersPayant ? 'tiers_payant' : 'especes',
      partAssuranceFCFA: partAssurance,
      partPatientFCFA: partPatient,
      organismeAssurance: newApplyTiersPayant ? newTPOrganisme : undefined,
      tauxCouvertureApplique: newApplyTiersPayant ? newTPTaux : undefined,
      numeroPriseEnCharge: newApplyTiersPayant ? (newTPNumAccord || `PEC-${pat.matricule || 'CNPS'}-${Date.now().toString().slice(-4)}`) : undefined,
    });
    setShowNewInvoiceModal(false);
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B3C5D]">Caisse & Facturation</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
              FCFA N'Djamena
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Règlements en espèces, Airtel Money, Moov Money et reçus officiels certifiés
          </p>
        </div>

        <button
          onClick={() => setShowNewInvoiceModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B3C5D] hover:bg-[#1E88E5] text-white text-xs font-bold shadow transition"
        >
          <Plus className="w-4 h-4 text-teal-300" />
          <span>Émettre une Facture</span>
        </button>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              Total Encaissé en Caisse
            </span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-900 mt-1">
              {totalEncaisse.toLocaleString('fr-FR')} <span className="text-xs font-bold text-emerald-700">FCFA</span>
            </p>
            <p className="text-xs text-emerald-700 mt-0.5">
              {invoices.filter(i => i.statut === 'payee').length} règlements validés
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
              Factures en Attente de Règlement
            </span>
            <p className="text-2xl sm:text-3xl font-black text-amber-900 mt-1">
              {totalEnAttente.toLocaleString('fr-FR')} <span className="text-xs font-bold text-amber-700">FCFA</span>
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              {invoices.filter(i => i.statut === 'en_attente').length} créance(s) ouverte(s)
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('tous')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'tous' ? 'bg-white text-[#0B3C5D] shadow-xs' : 'text-slate-600'
            }`}
          >
            Toutes ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTab('en_attente')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'en_attente' ? 'bg-white text-[#0B3C5D] shadow-xs' : 'text-slate-600'
            }`}
          >
            En attente ({invoices.filter(i => i.statut === 'en_attente').length})
          </button>
          <button
            onClick={() => setActiveTab('payee')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'payee' ? 'bg-white text-[#0B3C5D] shadow-xs' : 'text-slate-600'
            }`}
          >
            Réglées ({invoices.filter(i => i.statut === 'payee').length})
          </button>
          <button
            onClick={() => setActiveTab('tiers_payant')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'tiers_payant' ? 'bg-white text-amber-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-amber-600" />
            <span>Tiers-Payant ({invoices.filter(i => i.modePaiement === 'tiers_payant' || !!i.partAssuranceFCFA).length})</span>
          </button>
        </div>

        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Rechercher par patient ou numéro de facture..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Facture N°</th>
                <th className="py-3 px-3">Patient</th>
                <th className="py-3 px-3">Prestations</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Montant Total</th>
                <th className="py-3 px-3">Mode de Paiement</th>
                <th className="py-3 px-3">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {inv.numero}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900">
                    {inv.patientNom}
                  </td>
                  <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                    {inv.items.map(it => it.description).join(' + ')}
                  </td>
                  <td className="py-3 px-3 text-slate-500">
                    {inv.date}
                  </td>
                  <td className="py-3 px-3 font-mono font-black text-sm text-[#0B3C5D]">
                    {(inv.totalFCFA ?? inv.total ?? 0).toLocaleString('fr-FR')} FCFA
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    <div className="font-medium">
                      {inv.modePaiement === 'airtel_money' && '📱 Airtel Money'}
                      {inv.modePaiement === 'moov_money' && '📱 Moov Money'}
                      {inv.modePaiement === 'especes' && '💵 Espèces FCFA'}
                      {inv.modePaiement === 'carte' && '💳 Carte Bancaire'}
                      {inv.modePaiement === 'tiers_payant' && '🛡️ Prise en Charge (CNPS/Assurance)'}
                      {inv.modePaiement === 'urgence_differee' && '🚨 Dérogation Urgence Vitale'}
                    </div>
                    {inv.partAssuranceFCFA ? (
                      <div className="mt-1 text-[10px] text-amber-900 bg-amber-50 rounded-lg p-1.5 border border-amber-200">
                        <span className="font-bold">{inv.organismeAssurance || 'Assurance'} ({inv.tauxCouvertureApplique || 80}%) :</span>{' '}
                        {inv.partAssuranceFCFA.toLocaleString('fr-FR')} F
                        <br />
                        <span className="text-slate-600 font-medium">Part patient : {inv.partPatientFCFA?.toLocaleString('fr-FR')} F</span>
                      </div>
                    ) : null}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.statut === 'payee'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {inv.statut === 'payee' ? 'Payée' : 'En attente'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1">
                    {inv.statut === 'en_attente' ? (
                      <button
                        onClick={() => setSelectedInvoiceToPay(inv)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
                      >
                        Encaisser
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowReceiptModal(inv)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition inline-flex items-center gap-1"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Reçu</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cashier Payment Modal */}
      {selectedInvoiceToPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#0B3C5D]">Encaisser la Facture {selectedInvoiceToPay.numero}</h3>
              <button onClick={() => setSelectedInvoiceToPay(null)} className="text-slate-400 hover:text-slate-700 p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleExecutePayment} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-500">Patient : <strong>{selectedInvoiceToPay.patientNom}</strong></p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200">
                  <span className="text-xs font-bold text-slate-700">Montant à régler :</span>
                  <span className="text-xl font-black text-emerald-700 font-mono">
                    {(selectedInvoiceToPay.totalFCFA ?? selectedInvoiceToPay.total ?? 0).toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  Mode de Règlement (Réalité Clinique Tchad) :
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('especes')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition ${
                      paymentMethod === 'especes' ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20' : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    💵 Espèces (FCFA)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('airtel_money')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition ${
                      paymentMethod === 'airtel_money' ? 'bg-red-50 border-red-500 text-red-900 ring-2 ring-red-500/20' : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    🔴 Airtel Money (*66#)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('moov_money')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition ${
                      paymentMethod === 'moov_money' ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-500/20' : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    🔵 Moov Money (*99#)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('tiers_payant')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition ${
                      paymentMethod === 'tiers_payant' ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20' : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    🛡️ CNPS / Assurance
                  </button>
                </div>

                {/* Dérogation Urgence Vitale Button */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('urgence_differee')}
                  className={`w-full mt-2 p-2.5 rounded-xl border text-left text-xs font-bold transition flex items-center justify-between ${
                    paymentMethod === 'urgence_differee'
                      ? 'bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>🚨 Dérogation Urgence Vitale</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold">
                    Soins d'abord, régularisation ensuite
                  </span>
                </button>
              </div>

              {/* Cash Change Calculator when paying cash FCFA */}
              {paymentMethod === 'especes' && (
                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-950">Calcul Rendu de Monnaie FCFA :</span>
                    <span className="text-[10px] text-emerald-700 font-medium">Caisse N'Djamena</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 font-medium">Billet remis :</span>
                    {[5000, 10000, 20000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setMontantRecu(amt)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-emerald-900 text-xs font-bold hover:bg-emerald-100"
                      >
                        {amt.toLocaleString('fr-FR')} F
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-1 text-xs border-t border-emerald-200">
                    <span className="font-bold text-slate-700">Monnaie à rendre à la famille :</span>
                    <span className="font-black text-emerald-800 text-sm font-mono">
                      {Math.max(0, montantRecu - (selectedInvoiceToPay.totalFCFA ?? selectedInvoiceToPay.total ?? 0)).toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                </div>
              )}

              {/* Insurance / Tiers-Payant Details */}
              {(paymentMethod === 'tiers_payant' || selectedInvoiceToPay.partAssuranceFCFA) && (
                <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-amber-600" />
                      Prise en Charge Tiers-Payant (Tchad)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold">
                      Accord Mutuelle
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-amber-950 mb-1">
                      Organisme / Mutuelle :
                    </label>
                    <select
                      value={tiersPayantOrganisme}
                      onChange={e => setTiersPayantOrganisme(e.target.value)}
                      className="w-full rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900"
                    >
                      <option value="CNPS Tchad">CNPS Tchad (Caisse Nationale de Prévoyance Sociale)</option>
                      <option value="Ascoma Tchad Assurances">Ascoma Tchad Assurances Santé</option>
                      <option value="Gras Savoye / Sanlam Tchad">Gras Savoye / Sanlam Assurance</option>
                      <option value="Al Wafa Assurance Tchad">Al Wafa Assurance Tchad</option>
                      <option value="Bon Société Pétrolière SHT">Bon de Société - SHT / Pétrole</option>
                      <option value="Bon CotonTchad SN">Bon Entreprise - CotonTchad SN</option>
                      <option value="Mutuelle des Fonctionnaires">Mutuelle des Fonctionnaires</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-amber-950 mb-1">
                      N° Bon de Prise en Charge / Accord Assureur :
                    </label>
                    <input
                      type="text"
                      value={tiersPayantAccordNum}
                      onChange={e => setTiersPayantAccordNum(e.target.value)}
                      placeholder="Ex: PEC-CNPS-2025-044"
                      className="w-full rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs font-mono"
                    />
                  </div>

                  {/* Ventilation Preview */}
                  <div className="pt-2 border-t border-amber-200/80 text-[11px] space-y-1">
                    <div className="flex justify-between text-amber-900">
                      <span>Part Prise en Charge (Assurance) :</span>
                      <span className="font-bold font-mono">
                        {(selectedInvoiceToPay.partAssuranceFCFA ?? Math.round((selectedInvoiceToPay.totalFCFA ?? selectedInvoiceToPay.total ?? 0) * 0.8)).toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-800 font-bold">
                      <span>Ticket modérateur à encaisser du patient :</span>
                      <span className="text-emerald-800 font-mono">
                        {(selectedInvoiceToPay.partPatientFCFA ?? Math.round((selectedInvoiceToPay.totalFCFA ?? selectedInvoiceToPay.total ?? 0) * 0.2)).toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Référence de transaction / Numéro reçu :
                </label>
                <input
                  type="text"
                  value={referencePaiement}
                  onChange={e => setReferencePaiement(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceToPay(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow"
                >
                  Confirmer le Règlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 no-print">
              <span className="text-xs font-bold text-slate-500">Reçu de Caisse Officiel</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 rounded-xl bg-[#0B3C5D] text-white text-xs font-bold flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer</span>
                </button>
                <button onClick={() => setShowReceiptModal(null)} className="p-1 text-slate-400 hover:text-slate-700">✕</button>
              </div>
            </div>

            <div className="p-4 border border-slate-300 rounded-2xl bg-white text-xs space-y-3 font-mono">
              <div className="text-center pb-2 border-b border-slate-200">
                <p className="font-bold text-sm text-slate-900 font-sans">CLINIQUE MÉDICALE DARÔ</p>
                <p className="text-[10px] text-slate-500 font-sans">Quartier Sabangali • N'Djamena</p>
                <p className="text-[10px] text-slate-500 font-sans">Tel: +235 22 52 14 15</p>
              </div>

              <div className="flex justify-between">
                <span>REÇU N° :</span>
                <strong>{showReceiptModal.numero}</strong>
              </div>
              <div className="flex justify-between">
                <span>DATE :</span>
                <span>{showReceiptModal.date}</span>
              </div>
              <div className="flex justify-between">
                <span>PATIENT :</span>
                <strong>{showReceiptModal.patientNom}</strong>
              </div>
              <div className="flex justify-between">
                <span>MODE :</span>
                <span className="uppercase">{showReceiptModal.modePaiement}</span>
              </div>

              <div className="py-2 border-y border-dashed border-slate-300 space-y-1">
                {showReceiptModal.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-[11px]">
                    <span>{item.description}</span>
                    <span>{((item.totalFCFA ?? item.total ?? ((item.quantite || 1) * (item.prixUnitaireFCFA ?? item.prixUnitaire ?? 0))) || 0).toLocaleString('fr-FR')} FCFA</span>
                  </div>
                ))}
              </div>

              {/* Tiers-Payant Receipt Section */}
              {showReceiptModal.partAssuranceFCFA ? (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] space-y-1 font-mono">
                  <div className="flex justify-between font-bold text-amber-950 font-sans">
                    <span>ORGANISME TIERS-PAYANT :</span>
                    <span>{showReceiptModal.organismeAssurance || 'Assurance Santé'}</span>
                  </div>
                  {showReceiptModal.numeroPriseEnCharge && (
                    <div className="flex justify-between text-slate-600 text-[10px]">
                      <span>N° ACCORD / PEC :</span>
                      <span>{showReceiptModal.numeroPriseEnCharge}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-emerald-800">
                    <span>PART ASSURANCE ({showReceiptModal.tauxCouvertureApplique || 80}%) :</span>
                    <span>- {showReceiptModal.partAssuranceFCFA.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="flex justify-between font-black text-slate-900 pt-1 border-t border-amber-200 font-sans text-xs">
                    <span>TICKET MODÉRATEUR REÇU :</span>
                    <span>{(showReceiptModal.partPatientFCFA ?? 0).toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>
              ) : null}

              <div className="flex justify-between text-sm font-black pt-1">
                <span>TOTAL REÇU :</span>
                <span>
                  {showReceiptModal.partPatientFCFA !== undefined
                    ? showReceiptModal.partPatientFCFA.toLocaleString('fr-FR')
                    : ((showReceiptModal.totalFCFA ?? showReceiptModal.total) || 0).toLocaleString('fr-FR')}{' '}
                  FCFA
                </span>
              </div>

              <p className="text-center text-[10px] text-slate-400 font-sans pt-3">
                Merci de votre confiance • Bon rétablissement
              </p>
            </div>
          </div>
        </div>
      )}

      {/* New Invoice Modal */}
      {showNewInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#0B3C5D]">Émettre une Facture de Soins</h3>
              <button onClick={() => setShowNewInvoiceModal(false)} className="text-slate-400 hover:text-slate-700 p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Patient à facturer :</label>
                <select
                  value={newPatientId}
                  onChange={e => handleSelectNewPatient(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.prenom} {p.nom} {p.assurance?.adherent ? `(🛡️ Assuré ${p.assurance.organisme} ${p.assurance.tauxCouverture}%)` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tiers-Payant Option Box */}
              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-600" />
                    <div>
                      <p className="text-xs font-bold text-amber-950">Prise en charge Assurance / Tiers-Payant</p>
                      <p className="text-[10px] text-amber-700">Déduire automatiquement la part couverte par la mutuelle</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newApplyTiersPayant}
                      onChange={e => setNewApplyTiersPayant(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>

                {newApplyTiersPayant && (
                  <div className="space-y-2 pt-2 border-t border-amber-200 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Organisme :</label>
                        <select
                          value={newTPOrganisme}
                          onChange={e => setNewTPOrganisme(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold"
                        >
                          <option value="CNPS Tchad">CNPS Tchad</option>
                          <option value="Ascoma Tchad Assurances">Ascoma Tchad</option>
                          <option value="Gras Savoye / Sanlam Tchad">Gras Savoye / Sanlam</option>
                          <option value="Al Wafa Assurance Tchad">Al Wafa Assurance</option>
                          <option value="Bon Société Pétrolière SHT">Bon SHT Pétrole</option>
                          <option value="Bon CotonTchad SN">Bon CotonTchad</option>
                          <option value="Autre Mutuelle">Autre Mutuelle</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Taux Prise en Charge :</label>
                        <select
                          value={newTPTaux}
                          onChange={e => setNewTPTaux(Number(e.target.value))}
                          className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold font-mono"
                        >
                          <option value={70}>70% (Patient paye 30%)</option>
                          <option value={80}>80% (Patient paye 20%)</option>
                          <option value={90}>90% (Patient paye 10%)</option>
                          <option value={100}>100% (Prise en charge intégrale)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">N° Prise en Charge / Accord :</label>
                      <input
                        type="text"
                        value={newTPNumAccord}
                        onChange={e => setNewTPNumAccord(e.target.value)}
                        placeholder="Ex: PEC-CNPS-2025-089"
                        className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Prestation / Acte médical :</label>
                <input
                  type="text"
                  value={newDesignation}
                  onChange={e => setNewDesignation(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Montant total de l'acte (FCFA) :</label>
                <input
                  type="number"
                  value={newMontant}
                  onChange={e => setNewMontant(parseInt(e.target.value) || 0)}
                  required
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono font-bold"
                />
              </div>

              {/* Simulation Result */}
              {newApplyTiersPayant && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between text-amber-800">
                    <span>Part Assurance ({newTPTaux}%) :</span>
                    <span className="font-bold font-mono">{Math.round(newMontant * (newTPTaux / 100)).toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="flex justify-between text-slate-800 font-bold">
                    <span>Ticket Modérateur Patient ({100 - newTPTaux}%) :</span>
                    <span className="text-emerald-800 font-mono">{(newMontant - Math.round(newMontant * (newTPTaux / 100))).toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewInvoiceModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0B3C5D] hover:bg-[#1E88E5] text-white text-xs font-bold shadow"
                >
                  Générer la Facture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
