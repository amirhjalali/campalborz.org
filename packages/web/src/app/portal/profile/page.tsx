'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, Save, Loader2, Shield, Eye, EyeOff, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../../contexts/AuthContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProfileData {
  id: string;
  email: string;
  name: string;
  playaName: string | null;
  phone: string | null;
  gender: string | null;
  role: string;
  emailVerified: boolean;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  dietaryRestrictions: string | null;
  createdAt: string;
}

interface FieldErrors {
  name?: string;
  phone?: string;
  playaName?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  dietaryRestrictions?: string;
}

interface PasswordErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const genderOptions = [
  { value: '', label: 'Prefer not to say' },
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'NON_BINARY', label: 'Non-binary' },
  { value: 'OTHER', label: 'Other' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
];

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

async function fetchProfile(token: string | null): Promise<ProfileData> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/api/trpc/auth.getProfile`, { headers });
  if (!res.ok) throw new Error('Failed to load profile');
  const json = await res.json();
  const data = json.result?.data;
  if (!data) throw new Error('Invalid profile response');
  return data as ProfileData;
}

async function saveProfile(
  token: string | null,
  payload: Record<string, unknown>,
): Promise<void> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/api/trpc/auth.updateProfile`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const json = await res.json().catch(() => null);
    const message =
      json?.error?.json?.message || json?.error?.message || 'Failed to update profile';
    throw new Error(message);
  }
}

