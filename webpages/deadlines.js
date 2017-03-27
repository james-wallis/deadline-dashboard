//Event Listeners
'use strict';
window.addEventListener('load', loadDeadlines);

/**
 * Function to load the deadlines onto the dashboard
 * Sends the parsed response text to the function loadUnitsWithDeadlines
 * This ensures that the correct background-color is assigned to the correct
 * deadline
 */
function loadDeadlines() {
  var url = '/api/deadlines';
  //If page is not deadlines, limit to 4
  if(window.location.href.indexOf("deadlines") == -1) {
    url += '?limit=' + 4;
  }
  //url += '?order=' + window.sort.selectedOptions[0].value;
  //if (currentSearch) url += '&title=' + encodeURIComponent(currentSearch);
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onload = function() {
    if (xhr.status === 200) {
      // addDeadlinesToPage(JSON.parse(xhr.responseText));
      loadUnitsWithDeadlines(JSON.parse(xhr.responseText));
    } else {
      console.error('error getting deadlines', xhr);
    document.getElementById('deadline-container').innerHTML =
    'Sorry, there has been an error getting your deadlines';
    }
  }
  xhr.send();
}

/**
 * Function to load from the Units table in the database
 * This function provides a way to get the background colours for the deadlines
 * When the units have been successfully loaded it runs addDeadlinesToPage which
 * Adds the deadlines to the page with the correct background colour.
 * @param the parsed deadlines from loadDeadlines()
 */
function loadUnitsWithDeadlines(deadlines) {
  var url = '/api/units';
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onload = function() {
    if (xhr.status === 200) {
      addDeadlinesToPage(JSON.parse(xhr.responseText), deadlines);
    } else {
      console.error('error getting units', xhr);
    }
  }
  xhr.send();
}


function addDeadlinesToPage(units, deadlines) {
  // clear out old deadlines
  var container = document.getElementById('deadline-container');
  container.innerHTML = '';
  // Check if the page is the deadlines page
  if(window.location.href.indexOf("deadlines") != -1) {
    //Add in new element which will set the width of the deadlines
    var deadlinePage = true;
    var outsideContainer = container;
  }
  // add deadlines to page in the order they came in
  deadlines.forEach(function (deadline) {
    // Set default deadline colour
    var currentUnitColour = "#FBFBFB";
    // Get deadline background colour
    var currentUnit = units.find(findColour, deadline.title.toLowerCase());
    if (currentUnit) {
      currentUnitColour = currentUnit.colour;
    }
    //Only create new container if the page is the deadlinePage
    if(deadlinePage) {
      container = document.createElement('div');
      container.classList.add('col-3');
      outsideContainer.appendChild(container);
    }
    var div = document.createElement('div');
    div.classList.add('deadline');
    div.style.backgroundColor = currentUnitColour;
    // var deadlineID = getDeadlineID(deadline.title);
    // div.id = deadlineID;
    container.appendChild(div);

    var h = document.createElement('h3');
    h.textContent = (deadline.title).toUpperCase();
    div.appendChild(h);

    var el = document.createElement('p');
    el.textContent = deadline.description;
    div.appendChild(el);

    el = document.createElement('p');
    console.log(deadline.dueDate);
    var date = datetimeToString(deadline.dueDate);
    el.textContent = date;
    div.appendChild(el);
  });
}

/**
 * Function to find the correct unit for the deadline.
 * Used to set correct colour
 */
function findColour(unit, element, array) {
  return unit.shortCode == this;
}

function getDeadlineID(title) {
  switch(title.toLowerCase()) {
    case 'mathfun':
      return 'mathfun';
    case 'webscript':
      return 'webscript';
    case 'dsalg':
      return 'dsalg';
    case 'cosine':
      return 'cosine';
    case 'adproc':
      return 'adproc';
    case 'inse':
      return 'inse';
    default:
      return 'other';
  }
}

function datetimeToString(datetime) {
  var d = new Date(datetime);
  var day = d.getDate();
  var month = d.getMonth();
  var year = d.getFullYear();
  if (day < 10) day = ('0'+day);
  if (month < 10) month = ('0'+month);
  var stringDate = (day+'/'+month+'/'+year);
  return stringDate;
}
