import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Bouclier HTTP & En-têtes de Cyberdéfense DARÔ
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  next();
});

// Limitation de taille des payloads pour empêcher le déni de service (DDoS / Memory Exhaustion)
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Pare-feu applicatif (WAF) & Détection d'injections
const rateLimitMap = new Map<string, { count: number; firstRequestTime: number; blockedUntil: number }>();
const ATTACK_REGEX = /(<script|javascript:|onerror=|onload=|eval\(|UNION\s+SELECT|DROP\s+TABLE|'(\s*OR|\s*AND)\s*'?\d+'?\s*=\s*'?\d+'?|\$where|\$gt|\.\.\/|\.\.\\)/i;

app.use('/api', (req, res, next) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  // 1. Rate Limiting par IP
  let record = rateLimitMap.get(ip);
  if (!record || (now - record.firstRequestTime > 60000)) {
    record = { count: 1, firstRequestTime: now, blockedUntil: 0 };
    rateLimitMap.set(ip, record);
  } else {
    record.count++;
  }

  if (record.blockedUntil > now) {
    return res.status(429).json({
      error: 'Trop de requêtes suspectes détectées. IP temporairement suspendue par la forteresse DARÔ.',
      retryAfterSeconds: Math.ceil((record.blockedUntil - now) / 1000)
    });
  }

  // Si plus de 180 requêtes par minute
  if (record.count > 180) {
    record.blockedUntil = now + 60000;
    console.warn(`[WAF DARÔ] Rate limit dépassé pour IP: ${ip}`);
    return res.status(429).json({ error: 'Débit excessif. Protection anti-flood active.' });
  }

  // 2. Inspection du Payload contre les injections malveillantes
  const payloadStr = JSON.stringify({ body: req.body, query: req.query, params: req.params });
  if (ATTACK_REGEX.test(payloadStr)) {
    console.warn(`[WAF DARÔ BLOCKED THREAT] Payload malveillant intercepté depuis IP ${ip} sur ${req.method} ${req.url}`);
    return res.status(403).json({
      error: 'Requête bloquée par la forteresse de sécurité DARÔ : motif malveillant ou tentative d\'injection détectée.'
    });
  }

  next();
});

// Persistent database file setup
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'clinic-storage.json');

interface StorageData {
  etablissements: any[];
  users: any[];
  messages: any[];
  notifications: any[];
  assignments: any[];
  activityLogs: any[];
  qrAccessLogs: any[];
}

const DEFAULT_ETABLISSEMENTS = [
  {
    id: 'etab-1',
    nom: 'Clinique Médicale Espoir',
    code: 'CME-01',
    type: 'clinique',
    ville: "N'Djamena",
    pays: 'Tchad',
    adresse: "Quartier Sabangali, N'Djamena",
    telephone: '+235 22 52 14 15',
    email: 'contact@clinique-espoir.td',
    directeurNom: 'Dr. Haroun Mahamat',
    directeurEmail: 'directeur@daro-sante.td',
    statut: 'actif',
    dateCreation: '2024-01-10',
    totalPatients: 142,
    totalConsultations: 310,
  },
  {
    id: 'etab-2',
    nom: 'Hôpital Général de Référence Nationale (HGRN)',
    code: 'HGRN-02',
    type: 'hopital',
    ville: "N'Djamena",
    pays: 'Tchad',
    adresse: "Avenue Charles de Gaulle, N'Djamena",
    telephone: '+235 22 51 58 70',
    email: 'direction@hgrn-tchad.org',
    directeurNom: 'Prof. Djimet Souleymane',
    directeurEmail: 'directeur@hgrn.td',
    statut: 'actif',
    dateCreation: '2024-02-15',
    totalPatients: 520,
    totalConsultations: 1240,
  },
  {
    id: 'etab-3',
    nom: 'Centre Hospitalier Régional de Moundou',
    code: 'CHRM-03',
    type: 'hopital',
    ville: 'Moundou',
    pays: 'Tchad',
    adresse: 'Quartier Doyon, Moundou',
    telephone: '+235 22 69 11 20',
    email: 'contact@chr-moundou.td',
    directeurNom: 'Dr. Nodjitoloum Jean',
    directeurEmail: 'directeur@chr-moundou.td',
    statut: 'actif',
    dateCreation: '2024-03-01',
    totalPatients: 88,
    totalConsultations: 195,
  },
  {
    id: 'etab-4',
    nom: 'Polyclinique du Chari',
    code: 'PDC-04',
    type: 'clinique',
    ville: "N'Djamena",
    pays: 'Tchad',
    adresse: "Quartier Farcha, N'Djamena",
    telephone: '+235 22 52 44 88',
    email: 'contact@polyclinique-chari.td',
    directeurNom: 'Dr. Amina Bichara',
    directeurEmail: 'directeur@polychari.td',
    statut: 'suspendu',
    dateCreation: '2024-04-10',
    totalPatients: 64,
    totalConsultations: 140,
  },
];

