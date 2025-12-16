
import { initializeAdminApp } from '@/firebase/admin';
import { NextResponse } from 'next/server';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { firestore } = initializeAdminApp();

    // DUMP THE JOINING COLLECTION: This is our most likely suspect for stray data.
    const snapshot = await firestore.collection('teacher_students').get();
    
    const allData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(allData);

  } catch (error) {
    console.error('Error dumping teacher_students collection:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(JSON.stringify({ error: 'Failed to dump collection', details: errorMessage }), { status: 500 });
  }
}
