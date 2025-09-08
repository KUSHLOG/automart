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

      // Dynamically detect background based on scroll position and actual DOM elements
      const detectBackground = () => {
        if (navRef.current) {
          // Get the navigation bounds
          const navRect = navRef.current.getBoundingClientRect()
          const centerX = window.innerWidth / 2
          const belowNavY = navRect.bottom + 10 // Look just below the nav

          // Get element at the center point below navigation
          const elementBelow = document.elementFromPoint(centerX, belowNavY)

          if (elementBelow) {
            // Check the computed styles of the element
            const computedStyle = window.getComputedStyle(elementBelow)
            let backgroundColor = computedStyle.backgroundColor
            let backgroundImage = computedStyle.backgroundImage

            // Walk up the DOM tree to find a meaningful background
            let current: Element | null = elementBelow
            let attempts = 0
            while (current && attempts < 10) {
              const style = window.getComputedStyle(current)
              const bgColor = style.backgroundColor
              const bgImage = style.backgroundImage

              // If we find a non-transparent background color
              if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
                backgroundColor = bgColor
                break
              }

              // If we find a background image
              if (bgImage && bgImage !== 'none') {
                backgroundImage = bgImage
                break
              }

              current = current.parentElement
              attempts++
            }

            // Determine if background is dark or light
            let isDark = true // Default to dark for safety

            if (
              backgroundColor &&
              backgroundColor !== 'rgba(0, 0, 0, 0)' &&
              backgroundColor !== 'transparent'
            ) {
              // Parse RGB values from the background color
              const rgbMatch = backgroundColor.match(/rgba?\(([^)]+)\)/)
              if (rgbMatch) {
                const rgbValues = rgbMatch[1].split(',').map(val => parseInt(val.trim()))
                if (rgbValues.length >= 3) {
                  const [r, g, b] = rgbValues
                  // Calculate luminance using the standard formula
                  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
                  isDark = luminance < 0.6 // Use 0.6 threshold for better contrast
                }
              }
            } else if (backgroundImage && backgroundImage !== 'none') {
              // If there's a background image, assume dark
              isDark = true
            } else {
              // Fallback: use scroll position to guess
              // Hero section is typically dark, content areas might be light
              isDark = scrollY < 500 // Adjust this threshold based on your layout
            }

            return isDark
          }
        }

        // Fallback logic based on scroll position
        return scrollY < 500
      }

      setIsDarkBackground(detectBackground())
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
