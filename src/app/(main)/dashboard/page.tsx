import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { AppSidebar } from '@/components/global/app-sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { ModeToggle } from '@/components/global/Mode-toggle';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { signOutAction } from '@/app/actions';

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return redirect('/sign-in');
  }

  const { data: userData } = await supabase
    .from('users')
    .select('username, profile_picture')
    .eq('id', user.id)
    .single();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1" />
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="h-8 w-8">
                <AvatarImage src={userData?.profile_picture || ''} alt={userData?.username || 'User'} />
                <AvatarFallback>{userData?.username?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <a href="/settings">Settings</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/history">History</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/profile">Edit Profile</a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <form action={signOutAction}>
                  <button type="submit">Log Out</button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <div className="flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold mb-6">Welcome, {userData?.username}!</h1>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}