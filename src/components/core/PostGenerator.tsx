'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { MultiSelect } from '@/components/ui/multi-select';
import { createClient } from '@/utils/supabase/client';

const HUMOR_OPTIONS = [
  { value: 'Informative', label: 'Informative' },
  { value: 'Funny', label: 'Funny' },
  { value: 'Persuasive', label: 'Persuasive' },
  { value: 'Sarcastic', label: 'Sarcastic' },
  { value: 'Normal', label: 'Normal' },
  { value: 'Happy', label: 'Happy' },
];

const postFormSchema = z.object({
  platform: z.enum(['Instagram', 'Twitter']),
  genres: z.array(z.string()).min(1, 'Select at least one genre'),
  humor: z
    .array(z.enum(['Informative', 'Funny', 'Persuasive', 'Sarcastic', 'Normal', 'Happy']))
    .min(1, 'Select at least one humor type'),
});

type PostFormValues = z.infer<typeof postFormSchema>;

type GeneratedPost = {
  id: string;
  content: string;
  image?: string;
};

export default function PostGenerator({ userGenres }: { userGenres: string[] }) {
  const [open, setOpen] = useState(false);
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<GeneratedPost | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(userGenres);
  const [selectedHumor, setSelectedHumor] = useState<string[]>(['Normal']);
  const supabase = createClient();

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      platform: 'Instagram',
      genres: userGenres,
      humor: ['Normal'],
    },
  });

  const genreOptions = userGenres.map((genre) => ({ value: genre, label: genre }));

  const onSubmit = async (data: PostFormValues) => {
    try {
      // Step 1: Fetch genre-related content using SerpAPI
      const serpApiKey = process.env.NEXT_PUBLIC_SERPAPI_KEY; // Add to .env.local
      const searchQueries = data.genres.map((genre) => `${genre} latest news`);
      const scrapedData = await Promise.all(
        searchQueries.map(async (query) => {
          const response = await fetch(
            `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${serpApiKey}`
          );
          const results = await response.json();
          return (
            results.organic_results?.slice(0, 3).map((result: any) => ({
              title: result.title,
              snippet: result.snippet,
              link: result.link,
            })) || []
          );
        })
      );

      // Alternative: Custom scraper (uncomment to implement)
      /*
      const customScraper = async (query: string) => {
        const response = await fetch(`https://news.google.com/search?q=${encodeURIComponent(query)}`);
        const html = await response.text();
        const cheerio = require('cheerio');
        const $ = cheerio.load(html);
        const articles = [];
        $('article').slice(0, 3).each((i, el) => {
          const title = $(el).find('h3').text();
          const snippet = $(el).find('p').text();
          const link = $(el).find('a').attr('href');
          articles.push({ title, snippet, link });
        });
        return articles;
      };
      const scrapedData = await Promise.all(searchQueries.map(customScraper));
      */

      const context = scrapedData.flat().map((item) => `${item.title}: ${item.snippet}`).join('\n');

      // Step 2: Generate posts using Gemini API
      const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY; // Add to .env.local
      const geminiResponse = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${geminiApiKey}`,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Generate 3 ${data.platform} posts based on the following context: ${context}. Use humor types: ${data.humor.join(', ')}. Each post should be concise and engaging.`,
                  },
                ],
              },
            ],
          })
        }
      );
      const geminiData = await geminiResponse.json();
      const generatedPosts =
        geminiData.candidates?.map((candidate: any, index: number) => ({
          id: `post-${index}`,
          content: candidate.content.parts[0].text,
        })) || [];

      // Step 3: Fetch image recommendations from Unsplash (for Instagram)
      const unsplashApiKey = process.env.NEXT_PUBLIC_UNSPLASH_API_KEY; // Add to .env.local
      let imageUrl = '';
      if (data.platform === 'Instagram') {
        const unsplashResponse = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(data.genres[0])}&per_page=1&client_id=${unsplashApiKey}`
        );
        const unsplashData = await unsplashResponse.json();
        imageUrl = unsplashData.results[0]?.urls.regular || '';
      }

      setPosts(
        generatedPosts.map((post: GeneratedPost) => ({
          ...post,
          image: data.platform === 'Instagram' ? imageUrl : undefined,
        }))
      );
      setOpen(false);
    } catch (error) {
      console.error('Error generating posts:', error);
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
    } else {
      setPosts(posts.filter((p) => p.id !== post.id));
    }
  };

  const handleEditPost = (post: GeneratedPost) => {
    setSelectedPost(post);
  };

  const handleUpdatePost = async (content: string) => {
    if (!selectedPost) return;
    setPosts(posts.map((p) => (p.id === selectedPost.id ? { ...p, content } : p)));
    setSelectedPost(null);
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Generate Post</Button>
        </DialogTrigger>
        <DialogContent>
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
                render={() => (
                  <FormItem>
                    <FormLabel>Genres</FormLabel>
                    <MultiSelect
                      options={genreOptions}
                      selected={selectedGenres}
                      onChange={(values) => {
                        setSelectedGenres(values);
                        form.setValue('genres', values, { shouldValidate: true });
                      }}
                      placeholder="Select genres"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="humor"
                render={() => (
                  <FormItem>
                    <FormLabel>Humor</FormLabel>
                    <MultiSelect
                      options={HUMOR_OPTIONS}
                      selected={selectedHumor}
                      onChange={(values) => {
                        setSelectedHumor(values);
                        form.setValue('humor', values as any, { shouldValidate: true });
                      }}
                      placeholder="Select humor types"
                    />
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
  );
}