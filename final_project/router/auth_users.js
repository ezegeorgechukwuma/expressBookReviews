const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const SECRET_KEY = "mySecretKey";  

const isValid = (username) => { // returns boolean
  return username && username.length > 0;
};

const authenticatedUser = (username, password) => { // returns boolean
  // Check if user exists and password matches
  const user = users.find((user) => user.username === username);
  return user && user.password === password;
};

// JWT Session Authentication Middleware
const authenticateSessionJWT = (req, res, next) => {
  const sessionAuth = req.session && req.session.authorization;

  if (!sessionAuth) {
    return res.status(403).json({ message: "User not logged in" });
  }

  const token = sessionAuth.accessToken;

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // attach decoded user info to request
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// User Registration Route
regd_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if both username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Check if username already exists
  if (users.find((user) => user.username === username)) {
    return res.status(400).json({ message: "Username already exists." });
  }

  // If the username doesn't exist, register the new user
  users.push({ username, password });  // Store the user (in production, hash the password)

  // Respond with a success message
  return res.status(201).json({ message: "Customer successfully registered! Now you can login" });
});

// User Login Route
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Validate username and password
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Check if username and password are valid
  if (authenticatedUser(username, password)) {
    // Generate JWT token
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '60m' });

    // Save token to session
    req.session.authorization = {
      accessToken: token,
      username: username,
    };
    
    return res.status(200).send('Customer successfully logged in');

  } else {
    return res.status(401).json({ message: "Invalid username or password." });
  }
});

// Add or Update a Book Review
regd_users.put("/auth/review/:isbn", authenticateSessionJWT, (req, res) => {
  const { isbn } = req.params;
  const { review } = req.query;

  if (!review) {
    return res.status(400).json({ message: "Review is required." });
  }

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  try {
    // Add review under the user's username
    books[isbn].reviews = books[isbn].reviews || {};
    books[isbn].reviews[req.user.username] = review;

    return res.status(200).send(`The review for the book with ISBN ${isbn} has been added/updated`);
  } catch (error) {
    console.error("Error updating review:", error);
    return res.status(500).json({ message: "Failed to update review" });
  }
});

// Delete a Book Review
regd_users.delete("/auth/review/:isbn", authenticateSessionJWT, (req, res) => {
  const { isbn } = req.params;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  try {
    if (books[isbn].reviews && books[isbn].reviews[req.user.username]) {
      delete books[isbn].reviews[req.user.username];
      return res.status(200).send(`Review for the ISBN ${isbn} posted by the user test deleted.`);
    } else {
      return res.status(404).json({ message: "Review not found." });
    }
  } catch (error) {
    console.error("Error deleting review:", error);
    return res.status(500).json({ message: "Failed to delete review" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
