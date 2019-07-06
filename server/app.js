const express = require('express');

const carriers = require('../lib/carriers.js');
const providers = require('../lib/providers.js');
const text = require('../lib/text');

const app = express();

// Express config
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  // Enable CORS so sites can use the API directly in JS.
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Enable log messages when sending texts.
text.config({
  debugEnabled: true,
});

// App helper functions.
function stripPhone(phone) {
  return (`${phone}`).replace(/\D/g, '');
}

function textRequestHandler(req, res, number, carrier, region) {
  if (!number || !req.body.message) {
    res.send({ success: false, message: 'Number and message parameters are required.' });
    return;
  }

  let carrierKey = null;
  if (carrier) {
    carrierKey = carrier.toLowerCase();
    if (carriers[carrierKey] == null) {
      res.send({
        success: false,
        message: `Carrier ${carrier} not supported! POST getcarriers=1 to `
                                                               + 'get a list of supported carriers',
      });
      return;
    }
  }

  let { message } = req.body;
  if (message.indexOf(':') > -1) {
    // Handle problem with vtext where message would not get sent properly if it
    // contains a colon.
    message = ` ${message}`;
  }

  // Time to actually send the message
  text.send(number, message, carrierKey, region, (err) => {
    if (err) {
      res.send({
        success: false,
        message: `Communication with SMS gateway failed. Did you configure mail transport in lib/config.js?  Error message: '${err.message}'`,
      });
    } else {
      res.send({ success: true });
    }
  });
}

// App routes
app.get('/', (req, res) => {
  res.send("I'm online!");
});

app.get('/providers/:region', (req, res) => {
  // Utility function, just to check the providers currently loaded
  res.send(providers[req.params.region]);
});

app.post('/text', (req, res) => {
  if (req.body.getcarriers != null
      && (req.body.getcarriers === '1'
       || req.body.getcarriers.toLowerCase() === 'true')) {
    res.send({ success: true, carriers: Object.keys(carriers).sort() });
    return;
  }
  const number = stripPhone(req.body.number);
  if (number.length < 9 || number.length > 10) {
    res.send({ success: false, message: 'Invalid phone number.' });
    return;
  }
  textRequestHandler(req, res, number, req.body.carrier, 'us');
});

app.post('/canada', (req, res) => {
  textRequestHandler(req, res, stripPhone(req.body.number), req.body.carrier, 'canada');
});

app.post('/intl', (req, res) => {
  textRequestHandler(req, res, stripPhone(req.body.number), req.body.carrier, 'intl');
});

// Start server
const port = process.env.PORT || 9090;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log('Listening on', port);
});
