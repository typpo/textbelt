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

app.post('/text', function(req, res) {
  if (true) {
    sendText(req.body.number, req.body.msg, function(err) {
      if (err)
        res.send({success:false});
      else
        res.send({success:true});
    });
  }
});

function sendText(phone, msg, cb) {
  var transport = nodemailer.createTransport("SES", {
    AWSAccessKeyID: config.aws.access,
    AWSSecretKey: config.aws.secret,
  });

  var mailOptions = {
    transport: transport, // transport method to use
    from: "txt@textbelt.com", // sender address
    to: '9147727429@vtext.com',
    subject: '', // Subject line
    text: msg,
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
