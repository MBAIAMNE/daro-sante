import {
  db,
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  updateDoc,
  deleteDoc,
  query,
  limit,
} from '../lib/firebase';
import {
  Patient,
  User,
  Consultation,
  Ordonnance,
  QueueTicket,
  Etablissement,
  Invoice,
  ChatMessage,
  Notification,
  ActivityLog,
  Examen,
  Appointment,
  TransfertInterHopital,
} from '../types';
import {
  INITIAL_ETABLISSEMENTS,
  INITIAL_USERS,
  INITIAL_PATIENTS,
  INITIAL_QUEUE,
  INITIAL_CONSULTATIONS,
  INITIAL_ORDONNANCES,
} from '../data/mockData';

// Constantes des collections Firestore
export const COLLECTIONS = {
  ETABLISSEMENTS: 'etablissements',
  USERS: 'users',
  PATIENTS: 'patients',
  QUEUE: 'queue',
  CONSULTATIONS: 'consultations',
  ORDONNANCES: 'ordonnances',
  INVOICES: 'invoices',
  EXAMS: 'exams',
  APPOINTMENTS: 'appointments',
  TRANSFERTS: 'transferts',
  CHAT_MESSAGES: 'chat_messages',
  NOTIFICATIONS: 'notifications',
  ACTIVITY_LOGS: 'activity_logs',
};

// Helper to sanitize objects for Firestore (removes undefined fields which Firestore rejects)
export function cleanForFirestore<T>(data: T): any {
  if (data === null || data === undefined) return null;
  return JSON.parse(JSON.stringify(data));
}

// Initialisation / Amorçage initial de la base de données Firestore si elle est vide
export async function seedFirestoreIfEmpty(): Promise<boolean> {
  try {
    // 1. Établissements
    const etabSnap = await getDocs(query(collection(db, COLLECTIONS.ETABLISSEMENTS), limit(1)));
    if (etabSnap.empty) {
      console.log('[Firestore] Amorçage initial des établissements...');
      for (const etab of INITIAL_ETABLISSEMENTS) {
        await setDoc(doc(db, COLLECTIONS.ETABLISSEMENTS, etab.id), cleanForFirestore(etab), { merge: true });
      }
    }

    // 2. Utilisateurs initiaux (soignants & admins)
    const userSnap = await getDocs(query(collection(db, COLLECTIONS.USERS), limit(1)));
    if (userSnap.empty) {
      console.log('[Firestore] Amorçage initial des soignants et administrateurs...');
      for (const user of INITIAL_USERS) {
        await setDoc(doc(db, COLLECTIONS.USERS, user.id), cleanForFirestore({
          ...user,
          motDePasse: user.motDePasse || 'daro2025',
        }), { merge: true });
      }
    }

    // 3. File d'attente
    const queueSnap = await getDocs(query(collection(db, COLLECTIONS.QUEUE), limit(1)));
    if (queueSnap.empty) {
      console.log('[Firestore] Amorçage initial de la file d\'attente...');
      for (const ticket of INITIAL_QUEUE) {
        await setDoc(doc(db, COLLECTIONS.QUEUE, ticket.id), cleanForFirestore(ticket), { merge: true });
      }
    }

    // 4. Consultations
    const consultSnap = await getDocs(query(collection(db, COLLECTIONS.CONSULTATIONS), limit(1)));
    if (consultSnap.empty) {
      console.log('[Firestore] Amorçage initial des consultations...');
      for (const consult of INITIAL_CONSULTATIONS.slice(0, 5)) {
        await setDoc(doc(db, COLLECTIONS.CONSULTATIONS, consult.id), cleanForFirestore(consult), { merge: true });
      }
    }

    // 5. Ordonnances
    const ordSnap = await getDocs(query(collection(db, COLLECTIONS.ORDONNANCES), limit(1)));
    if (ordSnap.empty) {
      console.log('[Firestore] Amorçage initial des ordonnances...');
      for (const ord of INITIAL_ORDONNANCES.slice(0, 5)) {
        await setDoc(doc(db, COLLECTIONS.ORDONNANCES, ord.id), cleanForFirestore(ord), { merge: true });
      }
    }

    // 6. Patients initiaux (si aucun patient n'existe)
    const patSnap = await getDocs(query(collection(db, COLLECTIONS.PATIENTS), limit(1)));
    if (patSnap.empty) {
      console.log('[Firestore] Amorçage initial des patients...');
      for (const patient of INITIAL_PATIENTS.slice(0, 5)) {
        await setDoc(doc(db, COLLECTIONS.PATIENTS, patient.id), cleanForFirestore(patient), { merge: true });
      }
    }

    console.log('[Firestore] Vérification et synchronisation cloud terminées.');
    return true;
  } catch (err) {
    console.warn('[Firestore] Note amorçage cloud (vérifier connexion ou règles) :', err);
    return false;
  }
}

