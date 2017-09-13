require('dotenv').config();
var googlemapsDistanceMatrixApiKey = process.env.GOOGLE_MAPS_DISTANCEMATRIX_API_KEY;
var googlemapsDirectionsApiKey = process.env.GOOGLE_MAPS_DIRECTIONS_API_KEY;
var origin = 'SO172FE';
var destination = 'IBM Hursley';
var app, io, client;
var interval;
var googlemaps = {
  directions: {},
  distancematrix: {}
};

function passGlobals(newApp, newIO, newClient) {
  app = newApp;
  io = newIO;
  client = newClient;
  scrape();
}

function scrape(seconds = 6000) {
  seconds = seconds * 1000;
  getWorkTravelTime();
  interval = setInterval(getWorkTravelTime, seconds);
}

function stop() {
  clearInterval(interval);
}

function getWorkTravelTime() {
  var url = 'https://maps.googleapis.com/maps/api/directions/json?units=imperial&origin=' +
            origin + '&destination=' + destination + '&departure_time=now&key=' + googlemapsDirectionsApiKey;
  client.get(url, function(data) {
    googlemaps.directions.work = {
      origin: data.routes[0].legs[0].start_address,
      destination: data.routes[0].legs[0].end_address,
      duration: data.routes[0].legs[0].duration,
      distance: data.routes[0].legs[0].distance,
      duration_in_traffic: data.routes[0].legs[0].duration_in_traffic,
      summary: data.routes[0].summary
    }
    console.log(googlemaps.directions.work);
  });
}

function sendWorkTravelTime() {
  io.emit('googlemaps', googlemaps);
}


//Export functions
module.exports = {
  passGlobals: passGlobals,
  scrape: scrape,
  stop: stop,
  getWork: getWorkTravelTime,
  sendWork: sendWorkTravelTime
};
