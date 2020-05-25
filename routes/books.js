const express = require('express');
const router = express.Router();
const checkAcsses = require('../routes/chk_acsses');
const Book = require('../models/books');

// [GET]  http://localhost:3000/api/books/ - Show all books more as score 5. 
router.get('/', async (req, res)=>{
  try{ 
      const booklist = await Book.find( {score: {$gt: 5} }, {_id:1, title:1, score:1} );
      res.status(200).json(booklist);
  } catch(err) {
      res.status(400).json( {message: err.message} );
  }
});

// [GET] by ID = http://localhost:3000/api/books/id  - get info about book
router.get('/:id', checkAcsses, async (req, res)=>{
  try {
      const book = await Book.findById(req.params.id);
      res.json(book);
  } catch (err) {
      res.status(400).json( {message: err.message} );
  }
});

// [POST]  http://localhost:3000/api/books/add - add new book in DB
router.post('/add', checkAcsses, async (req, res)=>{
  //console.log(req);
  // Add new book in the MongoDB
  const addBook = new Book({
    title: req.body.title,
    author: req.body.author,
    isFinished: req.body.isFinished,
    note: req.body.note,
    score: 0
  });

  try {
      const addedBook = await addBook.save();
      res.status(200).json(addedBook);
  } catch (err) {
      res.status(400).json( {message: err.message} );
  }
});

// [PUT] ([PATCH]-only by id) by ID = http://localhost:3000/api/books/update/id  - change info in the book
router.put('/update/:id', checkAcsses, async (req, res)=>{
  try {
      const updatebook = await Book.updateOne({_id: req.params.id}, {$set: {note:req.body.note} });
      res.status(200).json(updatebook);
  } catch (err) {
      res.status(400).json( {message: err.message} );
  }
});

// [DELETE] delete book by ID http://localhost:3000/api/books/id
router.delete('/delete/:id', checkAcsses, async (req, res)=>{
   try{
      const deleteBook = await Book.deleteOne({_id: req.params.id});
      res.status(200).json(deleteBook); 
   } catch (err) {
      res.status(400).json( {message: err.message} );
   }
});

module.exports = router;
