'use client';

import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import emailjs from '@emailjs/browser';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { createClient } from '@/utils/supabase/client';
import {
  Toast,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from '@/components/ui/toast';
import PostCarousel from './PostCarousel';
import LoadingScreen from './LoadingScreen';

const HUMOR_TYPES = [
  'Informative',
  'Funny',
  'Persuasive',
  'Sarcastic',
  'Normal',
  'Happy',
] as const;

const GENRES = [
  {
    category: 'Tech & Innovation',
    options: [
      'Artificial Intelligence (AI)',
      'Software Development / Programming',
      'Gadgets & Product Reviews',
      'Startups & Entrepreneurship',
      'Cybersecurity',
      'Web3 / Blockchain / Crypto',
      'Fintech',
    ],
  },
  {
    category: 'Health & Wellness',
    options: [
      'Fitness / Gym / Bodybuilding',
      'Mental Health & Self-care',
      'Nutrition & Diet',
      'Yoga / Meditation',
      'Personal Development',
    ],
  },
  {
    category: 'Entertainment',
    options: [
      'Gaming',
      'Movies & TV Shows',
      'Memes & Comedy',
      'Anime',
      'Celebrity Gossip',
      'Streaming (Twitch/YouTube)',
    ],
  },
  {
    category: 'Creative & Arts',
    options: [
      'Photography',
      'Graphic Design / UI/UX',
      'Music / Singing / Instruments',
      'Drawing / Painting / Digital Art',
      'Fashion Design',
    ],
  },
  {
    category: 'Food & Lifestyle',
    options: [
      'Cooking / Recipes',
      'Food Reviews',
      'Lifestyle Vlogs',
      'Travel & Adventure',
      'Home Decor / DIY',
      'Minimalism / Aesthetic Living',
    ],
  },
  {
    category: 'Education & Knowledge',
    options: [
      'Edutainment (Educational + Fun)',
      'Science & Space',
      'History',
      'Language Learning',
      'Study Tips / Productivity',
    ],
  },
  {
    category: 'Sports',
    options: [
      'Football (Soccer)',
      'Basketball',
      'MMA / UFC / Boxing',
      'Tennis / Cricket / Others',
      'Sports News / Commentary',
    ],
  },
  {
    category: 'Career & Business',
    options: [
      'Personal Finance',
      'Investing / Stocks / Crypto',
      'Remote Work / Freelancing',
      'Resume & Interview Tips',
      'Small Business Tips / E-commerce',
      'Leadership & Management',
    ],
  },
  {
    category: 'Motivation & Mindset',
    options: [
      'Life Advice',
      'Quotes & Affirmations',
      'Time Management',
      'Goal Setting / Vision Boards',
    ],
  },
  {
    category: 'Influencer / Creator Genres',
    options: [
      'Beauty & Skincare',
      'Fashion / Outfit Inspo',
      'Mom/Dad Life',
      'Pet Content',
      'Relationship Advice',
      'BookTok / Book Reviews',
    ],
  },
];

const postFormSchema = z.object({
  platform: z.enum(['Instagram', 'Twitter']),
  genres: z.array(z.string()).min(1, 'Select at least one genre'),
  humor: z
    .array(z.enum(HUMOR_TYPES))
    .min(1, 'Select at least one humor type'),
  image: z.instanceof(FileList).optional(),
});

type PostFormValues = z.infer<typeof postFormSchema>;

type GeneratedPost = {
  id: string;
  content: string;
  image?: string;
};

type ToastMessage = {
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
};

// List of Gemini models to randomly select from
const GEMINI_MODELS = [
  'gemini-2.5-flash-preview-04-17',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash-8b',
  'gemini-2.0-flash',
  'gemini-1.5-pro',
  'gemini-1.5-flash',
];

// Prompt templates for variety
const PROMPT_TEMPLATES = [
  `Generate 3 concise and engaging ${'platform'} posts based on the context: ${'context'}. Use humor types: ${'humor'}. Keep posts under 280 characters for Twitter or visually appealing for Instagram. Make each post significantly different from the other and send only the post, nothing else. Number each post as 1., 2., 3.`,
  `Create 3 unique ${'platform'} posts using the context: ${'context'}. Incorporate humor styles: ${'humor'}. Ensure variety and brevity (Twitter < 280 chars, Instagram visual focus). Make each post significantly different from the other and send only the post, nothing else. Number each post as 1., 2., 3.`,
  `Craft 3 diverse ${'platform'} posts from the context: ${'context'}. Apply humor: ${'humor'}. Aim for fresh perspectives, under 280 chars for Twitter or Instagram-ready. Make each post significantly different from the other and send only the post, nothing else. Number each post as 1., 2., 3.`,
];

export default function PostGenerator({ userGenres }: { userGenres: string[] }) {
  const [open, setOpen] = useState(false);
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<GeneratedPost | null>(null);
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [postToShare, setPostToShare] = useState<GeneratedPost | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('Gathering Ideas…');
  const supabase = createClient();

  const showToast = (message: ToastMessage) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
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

  const handleEditPost = (post: GeneratedPost) => {
    setSelectedPost(post);
  };

  const handleUpdatePost = async (content: string) => {
    if (!selectedPost) return;
    setPosts(posts.map((p) => (p.id === selectedPost.id ? { ...p, content } : p)));
    setSelectedPost(null);
    showToast({ title: 'Success', description: 'Post updated!' });
  };

  const handleSaveDraft = async (post: GeneratedPost) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('posts').insert({
      user_id: user.id,
      platform: form.getValues('platform'),
      content: post.content,
      image: post.image,
      is_draft: true,
    });
    if (error) {
      console.error('Error saving draft:', error);
      showToast({ title: 'Error', description: 'Failed to save draft.', variant: 'destructive' });
    } else {
      setPosts(posts.filter((p) => p.id !== post.id));
      showToast({ title: 'Success', description: 'Draft saved!' });
      if (user.email) {
        const { data: settings } = await supabase
          .from('user_settings')
          .select('email_notifications')
          .eq('user_id', user.id)
          .single();
        if (settings?.email_notifications) {
          await sendEmail(
            user.email,
            'Draft Saved',
            `Your draft for ${form.getValues('platform')} has been saved: ${post.content}`
          );
        }
      }
    }
  };

  const handleSharePost = (post: GeneratedPost) => {
    setPostToShare(post);
    setShareDialogOpen(true);
  };

  const handleShareToPlatform = async (platform: 'Twitter' | 'Instagram') => {
    if (!postToShare) return;

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

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        platform: form.getValues('platform'),
        content: postToShare.content,
        image: postToShare.image,
        is_draft: false,
      });
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
              `Your post for ${form.getValues('platform')} has been shared: ${postToShare.content}`
            );
          }
        }
      }
    }

    setShareDialogOpen(false);
    setPostToShare(null);
  };

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      platform: 'Instagram',
      genres: [],
      humor: ['Normal'],
      image: undefined,
    },
  });

  const onSubmit = async (data: PostFormValues) => {
    setLoading(true);
    setLoadingStep('Gathering Ideas…');

    try {
      const searchQueries = data.genres.map((genre) => `${genre} latest news`);
      const scrapedData = await Promise.all(
        searchQueries.map(async (query) => {
          const response = await fetch(`/api/serpapi?query=${encodeURIComponent(query)}`);
          if (!response.ok) throw new Error(`SerpAPI proxy error: ${response.statusText}`);
          const results = await response.json();
          if (results.error) throw new Error(results.error);
          return results.organic_results?.slice(0, 3).map((result: any) => ({
            title: result.title,
            snippet: result.snippet,
            link: result.link,
          })) || [];
        })
      );
      const context = scrapedData.flat().map((item) => `${item.title}: ${item.snippet}`).join('\n') || 'No context available';

      setLoadingStep('Writing Posts…');

      const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!geminiApiKey) {
        showToast({
          title: 'Error',
          description: 'Gemini API key is missing.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }
      const selectedModel = GEMINI_MODELS[Math.floor(Math.random() * GEMINI_MODELS.length)];
      console.log(`Using Gemini model: ${selectedModel}`);
      const randomPrompt = PROMPT_TEMPLATES[Math.floor(Math.random() * PROMPT_TEMPLATES.length)]
        .replace('platform', data.platform)
        .replace('context', context)
        .replace('humor', data.humor.join(', '));
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: randomPrompt }] }] }),
        }
      );
      if (!geminiResponse.ok) throw new Error(`Gemini API error: ${geminiResponse.statusText}`);
      const geminiData = await geminiResponse.json();
      const rawContent = geminiData.candidates?.[0]?.content?.parts[0]?.text || '';
      const separatedPosts: GeneratedPost[] = rawContent
        .split('\n')
        .filter((post: string) => post.trim().length > 0)
        .slice(0, 3) // Ensure we get up to 3 posts
        .map((content: string, index: number) => ({
          id: `post-${Date.now()}-${index}`,
          content: content.trim(),
        }));

      if (separatedPosts.length === 0) {
        showToast({
          title: 'Error',
          description: 'No posts generated.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      setLoadingStep('Adding Visuals…');

      let imageUrl = '';
      if (data.image && data.image.length > 0) {
        const file = data.image[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `post-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('posts').upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('posts').getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      } else if (data.platform === 'Instagram') {
        const unsplashApiKey = process.env.NEXT_PUBLIC_UNSPLASH_API_KEY;
        if (!unsplashApiKey) {
          showToast({ title: 'Warning', description: 'Unsplash API key missing.' });
        } else {
          const randomGenre = data.genres[Math.floor(Math.random() * data.genres.length)];
          const query = encodeURIComponent(`${randomGenre} creative ${['nature', 'urban', 'abstract'][Math.floor(Math.random() * 3)]}`);
          const unsplashResponse = await fetch(
            `https://api.unsplash.com/search/photos?query=${query}&per_page=1&client_id=${unsplashApiKey}`
          );
          if (!unsplashResponse.ok) throw new Error(`Unsplash error: ${unsplashResponse.statusText}`);
          const unsplashData = await unsplashResponse.json();
          imageUrl = unsplashData.results[0]?.urls.regular || (await fetchDefaultImage(unsplashApiKey));
        }
      }

      setLoadingStep('Finalizing…');

      setPosts(separatedPosts.map((post: GeneratedPost) => ({ ...post, image: imageUrl || undefined })));
      showToast({ title: 'Success', description: `${separatedPosts.length} posts generated!` });
      setOpen(false);

      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email) {
        const { data: settings } = await supabase
          .from('user_settings')
          .select('email_notifications')
          .eq('user_id', user.id)
          .single();
        if (settings?.email_notifications) {
          await sendEmail(
            user.email,
            'Posts Generated',
            `Successfully generated ${separatedPosts.length} posts for ${data.platform} using model ${selectedModel}.`
          );
        }
      }
    } catch (error) {
      console.error('Error generating posts:', error);
      showToast({
        title: 'Error',
        description: 'Failed to generate posts.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  async function fetchDefaultImage(unsplashApiKey: string) {
    const defaultQuery = encodeURIComponent('creative abstract');
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${defaultQuery}&per_page=1&client_id=${unsplashApiKey}`
    );
    const data = await response.json();
    return data.results[0]?.urls.regular || '';
  }

  return (
    <ToastProvider>
      <div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Generate Post</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Generate a Post</DialogTitle>
            </DialogHeader>
            {loading ? (
              <LoadingScreen step={loadingStep} />
            ) : (
              <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="platform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Instagram">Instagram</SelectItem>
                            <SelectItem value="Twitter">Twitter</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="genres"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Genres</FormLabel>
                        <div className="max-h-[200px] overflow-y-auto border rounded-md p-2">
                          {GENRES.map((group) => (
                            <div key={group.category} className="mb-2">
                              <h3 className="font-semibold">{group.category}</h3>
                              {group.options.map((option) => (
                                <div key={option} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`genre-${option}`}
                                    checked={field.value.includes(option)}
                                    onCheckedChange={(checked) => {
                                      const newGenres = checked
                                        ? [...field.value, option]
                                        : field.value.filter((g) => g !== option);
                                      field.onChange(newGenres);
                                    }}
                                  />
                                  <label htmlFor={`genre-${option}`} className="text-sm">
                                    {option}
                                  </label>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="humor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Humor</FormLabel>
                        <div className="border rounded-md p-2">
                          {HUMOR_TYPES.map((humor) => (
                            <div key={humor} className="flex items-center space-x-2">
                              <Checkbox
                                id={`humor-${humor}`}
                                checked={field.value.includes(humor)}
                                onCheckedChange={(checked) => {
                                  const newHumor = checked
                                    ? [...field.value, humor]
                                    : field.value.filter((h) => h !== humor);
                                  field.onChange(newHumor);
                                }}
                              />
                              <label htmlFor={`humor-${humor}`} className="text-sm">
                                {humor}
                              </label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Upload Image (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => field.onChange(e.target.files)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Generate</Button>
                </form>
              </FormProvider>
            )}
          </DialogContent>
        </Dialog>
        {posts.length > 0 && (
          <PostCarousel
            posts={posts}
            onEdit={handleEditPost}
            onSaveDraft={handleSaveDraft}
            onShare={handleSharePost}
          />
        )}
        {selectedPost && (
          <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Post</DialogTitle>
              </DialogHeader>
              <Textarea
                value={selectedPost.content}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setSelectedPost({ ...selectedPost, content: e.target.value })
                }
                className="min-h-[100px]"
              />
              <Button onClick={() => handleUpdatePost(selectedPost.content)}>Save Changes</Button>
            </DialogContent>
          </Dialog>
        )}
        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Post</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-2">
              <Button onClick={() => handleShareToPlatform('Twitter')}>
                Share to Twitter
              </Button>
              <Button onClick={() => handleShareToPlatform('Instagram')}>
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