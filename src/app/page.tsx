import { prisma } from '@/server/db/prisma'
import Link from 'next/link'
import VehiclesGrid from '@/components/VehiclesGrid'

async function getFeaturedVehicles() {
  return prisma.vehicle.findMany({
    orderBy: { views: 'desc' },
    take: 6,
  })
}

export default async function HomePage() {
  const featuredVehicles = await getFeaturedVehicles()

  return (
    <div className="min-h-screen">
      {/* Hero Section with Black Background - Truly Edge to Edge */}
      <section className="relative bg-black text-white min-h-screen flex flex-col w-full">
        {/* Background Pattern/Texture */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black opacity-90 w-full"></div>

        {/* Content - Zero side margins, controlled inner spacing */}
        <div className="relative flex-1 flex flex-col justify-center items-center w-full">
          {/* Hero Text - Edge to edge with inner padding only */}
          <div className="text-center mb-8 lg:mb-12 w-full px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 lg:mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent leading-tight">
              Find Your Dream Car
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300 mb-6 lg:mb-8 max-w-4xl mx-auto">
              Buy now or bid on premium vehicles from trusted sellers
            </p>
          </div>

          {/* Search Bar - Full width edge to edge */}
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 lg:p-6 border border-white/20 max-w-7xl mx-auto">
              <form
                action="/vehicles"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4"
              >
                <div className="space-y-2 lg:col-span-1">
                  <label className="text-sm text-gray-300 block font-medium">Make</label>
                  <select
                    name="make"
                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="" className="bg-gray-900">
                      Any Make
                    </option>
                    <option value="Toyota" className="bg-gray-900">
                      Toyota
                    </option>
                    <option value="Honda" className="bg-gray-900">
                      Honda
                    </option>
                    <option value="BMW" className="bg-gray-900">
                      BMW
                    </option>
                    <option value="Mercedes" className="bg-gray-900">
                      Mercedes
                    </option>
                    <option value="Audi" className="bg-gray-900">
                      Audi
                    </option>
                  </select>
                </div>

                <div className="space-y-2 lg:col-span-1">
                  <label className="text-sm text-gray-300 block font-medium">Model</label>
                  <input
                    name="model"
                    placeholder="Any Model"
                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2 lg:col-span-1">
                  <label className="text-sm text-gray-300 block font-medium">Year</label>
                  <select
                    name="year"
                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="" className="bg-gray-900">
                      Any Year
                    </option>
                    <option value="2024" className="bg-gray-900">
                      2024
                    </option>
                    <option value="2023" className="bg-gray-900">
                      2023
                    </option>
                    <option value="2022" className="bg-gray-900">
                      2022
                    </option>
                    <option value="2021" className="bg-gray-900">
                      2021
                    </option>
                    <option value="2020" className="bg-gray-900">
                      2020
                    </option>
                  </select>
                </div>

                <div className="space-y-2 lg:col-span-1">
                  <label className="text-sm text-gray-300 block font-medium">Price Range</label>
                  <select
                    name="price"
                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="" className="bg-gray-900">
                      Any Price
                    </option>
                    <option value="0-2000000" className="bg-gray-900">
                      Under LKR 2M
                    </option>
                    <option value="2000000-5000000" className="bg-gray-900">
                      LKR 2M - 5M
                    </option>
                    <option value="5000000-10000000" className="bg-gray-900">
                      LKR 5M - 10M
                    </option>
                    <option value="10000000-" className="bg-gray-900">
                      Over LKR 10M
                    </option>
                  </select>
                </div>

                <div className="flex items-end sm:col-span-2 lg:col-span-1">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black"
                  >
                    Search Cars
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </section>

      {/* Featured Cars Section - Edge to Edge */}
      <section className="bg-white py-12 lg:py-16 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 lg:mb-12">
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-3 lg:mb-4">
              Featured Vehicles
            </h2>
            <p className="text-lg lg:text-xl text-gray-600">Most viewed cars this week</p>
          </div>

          {featuredVehicles.length > 0 ? (
            <>
              <VehiclesGrid vehicles={featuredVehicles} />
              <div className="text-center mt-12">
                <Link
                  href="/vehicles"
                  className="inline-flex items-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  Browse All Vehicles
                  <svg
                    className="ml-2 h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500">
              <p>No featured vehicles available at the moment.</p>
              <Link
                href="/vehicles"
                className="text-blue-600 hover:text-blue-700 underline mt-2 inline-block"
              >
                Browse all vehicles
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
