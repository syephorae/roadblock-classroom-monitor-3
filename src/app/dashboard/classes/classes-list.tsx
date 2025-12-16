'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useFirebase } from '@/firebase/provider';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Class } from '@/lib/definitions';

interface ClassListProps {}

export function ClassesList({}: ClassListProps) {
  const { firestore, user } = useFirebase();
  const [classData, setClassData] = useState<Class[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Do not proceed if firebase services or user are not available
    if (!firestore || !user?.uid) {
      setLoading(false);
      return;
    }

    const teacherId = user.uid;
    console.log(`Setting up classes listener for teacher: ${teacherId}`);

    const classesQuery = query(collection(firestore, 'classes'), where('teacherId', '==', teacherId));

    const unsubscribe = onSnapshot(
      classesQuery,
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Class));
        setClassData(data);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching classes:", err);
        setError(err);
        setLoading(false);
      }
    );

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, [firestore, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        <span>Loading classes...</span>
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive">Error: {error.message}</p>;
  }

  if (!classData || classData.length === 0) {
    return <p className="text-muted-foreground">No classes found for your account. Add one to get started.</p>;
  }

  return (
    <div className="space-y-2">
      {classData.map((c) => (
        <div
          key={c.id}
          className="flex items-center justify-between rounded-md border p-3"
        >
          <p className="font-medium">{c.name}</p>
          <Button asChild variant="secondary">
            <Link href={`/dashboard/classes/${c.id}`}>Manage</Link>
          </Button>
        </div>
      ))}
    </div>
  );
}
