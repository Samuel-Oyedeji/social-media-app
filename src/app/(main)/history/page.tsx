'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Toast,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from '@/components/ui/toast';

type Post = {
  id: string;
  platform: string;
  content: string;
  image?: string;
  is_draft: boolean;
  created_at: string;
};

type ToastMessage = {
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
};

export default function HistoryPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [editContent, setEditContent] = useState('');
  const [newImage, setNewImage] = useState<FileList | null>(null);
  const [editMode, setEditMode] = useState<'content' | 'image' | null>(null);
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);
  const supabase = createClient();

  const showToast = (message: ToastMessage) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000); // Auto-dismiss after 3s
  };

  useEffect(() => {
    const fetchPosts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_draft', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        showToast({
          title: 'Error',
          description: 'Failed to load posts.',
          variant: 'destructive',
        });
      } else {
        setPosts(data || []);
      }
    };

    fetchPosts();
  }, [supabase]);

  const handleDelete = async (postId: string) => {
    const { error } = await supabase.from('posts').delete().eq('id', postId);

    if (error) {
      console.error('Error deleting post:', error);
      showToast({
        title: 'Error',
        description: 'Failed to delete post.',
        variant: 'destructive',
      });
    } else {
      setPosts(posts.filter((post) => post.id !== postId));
      showToast({
        title: 'Success',
        description: 'Post deleted!',
      });
    }
  };

  const handleEditContent = (post: Post) => {
    setSelectedPost(post);
    setEditContent(post.content);
    setEditMode('content');
  };

  const handleEditImage = (post: Post) => {
    setSelectedPost(post);
    setNewImage(null);
    setEditMode('image');
  };

  const handleUpdateContent = async () => {
    if (!selectedPost) return;

    const { error } = await supabase
      .from('posts')
      .update({ content: editContent })
      .eq('id', selectedPost.id);

    if (error) {
      console.error('Error updating post:', error);
      showToast({
        title: 'Error',
        description: 'Failed to update post.',
        variant: 'destructive',
      });
    } else {
      setPosts(
        posts.map((post) =>
          post.id === selectedPost.id ? { ...post, content: editContent } : post
        )
      );
      setSelectedPost(null);
      setEditMode(null);
      showToast({
        title: 'Success',
        description: 'Post updated!',
      });
    }
  };

  const handleUpdateImage = async () => {
    if (!selectedPost || !newImage || newImage.length === 0) return;

    const file = newImage[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `post-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('posts')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      showToast({
        title: 'Error',
        description: 'Failed to upload image.',
        variant: 'destructive',
      });
      return;
    }

    const { data: urlData } = supabase.storage.from('posts').getPublicUrl(fileName);
    const imageUrl = urlData.publicUrl;

    const { error: updateError } = await supabase
      .from('posts')
      .update({ image: imageUrl })
      .eq('id', selectedPost.id);

    if (updateError) {
      console.error('Error updating image:', updateError);
      showToast({
        title: 'Error',
        description: 'Failed to update image.',
        variant: 'destructive',
      });
    } else {
      setPosts(
        posts.map((post) =>
          post.id === selectedPost.id ? { ...post, image: imageUrl } : post
        )
      );
      setSelectedPost(null);
      setEditMode(null);
      showToast({
        title: 'Success',
        description: 'Image updated!',
      });
    }
  };

  return (
    <ToastProvider>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Post History</h1>
        <div className="grid gap-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <CardTitle>{post.platform} Post</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{post.content}</p>
                {post.image && (
                  <img
                    src={post.image}
                    alt="Post image"
                    className="mt-2 max-w-full h-auto"
                  />
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Posted on: {new Date(post.created_at).toLocaleString()}
                </p>
                <div className="flex gap-2 mt-2">
                  <Button onClick={() => handleEditContent(post)}>Edit Content</Button>
                  <Button onClick={() => handleEditImage(post)}>Edit Image</Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(post.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {selectedPost && (
          <Dialog
            open={!!selectedPost}
            onOpenChange={() => {
              setSelectedPost(null);
              setEditMode(null);
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editMode === 'content' ? 'Edit Content' : 'Edit Image'}</DialogTitle>
              </DialogHeader>
              {editMode === 'content' ? (
                <>
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <Button onClick={handleUpdateContent}>Save Changes</Button>
                </>
              ) : (
                <>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewImage(e.target.files)}
                  />
                  <Button onClick={handleUpdateImage}>Save Image</Button>
                </>
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>
      <ToastViewport />
      {toastMessage && (
        <Toast
          open={!!toastMessage}
          onOpenChange={() => setToastMessage(null)}
          variant={toastMessage.variant}
        >
          <ToastTitle>{toastMessage.title}</ToastTitle>
          <ToastDescription>{toastMessage.description}</ToastDescription>
          <ToastClose />
        </Toast>
      )}
    </ToastProvider>
  );
}