/**
 * Configuration System Entry Point
 *
 * This file exports all configuration modules for easy importing
 * throughout the application.
 *
 * Usage:
 * import { campConfig, brandConfig, contentConfig } from '@/config';
 */

export * from './types';
export * from './camp.config';
export * from './brand.config';
export * from './content.config';

// Re-export all configs for convenience
export { campConfig } from './camp.config';
export { brandConfig } from './brand.config';
export { contentConfig } from './content.config';