const DEFAULT_USERS = [
  // Super Administrateur DARÔ (opérateur du réseau national)
  {
    id: 'u-superadmin',
    nom: 'Mbaï',
    prenom: 'Fred',
    email: 'fredmbaiamne@gmail.com',
    nomUtilisateur: 'fred.mbai',
    motDePasse: 'daro2025',
    role: 'superadmin',
    specialite: 'Concepteur de la plateforme & Super Administrateur DARÔ',
    telephone: '+235 66 00 00 00',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    actif: true,
    statut: 'actif',
    dateCreation: '2023-12-01',
    etablissementId: undefined,
    etablissementNom: 'Direction Réseau DARÔ Santé',
  },
  // Établissement 1: Clinique Médicale Espoir (N'Djamena)
  {
    id: 'u-dir',
    nom: 'Mahamat',
    prenom: 'Dr. Haroun',
    email: 'directeur@daro-sante.td',
    role: 'directeur',
    specialite: 'Médecin Chef / Direction Générale',
    telephone: '+235 66 21 00 01',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
    actif: true,
    dateCreation: '2024-01-10',
    etablissementId: 'etab-1',
    etablissementNom: 'Clinique Médicale Espoir',
  },
  {
    id: 'u-gest',
    nom: 'Brahim',
    prenom: 'Mariam',
    email: 'gestion@daro-sante.td',
    role: 'gestionnaire',
    specialite: 'Administration & Finances',
    telephone: '+235 99 45 12 34',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    actif: true,
    dateCreation: '2024-01-15',
    etablissementId: 'etab-1',
    etablissementNom: 'Clinique Médicale Espoir',
  },
  {
    id: 'u-med-1',
    nom: 'Djibrine',
    prenom: 'Dr. Kaltouma',
    email: 'k.djibrine@daro-sante.td',
    role: 'medecin',
    specialite: 'Médecine Générale & Urgences',
    telephone: '+235 66 78 90 12',
    avatar: 'https://images.unsplash.com/photo-1594824813686-778f6d2f33c0?w=300&auto=format&fit=crop&q=80',
    actif: true,
    dateCreation: '2024-02-01',
    etablissementId: 'etab-1',
    etablissementNom: 'Clinique Médicale Espoir',
  },
  {
    id: 'u-med-2',
    nom: 'Alladoum',
    prenom: 'Dr. Ngarbaroum',
    email: 'n.alladoum@daro-sante.td',
    role: 'medecin',
    specialite: 'Pédiatrie & Santé Maternelle',
    telephone: '+235 99 33 22 11',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop&q=80',
    actif: true,
    dateCreation: '2024-02-10',
    etablissementId: 'etab-1',
    etablissementNom: 'Clinique Médicale Espoir',
  },
  {
    id: 'u-inf',
    nom: 'Saleh',
    prenom: 'Moussa',
    email: 'm.saleh@daro-sante.td',
    role: 'infirmier',
    specialite: 'Infirmier Major / Triage Urgences',
    telephone: '+235 63 11 22 33',
    avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&auto=format&fit=crop&q=80',
    actif: true,
    dateCreation: '2024-02-15',
    etablissementId: 'etab-1',
    etablissementNom: 'Clinique Médicale Espoir',
  },
  {
    id: 'u-acc',
    nom: 'Senoussi',
    prenom: 'Fatimé',
    email: 'accueil@daro-sante.td',
    role: 'accueil',
    specialite: 'Accueil & Enregistrement Patients',
    telephone: '+235 95 66 77 88',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    actif: true,
    dateCreation: '2024-03-01',
    etablissementId: 'etab-1',
    etablissementNom: 'Clinique Médicale Espoir',
  },
  {
    id: 'u-resp',
    nom: 'Doudou',
    prenom: 'Major Allafi',
    email: 'soins@daro-sante.td',
    role: 'responsable_soins',
    specialite: 'Cadre Supérieur de Santé',
    telephone: '+235 66 50 40 30',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&auto=format&fit=crop&q=80',
    actif: true,
    dateCreation: '2024-03-05',
    etablissementId: 'etab-1',
    etablissementNom: 'Clinique Médicale Espoir',
  },
  {
    id: 'u-lab',
    nom: 'Oumar',
    prenom: 'Al-Hadj',
    email: 'labo@daro-sante.td',
    role: 'tech_laboratoire',
    specialite: 'Biologie Médicale & Analyses',
    telephone: '+235 66 99 88 77',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    actif: true,
    dateCreation: '2024-03-10',
    etablissementId: 'etab-1',
    etablissementNom: 'Clinique Médicale Espoir',
  },
  {
    id: 'u-rad',
    nom: 'Ngaro',
    prenom: 'Élodie',
    email: 'imagerie@daro-sante.td',
    role: 'tech_imagerie',
    specialite: 'Radiologie & Échographie',
    telephone: '+235 99 88 77 66',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&auto=format&fit=crop&q=80',
    actif: true,
    dateCreation: '2024-03-12',
    etablissementId: 'etab-1',
    etablissementNom: 'Clinique Médicale Espoir',
  },

  // Établissement 2: HGRN
  {
    id: 'u-dir-hgrn',
    nom: 'Souleymane',
    prenom: 'Prof. Djimet',
    email: 'directeur@hgrn.td',
    role: 'directeur',
    specialite: 'Chirurgie & Direction Hôpital HGRN',
    telephone: '+235 66 22 33 44',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop&q=80',
    actif: true,
    dateCreation: '2024-02-15',
    etablissementId: 'etab-2',
    etablissementNom: 'Hôpital Général de Référence Nationale (HGRN)',
  },
  {
    id: 'u-med-hgrn',
    nom: 'Adoum',
    prenom: 'Dr. Zenaba',
    email: 'z.adoum@hgrn.td',
    role: 'medecin',
    specialite: 'Cardiologie & Urgences HGRN',
    telephone: '+235 66 55 44 33',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80',
    actif: true,
    dateCreation: '2024-02-20',
    etablissementId: 'etab-2',
    etablissementNom: 'Hôpital Général de Référence Nationale (HGRN)',
  },

  // Établissement 3: CHR Moundou
  {
    id: 'u-dir-moundou',
    nom: 'Jean',
    prenom: 'Dr. Nodjitoloum',
    email: 'directeur@chr-moundou.td',
    role: 'directeur',
    specialite: 'Santé Publique & Direction CHR',
    telephone: '+235 66 88 11 22',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    actif: true,
    dateCreation: '2024-03-01',
    etablissementId: 'etab-3',
    etablissementNom: 'Centre Hospitalier Régional de Moundou',
  },
];

const DEFAULT_ACTIVITY_LOGS = [
  {
    id: 'act-1',
    timestamp: '2026-09-06T08:15:00.000Z',
    timestampFormatted: '06/09/2026 à 08:15:00',
    userId: 'u-acc',
    userNom: 'Fatimé Senoussi',
    userRole: 'accueil',
    action: 'Arrivée patient',
    details: 'a enregistré l\'arrivée du patient Barka Djimet et émis le ticket DAR-041',
    adresseIP: '192.168.1.45',
    etablissementId: 'etab-1',
    etablissementNom: 'Clinique Médicale Espoir',
  },
  {
    id: 'act-2',
    timestamp: '2026-09-06T08:22:15.000Z',
    timestampFormatted: '06/09/2026 à 08:22:15',
    userId: 'u-inf',
    userNom: 'Moussa Saleh',
    userRole: 'infirmier',
    action: 'Triage urgences',
    details: 'a effectué le triage du ticket DAR-041 (Barka Djimet) : niveau CRITIQUE, orienté vers Dr. Kaltouma',
    adresseIP: '192.168.1.52',
    etablissementId: 'etab-1',
    etablissementNom: 'Clinique Médicale Espoir',
  },
  {
    id: 'act-3',
    timestamp: '2026-09-06T08:25:30.000Z',
    timestampFormatted: '06/09/2026 à 08:25:30',
    userId: 'u-med-1',
    userNom: 'Dr. Kaltouma Djibrine',
    userRole: 'medecin',
    action: 'Prescription examen',
    details: 'a prescrit en urgence l\'examen Goutte Épaisse & Frottis pour Barka Djimet',
    adresseIP: '192.168.1.18',
    etablissementId: 'etab-1',
    etablissementNom: 'Clinique Médicale Espoir',
  },
  {
    id: 'act-4',
    timestamp: '2026-09-06T08:50:10.000Z',
    timestampFormatted: '06/09/2026 à 08:50:10',
    userId: 'u-lab',
    userNom: 'Al-Hadj Oumar',
    userRole: 'tech_laboratoire',
    action: 'Validation examen',
    details: 'a validé les résultats d\'analyse NFS pour Abdelkerim Ousmane (Résultat : Hémoglobine 7.8 g/dL)',
    adresseIP: '192.168.1.60',
    etablissementId: 'etab-1',
    etablissementNom: 'Clinique Médicale Espoir',
  },
  {
    id: 'act-5',
    timestamp: '2026-09-06T09:10:45.000Z',
    timestampFormatted: '06/09/2026 à 09:10:45',
    userId: 'u-gest',
    userNom: 'Mariam Brahim',
    userRole: 'gestionnaire',
    action: 'Paiement facture',
    details: 'a encaissé le paiement de 35 000 FCFA par AirtelMoney pour la facture FAC-2025-056 (Aïcha Mahamat)',
    adresseIP: '192.168.1.12',
    etablissementId: 'etab-1',
    etablissementNom: 'Clinique Médicale Espoir',
  },
];

