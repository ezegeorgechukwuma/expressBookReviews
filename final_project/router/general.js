const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Simulated async fetch function (like Axios would use)
const fetchBooks = () => {
  return new Promise((resolve, reject) => {
    resolve(books);
  });
};

// 1. Get the book list available in the shop using async-await
public_users.get('/', async function (req, res) {
  try {
    const allBooks = await fetchBooks(); 
    res.status(200).json({ books: allBooks });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch books." });
  }
});


// 2. Get book details based on ISBN using Promise
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

//   implementing promise method .then(..) to handle success and .catch(..) to handle failure
  fetchBooks().then((books) => {
    if (books[isbn]) {
      const bookWithIsbn = { ...books[isbn] };
      res.status(200).json(bookWithIsbn);
    } else {
      res.status(404).json({ message: "No book found for the given ISBN." });
    }
  }).catch(() => {
    res.status(500).json({ message: "Error retrieving book." });
  });
});

// 3. Get book details based on author using async-await
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;

  try {
    const bookData = await fetchBooks();
    const booksByAuthor = Object.entries(bookData)
      .filter(([_, book]) => book.author.toLowerCase() === author.toLowerCase())
      .map(([isbn, book]) => {
        const { author, ...bookWithoutAuthor } = book;
        return { isbn, ...bookWithoutAuthor };
      });

    if (booksByAuthor.length > 0) {
      res.status(200).json({ booksByAuthor });
    } else {
      res.status(404).json({ message: "No books found for the given author." });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to search books by author." });
  }
});


// 4. Get all books based on title using Promise
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
//   using  promise method .then(..) to handle success and .catch(..) to handle failure
  fetchBooks().then((bookData) => {
    const booksByTitle = Object.entries(bookData)
      .filter(([_, book]) => book.title.toLowerCase() === title.toLowerCase())
      .map(([isbn, book]) => {
        const { title, ...bookWithoutTitle } = book;
        return { isbn, ...bookWithoutTitle };
      });

    if (booksByTitle.length > 0) {
      res.status(200).json({ booksByTitle });
    } else {
      res.status(404).json({ message: "No books found for the given title." });
    }
  }).catch(() => {
    res.status(500).json({ message: "Error retrieving books by title." });
  });
});

// 5. Get book reviews using async-await
public_users.get('/review/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  try {
    const allBooks = await fetchBooks();

    if (allBooks[isbn]) {
      res.status(200).json(allBooks[isbn].reviews);
    } else {
      res.status(404).json({ message: "No book found for the given ISBN." });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve reviews." });
  }
});

module.exports.general = public_users;
