'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { AppSidebar } from '@/components/global/app-sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { ModeToggle } from '@/components/global/Mode-toggle';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { signOutAction } from '@/app/actions';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

export default function Settings() {
  const [userData, setUserData] = useState<{ username: string; profile_picture?: string } | null>(null);
  const [notifications, setNotifications] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/sign-in');
        return;
      }

      const { data } = await supabase
        .from('users')
        .select('username, profile_picture')
        .eq('id', user.id)
        .single();

      if (data) {
        setUserData(data);
      }
    };
    fetchUserData();
  }, [router, supabase]);

  const handleSaveSettings = () => {
    // Placeholder: Save settings (e.g., to Supabase or local storage)
    alert(`Notifications: ${notifications ? 'Enabled' : 'Disabled'}`);
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

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
          <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
            <h1 className="text-2xl font-bold mb-6">Settings</h1>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications">Enable Notifications</Label>
                <Switch
                  id="notifications"
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
              <Button onClick={handleSaveSettings}>Save Settings</Button>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}