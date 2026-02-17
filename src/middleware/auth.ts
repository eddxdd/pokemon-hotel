import type { NextFunction, Request, Response } from "express";
import { verifyToken, type JwtPayload } from "../utils/auth.js";

/**
 * Extend Express Request type to include user information
 */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Authentication middleware to verify JWT tokens.
 * Extracts the token from the Authorization header and verifies it.
 * If valid, attaches the user payload to req.user.
 * If invalid or missing, returns 401 Unauthorized.
 */
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Response | void {
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
      // Attach user information to request object
      req.user = payload;
      next();
      return;
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

/**
 * Middleware to require admin role.
 * Must be used after authenticate() middleware.
 */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Response | void {
  if (!req.user) {
    return res.status(401).json({
      error: "Authentication required",
    });
  }  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      error: "Admin access required",
    });
  }

  next();
}// Default export for backward compatibility
export default authenticate;
