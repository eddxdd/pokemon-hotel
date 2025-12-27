// Router gives us an isolated group of routes under /hotels
// We import Request/Response/NextFunction only for typing (no runtime cost)
import { Router, type NextFunction, type Request, type Response } from "express";

// Prisma client instance (already configured with Accelerate)
import prisma from "../db/prisma.js";

// Create a new router instance
const router = Router();

/**
 * Simple custom error class.
 * We attach an HTTP status code so the global error handler
 * knows what status to return.
 */
class HttpError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Shape of the POST /hotels request body.
 * We use `unknown` first so we are forced to validate types
 * before trusting user input.
 */
type CreateHotelBody = {
  name?: unknown;
  city?: unknown;
  country?: unknown;
  biome?: unknown;
};

/**
 * GET /hotels
 * Returns a list of all hotels.
 */
router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const hotels = await prisma.hotel.findMany({
      // Explicit ordering makes results predictable
      orderBy: { id: "asc" },
    });

    res.json(hotels);
  } catch (err) {
    // Pass errors to the global error handler
    next(err);
  }
});

/**
 * GET /hotels/:id
 * Returns a single hotel by its numeric ID.
 */
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Convert the route param from string → number
    const hotelId = Number(req.params.id);

    // Guard against NaN or invalid numbers
    if (!Number.isFinite(hotelId)) {
      throw new HttpError("Invalid hotel ID", 400);
    }

    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
    });

    // If no hotel exists with that ID, return 404
    if (!hotel) {
      return res.status(404).json({ error: "Hotel not found" });
    }

    return res.json(hotel);
  } catch (err) {
    next(err);
    return; // Explicit return for TypeScript
  }
});

/**
 * POST /hotels
 * Creates a new hotel.
 */
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract fields from request body
    const { name, city, country, biome } = (req.body ?? {}) as CreateHotelBody;

    /**
     * Validate input:
     * - must exist
     * - must be strings
     * - must not be empty
     * - biome must be a valid BiomeType enum value
     */
    const validBiomes = [
      "BEACH",
      "MOUNTAIN",
      "FOREST",
      "DESERT",
      "OCEAN",
      "GRASSLAND",
      "CAVE",
      "URBAN",
    ] as const;

    const biomeUpper = typeof biome === "string" ? biome.toUpperCase() : "";

    if (
      typeof name !== "string" ||
      typeof city !== "string" ||
      typeof country !== "string" ||
      typeof biome !== "string" ||
      name.trim() === "" ||
      city.trim() === "" ||
      country.trim() === "" ||
      !validBiomes.includes(biomeUpper as (typeof validBiomes)[number])
    ) {
      throw new HttpError(
        "name, city, country, and biome (BEACH, MOUNTAIN, FOREST, DESERT, OCEAN, GRASSLAND, CAVE, URBAN) are required",
        400
      );
    }

    // Create the hotel in the database
    // Note: biome field will be available after prisma generate runs in Docker build
    const hotel = await prisma.hotel.create({
      data: {
        name: name.trim(),
        city: city.trim(),
        country: country.trim(),
        biome: biomeUpper as any, // Type assertion needed until Prisma client is regenerated
      } as any, // Temporary type assertion - will be fixed when Prisma client regenerates with biome field
    });

    // 201 = resource successfully created
    res.status(201).json(hotel);
  } catch (err) {
    next(err);
  }
});

// Export the router so app.ts can mount it at /hotels
export default router;