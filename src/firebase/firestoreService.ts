import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './config';
import {
  StudentProfile,
  RegisteredAcademy,
  ClassSession,
  Invoice,
  SparringSession,
  BirthdayPerson,
  CRMLead,
  RetentionAlertItem
} from '../types';

// Helper to remove undefined values since Firestore rejects undefined fields
function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const clean: Record<string, any> = {};
  Object.keys(obj).forEach((key) => {
    const val = obj[key];
    if (val !== undefined) {
      if (val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
        clean[key] = sanitizeForFirestore(val);
      } else {
        clean[key] = val;
      }
    }
  });
  return clean;
}

// -------------------------------------------------------------
// STUDENTS (Alunos no Tatame - Multi-acesso e sem perda de dados)
// -------------------------------------------------------------
export function subscribeToStudents(
  onUpdate: (students: StudentProfile[]) => void,
  onError?: (err: unknown) => void
) {
  const colPath = 'students';
  return onSnapshot(
    collection(db, colPath),
    (snapshot) => {
      if (!snapshot.empty) {
        const students: StudentProfile[] = [];
        snapshot.forEach((docSnap) => {
          students.push(docSnap.data() as StudentProfile);
        });
        onUpdate(students);
      }
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, colPath);
    }
  );
}

export async function saveStudentToFirestore(student: StudentProfile): Promise<void> {
  const colPath = 'students';
  try {
    const studentDocRef = doc(db, colPath, student.id);
    await setDoc(studentDocRef, sanitizeForFirestore(student), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${colPath}/${student.id}`);
  }
}

export async function removeStudentFromFirestore(studentId: string): Promise<void> {
  const colPath = 'students';
  try {
    await deleteDoc(doc(db, colPath, studentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${colPath}/${studentId}`);
  }
}

// -------------------------------------------------------------
// ACADEMIES (Unidades e Franquias)
// -------------------------------------------------------------
export function subscribeToAcademies(
  onUpdate: (academies: RegisteredAcademy[]) => void,
  onError?: (err: unknown) => void
) {
  const colPath = 'academies';
  return onSnapshot(
    collection(db, colPath),
    (snapshot) => {
      if (!snapshot.empty) {
        const academies: RegisteredAcademy[] = [];
        snapshot.forEach((docSnap) => {
          academies.push(docSnap.data() as RegisteredAcademy);
        });
        onUpdate(academies);
      }
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, colPath);
    }
  );
}

export async function saveAcademyToFirestore(academy: RegisteredAcademy): Promise<void> {
  const colPath = 'academies';
  try {
    const docRef = doc(db, colPath, academy.id);
    await setDoc(docRef, sanitizeForFirestore(academy), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${colPath}/${academy.id}`);
  }
}

// -------------------------------------------------------------
// CLASSES (Grade de Aulas e Chamada de Presença)
// -------------------------------------------------------------
export function subscribeToClasses(
  onUpdate: (classes: ClassSession[]) => void,
  onError?: (err: unknown) => void
) {
  const colPath = 'classes';
  return onSnapshot(
    collection(db, colPath),
    (snapshot) => {
      if (!snapshot.empty) {
        const classes: ClassSession[] = [];
        snapshot.forEach((docSnap) => {
          classes.push(docSnap.data() as ClassSession);
        });
        onUpdate(classes);
      }
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, colPath);
    }
  );
}

export async function saveClassToFirestore(classSession: ClassSession): Promise<void> {
  const colPath = 'classes';
  try {
    const docRef = doc(db, colPath, classSession.id);
    await setDoc(docRef, sanitizeForFirestore(classSession), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${colPath}/${classSession.id}`);
  }
}

// -------------------------------------------------------------
// INVOICES (Faturas Financeiras & Pix)
// -------------------------------------------------------------
export function subscribeToInvoices(
  onUpdate: (invoices: Invoice[]) => void,
  onError?: (err: unknown) => void
) {
  const colPath = 'invoices';
  return onSnapshot(
    collection(db, colPath),
    (snapshot) => {
      if (!snapshot.empty) {
        const invoices: Invoice[] = [];
        snapshot.forEach((docSnap) => {
          invoices.push(docSnap.data() as Invoice);
        });
        onUpdate(invoices);
      }
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, colPath);
    }
  );
}

export async function saveInvoiceToFirestore(invoice: Invoice): Promise<void> {
  const colPath = 'invoices';
  try {
    const docRef = doc(db, colPath, invoice.id);
    await setDoc(docRef, sanitizeForFirestore(invoice), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${colPath}/${invoice.id}`);
  }
}

// -------------------------------------------------------------
// SPARRING SESSIONS (Diário de Rola)
// -------------------------------------------------------------
export function subscribeToSparringSessions(
  onUpdate: (sessions: SparringSession[]) => void,
  onError?: (err: unknown) => void
) {
  const colPath = 'sparring_sessions';
  return onSnapshot(
    collection(db, colPath),
    (snapshot) => {
      if (!snapshot.empty) {
        const sessions: SparringSession[] = [];
        snapshot.forEach((docSnap) => {
          sessions.push(docSnap.data() as SparringSession);
        });
        onUpdate(sessions);
      }
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, colPath);
    }
  );
}

export async function saveSparringSessionToFirestore(session: SparringSession): Promise<void> {
  const colPath = 'sparring_sessions';
  try {
    const docRef = doc(db, colPath, session.id);
    await setDoc(docRef, sanitizeForFirestore(session), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${colPath}/${session.id}`);
  }
}

