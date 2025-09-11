'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Vehicle as PrismaVehicle } from '@prisma/client'
import { memo } from 'react'

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  price: number
  mileage: number
  imageUrl: string
  description: string
  type: 'BUY_NOW' | 'BIDDING'
  views: number
  createdAt: Date
}

// Memoized vehicle card component for performance
const VehicleCard = memo(({ vehicle }: { vehicle: Vehicle }) => (
  <Link href={`/vehicles/${vehicle.id}`} className="group">
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100">
      {/* Car Image */}
      <div className="relative overflow-hidden">
        <Image
          src={vehicle.imageUrl || '/placeholder-car.svg'}
          alt={`${vehicle.make} ${vehicle.model}`}
          className="h-48 w-full object-cover group-hover:scale-110 transition-transform duration-300"
          width={400}
          height={200}
          loading="lazy"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Type Badge */}
        <div className="absolute top-4 left-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${vehicle.type === 'BIDDING' ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'
              }`}
          >
            {vehicle.type === 'BIDDING' ? 'Bidding' : 'Buy Now'}
          </span>
        </div>

        {/* Views Badge */}
        <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          {vehicle.views} views
        </div>
      </div>

      {/* Car Details */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h3>
          <p className="text-gray-500 text-sm mt-1">{vehicle.mileage.toLocaleString()} km</p>
        </div>

        {/* Price */}
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-green-600">
            LKR {vehicle.price.toLocaleString()}
          </span>
          <div className="text-sm text-gray-500">
            <svg
              className="w-4 h-4 inline mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            {vehicle.views}
          </div>
        </div>

        {/* Description Preview */}
        <p className="text-gray-600 text-sm mt-3 line-clamp-2">{vehicle.description}</p>
      </div>
    </div>
  </Link>
))

VehicleCard.displayName = 'VehicleCard'

function VehiclesGrid({ vehicles }: { vehicles: PrismaVehicle[] }) {
  // Filter to show BUY_NOW and BIDDING vehicles (exclude LIVE_AUCTION) and convert to our interface
  const validVehicles: Vehicle[] = vehicles
    .filter(v => v.type === 'BUY_NOW' || v.type === 'BIDDING')
    .map(v => ({
      id: v.id,
      make: v.make,
      model: v.model,
      year: v.year,
      price: v.price,
      mileage: v.mileage,
      imageUrl: v.imageUrl || '/placeholder-car.svg',
      description: v.description,
      type: v.type as 'BUY_NOW' | 'BIDDING',
      views: v.views,
      createdAt: v.createdAt,
    }))

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 w-full">
      {validVehicles.map(vehicle => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </div>
  )
}

export default VehiclesGrid
