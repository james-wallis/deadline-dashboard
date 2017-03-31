/*
 * An API which serves as a configurable dashboard.
 */

'use static'
var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var sqlConfig = require('./sql_config.json');
var sql = mysql.createConnection(sqlConfig.mysql);
var app = express();

// constants for directories
var webpages = __dirname + '/webpages/';

// static files
app.use('/', express.static(webpages, { extensions: ['html'] }));

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



// logging in order to fully understand what the API is doing
app.use('/', function(req, res, next) { console.log(new Date(), req.method, req.url); next(); });


// server api
//   GET  /api/user          - get variables used for a session, username, city for weather
//   POST /api/user          - Add a new user, only called once as the program has one user
//   GET  /api/deadlines     - list deadlines ordered by time from most recent, returns [like above, like above, ...]
//         ?order=...        - on the dashboard page ordered by closest date, on the deadline page changes depending on what the user wants
//   POST /api/deadlines     - upload a new deadline, its title, desc and its due date, returns {id: ..., title: ..., desc: ..., duedate...}
//   POST /api/deadlines/:id - used to update a deadline, uses :id to get the deadline id to be updated
//   DELETE /api/deadlines   - deletes a deadline from the dashboard and database
//   GET  /api/units         - Lists units ordered in the way they are entered into the table
//   POST /api/units         - Adds a unit to the database
//   DELETE /api/units       - Deletes a unit from the database
//   GET  /api/loadedApis    - Gets the list of apis that have functions created
//   GET  /api/layout        - Gets the list of the current layout used to assign the correct id's to the correct divs
//   POST /api/layout/:boxno - Updates the layout table, uses the boxno to find the correct element in the table
app.get('/api/user', sendSessionVariables);
app.post('/api/user', addUser);
app.get('/api/deadlines', sendDeadlines);
app.post('/api/deadlines', uploadDeadline);
app.post('/api/deadlines/:id', updateDeadline);
app.delete('/api/deadlines', deleteDeadline);
app.get('/api/units', sendUnits);
app.post('/api/units', uploadUnit);
app.delete('/api/units', deleteUnit);
app.get('/api/loadedApis', sendApis);
app.get('/api/layout', getLayout);
app.post('/api/layout/:boxno', updateLayout);

// start the server
app.listen(8080);

/* server functions
 * (Thanks for this!)
 *
 *
 *    ####  ###### #####  #    # ###### #####     ###### #    # #    #  ####  ##### #  ####  #    #  ####
 *   #      #      #    # #    # #      #    #    #      #    # ##   # #    #   #   # #    # ##   # #
 *    ####  #####  #    # #    # #####  #    #    #####  #    # # #  # #        #   # #    # # #  #  ####
 *        # #      #####  #    # #      #####     #      #    # #  # # #        #   # #    # #  # #      #
 *   #    # #      #   #   #  #  #      #   #     #      #    # #   ## #    #   #   # #    # #   ## #    #
 *    ####  ###### #    #   ##   ###### #    #    #       ####  #    #  ####    #   #  ####  #    #  ####
 *
 *
 */

/**
 * function to load the session variables from the database
 * @return the session variables such as first name, last name, lastFmname,
 *         city for weather, time format, and greyscale for the deadlines
 */
function sendSessionVariables(req, res) {
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
     session = {
       firstname: r.userFirstName,
       lastname: r.userLastName,
       lastfmname: r.userLastFMName,
       city: r.userCity,
       timeformat: r.user24hrTime,
       greyscale : r.userDeadlineGrayScale
     };
   }
   res.json(session);
 });
}

/**
 * Function to add a new user to the database
 * Creates a new db record for user and then querys the database
 */
function addUser(req, res) {
  var dbRecord = {
    userFirstName: req.body.firstname,
    userLastName: req.body.lastname,
    userLastFMName: req.body.lastfm,
    userCity: req.body.city,
    user24hrTime: req.body.time,
    userDeadlineGrayScale: req.body.greyscale
  };
  sql.query(sql.format('INSERT INTO user SET ? ', dbRecord), function (err, result) {
    if (err) console.log("Error inserting");
    if (req.accepts('html')) {
      // browser should go to the listing of units
      res.redirect(303, '#');
    } else {
      res.header("Access-Control-Allow-Origin", "*").sendStatus(200);
      // XML HTTP request that accepts JSON will instead get that
      res.json({userId: result.insertedId, userFirstName: dbRecord.userFirstName,
        userLastName: dbRecord.userLastName, userLastFMName: dbRecord.userLastFMName,
        userCity: dbRecord.userCity, user24hrTime: dbRecord.user24hrTime,
        userDeadlineGrayScale: dbRecord.userDeadlineGrayScale});
    }
  });
}

/**
 * Function to send the list of deadlines
 * @return the list of deadlines created when the database was queried
 */
function sendDeadlines(req, res) {
 var deadlines = [];
 // prepare query
 var query = 'SELECT id, title, description, dueDate FROM deadlines';
 //Where ensures that we do not see past deadlines
 query += ' WHERE dueDate >= CURRENT_DATE()';
 if (req.query.id) {
   query += ' AND id = '+sql.escape(req.query.id)
 }
 var sort;
 switch (req.query.order) {
   case 'near': sort = 'dueDate ASC'; break; // by nearest date
   case 'far': sort = 'dueDate DESC'; break; // by furthest away date
   case 'a2z': sort = 'title ASC'; break; // by unit title a to z
   case 'z2a': sort = 'title DESC'; break; // by unit title z to a
   default:    sort = 'dueDate ASC'; // Default with nearest date
 }
 query += ' ORDER BY ' + sort;
 //Add limit to query
 if (req.query.limit) {
   query += ' LIMIT '+ escape(req.query.limit);
 }
 // now query the table and output the results
 sql.query(query, function (err, data) {
   if (err) return error(res, 'failed to run the query', err);
   data.forEach(function (row) {
     deadlines.push({
       id: row.id,
       title: row.title,
       description: row.description,
       dueDate: row.dueDate
     });
   });
   res.json(deadlines);
 });
}

