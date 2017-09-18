var app, io, sql;

module.exports = {

  passGlobals: function(newApp, newIO, newSql) {
    app = newApp;
    io = newIO;
    sql = newSql;
  },
  /**
   * Function to send the list of deadlines
   * @return the list of deadlines created when the database was queried
   */
  sendDeadlines: function(req, res) {
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
 },

  /**
   * Function to update a deadline
   * Uses the req.params.id to get the deadline id to update
   */
  updateDeadline: function(req, res) {
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
  },

  /**
   * Function to upload a deadline into the database
   * Creates the dbRecord and queries the database
   */
  uploadDeadline: function(req, res) {
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
 },

  /**
   * Function to send the units list in order to be able to print the units
   * @return the list of units
   */
  sendUnits: function(req, res) {
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
 },

  /**
   * Function to add a unit to the database
   * Creates a dbRecord and then queries the database
   */
  uploadUnit: function(req, res) {
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
 },

  /**
   * Function to delete a deadline
   * if req.query.title is not false it will delete all the deadlines that have the same title (unit)
   * this is used in unit delete so that a deadline cannot exist if its unit does not
   */
  deleteDeadline: function(req, res) {
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
  },

  /**
   * Function to delete a unit from the database
   */
  deleteUnit: function(req, res) {
    sql.query(sql.format('DELETE FROM units WHERE id=?', [req.query.id]), function (err, result) {
      if (err) return error(res, 'failed sql delete', err);
      res.sendStatus(200);
    });
  }
}
