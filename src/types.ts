export type UserRole =
  | 'superadmin'
  | 'directeur'
  | 'gestionnaire'
  | 'medecin'
  | 'infirmier'
  | 'accueil'
  | 'responsable_soins'
  | 'tech_laboratoire'
  | 'tech_imagerie'
  | 'pharmacien'
  | 'caissier'
  | 'patient';

export interface Etablissement {
  id: string;
  nom: string;
  code: string; // e.g. "CME-01", "HGRN-02", "CHRM-03"
  type: 'hopital' | 'clinique' | 'centre_sante' | 'cabinet';
  ville: string;
  pays: string;
  adresse: string;
  telephone: string;
  email: string;
  logo?: string;
  directeurNom: string;
  directeurEmail: string;
  statut: 'actif' | 'suspendu';
  dateCreation: string;
  totalPatients?: number;
  totalConsultations?: number;
}

export type UserAccountStatus = 'actif' | 'desactive' | 'en_attente';

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  nomUtilisateur?: string; // e.g. "fred.mbai", "directeur", "dr.djibrine"
  motDePasse?: string;     // Workstation password
  motDePasseModifie?: boolean; // Indique si le mot de passe par défaut a été modifié
  dateDerniereModifMDP?: string;
  role: UserRole;
  specialite?: string;
  telephone: string;
  avatar: string;
  actif: boolean;
  statut?: UserAccountStatus | 'suspendu';
  dateCreation: string;
  etablissementId?: string;
  etablissementNom?: string;
  motDePasseReinitialise?: boolean;
  derniereConnexion?: string;
  posteActif?: string;
  signatureElectronique?: string; // Signature tactile enregistrée (DataURL PNG)
  dateDerniereSignature?: string;
}

export interface WorkstationSession {
  id: string;
  userId: string;
  userNom: string;
  userPrenom: string;
  userRole: UserRole;
  userAvatar: string;
  posteId: string;
  posteNom: string;
  etablissementId: string;
  etablissementNom: string;
  heureConnexion: string;
  derniereActivite: string;
  adresseIP: string;
  statut: 'actif' | 'verrouille' | 'deconnecte';
}

export interface LoginLogEntry {
  id: string;
  timestamp: string;
  timestampFormatted: string;
  userId?: string;
  identifiantSaisi: string;
  userNom: string;
  userRole?: UserRole;
  userAvatar?: string;
  posteNom: string;
  etablissementId?: string;
  etablissementNom?: string;
  succes: boolean;
  motif?: string;
  adresseIP: string;
}

export type UrgencyLevel = 'normal' | 'urgent' | 'critique';

export type QueueStatus =
  | 'en_attente'     // Just arrived at reception
  | 'triage_fait'    // Triaged by nurse, assigned to doctor
  | 'en_consultation'// In room with doctor
  | 'examens_requis' // Doctor requested lab or imaging
  | 'termine'        // Consultation finished
  | 'annule';

export interface QueueTicket {
  id: string;
  ticketNumero: string; // e.g. "DAR-042"
  patientId: string;
  patientNom: string;
  patientPrenom: string;
  patientAge: number;
  patientSexe: 'M' | 'F';
  heureArrivee: string;
  statut: QueueStatus;
  niveauUrgence?: UrgencyLevel;
  priorite?: UrgencyLevel;
  orienteVersMedecinId?: string;
  orienteVersMedecinNom?: string;
  infirmierTriageId?: string;
  infirmierTriageNom?: string;
  signesVitaux?: {
    temperature: number; // in °C (e.g. 38.5)
    tension: string;     // e.g. "12/8"
    pouls: number;       // bpm
    saturationO2: number;// %
    glycemie?: number;   // g/L
    notesTriage?: string;
  };
  constantesVitales?: {
    temperature: number;
    tension: string;
    pouls: number;
    saturationO2: number;
    glycemie?: number;
    notesTriage?: string;
  };
  motifArrivee: string;
  etablissementId?: string;
  etablissementNom?: string;
}

export interface Vaccination {
  id: string;
  nomVaccin: string;
  dateAdministration: string;
  dose: string;
  prochainRappel?: string;
  lot?: string;
  centreVaccination: string;
  professionnelNom?: string;
}

