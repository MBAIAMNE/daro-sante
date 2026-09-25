import React, { useState } from 'react';
import {
  QrCode,
  ShieldAlert,
  Heart,
  Sparkles,
  PhoneCall,
  Clock,
  CheckCircle2,
  Lock,
  ArrowRight,
  UserPlus,
  LogIn,
  Hospital,
  AlertTriangle,
  FileBadge,
  Building2,
  Globe2,
  MapPin,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { Logo } from '../components/Logo';
import { africanPatientId } from '../assets/africanImages';

interface PublicLandingProps {
  onOpenScanner: () => void;
}

export const PublicLandingView: React.FC<PublicLandingProps> = ({ onOpenScanner }) => {
  const {
    navigateToLogin,
    setCurrentView,
    setEmergencyTargetToken,
    enregistrerScanQR,
    etablissements,
    setSelectedEtablissementId,
  } = useClinic();

  const handleSimulateEmergencyScan = (token: string) => {
    enregistrerScanQR(token, 'Citoyen Secours / Public', 'public', 'public_urgence');
    setEmergencyTargetToken(token);
    setCurrentView('emergency_qr');
  };

  const activeEtabsCount = etablissements.filter(e => e.statut === 'actif').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Top Banner for DARÔ Network */}
      <div className="bg-[#0B3C5D] text-white py-2 px-4 text-xs font-medium border-b border-sky-900/50">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>DARÔ Santé • Système d'Information Hospitalier & Dossier Médical QR</span>
            <span className="hidden md:inline px-2 py-0.5 rounded bg-sky-800/80 text-[10px] font-bold uppercase">
              {activeEtabsCount} Établissements Connectés
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-300">
            <span>Assistance & Urgences : <strong>+235 22 52 14 15</strong></span>
            <button
              onClick={() => navigateToLogin('login')}
              className="text-amber-300 hover:text-white underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <Lock className="w-3 h-3 text-amber-300" />
              <span>Connexion Administrateur →</span>
            </button>
            <button
              onClick={() => navigateToLogin('login')}
              className="text-teal-300 hover:text-white underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <Lock className="w-3 h-3 text-teal-300" />
              <span>Portail Clinique (Connexion) →</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Mission & Emergency Problem Solved */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#0B3C5D] text-xs font-bold">
                <Globe2 className="w-4 h-4 text-[#1E88E5]" />
                <span>Plateforme Hospitalière Interconnectée • DARÔ Santé</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>Urgence Vitale QR</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-[#0B3C5D] tracking-tight leading-tight">
              Un réseau connecté pour les cliniques et hôpitaux, centré sur le{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-sky-600">
                QR Code Vital DARÔ
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              DARÔ fédère les hôpitaux et cliniques au sein d'une infrastructure cloisonnée : chaque établissement gère
              son propre personnel, ses consultations et ses flux, tout en assurant l'interopérabilité vitale
              grâce au Pass Santé QR DARÔ.
            </p>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Ce que le QR Code révèle instantanément en cas d'accident :
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="p-1.5 rounded-lg bg-rose-100 text-rose-700 font-black text-xs">O-</span>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Groupe Sanguin</p>
                    <p className="text-[11px] text-slate-500">Transfusion immédiate sécurisée</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700 font-bold text-xs">⚠️</span>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Allergies Sévères</p>
                    <p className="text-[11px] text-slate-500">Pénicilline, AINS, anesthésiques</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="p-1.5 rounded-lg bg-teal-100 text-teal-700 font-bold text-xs">📞</span>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Contact d'Urgence</p>
                    <p className="text-[11px] text-slate-500">Appel direct de la famille</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenScanner}
                id="landing-scan-qr-btn"
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#0B3C5D] hover:bg-[#1E88E5] text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer"
              >
                <QrCode className="w-5 h-5 text-teal-300" />
                <span>Scanner un QR Code d'Urgence</span>
              </button>

              <button
                onClick={() => navigateToLogin('login')}
                id="landing-staff-btn"
                className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition cursor-pointer"
              >
                <Lock className="w-4 h-4 text-white" />
                <span>Connexion Clinique (Mode Staff)</span>
              </button>

              <button
                onClick={() => navigateToLogin('espace_sante')}
                id="landing-patient-space-btn"
                className="flex items-center gap-2 px-4 py-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-xs transition cursor-pointer"
              >
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Espace Patient Citoyen (Connexion) →</span>
              </button>
            </div>
          </div>

          {/* Right: Live Interactive Card Preview & Simulation */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl bg-gradient-to-br from-[#0B3C5D] via-[#0E4971] to-[#0B3C5D] p-6 text-white shadow-2xl border border-teal-500/30 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <Logo size="md" lightMode={true} />
                <span className="px-2.5 py-1 rounded-full bg-teal-400/20 text-teal-300 text-[10px] font-mono font-bold tracking-widest border border-teal-400/30">
                  CARTE VITALE QR
                </span>
              </div>

              {/* Patient Badge Demo */}
              <div className="mt-5 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={africanPatientId}
                    alt="Patient tchadien Ousmane"
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-white/40 shadow"
                  />
                  <div>
                    <span className="text-[10px] text-teal-300 font-mono">NDJ-2025-0812</span>
                    <h4 className="text-base font-bold text-white leading-tight">Ousmane Abdelkerim</h4>
                    <p className="text-xs text-slate-300">34 ans • Clinique Espoir (Sabangali)</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-[10px] text-slate-300">Groupe Sanguin</p>
                    <p className="text-lg font-black text-rose-400">O RHD Négatif (O-)</p>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-[10px] text-slate-300">Allergie Vitale</p>
                    <p className="text-xs font-bold text-amber-300">Pénicilline (Choc sévère)</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-400/30 text-xs text-rose-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-300" />
                  <span>Drépanocytose SS connue • Risque crise vaso-occlusive</span>
                </div>

                {/* Instant Try Button */}
                <button
                  onClick={() => handleSimulateEmergencyScan('DARO-QR-OUSMANE-ABDELKERIM-NDJ-0812')}
                  className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-[#0B3C5D] text-xs font-black shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Tester le scan de cette fiche d'urgence</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[11px] text-slate-400 text-center mt-4">
                Chaque patient du réseau DARÔ dispose de son pass vitale dématérialisé et physique.
              </p>
            </div>
          </div>
        </div>

        {/* Network Establishments Section */}
        <section className="mt-16 pt-10 border-t border-slate-200">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-[#1E88E5] text-xs font-bold uppercase tracking-wider">
                <Building2 className="w-4 h-4" />
                <span>Réseau Médical Interconnecté</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0B3C5D] mt-1">
                Établissements de Santé Partenaires
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                Chaque hôpital ou clinique opère avec un environnement de données strictement étanche.
                Les soignants ne voient que les patients de leur propre structure.
              </p>
            </div>

            <button
              onClick={() => navigateToLogin('login')}
              className="px-4 py-2 rounded-xl bg-[#0B3C5D] hover:bg-[#1E88E5] text-white text-xs font-bold flex items-center gap-2 shadow-xs flex-shrink-0 cursor-pointer"
            >
              <Lock className="w-4 h-4 text-sky-400" />
              <span>Connexion Administrateur Réseau</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {etablissements.map(etab => {
              const isActif = etab.statut === 'actif';
              return (
                <div
                  key={etab.id}
                  className={`p-5 rounded-2xl bg-white border transition-all ${
                    isActif
                      ? 'border-slate-200 shadow-xs hover:shadow-md hover:border-[#1E88E5]/40'
                      : 'border-slate-200 opacity-60 bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1E88E5] flex items-center justify-center font-bold">
                      <Hospital className="w-5 h-5" />
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActif ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {isActif ? 'Actif' : 'Suspendu'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    {etab.nom}
                  </h3>
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{etab.ville}</span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="capitalize text-slate-500 font-medium">
                      {etab.type === 'hopital' ? 'Hôpital Régional' : 'Clinique Privée'}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedEtablissementId(etab.id);
                        navigateToLogin('login');
                      }}
                      className="text-[#1E88E5] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Lock className="w-3 h-3" />
                      <span>Connexion →</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3 Pillars Section */}
        <section className="mt-16 pt-10 border-t border-slate-200">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl font-black text-[#0B3C5D]">Une Gestion Clinique Complète & Efficace</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Conçue pour la performance clinique : connectivité flexible, triage rapide, et continuité des soins.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Triage Médical Intégré</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dès l'arrivée au guichet, l'infirmier mesure les constantes vitales, qualifie l'urgence (Normal, Urgent, Critique)
                et oriente instantanément vers le médecin adéquat.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
                <FileBadge className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Dossier Médical Sécurisé</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Consultations, ordonnances électroniques, prescription d'examens (Laboratoire et Imagerie) avec notifications
                automatiques en cascade à chaque étape.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Cloisonnement & Rôles Multi-Niveaux</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Cloisonnement strict par établissement. Super Administrateur réseau pour l'opérateur, Directeur et personnel
                médical dédiés pour chaque structure.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="text-[11px]">© 2025 DARÔ Santé • Système d'Information Hospitalier & Carte Vitale QR Privée.</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Urgences H24</span>
            <span>Cloisonnement des Données</span>
            <button
              onClick={() => navigateToLogin('login')}
              className="font-bold text-amber-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Lock className="w-3 h-3" />
              <span>Connexion Super Admin</span>
            </button>
            <button
              onClick={() => navigateToLogin('login')}
              className="font-bold text-[#0B3C5D] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Lock className="w-3 h-3" />
              <span>Connexion Clinique</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

