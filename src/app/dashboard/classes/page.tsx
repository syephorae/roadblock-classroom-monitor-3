'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AddClassForm } from './add-class-form';
import { ClassesList } from './classes-list';
import { Separator } from '@/components/ui/separator';

export default function ClassesPage() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Manage Classes</h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add a New Class</CardTitle>
            <CardDescription>
              Create a new class to organize your students.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddClassForm />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Existing Classes</CardTitle>
            <CardDescription>
              View and manage your existing classes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClassesList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
