import { z } from "zod";

/**
 * Common validation schemas
 */

export const EmailSchema = z.string().email("Invalid email address");

export const PasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/\d/, "Password must contain at least one number");

export const PhoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone number format");

export const URLSchema = z.string().url("Invalid URL format");

export const SlugSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens");

/**
 * Validation helper functions
 */

export function validateEmail(email: string): boolean {
  return EmailSchema.safeParse(email).success;
}

export function validatePassword(password: string): boolean {
  return PasswordSchema.safeParse(password).success;
}

export function validateURL(url: string): boolean {
  return URLSchema.safeParse(url).success;
}

export function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}