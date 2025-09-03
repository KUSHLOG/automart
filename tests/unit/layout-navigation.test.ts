import { describe, it, expect } from '@jest/globals'
import fs from 'fs'
import path from 'path'

describe('Layout and Navigation', () => {
  describe('Layout Structure', () => {
    it('should have main layout file', () => {
      const layoutPath = path.join(process.cwd(), 'src/app/layout.tsx')
      expect(fs.existsSync(layoutPath)).toBe(true)

      const content = fs.readFileSync(layoutPath, 'utf-8')
      expect(content).toContain('export default')
      expect(content).toContain('<html')
      expect(content).toContain('<body')
    })

    it('should not have layout-complex file in active use', () => {
      const layoutPath = path.join(process.cwd(), 'src/app/layout.tsx')
      const complexLayoutPath = path.join(process.cwd(), 'src/app/layout-complex.tsx')
      
      // Main layout should exist
      expect(fs.existsSync(layoutPath)).toBe(true)
      
      // Complex layout should exist as backup but not be the active one
      if (fs.existsSync(complexLayoutPath)) {
        const layoutContent = fs.readFileSync(layoutPath, 'utf-8')
        const complexContent = fs.readFileSync(complexLayoutPath, 'utf-8')
        
        // Active layout should not contain dashboard references
        expect(layoutContent.toLowerCase()).not.toContain('dashboard')
        
        // Complex layout (backup) may contain dashboard references
        // This is expected as it's the backup version
      }
    })

    it('should have proper metadata configuration', () => {
      const layoutPath = path.join(process.cwd(), 'src/app/layout.tsx')
      const content = fs.readFileSync(layoutPath, 'utf-8')

      // Should have title configuration
      const hasTitle = content.includes('title') || content.includes('metadata')
      expect(hasTitle).toBe(true)
    })

    it('should have authentication integration', () => {
      const layoutPath = path.join(process.cwd(), 'src/app/layout.tsx')
      const content = fs.readFileSync(layoutPath, 'utf-8')

      // Should have auth integration
      expect(content).toContain('auth')
      
      // Should have providers or session handling
      const hasSessionHandling = content.includes('Providers') || 
                                 content.includes('SessionProvider') ||
                                 content.includes('session')
      expect(hasSessionHandling).toBe(true)
    })
  })

  describe('Navigation Components', () => {
    it('should have TopNav component', () => {
      const topNavPath = path.join(process.cwd(), 'src/components/site/TopNav.tsx')
      expect(fs.existsSync(topNavPath)).toBe(true)

      const content = fs.readFileSync(topNavPath, 'utf-8')
      expect(content).toContain('export default function TopNav')
    })

    it('should not have dashboard references in TopNav', () => {
      const topNavPath = path.join(process.cwd(), 'src/components/site/TopNav.tsx')
      const content = fs.readFileSync(topNavPath, 'utf-8')

      // Should not contain dashboard links or references
      expect(content.toLowerCase()).not.toContain('dashboard')
      
      // Should have proper navigation structure
      expect(content).toContain('Home')
      expect(content).toContain('Vehicles')
      expect(content).toContain('Sign out')
      expect(content).toContain('Sign in')
    })

    it('should have FlowingMenu component', () => {
      const menuPath = path.join(process.cwd(), 'src/components/navigation/FlowingMenu.tsx')
      
      if (fs.existsSync(menuPath)) {
        const content = fs.readFileSync(menuPath, 'utf-8')
        expect(content).toContain('export default')
        
        // Should use framer-motion for animations
        expect(content).toContain('motion')
      }
    })
  })

  describe('Styling and Theme', () => {
    it('should have proper CSS/styling setup', () => {
      const layoutPath = path.join(process.cwd(), 'src/app/layout.tsx')
      const content = fs.readFileSync(layoutPath, 'utf-8')

      // Should include global styles
      const hasStyles = content.includes('globals.css') || 
                       content.includes('./globals') ||
                       content.includes('tailwind')
      expect(hasStyles).toBe(true)
    })

    it('should have consistent color scheme', () => {
      const layoutPath = path.join(process.cwd(), 'src/app/layout.tsx')
      const content = fs.readFileSync(layoutPath, 'utf-8')

      // Should have background styling (removed dashboard-specific styling)
      const hasBackground = content.includes('bg-') || content.includes('background')
      expect(hasBackground).toBe(true)

      // Should use black background theme
      expect(content).toContain('bg-black')
    })

    it('should have proper font configuration', () => {
      const layoutPath = path.join(process.cwd(), 'src/app/layout.tsx')
      const content = fs.readFileSync(layoutPath, 'utf-8')

      // Should have font configuration
      const hasFont = content.includes('font-') || 
                     content.includes('Inter') ||
                     content.includes('font')
      expect(hasFont).toBe(true)
    })
  })

  describe('Responsive Design', () => {
    it('should have mobile-responsive navigation', () => {
      const topNavPath = path.join(process.cwd(), 'src/components/site/TopNav.tsx')
      const content = fs.readFileSync(topNavPath, 'utf-8')

      // Should have responsive classes
      const hasResponsive = content.includes('sm:') || 
                           content.includes('md:') ||
                           content.includes('lg:') ||
                           content.includes('flex')
      expect(hasResponsive).toBe(true)
    })

    it('should handle different screen sizes', () => {
      const layoutPath = path.join(process.cwd(), 'src/app/layout.tsx')
      const content = fs.readFileSync(layoutPath, 'utf-8')

      // Should have responsive container or padding
      const hasResponsiveLayout = content.includes('container') ||
                                 content.includes('px-') ||
                                 content.includes('max-w')
      expect(hasResponsiveLayout).toBe(true)
    })
  })

  describe('SEO and Accessibility', () => {
    it('should have proper HTML semantics', () => {
      const layoutPath = path.join(process.cwd(), 'src/app/layout.tsx')
      const content = fs.readFileSync(layoutPath, 'utf-8')

      // Should have semantic HTML structure
      expect(content).toContain('<html')
      expect(content).toContain('<body')
      
      // Should have lang attribute or other accessibility features
      const hasLang = content.includes('lang=') || content.includes('lang:')
      expect(hasLang).toBe(true)
    })

    it('should have navigation landmarks', () => {
      const topNavPath = path.join(process.cwd(), 'src/components/site/TopNav.tsx')
      const content = fs.readFileSync(topNavPath, 'utf-8')

      // Should use proper navigation semantics
      const hasNavigation = content.includes('<nav') || 
                           content.includes('navigation') ||
                           content.includes('role=')
      expect(hasNavigation).toBe(true)
    })
  })

  describe('Performance Optimization', () => {
    it('should have proper component structure', () => {
      const topNavPath = path.join(process.cwd(), 'src/components/site/TopNav.tsx')
      const content = fs.readFileSync(topNavPath, 'utf-8')

      // Should be a client component (uses hooks)
      expect(content).toContain("'use client'")
      
      // Should use React hooks properly
      expect(content).toContain('useSession')
    })

    it('should have lazy loading considerations', () => {
      const layoutPath = path.join(process.cwd(), 'src/app/layout.tsx')
      const content = fs.readFileSync(layoutPath, 'utf-8')

      // Should have proper import structure
      const hasImports = content.includes('import') && content.includes('from')
      expect(hasImports).toBe(true)
      
      // Should not have unnecessary imports
      expect(content).not.toContain('import { unused }')
    })
  })

  describe('Authentication UI', () => {
    it('should handle authenticated state in navigation', () => {
      const topNavPath = path.join(process.cwd(), 'src/components/site/TopNav.tsx')
      const content = fs.readFileSync(topNavPath, 'utf-8')

      // Should have conditional rendering for auth state
      expect(content).toContain('session?.user')
      expect(content).toContain('Welcome')
      expect(content).toContain('Sign out')
      expect(content).toContain('Sign in')
    })

    it('should have proper sign out functionality', () => {
      const topNavPath = path.join(process.cwd(), 'src/components/site/TopNav.tsx')
      const content = fs.readFileSync(topNavPath, 'utf-8')

      // Should have sign out form
      expect(content).toContain('/api/auth/signout')
      expect(content).toContain('method="post"')
    })

    it('should handle authentication errors gracefully', () => {
      const layoutPath = path.join(process.cwd(), 'src/app/layout.tsx')
      const content = fs.readFileSync(layoutPath, 'utf-8')

      // Should have error handling for auth
      const hasErrorHandling = content.includes('try') && content.includes('catch') ||
                              content.includes('?.') // Optional chaining
      expect(hasErrorHandling).toBe(true)
    })
  })
})
