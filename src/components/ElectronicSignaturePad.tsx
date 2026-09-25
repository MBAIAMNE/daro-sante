import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  PenTool,
  RotateCcw,
  Check,
  ShieldCheck,
  Save,
  Sparkles,
  Smartphone,
  Info,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';

export interface ElectronicSignaturePadProps {
  onSaveSignature: (signatureDataUrl: string) => void;
  onCancel?: () => void;
  documentTitle?: string;
  documentReference?: string;
  signataireNom?: string;
  signataireRole?: string;
  initialSignature?: string;
  saveToProfileOption?: boolean;
}

export const ElectronicSignaturePad: React.FC<ElectronicSignaturePadProps> = ({
  onSaveSignature,
  onCancel,
  documentTitle = 'Ordonnance / Bulletin Médical',
  documentReference,
  signataireNom,
  signataireRole,
  initialSignature,
  saveToProfileOption = true,
}) => {
  const { currentUser, sauvegarderSignatureUtilisateur } = useClinic();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [strokeColor, setStrokeColor] = useState('#0B3C5D'); // Default clinical dark blue
  const [strokeWidth, setStrokeWidth] = useState(2.5);
  const [saveToUserProfile, setSaveToUserProfile] = useState(false);
  const [strokeCount, setStrokeCount] = useState(0);

  const doctorNom =
    signataireNom ||
    (currentUser.nom.startsWith('Dr.')
      ? currentUser.nom
      : `Dr. ${currentUser.prenom} ${currentUser.nom}`);

  const roleLabel =
    signataireRole ||
    (currentUser.role === 'medecin'
      ? 'Médecin Praticien Prescripteur'
      : currentUser.role === 'tech_laboratoire'
      ? 'Biologiste Médical Validateur'
      : currentUser.role === 'directeur'
      ? 'Directeur Médical'
      : 'Praticien Hospitalier');

  // Initialize canvas with proper resolution
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = Math.floor(rect.width || 480);
    const height = 200;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Clear background to pure white/transparent
    ctx.clearRect(0, 0, width, height);

    // Draw baseline
    drawDottedBaseline(ctx, width, height);

    // If initial signature is provided, draw it
    if (initialSignature) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        setHasDrawn(true);
      };
      img.src = initialSignature;
    }
  }, [initialSignature]);

  const drawDottedBaseline = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(30, height - 36);
    ctx.lineTo(width - 30, height - 36);
    ctx.stroke();

    // Baseline marker 'X'
    ctx.setLineDash([]);
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('✍️ Signez sur la ligne', 32, height - 42);
    ctx.restore();
  };

  useEffect(() => {
    initCanvas();
    const handleResize = () => initCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initCanvas]);

  // Pointer event handlers (Works universally on Touchscreen, Stylus and Mouse)
  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Prevent default scrolling on mobile while signing
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.beginPath();
    ctx.moveTo(x, y);

    setIsDrawing(true);
    setHasDrawn(true);
    setStrokeCount(prev => prev + 1);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    e.preventDefault();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    const width = Math.floor(rect.width || 480);
    const height = 200;

    ctx.clearRect(0, 0, width, height);
    drawDottedBaseline(ctx, width, height);

    setHasDrawn(false);
    setStrokeCount(0);
  };

  const handleUseSavedSignature = () => {
    if (!currentUser.signatureElectronique) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    const width = Math.floor(rect.width || 480);
    const height = 200;

    ctx.clearRect(0, 0, width, height);
    drawDottedBaseline(ctx, width, height);

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      setHasDrawn(true);
      setStrokeCount(prev => prev + 1);
    };
    img.src = currentUser.signatureElectronique;
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;

    // Export high-quality PNG
    const dataUrl = canvas.toDataURL('image/png');

    // Optionally persist in user's profile
    if (saveToUserProfile && sauvegarderSignatureUtilisateur) {
      sauvegarderSignatureUtilisateur(dataUrl);
    }

    onSaveSignature(dataUrl);
  };

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-blue-50/70 border border-blue-200/80 rounded-2xl">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
            <PenTool className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-[#0B3C5D] uppercase tracking-wider flex items-center gap-1.5">
              <span>Signature Électronique Certifiée</span>
              <span className="px-1.5 py-0.2 rounded bg-teal-100 text-teal-800 text-[9px] font-bold">
                Tactile / Stylet
              </span>
            </h4>
            <p className="text-[11px] text-slate-600">
              Signataire : <strong>{doctorNom}</strong> • {roleLabel}
            </p>
          </div>
        </div>

        {documentReference && (
          <span className="text-[10px] font-mono font-bold bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 shrink-0 self-start sm:self-center">
            {documentReference}
          </span>
        )}
      </div>

      {/* Screen touch indication */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
        <span className="flex items-center gap-1">
          <Smartphone className="w-3.5 h-3.5 text-teal-600" />
          Compatible smartphones, tablettes tactiles, stylets & souris
        </span>
        {currentUser.signatureElectronique && (
          <button
            type="button"
            onClick={handleUseSavedSignature}
            className="text-[10.5px] font-bold text-teal-700 hover:text-teal-900 underline flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            Utiliser ma signature enregistrée
          </button>
        )}
      </div>

      {/* Canvas Drawing Box */}
      <div
        ref={containerRef}
        className="relative w-full rounded-2xl bg-white border-2 border-slate-300 shadow-inner overflow-hidden cursor-crosshair select-none"
        style={{ touchAction: 'none' }}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-full block bg-white"
          style={{ touchAction: 'none' }}
        />

        {/* Empty state hint watermark */}
        {!hasDrawn && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-300 text-xs">
            <PenTool className="w-6 h-6 mb-1 text-slate-300 animate-pulse" />
            <span className="font-semibold text-slate-400 text-[11px]">
              Dessinez votre signature ici avec le doigt ou le stylet
            </span>
          </div>
        )}
      </div>

      {/* Toolbar: Colors, Pen Width & Clear */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Ink Colors */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">
            Encre :
          </span>
          {[
            { color: '#0B3C5D', label: 'Bleu Clinique' },
            { color: '#111827', label: 'Noir Officiel' },
            { color: '#4338CA', label: 'Violet Caducée' },
          ].map(c => (
            <button
              key={c.color}
              type="button"
              onClick={() => setStrokeColor(c.color)}
              className={`w-6 h-6 rounded-full border-2 transition ${
                strokeColor === c.color
                  ? 'border-teal-500 scale-110 shadow-xs'
                  : 'border-white hover:scale-105'
              }`}
              style={{ backgroundColor: c.color }}
              title={c.label}
            />
          ))}
        </div>

        {/* Pen Width */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {[
            { width: 1.8, label: 'Fin' },
            { width: 2.5, label: 'Normal' },
            { width: 3.5, label: 'Épais' },
          ].map(w => (
            <button
              key={w.width}
              type="button"
              onClick={() => setStrokeWidth(w.width)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition ${
                strokeWidth === w.width
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>

        {/* Clear Button */}
        <button
          type="button"
          onClick={handleClear}
          disabled={!hasDrawn}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:opacity-40 disabled:pointer-events-none text-xs font-semibold transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Effacer</span>
        </button>
      </div>

      {/* Save to Profile Option */}
      {saveToProfileOption && (
        <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 cursor-pointer hover:bg-slate-100 transition">
          <input
            type="checkbox"
            checked={saveToUserProfile}
            onChange={e => setSaveToUserProfile(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          />
          <span className="flex items-center gap-1.5 font-medium">
            <Save className="w-3.5 h-3.5 text-teal-600" />
            Enregistrer comme ma signature par défaut pour mes prochaines ordonnances
          </span>
        </label>
      )}

      {/* Legal & Authenticity notice */}
      <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-[10.5px] text-emerald-950 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold">Scellage Numérique & Valeur Probante :</p>
          <p className="text-emerald-800">
            L'apposition de cette signature électronique scelle le document médical avec horodatage
            certifié et traçabilité inviolable au sein du réseau hospitalier DARÔ Santé Tchad.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition"
          >
            Annuler
          </button>
        )}

        <button
          type="button"
          onClick={handleConfirm}
          disabled={!hasDrawn}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md transition"
        >
          <Check className="w-4 h-4" />
          <span>Apposer la Signature Électronique</span>
        </button>
      </div>
    </div>
  );
};
