// user-service.js
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./user-model')

const app = express();
const port = 8001;

// Middleware to parse JSON in request body
app.use(express.json());

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/userdb';
mongoose.connect(mongoUri);



// Function to validate required fields in the request body
function validateRequiredFields(req, requiredFields) {
  for (const field of requiredFields) {
    if (!(field in req.body)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
}

// Function to validate the password
function validatePassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasNoSpaces = !/\s/.test(password);
  if(!hasUpperCase || !hasNumber || !hasNoSpaces || password.length < minLength){
    throw new Error(`Password error content: ${password}`);
  }
}

app.post('/adduser', async (req, res) => {
  try {
    // Check if required fields are present in the request body
    validateRequiredFields(req, ['username', 'password']);

    // Password security validation
    validatePassword(req.body.password);

    // Check if the username already exists
    let existingUser = await User.findOne({ username: req.body.username })
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Encrypt the password before saving it
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const newUser = new User({
      username: req.body.username,
      password: hashedPassword,
    });

    await newUser.save();
    res.json(newUser);
  } catch (error) {

    res.status(400).json({ error: error.message });
  }
});

app.post('/editUser', async (req, res) => {
  try {
    // Check if required fields are present in the request body
    validateRequiredFields(req, ['currentPassword', 'newPassword']);
    
    // Validates if the new password is secure
    validatePassword(req.body.newPassword);
    
    // Looks for a user with the given id
    const user = await User.findById(req.body.user.userId);
    if (!user)
      return res.status(404).json({ error: 'User not found' });
    
    // Checks if the current password is correct
    const passwordMatch = await bcrypt.compare(req.body.currentPassword, user.password);
    if (!passwordMatch)
      return res.status(401).json({ error: 'Incorrect current password' });

    // Encrypt the password before saving it
    const hashedNewPassword = await bcrypt.hash(req.body.newPassword, 10);
    
    // Updates the password in database
    user.password = hashedNewPassword;
    await user.save();

    res.json({ success: true });
    
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const server = app.listen(port, () => {
  console.log(`User Service listening at http://localhost:${port}`);
});

// Listen for the 'close' event on the Express.js server
server.on('close', () => {
  // Close the Mongoose connection
  mongoose.connection.close();
});

module.exports = server