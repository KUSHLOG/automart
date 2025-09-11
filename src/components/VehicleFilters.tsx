'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
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
  const router = useRouter()
  const [formData, setFormData] = useState({
    search: searchParams.search || '',
    make: searchParams.make || 'all',
    model: searchParams.model || 'all',
    year: searchParams.year || 'all',
    type: searchParams.type || 'all',
    minPrice: searchParams.minPrice || '',
    maxPrice: searchParams.maxPrice || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Build search params
    const params = new URLSearchParams()
    if (formData.search && formData.search !== '') params.set('search', formData.search)
    if (formData.make && formData.make !== 'all') params.set('make', formData.make)
    if (formData.model && formData.model !== 'all') params.set('model', formData.model)
    if (formData.year && formData.year !== 'all') params.set('year', formData.year)
    if (formData.type && formData.type !== 'all') params.set('type', formData.type)
    if (formData.minPrice && formData.minPrice !== '') params.set('minPrice', formData.minPrice)
    if (formData.maxPrice && formData.maxPrice !== '') params.set('maxPrice', formData.maxPrice)

    // Navigate to current page with new search params
    const queryString = params.toString()
    router.push(`/vehicles${queryString ? `?${queryString}` : ''}`)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
        Search Vehicles
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4"
      >
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-300 mb-2">
            Search
          </label>
          <input
            type="text"
            id="search"
            name="search"
            value={formData.search}
            onChange={handleInputChange}
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
            value={formData.make}
            onChange={handleInputChange}
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
          <label htmlFor="model" className="block text-sm font-medium text-gray-300 mb-2">
            Model
          </label>
          <select
            id="model"
            name="model"
            value={formData.model}
            onChange={handleInputChange}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Models</option>
            <option value="A4" className="bg-gray-800">
              A4
            </option>
            <option value="C-Class" className="bg-gray-800">
              C-Class
            </option>
            <option value="Camry" className="bg-gray-800">
              Camry
            </option>
            <option value="Civic" className="bg-gray-800">
              Civic
            </option>
            <option value="RX 350" className="bg-gray-800">
              RX 350
            </option>
            <option value="X5" className="bg-gray-800">
              X5
            </option>
          </select>
        </div>

        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-300 mb-2">
            Year
          </label>
          <select
            id="year"
            name="year"
            value={formData.year}
            onChange={handleInputChange}
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
            value={formData.type}
            onChange={handleInputChange}
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
            value={formData.minPrice}
            onChange={handleInputChange}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Any Min Price</option>
            <option value="1000000" className="bg-gray-800">
              1M
            </option>
            <option value="2000000" className="bg-gray-800">
              2M
            </option>
            <option value="3000000" className="bg-gray-800">
              3M
            </option>
            <option value="5000000" className="bg-gray-800">
              5M
            </option>
            <option value="10000000" className="bg-gray-800">
              10M
            </option>
            <option value="15000000" className="bg-gray-800">
              15M
            </option>
            <option value="20000000" className="bg-gray-800">
              20M
            </option>
            <option value="30000000" className="bg-gray-800">
              30M
            </option>
            <option value="50000000" className="bg-gray-800">
              50M
            </option>
            <option value="75000000" className="bg-gray-800">
              75M
            </option>
            <option value="100000000" className="bg-gray-800">
              100M
            </option>
          </select>
        </div>

        <div>
          <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-300 mb-2">
            Max Price (LKR)
          </label>
          <select
            id="maxPrice"
            name="maxPrice"
            value={formData.maxPrice}
            onChange={handleInputChange}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Any Max Price</option>
            <option value="1000000" className="bg-gray-800">
              1M
            </option>
            <option value="2000000" className="bg-gray-800">
              2M
            </option>
            <option value="3000000" className="bg-gray-800">
              3M
            </option>
            <option value="5000000" className="bg-gray-800">
              5M
            </option>
            <option value="10000000" className="bg-gray-800">
              10M
            </option>
            <option value="15000000" className="bg-gray-800">
              15M
            </option>
            <option value="20000000" className="bg-gray-800">
              20M
            </option>
            <option value="30000000" className="bg-gray-800">
              30M
            </option>
            <option value="50000000" className="bg-gray-800">
              50M
            </option>
            <option value="75000000" className="bg-gray-800">
              75M
            </option>
            <option value="100000000" className="bg-gray-800">
              100M
            </option>
          </select>
        </div>

        <div className="col-span-2 md:col-span-3 lg:col-span-7 flex gap-4 pt-4">
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
