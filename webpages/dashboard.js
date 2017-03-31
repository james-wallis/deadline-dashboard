//Global Variables
var newsapiKey = 'f8b6dcb74300468589b50a53dca36a4c';
var numStoriesToShow = 3;

//Name used in main greeting
var userFirstName;

//Last fm used for Spotify
var lastfmApiKey = 'dac2e4c07554948ac38f77058d557703';
var lastfmUser;


//Open Weather
var weatherApiKey = 'a358ab331ca3b397d65a029876f08d7b';
var weatherLocation;

//Event Listeners
//Get User details
window.addEventListener('load', getSession);
// window.addEventListener('load', loadPageSetIntervals);






function getSession() {
  var url = '/api/user';
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onload = function() {
    if (xhr.status === 200) {
      setGlobalVariables(JSON.parse(xhr.responseText));
    }
  }
  xhr.send();
}

function setGlobalVariables(session) {
  console.log(session);
  if(isEmptyObject(session)) {
    document.getElementById('container').innerHTML = '';
    createSignUpButton();
  } else {
    userFirstName = session.firstname;
    document.getElementById('greeting-firstname').textContent = userFirstName;
    lastfmUser = session.lastfmname;
    weatherLocation = session.city;
    //Load API after variables are set
    loadPageSetIntervals();
  }
}

function isEmptyObject(obj) {
  for (var key in obj) {
    return false;
  }
  return true;
}

function createSignUpButton() {
  document.getElementById('settings-icon').style.display = "none";
  var container = document.getElementById('container');
  container.classList.add('sign-up-button-div');
  var innerContainer = document.createElement('div');
  container.appendChild(innerContainer);

  var h = document.createElement('h1');
  h.textContent = 'Welcome to the Deadline-Dashboard';
  innerContainer.appendChild(h);

  var el = document.createElement('p');
  el.textContent = 'It appears that your user table is empty. This means \
                    that we need some details from you before we can \
                    proceed to the dashboard.';
  innerContainer.appendChild(el);

  el = document.createElement('p');
  el.textContent = 'Press the link below to proceed to the details page.';
  innerContainer.appendChild(el);

  el = document.createElement('a');
  el.textContent = 'Details Page';
  el.href = '/sign-up';
  innerContainer.appendChild(el);

}

//setInterval
function loadPageSetIntervals() {
  getBBCNews();
  getLastFMNowPlaying();
  getGuardianNews();
  getWeather();
  getRandQuote();
  getFourFourTwoNews();
  getTechCrunchNews();
  updateDateTime();
  setInterval(getBBCNews, 300000);
  setInterval(getLastFMNowPlaying, 1000);
  setInterval(getGuardianNews, 300000);
  setInterval(getWeather, 600000);
  setInterval(getRandQuote, 300000);
  setInterval(getFourFourTwoNews, 300000);
  setInterval(getTechCrunchNews, 300000);
}

function getBBCNews() {
  getNewsApi('bbc-news', 'bbc-news-div');
}
function getGuardianNews() {
  getNewsApi('the-guardian-uk', 'guardian-news-div');
}
function getFourFourTwoNews() {
  getNewsApi('four-four-two', 'fourfourtwo-news-div');
}
function getTechCrunchNews() {
  getNewsApi('techcrunch', 'tech-crunch-div')
}

function getNewsApi(newsSource, divId) {
  var url = 'https://newsapi.org/v1/articles?source='+newsSource+
            '&sortBy=top&apiKey='+newsapiKey;
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onload = function() {
    if (xhr.status === 200) {
      loadNewsToDashboard((JSON.parse(xhr.responseText)), divId);
    } else {
      console.error('error getting news', xhr);
    document.getElementById('news-div').innerHTML =
    'Sorry, there has been an error getting your news';
    }
  }
  xhr.send();
}

function loadNewsToDashboard(news, divId) {
  var newsDiv = document.getElementById(divId);
  newsDiv.classList.add('news-div');
  newsDiv.innerHTML = '';

  var h = document.createElement('h4');
  var title = news.source.replace(/-/g, ' ');
  h.textContent = title;
  // h.textContent = news.articles[0].author;
  newsDiv.appendChild(h);
  var newsCounter = 0;
  while (newsCounter < numStoriesToShow) {
    var article = news.articles[newsCounter];
    var el = document.createElement('p');
    el.textContent = article.title;
    newsDiv.appendChild(el);
    newsCounter++;
  }
}

function getLastFMNowPlaying() {
  var lastfmGetRecentTracksURL =
        'https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user='+
        lastfmUser+'&api_key='+lastfmApiKey+'&limit=1&format=json';
  var xhr = new XMLHttpRequest();
  xhr.open('GET', lastfmGetRecentTracksURL, true);
  xhr.onload = function() {
    if (xhr.status === 200) {
      loadLastFMToDashboard(JSON.parse(xhr.responseText));
    } else {
      console.error('error getting last fm data', xhr);
    document.getElementById('last-fm-div').innerHTML =
    'Sorry, there has been an error getting your deadlines';
    }
  }
  xhr.send();
}

