import QRCode from 'qrcode';
import { Patient } from '../types';

/**
 * Builds the offline-first text payload for the DARÔ Emergency QR Code.
 * 
 * When scanned by ANY standard smartphone camera or QR reader with ZERO internet connection:
 * - Displays patient full name, blood type, and emergency contact in plain text.
 * - Underneath, includes a direct URL for doctors and healthcare staff to access full records remotely.
 * 
 * Designed to be compact (~160 chars) so QR modules are large, sharp, and instantly scannable on screens.
 */
export function generateEmergencyQRPayload(patient: Patient, baseUrl?: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://daro-sante.td';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const appBase = baseUrl || `${origin}${pathname}`;
  const cleanBase = appBase.endsWith('/') ? appBase : `${appBase}/`;
  
  // Direct link for the physician
  const doctorUrl = `${cleanBase}?qr=${encodeURIComponent(patient.qrToken)}`;

  const bloodGroupStr = patient.groupeSanguin && patient.groupeSanguin !== 'Inconnu'
    ? patient.groupeSanguin
    : 'Non determine (a typer au labo)';

  const contactStr = patient.contactUrgenceNom
    ? `${patient.contactUrgenceNom}${patient.contactUrgenceRelation ? ` (${patient.contactUrgenceRelation})` : ''} - ${patient.contactUrgenceTel || 'N/A'}`
    : 'Non renseigne';

  // Concise format: instantly scannable by any mobile camera
  return [
    `URGENCE DARO: ${patient.nom.toUpperCase()} ${patient.prenom}`,
    `GROUPE SANGUIN: ${bloodGroupStr}`,
    `CONTACT URGENCE: ${contactStr}`,
    `LIEN MEDECIN:`,
    doctorUrl,
  ].join('\n');
}

/**
 * Generates a high-contrast, perfectly scannable data URL (PNG) for any phone camera.
 */
export async function generateEmergencyQRDataUrl(
  patient: Patient,
  options?: { width?: number; margin?: number }
): Promise<string> {
  const payload = generateEmergencyQRPayload(patient);
  return QRCode.toDataURL(payload, {
    width: options?.width || 360,
    margin: options?.margin ?? 3,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#000000', // Pure black gives maximum optical contrast on screens and cameras
      light: '#FFFFFF',
    },
  });
}

export interface ParsedQRPayload {
  isDaroQR: boolean;
  token?: string;
  nom?: string;
  prenom?: string;
  groupeSanguin?: string;
  contactUrgenceNom?: string;
  contactUrgenceTel?: string;
  allergies?: string;
  doctorUrl?: string;
  raw: string;
}

/**
 * Extracts information and patient token from scanned QR text.
 * Works with full text payloads, pure tokens, or doctor URLs.
 */
export function parseQRPayload(rawInput: string): ParsedQRPayload {
  const raw = rawInput.trim();
  const result: ParsedQRPayload = {
    isDaroQR: false,
    raw,
  };

  // 1. Check for DARO-QR token pattern directly in text or URL
  const tokenMatch = raw.match(/DARO-QR-[A-Za-z0-9_-]+/i);
  if (tokenMatch) {
    result.isDaroQR = true;
    result.token = tokenMatch[0];
  }

  // 2. Check for URL parameter ?qr=... or ?token=...
  const urlParamMatch = raw.match(/[?&](?:qr|token|patient)=([^&\s]+)/i);
  if (urlParamMatch) {
    result.isDaroQR = true;
    result.token = decodeURIComponent(urlParamMatch[1]);
  }

  // 3. Extract doctor URL if present
  const urlMatch = raw.match(/https?:\/\/[^\s]+/i);
  if (urlMatch) {
    result.doctorUrl = urlMatch[0];
  }

  // 4. Extract offline text fields if present
  const nomMatch = raw.match(/(?:URGENCE\s*DARO|PATIENT)\s*:\s*([^\n]+)/i);
  if (nomMatch) {
    const full = nomMatch[1].trim();
    const parts = full.split(' ');
    result.nom = parts[0];
    result.prenom = parts.slice(1).join(' ');
  }

  const bloodMatch = raw.match(/GROUPE(?:\s*SANGUIN)?\s*:\s*([A-Z0-9+-]+)/i);
  if (bloodMatch) {
    result.groupeSanguin = bloodMatch[1].trim();
  }

  const contactMatch = raw.match(/CONTACT(?:\s*URGENCE)?\s*:\s*([^\n]+)/i);
  if (contactMatch) {
    const contactLine = contactMatch[1].trim();
    result.contactUrgenceNom = contactLine;
    const phoneMatch = contactLine.match(/(\+?[0-9\s-]{8,})/);
    if (phoneMatch) {
      result.contactUrgenceTel = phoneMatch[1].trim();
    }
  }

  const telMatch = raw.match(/TÉL\.?\s*URGENCE\s*:\s*([^\n]+)/i);
  if (telMatch && !result.contactUrgenceTel) {
    result.contactUrgenceTel = telMatch[1].trim();
  }

  const allergiesMatch = raw.match(/ALLERGIES\s*:\s*([^\n]+)/i);
  if (allergiesMatch) {
    result.allergies = allergiesMatch[1].trim();
  }

  return result;
}

/**
 * Finds a matching patient in the dataset from any scanned payload.
 */
export function findPatientFromScannedPayload(rawInput: string, patients: Patient[]): Patient | null {
  const parsed = parseQRPayload(rawInput);
  
  // Direct token match
  if (parsed.token) {
    const byToken = patients.find(p => p.qrToken.toLowerCase() === parsed.token!.toLowerCase());
    if (byToken) return byToken;
  }

  // Matricule match
  const clean = rawInput.trim().toLowerCase();
  const byMatricule = patients.find(p => p.matricule.toLowerCase() === clean);
  if (byMatricule) return byMatricule;

  // Name fallback
  if (parsed.nom) {
    const byName = patients.find(p => 
      p.nom.toLowerCase() === parsed.nom!.toLowerCase() && 
      (!parsed.prenom || p.prenom.toLowerCase().includes(parsed.prenom.toLowerCase()))
    );
    if (byName) return byName;
  }

  return null;
}