const DEFAULT_QR_ACCESS_LOGS = [
  {
    id: 'qr-1',
    timestamp: '2026-09-06T08:12:00.000Z',
    timestampFormatted: '06/09/2026 à 08:12:00',
    patientId: 'pat-1',
    patientNom: 'Abdelkerim Ousmane',
    patientMatricule: 'NDJ-2025-0812',
    qrToken: 'DARO-QR-78491-OUSMANE',
    typeAcces: 'public_urgence',
    succes: true,
    tentativeEmail: 'citoyen.secours@gmail.com',
    scanneParNom: 'Citoyen Secours / Public',
    scanneParRole: 'public',
    ip: '41.222.180.14',
    localisation: "N'Djamena (Sabangali), Tchad",
    navigateurAppareil: 'Mobile Safari / iOS 17.5',
    etablissementId: 'etab-1',
    etablissementNom: 'Clinique Médicale Espoir',
  },
  {
    id: 'qr-2',
    timestamp: '2026-09-06T08:14:30.000Z',
    timestampFormatted: '06/09/2026 à 08:14:30',
    patientId: 'pat-1',
    patientNom: 'Abdelkerim Ousmane',
    patientMatricule: 'NDJ-2025-0812',
    qrToken: 'DARO-QR-78491-OUSMANE',
    typeAcces: 'dossier_deverrouille',
    succes: true,
    tentativeEmail: 'm.saleh@daro-sante.td',
    agentNom: 'Infirmier Moussa Saleh',
    agentRole: 'infirmier',
    ip: '192.168.1.52',
    localisation: "N'Djamena (Clinique Espoir), Tchad",
    navigateurAppareil: 'Chrome Mobile / Android 14',
    etablissementId: 'etab-1',
    etablissementNom: 'Clinique Médicale Espoir',
  },
  {
    id: 'qr-3',
    timestamp: '2026-09-06T09:00:15.000Z',
    timestampFormatted: '06/09/2026 à 09:00:15',
    patientId: 'pat-2',
    patientNom: 'Mahamat Aïcha',
    patientMatricule: 'NDJ-2025-0813',
    qrToken: 'DARO-QR-89123-AICHA',
    typeAcces: 'dossier_deverrouille',
    succes: false,
    tentativeEmail: 'inconnu.test@gmail.com',
    agentNom: 'Tentative non autorisée',
    agentRole: 'externe',
    ip: '41.222.181.99',
    localisation: "N'Djamena (Farcha), Tchad",
    navigateurAppareil: 'Firefox Mobile / Android',
    etablissementId: 'etab-1',
    etablissementNom: 'Clinique Médicale Espoir',
  },
];

const DEFAULT_ASSIGNMENTS = [
  {
    id: 'asg-1',
    patientId: 'pat-1',
    patientNom: 'Abdelkerim Ousmane',
    staffId: 'u-med-1',
    staffNom: 'Dr. Kaltouma Djibrine',
    staffRole: 'medecin',
    dateAssignation: '2025-01-10',
    motif: 'Médecin traitant - Suivi Drépanocytose SS & Médecine générale',
    actif: true,
    etablissementId: 'etab-1',
  },
  {
    id: 'asg-2',
    patientId: 'pat-1',
    patientNom: 'Abdelkerim Ousmane',
    staffId: 'u-inf',
    staffNom: 'Moussa Saleh',
    staffRole: 'infirmier',
    dateAssignation: '2025-01-10',
    motif: 'Infirmier référent - Soins et constantes',
    actif: true,
    etablissementId: 'etab-1',
  },
  {
    id: 'asg-3',
    patientId: 'pat-2',
    patientNom: 'Mahamat Aïcha',
    staffId: 'u-med-1',
    staffNom: 'Dr. Kaltouma Djibrine',
    staffRole: 'medecin',
    dateAssignation: '2025-02-15',
    motif: 'Suivi grossesse 30 SA & Asthme bronchique',
    actif: true,
    etablissementId: 'etab-1',
  },
  {
    id: 'asg-4',
    patientId: 'pat-3',
    patientNom: 'Barka Djimet',
    staffId: 'u-med-1',
    staffNom: 'Dr. Kaltouma Djibrine',
    staffRole: 'medecin',
    dateAssignation: '2025-03-01',
    motif: 'Suivi HTA & Crise palustre aiguë',
    actif: true,
    etablissementId: 'etab-1',
  },
  {
    id: 'asg-5',
    patientId: 'pat-4',
    patientNom: 'Yacoub Halimé',
    staffId: 'u-med-2',
    staffNom: 'Dr. Ngarbaroum Alladoum',
    staffRole: 'medecin',
    dateAssignation: '2025-03-10',
    motif: 'Suivi Diabète Type 2 & Cardiopathie',
    actif: true,
    etablissementId: 'etab-1',
  },
  {
    id: 'asg-6',
    patientId: 'pat-4',
    patientNom: 'Yacoub Halimé',
    staffId: 'u-resp',
    staffNom: 'Major Allafi Doudou',
    staffRole: 'responsable_soins',
    dateAssignation: '2025-03-12',
    motif: 'Coordination des soins chroniques',
    actif: true,
    etablissementId: 'etab-1',
  },
  {
    id: 'asg-7',
    patientId: 'pat-5',
    patientNom: 'Ngarmbatina Éric',
    staffId: 'u-med-1',
    staffNom: 'Dr. Kaltouma Djibrine',
    staffRole: 'medecin',
    dateAssignation: '2025-03-14',
    motif: 'Traumatologie & Soins post-urgence',
    actif: true,
    etablissementId: 'etab-1',
  },
];

