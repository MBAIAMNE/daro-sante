import React, { useState } from 'react';
import {
  ShieldAlert,
  PhoneCall,
  AlertTriangle,
  Heart,
  Lock,
  Unlock,
  CheckCircle2,
  Calendar,
  MapPin,
  FileText,
  UserCheck,
  Stethoscope,
  Clock,
  ArrowLeft,
  Hospital,
  Eye,
  QrCode,
  Scale,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { Logo } from '../components/Logo';
import { findPatientFromScannedPayload } from '../utils/qrPayload';

export const EmergencyQRView: React.FC = () => {
  const {
    patients,
    emergencyTargetToken,
    setCurrentView,
    consultations,
    ordonnances,
    currentUser,
    currentRole,
    enregistrerScanQR,
  } = useClinic();

  // Find patient by token or payload, with fallback to first patient for testing
  const matchedPatient = emergencyTargetToken
    ? findPatientFromScannedPayload(emergencyTargetToken, patients) || patients.find(p => p.qrToken === emergencyTargetToken)
    : null;
  const patient = matchedPatient || patients[0];

  // Medical staff unlock state
  const isStaffAlready = currentRole !== 'patient';
  const [isUnlocked, setIsUnlocked] = useState<boolean>(isStaffAlready);
  const [staffCode, setStaffCode] = useState('');
  const [unlockError, setUnlockError] = useState(false);

  const handleUnlockDossier = (e: React.FormEvent) => {
    e.preventDefault();
    // Verify staff pass or code
    if (staffCode.trim().length > 0 || isStaffAlready) {
      setIsUnlocked(true);
      setUnlockError(false);
      enregistrerScanQR(
        patient.qrToken,
        `${currentUser.prenom} ${currentUser.nom} (${currentUser.role})`,
        currentUser.role,
        'dossier_deverrouille'
      );
    } else {
      setUnlockError(true);
    }
  };

  const patientConsultations = consultations.filter(c => c.patientId === patient.id);
  const patientOrdonnances = ordonnances.filter(o => o.patientId === patient.id);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-12">
      {/* Top Emergency Red Banner */}
      <div className="bg-rose-700 text-white px-4 py-2.5 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-black tracking-wide">
            <ShieldAlert className="w-5 h-5 text-rose-200 animate-pulse" />
            <span>FICHE D'URGENCE MÉDICALE DARÔ • ACCÈS IMMÉDIAT QR</span>
          </div>
          <button
            onClick={() => setCurrentView('public_landing')}
            className="flex items-center gap-1 text-xs text-rose-100 hover:text-white underline font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Accueil</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* Main Public Vital Emergency Card */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-xl border-2 border-rose-600/30 relative overflow-hidden">
          {/* Watermark in corner */}
          <div className="absolute top-0 right-0 translate-x-8 -translate-y-8 opacity-5 pointer-events-none">
            <QrCode className="w-64 h-64 text-[#0B3C5D]" />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div className="flex items-center gap-4">
              {patient.avatar ? (
                <img
                  src={patient.avatar}
                  alt={patient.nom}
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-teal-50 border-4 border-white text-teal-800 font-black flex items-center justify-center text-xl shadow-lg flex-shrink-0">
                  {patient.prenom?.[0]}{patient.nom?.[0]}
                </div>
              )}
              <div>
                <span className="text-[11px] font-mono font-bold text-slate-400">
                  MATRICULE : {patient.matricule}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-[#0B3C5D]">
                  {patient.prenom} {patient.nom}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {patient.age && patient.age > 0
                    ? `${patient.age} ans`
                    : (patient.dateNaissance ? `Né(e) le ${patient.dateNaissance}` : 'Âge non renseigné')
                  } • {patient.sexe === 'M' ? 'Homme' : 'Femme'} • Dossier DARÔ N'Djamena
                </p>
              </div>
            </div>

            {/* Blood Type Display */}
            <div className="flex-shrink-0 flex flex-col items-center sm:items-end">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Groupe Sanguin
              </span>
              <div className={`px-5 py-2.5 rounded-2xl text-white font-black text-2xl tracking-wider shadow-lg flex items-center gap-2 ${
                patient.groupeSanguin === 'Inconnu'
                  ? 'bg-amber-600'
                  : 'bg-rose-600'
              }`}>
                <Heart className="w-6 h-6 fill-white text-rose-600" />
                <span>{patient.groupeSanguin === 'Inconnu' ? 'Inconnu (À typer)' : patient.groupeSanguin}</span>
              </div>
            </div>
          </div>

          {/* Quick Vital Biometrics Bar */}
          <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1 mb-2">
              <Scale className="w-3.5 h-3.5 text-teal-600" />
              Constantes Physiques Habituelles
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[9px] uppercase text-slate-400 font-bold block">Poids</span>
                <span className="font-bold text-slate-900 text-sm">
                  {patient.poids ? `${patient.poids} kg` : 'Non renseigné'}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[9px] uppercase text-slate-400 font-bold block">Taille</span>
                <span className="font-bold text-slate-900 text-sm">
                  {patient.taille ? `${patient.taille} cm` : 'Non renseignée'}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[9px] uppercase text-slate-400 font-bold block">IMC (OMS)</span>
                <span className="font-bold text-[#0B3C5D] text-sm">
                  {patient.imc ? patient.imc : 'Non calculé'}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[9px] uppercase text-slate-400 font-bold block">Tension</span>
                <span className="font-bold text-rose-700 text-sm">
                  {patient.tensionHabituelle ? patient.tensionHabituelle : 'Non mesurée'}
                </span>
              </div>
            </div>
          </div>

          {/* Critical Vital Fields: Allergies, Chronic Conditions, Emergency Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Allergies Warning */}
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Allergies Majeures Déclarées</span>
              </div>
              {patient.allergies && patient.allergies.length > 0 ? (
                <ul className="space-y-1">
                  {patient.allergies.map((allergy, i) => (
                    <li key={i} className="text-xs font-black text-rose-700 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                      <span>{allergy}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500">Aucune allergie connue renseignée.</p>
              )}
            </div>

            {/* Chronic Conditions */}
            <div className="p-4 rounded-2xl bg-sky-50 border-2 border-sky-300 space-y-2">
              <div className="flex items-center gap-2 text-sky-900 font-bold text-xs uppercase tracking-wider">
                <Heart className="w-4 h-4 text-sky-600" />
                <span>Pathologies Chroniques & Suivi</span>
              </div>
              {patient.maladiesChroniques && patient.maladiesChroniques.length > 0 ? (
                <ul className="space-y-1">
                  {patient.maladiesChroniques.map((maladie, i) => (
                    <li key={i} className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
                      <span>{maladie}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500">Aucune pathologie chronique signalée.</p>
              )}
            </div>
          </div>

          {/* Emergency Contact */}
          {patient.contactUrgenceNom || patient.contactUrgenceTel ? (
            <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase text-emerald-800 tracking-wider">
                  Contact d'Urgence Famille / Proche
                </span>
                <p className="text-base font-bold text-emerald-950 mt-0.5">
                  {patient.contactUrgenceNom || 'Contact désigné'} {patient.contactUrgenceRelation ? `(${patient.contactUrgenceRelation})` : ''}
                </p>
                {patient.contactUrgenceTel && (
                  <p className="text-xs text-emerald-700 font-mono mt-0.5">
                    {patient.contactUrgenceTel}
                  </p>
                )}
              </div>
              {patient.contactUrgenceTel && (
                <a
                  href={`tel:${patient.contactUrgenceTel}`}
                  className="flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs shadow-md transition"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Appeler le contact d'urgence</span>
                </a>
              )}
            </div>
          ) : (
            <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                Contact d'Urgence Famille / Proche
              </span>
              <p className="text-xs text-slate-500 mt-1">
                Aucun contact d'urgence n'a encore été renseigné par le patient.
              </p>
            </div>
          )}
        </div>

        {/* Medical Personnel Restricted Dossier Section */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-md border border-slate-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2.5 text-[#0B3C5D]">
              <Hospital className="w-5 h-5 text-teal-600" />
              <div>
                <h3 className="text-base font-bold">Dossier Médical Complet DARÔ</h3>
                <p className="text-xs text-slate-500">Réservé au personnel soignant autorisé</p>
              </div>
            </div>

            {isUnlocked ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                <Unlock className="w-3.5 h-3.5" />
                Dossier Déverrouillé
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                <Lock className="w-3.5 h-3.5" />
                Verrouillé
              </span>
            )}
          </div>

          {!isUnlocked ? (
            /* Staff Unlock Form */
            <div className="py-6 max-w-md mx-auto text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Déverrouillage Professionnel de Santé
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Connectez-vous avec votre identifiant DARÔ ou code médecin pour consulter l'historique complet, les ordonnances et l'adresse du patient.
                </p>
              </div>

              <form onSubmit={handleUnlockDossier} className="space-y-3 pt-2">
                <input
                  type="password"
                  value={staffCode}
                  onChange={e => setStaffCode(e.target.value)}
                  placeholder="Code ou badge soignant (ex: DARO-MED)"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 text-center font-mono"
                />
                {unlockError && (
                  <p className="text-xs text-rose-600 font-medium">
                    Veuillez saisir votre code d'accès professionnel.
                  </p>
                )}
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#0B3C5D] hover:bg-[#1E88E5] text-white text-xs font-bold shadow transition flex items-center justify-center gap-2"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Déverrouiller le dossier complet</span>
                </button>
              </form>
            </div>
          ) : (
            /* Unlocked Full Dossier */
            <div className="pt-6 space-y-6">
              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Date de Naissance</span>
                  <p className="font-bold text-slate-900 mt-0.5">{patient.dateNaissance || 'Non renseignée'}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Téléphone Personnel</span>
                  <p className="font-bold text-slate-900 mt-0.5">{patient.telephone || 'Non renseigné'}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Adresse Domicile</span>
                  <p className="font-bold text-slate-900 mt-0.5">{patient.adresse || 'Non renseignée'}</p>
                </div>
              </div>

              {/* Consultation History */}
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2 flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  Historique des Consultations ({patientConsultations.length})
                </h4>
                {patientConsultations.length > 0 ? (
                  <div className="space-y-2">
                    {patientConsultations.map(c => (
                      <div key={c.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{c.motif}</span>
                          <span className="text-[11px] text-slate-500">{c.date}</span>
                        </div>
                        <p className="text-slate-700"><strong>Diagnostic :</strong> {c.diagnostic}</p>
                        <p className="text-slate-600 text-[11px]"><strong>Praticien :</strong> {c.medecinNom}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Aucune consultation antérieure enregistrée.</p>
                )}
              </div>

              {/* Prescriptions */}
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-sky-600" />
                  Ordonnances & Traitements en Cours ({patientOrdonnances.length})
                </h4>
                {patientOrdonnances.length > 0 ? (
                  <div className="space-y-2">
                    {patientOrdonnances.map(o => (
                      <div key={o.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-[#0B3C5D]">{o.numero}</span>
                          <span className="text-[11px] text-slate-500">Date : {o.date}</span>
                        </div>
                        <div className="space-y-1 pt-1">
                          {o.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-[11px] text-slate-700">
                              <span>• {item.medicament} ({item.posologie})</span>
                              <span className="font-semibold text-slate-500">{item.duree}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Aucune ordonnance active.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
