import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  WifiOff,
  Copy,
  Check,
  ExternalLink,
  Printer,
  Heart,
  PhoneCall,
  ShieldAlert,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { Patient } from '../types';
import { generateEmergencyQRDataUrl, generateEmergencyQRPayload } from '../utils/qrPayload';

interface QRDisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPatientId?: string;
}

export const QRDisplayModal: React.FC<QRDisplayModalProps> = ({
  isOpen,
  onClose,
  initialPatientId,
}) => {
  const { patients, setEmergencyTargetToken, setCurrentView } = useClinic();
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    initialPatientId || patients[0]?.id || ''
  );
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);

  useEffect(() => {
    if (initialPatientId) {
      setSelectedPatientId(initialPatientId);
    } else if (!selectedPatientId && patients[0]) {
      setSelectedPatientId(patients[0].id);
    }
  }, [initialPatientId, patients]);

  const activePatient: Patient | undefined =
    patients.find(p => p.id === selectedPatientId) || patients[0];

  useEffect(() => {
    if (activePatient && isOpen) {
      generateEmergencyQRDataUrl(activePatient, { width: 380, margin: 2 })
        .then(url => setQrDataUrl(url))
        .catch(() => {});
    }
  }, [activePatient, isOpen]);

  if (!isOpen || !activePatient) return null;

  const rawPayload = generateEmergencyQRPayload(activePatient);

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStatus(label);
    setTimeout(() => setCopiedStatus(null), 3000);
  };

  const handleOpenEmergencyView = () => {
    setEmergencyTargetToken(activePatient.qrToken);
    setCurrentView('emergency_qr');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 border border-slate-200 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-[#0B3C5D]">
                  QR Code d'Urgence Scannable
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  100% Scannable
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Pointez votre smartphone vers l'écran pour tester la lecture instantanée
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Patient selector if multiple patients */}
        {patients.length > 1 && (
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Sélectionner le patient à afficher :
            </label>
            <select
              value={selectedPatientId}
              onChange={e => setSelectedPatientId(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nom.toUpperCase()} {p.prenom} • Groupe {p.groupeSanguin} • {p.matricule}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Big Crisp QR Code Display */}
        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300">
          <div className="p-4 bg-white rounded-3xl shadow-xl border-4 border-[#0B3C5D] flex items-center justify-center">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR Code ${activePatient.nom}`}
                className="w-64 h-64 sm:w-72 sm:h-72 object-contain block"
                style={{ imageRendering: 'pixelated' }}
              />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center text-slate-400 text-sm">
                Génération haute résolution...
              </div>
            )}
          </div>

          <div className="mt-3 text-center space-y-1">
            <p className="text-base font-black text-slate-900">
              {activePatient.nom.toUpperCase()} {activePatient.prenom}
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-rose-100 text-rose-700 font-black text-xs">
                GROUPE {activePatient.groupeSanguin}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {activePatient.matricule}
              </span>
            </div>
            <p className="text-xs text-emerald-800 font-medium">
              📞 Urgence: {activePatient.contactUrgenceNom} ({activePatient.contactUrgenceTel})
            </p>
          </div>
        </div>

        {/* Clear Instructions */}
        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 space-y-2">
          <div className="flex items-center gap-2 font-bold text-emerald-900">
            <WifiOff className="w-4 h-4 text-amber-600" />
            <span>Comment tester avec votre téléphone :</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-[11px] text-emerald-900/90 pl-1">
            <li>Prenez votre smartphone et ouvrez l'application <strong>Appareil Photo</strong> (ou Google Lens).</li>
            <li>Cadrez le QR Code ci-dessus à l'écran.</li>
            <li>Votre téléphone affiche immédiatement le <strong>texte brut d'urgence</strong> (Nom, Groupe, Contact) sans aucune connexion internet requise.</li>
            <li>Touchez le lien web affiché sous le texte pour accéder au dossier médical complet.</li>
          </ol>
        </div>

        {/* Footer actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopyText(rawPayload, 'brut')}
              className="text-xs px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold flex items-center gap-1.5 transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedStatus === 'brut' ? '✓ Texte copié !' : 'Copier texte du QR'}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="text-xs px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer</span>
            </button>
          </div>

          <button
            onClick={handleOpenEmergencyView}
            className="text-xs px-4 py-2 bg-[#0B3C5D] hover:bg-[#1E88E5] text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Tester la fiche d'urgence</span>
          </button>
        </div>
      </div>
    </div>
  );
};
