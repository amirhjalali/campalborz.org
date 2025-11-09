/**
 * Image Optimization Utilities
 *
 * Helper functions for image loading, optimization, and manipulation
 */

/**
 * Generate base64 placeholder for blur effect
 */
export function generatePlaceholder(width: number = 10, height: number = 10, color: string = '#f3f4f6'): string {
  const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;

  if (!canvas) {
    // Server-side: return a simple SVG placeholder
    return `data:image/svg+xml;base64,${btoa(
      `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="${width}" height="${height}" fill="${color}"/></svg>`
    )}`;
  }

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);

  return canvas.toDataURL();
}

/**
 * Generate shimmer placeholder (for loading state)
 */
export function shimmerPlaceholder(width: number, height: number): string {
  const shimmer = `
    <svg width="${width}" height="${height}" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g">
          <stop stop-color="#f3f4f6" offset="20%" />
          <stop stop-color="#e5e7eb" offset="50%" />
          <stop stop-color="#f3f4f6" offset="70%" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="#f3f4f6" />
      <rect id="r" width="${width}" height="${height}" fill="url(#g)" />
      <animate xlink:href="#r" attributeName="x" from="-${width}" to="${width}" dur="1s" repeatCount="indefinite"  />
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(shimmer)}`;
}

/**
 * Get image dimensions from URL
 */
export async function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Get image dimensions from File
 */
export async function getImageDimensionsFromFile(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Validate image file
 */
export function validateImageFile(
  file: File,
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
    maxWidth?: number;
    maxHeight?: number;
  } = {}
): { valid: boolean; error?: string } {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  } = options;

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${maxSize / 1024 / 1024}MB`,
    };
  }

  return { valid: true };
}

/**
 * Compress image file
 */
export async function compressImage(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    type?: string;
  } = {}
): Promise<File> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    type = file.type,
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Calculate new dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            const compressedFile = new File([blob], file.name, {
              type,
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          type,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Convert image to base64
 */
export async function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result as string);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Convert base64 to File
 */
export function base64ToFile(base64: string, filename: string): File {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
}

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(
  baseUrl: string,
  widths: number[] = [640, 750, 828, 1080, 1200, 1920, 2048, 3840]
): string {
  return widths
    .map((width) => {
      // Assuming your image service supports ?w= parameter
      const url = `${baseUrl}?w=${width}`;
      return `${url} ${width}w`;
    })
    .join(', ');
}

/**
 * Generate sizes attribute for responsive images
 */
export function generateSizes(breakpoints: { breakpoint: string; size: string }[]): string {
  return breakpoints
    .map(({ breakpoint, size }) => `(max-width: ${breakpoint}) ${size}`)
    .join(', ');
}

/**
 * Get optimal image format based on browser support
 */
export function getOptimalImageFormat(): 'webp' | 'jpeg' | 'png' {
  if (typeof window === 'undefined') return 'jpeg';

  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;

  // Check WebP support
  if (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
    return 'webp';
  }

  return 'jpeg';
}

/**
 * Lazy load image
 */
export function lazyLoadImage(
  img: HTMLImageElement,
  src: string,
  options: {
    placeholder?: string;
    onLoad?: () => void;
    onError?: () => void;
  } = {}
): void {
  const { placeholder, onLoad, onError } = options;

  if (placeholder) {
    img.src = placeholder;
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            img.src = src;

            img.onload = () => {
              img.classList.add('loaded');
              onLoad?.();
            };

            img.onerror = () => {
              onError?.();
            };

            observer.unobserve(img);
          }
        });
      },
      {
        rootMargin: '50px',
      }
    );

    observer.observe(img);
  } else {
    // Fallback for browsers without IntersectionObserver
    img.src = src;
    img.onload = () => onLoad?.();
    img.onerror = () => onError?.();
  }
}

/**
 * Calculate aspect ratio
 */
export function calculateAspectRatio(width: number, height: number): number {
  return width / height;
}

/**
 * Get aspect ratio string (e.g., "16:9")
 */
export function getAspectRatioString(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
}

/**
 * Calculate dimensions to fit within constraints while maintaining aspect ratio
 */
export function fitDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const ratio = Math.min(maxWidth / originalWidth, maxHeight / originalHeight);

  return {
    width: Math.round(originalWidth * ratio),
    height: Math.round(originalHeight * ratio),
  };
}

/**
 * Calculate dimensions to cover area while maintaining aspect ratio
 */
export function coverDimensions(
  originalWidth: number,
  originalHeight: number,
  targetWidth: number,
  targetHeight: number
): { width: number; height: number } {
  const ratio = Math.max(targetWidth / originalWidth, targetHeight / originalHeight);

  return {
    width: Math.round(originalWidth * ratio),
    height: Math.round(originalHeight * ratio),
  };
}

/**
 * Image loading states for React components
 */
export type ImageLoadState = 'idle' | 'loading' | 'loaded' | 'error';

/**
 * Hook for tracking image load state (example usage)
 */
export const useImageLoadExample = `
import { useState, useEffect } from 'react';
import type { ImageLoadState } from '@/lib/image';

