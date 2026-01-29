'use client';



import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, documentId, getDocs, addDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { Student, Class } from '@/lib/definitions';
import { getColumns } from './columns';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { StudentsTable } from './students-table';

// --- RosterStudentsTable component ---

interface RosterStudentsTableProps {
  studentIds?: string[] | undefined | null; // Optional prop
}

export function RosterStudentsTable({ studentIds }: RosterStudentsTableProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const columns = useMemo(() => getColumns(classes), [classes]);

  // Sync function to ensure all students in teacher-owned classes have links
  const syncTeacherStudentLinks = async (teacherUid: string) => {
    console.log("🔄 Starting teacher-student link sync for teacher:", teacherUid);

    try {
      // 1. Get all classes owned by this teacher
      const classesQuery = query(
        collection(firestore, 'classes'),
        where('teacherId', '==', teacherUid)
      );
      const classesSnapshot = await getDocs(classesQuery);
      const teacherClassIds = classesSnapshot.docs.map(doc => doc.id);

      if (teacherClassIds.length === 0) {
        console.log("✅ No classes owned by teacher. Sync complete.");
        return;
      }

      console.log(`📚 Found ${teacherClassIds.length} classes owned by teacher:`, teacherClassIds);


      // 2. Get all students in these classes and filter for those with activity
      const allStudentsInClasses: string[] = [];
      for (const classId of teacherClassIds) {
        const studentsQuery = query(
          collection(firestore, 'students'),
          where('classId', '==', classId)
        );
        const studentsSnapshot = await getDocs(studentsQuery);

        // Only include students who have some activity (not all zeros)
        studentsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const hasActivity =
            (data.progress && data.progress > 0) ||
            (data.currentActivityScore && data.currentActivityScore > 0) ||
            (data.timePlayed && data.timePlayed > 0) ||
            (data.experimentsCompleted && data.experimentsCompleted > 0) ||
            (data.activitiesCompleted && data.activitiesCompleted > 0);

          if (hasActivity) {
            allStudentsInClasses.push(doc.id);
          } else {
            console.log(`⏭️ Skipping student ${doc.id} (${data.name}) - no activity data`);
          }
        });
      }

      console.log(`👥 Found ${allStudentsInClasses.length} students with activity in teacher's classes`);

      if (allStudentsInClasses.length === 0) {
        console.log("✅ No students with activity in teacher's classes. Sync complete.");
        return;
      }

      // 3. Get existing links
      const linksQuery = query(
        collection(firestore, 'teacher_students'),
        where('teacherId', '==', teacherUid)
      );
      const linksSnapshot = await getDocs(linksQuery);
      const existingLinkedStudentIds = new Set(
        linksSnapshot.docs.map(doc => doc.data().studentId)
      );

      console.log(`🔗 Found ${existingLinkedStudentIds.size} existing links`);

      // 4. Find missing links
      const missingLinks = allStudentsInClasses.filter(
        studentId => !existingLinkedStudentIds.has(studentId)
      );

      console.log(`❌ Found ${missingLinks.length} missing links`);

      // 5. Create missing links
      if (missingLinks.length > 0) {
        const teacherStudentsRef = collection(firestore, 'teacher_students');
        const createPromises = missingLinks.map(studentId =>
          addDoc(teacherStudentsRef, {
            teacherId: teacherUid,
            studentId: studentId
          })
        );

        await Promise.all(createPromises);
        console.log(`✅ Created ${missingLinks.length} missing teacher-student links`);
      } else {
        console.log("✅ All links already exist. Sync complete.");
      }

    } catch (error) {
      console.error("❌ Error during teacher-student link sync:", error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      console.log("--- DEBUG: Roster Table --- Rerunning fetch data ---");
      console.log("DEBUG: Received studentIds prop:", studentIds);

      if (!firestore || !user) {
        console.log("DEBUG: Firestore or User not available. Aborting.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // 0. Run sync to ensure all links exist (only when fetching full roster)
        if (studentIds === undefined && user) {
          console.log("🔄 Running auto-sync before fetching roster...");
          await syncTeacherStudentLinks(user.uid);
        }

        // 1. Fetch all classes for column mapping, filtered by teacher
        const classesQuery = query(
          collection(firestore, 'classes'),
          where('teacherId', '==', user.uid)
        );
        const classesSnapshot = await getDocs(classesQuery);
        const classesData = classesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Class));
        setClasses(classesData);

        let studentData: Student[] = [];

        // 2. Determine fetch strategy
        if (studentIds === undefined && user) {
          // Case A: No IDs provided, fetch students via teacher_students collection
          console.log("DEBUG: No studentIds provided. Querying teacher_students for teacher:", user.uid);

          // 1. Get the links
          const teacherStudentsQuery = query(
            collection(firestore, 'teacher_students'),
            where('teacherId', '==', user.uid)
          );
          const linkSnapshot = await getDocs(teacherStudentsQuery);
          const linkedStudentIds = linkSnapshot.docs.map(doc => doc.data().studentId);
          console.log("DEBUG: Found linked student IDs:", linkedStudentIds);

          if (linkedStudentIds.length === 0) {
            setStudents([]);
            setLoading(false);
            return;
          }

          // 2. Fetch the actual student documents (chunked)
          const chunks: string[][] = [];
          for (let i = 0; i < linkedStudentIds.length; i += 30) {
            chunks.push(linkedStudentIds.slice(i, i + 30));
          }

          const fetchPromises = chunks.map(chunk =>
            getDocs(query(collection(firestore, 'students'), where(documentId(), 'in', chunk)))
          );

          const querySnapshots = await Promise.all(fetchPromises);
          for (const snapshot of querySnapshots) {
            snapshot.forEach(doc => {
              studentData.push({ ...doc.data(), id: doc.id } as Student);
            });
          }

        } else {
          // Case B: IDs provided (or explicitly null/empty array), filter valid ones
          const validStudentIds = (studentIds || []).filter(id => id && typeof id === 'string');
          console.log("DEBUG: Validated (non-empty, string) studentIds:", validStudentIds);

          if (validStudentIds.length === 0) {
            console.log("DEBUG: No valid student IDs to fetch. Setting students to empty array.");
            setStudents([]);
            setLoading(false);
            return;
          }

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
  }, [firestore, studentIds, user]);

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

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <StudentsTable columns={columns} data={students} classes={classes} />
      </div>
    </div>
  );
}