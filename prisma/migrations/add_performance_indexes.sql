-- Performance optimization indexes for Auto Mart

-- Index for vehicle search by make, model, year
CREATE INDEX IF NOT EXISTS "idx_vehicle_make_model_year" ON "Vehicle"("make", "model", "year");

-- Index for vehicle type filtering (BUY_NOW vs BIDDING)
CREATE INDEX IF NOT EXISTS "idx_vehicle_type" ON "Vehicle"("type");

-- Index for vehicle price filtering
CREATE INDEX IF NOT EXISTS "idx_vehicle_price" ON "Vehicle"("price");

-- Index for vehicle creation date ordering
CREATE INDEX IF NOT EXISTS "idx_vehicle_created_at" ON "Vehicle"("createdAt" DESC);

-- Composite index for bids by vehicle and amount (for highest bid queries)
CREATE INDEX IF NOT EXISTS "idx_bid_vehicle_amount" ON "Bid"("vehicleId", "amount" DESC);

-- Index for bids by vehicle and creation date
CREATE INDEX IF NOT EXISTS "idx_bid_vehicle_created" ON "Bid"("vehicleId", "createdAt" DESC);

-- Index for user's bids
CREATE INDEX IF NOT EXISTS "idx_bid_bidder" ON "Bid"("bidderId", "createdAt" DESC);

-- Index for vehicle owner
CREATE INDEX IF NOT EXISTS "idx_vehicle_owner" ON "Vehicle"("ownerId");

-- Index for bidding time window queries
CREATE INDEX IF NOT EXISTS "idx_vehicle_bidding_window" ON "Vehicle"("biddingStart", "biddingEnd") WHERE "type" = 'BIDDING';

-- Composite index for vehicle search with type and price
CREATE INDEX IF NOT EXISTS "idx_vehicle_search_composite" ON "Vehicle"("type", "price", "createdAt" DESC);

-- Index for views (for popular vehicles)
CREATE INDEX IF NOT EXISTS "idx_vehicle_views" ON "Vehicle"("views" DESC);
