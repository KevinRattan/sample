'use strict';

console.log(`process.env.SERVER = ${process.env.SERVER}`);
// get the environment variable, but default to localhost:8082 if its not set
const SERVER = process.env.SERVER ? process.env.SERVER : "http://localhost:8082";
const LIVE_BUCKET = process.env.LIVE_BUCKET ? process.env.LIVE_BUCKET : "";

// express is a nodejs web server
// https://www.npmjs.com/package/express
const express = require('express');

// local code to upload to cloud storage
const imageRepository = require('./imageRepository');

// local code to read from pub sub
const pubsubRepository = require('./pubsubRepository');

// converts content in the request into parameter req.body
// for multi-part form data
const multer = require("multer");

// converts content in the request into parameter req.body
// https://www.npmjs.com/package/body-parser
const bodyParser = require('body-parser');

// create a unique name for images
const { v4: uuidv4 } = require('uuid');

// express-handlebars is a templating library 
// https://www.npmjs.com/package/express-handlebars
// - look inside the views folder for the templates
// data is inserted into a template inside {{ }}
const engine = require('express-handlebars').engine;

// request is used to make REST calls to the backend microservice
// details here: https://www.npmjs.com/package/request
var request = require('request');

// create the server
const app = express();

// set up handlbars as the templating engine
app.set('view engine', 'hbs');
app.engine('hbs', engine({
    extname: 'hbs',
    defaultView: 'default'
}));

// set up the parser to get the contents of data from html forms 
// this would be used in a standard POST to the server as follows:
// app.post('/route', urlencodedParser, (req, res) => {}
const urlencodedParser = bodyParser.urlencoded({ extended: false });

// set up the parser to get the contents of form with multipart data
let upload = multer();

// defines a route that receives the request to /
app.get('/', (req, res) => {
    // make a request to the backend microservice using the request package
    // the URL for the backend service should be set in configuration 
    // using an environment variable. Here, the variable is passed 
    // to npm start inside package.json:
    //  "start": "SERVER=http://localhost:8082 node server.js",
    request.get(  // first argument: url + return format
        {
            url: SERVER + '/events',  // the microservice end point for events
            json: true  // response from server will be json format
        }, // second argument: function with three args,
        // runs when server response received
        // body hold the return from the server
        (error, response, body) => {
            if (error) {
                console.log('error:', error); // Print the error if one occurred
                res.render('error_message',
                    {
                        layout: 'default',  //the outer html page
                        error: error // pass the data from the server to the template
                    });
            }
            else {
                console.log('error:', error); // Print the error if one occurred
                console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                console.log(body); // print the return from the server microservice
                   // remove any unapproved images
                const events = body.events.map(el => el.image.startsWith("thumb")  ? el : {...el, image: ''} );
                res.render('home',
                    {
                        layout: 'default',  //the outer html page
                        template: 'index-template', // the partial view inserted into 
                        // {{body}} in the layout - the code
                        // in here inserts values from the JSON
                        // received from the server
                        events: events,
                        bucket: LIVE_BUCKET
                    }); // pass the data from the server to the template
            }
        });
});

// defines a route that receives the request to /
app.get('/approval', (req, res) => {
    pubsubRepository.synchronousPull().then((messages) => {
        console.log(messages);
        res.render('images',
        {
            layout: 'default',  //the outer html page
            template: 'index-template', // the partial view inserted into 
            // {{body}} in the layout - the code
            // in here inserts values from the JSON
            // received from the server
            messages: messages,
            bucket: LIVE_BUCKET
        }); // pass the data from the server to the template
    });

});



// send post on to server
function postOnToServer(req, res, fileName) {
        // make a request to the backend microservice using the request package
        // the URL for the backend service should be set in configuration 
        // using an environment variable. Here, the variable is passed 
        // to npm start inside package.json:
        //  "start": "SERVER=http://localhost:8082 node server.js",
    request.post(  // first argument: url + data + formats
    {
        url: SERVER + '/event',  // the microservice end point for adding an event
        body: { title: req.body.title, 
            description: req.body.description,
            location: req.body.location,
            fileName: fileName }, 
        headers: { // uploading json
            "Content-Type": "application/json"
        }, // content of the form
        json: true // response from server will be json format
    },
    (error, response, body) => {  // third argument: function with three args,
        // runs when server response received
        // body hold the return from the server
        console.log('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log(body); // print the return from the server microservice
        res.redirect("/"); // redirect to the home page
    });
}


// defines a route that receives the post request to /event
app.post('/event',
    upload.any(), // second argument - how to parse the uploaded content
    // into req.body
    (req, res) => {
        
        // code for image upload goes here

        postOnToServer(req, res, '');
    });


// defines a route that receives the post request to /event/like to like the event
app.post('/event/like',
    urlencodedParser, // second argument - how to parse the uploaded content
    // into req.body
    (req, res) => {
        // make a request to the backend microservice using the request package
        // the URL for the backend service should be set in configuration 
        // using an environment variable. Here, the variable is passed 
        // to npm start inside package.json:
        //  "start": "BACKEND_URL=http://localhost:8082 node server.js",
        // changed to a put now that real data is being updated
        request.put(  // first argument: url + data + formats
            {
                url: SERVER + '/event/like',  // the microservice end point for liking an event
                body: req.body,  // content of the form
                headers: { // uploading json
                    "Content-Type": "application/json"
                },
                json: true // response from backend will be json format
            },
            () => {  
                res.redirect("/"); // redirect to the home page on successful response
            });

    });


// defines a route that receives the delete request to /event/like to unlike the event
app.post('/event/unlike',
    urlencodedParser, // second argument - how to parse the uploaded content
    // into req.body
    (req, res) => {
        // make a request to the backend microservice using the request package
        // the URL for the backend service should be set in configuration 
        // using an environment variable. Here, the variable is passed 
        // to npm start inside package.json:
        //  "start": "BACKEND_URL=http://localhost:8082 node server.js",
        request.delete(  // first argument: url + data + formats
            {
                url: SERVER + '/event/like',  // the microservice end point for liking an event
                body: req.body,  // content of the form
                headers: { // uploading json
                    "Content-Type": "application/json"
                },
                json: true // response from backend will be json format
            },
            () => {  
                res.redirect("/"); // redirect to the home page on successful response
            });

    });    


// defines a route that receives the post request to /event/like to like the event
app.post('/event/approve',
    urlencodedParser, // second argument - how to parse the uploaded content
    // into req.body
    (req, res) => {
        // make a request to the backend microservice using the request package
        // the URL for the backend service should be set in configuration 
        // using an environment variable. Here, the variable is passed 
        // to npm start inside package.json:
        //  "start": "BACKEND_URL=http://localhost:8082 node server.js",
        // changed to a put now that real data is being updated
        request.put(  // first argument: url + data + formats
            {
                url: SERVER + '/event/approve',  // the microservice end point for liking an event
                body: req.body,  // content of the form
                headers: { // uploading json
                    "Content-Type": "application/json"
                },
                json: true // response from backend will be json format
            },
            () => {
                // now acknowledge receipt of message
                pubsubRepository.acknowledgeApproval([req.body.id])
                .then(() => {
                    res.redirect("/"); // redirect to the home page on successful response
                });                
            });

    });


// create other get and post methods here - version, login,  etc





// generic error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message });
});

// specify the port and start listening
const SERVICE_PORT = process.env.SERVICE_PORT ? process.env.SERVICE_PORT : 8080;
const server = app.listen(SERVICE_PORT, () => {
    const host = server.address().address;
    const port = server.address().port;

    console.log(`Events app listening at http://${host}:${port}`);
});

module.exports = app;