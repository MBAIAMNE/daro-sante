import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  UserCheck,
  Calendar,
  Video,
  MessageSquare,
  CheckCircle2,
  ArrowRightLeft,
  Clock,
  Activity,
  HeartPulse,
  Sparkles,
  Stethoscope,
  X,
} from 'lucide-react';
import { Etablissement, User, Patient } from '../types';
import { africanFemaleDoctor, africanDoctorClinic, africanDoctorTeam } from '../assets/africanImages';

interface PatientHospitalCardProps {
  patient: Patient;
  patientHospital: Etablissement;
  etablissements: Etablissement[];
  doctors: User[];
  onSelectDoctorChat: (doctor: User) => void;
  onSelectDoctorAppt: (doctor: User, type: 'presentiel' | 'teleconsultation') => void;
  onStartTeleconsult: (doctorNom: string) => void;
  onChangeHospital: (newEtabId: string) => void;
}

export const PatientHospitalCard: React.FC<PatientHospitalCardProps> = ({
  patient,
  patientHospital,
  etablissements,
  doctors,
  onSelectDoctorChat,
  onSelectDoctorAppt,
  onStartTeleconsult,
  onChangeHospital,
}) => {
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [selectedNewEtabId, setSelectedNewEtabId] = useState(patientHospital.id);

  const handleConfirmSwitch = () => {
    onChangeHospital(selectedNewEtabId);
    setShowSwitchModal(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Primary Hospital Profile Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0B3C5D] to-[#1E88E5] text-white flex items-center justify-center shadow-md flex-shrink-0">
                <Building2 className="w-8 h-8" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Mon Hôpital Référent Agréé
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {patientHospital.code || 'DARO-01'}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  {patientHospital.nom}
                </h2>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{patientHospital.adresse || "Quartier Moursal, N'Djamena"} • {patientHospital.ville || "N'Djamena"}, Tchad</span>
                </p>
              </div>
            </div>

            {/* Change hospital button */}
            <button
              type="button"
              onClick={() => setShowSwitchModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <ArrowRightLeft className="w-4 h-4 text-sky-600" />
              <span>Changer d'Hôpital</span>
            </button>
          </div>

          {/* Hospital Key Facts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="text-slate-400 font-semibold text-[10px]">Standard Téléphonique</p>
                <p className="font-bold text-slate-900">{patientHospital.telephone || '+235 22 51 45 00'}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="text-slate-400 font-semibold text-[10px]">Permanence des Soins</p>
                <p className="font-bold text-slate-900">Urgences 24h/24 & 7j/7</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="text-slate-400 font-semibold text-[10px]">Direction Médicale</p>
                <p className="font-bold text-slate-900">{patientHospital.directeurNom || 'Dr. Kaltouma Djibrine'}</p>
              </div>
            </div>
          </div>

          {/* Quick On-Call Emergency Teleconsultation Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white flex flex-wrap items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
                <Video className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 block">
                  Permanence Médicale & Urgence
                </span>
                <p className="text-sm font-bold">
                  Besoin d'un avis médical immédiat sans vous déplacer ?
                </p>
                <p className="text-xs text-purple-200/80">
                  Le médecin de garde de votre hôpital est disponible en téléconsultation vidéo sécurisée.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onStartTeleconsult(patientHospital.directeurNom || 'Dr. Kaltouma Djibrine')}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-purple-950/40 cursor-pointer"
            >
              <Video className="w-4 h-4" />
              <span>Démarrer Téléconsultation Immédiate</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Doctors & Specialists Directory */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-sky-600" />
              <span>Médecins & Spécialistes de votre Hôpital ({doctors.length})</span>
            </h3>
            <p className="text-xs text-slate-500">
              Consultez les praticiens en présentiel ou par téléconsultation vidéo, ou posez-leur une question par messagerie.
            </p>
          </div>
        </div>

        {doctors.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
            Aucun médecin répertorié pour cet établissement pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors.map(doc => {
              const avatarImage = doc.avatar || (doc.prenom.toLowerCase().includes('kaltouma') ? africanFemaleDoctor : africanDoctorClinic);

              return (
                <div
                  key={doc.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition space-y-4"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={avatarImage}
                      alt={`${doc.prenom} ${doc.nom}`}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-xs flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Disponible
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {doc.specialite || 'Médecine Générale & Urgences'}
                        </span>
                      </div>

                      <h4 className="text-sm font-black text-slate-900 mt-1 truncate">
                        Dr. {doc.prenom} {doc.nom}
                      </h4>
                      <p className="text-xs text-[#1E88E5] font-semibold mt-0.5">
                        {patientHospital.nom}
                      </p>
                    </div>
                  </div>

                  {/* Actions for this doctor */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => onSelectDoctorChat(doc)}
                      className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1E88E5] text-xs font-bold transition flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer"
                      title="Ouvrir une discussion sécurisée"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Message</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectDoctorAppt(doc, 'teleconsultation')}
                      className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer"
                      title="Prendre rendez-vous en vidéo"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Téléconsultation</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectDoctorAppt(doc, 'presentiel')}
                      className="p-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer"
                      title="Prendre rendez-vous au cabinet"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>RDV Clinique</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Switch Hospital Modal */}
      {showSwitchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Choisir votre Hôpital de Rattachement
                  </h3>
                  <p className="text-xs text-slate-500">
                    Sélectionnez votre établissement de soins référent au Tchad.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSwitchModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {etablissements.map(etab => {
                const isSelected = selectedNewEtabId === etab.id;

                return (
                  <button
                    key={etab.id}
                    type="button"
                    onClick={() => setSelectedNewEtabId(etab.id)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-[#1E88E5] bg-blue-50/70 ring-2 ring-[#1E88E5]/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{etab.nom}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {etab.adresse || "N'Djamena"} • {etab.ville || "N'Djamena"}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Direction : {etab.directeurNom || 'Direction Médicale'}
                      </p>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-[#1E88E5] flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-900 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                En changeant d'établissement, vos futurs rendez-vous et vos messages seront adressés en priorité aux équipes soignantes de votre nouvel hôpital référent.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSwitchModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmSwitch}
                className="px-5 py-2 rounded-xl bg-[#0B3C5D] hover:bg-[#1E88E5] text-white text-xs font-bold shadow transition cursor-pointer"
              >
                Confirmer mon choix
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
