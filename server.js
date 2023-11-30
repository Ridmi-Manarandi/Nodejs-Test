// server.js

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql/msnodesqlv8');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
console.log('JWT_SECRET:', process.env.JWT_SECRET);


const app = express();
const port = 3000;

// MSSQL configuration
const config = {
  driver: 'msnodesqlv8',
  connectionString: 'Driver={SQL Server Native Client 11.0};Server={ITELPTD083\\SQLEXPRESS02};Database={testdb};Trusted_Connection=yes;',
};

// Connect to the database
sql.connect(config, err => {
  if (err) console.error(err);
  else console.log('Connected to MSSQL database');
});

app.use(bodyParser.json());
app.post('/register', async (req, res) => {
    try {
      const { username, email, password } = req.body;
  
      // Perform validation, e.g., check if username or email already exists
  
      // Insert user into the database
      const result = await sql.query(`INSERT INTO Users (USERNAME, EMAIL, USERPASSWORD) VALUES ('${username}', '${email}', CONVERT(VARBINARY(64), HASHBYTES('SHA2_256', '${password}')))`);
  
      res.json({ success: true, message: 'User registered successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  });

// Function to compare hashed passwords
async function comparePasswords(enteredPassword, storedPassword) {
  return await bcrypt.compare(enteredPassword, storedPassword);
}

const jwtSecret = process.env.JWT_SECRET || 'default_secret_key';
app.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;
  
      // Retrieve user from the database
      const result = await sql.query`SELECT * FROM Users WHERE USERNAME = ${username}`;
  
      if (result.recordset.length === 0) {
        res.status(401).json({ success: false, message: 'Invalid username or password' });
      } else {
        const storedPasswordBuffer = result.recordset[0].USERPASSWORD;
  
        // Convert stored password to a hex-encoded string
        const storedPassword = Buffer.from(storedPasswordBuffer).toString('hex');
  
        // Convert the entered password to the same format
        const enteredPassword = crypto.createHash('sha256').update(password).digest('hex');
  
        // Compare the entered password with the stored hashed password
        const isPasswordValid = storedPassword === enteredPassword;
  
        if (isPasswordValid) {
          // Generate JWT token
          const token = jwt.sign({ username }, jwtSecret, { expiresIn: '1h' });
          res.json({ success: true, message: 'Login successful', token });
        } else {
          res.status(401).json({ success: false, message: 'Invalid username or password' });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  });
  app.get('/users', async (req, res) => {
    try {
      // Retrieve all users from the database
      const result = await sql.query`SELECT * FROM Users`;
      console.log(result.recordset);
  
      // Send the list of users in the response
      res.json({ success: true, users: result.recordset });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  });
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
