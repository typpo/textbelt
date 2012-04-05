var express = require('express')
  , app = express.createServer()
  , nodemailer = require('nodemailer')

// Express config
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.cookieParser());
app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser());

// App

/* Homepage */
app.get('/', function(req, res) {
  res.render('index', {

  });
});


var transport = nodemailer.createTransport("Sendmail", "/usr/sbin/sendmail");

// Message object
var message = {

  // sender info
  from: 'Bob <bob@airtext.com>',

  // Comma separated list of recipients
  to: '9147727429@vtext.com',
  subject: '',
  text: 'Hello to myself!',

};

transport.sendMail(message, function(error){
  if(error){
    console.log('Error occured');
    console.log(error.message);
    return;
  }
  console.log('Message sent successfully!');
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log('Listening on', port);
});
