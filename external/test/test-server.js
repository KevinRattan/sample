const chai = require('chai');
const nock = require('nock');
const request = require('supertest');
const sinon = require('sinon');
const app = require('../server');
const pb = require('../pubsubRepository');

describe('GET /', function () {
  it('responds with home page', function (done) {

    //specify the url to be intercepted
    nock("http://localhost:8082")
      //define the method to be intercepted
      .get('/events')
      //respond with a OK and the specified JSON response
      .reply(200, {
        "status": 200,
        "events": [
          { id: 1, title: 'a mock event', description: 'something really cool', location: 'Chez Joe Pizza', likes: 0, datetime_added: '2022-02-01:12:00', image: '' },
          { id: 2, title: 'another mock event', description: 'something even cooler', location: 'Chez John Pizza', likes: 0, datetime_added: '2022-02-01:12:00', image: '' },
      ]
      });

    request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        chai.assert.isTrue(res.text.includes("<h1>Welcome to [TEAM NAME'S] application</h1>"));
        return done();
      });


  });


  it('should display page when the backend is down', function (done) {
    //specify the url to be intercepted
    nock("http://localhost:8082")
      //define the method to be intercepted
      .get('/events')
      //respond with an error
      .replyWithError("Error");

    request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        chai.assert.isTrue(res.text.includes("Error"));
        return done();
      });


  });

});



describe('POST /event', function () {
  it('adds an event', function (done) {
  const data = { title: 'test event', description: 'even cooler test', id: 4321, location: 'Some Test Place', likes: 0, image: '' };
    //specify the url to be intercepted
    nock("http://localhost:8082")
      //define the method to be intercepted
      .post('/event')
      //respond with a OK and the specified JSON response
      .reply(200, {
        "status": 200,
        "events": [
          { id: 1, title: 'a mock event', description: 'something really cool', location: 'Chez Joe Pizza', likes: 0, datetime_added: '2022-02-01:12:00', image: '' },
          { id: 2, title: 'another mock event', description: 'something even cooler', location: 'Chez John Pizza', likes: 0, datetime_added: '2022-02-01:12:00', image: '' },
          data
      ]
      });
    request(app)
      .post('/event')
      .field(data)
      .expect(302)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        chai.assert.isTrue(res.text.includes("Redirecting"));
        return done();
      });


  });
});




describe('POST /event/like', function () {
  it('likes an event', function (done) {
  const data = { id: 1234 };
    //specify the url to be intercepted
    nock("http://localhost:8082")
      //define the method to be intercepted
      .post('/event/like')
      //respond with a OK and the specified JSON response
      .reply(200, {
        "status": 200,
        "events": [
          { id: 1, title: 'a mock event', description: 'something really cool', location: 'Chez Joe Pizza', likes: 0, datetime_added: '2022-02-01:12:00', image: '' },
          { id: 2, title: 'another mock event', description: 'something even cooler', location: 'Chez John Pizza', likes: 0, datetime_added: '2022-02-01:12:00', image: '' },
      ]
      });

      request(app)
      .post('/event/like')
      .expect(302)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        chai.assert.isTrue(res.text.includes("Redirecting"));
        return done();
      });


  });
});


describe('POST /event/unlike', function () {
  it('un-likes an event', function (done) {
  const data = { id: 1234 };
    //specify the url to be intercepted
    nock("http://localhost:8082")
      //define the method to be intercepted
      .delete('/event/like')
      //respond with a OK and the specified JSON response
      .reply(200, {
        "status": 200,
        "events": [
          { id: 1, title: 'a mock event', description: 'something really cool', location: 'Chez Joe Pizza', likes: 0, datetime_added: '2022-02-01:12:00', image: '' },
          { id: 2, title: 'another mock event', description: 'something even cooler', location: 'Chez John Pizza', likes: 0, datetime_added: '2022-02-01:12:00', image: '' },
      ]
      });

      request(app)
      .post('/event/unlike')
      .expect(302)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        chai.assert.isTrue(res.text.includes("Redirecting"));
        return done();
      });


  });
});



describe('POST /approval', function () {
  let pbStub;
  beforeEach(function() {
    pbStub = sinon.stub(pb, "acknowledgeApproval").resolves('');
  });
  afterEach(function() {
    pbStub.restore();
  });
  it('updates image and acknowledges pubsub message', function (done) {
  const data = { id: 1234 };
    //specify the url to be intercepted
    nock("http://localhost:8082")
      //define the method to be intercepted
      .post('/event/approve')
      //respond with a OK and the specified JSON response
      .reply(200, {
        "status": 200,
        "events": [
          { id: 1, title: 'a mock event', description: 'something really cool', location: 'Chez Joe Pizza', likes: 0, datetime_added: '2022-02-01:12:00', image: '' },
          { id: 2, title: 'another mock event', description: 'something even cooler', location: 'Chez John Pizza', likes: 0, datetime_added: '2022-02-01:12:00', image: '' },
      ]
      });

      request(app)
      .post('/event/approve')
      .expect(302)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        chai.assert.isTrue(res.text.includes("Redirecting"));
        return done();
      });


  });
});


