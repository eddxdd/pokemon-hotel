const express = require('express');
const router = express.Router();

// Testable in-memory "database"
let hotels = [
    { id: 1, name: 'Test Hotel', city: 'Toronto', country: 'Canada' },
];

// GET /hotels - return all hotels
router.get('/', (req, res) => {
    res.json(hotels);
});

// GET a single hotel by ID
router.get('/:id', (req, res) => {
    const hotelId = Number(req.params.id); // Params come as strings
    const hotel = hotels.find(h => h.id === hotelId);

    if (!hotel) {
        return res.status(404).json({ error: 'Hotel not found' });
    }

    res.json(hotel);
});

// POST /hotels - add a new hotel
router.post('/', (req, res) => { 
    const { name, city, country } = req.body;

    // Basic validation, so we don't take in empty data
    if (!name || !city || !country) {
        return res.status(400).json({ error: 'Name, city, and country are required!' });
    }

    const newHotel = {
        id: hotels.length + 1, // Simple ID generation
        name,
        city,
        country
    };  

    hotels.push(newHotel);
    res.status(201).json(newHotel);
});

module.exports = router;