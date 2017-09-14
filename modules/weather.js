require('dotenv').config();
var weatherApiKey = process.env.WEATHER_API_KEY;
var weatherLocation;
var app, io, client;
var weather = {
  city: '',
  country: '',
  short_description: '',
  long_description: '',
  celsius: 0,
  sunrise: 0,
  sunset: 0
};
var interval;

function passGlobals(newApp, newIO, newClient) {
  app = newApp;
  io = newIO;
  client = newClient;
}

function scrape(seconds) {
  seconds = seconds * 1000;
  getWeather();
  interval = setInterval(getWeather, seconds);
}

function stop() {
  clearInterval(interval);
}

function getWeather() {
  var url = 'http://api.openweathermap.org/data/2.5/weather?q='
            +weatherLocation+'&appid='+weatherApiKey
            +'&units=metric';
  client.get(url, function(data) {
    newWeather = {
      city: data.name,
      country: data.sys.country,
      short_description: data.weather[0].main,
      long_description: data.weather[0].description,
      celsius: data.main.temp,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset
    };
    if (newWeather.long_description !== weather.long_description ||
        newWeather.short_description !== weather.short_description ||
        newWeather.celsius !== weather.celsius) {
          weather = newWeather;
          sendWeather();
    }
  });
}

function sendWeather() {
  if (weather.short_description !== '') {
    io.emit('weather', weather);
  }
}

function setLocation(location) {
  weatherLocation = location;
}

function getLocation() {
  return weatherLocation;
}

//Export functions
module.exports = {
  passGlobals: passGlobals,
  scrape: scrape,
  stop: stop,
  get: getWeather,
  send: sendWeather,
  setLocation: setLocation,
  getLocation: getLocation
};
