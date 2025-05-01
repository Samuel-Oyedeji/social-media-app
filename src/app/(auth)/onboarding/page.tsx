'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { createClient } from '@/utils/supabase/client';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/submit-button';
import { FormMessage, Message } from '@/components/form-message';
import { MultiSelect } from '@/components/ui/multi-select';

type OnboardingForm = {
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

export default function Onboarding() {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<OnboardingForm>();
  const [message, setMessage] = useState<Message | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const router = useRouter();
  const supabase = createClient();

  const onSubmit: SubmitHandler<OnboardingForm> = async ({ username, profilePicture, age, genres }) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setMessage({ error: 'Authentication failed. Please log in again.' });
        return;
      }

      let profilePictureUrl = null;
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
        .upsert({
          id: user.id,
          username,
          age,
          genres,
          profile_picture: profilePictureUrl,
        });

      if (dbError) {
        setMessage({ error: 'Failed to save profile information.' });
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setMessage({ error: 'An unexpected error occurred.' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Complete Your Profile</h1>
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
  );
}