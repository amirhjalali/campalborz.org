'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  title?: string;
  description?: string;
  width?: number;
  height?: number;
  photographer?: string;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  columns?: 2 | 3 | 4;
  gap?: 2 | 4 | 6 | 8;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto';
}

/**
 * Image Gallery with Lightbox
 *
 * Displays a grid of images with click-to-enlarge functionality
 */
export function ImageGallery({
  images,
  columns = 3,
  gap = 4,
  aspectRatio = 'auto',
}: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
    document.body.style.overflow = ''; // Restore scrolling
  };

  const goToPrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null && selectedIndex < images.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
  };

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'video':
        return 'aspect-video';
      case 'portrait':
        return 'aspect-[3/4]';
      default:
        return '';
    }
  };

  return (
    <>
      {/* Gallery Grid */}
      <div
        className={`grid grid-cols-1 md:grid-cols-${columns} gap-${gap}`}
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gap: `${gap * 0.25}rem`,
        }}
      >
        {images.map((image, index) => (
          <div
            key={image.id}
            onClick={() => openLightbox(index)}
            className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-burnt-sienna/20 via-antique-gold/10 to-desert-sand/20 p-[2px] hover:shadow-[0_20px_60px_rgba(160,82,45,0.3),0_0_40px_rgba(212,175,55,0.2)] transition-all duration-500"
          >
            {/* Gradient border */}
            <div className="absolute inset-0 bg-gradient-to-br from-burnt-sienna/50 via-antique-gold/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
            
            <div className={`relative ${getAspectRatioClass()} rounded-2xl overflow-hidden bg-desert-sand/10`}>
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110 brightness-[1.05] contrast-[1.1] saturate-[1.1] group-hover:brightness-[1.1] group-hover:contrast-[1.15]"
                sizes={`(max-width: 768px) 100vw, (max-width: 1200px) ${100 / columns}vw, ${100 / columns}vw`}
              />
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-desert-night/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500 flex items-center justify-center">
                <MagnifyingGlassIcon className="h-8 w-8 text-warm-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 drop-shadow-lg" />
              </div>
            </div>
            {image.title && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-desert-night/80 via-desert-night/40 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-2xl">
                <p className="text-warm-white text-sm font-semibold truncate font-body">
                  {image.title}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            aria-label="Close lightbox"
          >
            <XMarkIcon className="h-8 w-8" />
          </button>

          {/* Previous Button */}
          {selectedIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 text-white hover:text-gray-300 transition-colors z-10"
              aria-label="Previous image"
            >
              <ChevronLeftIcon className="h-12 w-12" />
            </button>
          )}

          {/* Next Button */}
          {selectedIndex < images.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 text-white hover:text-gray-300 transition-colors z-10"
              aria-label="Next image"
            >
              <ChevronRightIcon className="h-12 w-12" />
            </button>
          )}

          {/* Image Container */}
          <div
            className="relative max-w-7xl max-h-[90vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[selectedIndex].src}
              alt={images[selectedIndex].alt}
              width={images[selectedIndex].width || 1200}
              height={images[selectedIndex].height || 800}
              className="max-h-[90vh] w-auto h-auto object-contain"
              priority
            />

            {/* Image Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 text-white">
              {images[selectedIndex].title && (
                <h3 className="text-xl font-bold mb-1">
                  {images[selectedIndex].title}
                </h3>
              )}
              {images[selectedIndex].description && (
                <p className="text-sm text-gray-200 mb-2">
                  {images[selectedIndex].description}
                </p>
              )}
              {images[selectedIndex].photographer && (
                <p className="text-xs text-gray-300">
                  Photo by {images[selectedIndex].photographer}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                {selectedIndex + 1} / {images.length}
              </p>
            </div>
          </div>

          {/* Keyboard Hint */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-xs opacity-50">
            Use arrow keys to navigate • ESC to close
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Masonry Gallery Layout
 *
 * Pinterest-style masonry grid
 */
export function MasonryGallery({ images }: { images: GalleryImage[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <>
      <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
        {images.map((image, index) => (
          <div
            key={image.id}
            onClick={() => setSelectedIndex(index)}
            className="group relative break-inside-avoid cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-burnt-sienna/20 via-antique-gold/10 to-desert-sand/20 p-[2px] hover:shadow-[0_20px_60px_rgba(160,82,45,0.3),0_0_40px_rgba(212,175,55,0.2)] transition-all duration-500"
          >
            {/* Gradient border */}
            <div className="absolute inset-0 bg-gradient-to-br from-burnt-sienna/50 via-antique-gold/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
            
            <div className="relative rounded-2xl overflow-hidden bg-desert-sand/10">
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width || 400}
                height={image.height || 600}
                className="w-full h-auto transition-transform duration-700 group-hover:scale-110 brightness-[1.05] contrast-[1.1] saturate-[1.1] group-hover:brightness-[1.1] group-hover:contrast-[1.15]"
              />
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-desert-night/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500 flex items-center justify-center">
                <MagnifyingGlassIcon className="h-8 w-8 text-warm-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 drop-shadow-lg" />
              </div>
            </div>
            {image.title && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-desert-night/80 via-desert-night/40 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-2xl">
                <p className="text-warm-white text-sm font-semibold font-body">
                  {image.title}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Reuse lightbox from ImageGallery */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center"
          onClick={() => setSelectedIndex(null)}
        >
          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <XMarkIcon className="h-8 w-8" />
          </button>
          <div className="relative max-w-7xl max-h-[90vh] mx-4">
            <Image
              src={images[selectedIndex].src}
              alt={images[selectedIndex].alt}
              width={images[selectedIndex].width || 1200}
              height={images[selectedIndex].height || 800}
              className="max-h-[90vh] w-auto h-auto object-contain"
              priority
            />
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Gallery with Categories/Tabs
 */
export function CategorizedGallery({
  categories,
}: {
  categories: { name: string; images: GalleryImage[] }[];
}) {
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <div>
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
        {categories.map((category, index) => (
          <button
            key={category.name}
            onClick={() => setActiveCategory(index)}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeCategory === index
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {category.name} ({category.images.length})
          </button>
        ))}
      </div>

      {/* Gallery */}
      <ImageGallery images={categories[activeCategory].images} />
    </div>
  );
}
