'use server';

import { NextResponse } from 'next/server';
import { initializeAdminApp } from '@/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

const { firestore } = initializeAdminApp();

/**
 * API Route: POST /api/roblox/activity
 * 
 * Updates activity score and timestamp.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { robloxUserId, currentActivityScore } = body;

    if (!robloxUserId || currentActivityScore === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const studentQuery = firestore.collection('students').where('robloxUserId', '==', robloxUserId).limit(1);
    const studentSnapshot = await studentQuery.get();

    if (studentSnapshot.empty) {
      return NextResponse.json({ error: 'Student with that Roblox ID not found' }, { status: 404 });
    }

    const studentDoc = studentSnapshot.docs[0];
    await studentDoc.ref.update({
      currentActivityScore,
      activitiesCompleted: FieldValue.increment(1),
      lastUpdated: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, message: 'Activity score updated successfully' });
  } catch (error) {
    console.error('Error in /api/roblox/activity:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
