var express = require('express')
  , app = express()
  , carriers = require('../lib/carriers.js')
  , exec = require('child_process').exec
  , text = require('../lib/text');

// Express config
app.use(express.json());
app.use(express.urlencoded());
app.use(function(req, res, next) {
  // Enable CORS so sites can use the API directly in JS.
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Enable log messages when sending texts.
text.config({
  debugEnabled: true,
});

// App routes
app.get('/', function(req, res) {
  res.send("I'm online!");
});

app.get('/providers/:region', function(req, res) {
  // Utility function, just to check the providers currently loaded
  res.send(providers[req.params.region]);
});

app.post('/text', function(req, res) {
  if (req.body.getcarriers != null && (req.body.getcarriers == 1 || req.body.getcarriers.toLowerCase() == 'true')) {
    res.send({success:true, carriers:Object.keys(carriers).sort()});
    return;
  }
  var number = stripPhone(req.body.number);
  if (number.length < 9 || number.length > 10) {
    res.send({success:false, message:'Invalid phone number.'});
    return;
  }
  textRequestHandler(req, res, number, req.body.carrier, 'us', req.query.key);
});

app.post('/canada', function(req, res) {
  textRequestHandler(req, res, stripPhone(req.body.number), req.body.carrier, 'canada', req.query.key);
});

app.post('/intl', function(req, res) {
  textRequestHandler(req, res, stripPhone(req.body.number), req.body.carrier, 'intl', req.query.key);
});

// App helper functions

function textRequestHandler(req, res, number, carrier, region, key) {
  if (!number || !req.body.message) {
    res.send({success:false, message:'Number and message parameters are required.'});
    return;
  }
  if (carrier != null) {
    carrier = carrier.toLowerCase();
    if (carriers[carrier] == null) {
      res.send({success:false, message:'Carrier ' + carrier + ' not supported! POST getcarriers=1 to '
                                                               + 'get a list of supported carriers'});
      return;
    }
  }

  var message = req.body.message;
  if (message.indexOf(':') > -1) {
    // Handle problem with vtext where message would not get sent properly if it
    // contains a colon.
    message = ' ' + message;
  }

  // Time to actually send the message
  text.send(number, message, carrier, region, function(err) {
    if (err) {
      res.send({
        success:false,
        message:'Communication with SMS gateway failed.'
      });
    }
    else {
      res.send({success:true});
    }
  });
}

function stripPhone(phone) {
  return (phone + '').replace(/\D/g, '');
}

// Start server
var port = process.env.PORT || 9090;
app.listen(port, function() {
  console.log('Listening on', port);
});
