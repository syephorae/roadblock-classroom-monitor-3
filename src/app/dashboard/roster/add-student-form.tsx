'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTransition } from 'react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { addStudent } from '@/lib/actions';
import type { Class } from '@/lib/definitions';

const formSchema = z.object({
  name: z.string().min(1, 'Student name is required'),
  schoolId: z.string().min(1, 'School ID is required'),
  classId: z.string(),
});

export function AddStudentForm({ classes, onFinished }: { classes: Class[]; onFinished?: () => void }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      schoolId: '',
      classId: classes[0]?.id || '',
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      const result = await addStudent(data);
      if (result.success) {
        toast({ title: 'Success', description: 'Student added to the roster.' });
        onFinished?.();
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input placeholder="Student's full name" {...register('name')} />
      {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}

      <Input placeholder="School ID (e.g., SeMSe)" {...register('schoolId')} />
      {errors.schoolId && <p className="text-xs text-destructive">{errors.schoolId.message}</p>}

      <Controller
        control={control}
        name="classId"
        render={({ field }) => (
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger>
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      />

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Add Student
      </Button>
    </form>
  );
}
