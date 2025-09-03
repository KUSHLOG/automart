import { describe, it, expect } from '@jest/globals'
import fs from 'fs'
import path from 'path'

describe('App Structure Validation', () => {
  describe('Critical App Router Files', () => {
    const criticalFiles = [
      'src/app/layout.tsx',
      'src/app/page.tsx', 
      'src/app/error.tsx',
      'src/app/global-error.tsx',
      'src/app/not-found.tsx'
    ]

    criticalFiles.forEach(filePath => {
      it(`should have ${filePath}`, () => {
        const fullPath = path.join(process.cwd(), filePath)
        expect(fs.existsSync(fullPath)).toBe(true)
      })
    })
  })

  describe('Configuration Files', () => {
    const configFiles = [
      'next.config.ts',
      'tsconfig.json',
      'package.json',
      'jest.config.js',
      'jest.setup.js'
    ]

    configFiles.forEach(filePath => {
      it(`should have ${filePath}`, () => {
        const fullPath = path.join(process.cwd(), filePath)
        expect(fs.existsSync(fullPath)).toBe(true)
      })
    })
  })

  describe('Environment Configuration', () => {
    it('should have environment file', () => {
      const envFile = '.env'
      const hasEnvFile = fs.existsSync(path.join(process.cwd(), envFile))
      expect(hasEnvFile).toBe(true)
      
      // Verify .env.local is not present (should be removed for cleanup)
      const envLocalFile = '.env.local'
      const hasEnvLocalFile = fs.existsSync(path.join(process.cwd(), envLocalFile))
      expect(hasEnvLocalFile).toBe(false)
    })

    it('should have required environment variables', () => {
      const envPath = path.join(process.cwd(), '.env')
      const envContent = fs.readFileSync(envPath, 'utf-8')
      
      expect(envContent).toContain('DATABASE_URL')
      expect(envContent).toContain('AUTH_SECRET')
      expect(envContent).toContain('NEXTAUTH_URL')
    })
  })

  describe('Database Configuration', () => {
    it('should have Prisma schema', () => {
      const schemaPath = path.join(process.cwd(), 'prisma/schema.prisma')
      expect(fs.existsSync(schemaPath)).toBe(true)
    })

    it('should have database file', () => {
      const dbPath = path.join(process.cwd(), 'prisma/dev.db')
      expect(fs.existsSync(dbPath)).toBe(true)
    })
  })

  describe('Next.js App Router Compliance Check', () => {
    it('should not have pages directory (App Router should be used)', () => {
      const pagesPath = path.join(process.cwd(), 'pages')
      expect(fs.existsSync(pagesPath)).toBe(false)
    })

    it('should have src/app directory structure', () => {
      const appPath = path.join(process.cwd(), 'src/app')
      expect(fs.existsSync(appPath)).toBe(true)
      
      const appDir = fs.statSync(appPath)
      expect(appDir.isDirectory()).toBe(true)
    })
  })

  describe('Build Prevention Issues', () => {
    it('should not have duplicate error handling files', () => {
      const conflicts = [
        ['src/app/error.tsx', 'src/app/error.js'],
        ['src/app/not-found.tsx', 'src/app/not-found.js'],
        ['src/app/layout.tsx', 'src/app/layout.js'],
        ['src/app/page.tsx', 'src/app/page.js']
      ]

      conflicts.forEach(([tsxFile, jsFile]) => {
        const tsxExists = fs.existsSync(path.join(process.cwd(), tsxFile))
        const jsExists = fs.existsSync(path.join(process.cwd(), jsFile))
        
        if (tsxExists) {
          expect(jsExists).toBe(false)
        }
      })
    })

    it('should have consistent module resolution', () => {
      const tsconfigPath = path.join(process.cwd(), 'tsconfig.json')
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'))
      
      // Check that paths are configured for module resolution
      expect(tsconfig.compilerOptions.paths).toBeDefined()
      expect(tsconfig.compilerOptions.paths['@/*']).toBeDefined()
      expect(tsconfig.compilerOptions.paths['@/*']).toEqual(['./src/*'])
    })

    it('should not have dashboard directory (removed during cleanup)', () => {
      const dashboardPath = path.join(process.cwd(), 'src/app/dashboard')
      expect(fs.existsSync(dashboardPath)).toBe(false)
    })

    it('should have license file', () => {
      const licensePath = path.join(process.cwd(), 'LICENSE')
      expect(fs.existsSync(licensePath)).toBe(true)
      
      const licenseContent = fs.readFileSync(licensePath, 'utf-8')
      expect(licenseContent).toContain('MIT License')
    })
  })
})
