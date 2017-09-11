//Requires
require('dotenv').config();
var monzoBank = require('monzo-bank');
var app, io, client;


//Globals
var newsApiKey = process.env.NEWS_API_KEY;



//Functions
function passGlobals(newApp, newIO, newClient) {
  app = newApp;
  io = newIO;
  client = newClient;
  getNews();
  // Set up Redirects
}

function scrape(seconds) {
  seconds = seconds * 1000;
  // ();
  // setInterval(, seconds);
}

function getNews() {
  client.get('https://newsapi.org/v1/articles?source='+'bbc-sport'+
            '&sortBy=top&apiKey='+newsApiKey, function (data, response) {
    // parsed response body as js object
    // console.log(data);
  });
}

//Export functions
module.exports = {
  scrape: scrape,
  passGlobals: passGlobals,
  get: getNews
};
