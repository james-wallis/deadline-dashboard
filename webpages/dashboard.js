window.addEventListener('load', updateDateTime, true);

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
