'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RosterStudentsTable } from './roster-students-table';
import { UnclaimedStudentsTable } from './unclaimed-students-table';

export default function StudentsPage() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Students</h1>
      </div>

      <Tabs defaultValue="roster">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="roster">My Roster</TabsTrigger>
          <TabsTrigger value="unclaimed">Unclaimed Roblox Accounts</TabsTrigger>
        </TabsList>
        <TabsContent value="roster" className="mt-4">
          <RosterStudentsTable />
        </TabsContent>
        <TabsContent value="unclaimed" className="mt-4">
          <UnclaimedStudentsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
