-- AlterTable
ALTER TABLE "User" ADD COLUMN "address" TEXT;
ALTER TABLE "User" ADD COLUMN "phone" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Vehicle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "mileage" INTEGER NOT NULL,
    "fuelType" TEXT NOT NULL DEFAULT 'Petrol',
    "bodyType" TEXT NOT NULL DEFAULT 'Sedan',
    "engineSize" TEXT NOT NULL DEFAULT '2.0L',
    "color" TEXT NOT NULL DEFAULT 'White',
    "transmission" TEXT NOT NULL DEFAULT 'Automatic',
    "condition" TEXT NOT NULL DEFAULT 'Used',
    "imageUrl" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "specs" JSONB NOT NULL,
    "type" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "biddingStart" DATETIME,
    "biddingEnd" DATETIME,
    CONSTRAINT "Vehicle_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Vehicle" ("biddingEnd", "biddingStart", "createdAt", "description", "id", "imageUrl", "make", "mileage", "model", "ownerId", "price", "specs", "type", "updatedAt", "views", "year") SELECT "biddingEnd", "biddingStart", "createdAt", "description", "id", "imageUrl", "make", "mileage", "model", "ownerId", "price", "specs", "type", "updatedAt", "views", "year" FROM "Vehicle";
DROP TABLE "Vehicle";
ALTER TABLE "new_Vehicle" RENAME TO "Vehicle";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
