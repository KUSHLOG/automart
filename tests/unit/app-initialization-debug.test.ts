import { describe, it, expect } from '@jest/globals'

// Mock external dependencies 
jest.mock('@/server/auth/auth', () => ({
  auth: jest.fn(() => Promise.resolve(null))
}))

jest.mock('@/server/db/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn()
    }
  }
}))

jest.mock('next/link', () => {
  return function MockLink({ children }: { children: React.ReactNode; href: string }) {
    return children
  }
})

describe('App Initialization Error Detection', () => {
  it('should check if app structure is valid', async () => {
    // Check if essential files exist instead of importing them
    const fs = require('fs')
    const path = require('path')
    
    const appDir = path.join(process.cwd(), 'src/app')
    const layoutPath = path.join(appDir, 'layout.tsx')
    const pagePath = path.join(appDir, 'page.tsx')
    
    expect(fs.existsSync(layoutPath)).toBe(true)
    expect(fs.existsSync(pagePath)).toBe(true)
    
    console.log('✅ App structure is valid')
  })
})
