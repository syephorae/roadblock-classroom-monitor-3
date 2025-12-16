
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import * as React from 'react';

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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Logo } from '@/components/logo';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth, useUser } from '@/firebase';
import {
  initiateEmailSignIn,
  initiateEmailSignUp,
} from '@/firebase/non-blocking-login';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const formSchema = z
  .object({
    mode: z.enum(['login', 'signup']),
    name: z.string().optional(),
    school: z.string().optional(),
    newSchoolName: z.string().optional(),
    email: z.string().email({ message: 'Please enter a valid email.' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters.' }),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.mode === 'signup' && data.school === 'new' && !data.newSchoolName) {
        return false;
      }
      return true;
    },
    {
      message: 'Please enter the new school name.',
      path: ['newSchoolName'],
    }
  )
  .refine(
    (data) => {
      if (data.mode === 'signup' && !data.name) {
        return false;
      }
      return true;
    },
    {
      message: 'Name is required.',
      path: ['name'],
    }
  )
  .refine(
    (data) => {
      if (data.mode === 'signup' && data.password !== data.confirmPassword) {
        return false;
      }
      return true;
    },
    {
      message: 'Passwords do not match.',
      path: ['confirmPassword'],
    }
  );

export function LoginForm() {
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading, setNewUserDetails } = useUser();
  const [mode, setMode] = React.useState<'login' | 'signup'>('login');
  const [isPending, startTransition] = React.useTransition();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mode: 'login',
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      school: '',
      newSchoolName: '',
    },
  });

  const schoolValue = form.watch('school');
  const formMode = form.watch('mode');

  React.useEffect(() => {
    form.setValue('mode', mode);
     // Reset fields when mode changes
    form.reset({
      mode: mode,
      email: form.getValues('email'), // keep email if user just toggled
      password: '',
      confirmPassword: '',
      name: '',
      school: '',
      newSchoolName: '',
    });
  }, [mode, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(() => {
      if (values.mode === 'signup') {
        if (setNewUserDetails && values.name) {
          const schoolName = values.school === 'new' ? values.newSchoolName : values.school;
          setNewUserDetails({
            displayName: values.name,
            school: schoolName || ''
          });
        }
        initiateEmailSignUp(auth, values.email, values.password);
      } else {
        initiateEmailSignIn(auth, values.email, values.password);
      }
    });
  }

  if (isUserLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="items-center text-center">
        <Logo />
        <CardTitle className="text-2xl pt-4">
          KSSMLab Student Monitor
        </CardTitle>
        <CardDescription>
          {mode === 'login'
            ? 'Welcome back! Please sign in to continue.'
            : 'Create an account to get started.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {formMode === 'signup' && (
              <>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="school"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your school" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="new">Add new school...</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {schoolValue === 'new' && (
                  <FormField
                    control={form.control}
                    name="newSchoolName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New School Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter school name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="teacher@school.edu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {formMode === 'signup' && (
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {formMode === 'login' ? 'Log In' : 'Sign Up'}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          {mode === 'login' ? (
            <>
              Don&apos;t have an account?{' '}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => setMode('signup')}
              >
                Sign up
              </Button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => setMode('login')}
              >
                Log in
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