const DEFAULT_MESSAGES = [
  {
    id: 'm-1',
    senderId: 'u-acc',
    senderNom: 'Fatimé Senoussi',
    senderRole: 'accueil',
    channel: 'urgences-gardes',
    texte: 'Patient Barka Djimet enregistré au guichet avec fièvre aiguë 39.8°C. Ticket DAR-041 émis.',
    timestamp: '08:16',
    lu: true,
    etablissementId: 'etab-1',
  },
  {
    id: 'm-2',
    senderId: 'u-inf',
    senderNom: 'Infirmier Moussa Saleh',
    senderRole: 'infirmier',
    channel: 'urgences-gardes',
    texte: 'Triage effectué : Niveau CRITIQUE. Saturation 93%, tachycarde. Orienté vers Dr. Kaltouma en Box 1.',
    timestamp: '08:22',
    lu: true,
    etablissementId: 'etab-1',
  },
  {
    id: 'm-3',
    senderId: 'u-med-1',
    senderNom: 'Dr. Kaltouma Djibrine',
    senderRole: 'medecin',
    channel: 'urgences-gardes',
    texte: 'Reçu Moussa, je prends en charge immédiatement. Al-Hadj, prépare-toi pour une goutte épaisse urgente.',
    timestamp: '08:24',
    lu: true,
    etablissementId: 'etab-1',
  },
  {
    id: 'm-4',
    senderId: 'u-lab',
    senderNom: 'Tech. Al-Hadj Oumar',
    senderRole: 'tech_laboratoire',
    channel: 'urgences-gardes',
    texte: 'Bien reçu Dr. Kaltouma, réactifs prêts en paillasse d\'urgence, délai 25 minutes.',
    timestamp: '08:26',
    lu: true,
    etablissementId: 'etab-1',
  },
  {
    id: 'tm-1',
    senderId: 'u-inf',
    senderNom: 'Moussa Saleh',
    senderRole: 'infirmier',
    receiverId: 'u-med-1',
    texte: 'Docteur Kaltouma, le patient Ousmane Abdelkerim signale une bonne réponse à l\'hydratation, tension 12/7.',
    timestamp: '08:45',
    lu: true,
    etablissementId: 'etab-1',
  },
  {
    id: 'tm-2',
    senderId: 'u-med-1',
    senderNom: 'Dr. Kaltouma Djibrine',
    senderRole: 'medecin',
    receiverId: 'u-inf',
    texte: 'Parfait Moussa, continue la surveillance du pouls toutes les 2 heures.',
    timestamp: '08:48',
    lu: true,
    etablissementId: 'etab-1',
  },
  {
    id: 'tm-3',
    senderId: 'u-dir',
    senderNom: 'Dr. Haroun Mahamat',
    senderRole: 'directeur',
    receiverId: 'u-med-1',
    texte: 'Dr. Kaltouma, réunion de coordination médicale prévue aujourd\'hui à 14h en salle de conférence.',
    timestamp: '09:00',
    lu: false,
    etablissementId: 'etab-1',
  },
  {
    id: 'pm-1',
    senderId: 'pat-1',
    senderNom: 'Ousmane Abdelkerim',
    senderRole: 'patient',
    receiverId: 'u-med-1',
    staffId: 'u-med-1',
    estPatientChat: true,
    patientId: 'pat-1',
    texte: 'Bonjour Docteur Kaltouma, j\'ai commencé l\'acide folique prescrit. Par contre sous la chaleur actuelle de N\'Djamena, j\'ai ressenti un début de crampes musculaires.',
    timestamp: 'Hier, 17:40',
    lu: true,
    etablissementId: 'etab-1',
  },
  {
    id: 'pm-2',
    senderId: 'u-med-1',
    senderNom: 'Dr. Kaltouma Djibrine',
    senderRole: 'medecin',
    receiverId: 'pat-1',
    staffId: 'u-med-1',
    estPatientChat: true,
    patientId: 'pat-1',
    texte: 'Bonjour Ousmane. C\'est crucial avec votre drépanocytose : doublez votre ration de sachets SRO dilués dans de l\'eau fraîche. Si les douleurs persistent plus de 2h, venez à la clinique avec votre carte QR.',
    timestamp: 'Hier, 18:05',
    lu: true,
    etablissementId: 'etab-1',
  },
  {
    id: 'pm-3',
    senderId: 'pat-1',
    senderNom: 'Ousmane Abdelkerim',
    senderRole: 'patient',
    receiverId: 'u-inf',
    staffId: 'u-inf',
    estPatientChat: true,
    patientId: 'pat-1',
    texte: 'Bonjour Infirmier Moussa, à quelle heure puis-je passer pour le pansement ?',
    timestamp: '09:15',
    lu: false,
    etablissementId: 'etab-1',
  },
  {
    id: 'pm-4',
    senderId: 'pat-2',
    senderNom: 'Aïcha Mahamat',
    senderRole: 'patient',
    receiverId: 'u-med-1',
    staffId: 'u-med-1',
    estPatientChat: true,
    patientId: 'pat-2',
    texte: 'Docteur Kaltouma, mes résultats de glycémie à jeun sont de 0.95 g/L ce matin.',
    timestamp: '09:30',
    lu: false,
    etablissementId: 'etab-1',
  },
];

const DEFAULT_NOTIFICATIONS = [
  {
    id: 'notif-1',
    titre: 'Nouveau patient trié en urgence',
    message: 'Le patient Djimet Barka (Ticket DAR-041) a été trié CRITIQUE par Inf. Moussa et vous a été assigné.',
    timestamp: 'Il y a 5 min',
    lu: false,
    destinataireRole: 'medecin',
    destinataireUserId: 'u-med-1',
    type: 'triage',
    cibleModule: 'queue',
    cibleId: 'q-101',
    etablissementId: 'etab-1',
  },
  {
    id: 'notif-2',
    titre: 'Prescription d\'examen urgent',
    message: 'Dr. Kaltouma a prescrit une Goutte Épaisse en urgence pour Barka Djimet.',
    timestamp: 'Il y a 8 min',
    lu: false,
    destinataireRole: 'tech_laboratoire',
    destinataireUserId: 'u-lab',
    type: 'examen_prescrit',
    cibleModule: 'examens',
    cibleId: 'exa-1',
    etablissementId: 'etab-1',
  },
  {
    id: 'notif-3',
    titre: 'Alerte stock pharmacie critique',
    message: 'Le stock de Ringer Lactate 500ml est tombé à 18 poches (Seuil de sécurité : 50). Réapprovisionnement urgent requis.',
    timestamp: 'Il y a 32 min',
    lu: false,
    destinataireRole: 'gestionnaire',
    type: 'pharmacie_alerte',
    cibleModule: 'pharmacie',
    etablissementId: 'etab-1',
  },
  {
    id: 'notif-4',
    titre: 'Résultats NFS validés',
    message: 'Les résultats d\'analyses NFS de Abdelkerim Ousmane sont disponibles pour consultation.',
    timestamp: 'Il y a 1 heure',
    lu: true,
    destinataireRole: 'medecin',
    destinataireUserId: 'u-med-1',
    type: 'examen_pret',
    cibleModule: 'examens',
    cibleId: 'exa-3',
    etablissementId: 'etab-1',
  },
];

