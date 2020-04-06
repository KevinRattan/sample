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

// health endpoint - returns an empty array
app.get('/', (req, res) => {
    res.json([]);
});

// version endpoint to provide easy convient method to demonstrating tests pass/fail
app.get('/version', (req, res) => {
    res.json({ version: '1.0.0' });
});

// this has been modifed to call the shared getEvents method that
// returns data from firestore
app.get('/events', (req, res) => {
    db.getEvents()
    .then((data) => {
        console.log(data);
        res.json(data);
    });
});

// This has been modified to insert into firestore, and then call 
// the shared getEvents method.
app.post('/event', (req, res) => {
   db.addEvent(req)
   .then((data) => {
    console.log(data);
    res.json(data);
});
});

// put because this is an update. Passes through to shared method.
app.put('/event/like', (req, res) => {
   db.addLike(req.body.id)
   .then((data) => {
    console.log(data);
    res.json(data);
});
});

// Passes through to shared method.
// Delete distinguishes this route from put above
app.delete('/event/like', (req, res) => {
   db.removeLike(req.body.id)
   .then((data) => res.json(data));
});


// function used by both like and unlike. If increment = true, a like is added.
// If increment is false, a like is removed.
function changeLikes(req, res, id, increment) {
    // return the existing objct
    firestore.collection("Events").doc(id).get()
        .then((snapshot) => {
            const el = snapshot.data();
            // if you have elements in firestore with no likes property
            if (!el.likes) {
                el.likes = 0;
            }
            // increment the likes
            if (increment) {
                el.likes++;
            }
            else {
                el.likes--;
            }
            // do the update
            firestore.collection("Events")
                .doc(id).update(el).then((ret) => {
                    // return events using shared method that adds __id
                    getEvents(req, res);
                });
        })
        .catch(err => { console.log(err) });
}

// put because this is an update. Passes through to shared method.
app.put('/event/like', (req, res) => {
    changeLikes(req, res, req.body.id, true);
});

// Passes through to shared method.
// Delete distinguishes this route from put above
app.delete('/event/like', (req, res) => {
    changeLikes(req, res, req.body.id, false);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message });
});

const PORT = 8082;
const server = app.listen(PORT, () => {
    const host = server.address().address;
    const port = server.address().port;

    console.log(`Events app listening at http://${host}:${port}`);
});

module.exports = app;