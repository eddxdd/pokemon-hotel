const express = require('express');
const router = express.Router();

// Check to confirm if API is running OK
router.get('/', (req, res) => {
    res.json({status: 'OK'});
});

module.exports = router;