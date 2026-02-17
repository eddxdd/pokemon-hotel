/*
  Warnings:

  - You are about to drop the `BiomeSpawnRate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Booking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Hotel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PokemonCard` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PokemonEncounter` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Review` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Room` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TrainerCard` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BiomeSpawnRate" DROP CONSTRAINT "BiomeSpawnRate_cardId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_hotelId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_roomId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_trainerId_fkey";

-- DropForeignKey
ALTER TABLE "PokemonEncounter" DROP CONSTRAINT "PokemonEncounter_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "PokemonEncounter" DROP CONSTRAINT "PokemonEncounter_cardId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_hotelId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_trainerId_fkey";

-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_hotelId_fkey";

-- DropForeignKey
ALTER TABLE "TrainerCard" DROP CONSTRAINT "TrainerCard_cardId_fkey";

-- DropForeignKey
ALTER TABLE "TrainerCard" DROP CONSTRAINT "TrainerCard_trainerId_fkey";

-- AlterTable
ALTER TABLE "User" RENAME CONSTRAINT "Trainer_pkey" TO "User_pkey";

-- DropTable
DROP TABLE "BiomeSpawnRate";

-- DropTable
DROP TABLE "Booking";

-- DropTable
DROP TABLE "Hotel";

-- DropTable
DROP TABLE "PokemonCard";

-- DropTable
DROP TABLE "PokemonEncounter";

-- DropTable
DROP TABLE "Review";

-- DropTable
DROP TABLE "Room";

-- DropTable
DROP TABLE "TrainerCard";

-- DropEnum
DROP TYPE "BiomeType";

-- DropEnum
DROP TYPE "CardRarity";

-- CreateTable
CREATE TABLE "Biome" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Biome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pokemon" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "pokedexNumber" INTEGER NOT NULL,
    "type1" TEXT NOT NULL,
    "type2" TEXT,
    "evolutionStage" INTEGER NOT NULL,
    "fullyEvolved" BOOLEAN NOT NULL,
    "color" TEXT NOT NULL,
    "generation" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pokemon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PokemonSpawn" (
    "id" SERIAL NOT NULL,
    "pokemonId" INTEGER NOT NULL,
    "biomeId" INTEGER NOT NULL,
    "timeOfDay" TEXT NOT NULL,
    "spawnWeight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PokemonSpawn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Card" (
    "id" SERIAL NOT NULL,
    "tcgdexId" TEXT NOT NULL,
    "pokemonId" INTEGER NOT NULL,
    "pokemonName" TEXT NOT NULL,
    "setId" TEXT NOT NULL,
    "setName" TEXT NOT NULL,
    "rarity" TEXT NOT NULL,
    "tier" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageUrlLarge" TEXT,
    "isFloor" BOOLEAN NOT NULL DEFAULT false,
    "isCeiling" BOOLEAN NOT NULL DEFAULT false,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "biomeId" INTEGER NOT NULL,
    "timeOfDay" TEXT NOT NULL,
    "pokemonId" INTEGER NOT NULL,
    "guessesUsed" INTEGER,
    "tier" INTEGER,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "won" BOOLEAN NOT NULL DEFAULT false,
    "offeredCardIds" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guess" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "guessNum" INTEGER NOT NULL,
    "pokemonId" INTEGER NOT NULL,
    "feedback" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Guess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCard" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "cardId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,
    "obtained" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PokedexEntry" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "cardId" INTEGER NOT NULL,
    "discovered" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PokedexEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PityTracker" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "consecutiveTier6" INTEGER NOT NULL DEFAULT 0,
    "consecutiveTier5" INTEGER NOT NULL DEFAULT 0,
    "gamesWithoutCeiling" INTEGER NOT NULL DEFAULT 0,
    "hardPityCounter" INTEGER NOT NULL DEFAULT 0,
    "totalGames" INTEGER NOT NULL DEFAULT 0,
    "lastCeilingPull" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PityTracker_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Biome_name_key" ON "Biome"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Pokemon_name_key" ON "Pokemon"("name");

-- CreateIndex
CREATE INDEX "Pokemon_pokedexNumber_idx" ON "Pokemon"("pokedexNumber");

-- CreateIndex
CREATE INDEX "Pokemon_type1_idx" ON "Pokemon"("type1");

-- CreateIndex
CREATE INDEX "Pokemon_generation_idx" ON "Pokemon"("generation");

-- CreateIndex
CREATE INDEX "PokemonSpawn_biomeId_timeOfDay_idx" ON "PokemonSpawn"("biomeId", "timeOfDay");

-- CreateIndex
CREATE INDEX "PokemonSpawn_pokemonId_idx" ON "PokemonSpawn"("pokemonId");

-- CreateIndex
CREATE UNIQUE INDEX "PokemonSpawn_pokemonId_biomeId_timeOfDay_key" ON "PokemonSpawn"("pokemonId", "biomeId", "timeOfDay");

-- CreateIndex
CREATE UNIQUE INDEX "Card_tcgdexId_key" ON "Card"("tcgdexId");

-- CreateIndex
CREATE INDEX "Card_pokemonId_idx" ON "Card"("pokemonId");

-- CreateIndex
CREATE INDEX "Card_tier_idx" ON "Card"("tier");

-- CreateIndex
CREATE INDEX "Card_rarity_idx" ON "Card"("rarity");

-- CreateIndex
CREATE INDEX "Game_userId_idx" ON "Game"("userId");

-- CreateIndex
CREATE INDEX "Game_pokemonId_idx" ON "Game"("pokemonId");

-- CreateIndex
CREATE INDEX "Game_completed_idx" ON "Game"("completed");

-- CreateIndex
CREATE INDEX "Game_createdAt_idx" ON "Game"("createdAt");

-- CreateIndex
CREATE INDEX "Guess_gameId_idx" ON "Guess"("gameId");

-- CreateIndex
CREATE INDEX "Guess_pokemonId_idx" ON "Guess"("pokemonId");

-- CreateIndex
CREATE UNIQUE INDEX "UserCard_gameId_key" ON "UserCard"("gameId");

-- CreateIndex
CREATE INDEX "UserCard_userId_cardId_idx" ON "UserCard"("userId", "cardId");

-- CreateIndex
CREATE INDEX "UserCard_cardId_idx" ON "UserCard"("cardId");

-- CreateIndex
CREATE INDEX "PokedexEntry_userId_idx" ON "PokedexEntry"("userId");

-- CreateIndex
CREATE INDEX "PokedexEntry_cardId_idx" ON "PokedexEntry"("cardId");

-- CreateIndex
CREATE UNIQUE INDEX "PokedexEntry_userId_cardId_key" ON "PokedexEntry"("userId", "cardId");

-- CreateIndex
CREATE UNIQUE INDEX "PityTracker_userId_key" ON "PityTracker"("userId");

-- AddForeignKey
ALTER TABLE "PokemonSpawn" ADD CONSTRAINT "PokemonSpawn_pokemonId_fkey" FOREIGN KEY ("pokemonId") REFERENCES "Pokemon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PokemonSpawn" ADD CONSTRAINT "PokemonSpawn_biomeId_fkey" FOREIGN KEY ("biomeId") REFERENCES "Biome"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_pokemonId_fkey" FOREIGN KEY ("pokemonId") REFERENCES "Pokemon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_biomeId_fkey" FOREIGN KEY ("biomeId") REFERENCES "Biome"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_pokemonId_fkey" FOREIGN KEY ("pokemonId") REFERENCES "Pokemon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guess" ADD CONSTRAINT "Guess_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCard" ADD CONSTRAINT "UserCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCard" ADD CONSTRAINT "UserCard_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCard" ADD CONSTRAINT "UserCard_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PokedexEntry" ADD CONSTRAINT "PokedexEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PokedexEntry" ADD CONSTRAINT "PokedexEntry_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PityTracker" ADD CONSTRAINT "PityTracker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "Trainer_email_key" RENAME TO "User_email_key";

-- RenameIndex
ALTER INDEX "Trainer_username_key" RENAME TO "User_username_key";
