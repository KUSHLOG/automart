'use client'

import FlowingMenu from '@/components/navigation/FlowingMenu'
import { useSession } from 'next-auth/react'

export default function TopNav() {
  const { data: session } = useSession()

  const menuItems = [
    { label: 'Home', href: '/' },
    { label: 'All Vehicles', href: '/vehicles' },
  ]

  return (
    <div className="flex items-center justify-between py-4">
      <div className="font-semibold text-white">Auto Mart</div>
      <FlowingMenu items={menuItems} />
      <div className="flex items-center gap-4">
        {session?.user ? (
          <>
            <span className="text-sm text-white/80">Welcome, {session.user.email}</span>
            <form action="/api/auth/signout" method="post">
              <button type="submit" className="text-sm text-red-400 hover:text-red-300 underline">
                Sign out
              </button>
            </form>
          </>
        ) : (
          <a href="/sign-in" className="text-white/80 hover:text-white underline">
            Sign in
          </a>
        )}
      </div>
    </div>
  )
}
