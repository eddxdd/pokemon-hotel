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
  log: ["warn", "error"],
}).$extends(
  withAccelerate({
    url: process.env.PRISMA_ACCELERATE_URL,
  })
);

export default prisma;