export interface DocumentMedical {
  id: string;
  titre: string;
  type: 'radiographie' | 'scanner' | 'irm' | 'echographie' | 'ecg' | 'analyse_bio' | 'rapport_medical' | 'autre';
  dateDocument: string;
  etablissementSource: string;
  medecinEmetteur?: string;
  fichierNom: string;
  tailleKo?: number;
  description?: string;
  urlApercu?: string;
}

export interface MesureBiometrique {
  id: string;
  date: string;
  poidsKg: number;
  tailleCm: number;
  imc: number;
  tension?: string;
  glycemie?: number;
  tourTailleCm?: number;
  notes?: string;
}

export interface AssuranceInfo {
  adherent: boolean; // true si le patient bénéficie d'une assurance active
  organisme: string; // ex: 'CNPS Tchad', 'Ascoma Tchad Assurances', 'Gras Savoye / Sanlam Tchad', 'Al Wafa Assurance Tchad', 'Bon SHT Pétrole', 'Autre Mutuelle'
  numeroPolice?: string; // ex: 'POL-NDJ-2025-8849'
  matriculeAssure?: string; // ex: 'CNPS-77402-A'
  tauxCouverture: number; // e.g. 80 pour 80% (Ticket modérateur 20%)
  qualiteAssure: 'assure_principal' | 'conjoint' | 'enfant' | 'autre';
  nomAssurePrincipal?: string; // Si ayant-droit
  dateValidite?: string; // e.g. '2026-12-31'
  statutPriseEnCharge?: 'valide' | 'en_attente_accord' | 'plafond_atteint' | 'expire';
  plafondAnnuelFCFA?: number;
  montantConsommeFCFA?: number;
  tauxPharmacie?: number; // e.g. 70
  tauxExamens?: number; // e.g. 80
  tauxHospitalisation?: number; // e.g. 90
  contactAssureurTel?: string;
  attestationUrl?: string;
}

export interface Patient {
  id: string;
  matricule: string;     // e.g. "NDJ-2025-0812"
  qrToken: string;       // unique token for QR code URL
  nom: string;
  prenom: string;
  dateNaissance: string;
  age: number;
  sexe: 'M' | 'F';
  telephone: string;
  email?: string;
  adresse: string;       // e.g. "Quartier Sabangali, N'Djamena"
  quartier?: string;     // e.g. "Sabangali", "Chagoua", "Farcha", "Moursal", etc.
  avatar?: string;
  etablissementId?: string;
  etablissementNom?: string;
  
  // Couverture Médicale & Assurance Santé (Tiers-Payant Tchad)
  assurance?: AssuranceInfo;
  
  // Données vitales d'urgence (visibles directement via QR code public)
  groupeSanguin: GroupeSanguin;
  electrophoreseHb?: 'AA' | 'AS' | 'SS' | 'AC' | 'SC' | 'Inconnu' | 'Non dépisté' | string; // Diagnostic drépanocytose Tchad
  allergies: string[];         // e.g. ["Pénicilline", "Arachide", "AINS"]
  maladiesChroniques: string[];// e.g. ["Drépanocytose SS", "Diabète Type 2", "Asthme sévère"]
  contactUrgenceNom?: string;   // e.g. "Brahim Mahamat (Frère)"
  contactUrgenceTel?: string;   // e.g. "+235 66 12 34 56"
  contactUrgenceRelation?: string;
  
  // Constantes biométriques de base & Suivi physique
  poids?: number;
  taille?: number;
  imc?: number;
  tensionHabituelle?: string;
  glycemieHabituelle?: number;

  // Dossiers cliniques spécialisés
  vaccinations?: Vaccination[];
  documentsMedicaux?: DocumentMedical[];
  mesuresBiometriques?: MesureBiometrique[];
  antecedentsMedicaux?: string[];
  antecedentsChirurgicaux?: string[];
  antecedentsFamiliaux?: string[];
  habitudesVie?: string[];

  // Soignants assignés
  medecinTraitantId?: string;
  infirmierReferentId?: string;
  
  // Information strictement confidentielle (Directeur / Médecin uniquement)
  secretMedical?: string;
  
  // Identifiants d'accès Espace Patient
  motDePasse?: string;
  codePin?: string;
  motDePasseModifie?: boolean;
  dateDerniereModifMDP?: string;

