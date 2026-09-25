import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Users,
  Search,
  Plus,
  QrCode,
  Heart,
  PhoneCall,
  Printer,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  MapPin,
  X,
  Stethoscope,
  Clock,
  ShieldAlert,
  Copy,
  ExternalLink,
  WifiOff,
  Radio,
  Maximize2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Pill,
  Microscope,
  Save,
  Syringe,
  Scale,
  FolderKanban,
  Activity,
  Droplet,
  UserCog,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { Patient, GroupeSanguin } from '../types';
import { Logo } from '../components/Logo';
import { PatientProfileModal } from '../components/PatientProfileModal';
import { generateEmergencyQRPayload, generateEmergencyQRDataUrl } from '../utils/qrPayload';
import { PatientVaccinationCard } from '../components/PatientVaccinationCard';
import { PatientBiometrieCard } from '../components/PatientBiometrieCard';
import { PatientDocumentsCard } from '../components/PatientDocumentsCard';
import { PatientAntecedentsCard } from '../components/PatientAntecedentsCard';
import { PatientQRCardPrintModal } from '../components/PatientQRCardPrintModal';

export const PatientsView: React.FC = () => {
  const {
    patients,
    ajouterPatient,
    modifierPatient,
    currentRole,
    currentUser,
    consultations,
    ordonnances,
    exams,
    enregistrerScanQR,
    setEmergencyTargetToken,
    setCurrentView,
  } = useClinic();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientDossier, setSelectedPatientDossier] = useState<Patient | null>(null);
  const [patientToPrintQR, setPatientToPrintQR] = useState<Patient | null>(null);
  const [dossierTab, setDossierTab] = useState<
    'synthese' | 'consultations' | 'ordonnances' | 'examens' | 'vaccinations' | 'biometrie' | 'documents' | 'antecedents'
  >('synthese');
  const [showSecretMedical, setShowSecretMedical] = useState<boolean>(false);
  const [isEditingSecret, setIsEditingSecret] = useState<boolean>(false);
  const [secretDraft, setSecretDraft] = useState<string>('');
  const [showQRCardModal, setShowQRCardModal] = useState<Patient | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [showFullscreenQR, setShowFullscreenQR] = useState<boolean>(false);

  // When selected patient dossier changes, sync secret medical draft
  useEffect(() => {
    if (selectedPatientDossier) {
      setSecretDraft(selectedPatientDossier.secretMedical || '');
      setIsEditingSecret(false);
      setShowSecretMedical(false);
    }
  }, [selectedPatientDossier]);

  // Patient Profile & Photo Edit Modal
  const [patientToEditProfile, setPatientToEditProfile] = useState<Patient | null>(null);
  const [showPatientProfileModal, setShowPatientProfileModal] = useState(false);

  // New patient modal
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [newPatient, setNewPatient] = useState({
    nom: '',
    prenom: '',
    dateNaissance: '',
    sexe: 'M' as 'M' | 'F',
    telephone: '+235 ',
    adresse: '',
    email: '',
    groupeSanguin: 'Inconnu' as GroupeSanguin,
    poids: '',
    taille: '',
    tensionHabituelle: '',
    glycemieHabituelle: '',
    allergies: '',
    maladiesChroniques: '',
    contactUrgenceNom: '',
    contactUrgenceRelation: '',
    contactUrgenceTel: '',
    secretMedical: '',
  });

  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [qrPayloadText, setQrPayloadText] = useState<string>('');

  // Generate QR code with offline-first text payload + remote physician link
  useEffect(() => {
    if (showQRCardModal) {
      const payload = generateEmergencyQRPayload(showQRCardModal);
      setQrPayloadText(payload);
      generateEmergencyQRDataUrl(showQRCardModal, { width: 380, margin: 2 })
        .then(url => setQrCodeDataUrl(url))
        .catch(err => console.error('Error generating QR:', err));
    }
  }, [showQRCardModal]);

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(label);
    setTimeout(() => setCopySuccess(null), 3000);
  };

  const filteredPatients = patients.filter(p => {
    const q = searchTerm.toLowerCase();
    return (
      p.nom.toLowerCase().includes(q) ||
      p.prenom.toLowerCase().includes(q) ||
      p.matricule.toLowerCase().includes(q) ||
      p.telephone.includes(q) ||
      p.groupeSanguin.toLowerCase().includes(q)
    );
  });

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    const poidsNum = newPatient.poids ? Number(newPatient.poids) : undefined;
    const tailleNum = newPatient.taille ? Number(newPatient.taille) : undefined;
    const imcCalc = (poidsNum && tailleNum) ? Number((poidsNum / Math.pow(tailleNum / 100, 2)).toFixed(1)) : undefined;

    let calculatedAge = 0;
    if (newPatient.dateNaissance && !isNaN(new Date(newPatient.dateNaissance).getTime())) {
      const birthYear = parseInt(newPatient.dateNaissance.split('-')[0]);
      calculatedAge = Math.max(0, new Date().getFullYear() - birthYear);
    }

    const created = ajouterPatient({
      nom: newPatient.nom.toUpperCase().trim(),
      prenom: newPatient.prenom.trim(),
      dateNaissance: newPatient.dateNaissance || '',
      age: calculatedAge,
      sexe: newPatient.sexe,
      telephone: newPatient.telephone.trim(),
      adresse: newPatient.adresse.trim(),
      email: newPatient.email.trim() || undefined,
      groupeSanguin: newPatient.groupeSanguin,
      poids: poidsNum,
      taille: tailleNum,
      imc: imcCalc,
      tensionHabituelle: newPatient.tensionHabituelle.trim() || undefined,
      glycemieHabituelle: newPatient.glycemieHabituelle ? Number(newPatient.glycemieHabituelle) : undefined,
      allergies: newPatient.allergies.split(',').map(s => s.trim()).filter(Boolean),
      maladiesChroniques: newPatient.maladiesChroniques.split(',').map(s => s.trim()).filter(Boolean),
      contactUrgenceNom: newPatient.contactUrgenceNom.trim() || undefined,
      contactUrgenceRelation: newPatient.contactUrgenceRelation.trim() || undefined,
      contactUrgenceTel: newPatient.contactUrgenceTel.trim() || undefined,
      secretMedical: newPatient.secretMedical?.trim() || undefined,
      vaccinations: [],
      documentsMedicaux: [],
      mesuresBiometriques: poidsNum ? [
        {
          id: `bio-init-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          poidsKg: poidsNum,
          tailleCm: tailleNum || 0,
          imc: imcCalc || 0,
          tension: newPatient.tensionHabituelle || '',
        },
      ] : [],
    });
    setShowNewPatientModal(false);
    // Directly show the newly minted QR card
    setShowQRCardModal(created);
  };

  const handlePrintQRCard = () => {
    if (showQRCardModal) {
      setPatientToPrintQR(showQRCardModal);
    }
  };

  const handleQuickEmergencyTest = (patient: Patient) => {
    enregistrerScanQR(patient.qrToken, 'Personnel DARÔ', currentRole, 'dossier_deverrouille');
    setEmergencyTargetToken(patient.qrToken);
    setCurrentView('emergency_qr');
  };

  const canEditPatients = ['accueil', 'directeur', 'infirmier', 'medecin'].includes(currentRole);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B3C5D]">Dossiers Patients & Cartes QR</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">
              {patients.length} patients actifs
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Fiches médicales, antécédents, constantes vitales et génération de pass d'urgence sécurisés
          </p>
        </div>

        {canEditPatients && (
          <button
            onClick={() => setShowNewPatientModal(true)}
            id="patients-new-btn"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B3C5D] hover:bg-[#1E88E5] text-white text-xs font-bold shadow transition"
          >
            <Plus className="w-4 h-4 text-teal-300" />
            <span>Nouveau Patient & QR Card</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom, prénom, matricule (ex: NDJ-2025), groupe sanguin ou téléphone..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatients.map(patient => (
          <div
            key={patient.id}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-teal-300 shadow-xs hover:shadow transition flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              {/* Header with Avatar and Blood Group */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {patient.avatar ? (
                    <img
                      src={patient.avatar}
                      alt={patient.nom}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 font-bold flex items-center justify-center text-sm shadow-xs flex-shrink-0">
                      {patient.prenom?.[0]}{patient.nom?.[0]}
                    </div>
                  )}
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      {patient.matricule}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {patient.prenom} {patient.nom}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {patient.age && patient.age > 0
                        ? `${patient.age} ans`
                        : (patient.dateNaissance ? `Né(e) le ${patient.dateNaissance}` : 'Âge non renseigné')
                      } • {patient.sexe === 'M' ? 'Homme' : 'Femme'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className={`px-2.5 py-1 rounded-xl font-black text-xs shadow-xs ${
                    patient.groupeSanguin === 'Inconnu'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : patient.groupeSanguin.includes('-')
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-slate-100 text-slate-800 border border-slate-200'
                  }`}>
                    {patient.groupeSanguin === 'Inconnu' ? 'Inconnu' : patient.groupeSanguin}
                  </span>
                </div>
              </div>

              {/* Vital Warnings */}
              <div className="space-y-1 text-xs">
                <div className="flex items-start gap-1.5 text-slate-600">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-1">
                    <strong>Allergies :</strong> {patient.allergies && patient.allergies.length > 0 ? patient.allergies.join(', ') : 'Aucune déclarée'}
                  </span>
                </div>
                <div className="flex items-start gap-1.5 text-slate-600">
                  <Heart className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-1">
                    <strong>Suivi :</strong> {patient.maladiesChroniques && patient.maladiesChroniques.length > 0 ? patient.maladiesChroniques.join(', ') : 'R.A.S'}
                  </span>
                </div>
                <div className="flex items-start gap-1.5 text-slate-500 text-[11px]">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Urgence : {patient.contactUrgenceNom ? `${patient.contactUrgenceNom} (${patient.contactUrgenceTel || 'N/A'})` : 'Non renseigné'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedPatientDossier(patient)}
                className="flex-1 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Dossier</span>
              </button>

              <button
                onClick={() => setShowQRCardModal(patient)}
                className="flex-1 py-1.5 rounded-lg bg-teal-50 border border-teal-200 hover:bg-teal-100 text-teal-800 text-xs font-bold transition flex items-center justify-center gap-1"
                title="Générer & imprimer la carte QR d'urgence"
              >
                <QrCode className="w-3.5 h-3.5 text-teal-600" />
                <span>Carte QR</span>
              </button>

              <button
                onClick={() => {
                  setPatientToEditProfile(patient);
                  setShowPatientProfileModal(true);
                }}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-blue-50 text-slate-600 hover:text-[#1E88E5] transition"
                title="Modifier le profil & la photo du patient"
              >
                <UserCog className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleQuickEmergencyTest(patient)}
                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition"
                title="Tester le scan d'urgence en direct"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Printable Emergency QR Card Modal */}
      {showQRCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 no-print">
              <div className="flex items-center gap-2 text-[#0B3C5D]">
                <QrCode className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold">Carte Vitale d'Urgence DARÔ</h3>
              </div>
              <button onClick={() => setShowQRCardModal(null)} className="text-slate-400 hover:text-slate-700 p-1">
                ✕
              </button>
            </div>

            {/* The Physical Card Template (Formatted for Printing & Smartphone Pass) */}
            <div
              id="printable-daro-card"
              className="rounded-3xl bg-gradient-to-br from-[#0B3C5D] via-[#0E4971] to-[#0B3C5D] p-6 text-white shadow-2xl border-2 border-teal-400/40 relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/15">
                <Logo size="sm" lightMode={true} />
                <div className="text-right">
                  <span className="text-[10px] font-mono tracking-widest text-teal-300 font-black uppercase">
                    CARTE D'URGENCE
                  </span>
                  <p className="text-[9px] text-slate-300 font-mono">{showQRCardModal.matricule}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-12 gap-3 items-center">
                {/* Left info */}
                <div className="col-span-7 space-y-2">
                  <div>
                    <h2 className="text-lg font-black text-white leading-tight">
                      {showQRCardModal.prenom} {showQRCardModal.nom}
                    </h2>
                    <p className="text-xs text-slate-300">
                      Né(e) le {showQRCardModal.dateNaissance} ({showQRCardModal.age} ans)
                    </p>
                  </div>

                  <div className="p-2 rounded-xl bg-white/10 border border-white/15">
                    <span className="text-[9px] uppercase text-slate-300 block font-bold">Groupe Sanguin</span>
                    <span className="text-xl font-black text-rose-400">{showQRCardModal.groupeSanguin}</span>
                  </div>

                  <div className="text-[10px] space-y-1">
                    <p className="text-amber-300 font-semibold line-clamp-1">
                      ⚠️ Allergie: {showQRCardModal.allergies.join(', ') || 'Aucune'}
                    </p>
                    <p className="text-teal-200 line-clamp-1">
                      📞 Urgence: {showQRCardModal.contactUrgenceTel}
                    </p>
                  </div>
                </div>

                {/* Right: High Resolution QR Code */}
                <div className="col-span-5 flex flex-col items-center">
                  <div className="p-2.5 bg-white rounded-2xl shadow-xl border-2 border-[#1E88E5] flex flex-col items-center">
                    {qrCodeDataUrl ? (
                      <img
                        src={qrCodeDataUrl}
                        alt="QR Code"
                        className="w-32 h-32 sm:w-36 sm:h-36 object-contain cursor-pointer hover:opacity-95 transition"
                        style={{ imageRendering: 'pixelated' }}
                        onClick={() => setShowFullscreenQR(true)}
                        title="Cliquer pour agrandir en plein écran"
                      />
                    ) : (
                      <div className="w-32 h-32 flex items-center justify-center text-xs text-slate-400">
                        Chargement...
                      </div>
                    )}
                    <button
                      onClick={() => setShowFullscreenQR(true)}
                      className="mt-1.5 px-2 py-1 bg-slate-100 hover:bg-blue-50 text-[#0B3C5D] rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                    >
                      <Maximize2 className="w-3 h-3 text-[#1E88E5]" />
                      <span>Plein écran scan</span>
                    </button>
                  </div>
                  <span className="text-[9px] text-teal-200 mt-1 font-mono tracking-wider">
                    SCAN SECONDES VITALES
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-white/10 flex items-center justify-between text-[9px] text-slate-400">
                <span>DARÔ Santé • Clinique Partenaire</span>
                <span>Urgences 24/7 : +235 22 52 14 15</span>
              </div>
            </div>

            {/* Offline-First QR Content & Doctor Link Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                  <WifiOff className="w-4 h-4 text-amber-600" />
                  <span>Lecture Instantanée Hors-Ligne (Sans Connexion Internet)</span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  100% Fonctionnel Déconnecté
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-white p-3 rounded-xl border border-slate-200 font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">PATIENT :</span>
                  <span className="font-bold text-slate-900">{showQRCardModal.nom.toUpperCase()} {showQRCardModal.prenom}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">GROUPE SANGUIN VITAL :</span>
                  <span className="font-black text-rose-600">
                    {showQRCardModal.groupeSanguin === 'Inconnu' ? 'Inconnu (À typer)' : showQRCardModal.groupeSanguin}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 block text-[10px]">CONTACTS D'URGENCE :</span>
                  <span className="font-semibold text-emerald-800">
                    {showQRCardModal.contactUrgenceNom
                      ? `${showQRCardModal.contactUrgenceNom} ${showQRCardModal.contactUrgenceRelation ? `(${showQRCardModal.contactUrgenceRelation})` : ''} • ${showQRCardModal.contactUrgenceTel || 'N/A'}`
                      : 'Non renseigné'}
                  </span>
                </div>
              </div>

              {/* Remote Doctor Link */}
              <div className="pt-2 border-t border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-teal-800 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-teal-600" />
                    Lien Médecin à Distance (intégré sous le texte) :
                  </span>
                  <button
                    onClick={() => handleCopyText(`${window.location.origin}${window.location.pathname}?qr=${encodeURIComponent(showQRCardModal.qrToken)}`, 'lien')}
                    className="text-[10px] text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1 hover:underline"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copier le lien médecin</span>
                  </button>
                </div>
                <p className="p-2 rounded-lg bg-teal-50/80 border border-teal-200 text-[10px] text-teal-950 font-mono break-all select-all">
                  {typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?qr=${encodeURIComponent(showQRCardModal.qrToken)}` : `https://daro-sante.td/?qr=${showQRCardModal.qrToken}`}
                </p>
              </div>

              {copySuccess && (
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-semibold text-center animate-in fade-in">
                  ✓ {copySuccess === 'lien' ? 'Lien médecin copié dans le presse-papier !' : 'Texte brut complet du QR copié !'}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 no-print">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuickEmergencyTest(showQRCardModal)}
                  className="text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 border border-rose-200 transition"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Tester le scan de la carte</span>
                </button>
                <button
                  onClick={() => handleCopyText(qrPayloadText, 'brut')}
                  className="text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copier le texte brut QR</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowQRCardModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Fermer
                </button>
                <button
                  onClick={handlePrintQRCard}
                  className="px-4 py-2 rounded-xl bg-[#0B3C5D] hover:bg-[#1E88E5] text-white text-xs font-bold shadow flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimer la Carte</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen High Resolution Scan Overlay */}
      {showFullscreenQR && showQRCardModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Visez avec votre appareil photo
              </span>
              <button
                onClick={() => setShowFullscreenQR(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-3xl shadow-2xl border-4 border-slate-900 inline-block mx-auto">
              <img
                src={qrCodeDataUrl}
                alt="QR Grand Format"
                className="w-64 h-64 sm:w-72 sm:h-72 object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>

            <div>
              <h3 className="text-lg font-black text-[#0B3C5D]">
                {showQRCardModal.nom.toUpperCase()} {showQRCardModal.prenom}
              </h3>
              <p className="text-sm font-bold text-rose-600 mt-0.5">
                Groupe Sanguin : {showQRCardModal.groupeSanguin === 'Inconnu' ? 'Inconnu (À typer)' : showQRCardModal.groupeSanguin}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Urgence : {showQRCardModal.contactUrgenceNom
                  ? `${showQRCardModal.contactUrgenceNom} (${showQRCardModal.contactUrgenceTel || 'N/A'})`
                  : 'Non renseigné'}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border text-xs text-slate-600 text-left space-y-1">
              <p className="font-bold text-slate-800">✅ Scannage Smartphone :</p>
              <p className="text-[11px]">
                N'importe quel smartphone avec appareil photo ou Google Lens lira directement le texte hors-ligne et proposera le lien médecin.
              </p>
            </div>

            <button
              onClick={() => setShowFullscreenQR(false)}
              className="w-full py-2.5 rounded-xl bg-[#0B3C5D] text-white font-bold text-xs hover:bg-[#1E88E5] transition"
            >
              Fermer le plein écran
            </button>
          </div>
        </div>
      )}

      {/* Patient Medical Dossier Modal matching dossier_medical.php */}
      {selectedPatientDossier && (() => {
        const activePatient = patients.find(p => p.id === selectedPatientDossier.id) || selectedPatientDossier;
        const patientConsults = consultations.filter(c => c.patientId === activePatient.id);
        const patientOrds = ordonnances.filter(o => o.patientId === activePatient.id);
        const patientExams = exams.filter(e => e.patientId === activePatient.id);
        const patientVaccines = activePatient.vaccinations || [];
        const patientDocs = activePatient.documentsMedicaux || [];

        const handleSaveSecret = () => {
          const updated: Patient = {
            ...activePatient,
            secretMedical: secretDraft,
          };
          modifierPatient(updated);
          setSelectedPatientDossier(updated);
          setIsEditingSecret(false);
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
            <div className="w-full max-w-4xl rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-5 my-8 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  {activePatient.avatar ? (
                    <img
                      src={activePatient.avatar}
                      alt={activePatient.nom}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-xs"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 font-bold flex items-center justify-center text-sm shadow-xs flex-shrink-0">
                      {activePatient.prenom?.[0]}{activePatient.nom?.[0]}
                    </div>
                  )}
                  <div>
                    <h3 className="text-base font-bold text-[#0B3C5D]">
                      Dossier Médical : {activePatient.prenom} {activePatient.nom}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Matricule : <span className="font-mono font-bold text-slate-700">{activePatient.matricule}</span> • Groupe : <span className="font-bold text-rose-600">{activePatient.groupeSanguin === 'Inconnu' ? 'Inconnu (À typer)' : activePatient.groupeSanguin}</span> • Âge : <span className="font-bold text-slate-700">{activePatient.age && activePatient.age > 0 ? `${activePatient.age} ans` : (activePatient.dateNaissance ? `Né(e) le ${activePatient.dateNaissance}` : 'Âge non renseigné')}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPatientToEditProfile(activePatient);
                      setShowPatientProfileModal(true);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 text-[#1E88E5] hover:bg-blue-100 text-xs font-bold transition flex items-center gap-1.5"
                    title="Modifier la photo et les coordonnées de ce patient"
                  >
                    <UserCog className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Modifier profil & photo</span>
                  </button>
                  <button onClick={() => setSelectedPatientDossier(null)} className="text-slate-400 hover:text-slate-700 p-1">
                    ✕
                  </button>
                </div>
              </div>

              {/* Dossier Tabs matching comprehensive clinic workflow */}
              <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setDossierTab('synthese')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                    dossierTab === 'synthese'
                      ? 'bg-[#0B3C5D] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  <span>Synthèse & Urgence</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDossierTab('biometrie')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                    dossierTab === 'biometrie'
                      ? 'bg-[#0B3C5D] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5 text-teal-400" />
                  <span>Biométrie & IMC</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDossierTab('vaccinations')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                    dossierTab === 'vaccinations'
                      ? 'bg-[#0B3C5D] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Syringe className="w-3.5 h-3.5 text-amber-400" />
                  <span>Vaccinations ({patientVaccines.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDossierTab('documents')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                    dossierTab === 'documents'
                      ? 'bg-[#0B3C5D] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <FolderKanban className="w-3.5 h-3.5 text-blue-400" />
                  <span>Imageries & Docs ({patientDocs.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDossierTab('antecedents')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                    dossierTab === 'antecedents'
                      ? 'bg-[#0B3C5D] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Antécédents</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDossierTab('consultations')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                    dossierTab === 'consultations'
                      ? 'bg-[#0B3C5D] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Consultations ({patientConsults.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDossierTab('ordonnances')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                    dossierTab === 'ordonnances'
                      ? 'bg-[#0B3C5D] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Pill className="w-3.5 h-3.5 text-sky-400" />
                  <span>Ordonnances ({patientOrds.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDossierTab('examens')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                    dossierTab === 'examens'
                      ? 'bg-[#0B3C5D] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Microscope className="w-3.5 h-3.5 text-purple-400" />
                  <span>Examens & Labo ({patientExams.length})</span>
                </button>
              </div>

              {/* Tab 1: Synthèse & Secret Médical */}
              {dossierTab === 'synthese' && (
                <div className="space-y-4 text-xs">
                  {/* Coordonnées */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Téléphone</span>
                      <p className="font-bold text-slate-800 mt-0.5">{activePatient.telephone}</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Adresse</span>
                      <p className="font-bold text-slate-800 mt-0.5">{activePatient.adresse || 'Non renseignée'}</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Contact Urgence</span>
                      <p className="font-bold text-slate-800 mt-0.5">
                        {activePatient.contactUrgenceNom
                          ? `${activePatient.contactUrgenceNom} (${activePatient.contactUrgenceTel || 'N/A'})`
                          : 'Non renseigné'}
                      </p>
                    </div>
                  </div>

                  {/* Constantes & Biométrie Quick Panel */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-teal-50/70 to-blue-50/70 border border-teal-200/80">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-bold text-teal-900 flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5 text-teal-600" />
                        Constantes Cliniques & Biométrie OMS
                      </span>
                      <button
                        type="button"
                        onClick={() => setDossierTab('biometrie')}
                        className="text-[11px] font-bold text-teal-800 hover:text-teal-950 underline"
                      >
                        Voir courbe & historique →
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      <div className="p-2 rounded-xl bg-white border border-teal-100 shadow-2xs">
                        <span className="text-[9px] uppercase text-slate-400 font-bold block">Poids</span>
                        <span className="font-bold text-slate-900 text-sm">
                          {activePatient.poids ? `${activePatient.poids} kg` : 'Non renseigné'}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-teal-100 shadow-2xs">
                        <span className="text-[9px] uppercase text-slate-400 font-bold block">Taille</span>
                        <span className="font-bold text-slate-900 text-sm">
                          {activePatient.taille ? `${activePatient.taille} cm` : 'Non renseignée'}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-teal-100 shadow-2xs">
                        <span className="text-[9px] uppercase text-slate-400 font-bold block">IMC (Indice)</span>
                        <span className="font-bold text-[#0B3C5D] text-sm">
                          {activePatient.imc ? activePatient.imc : 'Non calculé'}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-teal-100 shadow-2xs">
                        <span className="text-[9px] uppercase text-slate-400 font-bold block">Tension</span>
                        <span className="font-bold text-rose-700 text-sm">
                          {activePatient.tensionHabituelle ? activePatient.tensionHabituelle : 'Non mesurée'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick summary grid for Allergies & Chroniques */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200">
                      <span className="text-[10px] text-amber-800 font-bold uppercase flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        Allergies Connues
                      </span>
                      <p className="font-bold text-amber-900 mt-1">
                        {activePatient.allergies && activePatient.allergies.length > 0
                          ? activePatient.allergies.join(', ')
                          : 'Aucune allergie répertoriée'}
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200">
                      <span className="text-[10px] text-blue-800 font-bold uppercase flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-blue-600" />
                        Maladies Chroniques
                      </span>
                      <p className="font-bold text-blue-900 mt-1">
                        {activePatient.maladiesChroniques && activePatient.maladiesChroniques.length > 0
                          ? activePatient.maladiesChroniques.join(', ')
                          : 'Aucune affection chronique déclarée'}
                      </p>
                    </div>
                  </div>

                  {/* Mini cards for Vaccins & Documents */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      onClick={() => setDossierTab('vaccinations')}
                      className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-teal-400 transition cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                          <Syringe className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 block text-xs">Carnet Vaccinal</span>
                          <span className="text-[10px] text-slate-500">
                            {patientVaccines.length} vaccin{patientVaccines.length > 1 ? 's' : ''} consigné{patientVaccines.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <span className="text-teal-700 font-bold text-xs">Accéder →</span>
                    </div>

                    <div
                      onClick={() => setDossierTab('documents')}
                      className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-teal-400 transition cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                          <FolderKanban className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 block text-xs">Imagerie & Documents</span>
                          <span className="text-[10px] text-slate-500">
                            {patientDocs.length} document{patientDocs.length > 1 ? 's' : ''} rattaché{patientDocs.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <span className="text-teal-700 font-bold text-xs">Accéder →</span>
                    </div>
                  </div>

                  {/* Secret Médical Frame matching dossier_medical.php */}
                  <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 border border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                          Secret Médical Confidentiel
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-slate-300">
                          Exclus du QR Public
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowSecretMedical(!showSecretMedical)}
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold text-white flex items-center gap-1 transition"
                      >
                        {showSecretMedical ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Masquer</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Déverrouiller / Voir</span>
                          </>
                        )}
                      </button>
                    </div>

                    {showSecretMedical ? (
                      <div className="pt-2 space-y-2 border-t border-white/10">
                        {isEditingSecret ? (
                          <div className="space-y-2">
                            <textarea
                              rows={3}
                              value={secretDraft}
                              onChange={e => setSecretDraft(e.target.value)}
                              placeholder="Notes confidentielles du médecin (antécédents psychiatriques, pathologies confidentielles...)"
                              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setIsEditingSecret(false)}
                                className="px-3 py-1 rounded-lg bg-white/10 text-slate-300 text-xs font-bold hover:bg-white/20"
                              >
                                Annuler
                              </button>
                              <button
                                type="button"
                                onClick={handleSaveSecret}
                                className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center gap-1 shadow"
                              >
                                <Save className="w-3.5 h-3.5" />
                                <span>Enregistrer la note</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-xs text-slate-200 leading-relaxed italic">
                              {selectedPatientDossier.secretMedical ||
                                'Aucune note confidentielle saisie pour ce patient.'}
                            </p>
                            <button
                              type="button"
                              onClick={() => setIsEditingSecret(true)}
                              className="px-2.5 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-[11px] font-bold flex-shrink-0"
                            >
                              Modifier la note
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400">
                        Ces observations sont strictement protégées par le secret médical hospitalier et ne sont jamais divulguées lors d'un scan d'urgence non autorisé.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Consultations */}
              {dossierTab === 'consultations' && (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {patientConsults.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
                      Aucune consultation archivée pour ce dossier.
                    </div>
                  ) : (
                    patientConsults.map(c => (
                      <div key={c.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-sm">{c.motif}</span>
                          <span className="text-[11px] text-slate-500">{c.date}</span>
                        </div>
                        <p className="text-slate-700">
                          <strong>Diagnostic :</strong> {c.diagnostic}
                        </p>
                        {c.observations && (
                          <p className="text-slate-600 text-[11px]">
                            <strong>Observations :</strong> {c.observations}
                          </p>
                        )}
                        <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200/60">
                          <span>Praticien : <strong>{c.medecinNom}</strong></span>
                          <span>Tension : {c.tension || '12/8'}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 3: Ordonnances */}
              {dossierTab === 'ordonnances' && (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {patientOrds.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
                      Aucune ordonnance active pour ce patient.
                    </div>
                  ) : (
                    patientOrds.map(o => (
                      <div key={o.id} className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-200 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#0B3C5D]">Ordonnance N° {o.numero}</span>
                          <span className="text-[11px] text-slate-500">{o.date}</span>
                        </div>
                        <div className="space-y-1">
                          {(o.items || []).map((m, idx) => (
                            <div key={idx} className="p-2 rounded-xl bg-white border border-slate-200 flex justify-between items-center">
                              <span className="font-bold text-slate-800">{m.medicament}</span>
                              <span className="text-slate-600 text-[11px]">{m.posologie} • {m.duree}</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-[11px] text-slate-500 text-right">Prescrit par {o.medecinNom}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 4: Examens & Labo */}
              {dossierTab === 'examens' && (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {patientExams.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
                      Aucun examen de laboratoire ou d'imagerie prescrit.
                    </div>
                  ) : (
                    patientExams.map(e => (
                      <div key={e.id} className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#0B3C5D]">{e.nomExamen}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            e.statut === 'valide' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {e.statut === 'valide' ? 'Résultat disponible' : 'En attente d\'analyse'}
                          </span>
                        </div>
                        {e.resultats && (
                          <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                            <p className="text-slate-800"><strong>Résultats :</strong> {e.resultats}</p>
                            {e.conclusion && <p className="text-slate-600 text-[11px]"><strong>Conclusion :</strong> {e.conclusion}</p>}
                          </div>
                        )}
                        <p className="text-[11px] text-slate-500">Prescrit le {e.datePrescription}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 5: Biométrie & IMC */}
              {dossierTab === 'biometrie' && (
                <PatientBiometrieCard patient={activePatient} />
              )}

              {/* Tab 6: Vaccinations & Carnet */}
              {dossierTab === 'vaccinations' && (
                <PatientVaccinationCard patient={activePatient} />
              )}

              {/* Tab 7: Documents & Imagerie Médicale */}
              {dossierTab === 'documents' && (
                <PatientDocumentsCard patient={activePatient} />
              )}

              {/* Tab 8: Antécédents Médico-Chirurgicaux */}
              {dossierTab === 'antecedents' && (
                <PatientAntecedentsCard patient={activePatient} />
              )}

              {/* Bottom Actions */}
              <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center gap-1.5 transition"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-600" />
                    <span>Imprimer la fiche dossier</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowQRCardModal(selectedPatientDossier);
                    }}
                    className="px-3 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold flex items-center gap-1.5 border border-teal-200 transition"
                  >
                    <QrCode className="w-3.5 h-3.5 text-teal-600" />
                    <span>Afficher Carte Vitale QR</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPatientDossier(null)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Fermer le dossier
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* New Patient Registration Modal */}
      {showNewPatientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 my-8 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-[#0B3C5D]">
                <Plus className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold">Enregistrer un Nouveau Patient & Carte QR</h3>
              </div>
              <button onClick={() => setShowNewPatientModal(false)} className="text-slate-400 hover:text-slate-700 p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nom de famille :</label>
                  <input
                    type="text"
                    value={newPatient.nom}
                    onChange={e => setNewPatient({ ...newPatient, nom: e.target.value })}
                    required
                    placeholder="Ex: MAHAMAT"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Prénom :</label>
                  <input
                    type="text"
                    value={newPatient.prenom}
                    onChange={e => setNewPatient({ ...newPatient, prenom: e.target.value })}
                    required
                    placeholder="Ex: Issa"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date de Naissance :</label>
                  <input
                    type="date"
                    value={newPatient.dateNaissance}
                    onChange={e => setNewPatient({ ...newPatient, dateNaissance: e.target.value })}
                    required
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sexe :</label>
                  <select
                    value={newPatient.sexe}
                    onChange={e => setNewPatient({ ...newPatient, sexe: e.target.value as 'M' | 'F' })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                  >
                    <option value="M">Masculin (M)</option>
                    <option value="F">Féminin (F)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Téléphone à N'Djamena :</label>
                  <input
                    type="text"
                    value={newPatient.telephone}
                    onChange={e => setNewPatient({ ...newPatient, telephone: e.target.value })}
                    required
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Groupe Sanguin :</label>
                  <select
                    value={newPatient.groupeSanguin}
                    onChange={e => setNewPatient({ ...newPatient, groupeSanguin: e.target.value as GroupeSanguin })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-rose-700"
                  >
                    <option value="Inconnu">Non déterminé / Inconnu (À prélever)</option>
                    <option value="O+">O RHD Positif (O+)</option>
                    <option value="O-">O RHD Négatif (O-)</option>
                    <option value="A+">A RHD Positif (A+)</option>
                    <option value="A-">A RHD Négatif (A-)</option>
                    <option value="B+">B RHD Positif (B+)</option>
                    <option value="B-">B RHD Négatif (B-)</option>
                    <option value="AB+">AB RHD Positif (AB+)</option>
                    <option value="AB-">AB RHD Négatif (AB-)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Adresse à N'Djamena :</label>
                <input
                  type="text"
                  value={newPatient.adresse}
                  onChange={e => setNewPatient({ ...newPatient, adresse: e.target.value })}
                  placeholder="Quartier, Rue ou Repère"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Allergies Médicamenteuses / Vitales :</label>
                  <input
                    type="text"
                    value={newPatient.allergies}
                    onChange={e => setNewPatient({ ...newPatient, allergies: e.target.value })}
                    placeholder="Pénicilline, Sulfamides, Aspirine..."
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pathologies Chroniques :</label>
                  <input
                    type="text"
                    value={newPatient.maladiesChroniques}
                    onChange={e => setNewPatient({ ...newPatient, maladiesChroniques: e.target.value })}
                    placeholder="Drépanocytose, HTA, Diabète..."
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              {/* Initial Biometrics */}
              <div className="p-3 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-2">
                <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-teal-700" />
                  Biométrie Initiale & Constantes Vitales
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Poids (kg)</label>
                    <input
                      type="number"
                      value={newPatient.poids}
                      onChange={e => setNewPatient({ ...newPatient, poids: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-300 px-2.5 py-1.5 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Taille (cm)</label>
                    <input
                      type="number"
                      value={newPatient.taille}
                      onChange={e => setNewPatient({ ...newPatient, taille: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-300 px-2.5 py-1.5 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Tension (ex: 120/80)</label>
                    <input
                      type="text"
                      value={newPatient.tensionHabituelle}
                      onChange={e => setNewPatient({ ...newPatient, tensionHabituelle: e.target.value })}
                      placeholder="120/80"
                      className="w-full rounded-xl border border-slate-300 px-2.5 py-1.5 text-xs bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Glycémie (mg/dL)</label>
                    <input
                      type="number"
                      value={newPatient.glycemieHabituelle}
                      onChange={e => setNewPatient({ ...newPatient, glycemieHabituelle: Number(e.target.value) })}
                      placeholder="95"
                      className="w-full rounded-xl border border-slate-300 px-2.5 py-1.5 text-xs bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-800">Contact d'Urgence Famille / Proche</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newPatient.contactUrgenceNom}
                    onChange={e => setNewPatient({ ...newPatient, contactUrgenceNom: e.target.value })}
                    placeholder="Nom du proche (optionnel)"
                    className="rounded-xl border border-slate-300 px-2.5 py-1.5 text-xs"
                  />
                  <input
                    type="text"
                    value={newPatient.contactUrgenceRelation}
                    onChange={e => setNewPatient({ ...newPatient, contactUrgenceRelation: e.target.value })}
                    placeholder="Lien (ex: Frère, Épouse)"
                    className="rounded-xl border border-slate-300 px-2.5 py-1.5 text-xs"
                  />
                  <input
                    type="text"
                    value={newPatient.contactUrgenceTel}
                    onChange={e => setNewPatient({ ...newPatient, contactUrgenceTel: e.target.value })}
                    placeholder="Téléphone urgence"
                    className="rounded-xl border border-slate-300 px-2.5 py-1.5 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Secret Médical Optionnel (Réservé au Personnel Médical) */}
              <div className="p-3 rounded-2xl bg-slate-900 text-white space-y-1.5 border border-slate-800">
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Lock className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold uppercase tracking-wider">Secret Médical (Optionnel)</span>
                </div>
                <textarea
                  rows={2}
                  value={newPatient.secretMedical}
                  onChange={e => setNewPatient({ ...newPatient, secretMedical: e.target.value })}
                  placeholder="Notes médicales hautement confidentielles (antécédents délicats, non divulgués sur le QR code public)..."
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewPatientModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0B3C5D] hover:bg-[#1E88E5] text-white text-xs font-bold shadow"
                >
                  Créer le dossier & Générer le QR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Patient Profile & Photo Edit Modal */}
      <PatientProfileModal
        isOpen={showPatientProfileModal}
        patient={patientToEditProfile}
        onClose={() => {
          setShowPatientProfileModal(false);
          setPatientToEditProfile(null);
        }}
      />

      {/* Official Patient QR & Emergency Card Printable Modal */}
      {patientToPrintQR && (
        <PatientQRCardPrintModal
          isOpen={!!patientToPrintQR}
          patient={patientToPrintQR}
          onClose={() => setPatientToPrintQR(null)}
        />
      )}
    </div>
  );
};
