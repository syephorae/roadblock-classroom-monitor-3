'use server';

import { NextResponse } from 'next/server';
import { initializeAdminApp } from '@/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

const { firestore } = initializeAdminApp();
const MAX_EXPERIMENT_SCORE = 31;

/**
 * API Route: POST /api/roblox/progress
 *
 * Saves student progress from a Roblox game. It handles various types of progress data,
 * including experiment progress and activity scores.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { robloxUserId, robloxUsername, avatar, experimentProgress, timePlayed, currentActivityScore } = body;

    if (!robloxUserId) {
      return NextResponse.json({ error: 'Missing required field: robloxUserId' }, { status: 400 });
    }

    // Find the student by their permanent robloxUserId.
    const studentQuery = firestore.collection('students').where('robloxUserId', '==', robloxUserId).limit(1);
    const studentSnapshot = await studentQuery.get();

    if (studentSnapshot.empty) {
        // If we can't find a student by robloxUserId, we can't save their progress.
        // The /api/roblox/link endpoint is now responsible for creating students.
        return NextResponse.json({ error: `Student with Roblox User ID '${robloxUserId}' not found.` }, { status: 404 });
    }

    const studentDoc = studentSnapshot.docs[0];
    const updateData: { [key: string]: any; } = {
        lastUpdated: FieldValue.serverTimestamp(),
    };

    // Update username and avatar if provided
    if (robloxUsername) updateData.robloxUsername = robloxUsername.toLowerCase();
    if (avatar) updateData.avatar = avatar;

    // Handle experiment progress if provided
    if (experimentProgress !== undefined) {
        updateData.progress = Math.round((experimentProgress / MAX_EXPERIMENT_SCORE) * 100);
        updateData.currentExperimentScore = experimentProgress;
        updateData.experimentsCompleted = FieldValue.increment(1);
    }

    // Handle activity score if provided
    if (currentActivityScore !== undefined) {
        updateData.currentActivityScore = currentActivityScore;
        updateData.activitiesCompleted = FieldValue.increment(1);
    }

    // Handle time played if provided
    if (timePlayed !== undefined) {
        updateData.timePlayed = FieldValue.increment(timePlayed);
    }
    
    // Perform the update if there is data to update
    if (Object.keys(updateData).length > 1) { // More than just the timestamp
        await studentDoc.ref.update(updateData);
        return NextResponse.json({ success: true, message: 'Progress updated successfully.' });
    } else {
        return NextResponse.json({ success: false, message: 'No new progress data provided.' });
    }

  } catch (error) {
    console.error('Error in /api/roblox/progress:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
