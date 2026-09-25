import React from 'react';
import { X, FileText, Microscope, ShieldCheck } from 'lucide-react';
import { ElectronicSignaturePad } from './ElectronicSignaturePad';

export interface ElectronicSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSignature: (signatureDataUrl: string) => void;
  type: 'ordonnance' | 'examen';
  documentTitle: string;
  documentNumber: string;
  patientNom: string;
  details?: string;
  signataireNom?: string;
  signataireRole?: string;
}

export const ElectronicSignatureModal: React.FC<ElectronicSignatureModalProps> = ({
  isOpen,
  onClose,
  onSaveSignature,
  type,
  documentTitle,
  documentNumber,
  patientNom,
  details,
  signataireNom,
  signataireRole,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 my-6 animate-in fade-in zoom-in-95 max-h-[94vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5 text-[#0B3C5D]">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              {type === 'ordonnance' ? (
                <FileText className="w-5 h-5 text-teal-700" />
              ) : (
                <Microscope className="w-5 h-5 text-teal-700" />
              )}
            </div>
            <div>
              <h3 className="text-base font-black">
                {type === 'ordonnance'
                  ? 'Signature Électronique de l\'Ordonnance'
                  : 'Validation & Signature du Bulletin d\'Examen'}
              </h3>
              <p className="text-xs text-slate-500">
                Document {documentNumber} • Patient : <strong>{patientNom}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Document summary info pill */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="font-bold text-[#0B3C5D] block">{documentTitle}</span>
            {details && <p className="text-slate-500 text-[11px] mt-0.5">{details}</p>}
          </div>
          <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-1 rounded border border-teal-200 shrink-0 self-start sm:self-center">
            {documentNumber}
          </span>
        </div>

        {/* Interactive Signature Pad */}
        <ElectronicSignaturePad
          documentTitle={documentTitle}
          documentReference={documentNumber}
          signataireNom={signataireNom}
          signataireRole={signataireRole}
          onSaveSignature={sigUrl => {
            onSaveSignature(sigUrl);
            onClose();
          }}
          onCancel={onClose}
        />
      </div>
    </div>
  );
};
