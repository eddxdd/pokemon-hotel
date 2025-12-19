const app = require('./app');

// Listen on environment, otherwise default to 4000
const PORT = process.env.PORT || 4000;

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});