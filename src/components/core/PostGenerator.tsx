'use client';

import { useState } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function PostGenerator({ userGenres }: { userGenres: string[] }) {
  const [open, setOpen] = useState(false);
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<GeneratedPost | null>(null);
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);
  const supabase = createClient();

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      platform: 'Instagram',
      genres: userGenres,
      humor: ['Normal'],
      image: undefined,
    },
  });

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

      console.log('Initializing EmailJS with public key');
      emailjs.init(publicKey);

      console.log('Sending email to:', to, 'with subject:', subject);
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

  const onSubmit = async (data: PostFormValues) => {
    try {
      // Step 1: Fetch genre-related content using SerpAPI
      const serpApiKey = process.env.NEXT_PUBLIC_SERPAPI_KEY;
      if (!serpApiKey) {
        showToast({
          title: 'Error',
          description: 'SerpAPI key is missing. Please add it to .env.local.',
          variant: 'destructive',
        });
        return;
      }
      const searchQueries = data.genres.map((genre) => `${genre} latest news`);
      const scrapedData = await Promise.all(
        searchQueries.map(async (query) => {
          try {
            const response = await fetch(
              `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${serpApiKey}`
            );
            if (!response.ok) throw new Error(`SerpAPI error: ${response.statusText}`);
            const results = await response.json();
            console.log('SerpAPI response:', results);
            return (
              results.organic_results?.slice(0, 3).map((result: any) => ({
                title: result.title,
                snippet: result.snippet,
                link: result.link,
              })) || []
            );
          } catch (error) {
            console.error(`SerpAPI error for query "${query}":`, error);
            return [];
          }
        })
      );

      const context = scrapedData.flat().map((item) => `${item.title}: ${item.snippet}`).join('\n');
      if (!context) {
        showToast({
          title: 'Warning',
          description: 'No relevant context found. Generating post without context.',
        });
      }

      // Step 2: Generate posts using Gemini API
      const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!geminiApiKey) {
        showToast({
          title: 'Error',
          description: 'Gemini API key is missing. Please add it to .env.local.',
          variant: 'destructive',
        });
        return;
      }
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Generate 3 concise and engaging ${data.platform} posts based on the following context: ${context || 'No context available'}. Use humor types: ${data.humor.join(', ')}. Each post should be suitable for ${data.platform} and under 280 characters for Twitter or visually appealing for Instagram.`,
                  },
                ],
              },
            ],
          })
        }
      );
      if (!geminiResponse.ok) throw new Error(`Gemini API error: ${geminiResponse.statusText}`);
      const geminiData = await geminiResponse.json();
      console.log('Gemini API response:', geminiData);
      const generatedPosts =
        geminiData.candidates?.map((candidate: any, index: number) => ({
          id: `post-${index}`,
          content: candidate.content.parts[0].text,
        })) || [];

      if (generatedPosts.length === 0) {
        showToast({
          title: 'Error',
          description: 'No posts generated. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      // Step 3: Handle image (custom upload or Unsplash)
      let imageUrl = '';
      if (data.image && data.image.length > 0) {
        const file = data.image[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `post-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('posts')
          .upload(fileName, file);

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
        imageUrl = urlData.publicUrl;
      } else if (data.platform === 'Instagram') {
        const unsplashApiKey = process.env.NEXT_PUBLIC_UNSPLASH_API_KEY;
        if (!unsplashApiKey) {
          showToast({
            title: 'Warning',
            description: 'Unsplash API key is missing. No image will be included.',
          });
        } else {
          try {
            const unsplashResponse = await fetch(
              `https://api.unsplash.com/search/photos?query=${encodeURIComponent(data.genres[0])}&per_page=1&client_id=${unsplashApiKey}`
            );
            if (!unsplashResponse.ok) throw new Error(`Unsplash API error: ${unsplashResponse.statusText}`);
            const unsplashData = await unsplashResponse.json();
            console.log('Unsplash API response:', unsplashData);
            imageUrl = unsplashData.results[0]?.urls.regular || '';
          } catch (error) {
            console.error('Unsplash API error:', error);
            showToast({
              title: 'Warning',
              description: 'Failed to fetch image from Unsplash.',
            });
          }
        }
      }

      setPosts(
        generatedPosts.map((post: GeneratedPost) => ({
          ...post,
          image: imageUrl || undefined,
        }))
      );
      showToast({
        title: 'Success',
        description: `${generatedPosts.length} posts generated!`,
      });
      setOpen(false);

      // Step 4: Notify user if email_notifications is enabled
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
            `Successfully generated ${generatedPosts.length} posts for ${data.platform}.`
          );
        }
      }
    } catch (error) {
      console.error('Error generating posts:', error);
      showToast({
        title: 'Error',
        description: 'Failed to generate posts. Please try again.',
        variant: 'destructive',
      });
    }
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
      showToast({
        title: 'Error',
        description: 'Failed to save draft.',
        variant: 'destructive',
      });
    } else {
      setPosts(posts.filter((p) => p.id !== post.id));
      showToast({
        title: 'Success',
        description: 'Draft saved!',
      });

      // Notify user if email_notifications is enabled
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

  const handlePublishPost = async (post: GeneratedPost) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('posts').insert({
      user_id: user.id,
      platform: form.getValues('platform'),
      content: post.content,
      image: post.image,
      is_draft: false,
    });

    if (error) {
      console.error('Error publishing post:', error);
      showToast({
        title: 'Error',
        description: 'Failed to publish post.',
        variant: 'destructive',
      });
    } else {
      setPosts(posts.filter((p) => p.id !== post.id));
      showToast({
        title: 'Success',
        description: 'Post published!',
      });

      // Notify user if email_notifications is enabled
      if (user.email) {
        const { data: settings } = await supabase
          .from('user_settings')
          .select('email_notifications')
          .eq('user_id', user.id)
          .single();

        if (settings?.email_notifications) {
          await sendEmail(
            user.email,
            'Post Published',
            `Your post for ${form.getValues('platform')} has been published: ${post.content}`
          );
        }
      }
    }
  };

  const handleEditPost = (post: GeneratedPost) => {
    setSelectedPost(post);
  };

  const handleUpdatePost = async (content: string) => {
    if (!selectedPost) return;
    setPosts(posts.map((p) => (p.id === selectedPost.id ? { ...p, content } : p)));
    setSelectedPost(null);
    showToast({
      title: 'Success',
      description: 'Post updated!',
    });
  };

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
                            {group.options
                              .filter((option) => userGenres.includes(option))
                              .map((option) => (
                                <div key={option} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`genre-${option}`}
                                    checked={field.value.includes(option)}
                                    onCheckedChange={(checked) => {
                                      console.log(`Genre ${option} checked:`, checked);
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
                                console.log(`Humor ${humor} checked:`, checked);
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
          </DialogContent>
        </Dialog>
        <div className="grid gap-4 mt-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <CardTitle>{form.getValues('platform')} Post</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{post.content}</p>
                {post.image && <img src={post.image} alt="Post image" className="mt-2 max-w-full h-auto" />}
                <div className="flex gap-2 mt-2">
                  <Button onClick={() => handleEditPost(post)}>Edit</Button>
                  <Button onClick={() => handleSaveDraft(post)}>Save Draft</Button>
                  <Button onClick={() => handlePublishPost(post)}>Publish</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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