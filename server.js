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

//Set up session
app.use(cookieParser());
app.use(session({ secret: 'webscriptdashboard2017', cookie: { maxAge: 60000 }, resave: true, saveUninitialized: true }))




/** bodyParser.urlencoded(options)
 * Parses the text as URL encoded data (which is how browsers tend to send form data from regular forms set to POST)
 * and exposes the resulting object (containing the keys and values) on req.body
 */
app.use(bodyParser.urlencoded({
    extended: true
}));

/**bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.
 */
app.use(bodyParser.json());



// logging in order to fully understand what the API is doing
app.use('/', function(req, res, next) { console.log(new Date(), req.method, req.url); next(); });


// server api
//   POST /api/deadlines     - upload a new deadline, its title, desc and its due date, returns {id: ..., title: ..., desc: ..., duedate...}
//   GET  /api/deadlines     - list pictures ordered by time from most recent, returns [like above, like above, ...]
//         ?order=...       - ordered by closest deadline
//         ?unit=...       - search by course units
//   DELETE /api/deadlines/x - returns http status code only

app.get('/api/user', sendSessionVariables);
app.post('/api/user', addUser);
app.get('/api/deadlines', sendDeadlines);
app.post('/api/deadlines/:id', updateDeadline);
app.post('/api/deadlines', uploadDeadline);
app.get('/api/units', sendUnits);
app.post('/api/units', uploadUnit);
app.delete('/api/deadlines', deleteDeadline);
app.delete('/api/units', deleteUnit);




// start the server
app.listen(8080);


/* server functions
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

function addUser(req, res) {
  var dbRecord = {
    userFirstName: req.body.firstname,
    userLastName: req.body.lastname,
    userLastFMName: req.body.lastfm,
    userCity: req.body.city,
    user24hrTime: req.body.time,
    userDeadlineGrayScale: req.body.greyscale
  };
  console.log(sql.format('INSERT INTO user SET ? ', dbRecord));
  sql.query(sql.format('INSERT INTO user SET ? ', dbRecord), function (err, result) {
    if (err) console.log("Error inserting");
    console.log(err);
    console.log(dbRecord);
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

function sendDeadlines(req, res) {
 var deadlines = [];
 // prepare query
 var query = 'SELECT id, title, description, dueDate FROM deadlines';
 //Where ensures that we do not see past deadlines
 query += ' WHERE dueDate >= CURRENT_DATE()';
 if (req.query.id) {
   query += ' AND id = '+sql.escape(req.query.id)
 }
 else if (req.query.title) {
   query += ' WHERE title LIKE ' + sql.escape('%' + req.query.title + '%');
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
 console.log(query);
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

function updateDeadline(req, res) {
  console.log(req.body.title);
  console.log(req.body.description);
  console.log(req.body.date);
  console.log(req.params.id);
  var title = req.body.title,
      desc = req.body.description,
      date = req.body.date,
      id = req.params.id;
  sql.query('UPDATE deadlines SET title= ? , description= ? , dueDate= ? WHERE id = ?', [title, desc, date, id], function(err) {
    console.log('UPDATE deadlines SET ? WHERE ?', [{ title: title }, { description: desc }, { dueDate: date}]);
    // if (!err) {
    //   res.status(201);
    // } else {
    //   res.status(500);
    // }
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

function uploadDeadline(req, res) {
 console.log(req.body.title);
 console.log(req.body.description);
 console.log(req.body.date);
 //Add deadline to the database
 var dbRecord = {
   title: req.body.title,
   description: req.body.description,
   dueDate: req.body.date
 };
 console.log(sql.format('INSERT INTO deadlines SET ?', dbRecord));
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

function sendUnits(req, res) {
 var units = [];
 // prepare query
 var query = 'SELECT id, unitShortCode, unitLongName, unitColour FROM units';
 console.log(query);
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

function uploadUnit(req, res) {
 console.log(req.body.unitShortCode);
 console.log(req.body.unitLongName);
 console.log(req.body.unitColour);
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

function deleteDeadline(req, res) {
  console.log("Log"+[req.query.title]);
  if ([req.query.title] != 'false') {
    console.log("TITLE");
    sql.query(sql.format('DELETE FROM deadlines WHERE title=?', [req.query.title]), function (err, result) {
      if (err) return error(res, 'failed sql delete', err);
      res.sendStatus(200);
    });
  } else {
    console.log("ID");
    sql.query(sql.format('DELETE FROM deadlines WHERE id=?', [req.query.id]), function (err, result) {
      if (err) return error(res, 'failed sql delete', err);
      res.sendStatus(200);
    });
  }
}

function deleteUnit(req, res) {
  sql.query(sql.format('DELETE FROM units WHERE id=?', [req.query.id]), function (err, result) {
    if (err) return error(res, 'failed sql delete', err);
    res.sendStatus(200);
  });
}
