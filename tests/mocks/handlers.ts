import { http, HttpResponse } from 'msw'

const mockVehicles = [
  {
    id: 'v1',
    make: 'Toyota',
    model: 'Corolla',
    year: 2017,
    price: 5400000,
    mileage: 62000,
    imageUrl: 'https://images.unsplash.com/photo-1549924231-f129b911e442',
    description: 'Reliable sedan in good condition.',
    specs: { airConditioner: true, transmission: 'Automatic', fuel: 'Petrol' },
    type: 'BUY_NOW',
    views: 45,
    createdAt: new Date('2025-08-01').toISOString(),
    updatedAt: new Date('2025-08-01').toISOString(),
    ownerId: 'user1',
  },
  {
    id: 'v2',
    make: 'Honda',
    model: 'Civic',
    year: 2019,
    price: 7450000,
    mileage: 41000,
    imageUrl: 'https://images.unsplash.com/photo-1519648023493-d82b5f8d7fd5',
    description: 'Sporty hatchback with great mileage.',
    specs: { airConditioner: true, transmission: 'Manual', fuel: 'Petrol' },
    type: 'BIDDING',
    views: 32,
    createdAt: new Date('2025-08-15').toISOString(),
    updatedAt: new Date('2025-08-15').toISOString(),
    ownerId: 'user1',
    biddingStart: new Date('2025-09-01').toISOString(),
    biddingEnd: new Date('2025-09-08').toISOString(),
  },
]

const mockUser = {
  id: 'user1',
  email: 'demo@automart.lk',
  name: 'Demo User',
}

export const handlers = [
  // Vehicles API
  http.get('/api/vehicles', ({ request }) => {
    const url = new URL(request.url)
    const make = url.searchParams.get('make')
    const model = url.searchParams.get('model')
    const year = url.searchParams.get('year')
    const type = url.searchParams.get('type')

    let filtered = mockVehicles

    if (make) {
      filtered = filtered.filter(v => v.make.toLowerCase().includes(make.toLowerCase()))
    }
    if (model) {
      filtered = filtered.filter(v => v.model.toLowerCase().includes(model.toLowerCase()))
    }
    if (year) {
      filtered = filtered.filter(v => v.year === parseInt(year))
    }
    if (type) {
      filtered = filtered.filter(v => v.type === type)
    }

    return HttpResponse.json(filtered)
  }),

  http.get('/api/vehicles/:id', ({ params }) => {
    const vehicle = mockVehicles.find(v => v.id === params.id)
    if (!vehicle) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return HttpResponse.json({
      ...vehicle,
      owner: mockUser,
      bids: [
        {
          id: 'bid1',
          amount: 7500000,
          createdAt: new Date().toISOString(),
          bidder: { name: 'John Doe', email: 'john@example.com' },
        },
      ],
    })
  }),

  // Track view API
  http.post('/api/track/view', () => {
    return HttpResponse.json({ ok: true })
  }),

  // Bids API
  http.post('/api/bids', async ({ request }) => {
    const formData = await request.formData()
    const vehicleId = formData.get('vehicleId')
    const amount = formData.get('amount')

    if (!vehicleId || !amount) {
      return HttpResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    return HttpResponse.json({ ok: true })
  }),

  // Auth API
  http.get('/api/auth/session', () => {
    return HttpResponse.json({ user: null })
  }),
]
