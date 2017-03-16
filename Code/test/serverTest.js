//During the test the env variable is set to test
// BASED ON: https://scotch.io/tutorials/test-a-node-restful-api-with-mocha-and-chai
process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let User = require('../app/models/user');

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();
let expect = chai.expect;


chai.use(chaiHttp);

//Our parent block
describe('Server', () => {
  console.log("Testing server")
  // beforeEach((done) => { //Before each test we empty the database
  //   Book.remove({}, (err) => {
  //     done();
  //   });
  // });
  /*
   * Test the /GET route
   */
  describe('/AUTHENTICATE user', () => {
    it('it should AUTHENTICATE a user and return success with a token', (done) => {
      let user = {
        name: "test202",
        password: "test202"
      };
      chai.request(server)
        .post('/api/authenticate')
        .send(user)
        .end((err, res) => {
          res.body.should.have.property('success');
          res.body.should.have.property('token');
          res.body.should.have.property('success').eql(true);
          expect(res.body.token).to.include("JWT");
          done();
        });
    });
  });

  describe('/SIGNUP user', () => {
    it('it should create a user and return success', (done) => {
      let user = {
        name: "chaiTestUser",
        password: "super secure password"
      };
      chai.request(server)
        .post('/api/signup')
        .send(user)
        .end((err, res) => {
          res.body.should.have.property('success');
          res.body.should.have.property('msg');
          res.body.should.have.property('success').eql(true);
          res.body.should.have.property('msg').eql('Successful created new user.');
          done();
        });
    });
  });

  describe('/SIGNUP existing user', () => {
    it('it should fail on signing up an existing user', (done) => {
      let user = {
        name: "chaiTestUser",
        password: "super secure password"
      };
      chai.request(server)
        .post('/api/signup')
        .send(user)
        .send(user)
        .end((err, res) => {
          res.body.should.have.property('success');
          res.body.should.have.property('msg');
          res.body.should.have.property('success').eql(false);
          res.body.should.have.property('msg').eql('Username already exists.');
          done();
        });
    });
  });

  describe('/SIGNUP empty username', () => {
    it('it should fail on empty username', (done) => {
      let user = {
        name: "",
        password: "super secure password"
      };
      chai.request(server)
        .post('/api/signup')
        .send(user)
        .end((err, res) => {
          res.body.should.have.property('success');
          res.body.should.have.property('msg');
          res.body.should.have.property('success').eql(false);
          res.body.should.have.property('msg').eql('Please pass name and password.');
          done();
        });
    });
  });

  describe('/SIGNUP empty password', () => {
    it('it should fail on empty password', (done) => {
      let user = {
        name: "chaiTestUser",
        password: ""
      };
      chai.request(server)
        .post('/api/signup')
        .send(user)
        .end((err, res) => {
          res.body.should.have.property('success');
          res.body.should.have.property('msg');
          res.body.should.have.property('success').eql(false);
          res.body.should.have.property('msg').eql('Please pass name and password.');
          done();
        });
    });
  });

/*  /!*
   * Test the /POST route
   *!/
  describe('/POST book', () => {
    it('it should not POST a book without pages field', (done) => {
      let book = {
        title: "The Lord of the Rings",
        author: "J.R.R. Tolkien",
        year: 1954
      }
      chai.request(server)
        .post('/book')
        .send(book)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('errors');
          res.body.errors.should.have.property('pages');
          res.body.errors.pages.should.have.property('kind').eql('required');
          done();
        });
    });
    it('it should POST a book ', (done) => {
      let book = {
        title: "The Lord of the Rings",
        author: "J.R.R. Tolkien",
        year: 1954,
        pages: 1170
      }
      chai.request(server)
        .post('/book')
        .send(book)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Book successfully added!');
          res.body.book.should.have.property('title');
          res.body.book.should.have.property('author');
          res.body.book.should.have.property('pages');
          res.body.book.should.have.property('year');
          done();
        });
    });
  });
  /!*
   * Test the /GET/:id route
   *!/
  describe('/GET/:id book', () => {
    it('it should GET a book by the given id', (done) => {
      let book = new Book({ title: "The Lord of the Rings", author: "J.R.R. Tolkien", year: 1954, pages: 1170 });
      book.save((err, book) => {
        chai.request(server)
          .get('/book/' + book.id)
          .send(book)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('title');
            res.body.should.have.property('author');
            res.body.should.have.property('pages');
            res.body.should.have.property('year');
            res.body.should.have.property('_id').eql(book.id);
            done();
          });
      });

    });
  });
  /!*
   * Test the /PUT/:id route
   *!/
  describe('/PUT/:id book', () => {
    it('it should UPDATE a book given the id', (done) => {
      let book = new Book({title: "The Chronicles of Narnia", author: "C.S. Lewis", year: 1948, pages: 778})
      book.save((err, book) => {
        chai.request(server)
          .put('/book/' + book.id)
          .send({title: "The Chronicles of Narnia", author: "C.S. Lewis", year: 1950, pages: 778})
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('message').eql('Book updated!');
            res.body.book.should.have.property('year').eql(1950);
            done();
          });
      });
    });
  });
  /!*
   * Test the /DELETE/:id route
   *!/
  describe('/DELETE/:id book', () => {
    it('it should DELETE a book given the id', (done) => {
      let book = new Book({title: "The Chronicles of Narnia", author: "C.S. Lewis", year: 1948, pages: 778})
      book.save((err, book) => {
        chai.request(server)
          .delete('/book/' + book.id)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('message').eql('Book successfully deleted!');
            res.body.result.should.have.property('ok').eql(1);
            res.body.result.should.have.property('n').eql(1);
            done();
          });
      });
    });
  });*/
});
