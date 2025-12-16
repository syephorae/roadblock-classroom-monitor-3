'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { OverviewCards } from '@/components/dashboard/overview-cards';
import { ProgressChart } from '@/components/dashboard/progress-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Student } from '@/lib/definitions';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firestore || !user?.uid) {
      if (!isUserLoading) setIsLoading(false);
      return;
    }

    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        // 1. Find all student IDs linked to the current teacher
        const teacherStudentLinksRef = collection(firestore, 'teacher_students');
        const q = query(teacherStudentLinksRef, where('teacherId', '==', user.uid));
        const linkSnap = await getDocs(q);
        const studentIds = linkSnap.docs.map(d => d.data().studentId);

        if (studentIds.length === 0) {
          setStudents([]);
          setIsLoading(false);
          return;
        }

        // 2. Fetch the data for those students
        const studentsRef = collection(firestore, 'students');
        const studentQuery = query(studentsRef, where('id', 'in', studentIds));
        const studentSnap = await getDocs(studentQuery);
        const studentData = studentSnap.docs.map(d => d.data() as Student);

        setStudents(studentData);
      } catch (error) {
        console.error("Error fetching students:", error);
        setStudents([]); // Clear students on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [firestore, user, isUserLoading]);

  const { 
    totalStudents, 
    avgProgress, 
    avgTimePlayed, 
    avgExperimentScore, 
    avgActivityScore, 
    chartData 
  } = useMemo(() => {
    if (!students || students.length === 0) {
      return {
        totalStudents: 0,
        avgProgress: 0,
        avgTimePlayed: 0,
        avgExperimentScore: 0,
        avgActivityScore: 0,
        chartData: [],
      };
    }

    const totalStudents = students.length;
    const totalProgress = students.reduce((sum, s) => sum + (s.progress || 0), 0);
    const avgProgress = Math.round(totalProgress / totalStudents);
    const totalTimePlayed = students.reduce((sum, s) => sum + (s.timePlayed || 0), 0);
    const avgTimePlayed = Math.round(totalTimePlayed / totalStudents);
    const totalExperimentScore = students.reduce((sum, s) => sum + (s.currentActivityScore || 0), 0);
    const avgExperimentScore = Math.round(totalExperimentScore / totalStudents);
    const totalActivityScore = students.reduce((sum, s) => sum + (s.activitiesCompleted || 0), 0);
    const avgActivityScore = Math.round(totalActivityScore / totalStudents);

    const progressDistribution = students.reduce(
      (acc, student) => {
        const progress = student.progress || 0;
        if (progress >= 80) acc['80-100']++;
        else if (progress >= 60) acc['60-79']++;
        else if (progress >= 40) acc['40-59']++;
        else if (progress >= 20) acc['20-39']++;
        else acc['0-19']++;
        return acc;
      },
      { '0-19': 0, '20-39': 0, '40-59': 0, '60-79': 0, '80-100': 0 }
    );

    const chartData = Object.entries(progressDistribution).map(([range, count]) => ({
      name: range,
      students: count,
    }));

    return { totalStudents, avgProgress, avgTimePlayed, avgExperimentScore, avgActivityScore, chartData };
  }, [students]);

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      {totalStudents > 0 ? (
        <>
          <OverviewCards
            totalStudents={totalStudents}
            avgProgress={avgProgress}
            avgTimePlayed={avgTimePlayed}
            avgExperimentScore={avgExperimentScore}
            avgActivityScore={avgActivityScore}
          />
          <Card>
            <CardHeader>
              <CardTitle>Class Progress Distribution (Overall)</CardTitle>
            </CardHeader>
            <CardContent>
              <ProgressChart data={chartData} />
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
            <CardHeader>
                <CardTitle>Welcome!</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    You don\'t have any students yet. Create a class and upload a roster to get started.
                </p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
