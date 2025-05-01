'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { createClient } from '@/utils/supabase/client';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/submit-button';
import { FormMessage, Message } from '@/components/form-message';
import { MultiSelect } from '@/components/ui/multi-select';
import { AppSidebar } from '@/components/global/app-sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { ModeToggle } from '@/components/global/Mode-toggle';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { signOutAction } from '@/app/actions';

type ProfileForm = {
  username: string;
  profilePicture: FileList;
  age: number;
  genres: string[];
};

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

const GENRE_OPTIONS = GENRES.flatMap((category) =>
  category.options.map((option) => ({
    value: option,
    label: option,
  }))
);

export default function Profile() {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProfileForm>();
  const [message, setMessage] = useState<Message | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [userData, setUserData] = useState<{ username: string; age: number; genres: string[]; profile_picture?: string | null } | null>(null);
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
        .select('username, age, genres, profile_picture')
        .eq('id', user.id)
        .single();

      if (data) {
        setUserData(data);
        setSelectedGenres(data.genres);
        setValue('username', data.username);
        setValue('age', data.age);
        setValue('genres', data.genres);
      }
    };
    fetchUserData();
  }, [router, supabase, setValue]);

  const onSubmit: SubmitHandler<ProfileForm> = async ({ username, profilePicture, age, genres }) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setMessage({ error: 'Authentication failed. Please log in again.' });
        return;
      }

      let profilePictureUrl: string | null = userData?.profile_picture || null;
      if (profilePicture && profilePicture.length > 0) {
        const file = profilePicture[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('profiles')
          .upload(fileName, file, { upsert: true });

        if (uploadError) {
          setMessage({ error: 'Failed to upload profile picture.' });
          return;
        }

        const { data } = supabase.storage.from('profiles').getPublicUrl(fileName);
        profilePictureUrl = data.publicUrl;
      }

      const { error: dbError } = await supabase
        .from('users')
        .update({
          username,
          age,
          genres,
          profile_picture: profilePictureUrl,
        })
        .eq('id', user.id);

      if (dbError) {
        setMessage({ error: 'Failed to update profile.' });
        return;
      }

      setMessage({ success: 'Profile updated successfully!' });
      setUserData({ username, age, genres, profile_picture: profilePictureUrl });
    } catch (err) {
      setMessage({ error: 'An unexpected error occurred.' });
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
        <div className="flex flex-col items-center justify-center p-4">
          <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
            <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  {...register('username', { required: 'Username is required' })}
                  className="mt-2"
                />
                {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
              </div>
              <div>
                <Label htmlFor="profilePicture">Profile Picture (Optional)</Label>
                <Input
                  id="profilePicture"
                  type="file"
                  accept="image/*"
                  {...register('profilePicture')}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  {...register('age', { required: 'Age is required', min: { value: 13, message: 'Must be 13 or older' } })}
                  className="mt-2"
                />
                {errors.age && <p className="text-red-500 text-sm">{errors.age.message}</p>}
              </div>
              <div>
                <Label htmlFor="genres">Genres (Select multiple)</Label>
                <MultiSelect
                  options={GENRE_OPTIONS}
                  selected={selectedGenres}
                  onChange={(values) => {
                    setSelectedGenres(values);
                    setValue('genres', values, { shouldValidate: true });
                  }}
                  placeholder="Select genres"
                />
                {errors.genres && <p className="text-red-500 text-sm">{errors.genres.message}</p>}
              </div>
              {message && <FormMessage message={message} />}
              <SubmitButton pendingText="Saving...">Save Profile</SubmitButton>
            </form>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}