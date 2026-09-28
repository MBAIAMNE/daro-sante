import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  Printer,
  X,
  QrCode,
  Heart,
  AlertTriangle,
  Phone,
  Shield,
  Droplet,
  MapPin,
  Calendar,
  User,
  Activity,
  CheckCircle2,
  Smartphone,
  Scissors,
  FileText,
  CreditCard,
  Layers,
} from 'lucide-react';
import { Patient } from '../types';
import { Logo } from './Logo';
import { generateEmergencyQRPayload } from '../utils/qrPayload';

interface PatientQRCardPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  initialMode?: 'sticker' | 'carte' | 'fiche';
}

export const PatientQRCardPrintModal: React.FC<PatientQRCardPrintModalProps> = ({
  isOpen,
  onClose,
  patient,
  initialMode = 'sticker',
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [formatMode, setFormatMode] = useState<'sticker' | 'carte' | 'fiche'>(initialMode);
  const [stickerLayout, setStickerLayout] = useState<'single' | 'quad'>('single');

  useEffect(() => {
    if (isOpen && initialMode) {
      setFormatMode(initialMode);
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
    if (!patient) return;

    const payload = generateEmergencyQRPayload(patient);

    QRCode.toDataURL(payload, {
      width: 400,
      margin: 1,
      color: {
        dark: '#000000', // Pure black provides maximum optical contrast for smartphone cameras
        light: '#FFFFFF',
      },
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('Erreur génération QR card:', err));
  }, [patient]);

  if (!isOpen || !patient) return null;

  const handlePrint = () => {
    window.print();
  };

  const patientDistrict = patient.quartier || '';
  const patientBlood = patient.groupeSanguin && patient.groupeSanguin !== 'Inconnu' ? patient.groupeSanguin : 'Non déterminé';
  const patientElectrophorese = patient.electrophoreseHb || 'Non renseigné';

  // Helper to render a single smartphone sticker
  const renderSmartphoneSticker = (keyIndex?: number) => (
    <div
      key={keyIndex}
      className="sticker-cut-box relative bg-white border-2 border-dashed border-slate-400 p-2.5 rounded-2xl shadow-xs print:shadow-none print:border-dashed print:border-slate-800 inline-block w-[240px] text-left select-none"
    >
      {/* Cut line helper notice */}
      <div className="flex items-center justify-between text-[8px] text-slate-400 font-mono mb-1 pb-0.5 border-b border-dashed border-slate-200">
        <span className="flex items-center gap-1 font-bold text-slate-500">
          <Scissors className="w-2.5 h-2.5 text-slate-600" /> Découpe sticker
        </span>
        <span>~ 5.5 x 6.5 cm</span>
      </div>

      {/* Main sticker inner container */}
      <div className="bg-white border-2 border-slate-900 rounded-xl p-2.5 space-y-2 text-center">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-1">
          <div className="flex items-center gap-1.5 text-left">
            <Logo size="xs" />
            <div>
              <span className="text-[9px] font-black uppercase text-[#0B3C5D] block leading-none">
                DARÔ SANTÉ
              </span>
              <span className="text-[7px] font-bold text-rose-600 block uppercase leading-none mt-0.5">
                URGENCE VITALE
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[7px] text-slate-400 uppercase block font-mono">TCHAD</span>
            <span className="text-[8px] font-black text-slate-800 font-mono">24h/7j</span>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="bg-white p-1 rounded-lg border border-slate-300 inline-block shadow-2xs">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`QR Code d'urgence ${patient.prenom} ${patient.nom}`}
              className="w-36 h-36 mx-auto object-contain"
            />
          ) : (
            <div className="w-36 h-36 bg-slate-100 flex items-center justify-center text-xs text-slate-400">
              Génération QR...
            </div>
          )}
        </div>

        {/* Patient Identity */}
        <div className="space-y-0.5">
          <h4 className="text-[12px] font-black text-slate-950 uppercase leading-tight tracking-tight">
            {patient.nom} {patient.prenom}
          </h4>
          <div className="flex items-center justify-center gap-2 text-[9px]">
            <span className="font-mono text-slate-700 font-semibold">{patient.matricule}</span>
            <span className="px-1.5 py-0.2 rounded-md bg-rose-600 text-white font-black text-[9px] shadow-2xs">
              {patientBlood}
            </span>
          </div>
        </div>

        {/* Emergency info box */}
        <div className="bg-slate-100 rounded-lg p-1.5 text-[8px] text-slate-700 space-y-0.5 border border-slate-200">
          <p className="font-extrabold text-[#0B3C5D] uppercase text-[7.5px] tracking-tight">
            📱 AUTOCOLLANT SMARTPHONE
          </p>
          <p className="text-[7.5px] text-slate-600">
            SAMU : <strong className="text-rose-700">15</strong> • Urgences : <strong>22 51 51 51</strong>
          </p>
          {patient.contactUrgenceTel && (
            <p className="text-[7.5px] text-slate-700 truncate font-semibold">
              Proche : {patient.contactUrgenceTel}
            </p>
          )}
        </div>

        <p className="text-[6.5px] text-slate-400 uppercase font-mono italic">
          Scannez avec tout smartphone en cas de malaise
        </p>
      </div>
    </div>
  );

  return (
    <div
      id="modal-print-qr-card-backdrop"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-3 sm:p-6 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="modal-print-qr-card-container"
        className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in"
      >
        {/* Action Header (Hidden during actual print) */}
        <div className="no-print bg-slate-900 text-white p-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              {formatMode === 'sticker' ? (
                <Smartphone className="w-4 h-4" />
              ) : formatMode === 'carte' ? (
                <CreditCard className="w-4 h-4" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>Pass QR d'Urgence • {patient.prenom} {patient.nom}</span>
                <span className="font-mono text-[10px] text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800">
                  {patient.matricule}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {formatMode === 'sticker'
                  ? "Format autocollant compact calibré pour être collé au dos d'un smartphone"
                  : formatMode === 'carte'
                  ? 'Format badge de poche / carte santé d’urgence'
                  : 'Format fiche médicale détaillée pour dossier papier'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Format toggle tabs */}
            <div className="flex bg-slate-800 p-0.5 rounded-xl border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setFormatMode('sticker')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                  formatMode === 'sticker'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Format autocollant pour smartphone"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Sticker Téléphone</span>
              </button>
              <button
                type="button"
                onClick={() => setFormatMode('carte')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                  formatMode === 'carte'
                    ? 'bg-[#1E88E5] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Format carte / badge portefeuille"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Badge Poche</span>
              </button>
              <button
                type="button"
                onClick={() => setFormatMode('fiche')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                  formatMode === 'fiche'
                    ? 'bg-[#1E88E5] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Format fiche d'admission A4"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Fiche A4</span>
              </button>
            </div>

            <button
              onClick={handlePrint}
              id="btn-print-qr-card-trigger"
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow transition"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-toolbar for Sticker options (Hidden during print) */}
        {formatMode === 'sticker' && (
          <div className="no-print bg-teal-50/80 border-b border-teal-200 px-6 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-teal-900">
              <span className="font-semibold">Disposition d'impression :</span>
              <button
                type="button"
                onClick={() => setStickerLayout('single')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] border transition ${
                  stickerLayout === 'single'
                    ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                    : 'bg-white text-teal-800 border-teal-300 hover:bg-teal-100'
                }`}
              >
                1 Autocollant Unique
              </button>
              <button
                type="button"
                onClick={() => setStickerLayout('quad')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] border transition flex items-center gap-1 ${
                  stickerLayout === 'quad'
                    ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                    : 'bg-white text-teal-800 border-teal-300 hover:bg-teal-100'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>Planche de 4 Autocollants (A4)</span>
              </button>
            </div>

            <p className="text-[11px] text-teal-700 font-medium">
              💡 Idéal pour coller au dos du smartphone ou sous la coque transparente
            </p>
          </div>
        )}

        {/* Printable Area */}
        <div className="p-6 sm:p-8 bg-slate-100 print:bg-white print:p-0 flex justify-center">
          {formatMode === 'sticker' ? (
            /* Smartphone Sticker Format */
            <div id="printable-qr-sticker" className="w-full flex flex-col items-center">
              {stickerLayout === 'single' ? (
                <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-md print:border-none print:shadow-none print:p-0">
                  {renderSmartphoneSticker()}
                </div>
              ) : (
                <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-md print:border-none print:shadow-none print:p-0 space-y-4">
                  <div className="text-center no-print pb-2 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-700">
                      Planche de 4 autocollants smartphone prêts à découper
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Un pour le smartphone, un pour le carnet de santé, un pour la carte d'identité, un pour le dossier.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:grid-cols-2 print:gap-4">
                    {renderSmartphoneSticker(1)}
                    {renderSmartphoneSticker(2)}
                    {renderSmartphoneSticker(3)}
                    {renderSmartphoneSticker(4)}
                  </div>
                </div>
              )}
            </div>
          ) : formatMode === 'carte' ? (
            /* Badge Format (85x54 standard or emergency wallet badge) */
            <div
              id="printable-qr-card"
              className="max-w-md w-full bg-white rounded-2xl border-2 border-slate-800 shadow-md p-5 space-y-4 print:border-2 print:shadow-none print:m-0"
            >
              {/* Badge Top Header */}
              <div className="flex items-center justify-between border-b-2 border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Logo size="sm" />
                  <div>
                    <span className="text-[10px] font-black uppercase text-[#0B3C5D] block tracking-tight">
                      DARÔ SANTÉ • TCHAD
                    </span>
                    <span className="text-[8.5px] font-bold text-rose-700 block uppercase">
                      CARTE D'URGENCE VITALE & SECOURS
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[8.5px] text-slate-400 uppercase block font-mono">Matricule</span>
                  <span className="font-mono font-black text-xs text-[#0B3C5D]">{patient.matricule}</span>
                </div>
              </div>

              {/* Main Identity & QR Row */}
              <div className="grid grid-cols-3 gap-3 items-center">
                <div className="col-span-2 space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={patient.avatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'}
                      alt={patient.nom}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-300 shadow-2xs flex-shrink-0"
                    />
                    <div>
                      <h4 className="font-black text-sm text-slate-900 leading-tight">
                        {patient.prenom} {patient.nom}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {patient.age} ans • Sexe {patient.sexe}
                      </p>
                      <p className="text-[10px] text-slate-600 flex items-center gap-1 font-medium">
                        <MapPin className="w-2.5 h-2.5 text-slate-400" />
                        {patient.adresse || (patientDistrict ? `Quartier ${patientDistrict}, N'Djamena` : "N'Djamena, Tchad")}
                      </p>
                    </div>
                  </div>

                  {/* Blood Group & Electrophoresis Badge */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-black text-xs flex items-center gap-1 shadow-2xs">
                      <Droplet className="w-3.5 h-3.5" />
                      <span>{patientBlood}</span>
                    </div>
                    <div className="px-2 py-1 rounded-lg bg-slate-800 text-amber-300 font-black text-[11px]">
                      Hb: {patientElectrophorese}
                    </div>
                  </div>
                </div>

                {/* QR Code Container */}
                <div className="text-center space-y-1">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="QR Code d'urgence"
                      className="w-24 h-24 border-2 border-slate-800 rounded-xl p-1 bg-white mx-auto shadow-2xs"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-slate-200 rounded-xl flex items-center justify-center text-[10px] mx-auto">
                      QR
                    </div>
                  )}
                  <span className="text-[8px] font-bold text-slate-500 block uppercase">
                    Scannable Hors-Ligne
                  </span>
                </div>
              </div>

              {/* Medical Alerts (Allergies & Pathologies) */}
              <div className="space-y-1.5 pt-1 text-[10.5px]">
                {patient.allergies && patient.allergies.length > 0 && (
                  <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 font-bold flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[9px] uppercase tracking-wider block text-rose-700">Allergies Critiques :</span>
                      <span>{patient.allergies.join(', ')}</span>
                    </div>
                  </div>
                )}

                {patient.maladiesChroniques && patient.maladiesChroniques.length > 0 && (
                  <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 font-medium flex items-start gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[9px] uppercase tracking-wider font-bold block text-blue-700">Affections / Suivi :</span>
                      <span>{patient.maladiesChroniques.join(', ')}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Emergency Contacts & N'Djamena Direct Lines */}
              <div className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-[10px] space-y-1">
                {patient.contactUrgenceNom ? (
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span className="flex items-center gap-1 text-slate-700">
                      <Phone className="w-3 h-3 text-emerald-600" />
                      Contact Proche : {patient.contactUrgenceNom} {patient.contactUrgenceRelation ? `(${patient.contactUrgenceRelation})` : ''}
                    </span>
                    <span className="font-mono text-[#0B3C5D]">{patient.contactUrgenceTel || ''}</span>
                  </div>
                ) : (
                  <div className="text-[9.5px] text-slate-500 italic">
                    Aucun contact d'urgence personnel renseigné
                  </div>
                )}
                <div className="flex items-center justify-between text-[9px] text-slate-500 pt-0.5 border-t border-slate-200/80">
                  <span>Urgences SAMU Tchad : <strong>15 / 22 51 51 51</strong></span>
                  <span>Clinique Espoir : <strong>22 52 14 15</strong></span>
                </div>
              </div>

              {/* Instructions text */}
              <p className="text-[8px] text-center text-slate-400 italic">
                En cas d'accident ou de malaise, scannez ce code QR avec l'application DARÔ ou tout lecteur QR pour accéder aux antécédents médicaux d'urgence.
              </p>
            </div>
          ) : (
            /* Full Sheet A4 Format */
            <div
              id="printable-qr-sheet"
              className="bg-white rounded-2xl border-2 border-slate-800 p-8 space-y-6 print:border-none print:p-4 max-w-2xl w-full"
            >
              {/* Header */}
              <div className="border-b-2 border-slate-800 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Logo size="md" />
                  <div>
                    <h2 className="text-lg font-black text-[#0B3C5D]">
                      RÉPUBLIQUE DU TCHAD • DARÔ SANTÉ
                    </h2>
                    <p className="text-xs font-bold text-rose-700 uppercase">
                      Fiche Médicale d'Urgence & Pass Santé Vital
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Document certifié pour admission d'urgence en clinique ou hôpital
                    </p>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xs text-slate-400 uppercase block">Matricule Patient</span>
                  <span className="text-base font-black text-[#0B3C5D]">{patient.matricule}</span>
                </div>
              </div>

              {/* Full Content */}
              <div className="grid grid-cols-3 gap-6 items-start">
                <div className="col-span-2 space-y-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={patient.avatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'}
                      alt={patient.nom}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-300 shadow-sm"
                    />
                    <div>
                      <h3 className="text-xl font-black text-slate-900">
                        {patient.prenom} {patient.nom}
                      </h3>
                      <p className="text-xs text-slate-600 font-medium">
                        {patient.dateNaissance ? `Né(e) le ${patient.dateNaissance} (${patient.age} ans)` : (patient.age ? `${patient.age} ans` : 'Âge non renseigné')} • Sexe : {patient.sexe === 'M' ? 'Masculin' : 'Féminin'}
                      </p>
                      <p className="text-xs text-slate-600">
                        Résidence : {patient.adresse || (patientDistrict ? `Quartier ${patientDistrict}, N'Djamena, Tchad` : "N'Djamena, Tchad")}
                      </p>
                      <p className="text-xs font-mono text-slate-700">
                        Téléphone : {patient.telephone}
                      </p>
                    </div>
                  </div>

                  {/* Biological Constants */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-center">
                      <span className="text-[10px] uppercase font-bold text-rose-600 block">Groupe Sanguin</span>
                      <span className="text-xl font-black text-rose-700">{patientBlood}</span>
                    </div>
                    <div className="p-3 bg-slate-100 border border-slate-300 rounded-xl text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Électrophorèse Hb</span>
                      <span className="text-xl font-black text-slate-900">{patientElectrophorese}</span>
                    </div>
                    <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-center">
                      <span className="text-[10px] uppercase font-bold text-teal-600 block">Poids & Tension</span>
                      <span className="text-sm font-bold text-teal-900 block mt-1">
                        {patient.poids ? `${patient.poids} kg` : 'Non pesé'} • {patient.tensionHabituelle || 'Non mesurée'}
                      </span>
                    </div>
                  </div>

                  {/* Critical Medical History */}
                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
                      <span className="font-bold text-rose-950 uppercase text-[10px] block">Allergies Renseignées :</span>
                      <p className="font-medium mt-0.5">
                        {patient.allergies && patient.allergies.length > 0 ? patient.allergies.join(', ') : 'Aucune allergie connue'}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900">
                      <span className="font-bold text-blue-950 uppercase text-[10px] block">Pathologies & Affections Chroniques :</span>
                      <p className="font-medium mt-0.5">
                        {patient.maladiesChroniques && patient.maladiesChroniques.length > 0
                          ? patient.maladiesChroniques.join(', ')
                          : 'Aucune affection chronique déclarée'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Big QR Code */}
                <div className="text-center space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  {qrDataUrl && (
                    <img
                      src={qrDataUrl}
                      alt="QR Code d'Urgence"
                      className="w-44 h-44 border-2 border-slate-800 rounded-xl p-1.5 bg-white mx-auto shadow-sm"
                    />
                  )}
                  <span className="text-[10px] font-bold text-[#0B3C5D] block uppercase">
                    Pass QR Médical Hors-Ligne
                  </span>
                  <p className="text-[9.5px] text-slate-500 leading-tight">
                    Lisible instantanément par les équipes de réanimation et secouristes, sans connexion Internet requise.
                  </p>
                </div>
              </div>

              {/* Bottom Emergency Contacts */}
              <div className="pt-4 border-t-2 border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact Famille en cas d'urgence</span>
                  <p className="font-bold text-slate-800">
                    {patient.contactUrgenceNom} ({patient.contactUrgenceRelation}) — Tél: <span className="font-mono text-[#0B3C5D]">{patient.contactUrgenceTel}</span>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Numéros d'Urgence N'Djamena</span>
                  <p className="font-bold text-rose-700 font-mono">
                    SAMU : 15 • Police : 17 • Clinique Espoir : 22 52 14 15
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

