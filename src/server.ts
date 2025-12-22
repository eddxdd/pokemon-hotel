import "dotenv/config";
import app from "./app.js";

// Listen on environment, otherwise default to 4000
const PORT = Number(process.env.PORT) || 4000;

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});