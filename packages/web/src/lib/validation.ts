/**
 * Form Validation Utilities
 *
 * Zod schemas and validation helpers for forms
 */

import { z } from 'zod';

/**
 * Common Field Validators
 */

// Email validation
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .toLowerCase()
  .trim();

// Phone validation (US format)
export const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .regex(
    /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
    'Please enter a valid phone number'
  )
  .trim();

// URL validation
export const urlSchema = z
  .string()
  .url('Please enter a valid URL')
  .trim();

// Optional URL (allows empty)
export const optionalUrlSchema = z
  .string()
  .trim()
  .refine((val) => !val || z.string().url().safeParse(val).success, {
    message: 'Please enter a valid URL',
  })
  .optional();

// Password validation
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be less than 100 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Name validation
export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[a-zA-Z\s\-\']+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
  .trim();

// Username validation
export const usernameSchema = z
  .string()
  .min(1, 'Username is required')
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be less than 20 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
  .toLowerCase()
  .trim();

// Playa name validation (for Burning Man camps)
export const playaNameSchema = z
  .string()
  .min(1, 'Playa name is required')
  .min(2, 'Playa name must be at least 2 characters')
  .max(50, 'Playa name must be less than 50 characters')
  .trim();

// Age validation
export const ageSchema = z
  .number()
  .int('Age must be a whole number')
  .min(18, 'You must be at least 18 years old')
  .max(120, 'Please enter a valid age');

// Date validation
export const dateSchema = z.coerce.date().refine(
  (date) => date <= new Date(),
  'Date cannot be in the future'
);

// Future date validation
export const futureDateSchema = z.coerce.date().refine(
  (date) => date >= new Date(),
  'Date must be in the future'
);

/**
 * User/Member Schemas
 */

export const memberRegistrationSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  playaName: playaNameSchema.optional(),
  email: emailSchema,
  phone: phoneSchema,
  dateOfBirth: dateSchema,
  emergencyContact: z.object({
    name: nameSchema,
    phone: phoneSchema,
    relationship: z.string().min(1, 'Relationship is required'),
  }),
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(2, 'State is required').max(2),
    zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code'),
    country: z.string().min(1, 'Country is required').default('US'),
  }),
  skills: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  dietaryRestrictions: z.string().optional(),
  medicalInfo: z.string().optional(),
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
});

export type MemberRegistration = z.infer<typeof memberRegistrationSchema>;

/**
 * Event Schemas
 */

export const eventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  startDate: futureDateSchema,
  endDate: futureDateSchema,
  location: z.string().min(1, 'Location is required'),
  maxCapacity: z.number().int().min(1, 'Capacity must be at least 1').optional(),
  price: z.number().min(0, 'Price cannot be negative').optional(),
  tags: z.array(z.string()).optional(),
}).refine(
  (data) => data.endDate >= data.startDate,
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

export type Event = z.infer<typeof eventSchema>;

/**
 * Donation Schemas
 */

export const donationSchema = z.object({
  amount: z.number().min(1, 'Donation amount must be at least $1'),
  frequency: z.enum(['one-time', 'monthly', 'yearly']),
  donorName: nameSchema,
  donorEmail: emailSchema,
  isAnonymous: z.boolean().default(false),
  message: z.string().max(500, 'Message must be less than 500 characters').optional(),
  dedicatedTo: z.string().max(200).optional(),
});

export type Donation = z.infer<typeof donationSchema>;

/**
 * Contact Form Schema
 */

export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  subject: z.string().min(1, 'Subject is required').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
  category: z.enum(['general', 'volunteer', 'partnership', 'support', 'other']).optional(),
});

export type ContactForm = z.infer<typeof contactFormSchema>;

/**
 * Login/Auth Schemas
 */

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export type LoginForm = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }
);

export type SignupForm = z.infer<typeof signupSchema>;

export const resetPasswordSchema = z.object({
  email: emailSchema,
});

