var express = require('express')
  , app = express()
  , _ = require('underscore')
  , fs = require('fs')
  , mixpanel = require('mixpanel')
  , exec = require('child_process').exec
  , spawn = require('child_process').spawn
  , Stream = require('stream')
  , providers = require('./providers.js')

var access_keys;
try {
  access_keys = require('./keys.json');
} catch (e) {
  access_keys = {};
}
console.log('Loaded access keys:', access_keys);

var mpq = new mixpanel.Client('6e6e6b71ed5ada4504c52d915388d73d');

var redis = require('redis-url').connect();

// Express config
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.cookieParser());
app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser());

// App

app.get('/', function(req, res) {
  fs.readFile(__dirname + '/views/index.html', 'utf8', function(err, text){
    res.send(text);
  });
});

app.get('/providers/:region', function(req, res) {
  // Utility function, just to check the providers currently loaded
  res.send(providers[req.params.region]);
});

app.post('/text', function(req, res) {
  var number = stripPhone(req.body.number);
  if (number.length < 9 || number.length > 10) {
    res.send({success:false,message:'Invalid phone number.'});
    return;
  }
  textRequestHandler(req, res, number, 'us', req.query.key);
});

app.post('/canada', function(req, res) {
  textRequestHandler(req, res, stripPhone(req.body.number), 'canada', req.query.key);
});

app.post('/intl', function(req, res) {
  textRequestHandler(req, res, stripPhone(req.body.number), 'intl', req.query.key);
});

function textRequestHandler(req, res, number, region, key) {
  if (!req.body.number || !req.body.message) {
    mpq.track('incomplete request');
    res.send({success:false,message:'Number and message parameters are required.'});
    return;
  }
  var ip = req.header('X-Real-IP');// || req.connection.remoteAddress;
  mpq.track('textRequestHandler entry', {number: req.body.number, message: req.body.message, ip: ip, region: region});

  var message = req.body.message;
  if (message.indexOf('http') === 0) {
    // Handle problem with vtext where message would not get sent properly if it
    // begins with h ttp
    message = ' ' + message;
  }

  var tracking_details = {
    number: req.body.number,
    message: req.body.message,
    ip: ip
  };

  var doSendText = function(response_obj) {
    response_obj = response_obj || {};

    // Time to actually send the message
    sendText(req.body.number, message, region, function(err) {
      if (err) {
        mpq.track('sendText failed', tracking_details);
        res.send(_.extend(response_obj,
                          {
                            success:false,
                            message:'Communication with SMS gateway failed.'
                          }));
      }
      else {
        mpq.track('sendText success', tracking_details);
        res.send(_.extend(response_obj, {success:true}));
      }
    });
  };

  // Do they have a valid access key?
  if (key && key in access_keys) {
    console.log('Got valid key', key, '... not applying limits.');
    // Skip verification
    mpq.track('sendText skipping verification', _.extend(tracking_details, {
      key: key,
    }));
    doSendText({used_key: key});
    return;
  }

  // If they don't have a special key, apply rate limiting and verification
  var ipkey = 'textbelt:ip:' + ip + '_' + dateStr();
  var phonekey = 'textbelt:phone:' + number;

  redis.incr(phonekey, function(err, num) {
    if (err) {
      mpq.track('redis fail');
      res.send({success:false, message:'Could not validate phone# quota.'});
      return;
    }

    setTimeout(function() {
      redis.decr(phonekey, function(err, num) {
        if (err) {
          mpq.track('failed to decr phone quota', {number: number});
          console.log('*** WARNING failed to decr ' + number);
        }
      });
    }, 1000*60*3);
    if (num > 3) {
      mpq.track('exceeded phone quota');
      res.send({success:false, message:'Exceeded quota for this phone number. ' + number});
      return;
    }

    // now check against ip quota
    redis.incr(ipkey, function(err, num) {
      if (err) {
        mpq.track('redis fail');
        res.send({success:false, message:'Could not validate IP quota.'});
        return;
      }
      if (num > 75) {
        mpq.track('exceeded ip quota');
        res.send({success:false, message:'Exceeded quota for this IP address. ' + ip});
        return;
      }
      setTimeout(function() {
        redis.decr(ipkey, function(err, num) {
          if (err) {
            mpq.track('failed to decr ip key', {ipkey: ipkey});
            console.log('*** WARNING failed to decr ' + ipkey);
          }
        });
      }, 1000*60*60*24);

      // Cleared to send now
      doSendText();
    });     // end redis ipkey incr
  });       // end redis phonekey incr
}           // end textRequestHandler

function dateStr() {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1;
  var yyyy = today.getFullYear();
  return mm + '/' + dd + '/' + yyyy;
}

function stripPhone(phone) {
  return (phone+'').replace(/\D/g, '');
}

function sendText(phone, message, region, cb) {
  console.log('txting phone', phone, ':', message);

  region = region || 'us';

  var providers_list = providers[region];

  var done = _.after(providers_list.length, function() {
    cb(false);
  });

  _.each(providers_list, function(provider) {
    var email = provider.replace('%s', phone);
    var child = spawn('sendmail', ['-f', 'txt@textbelt.com', email]);
    child.stdout.on('data', console.log);
    child.stderr.on('data', console.log);
    child.on('error', function(data) {
      mpq.track('sendmail failed', {email: email, data: data});
      done();
    });
    child.on('exit', function(code, signal) {
      done();
    });
    child.stdin.write(message + '\n.');
    child.stdin.end();
  });
}

var port = process.env.PORT || 9090;
app.listen(port, function() {
  console.log('Listening on', port);
});
