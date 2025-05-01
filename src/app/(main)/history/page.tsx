'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { redirect } from 'next/navigation';
import { AppSidebar } from '@/components/global/app-sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { ModeToggle } from '@/components/global/Mode-toggle';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { signOutAction } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface Post {
  id: string;
  platform: string;
  content: string;
  image?: string;
  is_draft: boolean;
  created_at: string;
}

export default function History() {
  const [userData, setUserData] = useState<{ username: string; profile_picture?: string | null } | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        redirect('/sign-in');
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('username, profile_picture')
        .eq('id', user.id)
        .single();

      const { data: postsData } = await supabase
        .from('posts')
        .select('id, platform, content, image, is_draft, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setUserData(userData);
      setPosts(postsData || []);
    };
    fetchData();
  }, [supabase]);

  const handleDeletePost = async () => {
    if (!deletePostId) return;
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', deletePostId);

    if (!error) {
      setPosts(posts.filter((post) => post.id !== deletePostId));
      setDeletePostId(null);
    }
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
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-6">Post History</h1>
          {posts.length > 0 ? (
            <div className="grid gap-4">
              {posts.map((post) => (
                <Card key={post.id}>
                  <CardHeader>
                    <CardTitle>
                      {post.platform} Post {post.is_draft ? '(Draft)' : ''}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{post.content}</p>
                    {post.image && <img src={post.image} alt="Post image" className="mt-2 max-w-full h-auto" />}
                    <p className="text-sm text-gray-500 mt-2">
                      Created: {new Date(post.created_at).toLocaleString()}
                    </p>
                    <Button
                      variant="destructive"
                      className="mt-2"
                      onClick={() => setDeletePostId(post.id)}
                    >
                      Delete
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p>No posts found.</p>
          )}
          {deletePostId && (
            <Dialog open={!!deletePostId} onOpenChange={() => setDeletePostId(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Deletion</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this post? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeletePostId(null)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDeletePost}>
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}