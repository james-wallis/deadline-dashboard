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

app.get('/api/deadlines', sendDeadlines);
app.post('/api/deadlines', uploadDeadline);
app.get('/api/units', sendUnits);
app.post('/api/units', uploadUnit);
app.delete('/api/deadlines', deleteDeadline);




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
function sendDeadlines(req, res) {
 var deadlines = [];

 // prepare query
 var query = 'SELECT id, title, description, dueDate FROM deadlines';


 //Used for the search function in the ws_api webscript
 if (req.query.title) {
   query += ' WHERE title LIKE ' + sql.escape('%' + req.query.title + '%');
 }

 //Where ensures that we do not see past deadlines
 query += ' WHERE dueDate >= CURRENT_DATE()';
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
 sql.query(sql.format('DELETE FROM deadlines WHERE id=?', [req.query.id]), function (err, result) {
   if (err) return error(res, 'failed sql delete', err);
   res.sendStatus(200);
 });
}
