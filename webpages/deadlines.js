'use strict';

//Global Variables
var deadlinePage = (window.location.href.indexOf("deadlines") != -1);
//The amount to show on the deadline page (upcoming deadlines)
var amountToShow = 4;

//Event Listeners
window.addEventListener('load', loadDeadlines);
//Event Listeners for the main dashboard page only
if(deadlinePage) {
  document.getElementById('sort-deadlines').addEventListener("change", loadDeadlines);
} else {
  document.getElementById('addDeadlineForm').addEventListener("submit", confirmSubmitForm);
  document.getElementById('addUnitForm').addEventListener("submit", confirmSubmitForm);
  document.getElementById('removeDeadlineForm').addEventListener("submit", deleteDeadline);
}

/**
 * Function to load the deadlines onto the dashboard
 * Sends the parsed response text to the function loadUnitsWithDeadlines
 * This ensures that the correct background-color is assigned to the correct
 * deadline
 */
function loadDeadlines() {
  var url = '/api/deadlines';
  //If page is not deadlines, limit to 4
  // if(!deadlinePage) {
  // url += '?limit=' + 4;
  // }
  if (deadlinePage) {
    url += '?order=' + document.getElementById('sort-deadlines').value;
  }
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
      addContentToPage(JSON.parse(xhr.responseText), deadlines);
    } else {
      console.error('error getting units', xhr);
    }
  }
  xhr.send();
}

/**
 * Function to add all the dynamic content to the page
 */
function addContentToPage(units, deadlines) {
  addDeadlinesToPage(units, deadlines);
  if (!deadlinePage) {
    addUnitSelectToPage(units);
    addDeadlineDeletionSelectToPage(deadlines);
  }
}

function addDeadlinesToPage(units, deadlines) {
  // clear out old deadlines
  var container = document.getElementById('deadline-container');
  container.innerHTML = '';
  // Check if the page is the deadlines page
  if(deadlinePage) {
    //Add in new element which will set the width of the deadlines
    var outsideContainer = container;
  }
  // add deadlines to page in the order they come in
  // stops when the amount of deadlines is one less than the amountToShow.
  // Doesn't use deadlines.forEach as the whole deadline table
  // is needed for delete
  var deadlinesAdded = 0;
  if (deadlinePage || deadlines.length<4) {
    amountToShow = deadlines.length;
  }
  while (deadlinesAdded < amountToShow) {
    var deadline = deadlines[deadlinesAdded];
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
    var date = datetimeToString(deadline.dueDate);
    el.textContent = date;
    div.appendChild(el);
    deadlinesAdded++;
  };
}


/**
 * Function to add the units to the units selection in the
 * add a deadline drop down form
 */
function addUnitSelectToPage(units) {
  var select = document.getElementById('add-deadline-title');
  //clear out current options
  select.innerHTML = "";
  var option = document.createElement('option');
  option.setAttribute("hidden", "");
  option.setAttribute("selected", "");
  option.setAttribute("disabled", "");
  option.textContent = "Select a Unit";
  select.appendChild(option);
  //Loop through each unit
  units.forEach(function (unit) {
    option = document.createElement('option');
    option.value = unit.shortCode;
    option.textContent = unit.shortCode.toUpperCase();
    select.appendChild(option);
  });
}

/**
 * Function to add the deadlines to a drop down form for deletion purposes
 */
 function addDeadlineDeletionSelectToPage(deadlines) {
   var select = document.getElementById('remove-deadline');
   //clear out current options
   select.innerHTML = "";
   var option = document.createElement('option');
   option.setAttribute("hidden", "");
   option.setAttribute("selected", "");
   option.setAttribute("disabled", "");
   option.textContent = "Select a Deadline";
   select.appendChild(option);
   //Loop through each unit
   deadlines.forEach(function (deadline) {
     option = document.createElement('option');
     option.value = deadline.id;
     var fullDescription = deadline.description;
     var length = 6;
     var desc = '';
     if (fullDescription.length > length) {
       desc = fullDescription.substring(0, length)+'...';
     } else {
       desc = fullDescription;
     }
     var date = datetimeToString(deadline.dueDate);
     option.textContent = ((deadline.title).toUpperCase() + " | " +
                          desc + ' | '+ date);
     select.appendChild(option);
   });
 }

/**
 * Function to find the correct unit for the deadline.
 * Used to set correct colour
 */
function findColour(unit, element, array) {
  return unit.shortCode == this;
}

