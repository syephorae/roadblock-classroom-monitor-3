'use server';

import { NextResponse } from 'next/server';
import { initializeAdminApp } from '@/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

const { firestore } = initializeAdminApp();

/**
 * API Route: POST /api/roblox/link
 * 
 * Links a Roblox user to a student. If the student doesn't exist, it creates a new, unclaimed student.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { robloxUserId, robloxUsername, avatar, fullName, schoolId } = body;

    if (!robloxUserId || !robloxUsername || !avatar || !fullName || !schoolId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const studentQuery = firestore
      .collection('students')
      .where('normalizedName', '==', fullName.toLowerCase())
      .where('schoolId', '==', schoolId)
      .limit(1);

    const studentSnapshot = await studentQuery.get();

    if (studentSnapshot.empty) {
      // **FIX:** Student not found, so create a new unclaimed student.
      const newStudentData = {
        name: fullName,
        normalizedName: fullName.toLowerCase(),
        schoolId: schoolId,
        robloxUserId: robloxUserId,
        robloxUsername: robloxUsername,
        avatar: avatar,
        classId: null, // Mark as unclaimed
        timePlayed: 0,
        progress: 0,
        activitiesCompleted: 0,
        experimentsCompleted: 0,
        currentActivityScore: 0,
        experimentProgress: 0,
        lastUpdated: FieldValue.serverTimestamp(),
      };
      await firestore.collection('students').add(newStudentData);
      return NextResponse.json({ success: true, message: 'New unclaimed student created.' });

    } else {
      // Student found, link the Roblox account.
      const studentDoc = studentSnapshot.docs[0];
      await studentDoc.ref.update({
        robloxUserId,
        robloxUsername,
        avatar,
        lastUpdated: FieldValue.serverTimestamp(),
      });
      return NextResponse.json({ success: true, message: 'Student linked successfully' });
    }
  } catch (error) {
    console.error('Error in /api/roblox/link:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
