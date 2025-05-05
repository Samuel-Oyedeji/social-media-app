'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon, ArrowLeftIcon } from 'lucide-react'

type Post = {
  id: string;
  content: string;
  image?: string;
};

type PostCarouselProps = {
  posts: Post[];
  onEdit: (post: Post) => void;
  onSaveDraft: (post: Post) => void;
  onShare: (post: Post) => void;
};

export default function PostCarousel({ posts, onEdit, onSaveDraft, onShare }: PostCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoSlideActive, setIsAutoSlideActive] = useState(true);

  useEffect(() => {
    if (!isAutoSlideActive || posts.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % posts.length);
    }, 5000); // Slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoSlideActive, posts.length]);

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + posts.length) % posts.length);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % posts.length);
  };

  const toggleAutoSlide = () => {
    setIsAutoSlideActive((prev) => !prev);
  };

  return (
    <div className="mt-4">
      <div className="relative w-full max-w-md mx-auto overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {posts.map((post) => (
            <div key={post.id} className="min-w-full">
              <Card className="mx-2">
                <CardHeader>
                  <CardTitle>Generated Post</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{post.content}</p>
                  {post.image && <img src={post.image} alt="Post image" className="mt-2 max-w-full h-auto" />}
                  <div className="flex gap-2 mt-2">
                    <Button effect="hoverUnderline" onClick={() => onEdit(post)}>Edit</Button>
                    <Button effect="shineHover" onClick={() => onSaveDraft(post)}>Save Draft</Button>
                    <Button effect="expandIcon" icon={ArrowRightIcon} iconPlacement="right" onClick={() => onShare(post)}>Share</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center items-center gap-4 mt-4">
        <Button effect="expandIcon" icon={ArrowLeftIcon} iconPlacement="left" onClick={handlePrevious} disabled={posts.length <= 1}>
          Previous
        </Button>
        <div className="flex gap-2">
          {posts.map((_, index) => (
            <span
              key={index}
              className={`h-3 w-3 rounded-full cursor-pointer ${
                currentIndex === index ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
        <Button effect="expandIcon" icon={ArrowRightIcon} iconPlacement="right" onClick={handleNext} disabled={posts.length <= 1}>
          Next
        </Button>
        <Button effect="gooeyLeft" onClick={toggleAutoSlide}>
          {isAutoSlideActive ? 'Pause' : 'Resume'} Auto-Slide
        </Button>
      </div>
    </div>
  );
}