# Auto Mart - Vehicle- 📈 **View Tracking** for popular vehicle identification
- 💰 **Bidding System** with 7-day auction periods
- 📱 **Responsive Design** with Tailwind CSSarketplace

A Next.js-based vehicle marketplace with buy now and bidding features.

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Prisma** (SQLite for development)
- **NextAuth** (Credentials authentication)
- **Turbopack** (Fast bundling)

## Features

- 🔍 **Search & Filter** vehicles by make, model, year, and type
- 📊 **Featured 5** most viewed vehicles on homepage
- 🏷️ **Two Vehicle Types**:
  - Buy Now (immediate purchase)
  - Bidding (7-day auction)
- 👤 **User Authentication** with NextAuth
- 📈 **View Tracking** for popular vehicle identification
-  **Responsive Design** with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

1. Clone and install dependencies:

```bash
cd ~/Desktop/automart
npm install
```

2. Set up database:

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

3. Start development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Test Accounts

Use these credentials to sign in:

- **Email**: `john@example.com`
- **Password**: `password123`

- **Email**: `jane@example.com`
- **Password**: `password123`

## Project Structure

```
src/
├── app/
│   ├── (auth)/sign-in/          # Authentication pages
│   ├── vehicles/               # Vehicle listing & details
│   ├── api/                   # API routes
│   └── page.tsx              # Homepage
├── components/               # Reusable UI components
├── server/
│   ├── auth/                # NextAuth configuration
│   └── db/                  # Database client
└── types/                   # TypeScript definitions
```

## API Routes

- `GET /api/vehicles` - List vehicles with search
- `GET /api/vehicles/[id]` - Get vehicle details
- `PATCH /api/vehicles/[id]` - Update vehicle (view tracking)
- `POST /api/bids` - Place a bid on a vehicle

## Database Schema

- **User**: Authentication and profile
- **Vehicle**: Car listings with specs, pricing, and type
- **Bid**: Bidding records linked to users and vehicles
- **VehicleType**: Enum (BUY_NOW, BIDDING)

## Key Features Implemented

✅ Next.js with TypeScript and Tailwind CSS  
✅ Prisma with SQLite database  
✅ NextAuth credentials authentication  
✅ Search and filtering functionality  
✅ Featured 5 most viewed vehicles  
✅ View tracking system  
✅ Bidding system for auction vehicles  
✅ Responsive vehicle cards and layouts  
✅ API routes for all major operations

## Next Steps

- Add image upload functionality
- Add payment integration
- Deploy to Vercel/Railway
- Switch to PostgreSQL for production
- Add user reviews and ratings

## Development

The app uses Turbopack for fast development builds. All major features are functional including authentication, search, bidding, and view tracking.