  dateEnregistrement: string;
}

export interface Consultation {
  id: string;
  date: string;
  patientId: string;
  patientNom: string;
  medecinId: string;
  medecinNom: string;
  motif: string;
  symptomes: string;
  diagnostic: string;
  notesMedicales: string;
  observations?: string;
  ordonnanceId?: string;
  prescriptionItems?: PrescriptionItem[];
  examenIds?: string[];
  examenPrescritId?: string;
  suiviRecommande?: string;
  temperature?: number;
  tension?: string;
  patientSexe?: string;
  patientAge?: number;
  patientQuartier?: string;
  actionApresDiagnostic?: string;
  signatureElectronique?: string;
  etablissementId?: string;
  etablissementNom?: string;
}

export type VoieAdministration =
  | 'orale'
  | 'intraveineuse'
  | 'intramusculaire'
  | 'sous_cutanee'
  | 'cutanee'
  | 'rectale'
  | 'inhalee'
  | 'oculaire'
  | 'auriculaire'
  | 'sublinguale';

export interface PrescriptionItem {
  medicament: string;
  forme?: string; // e.g. "Comprimé 500mg", "Sirop", "Injectable"
  voie?: string; // e.g. "Voie Orale (PO)", "Intraveineuse (IV)", "Intramusculaire (IM)"
  posologie: string; // e.g. "1 cp matin et soir pendant les repas"
  duree: string; // e.g. "5 jours"
  quantite?: number;
  medicamentId?: string;
  instructions?: string;
}

export interface Ordonnance {
  id: string;
  numero: string; // e.g. "ORD-2025-104"
  date: string;
  dateConsultation?: string;
  patientId: string;
  patientNom: string;
  patientAge: number;
  patientSexe?: string; // e.g. "Masculin" | "Féminin"
  patientQuartier?: string; // e.g. "Sabangali", "Chagoua", etc.
  motifConsultation?: string; // Motif clinique
  diagnostic?: string; // Diagnostic médical posé
  actionApresDiagnostic?: string; // Conduite à tenir / action post-diagnostic
  medecinId: string;
  medecinNom: string;
  medecinSpecialite: string;
  items: PrescriptionItem[];
  instructionsParticulieres?: string;
  statutDispensation: 'non_delivree' | 'partiellement_delivree' | 'delivree';
  etablissementId?: string;
  etablissementNom?: string;
  // Electronic Signature
  signatureElectronique?: string; // Image base64 de la signature tactile
  dateSignature?: string;
  signeElectroniquement?: boolean;
  signataireNom?: string;
  signataireRole?: string;
}

export type ExamType =
  | 'laboratoire'
  | 'imagerie'
  | 'cardiologie'
  | 'cardiologie_exploration'
  | 'endoscopie'
  | 'anatomopathologie'
  | 'ophtalmo_orl'
  | 'autre';
export type ExamStatus = 'prescrit' | 'en_cours' | 'valide' | 'annule';

export interface Examen {
  id: string;
  numero: string; // e.g. "EXA-LAB-089"
  datePrescription: string;
  type: ExamType;
  natureExamen?: string; // e.g. "Laboratoire", "Imagerie", "Explorations Fonctionnelles", etc.
  nomExamen: string; // e.g. "Goutte Épaisse & Frottis (Paludisme)" or "Radiographie Thorax Face"
  patientId: string;
  patientNom: string;
  patientSexe?: string;
  patientAge?: number;
  patientQuartier?: string;
  medecinPrescripteurId: string;
  medecinPrescripteurNom: string;
  indicationClinique: string;
  statut: ExamStatus;
  technicienId?: string;
  technicienNom?: string;
  dateRealisation?: string;
  resultats?: string; // Text findings or structured values
  conclusion?: string;
  valeursAnormales?: boolean;
  // Aliases for UI flexibility
  anormal?: boolean;
  indications?: string;
  prescripteurNom?: string;
  resultat?: string;
  valeursNormales?: string;
  dateResultat?: string;
  etablissementId?: string;
  etablissementNom?: string;
  // Electronic Signature
  signatureElectronique?: string; // Image base64 de la signature tactile
  dateSignature?: string;
  signeElectroniquement?: boolean;
  signataireNom?: string;
  signataireRole?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientNom: string;
  patientTelephone?: string;
  medecinId: string;
  medecinNom: string;
  date: string; // YYYY-MM-DD
  heure: string; // HH:MM
  motif: string;
  type: 'presentiel' | 'teleconsultation';
  statut: 'programme' | 'en_cours' | 'termine' | 'annule';
  lienTeleconsultation?: string;
  etablissementId?: string;
  etablissementNom?: string;
}