async function changePassword(
  token: string | null,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/api/trpc/auth.changePassword`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  if (!res.ok) {
    const json = await res.json().catch(() => null);
    const message =
      json?.error?.json?.message || json?.error?.message || 'Failed to change password';
    throw new Error(message);
  }
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateProfileFields(fields: {
  name: string;
  phone: string;
  playaName: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  dietaryRestrictions: string;
}): FieldErrors {
  const errors: FieldErrors = {};

  if (!fields.name.trim()) {
    errors.name = 'Full name is required.';
  } else if (fields.name.trim().length > 100) {
    errors.name = 'Name must be 100 characters or fewer.';
  }

  if (fields.playaName.length > 100) {
    errors.playaName = 'Playa name must be 100 characters or fewer.';
  }

  if (fields.phone && fields.phone.length > 20) {
    errors.phone = 'Phone must be 20 characters or fewer.';
  }

  if (fields.emergencyContactName.length > 100) {
    errors.emergencyContactName = 'Contact name must be 100 characters or fewer.';
  }

  if (fields.emergencyContactPhone.length > 20) {
    errors.emergencyContactPhone = 'Contact phone must be 20 characters or fewer.';
  }

  if (fields.dietaryRestrictions.length > 500) {
    errors.dietaryRestrictions = 'Dietary restrictions must be 500 characters or fewer.';
  }

  return errors;
}

function validatePasswordFields(fields: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): PasswordErrors {
  const errors: PasswordErrors = {};

  if (!fields.currentPassword) {
    errors.currentPassword = 'Current password is required.';
  }

  if (!fields.newPassword) {
    errors.newPassword = 'New password is required.';
  } else if (fields.newPassword.length < 8) {
    errors.newPassword = 'Password must be at least 8 characters.';
  } else if (fields.newPassword.length > 128) {
    errors.newPassword = 'Password must be 128 characters or fewer.';
  }

  if (fields.newPassword && fields.currentPassword && fields.newPassword === fields.currentPassword) {
    errors.newPassword = 'New password must be different from current password.';
  }

  if (fields.newPassword && fields.confirmPassword !== fields.newPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PortalProfilePage() {
  const { user } = useAuth();

  // Profile loading
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile form fields
  const [name, setName] = useState('');
  const [playaName, setPlayaName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // Password form fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({});

  // -----------------------------------------------------------------------
  // Load profile
  // -----------------------------------------------------------------------

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const data = await fetchProfile(token);
      setProfile(data);
      setName(data.name || '');
      setPlayaName(data.playaName || '');
      setPhone(data.phone || '');
      setGender(data.gender || '');
      setEmergencyContactName(data.emergencyContactName || '');
      setEmergencyContactPhone(data.emergencyContactPhone || '');
      setDietaryRestrictions(data.dietaryRestrictions || '');
    } catch {
      toast.error('Unable to load your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // -----------------------------------------------------------------------
  // Save profile
  // -----------------------------------------------------------------------

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateProfileFields({
      name,
      phone,
      playaName,
      emergencyContactName,
      emergencyContactPhone,
      dietaryRestrictions,
    });
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error('Please fix the highlighted errors before saving.');
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('accessToken');
      await saveProfile(token, {
        name: name.trim(),
        playaName: playaName.trim() || null,
        phone: phone.trim() || null,
        gender: gender || null,
        emergencyContactName: emergencyContactName.trim() || null,
        emergencyContactPhone: emergencyContactPhone.trim() || null,
        dietaryRestrictions: dietaryRestrictions.trim() || null,
      });
      toast.success('Profile updated successfully.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------------------------------------------------
  // Change password
  // -----------------------------------------------------------------------

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validatePasswordFields({
      currentPassword,
      newPassword,
      confirmPassword,
    });
    setPasswordErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setChangingPassword(true);

    try {
      const token = localStorage.getItem('accessToken');
      await changePassword(token, currentPassword, newPassword);
      toast.success('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordErrors({});
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to change password.');
    } finally {
      setChangingPassword(false);
    }
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

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

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-gold animate-spin mb-4" />
          <p className="text-sm text-ink-soft">Loading your profile...</p>
        </div>
      ) : (
        <>
          {/* Account info banner */}
          {profile && (
            <div className="luxury-card p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cream border border-tan/30">
                    <User className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">{profile.email}</p>
                    <p className="text-xs text-ink-soft">
                      Member since{' '}
                      {new Date(profile.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center self-start rounded-full bg-sage/10 px-3 py-1 text-xs font-medium text-sage">
                  {profile.role}
                </span>
              </div>
            </div>
          )}

          {/* ===== Profile form ===== */}
          <form onSubmit={handleSaveProfile} className="space-y-6" noValidate>
            {/* Basic Information */}
            <div className="luxury-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="h-5 w-5 text-gold" />
                <h2 className="text-display-thin text-xl text-ink">Basic Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label htmlFor="name" className="form-label">
                    Full Name <span className="text-terracotta">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: undefined }));
                    }}
                    className={`form-input ${fieldErrors.name ? 'border-red-400' : ''}`}
                    placeholder="Your full name"
                  />
                  {fieldErrors.name && (
                    <p className="text-xs text-red-600 mt-1">{fieldErrors.name}</p>
                  )}
                </div>

                {/* Email (read-only) */}
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

                {/* Playa Name */}
                <div>
                  <label htmlFor="playaName" className="form-label">Playa Name</label>
                  <input
                    id="playaName"
                    type="text"
                    value={playaName}
                    onChange={(e) => {
                      setPlayaName(e.target.value);
                      if (fieldErrors.playaName) setFieldErrors((p) => ({ ...p, playaName: undefined }));
                    }}
                    className={`form-input ${fieldErrors.playaName ? 'border-red-400' : ''}`}
                    placeholder="Your playa name (optional)"
                  />
                  {fieldErrors.playaName && (
                    <p className="text-xs text-red-600 mt-1">{fieldErrors.playaName}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="form-label">Phone</label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (fieldErrors.phone) setFieldErrors((p) => ({ ...p, phone: undefined }));
                    }}
                    className={`form-input ${fieldErrors.phone ? 'border-red-400' : ''}`}
                    placeholder="Your phone number"
                  />
                  {fieldErrors.phone && (
                    <p className="text-xs text-red-600 mt-1">{fieldErrors.phone}</p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label htmlFor="gender" className="form-label">Gender</label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="form-input"
                  >
                    {genderOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dietary Restrictions */}
                <div>
                  <label htmlFor="dietary" className="form-label">Dietary Restrictions</label>
                  <input
                    id="dietary"
                    type="text"
                    value={dietaryRestrictions}
                    onChange={(e) => {
                      setDietaryRestrictions(e.target.value);
                      if (fieldErrors.dietaryRestrictions)
                        setFieldErrors((p) => ({ ...p, dietaryRestrictions: undefined }));
                    }}
                    className={`form-input ${fieldErrors.dietaryRestrictions ? 'border-red-400' : ''}`}
                    placeholder="e.g., Vegetarian, Gluten-free"
                  />
                  {fieldErrors.dietaryRestrictions && (
                    <p className="text-xs text-red-600 mt-1">{fieldErrors.dietaryRestrictions}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="luxury-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="h-5 w-5 text-gold" />
                <h2 className="text-display-thin text-xl text-ink">Emergency Contact</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="emergencyName" className="form-label">Contact Name</label>
                  <input
                    id="emergencyName"
                    type="text"
                    value={emergencyContactName}
                    onChange={(e) => {
                      setEmergencyContactName(e.target.value);
                      if (fieldErrors.emergencyContactName)
                        setFieldErrors((p) => ({ ...p, emergencyContactName: undefined }));
                    }}
                    className={`form-input ${fieldErrors.emergencyContactName ? 'border-red-400' : ''}`}
                    placeholder="Emergency contact name"
                  />
                  {fieldErrors.emergencyContactName && (
                    <p className="text-xs text-red-600 mt-1">{fieldErrors.emergencyContactName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="emergencyPhone" className="form-label">Contact Phone</label>
                  <input
                    id="emergencyPhone"
                    type="tel"
                    value={emergencyContactPhone}
                    onChange={(e) => {
                      setEmergencyContactPhone(e.target.value);
                      if (fieldErrors.emergencyContactPhone)
                        setFieldErrors((p) => ({ ...p, emergencyContactPhone: undefined }));
                    }}
                    className={`form-input ${fieldErrors.emergencyContactPhone ? 'border-red-400' : ''}`}
                    placeholder="Emergency contact phone"
                  />
                  {fieldErrors.emergencyContactPhone && (
                    <p className="text-xs text-red-600 mt-1">{fieldErrors.emergencyContactPhone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Save button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving || !name.trim()}
                className="cta-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>

          {/* ===== Change Password ===== */}
          <form onSubmit={handleChangePassword} className="space-y-6" noValidate>
            <div className="luxury-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <Lock className="h-5 w-5 text-gold" />
                <h2 className="text-display-thin text-xl text-ink">Change Password</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Password */}
                <div className="md:col-span-2 md:max-w-md">
                  <label htmlFor="currentPassword" className="form-label">Current Password</label>
                  <div className="relative">
                    <input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => {
                        setCurrentPassword(e.target.value);
                        if (passwordErrors.currentPassword)
                          setPasswordErrors((p) => ({ ...p, currentPassword: undefined }));
                      }}
                      className={`form-input pr-10 ${passwordErrors.currentPassword ? 'border-red-400' : ''}`}
                      placeholder="Enter your current password"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink-soft transition-colors"
                      aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="text-xs text-red-600 mt-1">{passwordErrors.currentPassword}</p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label htmlFor="newPassword" className="form-label">New Password</label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (passwordErrors.newPassword)
                          setPasswordErrors((p) => ({ ...p, newPassword: undefined }));
                      }}
                      className={`form-input pr-10 ${passwordErrors.newPassword ? 'border-red-400' : ''}`}
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink-soft transition-colors"
                      aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="text-xs text-red-600 mt-1">{passwordErrors.newPassword}</p>
                  )}
                </div>

                {/* Confirm New Password */}
                <div>
                  <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (passwordErrors.confirmPassword)
                        setPasswordErrors((p) => ({ ...p, confirmPassword: undefined }));
                    }}
                    className={`form-input ${passwordErrors.confirmPassword ? 'border-red-400' : ''}`}
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-xs text-red-600 mt-1">{passwordErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Change password button */}
              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
                  className="cta-secondary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {changingPassword ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                  <span>{changingPassword ? 'Changing...' : 'Change Password'}</span>
                </button>
              </div>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
