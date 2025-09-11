import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // Create demo user
  const hashedPassword = await bcrypt.hash('password123', 12)

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@automart.lk' },
    update: {},
    create: {
      email: 'demo@automart.lk',
      name: 'Demo User',
      password: hashedPassword,
      phone: '+94 77 123 4567',
      address: 'Colombo 03, Sri Lanka',
    },
  })

  // Create sample vehicles
  const vehicles = [
    {
      make: 'Toyota',
      model: 'Camry',
      year: 2022,
      price: 2500000,
      mileage: 15000,
      fuelType: 'Petrol',
      bodyType: 'Sedan',
      engineSize: '2.5L',
      color: 'Silver',
      transmission: 'Automatic',
      condition: 'Used',
      type: 'BUY_NOW' as const,
      description: 'Well-maintained Toyota Camry with excellent fuel economy',
      imageUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      specs: JSON.stringify({ airConditioning: true, powerSteering: true, abs: true }),
      ownerId: demoUser.id,
    },
    {
      make: 'Honda',
      model: 'Civic',
      year: 2021,
      price: 2200000,
      mileage: 25000,
      fuelType: 'Petrol',
      bodyType: 'Sedan',
      engineSize: '1.5L Turbo',
      color: 'White',
      transmission: 'CVT',
      condition: 'Used',
      type: 'BIDDING' as const,
      description: 'Reliable Honda Civic, perfect for daily commuting - Open for bidding',
      imageUrl: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      specs: JSON.stringify({ airConditioning: true, sunroof: true, cruiseControl: true }),
      ownerId: demoUser.id,
      biddingStart: new Date(),
      biddingEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
    {
      make: 'BMW',
      model: 'X5',
      year: 2023,
      price: 8500000,
      mileage: 5000,
      fuelType: 'Petrol',
      bodyType: 'SUV',
      engineSize: '3.0L Twin Turbo',
      color: 'Black',
      transmission: 'Automatic',
      condition: 'Certified Pre-owned',
      type: 'BUY_NOW' as const,
      description: 'Luxury SUV with premium features and low mileage',
      imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      specs: JSON.stringify({
        airConditioning: true,
        leatherSeats: true,
        navigationSystem: true,
        parkingAssist: true,
      }),
      ownerId: demoUser.id,
    },
    {
      make: 'Mercedes-Benz',
      model: 'C-Class',
      year: 2022,
      price: 4500000,
      mileage: 12000,
      fuelType: 'Petrol',
      bodyType: 'Sedan',
      engineSize: '2.0L Turbo',
      color: 'White',
      transmission: 'Automatic',
      condition: 'Used',
      type: 'BUY_NOW' as const,
      description: 'Elegant Mercedes-Benz C-Class with premium interior and advanced safety features',
      imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      specs: JSON.stringify({
        airConditioning: true,
        leatherSeats: true,
        navigationSystem: true,
        abs: true,
        powerSteering: true,
      }),
      ownerId: demoUser.id,
    },
    {
      make: 'Audi',
      model: 'A4',
      year: 2021,
      price: 3800000,
      mileage: 18000,
      fuelType: 'Petrol',
      bodyType: 'Sedan',
      engineSize: '2.0L TFSI',
      color: 'Gray',
      transmission: 'Automatic',
      condition: 'Used',
      type: 'BIDDING' as const,
      description: 'Sporty Audi A4 with quattro all-wheel drive - Perfect for enthusiasts',
      imageUrl: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      specs: JSON.stringify({
        airConditioning: true,
        leatherSeats: true,
        sunroof: true,
        navigationSystem: true,
        cruiseControl: true,
      }),
      ownerId: demoUser.id,
      biddingStart: new Date(),
      biddingEnd: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    },
    {
      make: 'Lexus',
      model: 'RX 350',
      year: 2023,
      price: 7200000,
      mileage: 8000,
      fuelType: 'Petrol',
      bodyType: 'SUV',
      engineSize: '3.5L V6',
      color: 'Blue',
      transmission: 'Automatic',
      condition: 'Certified Pre-owned',
      type: 'BUY_NOW' as const,
      description: 'Luxury Lexus RX 350 SUV with exceptional comfort and reliability',
      imageUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      specs: JSON.stringify({
        airConditioning: true,
        leatherSeats: true,
        navigationSystem: true,
        parkingAssist: true,
        cruiseControl: true,
        abs: true,
      }),
      ownerId: demoUser.id,
    },
  ]

  for (const vehicleData of vehicles) {
    await prisma.vehicle.create({
      data: vehicleData,
    })
  }

  console.log('Database seeded successfully!')
  console.log('Demo user created: demo@automart.lk / password123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async e => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
