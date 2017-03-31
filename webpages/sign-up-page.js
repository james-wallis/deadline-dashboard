'use strict';

var form = document.getElementById('add-user-form');
form.addEventListener('submit', addUser);

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
          firstname = document.getElementById('firstname').value = '';
          lastname = document.getElementById('lastname').value = '';
          lastfmname = document.getElementById('lastfmname').value = '';
          city = document.getElementById('city').value = '';
          time = document.getElementById('time').checked = false;
          greyscale = document.getElementById('greyscale').checked = false;
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
