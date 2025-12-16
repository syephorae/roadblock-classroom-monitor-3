'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { Class } from '@/lib/definitions';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export function ClassesList() {
  const firestore = useFirestore();

  // This query MUST be memoized with the custom useMemoFirebase hook
  const classesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'classes') : null),
    [firestore]
  );

  const { data: classData, isLoading, error } = useCollection<Class>(classesQuery);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (error) {
    // The error object now contains the useful message
    return <p className="text-destructive">Error: {error.message}</p>;
  }

  if (!classData || classData.length === 0) {
    return <p className="text-muted-foreground">No classes found. Add one to get started.</p>;
  }

  return (
    <div className="space-y-2">
      {classData.map((c) => (
        <div
          key={c.id}
          className="flex items-center justify-between rounded-md border p-3"
        >
          <p className="font-medium">{c.name}</p>
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/classes/${c.id}`}>
              Manage <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      ))}
    </div>
  );
}
