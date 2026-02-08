/*
  Warnings:

  - Added the required column `password` to the `Trainer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Trainer" ADD COLUMN     "password" TEXT NOT NULL;