function loadLastFMToDashboard(music) {
  var lastfmDiv = document.getElementById('last-fm-div');
  lastfmDiv.innerHTML = '';
  var currentTrack = music.recenttracks.track[0];
  var h = document.createElement('h4');
  h.textContent = 'LastFM/Spotify';
  lastfmDiv.appendChild(h);
  //Check if track is currently Playing
  //Sometimes doesn't work due to lastFmAPI
  if (currentTrack['@attr']) {
    var el = document.createElement('h5');
    el.textContent = 'Current Track';
    lastfmDiv.appendChild(el);

    el = document.createElement('p');
    el.textContent = currentTrack.name;
    lastfmDiv.appendChild(el);

    el = document.createElement('h5');
    el.textContent = 'Artist';
    lastfmDiv.appendChild(el);

    el = document.createElement('p');
    el.textContent = currentTrack.artist["#text"];
    lastfmDiv.appendChild(el);
    } else {
      var el = document.createElement('h5');
      el.textContent = 'Nothing Playing';
      lastfmDiv.appendChild(el);
    }
}

function getWeather() {
  var xhr = new XMLHttpRequest();
  var url = 'http://api.openweathermap.org/data/2.5/weather?q='
            +weatherLocation+'&appid='+weatherApiKey
            +'&units=metric';
  xhr.open('GET', url, true);
  xhr.onload = function() {
    if (xhr.status === 200) {
      loadWeatherToDashboard(JSON.parse(xhr.responseText));
    } else {
      console.error('error getting last fm data', xhr);
    document.getElementById('weather-div').innerHTML =
    'Sorry, there has been an error getting your weather';
    }
  }
  xhr.send();
}

function loadWeatherToDashboard(weather) {
  var weatherDiv = document.getElementById('weather-div');
  weatherDiv.innerHTML = '';
  var currentWeather = weather;
  var h = document.createElement('h4');
  h.textContent = 'Current Weather';
  weatherDiv.appendChild(h);

  h = document.createElement('h5');
  h.textContent = weather.name+ ' ('+weather.sys.country+')';
  weatherDiv.appendChild(h);

  var div = document.createElement('div');
  div.classList.add("weather-container");
  weatherDiv.appendChild(div);

  h = document.createElement('p');
  h.textContent = 'Current Sky: ';
  div.appendChild(h);
  var el = document.createElement('span');
  el.classList.add('weather-stats');
  el.textContent = weather.weather[0].description;
  h.appendChild(el);

  h = document.createElement('p');
  h.textContent = 'Current Temperature: ';
  div.appendChild(h);
  var el = document.createElement('span');
  el.classList.add('weather-stats');
  el.textContent = weather.main.temp+' Celsius';
  h.appendChild(el);

  var sunrise = new Date(weather.sys.sunrise*1000);
  var sunset = new Date(weather.sys.sunset*1000);

  el = document.createElement('p');
  el.textContent = 'Sunrise: '+sunrise.getHours()+':'+sunrise.getMinutes()+' AM';
  div.appendChild(el);

  el = document.createElement('p');
  el.textContent = 'Sunset: '+sunset.getHours()+':'+sunset.getMinutes()+' PM';
  div.appendChild(el);

  // getWeatherIcon(weather.weather[0].main);
}


function getRandQuote() {
  var xhr = new XMLHttpRequest();
  var url = 'http://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=1;'
  xhr.open('GET', url, true);
  xhr.onload = function() {
    if (xhr.status === 200) {
      loadQuoteToDashboard(JSON.parse(xhr.responseText));
    } else {
      console.error('error getting last fm data', xhr);
    document.getElementById('quote-div').innerHTML =
    'Sorry, there has been an error getting your quote';
    }
  }
  xhr.send();
}

function loadQuoteToDashboard(quote) {
  console.log(quote[0]);
  console.log(quote[0].title);
  console.log(quote[0].content);
  var quoteDiv = document.getElementById('quote-div');
  quoteDiv.innerHTML = '';

  var h = document.createElement('h4');
  h.textContent = 'Random Quote';
  quoteDiv.appendChild(h);

  var div = document.createElement('div');
  div.innerHTML = quote[0].content;
  quoteDiv.appendChild(div);

  var el = document.createElement('p');
  el.textContent = quote[0].title;
  div.appendChild(el);
}

























//Time functions -- need to be added to an export

var timerSet = false;

function updateDateTime() {
  var date = new Date();
  showCurrentTime(date);
  showTimeOfDay(date);
  showDayOfTheWeek(date);
  showDateMonth(date);
  if (!timerSet) {
    setInterval(updateDateTime, 1000);
    timerSet = true;
  }
}
function showCurrentTime(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? ' PM' : ' AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var stringTime = hours + ':' + minutes + ' ' + ampm;
    document.getElementById('currentTime').textContent = stringTime;
}

function showTimeOfDay(date) {
  var hours = date.getHours();
  var timeOfDay;
  if (hours < 12) {
    timeOfDay = "Good Morning";
  }
  else if (hours < 18) {
    timeOfDay = "Good Afternoon"
  }
  else {
    timeOfDay = "Good Evening"
  }
  document.getElementById('timeOfDay').textContent = timeOfDay;
}

function showDayOfTheWeek(date) {
  var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var day = days[ date.getDay() ];
  document.getElementById('dayOfTheWeek').textContent = day;
}

function showDateMonth(date) {
  var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var month = months[ date.getMonth() ];
  var formattedDate = (date.getDate()+formatDate(date.getDate));
  document.getElementById('dateMonth').textContent = (formattedDate + " " + month);
}
function formatDate(date) {
  if(date>3 && date<21) return 'th';
  switch (date % 10) {
        case 1:  return "st";
        case 2:  return "nd";
        case 3:  return "rd";
        default: return "th";
    }
}
