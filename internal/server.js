'use strict';

// express is a nodejs web server
// https://www.npmjs.com/package/express
const express = require('express');

// converts content in the request into parameter req.body
// https://www.npmjs.com/package/body-parser
const bodyParser = require('body-parser');

// bring in repository
const db = require('./repository');

// create the server
const app = express();

// the backend server will parse json, not a form request
app.use(bodyParser.json());

// allow AJAX calls from 3rd party domains
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, MERGE, GET, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
})

// health endpoint - returns an empty array
app.get('/', (req, res) => {
    res.json([]);
});

// version endpoint to provide easy convient method to demonstrating tests pass/fail
app.get('/version', (req, res) => {
    res.json({ version: '1.0.0' });
});


app.get('/events', (req, res) => {
   db.getEvents().then((data) => {
       res.json(data);
    });
});


app.get('/event/:id', (req, res) => {
   console.log("Retrieving event with id ", req.params.id);
    db.getEvent(req.params.id).then((data) => {
        res.json(data);
     });
 });

app.post('/event', (req, res) => {
    db.addEvent(req)
        .then((data) => {
            res.json(data);
        });
});

app.post('/comment', (req, res) => {
    db.addComment(req.body.event_id, req.body.comment)
        .then((data) => {
            res.json(data);
        });
});

// create a route for the route delete /event/:id
app.delete('/event/:id', (req, res) => {
    db.deleteEvent(req.params.id)
        .then((data) => {
            res.json(data);
        });
});

app.delete('/comment/:event_id/:id', (req, res) => {
    db.deleteComment(req.params.event_id, req.params.id)
        .then((data) => {
            res.json(data);
        });
});



app.put('/event', (req, res) => {
    db.updateEvent(req)
        .then((data) => {
            res.json(data);
        });
});

// put because this is an update. Passes through to shared method.
app.put('/like/event', (req, res) => {
    db.addLike(req.body.id)
        .then((data) => {
            res.json(data);
        });
});

// Passes through to shared method.
// Delete distinguishes this route from put above
app.delete('/like/event', (req, res) => {
    db.removeLike(req.body.id)
        .then((data) => res.json(data));
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message });
});

const SERVICE_PORT = process.env.SERVICE_PORT ? process.env.SERVICE_PORT : 8082;
const server = app.listen(SERVICE_PORT, () => {
    const host = server.address().address;
    const port = server.address().port;

    console.log(`Events app listening at http://${host}:${port}`);
});

module.exports = app;