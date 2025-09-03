import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'
import Providers from '@/components/Providers'
import { auth } from '@/server/auth/auth'

export const metadata: Metadata = {
  title: 'Auto Mart',
  description: 'Buy, Sell, and Bid on Vehicles',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Safely get session, fallback to null if auth fails
  let session = null
  try {
    session = await auth()
  } catch (error) {
    console.error('Auth error in layout:', error)
    // Continue without session rather than crashing
  }
  return (
    <html lang="en">
      <body className="bg-black">
        <Providers>
          {/* Transparent Navigation Overlay */}
          <header className="fixed top-0 left-0 right-0 z-50">
            <nav className="bg-black/90 backdrop-blur-lg border-b border-white/20">
              <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                  {/* Logo */}
                  <Link href="/" className="flex items-center">
                    <div className="text-2xl font-bold text-white">
                      <span className="text-blue-400">Auto</span> Mart
                    </div>
                  </Link>

                  {/* Navigation Links */}
                  <div className="hidden md:flex items-center space-x-8">
                    <Link
                      href="/"
                      className="text-white/90 hover:text-white transition-colors duration-200 font-medium"
                    >
                      Home
                    </Link>
                    <Link
                      href="/vehicles"
                      className="text-white/90 hover:text-white transition-colors duration-200 font-medium"
                    >
                      Vehicles
                    </Link>
                  </div>

                  {/* Auth buttons */}
                  <div className="flex items-center space-x-4">
                    {session ? (
                      <>
                        <span className="text-white/90 font-medium">
                          Welcome, {session.user?.email}
                        </span>
                        <form action="/api/auth/signout" method="post" className="inline">
                          <button
                            type="submit"
                            className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300"
                          >
                            Sign out
                          </button>
                        </form>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/sign-in"
                          className="text-white/90 hover:text-white transition-colors duration-200 font-medium"
                        >
                          Sign In
                        </Link>
                        <Link
                          href="/sign-in"
                          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                        >
                          Sign Up
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </nav>
          </header>

          {/* Main content with padding for fixed header */}
          <main className="pt-20">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
