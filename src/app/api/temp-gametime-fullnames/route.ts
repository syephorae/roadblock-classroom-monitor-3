
import { initializeAdminApp } from '@/firebase/admin';
import { NextResponse } from 'next/server';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { firestore } = initializeAdminApp();

    // DEBUG: Querying for all documents with an empty classId, ignoring time.
    const studentsSnapshot = await firestore
      .collection('students')
      .where('classId', '==', '')
      .get();

    const gameFullNames = studentsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        gameSubmittedFullName: data.name || null,
        lastUpdated: data.lastUpdated.toDate(), // Also returning lastUpdated for debugging
      };
    });

    return NextResponse.json(gameFullNames);

  } catch (error) {
    console.error('Error fetching game-submitted full names:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch game-submitted full names', details: errorMessage }), { status: 500 });
  }
}
