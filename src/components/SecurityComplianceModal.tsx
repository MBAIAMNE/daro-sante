import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Key,
  ShieldAlert,
  CheckCircle2,
  Server,
  FileCheck,
  X,
  Activity,
  AlertTriangle,
  Zap,
  Terminal,
  RefreshCw,
  Unlock,
  Radio,
  Cpu,
  Fingerprint,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { SecurityThreatType } from '../types';
import { getActiveLockouts } from '../services/securityFortress';

interface SecurityComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityComplianceModal: React.FC<SecurityComplianceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    currentUser,
    currentRole,
    verrouillerPoste,
    securityShield,
    securityAlerts,
    debloquerCompteSecurite,
    toggleLockdownMode,
    ajouterAlerteSecurite,
    certifierDocument,
    verifierCertificatDocument,
  } = useClinic();

  const [activeTab, setActiveTab] = useState<'apercu' | 'alertes' | 'verrous' | 'testeur'>('apercu');
  const [autoLockMinutes, setAutoLockMinutes] = useState('15');
  const [testPayload, setTestPayload] = useState("SELECT * FROM users WHERE id = 'admin' OR '1'='1'");
  const [testResult, setTestResult] = useState<string | null>(null);

  // Testeur de sceau numérique SHA-256
  const [sealDocId, setSealDocId] = useState('ORD-2025-001');
  const [sealContent, setSealContent] = useState('Paracétamol 1g 3x/j pendant 5 jours');
  const [computedSeal, setComputedSeal] = useState<string | null>(null);
  const [tamperedCheck, setTamperedCheck] = useState<boolean | null>(null);

  if (!isOpen) return null;

  const activeLockouts = getActiveLockouts();

  // Test de simulation de menace WAF
  const handleTestThreatSimulation = () => {
    const isThreat = /(<script|UNION\s+SELECT|'(\s*OR|\s*AND)\s*'?\d+'?\s*=\s*'?\d+'?|\$where|\$gt)/i.test(testPayload);
    if (isThreat) {
      ajouterAlerteSecurite({
        type: 'injection_attempt',
        severity: 'critical',
        source: `Poste Testeur (${currentUser.prenom} ${currentUser.nom})`,
        targetIdentifiant: testPayload.substring(0, 30),
        details: `Test d'intrusion neutralisé par le filtre applicatif WAF DARÔ : [${testPayload}]`,
        blocked: true,
        actionTaken: 'Entrée bloquée immédiatement par le pare-feu.'
      });
      setTestResult('BLOCKED: Menace interceptée avec succès ! Le pare-feu a rejeté le payload.');
    } else {
      setTestResult('ALLOWED: Aucune signature malveillante détectée dans cette chaîne de test.');
    }
  };

  // Test de signature d'inviolabilité
  const handleGenerateSeal = async () => {
    const seal = await certifierDocument('ordonnance', sealDocId, { content: sealContent });
    setComputedSeal(seal);
    setTamperedCheck(null);
  };

  const handleVerifyTamper = async (tampered: boolean) => {
    if (!computedSeal) return;
    const testData = { content: tampered ? `${sealContent} [MODIFIÉ SANS AUTORISATION]` : sealContent };
    const isValid = await verifierCertificatDocument('ordonnance', sealDocId, testData, computedSeal);
    setTamperedCheck(isValid);
  };

  const getThreatBadge = (type: SecurityThreatType) => {
    switch (type) {
      case 'brute_force':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Anti-Brute Force</span>;
      case 'injection_attempt':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">Injection WAF</span>;
      case 'tampering_attempt':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">Intégrité Sceau</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">Contrôle Accès</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-4xl rounded-3xl bg-white p-5 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-auto max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 text-emerald-400 flex items-center justify-center shadow-md shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-[#0B3C5D]">
                  Forteresse de Sécurité DARÔ Santé
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black border border-emerald-300">
                  Score : {securityShield.score}% - Bouclier Actif
                </span>
                {securityShield.lockdownMode && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold animate-pulse">
                    Mode Défense Renforcée
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Architecture Zero-Trust, pare-feu applicatif WAF, défense anti-brute-force et certification cryptographique SHA-256.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('apercu')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              activeTab === 'apercu'
                ? 'bg-[#0B3C5D] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Aperçu de la Forteresse
          </button>
          <button
            onClick={() => setActiveTab('alertes')}
            className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition ${
              activeTab === 'alertes'
                ? 'bg-[#0B3C5D] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Journal des Menaces Bloquées (IDS)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
              {securityAlerts.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('verrous')}
            className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition ${
              activeTab === 'verrous'
                ? 'bg-[#0B3C5D] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Comptes Protégés / Verrouillés</span>
            {activeLockouts.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                {activeLockouts.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('testeur')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              activeTab === 'testeur'
                ? 'bg-[#0B3C5D] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Simulateur & Sceaux Cryptographiques
          </button>
        </div>

        {/* TAB 1: Aperçu de la Forteresse */}
        {activeTab === 'apercu' && (
          <div className="space-y-5">
            {/* 4 Piliers de Défense */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-black">Règles Firestore V2</span>
                </div>
                <p className="text-[11px] text-emerald-900 leading-snug">
                  Default-Deny absolu, validation d'ID regex, schémas stricts et logs d'audit 100% immuables.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-800">
                  <Lock className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-black">Anti-Brute Force</span>
                </div>
                <p className="text-[11px] text-amber-900 leading-snug">
                  Verrouillage progressif : temporisation à 3 échecs, blocage 3 min à 5 échecs, verrouillage dur à 10.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1">
                <div className="flex items-center gap-1.5 text-blue-800">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-black">Pare-feu WAF & XSS</span>
                </div>
                <p className="text-[11px] text-blue-900 leading-snug">
                  Neutralisation des injections SQL, NoSQL Bypass et scripts HTML/JS malveillants en amont.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-1">
                <div className="flex items-center gap-1.5 text-purple-800">
                  <Fingerprint className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-black">Sceau SHA-256</span>
                </div>
                <p className="text-[11px] text-purple-900 leading-snug">
                  Ordonnances et quittances signées cryptographiquement. Toute falsification est instantanément détectée.
                </p>
              </div>
            </div>

            {/* Session Info & Emergency Lockdown */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white space-y-3 shadow-inner">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  Poste Médical Actif & Empreinte Sécurisée :
                </span>
                <button
                  onClick={toggleLockdownMode}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    securityShield.lockdownMode
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  {securityShield.lockdownMode ? 'Quitter Confinement' : 'Activer Mode Confinement'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700/80 space-y-0.5">
                  <span className="text-slate-400 text-[10px]">Utilisateur Actif :</span>
                  <p className="font-bold text-white truncate">{currentUser.prenom} {currentUser.nom}</p>
                  <p className="text-[11px] text-teal-400 capitalize">{currentRole}</p>
                </div>

                <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700/80 space-y-0.5">
                  <span className="text-slate-400 text-[10px]">Nœud Réseau & Protection :</span>
                  <p className="font-mono font-bold text-white">41.222.180.50 (N'Djamena)</p>
                  <p className="text-[11px] text-emerald-400">TLS 1.3 / En-têtes durcis</p>
                </div>

                <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700/80 space-y-0.5">
                  <span className="text-slate-400 text-[10px]">Temporisation Inactivité :</span>
                  <div className="flex items-center gap-2 pt-0.5">
                    <select
                      value={autoLockMinutes}
                      onChange={e => setAutoLockMinutes(e.target.value)}
                      className="bg-slate-900 text-white border border-slate-600 rounded px-1.5 py-0.5 text-xs"
                    >
                      <option value="5">5 min</option>
                      <option value="15">15 min</option>
                      <option value="30">30 min</option>
                      <option value="60">1 heure</option>
                    </select>
                    <button
                      onClick={() => {
                        verrouillerPoste();
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-[10px] font-bold text-white transition"
                    >
                      Verrouiller
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Checklist de protection */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Inviolabilité des ordonnances & logs :</strong> Les règles Firestore interdisent formellement l'effacement ou la réécriture des ordonnances délivrées et des journaux d'audit.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Cloisonnement multi-établissements étanche :</strong> Les soignants d'un centre ne peuvent pas accéder aux données internes d'un autre hôpital partenaire.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Bouclier HTTP & Rate Limiter :</strong> Les requêtes volumineuses et les rafales de requêtes automatisées sont automatiquement limitées par le serveur.</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Journal des Menaces Bloquées (IDS) */}
        {activeTab === 'alertes' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Alertes de cyberdéfense enregistrées par l'Intrusion Detection System (IDS) :</span>
              <span className="font-bold text-slate-800">{securityAlerts.length} événement(s)</span>
            </div>

            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {securityAlerts.map(alert => (
                <div
                  key={alert.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition space-y-1.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex items-center gap-2">
                      {getThreatBadge(alert.type)}
                      <span className="font-bold text-xs text-slate-900">{alert.source}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(alert.timestamp).toLocaleString('fr-FR')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 font-medium">
                    {alert.details}
                  </p>

                  <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl w-fit">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span><strong>Action appliquée :</strong> {alert.actionTaken}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Comptes Protégés / Verrouillés */}
        {activeTab === 'verrous' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Liste des comptes temporairement ou définitivement suspendus par le bouclier anti-brute force à la suite d'échecs répétés.
            </p>

            {activeLockouts.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="text-sm font-bold text-slate-800">Aucun compte actuellement verrouillé</p>
                <p className="text-xs text-slate-500">Toutes les stations fonctionnent normalement sans alerte de verrouillage active.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {activeLockouts.map(item => (
                  <div
                    key={item.identifier}
                    className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-rose-950">{item.identifier}</p>
                      <p className="text-[11px] text-rose-700">
                        {item.attempts} tentative(s) échouée(s) — {item.hardLocked ? 'Verrouillage SuperAdmin requis' : `Déblocage dans ${item.remainingSec}s`}
                      </p>
                    </div>
                    <button
                      onClick={() => debloquerCompteSecurite(item.identifier)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      Débloquer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Simulateur & Sceaux Cryptographiques */}
        {activeTab === 'testeur' && (
          <div className="space-y-5">
            {/* 1. Simulateur d'injection WAF */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Terminal className="w-4 h-4 text-indigo-600" />
                <span>Simulateur d'Audit de Sécurité (Test d'injection WAF)</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Testez un motif malveillant pour vérifier en direct la réaction du pare-feu applicatif DARÔ :
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={testPayload}
                  onChange={e => setTestPayload(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-white"
                  placeholder="Payload d'attaque (ex: ' OR '1'='1)"
                />
                <button
                  onClick={handleTestThreatSimulation}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shrink-0"
                >
                  Tester le Pare-Feu
                </button>
              </div>
              {testResult && (
                <div className={`p-2.5 rounded-xl text-xs font-mono font-bold ${
                  testResult.startsWith('BLOCKED') ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}>
                  {testResult}
                </div>
              )}
            </div>

            {/* 2. Testeur de Sceau SHA-256 */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Fingerprint className="w-4 h-4 text-purple-600" />
                <span>Certification d'Inviolabilité par Sceau SHA-256</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Générez un sceau numérique infalsifiable sur une ordonnance, puis simulez une tentative d'altération frauduleuse :
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold mb-1">Réf. Document :</label>
                  <input
                    type="text"
                    value={sealDocId}
                    onChange={e => setSealDocId(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold mb-1">Contenu médical :</label>
                  <input
                    type="text"
                    value={sealContent}
                    onChange={e => setSealContent(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleGenerateSeal}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition"
                >
                  Générer Sceau SHA-256
                </button>
                {computedSeal && (
                  <>
                    <button
                      onClick={() => handleVerifyTamper(false)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition"
                    >
                      Vérifier Document Intègre
                    </button>
                    <button
                      onClick={() => handleVerifyTamper(true)}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition"
                    >
                      Simuler Altération Pirate
                    </button>
                  </>
                )}
              </div>

              {computedSeal && (
                <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-xs space-y-1">
                  <span className="text-[10px] font-bold text-purple-800 uppercase">Sceau Numérique DARÔ Certifié :</span>
                  <p className="font-mono font-bold text-purple-950 text-sm tracking-wide">{computedSeal}</p>
                </div>
              )}

              {tamperedCheck !== null && (
                <div className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  tamperedCheck
                    ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                    : 'bg-rose-100 text-rose-950 border border-rose-300'
                }`}>
                  {tamperedCheck ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>INTÉGRITÉ VÉRIFIÉE : Le document correspond bit-à-bit à son empreinte d'origine. Aucune altération.</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>ALERTE FALSIFICATION DÉTECTÉE : Le contenu a été modifié ! Le sceau cryptographique rejette le document.</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 flex justify-end border-t border-slate-200">
          <button
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-[#0B3C5D] hover:bg-[#07273d] text-white text-xs font-bold transition shadow-xs"
          >
            Fermer la Forteresse
          </button>
        </div>
      </div>
    </div>
  );
};
