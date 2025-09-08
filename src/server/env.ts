import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url().optional(),
  REDIS_URL: z.string().url().optional(),
  // Add other required env vars here
})

export const ENV = envSchema.parse(process.env)

// Type for environment variables
export type Env = z.infer<typeof envSchema>