export interface Medication {
  id: string;
  code: string;
  nom: string;
  dosage: string;
  forme: string;
  quantiteEnStock: number;
  seuilAlerte: number;
  prixUnitaireFCFA: number;
  categorie: string;
  lotNumero: string;
  datePeremption: string;
  unite?: string;
  dateExpiration?: string;
  lot?: string;
  etablissementId?: string;
  etablissementNom?: string;
}

export interface InvoiceItem {
  description: string;
  quantite: number;
  prixUnitaireFCFA?: number;
  prixUnitaire?: number;
  totalFCFA?: number;
  total?: number;
}

export interface Invoice {
  id: string;
  numero: string; // e.g. "FAC-2025-056"
  date: string;
  patientId: string;
  patientNom: string;
  items: InvoiceItem[];
  totalFCFA: number;
  total?: number;
  statut: 'en_attente' | 'payee' | 'annulee';
  modePaiement?: 'Especes' | 'AirtelMoney' | 'MoovMoney' | 'CarteBancaire' | 'especes' | 'airtel_money' | 'moov_money' | 'carte' | 'tiers_payant' | 'urgence_differee';
  datePaiement?: string;
  etablissementId?: string;
  etablissementNom?: string;

  // Ventilation Tiers-Payant & Prise en charge Assurance
  partAssuranceFCFA?: number; // Montant couvert par la mutuelle/assurance (ex: 80% = 20 000 FCFA)
  partPatientFCFA?: number;   // Ticket modérateur payé par le patient (ex: 20% = 5 000 FCFA)
  organismeAssurance?: string; // Nom de l'assureur (CNPS Tchad, Ascoma, Sanlam, etc.)
  tauxCouvertureApplique?: number; // Pourcentage pris en charge (ex: 80)
  numeroPriseEnCharge?: string; // Référence du bon de prise en charge (PEC)
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderNom: string;
  senderRole: UserRole;
  receiverId?: string; // for direct message or patient message
  channel?: string;    // e.g. "urgences-gardes" or "staff-general"
  texte: string;
  timestamp: string;
  estPatientChat?: boolean;
  patientId?: string;
  staffId?: string;    // staff member involved in patient conversation
  lu?: boolean;        // read indicator
  etablissementId?: string;
}

export interface CareAssignment {
  id: string;
  patientId: string;
  patientNom: string;
  patientMatricule?: string;
  staffId: string;
  staffNom: string;
  staffRole: UserRole;
  roleAssignation?: string;
  dateAssignation: string;
  motif?: string;
  notes?: string;
  actif: boolean;
  etablissementId?: string;
}

export interface Notification {
  id: string;
  titre: string;
  message: string;
  timestamp: string;
  lu: boolean;
  destinataireRole?: UserRole;
  destinataireUserId?: string;
  type: 'triage' | 'consultation' | 'examen_prescrit' | 'examen_pret' | 'pharmacie_alerte' | 'systeme';
  cibleModule?: string; // module to navigate to, e.g. "queue", "consultations", "examens"
  cibleId?: string;
  etablissementId?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  timestampFormatted?: string;
  userId: string;
  userNom: string;
  userRole: UserRole;
  action: string;
  details: string;
  adresseIP: string;
  etablissementId?: string;
  etablissementNom?: string;
}

export interface QRAccessLog {
  id: string;
  timestamp: string;
  timestampFormatted?: string;
  patientId: string;
  patientNom: string;
  patientMatricule?: string;
  qrToken: string;
  scanneParNom?: string;
  scanneParRole?: string;
  scannePar?: string;
  agentNom?: string;
  agentRole?: string;
  action?: string;
  typeAcces: 'public_urgence' | 'dossier_deverrouille';
  succes: boolean;
  tentativeEmail?: string;
  ip: string;
  localisation: string; // e.g. "N'Djamena (Moursal)"
  navigateurAppareil: string;
  etablissementId?: string;
  etablissementNom?: string;
}

