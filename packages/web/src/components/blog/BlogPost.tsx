'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ShareButtons } from '@/components/social/ShareButtons';
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    bio?: string;
  };
  publishedAt: string;
  updatedAt?: string;
  featuredImage?: string;
  tags?: string[];
  category?: string;
  readTimeMinutes?: number;
  likes?: number;
  comments?: number;
}

interface BlogPostCardProps {
  post: BlogPost;
  onClick?: () => void;
  showExcerpt?: boolean;
}

/**
 * Blog Post Card
 *
 * Card display for blog post in list/grid views
 */
export function BlogPostCard({ post, onClick, showExcerpt = true }: BlogPostCardProps) {
  return (
    <Card
      className="overflow-hidden transition-all hover:shadow-lg cursor-pointer"
      onClick={onClick}
    >
      {/* Featured Image */}
      {post.featuredImage && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          {post.category && (
            <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-900">
              {post.category}
            </span>
          )}
        </div>
      )}

      <CardContent className="p-6">
        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <span className="flex items-center gap-1">
            <CalendarIcon className="h-4 w-4" />
            {new Date(post.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
          {post.readTimeMinutes && (
            <span className="flex items-center gap-1">
              <ClockIcon className="h-4 w-4" />
              {post.readTimeMinutes} min read
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
          {post.title}
        </h3>

        {/* Excerpt */}
        {showExcerpt && (
          <p className="text-gray-600 line-clamp-3 mb-4">{post.excerpt}</p>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Author and Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            {post.author.avatar ? (
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-xs font-medium text-primary-600">
                  {post.author.name.charAt(0)}
                </span>
              </div>
            )}
            <span className="text-sm text-gray-700">{post.author.name}</span>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-600">
            {post.likes !== undefined && (
              <span className="flex items-center gap-1">
                <HeartIcon className="h-4 w-4" />
                {post.likes}
              </span>
            )}
            {post.comments !== undefined && (
              <span className="flex items-center gap-1">
                <ChatBubbleLeftIcon className="h-4 w-4" />
                {post.comments}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Blog Post Reader
 *
 * Full article view with content
 */
interface BlogPostReaderProps {
  post: BlogPost;
  onBack?: () => void;
}

export function BlogPostReader({ post, onBack }: BlogPostReaderProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  return (
    <article className="max-w-4xl mx-auto">
      {/* Back button */}
      {onBack && (
        <Button variant="ghost" onClick={onBack} className="mb-6">
          ← Back to Articles
        </Button>
      )}

      {/* Featured Image */}
      {post.featuredImage && (
        <div className="relative h-96 rounded-lg overflow-hidden mb-8">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Header */}
      <header className="mb-8">
        {/* Category and Meta */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          {post.category && (
            <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full font-medium">
              {post.category}
            </span>
          )}
          <span className="flex items-center gap-1">
            <CalendarIcon className="h-4 w-4" />
            {new Date(post.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          {post.readTimeMinutes && (
            <span className="flex items-center gap-1">
              <ClockIcon className="h-4 w-4" />
              {post.readTimeMinutes} min read
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          {post.title}
        </h1>

        {/* Excerpt */}
        <p className="text-xl text-gray-600 mb-6 leading-relaxed">{post.excerpt}</p>

        {/* Author */}
        <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
          {post.author.avatar ? (
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-lg font-medium text-primary-600">
                {post.author.name.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">{post.author.name}</p>
            {post.author.bio && (
              <p className="text-sm text-gray-600">{post.author.bio}</p>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div
        className="prose prose-lg max-w-none mb-8"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between py-6 border-t border-b border-gray-200 mb-8">
        <button
          onClick={handleLike}
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {isLiked ? (
            <HeartSolidIcon className="h-6 w-6 text-red-500" />
          ) : (
            <HeartIcon className="h-6 w-6 text-gray-600" />
          )}
          <span className="font-medium text-gray-900">{likeCount}</span>
        </button>

        <ShareButtons
          title={post.title}
          url={`https://campalborz.org/blog/${post.slug}`}
          variant="icon-only"
        />
      </div>

      {/* Related or Comments could go here */}
    </article>
  );
}

/**
 * Blog Grid
 */
interface BlogGridProps {
  posts: BlogPost[];
  onPostClick?: (post: BlogPost) => void;
  columns?: 2 | 3;
}

export function BlogGrid({ posts, onPostClick, columns = 3 }: BlogGridProps) {
  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  };

  return (
    <div className={`grid ${gridClasses[columns]} gap-6`}>
      {posts.map((post) => (
        <BlogPostCard
          key={post.id}
          post={post}
          onClick={onPostClick ? () => onPostClick(post) : undefined}
        />
      ))}
    </div>
  );
}

/**
 * Sample blog posts
 */
export const sampleBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Preparing for Your First Burn: A Complete Guide',
    slug: 'first-burn-guide',
    excerpt: 'Everything you need to know before attending Burning Man for the first time, from packing essentials to playa survival tips.',
    content: '<p>Your first Burning Man is an unforgettable experience...</p>',
    author: {
      name: 'Sarah Johnson',
      bio: 'Camp Organizer & 10-Year Burner',
    },
    publishedAt: '2024-06-15T10:00:00Z',
    category: 'Guides',
    readTimeMinutes: 8,
    tags: ['burning-man', 'first-timers', 'preparation'],
    likes: 42,
    comments: 15,
  },
  {
    id: '2',
    title: 'The Art of Radical Self-Expression',
    slug: 'radical-self-expression',
    excerpt: 'Exploring how Burning Man principles transform lives and communities beyond the playa.',
    content: '<p>Radical self-expression is more than just costumes...</p>',
    author: {
      name: 'Michael Chen',
    },
    publishedAt: '2024-05-20T14:30:00Z',
    category: 'Philosophy',
    readTimeMinutes: 5,
    tags: ['principles', 'art', 'community'],
    likes: 38,
    comments: 8,
  },
];
