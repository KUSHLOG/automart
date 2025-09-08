import type { Metadata } from 'next'
import './globals.css'
import Providers from '@/components/Providers'
import TransparentNavigation from '@/components/navigation/TransparentNavigation'

export const metadata: Metadata = {
  title: 'Auto Mart',
  description: 'Buy, Sell, and Bid on Vehicles',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <Providers>
          <TransparentNavigation />

          {/* Main Content */}
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  )
}
