'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import {
  ShareIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

interface ShareButtonsProps {
  /**
   * Title to share
   */
  title: string;

  /**
   * URL to share (defaults to current page)
   */
  url?: string;

  /**
   * Description/text to share
   */
  description?: string;

  /**
   * Hashtags (Twitter/Instagram)
   */
  hashtags?: string[];

  /**
   * Display style
   */
  variant?: 'default' | 'compact' | 'icon-only';

  /**
   * Show copy link button
   */
  showCopyLink?: boolean;
}

/**
 * Social Media Share Buttons
 *
 * Provides buttons to share content on various social platforms
 */
export function ShareButtons({
  title,
  url,
  description,
  hashtags = [],
  variant = 'default',
  showCopyLink = true,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  // Use current URL if not provided
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareText = description || title;
  const hashtagString = hashtags.join(',');

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or error occurred
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    }
  };

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}${hashtagString ? `&hashtags=${hashtagString}` : ''}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${shareUrl}`)}`,
  };

  const openShareWindow = (url: string) => {
    window.open(url, '_blank', 'width=600,height=400');
  };

  // Check if native share is available (mobile devices)
  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Share:</span>
        <div className="flex gap-1">
          <button
            onClick={() => openShareWindow(shareLinks.twitter)}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Share on Twitter"
          >
            <TwitterIcon />
          </button>
          <button
            onClick={() => openShareWindow(shareLinks.facebook)}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Share on Facebook"
          >
            <FacebookIcon />
          </button>
          <button
            onClick={() => openShareWindow(shareLinks.linkedin)}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Share on LinkedIn"
          >
            <LinkedInIcon />
          </button>
          {showCopyLink && (
            <button
              onClick={handleCopyLink}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Copy link"
            >
              {copied ? <CheckIcon className="h-5 w-5 text-green-600" /> : <LinkIcon />}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'icon-only') {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => openShareWindow(shareLinks.twitter)}
          className="p-2 bg-blue-400 hover:bg-blue-500 text-white rounded-full transition-colors"
          aria-label="Share on Twitter"
        >
          <TwitterIcon />
        </button>
        <button
          onClick={() => openShareWindow(shareLinks.facebook)}
          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
          aria-label="Share on Facebook"
        >
          <FacebookIcon />
        </button>
        <button
          onClick={() => openShareWindow(shareLinks.linkedin)}
          className="p-2 bg-blue-700 hover:bg-blue-800 text-white rounded-full transition-colors"
          aria-label="Share on LinkedIn"
        >
          <LinkedInIcon />
        </button>
        {showCopyLink && (
          <button
            onClick={handleCopyLink}
            className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-full transition-colors"
            aria-label="Copy link"
          >
            {copied ? <CheckIcon className="h-5 w-5" /> : <LinkIcon />}
          </button>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
        <ShareIcon className="h-5 w-5" />
        Share this page
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {hasNativeShare && (
          <Button
            variant="outline"
            onClick={handleNativeShare}
            className="w-full"
          >
            <ShareIcon className="h-5 w-5 mr-2" />
            Share
          </Button>
        )}

        <Button
          variant="outline"
          onClick={() => openShareWindow(shareLinks.twitter)}
          className="w-full"
        >
          <TwitterIcon />
          <span className="ml-2">Twitter</span>
        </Button>

        <Button
          variant="outline"
          onClick={() => openShareWindow(shareLinks.facebook)}
          className="w-full"
        >
          <FacebookIcon />
          <span className="ml-2">Facebook</span>
        </Button>

        <Button
          variant="outline"
          onClick={() => openShareWindow(shareLinks.linkedin)}
          className="w-full"
        >
          <LinkedInIcon />
          <span className="ml-2">LinkedIn</span>
        </Button>

        <Button
          variant="outline"
          onClick={() => openShareWindow(shareLinks.email)}
          className="w-full"
        >
          <EmailIcon />
          <span className="ml-2">Email</span>
        </Button>

        <Button
          variant="outline"
          onClick={() => openShareWindow(shareLinks.whatsapp)}
          className="w-full"
        >
          <WhatsAppIcon />
          <span className="ml-2">WhatsApp</span>
        </Button>

        {showCopyLink && (
          <Button
            variant="outline"
            onClick={handleCopyLink}
            className="w-full col-span-2"
          >
            {copied ? (
              <>
                <CheckIcon className="h-5 w-5 mr-2 text-green-600" />
                <span className="text-green-600">Copied!</span>
              </>
            ) : (
              <>
                <LinkIcon />
                <span className="ml-2">Copy Link</span>
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

// Social Media Icons
function TwitterIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );
}
