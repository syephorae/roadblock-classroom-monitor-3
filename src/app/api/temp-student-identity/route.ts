
import { initializeAdminApp } from '@/firebase/admin';
import { NextResponse } from 'next/server';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { firestore } = initializeAdminApp();
    const studentsSnapshot = await firestore.collection('students').get();

    const studentIdentityData = studentsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        robloxUserId: data.robloxUserId || null,
        robloxUsername: data.robloxUsername || null,
        avatar: data.avatar || null,
        // The 'name' field stores the full name submitted from the Roblox game.
        gameSubmittedFullName: data.name || null,
        schoolId: data.schoolId || null,
      };
    });

    return NextResponse.json(studentIdentityData);

  } catch (error) {
    console.error('Error fetching student identity data:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch student identity data', details: errorMessage }), { status: 500 });
  }
}
