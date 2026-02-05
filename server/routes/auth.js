// ========================================
// AUTHENTICATION ROUTES
// ========================================
// This file handles user registration and login

const express = require('express');
const bcrypt = require('bcryptjs'); //For hashing
const jwt = require('jsonwebtoken');
const pool = require('../config/database');


// Creating a router to handle specific routes
const router = express.Router();



// ===========================================
// REGISTER ROUTE
// ===========================================
// POST /api/auth/register

router.post('/register', async (req, res) => {
  try {
    // Getting data from request body
    // frontend will send it as :{ name, email, password }
    const { name, email, password } = req.body;

    // Making sure all required fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Please provide Name, E-mail, and Password' 
      });
    }

    // Checking for e-mail validity using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Please provide a valid E-mail address' 
      });
    }

    // Checking for password strength At least 6 characters
    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Checking if user already exists
    // Query the database to see if this email is already registered
    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1' ,
      [email]
    );

    // If user is found with this email , they already have an account
    if (userExists.rows.length > 0) {
      return res.status(400).json({ 
        message: 'User with this email already exists' 
      });
    }

    // Password Hashing , salt rounds (how many times to hash)
    const salt = await bcrypt.genSalt(10); //10 : how many times to hash
    const hashedPassword = await bcrypt.hash(password, salt);

    // Inserting new user into database ($1, $2 , $3 are placeholders for the values array)
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [name, email, hashedPassword]
    );

    //  JWT token
    const token = jwt.sign(
      { userId: newUser.rows[0].id },  
      process.env.JWT_SECRET,         
      { expiresIn: '7d' }             
    );

    
    // (Success) Returning the user info (without password) and the token
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.rows[0].id ,
        name: newUser.rows[0].name,
        email: newUser.rows[0].email,
      },

      token: token
    });

  } catch (error) {
    console.error('Registration error:' , error);
    res.status(500).json({ 
      message: 'Error registering user',
      error: error.message 
    });
  }
});



// Export the router so server.js can use it
module.exports = router;