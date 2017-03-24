/*
 * An API which serves as a configurable dashboard.
 */

'use static'
var express = require('express');

var app = express();

// constants for directories
var webpages = __dirname + '/webpages/';

// logging in order to fully understand what the API is doing
app.use('/', function(req, res, next) { console.log(new Date(), req.method, req.url); next(); });


// server api
//   POST /api/deadlines     - upload a new deadline, its title, desc and its due date, returns {id: ..., title: ..., desc: ..., duedate...}
//   GET  /api/deadlines     - list pictures ordered by time from most recent, returns [like above, like above, ...]
//         ?order=...       - ordered by closest deadline
//         ?unit=...       - search by course units
//   DELETE /api/deadlines/x - returns http status code only

// app.get('/api/deadlines', sendDeadlines);
// app.post('/api/deadlines', uploader.single('picfile'), uploadDeadline);
// app.delete('/api/deadlines/:id', deleteDeadline);


// static files
app.use('/', express.static(webpages, { extensions: ['html'] }));

// start the server
app.listen(8080);
