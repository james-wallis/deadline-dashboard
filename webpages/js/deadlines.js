'use strict';
//Global Variables
//Works out whether the user is currently viewing the dashboard or the deadline page
var deadlinePage = (window.location.href.indexOf("deadlines") != -1);
//The amount to show on the deadline page (upcoming deadlines)
var amountToShow = 4;
//The current page, used on the deadline page
var currentPage = 1;

//Event Listeners
window.addEventListener('load', loadDeadlines);
//Event Listeners for the main dashboard page only
if(deadlinePage) {
  document.getElementById('sort-deadlines').addEventListener("change", loadDeadlines);
} else {
  document.getElementById('addDeadlineForm').addEventListener("submit", confirmSubmitForm);
  document.getElementById('addUnitForm').addEventListener("submit", confirmSubmitForm);
  document.getElementById('editDeadlineContentForm').addEventListener("submit", confirmSubmitForm);
  document.getElementById('removeDeadlineForm').addEventListener("submit", deleteDeadline);
  document.getElementById('removeUnitForm').addEventListener("submit", deleteUnit);
  document.getElementById('edit-deadline').addEventListener("change", loadDeadlineToEdit);
}

/**
 * Function to load the deadlines onto the dashboard
 * Sends the parsed response text to the function loadUnitsWithDeadlines
 * This ensures that the correct background-color is assigned to the correct
 * deadline
 */
function loadDeadlines() {
  var url = '/api/deadlines';
  if (deadlinePage) {
    url += '?order=' + document.getElementById('sort-deadlines').value;
  }
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
 * @param units, the units loaded from the database
 * @param deadlines, the deadlines loaded from the database
 */
function addContentToPage(units, deadlines) {
  addDeadlinesToPage(units, deadlines);
  if (!deadlinePage) {
    addUnitSelectToPage(units);
    addDeadlineDeletionSelectToPage(deadlines);
    addUnitDeletionSelectToPage(units);
  }
}

/**
 * Function to add all the deadlines to the page
 * @param units, the units loaded from the database
 * @param deadlines, the deadlines loaded from the database
 */
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
  if(deadlines.length<4) {
    amountToShow = deadlines.length;
  }
  else if (deadlinePage) {
    if (deadlines.length <= 12) {
      //If there are less than 12 deadlines the deadline
      // page does not need to be split up
      amountToShow = deadlines.length;
    } else {
      // If there are more than 12 create a tempList which holds
      // the correct deadlines to be viewed on that page
      amountToShow = 12;
      var tempDeadlines = [];
      var deadlinesIndex = (currentPage-1)*amountToShow;
      for (var i = deadlinesIndex; i < deadlines.length; i++) {
        tempDeadlines.push(deadlines[i]);
      }
      deadlines = tempDeadlines;
      //update amountToShow
      if (deadlines.length < 11) {
        amountToShow = deadlines.length;
      }
      //Make sure buttons haven't already been created
      if (!document.getElementsByClassName('page-button')[0]) {
        addPageButtons(deadlines);
      }
    }
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
    container.appendChild(div);

    var h = document.createElement('h3');
    h.textContent = (deadline.title).toUpperCase();
    div.appendChild(h);

    var el = document.createElement('p');
    el.textContent = deadline.description;
    div.appendChild(el);

    el = document.createElement('p');
    var date = datetimeToString(deadline.dueDate, true);
    el.textContent = date;
    div.appendChild(el);
    deadlinesAdded++;
  };
}


