import { prisma } from '@/server/db/prisma'
import VehiclesGrid from '@/components/VehiclesGrid'
import Link from 'next/link'

export default async function BiddingPage() {
  // Get all vehicles with BIDDING type
  const biddingVehicles = await prisma.vehicle.findMany({
    where: {
      type: 'BIDDING',
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 20, // Limit for performance
  })

  return (
    <div className="min-h-screen">
      {/* Hero Section with Black Background - Edge to Edge */}
      <section className="relative bg-black text-white min-h-screen flex flex-col w-full">
        {/* Background Pattern/Texture */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black opacity-90 w-full"></div>

        {/* Content - Zero side margins, controlled inner spacing */}
        <div className="relative flex-1 flex flex-col justify-center items-center w-full">
          {/* Hero Text - Edge to edge with inner padding only */}
          <div className="text-center mb-8 lg:mb-12 w-full px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 lg:mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent leading-tight">
              Live Vehicle Bidding
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300 mb-6 lg:mb-8 max-w-4xl mx-auto">
              Compete for the best deals on premium vehicles. Place your bids and win your dream car
              at the right price.
            </p>
          </div>

          {/* Features Section - Full width edge to edge */}
          <div className="w-full px-4 sm:px-6 lg:px-8 mb-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 lg:p-6 border border-white/20 max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto">
                    <svg
                      className="w-6 h-6 text-orange-400"
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
                  <h3 className="text-lg font-semibold text-white">Competitive Bidding</h3>
                  <p className="text-sm text-gray-300">Get the best deals through auctions</p>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                    <svg
                      className="w-6 h-6 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Timed Auctions</h3>
                  <p className="text-sm text-gray-300">Limited time bidding windows</p>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto">
                    <svg
                      className="w-6 h-6 text-yellow-400"
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
                  <h3 className="text-lg font-semibold text-white">Win Premium Cars</h3>
                  <p className="text-sm text-gray-300">Access to exclusive vehicles</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Display - Full width with inner padding */}
          <div className="mb-6 w-full px-4 sm:px-6 lg:px-8">
            <p className="text-gray-300 text-center max-w-4xl mx-auto">
              {biddingVehicles.length === 0
                ? 'No active auctions at the moment.'
                : `${biddingVehicles.length} active auction${biddingVehicles.length === 1 ? '' : 's'} available for bidding`}
            </p>
          </div>
        </div>
      </section>

      {/* Vehicles Grid Section - Edge to Edge */}
      <section className="bg-white py-12 lg:py-16 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {biddingVehicles.length > 0 ? (
            <>
              <div className="mb-8 lg:mb-12 max-w-7xl mx-auto">
                <div className="text-center">
                  <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-3 lg:mb-4">
                    Active Auctions ({biddingVehicles.length})
                  </h2>
                  <p className="text-lg lg:text-xl text-gray-600">
                    Place your bids on these premium vehicles
                  </p>
                </div>
              </div>
              <div className="max-w-8xl mx-auto">
                <VehiclesGrid vehicles={biddingVehicles} />
              </div>
            </>
          ) : (
            <div className="text-center py-16 lg:py-20 max-w-4xl mx-auto">
              <div className="mx-auto w-20 lg:w-24 h-20 lg:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <svg
                  className="w-10 lg:w-12 h-10 lg:h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.897-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 lg:mb-4">
                No Active Bidding
              </h3>
              <p className="text-gray-600 mb-8 lg:mb-10 text-lg">
                There are currently no vehicles available for bidding. Check back soon or explore
                our buy now section.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/vehicles"
                  className="inline-flex items-center justify-center bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  View All Vehicles
                </Link>
                <Link
                  href="/buy-now"
                  className="inline-flex items-center justify-center border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-8 rounded-lg transition-all duration-200"
                >
                  Browse Buy Now
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
