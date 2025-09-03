import Link from 'next/link'
import Image from 'next/image'
import { Vehicle as PrismaVehicle } from '@prisma/client'

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

export default function VehiclesGrid({ vehicles }: { vehicles: PrismaVehicle[] }) {
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
      imageUrl: v.imageUrl,
      description: v.description,
      type: v.type as 'BUY_NOW' | 'BIDDING',
      views: v.views,
      createdAt: v.createdAt,
    }))

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {validVehicles.map(v => (
        <Link key={v.id} href={`/vehicles/${v.id}`} className="group">
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100">
            {/* Car Image */}
            <div className="relative overflow-hidden">
              <Image
                src={v.imageUrl}
                alt={`${v.make} ${v.model}`}
                className="h-48 w-full object-cover group-hover:scale-110 transition-transform duration-300"
                width={400}
                height={200}
              />
              {/* Type Badge */}
              <div className="absolute top-4 left-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    v.type === 'BIDDING' ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'
                  }`}
                >
                  {v.type === 'BIDDING' ? 'Bidding' : 'Buy Now'}
                </span>
              </div>
              {/* Views Badge */}
              <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                {v.views} views
              </div>
            </div>

            {/* Car Details */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                    {v.year} {v.make} {v.model}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">{v.mileage.toLocaleString()} km</p>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-gray-900">
                  LKR {v.price.toLocaleString()}
                </div>
                <div className="flex items-center text-blue-600">
                  <span className="text-sm font-medium">View Details</span>
                  <svg
                    className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
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
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
