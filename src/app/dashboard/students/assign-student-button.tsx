'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast'; // CORRECTED IMPORT PATH
import type { Student } from '@/lib/definitions';

interface AssignStudentButtonProps {
  unclaimedStudent: Student;
  rosterStudents: Student[];
  onAssignmentComplete: () => void; // Callback to refresh data
}

export function AssignStudentButton({ 
  unclaimedStudent, 
  rosterStudents, 
  onAssignmentComplete 
}: AssignStudentButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRosterId, setSelectedRosterId] = useState<string | null>(null);
  const [isMerging, setIsMerging] = useState(false);
  const { toast } = useToast();

  const handleMerge = async () => {
    if (!selectedRosterId) {
      toast({ title: 'Error', description: 'Please select a student from the roster.', variant: 'destructive' });
      return;
    }
    setIsMerging(true);
    try {
      const response = await fetch('/api/students/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unclaimedStudentId: unclaimedStudent.id,
          rosterStudentId: selectedRosterId,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to merge accounts.');
      }

      toast({ title: 'Success!', description: `Successfully assigned ${unclaimedStudent.robloxUsername} to the student.` });
      onAssignmentComplete(); // Refresh the table data
      setIsOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({ title: 'Merge Failed', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Assign Student</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Unclaimed Account</DialogTitle>
          <DialogDescription>
            Assign the progress from <strong>{unclaimedStudent.robloxUsername}</strong> to a student on your roster.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select onValueChange={setSelectedRosterId} disabled={isMerging}>
            <SelectTrigger>
              <SelectValue placeholder="Select a student from your roster..." />
            </SelectTrigger>
            <SelectContent>
              {rosterStudents.map((student) => (
                <SelectItem key={student.id} value={student.id}>
                  {student.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={isMerging}>Cancel</Button>
          <Button onClick={handleMerge} disabled={!selectedRosterId || isMerging}>
            {isMerging ? 'Assigning...' : 'Confirm Assignment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
