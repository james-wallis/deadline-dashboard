//Requires
require('dotenv').config();
var monzoBank = require('monzo-bank');
var app, io, client, request;


//Globals
var monzoClientID = process.env.MONZO_CLIENT_ID;
var monzoSecretToken = process.env.MONZO_CLIENT_SECRET;
var monzoRedirectUri = 'http://localhost:8080/auth/monzo/callback';
var monzoStateToken = 'randomstringforstate';
var monzoUserId = '';
var monzoAccountId = '';
var monzoAccessToken = '';
var monzoRefreshToken = '';



//Functions
function passGlobals(newApp, newIO, newClient, newRequest) {
  app = newApp;
  io = newIO;
  client = newClient;
  request = newRequest;
  // Set up Redirects
  redirectsForSignIn();
}

function scrape(seconds) {
  seconds = seconds * 1000;
  getMonzoBalance();
  setInterval(getMonzoBalance, seconds);
}

function redirectsForSignIn() {
  app.get('/auth/monzo', function(req, res) {
    var url = "https://auth.getmondo.co.uk/?client_id=" + monzoClientID + "&redirect_uri=" +
      monzoRedirectUri + "&response_type=code&state="+ monzoStateToken;
    res.redirect(url);
  });

  app.get('/auth/monzo/callback', function(req, res) {
    var code = req.query.code;
    var state = req.query.state;
    //Ensure that the state token returned is the same as the one we sent
    if (state === monzoStateToken) {
      // Create parameters for the token url
      var json = { grant_type: 'authorization_code',
                    client_id: monzoClientID,
                    client_secret: monzoSecretToken,
                    code: code,
                    redirect_uri: monzoRedirectUri
                  };
      request.post({url:'https://api.monzo.com/oauth2/token', form: json}, function(err,httpResponse,body) {
        if (err) {
          console.log('error exchanging token for access token');
          console.log(err);
        } else {
          body = JSON.parse(body);
          monzoAccessToken = body.access_token;
          monzoRefreshToken = body.refresh_token;
          monzoUserId = body.user_id;
          console.log(body.expires_in);
          getMonzoAccount();
          setRefreshTimer();
          res.redirect("/");
        }
      });
    }
  });
}

function refreshAccess() {
  var json = { grant_type: 'refresh_token',
                client_id: monzoClientID,
                client_secret: monzoSecretToken,
                refresh_token: monzoRefreshToken
              };
  request.post({url:'https://api.monzo.com/oauth2/token', form: json}, function(err,httpResponse,body) {
    if (err) {
      console.log('error refreshing access token');
      console.log(err);
    } else {
      body = JSON.parse(body);
      monzoAccessToken = body.access_token;
      monzoRefreshToken = body.refresh_token;
      monzoUserId = body.user_id;
      console.log(body.expires_in);
      getMonzoAccount();
      res.redirect("/");
    }
  });
}

function setRefreshTimer(time = 18000) {
  seconds = time * 1000;
  setInterval(refreshAccess, seconds);
}

function getMonzoAccount() {
  var bearer = "Bearer "+monzoAccessToken;
  var args = {
      headers: { "Authorization": bearer }
  };
  client.get("https://api.monzo.com/accounts", args,
    function (data, response) {
      account = data.accounts[0];
      console.log(account);
      monzoAccountId = account.id;
      getMonzoBalance();
  });
}

function getMonzoBalance() {
  if (!monzoAccountId || !monzoAccessToken) {
    io.emit('showMonzoLogin');
  } else {
    monzoBank.balance(monzoAccountId, monzoAccessToken, function(err, value) {
      if (err) {
        if (err.error.code == 'bad_request.missing_param.account_id') {
          console.log('No account ID');
        } else if (err.error.code == 'unauthorized.bad_access_token'){
          console.log('Access token expired');
          io.emit('showMonzoLogin');
        }
          else {
          console.log('error getting monzo balance');
          console.log(err);
        }
      } else {
        console.log(value);
        io.emit('monzoBalance', value);
      }
    });
  }
}

//Export functions
module.exports = {
  scrape: scrape,
  passGlobals: passGlobals,
  balance: getMonzoBalance
};
