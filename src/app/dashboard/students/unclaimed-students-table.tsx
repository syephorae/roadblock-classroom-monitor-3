'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Student } from '@/lib/definitions';
import { StudentsTable } from './students-table';
import { Skeleton } from '@/components/ui/skeleton';
import { AssignStudentButton } from './assign-student-button';

// A specific column definition for the unclaimed students table
const getUnclaimedColumns = (rosterStudents: Student[], onAssignmentComplete: () => void): ColumnDef<Student>[] => [
    // Using a subset of the main columns, can be customized as needed
    {
        accessorKey: 'robloxUsername',
        header: 'Roblox Username',
    },
    {
        accessorKey: 'progress',
        header: 'Experiment Progress',
        cell: ({ row }) => `${row.original.progress || 0}%`,
    },
    {
        accessorKey: 'timePlayed',
        header: 'Time Played',
        cell: ({ row }) => `${row.original.timePlayed || 0} minutes`,
    },
    {
        id: 'actions',
        cell: ({ row }) => (
            <AssignStudentButton 
                unclaimedStudent={row.original}
                rosterStudents={rosterStudents}
                onAssignmentComplete={onAssignmentComplete}
            />
        ),
    },
];

export function UnclaimedStudentsTable() {
  const firestore = useFirestore();
  const { user } = useUser();

  // Memoized query for unclaimed students
  const unclaimedQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'students'),
      where('classId', '==', null) // Unclaimed students have no classId
    );
  }, [firestore, user]);

  const { 
    data: unclaimedStudents, 
    isLoading: isLoadingUnclaimed, 
    error: unclaimedError,
    mutate: refreshUnclaimed, // Function to refetch data
  } = useCollection<Student>(unclaimedQuery);

  // Memoized query for rostered students (needed for the assignment dropdown)
  const rosterQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
        collection(firestore, 'students'),
        where('teacherId', '==', user.uid) // Students linked to the current teacher
    );
  }, [firestore, user]);

  const { 
    data: rosterStudents, 
    isLoading: isLoadingRoster, 
    error: rosterError 
  } = useCollection<Student>(rosterQuery);

  const isLoading = isLoadingUnclaimed || isLoadingRoster;
  const error = unclaimedError || rosterError;

  // The callback function that will be passed to the button
  const handleAssignmentComplete = () => {
    refreshUnclaimed(); // This will re-run the query and update the table
  };

  const columns = useMemo(() => {
    if (!rosterStudents) return [];
    return getUnclaimedColumns(rosterStudents, handleAssignmentComplete);
  }, [rosterStudents]);

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (error) {
    return <p className="text-destructive">Error: {error.message}</p>;
  }

  return (
    <StudentsTable 
        data={unclaimedStudents || []} 
        columns={columns} // Pass the specific columns for this table
        classes={[]} // Not needed for this table
    />
  );
}
