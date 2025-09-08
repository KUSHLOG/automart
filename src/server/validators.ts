import { z } from 'zod'

// Vehicle listing and search validation
export const listVehicles = z.object({
  q: z.string().trim().max(100).optional(),
  make: z.string().trim().max(50).optional(),
  model: z.string().trim().max(50).optional(),
  type: z.string().trim().max(50).optional(),
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  take: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().optional(),
})

// Single vehicle validation
export const getVehicle = z.object({
  id: z.string().min(1).max(50),
})

// Bidding validation
export const placeBid = z.object({
  vehicleId: z.string().min(1).max(50),
  amount: z.coerce.number().positive().max(999999999), // Max 999M
})

// Vehicle creation validation
export const createVehicle = z.object({
  title: z.string().trim().min(1).max(200),
  make: z.string().trim().min(1).max(50),
  model: z.string().trim().min(1).max(50),
  year: z.coerce.number().int().min(1900).max(2100),
  price: z.coerce.number().positive().max(999999999),
  mileage: z.coerce.number().min(0).max(999999),
  type: z.string().trim().min(1).max(50),
  description: z.string().trim().max(2000).optional(),
  location: z.string().trim().max(100).optional(),
})

// Auth validation
export const signIn = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(255),
})

// Generic pagination
export const paginationSchema = z.object({
  take: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
})

// Helper to validate request body
export function validateRequestBody<T>(schema: z.ZodSchema<T>, body: unknown): T {
  try {
    return schema.parse(body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.issues.map(e => e.message).join(', ')}`)
    }
    throw error
  }
}

// Helper to validate search params
export function validateSearchParams<T>(schema: z.ZodSchema<T>, params: URLSearchParams): T {
  const obj = Object.fromEntries(params.entries())
  try {
    return schema.parse(obj)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.issues.map(e => e.message).join(', ')}`)
    }
    throw error
  }
}
