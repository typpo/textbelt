var express = require('express')
  , app = express.createServer()
  , nodemailer = require('nodemailer')
  , redis = require('redis')

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
  var keystr = req.connection.remoteAddress + '_' + dateStr();

  var rclient = redis.createClient();
  rclient.incr(keystr, function(err, num) {
    rclient.quit();

    if (err) {
      res.send({success:false,msg:'Could not validate IP quota.'});
      return;
    }
    if (num < 51) {
      sendText(req.body.number, req.body.msg, function(err) {
        if (err)
          res.send({success:false,msg:'Communication with SMS gateway failed.'});
        else
          res.send({success:true});
      });
    }
    else {
      res.send({success:false,msg:'Exceeded quota.'});
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
