var express = require('express')
  , app = express.createServer()
  , nodemailer = require('nodemailer')
  , _ = require('underscore')
  , fs = require('fs')
  /*
  , amazonses = require('amazon-ses')
  */
  , exec = require('child_process').exec
  , spawn = require('child_process').spawn
  , Stream = require('stream')
  , config = require('./config.js')
  , providers = require('./providers.js').list

  /*
var SendGrid = require('sendgrid').SendGrid;
var sendgrid = new SendGrid(
  process.env.SENDGRID_USERNAME || 'app3740036@heroku.com',
  process.env.SENDGRID_PASSWORD || 'd0y4yjqn'
)
*/

var redis;
if (process.env.NODE_ENV == 'production')
  redis = require('redis-url').connect(process.env.REDISTOGO_URL);
else
  redis = require('redis-url').connect();

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

app.post('/text', function(req, res) {

  var number = stripPhone(req.body.number);
  if (number.length < 9 || number.length > 10) {
    res.send({success:false,message:'Invalid phone number.'});
    return;
  }

  var ipkey = 'textbelt:ip:' + req.connection.remoteAddress + '_' + dateStr();
  var phonekey = 'textbelt:phone:' + number;

  redis.incr(phonekey, function(err, num) {
    if (err) {
      res.send({success:false,message:'Could not validate phone# quota.'});
      return;
    }

    setTimeout(function() {
      redis.decr(phonekey, function(err, num) {
        if (err) {
          console.log('*** WARNING failed to decr ' + number);
        }
      });
    }, 1000*60*3);
    if (num > 3) {
      res.send({success:false,message:'Exceeded quota for this phone number.'});
      return;
    }

    // now check against ip quota
    redis.incr(ipkey, function(err, num) {
      if (err) {
        res.send({success:false,message:'Could not validate IP quota.'});
        return;
      }
      if (num > 500) {
        res.send({success:false,message:'Exceeded quota for this IP address.'});
        return;
      }

      sendText(req.body.number, req.body.message, function(err) {
        if (err)
          res.send({success:false,message:'Communication with SMS gateway failed.'});
        else
          res.send({success:true});
      });
    });

  });

});

function dateStr() {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1;
  var yyyy = today.getFullYear();
  return mm + '/' + dd + '/' + yyyy;
}

function stripPhone(phone) {
  return phone.replace(/\D/g, '');
}

function validatePhone(phone) {

}

function sendText(phone, message, cb) {
  console.log('txting phone', phone);
  console.log('msg', message);


  var done = _.after(providers.length, function() {
    cb(false);
  });


  _.each(providers, function(provider) {
    var email = provider.replace('%s', phone);
    console.log('email', email);
    var child = spawn('sendmail', ['-f', 'txt@textbelt.com', email]);
    child.stdout.on('data', console.log);
    child.stderr.on('data', console.log);
    child.on('error', function() {
      console.log('failed', email);
      done();
    });
    child.on('exit', function(code, signal) {
      console.log('done', email);
      done();
    });
    child.stdin.write(message + '\n.');
    child.stdin.end();
  });


  /*
  sendgrid.send({
    to: '9147727429@vtext.com',
    from: 'txt@textbelt.com',
    subject: 'a',
    text: 'Sending email with NodeJS through SendGrid!'
  }, function(success, data) {
    if (!success) {
      console.log(data);
    }
    else {
      console.log('message sent');
    }
    cb(!success);
  });
  */

  /*
  var ses = new amazonses(config.aws.access, config.aws.secret);
  ses.send({
      from: 'txt@textbelt.com'
    , to: ['typppo@gmail.com']
    , replyTo: ['txt@textbelt.com']
    , subject: ''
    , body: {
          text: ' Test mesg'
    }
  }, function(err, data) {
    if (err) {
      console.log(data);
    }
    else {
      console.log('message sent');
    }
    cb(err);
  });
  */

  /*
  var transport = nodemailer.createTransport("SES", {
    AWSAccessKeyID: config.aws.access,
    AWSSecretKey: config.aws.secret,
    ReturnPath: 'txt@textbelt.com',
  });
  */

  /*
  var transport = nodemailer.createTransport("Sendmail");

  var mailOptions = {
    transport: transport, // transport method to use
    from: "txt@textbelt.com", // sender address
    to: 'typppo@gmail.com',
    subject: '', // Subject line
    text: message,
    ReturnPath: 'txt@textbelt.com',
  }
  */

  /*
  nodemailer.sendMail(mailOptions, function(error){
    if (error) {
      console.log(error);
      cb(true);
    }
    else {
      console.log("Message sent!");
      cb(false);
    }
    transport.close(function(){}); // shut down the connection pool
  });
  */
}

var port = process.env.PORT || 9090;
app.listen(port, function() {
  console.log('Listening on', port);
});
