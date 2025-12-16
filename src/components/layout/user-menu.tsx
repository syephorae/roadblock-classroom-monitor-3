'use client';

import { LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useSidebar } from '../ui/sidebar';
import { useAuth, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';

export function UserMenu() {
  const { state } = useSidebar();
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };
  
  const getInitials = (name?: string | null) => {
    if (!name) return 'T';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 px-2"
        >
          <Avatar className="size-8">
            <AvatarImage
              src={user?.photoURL ?? `https://picsum.photos/seed/teacher/100/100`}
              alt="Teacher Avatar"
              data-ai-hint="teacher avatar"
            />
            <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
          </Avatar>
          {state === 'expanded' && (
            <div className="flex flex-col items-start text-left">
              <span className="text-sm font-medium">{user?.displayName ?? 'Teacher'}</span>
              <span className="text-xs text-muted-foreground">
                {user?.email ?? 'teacher@school.edu'}
              </span>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 mb-2" side="top" align="start">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