// Écoute temps réel des Établissements
export function subscribeEtablissements(callback: (items: Etablissement[]) => void) {
  try {
    return onSnapshot(
      collection(db, COLLECTIONS.ETABLISSEMENTS),
      snapshot => {
        if (!snapshot.empty) {
          const list: Etablissement[] = [];
          snapshot.forEach(docSnap => {
            list.push(docSnap.data() as Etablissement);
          });
          callback(list);
        }
      },
      error => {
        console.warn('[Firestore subscribeEtablissements]', error.message);
      }
    );
  } catch (e) {
    console.warn('[Firestore subscribeEtablissements init err]', e);
    return () => {};
  }
}

// Écoute temps réel des Utilisateurs / Soignants
export function subscribeUsers(callback: (items: User[]) => void) {
  try {
    return onSnapshot(
      collection(db, COLLECTIONS.USERS),
      snapshot => {
        if (!snapshot.empty) {
          const list: User[] = [];
          snapshot.forEach(docSnap => {
            list.push(docSnap.data() as User);
          });
          callback(list);
        }
      },
      error => {
        console.warn('[Firestore subscribeUsers]', error.message);
      }
    );
  } catch (e) {
    return () => {};
  }
}

// Écoute temps réel des Patients
export function subscribePatients(callback: (items: Patient[]) => void) {
  try {
    return onSnapshot(
      collection(db, COLLECTIONS.PATIENTS),
      snapshot => {
        if (!snapshot.empty) {
          const list: Patient[] = [];
          snapshot.forEach(docSnap => {
            list.push(docSnap.data() as Patient);
          });
          callback(list);
        }
      },
      error => {
        console.warn('[Firestore subscribePatients]', error.message);
      }
    );
  } catch (e) {
    return () => {};
  }
}

// Écoute temps réel de la File d'attente (Queue)
export function subscribeQueue(callback: (items: QueueTicket[]) => void) {
  try {
    return onSnapshot(
      collection(db, COLLECTIONS.QUEUE),
      snapshot => {
        const list: QueueTicket[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as QueueTicket);
        });
        callback(list);
      },
      error => {
        console.warn('[Firestore subscribeQueue]', error.message);
      }
    );
  } catch (e) {
    return () => {};
  }
}

// Écoute temps réel des Consultations
export function subscribeConsultations(callback: (items: Consultation[]) => void) {
  try {
    return onSnapshot(
      collection(db, COLLECTIONS.CONSULTATIONS),
      snapshot => {
        const list: Consultation[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as Consultation);
        });
        callback(list);
      },
      error => {
        console.warn('[Firestore subscribeConsultations]', error.message);
      }
    );
  } catch (e) {
    return () => {};
  }
}

// Écoute temps réel des Ordonnances
export function subscribeOrdonnances(callback: (items: Ordonnance[]) => void) {
  try {
    return onSnapshot(
      collection(db, COLLECTIONS.ORDONNANCES),
      snapshot => {
        const list: Ordonnance[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as Ordonnance);
        });
        callback(list);
      },
      error => {
        console.warn('[Firestore subscribeOrdonnances]', error.message);
      }
    );
  } catch (e) {
    return () => {};
  }
}

// Écoute temps réel du Chat d'équipe
export function subscribeChatMessages(callback: (items: ChatMessage[]) => void) {
  try {
    return onSnapshot(
      collection(db, COLLECTIONS.CHAT_MESSAGES),
      snapshot => {
        const list: ChatMessage[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as ChatMessage);
        });
        callback(list);
      },
      error => {
        console.warn('[Firestore subscribeChatMessages]', error.message);
      }
    );
  } catch (e) {
    return () => {};
  }
}

// Écoute temps réel des Notifications
export function subscribeNotifications(callback: (items: Notification[]) => void) {
  try {
    return onSnapshot(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      snapshot => {
        const list: Notification[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as Notification);
        });
        callback(list);
      },
      error => {
        console.warn('[Firestore subscribeNotifications]', error.message);
      }
    );
  } catch (e) {
    return () => {};
  }
}

// Écoute temps réel des Factures
export function subscribeInvoices(callback: (items: Invoice[]) => void) {
  try {
    return onSnapshot(
      collection(db, COLLECTIONS.INVOICES),
      snapshot => {
        const list: Invoice[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as Invoice);
        });
        callback(list);
      },
      error => {
        console.warn('[Firestore subscribeInvoices]', error.message);
      }
    );
  } catch (e) {
    return () => {};
  }
}

// Écoute temps réel des Examens (Laboratoire & Imagerie)
export function subscribeExams(callback: (items: Examen[]) => void) {
  try {
    return onSnapshot(
      collection(db, COLLECTIONS.EXAMS),
      snapshot => {
        const list: Examen[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as Examen);
        });
        callback(list);
      },
      error => {
        console.warn('[Firestore subscribeExams]', error.message);
      }
    );
  } catch (e) {
    return () => {};
  }
}

// Écoute temps réel des Rendez-vous
export function subscribeAppointments(callback: (items: Appointment[]) => void) {
  try {
    return onSnapshot(
      collection(db, COLLECTIONS.APPOINTMENTS),
      snapshot => {
        const list: Appointment[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as Appointment);
        });
        callback(list);
      },
      error => {
        console.warn('[Firestore subscribeAppointments]', error.message);
      }
    );
  } catch (e) {
    return () => {};
  }
}

