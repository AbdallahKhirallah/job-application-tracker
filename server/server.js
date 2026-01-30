// Importing  packages
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');


dotenv.config();

// Creating the Express app
const app = express();

// port
const PORT = process.env.PORT || 5000;

// middlewares
app.use(cors());              // to allow requests from the  React app
app.use(express.json());      // to parse JSON data from request bodies

// Test route to verify server is working
app.get('/', (req, res) => {
  res.json({ message: 'Job Tracker API running!' });
});

// Starting the server
app.listen(PORT,"127.0.0.1", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

