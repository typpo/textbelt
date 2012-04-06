var express = require('express')
  , app = express.createServer()
  , nodemailer = require('nodemailer')
  , config = require('./config.js')

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
  res.send("it's running");
});

app.post('/text', function(req, res) {
  var keystr = req.connection.remoteAddress + '_' + dateStr();

  redis.incr(keystr, function(err, num) {
    if (err) {
      res.send({success:false,message:'Could not validate IP quota.'});
      return;
    }

    if (num < 51) {
      sendText(req.body.number, req.body.message, function(err) {
        if (err)
          res.send({success:false,message:'Communication with SMS gateway failed.'});
        else
          res.send({success:true});
      });
    }
    else {
      res.send({success:false,message:'Exceeded quota.'});
    }
  });
});

function dateStr() {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1;
  var yyyy = today.getFullYear();
  return mm + '/' + dd + '/' + yyyy;
}

function validatePhone()

function sendText(phone, message, cb) {
  var transport = nodemailer.createTransport("SES", {
    AWSAccessKeyID: config.aws.access,
    AWSSecretKey: config.aws.secret,
  });

  var mailOptions = {
    transport: transport, // transport method to use
    from: "txt@textbelt.com", // sender address
    to: 'typppo@gmail.com',
    subject: '', // Subject line
    text: message,
  }

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
}

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log('Listening on', port);
});
