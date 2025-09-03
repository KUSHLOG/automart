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
      type: 'BUY_NOW' as const,
      description: 'Well-maintained Toyota Camry with excellent fuel economy',
      imageUrl: '/placeholder-car.svg',
      specs: JSON.stringify({ engine: '2.5L', transmission: 'Automatic', fuel: 'Petrol' }),
      ownerId: demoUser.id,
    },
    {
      make: 'Honda',
      model: 'Civic',
      year: 2021,
      price: 2200000,
      mileage: 25000,
      type: 'BIDDING' as const,
      description: 'Reliable Honda Civic, perfect for daily commuting - Open for bidding',
      imageUrl: '/placeholder-car.svg',
      specs: JSON.stringify({ engine: '1.5L Turbo', transmission: 'CVT', fuel: 'Petrol' }),
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
      type: 'BUY_NOW' as const,
      description: 'Luxury SUV with premium features and low mileage',
      imageUrl: '/placeholder-car.svg',
      specs: JSON.stringify({
        engine: '3.0L Twin Turbo',
        transmission: 'Automatic',
        fuel: 'Petrol',
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
