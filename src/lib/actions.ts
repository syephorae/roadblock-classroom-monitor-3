'use server';
import { revalidatePath } from 'next/cache';
import { generatePersonalizedRecommendations, type PersonalizedRecommendationsInput } from '@/ai/flows/generate-personalized-recommendations';
import { initializeAdminApp } from '@/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

const { firestore } = initializeAdminApp();

// Action to add a new class
export async function addClass(className: string, teacherId: string) {
  if (!className || !teacherId) {
    return { success: false, error: 'Missing class name or teacher ID.' };
  }

  try {
    const classRef = firestore.collection('classes').doc();
    const newClass = {
      id: classRef.id,
      name: className.trim(),
      description: '',
      teacherId: teacherId,
      studentIds: [], // Start with an empty array of student IDs
      normalizedName: className.trim().toLowerCase(),
    };
    await classRef.set(newClass);
    revalidatePath('/dashboard/classes');
    return { success: true, message: 'Class created successfully.', classId: classRef.id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: `Failed to create class: ${errorMessage}` };
  }
}

// Action to get AI-powered recommendations
export async function getRecommendations(input: PersonalizedRecommendationsInput) {
  try {
    const result = await generatePersonalizedRecommendations(input);
    return result.recommendations
      ? { success: true, data: result.recommendations }
      : { success: false, error: 'Could not generate recommendations.' };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

/**
 * Action to add multiple students to a class (bulk import).
 * This action is robust and handles:
 * 1. Creation of new students.
 * 2. Linking of existing students.
 * 3. Atomically updating the class document with all student IDs.
 */
export async function addStudentsToClass(studentNames: string[], classId: string, teacherId: string) {
  console.log('--- DEBUG: addStudentsToClass START ---');
  console.log('Received Class ID:', classId);
  console.log('Received Student Names:', studentNames);

  if (!teacherId || !classId || !studentNames || studentNames.length === 0) {
    return { success: false, error: 'Missing required information (teacher, class, or student names).' };
  }

  const batch = firestore.batch();
  const studentsCol = firestore.collection('students');
  const classRef = firestore.collection('classes').doc(classId);

  let newStudentsCount = 0;
  const studentIdsForClass: string[] = [];

  try {
    const normalizedNames = studentNames.map((name) => name.trim().toLowerCase()).filter(Boolean);
    if (normalizedNames.length === 0) {
      return { success: false, error: 'No valid student names provided.' };
    }

    // --- FIX 1: Correctly retrieve existing students using doc.id --- 
    // This prevents errors if a student document in the DB is missing an 'id' field in its data.
    const existingStudentsQuery = await studentsCol.where('normalizedName', 'in', normalizedNames).get();
    const existingStudentsMap = new Map(
      existingStudentsQuery.docs.map(doc => {
        const data = doc.data();
        // The value now includes the reliable document ID from Firestore
        return [data.normalizedName, { ...data, id: doc.id }];
      })
    );
    console.log('DEBUG: Found existing students map:', existingStudentsMap);

    for (const name of studentNames) {
      const trimmedName = name.trim();
      if (!trimmedName) continue;

      const normalizedName = trimmedName.toLowerCase();
      let studentId: string | undefined = undefined;

      const existingStudent = existingStudentsMap.get(normalizedName);

      if (!existingStudent) {
        const newStudentRef = studentsCol.doc();
        studentId = newStudentRef.id;
        console.log(`DEBUG: Student "${trimmedName}" is NEW. Creating with ID: ${studentId}`);
        const studentData = {
          id: studentId, // For consistency, though doc ID is canonical
          name: trimmedName,
          normalizedName,
          schoolId: 'SeMSe',
          classId: classId,
          avatar: `https://picsum.photos/seed/${studentId}/100/100`,
          robloxUsername: '',
          robloxUserId: '',
          timePlayed: 0,
          progress: 0,
          activitiesCompleted: 0,
          experimentsCompleted: 0,
          currentActivityScore: 0,
          experimentProgress: 0,
          lastUpdated: FieldValue.serverTimestamp(),
        };
        batch.set(newStudentRef, studentData);
        newStudentsCount++;
      } else {
        studentId = existingStudent.id; // Guaranteed to be a valid string ID
        console.log(`DEBUG: Student "${trimmedName}" EXISTS. Using existing ID: ${studentId}`);
        if (existingStudent.id !== classId) {
          console.log(`DEBUG: Student's classId is different. Updating from ${existingStudent.id} to ${classId}`);
          const studentRef = studentsCol.doc(studentId);
          batch.update(studentRef, { classId: classId });
        }
      }

      if (studentId) {
        studentIdsForClass.push(studentId);
      }
    }

    // --- FIX 2: Atomically add all new and existing student IDs to the class document --- 
    if (studentIdsForClass.length > 0) {
      console.log(`DEBUG: Updating class ${classId} with ${studentIdsForClass.length} student IDs.`);
      batch.update(classRef, {
        studentIds: FieldValue.arrayUnion(...studentIdsForClass)
      });

      // Also create teacher_students links so students appear in roster
      const teacherStudentsCol = firestore.collection('teacher_students');
      for (const studentId of studentIdsForClass) {
        const linkRef = teacherStudentsCol.doc();
        batch.set(linkRef, {
          teacherId: teacherId,
          studentId: studentId
        });
      }
      console.log(`DEBUG: Creating ${studentIdsForClass.length} teacher-student links.`);
    }

    console.log('DEBUG: Committing batch to Firestore.');
    await batch.commit();

    revalidatePath('/dashboard/students');
    revalidatePath(`/dashboard/classes/${classId}`);

    const successMessage = `Roster processed. Added ${newStudentsCount} new students and linked/verified ${studentIdsForClass.length} total students in the class.`;
    console.log('--- DEBUG: addStudentsToClass SUCCESS ---');

    return { success: true, message: successMessage };

  } catch (error) {
    console.error('--- DEBUG: addStudentsToClass FAILED ---');
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error('Error Details:', error);
    // probelm die sini tadi, lepas upload .. dia ada bgtau error line berapa?
    return { success: false, error: `Failed to process roster: ${errorMessage}` };
  }
}
