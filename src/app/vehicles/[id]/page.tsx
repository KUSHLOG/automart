import { prisma } from '@/server/db/prisma'
import { auth } from '@/server/auth/auth'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

async function getVehicle(id: string) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      owner: true,
      bids: {
        include: { bidder: true },
        orderBy: { amount: 'desc' },
      },
    },
  })

  if (!vehicle) notFound()

  // Increment view count
  await prisma.vehicle.update({
    where: { id },
    data: { views: { increment: 1 } },
  })

  return vehicle
}

interface VehicleSpecs {
  airConditioning?: boolean
  leatherSeats?: boolean
  sunroof?: boolean
  navigationSystem?: boolean
  parkingAssist?: boolean
  cruiseControl?: boolean
  powerSteering?: boolean
  abs?: boolean
  [key: string]: unknown
}

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const vehicle = await getVehicle(id)
  const session = await auth()
  const specs = vehicle.specs as VehicleSpecs
  const highestBid = vehicle.bids[0]

  // Check if user is signed in for contact details
  const showContactDetails = session && vehicle.type === 'BUY_NOW'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header with back link */}
          <div className="flex items-center space-x-4">
            <Link href="/vehicles" className="text-gray-400 hover:text-white transition-colors">
              ← Back to Vehicles
            </Link>
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Section */}
            <div className="space-y-4">
              <div className="relative">
                <Image
                  src={vehicle.imageUrl || '/placeholder-car.svg'}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-full h-96 object-cover rounded-xl shadow-2xl"
                  width={600}
                  height={400}
                />
                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="text-white text-sm font-medium">
                    {vehicle.type.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Gallery placeholder for future images */}
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className="aspect-square bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-center"
                  >
                    <span className="text-gray-500 text-xs">Image {i}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Details Section */}
            <div className="space-y-6">
              {/* Title and Price */}
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-white">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h1>
                <div className="flex items-center space-x-4">
                  <p className="text-3xl font-bold text-green-400">
                    LKR {vehicle.price.toLocaleString()}
                  </p>
                  <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                    {vehicle.condition}
                  </span>
                </div>
                <p className="text-gray-400 text-lg">{vehicle.description}</p>
              </div>

              {/* Key Details Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white border-b border-gray-700 pb-2">
                    Vehicle Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Brand:</span>
                      <span className="text-white font-medium">{vehicle.make}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Model:</span>
                      <span className="text-white font-medium">{vehicle.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Year:</span>
                      <span className="text-white font-medium">{vehicle.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Mileage:</span>
                      <span className="text-white font-medium">
                        {vehicle.mileage.toLocaleString()} km
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Color:</span>
                      <span className="text-white font-medium">{vehicle.color}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white border-b border-gray-700 pb-2">
                    Technical Specs
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Fuel Type:</span>
                      <span className="text-white font-medium">{vehicle.fuelType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Body Type:</span>
                      <span className="text-white font-medium">{vehicle.bodyType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Engine Size:</span>
                      <span className="text-white font-medium">{vehicle.engineSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Transmission:</span>
                      <span className="text-white font-medium">{vehicle.transmission}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Views:</span>
                      <span className="text-white font-medium">{vehicle.views}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features Section */}
              {specs && Object.keys(specs).some(key => specs[key]) && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white border-b border-gray-700 pb-2">
                    Features & Equipment
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {specs.airConditioning && (
                      <div className="flex items-center space-x-2 text-gray-300">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Air Conditioning</span>
                      </div>
                    )}
                    {specs.leatherSeats && (
                      <div className="flex items-center space-x-2 text-gray-300">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Leather Seats</span>
                      </div>
                    )}
                    {specs.sunroof && (
                      <div className="flex items-center space-x-2 text-gray-300">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Sunroof</span>
                      </div>
                    )}
                    {specs.navigationSystem && (
                      <div className="flex items-center space-x-2 text-gray-300">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Navigation System</span>
                      </div>
                    )}
                    {specs.parkingAssist && (
                      <div className="flex items-center space-x-2 text-gray-300">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Parking Assist</span>
                      </div>
                    )}
                    {specs.cruiseControl && (
                      <div className="flex items-center space-x-2 text-gray-300">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Cruise Control</span>
                      </div>
                    )}
                    {specs.powerSteering && (
                      <div className="flex items-center space-x-2 text-gray-300">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Power Steering</span>
                      </div>
                    )}
                    {specs.abs && (
                      <div className="flex items-center space-x-2 text-gray-300">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>ABS Brakes</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Contact Details or Bidding Section */}
              <div className="space-y-4">
                {vehicle.type === 'BUY_NOW' ? (
                  <div className="bg-gradient-to-r from-green-900/50 to-green-800/50 p-6 rounded-xl border border-green-700">
                    <h3 className="text-xl font-semibold text-white mb-4">Buy Now</h3>
                    {showContactDetails ? (
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-green-400 font-medium">Owner Contact Details:</h4>
                          <p className="text-white">{vehicle.owner.name || 'Vehicle Owner'}</p>
                          <p className="text-gray-300">{vehicle.owner.email}</p>
                          {vehicle.owner.phone && (
                            <p className="text-gray-300">Phone: {vehicle.owner.phone}</p>
                          )}
                          {vehicle.owner.address && (
                            <p className="text-gray-300">Address: {vehicle.owner.address}</p>
                          )}
                        </div>
                        <button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105">
                          Contact Owner
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-gray-300 mb-4">
                          Sign in to view contact details and purchase this vehicle
                        </p>
                        <Link
                          href={`/sign-in?callbackUrl=/vehicles/${vehicle.id}`}
                          className="inline-block bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                        >
                          Sign In to Contact Owner
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-blue-900/50 to-blue-800/50 p-6 rounded-xl border border-blue-700">
                    <h3 className="text-xl font-semibold text-white mb-4">Live Bidding</h3>
                    {highestBid ? (
                      <div className="space-y-2">
                        <p className="text-gray-300">
                          Current highest bid:{' '}
                          <span className="text-blue-400 font-bold text-xl">
                            LKR {highestBid.amount.toLocaleString()}
                          </span>
                        </p>
                        <p className="text-gray-400 text-sm">
                          by {highestBid.bidder.name || 'Anonymous'}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-300">No bids yet - be the first to bid!</p>
                    )}

                    {session ? (
                      <button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105">
                        Place Your Bid
                      </button>
                    ) : (
                      <Link
                        href={`/sign-in?callbackUrl=/vehicles/${vehicle.id}`}
                        className="block w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 text-center"
                      >
                        Sign In to Bid
                      </Link>
                    )}

                    {vehicle.biddingEnd && (
                      <p className="text-gray-400 text-sm mt-2 text-center">
                        Bidding ends: {new Date(vehicle.biddingEnd).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm border border-gray-700">
              <h4 className="text-white font-semibold mb-3">Safety & Security</h4>
              <div className="space-y-2 text-gray-300 text-sm">
                <p>• Vehicle history verified</p>
                <p>• Secure payment processing</p>
                <p>• Warranty information available</p>
              </div>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm border border-gray-700">
              <h4 className="text-white font-semibold mb-3">Inspection</h4>
              <div className="space-y-2 text-gray-300 text-sm">
                <p>• Pre-purchase inspection available</p>
                <p>• Test drive can be arranged</p>
                <p>• Professional vehicle assessment</p>
              </div>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm border border-gray-700">
              <h4 className="text-white font-semibold mb-3">Documentation</h4>
              <div className="space-y-2 text-gray-300 text-sm">
                <p>• Vehicle registration papers</p>
                <p>• Insurance transfer assistance</p>
                <p>• Service history records</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
