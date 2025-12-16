'use server';

import { NextResponse } from 'next/server';
import { initializeAdminApp } from '@/firebase/admin';

const { firestore } = initializeAdminApp();

/**
 * API Route: GET /api/classes
 * 
 * Fetches all class documents from Firestore.
 */
export async function GET() {
  try {
    const classesSnapshot = await firestore.collection('classes').get();
    const classes = classesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
