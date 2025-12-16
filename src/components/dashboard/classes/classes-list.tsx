'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ClassData {
  id: string;
  name: string;
}

export function ClassesList() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClasses() {
      try {
        const response = await fetch('/api/classes');
        if (!response.ok) {
          throw new Error('Failed to fetch classes');
        }
        const data = await response.json();
        setClasses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }
    fetchClasses();
  }, []);

  const handleDelete = async (classId: string) => {
    try {
      const response = await fetch(`/api/classes/${classId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete class');
      }
      // Filter out the deleted class from the state
      setClasses(classes.filter(c => c.id !== classId));
    } catch (err) {
      // In a real app, you'd show a toast notification here
      console.error("Deletion Error:", err);
      alert("Failed to delete class. See console for details.");
    }
  };

  if (isLoading) return <p>Loading classes...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="space-y-2">
      {classes.length === 0 ? (
        <p>No classes found. Add one to get started!</p>
      ) : (
        classes.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between rounded-md border p-3"
          >
            <p className="font-medium">{c.name}</p>
            <div className="flex items-center space-x-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/dashboard/classes/${c.id}`}>
                  Manage <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the class and all associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(c.id)}>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
