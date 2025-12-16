'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useFirebase } from '@/firebase/provider';
import { Student, Class } from '@/lib/definitions';
import { getColumns } from './columns';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// --- DataTable component (no changes) ---
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No students found in your classes.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// --- RosterStudentsTable component (Refactored to fetch students by teacher's classes) ---

interface RosterStudentsTableProps {}

export function RosterStudentsTable({}: RosterStudentsTableProps) {
  const { firestore, user } = useFirebase();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const columns = useMemo(() => getColumns(classes), [classes]);

  useEffect(() => {
    const fetchData = async () => {
      if (!firestore || !user) {
        setLoading(false);
        return;
      }

      const teacherId = user.uid;
      setLoading(true);
      setError(null);

      try {
        // 1. Fetch all classes taught by the current teacher.
        console.log(`DEBUG: Fetching classes for teacher: ${teacherId}`);
        const classesQuery = query(collection(firestore, 'classes'), where('teacherId', '==', teacherId));
        const classesSnapshot = await getDocs(classesQuery);
        
        const teacherClasses = classesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Class));
        setClasses(teacherClasses); // Set classes state for the columns.

        if (teacherClasses.length === 0) {
          console.log("DEBUG: No classes found for this teacher.");
          setStudents([]); // No classes means no students.
          setLoading(false);
          return;
        }

        const classIds = teacherClasses.map(c => c.id);
        console.log(`DEBUG: Found ${classIds.length} class IDs for this teacher.`);

        // 2. Fetch all students who are in any of the teacher's classes.
        // Handle Firestore's 30-item 'in' query limit by chunking classIds.
        const studentData: Student[] = [];
        const chunks: string[][] = [];

        for (let i = 0; i < classIds.length; i += 30) {
          chunks.push(classIds.slice(i, i + 30));
        }

        const fetchPromises = chunks.map(chunk =>
          getDocs(query(collection(firestore, 'students'), where('classId', 'in', chunk)))
        );

        const querySnapshots = await Promise.all(fetchPromises);

        for (const snapshot of querySnapshots) {
          snapshot.forEach(doc => {
            studentData.push({ ...doc.data(), id: doc.id } as Student);
          });
        }
        
        setStudents(studentData);
        console.log("DEBUG: Final student data state set:", studentData);

      } catch (err) {
        console.error("--- DEBUG: Roster Table Fetch ERROR ---", err);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to load roster data: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [firestore, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <span>Loading your students...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>);
  }

  
  return <DataTable columns={columns} data={students} />;

}