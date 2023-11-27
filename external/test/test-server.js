const chai = require('chai');
const nock = require('nock');
const request = require('supertest');
const app = require('../server');

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
          { title: 'an event', id: 1234, description: 'something really cool', location: 'Joes pizza', likes: 0 },
          { title: 'another event', id: 5678, description: 'something even cooler', location: 'Johns pizza', likes: 0 }
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
        chai.assert.isTrue(res.text.includes("<h1>Capstone Project Application</h1>"));
        return done();
      });


  });


  it('should display error page when the backend fails', function (done) {
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
  const data = { title: 'test event', description: 'even cooler test', id: 4321, location: 'Some Test Place', likes: 0 };
    //specify the url to be intercepted
    nock("http://localhost:8082")
      //define the method to be intercepted
      .post('/event')
      //respond with a OK and the specified JSON response
      .reply(200, {
        "status": 200,
        "events": [
          { title: 'an event', id: 1234, description: 'something really cool', location: 'Joes pizza', likes: 0 },
          { title: 'another event', id: 5678, description: 'something even cooler', location: 'Johns pizza', likes: 0 },
          data
        ]
      });

    request(app)
      .post('/event')
      .expect(302)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        chai.assert.isTrue(res.text.includes("Redirecting"));
        return done();
      });


  });

  it('should display page when the post fails', function (done) {
    //specify the url to be intercepted
    nock("http://localhost:8082")
      //define the method to be intercepted
      .post('/event')
      //respond with an error
      .replyWithError("Error");

    request(app)
      .post('/event')
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

// create a test for the route Post /event/edit/:id
describe('POST /event/update', function () {
  it('edits an event', function (done) {
  const data = { title: 'test event', description: 'even cooler test', id: 4321, location: 'Some Test Place', likes: 0 };
    //specify the url to be intercepted
    nock("http://localhost:8082")
      //define the method to be intercepted
      .put('/event')
      //respond with a OK and the specified JSON response
      .reply(200, {
        "status": 200,
        "events": [
          { title: 'an event', id: 1234, description: 'something really cool', location: 'Joes pizza', likes: 0 },
          { title: 'another event', id: 5678, description: 'something even cooler', location: 'Johns pizza', likes: 0 },
          data
        ]
      });

      request(app)
      .post('/event/update')
      .expect(302)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        chai.assert.isTrue(res.text.includes("Redirecting"));
        return done();
      });
    });


    it('should display error page when the put fails', function (done) {
      //specify the url to be intercepted
      nock("http://localhost:8082")
        //define the method to be intercepted
        .put('/event')
        //respond with an error
        .replyWithError("Error");
  
      request(app)
        .post('/event/update')
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

  describe('GET /about', function () {
    it('responds with the about page', function (done) {
      // Use Supertest to make a GET request to the /about route
      request(app)
        .get('/about')
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          // Use Chai to assert that the response text includes some expected content
          chai.assert.isTrue(res.text.includes('About Us'));
          return done();
        });
    });
  });



// create a test to for the route GET /event/:id
describe('GET /event/:id', function () {
  it('responds with a single event', function (done) {
    //specify the url to be intercepted
    nock("http://localhost:8082")
      //define the method to be intercepted
      .get('/event/1234')
      //respond with a OK and the specified JSON response
      .reply(200, {
        "status": 200,
        "body": { title: 'an event', id: 1234, description: 'something really cool', location: 'Joes pizza', likes: 0 }
      });

    request(app)
      .get('/event/1234')
      .expect('Content-Type', /html/)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        chai.assert.isTrue(res.text.includes("an event"));
        return done();
      });
    });


    it('should display error page when the backend fails', function (done) {
      //specify the url to be intercepted
      nock("http://localhost:8082")
        //define the method to be intercepted
        .get('/event/1234')
        //respond with an error
        .replyWithError("Error");
  
      request(app)
        .get('/event/1234')
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

// create a test for the route POST /event/delete/:id
describe('GET /event/delete/:id', function () {
  it('deletes an event', function (done) {
  const data = { id: 1234 };
    //specify the url to be intercepted
    nock("http://localhost:8082")
      //define the method to be intercepted
      .delete('/event/1234')
      //respond with a OK and the specified JSON response
      .reply(200, {
        "status": 200,
        "events": [
          { title: 'an event', id: 1234, description: 'something really cool', location: 'Joes pizza', likes: 0 },
          { title: 'another event', id: 5678, description: 'something even cooler', location: 'Johns pizza', likes: 0 },
        ]
      });

      request(app)
      .get('/event/delete/1234')
      .expect(302)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        chai.assert.isTrue(res.text.includes("Redirecting"));
        return done();
      });
    });


    it('should display page when the delete fails', function (done) {
      //specify the url to be intercepted
      nock("http://localhost:8082")
        //define the method to be intercepted
        .delete('/event/1234')
        //respond with an error
        .replyWithError("Error");
  
      request(app)
        .get('/event/delete/1234')
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

// create a test for the route POST /comment
describe('POST /comment', function () {
  it('adds a comment', function (done) {
  const data = { id: 1234, comment: 'a comment' };
    //specify the url to be intercepted
    nock("http://localhost:8082")
      //define the method to be intercepted
      .post('/comment')
      //respond with a OK and the specified JSON response
      .reply(200, {
        "status": 200,
        "body": 
          { title: 'an event', id: 1234, description: 'something really cool', location: 'Joes pizza', likes: 0 }
      });

      request(app)
      .post('/comment')
      .expect(302)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        chai.assert.isTrue(res.text.includes("Redirecting"));
        return done();
      });
    });

    it('should display page when the post fails', function (done) {
      //specify the url to be intercepted
      nock("http://localhost:8082")
        //define the method to be intercepted
        .post('/comment')
        //respond with an error
        .replyWithError("Error");
  
      request(app)
        .post('/comment')
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

// create a test for the route POST /comment/delete/:event_id/:id
describe('POST /comment/delete/:event_id/:id', function () {
  it('deletes a comment', function (done) {
  const data = { event_id: 1234, id: 4321 };
    //specify the url to be intercepted
    nock("http://localhost:8082")
      //define the method to be intercepted
      .delete('/comment/1234/4321')
      //respond with a OK and the specified JSON response
      .reply(200, {
        "status": 200,
        "body":    2
      });


      request(app)
      .get('/comment/delete/1234/4321')
      .expect(302)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        console.log(res.text);
        chai.assert.isTrue(res.text.includes("Redirecting"));
        return done();
      });
    });


    it('should display error page when the delete fails', function (done) {
      //specify the url to be intercepted
      nock("http://localhost:8082")
        //define the method to be intercepted
        .delete('/comment/1234/4321')
        //respond with an error
        .replyWithError("Error");
  
      request(app)
        .get('/comment/delete/1234/4321')
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

describe('POST /event/like', function () {
  it('likes an event', function (done) {
    //specify the url to be intercepted
    nock("http://localhost:8082")
      //define the method to be intercepted
      .put('/like/event')
      //respond with a OK and the specified JSON response
      .reply(200, {
        "status": 200,
        "body": 
          { title: 'an event', id: 1234, description: 'something really cool', location: 'Joes pizza', likes: 1 }
      });

      request(app)
      .post('/like/event')
      .expect(302)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        chai.assert.isTrue(res.text.includes("Redirecting"));
        return done();
      });


  });


  it('should display page when the put fails', function (done) {
    //specify the url to be intercepted
    nock("http://localhost:8082")
      //define the method to be intercepted
      .put('/event/like')
      //respond with an error
      .replyWithError("Error");

    request(app)
      .post('/like/event')
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


describe('POST /event/unlike', function () {
  it('un-likes an event', function (done) {
  const data = { id: 1234 };
    //specify the url to be intercepted
    nock("http://localhost:8082")
      //define the method to be intercepted
      .delete('/like/event')
      //respond with a OK and the specified JSON response
      .reply(200, {
        "status": 200,
        "events": [
          { title: 'an event', id: 1234, description: 'something really cool', location: 'Joes pizza', likes: 0 },
          { title: 'another event', id: 5678, description: 'something even cooler', location: 'Johns pizza', likes: 0 },
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


  it('should display page when the delete fails', function (done) {
    //specify the url to be intercepted
    nock("http://localhost:8082")
      //define the method to be intercepted
      .delete('/like/event')
      //respond with an error
      .replyWithError("Error");

    request(app)
      .post('/event/unlike')
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




