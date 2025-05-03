const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


// Get the book list available in the shop
public_users.get('/',function (req, res) {
    // retrives all the listed books
    res.send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    if (books[isbn]) {
        // Add the ISBN back into the response object
        const bookWithIsbn = { isbn, ...books[isbn] };
        return res.status(200).json(bookWithIsbn);
    } else {
        return res.status(404).json({ message: "No book found for the given ISBN." });
    }
});
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;

    // Filter books where the author matches (case-sensitive)
    const booksByAuthor = Object.entries(books)
             .filter(([isbn,book]) => book.author.toLowerCase() === author.toLowerCase())
             .map(([isbn, book]) => ({ isbn, ...book }));

    if (booksByAuthor.length > 0) {
        return res.status(200).json(booksByAuthor);
    } else {
        return res.status(404).json({ message: "No books found for the given author." });
    }
});


// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title =req.params.title;

     // Filter books where the author matches (case-sensitive)
     const booksByTitle = Object.entries(books)
        .filter(([isbn, book]) => book.title.toLowerCase() === title.toLowerCase())
        .map(([isbn, book]) => ({ isbn, ...book })); // Add the isbn back to the result
        
    if (booksByTitle.length > 0) {
        return res.status(200).json(booksByTitle);
    } else {
        return res.status(404).json({ message: "No books found for the given author." });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    
    // Check if the book exists
    if (books[isbn]) {
        // Return the reviews of the book
        return res.status(200).json(books[isbn].reviews);
    } else {
        return res.status(404).json({ message: "No book found for the given ISBN." });
    }
});

module.exports.general = public_users;
