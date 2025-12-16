'use server';

import { NextResponse } from 'next/server';
import { initializeAdminApp } from '@/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

const { firestore } = initializeAdminApp();

/**
 * API Route: POST /api/students/merge
 *
 * Merges an unclaimed student record into a roster student record.
 * This ensures that progress made before an account is claimed is transferred correctly.
 */
export async function POST(request: Request) {
  try {
    const { unclaimedStudentId, rosterStudentId } = await request.json();

    if (!unclaimedStudentId || !rosterStudentId) {
      return NextResponse.json({ error: 'Missing unclaimedStudentId or rosterStudentId' }, { status: 400 });
    }

    // Use a transaction to ensure this operation is atomic and data-safe
    await firestore.runTransaction(async (transaction) => {
      const unclaimedStudentRef = firestore.collection('students').doc(unclaimedStudentId);
      const rosterStudentRef = firestore.collection('students').doc(rosterStudentId);

      const unclaimedStudentDoc = await transaction.get(unclaimedStudentRef);
      const rosterStudentDoc = await transaction.get(rosterStudentRef);

      if (!unclaimedStudentDoc.exists) {
        throw new Error('Unclaimed student record not found.');
      }
      if (!rosterStudentDoc.exists) {
        throw new Error('Roster student record not found.');
      }

      const unclaimedData = unclaimedStudentDoc.data()!;
      const rosterData = rosterStudentDoc.data()!;

      // Prepare the final merged data.
      // Numerical values are summed using FieldValue.increment for safety.
      const mergedData = {
        // Take identity from the unclaimed record
        robloxUserId: unclaimedData.robloxUserId,
        robloxUsername: unclaimedData.robloxUsername,
        avatar: unclaimedData.avatar,

        // Take the highest progress percentage
        progress: Math.max(rosterData.progress || 0, unclaimedData.progress || 0),

        // Use the latest, most relevant experiment score
        currentExperimentScore: unclaimedData.currentExperimentScore || rosterData.currentExperimentScore || 0,

        // Atomically increment cumulative stats
        timePlayed: FieldValue.increment(unclaimedData.timePlayed || 0),
        experimentsCompleted: FieldValue.increment(unclaimedData.experimentsCompleted || 0),
        activitiesCompleted: FieldValue.increment(unclaimedData.activitiesCompleted || 0),
        currentActivityScore: FieldValue.increment(unclaimedData.currentActivityScore || 0),
        
        lastUpdated: FieldValue.serverTimestamp(),
      };

      // Update the main roster student and delete the temporary unclaimed one
      transaction.update(rosterStudentRef, mergedData);
      transaction.delete(unclaimedStudentRef);
    });

    return NextResponse.json({ success: true, message: 'Student records merged successfully.' });

  } catch (error) {
    console.error('Error in /api/students/merge:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
