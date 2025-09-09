// Basic vehicle types without Prisma dependencies
export interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  price: number
  mileage: number
  fuelType: string
  bodyType: string
  engineSize: string
  color: string
  transmission: string
  condition: string
  imageUrl: string
  description: string
  type: 'BUY_NOW' | 'BIDDING'
  views: number
  createdAt: Date
  updatedAt: Date
  ownerId: string
}

export interface User {
  id: string
  email: string
  name: string | null
  phone: string | null
  address: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Bid {
  id: string
  amount: number
  createdAt: Date
  vehicleId: string
  bidderId: string
}

export interface VehicleWithOwnerAndBids extends Vehicle {
  owner: User
  bids: (Bid & { bidder: User })[]
}

export interface VehicleWithBids extends Vehicle {
  bids: Bid[]
}

export interface BidWithVehicle extends Bid {
  vehicle: Vehicle
}

export interface UserWithVehicles extends User {
  vehicles: Vehicle[]
}

export interface SearchParams {
  make?: string
  model?: string
  year?: string
  type?: string
}
