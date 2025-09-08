'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

function TransparentNavigation() {
  const [scrollY, setScrollY] = useState(0)
  const [isDarkBackground, setIsDarkBackground] = useState(true)
  const navRef = useRef<HTMLElement>(null)
  const { data: session } = useSession()

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
      
      // Detect background color underneath the navigation
      if (navRef.current) {
        const navRect = navRef.current.getBoundingClientRect()
        const centerX = navRect.left + navRect.width / 2
        const centerY = navRect.top + navRect.height / 2
        
        // Get the element underneath the navigation center
        const elementBelow = document.elementFromPoint(centerX, centerY + navRect.height)
        
        if (elementBelow) {
          const styles = window.getComputedStyle(elementBelow)
          const bgColor = styles.backgroundColor
          const bgImage = styles.backgroundImage
          
          // Check if background is dark or light
          let isDark = true
          
          if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
            // Parse RGB values
            const rgb = bgColor.match(/\d+/g)
            if (rgb && rgb.length >= 3) {
              const [r, g, b] = rgb.map(Number)
              // Calculate relative luminance
              const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
              isDark = luminance < 0.5
            }
          } else if (bgImage && bgImage !== 'none') {
            // If there's a background image, assume it's dark (like hero sections)
            isDark = true
          } else {
            // Check parent elements for background
            let parent = elementBelow.parentElement
            let found = false
            while (parent && !found && parent !== document.body) {
              const parentStyles = window.getComputedStyle(parent)
              const parentBg = parentStyles.backgroundColor
              const parentBgImage = parentStyles.backgroundImage
              
              if (parentBg && parentBg !== 'rgba(0, 0, 0, 0)' && parentBg !== 'transparent') {
                const rgb = parentBg.match(/\d+/g)
                if (rgb && rgb.length >= 3) {
                  const [r, g, b] = rgb.map(Number)
                  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
                  isDark = luminance < 0.5
                  found = true
                }
              } else if (parentBgImage && parentBgImage !== 'none') {
                isDark = true
                found = true
              }
              parent = parent.parentElement
            }
            
            // If no background found, use scroll position as fallback
            if (!found) {
              isDark = scrollY < 300 // Assume dark hero section at top
            }
          }
          
          setIsDarkBackground(isDark)
        }
      }
    }

    // Initial check
    handleScroll()
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [scrollY])

  // Text should be white on dark backgrounds, dark on light backgrounds
  const textColor = isDarkBackground ? '#ffffff' : '#1f2937'
  const secondaryTextColor = isDarkBackground ? '#e5e7eb' : '#6b7280'
  const linkColor = isDarkBackground ? '#ffffff' : '#374151'
  const signOutColor = isDarkBackground ? '#f87171' : '#dc2626'
  const textShadow = isDarkBackground ? '0 1px 3px rgba(0, 0, 0, 0.7)' : 'none'

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out"
      style={{
        // ALWAYS transparent - only blur changes
        background: 'transparent',
        backdropFilter: `blur(${8 + (scrollY / 150) * 4}px)`,
        WebkitBackdropFilter: `blur(${8 + (scrollY / 150) * 4}px)`,
        // Subtle shadow when scrolled
        boxShadow: scrollY > 50 ? `0 2px 20px rgba(0, 0, 0, 0.1)` : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div
              className="text-2xl font-bold transition-colors duration-500 ease-out"
              style={{
                color: textColor,
                textShadow: textShadow,
              }}
            >
              <span className="text-blue-500">Auto</span> Mart
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="font-medium hover:opacity-80 transition-all duration-500 ease-out"
              style={{
                color: linkColor,
                textShadow: textShadow,
              }}
            >
              Home
            </Link>
            <Link
              href="/vehicles"
              className="font-medium hover:opacity-80 transition-all duration-500 ease-out"
              style={{
                color: linkColor,
                textShadow: textShadow,
              }}
            >
              Vehicles
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {session ? (
              <div className="flex items-center space-x-3">
                <span
                  className="text-sm font-medium transition-colors duration-500 ease-out"
                  style={{
                    color: secondaryTextColor,
                    textShadow: textShadow,
                  }}
                >
                  Welcome, {session.user?.name || session.user?.email}
                </span>
                <form action="/api/auth/signout" method="POST">
                  <button
                    type="submit"
                    className="text-sm font-medium hover:opacity-80 transition-colors duration-500 ease-out"
                    style={{
                      color: signOutColor,
                      textShadow: textShadow,
                    }}
                  >
                    Sign Out
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/sign-in"
                  className="font-medium hover:opacity-80 transition-colors duration-500 ease-out"
                  style={{
                    color: linkColor,
                    textShadow: textShadow,
                  }}
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-in"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-300 font-medium"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              className="p-2 hover:opacity-80 transition-colors duration-500 ease-out"
              style={{
                color: linkColor,
                textShadow: textShadow,
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default TransparentNavigation
