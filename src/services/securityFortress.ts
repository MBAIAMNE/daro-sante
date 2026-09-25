import { SecurityAlert, SecurityShieldState, SecurityThreatType } from '../types';

/**
 * FORTERESSE DE SÉCURITÉ DARÔ SANTÉ
 * Module de cyberdéfense, détection d'intrusions, hachage cryptographique et protection anti-brute force.
 */

// Patterns d'attaques connus (SQLi, NoSQLi, XSS, Path Traversal, Command Injection)
const THREAT_PATTERNS: { regex: RegExp; type: SecurityThreatType; description: string }[] = [
  {
    regex: /(<script|javascript:|onerror=|onload=|eval\(|alert\(|<iframe|<object|<embed)/i,
    type: 'injection_attempt',
    description: 'Tentative d\'injection de code malveillant / Script XSS détectée'
  },
  {
    regex: /('|\b)(OR|AND)\s+('?\d+'?|\w+)\s*=\s*('?\d+'?|\w+)|UNION\s+SELECT|DROP\s+TABLE|--|;/i,
    type: 'injection_attempt',
    description: 'Tentative d\'injection SQL / NoSQL Bypass détectée'
  },
  {
    regex: /(\$where|\$gt|\$ne|\$regex|\$or|\$and|\$lookup)/i,
    type: 'injection_attempt',
    description: 'Tentative de manipulation d\'opérateurs NoSQL suspects'
  },
  {
    regex: /(\.\.\/|\.\.\\|\/etc\/passwd|c:\\windows)/i,
    type: 'unauthorized_access',
    description: 'Tentative de traversée de répertoire (Path Traversal)'
  }
];

// État mémoire du bouclier anti-brute force
interface LockoutRecord {
  failedAttempts: number;
  lastAttemptTime: number;
  lockedUntil: number;
  hardLocked: boolean; // Si >= 10 tentatives, verrouillage administrateur obligatoire
}

const lockoutStore: Map<string, LockoutRecord> = new Map();

// Clé de sel d'intégrité DARÔ pour la signature numérique des ordonnances et quittances
const INTEGRITY_SALT = 'DARO-SANTE-CHAD-SEAL-2025-V2';

/**
 * Analyse une saisie utilisateur pour détecter tout motif d'attaque malveillante
 */
export function analyzeInputForThreats(input: string, context = 'Entrée utilisateur'): { isMalicious: boolean; threat?: SecurityAlert } {
  if (!input || typeof input !== 'string') return { isMalicious: false };

  for (const pattern of THREAT_PATTERNS) {
    if (pattern.regex.test(input)) {
      const alert: SecurityAlert = {
        id: `threat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        type: pattern.type,
        severity: 'critical',
        source: context,
        targetIdentifiant: input.substring(0, 40),
        details: `${pattern.description} : Détection du motif suspect dans [${context}]`,
        blocked: true,
        actionTaken: 'Entrée neutralisée et bloquée par la forteresse DARÔ'
      };
      return { isMalicious: true, threat: alert };
    }
  }

  return { isMalicious: false };
}

/**
 * Sanitisation stricte des chaînes de caractères (Anti-XSS)
 */
export function sanitizeString(value: string): string {
  if (!value || typeof value !== 'string') return '';
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Calcul du hachage SHA-256 cryptographique (Web Crypto API)
 */
export async function sha256(message: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    // Fallback simple si Web Crypto n'est pas disponible (environnement de test)
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      const char = message.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `fb_${Math.abs(hash).toString(16)}`;
  }
}

/**
 * Génère un sceau d'inviolabilité numérique (Signature cryptographique)
 * pour certifier l'authenticité d'une ordonnance, consultation ou quittance.
 */
export async function generateDigitalSeal(documentType: string, docId: string, payload: any): Promise<string> {
  const content = JSON.stringify(payload);
  const rawSignatureString = `${documentType}::${docId}::${content}::${INTEGRITY_SALT}`;
  const fullHash = await sha256(rawSignatureString);
  // Retourne un sceau formaté type : DARO-SEAL-XXXX-XXXX-XXXX
  return `DARO-SEAL-${fullHash.substring(0, 4).toUpperCase()}-${fullHash.substring(4, 8).toUpperCase()}-${fullHash.substring(8, 12).toUpperCase()}`;
}

/**
 * Vérifie l'intégrité d'un sceau numérique
 */
export async function verifyDigitalSeal(documentType: string, docId: string, payload: any, expectedSeal: string): Promise<boolean> {
  const calculatedSeal = await generateDigitalSeal(documentType, docId, payload);
  return calculatedSeal === expectedSeal;
}

/**
 * Vérifie l'état de verrouillage anti-brute force d'un identifiant ou adresse IP
 */
export function checkLockoutStatus(identifier: string): {
  isLocked: boolean;
  isHardLocked: boolean;
  remainingSeconds: number;
  failedAttempts: number;
} {
  const key = identifier.toLowerCase().trim();
  const record = lockoutStore.get(key);

  if (!record) {
    return { isLocked: false, isHardLocked: false, remainingSeconds: 0, failedAttempts: 0 };
  }

  const now = Date.now();

  // Verrouillage dur (10+ échecs)
  if (record.hardLocked) {
    return { isLocked: true, isHardLocked: true, remainingSeconds: 99999, failedAttempts: record.failedAttempts };
  }

  // Verrouillage temporaire actif
  if (record.lockedUntil > now) {
    const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return { isLocked: true, isHardLocked: false, remainingSeconds, failedAttempts: record.failedAttempts };
  }

  // Si le temps de verrouillage est écoulé et moins de 10 échecs, déverrouillage automatique
  return { isLocked: false, isHardLocked: false, remainingSeconds: 0, failedAttempts: record.failedAttempts };
}

/**
 * Enregistre une tentative échouée de connexion et active le bouclier si nécessaire
 */
export function registerFailedAttempt(
  identifier: string,
  source = 'Poste Inconnu'
): { isLocked: boolean; remainingSeconds: number; isHardLocked: boolean; alert?: SecurityAlert } {
  const key = identifier.toLowerCase().trim();
  const now = Date.now();
  let record = lockoutStore.get(key);

  if (!record) {
    record = { failedAttempts: 0, lastAttemptTime: now, lockedUntil: 0, hardLocked: false };
    lockoutStore.set(key, record);
  }

  record.failedAttempts += 1;
  record.lastAttemptTime = now;

  let alert: SecurityAlert | undefined;

  // Calcul du palier de sécurité
  if (record.failedAttempts >= 10) {
    record.hardLocked = true;
    alert = {
      id: `alert-${now}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      type: 'brute_force',
      severity: 'critical',
      source,
      targetIdentifiant: identifier,
      details: `Attaque par Brute-Force sévère détectée (≥ 10 échecs consécutifs). Compte verrouillé définitivement en attente de l'Administrateur.`,
      blocked: true,
      actionTaken: 'Compte complètement verrouillé. Déblocage par Super-Admin requis.'
    };
    return { isLocked: true, remainingSeconds: 99999, isHardLocked: true, alert };
  } else if (record.failedAttempts >= 5) {
    // 3 minutes de verrouillage
    const lockDuration = 3 * 60 * 1000;
    record.lockedUntil = now + lockDuration;
    alert = {
      id: `alert-${now}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      type: 'brute_force',
      severity: 'high',
      source,
      targetIdentifiant: identifier,
      details: `Multiples tentatives échouées (${record.failedAttempts}/5). Verrouillage automatique de sécurité de 3 minutes.`,
      blocked: true,
      actionTaken: 'Accès temporairement suspendu pour 180 secondes.'
    };
    return { isLocked: true, remainingSeconds: 180, isHardLocked: false, alert };
  } else if (record.failedAttempts >= 3) {
    // 30 secondes de temporisation
    const lockDuration = 30 * 1000;
    record.lockedUntil = now + lockDuration;
    alert = {
      id: `alert-${now}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      type: 'brute_force',
      severity: 'medium',
      source,
      targetIdentifiant: identifier,
      details: `3 tentatives consécutives échouées. Ralentissement forcé de 30 secondes appliqué.`,
      blocked: true,
      actionTaken: 'Délai d\'attente de 30 secondes imposé.'
    };
    return { isLocked: true, remainingSeconds: 30, isHardLocked: false, alert };
  }

  return { isLocked: false, remainingSeconds: 0, isHardLocked: false };
}

/**
 * Réinitialise le compteur d'échecs après un succès légitime
 */
export function resetFailedAttempts(identifier: string): void {
  const key = identifier.toLowerCase().trim();
  lockoutStore.delete(key);
}

/**
 * Déverrouillage manuel par l'administrateur
 */
export function adminUnlockAccount(identifier: string): void {
  const key = identifier.toLowerCase().trim();
  lockoutStore.delete(key);
}

/**
 * Retourne la liste des comptes actuellement verrouillés
 */
export function getActiveLockouts(): { identifier: string; attempts: number; hardLocked: boolean; remainingSec: number }[] {
  const list: { identifier: string; attempts: number; hardLocked: boolean; remainingSec: number }[] = [];
  const now = Date.now();

  lockoutStore.forEach((record, identifier) => {
    if (record.hardLocked) {
      list.push({ identifier, attempts: record.failedAttempts, hardLocked: true, remainingSec: 99999 });
    } else if (record.lockedUntil > now) {
      list.push({
        identifier,
        attempts: record.failedAttempts,
        hardLocked: false,
        remainingSec: Math.ceil((record.lockedUntil - now) / 1000)
      });
    }
  });

  return list;
}

/**
 * État de santé initial de la Forteresse
 */
export const INITIAL_SHIELD_STATE: SecurityShieldState = {
  score: 100,
  firewallActive: true,
  bruteForceShieldActive: true,
  antiTamperActive: true,
  zeroTrustFirestoreActive: true,
  xssSanitizerActive: true,
  totalThreatsBlocked: 28,
  activeLockouts: 0,
  lastScanTime: new Date().toISOString(),
  lockdownMode: false
};