function loadDatabase(): StorageData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initialData: StorageData = {
        etablissements: DEFAULT_ETABLISSEMENTS,
        users: DEFAULT_USERS,
        messages: DEFAULT_MESSAGES,
        notifications: DEFAULT_NOTIFICATIONS,
        assignments: DEFAULT_ASSIGNMENTS,
        activityLogs: DEFAULT_ACTIVITY_LOGS,
        qrAccessLogs: DEFAULT_QR_ACCESS_LOGS,
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      etablissements: parsed.etablissements || DEFAULT_ETABLISSEMENTS,
      users: parsed.users || DEFAULT_USERS,
      messages: parsed.messages || DEFAULT_MESSAGES,
      notifications: parsed.notifications || DEFAULT_NOTIFICATIONS,
      assignments: parsed.assignments || DEFAULT_ASSIGNMENTS,
      activityLogs: parsed.activityLogs || DEFAULT_ACTIVITY_LOGS,
      qrAccessLogs: parsed.qrAccessLogs || DEFAULT_QR_ACCESS_LOGS,
    };
  } catch (e) {
    console.error('Error loading database, returning fallback:', e);
    return {
      etablissements: DEFAULT_ETABLISSEMENTS,
      users: DEFAULT_USERS,
      messages: DEFAULT_MESSAGES,
      notifications: DEFAULT_NOTIFICATIONS,
      assignments: DEFAULT_ASSIGNMENTS,
      activityLogs: DEFAULT_ACTIVITY_LOGS,
      qrAccessLogs: DEFAULT_QR_ACCESS_LOGS,
    };
  }
}

function saveDatabase(data: StorageData) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving database:', e);
  }
}

// In-memory cache backed by file
let db: StorageData = loadDatabase();

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initial complete state fetch
app.get('/api/initial-state', (_req, res) => {
  res.json({
    etablissements: db.etablissements,
    users: db.users,
    messages: db.messages,
    notifications: db.notifications,
    assignments: db.assignments,
    activityLogs: db.activityLogs,
    qrAccessLogs: db.qrAccessLogs,
  });
});

// =============================================================
// ÉTABLISSEMENTS (Super Admin Platform Management)
// =============================================================

app.get('/api/etablissements', (_req, res) => {
  res.json(db.etablissements);
});

