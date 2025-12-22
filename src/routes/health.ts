import { Router, type Request, type Response } from "express";

const router = Router();

/**
 * Health check endpoint
 * - Useful for load balancers / uptime monitors
 * - Confirms the server process is alive
 */
router.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

export default router;