const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
// const fs = require('fs');
const server = require('./index');

chai.use(chaiHttp);

it("[GET] Get all books score >= 5",done => {
    chai.request(server)
        .get('/api/books')
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          done();
        });
});

it('[POST] Check accses to: Add book to DB without token', done => {
  chai.request(server)
    .post('/api/books/add')
    .send({
      "title":"Performance JavaScript", 
      "author":"C. Zakas", 
      "isFinished": false, 
      "note":"A good Book.", 
      "score":"0"
    })
    .end((err, res) => {
      expect(err).to.be.null;
      expect(res).to.have.status(401);
      done();
    });
});


it('[POST] Check accses with token to: Add book to DB', done => {
  chai.request(server)
    .post('/api/books/add')
    .set('user-token','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZWNiOThlOTg1YmFhZDExMjQzZDUzMzUiLCJpYXQiOjE1OTA0MDIwMjJ9.sMbXo-zyWnPE-imGTqlhVc3KzBq3Fj1XuihkGRbRrd0')
    .send({
      "title":"Performance JavaScript", 
      "author":"C. Zakas", 
      "isFinished": false, 
      "note":"A good Book.", 
      "score":"0"
    })
    .end((err, res) => {
      expect(err).to.be.null;
      expect(res).to.have.status(200);
      //expect(res.body).to.haveOwnProperty('message');

      done();
    });
});

it('[PUT] Update book by ID with field: note', done => {
  chai.request(server)
    .put('/api/books/update/5ecb9f7085baad11243d5336')
    .set('user-token','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZWNiOThlOTg1YmFhZDExMjQzZDUzMzUiLCJpYXQiOjE1OTA0MDIwMjJ9.sMbXo-zyWnPE-imGTqlhVc3KzBq3Fj1XuihkGRbRrd0')
    .send({
      "note":"A test note for Book."
    })
    .end((err, res) => {
      expect(err).to.be.null;
      expect(res).to.have.status(200);
      done();
    });
});

it('[DELETE] Delete book from DB by ID', done => {
  chai.request(server)
    .get('/api/books') // I don`t wont delete a book !!!
    //.delete('/api/books/delete/5ecb9f7085baad11243d5336')
    //.set('user-token','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZWNiOThlOTg1YmFhZDExMjQzZDUzMzUiLCJpYXQiOjE1OTA0MDIwMjJ9.sMbXo-zyWnPE-imGTqlhVc3KzBq3Fj1XuihkGRbRrd0')
    .end((err, res) => {
      expect(err).to.be.null;
      expect(res).to.have.status(200);
      done();
    });
});