// Écoute temps réel des Transferts Inter-Hôpitaux (SAMU / Réseau)
export function subscribeTransferts(callback: (items: TransfertInterHopital[]) => void) {
  try {
    return onSnapshot(
      collection(db, COLLECTIONS.TRANSFERTS),
      snapshot => {
        const list: TransfertInterHopital[] = [];
        snapshot.forEach(docSnap => {
          list.push(docSnap.data() as TransfertInterHopital);
        });
        callback(list);
      },
      error => {
        console.warn('[Firestore subscribeTransferts]', error.message);
      }
    );
  } catch (e) {
    return () => {};
  }
}

// --- Fonctions d'écriture synchronisée Cloud Firestore ---

export async function savePatientCloud(patient: Patient) {
  try {
    await setDoc(doc(db, COLLECTIONS.PATIENTS, patient.id), cleanForFirestore(patient), { merge: true });
    return true;
  } catch (e) {
    console.warn('[savePatientCloud error]', e);
    return false;
  }
}

export async function saveUserCloud(user: User) {
  try {
    await setDoc(doc(db, COLLECTIONS.USERS, user.id), cleanForFirestore(user), { merge: true });
    return true;
  } catch (e) {
    console.warn('[saveUserCloud error]', e);
    return false;
  }
}

export async function saveConsultationCloud(consultation: Consultation) {
  try {
    await setDoc(doc(db, COLLECTIONS.CONSULTATIONS, consultation.id), cleanForFirestore(consultation), { merge: true });
    return true;
  } catch (e) {
    console.warn('[saveConsultationCloud error]', e);
    return false;
  }
}

export async function saveOrdonnanceCloud(ordonnance: Ordonnance) {
  try {
    await setDoc(doc(db, COLLECTIONS.ORDONNANCES, ordonnance.id), cleanForFirestore(ordonnance), { merge: true });
    return true;
  } catch (e) {
    console.warn('[saveOrdonnanceCloud error]', e);
    return false;
  }
}

export async function saveQueueTicketCloud(ticket: QueueTicket) {
  try {
    await setDoc(doc(db, COLLECTIONS.QUEUE, ticket.id), cleanForFirestore(ticket), { merge: true });
    return true;
  } catch (e) {
    console.warn('[saveQueueTicketCloud error]', e);
    return false;
  }
}

export async function removeQueueTicketCloud(ticketId: string) {
  try {
    await deleteDoc(doc(db, COLLECTIONS.QUEUE, ticketId));
    return true;
  } catch (e) {
    console.warn('[removeQueueTicketCloud error]', e);
    return false;
  }
}

export async function saveChatMessageCloud(message: ChatMessage) {
  try {
    await setDoc(doc(db, COLLECTIONS.CHAT_MESSAGES, message.id), cleanForFirestore(message), { merge: true });
    return true;
  } catch (e) {
    console.warn('[saveChatMessageCloud error]', e);
    return false;
  }
}

export async function saveNotificationCloud(notif: Notification) {
  try {
    await setDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notif.id), cleanForFirestore(notif), { merge: true });
    return true;
  } catch (e) {
    console.warn('[saveNotificationCloud error]', e);
    return false;
  }
}

export async function saveEtablissementCloud(etab: Etablissement) {
  try {
    await setDoc(doc(db, COLLECTIONS.ETABLISSEMENTS, etab.id), cleanForFirestore(etab), { merge: true });
    return true;
  } catch (e) {
    console.warn('[saveEtablissementCloud error]', e);
    return false;
  }
}

export async function saveInvoiceCloud(invoice: Invoice) {
  try {
    await setDoc(doc(db, COLLECTIONS.INVOICES, invoice.id), cleanForFirestore(invoice), { merge: true });
    return true;
  } catch (e) {
    console.warn('[saveInvoiceCloud error]', e);
    return false;
  }
}

export async function saveExamCloud(exam: Examen) {
  try {
    await setDoc(doc(db, COLLECTIONS.EXAMS, exam.id), cleanForFirestore(exam), { merge: true });
    return true;
  } catch (e) {
    console.warn('[saveExamCloud error]', e);
    return false;
  }
}

export async function saveAppointmentCloud(apt: Appointment) {
  try {
    await setDoc(doc(db, COLLECTIONS.APPOINTMENTS, apt.id), cleanForFirestore(apt), { merge: true });
    return true;
  } catch (e) {
    console.warn('[saveAppointmentCloud error]', e);
    return false;
  }
}

export async function saveTransfertCloud(transfert: TransfertInterHopital) {
  try {
    await setDoc(doc(db, COLLECTIONS.TRANSFERTS, transfert.id), cleanForFirestore(transfert), { merge: true });
    return true;
  } catch (e) {
    console.warn('[saveTransfertCloud error]', e);
    return false;
  }
}
