const nodemailer = require("nodemailer");

const carriers = require('./carriers.js');
const providers = require('./providers.js');

let config = require('./config.js');

//----------------------------------------------------------------
/*
    General purpose logging function, gated by a configurable
    value.
*/
function output(...args) {
  if (config.debugEnabled) {
    // eslint-disable-next-line no-console
    console.log.apply(this, args);
  }
}

//----------------------------------------------------------------
/*  Sends a text message

    Will perform a region lookup (for providers), then
    send a message to each.

    Params:
      phone - phone number to text
      message - message to send
      carrier - carrier to use (may be null)
      region - region to use (defaults to US)
      cb - function(err, info), NodeMailer callback
*/
function sendText(phone, message, carrier, region, cb) {
  output('txting phone', phone, ':', message);

  let providersList;
  if (carrier) {
    providersList = carriers[carrier];
  } else {
    providersList = providers[region || 'us'];
  }

  const emails = providersList.map(provider => provider.replace('%s', phone)).join(',');

  let transporter = nodemailer.createTransport(config.transport);

  let mailOptions = {
    to: emails,
    subject: null,
    text: message,
    html: message,
    ...config.mailOptions
  };

  transporter.sendMail(mailOptions, cb);
}

//----------------------------------------------------------------
/*  Overrides default config

    Takes a new configuration object, which is
    used to override the defaults

    Params:
      obj - object of config properties to be overriden
*/
function setConfig(obj) {
  config = Object.assign(config, obj);
}

module.exports = {
  send: sendText, // Send a text message
  config: setConfig, // Override default config
};
