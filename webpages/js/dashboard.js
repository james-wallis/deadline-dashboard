//Global Variables
var newsapiKey = 'f8b6dcb74300468589b50a53dca36a4c';
var numStoriesToShow = 3;
var intervals = false;

//Name used in main greeting
var userFirstName;











/**
 * Function to add the user details to global variables
 * @param session, contains the user details from the database
 */
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
    greyscale = session.greyscale;
    //Load API after variables are set
    loadPageSetIntervals();
  }
}

/**
 * Function to check whether an object is empty
 */
function isEmptyObject(obj) {
  for (var key in obj) {
    return false;
  }
  return true;
}

/**
 * Function to create the sign up button which is run if there
 * is no users in the user table
 */
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

/**
 * function to load all api's and set intervals for their refresh
 */
function loadPageSetIntervals() {
  getNews();
  // getRandQuote();
  updateDateTime();
  if (!intervals) {
    setInterval(getRandQuote, 300000);
    setInterval(getNews, 300000);
    intervals = true;
  }
}

/**
 * Function to get all news apis from newsAPI.org
 */
function getNews() {
  getBBCNews();
  getBBCSport();
  getFourFourTwoNews();
  getTechCrunchNews();
  getGuardianNews();
  // getGoogleNews();
  // getItalianFootballNews();
  // getFinancialTimesNews();
  // getWashingtonPostNews();
  // getCNNNews();
}

/**
 * Function to get the BBC News from newsAPI.org
 */
function getBBCNews() {
  getNewsApi('bbc-news', 'bbc-news-div');
}

/**
 * Function to get the BBC Sport from newsAPI.org
 */
function getBBCSport() {
  getNewsApi('bbc-sport', 'bbc-sport-div');
}

/**
 * Function to get the guardian from newsAPI.org
 */
function getGuardianNews() {
  getNewsApi('the-guardian-uk', 'guardian-news-div');
}

/**
 * Function to get the FourFourTwo from newsAPI.org
 */
function getFourFourTwoNews() {
  getNewsApi('four-four-two', 'fourfourtwo-news-div');
}

/**
 * Function to get the tech crunch News from newsAPI.org
 */
function getTechCrunchNews() {
  getNewsApi('techcrunch', 'tech-crunch-div');
}

/**
 * Function to get the google news from newsAPI.org
 */
function getGoogleNews() {
  getNewsApi('google-news', 'google-news-div');
}

/**
 * Function to get the italian football news from newsAPI.org
 */
function getItalianFootballNews() {
  getNewsApi('football-italia', 'football-italia-div');
}

/**
 * Function to get the financial-times news from newsAPI.org
 */
function getFinancialTimesNews() {
  getNewsApi('financial-times', 'financial-time-div');
}

/**
 * Function to get the washington post from newsAPI.org
 */
function getWashingtonPostNews() {
  getNewsApi('the-washington-post', 'washington-post-div');
}

/**
 * Function to get the CNN News from newsAPI.org
 */
function getCNNNews() {
  getNewsApi('cnn', 'cnn-div');
}

/**
 * Function to get news from newsAPI.org
 * @param the newsSource, needed to load the api
 * @param the divId, the id of the div to load the data to
 */
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

/**
 * Function to load the news to the dashboard
 * @param news, the list of news articles from newsAPI.org
 * @param divId, the id of the div to load the news articles to
 */
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






/**
 * Function to get a random quote
 */
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

/**
 * Function to add a random quote to the dashboard
 */
