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
import { collection, query, where, documentId, getDocs } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Student, Class } from '@/lib/definitions';
import { getColumns } from './columns';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// --- DataTable component implementation ---
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
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
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
                No students in this roster.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// --- RosterStudentsTable component ---

interface RosterStudentsTableProps {
  studentIds: string[] | undefined | null; // Allow undefined/null for robustness
}

export function RosterStudentsTable({ studentIds }: RosterStudentsTableProps) {
  const firestore = useFirestore();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const columns = useMemo(() => getColumns(classes), [classes]);

  useEffect(() => {
    const fetchData = async () => {
      console.log("--- DEBUG: Roster Table --- Rerunning fetch data ---");
      console.log("DEBUG: Received studentIds prop:", studentIds);

      // --- FINAL FIX: Ensure studentIds is an array before filtering --- 
      // This prevents the ".filter is not a function" crash if the prop is undefined.
      const validStudentIds = (studentIds || []).filter(id => id && typeof id === 'string');
      console.log("DEBUG: Validated (non-empty, string) studentIds:", validStudentIds);

      if (!firestore) {
        console.log("DEBUG: Firestore not available. Aborting.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // 1. Fetch all yes for column mapping
        const classesQuery = query(collection(firestore, 'classes'));
        const classesSnapshot = await getDocs(classesQuery);
        const classesData = classesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Class));
        setClasses(classesData);

        // 2. Fetch students only if there are valid IDs
        if (validStudentIds.length === 0) {
          console.log("DEBUG: No valid student IDs to fetch. Setting students to empty array.");
          setStudents([]);
          setLoading(false); 
          return;
        }

        const studentData: Student[] = [];
        const chunks: string[][] = [];

        for (let i = 0; i < validStudentIds.length; i += 30) {
          chunks.push(validStudentIds.slice(i, i + 30));
        }
        console.log("DEBUG: Split studentIds into chunks for Firestore:", chunks);

        const fetchPromises = chunks.map(chunk =>
          getDocs(query(collection(firestore, 'students'), where(documentId(), 'in', chunk)))
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
        console.log("--- DEBUG: Roster Table --- Fetch finished. ---");
        setLoading(false);
      }
    };

    fetchData();
  }, [firestore, studentIds]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <span>Loading student roster...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
      );
  }
}