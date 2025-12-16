'use client';

import { useFirestore, useDoc, useUser, useMemoFirebase } from '@/firebase';
import { RosterUpload } from '@/components/dashboard/classes/roster-upload';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import type { Class } from '@/lib/definitions';
import { useParams } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ClassDetailPage() {
  const params = useParams();
  const classId = params.classId as string;
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const classDocRef = useMemoFirebase(
    () => (firestore && classId ? doc(firestore, 'classes', classId) : null),
    [firestore, classId]
  );

  const { data: classInfo, isLoading: isClassLoading, error: classError } = useDoc<Class>(classDocRef);

  // Render loading state while waiting for data
  if (isUserLoading || isClassLoading) {
    return (
      <div className="p-4 md:p-8 space-y-4">
        <Skeleton className="h-9 w-1/2" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  // Render error state if fetching class fails
  if (classError) {
    return (
      <div className="p-4 md:p-8">
          <Alert variant="destructive">
            <AlertTitle>Error Loading Class</AlertTitle>
            <AlertDescription>{classError.message}</AlertDescription>
          </Alert>
      </div>
    );
  }
  
  // === START: ROBUST VALIDATION ===

  // 1. Check if user is logged in at all
  if (!user) {
     return (
      <div className="p-4 md:p-8">
         <Alert variant="destructive">
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>You must be logged in to manage a class. Please log in and try again.</AlertDescription>
          </Alert>
      </div>
    );
  }

  // 2. Check if the class was found
  if (!classInfo) {
    return (
      <div className="p-4 md:p-8">
         <Alert variant="destructive">
            <AlertTitle>Class Not Found</AlertTitle>
            <AlertDescription>The class with ID <code className='font-mono'>{classId}</code> may have been deleted or does not exist.</AlertDescription>
          </Alert>
      </div>
    );
  }
  
  // 3. THE CRITICAL CHECK: Ensure the logged-in user is the teacher of this class
  if (classInfo.teacherId !== user.uid) {
     return (
      <div className="p-4 md:p-8 space-y-4">
        <Alert variant="destructive">
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>You are not authorized to manage this class.</AlertDescription>
        </Alert>
        <div className="p-4 border rounded-md bg-muted/50">
            <h3 className="font-semibold text-muted-foreground">Debugging Information</h3>
            <p className="text-sm text-muted-foreground">To fix this, ensure the Class Teacher ID in your database exactly matches Your User ID.</p>
            <div className="mt-2 space-y-1 text-xs">
              <p>Your User ID: <code className="font-mono bg-background p-1 rounded">{user.uid}</code></p>
              <p>Class Teacher ID: <code className="font-mono bg-background p-1 rounded">{classInfo.teacherId || 'NOT SET'}</code></p>
            </div>
        </div>
      </div>
    );
  }
  
  // === END: ROBUST VALIDATION ===

  // If all checks pass, render the page
  return (
    <div className="p-4 md:p-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">
        Manage Class: {classInfo.name}
      </h1>
      <RosterUpload classId={classId} teacherId={user.uid} />
    </div>
  );
}
