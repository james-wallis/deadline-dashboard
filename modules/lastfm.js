require('dotenv').config();
var lastfmApiKey = process.env.LAST_FM_API_KEY;
var lastfmUser = '';
var app, io, client;
var lastfmNowPlaying = {
  name: '',
  artist: '',
  now_playing: false
};
var interval;

function passGlobals(newApp, newIO, newClient) {
  app = newApp;
  io = newIO;
  client = newClient;
}

function scrape(seconds) {
  seconds = seconds * 1000;
  getLastFM();
  interval = setInterval(getLastFM, seconds);
}

function stop() {
  clearInterval(interval);
}

function getLastFM() {
  var url = 'https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user='+
              lastfmUser+'&api_key='+lastfmApiKey+'&limit=1&format=json';
  client.get(url, function(data) {
    if (data.recenttracks !== undefined) {
      var obj = data.recenttracks.track[0];
      if (obj.date == undefined) {
        // console.log(obj);
        var track = {
          name: obj.name,
          artist: obj.artist["#text"],
          now_playing: true
        };
        console.log(track);
        // If track change, send to clients
        if (lastfmNowPlaying.name !== track.name) {
          lastfmNowPlaying = track;
          sendLastFM();
        }
      }
    } else if (lastfmNowPlaying.now_playing) {
      // When stops playing, update page
      lastfmNowPlaying.now_playing = false;
      sendLastFM();
    }
  }).on('error', function (err) {
    console.log('error getting now playing');
  });
}

function sendLastFM() {
  if (lastfmNowPlaying.name !== '') {
    io.emit('lastfmNowPlaying', lastfmNowPlaying);
  }
}

function setUser(user) {
  lastfmUser = user;
}

function getUser() {
  return user;
}

//Export functions
module.exports = {
  passGlobals: passGlobals,
  scrape: scrape,
  stop: stop,
  get: getLastFM,
  send: sendLastFM,
  setUser: setUser,
  getUser: getUser
};