/**
 * Function to add the units to the units selection in the
 * add a deadline drop down form
 * @param units, the units loaded from the database
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
 * @param deadlines, the deadlines loaded from the database
 */
 function addDeadlineDeletionSelectToPage(deadlines) {
   var removeSelect = document.getElementById('remove-deadline');
   var editSelect = document.getElementById('edit-deadline');
   //Add both the remove select and edit select so that both unit selects can
   // be created using the same function
   var selectList = [removeSelect, editSelect];
   for (var i = 0; i < selectList.length; i++) {
     var select = selectList[i];
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
       var date = datetimeToString(deadline.dueDate, true);
       option.textContent = ((deadline.title).toUpperCase() + " | " +
                            desc + ' | '+ date);
       select.appendChild(option);
     });
   }
 }

 /**
  * Function to add the units to a drop down form for deletion and edit purposes
  * @param units, the units from the database
  */
  function addUnitDeletionSelectToPage(units) {
    var removeSelect = document.getElementById('remove-unit');
    var editSelect = document.getElementById('edit-deadline-content-unit');
    //Add both the remove select and edit select so that both unit selects can
    // be created using the same function
    var selectList = [removeSelect, editSelect];
    //clear out current options
    for (var i = 0; i < selectList.length; i++) {
      var select = selectList[i];
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
        option.value = unit.shortCode.toLowerCase();
        option.textContent = unit.shortCode.toUpperCase();
        select.appendChild(option);
      });
    }
  }

/**
 * Function to find the correct unit for the deadline.
 * Used to set correct colour
 */
function findColour(unit, element, array) {
  return unit.shortCode == this;
}

/**
 * Function to confirm that a form is meant to be submitted before subitting it
 * Used in the settings part of the dashboard page.
 * Gets the id from the element that has had its event listener called to ensure
 * that it runs the correct add or edit database script
 */
function confirmSubmitForm(e) {
  var eventId = event.target.id;
  event.preventDefault();
  var formName = "form";
  if (eventId === "addDeadlineForm") {formName = "deadline";}
  if (eventId === "addUnitForm") {formName = "unit";}
  if (eventId === "editDeadlineContentForm") {formName = "updated deadline";}
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
      if (eventId === "addDeadlineForm") {submitAddDeadlineForm();}
      else if (eventId === "addUnitForm") {submitAddUnitForm();}
      else if (eventId === "editDeadlineContentForm") {submitEditDeadlineForm();}
    } else {
      swal("Cancelled", "The " + formName + " has not been added", "error");
    }
  });
}

/**
 * Function to submit the add Deadline form and add a new deadline to the database
 */
function submitAddDeadlineForm() {
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

/**
 * Function to add a new unit to the database
 */
function submitAddUnitForm() {
  var addUnitShortCode = document.getElementById('addUnitShortcode'),
      addUnitLongName = document.getElementById('addUnitLongcode'),
      addUnitColour = document.getElementById('addUnitColour');
  if (addUnitShortCode.value != "" && addUnitLongName.value != "" && addUnitColour.value != "") {
    var url = '/api/units';
    var http = new XMLHttpRequest();
    http.open('POST', url, true);
    http.setRequestHeader('Content-Type','application/json');
    http.onload = function() {
      if (http.status == 200) {
        swal("Unit Added!", "Your new unit has been successfully added.",
              "success");
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

/**
 * Function to delete a deadline from the database
 */
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
      url += '&title=false';
      var xhr = new XMLHttpRequest();
      xhr.open('DELETE', url, false); // synchronous request
      xhr.send();
      loadDeadlines();
    } else {
      swal("Cancelled", "The deadline has not been deleted.", "error");
    }
  });
}

/**
 * Function to delete a unit from the database
 */
function deleteUnit(e) {
  e.preventDefault();
  swal({
    title: "Confirm Unit Deletion",
    text: "If you delete this unit you will delete ALL the deadlines that are\
            assigned to it. \n\nAre you sure you want to delete this unit?",
    type: "warning",
    showCancelButton: true,
    confirmButtonColor: "#F27474",
    confirmButtonText: "Yes, delete the unit!",
    cancelButtonText: "No, I need that!",
    closeOnConfirm: false,
    closeOnCancel: false
  },
  function(isConfirm){
    if (isConfirm) {
      swal("Confirmed!", "Deleting the unit and its deadlines now.", "success");
      //Remove Unit From Units table
      var shortCode = document.getElementById('remove-unit').value;
      var url = '/api/units/';
      url += '?unitShortCode='+shortCode;
      var xhr = new XMLHttpRequest();
      xhr.open('DELETE', url, false); // synchronous request
      xhr.send();
      //Remove deadlines that were in the deleted unit
      url = '/api/deadlines/';
      url += '?title='+shortCode;
      var xhr = new XMLHttpRequest();
      xhr.open('DELETE', url, false); // synchronous request
      xhr.send();
      loadDeadlines();
    } else {
      swal("Cancelled", "The unit has not been deleted.", "error");
    }
  });
}

/**
 * Function to add the buttons to the bottom of the deadline page
 * adds an event listener to each button in order to get the correct elements
 */
function addPageButtons(deadlines) {
  var amountDeadlines = deadlines.length;
  var container = document.getElementById('deadline-page');
  var b,
      amountPages = amountDeadlines/12;
  for (var i = 0; i < amountPages; i++) {
    b = document.createElement('a');
    b.classList.add('page-button');
    b.textContent = i+1;
    if (i==0) {b.id='active-page';}
    container.appendChild(b);
  }
  //Add Event Listeners to added buttons
  var buttons = document.getElementsByClassName('page-button');
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', changePage)
  }
}

