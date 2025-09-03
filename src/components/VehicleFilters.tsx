'use client'

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
              Buy Now
            </option>
            <option value="BIDDING" className="bg-gray-800">
              Bidding
            </option>
          </select>
        </div>

        <div>
          <label htmlFor="minPrice" className="block text-sm font-medium text-gray-300 mb-2">
            Min Price
          </label>
          <input
            type="number"
            id="minPrice"
            name="minPrice"
            defaultValue={searchParams.minPrice || ''}
            placeholder="$0"
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-300 mb-2">
            Max Price
          </label>
          <input
            type="number"
            id="maxPrice"
            name="maxPrice"
            defaultValue={searchParams.maxPrice || ''}
            placeholder="$100000"
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="col-span-2 md:col-span-3 lg:col-span-6 flex gap-4 pt-4">
          <button
            type="submit"
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
          >
            Search Vehicles
          </button>
          <button
            type="button"
            onClick={() => (window.location.href = '/vehicles')}
            className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200 font-medium border border-white/20"
          >
            Clear Filters
          </button>
        </div>
      </form>
    </div>
  )
}
