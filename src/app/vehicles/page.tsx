import { Suspense } from 'react'
import { prisma } from '@/server/db/prisma'
import VehiclesGrid from '@/components/VehiclesGrid'
import VehicleFilters from '@/components/VehicleFilters'

interface SearchParams {
  make?: string
  model?: string
  year?: string
  type?: string
  minPrice?: string
  maxPrice?: string
  search?: string
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
  const { make, model, year, type, minPrice, maxPrice, search } = searchParams

  const where: VehicleWhereInput = {}

  if (make && make !== 'all') where.make = { contains: make }
  if (model && model !== 'all') where.model = { contains: model }
  if (year && year !== 'all') where.year = parseInt(year)
  if (type && type !== 'all') where.type = type as 'BUY_NOW' | 'BIDDING'
  if (minPrice || maxPrice) {
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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
            Browse Our Vehicles
          </h1>
          <p className="text-xl text-gray-300">
            Find your perfect vehicle from our extensive collection
          </p>
        </div>

        <VehicleFilters searchParams={resolvedSearchParams} filterOptions={filterOptions} />

        <div className="mb-6">
          <p className="text-gray-300">
            {vehicles.length === 0
              ? 'No vehicles found'
              : `${vehicles.length} vehicle${vehicles.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
          }
        >
          {vehicles.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-6 opacity-50">
                <svg
                  className="w-full h-full text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-white mb-2">No vehicles found</h3>
              <p className="text-gray-400">
                Try adjusting your search filters or browse all vehicles.
              </p>
            </div>
          ) : (
            <VehiclesGrid vehicles={vehicles} />
          )}
        </Suspense>
      </div>
    </div>
  )
}
