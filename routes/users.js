const router = require('express').Router();
const User = require('../models/users');
const Book = require('../models/books');
const mongoose = require('mongoose');
const checkAcsses = require('../routes/chk_acsses');
const nodemailer = require('nodemailer');
const multer = require('multer');
// Multer configuration
const storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, './uploads/');

  },
  filename: function(req, file, cb){
    cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
  }
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({
  storage: storage, 
  limits: {
    fileSize: 2 * 1024 * 1024
  },
  fileFilter: fileFilter
});

const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



// Validation schema
const inputData = Joi.object({
  name: Joi.string().min(6).required(),
  email: Joi.string().min(6).required().email(),
  password: Joi.string().min(6).required(),
  bookcase: Joi.array()
});

// [GET] localhost:3000/api/users
router.get('/users', checkAcsses,  async (req, res)=>{
  try{
    const userList = await User.find({}, {_id:1, name:1});
    res.status(200).json(userList);
  } catch(err) {
    res.status(400).json( {message: err.message} );
  }
});

// [GET] localhost:3000/api/users/id
router.get('/users/:id', checkAcsses, async (req, res)=>{
  try {
    const userInfo = await User.findById(req.params.id);
    res.status(200).json(userInfo);
  } catch(err) {
    res.status(400).json( {message: err.message} );
  }
});

// [GET] localhost:3000/api/users/:id/bookcase
router.get('/users/:id/bookcase', checkAcsses, async (req, res)=>{
  try{
    const userInfo = await User.findById(req.params.id);
    res.status(200).json(userInfo.bookcase);
  } catch(err) {
    res.status(400).json( {message: err.message} );
  }
});

// [GET] localhost:3000/api/users/bookcase/:id/author
router.get('/users/:id/bookcase/author', checkAcsses, async (req, res)=>{
  try{
    const userInfo = await User.findById(req.params.id);
    const authors = [];
    for (let i=0; i<userInfo.bookcase.length; i++){
      authors.push(userInfo.bookcase[i].bauthor);
    }
    res.status(200).json(authors);
  } catch(err) {
    res.status(400).json( {message: err.message} );
  }
});

// [GET] localhost:3000/api/users/:id/bookcase/isfinished
router.get('/users/:id/bookcase/isfinished', checkAcsses, async (req, res)=>{
  try{
    const userInfo = await User.findById(req.params.id);
    const status = [];
    for (let i=0; i<userInfo.bookcase.length; i++){
      status.push(`Book ${i}: ${userInfo.bookcase[i].btitle} is finished: ${userInfo.bookcase[i].bisfinished}`);
    };
    res.status(200).json(status);
  } catch(err) {
    res.status(400).json( {message: err.message} );
  }
});

// [PUT] Add book to bookcase. localhost:3000/api/users/:userid/addbook/:bookid
router.get('/users/:userid/addbook/:bookid', checkAcsses, async (req, res)=>{
  try{
    const user = await User.findById(req.params.userid);
    const book = await Book.findById(req.params.bookid);
  
    const addedbook = await User.update({_id: user._id}, {$push: {bookcase: {bid: book._id, btitle: book.title, bauthor: book.author, bisfinished: book.isFinished, bnote: book.note }}});               
    const updateBook = await Book.update({_id: book._id}, {$inc: {howManyAdded:1}});

    if (book.howManyAdded >= 2 && book.howManyAdded <= 4 ){ 
      const updateBook = await Book.update({_id: book._id}, {$set: {score:5}});
    };
    if (book.howManyAdded >= 5 && book.howManyAdded <= 6 ){ 
      const updateBook = await Book.update({_id: book._id}, {$set: {score:10}});
    };
    if (book.howManyAdded >= 7 ){ 
      const updateBook = await Book.update({_id: book._id}, {$set: {score:15}});
    };
    res.status(200).send(user);
  } catch(err) {
    res.status(400).json( {message: err.message} );
  }
});


// [POST] Upload image. localhost:3000/api/users/:userid/uploadavatar
router.post('/users/:userid/uploadavatar', upload.single('img'), async (req, res, next)=>{
  try{
    const file = req.file;
    const user = await User.findById(req.params.userid);
    if (!file){
       const error = new Error('Please upload a file');
    } else {
       const setavatar = await User.update(
         {_id: user._id}, 
        {$set: 
          { avatar: req.file.path.toString().replace(/\\/g, '/') } // <-- Only for serveW
        });
       //console.log(req.file.path);
        res.status(200).send(`File was saved.`);
       next(); 
    }
 } catch (err) {
    res.status(400).json( {message: err.message} );
 };
});

