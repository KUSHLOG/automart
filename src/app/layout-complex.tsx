import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'
import { auth } from '@/server/auth/auth'
import Providers from '@/components/Providers'

export const metadata: Metadata = {
  title: 'Auto Mart',
  description: 'Buy, Sell, and Bid on Vehicles',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <Providers>
          {/* Transparent Navigation Overlay */}
          <header className="fixed top-0 left-0 right-0 z-50">
            <nav className="bg-black/40 backdrop-blur-lg border-b border-white/20">
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

                  {/* User Menu */}
                  <div className="flex items-center space-x-4">
                    {session?.user ? (
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-white/80 hidden sm:block">
                          Welcome, {session.user.email}
                        </span>
                        <Link
                          href="/dashboard"
                          className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium"
                        >
                          Dashboard
                        </Link>
                        <form action="/api/auth/signout" method="post" className="inline">
                          <button
                            type="submit"
                            className="text-red-300 hover:text-red-200 transition-colors duration-200 font-medium"
                          >
                            Sign out
                          </button>
                        </form>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <Link
                          href="/sign-in"
                          className="text-white/90 hover:text-white transition-colors duration-200 font-medium"
                        >
                          Sign in
                        </Link>
                        <Link
                          href="/sign-in"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium"
                        >
                          Sign up
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Mobile Menu Button */}
                  <div className="md:hidden">
                    <button className="text-white/90 hover:text-white p-2">
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
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
          </header>

          {/* Main Content */}
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  )
}
