/**
 * Firebase Firestore Service
 * Integrated for project: quan-li-to---3
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  getDocFromServer,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import {
  AppSettings,
  AttendanceRecord,
  PointRecord,
  Student,
} from '../types';
import {
  DEFAULT_SETTINGS,
  DEMO_STUDENTS,
  getDemoAttendanceRecords,
  getDemoPointRecords,
} from '../data/defaultConfig';
import {
  saveSettings as saveLocalSettings,
  saveStudents as saveLocalStudents,
  savePointRecords as saveLocalPoints,
  saveAttendanceRecords as saveLocalAttendance,
  loadSettings as loadLocalSettings,
  loadStudents as loadLocalStudents,
  loadPointRecords as loadLocalPoints,
  loadAttendanceRecords as loadLocalAttendance,
} from './storage';

export const firebaseConfig = {
  apiKey: 'AIzaSyDc-Lz848LnAEaeMu5G0gNCH6WHS_YBXf4',
  authDomain: 'quan-li-to---3.firebaseapp.com',
  projectId: 'quan-li-to---3',
  storageBucket: 'quan-li-to---3.appspot.com',
  messagingSenderId: '31928492882',
  appId: '1:31928492882:web:b5edd62805c395d50/581b',
  measurementId: 'G-H82DJQ51P9',
};

// Initialize Firebase App singleton
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

export type SyncStatus = 'connecting' | 'connected' | 'syncing' | 'offline' | 'error';

/**
 * Validate connection to Firestore using getDocFromServer
 */
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'settings', 'current'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore client is currently offline or connecting...');
      return false;
    }
    // Connected or permission response received from server
    return true;
  }
}

/**
 * Seed initial data if the Firestore collection is empty
 */
let isSeeding = false;
export async function seedInitialDataIfEmpty(): Promise<void> {
  if (isSeeding) return;
  try {
    const studentsSnap = await getDocs(collection(db, 'students'));
    if (studentsSnap.empty) {
      isSeeding = true;
      console.log('Seeding initial data to Firestore...');

      // Seed settings
      const currentLocalSettings = loadLocalSettings();
      await setDoc(doc(db, 'settings', 'current'), currentLocalSettings);

      // Seed students
      const currentLocalStudents = loadLocalStudents();
      const studentsToSeed = currentLocalStudents.length > 0 ? currentLocalStudents : DEMO_STUDENTS;
      const batch1 = writeBatch(db);
      studentsToSeed.forEach((student) => {
        batch1.set(doc(db, 'students', student.id), student);
      });
      await batch1.commit();

      // Seed points
      const currentLocalPoints = loadLocalPoints();
      const pointsToSeed = currentLocalPoints.length > 0 ? currentLocalPoints : getDemoPointRecords();
      const batch2 = writeBatch(db);
      pointsToSeed.forEach((point) => {
        batch2.set(doc(db, 'points', point.id), point);
      });
      await batch2.commit();

      // Seed attendance
      const currentLocalAtt = loadLocalAttendance();
      const attToSeed = currentLocalAtt.length > 0 ? currentLocalAtt : getDemoAttendanceRecords();
      const batch3 = writeBatch(db);
      attToSeed.forEach((att) => {
        batch3.set(doc(db, 'attendance', att.id), att);
      });
      await batch3.commit();

      console.log('Successfully seeded data to Firestore.');
    }
  } catch (error) {
    console.warn('Initial seeding note:', error);
  } finally {
    isSeeding = false;
  }
}

/**
 * Real-time subscribers for Firestore collections
 */
export function subscribeToRealtimeFirestore(
  onDataChange: (payload: {
    settings?: AppSettings;
    students?: Student[];
    points?: PointRecord[];
    attendance?: AttendanceRecord[];
  }) => void,
  onStatusChange: (status: SyncStatus) => void
): () => void {
  onStatusChange('connecting');
  const unsubscribers: Unsubscribe[] = [];

  // Check connection
  testConnection().then((ok) => {
    if (ok) {
      onStatusChange('connected');
      seedInitialDataIfEmpty();
    } else {
      onStatusChange('offline');
    }
  });

  try {
    // 1. Settings listener
    const unsubSettings = onSnapshot(
      doc(db, 'settings', 'current'),
      (snap) => {
        onStatusChange('connected');
        if (snap.exists()) {
          const data = snap.data() as AppSettings;
          saveLocalSettings(data);
          onDataChange({ settings: data });
        }
      },
      (err) => {
        console.warn('Firestore Settings snapshot warning:', err);
        onStatusChange('offline');
      }
    );
    unsubscribers.push(unsubSettings);

    // 2. Students listener
    const unsubStudents = onSnapshot(
      collection(db, 'students'),
      (snap) => {
        onStatusChange('connected');
        if (!snap.empty) {
          const studentsList: Student[] = [];
          snap.forEach((d) => studentsList.push(d.data() as Student));
          // Sort stably by ID or existing order
          saveLocalStudents(studentsList);
          onDataChange({ students: studentsList });
        } else {
          // If empty, trigger seed
          seedInitialDataIfEmpty();
        }
      },
      (err) => {
        console.warn('Firestore Students snapshot warning:', err);
        onStatusChange('offline');
      }
    );
    unsubscribers.push(unsubStudents);

    // 3. Points listener
    const unsubPoints = onSnapshot(
      collection(db, 'points'),
      (snap) => {
        onStatusChange('connected');
        const pointsList: PointRecord[] = [];
        snap.forEach((d) => pointsList.push(d.data() as PointRecord));
        // Sort descending by date / createdAt
        pointsList.sort((a, b) => (b.createdAt || b.date).localeCompare(a.createdAt || a.date));
        saveLocalPoints(pointsList);
        onDataChange({ points: pointsList });
      },
      (err) => {
        console.warn('Firestore Points snapshot warning:', err);
        onStatusChange('offline');
      }
    );
    unsubscribers.push(unsubPoints);

    // 4. Attendance listener
    const unsubAttendance = onSnapshot(
      collection(db, 'attendance'),
      (snap) => {
        onStatusChange('connected');
        const attList: AttendanceRecord[] = [];
        snap.forEach((d) => attList.push(d.data() as AttendanceRecord));
        saveLocalAttendance(attList);
        onDataChange({ attendance: attList });
      },
      (err) => {
        console.warn('Firestore Attendance snapshot warning:', err);
        onStatusChange('offline');
      }
    );
    unsubscribers.push(unsubAttendance);
  } catch (e) {
    console.error('Error attaching Firestore listeners', e);
    onStatusChange('error');
  }

  return () => {
    unsubscribers.forEach((u) => u());
  };
}

