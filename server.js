/*
 * An API which serves as a configurable dashboard.
 */

'use static'
var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var sqlConfig = require('./sql_config.json');
var sql = mysql.createConnection(sqlConfig.mysql);
var Client = require('node-rest-client').Client;
var client = new Client();
var request = require('request');
require('dotenv').config();

//Setup Express and Socket.io
var app     = express();
// var port = process.env.PORT || 8080
var server  = app.listen(8080);
var io      = require('socket.io').listen(server);

// Constant page directory
var webpages = __dirname + '/webpages/html';
var stylesheet = __dirname + '/webpages/css';
var script = __dirname + '/webpages/js';

// Static files
app.use('/', express.static(webpages, { extensions: ['html'] }));
app.use('/', express.static(stylesheet, { extensions: ['css'] }));
app.use('/', express.static(script, { extensions: ['js'] }));

/** bodyParser.urlencoded(options)
 * Parses the text as URL encoded data (which is how browsers tend to send form data from regular forms set to POST)
 * and exposes the resulting object (containing the keys and values) on req.body
 */
app.use(bodyParser.urlencoded({
    extended: true
}));

/**
 * bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.
 */
app.use(bodyParser.json());

//Modules
var deadlines = require('./modules/deadlines.js');
deadlines.passGlobals(app, io, sql);
var monzo = require('./modules/monzo.js');
monzo.passGlobals(app, io, client, request);


// Global Variables
var lastfmApiKey = process.env.LAST_FM_API_KEY;
var lastfmUser = '';
var weatherApiKey = process.env.WEATHER_API_KEY;
var weatherLocation;


// logging in order to fully understand what the API is doing
app.use('/', function(req, res, next) { console.log(new Date(), req.method, req.url); next(); });

// Socket.io
io.on('connection', function(socket){
  console.log('a user connected');
  sendSessionVariables();
  sendLayout();
  sendApis();

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('newUser', addUser);
  socket.on('updateLayout', updateLayout);
});

//Do when server starts
setListeners();



// server api
//   GET  /api/deadlines     - list deadlines ordered by time from most recent, returns [like above, like above, ...]
//         ?order=...        - on the dashboard page ordered by closest date, on the deadline page changes depending on what the user wants
//   POST /api/deadlines     - upload a new deadline, its title, desc and its due date, returns {id: ..., title: ..., desc: ..., duedate...}
//   POST /api/deadlines/:id - used to update a deadline, uses :id to get the deadline id to be updated
//   DELETE /api/deadlines   - deletes a deadline from the dashboard and database
//   GET  /api/units         - Lists units ordered in the way they are entered into the table
//   POST /api/units         - Adds a unit to the database
//   DELETE /api/units       - Deletes a unit from the database
app.get('/api/deadlines', deadlines.sendDeadlines);
app.post('/api/deadlines', deadlines.uploadDeadline);
app.post('/api/deadlines/:id', deadlines.updateDeadline);
app.delete('/api/deadlines', deadlines.deleteDeadline);
app.get('/api/units', deadlines.sendUnits);
app.post('/api/units', deadlines.uploadUnit);
app.delete('/api/units', deadlines.deleteUnit);

/**
 * function to load the session variables from the database
 * @return the session variables such as first name, last name, lastFmname,
 *         city for weather, time format, and greyscale for the deadlines
 */
function sendSessionVariables() {
  //Get user details from user table
  var query = 'SELECT userFirstName, userLastName, userLastFMName, \
               userCity, user24hrTime, userDeadlineGrayScale FROM user';
 sql.query(query, function (err, data) {
   if (err) return error(res, 'failed to run the query', err);
   var session = {};
   //Only take the first line of the data as the dashboard does not
   // deal with many users (at this stage)
   if (data[0]) {
     var r = data[0];
     lastfmUser = r.userLastFMName;
     weatherLocation = r.userCity;
     session = {
       firstname: r.userFirstName,
       lastname: r.userLastName,
       lastfmname: r.userLastFMName,
       city: r.userCity,
       timeformat: r.user24hrTime,
       greyscale : r.userDeadlineGrayScale
     };
   }
   io.emit('sessionVariables', session);
 });
}


function getLastFM() {
  var url = 'https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user='+
              lastfmUser+'&api_key='+lastfmApiKey+'&limit=1&format=json';
  client.get(url, function(data, s, err) {
    // console.log(err);
    io.emit('lastfmNowPlaying', data);
  });
}

function setListeners() {
  getLastFM();
  setInterval(getLastFM, 1000);
  getWeather();
  setInterval(getWeather, 300000);
  monzo.getBalance();
  setInterval(monzo.getBalance, 300000);
}

function getWeather() {
  var url = 'http://api.openweathermap.org/data/2.5/weather?q='
            +weatherLocation+'&appid='+weatherApiKey
            +'&units=metric';
  client.get(url, function(data) {
    io.emit('weather', data);
  });
}

/**
 * Function to update the layout table
 * Called when one api is changed in the settings menu
 */
function updateLayout(json) {
  json = JSON.parse(json);
  console.log(json);
  var boxId = json.boxid,
      boxNo = json.boxno;
  sql.query('UPDATE layout SET boxId= ? WHERE boxNo = ?', [boxId, boxNo], function(err) {
    if (err) console.log("Error inserting");
  });
}

/**
 * Function to send the list of apis
 * @return the list of apis
 */
function sendApis() {
  var apiList = [];
  // prepare query
  var query = 'SELECT id, apiName, apiId, fromNewsApi FROM apis';
  // now query the table and output the results
  sql.query(query, function (err, data) {
    if (err) return error(res, 'failed to run the query', err);
    data.forEach(function (row) {
      apiList.push({
        id: row.id,
        name: row.apiName,
        htmlid: row.apiId,
        isNews: row.fromNewsApi
      });
    });
    io.emit('apis', apiList);
  });
}

/**
 * Function to get the saved layout of the dashboard
 * Used to add each id to the dashboard
 */
function sendLayout() {
  var layout = [];
  // prepare query
  var query = 'SELECT boxNo, boxId FROM layout';
  // now query the table and output the results
  sql.query(query, function (err, data) {
    if (err) return error(res, 'failed to run the query', err);
    data.forEach(function (row) {
      layout.push({
        boxNo: row.boxNo,
        boxId: row.boxId
      });
    });
    io.emit('layout', layout);
  });
}


/**
 * Function to add a new user to the database
 * Creates a new db record for user and then querys the database
 */
function addUser(json) {
  json = JSON.parse(json);
  var dbRecord = {
    userFirstName: json.firstname,
    userLastName: json.lastname,
    userLastFMName: json.lastfm,
    userCity: json.city,
    user24hrTime: json.time,
    userDeadlineGrayScale: json.greyscale
  };
  console.log(dbRecord);
  sql.query(sql.format('INSERT INTO user SET ? ', dbRecord), function (err, result) {
    var returnMessage;
    if (err) {
      console.log("Error inserting user into database");
      returnMessage = false;
    } else {
      console.log("User inserted into database");
      returnMessage = true;
    }
  });
}
