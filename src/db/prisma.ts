import { PrismaClient } from "../generated/prisma/client.js";
import { withAccelerate } from "@prisma/extension-accelerate";

/**
 * Create a single PrismaClient instance.
 *
 * - Uses Prisma Accelerate for runtime queries
 * - Reads the Accelerate URL from PRISMA_ACCELERATE_URL
 * - Logs warnings and errors only (keeps noise low)
 */
const prisma = new PrismaClient({
  accelerateUrl: process.env.PRISMA_ACCELERATE_URL!,
  log: ["warn", "error"],
}).$extends(withAccelerate());

export default prisma;