// Convenience Type Aliases
export type GroupeSanguin = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Inconnu' | 'Non déterminé';
export type Facture = Invoice;
export type PaymentMethod = 'Especes' | 'AirtelMoney' | 'MoovMoney' | 'CarteBancaire' | 'especes' | 'airtel_money' | 'moov_money' | 'carte' | 'tiers_payant' | 'urgence_differee';
export type MedicationItem = PrescriptionItem;
export type MedicationStock = Medication;
export type ExamenPrescrit = Examen;
export type UrgenceLevel = UrgencyLevel;
export interface VitalSigns {
  temperature: number;
  tension: string;
  pouls: number;
  saturationO2: number;
  glycemie?: number;
  notesTriage?: string;
}

// ==========================================
// ANNUAIRE NATIONAL DES EXAMENS & PHARMACIES
// ==========================================

export interface ExamDirectoryFacility {
  id: string;
  etablissementNom: string;
  type: 'hopital' | 'clinique' | 'laboratoire_prive' | 'centre_imagerie';
  ville: string;
  quartier: string;
  adresse: string;
  telephone: string;
  prixFCFA: number;
  delaiResultatHeures: string;
  disponibilite: 'disponible_immediat' | 'sur_rdv_24h' | 'indisponible_maintenance';
  equipementMarque?: string;
  ouvertAujourdhui?: string;
}

export interface ExamDirectoryItem {
  id: string;
  nom: string;
  nature: ExamType;
  natureLabel: string;
  description: string;
  conditionsPreparation?: string;
  motsCles: string[];
  centresDisponibles: ExamDirectoryFacility[];
}

export interface PharmacyStockOffer {
  id: string;
  pharmacieNom: string;
  ville: string;
  quartier: string;
  adresse: string;
  telephone: string;
  disponibilite: 'en_stock' | 'stock_limite' | 'rupture';
  quantiteEstimee: number;
  prixFCFA: number;
  ouvert24h: boolean;
  pharmacieDeGarde: boolean;
  horairesOuverture: string;
}

export interface MedicationDirectoryItem {
  id: string;
  nomCommercial: string;
  dci: string;
  dosage: string;
  forme: string;
  classeTherapeutique: string;
  prixOfficielFCFA: number;
  necessiteOrdonnance: boolean;
  officinesDisponibles: PharmacyStockOffer[];
}

// ==========================================
// SAAS BUSINESS MODEL & ABONNEMENTS CLINIQUES
// ==========================================

export type SubscriptionPlanTier = 'quartier_essentiel' | 'clinique_pro' | 'hopital_chu';

export interface SubscriptionPlan {
  id: string;
  tier: SubscriptionPlanTier;
  nom: string;
  prixMensuelFCFA: number;
  maxPraticiens: number | 'illimite';
  maxDossiersPatients: number | 'illimite';
  teleconsultationIllimitee: boolean;
  sauvegardeCloudHDS: boolean;
  supportPrioritaire: string;
  description: string;
  fonctionnalites: string[];
}

export interface SubscriptionInvoice {
  id: string;
  numero: string;
  dateEmission: string;
  periodeMois: string;
  montantFCFA: number;
  statut: 'payee' | 'en_attente' | 'echue';
  moyenPaiement: string;
  datePaiement?: string;
  recuNumero?: string;
}

export interface ClinicSubscription {
  id: string;
  etablissementId: string;
  etablissementNom: string;
  planId: string;
  planNom: string;
  prixMensuelFCFA: number;
  statut: 'actif' | 'en_attente_paiement' | 'suspendu' | 'essai';
  dateDebut: string;
  dateProchaineEcheance: string;
  modePaiementPrefere: 'airtel_money' | 'moov_money' | 'virement_bancaire' | 'especes';
  referencePaiementDernier?: string;
  historiqueFactures: SubscriptionInvoice[];
}

// ==========================================
// INTEROPÉRABILITÉ & RÉSEAU INTER-HÔPITAUX (DMP TCHAD)
// ==========================================

export type StatutTransfertHopital =
  | 'en_attente_accord'
  | 'accepte_en_route'
  | 'patient_admis'
  | 'refuse'
  | 'cloture';

