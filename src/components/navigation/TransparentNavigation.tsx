'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

function TransparentNavigation() {
  const [scrollY, setScrollY] = useState(0)
  const { data: session } = useSession()

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Simple logic: White text at top (dark hero), dark text when scrolled (light content)
  const isOnLightBackground = scrollY > 100

  return (
    <nav
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
                color: isOnLightBackground ? '#1f2937' : '#ffffff',
                textShadow: isOnLightBackground ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.7)',
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
                color: isOnLightBackground ? '#374151' : '#ffffff',
                textShadow: isOnLightBackground ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.7)',
              }}
            >
              Home
            </Link>
            <Link
              href="/vehicles"
              className="font-medium hover:opacity-80 transition-all duration-500 ease-out"
              style={{
                color: isOnLightBackground ? '#374151' : '#ffffff',
                textShadow: isOnLightBackground ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.7)',
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
                    color: isOnLightBackground ? '#6b7280' : '#e5e7eb',
                    textShadow: isOnLightBackground ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.7)',
                  }}
                >
                  Welcome, {session.user?.name || session.user?.email}
                </span>
                <form action="/api/auth/signout" method="POST">
                  <button
                    type="submit"
                    className="text-sm font-medium hover:opacity-80 transition-colors duration-500 ease-out"
                    style={{
                      color: isOnLightBackground ? '#dc2626' : '#f87171',
                      textShadow: isOnLightBackground ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.7)',
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
                    color: isOnLightBackground ? '#374151' : '#ffffff',
                    textShadow: isOnLightBackground ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.7)',
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
                color: isOnLightBackground ? '#374151' : '#ffffff',
                textShadow: isOnLightBackground ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.7)',
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
