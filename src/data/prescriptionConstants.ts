export interface VoieAdministrationOption {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
}

export const VOIES_ADMINISTRATION: VoieAdministrationOption[] = [
  {
    id: 'orale',
    label: 'Voie Orale (PO - Par la bouche)',
    shortLabel: 'PO (Orale)',
    description: 'Comprimés, gélules, sirops ou solutions buvables à avaler avec de l\'eau.',
  },
  {
    id: 'intraveineuse',
    label: 'Voie Intraveineuse (IV - Injection / Perfusion)',
    shortLabel: 'IV',
    description: 'Injection directe ou perfusion lente dans la veine (urgence ou hospitalisation).',
  },
  {
    id: 'intramusculaire',
    label: 'Voie Intramusculaire (IM)',
    shortLabel: 'IM',
    description: 'Injection profonde dans le muscle (fessier ou deltoïde).',
  },
  {
    id: 'sous_cutanee',
    label: 'Voie Sous-Cutanée (SC)',
    shortLabel: 'SC',
    description: 'Injection dans le tissu graisseux sous-cutané (ex: insulines, héparines).',
  },
  {
    id: 'cutanee',
    label: 'Voie Cutanée / Locale (Pommade, Crème, Gel)',
    shortLabel: 'Locale / Cutanée',
    description: 'Application directe sur la peau ou la lésion cutanée.',
  },
  {
    id: 'inhalee',
    label: 'Voie Inhalée (Aérosol / Nébulisation / Spray)',
    shortLabel: 'Inhalée',
    description: 'Inhalation bronchique via spray doseur ou nébuliseur (ex: Salbutamol).',
  },
  {
    id: 'oculaire',
    label: 'Voie Oculaire (Collyre / Pommade ophtalmique)',
    shortLabel: 'Collyre (Yeux)',
    description: 'Instillation dans le cul-de-sac conjonctival de l\'œil.',
  },
  {
    id: 'auriculaire',
    label: 'Voie Auriculaire (Gouttes auriculaires)',
    shortLabel: 'Auriculaire (Oreille)',
    description: 'Instillation dans le conduit auditif externe.',
  },
  {
    id: 'rectale',
    label: 'Voie Rectale (Suppositoire / Lavement)',
    shortLabel: 'Rectale',
    description: 'Introduction par voie rectale (notamment en pédiatrie ou nausées).',
  },
  {
    id: 'sublinguale',
    label: 'Voie Sublinguale (Sous la langue)',
    shortLabel: 'Sublinguale',
    description: 'À laisser fondre sous la langue pour une absorption rapide.',
  },
];

export const ACTIONS_APRES_DIAGNOSTIC = [
  'Traitement médical ambulatoire à domicile avec surveillance',
  'Repos médical prescrit (repos strict au lit de 3 jours)',
  'Mise en observation d\'urgence (perfusion / réhydratation 24h)',
  'Hospitalisation immédiate au service de médecine interne / pédiatrie',
  'Consultation de contrôle obligatoire sous 72 heures (J+3)',
  'Contrôle de la goutte épaisse et NFS à J+7',
  'Bilan paraclinique complémentaire avant réévaluation thérapeutique',
  'Référé d\'urgence vers service spécialisé (Cardiologie / Gynécologie / Chirurgie)',
  'Prise en charge nutritionnelle et hydrique renforcée face aux chaleurs',
  'Poursuite des soins infirmiers quotidiens à domicile (pansement/injections)',
];

export const QUARTIERS_NDJAMENA = [
  'Sabangali (3e Arr.)',
  'Chagoua (7e Arr.)',
  'Moursal (6e Arr.)',
  'Diguel (8e Arr.)',
  'Farcha (1er Arr.)',
  'Dembé (6e Arr.)',
  'Am-Riguébé (5e Arr.)',
  'Gassi (7e Arr.)',
  'Atrone (7e Arr.)',
  'Gardolé (4e Arr.)',
  'Ardep-Djoumal (3e Arr.)',
  'N\'Djamena-Fara (2e Arr.)',
  'Walia (9e Arr.)',
  'Toukra (9e Arr.)',
  'Paris-Congo (6e Arr.)',
  'Habena (7e Arr.)',
  'Bololo (2e Arr.)',
  'Klemat (2e Arr.)',
  'N\'Djari (8e Arr.)',
  'Ridina (5e Arr.)',
];

export interface ClinicalPresetNdjamena {
  id: string;
  label: string;
  badge: string;
  motif: string;
  diagnostic: string;
  action: string;
  notes: string;
  orderExam: boolean;
  examType: string;
  examNom: string;
  examIndications: string;
  items: {
    medicament: string;
    forme: string;
    voie: string;
    posologie: string;
    duree: string;
    quantite: number;
  }[];
}