export function useImageLoad(src: string) {
  const [loadState, setLoadState] = useState<ImageLoadState>('idle');

  useEffect(() => {
    if (!src) return;

    setLoadState('loading');

    const img = new Image();

    img.onload = () => {
      setLoadState('loaded');
    };

    img.onerror = () => {
      setLoadState('error');
    };

    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return loadState;
}
`;

/**
 * Next.js Image loader configurations
 */
export const nextImageLoaders = {
  cloudinary: ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
    const params = ['f_auto', 'c_limit', `w_${width}`, `q_${quality || 'auto'}`];
    return `https://res.cloudinary.com/demo/image/upload/${params.join(',')}/${src}`;
  },

  imgix: ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
    const url = new URL(src);
    url.searchParams.set('auto', 'format');
    url.searchParams.set('fit', 'max');
    url.searchParams.set('w', width.toString());
    if (quality) {
      url.searchParams.set('q', quality.toString());
    }
    return url.href;
  },

  default: ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
    return `${src}?w=${width}&q=${quality || 75}`;
  },
};

/**
 * Common image aspect ratios
 */
export const ASPECT_RATIOS = {
  square: 1,
  landscape: 16 / 9,
  portrait: 9 / 16,
  wide: 21 / 9,
  ultrawide: 32 / 9,
  '4:3': 4 / 3,
  '3:2': 3 / 2,
  '16:10': 16 / 10,
} as const;

/**
 * Common image breakpoints
 */
export const IMAGE_BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

/**
 * Recommended image sizes for different use cases
 */
export const RECOMMENDED_SIZES = {
  thumbnail: { width: 150, height: 150 },
  avatar: { width: 200, height: 200 },
  card: { width: 400, height: 300 },
  hero: { width: 1920, height: 1080 },
  og: { width: 1200, height: 630 }, // Open Graph
  twitter: { width: 1200, height: 675 }, // Twitter Card
} as const;

/**
 * Extract dominant color from image
 */
export async function extractDominantColor(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      let r = 0;
      let g = 0;
      let b = 0;

      // Sample every 5th pixel for performance
      for (let i = 0; i < data.length; i += 20) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
      }

      const pixelCount = data.length / 20;
      r = Math.round(r / pixelCount);
      g = Math.round(g / pixelCount);
      b = Math.round(b / pixelCount);

      resolve(`rgb(${r}, ${g}, ${b})`);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = imageUrl;
  });
}

/**
 * Generate blurhash (requires blurhash library)
 */
export const blurhashExample = `
// Install: npm install blurhash

import { encode } from 'blurhash';

export async function generateBlurhash(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const blurhash = encode(imageData.data, imageData.width, imageData.height, 4, 4);

      resolve(blurhash);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = imageUrl;
  });
}
`;
