//Global Variables
var numStoriesToShow = 3;
var apiList;
//Name used in main greeting
var userFirstName;
// Current data from server
// var currentData = {
//   news: {},
//   lastfm: {},
//   weather: {},
//   monzo: {
//     balance: {}
//   }
// }
var currentData = {};
var pageInitialised = false;



//Fixed Code
//Socket.io functions
socket.on('variables', setUpPage);
socket.on('sessionVariables', setGlobalVariables);
socket.on('layout', layoutAddIdToBoxes);
socket.on('apis', loadAPISelectorSettings);
socket.on('login', createSignUpButton);
socket.on('refreshPage', showData);

// If page is initialised already then the socket.on will run the
// function directly related to the updated data, if not it will be collected
// in order to be ready to be added when the page is ready to be populated
socket.on('timeAndDate', function(timeAndDate) {
  if (pageInitialised) {
    showTimeAndDate(timeAndDate);
  }
  currentData.timeAndDate = timeAndDate;
});
socket.on('lastfmNowPlaying', function(nowPlaying) {
  if (pageInitialised) {
    showLastfmNowPlaying(nowPlaying);
  }
  currentData.lastfm = nowPlaying;
});

socket.on('weather', function(weather) {
  if (pageInitialised) {
    loadWeatherToDashboard(weather);
  }
  currentData.weather = weather;
});

socket.on('monzoBalance', function(balance) {
  if (pageInitialised) {
    showMonzoAccountBalance(balance);
  }
  currentData.monzo.balance = balance;
});
socket.on('showMonzoLogin', showMonzoLogin);

socket.on('articles', function(articles) {
  if (pageInitialised) {
    seperateArticles(articles);
  }
  currentData.articles = articles;
});

socket.on('googlemaps', function(googlemaps) {
  if (pageInitialised) {
    seperateGoogleMaps(googlemaps);
  }
  currentData.googlemaps = googlemaps;
});





function setUpPage(variables) {
  if (!!variables.session) {
    setGlobalVariables(variables.session);
  }
  layoutAddIdToBoxes(variables.activeApis);
  apiList = variables.apiList;
  loadAPISelectorSettings(variables.apiList);

  // Run show data when data is present in currentData
  var checker = setInterval(checkForData, 1);
  function checkForData() {
    showData();
    clearInterval(checker);
  }
}

function showData() {
  data = currentData;
  if (data !== {}) {
    console.log(data);
    if (!!data.monzo) {
      if (!!data.monzo.balance) {
        showMonzoAccountBalance(data.monzo.balance);
      }
    }
    if (!!data.lastfm) {
      showLastfmNowPlaying(data.lastfm);
    }
    if (!!data.weather) {
      loadWeatherToDashboard(data.weather);
    }
    if (!!data.timeAndDate) {
      showTimeAndDate(data.timeAndDate);
    }
    if (!!data.articles) {
      seperateArticles(data.articles);
    }
    if(!!data.googlemaps) {
      seperateGoogleMaps(data.googlemaps);
    }
  }
  pageInitialised = true;
}

/**
 * Function to add the user details to global variables
 * @param session, contains the user details from the database
 */
function setGlobalVariables(session) {
  userFirstName = session.firstname;
  document.getElementById('greeting-firstname').textContent = userFirstName;
  lastfmUser = session.lastfmname;
  weatherLocation = session.city;
  greyscale = session.greyscale;
}

/**
 * Function to create the sign up button which is run if there
 * is no users in the user table
 */
