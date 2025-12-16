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
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import * as React from 'react';
import { addClass } from '@/lib/actions';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  className: z.string().min(2, {
    message: 'Class name must be at least 2 characters.',
  }),
});

export function AddClassForm() {
  const { toast } = useToast();
  const [isPending, startTransition] = React.useTransition();
  const { user, isUserLoading } = useUser(); // <-- Correctly get the user loading state
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      className: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Additional safeguard
    if (isUserLoading || !user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'User information is still loading. Please wait a moment and try again.',
      });
      return;
    }

    startTransition(async () => {
      const result = await addClass(values.className, user.uid);

      if (result.success) {
        toast({
          title: 'Class Added!',
          description: `The class "${values.className}" has been created.`,
        });
        form.reset();
        if (result.classId) {
          router.push(`/dashboard/classes/${result.classId}`);
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Failed to add class',
          description: result.error || 'An unknown error occurred.',
        });
      }
    });
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
        {/* The button is now disabled while the user is loading OR a submission is pending */}
        <Button type="submit" disabled={isPending || isUserLoading}>
          {(isPending || isUserLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add Class
        </Button>
      </form>
    </Form>
  );
}