/**
 * Function to confirm that a form is meant to be submitted before sumbitting it
 */
function confirmSubmitForm(e) {
  var eventId = event.target.id;
  event.preventDefault();
  var formName = "form";
  if (eventId === "addDeadlineForm") {formName = "deadline";}
  if (eventId === "addUnitForm") {formName = "unit";}
  swal({
    title: "Confirm Submit",
    text: "Are you sure you want to add this "+ formName +"?",
    type: "warning",
    showCancelButton: true,
    confirmButtonColor: "#A5DC86",
    confirmButtonText: "Yes, add the "+ formName +"!",
    cancelButtonText: "No, cancel!",
    closeOnConfirm: false,
    closeOnCancel: false
  },
  function(isConfirm){
    if (isConfirm) {
      swal("Confirmed!", "Adding " + formName + " now.", "success");
      console.log(eventId);
      if (eventId === "addDeadlineForm") {submitAddDeadlineForm();}
      else if (eventId === "addUnitForm") {submitAddUnitForm();}
    } else {
      swal("Cancelled", "The " + formName + " has not been added", "error");
    }
  });
}

/**
 * Function to submit the add Deadline form and add a new deadline to the database
 */
function submitAddDeadlineForm() {
  // e.preventDefault();
  var addTitle = document.getElementById('add-deadline-title'),
      addDesc = document.getElementById('add-deadline-description'),
      addDate = document.getElementById('add-deadline-date');
  if (addTitle.value != "" && addTitle.value != "Select a Unit" && addDesc.value != "" && addDate.value != "") {
    var url = '/api/deadlines';
    var http = new XMLHttpRequest();
    http.open('POST', url, true);
    http.setRequestHeader('Content-Type','application/json');
    http.onload = function() {
      if (http.status == 200) {
        loadDeadlines();
        addTitle.value = "Select a Unit";
        addDesc.value = "";
        addDate.value = "";
      }
    };
    http.send(JSON.stringify(  {
        title: addTitle.value,
        description: addDesc.value,
        date: addDate.value
      }
  ));
  }
}


function submitAddUnitForm() {
  // e.preventDefault();
  var addUnitShortCode = document.getElementById('addUnitShortcode'),
      addUnitLongName = document.getElementById('addUnitLongcode'),
      addUnitColour = document.getElementById('addUnitColour');
      console.log("function run");
  if (addUnitShortCode.value != "" && addUnitLongName.value != "" && addUnitColour.value != "") {
    var url = '/api/units';
    var http = new XMLHttpRequest();
    http.open('POST', url, true);
    http.setRequestHeader('Content-Type','application/json');
    http.onload = function() {
      if (http.status == 200) {
        swal("Unit Added!", "Your new unit has been successfully added.",
              "success");
        console.log("Status is 200");
        addUnitShortCode.value = "";
        addUnitLongName.value = "";
        addUnitColour.value = "";
      }
    };
    http.send(JSON.stringify(  {
        unitShortCode: addUnitShortCode.value,
        unitLongName: addUnitLongName.value,
        unitColour: addUnitColour.value
      }
  ));
  }
}

function deleteDeadline(e) {
  e.preventDefault();
  swal({
    title: "Confirm Deadline Deletion",
    text: "Are you sure you want to delete this deadline?",
    type: "warning",
    showCancelButton: true,
    confirmButtonColor: "#F27474",
    confirmButtonText: "Yes, delete the deadline!",
    cancelButtonText: "No, I need that!",
    closeOnConfirm: false,
    closeOnCancel: false
  },
  function(isConfirm){
    if (isConfirm) {
      swal("Confirmed!", "Deleting the deadline now.", "success");
      var objectToDeleteId = document.getElementById('remove-deadline').value;
      var url = '/api/deadlines/';
      url += '?id='+objectToDeleteId;
      console.log(objectToDeleteId);
      var xhr = new XMLHttpRequest();
      console.log(url);
      xhr.open('DELETE', url, false); // synchronous request
      xhr.send();
      loadDeadlines();
    } else {
      swal("Cancelled", "The deadline has not been deleted.", "error");
    }
  });
}

function datetimeToString(datetime) {
  var d = new Date(datetime);
  var day = d.getDate();
  var month = d.getMonth()+1;
  var year = d.getFullYear();
  if (day < 10) day = ('0'+day);
  if (month < 10) month = ('0'+month);
  var stringDate = (day+'/'+month+'/'+year);
  return stringDate;
}
