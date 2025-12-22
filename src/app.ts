import express from "express";
import pino from "pino";
import pinoHttp from "pino-http";

import healthRoutes from "./routes/health.js";
import hotelRoutes from "./routes/hotels.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

// App logger
// Must go before routes to log all requests
const logger = pino({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
});

// HTTP request logger middleware (logs every request)
app.use(
    pinoHttp({
        logger,
        customLogLevel: (res, err) => {
            if (err || res.statusCode >= 500) return 'error';
            if (res.statusCode >= 400) return 'warn';
            return 'info';
        },
    })
);

// Middleware to parse JSON bodies
app.use(express.json());

// Routes
app.use('/hotels', hotelRoutes);
app.use('/health', healthRoutes);

// Error catcher (must be AFTER routes!)
app.use(errorHandler);

export default app;