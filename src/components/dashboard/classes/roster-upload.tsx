'use client';

import { useState, useTransition } from 'react';
import * as XLSX from 'xlsx';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, UserPlus, List } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addStudentsToClass } from '@/lib/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface RosterUploadProps {
  classId: string;
  teacherId: string;
}

export function RosterUpload({ classId, teacherId }: RosterUploadProps) {
  const [studentNames, setStudentNames] = useState<string[]>([]);
  const [fileProcessing, setFileProcessing] = useState(false);
  const [dbUpdating, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileProcessing(true);
    setError(null);
    setStudentNames([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const names = json
          .map((row) => row[0])
          .filter((name) => typeof name === 'string' && name.trim() !== '')
          .map((name) => name.trim());

        if (names.length === 0) {
          throw new Error('No names found in the first column of the file.');
        }

        setStudentNames(names);
        toast({
          title: 'Roster Loaded',
          description: `${names.length} student names are ready. Click "Add to Class" to save them.`,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        setError(`Failed to parse file: ${errorMessage}. Please ensure it\'s a valid Excel or CSV with names in the first column.`);
        toast({
          variant: 'destructive',
          title: 'File Read Failed',
          description: `Could not read names from the file. ${errorMessage}`,
        });
      } finally {
        setFileProcessing(false);
      }
    };
    reader.onerror = () => {
      setError('There was an error reading the selected file.');
      toast({
        variant: 'destructive',
        title: 'File Read Failed',
        description: 'There was an error reading the file.',
      });
      setFileProcessing(false);
    };
    reader.readAsBinaryString(file);
    event.target.value = ''; // Reset file input to allow re-uploading the same file
  };

  const handleAddStudents = () => {
    if (!teacherId || !classId) {
      toast({
        variant: 'destructive',
        title: 'Cannot Add Students',
        description: 'Missing Class ID or Teacher ID. Please refresh the page and try again.',
      });
      return;
    }
    if (studentNames.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Students to Add',
        description: 'Please upload a roster file with student names first.',
      });
      return;
    }

    startTransition(async () => {
      const result = await addStudentsToClass(studentNames, classId, teacherId);
      if (result.success) {
        toast({
          title: 'Success!',
          description: result.message,
        });
        setStudentNames([]); // Clear the list after successful addition
      } else {
        toast({
          variant: 'destructive',
          title: 'Failed to Add Students',
          description: result.error,
        });
      }
    });
  };

  const isPending = fileProcessing || dbUpdating;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Upload Student Roster</CardTitle>
          <CardDescription>
            Upload an Excel or CSV file with student names in the first column. This will create or link students to this class.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="roster-upload" className="flex-1">
              <Button asChild variant="outline" disabled={isPending}>
                <div className="flex items-center">
                  <Upload className="mr-2 h-4 w-4" />
                  <span>{fileProcessing ? 'Processing...' : 'Select File'}</span>
                </div>
              </Button>
            </Label>
            <Input
              id="roster-upload"
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept=".xlsx, .xls, .csv"
              disabled={isPending}
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Upload Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <p className="text-xs text-muted-foreground">Supported formats: .xlsx, .xls, .csv</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Students to Add</CardTitle>
          <CardDescription>A preview of students loaded from your file.</CardDescription>
        </CardHeader>
        <CardContent>
          {isPending && !dbUpdating && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="ml-2">Loading students...</p>
            </div>
          )}
          {!fileProcessing && studentNames.length > 0 && (
            <div className="space-y-4">
              <div className="space-y-2 max-h-80 overflow-y-auto pr-4 border rounded-md p-2">
                {studentNames.map((name, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded-md">
                    <List className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 font-normal">{name}</span>
                  </div>
                ))}
              </div>
              <Button onClick={handleAddStudents} disabled={isPending || studentNames.length === 0} className="w-full">
                {dbUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding Students...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add {studentNames.length} Students to Class
                  </>
                )}
              </Button>
            </div>
          )}
          {!fileProcessing && studentNames.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              {dbUpdating ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="ml-2">Updating database...</p>
                </div>
              ) : (
                'Upload a file to see the list of students to add.'
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
