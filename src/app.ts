import express from "express";
import pino from "pino";
import { pinoHttp } from "pino-http";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import healthRoutes from "./routes/health.js";
import hotelRoutes from "./routes/hotels.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

// App logger
// Must go before routes to log all requests
const logger = pino({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
});

// Security middleware - Helmet helps secure Express apps by setting HTTP headers
app.use(helmet());

// CORS configuration - allows frontend to make requests
const corsOptions = {
    origin: process.env.FRONTEND_URL || process.env.CORS_ORIGIN || '*',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting - protect against brute force attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Limit each IP to 100 requests per windowMs in production
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// HTTP request logger middleware (logs every request)
app.use(
    pinoHttp({
        logger,
        customLogLevel: (res, err) => {
            const statusCode = res.statusCode ?? 200;
            if (err || statusCode >= 500) return 'error';
            if (statusCode >= 400) return 'warn';
            return 'info';
        },
    })
);

// Middleware to parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/hotels', hotelRoutes);
app.use('/health', healthRoutes);

// Error catcher (must be AFTER routes!)
app.use(errorHandler);

export default app;