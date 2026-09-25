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
} from 'lucide-react';
import { Patient } from '../types';
import { Logo } from './Logo';
import { generateEmergencyQRPayload } from '../utils/qrPayload';

interface PatientQRCardPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
}

export const PatientQRCardPrintModal: React.FC<PatientQRCardPrintModalProps> = ({
  isOpen,
  onClose,
  patient,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [formatMode, setFormatMode] = useState<'carte' | 'fiche'>('carte');

  useEffect(() => {
    if (!patient) return;

    const payload = generateEmergencyQRPayload(patient);

    QRCode.toDataURL(payload, {
      width: 400,
      margin: 1,
      color: {
        dark: '#0B3C5D',
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

  return (
    <div
      id="modal-print-qr-card-backdrop"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-3 sm:p-6 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="modal-print-qr-card-container"
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in"
      >
        {/* Action Header (Hidden during actual print) */}
        <div className="no-print bg-slate-900 text-white p-4 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Impression Carte d'Urgence & Pass QR DARÔ
              </h3>
              <p className="text-[11px] text-slate-400">
                Badge médical scannable hors-ligne pour les urgences à N'Djamena
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Format toggle */}
            <div className="hidden sm:flex bg-slate-800 p-0.5 rounded-xl border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setFormatMode('carte')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  formatMode === 'carte' ? 'bg-[#1E88E5] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Format Badge Poche
              </button>
              <button
                type="button"
                onClick={() => setFormatMode('fiche')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  formatMode === 'fiche' ? 'bg-[#1E88E5] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Format Fiche A4
              </button>
            </div>

            <button
              onClick={handlePrint}
              id="btn-print-qr-card-trigger"
              className="px-4 py-2 rounded-xl bg-[#1E88E5] hover:bg-[#1565C0] text-white font-bold text-xs flex items-center gap-2 shadow-sm transition"
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

        {/* Printable Area */}
        <div className="p-6 sm:p-8 bg-slate-50 print:bg-white print:p-0">
          {formatMode === 'carte' ? (
            /* Badge Format (85x54 standard or emergency wallet badge) */
            <div
              id="printable-qr-card"
              className="max-w-md mx-auto bg-white rounded-2xl border-2 border-slate-800 shadow-md p-5 space-y-4 print:border-2 print:shadow-none print:m-0"
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
              className="bg-white rounded-2xl border-2 border-slate-800 p-8 space-y-6 print:border-none print:p-4"
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
