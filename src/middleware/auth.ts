import type { NextFunction, Request, Response } from "express";
import { verifyToken, type JwtPayload } from "../utils/auth.js";

/**
 * Extend Express Request type to include trainer information
 */
declare global {
  namespace Express {
    interface Request {
      trainer?: JwtPayload;
    }
  }
}

/**
 * Authentication middleware to verify JWT tokens.
 * Extracts the token from the Authorization header and verifies it.
 * If valid, attaches the trainer payload to req.trainer.
 * If invalid or missing, returns 401 Unauthorized.
 */
export default function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: "Authorization header is required",
      });
    }

    // Extract token from "Bearer <token>" format
    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        error: "Authorization header must be in format: Bearer <token>",
      });
    }

    const token = parts[1];

    // Verify and decode token
    try {
      const payload = verifyToken(token);
      // Attach trainer information to request object
      req.trainer = payload;
      next();
    } catch (error) {
      if (error instanceof Error) {
        return res.status(401).json({
          error: error.message,
        });
      }
      return res.status(401).json({
        error: "Invalid token",
      });
    }
  } catch (error) {
    next(error);
  }
}

