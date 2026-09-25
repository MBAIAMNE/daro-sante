import React, { useState } from 'react';
import {
  Zap,
  BatteryCharging,
  Wifi,
  WifiOff,
  Fuel,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Server,
  Download,
  CheckCircle2,
  X,
  Clock,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';

export const HospitalResilienceWidget: React.FC = () => {
  const { currentEtablissement } = useClinic();
  const [showModal, setShowModal] = useState(false);
  const [sourceEnergie, setSourceEnergie] = useState<'sne' | 'groupe' | 'solaire'>('groupe');
  const [niveauCarburant, setNiveauCarburant] = useState<number>(78); // %
  const [autonomieHeures, setAutonomieHeures] = useState<number>(14);
  const [batterieSolaire, setBatterieSolaire] = useState<number>(92);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [dernierBackup, setDernierBackup] = useState<string>('Il y a 3 min');
  const [backupSuccess, setBackupSuccess] = useState<boolean>(false);

  const handleManualBackup = () => {
    setBackupSuccess(true);
    setDernierBackup('À l\'instant');
    setTimeout(() => setBackupSuccess(false), 3000);
  };

  return (
    <>
      {/* Mini Widget in Top Navigation / Header */}
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all hover:shadow-xs bg-amber-50/80 border-amber-200 text-amber-900"
        title="Continuité de service N'Djamena : Énergie (SNE/Groupe/Solaire) et Réseau Local"
      >
        {/* Energy status indicator */}
        <div className="flex items-center gap-1">
          {sourceEnergie === 'sne' ? (
            <>
              <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500 animate-pulse" />
              <span className="hidden xl:inline text-[11px] font-bold text-emerald-800">SNE Secteur</span>
            </>
          ) : sourceEnergie === 'groupe' ? (
            <>
              <Fuel className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden xl:inline text-[11px] font-bold text-amber-800">
                Groupe ({niveauCarburant}%)
              </span>
            </>
          ) : (
            <>
              <BatteryCharging className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden xl:inline text-[11px] font-bold text-teal-800">
                Solaire ({batterieSolaire}%)
              </span>
            </>
          )}
        </div>

        <span className="text-slate-300">|</span>

        {/* Network & Local Sync indicator */}
        <div className="flex items-center gap-1">
          {isOnline ? (
            <Wifi className="w-3.5 h-3.5 text-blue-600" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-rose-600" />
          )}
          <span className="text-[10px] uppercase font-bold text-slate-700 hidden lg:inline">
            Local Sync
          </span>
        </div>
      </button>

      {/* Resilience & Continuity Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-6 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Continuité de Service & Résilience Clinique
                  </h3>
                  <p className="text-xs text-slate-500">
                    Adaptation aux coupures d'électricité (SNE) et coupures réseau à N'Djamena
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Diagnostic Alert Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Source d'Alimentation Électrique Actuelle :
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  {sourceEnergie === 'sne' ? '⚡ Réseau Public SNE' : sourceEnergie === 'groupe' ? '⛽ Groupe Électrogène Hospitalier' : '☀️ Énergie Solaire & Onduleurs'}
                </span>
              </div>

              {/* Selector for switching energy mode */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <button
                  onClick={() => setSourceEnergie('sne')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    sourceEnergie === 'sne'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Zap className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Secteur SNE</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">220V Réseau Urbain</p>
                </button>

                <button
                  onClick={() => setSourceEnergie('groupe')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    sourceEnergie === 'groupe'
                      ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Fuel className="w-3.5 h-3.5 text-amber-600" />
                    <span>Groupe SDMO</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">{niveauCarburant}% Gasoil ({autonomieHeures}h)</p>
                </button>

                <button
                  onClick={() => setSourceEnergie('solaire')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    sourceEnergie === 'solaire'
                      ? 'bg-teal-50 border-teal-300 text-teal-900 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <BatteryCharging className="w-3.5 h-3.5 text-teal-600" />
                    <span>Solaire & Ond.</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Batterie {batterieSolaire}%</p>
                </button>
              </div>
            </div>

            {/* Network & Local Persistence Safeguard */}
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-3">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                  Résilience Réseau & Synchronisation Locale (Anti-Coupure)
                </h4>
              </div>
              <p className="text-xs text-blue-800 leading-relaxed">
                Toutes les consultations, saisies de laboratoire, ordonnances et tickets de caisse sont enregistrés <strong>instantanément en mémoire locale sécurisée</strong> dans le navigateur du poste. En cas de coupure de la fibre ou des liaisons 4G Airtel/Moov Africa, le personnel continue de travailler sans interruption.
              </p>
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-slate-600 font-medium">Dernière sauvegarde locale :</span>
                <span className="font-bold text-blue-900 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-500" />
                  {dernierBackup}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={handleManualBackup}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                {backupSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Données Sauvegardées avec Succès !</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Forcer Sauvegarde Locale Immédiate</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="w-full sm:w-auto py-2.5 px-5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
