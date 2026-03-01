'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, Save, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

interface ProfileData {
  id: string;
  email: string;
  name: string;
  playaName: string | null;
  phone: string | null;
  gender: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  dietaryRestrictions: string | null;
  createdAt: string;
}

const genderOptions = [
  { value: '', label: 'Prefer not to say' },
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'NON_BINARY', label: 'Non-binary' },
  { value: 'OTHER', label: 'Other' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
];

export default function PortalProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [playaName, setPlayaName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/api/trpc/auth.getProfile`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to load profile');
      const json = await res.json();
      const data = json.result?.data as ProfileData;
      if (data) {
        setProfile(data);
        setName(data.name || '');
        setPlayaName(data.playaName || '');
        setPhone(data.phone || '');
        setGender(data.gender || '');
        setEmergencyContactName(data.emergencyContactName || '');
        setEmergencyContactPhone(data.emergencyContactPhone || '');
        setDietaryRestrictions(data.dietaryRestrictions || '');
      }
    } catch {
      setError('Unable to load your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE_URL}/api/trpc/auth.updateProfile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: name.trim(),
          playaName: playaName.trim() || null,
          phone: phone.trim() || null,
          gender: gender || null,
          emergencyContactName: emergencyContactName.trim() || null,
          emergencyContactPhone: emergencyContactPhone.trim() || null,
          dietaryRestrictions: dietaryRestrictions.trim() || null,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully.');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-display-thin text-3xl text-ink mb-2">My Profile</h1>
        <p className="text-body-relaxed text-ink-soft">
          View and update your member information.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Success banner */}
      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-gold animate-spin mb-4" />
          <p className="text-sm text-ink-soft">Loading your profile...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Basic Information */}
          <div className="luxury-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="h-5 w-5 text-gold" />
              <h2 className="text-display-thin text-xl text-ink">Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="form-label">Full Name *</label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  id="email"
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="form-input opacity-60 cursor-not-allowed"
                />
                <p className="text-xs text-ink-soft mt-1">Email cannot be changed.</p>
              </div>

              <div>
                <label htmlFor="playaName" className="form-label">Playa Name</label>
                <input
                  id="playaName"
                  type="text"
                  value={playaName}
                  onChange={(e) => setPlayaName(e.target.value)}
                  className="form-input"
                  placeholder="Your playa name (optional)"
                />
              </div>

              <div>
                <label htmlFor="phone" className="form-label">Phone</label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-input"
                  placeholder="Your phone number"
                />
              </div>

              <div>
                <label htmlFor="gender" className="form-label">Gender</label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="form-input"
                >
                  {genderOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="dietary" className="form-label">Dietary Restrictions</label>
                <input
                  id="dietary"
                  type="text"
                  value={dietaryRestrictions}
                  onChange={(e) => setDietaryRestrictions(e.target.value)}
                  className="form-input"
                  placeholder="e.g., Vegetarian, Gluten-free"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="luxury-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="h-5 w-5 text-gold" />
              <h2 className="text-display-thin text-xl text-ink">Emergency Contact</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="emergencyName" className="form-label">Contact Name</label>
                <input
                  id="emergencyName"
                  type="text"
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  className="form-input"
                  placeholder="Emergency contact name"
                />
              </div>

              <div>
                <label htmlFor="emergencyPhone" className="form-label">Contact Phone</label>
                <input
                  id="emergencyPhone"
                  type="tel"
                  value={emergencyContactPhone}
                  onChange={(e) => setEmergencyContactPhone(e.target.value)}
                  className="form-input"
                  placeholder="Emergency contact phone"
                />
              </div>
            </div>
          </div>

          {/* Save button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="cta-primary inline-flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
