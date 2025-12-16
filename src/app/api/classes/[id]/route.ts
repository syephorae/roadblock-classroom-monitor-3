'use server';

import { NextResponse } from 'next/server';
import { initializeAdminApp } from '@/firebase/admin';

const { firestore } = initializeAdminApp();

/**
 * API Route: DELETE /api/classes/[id]
 * 
 * Deletes a class document from Firestore.
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const classId = params.id;
    if (!classId) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 });
    }

    await firestore.collection('classes').doc(classId).delete();

    return NextResponse.json({ success: true, message: `Class ${classId} deleted successfully.` });

  } catch (error) {
    console.error(`Error deleting class ${params.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
