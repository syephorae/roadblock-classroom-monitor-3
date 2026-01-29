'use client';

import { useMemo, useState, useEffect } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs, documentId } from 'firebase/firestore';
import type { Student } from '@/lib/definitions';
import { StudentsTable } from './students-table';
import { Skeleton } from '@/components/ui/skeleton';
import { AssignStudentButton } from './assign-student-button';

// A specific column definition for the unclaimed students table
const getUnclaimedColumns = (rosterStudents: Student[], onAssignmentComplete: () => void): ColumnDef<Student>[] => [
  // Using a subset of the main columns, can be customized as needed
  {
    accessorKey: 'name',
    header: 'Name',
  },
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
  const [unclaimedStudents, setUnclaimedStudents] = useState<Student[]>([]);
  const [isLoadingUnclaimed, setIsLoadingUnclaimed] = useState(true);
  const [unclaimedError, setUnclaimedError] = useState<Error | null>(null);
  const [rosterStudents, setRosterStudents] = useState<Student[]>([]);
  const [isLoadingRoster, setIsLoadingRoster] = useState(true);
  const [rosterError, setRosterError] = useState<Error | null>(null);

  // Fetch truly unclaimed students (empty classId AND not linked to any teacher)
  useEffect(() => {
    const fetchUnclaimedStudents = async () => {
      if (!user || !firestore) {
        setIsLoadingUnclaimed(false);
        return;
      }

      setIsLoadingUnclaimed(true);
      setUnclaimedError(null);

      try {
        // 1. Get all students with empty or null classId
        const studentsRef = collection(firestore, 'students');

        // Query for empty string classId
        const emptyQuery = query(studentsRef, where('classId', '==', ''));
        const emptySnapshot = await getDocs(emptyQuery);

        // Query for null classId
        const nullQuery = query(studentsRef, where('classId', '==', null));
        const nullSnapshot = await getDocs(nullQuery);

        // Combine results and deduplicate by ID
        const studentMap = new Map<string, Student>();

        emptySnapshot.docs.forEach(doc => {
          studentMap.set(doc.id, { ...doc.data(), id: doc.id } as Student);
        });

        nullSnapshot.docs.forEach(doc => {
          studentMap.set(doc.id, { ...doc.data(), id: doc.id } as Student);
        });

        const allEmptyClassStudents = Array.from(studentMap.values());

        console.log(`📋 Found ${allEmptyClassStudents.length} students with empty/null classId`);

        // 2. Get all linked student IDs from teacher_students collection
        const linksSnapshot = await getDocs(collection(firestore, 'teacher_students'));
        const linkedStudentIds = new Set(
          linksSnapshot.docs.map(doc => doc.data().studentId)
        );

        console.log(`🔗 Found ${linkedStudentIds.size} total linked students across all teachers`);

        // 3. Filter out students who are already linked to ANY teacher
        const trulyUnclaimed = allEmptyClassStudents.filter(
          student => !linkedStudentIds.has(student.id)
        );

        console.log('🔍 Unclaimed students query result:', trulyUnclaimed);
        console.log(`📊 Found ${trulyUnclaimed.length} truly unclaimed students`);
        trulyUnclaimed.forEach(student => {
          console.log(`  - ${student.name} (@${student.robloxUsername}) - classId: "${student.classId}"`);
        });

        setUnclaimedStudents(trulyUnclaimed);
      } catch (err) {
        console.error('Error fetching unclaimed students:', err);
        setUnclaimedError(err instanceof Error ? err : new Error('Failed to fetch unclaimed students'));
      } finally {
        setIsLoadingUnclaimed(false);
      }
    };

    fetchUnclaimedStudents();
  }, [firestore, user]);


  // Fetch roster students using teacher_students link table
  useEffect(() => {
    const fetchRosterStudents = async () => {
      if (!user || !firestore) {
        setIsLoadingRoster(false);
        return;
      }

      setIsLoadingRoster(true);
      setRosterError(null);

      try {
        // 1. Get student IDs from teacher_students collection
        const linksQuery = query(
          collection(firestore, 'teacher_students'),
          where('teacherId', '==', user.uid)
        );
        const linksSnapshot = await getDocs(linksQuery);
        const studentIds = linksSnapshot.docs.map(doc => doc.data().studentId);

        if (studentIds.length === 0) {
          setRosterStudents([]);
          setIsLoadingRoster(false);
          return;
        }

        // 2. Fetch actual student documents in chunks (Firestore 'in' limit is 30)
        const chunks: string[][] = [];
        for (let i = 0; i < studentIds.length; i += 30) {
          chunks.push(studentIds.slice(i, i + 30));
        }

        const fetchPromises = chunks.map(chunk =>
          getDocs(query(collection(firestore, 'students'), where(documentId(), 'in', chunk)))
        );

        const querySnapshots = await Promise.all(fetchPromises);
        const students: Student[] = [];

        for (const snapshot of querySnapshots) {
          snapshot.forEach(doc => {
            students.push({ ...doc.data(), id: doc.id } as Student);
          });
        }

        setRosterStudents(students);
      } catch (err) {
        console.error('Error fetching roster students:', err);
        setRosterError(err instanceof Error ? err : new Error('Failed to fetch roster students'));
      } finally {
        setIsLoadingRoster(false);
      }
    };

    fetchRosterStudents();
  }, [firestore, user]);

  const isLoading = isLoadingUnclaimed || isLoadingRoster;
  const error = unclaimedError || rosterError;

  const columns = useMemo(() => {
    if (!rosterStudents) return [];
    // The query will auto-refresh when data changes, no manual refresh needed
    return getUnclaimedColumns(rosterStudents, () => {
      console.log('Assignment completed - query will auto-refresh');
    });
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
