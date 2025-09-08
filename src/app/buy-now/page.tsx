import { prisma } from '@/server/db/prisma'
import VehiclesGrid from '@/components/VehiclesGrid'
import Link from 'next/link'

export default async function BuyNowPage() {
  // Get all vehicles with BUY_NOW type
  const buyNowVehicles = await prisma.vehicle.findMany({
    where: {
      type: 'BUY_NOW',
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 20, // Limit for performance
  })

  return (
    <div className="min-h-screen">
      {/* Hero Section with Black Background - Same as Homepage */}
      <section className="relative bg-black text-white min-h-screen flex flex-col">
        {/* Background Pattern/Texture */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black opacity-90"></div>

        {/* Content */}
        <div className="relative flex-1 flex flex-col justify-center items-center px-4">
          <div className="text-center mb-12 max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Buy Now Vehicles
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              Browse our collection of vehicles available for immediate purchase. No bidding
              required - buy instantly at fixed prices.
            </p>
          </div>

          {/* Features Section - Glassmorphism Style */}
          <div className="w-full max-w-6xl bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                  <svg
                    className="w-6 h-6 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">Instant Purchase</h3>
                <p className="text-sm text-gray-300">Buy immediately at fixed prices</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <svg
                    className="w-6 h-6 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">No Bidding Stress</h3>
                <p className="text-sm text-gray-300">Skip the competition and buy now</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto">
                  <svg
                    className="w-6 h-6 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">Fair Pricing</h3>
                <p className="text-sm text-gray-300">Transparent, competitive prices</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-300 text-center">
              {buyNowVehicles.length === 0
                ? 'No buy now vehicles available at the moment.'
                : `${buyNowVehicles.length} vehicle${buyNowVehicles.length === 1 ? '' : 's'} available for immediate purchase`}
            </p>
          </div>
        </div>
      </section>

      {/* Vehicles Grid Section - White Background like Homepage */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {buyNowVehicles.length > 0 ? (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Available Vehicles ({buyNowVehicles.length})
                </h2>
                <p className="text-gray-600">
                  All vehicles listed below are available for immediate purchase
                </p>
              </div>
              <VehiclesGrid vehicles={buyNowVehicles} />
            </>
          ) : (
            <div className="text-center py-20">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8.25 18.75a1.5 1.5 0 01-3 0V4.5a1.5 1.5 0 013 0V12l1.5-1.5L12 12l1.5-1.5L15 12V4.5a1.5 1.5 0 013 0v14.25a1.5 1.5 0 01-3 0V16.5"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No Buy Now Vehicles Available
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                There are currently no vehicles available for immediate purchase. Check back soon or
                explore our bidding section.
              </p>
              <div className="space-x-4">
                <Link
                  href="/vehicles"
                  className="inline-flex items-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  View All Vehicles
                </Link>
                <Link
                  href="/bidding"
                  className="inline-flex items-center border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-8 rounded-lg transition-all duration-200"
                >
                  Browse Bidding
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
