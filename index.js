console.log(`Starting a server... `);

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

//Use PARSER
app.use(bodyParser.json());
//Use folder uploads
app.use('/uploads', express.static('uploads'));

// ROUTING
const userRoute = require('./routes/users');
app.use('/api/', userRoute);
const booksRoute = require('./routes/books');
app.use('/api/books', booksRoute);

// Bad Url message
app.use('/', (req, res)=>{
  res.status(404).send('Bed request or error in url.  :(')
});

//Connect to DB
const DB_URL = 'mongodb+srv://***:***@cluster0-ebac5.mongodb.net/test?retryWrites=true&w=majority';
mongoose.connect(DB_URL, { useNewUrlParser:true, useUnifiedTopology: true },
 (err)=>{if (!err){console.log("Connected to DB! --------> Done!")} }
);

// Start the listning...
app.listen(3000, ()=>{console.log("SERVER IS RUNNING... URL= localhost:3000")});
module.exports = app;
