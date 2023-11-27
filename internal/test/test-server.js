var chai = require('chai');
const request = require('supertest');
const app = require('../server');
const sinon = require('sinon');
const db = require('../repository');

describe('GET /', function () {
  it('responds with json', function (done) {
    request(app)
      .get('/')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});

describe('GET /version', function () {
  it('responds with the current version', function (done) {
    request(app)
      .get('/version')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        chai.expect(JSON.parse(res.text)).to.eql({ version: '1.0.0' });
        return done();
      });
  });
});

describe('GET /events', function () {
  let dbStub;
  beforeEach(function() {
    dbStub = sinon.stub(db, "getEvents");
  });
  afterEach(function() {
    dbStub.restore();
  });
  it('responds with json', function (done) {
    dbStub.returns(Promise.resolve({ events: []}));
    request(app)
      .get('/events')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
  it('returns events', function (done) {
    dbStub.returns(Promise.resolve({ events: []}));
    request(app)
      .get('/events')
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        chai.expect(JSON.parse(res.text)).to.have.property('events');
        return done();
      });
  });
});

describe('POST /event', function () {
  let dbStub;
  beforeEach(function() {
    dbStub = sinon.stub(db, "addEvent");
  });
  afterEach(function() {
    dbStub.restore();
  });
  it('adds an event', function (done) {
    dbStub.returns(Promise.resolve({ events: []}));
    request(app)
      .post('/event')
      .send({ title: 'a test event', description: 'a really cool test', location: 'Somewhere nice', likes: 0 })
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        return done();
      });
  });
});



describe('GET /event/:id', function () {
  let dbStub;
  beforeEach(function() {
    dbStub = sinon.stub(db, "getEvent");
  });
  afterEach(function() {
    dbStub.restore();
  });
  it('returns an event', function (done) {
    dbStub.returns(Promise.resolve({ comments: []}));
    request(app)
      .get('/event/1')
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        chai.expect(JSON.parse(res.text)).to.have.property('comments');
        return done();
      });
  });
});

// create a test for the put  event endpoint  
describe('PUT /event', function () {
  let dbStub;
  beforeEach(function() {
    dbStub = sinon.stub(db, "updateEvent");
  });
  afterEach(function() {
    dbStub.restore();
  });
  it('updates an event', function (done) {
    dbStub.returns(Promise.resolve({ events: []}));
    request(app)
      .put('/event')
      .send({ id: 2, title: 'a test event', description: 'a really cool test', location: 'Somewhere nice', likes: 0 })
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        return done();
      });
  });
});

describe('DELETE /like/event', function () {
  let dbStub;
  beforeEach(function() {
    dbStub = sinon.stub(db, "removeLike");
  });
  afterEach(function() {
    dbStub.restore();
  });
  it('un-likes an event', function (done) {
    dbStub.returns(Promise.resolve({ events: []}));
    request(app)
      .delete('/like/event')
      .send({ id: 2 })
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        return done();
      });
  });
});

describe('PUT /like/event', function () {
  let dbStub;
  beforeEach(function() {
    dbStub = sinon.stub(db, "addLike");
  });
  afterEach(function() {
    dbStub.restore();
  });
  it('likes an event', function (done) {
    dbStub.returns(Promise.resolve({ events: []}));
    request(app)
      .put('/like/event')
      .send({ id: 2 })
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        return done();
      });
  });
});

// create a test for the add comment endpoint
describe('POST /comment', function () {
  let dbStub;
  beforeEach(function() {
    dbStub = sinon.stub(db, "addComment");
  });
  afterEach(function() {
    dbStub.restore();
  });
  it('adds a comment', function (done) {
    dbStub.returns(Promise.resolve({ events: []}));
    request(app)
      .post('/comment')
      .send({ event_id: 2, comment: 'a test comment' })
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        return done();
      });
  });
});

// create a test for the delete comment endpoint
describe('DELETE /comment/:event_id/:id', function () {
  let dbStub;
  beforeEach(function() {
    dbStub = sinon.stub(db, "deleteComment");
  });
  afterEach(function() {
    dbStub.restore();
  });
  it('deletes a comment', function (done) {
    dbStub.returns(Promise.resolve({ events: []}));
    request(app)
      .delete('/comment/2/1')
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        return done();
      });
  });
});

// create a test for the delete event endpoint
describe('DELETE /event/:id', function () {
  let dbStub;
  beforeEach(function() {
    dbStub = sinon.stub(db, "deleteEvent");
  });
  afterEach(function() {
    dbStub.restore();
  });
  it('deletes an event', function (done) {
    dbStub.returns(Promise.resolve({ events: []}));
    request(app)
      .delete('/event/2')
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        return done();
      });
  });
});