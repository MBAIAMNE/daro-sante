import React, { useState } from 'react';
import {
  BookOpen,
  Shield,
  ShieldCheck,
  Search,
  ChevronRight,
  Heart,
  Activity,
  Stethoscope,
  FileText,
  Clock,
  Pill,
  CreditCard,
  Building2,
  Users,
  Printer,
  X,
  AlertTriangle,
  QrCode,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Download,
  Share2,
  Sparkles,
} from 'lucide-react';

interface UserGuideBookViewProps {
  onClose?: () => void;
  isModal?: boolean;
}

interface Chapter {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  category: 'securite' | 'clinique' | 'logistique' | 'administration';
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  summary: string;
  sections: {
    title: string;
    content: string[];
    tips?: string[];
    warnings?: string[];
  }[];
}

const CHAPTERS: Chapter[] = [
  {
    id: 'ch-securite',
    number: 'Chapitre 1',
    title: 'Architecture & Forteresse de Sécurité DARÔ',
    subtitle: 'Chiffrement, Habilitations Médicales, Bouclier Anti-Intrusion & Confidentialité',
    category: 'securite',
    badge: 'Protection Maximale',
    icon: Shield,
    summary:
      'Ce chapitre détaille les mécanismes de défense cybernétique intégrés au système pour garantir l’inviolabilité du secret médical et parer toute attaque informatique dans les établissements de santé au Tchad.',
    sections: [
      {
        title: '1.1 Authentification Forte & Habilitations par Rôles (RBAC)',
        content: [
          'Chaque soignant dispose d’un compte strictement personnel avec un rôle précis : Médecin, Infirmier de triage, Laborantin, Radiologue, Pharmacien, Caissier ou Directeur.',
          'Le principe du moindre privilège est appliqué : un caissier n’a jamais accès au secret médical (observations, diagnostics), et un soignant ne peut modifier les écritures comptables de la caisse.',
          'Chaque soignant est rattaché à son établissement d’exercice. L’accès aux dossiers médicaux d’autres cliniques privées ou hôpitaux est strictement cloisonné pour empêcher l’espionnage concurrentiel.',
        ],
        tips: [
          'Ne partagez jamais vos identifiants ou votre code PIN avec un collègue.',
          'Verrouillez systématiquement votre poste en cliquant sur le cadenas en haut à droite dès que vous quittez votre bureau.',
        ],
      },
      {
        title: '1.2 Bouclier Anti-Brute Force & Verrouillage Automatique',
        content: [
          'Le système intègre un détecteur d’intrusion actif : après 5 tentatives infructueuses consécutives, le terminal est consigné pendant 60 secondes avec génération automatique d’un rapport d’incident dans le journal d’audit.',
          'Toutes les requêtes frauduleuses sont neutralisées avant d’atteindre les serveurs Cloud de données médicales.',
        ],
        warnings: [
          'En cas de mot de passe oublié, demandez au Directeur Médical de votre établissement ou au Super Administrateur de réinitialiser votre accès en toute conformité.',
        ],
      },
      {
        title: '1.3 Journalisation d’Audit Inviolable (Traçabilité Totale)',
        content: [
          'Chaque ouverture de dossier, chaque validation de prescription et chaque scan de QR code est horodaté à la seconde avec le nom du praticien et le poste utilisé.',
          'La direction hospitalière peut auditer à tout moment les consultations de dossiers pour prouver la non-divulgation des données de santé (conformité CNIL/ANIE Tchad).',
        ],
      },
    ],
  },
  {
    id: 'ch-accueil',
    number: 'Chapitre 2',
    title: 'Accueil, Enregistrement & Pass Santé National',
    subtitle: 'Création de Dossier, Attribution du Matricule & Carte Vitale QR Code',
    category: 'clinique',
    badge: 'Entrée Patient',
    icon: QrCode,
    summary:
      'Procédure normalisée pour accueillir un patient, rechercher ses antécédents, ouvrir son Dossier Médical Partagé (DMP) et générer son Pass Santé avec QR Code d’urgence.',
    sections: [
      {
        title: '2.1 Première Visite & Recherche Nationale',
        content: [
          'À l’arrivée du patient au guichet d’accueil, l’agent saisit son nom, son numéro de téléphone (+235) ou scanne son Pass Santé QR Code.',
          'Si le patient est déjà enregistré dans le réseau national DARÔ, son dossier s’affiche instantanément avec ses allergies, son groupe sanguin et ses antécédents, évitant les doublons.',
          'Si le patient est nouveau, l’agent crée son dossier en moins de 60 secondes en renseignant son état civil, son contact d’urgence et son quartier de résidence (ex: Chagoua, Dembé, Farcha, Sabangali).',
        ],
      },
      {
        title: '2.2 Génération & Remise du Pass Santé Citoyen',
        content: [
          'Dès l’enregistrement validé, le système génère un matricule national unique (ex: PAT-TCD-2025-001) et un QR Code d’urgence personnel.',
          'Ce QR Code embarque les constantes vitales en mode autonome : un secouriste ou médecin urgentiste peut le scanner même sans connexion Internet pour connaître le groupe sanguin et les contre-indications.',
          'Le patient peut enregistrer son Pass Santé sur son smartphone ou recevoir sa carte imprimée.',
        ],
        tips: [
          'Encouragez les patients drépanocytaires ou allergiques à toujours porter leur Pass Santé sur eux.',
        ],
      },
    ],
  },
  {
    id: 'ch-triage',
    number: 'Chapitre 3',
    title: 'Module de Triage & Urgences Vitales',
    subtitle: 'Évaluation Infirmière, Constantes Vitales & Échelle de Gravité U1 à U5',
    category: 'clinique',
    badge: 'Urgences',
    icon: Activity,
    summary:
      'Méthode opérationnelle du poste de triage infirmier pour mesurer les paramètres vitaux, classifier la priorité médicale et orienter immédiatement le patient vers la salle de soins adéquate.',
    sections: [
      {
        title: '3.1 Prise des Paramètres Vitaux Systématique',
        content: [
          'Dès son admission, l’infirmier mesure et renseigne dans l’application :',
          '• Tension artérielle (ex: 12/8 mmHg)',
          '• Fréquence cardiaque (Pouls en bpm)',
          '• Température corporelle (en °C - recherche de pic fébrile / paludisme)',
          '• Saturation en oxygène (SpO2 en %)',
          '• Poids et glycémie capillaire si suspicion métabolique',
        ],
      },
      {
        title: '3.2 Classification Internationale de Gravité (U1 à U5)',
        content: [
          'L’infirmier attribue la priorité qui dicte l’ordre d’appel sur la console médicale :',
          '• U1 - Urgence Vitale Absolue (Arrêt cardiorespiratoire, coma, détresse respiratoire aiguë) -> Prise en charge immédiate 0 min.',
          '• U2 - Urgence Très Grave (Hémorragie active, douleur thoracique, convulsions) -> Prise en charge < 10 min.',
          '• U3 - Urgence Relative (Fractures fermées, céphalées intenses fébriles) -> Prise en charge < 30 min.',
          '• U4 - Consultation Rapide (Plaie simple, syndrome grippal sans détresse) -> Prise en charge < 60 min.',
          '• U5 - Consultation Non Urgente (Renouvellement ordonnance, certificat) -> Selon la file normale.',
        ],
        warnings: [
          'Un patient U1 ou U2 déclenche une notification sonore et visuelle prioritaire sur tous les écrans des médecins de garde.',
        ],
      },
    ],
  },
  {
    id: 'ch-consultation',
    number: 'Chapitre 4',
    title: 'Consultation Médicale & Dossier Patient',
    subtitle: 'Diagnostic, Examen Clinique, Antécédents & Téléconsultation',
    category: 'clinique',
    badge: 'Praticien',
    icon: Stethoscope,
    summary:
      'Guide pas-à-pas pour le médecin praticien : appel du patient de la file, consultation de l’historique médical, rédaction des observations et orientation.',
    sections: [
      {
        title: '4.1 Appel du Patient & Examen Clinique',
        content: [
          'Le médecin sélectionne le patient prioritaire dans la liste d’attente. L’état du ticket passe automatiquement à "En consultation".',
          'L’écran présente immédiatement : l’âge, le sexe, les allergies connues, l’électrophorèse de l’hémoglobine (AS, SS, AA) et les constantes relevées au triage.',
          'Le médecin consigne le motif de consultation, les symptômes décrits, l’examen physique et son diagnostic médical principal.',
        ],
      },
      {
        title: '4.2 Téléconsultation & Avis Spécialisé Interne',
        content: [
          'Si le patient est à distance (province ou maintien à domicile) ou si un avis confraternel est requis, le praticien peut activer le module de téléconsultation avec visioconférence sécurisée intégrée.',
        ],
      },
    ],
  },
  {
    id: 'ch-prescription',
    number: 'Chapitre 5',
    title: 'Ordonnances Sécurisées & Signature Tactile',
    subtitle: 'Posologies, Conformité Pharmaceutique & Signature au Doigt ou Stylet',
    category: 'clinique',
    badge: 'Prescription',
    icon: FileText,
    summary:
      'Génération d’ordonnances médicales certifiées, contrôle des interactions et signature électronique directement sur écran tactile de smartphone ou tablette.',
    sections: [
      {
        title: '5.1 Rédaction & Contrôle Posologique',
        content: [
          'Le médecin ajoute les médicaments prescrits avec posologie détaillée, fréquence et durée du traitement (ex: Artéméther/Luméfantrine, Paracétamol 1g, Amoxicilline).',
          'Le système avertit automatiquement en cas d’allergie connue enregistrée au dossier du patient.',
        ],
      },
      {
        title: '5.2 Signature Électronique Tactile Inviolable',
        content: [
          'Le praticien appose sa signature directement avec son doigt ou un stylet sur l’écran.',
          'L’ordonnance est scellée numériquement avec horodatage, nom complet du praticien et référence ordonnance.',
          'Elle est immédiatement transmise à la Pharmacie de la clinique pour dispensation rapide et imprimable au format ordonnance officiel.',
        ],
      },
    ],
  },
  {
    id: 'ch-laboratoire',
    number: 'Chapitre 6',
    title: 'Laboratoire d’Analyses & Imagerie Médicale',
    subtitle: 'Prescriptions Biologiques, Saisie des Résultats & Validation Radiologique',
    category: 'logistique',
    badge: 'Analyses & Radio',
    icon: Activity,
    summary:
      'Fonctionnement du pôle médico-technique : exécution des bilans sanguins, parasitologie, biochimie et comptes-rendus d’imagerie.',
    sections: [
      {
        title: '6.1 Réception des Demandes d’Examen',
        content: [
          'Dès que le médecin prescrit une analyse (Goutte épaisse / TDR Paludisme, NFS, Glycémie, Créatinine, Radiographie du thorax), celle-ci apparaît en temps réel sur la console du technicien de laboratoire ou d’imagerie.',
        ],
      },
      {
        title: '6.2 Saisie & Validation des Résultats',
        content: [
          'Le technicien effectue le prélèvement ou le cliché radiologique, saisit les valeurs mesurées et indique si les résultats présentent des anomalies critiques.',
          'Le biologiste valide et signe électroniquement l’examen.',
          'Une notification "Résultats Prêts" alerte immédiatement le médecin traitant dans sa file de consultation.',
        ],
      },
    ],
  },
  {
    id: 'ch-pharmacie',
    number: 'Chapitre 7',
    title: 'Pharmacie Hospitalière & Gestion des Stocks',
    subtitle: 'Dispensation des Ordonnances, Alertes de Rupture & Entrées de Lots',
    category: 'logistique',
    badge: 'Pharmacie',
    icon: Pill,
    summary:
      'Contrôle des stocks de médicaments, prévention des ruptures d’approvisionnement et délivrance sécurisée des produits de santé.',
    sections: [
      {
        title: '7.1 Délivrance des Ordonnances',
        content: [
          'Le pharmacien accède aux ordonnances prescrites et signées par les médecins de la clinique.',
          'Il contrôle la disponibilité en rayon, vérifie les contre-indications et valide la dispensation des boîtes prescrites.',
        ],
      },
      {
        title: '7.2 Gestion des Stocks & Alertes de Seuil Critique',
        content: [
          'L’application calcule en direct les quantités restantes en stock.',
          'Si un médicament essentiel (antipaludéens, antalgiques, antibiotiques de première ligne, solutés de réhydratation) passe sous son seuil d’alerte, un signal visuel rouge s’affiche pour déclencher la commande fournisseur.',
        ],
      },
    ],
  },
  {
    id: 'ch-caisse',
    number: 'Chapitre 8',
    title: 'Caisse & Facturation Multi-Moyens au Tchad',
    subtitle: 'Espèces, Airtel Money, Moov Money Tchad & Quittances Numérotées',
    category: 'administration',
    badge: 'Finances',
    icon: CreditCard,
    summary:
      'Procédure d’encaissement transparent des actes médicaux, consultations, examens et pharmacie, adaptée aux usages monétaires tchadiens.',
    sections: [
      {
        title: '8.1 Émission & Règlement des Factures',
        content: [
          'Chaque acte (consultation, bilan, radio, médicaments) génère une ligne de facturation normalisée en Francs CFA (XAF).',
          'Le caissier encaisse le patient selon 4 modes intégrés :',
          '1. Espèces (avec calcul de monnaie rendu)',
          '2. Airtel Money Tchad (saisie du numéro et référence de transaction)',
          '3. Moov Money Tchad (saisie du numéro et référence de transaction)',
          '4. Tiers-Payant / Prise en Charge (CNPS, Assurances privées ou bons d’entreprise conventionnée)',
        ],
      },
      {
        title: '8.2 Reçus de Caisse & Clôture Journalière',
        content: [
          'Dès l’encaissement validé, une quittance officielle imprimable (format thermique ticket ou A5) est délivrée avec matricule patient et numéro de quittance infalsifiable.',
          'Le journal de caisse enregistre en temps réel le total des recettes de la journée ventilé par mode de paiement.',
        ],
      },
      {
        title: '8.3 Ventilation du Ticket Modérateur en Tiers-Payant',
        content: [
          'Lorsqu’un patient bénéficie d’un accord de prise en charge (ex: 80% CNPS ou Ascoma), la caisse calcule automatiquement la répartition :',
          '• Part Organisme Assureur (ex: 80%) : imputée au compte de l’assureur pour recouvrement ultérieur.',
          '• Ticket Modérateur Patient (ex: 20%) : seul montant à encaisser immédiatement auprès du patient.',
          'Le reçu imprimé spécifie distinctement l’organisme payeur, le numéro de bon PEC et le net perçu.',
        ],
      },
    ],
  },
  {
    id: 'ch-transferts',
    number: 'Chapitre 9',
    title: 'Réseau Inter-Hôpitaux & SAMU National',
    subtitle: 'Coordination des Évacuations, Fiches de Transfert & Lits Disponibles',
    category: 'logistique',
    badge: 'Réseau National',
    icon: Building2,
    summary:
      'Mécanisme de liaison entre cliniques privées, hôpitaux provinciaux et grands centres hospitaliers universitaires de N’Djamena (CHU-RN, Hôpital de la Mère et de l’Enfant, Hôpital de la Renaissance).',
    sections: [
      {
        title: '9.1 Initiation d’une Demande de Transfert',
        content: [
          'Lorsqu’un patient nécessite un plateau technique supérieur (réanimation, scanner spécialisé, chirurgie lourde), le médecin clique sur "Transférer le Patient".',
          'Il sélectionne l’établissement destinataire, le degré d’urgence (Extrême Urgence, Évacuation Médicalisée, Transfert Simple) et renseigne le motif clinique.',
        ],
      },
      {
        title: '9.2 Transmission Instantanée du Dossier Médical',
        content: [
          'Le centre d’accueil reçoit immédiatement l’alerte avec l’historique complet, les constantes d’urgence et les résultats d’examens récents.',
          'Cela évite la perte de temps critique à l’arrivée de l’ambulance : les équipes de réanimation sont préparées avant même que le patient ne franchisse les portes.',
        ],
      },
    ],
  },
  {
    id: 'ch-direction',
    number: 'Chapitre 10',
    title: 'Direction, Statistiques & Registre d’Audit',
    subtitle: 'Supervision Médicale, Indicateurs Financiers & Contrôle Déontologique',
    category: 'administration',
    badge: 'Gouvernance',
    icon: Users,
    summary:
      'Outils pour le Directeur d’Établissement et le Super Administrateur : tableaux de bord d’activité, gestion des effectifs et audit de conformité.',
    sections: [
      {
        title: '10.1 Tableaux de Bord & Indicateurs de Santé',
        content: [
          'Le directeur visualise en un coup d’œil : le nombre d’admissions du jour, le taux d’occupation, la durée moyenne de séjour aux urgences et les pathologies prévalentes.',
          'Ces données statistiques permettent d’anticiper les pics épidémiques (paludisme saisonnier, gastro-entérites fébriles) et d’adapter les effectifs soignants.',
        ],
      },
      {
        title: '10.2 Gestion des Comptes & Permissions du Personnel',
        content: [
          'La direction crée, suspend ou met à jour les comptes des médecins et paramédicaux.',
          'En cas de départ d’un soignant, son compte est révoqué en un clic pour couper immédiatement l’accès aux dossiers de l’établissement.',
        ],
      },
    ],
  },
  {
    id: 'ch-tiers-payant',
    number: 'Chapitre 11',
    title: 'Assurance Maladie, Mutuelles & Conventions Tiers-Payant',
    subtitle: 'CNPS Tchad, Assurances Privées, Prise en Charge (70%–100%) & Carte Mutuelle Digitale',
    category: 'administration',
    badge: 'Tiers-Payant',
    icon: Shield,
    summary:
      'Guide complet du dispositif de Tiers-Payant au Tchad : gestion des conventions avec la CNPS, les mutuelles et assurances privées (Ascoma, Sanlam, Al Wafa, SHT, CotonTchad), validation des bons de prise en charge, carte mutuelle digitale et télétransmission sans avance de frais.',
    sections: [
      {
        title: '11.1 Écosystème des Assurances et Conventions Agréées au Tchad',
        content: [
          'Le système DARÔ intègre les principaux régimes de couverture et conventions d’entreprises opérant en République du Tchad :',
          '• CNPS Tchad (Caisse Nationale de Prévoyance Sociale) : sécurité sociale des salariés et ayants droit.',
          '• Compagnies d’Assurances Privées : Ascoma Tchad Assurances Santé, Sanlam / Gras Savoye, Al Wafa Assurance Tchad.',
          '• Bons de Sociétés Conventionnées : SHT (Société des Hydrocarbures du Tchad), CotonTchad SN, banques et institutions partenaires.',
          '• Mutuelles Corporatives & Régimes Spéciaux (Fonctionnaires, Ordres professionnels).',
        ],
        tips: [
          'Vérifier systématiquement la date de validité de la police et le matricule assuré lors de l’admission.',
          'Un patient affilié est automatiquement reconnu au guichet grâce à son Pass Santé QR Code.',
        ],
      },
      {
        title: '11.2 Carte Mutuelle Santé Digitale & Droits Espace Patient',
        content: [
          'Chaque patient assuré dispose d’une Carte Mutuelle Santé & Tiers-Payant interactive au sein de son Espace Santé Personnel :',
          '• Présentation claire des informations d’affiliation : matricule, police, assureur, date de fin de droits.',
          '• Taux de couverture contractuel explicite (ex: 80% Tiers-Payant, 20% ticket modérateur à charge).',
          '• Liste des prestations couvertes : consultations généralistes et spécialistes, examens de biologie médicale, imagerie, pharmacie agréée et hospitalisation.',
          '• Zéro avance de frais : le patient présente simplement sa carte sur smartphone ou son QR Code pour bénéficier de la dispense d’avance des frais.',
        ],
      },
      {
        title: '11.3 Circuit Opérationnel de Facturation & Ticket Modérateur',
        content: [
          'Lors de la facturation ou du paiement d’une prestation :',
          '1. L’agent ou caissier coche l’option "Prise en charge Assurance / Tiers-Payant".',
          '2. Il sélectionne l’organisme conventionné et renseigne le numéro du bon PEC (ex: PEC-CNPS-2025-044).',
          '3. Le système applique le barème (ex: 80% / 20%) et ventile automatiquement les créances.',
          '4. Le patient ne s’acquitte que du ticket modérateur en espèces, Airtel Money ou Moov Money.',
          '5. La quittance officielle imprimée mentionne distinctement la part prise en charge et la référence d’accord.',
        ],
        warnings: [
          'Pour les interventions chirurgicales ou hospitalisations programmées, une demande d’entente préalable visée par l’assureur est requise.',
        ],
      },
      {
        title: '11.4 Suivi des Créances & Recouvrement des Bordereaux Assurances',
        content: [
          'Le module Caisse & Facturation comprend un filtre dédié "Tiers-Payant" regroupant toutes les créances dues par les organismes assureurs.',
          'Le service financier de l’établissement extrait les bordereaux récapitulatifs pour envoi et recouvrement direct auprès de la CNPS et des compagnies partenaires.',
        ],
        tips: [
          'Effectuer un rapprochement mensuel des virements et chèques reçus des assureurs pour lettrer les dossiers de prise en charge.',
        ],
      },
    ],
  },
];

