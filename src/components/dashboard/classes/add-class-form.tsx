'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import * as React from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  className: z.string().min(2, {
    message: 'Class name must be at least 2 characters.',
  }),
  description: z.string().optional(),
});

export function AddClassForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      className: '',
      description: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create a class.',
        variant: 'destructive',
      });
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const classData = {
        name: values.className,
        description: values.description || '',
        teacherId: user.uid, // This was the missing link!
        students: [], // Changed from studentIds to match definition
        normalizedName: values.className.toUpperCase(), // Add normalized name
      };

      const docRef = await addDoc(collection(firestore, 'classes'), classData);

      toast({
        title: 'Class Added!',
        description: `The class "${values.className}" has been created.`,
      });

      form.reset();
      router.push(`/dashboard/classes/${docRef.id}`);
    } catch (error) {
      console.error('Error adding class: ', error);
      toast({
        title: 'Error Creating Class',
        description: 'There was a problem saving your class. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="className"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Class Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 1 UPM" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A brief description of the class."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add Class
        </Button>
      </form>
    </Form>
  );
}