/**
 * Function to change the current 'page' of the deadlines
 * changes what deadlines are being shown on the deadline page
 */
function changePage(e) {
  var buttons = document.getElementsByClassName('page-button');
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].id='';
  }
  currentPage = parseInt(e.target.textContent);
  e.target.id='active-page';
  loadDeadlines();
}

/**
 * Function to load a specific deadline from the database
 */
function loadDeadlineToEdit(e) {
  var unitId = e.target.value;
  var url = '/api/deadlines/';
  url += '?id='+unitId;
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onload = function() {
    if (xhr.status === 200) {
      addDeadlineToEdit(JSON.parse(xhr.responseText));
    } else {
      console.error('error getting units', xhr);
    }
  }
  xhr.send();
}

/**
 * Function to add the deadline to the edit boxes on the dashboard settings
 * in order for it to be able to be edited
 */
function addDeadlineToEdit(deadline) {
  var editTitle = document.getElementById('edit-deadline-content-unit'),
      editDesc = document.getElementById('edit-deadline-content-description'),
      editDate = document.getElementById('edit-deadline-content-date'),
      selectOptions = document.getElementById('edit-deadline-content-unit').options;
      deadline = deadline[0];
      for (var i = 0; i < selectOptions.length; i++) {
        if (selectOptions[i].value.toLowerCase() == deadline.title) {
        editTitle.value = deadline.title;
        editTitle.dataset.id = deadline.id;
      }
    }
    editDesc.value = deadline.description;
    editDate.value = datetimeToString(deadline.dueDate, false);
}

/**
 * Function to submit the editted deadline to the database
 */
function submitEditDeadlineForm() {
  var editTitle = document.getElementById('edit-deadline-content-unit'),
      editDesc = document.getElementById('edit-deadline-content-description'),
      editDate = document.getElementById('edit-deadline-content-date');
      if (editTitle.value != "" && editTitle.value != "Select a Unit" && editDesc.value != "" && editDate.value != "") {
        var url = '/api/deadlines/'+editTitle.dataset.id;
        var http = new XMLHttpRequest();
        http.open('POST', url, true);
        http.setRequestHeader('Content-Type','application/json');
        http.onload = function() {
          if (http.status == 200) {
            loadDeadlines();
            editTitle.value = "Select a Unit";
            editDesc.value = "";
            editDate.value = "";
          }
        };
        http.send(JSON.stringify(  {
            title: editTitle.value,
            description: editDesc.value,
            date: editDate.value
          }
      ));
    }
}

/**
 * Function to turn a datetime into a readable format
 * @param datetime, the datetime in need or formatting
 * @param returnAsPrintableString, if true the string that is returned will
 *        be ready to be printed to the dashboard.
 *        If False the string will be returned in a format for database queries
 */
function datetimeToString(datetime, returnAsPrintableString) {
  var d = new Date(datetime);
  var day = d.getDate();
  var month = d.getMonth()+1;
  var year = d.getFullYear();
  if (day < 10) day = ('0'+day);
  if (month < 10) month = ('0'+month);
  if (returnAsPrintableString) {
    var stringDate = (day+'/'+month+'/'+year);
  } else {
    var stringDate = (year+'-'+month+'-'+day);
  }
  return stringDate;
}
