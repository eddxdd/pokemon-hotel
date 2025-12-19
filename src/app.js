require('dotenv').config();
const express = require('express');
const hotelRoutes = require('./routes/hotels');
const healthRoutes = require('./routes/health');

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Routes
app.use('/hotels', hotelRoutes);
app.use('/health', healthRoutes);

module.exports = app;