/**
 * Function to update a deadline
 * Uses the req.params.id to get the deadline id to update
 */
function updateDeadline(req, res) {
  var title = req.body.title,
      desc = req.body.description,
      date = req.body.date,
      id = req.params.id;
  sql.query('UPDATE deadlines SET title= ? , description= ? , dueDate= ? WHERE id = ?', [title, desc, date, id], function(err) {
    if (err) console.log("Error inserting");
    if (req.accepts('html')) {
      // browser should go to the listing of deadlines
      res.redirect(303, '/#' + id);
    } else {
      res.header("Access-Control-Allow-Origin", "*").sendStatus(200);
      // XML HTTP request that accepts JSON will instead get that
      res.json({id: id, title: title, description: desc, dueDate: date});
    }
  });
}

/**
 * Function to upload a deadline into the database
 * Creates the dbRecord and queries the database
 */
function uploadDeadline(req, res) {
 //Add deadline to the database
 var dbRecord = {
   title: req.body.title,
   description: req.body.description,
   dueDate: req.body.date
 };
 sql.query(sql.format('INSERT INTO deadlines SET ?', dbRecord), function (err, result) {
   if (err) console.log("Error inserting");
   if (req.accepts('html')) {
     // browser should go to the listing of deadlines
     res.redirect(303, '/#' + result.insertId);
   } else {
     res.header("Access-Control-Allow-Origin", "*").sendStatus(200);
     // XML HTTP request that accepts JSON will instead get that
     res.json({id: result.insertedId, title: dbRecord.title, description: dbRecord.description, dueDate: dbRecord.dueDate});
   }
 });
}

/**
 * Function to send the units list in order to be able to print the units
 * @return the list of units
 */
function sendUnits(req, res) {
 var units = [];
 // prepare query
 var query = 'SELECT id, unitShortCode, unitLongName, unitColour FROM units';
 // now query the table and output the results
 sql.query(query, function (err, data) {
   if (err) return error(res, 'failed to run the query', err);
   data.forEach(function (row) {
     units.push({
       id: row.id,
       shortCode: row.unitShortCode,
       longCode: row.unitLongName,
       colour: row.unitColour
     });
   });
   res.json(units);
 });
}

/**
 * Function to add a unit to the database
 * Creates a dbRecord and then queries the database
 */
function uploadUnit(req, res) {
 //Add unit to the database
 var dbRecord = {
   unitShortCode: req.body.unitShortCode,
   unitLongName: req.body.unitLongName,
   unitColour: req.body.unitColour
 };
 sql.query(sql.format('INSERT INTO units SET ?', dbRecord), function (err, result) {
   if (err) console.log("Error inserting");
   if (req.accepts('html')) {
     // browser should go to the listing of units
     res.redirect(303, '/#' + result.insertId);
   } else {
     res.header("Access-Control-Allow-Origin", "*").sendStatus(200);
     // XML HTTP request that accepts JSON will instead get that
     res.json({id: result.insertedId, unitShortCode: dbRecord.unitShortCode, unitLongName: dbRecord.unitLongName, unitColour: dbRecord.unitColour});
   }
 });
}

/**
 * Function to delete a deadline
 * if req.query.title is not false it will delete all the deadlines that have the same title (unit)
 * this is used in unit delete so that a deadline cannot exist if its unit does not
 */
function deleteDeadline(req, res) {
  if ([req.query.title] != 'false') {
    sql.query(sql.format('DELETE FROM deadlines WHERE title=?', [req.query.title]), function (err, result) {
      if (err) return error(res, 'failed sql delete', err);
      res.sendStatus(200);
    });
  } else {
    sql.query(sql.format('DELETE FROM deadlines WHERE id=?', [req.query.id]), function (err, result) {
      if (err) return error(res, 'failed sql delete', err);
      res.sendStatus(200);
    });
  }
}

/**
 * Function to delete a unit from the database
 */
function deleteUnit(req, res) {
  sql.query(sql.format('DELETE FROM units WHERE id=?', [req.query.id]), function (err, result) {
    if (err) return error(res, 'failed sql delete', err);
    res.sendStatus(200);
  });
}

/**
 * Function to send the list of apis
 * @return the list of apis
 */
function sendApis(req, res) {
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
    res.json(apiList);
  });
}

/**
 * Function to get the saved layout of the dashboard
 * Used to add each id to the dashboard
 */
function getLayout(req, res) {
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
    res.json(layout);
  });
}

/**
 * Function to update the layout table
 * Called when one api is changed in the settings menu
 */
function updateLayout(req, res) {
  var boxId = req.body.boxid,
      boxNo = req.params.boxno;
  sql.query('UPDATE layout SET boxId= ? WHERE boxNo = ?', [boxId, boxNo], function(err) {
    if (err) console.log("Error inserting");
    if (req.accepts('html')) {
      // browser should go to the listing of deadlines
      res.redirect(303, '/#' + boxNo);
    } else {
      res.header("Access-Control-Allow-Origin", "*").sendStatus(200);
      // XML HTTP request that accepts JSON will instead get that
      res.json({boxNo: boxNo, boxId: boxId});
    }
  });
}
