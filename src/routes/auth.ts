import { Router, type NextFunction, type Request, type Response } from "express";
import { z } from "zod";

import prisma from "../db/prisma.js";
import {
  hashPassword,
  comparePassword,
  generateToken,
  validatePassword,
} from "../utils/auth.js";

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
 * Register request body schema using Zod
 */
const registerSchema = z.object({
  username: z
    .string({ required_error: "Username is required" })
    .min(1, "Username is required")
    .trim()
    .refine((val) => val.length > 0, "Username cannot be empty"),
  email: z
    .string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email address")
    .trim()
    .toLowerCase(),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required"),
});

/**
 * Login request body schema using Zod
 */
const loginSchema = z.object({
  usernameOrEmail: z
    .string({ required_error: "Username or email is required" })
    .min(1, "Username or email is required")
    .trim(),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required"),
});

/**
 * POST /auth/register
 * Register a new trainer.
 */
router.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate input using Zod
      const validationResult = registerSchema.safeParse(req.body);

      if (!validationResult.success) {
        const errors = validationResult.error.errors.map((err) => err.message);
        throw new HttpError(errors.join(", "), 400);
      }

      const { username, email, password } = validationResult.data;

      // Validate password complexity
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        throw new HttpError(
          passwordValidation.errors.join(", "),
          400
        );
      }

      // Check if username already exists
      const existingUsername = await prisma.trainer.findUnique({
        where: { username },
      });

      if (existingUsername) {
        throw new HttpError("Username already exists", 409);
      }

      // Check if email already exists
      const existingEmail = await prisma.trainer.findUnique({
        where: { email },
      });

      if (existingEmail) {
        throw new HttpError("Email already exists", 409);
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create trainer in database
      const trainer = await prisma.trainer.create({
        data: {
          username,
          email,
          password: hashedPassword,
        },
        select: {
          id: true,
          username: true,
          email: true,
          level: true,
          experience: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Generate JWT token
      const token = generateToken({
        trainerId: trainer.id.toString(),
        username: trainer.username,
        email: trainer.email,
      });

      // Return token and trainer info (excluding password)
      res.status(201).json({
        token,
        trainer: {
          id: trainer.id,
          username: trainer.username,
          email: trainer.email,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /auth/login
 * Login an existing trainer.
 */
router.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate input using Zod
      const validationResult = loginSchema.safeParse(req.body);

      if (!validationResult.success) {
        const errors = validationResult.error.errors.map((err) => err.message);
        throw new HttpError(errors.join(", "), 400);
      }

      const { usernameOrEmail, password } = validationResult.data;

      // Find trainer by username or email
      // Check if it looks like an email (contains @)
      const isEmail = usernameOrEmail.includes("@");

      const trainer = await prisma.trainer.findUnique({
        where: isEmail
          ? { email: usernameOrEmail.toLowerCase().trim() }
          : { username: usernameOrEmail.trim() },
        select: {
          id: true,
          username: true,
          email: true,
          password: true,
        },
      });

      if (!trainer) {
        throw new HttpError("Invalid username/email or password", 401);
      }

      // Verify password
      const isPasswordValid = await comparePassword(password, trainer.password);

      if (!isPasswordValid) {
        throw new HttpError("Invalid username/email or password", 401);
      }

      // Generate JWT token
      const token = generateToken({
        trainerId: trainer.id.toString(),
        username: trainer.username,
        email: trainer.email,
      });

      // Return token and trainer info (excluding password)
      res.json({
        token,
        trainer: {
          id: trainer.id,
          username: trainer.username,
          email: trainer.email,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// Export the router so app.ts can mount it at /auth
export default router;