app.post('/api/etablissements', (req, res) => {
  const data = req.body;
  if (!data || !data.nom || !data.ville) {
    return res.status(400).json({ error: 'Nom et ville sont requis' });
  }

  const id = data.id || `etab-${Date.now()}`;
  const code = data.code || `${data.ville.slice(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;
  const dirNom = data.directeurNom || 'Directeur Nommé';
  const dirEmail = data.directeurEmail || `directeur@${code.toLowerCase()}.daro.td`;

  const newEtab = {
    id,
    nom: data.nom,
    code,
    type: data.type || 'clinique',
    ville: data.ville,
    pays: data.pays || 'Tchad',
    adresse: data.adresse || `${data.ville}, Tchad`,
    telephone: data.telephone || '+235 22 00 00 00',
    email: data.email || `contact@${code.toLowerCase()}.daro.td`,
    directeurNom: dirNom,
    directeurEmail: dirEmail,
    statut: 'actif',
    dateCreation: new Date().toISOString().split('T')[0],
    totalPatients: 0,
    totalConsultations: 0,
  };

  db.etablissements.push(newEtab);

  // Automatic creation of workstation accounts for each department in this new clinic
  const codePrefix = code.toLowerCase().replace(/[^a-z0-9]/g, '');
  const initialStaff = [
    {
      id: `u-dir-${id}`,
      nom: dirNom.replace(/^(Dr\.|Prof\.)\s*/, ''),
      prenom: dirNom.startsWith('Prof.') ? 'Prof.' : 'Dr.',
      email: dirEmail,
      nomUtilisateur: dirEmail.split('@')[0],
      motDePasse: 'daro2025',
      role: 'directeur',
      specialite: 'Médecin Chef / Direction Générale',
      telephone: data.telephone || '+235 66 00 00 00',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
      actif: true,
      statut: 'actif',
      dateCreation: new Date().toISOString().split('T')[0],
      etablissementId: id,
      etablissementNom: newEtab.nom,
      posteActif: 'Bureau Direction Générale',
    },
    {
      id: `u-med-${id}`,
      nom: 'Garde',
      prenom: 'Dr. Médecin',
      email: `medecin@${codePrefix}.daro.td`,
      nomUtilisateur: `medecin.${codePrefix}`,
      motDePasse: 'daro2025',
      role: 'medecin',
      specialite: 'Médecine Générale & Urgences',
      telephone: data.telephone || '+235 66 11 22 33',
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop&q=80',
      actif: true,
      statut: 'actif',
      dateCreation: new Date().toISOString().split('T')[0],
      etablissementId: id,
      etablissementNom: newEtab.nom,
      posteActif: 'Cabinet de Consultation',
    },
    {
      id: `u-inf-${id}`,
      nom: 'Major',
      prenom: 'Infirmier',
      email: `infirmier@${codePrefix}.daro.td`,
      nomUtilisateur: `infirmier.${codePrefix}`,
      motDePasse: 'daro2025',
      role: 'infirmier',
      specialite: 'Triage & Soins d\'Urgence',
      telephone: data.telephone || '+235 66 22 33 44',
      avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&auto=format&fit=crop&q=80',
      actif: true,
      statut: 'actif',
      dateCreation: new Date().toISOString().split('T')[0],
      etablissementId: id,
      etablissementNom: newEtab.nom,
      posteActif: 'Salle de Triage & Box de Soins',
    },
    {
      id: `u-pharma-${id}`,
      nom: 'Responsable',
      prenom: 'Pharmacien',
      email: `pharmacie@${codePrefix}.daro.td`,
      nomUtilisateur: `pharmacie.${codePrefix}`,
      motDePasse: 'daro2025',
      role: 'responsable_soins',
      specialite: 'Pharmacie Clinique & Gestion des Stocks',
      telephone: data.telephone || '+235 66 33 44 55',
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&auto=format&fit=crop&q=80',
      actif: true,
      statut: 'actif',
      dateCreation: new Date().toISOString().split('T')[0],
      etablissementId: id,
      etablissementNom: newEtab.nom,
      posteActif: 'Officine Pharmacie',
    },
    {
      id: `u-acc-${id}`,
      nom: 'Admissions',
      prenom: 'Agent Accueil & Caisse',
      email: `accueil@${codePrefix}.daro.td`,
      nomUtilisateur: `accueil.${codePrefix}`,
      motDePasse: 'daro2025',
      role: 'accueil',
      specialite: 'Admissions & Facturation Caisse',
      telephone: data.telephone || '+235 66 44 55 66',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      actif: true,
      statut: 'actif',
      dateCreation: new Date().toISOString().split('T')[0],
      etablissementId: id,
      etablissementNom: newEtab.nom,
      posteActif: 'Guichet Accueil & Caisse',
    },
    {
      id: `u-lab-${id}`,
      nom: 'Biologiste',
      prenom: 'Technicien Laboratoire',
      email: `laboratoire@${codePrefix}.daro.td`,
      nomUtilisateur: `laboratoire.${codePrefix}`,
      motDePasse: 'daro2025',
      role: 'tech_laboratoire',
      specialite: 'Analyses Médicales & Biologie',
      telephone: data.telephone || '+235 66 55 66 77',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      actif: true,
      statut: 'actif',
      dateCreation: new Date().toISOString().split('T')[0],
      etablissementId: id,
      etablissementNom: newEtab.nom,
      posteActif: 'Laboratoire d\'Analyses',
    },
  ];

  initialStaff.forEach(st => db.users.push(st));

  // Record real activity log for establishment onboarding
  const now = new Date();
  const logEntry = {
    id: `act-${Date.now()}`,
    timestamp: now.toISOString(),
    timestampFormatted: now.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'medium' }),
    userId: 'u-superadmin',
    userNom: 'Admin Réseau DARÔ',
    userRole: 'superadmin',
    action: 'Création Établissement',
    details: `a enregistré le nouvel établissement "${newEtab.nom}" (${newEtab.ville}) et initialisé les 6 postes de travail (Directeur, Médecin, Infirmier, Pharmacie, Accueil, Laboratoire)`,
    adresseIP: '127.0.0.1',
    etablissementId: id,
    etablissementNom: newEtab.nom,
  };
  db.activityLogs.unshift(logEntry);

  saveDatabase(db);
  res.status(201).json({ etablissement: newEtab, director: initialStaff[0], initialStaff });
});

app.put('/api/etablissements/:id/statut', (req, res) => {
  const { id } = req.params;
  const { statut } = req.body;
  let updated = null;

  db.etablissements = db.etablissements.map(e => {
    if (e.id === id) {
      updated = { ...e, statut: statut || (e.statut === 'actif' ? 'suspendu' : 'actif') };
      return updated;
    }
    return e;
  });

  if (updated) {
    const now = new Date();
    db.activityLogs.unshift({
      id: `act-${Date.now()}`,
      timestamp: now.toISOString(),
      timestampFormatted: now.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'medium' }),
      userId: 'u-superadmin',
      userNom: 'Admin Réseau DARÔ',
      userRole: 'superadmin',
      action: 'Modification Accès Établissement',
      details: `a basculé le statut de "${(updated as any).nom}" vers "${(updated as any).statut}"`,
      adresseIP: '127.0.0.1',
      etablissementId: id,
      etablissementNom: (updated as any).nom,
    });
    saveDatabase(db);
    return res.json(updated);
  }
  res.status(404).json({ error: 'Établissement introuvable' });
});

// =============================================================
// USERS MANAGEMENT (Single-Establishment Personnel)
// =============================================================

app.get('/api/users', (req, res) => {
  const { etablissementId } = req.query;
  if (etablissementId) {
    return res.json(db.users.filter(u => u.etablissementId === etablissementId || u.role === 'superadmin'));
  }
  res.json(db.users);
});

app.post('/api/users', (req, res) => {
  const data = req.body;
  if (!data || !data.nom || !data.email || !data.role) {
    return res.status(400).json({ error: 'Nom, email et rôle sont obligatoires' });
  }

  const newUser = {
    id: data.id || `u-${Date.now()}`,
    nom: data.nom,
    prenom: data.prenom || '',
    email: data.email,
    role: data.role,
    specialite: data.specialite || 'Personnel de Santé',
    telephone: data.telephone || '+235 66 00 00 00',
    avatar: data.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    actif: data.statut ? data.statut === 'actif' : data.actif !== false,
    statut: data.statut || (data.actif !== false ? 'actif' : 'desactive'),
    dateCreation: new Date().toISOString().split('T')[0],
    etablissementId: data.etablissementId,
    etablissementNom: data.etablissementNom,
    motDePasseReinitialise: false,
  };

  db.users.push(newUser);

  // Activity log
  const now = new Date();
  db.activityLogs.unshift({
    id: `act-${Date.now()}`,
    timestamp: now.toISOString(),
    timestampFormatted: now.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'medium' }),
    userId: data.createdByUserId || 'u-dir',
    userNom: data.createdByNom || 'Direction Médicale',
    userRole: data.createdByRole || 'directeur',
    action: 'Création Utilisateur',
    details: `a créé le compte personnel de ${newUser.prenom} ${newUser.nom} (Rôle: ${newUser.role}) pour son établissement`,
    adresseIP: '192.168.1.10',
    etablissementId: data.etablissementId,
    etablissementNom: data.etablissementNom,
  });

  saveDatabase(db);
  res.status(201).json(newUser);
});

app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  let updated = null;

  db.users = db.users.map(u => {
    if (u.id === id) {
      updated = { ...u, ...updates };
      return updated;
    }
    return u;
  });

  if (updated) {
    const now = new Date();
    db.activityLogs.unshift({
      id: `act-${Date.now()}`,
      timestamp: now.toISOString(),
      timestampFormatted: now.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'medium' }),
      userId: updates.modifiedByUserId || 'u-dir',
      userNom: updates.modifiedByNom || 'Direction Médicale',
      userRole: updates.modifiedByRole || 'directeur',
      action: 'Modification Utilisateur',
      details: `a modifié les informations du profil de ${(updated as any).prenom} ${(updated as any).nom}`,
      adresseIP: '192.168.1.10',
      etablissementId: (updated as any).etablissementId,
      etablissementNom: (updated as any).etablissementNom,
    });
    saveDatabase(db);
    return res.json(updated);
  }
  res.status(404).json({ error: 'Utilisateur introuvable' });
});

app.post('/api/users/:id/reset-password', (req, res) => {
  const { id } = req.params;
  const { operatorId, operatorNom, operatorRole } = req.body;
  let targetUser: any = null;

  db.users = db.users.map(u => {
    if (u.id === id) {
      targetUser = { ...u, motDePasseReinitialise: true };
      return targetUser;
    }
    return u;
  });

  if (!targetUser) {
    return res.status(404).json({ error: 'Utilisateur introuvable' });
  }

  // Generate secure one-time reset code / link (password never shown in plain text)
  const resetToken = `DARO-RST-${Math.floor(100000 + Math.random() * 900000)}`;
  const now = new Date();

  db.activityLogs.unshift({
    id: `act-${Date.now()}`,
    timestamp: now.toISOString(),
    timestampFormatted: now.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'medium' }),
    userId: operatorId || 'u-dir',
    userNom: operatorNom || 'Direction Médicale',
    userRole: operatorRole || 'directeur',
    action: 'Réinitialisation Mot de Passe',
    details: `a réinitialisé le mot de passe du compte de ${targetUser.prenom} ${targetUser.nom} (${targetUser.email})`,
    adresseIP: '192.168.1.10',
    etablissementId: targetUser.etablissementId,
    etablissementNom: targetUser.etablissementNom,
  });

  saveDatabase(db);
  res.json({
    success: true,
    message: `Lien de réinitialisation sécurisé envoyé à ${targetUser.email}`,
    resetCode: resetToken,
  });
});

app.put('/api/users/:id/toggle-statut', (req, res) => {
  const { id } = req.params;
  const { operatorId, operatorNom, operatorRole } = req.body;
  let targetUser: any = null;

  db.users = db.users.map(u => {
    if (u.id === id) {
      targetUser = { ...u, actif: !u.actif };
      return targetUser;
    }
    return u;
  });

  if (!targetUser) {
    return res.status(404).json({ error: 'Utilisateur introuvable' });
  }

  const now = new Date();
  const statutStr = targetUser.actif ? 'activé' : 'désactivé';

  db.activityLogs.unshift({
    id: `act-${Date.now()}`,
    timestamp: now.toISOString(),
    timestampFormatted: now.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'medium' }),
    userId: operatorId || 'u-dir',
    userNom: operatorNom || 'Direction Médicale',
    userRole: operatorRole || 'directeur',
    action: 'Statut Compte Utilisateur',
    details: `a ${statutStr} le compte de ${targetUser.prenom} ${targetUser.nom} (${targetUser.role})`,
    adresseIP: '192.168.1.10',
    etablissementId: targetUser.etablissementId,
    etablissementNom: targetUser.etablissementNom,
  });

  saveDatabase(db);
  res.json(targetUser);
});

app.put('/api/users/:id/statut', (req, res) => {
  const { id } = req.params;
  const { statut, operatorId, operatorNom, operatorRole } = req.body;
  let targetUser: any = null;

  if (!['actif', 'desactive', 'en_attente'].includes(statut)) {
    return res.status(400).json({ error: 'Statut invalide. Doit être actif, desactive, ou en_attente.' });
  }

  const isActif = statut === 'actif';

  db.users = db.users.map(u => {
    if (u.id === id) {
      targetUser = { ...u, statut, actif: isActif };
      return targetUser;
    }
    return u;
  });

  if (!targetUser) {
    return res.status(404).json({ error: 'Utilisateur introuvable' });
  }

  const now = new Date();
  const statutLabels: Record<string, string> = {
    actif: 'Actif (Validé)',
    desactive: 'Désactivé (Accès suspendu)',
    en_attente: 'En attente de validation',
  };

  db.activityLogs.unshift({
    id: `act-${Date.now()}`,
    timestamp: now.toISOString(),
    timestampFormatted: now.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'medium' }),
    userId: operatorId || 'u-dir',
    userNom: operatorNom || 'Direction Médicale',
    userRole: operatorRole || 'directeur',
    action: 'Statut Compte Utilisateur',
    details: `a changé le statut du compte de ${targetUser.prenom} ${targetUser.nom} (${targetUser.role}) vers "${statutLabels[statut] || statut}"`,
    adresseIP: '192.168.1.10',
    etablissementId: targetUser.etablissementId,
    etablissementNom: targetUser.etablissementNom,
  });

  saveDatabase(db);
  res.json(targetUser);
});

// =============================================================
// JOURNAL D'ACTIVITÉ & HISTORIQUE DES SCANS QR
// =============================================================

app.get('/api/activity-logs', (req, res) => {
  const { etablissementId } = req.query;
  if (etablissementId) {
    return res.json(db.activityLogs.filter(a => !a.etablissementId || a.etablissementId === etablissementId));
  }
  res.json(db.activityLogs);
});

app.post('/api/activity-logs', (req, res) => {
  const data = req.body;
  const now = new Date();
  const entry = {
    id: data.id || `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: data.timestamp || now.toISOString(),
    timestampFormatted: data.timestampFormatted || now.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'medium' }),
    userId: data.userId || 'u-anon',
    userNom: data.userNom || 'Utilisateur',
    userRole: data.userRole || 'directeur',
    action: data.action || 'Action système',
    details: data.details || 'Opération enregistrée',
    adresseIP: data.adresseIP || '192.168.1.15',
    etablissementId: data.etablissementId,
    etablissementNom: data.etablissementNom,
  };

  db.activityLogs.unshift(entry);
  if (db.activityLogs.length > 200) {
    db.activityLogs = db.activityLogs.slice(0, 200);
  }
  saveDatabase(db);
  res.status(201).json(entry);
});