// -------------------------------------------------------------
// BIRTHDAYS (Aniversariantes)
// -------------------------------------------------------------
export function subscribeToBirthdays(
  onUpdate: (birthdays: BirthdayPerson[]) => void,
  onError?: (err: unknown) => void
) {
  const colPath = 'birthdays';
  return onSnapshot(
    collection(db, colPath),
    (snapshot) => {
      if (!snapshot.empty) {
        const list: BirthdayPerson[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as BirthdayPerson);
        });
        onUpdate(list);
      }
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, colPath);
    }
  );
}

export async function saveBirthdayToFirestore(person: BirthdayPerson): Promise<void> {
  const colPath = 'birthdays';
  try {
    const docRef = doc(db, colPath, person.id);
    await setDoc(docRef, sanitizeForFirestore(person), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${colPath}/${person.id}`);
  }
}

// -------------------------------------------------------------
// SEED INITIAL DATA IF FIRESTORE EMPTY
// Sincroniza e garante que nenhum dado local seja perdido!
// -------------------------------------------------------------
export async function seedInitialFirestoreDataIfEmpty(initial: {
  students: StudentProfile[];
  academies: RegisteredAcademy[];
  classes: ClassSession[];
  invoices: Invoice[];
  sparringSessions: SparringSession[];
  birthdays: BirthdayPerson[];
}): Promise<void> {
  try {
    // Check students collection
    const studentsSnap = await getDocs(collection(db, 'students'));
    if (studentsSnap.empty && initial.students.length > 0) {
      console.log('[Firestore] Seeding initial students to cloud database...');
      const batch = writeBatch(db);
      initial.students.forEach((s) => {
        const docRef = doc(db, 'students', s.id);
        batch.set(docRef, sanitizeForFirestore(s));
      });
      await batch.commit();
      console.log('[Firestore] Students seeded successfully.');
    }

    // Check academies collection
    const academiesSnap = await getDocs(collection(db, 'academies'));
    if (academiesSnap.empty && initial.academies.length > 0) {
      console.log('[Firestore] Seeding initial academies to cloud database...');
      const batch = writeBatch(db);
      initial.academies.forEach((a) => {
        const docRef = doc(db, 'academies', a.id);
        batch.set(docRef, sanitizeForFirestore(a));
      });
      await batch.commit();
      console.log('[Firestore] Academies seeded successfully.');
    }

    // Check classes collection
    const classesSnap = await getDocs(collection(db, 'classes'));
    if (classesSnap.empty && initial.classes.length > 0) {
      console.log('[Firestore] Seeding initial classes to cloud database...');
      const batch = writeBatch(db);
      initial.classes.forEach((c) => {
        const docRef = doc(db, 'classes', c.id);
        batch.set(docRef, sanitizeForFirestore(c));
      });
      await batch.commit();
      console.log('[Firestore] Classes seeded successfully.');
    }

    // Check invoices collection
    const invoicesSnap = await getDocs(collection(db, 'invoices'));
    if (invoicesSnap.empty && initial.invoices.length > 0) {
      console.log('[Firestore] Seeding initial invoices to cloud database...');
      const batch = writeBatch(db);
      initial.invoices.forEach((inv) => {
        const docRef = doc(db, 'invoices', inv.id);
        batch.set(docRef, sanitizeForFirestore(inv));
      });
      await batch.commit();
      console.log('[Firestore] Invoices seeded successfully.');
    }

    // Check sparring collection
    const sparringSnap = await getDocs(collection(db, 'sparring_sessions'));
    if (sparringSnap.empty && initial.sparringSessions.length > 0) {
      const batch = writeBatch(db);
      initial.sparringSessions.forEach((sp) => {
        const docRef = doc(db, 'sparring_sessions', sp.id);
        batch.set(docRef, sanitizeForFirestore(sp));
      });
      await batch.commit();
    }

    // Check birthdays collection
    const birthdaysSnap = await getDocs(collection(db, 'birthdays'));
    if (birthdaysSnap.empty && initial.birthdays.length > 0) {
      const batch = writeBatch(db);
      initial.birthdays.forEach((b) => {
        const docRef = doc(db, 'birthdays', b.id);
        batch.set(docRef, sanitizeForFirestore(b));
      });
      await batch.commit();
    }
  } catch (error) {
    console.warn('[Firestore] Initial seeding non-blocking note:', error);
  }
}
