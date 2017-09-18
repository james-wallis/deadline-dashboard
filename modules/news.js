//Requires
require('dotenv').config();
var monzoBank = require('monzo-bank');
var app, io, client, sql;
var newsSources = [];
var currentSources = [];
var articles = [];

//Globals
var newsApiKey = process.env.NEWS_API_KEY;


//Functions
function passGlobals(newApp, newIO, newClient, newSql) {
  app = newApp;
  io = newIO;
  client = newClient;
  sql = newSql;
  var query = 'SELECT * FROM newsApis';
  sql.query(query, function (err, data) {
    if (err) console.log('failed to run the query', err);
    for (var i = 0; i < data.length; i++) {
      newsSources.push(data[i].api);
    }
  });
  // Set up Redirects
}

function scrape(seconds) {
  seconds = seconds * 1000;
  getNews();
  setInterval(getNews, seconds);
}

function getNews() {
  currentSources = newsSources;
  articles = [];
  for (var i = 0; i < currentSources.length; i++) {
    var source = currentSources[i];
    client.get('https://newsapi.org/v1/articles?source='+source+
              '&sortBy=top&apiKey='+newsApiKey, function (data, response) {
      articles.push(data);
      if (articles.length === currentSources.length) {
        sendNews();
      }
    });
  }
}

function sendNews() {
  if (articles.length === 0) {
    getNews();
  } else {
    io.emit('articles', articles);
  }
}

//Export functions
module.exports = {
  scrape: scrape,
  passGlobals: passGlobals,
  get: getNews,
  send: sendNews
};