function createSignUpButton() {
  document.getElementById('container').innerHTML = '';
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

function seperateArticles(articles) {
  for (var i = 0; i < articles.length; i++) {
    if (!!document.getElementById(articles[i].source)) {
      loadNewsToDashboard(articles[i]);
    }
  }
}

/**
 * Function to load the news to the dashboard
 * @param articles, the list of news articles from newsAPI.org
 * @param divId, the id of the div to load the news articles to
 */
function loadNewsToDashboard(article) {
  var newsDiv = document.getElementById(article.source);
  newsDiv.classList.add('news-div');
  newsDiv.innerHTML = '';

  var h = document.createElement('h4');
  var title = article.source.replace(/-/g, ' ');
  h.textContent = title;
  // h.textContent = news.articles[0].author;
  newsDiv.appendChild(h);
  var newsCounter = 0;
  while (newsCounter < numStoriesToShow) {
    var story = article.articles[newsCounter];
    var el = document.createElement('p');
    el.textContent = story.title;
    newsDiv.appendChild(el);
    newsCounter++;
  }
}



/**
 * Function to load the available apis to the api selection list inside settings
 * @param apiList, the list of available api's
 */
function loadAPISelectorSettings(list) {
  console.log(list);
  apiList = list;
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
}



/**
 * Function to add the correct id to the correct box to display api's
 */
function layoutAddIdToBoxes(list) {
  console.log(list);
  var boxes = document.getElementsByClassName('dashboard-inner-box');
  for (var i = 0; i < boxes.length; i++) {
    for (var j = 0; j < list.length; j++) {
      if (list[j].boxNo === (i+1)) {
        boxes[i].id = list[j].htmlid;
      }
    }
  }
}


/**
 * Function to update the layout table with the new layout of the dashboard
 */
function updateLayoutTable(boxNo, boxId) {
  var json = {
    oldApi: '',
    newApi: '',
    newApiBoxNo: ''
  };
  // Set current box to unactive
  for (var i = 0; i < apiList.length; i++) {
    if (apiList[i].boxNo == boxNo) {
      apiList[i].activeApi = 0;
      apiList[i].boxNo = -1;
      json.oldApi = apiList[i];
    }
  }
  // Set new box to active
  for (var i = 0; i < apiList.length; i++) {
    if (apiList[i].htmlid == boxId) {
      apiList[i].activeApi = 1;
      apiList[i].boxNo = boxNo;
      json.newApi = apiList[i];
    }
  }
  // json = JSON.stringify(json);
  socket.emit('updateLayout', json);
  socket.emit('updateApiList', apiList);
}

function showTimeAndDate(json) {
  document.getElementById('currentTime').textContent = json.time;
  document.getElementById('timeOfDay').textContent = json.timeOfDay;
  document.getElementById('dayOfTheWeek').textContent = json.day;
  document.getElementById('dateMonth').textContent = json.date;
}


/**
 * Function to add a link to the Monzo Authorisation page
 * Will be overwritten is user is already logged in
 */
function showMonzoLogin() {
  var monzoBalanceDiv = document.getElementById('monzo-balance-div');
  if (!!monzoBalanceDiv) {
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
    a.style.cssText = 'text-align: center; display: block';
    monzoBalanceDiv.appendChild(a);
  }
}

/**
 * Function to load the current Monzo Account balance to the dashboard
 */
function showMonzoAccountBalance(json) {
  // json = JSON.parse(json);
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
function showLastfmNowPlaying(track) {
  var lastfmDiv = document.getElementById('last-fm-div');
  lastfmDiv.innerHTML = '';
  var h = document.createElement('h4');
  h.textContent = 'LastFM/Spotify';
  lastfmDiv.appendChild(h);
  //Check if track is currently Playing
  //Sometimes doesn't work due to lastFmAPI
  if (track.now_playing) {
    var el = document.createElement('h5');
    el.textContent = 'Current Track';
    lastfmDiv.appendChild(el);

    el = document.createElement('p');
    el.textContent = track.name;
    lastfmDiv.appendChild(el);

    el = document.createElement('h5');
    el.textContent = 'Artist';
    lastfmDiv.appendChild(el);

    el = document.createElement('p');
    el.textContent = track.artist;
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
  h.textContent = weather.city+ ' ('+weather.country+')';
  weatherDiv.appendChild(h);

  var div = document.createElement('div');
  div.classList.add("weather-container");
  weatherDiv.appendChild(div);

  h = document.createElement('p');
  h.textContent = 'Current Sky: ';
  div.appendChild(h);
  var el = document.createElement('span');
  el.classList.add('weather-stats');
  el.textContent = weather.long_description;
  h.appendChild(el);

  h = document.createElement('p');
  h.textContent = 'Current Temperature: ';
  div.appendChild(h);
  var el = document.createElement('span');
  el.classList.add('weather-stats');
  // innerHTML not textContent so that it interprets symbol
  el.innerHTML = weather.celsius+'&#176;c';
  h.appendChild(el);
  //
  // var sunrise = new Date(weather.sunrise*1000);
  // var sunset = new Date(weather.sunset*1000);
  //
  // el = document.createElement('p');
  // el.textContent = 'Sunrise: '+sunrise.getHours()+':'+sunrise.getMinutes()+' AM';
  // div.appendChild(el);
  //
  // el = document.createElement('p');
  // el.textContent = 'Sunset: '+sunset.getHours()+':'+sunset.getMinutes()+' PM';
  // div.appendChild(el);
}

function seperateGoogleMaps(googlemaps) {
  if (!!googlemaps.directions) {
    var directions = googlemaps.directions;
    if (!!directions.home_work) {
      displayWorkTravelTime(directions.home_work);
    }
    if (!!directions.work_home) {
      displayHomeTravelTime(directions.work_home);
    }
  }
}

function displayWorkTravelTime(data) {
  console.log(data);
  var container = document.getElementById('home-work-travel-div');
  if (!!container) {
    var tripdesc = 'Home to Work';
    var duration = data.duration.text;
    var durationTraffic = data.duration_in_traffic.text;
    var distance = data.distance.text;
    googleMapsGeneric(container, tripdesc, duration, durationTraffic, distance);
  }
}

function displayHomeTravelTime(data) {
  console.log(data);
  var container = document.getElementById('work-home-travel-div');
  if (!!container) {
    var tripdesc = 'Work to Home';
    var duration = data.duration.text;
    var durationTraffic = data.duration_in_traffic.text;
    var distance = data.distance.text;
    googleMapsGeneric(container, tripdesc, duration, durationTraffic, distance);
  }
}


function googleMapsGeneric(container, tripdesc, duration, durationTraffic, distance) {
  container.innerHTML = '';
  var h = document.createElement('h4');
  h.classList.add('google-travel-div-h4');
  h.textContent = 'Travel Information';
  container.appendChild(h);

  h = document.createElement('h5');
  h.classList.add('google-travel-div-h5');
  h.textContent = tripdesc;
  container.appendChild(h);

  var googlemaps = document.createElement('div');
  googlemaps.classList.add('googlemaps');
  container.appendChild(googlemaps);

  var googlemapsData = document.createElement('div');
  googlemapsData.classList.add('googlemaps-data-container');
  googlemaps.appendChild(googlemapsData);

  h = document.createElement('h5');
  h.classList.add('googlemaps-header');
  h.textContent = 'Duration';
  googlemapsData.appendChild(h);

  var p = document.createElement('p');
  p.classList.add('googlemaps-data');
  p.textContent = duration;
  googlemapsData.appendChild(p);

  h = document.createElement('h5');
  h.classList.add('googlemaps-header');
  h.textContent = 'Time in Traffic';
  googlemapsData.appendChild(h);

  p = document.createElement('p');
  p.classList.add('googlemaps-data');
  p.textContent = durationTraffic;
  googlemapsData.appendChild(p);

  h = document.createElement('h5');
  h.classList.add('googlemaps-header');
  h.textContent = 'Distance';
  googlemapsData.appendChild(h);

  p = document.createElement('p');
  p.classList.add('googlemaps-data');
  p.textContent = distance;
  googlemapsData.appendChild(p);


}
