
import { initializeAdminApp } from '@/firebase/admin';
import { NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { firestore } = initializeAdminApp();

    // Kuala Lumpur is UTC+8
    const KUALA_LUMPUR_OFFSET = 8;

    // Get the current date in UTC
    const now = new Date();
    
    // Create start time: 8 AM in Kuala Lumpur
    const startTime = new Date(now.valueOf());
    startTime.setUTCHours(8 - KUALA_LUMPUR_OFFSET, 0, 0, 0);
    const startTimestamp = Timestamp.fromDate(startTime);

    // Create end time: 11 AM in Kuala Lumpur
    const endTime = new Date(now.valueOf());
    endTime.setUTCHours(11 - KUALA_LUMPUR_OFFSET, 0, 0, 0);
    const endTimestamp = Timestamp.fromDate(endTime);

    const studentsSnapshot = await firestore
      .collection('students')
      .where('lastUpdated', '>=', startTimestamp)
      .where('lastUpdated', '<=', endTimestamp)
      .get();

    const gameData = studentsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        robloxUserId: data.robloxUserId,
        progress: data.progress,
        timePlayed: data.timePlayed,
        currentActivityScore: data.currentActivityScore
      };
    });

    return NextResponse.json(gameData);

  } catch (error) {
    console.error('Error fetching game data:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch game data', details: errorMessage }), { status: 500 });
  }
}
