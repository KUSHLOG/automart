import { prisma } from '@/server/db/prisma'
import { notFound } from 'next/navigation'
import Image from 'next/image'

async function getVehicle(id: string) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: { owner: true, bids: { include: { bidder: true }, orderBy: { amount: 'desc' } } },
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
  airConditioner?: boolean
  automaticTransmission?: boolean
  powerSteering?: boolean
  transmission?: string
  fuel?: string
  battery?: string
  [key: string]: unknown
}

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const vehicle = await getVehicle(id)
  const specs = vehicle.specs as VehicleSpecs
  const highestBid = vehicle.bids[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <Image
                src={vehicle.imageUrl}
                alt={`${vehicle.make} ${vehicle.model}`}
                className="w-full h-96 object-cover rounded-xl"
                width={600}
                height={400}
              />
            </div>

            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h1>
                <p className="text-2xl font-semibold text-green-400">
                  LKR {vehicle.price.toLocaleString()}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                <div>
                  <strong className="text-white">Mileage:</strong>{' '}
                  {vehicle.mileage.toLocaleString()} km
                </div>
                <div>
                  <strong className="text-white">Type:</strong> {vehicle.type.replace('_', ' ')}
                </div>
                <div>
                  <strong className="text-white">Views:</strong> {vehicle.views}
                </div>
                <div>
                  <strong className="text-white">Owner:</strong>{' '}
                  {vehicle.owner.name || vehicle.owner.email}
                </div>
              </div>

              {specs && (
                <div>
                  <h3 className="font-semibold text-white">Specifications:</h3>
                  <ul className="text-sm space-y-1 text-gray-300">
                    {specs.airConditioner && <li>• Air Conditioner</li>}
                    {specs.automaticTransmission && <li>• Automatic Transmission</li>}
                    {specs.powerSteering && <li>• Power Steering</li>}
                  </ul>
                </div>
              )}

              {vehicle.type === 'BIDDING' && (
                <div className="border border-gray-700 bg-gray-800/50 p-4 rounded-xl backdrop-blur-sm">
                  <h3 className="font-semibold mb-2 text-white">Bidding</h3>
                  {highestBid ? (
                    <p className="text-gray-300">
                      Highest bid:{' '}
                      <span className="text-green-400 font-semibold">
                        LKR {highestBid.amount.toLocaleString()}
                      </span>{' '}
                      by {highestBid.bidder.name}
                    </p>
                  ) : (
                    <p className="text-gray-300">No bids yet</p>
                  )}
                  <button className="mt-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg transition-all duration-200">
                    Place Bid
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2 text-white">Description</h3>
            <p className="text-gray-300">{vehicle.description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
