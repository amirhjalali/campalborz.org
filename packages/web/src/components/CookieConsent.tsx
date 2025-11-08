'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  XMarkIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

const COOKIE_CONSENT_KEY = 'cookie-consent';
const COOKIE_PREFERENCES_KEY = 'cookie-preferences';

export interface CookiePreferences {
  necessary: boolean; // Always true
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

const defaultPreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  preferences: false,
};

/**
 * Cookie Consent Banner
 *
 * GDPR/CCPA compliant cookie consent banner
 */
export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    const storedPrefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);

    if (!consent) {
      // Show banner after a short delay
      setTimeout(() => setShowBanner(true), 1000);
    } else if (storedPrefs) {
      // Load saved preferences
      setPreferences(JSON.parse(storedPrefs));
    }
  }, []);

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };

    saveConsent(allAccepted);
  };

  const acceptNecessary = () => {
    saveConsent(defaultPreferences);
  };

  const saveCustomPreferences = () => {
    saveConsent(preferences);
    setShowSettings(false);
  };

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    setShowBanner(false);

    // Trigger analytics if accepted
    if (prefs.analytics && typeof window !== 'undefined') {
      // Initialize analytics here
      // Example: window.gtag('consent', 'update', { analytics_storage: 'granted' });
    }
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return; // Can't disable necessary cookies

    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Banner */}
      {!showSettings && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-black/50 to-transparent">
          <Card className="max-w-6xl mx-auto p-6 shadow-2xl">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <ShieldCheckIcon className="w-6 h-6 text-primary-600" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  We value your privacy
                </h3>
                <p className="text-sm text-gray-600">
                  We use cookies to enhance your browsing experience, serve personalized content,
                  and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                  {' '}
                  <a
                    href="/privacy"
                    className="text-primary-600 hover:text-primary-700 underline"
                  >
                    Privacy Policy
                  </a>
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="w-full sm:w-auto"
                >
                  <Cog6ToothIcon className="h-4 w-4 mr-2" />
                  Customize
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={acceptNecessary}
                  className="w-full sm:w-auto"
                >
                  Necessary Only
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={acceptAll}
                  className="w-full sm:w-auto"
                >
                  Accept All
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Cookie Preferences
                  </h2>
                  <p className="text-sm text-gray-600">
                    Choose which cookies you want to allow. You can change these settings at any time.
                  </p>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Cookie Categories */}
              <div className="space-y-4">
                {/* Necessary */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Necessary Cookies
                      </h3>
                      <p className="text-sm text-gray-600">
                        These cookies are essential for the website to function properly.
                        They cannot be disabled.
                      </p>
                    </div>
                    <div className="ml-4">
                      <div className="w-12 h-6 bg-green-500 rounded-full flex items-center justify-end px-1">
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analytics */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Analytics Cookies
                      </h3>
                      <p className="text-sm text-gray-600">
                        Help us understand how visitors interact with our website.
                      </p>
                    </div>
                    <button
                      onClick={() => togglePreference('analytics')}
                      className="ml-4"
                    >
                      <div className={`w-12 h-6 rounded-full flex items-center transition-colors px-1 ${
                        preferences.analytics ? 'bg-primary-600 justify-end' : 'bg-gray-300 justify-start'
                      }`}>
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Marketing */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Marketing Cookies
                      </h3>
                      <p className="text-sm text-gray-600">
                        Used to deliver personalized advertisements relevant to you.
                      </p>
                    </div>
                    <button
                      onClick={() => togglePreference('marketing')}
                      className="ml-4"
                    >
                      <div className={`w-12 h-6 rounded-full flex items-center transition-colors px-1 ${
                        preferences.marketing ? 'bg-primary-600 justify-end' : 'bg-gray-300 justify-start'
                      }`}>
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Preferences */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Preference Cookies
                      </h3>
                      <p className="text-sm text-gray-600">
                        Remember your settings and preferences for a better experience.
                      </p>
                    </div>
                    <button
                      onClick={() => togglePreference('preferences')}
                      className="ml-4"
                    >
                      <div className={`w-12 h-6 rounded-full flex items-center transition-colors px-1 ${
                        preferences.preferences ? 'bg-primary-600 justify-end' : 'bg-gray-300 justify-start'
                      }`}>
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={acceptNecessary}
                  className="flex-1"
                >
                  Necessary Only
                </Button>
                <Button
                  variant="primary"
                  onClick={saveCustomPreferences}
                  className="flex-1"
                >
                  Save Preferences
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

/**
 * Hook to check if cookies are accepted
 */
export function useCookieConsent() {
  const [consent, setConsent] = useState<CookiePreferences | null>(null);

  useEffect(() => {
    const storedPrefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (storedPrefs) {
      setConsent(JSON.parse(storedPrefs));
    }
  }, []);

  return consent;
}