export const CLINICAL_PRESETS_NDJAMENA: ClinicalPresetNdjamena[] = [
  {
    id: 'palu_simple',
    label: 'Paludisme Simple (CTA)',
    badge: 'TDR / Fièvre 39°C',
    motif: 'Fièvre élevée (39°C), céphalées frontales, frissons et courbatures intenses',
    diagnostic: 'Paludisme à Plasmodium falciparum non compliqué',
    action: 'Traitement médical ambulatoire à domicile avec surveillance',
    notes: 'Patient fébrile à 39.1°C, conjonctives sub-ictériques, langue saburrale, pas de signes de gravité neurologique ou respiratoire. TA 120/75 mmHg.',
    orderExam: true,
    examType: 'laboratoire',
    examNom: 'Goutte Épaisse & Frottis Sanguin (Paludisme)',
    examIndications: 'Suspicion accès palustre aigu & estimation parasitémie',
    items: [
      {
        medicament: 'Artéméther + Luméfantrine (Coartem 80/480mg)',
        forme: 'Comprimé',
        voie: 'Voie Orale (PO - Par la bouche)',
        posologie: '1 comprimé matin et soir au milieu d\'un repas',
        duree: '3 jours',
        quantite: 6,
      },
      {
        medicament: 'Paracétamol 1g',
        forme: 'Comprimé effervescent',
        voie: 'Voie Orale (PO - Par la bouche)',
        posologie: '1 comprimé toutes les 6 heures si température > 38.5°C',
        duree: '5 jours',
        quantite: 20,
      },
    ],
  },
  {
    id: 'palu_grave',
    label: 'Paludisme Grave (Artésunate IV)',
    badge: 'Urgence Vitale Hôpital',
    motif: 'Fièvre à 40°C, prostration, vomissements incoercibles et vertiges',
    diagnostic: 'Accès palustre grave à Plasmodium falciparum (Critères OMS)',
    action: 'Hospitalisation immédiate au service de médecine interne / pédiatrie',
    notes: 'Patient prostré, pâleur conjonctivale intense, déshydratation modérée, TA 95/60 mmHg, pouls 110 bpm. Pas de coma mais obnubilation légère.',
    orderExam: true,
    examType: 'laboratoire',
    examNom: 'Goutte Épaisse + NFS Hémogramme + Glycémie d\'urgence',
    examIndications: 'Suspicion neuropaludisme / anémie aiguë fébrile',
    items: [
      {
        medicament: 'Artésunate injectable 120mg (Flacon + Solvant)',
        forme: 'Injectable IV',
        voie: 'Voie Intraveineuse (IV - Injection / Perfusion)',
        posologie: '2.4 mg/kg en IV lente à H0, H12, H24 puis 1x/jour',
        duree: '3 jours',
        quantite: 4,
      },
      {
        medicament: 'Sérum Ringer Lactate 500ml',
        forme: 'Poche de perfusion',
        voie: 'Voie Intraveineuse (IV - Injection / Perfusion)',
        posologie: '1 poche en perfusion lente sur 4 heures',
        duree: '24 heures',
        quantite: 3,
      },
      {
        medicament: 'Paracétamol injectable 1g (Perfalgan)',
        forme: 'Flacon perfusion',
        voie: 'Voie Intraveineuse (IV - Injection / Perfusion)',
        posologie: '1 flacon en perfusion de 15 min toutes les 6 heures',
        duree: '2 jours',
        quantite: 6,
      },
    ],
  },
  {
    id: 'typhoide',
    label: 'Fièvre Typhoïde (Salmonellose)',
    badge: 'Syndrome infectieux',
    motif: 'Fièvre continue en plateau depuis 6 jours, céphalées occipitales et météorisme',
    diagnostic: 'Fièvre typhoïde (Syndrome infectieux à Salmonella enterica typhi)',
    action: 'Traitement médical ambulatoire à domicile avec surveillance',
    notes: 'Fièvre 39.6°C sans frissons (dissociation pouls-température), fosse iliaque droite gargouillante et sensible, langue saburrale rôtie.',
    orderExam: true,
    examType: 'laboratoire',
    examNom: 'Sérodiagnostic de Widal & Felix + NFS/Hémogramme',
    examIndications: 'Bilan d\'une fièvre prolongée inexpliquée en plateau',
    items: [
      {
        medicament: 'Ciprofloxacine 500mg',
        forme: 'Comprimé',
        voie: 'Voie Orale (PO - Par la bouche)',
        posologie: '1 comprimé matin et soir à jeun ou au repas',
        duree: '7 jours',
        quantite: 14,
      },
      {
        medicament: 'Paracétamol 1g',
        forme: 'Comprimé',
        voie: 'Voie Orale (PO - Par la bouche)',
        posologie: '1 comprimé toutes les 8 heures si céphalées ou fièvre',
        duree: '5 jours',
        quantite: 15,
      },
    ],
  },
  {
    id: 'gastro_deshydrat',
    label: 'Gastro-entérite & Déshydratation',
    badge: 'Canicule / Épidémique',
    motif: 'Diarrhée aqueuse aiguë (7 selles/24h), vomissements et soif intense',
    diagnostic: 'Gastro-entérite aiguë infectieuse avec déshydratation modérée',
    action: 'Mise en observation d\'urgence (perfusion / réhydratation 24h)',
    notes: 'Pli cutané s\'effaçant lentement, sécheresse buccale, oligurie, TA 105/70 mmHg, pouls 96 bpm.',
    orderExam: true,
    examType: 'laboratoire',
    examNom: 'Examen Parasitologique des Selles (EPS) + Coproculture',
    examIndications: 'Recherche amibes, giardia ou bactéries entéro-pathogènes',
    items: [
      {
        medicament: 'Sels de Réhydratation Orale (SRO OMS)',
        forme: 'Sachet pour solution',
        voie: 'Voie Orale (PO - Par la bouche)',
        posologie: '1 sachet dissous dans 1 litre d\'eau bouillie/minérale, à boire par petites gorgées',
        duree: '3 jours',
        quantite: 6,
      },
      {
        medicament: 'Métronidazole 500mg (Flagyl)',
        forme: 'Comprimé',
        voie: 'Voie Orale (PO - Par la bouche)',
        posologie: '1 comprimé matin, midi et soir au cours du repas',
        duree: '5 jours',
        quantite: 15,
      },
      {
        medicament: 'Sulfate de Zinc 20mg',
        forme: 'Comprimé dispersible',
        voie: 'Voie Orale (PO - Par la bouche)',
        posologie: '1 comprimé par jour dissous dans un verre d\'eau',
        duree: '10 jours',
        quantite: 10,
      },
    ],
  },
  {
    id: 'drepanocytose',
    label: 'Crise Drépanocytaire Vaso-occlusive',
    badge: 'Crise algique osseuse',
    motif: 'Douleurs atroces osseuses membres inférieurs, sternum et lombes',
    diagnostic: 'Crise vaso-occlusive douloureuse chez drépanocytaire connu (SS)',
    action: 'Mise en observation d\'urgence (perfusion / réhydratation 24h)',
    notes: 'Patient drépanocytaire connu, sueurs algiques, EVA 8/10, pâleur conjonctivale marquée. Saturation O2 à 94%.',
    orderExam: true,
    examType: 'laboratoire',
    examNom: 'NFS Numération Formule Sanguine + Réticulocytes d\'urgence',
    examIndications: 'Éliminer déglobulisation aiguë ou séquestration splénique',
    items: [
      {
        medicament: 'Sérum Glucosé 5% 1000ml + Électrolytes',
        forme: 'Poche de perfusion',
        voie: 'Voie Intraveineuse (IV - Injection / Perfusion)',
        posologie: 'Perfusion continue de 3 litres par 24h',
        duree: '2 jours',
        quantite: 6,
      },
      {
        medicament: 'Tramadol 50mg',
        forme: 'Gélule ou ampoule IV',
        voie: 'Voie Orale (PO - Par la bouche)',
        posologie: '1 prise toutes les 8 heures si douleur rebelle au paracétamol',
        duree: '3 jours',
        quantite: 10,
      },
      {
        medicament: 'Acide Folique 5mg',
        forme: 'Comprimé',
        voie: 'Voie Orale (PO - Par la bouche)',
        posologie: '1 comprimé par jour au repas',
        duree: '30 jours',
        quantite: 30,
      },
    ],
  },
  {
    id: 'hta_urgence',
    label: 'Poussée Hypertensive (HTA)',
    badge: 'Cardio-vasculaire',
    motif: 'Céphalées en casque pulsatiles, phosphènes, acouphènes et étourdissements',
    diagnostic: 'Poussée hypertensive sévère non compliquée (TA 180/105)',
    action: 'Repos médical prescrit (repos strict au lit de 3 jours)',
    notes: 'TA 182/108 mmHg symétrique, pouls 84 bpm régulier. Examen neurologique normal. Bruits du cœur réguliers sans galop.',
    orderExam: true,
    examType: 'cardiologie',
    examNom: 'Électrocardiogramme (ECG 12 dérivations) + Créatininémie',
    examIndications: 'Recherche hypertrophie ventriculaire gauche (HVG) et retentissement rénal',
    items: [
      {
        medicament: 'Amlodipine 10mg',
        forme: 'Comprimé',
        voie: 'Voie Orale (PO - Par la bouche)',
        posologie: '1 comprimé par jour le matin au petit-déjeuner',
        duree: '30 jours',
        quantite: 30,
      },
      {
        medicament: 'Hydrochlorothiazide 25mg',
        forme: 'Comprimé',
        voie: 'Voie Orale (PO - Par la bouche)',
        posologie: '1/2 comprimé le matin au réveil',
        duree: '30 jours',
        quantite: 15,
      },
    ],
  },
];
