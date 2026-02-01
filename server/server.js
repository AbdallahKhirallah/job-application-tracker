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

// NEW TEST ROUTE:
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Test route working!',
    timestamp: new Date(),
    method: req.method,
    path: req.path
  });
});

// Starting the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

