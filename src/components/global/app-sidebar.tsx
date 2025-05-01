'use client';

import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import PostGenerator from '@/components/core/PostGenerator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createClient } from '@/utils/supabase/client';

export function AppSidebar() {
  const [open, setOpen] = useState(false);
  const [userGenres, setUserGenres] = useState<string[]>([]);

  // Fetch user genres for PostGenerator
  const fetchUserGenres = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('users')
        .select('genres')
        .eq('id', user.id)
        .single();
      setUserGenres(data?.genres || []);
    }
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button onClick={() => { fetchUserGenres(); setOpen(true); }}>
                    Generate Post
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button asChild>
                    <a href="/drafts">Drafts</a>
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate a Post</DialogTitle>
          </DialogHeader>
          <PostGenerator userGenres={userGenres} />
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}