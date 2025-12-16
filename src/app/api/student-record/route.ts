
'use server';

import { NextResponse } from 'next/server';
import { initializeAdminApp } from '@/firebase/admin';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  writeBatch,
} from 'firebase/firestore';

const { firestore } = initializeAdminApp();

/**
 * Handles POST requests to create or update a student record based on Roblox game data.
 */
export async function POST(request: Request) {
  const secretKey = request.headers.get('X-Roblox-Secret');

  // 1. Security Check: Validate the secret key
  if (secretKey !== process.env.ROBLOX_SECRET_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { robloxUserId, robloxUsername, fullName, timePlayed, quizScore, quizCompletions, progress, experimentCompletions } = body;

    // 2. Input Validation: robloxUserId is essential
    if (!robloxUserId) {
      return NextResponse.json({ error: 'Missing required field: robloxUserId' }, { status: 400 });
    }

    const studentsRef = collection(firestore, 'students');
    const q = query(studentsRef, where('robloxUserId', '==', robloxUserId));
    const querySnapshot = await getDocs(q);
    
    let studentDoc;
    let studentId: string;
    const batch = writeBatch(firestore);

    const gameData: any = {};
    if (timePlayed !== undefined) gameData.timePlayed = timePlayed;
    if (quizScore !== undefined) gameData.quizScore = quizScore;
    if (quizCompletions !== undefined) gameData.quizCompletions = quizCompletions;
    if (progress !== undefined) gameData.progress = progress;
    if (experimentCompletions !== undefined) gameData.experimentCompletions = experimentCompletions;
    if (robloxUsername) gameData.robloxUsername = robloxUsername;


    if (querySnapshot.empty) {
        // If no student is found with the robloxUserId, create a new one.
        // This student is "unclaimed" until a teacher manually links them.
        const newStudentRef = doc(studentsRef);
        studentId = newStudentRef.id;
        const newStudentData = {
            id: studentId,
            robloxUserId: robloxUserId,
            name: fullName || `Player ${robloxUserId}`, // Use fullName from game, or a placeholder
            normalizedName: fullName ? fullName.toLowerCase() : `player ${robloxUserId}`,
            classId: '', // Not known until a teacher links this student
            school: '', // Not known until a teacher links this student
            ...gameData
        };
        batch.set(newStudentRef, newStudentData);
        studentDoc = await getDoc(newStudentRef); // so we have a doc to work with below
        
    } else {
      // If student exists, update their game data
      studentDoc = querySnapshot.docs[0];
      studentId = studentDoc.id;
      if (Object.keys(gameData).length > 0) {
        batch.update(studentDoc.ref, gameData);
      }
    }
    
    // 3. Create a new historical record entry IF the student is associated with a teacher.
    const teacherStudentsRef = collection(firestore, 'teacher_students');
    const teacherLinkQuery = query(teacherStudentsRef, where('studentId', '==', studentId));
    const teacherLinkSnapshot = await getDocs(teacherLinkQuery);

    const hasRecordData = Object.keys(gameData).length > 0;

    if (!teacherLinkSnapshot.empty && hasRecordData) {
        // This student is linked to one or more teachers. Add a record for each teacher.
        for (const teacherDoc of teacherLinkSnapshot.docs) {
            const teacherId = teacherDoc.data().teacherId;
            const recordsRef = collection(firestore, `teachers/${teacherId}/students/${studentId}/records`);
            const newRecordRef = doc(recordsRef);
            
            const newRecord: any = {
              id: newRecordRef.id,
              studentId,
              timestamp: serverTimestamp(),
              ...gameData
            };
            batch.set(newRecordRef, newRecord);
        }
    }
    
    await batch.commit();

    return NextResponse.json({ success: true, message: `Record for Roblox user ${robloxUserId} processed successfully.` }, { status: 200 });

  } catch (error) {
    console.error('Error processing student record:', error);
    let errorMessage = 'An internal server error occurred.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
