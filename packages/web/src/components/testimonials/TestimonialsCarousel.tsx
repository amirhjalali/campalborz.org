'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/solid';

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  avatar?: string;
  content: string;
  rating?: number;
  date?: string;
}

interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
  /**
   * Auto-advance interval in milliseconds (0 to disable)
   */
  autoAdvanceInterval?: number;
  /**
   * Show navigation arrows
   */
  showArrows?: boolean;
  /**
   * Show pagination dots
   */
  showDots?: boolean;
  /**
   * Number of testimonials to show at once
   */
  slidesPerView?: 1 | 2 | 3;
}

/**
 * Testimonials Carousel Component
 *
 * Displays testimonials in a rotating carousel
 */
export function TestimonialsCarousel({
  testimonials,
  autoAdvanceInterval = 5000,
  showArrows = true,
  showDots = true,
  slidesPerView = 1,
}: TestimonialsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance
  useEffect(() => {
    if (autoAdvanceInterval > 0) {
      const timer = setInterval(() => {
        goToNext();
      }, autoAdvanceInterval);

      return () => clearInterval(timer);
    }
  }, [currentIndex, autoAdvanceInterval]);

  const goToPrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? testimonials.length - slidesPerView : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) =>
      prev >= testimonials.length - slidesPerView ? 0 : prev + 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Get visible testimonials
  const visibleTestimonials = testimonials.slice(
    currentIndex,
    currentIndex + slidesPerView
  );

  return (
    <div className="relative">
      {/* Testimonials */}
      <div className={`grid grid-cols-1 ${slidesPerView > 1 ? `md:grid-cols-${slidesPerView}` : ''} gap-6`}>
        {visibleTestimonials.map((testimonial) => (
          <TestimonialCard key={testimonial.id} testimonial={testimonial} />
        ))}
      </div>

      {/* Navigation Arrows */}
      {showArrows && testimonials.length > slidesPerView && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-warm-white shadow-[0_4px_15px_rgba(160,82,45,0.3)] rounded-full p-2 hover:bg-desert-sand/30 hover:shadow-[0_6px_20px_rgba(160,82,45,0.4)] transition-all duration-300 z-10"
            aria-label="Previous testimonial"
          >
            <ChevronLeftIcon className="h-6 w-6 text-burnt-sienna" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-warm-white shadow-[0_4px_15px_rgba(160,82,45,0.3)] rounded-full p-2 hover:bg-desert-sand/30 hover:shadow-[0_6px_20px_rgba(160,82,45,0.4)] transition-all duration-300 z-10"
            aria-label="Next testimonial"
          >
            <ChevronRightIcon className="h-6 w-6 text-burnt-sienna" />
          </button>
        </>
      )}

      {/* Pagination Dots */}
      {showDots && testimonials.length > slidesPerView && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: testimonials.length - slidesPerView + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-primary-600'
                  : 'w-2 bg-dust-khaki/40 hover:bg-burnt-sienna/60'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Individual Testimonial Card
 */
function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <Card className="p-6 relative">
      {/* Quote Icon */}
      <div className="absolute top-4 right-4 opacity-10">
        <ChatBubbleLeftIcon className="h-12 w-12 text-primary-600" />
      </div>

      {/* Rating */}
      {testimonial.rating && (
        <div className="flex gap-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon
              key={i}
              className={`h-5 w-5 ${
                i < testimonial.rating!
                  ? 'text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <p className="text-gray-700 mb-6 italic leading-relaxed">
        "{testimonial.content}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-3">
        {testimonial.avatar ? (
          <img
            src={testimonial.avatar}
            alt={testimonial.name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-primary-600 font-semibold text-lg">
              {testimonial.name.charAt(0)}
            </span>
          </div>
        )}

        <div>
          <p className="font-semibold text-gray-900">{testimonial.name}</p>
          {testimonial.role && (
            <p className="text-sm text-gray-600">{testimonial.role}</p>
          )}
          {testimonial.date && (
            <p className="text-xs text-gray-500">{testimonial.date}</p>
          )}
        </div>
      </div>
    </Card>
  );
}

/**
 * Grid layout (no carousel)
 */
export function TestimonialsGrid({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {testimonials.map((testimonial) => (
        <TestimonialCard key={testimonial.id} testimonial={testimonial} />
      ))}
    </div>
  );
}

/**
 * Featured testimonial (large, centered)
 */
export function FeaturedTestimonial({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-12 text-center relative overflow-hidden">
        {/* Background Quote */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5">
          <ChatBubbleLeftIcon className="h-48 w-48 text-primary-600" />
        </div>

        {/* Rating */}
        {testimonial.rating && (
          <div className="flex justify-center gap-1 mb-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon
                key={i}
                className={`h-6 w-6 ${
                  i < testimonial.rating!
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        )}

        {/* Content */}
        <blockquote className="text-2xl text-gray-800 font-light italic mb-8 leading-relaxed">
          "{testimonial.content}"
        </blockquote>

        {/* Author */}
        <div className="flex flex-col items-center">
          {testimonial.avatar ? (
            <img
              src={testimonial.avatar}
              alt={testimonial.name}
              className="w-16 h-16 rounded-full object-cover mb-3"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-3">
              <span className="text-primary-600 font-semibold text-2xl">
                {testimonial.name.charAt(0)}
              </span>
            </div>
          )}

          <p className="font-semibold text-gray-900 text-lg">{testimonial.name}</p>
          {testimonial.role && (
            <p className="text-gray-600">{testimonial.role}</p>
          )}
        </div>
      </Card>
    </div>
  );
}

/**
 * Sample testimonials data
 */
export const sampleTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Camp Member since 2020',
    content: 'Camp Alborz has been a transformative experience. The blend of Persian culture and Burning Man principles creates something truly magical. I\'ve made lifelong friends and learned so much about art, community, and myself.',
    rating: 5,
  },
  {
    id: '2',
    name: 'Michael Chen',
    role: 'First-time Burner, 2023',
    content: 'As a first-timer, I was nervous about Burning Man. Camp Alborz welcomed me with open arms and made me feel at home immediately. The workshops, the food, the art - everything was incredible. Can\'t wait for next year!',
    rating: 5,
  },
  {
    id: '3',
    name: 'Roya Ahmadi',
    role: 'Art Installation Lead',
    content: 'Being able to share my Persian heritage through art at Burning Man is a dream come true. Camp Alborz provides the support and community to make ambitious projects happen. The collaborative spirit here is unmatched.',
    rating: 5,
  },
  {
    id: '4',
    name: 'David Rodriguez',
    role: 'Volunteer Coordinator',
    content: 'I\'ve volunteered with many organizations, but Camp Alborz stands out. The leadership is organized, caring, and truly values every contributor. It\'s more than a camp - it\'s a family.',
    rating: 5,
  },
  {
    id: '5',
    name: 'Emma Wilson',
    role: 'Workshop Facilitator',
    content: 'The cultural exchange at Camp Alborz is phenomenal. I\'ve learned Persian dance, cooking, and so much about the rich history. At the same time, I\'ve been able to share my own skills. It\'s a beautiful give and take.',
    rating: 5,
  },
  {
    id: '6',
    name: 'Ali Rezaei',
    role: 'Founding Member',
    content: 'Watching Camp Alborz grow from an idea to this thriving community has been the highlight of my Burning Man journey. We\'ve created a space where everyone feels welcome to explore, create, and connect.',
    rating: 5,
  },
];
