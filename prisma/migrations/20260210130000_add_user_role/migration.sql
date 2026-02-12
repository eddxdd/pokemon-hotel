-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('Trainer', 'admin');

-- AlterTable
ALTER TABLE "Trainer"
ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'Trainer';