function loadQuoteToDashboard(quote) {
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



/**
 * Function to load the available apis to the api selection list inside settings
 * @param apiList, the list of available api's
 */
function loadAPISelectorSettings(apiList) {
  console.log(apiList);
  var contentSelector = document.getElementById('contentSelector');
  var boxes = document.getElementsByClassName('dashboard-inner-box');
  contentSelector.innerHTML = '';
  for (var i = 0; i < 8; i++) {
    var div = document.createElement('div');
    div.classList.add('api-selector-div');
    contentSelector.appendChild(div);

    var h = document.createElement('h4');
    h.textContent = "Dashboard Box: "+(i+1);
    div.appendChild(h);

    var select = document.createElement('select');
    select.classList.add('api-selector');
    select.dataset.boxNo = i;
    div.appendChild(select);

    var option = document.createElement('option');
    option.setAttribute("hidden", "");
    option.setAttribute("selected", "");
    option.setAttribute("disabled", "");
    option.textContent = "Choose API";
    select.appendChild(option);

    apiList.forEach(function (api) {
      option = document.createElement('option');
      option.value = api.htmlid;
      option.textContent = api.name;
      option.dataset.isNews = api.isNews;
      option.style.textTransform = 'capitalize';
      //If current option is equal to the id of the current dashboard box
      // then make the current option selected
      if (boxes[i].id == api.htmlid) {
        option.setAttribute("selected", "");
      }
      select.appendChild(option);
    });
    document.getElementsByClassName('api-selector')[i].addEventListener("change", updateBoxApi);
  }
}

/**
 * Function to change what content is shown in the boxes on the dashboard
 */
function updateBoxApi(e) {
  var boxNo = e.target.dataset.boxNo;
  var boxes = document.getElementsByClassName('dashboard-inner-box');
  var box = boxes[boxNo];
  var isNews = e.target.dataset.isNews;
  box.id = e.target.value;
  if (isNews) {
    if (!box.classList.contains('news-div')) {
      box.classList.add('news-div');
    }
  } else {
    if (box.classList.contains('news-div')) {
      box.classList.remove('news-div');
    }
  }
  boxNo = parseInt(boxNo)+1;
  updateLayoutTable((boxNo), box.id);
  loadPageSetIntervals();
}



/**
 * Function to add the correct id to the correct box to display api's
 */
function layoutAddIdToBoxes(layout) {
  console.log(layout);
  var boxes = document.getElementsByClassName('dashboard-inner-box');
  for (var i = 0; i < layout.length; i++) {
    boxes[i].id = layout[i].boxId;
  }
}




























//Fixed Code
//Socket.io functions
socket.on('sessionVariables', setGlobalVariables);
socket.on('layout', layoutAddIdToBoxes);
socket.on('apis', loadAPISelectorSettings);
socket.on('lastfmNowPlaying', showLastfmNowPlaying);
socket.on('weather', loadWeatherToDashboard);
socket.on('monzoBalance', showMonzoAccountBalance);






/**
 * Function to add a link to the Monzo Authorisation page
 * Will be overwritten is user is already logged in
 */
function showMonzoAuthorise() {
  var monzoBalanceDiv = document.getElementById('monzo-balance-div');
  monzoBalanceDiv.innerHTML = '';
  var h = document.createElement('h4');
  h.textContent = 'Monzo';
  monzoBalanceDiv.appendChild(h);
  var p = document.createElement('p');
  p.textContent = 'Please authorise your account';
  monzoBalanceDiv.appendChild(p);
  p = document.createElement('p');
  p.textContent = 'to be used with this application';
  monzoBalanceDiv.appendChild(p);
  var a = document.createElement('a');
  a.textContent = 'Authorisation';
  a.href = '/auth/monzo';
  monzoBalanceDiv.appendChild(a);

}

/**
 * Function to load the current Monzo Account balance to the dashboard
 */
function showMonzoAccountBalance(json) {
  // json = JSON.parse(json);
  console.log(json);
  var balance = (json.balance/100).toFixed(2);
  var spendToday = (json.spend_today/100).toFixed(2);
  spendToday = spendToday.substr(1);
  var monzoBalanceDiv = document.getElementById('monzo-balance-div');
  monzoBalanceDiv.innerHTML = '';
  var h = document.createElement('h4');
  h.textContent = 'Monzo';
  monzoBalanceDiv.appendChild(h);
  h = document.createElement('h5');
  h.textContent = 'Account Balance';
  monzoBalanceDiv.appendChild(h);
  var p = document.createElement('p');
  p.textContent = '£' + balance;
  monzoBalanceDiv.appendChild(p);
  h = document.createElement('h5');
  h.textContent = 'Amount Spent Today';
  monzoBalanceDiv.appendChild(h);
  p = document.createElement('p');
  p.textContent = '£' + spendToday;
  monzoBalanceDiv.appendChild(p);

}




/**
 * Function to load the current playing track to the dashboard
 */
function showLastfmNowPlaying(music) {
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

/**
 * Function to print the weather to the dashboard
 */
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
}

/**
 * Function to update the layout table with the new layout of the dashboard
 */
function updateLayoutTable(boxNo, boxId) {
  var json = JSON.stringify({
                  boxid: boxId,
                  boxno: boxNo
                });
  socket.emit('updateLayout', json);
}













































/**
 * Time functions for the dashboard
 * These were meant to be exported but I ran out of time so they are here
 * After coureswork submission this will be changed so that they are exported
 */

var timerSet = false;

/**
 * Function to update the date and time on the dashboard
 */
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
/**
 * Function to show the current time on the dashboard
 * @param date, the date for the dashboard
 */
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

/**
 * Function to show the current time of day on the dashboard
 * @param date, the date for the dashboard
 */
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

/**
 * Function to show the day of the week on the dashboard
 * @param date, the date for the dashboard
 */
function showDayOfTheWeek(date) {
  var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var day = days[ date.getDay() ];
  document.getElementById('dayOfTheWeek').textContent = day;
}

/**
 * Function to show the month on the dashboard
 * @param date, the date for the dashboard
 */
function showDateMonth(date) {
  var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var month = months[ date.getMonth() ];
  var formattedDate = (date.getDate()+formatDate(date.getDate));
  document.getElementById('dateMonth').textContent = (formattedDate + " " + month);
}

/**
 * Function to format the date so that it has the correct ending
 * @param date, the date for the dashboard
 */
function formatDate(date) {
  if(date>3 && date<21) return 'th';
  switch (date % 10) {
        case 1:  return "st";
        case 2:  return "nd";
        case 3:  return "rd";
        default: return "th";
    }
}