/**
 * Mutator Functions to Write Directly to Firestore
 */
export async function updateSettingsInFirestore(settings: AppSettings): Promise<void> {
  saveLocalSettings(settings);
  try {
    await setDoc(doc(db, 'settings', 'current'), settings);
  } catch (error) {
    console.error('Failed to write settings to Firestore', error);
  }
}

export async function addStudentToFirestore(student: Student): Promise<void> {
  try {
    await setDoc(doc(db, 'students', student.id), student);
  } catch (error) {
    console.error('Failed to add student to Firestore', error);
  }
}

export async function updateStudentInFirestore(student: Student): Promise<void> {
  try {
    await setDoc(doc(db, 'students', student.id), student);
  } catch (error) {
    console.error('Failed to update student in Firestore', error);
  }
}

export async function deleteStudentFromFirestore(studentId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'students', studentId));
  } catch (error) {
    console.error('Failed to delete student from Firestore', error);
  }
}

export async function replaceAllStudentsInFirestore(newStudents: Student[]): Promise<void> {
  saveLocalStudents(newStudents);
  try {
    // Delete existing
    const existingSnap = await getDocs(collection(db, 'students'));
    const deleteBatch = writeBatch(db);
    existingSnap.forEach((docSnap) => {
      deleteBatch.delete(docSnap.ref);
    });
    await deleteBatch.commit();

    // Insert new
    const addBatch = writeBatch(db);
    newStudents.forEach((st) => {
      addBatch.set(doc(db, 'students', st.id), st);
    });
    await addBatch.commit();
  } catch (error) {
    console.error('Failed to replace students in Firestore', error);
  }
}

export async function addPointRecordToFirestore(point: PointRecord): Promise<void> {
  try {
    await setDoc(doc(db, 'points', point.id), point);
  } catch (error) {
    console.error('Failed to add point to Firestore', error);
  }
}

export async function updatePointRecordInFirestore(point: PointRecord): Promise<void> {
  try {
    await setDoc(doc(db, 'points', point.id), point);
  } catch (error) {
    console.error('Failed to update point in Firestore', error);
  }
}

export async function deletePointRecordFromFirestore(pointId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'points', pointId));
  } catch (error) {
    console.error('Failed to delete point from Firestore', error);
  }
}

export async function saveAttendanceRecordsToFirestore(records: AttendanceRecord[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    records.forEach((rec) => {
      batch.set(doc(db, 'attendance', rec.id), rec);
    });
    await batch.commit();
  } catch (error) {
    console.error('Failed to save attendance records to Firestore', error);
  }
}

export async function resetAllFirestoreToDemo(): Promise<void> {
  try {
    // Clear collections
    const collectionsToClear = ['students', 'points', 'attendance'];
    for (const colName of collectionsToClear) {
      const snap = await getDocs(collection(db, colName));
      const b = writeBatch(db);
      snap.forEach((d) => b.delete(d.ref));
      await b.commit();
    }

    // Reset settings
    await setDoc(doc(db, 'settings', 'current'), DEFAULT_SETTINGS);

    // Seed defaults
    const bStudents = writeBatch(db);
    DEMO_STUDENTS.forEach((s) => bStudents.set(doc(db, 'students', s.id), s));
    await bStudents.commit();

    const bPoints = writeBatch(db);
    getDemoPointRecords().forEach((p) => bPoints.set(doc(db, 'points', p.id), p));
    await bPoints.commit();

    const bAtt = writeBatch(db);
    getDemoAttendanceRecords().forEach((a) => bAtt.set(doc(db, 'attendance', a.id), a));
    await bAtt.commit();
  } catch (error) {
    console.error('Failed to reset Firestore to demo', error);
  }
}

/**
 * Report Remarks Notes (Tuyên dương & Nhắc nhở) in Firestore
 */
export async function saveReportNoteToFirestore(
  weekKey: string,
  data: { praiseNote?: string; remindNote?: string }
): Promise<void> {
  try {
    await setDoc(doc(db, 'report_notes', weekKey), data, { merge: true });
  } catch (error) {
    console.error('Failed to save report note to Firestore', error);
  }
}

export function subscribeToReportNote(
  weekKey: string,
  callback: (data: { praiseNote?: string; remindNote?: string }) => void
): Unsubscribe {
  return onSnapshot(
    doc(db, 'report_notes', weekKey),
    (snap) => {
      if (snap.exists()) {
        callback(snap.data() as { praiseNote?: string; remindNote?: string });
      }
    },
    (err) => console.warn('Report note listener warning:', err)
  );
}
