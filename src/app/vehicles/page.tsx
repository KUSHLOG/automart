import { Suspense } from 'react'
import { prisma } from '@/server/db/prisma'
import VehiclesGrid from '@/components/VehiclesGrid'
import VehicleFilters from '@/components/VehicleFilters'
import Link from 'next/link'

interface SearchParams {
  make?: string
  model?: string
  year?: string
  type?: string
  minPrice?: string
  maxPrice?: string
  search?: string
  price?: string // For homepage price range format like "2000000-5000000"
}

interface PageProps {
  searchParams: Promise<SearchParams>
}

interface VehicleWhereInput {
  make?: { contains: string }
  model?: { contains: string }
  year?: number
  type?: 'BUY_NOW' | 'BIDDING'
  price?: { gte?: number; lte?: number }
  OR?: Array<{
    make?: { contains: string }
    model?: { contains: string }
    description?: { contains: string }
  }>
}

async function getVehicles(searchParams: SearchParams) {
  const { make, model, year, type, minPrice, maxPrice, search, price } = searchParams

  const where: VehicleWhereInput = {}

  if (make && make !== 'all') where.make = { contains: make }
  if (model && model !== 'all') where.model = { contains: model }
  if (year && year !== 'all') where.year = parseInt(year)
  if (type && type !== 'all') where.type = type as 'BUY_NOW' | 'BIDDING'

  // Handle price range from homepage or individual min/max from filters
  if (price) {
    // Homepage price range format: "2000000-5000000" or "10000000-"
    where.price = {}
    if (price.includes('-')) {
      const [min, max] = price.split('-')
      if (min) where.price.gte = parseInt(min)
      if (max) where.price.lte = parseInt(max)
    }
  } else if (minPrice || maxPrice) {
    // Individual min/max from filters
    where.price = {}
    if (minPrice) where.price.gte = parseInt(minPrice)
    if (maxPrice) where.price.lte = parseInt(maxPrice)
  }

  if (search) {
    where.OR = [
      { make: { contains: search } },
      { model: { contains: search } },
      { description: { contains: search } },
    ]
  }

  return await prisma.vehicle.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 20, // Limit to 20 vehicles per page for better performance
  })
}

async function getFilterOptions() {
  const makes = await prisma.vehicle.groupBy({
    by: ['make'],
    _count: { make: true },
  })

  const years = await prisma.vehicle.groupBy({
    by: ['year'],
    _count: { year: true },
    orderBy: { year: 'desc' },
  })

  return {
    makes: makes.map((m: { make: string }) => m.make),
    years: years.map((y: { year: number }) => y.year),
  }
}

export default async function VehiclesPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams
  const vehicles = await getVehicles(resolvedSearchParams)
  const filterOptions = await getFilterOptions()

  return (
    <div className="min-h-screen">
      {/* Hero Section with Black Background - Same as Homepage */}
      <section className="relative bg-black text-white min-h-screen flex flex-col pt-8">
        {/* Background Pattern/Texture */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black opacity-90"></div>

        {/* Content */}
        <div className="relative flex-1 flex flex-col justify-center items-center w-full">
          {/* Hero Text - Edge to edge with inner padding only */}
          <div className="text-center mb-8 lg:mb-12 w-full px-4 sm:px-6 lg:px-8 mt-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 lg:mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent leading-tight">
              Browse All Vehicles
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300 mb-6 lg:mb-8 max-w-4xl mx-auto">
              Find your perfect vehicle from our extensive collection
            </p>
          </div>

          {/* Filter Section - Full width edge to edge */}
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 lg:p-6 border border-white/20 max-w-7xl mx-auto mb-6 lg:mb-8">
              <VehicleFilters searchParams={resolvedSearchParams} filterOptions={filterOptions} />
            </div>
          </div>

          {/* Status Display - Full width with inner padding and proper bottom spacing */}
          <div className="mb-6 w-full px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <p className="text-gray-300 text-center">
                {vehicles.length === 0
                  ? 'No vehicles found matching your criteria.'
                  : `Showing ${vehicles.length} vehicle${vehicles.length === 1 ? '' : 's'}`}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vehicles Grid Section - White Background like Homepage Featured Section */}
      <section className="bg-white py-12 lg:py-16 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Suspense
              fallback={
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading vehicles...</p>
                </div>
              }
            >
              {vehicles.length === 0 ? (
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
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No Vehicles Found</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    We couldn&apos;t find any vehicles matching your search criteria. Try adjusting
                    your filters or browse all available vehicles.
                  </p>
                  <Link
                    href="/vehicles"
                    className="inline-flex items-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
                  >
                    Reset Filters
                  </Link>
                </div>
              ) : (
                <VehiclesGrid vehicles={vehicles} />
              )}
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  )
}
