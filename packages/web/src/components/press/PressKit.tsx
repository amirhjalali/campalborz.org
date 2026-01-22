'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  ArrowDownTrayIcon,
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline';

export interface MediaAsset {
  id: string;
  title: string;
  type: 'logo' | 'photo' | 'video' | 'document';
  description?: string;
  fileUrl: string;
  fileSize?: string;
  dimensions?: string;
  format?: string;
  thumbnail?: string;
}

interface PressKitProps {
  assets: MediaAsset[];
  aboutText?: string;
  contacts?: PressContact[];
}

interface PressContact {
  name: string;
  role: string;
  email: string;
  phone?: string;
}

/**
 * Press Kit Component
 *
 * Media kit for press and partners
 */
export function PressKit({ assets, aboutText, contacts }: PressKitProps) {
  const logos = assets.filter(a => a.type === 'logo');
  const photos = assets.filter(a => a.type === 'photo');
  const videos = assets.filter(a => a.type === 'video');
  const documents = assets.filter(a => a.type === 'document');

  return (
    <div className="space-y-8">
      {/* About */}
      {aboutText && (
        <Card>
          <CardHeader>
            <CardTitle>About Camp Alborz</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {aboutText}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Press Contacts */}
      {contacts && contacts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Press Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contacts.map((contact, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">{contact.name}</p>
                  <p className="text-sm text-gray-600 mb-2">{contact.role}</p>
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-sm text-primary-600 hover:text-primary-700 block"
                  >
                    {contact.email}
                  </a>
                  {contact.phone && (
                    <a
                      href={`tel:${contact.phone}`}
                      className="text-sm text-gray-600 hover:text-gray-700"
                    >
                      {contact.phone}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Logos */}
      {logos.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Logos</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {/* Download all logos */}}
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Download All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {logos.map((asset) => (
                <MediaAssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Photos */}
      {photos.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Photos</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {/* Download all photos */}}
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Download All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {photos.map((asset) => (
                <MediaAssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Videos */}
      {videos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videos.map((asset) => (
                <MediaAssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents */}
      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Documents & Fact Sheets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {documents.map((asset) => (
                <DocumentAssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700">
              These media assets are provided for editorial use. Please adhere to the following guidelines:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 mt-3">
              <li>Do not alter logos or branding materials</li>
              <li>Maintain appropriate spacing around logos</li>
              <li>Credit photographers when using photos</li>
              <li>Contact us for commercial use permissions</li>
              <li>Always link back to campalborz.org when possible</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Media Asset Card
 */
function MediaAssetCard({ asset }: { asset: MediaAsset }) {
  const handleDownload = () => {
    // In a real app, this would trigger a download
    window.open(asset.fileUrl, '_blank');
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      <div className="relative h-48 bg-gray-100 flex items-center justify-center">
        {asset.thumbnail ? (
          <img
            src={asset.thumbnail}
            alt={asset.title}
            className="w-full h-full object-cover"
          />
        ) : asset.type === 'photo' ? (
          <PhotoIcon className="h-12 w-12 text-gray-400" />
        ) : asset.type === 'video' ? (
          <VideoCameraIcon className="h-12 w-12 text-gray-400" />
        ) : (
          <DocumentTextIcon className="h-12 w-12 text-gray-400" />
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-1">{asset.title}</h3>
        {asset.description && (
          <p className="text-sm text-gray-600 mb-2">{asset.description}</p>
        )}

        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          {asset.format && <span className="uppercase">{asset.format}</span>}
          {asset.fileSize && <span>• {asset.fileSize}</span>}
          {asset.dimensions && <span>• {asset.dimensions}</span>}
        </div>

        <Button
          variant="primary"
          size="sm"
          className="w-full"
          onClick={handleDownload}
        >
          <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>
    </div>
  );
}

/**
 * Document Asset Card (List view)
 */
function DocumentAssetCard({ asset }: { asset: MediaAsset }) {
  const handleDownload = () => {
    window.open(asset.fileUrl, '_blank');
  };

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3 flex-1">
        <DocumentTextIcon className="h-8 w-8 text-gray-400" />
        <div>
          <p className="font-medium text-gray-900">{asset.title}</p>
          {asset.description && (
            <p className="text-sm text-gray-600">{asset.description}</p>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
            {asset.format && <span className="uppercase">{asset.format}</span>}
            {asset.fileSize && <span>• {asset.fileSize}</span>}
          </div>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
      >
        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
        Download
      </Button>
    </div>
  );
}

/**
 * Sample press kit data
 */
export const samplePressKit: {
  assets: MediaAsset[];
  aboutText: string;
  contacts: PressContact[];
} = {
  aboutText: `Camp Alborz is a vibrant Burning Man theme camp celebrating Persian culture and radical self-expression. Founded in 2015, we've grown into a community of over 100 members who share a passion for art, music, and cultural exchange.

Our camp creates a welcoming space on the playa where tradition meets innovation, offering workshops in Persian art, music, dance, and cuisine. We believe in the transformative power of community and the ten principles of Burning Man.`,

  contacts: [
    {
      name: 'Sarah Johnson',
      role: 'Press Relations',
      email: 'press@campalborz.org',
      phone: '+1 (555) 123-4567',
    },
    {
      name: 'Michael Chen',
      role: 'Media Coordinator',
      email: 'media@campalborz.org',
    },
  ],

  assets: [
    {
      id: '1',
      title: 'Primary Logo (Color)',
      type: 'logo',
      description: 'Full color logo on transparent background',
      fileUrl: '/press/logo-color.png',
      fileSize: '245 KB',
      dimensions: '2000x800px',
      format: 'PNG',
    },
    {
      id: '2',
      title: 'Logo (Black)',
      type: 'logo',
      description: 'Black logo for light backgrounds',
      fileUrl: '/press/logo-black.png',
      fileSize: '180 KB',
      dimensions: '2000x800px',
      format: 'PNG',
    },
    {
      id: '3',
      title: 'Camp at Sunset',
      type: 'photo',
      description: 'Aerial view of camp during golden hour',
      fileUrl: '/press/camp-sunset.jpg',
      fileSize: '3.2 MB',
      dimensions: '4000x3000px',
      format: 'JPG',
    },
    {
      id: '4',
      title: 'Art Installation',
      type: 'photo',
      description: 'Our 2023 Persian garden installation',
      fileUrl: '/press/art-installation.jpg',
      fileSize: '2.8 MB',
      dimensions: '4000x3000px',
      format: 'JPG',
    },
    {
      id: '5',
      title: 'Fact Sheet',
      type: 'document',
      description: 'Camp history, statistics, and key information',
      fileUrl: '/press/fact-sheet.pdf',
      fileSize: '450 KB',
      format: 'PDF',
    },
    {
      id: '6',
      title: 'Press Release - 2024 Event',
      type: 'document',
      description: 'Announcement of our 2024 Burning Man presence',
      fileUrl: '/press/press-release-2024.pdf',
      fileSize: '320 KB',
      format: 'PDF',
    },
  ],
};
