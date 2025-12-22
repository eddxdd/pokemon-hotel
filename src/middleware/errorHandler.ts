import type { NextFunction, Request, Response } from "express";

/**
 * Global error-handling middleware.
 *
 * Express automatically sends any error passed to `next(err)`
 * to this function (because it has 4 parameters).
 */
export default function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  /**
   * If the error is a normal JavaScript Error object,
   * we can safely read its message.
   */
  if (err instanceof Error) {
    /**
     * If this error has a `statusCode` property,
     * it means it was intentionally thrown (e.g. HttpError).
     */
    const statusCode =
      typeof (err as any).statusCode === "number"
        ? (err as any).statusCode
        : 500;

    return res.status(statusCode).json({
      error: err.message,
    });
  }

  /**
   * Fallback: something very unexpected was thrown
   * (string, number, object, etc.)
   */
  return res.status(500).json({
    error: "Internal server error",
  });
}