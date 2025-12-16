import { initializeAdminApp } from '@/firebase/admin';
import { NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { firestore } = initializeAdminApp();

    // Set the start and end times for the query
    const startTime = new Date();
    startTime.setHours(8, 0, 0, 0);
    const startTimestamp = Timestamp.fromDate(startTime);

    const endTime = new Date();
    endTime.setHours(11, 0, 0, 0);
    const endTimestamp = Timestamp.fromDate(endTime);

    const studentsSnapshot = await firestore
      .collection('students')
      .where('lastUpdated', '>=', startTimestamp)
      .where('lastUpdated', '<=', endTimestamp)
      .get();

    const students = studentsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        robloxUserId: data.robloxUserId,
        progress: data.progress,
      };
    });

    return NextResponse.json(students);

  } catch (error) {
    console.error('Error fetching students:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch student data', details: errorMessage }), { status: 500 });
  }
}
