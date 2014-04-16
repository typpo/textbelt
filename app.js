var express = require('express')
  , app = express()
  , _ = require('underscore')
  , fs = require('fs')
  , mixpanel = require('mixpanel')
  , exec = require('child_process').exec
  , spawn = require('child_process').spawn
  , Stream = require('stream')
  , providers = require('./providers.js')

var mpq = new mixpanel.Client('6e6e6b71ed5ada4504c52d915388d73d');

var redis = require('redis-url').connect();

// Express config
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.cookieParser());
app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser());

// App

/* Homepage */
app.get('/', function(req, res) {
  fs.readFile(__dirname + '/views/index.html', 'utf8', function(err, text){
    res.send(text);
  });
});

app.get('/providers/us', function(req, res) {
  res.send(providers.us);
});

app.post('/text', function(req, res) {
  var number = stripPhone(req.body.number);
  if (number.length < 9 || number.length > 10) {
    res.send({success:false,message:'Invalid phone number.'});
    return;
  }
  textRequestHandler(req, res, number, 'us');
});

app.post('/canada', function(req, res) {
  textRequestHandler(req, res, stripPhone(req.body.number), 'canada');
});

app.post('/intl', function(req, res) {
  textRequestHandler(req, res, stripPhone(req.body.number), 'intl');
});

function textRequestHandler(req, res, number, region) {
  if (!req.body.number || !req.body.message) {
    mpq.track('incomplete request');
    res.send({success:false,message:'Number and message parameters are required.'});
    return;
  }
  var ip = req.header('X-Real-IP');// || req.connection.remoteAddress;
  mpq.track('textRequestHandler entry', {number: req.body.number, message: req.body.message, ip: ip, region: region});

  var message = req.body.message;
  if (message.indexOf('http') === 0) {
    message = ' ' + message;
  }

  var ipkey = 'textbelt:ip:' + ip + '_' + dateStr();
  var phonekey = 'textbelt:phone:' + number;

  redis.incr(phonekey, function(err, num) {
    if (err) {
      mpq.track('redis fail');
      res.send({success:false,message:'Could not validate phone# quota.'});
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
      res.send({success:false,message:'Exceeded quota for this phone number. ' + number});
      return;
    }

    // now check against ip quota
    redis.incr(ipkey, function(err, num) {
      if (err) {
        mpq.track('redis fail');
        res.send({success:false,message:'Could not validate IP quota.'});
        return;
      }
      if (num > 75) {
        mpq.track('exceeded ip quota');
        res.send({success:false,message:'Exceeded quota for this IP address. ' + ip});
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

      sendText(req.body.number, message, region, function(err) {
        if (err) {
          mpq.track('sendText failed', {number: req.body.number, message: req.body.message, ip: ip});
          res.send({success:false,message:'Communication with SMS gateway failed.'});
        }
        else {
          mpq.track('sendText success', {number: req.body.number, message: req.body.message, ip: ip, region: region});
          res.send({success:true});
        }
      });
    });

  });

}

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