export const UserGuideBookView: React.FC<UserGuideBookViewProps> = ({ onClose, isModal = false }) => {
  const [selectedChapterId, setSelectedChapterId] = useState<string>(CHAPTERS[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'tous' | 'securite' | 'clinique' | 'logistique' | 'administration'>('tous');

  const filteredChapters = CHAPTERS.filter(ch => {
    const matchCategory = filterCategory === 'tous' || ch.category === filterCategory;
    const matchQuery =
      !searchQuery.trim() ||
      ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.sections.some(
        s =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.content.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    return matchCategory && matchQuery;
  });

  const activeChapter = CHAPTERS.find(c => c.id === selectedChapterId) || CHAPTERS[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`w-full bg-slate-100 text-slate-800 ${isModal ? 'fixed inset-0 z-50 overflow-y-auto flex flex-col bg-slate-900/60 backdrop-blur-sm p-2 sm:p-6' : 'min-h-screen'}`}>
      <div className={`w-full max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col ${isModal ? 'max-h-[92vh] my-auto' : 'my-4'}`}>
        {/* Header du Livre */}
        <div className="bg-gradient-to-r from-[#0B3C5D] via-[#0E4971] to-[#0B3C5D] p-5 sm:p-7 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-teal-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 shadow-inner">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-400/20 text-teal-300 border border-teal-400/30">
                  Manuel Officiel & Guide Pratique
                </span>
                <span className="text-[11px] font-bold text-slate-300">Édition 2025 • Tchad</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
                Le Grand Livre d'Exploitation DARÔ Santé
              </h1>
              <p className="text-xs sm:text-sm text-slate-200 mt-0.5">
                Guide méthodologique, règles de sécurité, protocoles d'urgences & manuel des soignants
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Imprimer ou exporter en PDF"
            >
              <Printer className="w-4 h-4 text-teal-300" />
              <span className="hidden sm:inline">Imprimer le Livre</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="Fermer le manuel"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Barre d'outils / Recherche & Filtres */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher un chapitre, protocole, mot-clé..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-teal-500 transition shadow-sm"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {(['tous', 'securite', 'clinique', 'logistique', 'administration'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize whitespace-nowrap transition cursor-pointer ${
                  filterCategory === cat
                    ? 'bg-[#0B3C5D] text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat === 'tous' ? 'Tous les Chapitres' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Corps du livre : Sommaire à gauche, Contenu du chapitre à droite */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Sommaire latéral */}
          <div className="w-full md:w-80 lg:w-96 bg-slate-50/80 border-r border-slate-200 p-3 overflow-y-auto max-h-60 md:max-h-[680px] space-y-1.5 shrink-0">
            <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Table des Matières ({filteredChapters.length})
            </div>

            {filteredChapters.map(ch => {
              const IconComp = ch.icon;
              const isSelected = ch.id === activeChapter.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChapterId(ch.id)}
                  className={`w-full text-left p-3 rounded-2xl transition cursor-pointer flex items-start gap-3 border ${
                    isSelected
                      ? 'bg-white border-teal-500/50 shadow-md ring-1 ring-teal-500/20'
                      : 'bg-transparent border-transparent hover:bg-white/60 hover:border-slate-200 text-slate-700'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-teal-700">
                        {ch.number}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                        {ch.badge}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 truncate mt-0.5">
                      {ch.title}
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {ch.subtitle}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Contenu du Chapitre Sélectionné */}
          <div className="flex-1 p-5 sm:p-8 overflow-y-auto max-h-[680px] space-y-8 bg-white">
            {/* Titre & Bannière du Chapitre */}
            <div className="border-b border-slate-100 pb-6 space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200">
                  {activeChapter.number}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  {activeChapter.category}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {activeChapter.title}
              </h2>
              <p className="text-sm font-medium text-slate-600 leading-relaxed">
                {activeChapter.subtitle}
              </p>
              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100 text-slate-700 text-xs sm:text-sm leading-relaxed">
                <span className="font-bold text-teal-900 block mb-1">Résumé Opérationnel :</span>
                {activeChapter.summary}
              </div>
            </div>

            {/* Sections du Chapitre */}
            <div className="space-y-6">
              {activeChapter.sections.map((sec, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#0B3C5D] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <span>{sec.title}</span>
                  </h3>

                  <div className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {sec.content.map((p, pIdx) => (
                      <p key={pIdx}>{p}</p>
                    ))}
                  </div>

                  {sec.tips && sec.tips.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1 mt-3">
                      <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Recommandation de Bonne Pratique :</span>
                      </div>
                      {sec.tips.map((t, tIdx) => (
                        <p key={tIdx} className="pl-5">• {t}</p>
                      ))}
                    </div>
                  )}

                  {sec.warnings && sec.warnings.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1 mt-3">
                      <div className="font-bold flex items-center gap-1.5 text-amber-800">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Avertissement & Règle d'Or :</span>
                      </div>
                      {sec.warnings.map((w, wIdx) => (
                        <p key={wIdx} className="pl-5">• {w}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Navigation rapide entre chapitres */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
              {(() => {
                const currentIndex = CHAPTERS.findIndex(c => c.id === activeChapter.id);
                const prev = CHAPTERS[currentIndex - 1];
                const next = CHAPTERS[currentIndex + 1];

                return (
                  <>
                    {prev ? (
                      <button
                        onClick={() => setSelectedChapterId(prev.id)}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>{prev.number} : {prev.title}</span>
                      </button>
                    ) : <div />}

                    {next ? (
                      <button
                        onClick={() => setSelectedChapterId(next.id)}
                        className="px-4 py-2 rounded-xl bg-[#0B3C5D] hover:bg-[#08293f] text-white text-xs font-bold flex items-center gap-2 transition cursor-pointer ml-auto"
                      >
                        <span>{next.number} : {next.title}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : <div />}
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Footer officiel */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-700">DARÔ Santé • Plateforme Médicale Hospitalière & Urgences</span>
          </div>
          <div>Validé pour déploiement national • République du Tchad</div>
        </div>
      </div>
    </div>
  );
};
