'use strict';
//Global variable
var form = document.getElementById('add-user-form');
form.addEventListener('submit', addUser);

/**
 * Function to submit the Add User form on the sign-up page
 * @param e, the event that has been called
 */
function addUser(e) {
  e.preventDefault();
  swal({
    title: "Confirm User Settings",
    text: "Are you sure these are the correct settings for you?",
    type: "warning",
    showCancelButton: true,
    confirmButtonColor: "#F27474",
    confirmButtonText: "Yes, I know what I typed!",
    cancelButtonText: "No, I'm unsure its correct!",
    closeOnConfirm: false,
    closeOnCancel: false
  },
  function(isConfirm){
    if (isConfirm) {
      swal("Confirmed!", "Adding your user profile now.", "success");
      var firstname = document.getElementById('firstname').value,
          lastname = document.getElementById('lastname').value,
          lastfmname = document.getElementById('lastfmname').value,
          city = document.getElementById('city').value,
          time = document.getElementById('time').checked,
          greyscale = document.getElementById('greyscale').checked;
          console.log(firstname);
      var url = '/api/user';
      var http = new XMLHttpRequest();
      console.log(url);
      http.open('POST', url, true);
      http.setRequestHeader('Content-Type','application/json');
      http.onload = function() {
        if (http.status == 200) {
          introduction(firstname);
        }
      };
      http.send(JSON.stringify({
          firstname: firstname,
          lastname: lastname,
          lastfm: lastfmname,
          city: city,
          time: time,
          greyscale: greyscale
        }
    ));
    } else {
      swal("Cancelled", "Your details have not been added", "error");
    }
  });
}

/**
 * Function to change the content of the sign up page to display
 * the menu tips
 * @param firstname, the firstname entered in the previous form, used
 *        to welcome the user
 */
function introduction(firstname) {
  var header = document.getElementById('header');
  header.textContent = firstname+', welcome to the dashboard.';
  var container = document.getElementById('outer-div-sign-up');
  container.innerHTML = '';
  var div = document.createElement('div');
  div.classList.add('introduction');
  container.appendChild(div);
  
  var el = document.createElement('p');
  el.textContent = 'Just a few things to start off. The dashboard can  \
                    be used to view the news, your current lastfm/spotify \
                    song, the current time, current weather.';
  div.appendChild(el);

  el = document.createElement('p');
  el.textContent = 'However, its main purpose is a personal deadline tracker.';
  div.appendChild(el);

  el = document.createElement('p');
  el.textContent = 'When you load up the dashboard for the first time you may \
                    be unable to find the settings menu as it is purposely \
                    hidden so that it does not obstruct from the feel of its purpose as a dashboard.';
  div.appendChild(el);

  el = document.createElement('p');
  el.textContent = 'The images below serve as a guide in order for you to be \
                    able to find the menu with ease (it is easy to find once \
                      you know where it is, I promise!)';
  div.appendChild(el);

  el = document.createElement('img');
  el.setAttribute('src', '/img/menu.gif');
  el.setAttribute('alt', 'Gif showing the menu');
  div.appendChild(el);

  el = document.createElement('p');
  el.textContent = 'As you can see, you activate the hover over on the menu \
                    button by moving the mouse to the right hand side of the screen.';
  div.appendChild(el);

  el = document.createElement('p');
  el.textContent = "When you are satified that you will be able to find the menu, click the 'To the Dashboard!' button below.";
  div.appendChild(el);

  el = document.createElement('a');
  el.textContent = 'To the Dashboard!';
  el.href = '/';
  div.appendChild(el);
}
