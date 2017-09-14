/*
 * An API which serves as a configurable dashboard.
 */
 process.on('uncaughtException', function (err) {
  console.log('uncaughtException');
  console.log(err);
 });
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
var timeAndDate = require('./modules/timeAndDate.js');
timeAndDate.passGlobals(app, io);
var monzo = require('./modules/monzo.js');
monzo.passGlobals(app, io, client, request);
var lastfm = require('./modules/lastfm.js');
lastfm.passGlobals(app, io, client);
var weather = require('./modules/weather.js');
weather.passGlobals(app, io, client);
var news = require('./modules/news.js');
news.passGlobals(app, io, client, sql);
var googlemaps = require('./modules/googlemaps.js');
googlemaps.passGlobals(app, io, client);


// Global Variables
var session = {
  firstname: '',
  lastname: '',
  lastfmname: '',
  city: '',
  timeformat: '',
  greyscale : ''
};
var layout = [];
var apiList = [];
var activeApis = [];



// logging in order to fully understand what the API is doing
app.use('/', function(req, res, next) { console.log(new Date(), req.method, req.url); next(); });

// Socket.io
io.on('connection', function(socket){
  console.log('a user connected');
  setUpPage();
  timeAndDate.send();
  lastfm.send();
  weather.send();
  monzo.balance();
  news.send();
  googlemaps.sendWork();
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('newUser', addUser);
  socket.on('updateLayout', updateLayout);
  socket.on('updateApiList', updateApiList);
});

//Do when server starts
// For now do this on client connection as I need to set up a way to get
//          session variables and send them in different functions
getSessionVariables();
getApis();
startScrape();


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

function setUpPage() {
  if (session.firstname !== '') {
    var payload = {
      session: session,
      apiList: apiList,
      activeApis: activeApis
    }
    io.emit('variables', payload);
  } else {
    io.emit('login');
  }
}

/**
 * function to load the session variables from the database
 * @return the session variables such as first name, last name, lastFmname,
 *         city for weather, time format, and greyscale for the deadlines
 */
function getSessionVariables() {
  //Get user details from user table
  var query = 'SELECT userFirstName, userLastName, userLastFMName, \
               userCity, user24hrTime, userDeadlineGrayScale FROM user';
 sql.query(query, function (err, data) {
   if (err) return error(res, 'failed to run the query', err);
   //Only take the first line of the data as the dashboard does not
   // deal with many users (at this stage)
   if (data[0]) {
     var r = data[0];
     lastfm.setUser(r.userLastFMName);
     weather.setLocation(r.userCity);
     session = {
       firstname: r.userFirstName,
       lastname: r.userLastName,
       lastfmname: r.userLastFMName,
       city: r.userCity,
       timeformat: r.user24hrTime,
       greyscale : r.userDeadlineGrayScale
     };
   }
   sendSessionVariables();
 });
}

function sendSessionVariables() {
  if (session.firstname !== '') {
     io.emit('sessionVariables', session);
  } else {
    io.emit('login');
  }
}

function startScrape() {
  // lastfm.scrape(1);
  timeAndDate.scrape();
  // weather.scrape(5);
  monzo.scrape(30);
  news.scrape(120);
}


/**
 * Function to update the layout table
 * Called when one api is changed in the settings menu
 */
function updateLayout(json) {
  var countQueriesRun = 0;
  if (json.oldApi !== '') {
    sql.query('UPDATE apis SET activeApi = 0, boxNo = -1 WHERE apiId = ?', [json.oldApi.htmlid], function(err) {
      if (err) console.log("Error inserting");
      countQueriesRun++;
      if (countQueriesRun == 2) {
        getApis(true);
      }
    });
    stopApi(json.oldApi);
  }
  sql.query('UPDATE apis SET activeApi = 1, boxNo = ? WHERE apiId = ?', [json.newApi.boxNo, json.newApi.htmlid], function(err) {
    if (err) console.log("Error inserting" + err);
    countQueriesRun++;
    if (countQueriesRun == 2) {
      getApis(true);
    }
  });
  // activateApi(json.newApi);
}

function updateApiList(list) {
  apiList = list;
  sendApis();
}

// updateApiLayout(json) {
//
// }

/**
 * Function to send the list of apis
 * @return the list of apis
 */
function getApis(sendApisBool = false) {
  var tempApiList = [];
  // prepare query
  var query = 'SELECT id, apiName, apiId, fromNewsApi, activeApi, boxNo FROM apis';
  // now query the table and output the results
  sql.query(query, function (err, data) {
    if (err) return error(res, 'failed to run the query', err);
    data.forEach(function (row) {
      tempApiList.push({
        id: row.id,
        name: row.apiName,
        htmlid: row.apiId,
        isNews: row.fromNewsApi,
        activeApi: row.activeApi,
        boxNo: row.boxNo
      });
    });
    apiList = tempApiList;
    figureActive(sendApisBool);
  });
  if (sendApisBool) {
    sendApis();
  }
}

function sendApis() {
  io.emit('apis', apiList);
}

/**
 * Function to get the saved layout of the dashboard
 * Used to add each id to the dashboard
 */
function figureActive(sendApisBool = false) {
  var list = apiList;
  var active = [];
  for (var i = 0; i < list.length; i++) {
    if (list[i].activeApi === 1) {
      active.push(list[i]);
    }
  }
  activeApis = active;
  if (sendApisBool) {
    activateAll(active, sendUpdatedLayoutAndApis);
  }
  activateAll(active);
}

function sendLayout() {
  io.emit('layout', activeApis);
}

function sendUpdatedLayoutAndApis() {
  io.emit('apis', apiList);
  io.emit('layout', activeApis);
  io.emit('refreshPage');
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
      getSessionVariables();
    }
  });
}

// Activate all apis that are active
function activateAll(list, cb) {
  for (var i = 0; i < list.length; i++) {
    activateApi(list[i]);
    if (!!cb && i+1===list.length) {
      cb();
      console.log('callback');
    }
  }
}

// Stop scraping for data from an api if it is no longer in use
function stopApi(api) {
  var apiID = api.htmlid;
  if (apiID.includes('last-fm')) {
    lastfm.stop();
  } else if (apiID.includes('weather')) {
    weather.stop();
  }
}

// Function to activate an api if it is active in the apiList
function activateApi(api) {
  console.log(api);
  var apiID = api.htmlid;
  if (apiID.includes('last-fm')) {
    lastfm.scrape(1);
  }
  if (apiID.includes('weather')) {
    weather.scrape(300);
  }
}
