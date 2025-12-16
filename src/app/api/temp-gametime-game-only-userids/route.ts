
import { initializeAdminApp } from '@/firebase/admin';
import { NextResponse } from 'next/server';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { firestore } = initializeAdminApp();

    // ULTIMATE DEBUG QUERY: Find ALL records that have a non-empty robloxUserId.
    // This ignores time and classId to give us the ground truth from the database.
    const studentsSnapshot = await firestore
      .collection('students')
      .where('robloxUserId', '!=', null)
      .get();

    // Returning all relevant data for every game submission found.
    const allGameSubmissions = studentsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        robloxUserId: data.robloxUserId || null,
        classId: data.classId !== undefined ? data.classId : null,
        gameSubmittedFullName: data.name || null,
        lastUpdated: data.lastUpdated ? data.lastUpdated.toDate() : null,
      };
    });

    return NextResponse.json(allGameSubmissions);

  } catch (error) {
    console.error('Error fetching all game submissions:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch all game submissions', details: errorMessage }), { status: 500 });
  }
}