export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }
).refine(
  (data) => data.currentPassword !== data.newPassword,
  {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  }
);

export type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

/**
 * Profile Update Schema
 */

export const profileUpdateSchema = z.object({
  name: nameSchema,
  playaName: playaNameSchema.optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  location: z.string().max(100).optional(),
  website: optionalUrlSchema,
  social: z.object({
    linkedin: optionalUrlSchema,
    twitter: optionalUrlSchema,
    instagram: optionalUrlSchema,
  }).optional(),
  skills: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
});

export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;

/**
 * Volunteer Application Schema
 */

export const volunteerApplicationSchema = z.object({
  personalInfo: z.object({
    firstName: nameSchema,
    lastName: nameSchema,
    email: emailSchema,
    phone: phoneSchema,
    dateOfBirth: dateSchema,
  }),
  availability: z.object({
    startDate: futureDateSchema,
    endDate: futureDateSchema,
    hoursPerWeek: z.number().int().min(1).max(168),
    preferredDays: z.array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])),
  }),
  experience: z.object({
    previousVolunteer: z.boolean(),
    skills: z.array(z.string()).min(1, 'Please select at least one skill'),
    description: z.string().min(50, 'Please provide a detailed description of your experience'),
  }),
  references: z.array(
    z.object({
      name: nameSchema,
      email: emailSchema,
      phone: phoneSchema,
      relationship: z.string().min(1, 'Relationship is required'),
    })
  ).min(1, 'At least one reference is required').max(3),
  backgroundCheck: z.boolean().refine((val) => val === true, {
    message: 'You must consent to a background check',
  }),
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the volunteer terms',
  }),
});

export type VolunteerApplication = z.infer<typeof volunteerApplicationSchema>;

/**
 * Validation Helper Functions
 */

/**
 * Format Zod errors for display
 */
export function formatZodError(error: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {};

  error.errors.forEach((err) => {
    const path = err.path.join('.');
    formatted[path] = err.message;
  });

  return formatted;
}

/**
 * Validate data against schema and return formatted errors
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    errors: formatZodError(result.error),
  };
}

/**
 * Custom validators
 */

/**
 * Validate that a string is a valid hex color
 */
export const hexColorSchema = z
  .string()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color code');

/**
 * Validate credit card number (basic Luhn algorithm check)
 */
export const creditCardSchema = z
  .string()
  .regex(/^\d{13,19}$/, 'Please enter a valid credit card number')
  .refine((val) => {
    // Luhn algorithm
    let sum = 0;
    let isEven = false;

    for (let i = val.length - 1; i >= 0; i--) {
      let digit = parseInt(val[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }, 'Please enter a valid credit card number');

/**
 * Validate file upload
 */
export function createFileSchema(options: {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
}) {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = [] } = options;

  return z.custom<File>((file) => {
    if (!(file instanceof File)) {
      return false;
    }

    if (maxSize && file.size > maxSize) {
      throw new z.ZodError([
        {
          code: 'custom',
          message: `File size must be less than ${maxSize / 1024 / 1024}MB`,
          path: [],
        },
      ]);
    }

    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      throw new z.ZodError([
        {
          code: 'custom',
          message: `File type must be one of: ${allowedTypes.join(', ')}`,
          path: [],
        },
      ]);
    }

    return true;
  });
}

/**
 * Validate image file
 */
export const imageFileSchema = createFileSchema({
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
});

/**
 * Example: Custom validation with async check
 */
export function createUniqueEmailSchema(checkEmail: (email: string) => Promise<boolean>) {
  return emailSchema.refine(
    async (email) => {
      const isUnique = await checkEmail(email);
      return isUnique;
    },
    { message: 'This email is already registered' }
  );
}

/**
 * Example usage with React Hook Form
 */
export const exampleUsage = `
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginForm } from '@/lib/validation';

function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginForm) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit">Login</button>
    </form>
  );
}
`;
