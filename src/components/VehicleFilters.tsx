'use client'

import Link from 'next/link'

interface SearchParams {
  make?: string
  model?: string
  year?: string
  type?: string
  minPrice?: string
  maxPrice?: string
  search?: string
}

interface VehicleFiltersProps {
  searchParams: SearchParams
  filterOptions: {
    makes: string[]
    years: number[]
  }
}

export default function VehicleFilters({ searchParams, filterOptions }: VehicleFiltersProps) {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
        Search Vehicles
      </h2>

      <form method="GET" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-300 mb-2">
            Search
          </label>
          <input
            type="text"
            id="search"
            name="search"
            defaultValue={searchParams.search || ''}
            placeholder="Search vehicles..."
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="make" className="block text-sm font-medium text-gray-300 mb-2">
            Make
          </label>
          <select
            id="make"
            name="make"
            defaultValue={searchParams.make || 'all'}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Makes</option>
            {filterOptions.makes.map(make => (
              <option key={make} value={make} className="bg-gray-800">
                {make}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-300 mb-2">
            Year
          </label>
          <select
            id="year"
            name="year"
            defaultValue={searchParams.year || 'all'}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Years</option>
            {filterOptions.years.map(year => (
              <option key={year} value={year} className="bg-gray-800">
                {year}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-2">
            Type
          </label>
          <select
            id="type"
            name="type"
            defaultValue={searchParams.type || 'all'}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="BUY_NOW" className="bg-gray-800">
              Buy Now Only
            </option>
            <option value="BIDDING" className="bg-gray-800">
              Bidding Only
            </option>
          </select>
        </div>

        <div>
          <label htmlFor="minPrice" className="block text-sm font-medium text-gray-300 mb-2">
            Min Price (LKR)
          </label>
          <select
            id="minPrice"
            name="minPrice"
            defaultValue={searchParams.minPrice || ''}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Any Min Price</option>
            <option value="1000000" className="bg-gray-800">1M</option>
            <option value="2000000" className="bg-gray-800">2M</option>
            <option value="3000000" className="bg-gray-800">3M</option>
            <option value="5000000" className="bg-gray-800">5M</option>
            <option value="10000000" className="bg-gray-800">10M</option>
            <option value="15000000" className="bg-gray-800">15M</option>
            <option value="20000000" className="bg-gray-800">20M</option>
            <option value="30000000" className="bg-gray-800">30M</option>
            <option value="50000000" className="bg-gray-800">50M</option>
            <option value="75000000" className="bg-gray-800">75M</option>
            <option value="100000000" className="bg-gray-800">100M</option>
          </select>
        </div>

        <div>
          <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-300 mb-2">
            Max Price (LKR)
          </label>
          <select
            id="maxPrice"
            name="maxPrice"
            defaultValue={searchParams.maxPrice || ''}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Any Max Price</option>
            <option value="1000000" className="bg-gray-800">1M</option>
            <option value="2000000" className="bg-gray-800">2M</option>
            <option value="3000000" className="bg-gray-800">3M</option>
            <option value="5000000" className="bg-gray-800">5M</option>
            <option value="10000000" className="bg-gray-800">10M</option>
            <option value="15000000" className="bg-gray-800">15M</option>
            <option value="20000000" className="bg-gray-800">20M</option>
            <option value="30000000" className="bg-gray-800">30M</option>
            <option value="50000000" className="bg-gray-800">50M</option>
            <option value="75000000" className="bg-gray-800">75M</option>
            <option value="100000000" className="bg-gray-800">100M</option>
          </select>
        </div>

        <div className="col-span-2 md:col-span-3 lg:col-span-6 flex gap-4 pt-4">
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black"
          >
            Search Vehicles
          </button>
          <Link
            href="/vehicles"
            className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200 font-semibold border border-white/20 inline-block text-center"
          >
            Clear Filters
          </Link>
        </div>
      </form>
    </div>
  )
}
