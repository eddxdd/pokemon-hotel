/*
  Warnings:

  - Added the required column `biome` to the `Hotel` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BiomeType" AS ENUM ('BEACH', 'MOUNTAIN', 'FOREST', 'DESERT', 'OCEAN', 'GRASSLAND', 'CAVE', 'URBAN');

-- CreateEnum
CREATE TYPE "CardRarity" AS ENUM ('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY');

-- AlterTable
ALTER TABLE "Hotel" ADD COLUMN     "biome" "BiomeType" NOT NULL,
ADD COLUMN     "description" TEXT;

-- CreateTable
CREATE TABLE "Trainer" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trainer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" SERIAL NOT NULL,
    "hotelId" INTEGER NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "pricePerNight" DECIMAL(10,2) NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" SERIAL NOT NULL,
    "trainerId" INTEGER NOT NULL,
    "hotelId" INTEGER NOT NULL,
    "roomId" INTEGER NOT NULL,
    "checkIn" TIMESTAMP(3) NOT NULL,
    "checkOut" TIMESTAMP(3) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PokemonCard" (
    "id" SERIAL NOT NULL,
    "pokemonName" TEXT NOT NULL,
    "pokedexNumber" INTEGER NOT NULL,
    "rarity" "CardRarity" NOT NULL,
    "imageUrl" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PokemonCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainerCard" (
    "id" SERIAL NOT NULL,
    "trainerId" INTEGER NOT NULL,
    "cardId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "obtainedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainerCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BiomeSpawnRate" (
    "id" SERIAL NOT NULL,
    "cardId" INTEGER NOT NULL,
    "biome" "BiomeType" NOT NULL,
    "spawnChance" DECIMAL(5,4) NOT NULL,
    "minLevel" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BiomeSpawnRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PokemonEncounter" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "cardId" INTEGER NOT NULL,
    "rarity" "CardRarity" NOT NULL,
    "encounteredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PokemonEncounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" SERIAL NOT NULL,
    "senderId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "senderCardId" INTEGER NOT NULL,
    "receiverCardId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Trainer_username_key" ON "Trainer"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Trainer_email_key" ON "Trainer"("email");

-- CreateIndex
CREATE INDEX "Room_hotelId_idx" ON "Room"("hotelId");

-- CreateIndex
CREATE UNIQUE INDEX "Room_hotelId_roomNumber_key" ON "Room"("hotelId", "roomNumber");

-- CreateIndex
CREATE INDEX "Booking_trainerId_idx" ON "Booking"("trainerId");

-- CreateIndex
CREATE INDEX "Booking_hotelId_idx" ON "Booking"("hotelId");

-- CreateIndex
CREATE INDEX "Booking_checkIn_checkOut_idx" ON "Booking"("checkIn", "checkOut");

-- CreateIndex
CREATE INDEX "PokemonCard_pokedexNumber_idx" ON "PokemonCard"("pokedexNumber");

-- CreateIndex
CREATE INDEX "PokemonCard_rarity_idx" ON "PokemonCard"("rarity");

-- CreateIndex
CREATE UNIQUE INDEX "PokemonCard_pokemonName_rarity_key" ON "PokemonCard"("pokemonName", "rarity");

-- CreateIndex
CREATE INDEX "TrainerCard_trainerId_idx" ON "TrainerCard"("trainerId");

-- CreateIndex
CREATE INDEX "TrainerCard_cardId_idx" ON "TrainerCard"("cardId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainerCard_trainerId_cardId_key" ON "TrainerCard"("trainerId", "cardId");

-- CreateIndex
CREATE INDEX "BiomeSpawnRate_biome_idx" ON "BiomeSpawnRate"("biome");

-- CreateIndex
CREATE INDEX "BiomeSpawnRate_cardId_idx" ON "BiomeSpawnRate"("cardId");

-- CreateIndex
CREATE UNIQUE INDEX "BiomeSpawnRate_cardId_biome_key" ON "BiomeSpawnRate"("cardId", "biome");

-- CreateIndex
CREATE INDEX "PokemonEncounter_bookingId_idx" ON "PokemonEncounter"("bookingId");

-- CreateIndex
CREATE INDEX "PokemonEncounter_cardId_idx" ON "PokemonEncounter"("cardId");

-- CreateIndex
CREATE INDEX "PokemonEncounter_encounteredAt_idx" ON "PokemonEncounter"("encounteredAt");

-- CreateIndex
CREATE INDEX "Trade_senderId_idx" ON "Trade"("senderId");

-- CreateIndex
CREATE INDEX "Trade_receiverId_idx" ON "Trade"("receiverId");

-- CreateIndex
CREATE INDEX "Trade_status_idx" ON "Trade"("status");

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "Hotel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerCard" ADD CONSTRAINT "TrainerCard_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerCard" ADD CONSTRAINT "TrainerCard_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "PokemonCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BiomeSpawnRate" ADD CONSTRAINT "BiomeSpawnRate_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "PokemonCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PokemonEncounter" ADD CONSTRAINT "PokemonEncounter_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PokemonEncounter" ADD CONSTRAINT "PokemonEncounter_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "PokemonCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "Trainer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "Trainer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
