var app, io;
var timeAndDate = {
  time: '',
  day: '',
  date: '',
  timeOfDay: ''
}
var interval;

function passGlobals(newApp, newIO) {
  app = newApp;
  io = newIO;
}

function scrape(seconds = 1) {
  seconds = seconds * 1000;
  updateDateTime();
  interval = setInterval(updateDateTime, seconds);
}

function stop() {
  clearInterval(interval);
}

/**
 * Function to update the date and time on the dashboard
 */
function updateDateTime() {
  var date = new Date();
  getCurrentTime(date);
  getTimeOfDay(date);
  getDayOfTheWeek(date);
  getDateMonth(date);
}
/**
 * Function to get the current time on the dashboard
 * @param date, the date for the dashboard
 */
function getCurrentTime(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? ' PM' : ' AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var stringTime = hours + ':' + minutes + ' ' + ampm;
    timeAndDate.time = stringTime;
}

/**
 * Function to get the current time of day on the dashboard
 * @param date, the date for the dashboard
 */
function getTimeOfDay(date) {
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
  timeAndDate.timeOfDay = timeOfDay;
}

/**
 * Function to get the day of the week on the dashboard
 * @param date, the date for the dashboard
 */
function getDayOfTheWeek(date) {
  var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var day = days[ date.getDay() ];
  timeAndDate.day = day;
}

/**
 * Function to get the month on the dashboard
 * @param date, the date for the dashboard
 */
function getDateMonth(date) {
  var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var month = months[ date.getMonth() ];
  var formattedDate = (date.getDate()+formatDate(date.getDate));
  timeAndDate.date = (formattedDate + " " + month);
}

/**
 * Function to format the date so that it has the correct ending
 * @param date, the date for the dashboard
 */
function formatDate(date) {
  switch (date % 10) {
    case 1:  return "st";
    case 2:  return "nd";
    case 3:  return "rd";
    default: return "th";
  }
}

function sendTimeAndDate() {
  io.emit('timeAndDate', timeAndDate);
}

module.exports = {
  passGlobals: passGlobals,
  scrape: scrape,
  stop: stop,
  send: sendTimeAndDate
};