app.get('/api/qr-access-logs', (req, res) => {
  const { etablissementId } = req.query;
  if (etablissementId) {
    return res.json(db.qrAccessLogs.filter(q => !q.etablissementId || q.etablissementId === etablissementId));
  }
  res.json(db.qrAccessLogs);
});

app.post('/api/qr-access-logs', (req, res) => {
  const data = req.body;
  const now = new Date();
  const entry = {
    id: data.id || `qr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: data.timestamp || now.toISOString(),
    timestampFormatted: data.timestampFormatted || now.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'medium' }),
    patientId: data.patientId,
    patientNom: data.patientNom,
    patientMatricule: data.patientMatricule,
    qrToken: data.qrToken,
    typeAcces: data.typeAcces || 'public_urgence',
    succes: data.succes !== false,
    tentativeEmail: data.tentativeEmail,
    scanneParNom: data.scanneParNom,
    scanneParRole: data.scanneParRole,
    agentNom: data.agentNom,
    agentRole: data.agentRole,
    action: data.action,
    ip: data.ip || '41.222.180.50',
    localisation: data.localisation || "N'Djamena, Tchad",
    navigateurAppareil: data.navigateurAppareil || 'Navigateur Mobile Web',
    etablissementId: data.etablissementId,
    etablissementNom: data.etablissementNom,
  };

  db.qrAccessLogs.unshift(entry);
  if (db.qrAccessLogs.length > 200) {
    db.qrAccessLogs = db.qrAccessLogs.slice(0, 200);
  }
  saveDatabase(db);
  res.status(201).json(entry);
});

// =============================================================
// MESSAGES
// =============================================================

app.get('/api/messages', (req, res) => {
  const { etablissementId } = req.query;
  if (etablissementId) {
    return res.json(db.messages.filter(m => !m.etablissementId || m.etablissementId === etablissementId));
  }
  res.json(db.messages);
});

app.post('/api/messages', (req, res) => {
  const newMsg = req.body;
  if (!newMsg || !newMsg.texte) {
    return res.status(400).json({ error: 'Message text is required' });
  }

  const message = {
    id: newMsg.id || `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    senderId: newMsg.senderId,
    senderNom: newMsg.senderNom,
    senderRole: newMsg.senderRole,
    receiverId: newMsg.receiverId,
    channel: newMsg.channel,
    texte: newMsg.texte,
    timestamp: newMsg.timestamp || new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    estPatientChat: !!newMsg.estPatientChat,
    patientId: newMsg.patientId,
    staffId: newMsg.staffId,
    lu: false,
    etablissementId: newMsg.etablissementId,
  };

  db.messages.push(message);
  saveDatabase(db);
  res.status(201).json(message);
});

