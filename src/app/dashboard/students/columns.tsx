'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { Student, Class } from '@/lib/definitions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

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
      return value === row.getValue(id);
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
    id: 'remarks',
    header: 'Remarks',
    cell: ({ row }) => {
      const student = row.original;
      const remarks: string[] = [];

      // Check if student has zero progress on all variables
      const hasNoActivity =
        (!student.progress || student.progress === 0) &&
        (!student.currentActivityScore || student.currentActivityScore === 0) &&
        (!student.timePlayed || student.timePlayed === 0) &&
        (!student.experimentsCompleted || student.experimentsCompleted === 0) &&
        (!student.activitiesCompleted || student.activitiesCompleted === 0);

      if (hasNoActivity) {
        remarks.push("The student has not logged in yet");
      } else {
        // Check experiment progress (assuming 100% = complete)
        if (student.progress < 100) {
          remarks.push("The student did not do the pendulum oscillation 15 times");
        }

        // Check activity score
        if (student.currentActivityScore > 10) {
          remarks.push("This student has repeated the activity more than once");
        } else if (student.currentActivityScore < 10 && student.currentActivityScore > 0) {
          remarks.push("This student has not yet gained full mark on the activity");
        }

        // Check if both activities are incomplete
        if ((student.experimentsCompleted || 0) < 1 && (student.activitiesCompleted || 0) < 1) {
          remarks.push("This student has not completed both activities");
        }
      }

      if (remarks.length === 0) {
        return <span className="text-muted-foreground italic">No remarks</span>;
      }

      return (
        <ul className="text-sm space-y-1">
          {remarks.map((remark, index) => (
            <li key={index} className="text-muted-foreground">
              • {remark}
            </li>
          ))}
        </ul>
      );
    },
  },
];