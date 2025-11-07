import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  MapIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Animation */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center">
            <h1 className="text-9xl font-bold text-primary-600 opacity-20">404</h1>
          </div>
        </div>

        {/* Main Message */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Looks Like You've Wandered Off the Playa
          </h2>
          <p className="text-xl text-gray-600 mb-2">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <p className="text-gray-500">
            Don't worry, even the best explorers get lost sometimes.
          </p>
        </div>

        {/* Helpful Links */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Try one of these instead:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors group"
            >
              <HomeIcon className="h-6 w-6 text-gray-400 group-hover:text-primary-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900 group-hover:text-primary-700">Home</p>
                <p className="text-sm text-gray-500">Start from the beginning</p>
              </div>
            </Link>

            <Link
              href="/about"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors group"
            >
              <MapIcon className="h-6 w-6 text-gray-400 group-hover:text-primary-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900 group-hover:text-primary-700">About Us</p>
                <p className="text-sm text-gray-500">Learn about our camp</p>
              </div>
            </Link>

            <Link
              href="/events"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors group"
            >
              <svg
                className="h-6 w-6 text-gray-400 group-hover:text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <div className="text-left">
                <p className="font-medium text-gray-900 group-hover:text-primary-700">Events</p>
                <p className="text-sm text-gray-500">See what's happening</p>
              </div>
            </Link>

            <Link
              href="/donate"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors group"
            >
              <HeartIcon className="h-6 w-6 text-gray-400 group-hover:text-primary-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900 group-hover:text-primary-700">Donate</p>
                <p className="text-sm text-gray-500">Support our community</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Primary Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button asChild size="lg" variant="primary">
            <Link href="/" className="flex items-center">
              <HomeIcon className="h-5 w-5 mr-2" />
              Go to Homepage
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/search" className="flex items-center">
              <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
              Search Site
            </Link>
          </Button>
        </div>

        {/* Fun Message */}
        <div className="text-center">
          <p className="text-sm text-gray-500 italic">
            "Not all who wander are lost... but this page definitely is."
          </p>
        </div>

        {/* Contact Support */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Still can't find what you're looking for?{' '}
            <a
              href="mailto:info@campalborz.org"
              className="text-primary-600 hover:text-primary-700 underline font-medium"
            >
              Contact us
            </a>{' '}
            and we'll help you out.
          </p>
        </div>
      </div>
    </div>
  );
}
