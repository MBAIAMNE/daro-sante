import { ExamType } from '../types';

export interface ExamNatureDetail {
  id: ExamType;
  label: string;
  badgeColor: string;
  iconName: string;
  description: string;
  categories: {
    name: string;
    examens: {
      nom: string;
      indications: string;
      valeursNormales?: string;
    }[];
  }[];
}

export const EXAM_NATURES: ExamNatureDetail[] = [
  {
    id: 'laboratoire',
    label: 'Laboratoire / Biologie Médicale',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    iconName: 'FlaskConical',
    description: 'Analyses biochimiques, hématologiques, parasitologiques et sérologiques.',
    categories: [
      {
        name: 'Parasitologie & Infectiologie Tropicale (Sahélienne)',
        examens: [
          {
            nom: 'Goutte Épaisse & Frottis Sanguin (Paludisme)',
            indications: 'Fièvre aiguë, frissons, céphalées, suspicion de paludisme.',
            valeursNormales: 'Absence de trophozoïtes de Plasmodium (Négatif).',
          },
          {
            nom: 'Test de Diagnostic Rapide Paludisme (TDR Pf/Pan)',
            indications: 'Dépistage urgent au lit du patient du paludisme.',
            valeursNormales: 'TDR Négatif (Absence d\'antigène HRP2/pLDH).',
          },
          {
            nom: 'Sérologie Widal-Félix (Fièvre Typhoïde)',
            indications: 'Fièvre continue en plateau, troubles digestifs, céphalées.',
            valeursNormales: 'Titres d\'agglutinines O et H < 1/80 (Négatif).',
          },
          {
            nom: 'Examen Parasitologique des Selles (EPS direct et enrichissement)',
            indications: 'Diarrhées chroniques, douleurs abdominales, suspicion d\'amibiase ou helminthiase.',
            valeursNormales: 'Absence de kystes, d\'œufs ou de formes végétatives de parasites.',
          },
          {
            nom: 'ECBU (Examen Cytobactériologique des Urines) avec Antibiogramme',
            indications: 'Brûlures mictionnelles, pollakiurie, fièvre inexpliquée, suspicion d\'infection urinaire.',
            valeursNormales: 'Leucocytes < 10 000/mL, Hématies < 10 000/mL, Culture stérile (< 1 000 UFC/mL).',
          },
        ],
      },
      {
        name: 'Hématologie & Immuno-Hématologie',
        examens: [
          {
            nom: 'NFS / Hémogramme Complet + Plaquettes',
            indications: 'Bilan d\'anémie, syndrome infectieux, purpura, contrôle post-chirurgical.',
            valeursNormales: 'Hb : 12-16 g/dL, GB : 4 000-10 000/µL, Plaquettes : 150 000-450 000/µL.',
          },
          {
            nom: 'Électrophorèse de l\'Hémoglobine à pH alcalin (Drépanocytose)',
            indications: 'Dépistage drépanocytose, crise vaso-occlusive, anémie hémolytique.',
            valeursNormales: 'Phénotype normal Hb AA (HbA > 95%, HbA2 < 3.5%, Absence d\'HbS).',
          },
          {
            nom: 'Groupe Sanguin ABO-Rhésus + Phénotypage Rh/Kell',
            indications: 'Carte de groupe sanguin, transfusion, bilan préopératoire, grossesse.',
            valeursNormales: 'Groupe ABO et Rhésus positif ou négatif déterminé.',
          },
          {
            nom: 'Bilan d\'Hémostase (TP, TCA, INR, Fibrinogène)',
            indications: 'Bilan d\'hémostase pré-opératoire, saignements inexpliqués.',
            valeursNormales: 'TP : 70-100%, TCA : Ratio 0.8-1.2, INR : 0.9-1.15.',
          },
          {
            nom: 'Vitesse de Sédimentation (VS) & Protéine C-Réactive (CRP)',
            indications: 'Syndrome inflammatoire biologique aigu ou chronique.',
            valeursNormales: 'VS < 15 mm à la 1ère heure, CRP < 5 mg/L.',
          },
        ],
      },
      {
        name: 'Biochimie Métabolique, Rénale & Hépatique',
        examens: [
          {
            nom: 'Glycémie à jeun veineuse & Hémoglobine Glyquée (HbA1c)',
            indications: 'Dépistage et suivi de diabète sucré, polyuro-polydipsie.',
            valeursNormales: 'Glycémie à jeun : 0.70 - 1.10 g/L (3.9 - 6.1 mmol/L) ; HbA1c < 6.0%.',
          },
          {
            nom: 'Créatininémie + Urée sanguine & Clairance DFG (CKD-EPI)',
            indications: 'Évaluation de la fonction rénale, surveillance HTA et diabète.',
            valeursNormales: 'Créatinine : 60-110 µmol/L (0.7-1.2 mg/dL), DFG > 90 mL/min/1.73m².',
          },
          {
            nom: 'Transaminases ASAT (GOT) & ALAT (GPT)',
            indications: 'Cytolyse hépatique, ictère, hépatites virales ou médicamenteuses.',
            valeursNormales: 'ASAT < 35 UI/L, ALAT < 45 UI/L.',
          },
          {
            nom: 'Bilan Lipidique Complet (Cholestérol Total, HDL, LDL, Triglycérides)',
            indications: 'Bilan de risque cardiovasculaire, obésité, athérosclérose.',
            valeursNormales: 'CT < 2.0 g/L, LDL < 1.3 g/L, HDL > 0.4 g/L, TG < 1.5 g/L.',
          },
          {
            nom: 'Ionogramme Sanguin (Sodium Na+, Potassium K+, Chlore Cl-)',
            indications: 'Troubles hydro-électrolytiques, déshydratation aiguë sahélienne, vomissements.',
            valeursNormales: 'Na+ : 135-145 mEq/L, K+ : 3.5-5.0 mEq/L, Cl- : 98-106 mEq/L.',
          },
        ],
      },
      {
        name: 'Sérologie & Virologie',
        examens: [
          {
            nom: 'Dépistage Sérologique VIH 1 & 2 (Algorithme National MSP Tchad)',
            indications: 'Dépistage volontaire, bilan prénatal, altération de l\'état général.',
            valeursNormales: 'Sérologie VIH Négative / Non réactive.',
          },
          {
            nom: 'Ag HBs (Dépistage Hépatite B) & Sérologie VHC (Hépatite C)',
            indications: 'Bilan hépatique, don de sang, bilan pré-thérapeutique.',
            valeursNormales: 'Ag HBs Négatif, Anticorps anti-VHC Négatif.',
          },
          {
            nom: 'Sérologie Syphilitique (VDRL / TPHA)',
            indications: 'Bilan prénatal, ulcération génitale, bilan systématique.',
            valeursNormales: 'TPHA Négatif, VDRL Négatif.',
          },
        ],
      },
    ],
  },
  {
    id: 'imagerie',
    label: 'Imagerie Médicale & Radiologie',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    iconName: 'Image',
    description: 'Radiographies standard, échographies ultrasonores, scanner TDM et IRM.',
    categories: [
      {
        name: 'Radiographie Conventionnelle Numérisée',
        examens: [
          {
            nom: 'Radiographie Thoracique (Face debout et profil)',
            indications: 'Toux persistante, dyspnée, hémoptysie, suspicion pneumonie ou tuberculose.',
            valeursNormales: 'Champs pulmonaires clairs sans foyer ni épanchement. Index cardiothoracique normal.',
          },
          {
            nom: 'Radiographie Abdomen Sans Préparation (ASP debout / couché)',
            indications: 'Douleur abdominale aiguë, arrêt des matières et des gaz (occlusion), perforation.',
            valeursNormales: 'Aération digestive normale, absence de niveaux hydro-aériques et de pneumopéritoine.',
          },
          {
            nom: 'Radiographie Osseuse et Articulaire (Face et Profil)',
            indications: 'Traumatisme, chute, suspicion de fracture ou de luxation.',
            valeursNormales: 'Intégrité des structures osseuses corticales et trabéculaires sans fracture.',
          },
          {
            nom: 'Radiographie du Bassin de Face',
            indications: 'Traumatisme pelvien, coxalgie, suspicion de fracture col fémoral.',
            valeursNormales: 'Symétrie des interlignes articulaires coxo-fémoraux, intégrité du cadre osseux.',
          },
        ],
      },
      {
        name: 'Échographie Ultrasonore & Doppler',
        examens: [
          {
            nom: 'Échographie Abdomino-Pelvienne Complète',
            indications: 'Douleur hypochondre droit, ictère, hépatomégalie, colique néphrétique.',
            valeursNormales: 'Foie, vésicule, rate, pancréas et reins de morphologie et échogénicité normales.',
          },
          {
            nom: 'Échographie Obstétricale & Morphotologique (1er, 2e ou 3e trimestre)',
            indications: 'Datation, vitalité fœtale, morphologie, biométrie, localisation placentaire.',
            valeursNormales: 'Fœtus eutrophe, activité cardiaque présente et régulière, liquide amniotique normal.',
          },
          {
            nom: 'Échographie Rénale, Vésicale & Prostatique',
            indications: 'Dysurie, hématurie, lombalgies, surveillance hypertrophie prostatique.',
            valeursNormales: 'Reins de taille normale sans dilatation pyélocalicielle ni lithiase. Vessie souple.',
          },
          {
            nom: 'Échocardiographie Transthoracique (ETT Doppler Cardiaque)',
            indications: 'Insuffisance cardiaque, souffle cardiaque, HTA sévère, cardiopathie ischémique.',
            valeursNormales: 'FEVG conservée (> 55%), cavités cardiaques non dilatées, flux doppler physiologiques.',
          },
          {
            nom: 'Échodoppler Veineux des Membres Inférieurs (Recherche TVP)',
            indications: 'Jambe gonflée, rouge, douloureuse, suspicion de thrombose veineuse profonde.',
            valeursNormales: 'Perméabilité et compressibilité normale des réseaux veineux fémoro-poplité et jambier.',
          },
        ],
      },
      {
        name: 'Tomodensitométrie (Scanner / TDM) & IRM',
        examens: [
          {
            nom: 'TDM Cérébrale sans injection de produit de contraste',
            indications: 'Accident Vasculaire Cérébral (AVC aigu), traumatisme crânien, céphalées brutales.',
            valeursNormales: 'Absence de lésion hémorragique ou ischémique aiguë. Système ventriculaire normal.',
          },
          {
            nom: 'TDM Thoraco-Abdomino-Pelvienne (TAP) injectée',
            indications: 'Bilan d\'extension oncologique, polytraumatisme, syndrome tumoral inexpliqué.',
            valeursNormales: 'Absence d\'anomalie parenchymateuse focale ou d\'adénopathie suspecte.',
          },
          {
            nom: 'IRM Rachidienne / Médullaire',
            indications: 'Lombosciatique invalidante, hernie discale, déficit sensitivo-moteur des membres.',
            valeursNormales: 'Respect de l\'alignement vertébral, calibre canalaire normal sans conflit disco-radiculaire.',
          },
        ],
      },
    ],
  },
  {
    id: 'cardiologie_exploration',
    label: 'Explorations Fonctionnelles & Cardiologie',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    iconName: 'Activity',
    description: 'ECG, holter tensionnel, spirométrie et explorations électrophysiologiques.',
    categories: [
      {
        name: 'Cardiologie & Rythmologie',
        examens: [
          {
            nom: 'Électrocardiogramme (ECG standard 12 dérivations)',
            indications: 'Douleur thoracique, palpitations, syncope, bilan préopératoire, HTA.',
            valeursNormales: 'Rythme sinusal régulier à 72 bpm. Tracé normal sans trouble de conduction ni repolarisation.',
          },
          {
            nom: 'Mesure Ambulatoire de la Pression Artérielle des 24h (MAPA / Holter Tensionnel)',
            indications: 'Suspicion d\'HTA blouse blanche, HTA réfractaire, hypotension orthostatique.',
            valeursNormales: 'Moyenne 24h < 130/80 mmHg, profil dipper conservé (baisse nocturne normale).',
          },
          {
            nom: 'Holter ECG des 24 heures (Enregistrement du rythme)',
            indications: 'Palpitations paroxystiques, recherche de fibrillation auriculaire, bradycardie.',
            valeursNormales: 'Absence d\'arythmie supra-ventriculaire ou ventriculaire significative.',
          },
        ],
      },
      {
        name: 'Explorations Respiratoires & Neurologiques',
        examens: [
          {
            nom: 'Spirométrie / Exploration Fonctionnelle Respiratoire (EFR)',
            indications: 'Suspicion d\'asthme, BPCO, dyspnée d\'effort inexpliquée.',
            valeursNormales: 'VEMS / CVF > 70%, VEMS > 80% des valeurs théoriques prédites.',
          },
          {
            nom: 'Électroencéphalogramme (EEG veille et sommeil)',
            indications: 'Crises convulsives, épilepsie suspectée, perte de connaissance brève.',
            valeursNormales: 'Rythme de fond alpha réactif symétrique sans paroxysme épileptique.',
          },
        ],
      },
    ],
  },
  {
    id: 'endoscopie',
    label: 'Endoscopie Médicale & Digestive',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    iconName: 'Search',
    description: 'Examens endoscopiques haute et basse, bronchoscopies.',
    categories: [
      {
        name: 'Endoscopie Digestive',
        examens: [
          {
            nom: 'Fibroscopie Œso-Gastro-Duodénale (FOGD)',
            indications: 'Épigastralgies chroniques, dysphagie, hématémèse, suspicion d\'ulcère gastrique.',
            valeursNormales: 'Muqueuse œsophagienne, gastrique et duodénale d\'aspect normal sans ulcération ni sténose.',
          },
          {
            nom: 'Coloscopie Totale avec iléoscopie',
            indications: 'Rectorragies, melæna, modification récente du transit, dépistage de polypes.',
            valeursNormales: 'Muqueuse colique et iléale normale sur toute la hauteur jusqu\'au caecum.',
          },
        ],
      },
    ],
  },
  {
    id: 'anatomopathologie',
    label: 'Anatomopathologie & Cytologie (Anapath)',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    iconName: 'Microscope',
    description: 'Biopsies, frottis cervico-utérins (FCU) et analyses histopathologiques.',
    categories: [
      {
        name: 'Cytologie & Biopsies Tissulaires',
        examens: [
          {
            nom: 'Frottis Cervico-Utérin / Vaginal (FCU / FCV de dépistage)',
            indications: 'Dépistage systématique du cancer du col de l\'utérus, saignements post-coïtaux.',
            valeursNormales: 'Frotti normal, absence de lésion intra-épithéliale ou de malignité (Système Bethesda).',
          },
          {
            nom: 'Biopsie Tissulaire Diagnostique avec Examen Histologique',
            indications: 'Caractérisation histopathologique d\'une lésion suspecte cutanée ou muqueuse.',
            valeursNormales: 'Architecture tissulaire bénigne sans atypie cytonucléaire suspecte.',
          },
          {
            nom: 'Ponction Cytologique à l\'Aiguille Fine (Ganglion, Thyroïde, Sein)',
            indications: 'Nodule thyroïdien ou mammaire palpable, adénomégalie persistante.',
            valeursNormales: 'Cytologie bénigne réactionnelle sans cellules suspectes de malignité.',
          },
        ],
      },
    ],
  },
  {
    id: 'ophtalmo_orl',
    label: 'Ophtalmologie & O.R.L.',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    iconName: 'Eye',
    description: 'Fond d\'œil au biomicroscope, tonométrie oculaire, audiogrammes.',
    categories: [
      {
        name: 'Explorations Sensorielles',
        examens: [
          {
            nom: 'Examen du Fond d\'Œil (FO) au biomicroscope',
            indications: 'Bilan du diabète (rétinopathie), HTA maligne, baisse d\'acuité visuelle.',
            valeursNormales: 'Papille optique bien délimitée, macula saine, réseau vasculaire rétinien régulier.',
          },
          {
            nom: 'Audiométrie Tonale & Vocale',
            indications: 'Hypoacousie, acouphènes, bilan de presbyacousie ou traumatisme sonore.',
            valeursNormales: 'Courbes audiométriques normales dans les limites physiologiques bilatérales.',
          },
        ],
      },
    ],
  },
  {
    id: 'autre',
    label: 'Autre Examen Spécialisé',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
    iconName: 'FileText',
    description: 'Autres bilans paracliniques et consultations spécialisées.',
    categories: [
      {
        name: 'Autres Bilans',
        examens: [
          {
            nom: 'Bilan Paraclinique Spécifique Personnalisé',
            indications: 'Bilan adapté à l\'état clinique du patient.',
            valeursNormales: 'Paramètres clinico-biologiques dans les normes.',
          },
        ],
      },
    ],
  },
];

export function getExamNatureDetail(type: ExamType): ExamNatureDetail {
  return EXAM_NATURES.find(n => n.id === type) || EXAM_NATURES[0];
}
