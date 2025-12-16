'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { Student, Class } from '@/lib/definitions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RecommendationsButton } from './recommendations-button';

// Helper function for smart name filtering
const normalizeName = (name: string): string => {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/\bbin\b/g, 'b')
    .replace(/\bbinti\b/g, 'bt')
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
};

// This function now generates the columns and accepts the classes data as a prop.
export const getColumns = (classes: Class[]): ColumnDef<Student>[] => [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const student = row.original;
      const fallback = student.name
        .split(' ')
        .map((n) => n[0])
        .join('');
      return (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={student.avatar} alt={student.name} data-ai-hint="student avatar" />
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{student.name}</div>
            <div className="text-sm text-muted-foreground">
              {student.robloxUsername ? `@${student.robloxUsername}` : ''}
            </div>
          </div>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const normalizedRowValue = normalizeName(row.getValue(id));
      const normalizedFilterValue = normalizeName(value);
      return normalizedRowValue.includes(normalizedFilterValue);
    },
  },
    {
    accessorKey: 'classId',
    header: 'Class',
    cell: ({ row }) => {
      const classId = row.original.classId;
      const className = classes?.find((c) => c.id === classId)?.name || 'N/A';
      return <span>{className}</span>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'progress', // CORRECTED: Use the 'progress' field for the percentage.
    header: 'Experiment Progress',
    cell: ({ row }) => {
      const progress = row.original.progress || 0;
      let progressColor = 'bg-primary';
      if (progress < 40) {
        progressColor = 'bg-destructive';
      } else if (progress < 70) {
        progressColor = 'bg-yellow-500';
      }
      return (
        <div className="flex items-center gap-2">
          <Progress value={progress} indicatorClassName={progressColor} className="w-24" />
          <span className="text-sm text-muted-foreground">{progress}%</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'experimentsCompleted',
    header: 'Experiment',
    cell: ({ row }) => {
      const isCompleted = (row.original.experimentsCompleted || 0) > 0;
      return isCompleted ? (
        <Badge variant="secondary">Completed</Badge>
      ) : (
        <Badge variant="outline">Not Completed</Badge>
      );
    },
  },
    {
    accessorKey: 'activitiesCompleted',
    header: 'Activity',
    cell: ({ row }) => {
      const isCompleted = (row.original.activitiesCompleted || 0) > 0;
       return isCompleted ? (
        <Badge variant="secondary">Completed</Badge>
      ) : (
        <Badge variant="outline">Not Completed</Badge>
      );
    },
  },
  {
    accessorKey: 'currentActivityScore',
    header: 'Current Activity Score', // CORRECTED: Reverted to original name.
    cell: ({ row }) => {
      const score = row.original.currentActivityScore || 0;
      return <span>{score}</span>; // CORRECTED: Display as a raw, cumulative number.
    },
  },
  {
    accessorKey: 'timePlayed',
    header: 'Time Played',
    cell: ({ row }) => {
      const time = row.original.timePlayed || 0;
      return <span>{time} minutes</span>;
    },
  },
  {
    accessorKey: 'lastUpdated',
    header: 'Last Updated',
    cell: ({ row }) => {
      const { lastUpdated } = row.original;
      if (!lastUpdated) {
        return 'N/A';
      }
      const date = lastUpdated.toDate();
      return date.toLocaleString();
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const student = row.original;
      return <RecommendationsButton student={student} />;
    },
  },
];