app.put('/api/messages/mark-read', (req, res) => {
  const { type, currentUserId, targetId, channel } = req.body;
  let count = 0;

  db.messages = db.messages.map(m => {
    if (type === 'patient') {
      if (m.estPatientChat && m.patientId === targetId) {
        if (m.senderId !== currentUserId && !m.lu) {
          count++;
          return { ...m, lu: true };
        }
      }
    } else if (type === 'team') {
      if (!m.estPatientChat && m.senderId === targetId && m.receiverId === currentUserId) {
        if (!m.lu) {
          count++;
          return { ...m, lu: true };
        }
      }
    } else if (type === 'channel' && channel) {
      if (!m.estPatientChat && m.channel === channel && m.senderId !== currentUserId) {
        if (!m.lu) {
          count++;
          return { ...m, lu: true };
        }
      }
    }
    return m;
  });

  if (count > 0) {
    saveDatabase(db);
  }
  res.json({ success: true, markedCount: count });
});

// =============================================================
// NOTIFICATIONS
// =============================================================

app.get('/api/notifications', (req, res) => {
  const { etablissementId } = req.query;
  if (etablissementId) {
    return res.json(db.notifications.filter(n => !n.etablissementId || n.etablissementId === etablissementId));
  }
  res.json(db.notifications);
});

app.post('/api/notifications', (req, res) => {
  const newNotif = req.body;
  const notif = {
    id: newNotif.id || `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    titre: newNotif.titre,
    message: newNotif.message,
    timestamp: newNotif.timestamp || 'À l\'instant',
    lu: false,
    destinataireRole: newNotif.destinataireRole,
    destinataireUserId: newNotif.destinataireUserId,
    type: newNotif.type || 'systeme',
    cibleModule: newNotif.cibleModule,
    cibleId: newNotif.cibleId,
    etablissementId: newNotif.etablissementId,
  };

  db.notifications.unshift(notif);
  saveDatabase(db);
  res.status(201).json(notif);
});

app.put('/api/notifications/:id/read', (req, res) => {
  const { id } = req.params;
  let found = false;
  db.notifications = db.notifications.map(n => {
    if (n.id === id) {
      found = true;
      return { ...n, lu: true };
    }
    return n;
  });
  if (found) {
    saveDatabase(db);
  }
  res.json({ success: found });
});

app.put('/api/notifications/read-all', (req, res) => {
  const { userId, userRole } = req.body;
  db.notifications = db.notifications.map(n => {
    const isTarget = (!n.destinataireUserId || n.destinataireUserId === userId) &&
                     (!n.destinataireRole || n.destinataireRole === userRole);
    if (isTarget) {
      return { ...n, lu: true };
    }
    return n;
  });
  saveDatabase(db);
  res.json({ success: true });
});

// =============================================================
// CARE ASSIGNMENTS
// =============================================================

app.get('/api/assignments', (req, res) => {
  const { etablissementId } = req.query;
  if (etablissementId) {
    return res.json(db.assignments.filter(a => !a.etablissementId || a.etablissementId === etablissementId));
  }
  res.json(db.assignments);
});

app.post('/api/assignments', (req, res) => {
  const data = req.body;
  const newAssignment = {
    id: data.id || `asg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    patientId: data.patientId,
    patientNom: data.patientNom,
    patientMatricule: data.patientMatricule,
    staffId: data.staffId,
    staffNom: data.staffNom,
    staffRole: data.staffRole,
    roleAssignation: data.roleAssignation,
    dateAssignation: data.dateAssignation || new Date().toISOString().split('T')[0],
    motif: data.motif || 'Suivi médical',
    notes: data.notes,
    actif: true,
    etablissementId: data.etablissementId,
  };

  const existingIdx = db.assignments.findIndex(
    a => a.patientId === newAssignment.patientId && a.staffId === newAssignment.staffId
  );

  if (existingIdx >= 0) {
    db.assignments[existingIdx] = { ...db.assignments[existingIdx], ...newAssignment, actif: true };
  } else {
    db.assignments.push(newAssignment);
  }

  saveDatabase(db);
  res.status(201).json(newAssignment);
});

app.delete('/api/assignments/:id', (req, res) => {
  const { id } = req.params;
  db.assignments = db.assignments.filter(a => a.id !== id);
  saveDatabase(db);
  res.json({ success: true });
});

// -------------------------------------------------------------
// Vite Middleware / Static Servicing
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DARÔ Multi-Hospital Network Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
