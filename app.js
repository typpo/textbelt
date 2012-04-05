var express = require('express')
  , app = express.createServer()
  , nodemailer = require('nodemailer')

// Express config
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.cookieParser());
app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser());

var config =  {
  aws: {
    access: 'AKIAJAJN2G22O42XJODQ',
    secret: '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',
   },
};

// App

/* Homepage */
app.get('/', function(req, res) {
  res.render('index', {

  });
});

  var transport = nodemailer.createTransport("SES", {
    AWSAccessKeyID: config.aws.access,
      AWSSecretKey: config.aws.secret,
  });


  var mailOptions = {
    transport: transport, // transport method to use
    from: "testing@airtext.com", // sender address
    to: '9147727429@vtext.com',
    subject: '', // Subject line
    text: 'testtingg',  // plaintext body
  }

  nodemailer.sendMail(mailOptions, function(error){
    if (error) {
      console.log(error);
    }
    else {
      console.log("Message sent!");
      cb();
    }
    transport.close(function(){}); // shut down the connection pool
  });

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log('Listening on', port);
});
