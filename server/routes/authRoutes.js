
// ========================================
// AUTHENTICATION ROUTES
// ========================================
// This file handles user registration and login

const express = require('express');
const bcrypt = require('bcryptjs'); //For hashing
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const authenticateToken = require('../middleware/authenticateToken');


// Creating a router to handle specific routes
const router = express.Router();



// ===========================================
// REGISTER ROUTE
// ===========================================
// POST /api/auth/register

// Sanitize string: trim and enforce max length
function trimMax(str, maxLen) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLen);
}

router.post('/register', async (req, res) => {
  try {
    // Getting data from request body (sanitize strings)
    let { name, email, password } = req.body;
    name = trimMax(name, 100);
    email = trimMax(email, 255).toLowerCase();

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
    if (password.length > 128) {
      return res.status(400).json({
        message: 'Password is too long'
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

    // Creating JSON Web Token (secure ID card that proves who the user is) signed with our secret key
    const token = jwt.sign(
      { userId: newUser.rows[0].id },  // what we wanna store in the token
      process.env.JWT_SECRET,          // Secret key to sign the token
      { expiresIn: '12h' }              // token expires in 12 hrs
    );


    // (Success) Returning the user info (without password) and the token
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.rows[0].id,
        name: newUser.rows[0].name,
        email: newUser.rows[0].email,
      },
      token: token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Error registering user'
    });
  }
});

// ========================================
// LOGIN ROUTE
// =======================================
// POST /api/auth/login
// Authenticating existing user

router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;
    email = trimMax(email, 255).toLowerCase();

    //Input validation
    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide the E-mail and password'
      });
    }
    if (password.length > 128) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    //Finding user in database
    const user = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    // In Case no user found with this email
    if (user.rows.length === 0) {
      return res.status(401).json({ 
        message: 'Invalid E-mail Address' 
      });
    }

    // Password checking
    // Compare provided password with the hashed password in db
    const validPassword = await bcrypt.compare(
      password, 
      user.rows[0].password
    );

    if (!validPassword) {
      return res.status(401).json({ 
        message: 'Invalid Password' 
      });
    }

    //Creating a JWT token
    const token = jwt.sign(
      { userId: user.rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }      // expires in 7 days
    );

    // Successful Login
    res.json({
      message: 'Login successful',
      user: {
        id: user.rows[0].id,
        name: user.rows[0].name,
        email: user.rows[0].email,
      },
      token: token
    });


  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Error logging in'
    });
  }
});





// ========================================
// CHANGE PASSWORD ROUTE
// =======================================
// PUT /api/auth/change-password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Please provide current and new password'
      });
    }
    if (typeof currentPassword !== 'string' || currentPassword.length > 128) {
      return res.status(400).json({ message: 'Invalid request' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'New password must be at least 6 characters long'
      });
    }
    if (newPassword.length > 128) {
      return res.status(400).json({ message: 'New password is too long' });
    }

    // Get user from database
    const user = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [req.userId]
    );

    // Verify current password
    const validPassword = await bcrypt.compare(
      currentPassword, 
      user.rows[0].password
    );

    if (!validPassword) {
      return res.status(401).json({ 
        message: 'Current password is incorrect' 
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password in database
    await pool.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, req.userId]
    );

    res.json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      message: 'Error changing password'
    });
  }
});




// ========================================
//     UPDATE PROFILE ROUTE
// =======================================
// PUT /api/auth/profile

router.put('/profile', authenticateToken, async (req, res) => {
  try {
    let { name, email } = req.body;
    name = trimMax(name, 100);
    email = trimMax(email, 255).toLowerCase();

    if (!name || !email) {
      return res.status(400).json({
        message: 'Name and email are required'
      });
    }

    // Checking email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: 'Please provide a valid email address'
      });
    }

    // Checking if email is already taken by another user
    const emailExists = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND id != $2',
      [email, req.userId]
    );

    if (emailExists.rows.length > 0) {
      return res.status(400).json({ 
        message: 'Email is already in use' 
      });
    }

    // Update user
    const updatedUser = await pool.query(
      'UPDATE users SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, name, email',
      [name, email, req.userId]
    );

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser.rows[0]
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      message: 'Error updating profile'
    });
  }
});


// ========================================
//      DELETE ACCOUNT ROUTE
// ========================================
// DELETE /api/auth/account
// Deletes user account and all associated applications

router.delete('/account', authenticateToken, async (req, res) => {
  try {
    const { password } = req.body;

    // Verifying password
    if (!password || typeof password !== 'string' || password.length > 128) {
      return res.status(400).json({
        message: 'Password is required to delete account'
      });
    }

    // getting user from database to verify password
    const user = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [req.userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    // verify password
    const validPassword = await bcrypt.compare(
      password, 
      user.rows[0].password
    );


    if (!validPassword) {
      return res.status(401).json({ 
        message: 'Incorrect password' 
      });
    }

    // Delete user , CASCADE automatically deletes all applications
    await pool.query(
      'DELETE FROM users WHERE id = $1',
      [req.userId]
    );

    res.json({
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      message: 'Error deleting account'
    });
  }
});


// Export the router so server.js can use it
module.exports = router;