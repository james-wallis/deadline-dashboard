window.addEventListener('load', adjustMenuLeft, true);
document.getElementById('settings-icon').addEventListener('click', showSettingsMenu, true);
var closeSettings = document.getElementsByClassName('closeSettings');
for (var i=0; i < closeSettings.length; i++) {
  closeSettings[i].addEventListener('click', hideSettingsMenu, true);
}
var switchSideClass = document.getElementsByClassName('switchSide');
for (var i=0; i < switchSideClass.length; i++) {
  switchSideClass[i].addEventListener('click', switchSettingSide , true);
}

var windowWidth;

function adjustMenuLeft() {
  windowWidth = window.container.offsetWidth;
  console.log(windowWidth);
  document.getElementById('settings-container').style.left = windowWidth+'px';
}

function showSettingsMenu() {
  document.getElementById("settings-container").style.left = 0;
  var dashboardBoxNumbers = document.getElementsByClassName('dashboard-box-number');
  for (var i = 0; i < dashboardBoxNumbers.length; i++) {
    dashboardBoxNumbers[i].style.opacity = "1";
  }
}

function hideSettingsMenu() {
  windowWidth = window.container.offsetWidth;
  document.getElementById("settings-container").style.left = windowWidth+'px';
  document.getElementById('settings-dashboard').style.opacity = 0;
  document.getElementById('settings-deadlines').style.opacity = 1;
  var dashboardBoxNumbers = document.getElementsByClassName('dashboard-box-number');
  for (var i = 0; i < dashboardBoxNumbers.length; i++) {
    dashboardBoxNumbers[i].style.opacity = "0";
  }
}

function switchSettingSide() {
  var dashboardSide = document.getElementById('settings-dashboard');
  var deadlineSide = document.getElementById('settings-deadlines');
  var dashboardBoxNumbers = document.getElementsByClassName('dashboard-box-number');
  if (deadlineSide.style.opacity == "" || deadlineSide.style.opacity == '1') {
    dashboardSide.style.opacity = '1';
    deadlineSide.style.opacity = '0';
    for (var i = 0; i < dashboardBoxNumbers.length; i++) {
      dashboardBoxNumbers[i].style.opacity = "0";
    }
  }
  else {
    deadlineSide.style.opacity = '1';
    dashboardSide.style.opacity = '0';
    for (var i = 0; i < dashboardBoxNumbers.length; i++) {
      dashboardBoxNumbers[i].style.opacity = "1";
    }
  }
}
