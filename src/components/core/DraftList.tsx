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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Toast,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from '@/components/ui/toast';
import emailjs from '@emailjs/browser';

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

export default function DraftList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [editContent, setEditContent] = useState('');
  const [newImage, setNewImage] = useState<FileList | null>(null);
  const [editMode, setEditMode] = useState<'content' | 'image' | null>(null);
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [postToShare, setPostToShare] = useState<Post | null>(null);
  const supabase = createClient();

  const showToast = (message: ToastMessage) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000); // Auto-dismiss after 3s
  };

  const sendEmail = async (to: string, subject: string, text: string) => {
    try {
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

      if (!serviceId || !templateId || !publicKey) {
        throw new Error('EmailJS configuration missing');
      }

      emailjs.init(publicKey);
      const response = await emailjs.send(serviceId, templateId, {
        to_email: to,
        subject,
        message: text,
        from_name: 'YourApp',
      });
      console.log(`Email sent to ${to}: ${subject}`, response);
    } catch (error) {
      console.error('Error sending email via EmailJS:', error);
    }
  };

  useEffect(() => {
    const fetchDrafts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_draft', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching drafts:', error);
        showToast({
          title: 'Error',
          description: 'Failed to load drafts.',
          variant: 'destructive',
        });
      } else {
        setPosts(data || []);
      }
    };

    fetchDrafts();
  }, [supabase]);

  const handleDelete = async (postId: string) => {
    const { error } = await supabase.from('posts').delete().eq('id', postId);

    if (error) {
      console.error('Error deleting draft:', error);
      showToast({
        title: 'Error',
        description: 'Failed to delete draft.',
        variant: 'destructive',
      });
    } else {
      setPosts(posts.filter((post) => post.id !== postId));
      showToast({
        title: 'Success',
        description: 'Draft deleted!',
      });
    }
  };

  const handleSharePost = (post: Post) => {
    setPostToShare(post);
    setShareDialogOpen(true);
  };

  const handleShareToPlatform = async (platform: 'Twitter' | 'Instagram') => {
    if (!postToShare) return;

    // Construct share URL or action
    if (platform === 'Twitter') {
      const tweetText = encodeURIComponent(postToShare.content);
      window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
    } else if (platform === 'Instagram') {
      navigator.clipboard.writeText(postToShare.content).then(() => {
        showToast({
          title: 'Copied!',
          description: 'Post content copied to clipboard. Opening Instagram...',
        });
        window.open('https://www.instagram.com', '_blank');
      }).catch((err) => {
        console.error('Failed to copy to clipboard:', err);
        showToast({
          title: 'Error',
          description: 'Failed to copy content. Opening Instagram...',
          variant: 'destructive',
        });
        window.open('https://www.instagram.com', '_blank');
      });
    }

    // Update Supabase after sharing
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('posts')
        .update({ is_draft: false })
        .eq('id', postToShare.id);

      if (error) {
        console.error('Error saving shared post:', error);
        showToast({ title: 'Error', description: 'Failed to save post.', variant: 'destructive' });
      } else {
        setPosts(posts.filter((p) => p.id !== postToShare.id));
        showToast({ title: 'Success', description: 'Post shared and saved!' });
        if (user.email) {
          const { data: settings } = await supabase
            .from('user_settings')
            .select('email_notifications')
            .eq('user_id', user.id)
            .single();

          if (settings?.email_notifications) {
            await sendEmail(
              user.email,
              'Post Shared',
              `Your post for ${postToShare.platform} has been shared: ${postToShare.content}`
            );
          }
        }
      }
    }

    setShareDialogOpen(false);
    setPostToShare(null);
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
      console.error('Error updating draft:', error);
      showToast({
        title: 'Error',
        description: 'Failed to update draft.',
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
        description: 'Draft updated!',
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
        <h1 className="text-2xl font-bold mb-4">Drafts</h1>
        <div className="grid gap-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <CardTitle>{post.platform} Draft</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{post.content}</p>
                {post.image && (
                  <img
                    src={post.image}
                    alt="Draft image"
                    className="mt-2 max-w-full h-auto"
                  />
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Created: {new Date(post.created_at).toLocaleString()}
                </p>
                <div className="flex gap-2 mt-2">
                  <Button effect="shineHover" onClick={() => handleEditContent(post)}>Edit Content</Button>
                  <Button effect="shineHover" onClick={() => handleEditImage(post)}>Edit Image</Button>
                  <Button effect="shineHover" onClick={() => handleSharePost(post)}>Share</Button>
                  <Button
                    variant="destructive" effect="shineHover"
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
                  <Button effect="ringHover" onClick={handleUpdateContent}>Save Changes</Button>
                </>
              ) : (
                <>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewImage(e.target.files)}
                  />
                  <Button effect="ringHover" onClick={handleUpdateImage}>Save Image</Button>
                </>
              )}
            </DialogContent>
          </Dialog>
        )}
        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Post</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-2">
              <Button effect="ringHover" onClick={() => handleShareToPlatform('Twitter')}>
                Share to Twitter
              </Button>
              <Button effect="ringHover" onClick={() => handleShareToPlatform('Instagram')}>
                Share to Instagram
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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