// [GET] Schow user avatar localhost:3000/api/users/:userid/uploadavatar
router.get('/users/:userid/avatar', async (req, res)=>{
  try{
      const user = await User.findById(req.params.userid);
      // res.status(200).send(`<a href="${req.protocol + "://" + req.headers.host + '/' + user.avatar}">Image</a>`);
      res.status(200).redirect(`${req.protocol + "://" + req.headers.host + '/' + user.avatar}`);
  } catch (err){
      res.status(400).json( {message: err.message} );
  }
});


// [POST] Set new password. localhost:3000/api/users/:userid/setpassword/:oldpass
router.put('/users/:userid/setpassword/:oldpass', async (req, res)=>{
  try {
      const user = await User.findById(req.params.userid);
      // console.log(req.params.oldpass);
      // console.log(user.password);
      const code = Date.now();
      //Validation password
       //const validPass = await bcrypt.compare(req.params.oldpass, user.password);
       //if(validPass){  
       if(req.params.oldpass === user.password){
        const savepassword = await User.updateOne({_id: user._id}, {$set: { codeid: code }});
      
        let transporter = await nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true, 
          auth: {
            user: "***@gmail.com", 
            pass: "***", 
          },
        });
  
        let info = await transporter.sendMail({
          from: '<***@gmail.com>', 
          to: user.email,
          subject: "Change the password - Book Accounting Systems", 
          text: "...", 
          html: `Hello <b>${user.name}</b>! <br/> You have canged the password. <br/> 
          Click on link for create new password LINK:<br/> 
          http://localhost:3000/api/users/${user._id}/setpassword/${code}/newpass`, 
        });
      
       res.status(200).json(`Code is saved in DB and sended on email UserID: ${user._id}`);
     } else { res.status(400).send('Wrong password.'); }
  } catch (err) {
      res.status(400).json( {message: err.message} ); 
  }
});

// [PUT] Update the password. localhost:3000/api/users/:userid/setpassword/:oldpass 
router.put('/users/:userid/setpassword/:idcod/:newpass', async (req, res)=>{
  try {
      const user = await User.findById(req.params.userid);
      if (req.params.idcod === user.codeid){
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(req.params.newpass, salt);
        const savepassword = await User.updateOne({_id: user._id}, {$set: { password: hash }});
        res.status(200).send('Password was updated.')
      } else {
        res.status(200).send('Wrong idcode.');
      }
  } catch (err) {
      res.status(400).json( {message: err.message} );
  }
});

// [POST] localhost:3000/api/register
router.post('/register', async (req, res)=>{
  
  // Validation data
  const {error} = await inputData.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Email validation
  const emailExist = await User.findOne( {email: req.body.email} );
  if (emailExist) return res.status(400).send(`Email: ${req.body.email} is exists`)
  
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hash,
    bookcase: req.body.bookcase,
  });

  try {/* SEND per email list of links of the Book Accounting System*/
    const addedUser = await user.save().then((ok, err)=>{
      if(err) return res.send("ERRORS by saving...");
    });

    let transporter = await nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, 
      auth: {
        user: "***@gmail.com", 
        pass: "***", 
      },
    });

    let info = await transporter.sendMail({
      from: '<***@gmail.com>', 
      to: req.body.email,//"sergeyfrend68@gmail.com", 
      subject: "Registration", 
      text: "...", 
      html: `Hello <b>${req.body.name}</b>!<br/> You are geristred in the Book Accounting System.<br/> List:<br>  Books: http://localhost:3000/api/books <br>  Users: http://localhost:3000/api/users`, 
    });
     
     res.status(200).send(`Message: User -> ${user.name} was registred and email sended.`);
  } catch(err) {
     res.status(400).send('Error by saving...');
  }
});

// [POST] LOGIN
router.post('/login', async (req, res)=>{
  const user = await User.findOne( {email: req.body.email});

  // Email check on existens
  if (!user) return res.status(400).send(`User not exists or wrong email.`)

  //PASSWORD is correct
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if(!validPass) return res.status(400).send('Invalid password.');
  
  // Create token
  const token = await jwt.sign({_id: user.id}, "mamba"); // Secret word bind with user.id
  res.header('user-token', token).status(200).send(`Logged in! As user: ${user.name}. Your token:  ${token}`);
  // OK
  
  
});

module.exports = router;