export type DegreUrgenceTransfert =
  | 'vital_immediat' // SAMU 15 / Défaillance vitale
  | 'urgent'         // Moins de 2h
  | 'programme';     // Évacuation ou consultation spécialisée

export interface TransfertInterHopital {
  id: string;
  numero: string; // e.g. "TRF-2025-001"
  dateDemande: string;
  dateTransfert?: string;
  patientId: string;
  patientNom: string;
  patientMatricule: string;
  patientAge: number;
  patientSexe: 'M' | 'F';
  patientGroupeSanguin: string;
  patientAllergies: string[];
  etablissementSourceId: string;
  etablissementSourceNom: string;
  etablissementDestId: string;
  etablissementDestNom: string;
  medecinEmetteurId: string;
  medecinEmetteurNom: string;
  medecinRecepteurNom?: string;
  motifTransfert: string; // e.g. "Plateau technique insuffisant - Besoin scanner IRM et Réanimation adulte"
  degreUrgence: DegreUrgenceTransfert;
  moyenTransport: 'ambulance_samu15' | 'ambulance_privee' | 'vehicule_famille';
  syntheseClinique: string;
  statut: StatutTransfertHopital;
  observationsDestinataire?: string;
  examensTransmis?: string[];
  ordonnancesTransmises?: string[];
}

// ==========================================
// FORTERESSE DE SÉCURITÉ DARÔ & CYBERSÉCURITÉ
// ==========================================

export type SecurityThreatType =
  | 'brute_force'
  | 'injection_attempt'
  | 'unauthorized_access'
  | 'privilege_escalation'
  | 'tampering_attempt'
  | 'session_hijack_attempt'
  | 'dos_flood';

export type SecurityThreatSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface SecurityAlert {
  id: string;
  timestamp: string;
  type: SecurityThreatType;
  severity: SecurityThreatSeverity;
  source: string; // e.g. "IP: 192.168.1.42 (Poste Accueil #2)"
  targetIdentifiant?: string;
  details: string;
  blocked: boolean;
  actionTaken: string; // e.g. "Requête bloquée immédiatement. Verrouillage IP 3 min."
}

export interface SecurityShieldState {
  score: number; // 0 - 100%
  firewallActive: boolean;
  bruteForceShieldActive: boolean;
  antiTamperActive: boolean;
  zeroTrustFirestoreActive: boolean;
  xssSanitizerActive: boolean;
  totalThreatsBlocked: number;
  activeLockouts: number;
  lastScanTime: string;
  lockdownMode: boolean; // Si activé, verrouillage renforcé immédiat
}

// -------------------------------------------------------------
// MODULE STRATÉGIQUE ÉDITEUR : MONÉTISATION & REDEVANCE DARÔ
// -------------------------------------------------------------
export interface RedevanceConfig {
  commissionPourcentageActes: number; // e.g. 10%
  forfaitMensuelParEtablissementFCFA: number; // e.g. 250 000 FCFA
  fraisParDossierPatientQRFCFA: number; // e.g. 500 FCFA
  fraisParConsultationFCFA: number; // e.g. 1 000 FCFA
  tauxMargeEstimeeHopital: number; // e.g. 22% (Marge nette typique d'un hôpital après charges lourdes)
  modeHegemonieAutomatique: boolean; // Indexation dynamique pour être au-dessus de l'hôpital le plus rentable
  pourcentageSurpasserHopitalMax: number; // e.g. +12% au-dessus
}

export interface FailleIncident {
  id: string;
  date: string;
  etablissementId: string;
  etablissementNom: string;
  type: 'securite' | 'posologie' | 'reseau' | 'facturation' | 'identitovigilance';
  titre: string;
  description: string;
  impactEvite: string;
  statut: 'bloque_avec_succes' | 'alerte_interceptee' | 'resorbe_automatiquement';
  recommandationAmelioration: string;
}

export interface AvantageMesure {
  id: string;
  domaine: 'temps_attente' | 'securite_financiere' | 'zero_perte_dossier' | 'tiers_payant' | 'qualite_soins';
  titre: string;
  chiffreCle: string;
  comparatifAvantApres: string;
  explication: string;
}

