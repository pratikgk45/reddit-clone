/**
 * Environment variable validation and type-safe access
 * Uses Zod for runtime validation.
 * NEXTAUTH_SECRET has a build-time default so `next build` and CI succeed without .env.local.
 * In production, set NEXTAUTH_SECRET to a real 32+ character secret.
 */

import { z } from 'zod';

const BUILD_PLACEHOLDER_SECRET = 'build-placeholder-min-32-chars-do-not-use';

const envSchema = z.object({
  // Public (exposed to browser)
  NEXT_PUBLIC_APPSYNC_URL: z.string().trim().url().optional().or(z.literal('')),
  NEXT_PUBLIC_APPSYNC_API_KEY: z.string().trim().optional().or(z.literal('')),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),

  // Server-only; default allows build/CI to succeed; set real values for production
  NEXTAUTH_URL: z.string().url().default('http://localhost:3000'),
  NEXTAUTH_SECRET: z
    .string()
    .optional()
    .transform((s) => (s && s.length >= 32 ? s : BUILD_PLACEHOLDER_SECRET)),
  REDDIT_CLIENT_ID: z.string().optional(),
  REDDIT_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Validate environment variables
function getEnv() {
  try {
    return envSchema.parse({
      NEXT_PUBLIC_APPSYNC_URL: process.env.NEXT_PUBLIC_APPSYNC_URL,
      NEXT_PUBLIC_APPSYNC_API_KEY: process.env.NEXT_PUBLIC_APPSYNC_API_KEY,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      REDDIT_CLIENT_ID: process.env.REDDIT_CLIENT_ID,
      REDDIT_CLIENT_SECRET: process.env.REDDIT_CLIENT_SECRET,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      NODE_ENV: process.env.NODE_ENV,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      throw new Error(
        `❌ Invalid environment variables:\n${missingVars.join('\n')}\n\n` +
          'Please check your .env.local file or environment variables.'
      );
    }
    throw error;
  }
}

export const env = getEnv();

// Type-safe environment variable access
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
